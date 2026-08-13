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
  const now = new Date();

  const purchasersInclude = {
    purchases: {
      orderBy: { purchasedAt: "desc" },
      take: 3,
      include: { user: { select: { username: true } } },
    },
  };

  const [liveDrops, upcomingDrops] = await Promise.all([
    prisma.drop.findMany({
      where: { startsAt: { lte: now } },
      orderBy: { startsAt: "desc" },
      include: purchasersInclude,
    }),
    prisma.drop.findMany({
      where: { startsAt: { gt: now } },
      orderBy: { startsAt: "asc" },
      include: purchasersInclude,
    }),
  ]);

  const drops = [...liveDrops, ...upcomingDrops];

  return drops.map(({ purchases, ...drop }) => ({
    ...drop,
    recentPurchasers: purchases.map((p) => ({
      username: p.user.username,
      purchasedAt: p.purchasedAt,
    })),
  }));
};
