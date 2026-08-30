const prisma = require("../utils/db");

const transitions = {
  REQUESTED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["CONFIRMED"],
  CONFIRMED: ["TECHNICIAN_ON_WAY"],
  TECHNICIAN_ON_WAY: ["DIAGNOSING"],
  DIAGNOSING: ["IN_PROGRESS"],
  IN_PROGRESS: ["WAITING_FOR_PARTS", "COMPLETED"],
  WAITING_FOR_PARTS: ["IN_PROGRESS"],
  COMPLETED: ["INVOICED"],
  INVOICED: ["PAID"],
  PAID: ["CLOSED"],
};

function canAccess(request, user) {
  return user.role === "ADMIN" || request.customerId === user.id || request.technicianId === user.id;
}

exports.list = async (req, res) => {
  try {
    const where = req.user.role === "ADMIN" ? {} : req.user.role === "PROVIDER" || req.user.role === "BOTH"
      ? { technicianId: req.user.id } : { customerId: req.user.id };
    const requests = await prisma.serviceRequest.findMany({ where, orderBy: { createdAt: "desc" }, include: { appliance: true, customer: { select: { id: true, name: true, email: true, phone: true } }, technician: { select: { id: true, name: true, email: true, phone: true } }, statusHistory: { orderBy: { changedAt: "asc" } } } });
    res.json({ requests });
  } catch (e) { res.status(500).json({ message: "Unable to load service requests" }); }
};

exports.getById = async (req, res) => {
  try {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id }, include: { appliance: true, customer: { select: { id: true, name: true, email: true, phone: true } }, technician: { select: { id: true, name: true, email: true, phone: true } }, statusHistory: { orderBy: { changedAt: "asc" } } } });
    if (!request) return res.status(404).json({ message: "Service request not found" });
    if (!canAccess(request, req.user)) return res.status(403).json({ message: "Access denied" });
    res.json({ request });
  } catch (e) { res.status(500).json({ message: "Unable to load service request" }); }
};

exports.create = async (req, res) => {
  try {
    const { applianceId, problem, address, categoryId, subcategoryId } = req.body;
    if (!applianceId || !problem?.trim()) return res.status(400).json({ message: "Appliance and problem description are required" });
    const appliance = await prisma.appliance.findUnique({ where: { id: applianceId } });
    if (!appliance || appliance.customerId !== req.user.id) return res.status(403).json({ message: "You can only request service for your own appliance" });
    const request = await prisma.serviceRequest.create({ data: { customerId: req.user.id, applianceId, problem: problem.trim(), address, categoryId, subcategoryId, statusHistory: { create: { toStatus: "REQUESTED", changedById: req.user.id, note: "Service request created" } } }, include: { appliance: true, statusHistory: true } });
    res.status(201).json({ message: "Service request created", request });
  } catch (e) { res.status(500).json({ message: "Unable to create service request" }); }
};

exports.changeStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ message: "Service request not found" });
    if (!canAccess(request, req.user)) return res.status(403).json({ message: "Access denied" });
    if (req.user.role === "CUSTOMER" && !(request.status === "REQUESTED" && status === "CANCELLED")) return res.status(403).json({ message: "Customers can only cancel requested jobs" });
    if (req.user.role !== "ADMIN" && req.user.role !== "CUSTOMER" && request.technicianId !== req.user.id) return res.status(403).json({ message: "Only the assigned technician can update this job" });
    if (!transitions[request.status]?.includes(status)) return res.status(400).json({ message: `Invalid transition from ${request.status} to ${status}` });
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.serviceRequest.update({ where: { id: request.id }, data: { status } });
      await tx.serviceRequestStatusHistory.create({ data: { requestId: request.id, fromStatus: request.status, toStatus: status, changedById: req.user.id, note } });
      return result;
    });
    res.json({ message: "Service request status updated", request: updated });
  } catch (e) { res.status(500).json({ message: "Unable to update service request" }); }
};
