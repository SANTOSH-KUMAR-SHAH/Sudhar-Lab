const prisma = require("../utils/db");

async function getRequest(id, user) {
  const request = await prisma.serviceRequest.findUnique({ where: { id }, include: { estimate: { include: { items: true } }, partsUsed: { include: { part: true } }, invoice: { include: { items: true, payments: true } } } });
  if (!request) return [null, [404, "Service request not found"]];
  if (user.role !== "ADMIN" && request.customerId !== user.id && request.technicianId !== user.id) return [null, [403, "Access denied"]];
  return [request, null];
}

exports.createInvoice = async (req, res) => {
  try {
    const [r, error] = await getRequest(req.params.id, req.user); if (error) return res.status(error[0]).json({ message: error[1] });
    if (!['ADMIN', 'PROVIDER', 'BOTH'].includes(req.user.role) || (req.user.role !== 'ADMIN' && r.technicianId !== req.user.id)) return res.status(403).json({ message: "Only operations or the assigned technician can invoice" });
    if (r.status !== "COMPLETED") return res.status(400).json({ message: "Only completed repairs can be invoiced" });
    const existing = r.invoice; if (existing) return res.json({ invoice: existing });
    const items = (r.estimate?.items || []).map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice }));
    for (const p of r.partsUsed || []) items.push({ description: `Part: ${p.part.name}`, quantity: p.quantity, unitPrice: p.unitPrice ?? p.part.unitPrice ?? 0 });
    const labour = Number(req.body.labour || 0); if (labour > 0) items.unshift({ description: "Labour", quantity: 1, unitPrice: labour });
    if (!items.length) return res.status(400).json({ message: "Invoice needs approved estimate items, parts, or labour" });
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const invoice = await prisma.invoice.create({ data: { requestId: r.id, subtotal, total: subtotal, items: { create: items } } });
    await prisma.serviceRequest.update({ where: { id: r.id }, data: { status: "INVOICED" } });
    await prisma.serviceRequestStatusHistory.create({ data: { requestId: r.id, fromStatus: "COMPLETED", toStatus: "INVOICED", changedById: req.user.id, note: "Invoice generated" } });
    res.status(201).json({ invoice });
  } catch (e) { res.status(500).json({ message: "Unable to create invoice" }); }
};

exports.getInvoice = async (req, res) => { try { const [r, error] = await getRequest(req.params.id, req.user); if (error) return res.status(error[0]).json({ message: error[1] }); if (!r.invoice) return res.status(404).json({ message: "Invoice not found" }); res.json({ invoice: r.invoice }); } catch (e) { res.status(500).json({ message: "Unable to load invoice" }); } };

exports.pay = async (req, res) => {
  try { const [r, error] = await getRequest(req.params.id, req.user); if (error) return res.status(error[0]).json({ message: error[1] }); if (r.customerId !== req.user.id) return res.status(403).json({ message: "Only the customer can pay" }); if (!r.invoice || r.status !== "INVOICED") return res.status(400).json({ message: "Request is not ready for payment" }); const method = req.body.method || "DEMO"; if (!["DEMO", "ESEWA", "KHALTI", "FONEPAY", "IMEPAY"].includes(method)) return res.status(400).json({ message: "Unsupported payment method" }); const payment = await prisma.payment.create({ data: { invoiceId: r.invoice.id, amount: r.invoice.total, method, status: "SIMULATED", reference: `DEMO-${Date.now()}` } }); await prisma.invoice.update({ where: { id: r.invoice.id }, data: { status: "PAID", paidAt: new Date() } }); await prisma.serviceRequest.update({ where: { id: r.id }, data: { status: "PAID" } }); await prisma.serviceRequestStatusHistory.create({ data: { requestId: r.id, fromStatus: "INVOICED", toStatus: "PAID", changedById: req.user.id, note: "Demo payment recorded; replace with gateway verification for production" } }); res.json({ message: "Demo payment recorded", payment }); } catch (e) { res.status(500).json({ message: "Unable to process payment" }); }
};

exports.close = async (req, res) => { try { const [r, error] = await getRequest(req.params.id, req.user); if (error) return res.status(error[0]).json({ message: error[1] }); if (req.user.role !== "ADMIN" && r.customerId !== req.user.id) return res.status(403).json({ message: "Only the customer or admin can close" }); if (r.status !== "PAID") return res.status(400).json({ message: "Payment is required before closure" }); const updated = await prisma.serviceRequest.update({ where: { id: r.id }, data: { status: "CLOSED" } }); await prisma.serviceRequestStatusHistory.create({ data: { requestId: r.id, fromStatus: "PAID", toStatus: "CLOSED", changedById: req.user.id, note: "Service request closed" } }); res.json({ request: updated }); } catch (e) { res.status(500).json({ message: "Unable to close request" }); } };
