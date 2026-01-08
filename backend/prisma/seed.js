const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- 1. CLEANUP (Delete existing data to avoid conflicts) ---
  console.log("Cleaning up old data...");
  // Use try-catch for delete loops or just deleteMany which doesn't throw on 0
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
    { name: "Rahul Sharma", email: "rahul.sharma@example.com" },
    { name: "Priya Patel", email: "priya.patel@example.com" },
    { name: "Amit Kumar", email: "amit.kumar@example.com" },
    { name: "Sneha Reddy", email: "sneha.reddy@example.com" },
    { name: "Vikram Singh", email: "vikram.singh@example.com" },
    { name: "Anjali Gupta", email: "anjali.gupta@example.com" },
    { name: "Suresh Nair", email: "suresh.nair@example.com" },
    { name: "Pooja Verma", email: "pooja.verma@example.com" },
    { name: "Rakesh Yadav", email: "rakesh.yadav@example.com" },
    { name: "Divya Das", email: "divya.das@example.com" },
    { name: "Arjun Mehta", email: "arjun.mehta@example.com" },
    { name: "Kavita Joshi", email: "kavita.joshi@example.com" },
    { name: "Manoj Tiwari", email: "manoj.tiwari@example.com" },
    { name: "Neha Malhotra", email: "neha.malhotra@example.com" },
    { name: "Rajesh Iyer", email: "rajesh.iyer@example.com" },
  ];

  // Hash password once used for all (for simplicity)
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log(`Creating ${providerUsers.length} providers...`);

  for (const pUser of providerUsers) {
    // Create User
    const user = await prisma.user.create({
      data: {
        name: pUser.name,
        email: pUser.email,
        password: hashedPassword,
        phone: "9876543210", // Dummy phone
        role: "PROVIDER",
        providerProfile: {
          create: {
            bio: `Experienced professional offering high-quality services.`,
            experience: Math.floor(Math.random() * 10) + 1, // 1-10 years
            isVerified: Math.random() > 0.3, // 70% verified
            rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)), // 3.5 - 5.0
          }
        }
      },
      include: { providerProfile: true }
    });

    // Assign Random Services to Provider
    const numServices = Math.floor(Math.random() * 3) + 1; // 1-3 services per provider
    const shuffledCats = createdCategories.sort(() => 0.5 - Math.random());
    const selectedCats = shuffledCats.slice(0, numServices);

    for (const cat of selectedCats) {
      // Pick a random subcategory if available
      const subcat = cat.subcategories.length > 0
        ? cat.subcategories[Math.floor(Math.random() * cat.subcategories.length)]
        : null;

      await prisma.providerService.create({
        data: {
          providerId: user.providerProfile.id,
          categoryId: cat.id,
          subcategoryId: subcat ? subcat.id : null,
          price: Math.floor(Math.random() * (2000 - 300) + 300), // ₹300 - ₹2000
          description: `Professional ${subcat ? subcat.name : cat.name} service at your doorstep.`,
          duration: Math.floor(Math.random() * 120) + 30, // 30-150 mins
          availability: JSON.stringify({
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            hours: "9:00 AM - 6:00 PM"
          })
        }
      });
    }
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
  console.log("Created customers.");

  console.log("🌱 Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
