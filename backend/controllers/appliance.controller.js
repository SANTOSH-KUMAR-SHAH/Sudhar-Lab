const prisma = require("../utils/db");

exports.list = async (req, res) => {
  try { res.json({ appliances: await prisma.appliance.findMany({ where: { customerId: req.user.id }, include: { serviceRequests: { orderBy: { createdAt: "desc" }, take: 10 } }, orderBy: { createdAt: "desc" } }) }); }
  catch (e) { res.status(500).json({ message: "Unable to load appliances" }); }
};

exports.create = async (req, res) => {
  try {
    const { type, brand, model, serialNumber, purchaseDate, warrantyInfo } = req.body;
    if (!type?.trim() || !brand?.trim()) return res.status(400).json({ message: "Appliance type and brand are required" });
    const appliance = await prisma.appliance.create({ data: { customerId: req.user.id, type: type.trim(), brand: brand.trim(), model, serialNumber, purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined, warrantyInfo } });
    res.status(201).json({ appliance });
  } catch (e) { res.status(500).json({ message: "Unable to create appliance" }); }
};

exports.getById = async (req, res) => {
  try {
    const appliance = await prisma.appliance.findUnique({ where: { id: req.params.id }, include: { serviceRequests: { orderBy: { createdAt: "desc" }, include: { statusHistory: { orderBy: { changedAt: "asc" } } } } } });
    if (!appliance) return res.status(404).json({ message: "Appliance not found" });
    if (appliance.customerId !== req.user.id && req.user.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });
    res.json({ appliance });
  } catch (e) { res.status(500).json({ message: "Unable to load appliance" }); }
};
