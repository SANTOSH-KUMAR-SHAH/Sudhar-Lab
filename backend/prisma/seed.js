const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- 1. CLEANUP (Delete existing data to avoid conflicts) ---
  console.log("Cleaning up old data...");
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.providerDocument.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.serviceSubCategory.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.user.deleteMany(); // Delete users last

  // --- 2. CATEGORIES DATA ---
  const categories = [
    {
      name: "Home Cleaning",
      icon: "cleaning",
      subcategories: [
        { name: "Full House Cleaning" },
        { name: "Bathroom Cleaning" },
        { name: "Kitchen Deep Cleaning" },
        { name: "Sofa Shampooing" },
        { name: "Carpet Cleaning" }
      ],
    },
    {
      name: "Electrical",
      icon: "electric",
      subcategories: [
        { name: "Fan Installation" },
        { name: "Switchboard Repair" },
        { name: "Light & Lamp Fitting" },
        { name: "Wiring Fixes" },
        { name: "Inverter Repair" }
      ],
    },
    {
      name: "Plumbing",
      icon: "plumbing",
      subcategories: [
        { name: "Leak Fixing" },
        { name: "Tap Replacement" },
        { name: "Bathroom Fittings" },
        { name: "Kitchen Sink Repair" },
        { name: "Water Tank Cleaning" }
      ],
    },
    {
      name: "Handyman",
      icon: "handyman",
      subcategories: [
        { name: "Drill & Hanging" },
        { name: "Furniture Assembly" },
        { name: "Minor Repairs" },
        { name: "Curtain Rod Installation" }
      ],
    },
    {
      name: "Appliance Repair",
      icon: "appliances",
      subcategories: [
        { name: "AC Repair" },
        { name: "Washing Machine Repair" },
        { name: "Refrigerator Repair" },
        { name: "Microwave Repair" },
        { name: "Water Purifier Service" }
      ],
    },
    {
      name: "Computer Repair",
      icon: "computer",
      subcategories: [
        { name: "Laptop Repair" },
        { name: "Software Installation" },
        { name: "Virus Removal" },
        { name: "Data Recovery" }
      ],
    },
    {
      name: "Beauty & Wellness",
      icon: "beauty",
      subcategories: [
        { name: "Facial & Cleanup" },
        { name: "Manicure & Pedicure" },
        { name: "Haircut & Styling" },
        { name: "Waxing Services" },
        { name: "Massage" }
      ],
    },
    {
      name: "Painting",
      icon: "painting",
      subcategories: [
        { name: "Interior Painting" },
        { name: "Exterior Painting" },
        { name: "Wall Texture" },
        { name: "Waterproofing" }
      ],
    },
    {
      name: "Shifting & Moving",
      icon: "moving",
      subcategories: [
        { name: "House Shifting" },
        { name: "Office Relocation" },
        { name: "Tempo Rental" }
      ],
    },
    {
      name: "Home Security",
      icon: "security",
      subcategories: [
        { name: "CCTV Installation" },
        { name: "Door Lock Repair" },
        { name: "Video Doorbell Setup" }
      ],
    },
    {
      name: "Tutoring",
      icon: "tutor",
      subcategories: [
        { name: "Maths Tuition" },
        { name: "Science Tuition" },
        { name: "English Tuition" }
      ],
    },
    {
      name: "Pet Care",
      icon: "pet",
      subcategories: [
        { name: "Pet Grooming" },
        { name: "Dog Walking" },
        { name: "Pet Training" }
      ],
    },
    {
      name: "Event Services",
      icon: "event",
      subcategories: [
        { name: "Birthday Decoration" },
        { name: "Photography" },
        { name: "DJ & Sound" }
      ],
    },
    {
      name: "Automobile",
      icon: "automobile",
      subcategories: [
        { name: "Car Servicing" },
        { name: "Bike Repair" },
        { name: "Car Wash" }
      ],
    },
    {
      name: "Miscellaneous",
      icon: "misc",
      subcategories: [
        { name: "Errand Running" },
        { name: "Personal Assistant" },
        { name: "Shopping Help" }
      ],
    },
  ];

  // --- 3. CREATE CATEGORIES & STORE IDs ---
  const createdCategories = [];
  for (const cat of categories) {
    const created = await prisma.serviceCategory.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        subcategories: { create: cat.subcategories },
      },
      include: { subcategories: true },
    });
    createdCategories.push(created);
    console.log(`Created category: ${created.name}`);
  }

  // --- 4. INDIAN USER DATA (PROVIDERS) ---
  const providerUsers = [
    { name: "Rahul Sharma", email: "rahul.sharma@example.com", aadharNumber: "123456789012" },
    { name: "Priya Patel", email: "priya.patel@example.com", aadharNumber: "123456789012" },
    { name: "Amit Kumar", email: "amit.kumar@example.com", aadharNumber: "123456789012" },
    { name: "Sneha Reddy", email: "sneha.reddy@example.com", aadharNumber: "123456789012" },
    { name: "Vikram Singh", email: "vikram.singh@example.com", aadharNumber: "123456789012" },
    { name: "Anjali Gupta", email: "anjali.gupta@example.com", aadharNumber: "123456789012" },
    { name: "Suresh Nair", email: "suresh.nair@example.com", aadharNumber: "123456789012" },
    { name: "Pooja Verma", email: "pooja.verma@example.com", aadharNumber: "123456789012" },
    { name: "Rakesh Yadav", email: "rakesh.yadav@example.com", aadharNumber: "123456789012" },
    { name: "Divya Das", email: "divya.das@example.com", aadharNumber: "123456789012" },
    { name: "Arjun Mehta", email: "arjun.mehta@example.com", aadharNumber: "123456789012" },
    { name: "Kavita Joshi", email: "kavita.joshi@example.com", aadharNumber: "123456789012" },
    { name: "Manoj Tiwari", email: "manoj.tiwari@example.com", aadharNumber: "123456789012" },
    { name: "Neha Malhotra", email: "neha.malhotra@example.com", aadharNumber: "123456789012" },
    { name: "Rajesh Iyer", email: "rajesh.iyer@example.com", aadharNumber: "123456789012" },
  ];

  // Hash password once used for all (for simplicity)
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log(`Creating ${providerUsers.length} providers...`);

  let index = 0;
  for (const pUser of providerUsers) {
    let appStatus = "PENDING";
    let isVer = false;
    let userRole = "CUSTOMER"; // Default until approved

    // Hardcoded logic for presentation
    if (index < 10) {
      appStatus = "APPROVED";
      isVer = true;
      userRole = "PROVIDER";
    } else if (index === 10) {
      appStatus = "REJECTED";
      userRole = "CUSTOMER";
    } else {
      appStatus = "PENDING";
      userRole = "CUSTOMER";
    }

    // Create User
    const user = await prisma.user.create({
      data: {
        name: pUser.name,
        email: pUser.email,
        password: hashedPassword,
        phone: "9876543210",
        role: userRole,
        providerProfile: {
          create: {
            bio: `Experienced professional offering high-quality services.`,
            experience: Math.floor(Math.random() * 10) + 1,
            isVerified: isVer,
            applicationStatus: appStatus,
            aadharNumber: pUser.aadharNumber,
            rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
            isAvailable: true, // Default to online
            schedule: {
              "Monday": { "start": "09:00", "end": "18:00" },
              "Tuesday": { "start": "09:00", "end": "18:00" },
              "Wednesday": { "start": "09:00", "end": "18:00" },
              "Thursday": { "start": "09:00", "end": "18:00" },
              "Friday": { "start": "09:00", "end": "18:00" },
              "Saturday": { "start": "10:00", "end": "14:00" },
              "Sunday": { "start": "", "end": "" }
            }
          }
        }
      },
      include: { providerProfile: true }
    });

    // Assign Random Services to Provider
    const numServices = Math.floor(Math.random() * 3) + 1;
    const shuffledCats = createdCategories.sort(() => 0.5 - Math.random());
    const selectedCats = shuffledCats.slice(0, numServices);

    for (const cat of selectedCats) {
      const subcat = cat.subcategories.length > 0
        ? cat.subcategories[Math.floor(Math.random() * cat.subcategories.length)]
        : null;

      await prisma.providerService.create({
        data: {
          providerId: user.providerProfile.id,
          categoryId: cat.id,
          subcategoryId: subcat ? subcat.id : null,
          price: Math.floor(Math.random() * (2000 - 300) + 300),
          description: `Professional ${subcat ? subcat.name : cat.name} service at your doorstep.`,
          duration: Math.floor(Math.random() * 120) + 30,
          availability: JSON.stringify({
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            hours: "9:00 AM - 6:00 PM"
          })
        }
      });
    }
    index++;
  }

  // --- 5. CREATE A FEW CUSTOMERS ---
  const customerUsers = [
    { name: "Rohan Das", email: "rohan.das@example.com" },
    { name: "Meera Kapoor", email: "meera.kapoor@example.com" }
  ];

  for (const cUser of customerUsers) {
    await prisma.user.create({
      data: {
        name: cUser.name,
        email: cUser.email,
        password: hashedPassword,
        phone: "9988776655",
        role: "CUSTOMER",
      }
    });
  }

  const adminUsers = [
    {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  ]

  for (const admin of adminUsers) {
    await prisma.user.create({
      data: {
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: admin.role,
      }
    });
  }
  console.log("Created customers.");
  console.log("Created admin.");
  // --- 6. CREATE BOOKINGS FOR REALISTIC STATS ---
  console.log("Creating bookings...");

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" }
  });

  const providers = await prisma.user.findMany({
    where: { role: "PROVIDER" },
    include: {
      providerProfile: {
        include: {
          services: true
        }
      }
    }
  });

  let totalRevenue = 0;

  const NUMBER_OF_BOOKINGS = 120;

  for (let i = 0; i < NUMBER_OF_BOOKINGS; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];

    if (!provider.providerProfile || provider.providerProfile.services.length === 0) continue;

    const service = provider.providerProfile.services[
      Math.floor(Math.random() * provider.providerProfile.services.length)
    ];

    // Spread across last 6 months
    const monthsAgo = i % 6;
    const daysAgo = Math.floor(Math.random() * 28);

    const start = new Date();
    start.setMonth(start.getMonth() - monthsAgo);
    start.setDate(start.getDate() - daysAgo);

    const end = new Date(start.getTime() + service.duration * 60000);

    const statusPool = [
      "COMPLETED", "COMPLETED", "COMPLETED",
      "ACCEPTED", "ACCEPTED",
      "PENDING",
      "CANCELLED"
    ];

    const status = statusPool[Math.floor(Math.random() * statusPool.length)];

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: provider.id,
        serviceId: service.id,
        bookingStart: start,
        bookingEnd: end,
        status,
        amount: service.price,
        address: "DLF Phase 3, Gurgaon",
        createdAt: start
      }
    });
    if (status === "COMPLETED") {
      await prisma.user.update({
        where: { id: provider.id },
        data: {
          earnings: { increment: service.price }
        }
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          reviewerId: customer.id,
          reviewedUserId: provider.id,
          rating: Math.floor(Math.random() * 2) + 4,
          comment: "Great service! Very professional."
        }
      });
    }
  }

  console.log("Bookings created.");

  console.log("🌱 Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
