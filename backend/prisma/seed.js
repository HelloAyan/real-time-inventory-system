import { prisma } from "../src/config/prisma.js";

const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

// Hand-picked, not randomly generated — prices/stock match real retail
// numbers, and startsAt hours alternate between already-live and
// upcoming so the dashboard doesn't show them clustered by status.
const drops = [
  { name: "Nike Air Force 1 '07 White", price: 114.99, totalStock: 200, startsAt: hoursFromNow(-48) },
  { name: 'Air Jordan 1 Retro High OG "Chicago"', price: 180.0, totalStock: 60, startsAt: hoursFromNow(72) },
  { name: "New Balance 990v6", price: 209.99, totalStock: 90, startsAt: hoursFromNow(-5) },
  { name: "Adidas Samba OG", price: 110.0, totalStock: 150, startsAt: hoursFromNow(24) },
  { name: 'Nike Dunk Low Retro "Panda"', price: 115.0, totalStock: 40, startsAt: hoursFromNow(-24) },
  { name: 'Yeezy Boost 350 V2 "Zebra"', price: 230.0, totalStock: 25, startsAt: hoursFromNow(120) },
  { name: "Converse Chuck 70 Hi", price: 90.0, totalStock: 300, startsAt: hoursFromNow(-3) },
  { name: "Asics Gel-Kayano 14", price: 190.0, totalStock: 70, startsAt: hoursFromNow(48) },
  { name: 'New Balance 550 "White Green"', price: 130.0, totalStock: 55, startsAt: hoursFromNow(-144) },
  { name: 'Nike Air Max 97 "Silver Bullet"', price: 185.0, totalStock: 45, startsAt: hoursFromNow(12) },
].map((drop) => ({ ...drop, availableStock: drop.totalStock }));

async function main() {
  await prisma.purchase.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.drop.deleteMany();

  await prisma.drop.createMany({ data: drops });
  console.log(`Seeded ${drops.length} drops.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
