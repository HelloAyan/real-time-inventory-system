import { sweepExpiredReservations } from "../modules/reservations/reservations.service.js";

const SWEEP_INTERVAL_MS = 5000;

export const startReservationSweep = () => {
  setInterval(() => {
    sweepExpiredReservations().catch((err) =>
      console.error("Reservation sweep failed:", err)
    );
  }, SWEEP_INTERVAL_MS);
};
