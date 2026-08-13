import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { dropEvents } from "../../events/dropEvents.js";

const RESERVATION_WINDOW_MS = 60 * 1000;
const expiryTimers = new Map();

export const createReservation = async (dropId, userId) => {
  const { reservation, availableStock } = await prisma.$transaction(async (tx) => {
    const drop = await tx.drop.findUnique({ where: { id: dropId } });
    if (!drop) {
      throw new ApiError(404, "Drop not found");
    }
    if (drop.startsAt > new Date()) {
      throw new ApiError(409, "This drop hasn't started yet");
    }

    const { count } = await tx.drop.updateMany({
      where: { id: dropId, availableStock: { gt: 0 } },
      data: { availableStock: { decrement: 1 } },
    });

    if (count === 0) {
      throw new ApiError(409, "This item is out of stock");
    }

    const reservation = await tx.reservation.create({
      data: {
        dropId,
        userId,
        expiresAt: new Date(Date.now() + RESERVATION_WINDOW_MS),
      },
    });

    const updatedDrop = await tx.drop.findUnique({ where: { id: dropId } });

    return { reservation, availableStock: updatedDrop.availableStock };
  });

  scheduleExpiry(reservation.id);
  dropEvents.emit("stock:updated", { dropId, availableStock });

  return reservation;
};

const expireReservation = async (reservationId) => {
  const result = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation || reservation.status !== "ACTIVE") {
      return null;
    }

    const { count } = await tx.reservation.updateMany({
      where: { id: reservationId, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });

    if (count === 0) {
      return null;
    }

    const drop = await tx.drop.update({
      where: { id: reservation.dropId },
      data: { availableStock: { increment: 1 } },
    });

    return { dropId: drop.id, availableStock: drop.availableStock };
  });

  expiryTimers.delete(reservationId);

  if (result) {
    dropEvents.emit("stock:updated", result);
    dropEvents.emit("reservation:expired", { reservationId, dropId: result.dropId });
  }
};

const scheduleExpiry = (reservationId) => {
  const timer = setTimeout(() => {
    expireReservation(reservationId).catch((err) =>
      console.error("Failed to expire reservation:", err)
    );
  }, RESERVATION_WINDOW_MS);
  expiryTimers.set(reservationId, timer);
};

const clearExpiryTimer = (reservationId) => {
  const timer = expiryTimers.get(reservationId);
  if (timer) {
    clearTimeout(timer);
    expiryTimers.delete(reservationId);
  }
};

// Safety net: catches reservations missed by scheduleExpiry (e.g. after a server restart).
export const sweepExpiredReservations = async () => {
  const overdue = await prisma.reservation.findMany({
    where: { status: "ACTIVE", expiresAt: { lte: new Date() } },
    select: { id: true },
  });

  for (const { id } of overdue) {
    await expireReservation(id);
  }
};

export const completePurchase = async (reservationId, userId) => {
  const purchase = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: { drop: true },
    });

    if (!reservation) {
      throw new ApiError(404, "Reservation not found");
    }
    if (reservation.userId !== userId) {
      throw new ApiError(403, "This reservation does not belong to you");
    }
    if (reservation.status !== "ACTIVE") {
      throw new ApiError(409, `Reservation is already ${reservation.status.toLowerCase()}`);
    }
    if (reservation.expiresAt <= new Date()) {
      throw new ApiError(409, "Reservation has expired");
    }

    const { count } = await tx.reservation.updateMany({
      where: { id: reservationId, status: "ACTIVE" },
      data: { status: "COMPLETED" },
    });

    if (count === 0) {
      throw new ApiError(409, "Reservation is no longer active");
    }

    return tx.purchase.create({
      data: {
        dropId: reservation.dropId,
        userId,
        reservationId,
        price: reservation.drop.price,
      },
      include: { user: { select: { username: true } } },
    });
  });

  clearExpiryTimer(reservationId);
  dropEvents.emit("purchase:new", {
    dropId: purchase.dropId,
    username: purchase.user.username,
    purchasedAt: purchase.purchasedAt,
  });

  return purchase;
};
