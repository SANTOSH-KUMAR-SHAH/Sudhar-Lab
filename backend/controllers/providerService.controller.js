const prisma = require("../utils/db");
const { generateDailySlots } = require("../utils/slots");
exports.getMyServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(400).json({ message: 'Provider profile not found for this user' });
    }

    const services = await prisma.providerService.findMany({
      where: { providerId: profile.id },
      include: {
        category: true,
        subcategory: true,
      },
    });

    res.json({ services });
  } catch (err) {
    console.error("getMyServices error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addService = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(400).json({ message: "Provider profile not found" });
    }

    const providerId = profile.id;

    const {
      categoryId,
      subcategoryId,
      price,
      description,
      duration,
      selectedDays = []
    } = req.body;

    if (!categoryId || typeof price === "undefined" || !duration) {
      return res.status(400).json({
        message: "categoryId, price, duration are required"
      });
    }

    const allDays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    const availability = {};
    for (const d of allDays) availability[d] = [];

    for (const d of selectedDays) {
      const dayKey = String(d).toLowerCase();
      const times = generateDailySlots(9, 19, Number(duration));
      const slotsObj = {};
      times.forEach(t => slotsObj[t] = []);
      availability[dayKey] = slotsObj;
    }

    const newService = await prisma.providerService.create({
      data: {
        providerId,
        categoryId,
        subcategoryId,
        price,
        description,
        duration: Number(duration),
        availability,
      },
    });

    res.status(201).json({
      message: "Service added with availability",
      service: newService
    });

  } catch (err) {
    console.error("addService error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.params;

    const service = await prisma.providerService.findUnique({ where: { id: serviceId } });

    if (!service) return res.status(404).json({ message: "Service not found" });

    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(400).json({ message: "Provider profile not found" });

    if (service.providerId !== profile.id)
      return res.status(403).json({ message: "Forbidden" });

    const { categoryId, subcategoryId, price, description, duration } = req.body;

    const updateData = {};
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = Number(duration);

    if (categoryId) updateData.category = { connect: { id: categoryId } };
    if (subcategoryId) updateData.subcategory = { connect: { id: subcategoryId } };

    const updated = await prisma.providerService.update({
      where: { id: serviceId },
      data: updateData,
    });

    res.json({ message: "Service updated", updated });

  } catch (err) {
    console.error("updateService error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.params;

    const service = await prisma.providerService.findUnique({ where: { id: serviceId } });

    if (!service) return res.status(404).json({ message: "Service not found" });

    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(400).json({ message: "Provider profile not found" });

    if (service.providerId !== profile.id)
      return res.status(403).json({ message: "Forbidden" });

    await prisma.providerService.delete({ where: { id: serviceId } });

    res.json({ message: "Service deleted" });
  } catch (err) {
    console.error("deleteService error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await prisma.providerService.findUnique({
      where: { id: serviceId },
      include: {
        provider: {
          include: { user: true },
        },
        category: true,
        subcategory: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ service });
  } catch (err) {
    console.error("getServiceById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.params;
    const { availability } = req.body;

    if (!availability || typeof availability !== "object") {
      return res.status(400).json({ message: "Valid availability JSON required" });
    }

    const service = await prisma.providerService.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ message: "Service not found" });

    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(400).json({ message: "Provider profile not found" });

    if (service.providerId !== profile.id)
      return res.status(403).json({ message: "Forbidden" });

    const updated = await prisma.providerService.update({
      where: { id: serviceId },
      data: { availability },
    });

    res.json({ message: "Availability updated", service: updated });

  } catch (err) {
    console.error("updateAvailability error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
