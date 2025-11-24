const prisma = require("../utils/db");

// GET all services owned by provider
exports.getMyServices = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the ProviderProfile for the logged-in user
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

// ADD a new service
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

    const { categoryId, subcategoryId, price, description } = req.body;

    // validate required fields (basic)
    if (!categoryId || typeof price === 'undefined') {
      return res.status(400).json({ message: 'categoryId and price are required' });
    }

    const newService = await prisma.providerService.create({
      data: {
        providerId,
        categoryId,
        subcategoryId,
        price,
        description,
      },
    });

    res.status(201).json({ message: "Service added", service: newService });
  } catch (err) {
    console.error("addService error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE service
exports.updateService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.params;

    const service = await prisma.providerService.findUnique({ where: { id: serviceId } });

    if (!service) return res.status(404).json({ message: "Service not found" });

    // Ensure the logged-in user's provider profile owns this service
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(400).json({ message: "Provider profile not found" });

    if (service.providerId !== profile.id)
      return res.status(403).json({ message: "Forbidden" });

  const { categoryId, subcategoryId, price, description, duration } = req.body;

  // Build update payload: connect relations via nested writes when needed
  const updateData = {};
  if (typeof price !== 'undefined') updateData.price = price;
  if (typeof description !== 'undefined') updateData.description = description;
  if (typeof duration !== 'undefined') updateData.duration = duration;
  if (categoryId) updateData.category = { connect: { id: categoryId } };
  if (subcategoryId) updateData.subcategory = { connect: { id: subcategoryId } };

  const updated = await prisma.providerService.update({ where: { id: serviceId }, data: updateData });

    res.json({ message: "Service updated", updated });
  } catch (err) {
    console.error("updateService error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE service
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
