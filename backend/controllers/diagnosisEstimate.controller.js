const prisma = require("../utils/db");

async function requestFor(id, user) {
  const r = await prisma.serviceRequest.findUnique({ where: { id }, include: { estimate: { include: { items: true } }, diagnosis: true } });
  if (!r) return { error: [404, "Service request not found"] };
  if (user.role !== "ADMIN" && r.customerId !== user.id && r.technicianId !== user.id) return { error: [403, "Access denied"] };
  return { request: r };
}

exports.addDiagnosis = async (req, res) => {
  try {
    const found = await requestFor(req.params.id, req.user); if (found.error) return res.status(found.error[0]).json({ message: found.error[1] });
    const { findings, recommendedWork } = req.body;
    if (!findings?.trim()) return res.status(400).json({ message: "Diagnosis findings are required" });
    if (req.user.role !== "ADMIN" && found.request.technicianId !== req.user.id) return res.status(403).json({ message: "Only the assigned technician can diagnose" });
    const diagnosis = await prisma.diagnosis.upsert({ where: { requestId: req.params.id }, update: { findings: findings.trim(), recommendedWork }, create: { requestId: req.params.id, technicianId: req.user.id, findings: findings.trim(), recommendedWork } });
    res.status(201).json({ diagnosis });
  } catch (e) { res.status(500).json({ message: "Unable to save diagnosis" }); }
};

exports.createEstimate = async (req, res) => {
  try {
    const found = await requestFor(req.params.id, req.user); if (found.error) return res.status(found.error[0]).json({ message: found.error[1] });
    if (req.user.role !== "ADMIN" && found.request.technicianId !== req.user.id) return res.status(403).json({ message: "Only the assigned technician can create an estimate" });
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length || items.some(i => !i.description?.trim() || Number(i.quantity) < 1 || Number(i.unitPrice) < 0)) return res.status(400).json({ message: "At least one valid estimate item is required" });
    const estimate = await prisma.estimate.upsert({ where: { requestId: req.params.id }, update: { status: "PENDING", customerNote: req.body.customerNote, items: { deleteMany: {}, create: items.map(i => ({ description: i.description.trim(), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })) } }, create: { requestId: req.params.id, customerNote: req.body.customerNote, items: { create: items.map(i => ({ description: i.description.trim(), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })) } }, include: { items: true } });
    res.status(201).json({ estimate, total: estimate.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) });
  } catch (e) { res.status(500).json({ message: "Unable to create estimate" }); }
};

exports.decideEstimate = async (req, res) => {
  try {
    const found = await requestFor(req.params.id, req.user); if (found.error) return res.status(found.error[0]).json({ message: found.error[1] });
    if (req.user.id !== found.request.customerId) return res.status(403).json({ message: "Only the customer can decide on an estimate" });
    if (!found.request.estimate) return res.status(404).json({ message: "Estimate not found" });
    if (!["APPROVED", "REJECTED"].includes(req.body.status)) return res.status(400).json({ message: "Decision must be APPROVED or REJECTED" });
    const estimate = await prisma.estimate.update({ where: { id: found.request.estimate.id }, data: { status: req.body.status, customerNote: req.body.note || found.request.estimate.customerNote }, include: { items: true } });
    res.json({ estimate });
  } catch (e) { res.status(500).json({ message: "Unable to record estimate decision" }); }
};
