const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------- SERVICE CATEGORIES + SUBCATEGORIES ----------
  const categories = [
    {
      name: "Home Cleaning",
      icon: "cleaning-icon",
      subcategories: [
        { name: "Full House Cleaning" },
        { name: "Bathroom Cleaning" },
        { name: "Sofa Cleaning" },
      ],
    },
    {
      name: "Tutoring",
      icon: "tutor-icon",
      subcategories: [
        { name: "Maths Tuition" },
        { name: "Science Tuition" },
        { name: "English Tuition" },
      ],
    },
    {
      name: "Computer Repair",
      icon: "computer-icon",
      subcategories: [
        { name: "Laptop Repair" },
        { name: "Software Installation" },
        { name: "Virus Removal" },
      ],
    },
    {
      name: "Handyman",
      icon: "tools-icon",
      subcategories: [
        { name: "Drill & Hanging" },
        { name: "Furniture Assembly" },
        { name: "Minor Repairs" },
      ],
    },
    {
      name: "Electrical",
      icon: "bulb-icon",
      subcategories: [
        { name: "Fan Installation" },
        { name: "Switchboard Repair" },
        { name: "Wiring Fixes" },
      ],
    },
  ];

  for (const cat of categories) {
    const created = await prisma.serviceCategory.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        subcategories: {
          create: cat.subcategories.map((s) => ({
            name: s.name,
          })),
        },
      },
    });

    console.log(`Created category: ${created.name}`);
  }

  console.log("🌱 Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
