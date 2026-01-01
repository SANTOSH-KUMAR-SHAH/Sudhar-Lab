const prisma = require("../utils/db");

async function main() {
    console.log("Fixing service availability structure...");

    const services = await prisma.providerService.findMany();

    for (const s of services) {
        const availability = s.availability;
        if (!availability) continue;

        let changed = false;
        const newAvailability = { ...availability };

        // Iterate days
        for (const day in newAvailability) {
            const val = newAvailability[day];

            // If it is an array of strings like ["09:00", "10:00"], convert to object
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
                console.log(`Fixing service ${s.id} day ${day}`);
                const obj = {};
                val.forEach(time => {
                    obj[time] = []; // Empty bookings
                });
                newAvailability[day] = obj;
                changed = true;
            }
        }

        if (changed) {
            await prisma.providerService.update({
                where: { id: s.id },
                data: { availability: newAvailability },
            });
        }
    }

    console.log("Done.");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
