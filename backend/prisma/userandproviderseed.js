// prisma/seedUsersAndProviders.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function randomPhone() {
  return "9" + Math.floor(100000000 + Math.random() * 900000000);
}

function randomPrice() {
  return Math.floor(Math.random() * (2500 - 500 + 1)) + 500;
}

function randomDuration() {
  return [45, 60, 75, 90, 120][Math.floor(Math.random() * 5)];
}

// Generates 09:00–18:00 hourly slots
function generateAvailabilityJSON() {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const availability = {};

  days.forEach((day) => {
    const slots = {};
    for (let hr = 9; hr <= 18; hr++) {
      const h = hr.toString().padStart(2, "0");
      slots[`${h}:00`] = [];
    }
    availability[day] = slots;
  });

  return availability;
}

async function main() {
  console.log("🌱 Starting seed...");

  // ===============================================
  // 1️⃣ Get categories + subcategories
  // ===============================================
  const categories = await prisma.serviceCategory.findMany({
    include: { subcategories: true },
  });

  if (categories.length === 0) {
    console.log("❌ No categories found. Seed categories first!");
    return;
  }

  // ===============================================
  // 2️⃣ Create 5 Customers
  // ===============================================
  console.log("\n👤 Seeding customers...");

  const customers = [];

  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: randomPhone(),
        password: await bcrypt.hash("password123", 10),
        role: "CUSTOMER",
        addresses: {
          create: [
            {
              street: `Street ${i}`,
              city: "Mumbai",
              state: "MH",
              pincode: "400001",
            },
          ],
        },
      },
    });
    customers.push(user);
  }

  // ===============================================
  // 3️⃣ Create 5 Providers
  // ===============================================
  console.log("\n🔧 Seeding providers...");

  const providers = [];

  for (let i = 1; i <= 5; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const subs = category.subcategories;
    const selectedSubs = subs.sort(() => 0.5 - Math.random()).slice(0, 3);

    const user = await prisma.user.create({
      data: {
        name: `Provider ${i}`,
        email: `provider${i}@example.com`,
        phone: randomPhone(),
        password: await bcrypt.hash("password123", 10),
        role: "PROVIDER",
        providerProfile: {
          create: {
            bio: "Experienced professional service provider.",
            experience: Math.floor(Math.random() * 10) + 1,
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
          },
        },
      },
      include: { providerProfile: true },
    });

    // Create provider services
    for (const sub of selectedSubs) {
      await prisma.providerService.create({
        data: {
          providerId: user.providerProfile.id,
          categoryId: category.id,
          subcategoryId: sub.id,
          price: randomPrice(),
          duration: randomDuration(),
          description: `Service for ${sub.name}`,
          availability: generateAvailabilityJSON(),
        },
      });
    }

    providers.push(user);
  }

  console.log("\n✅ Seed Completed!");

  console.log("\n📌 Created Customers:");
  customers.forEach((c) =>
    console.log(` - ${c.name} (${c.email})`)
  );

  console.log("\n📌 Created Providers:");
  providers.forEach((p) =>
    console.log(` - ${p.name} (${p.email})`)
  );

  console.log("\n🎉 All done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
