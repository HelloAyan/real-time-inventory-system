import { prisma } from "../../config/prisma.js";

export const createDrop = async ({ name, price, totalStock, startsAt }) => {
  return prisma.drop.create({
    data: {
      name,
      price,
      totalStock,
      availableStock: totalStock,
      ...(startsAt && { startsAt }),
    },
  });
};

export const listDrops = async () => {
  const drops = await prisma.drop.findMany({
    where: { startsAt: { lte: new Date() } },
    orderBy: { startsAt: "desc" },
    include: {
      purchases: {
        orderBy: { purchasedAt: "desc" },
        take: 3,
        include: { user: { select: { username: true } } },
      },
    },
  });

  return drops.map(({ purchases, ...drop }) => ({
    ...drop,
    recentPurchasers: purchases.map((p) => ({
      username: p.user.username,
      purchasedAt: p.purchasedAt,
    })),
  }));
};
