const prisma = require("../utils/db");

exports.get = async (req, res) => {
  try {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id }, include: { warranty: true } });
    if (!request) return res.status(404).json({ message: "Service request not found" });
    if (req.user.role !== "ADMIN" && request.customerId !== req.user.id && request.technicianId !== req.user.id) return res.status(403).json({ message: "Access denied" });
    if (!request.warranty) return res.status(404).json({ message: "No warranty record" });
    res.json({ warranty: request.warranty });
  } catch (e) { res.status(500).json({ message: "Unable to load warranty" }); }
};

exports.create = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Only admin can manage warranty records" });
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ message: "Service request not found" });
    if (!["COMPLETED", "INVOICED", "PAID", "CLOSED"].includes(request.status)) return res.status(400).json({ message: "Warranty can only be issued after completion" });
    if (!req.body.coverage?.trim()) return res.status(400).json({ message: "Warranty coverage is required" });
    const warranty = await prisma.warranty.upsert({ where: { requestId: request.id }, update: { coverage: req.body.coverage.trim(), startsAt: req.body.startsAt ? new Date(req.body.startsAt) : undefined, expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null, terms: req.body.terms }, create: { requestId: request.id, coverage: req.body.coverage.trim(), startsAt: req.body.startsAt ? new Date(req.body.startsAt) : undefined, expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null, terms: req.body.terms } });
    res.status(201).json({ warranty });
  } catch (e) { res.status(500).json({ message: "Unable to save warranty" }); }
};
