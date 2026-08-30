const prisma = require("../utils/db");

async function authorized(id, user) {
  const request = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!request) return [null, [404, "Service request not found"]];
  if (user.role !== "ADMIN" && request.technicianId !== user.id) return [null, [403, "Only the assigned technician can manage parts"]];
  return [request, null];
}

exports.addUsage = async (req, res) => {
  try {
    const [request, error] = await authorized(req.params.id, req.user); if (error) return res.status(error[0]).json({ message: error[1] });
    const { partId, quantity = 1, unitPrice, note } = req.body;
    const part = await prisma.sparePart.findUnique({ where: { id: partId } });
    if (!part || !part.available) return res.status(400).json({ message: "Part is unavailable" });
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) return res.status(400).json({ message: "Quantity must be at least 1" });
    const usage = await prisma.partUsage.create({ data: { requestId: request.id, partId, quantity: Number(quantity), unitPrice: unitPrice == null ? part.unitPrice : Number(unitPrice), note }, include: { part: true } });
    res.status(201).json({ usage });
  } catch (e) { res.status(500).json({ message: "Unable to add part usage" }); }
};

exports.complete = async (req, res) => {
  try {
    const [request, error] = await authorized(req.params.id, req.user); if (error) return res.status(error[0]).json({ message: error[1] });
    if (request.status !== "IN_PROGRESS") return res.status(400).json({ message: "Only an in-progress repair can be completed" });
    if (!req.body.workPerformed?.trim()) return res.status(400).json({ message: "Work performed is required" });
    const updated = await prisma.$transaction(async tx => {
      const result = await tx.serviceRequest.update({ where: { id: request.id }, data: { status: "COMPLETED", workPerformed: req.body.workPerformed.trim(), completedAt: new Date() } });
      await tx.serviceRequestStatusHistory.create({ data: { requestId: request.id, fromStatus: "IN_PROGRESS", toStatus: "COMPLETED", changedById: req.user.id, note: "Repair completed" } });
      return result;
    });
    res.json({ message: "Repair completed", request: updated });
  } catch (e) { res.status(500).json({ message: "Unable to complete repair" }); }
};
