const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  console.log("\n🧹 Cleaning availability arrays...");

  const services = await prisma.providerService.findMany();

  for (const svc of services) {
    let availability = svc.availability;
    let modified = false;

    for (const day of Object.keys(availability)) {
      const daySlots = availability[day];

      for (const time of Object.keys(daySlots)) {
        const val = daySlots[time];

        // If array contains ANY non-uuid string → clear it
        if (
          Array.isArray(val) &&
          val.length > 0 &&
          !val[0].match(/^[0-9a-fA-F-]{36}$/) // not a UUID
        ) {
          console.log(`➡ Clearing invalid slot ${day} ${time} in service ${svc.id}`);
          daySlots[time] = [];
          modified = true;
        }
      }
    }

    if (modified) {
      await prisma.providerService.update({
        where: { id: svc.id },
        data: { availability },
      });

      console.log(`✅ Cleaned service ${svc.id}`);
    }
  }

  console.log("\n🎉 Availability cleanup complete!");
  process.exit();
})();
