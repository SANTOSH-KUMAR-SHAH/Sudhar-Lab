const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const categories = [
    // --------------------------------------------------------------------
    // 1. HOME CLEANING
    // --------------------------------------------------------------------
    {
      name: "Home Cleaning",
      icon: "cleaning",
      subcategories: [
        { name: "Full House Cleaning" },
        { name: "Bathroom Cleaning" },
        { name: "Kitchen Deep Cleaning" },
        { name: "Sofa Shampooing" },
        { name: "Carpet Cleaning" },
        { name: "Balcony Cleaning" },
      ],
    },

    // --------------------------------------------------------------------
    // 2. ELECTRICAL SERVICES
    // --------------------------------------------------------------------
    {
      name: "Electrical",
      icon: "electric",
      subcategories: [
        { name: "Fan Installation" },
        { name: "Switchboard Repair" },
        { name: "Light & Lamp Fitting" },
        { name: "Wiring Fixes" },
        { name: "Inverter Repair" },
        { name: "Circuit Breaker Issues" },
      ],
    },

    // --------------------------------------------------------------------
    // 3. PLUMBING
    // --------------------------------------------------------------------
    {
      name: "Plumbing",
      icon: "plumbing",
      subcategories: [
        { name: "Leak Fixing" },
        { name: "Tap Replacement" },
        { name: "Bathroom Fittings" },
        { name: "Kitchen Sink Repair" },
        { name: "Water Tank Cleaning" },
        { name: "Pipeline Installation" },
      ],
    },

    // --------------------------------------------------------------------
    // 4. HANDYMAN / CARPENTRY
    // --------------------------------------------------------------------
    {
      name: "Handyman",
      icon: "handyman",
      subcategories: [
        { name: "Drill & Hanging" },
        { name: "Furniture Assembly" },
        { name: "Minor Repairs" },
        { name: "Curtain Rod Installation" },
        { name: "Woodwork Polishing" },
        { name: "Cupboard Repair" },
      ],
    },

    // --------------------------------------------------------------------
    // 5. APPLIANCE REPAIR
    // --------------------------------------------------------------------
    {
      name: "Appliance Repair",
      icon: "appliances",
      subcategories: [
        { name: "AC Repair" },
        { name: "Washing Machine Repair" },
        { name: "Refrigerator Repair" },
        { name: "Microwave Repair" },
        { name: "Water Purifier Service" },
        { name: "TV Repair" },
      ],
    },

    // --------------------------------------------------------------------
    // 6. COMPUTER & LAPTOP
    // --------------------------------------------------------------------
    {
      name: "Computer Repair",
      icon: "computer",
      subcategories: [
        { name: "Laptop Repair" },
        { name: "Software Installation" },
        { name: "Virus Removal" },
        { name: "Data Recovery" },
        { name: "Desktop Setup" },
        { name: "Network Troubleshooting" },
      ],
    },

    // --------------------------------------------------------------------
    // 7. BEAUTY & WELLNESS
    // --------------------------------------------------------------------
    {
      name: "Beauty & Wellness",
      icon: "beauty",
      subcategories: [
        { name: "Facial & Cleanup" },
        { name: "Manicure & Pedicure" },
        { name: "Haircut & Styling" },
        { name: "Waxing Services" },
        { name: "Makeup Services" },
        { name: "Spa & Massage" },
      ],
    },

    // --------------------------------------------------------------------
    // 8. PAINTING
    // --------------------------------------------------------------------
    {
      name: "Painting",
      icon: "painting",
      subcategories: [
        { name: "Interior Painting" },
        { name: "Exterior Painting" },
        { name: "Wall Texture" },
        { name: "Ceiling Painting" },
        { name: "Wood Painting" },
        { name: "Waterproofing" },
      ],
    },

    // --------------------------------------------------------------------
    // 9. MOVING / SHIFTING
    // --------------------------------------------------------------------
    {
      name: "Shifting & Moving",
      icon: "moving",
      subcategories: [
        { name: "House Shifting" },
        { name: "Office Relocation" },
        { name: "Packing Services" },
        { name: "Transport Truck Booking" },
        { name: "Loading & Unloading" },
        { name: "Furniture Shifting" },
      ],
    },

    // --------------------------------------------------------------------
    // 10. HOME SECURITY
    // --------------------------------------------------------------------
    {
      name: "Home Security",
      icon: "security",
      subcategories: [
        { name: "CCTV Installation" },
        { name: "Door Lock Repair" },
        { name: "Smart Lock Installation" },
        { name: "Video Doorbell Setup" },
        { name: "Security Audit" },
      ],
    },

    // --------------------------------------------------------------------
    // 11. TUTORING / EDUCATION
    // --------------------------------------------------------------------
    {
      name: "Tutoring",
      icon: "tutor",
      subcategories: [
        { name: "Maths Tuition" },
        { name: "Science Tuition" },
        { name: "English Tuition" },
        { name: "Coding Classes" },
        { name: "Board Exam Prep" },
        { name: "Spoken English" },
      ],
    },

    // --------------------------------------------------------------------
    // 12. PET CARE
    // --------------------------------------------------------------------
    {
      name: "Pet Care",
      icon: "pet",
      subcategories: [
        { name: "Pet Grooming" },
        { name: "Dog Walking" },
        { name: "Pet Training" },
        { name: "Pet Sitting" },
        { name: "Vet Visit Assistance" },
      ],
    },

    // --------------------------------------------------------------------
    // 13. EVENT SERVICES
    // --------------------------------------------------------------------
    {
      name: "Event Services",
      icon: "event",
      subcategories: [
        { name: "Birthday Decoration" },
        { name: "Photography" },
        { name: "Catering" },
        { name: "DJ & Sound" },
        { name: "Event Planning" },
        { name: "Mehendi Artist" },
      ],
    },

    // --------------------------------------------------------------------
    // 14. AUTOMOBILE SERVICES
    // --------------------------------------------------------------------
    {
      name: "Automobile",
      icon: "automobile",
      subcategories: [
        { name: "Car Servicing" },
        { name: "Bike Repair" },
        { name: "Flat Tyre Fix" },
        { name: "Battery Jumpstart" },
        { name: "Car Wash" },
        { name: "Detailing Services" },
      ],
    },

    // --------------------------------------------------------------------
    // 15. MISCELLANEOUS
    // --------------------------------------------------------------------
    {
      name: "Miscellaneous",
      icon: "misc",
      subcategories: [
        { name: "Errand Running" },
        { name: "Personal Assistant" },
        { name: "Document Work" },
        { name: "Help Moving Items" },
        { name: "Shopping Help" },
      ],
    },
  ];

  for (const cat of categories) {
    const created = await prisma.serviceCategory.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        subcategories: { create: cat.subcategories },
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
