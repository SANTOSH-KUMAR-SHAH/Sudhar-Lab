// scripts/fixAvailability.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixAvailability() {
  try {
    console.log("🔍 Starting availability migration...");

    // Fetch all provider services
    const services = await prisma.providerService.findMany();

    for (const service of services) {
      const availability = service.availability;

      // Skip if availability is null
      if (!availability) continue;

      let modified = false;

      // Days of week
      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
      ];

      let newAvailability = { ...availability };

      for (const day of days) {
        const value = availability[day];

        if (Array.isArray(value)) {
          // ❗ OLD FORMAT DETECTED → Convert array → object
          console.log(`➡ Converting availability for ${service.id} (${day})`);

          newAvailability[day] = {};

          value.forEach((timeStr) => {
            newAvailability[day][timeStr] = []; // free slot → []
          });

          modified = true;
        }
      }

      if (modified) {
        await prisma.providerService.update({
          where: { id: service.id },
          data: { availability: newAvailability },
        });

        console.log(`✅ Updated service ${service.id}`);
      }
    }

    console.log("🎉 Migration complete!");
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

fixAvailability();
