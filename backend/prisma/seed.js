import { prisma } from "../src/config/prisma.js";

const sneakers = [
  "Air Jordan 1 Retro High",
  "Nike Dunk Low Panda",
  "Yeezy Boost 350 V2",
  "New Balance 550 White Green",
  "Nike Air Force 1 '07",
  "Adidas Samba OG",
  "Nike Air Max 97",
  "Jordan 4 Retro Black Cat",
  "Asics Gel-Kayano 14",
  "Converse Chuck 70 Hi",
];

const randomPrice = () => Number((Math.random() * (350 - 80) + 80).toFixed(2));
const randomStock = () => Math.floor(Math.random() * (200 - 10 + 1)) + 10;
const randomStartsAt = () => {
  const offsetHours = Math.floor(Math.random() * 96) - 24; // -24h to +72h from now
  return new Date(Date.now() + offsetHours * 60 * 60 * 1000);
};

async function main() {
  const drops = sneakers.map((name) => {
    const totalStock = randomStock();
    return {
      name,
      price: randomPrice(),
      totalStock,
      availableStock: totalStock,
      startsAt: randomStartsAt(),
    };
  });

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
