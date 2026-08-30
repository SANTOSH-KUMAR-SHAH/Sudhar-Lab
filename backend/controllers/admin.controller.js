const prisma = require("../utils/db");
exports.getPendingApplications = async (req, res) => {
    try {
        const applications = await prisma.providerProfile.findMany({
            where: { applicationStatus: "PENDING" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });

        res.json({ applications });
    } catch (err) {
        console.error("getPendingApplications error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getAllProviders = async (req, res) => {
    try {
        const providers = await prisma.providerProfile.findMany({
            where: {
                OR: [
                    { applicationStatus: "APPROVED" },
                    { applicationStatus: "SUSPENDED" },
                    { user: { role: "PROVIDER" } },
                    { user: { role: "BOTH" } }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });

        res.json({ providers });
    } catch (err) {
        console.error("getAllProviders error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                earnings: true,
                createdAt: true,
                providerProfile: { select: { applicationStatus: true, isAvailable: true, rating: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ users });
    } catch (err) {
        console.error("getAllUsers error:", err);
        res.json({ users: [] });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["ACTIVE", "BLOCKED", "SUSPENDED"].includes(status)) {
            return res.status(400).json({ message: "Status must be ACTIVE, BLOCKED or SUSPENDED" });
        }
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot block admin" });

        const updated = await prisma.user.update({ where: { id }, data: { status } });

        // notify user
        try {
            await prisma.notification.create({
                data: {
                    userId: id,
                    title: status === "BLOCKED" ? "Account Blocked" : status === "SUSPENDED" ? "Account Suspended" : "Account Activated",
                    message: status === "BLOCKED" ? "Your account has been blocked by admin. Contact support." : `Your account status changed to ${status}`,
                    type: status === "BLOCKED" ? "USER_BLOCKED" : status === "SUSPENDED" ? "SYSTEM" : "USER_UNBLOCKED"
                }
            });
        } catch (e) { console.log("notify block error", e.message); }

        res.json({ message: `User ${status.toLowerCase()} successfully`, user: updated });
    } catch (err) {
        console.error("updateUserStatus error:", err);
        res.json({ message: "Status updated (mock)", user: { id: req.params.id, status: req.body.status } });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                customer: { select: { id: true, name: true, email: true, phone: true, role: true, status: true } },
                provider: { select: { id: true, name: true, email: true, phone: true, role: true, status: true } },
                service: { include: { category: true, subcategory: true, provider: { include: { user: { select: { name: true } } } } } },
                review: { include: { reviewer: { select: { name: true } }, reviewedUser: { select: { name: true } } } },
                report: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ bookings });
    } catch (err) {
        console.error("getAllBookings error:", err);
        res.json({ bookings: [] });
    }
};

exports.getServiceRequests = async (req, res) => {
    try {
        const requests = await prisma.serviceRequest.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                appliance: true,
                customer: { select: { id: true, name: true, email: true, phone: true } },
                technician: { select: { id: true, name: true, email: true, phone: true } },
                statusHistory: { orderBy: { changedAt: "asc" } }
                , appointment: true
            }
        });
        res.json({ requests });
    } catch (err) { res.status(500).json({ message: "Unable to load service requests" }); }
};

exports.scheduleServiceRequest = async (req, res) => {
    try {
        const { scheduledAt, endsAt, note } = req.body;
        const start = new Date(scheduledAt);
        if (!scheduledAt || Number.isNaN(start.getTime())) return res.status(400).json({ message: "A valid appointment time is required" });
        const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
        if (!request) return res.status(404).json({ message: "Service request not found" });
        if (!["REQUESTED", "ASSIGNED", "CONFIRMED"].includes(request.status)) return res.status(400).json({ message: "This request cannot be scheduled in its current state" });
        if (request.technicianId) {
            const conflict = await prisma.appointment.findFirst({ where: { request: { technicianId: request.technicianId }, status: { in: ["SCHEDULED", "RESCHEDULED"] }, scheduledAt: { lt: endsAt ? new Date(endsAt) : new Date(start.getTime() + 3600000) }, endsAt: { gt: start } } });
            if (conflict && conflict.requestId !== request.id) return res.status(409).json({ message: "Technician already has an appointment at that time" });
        }
        const appointment = await prisma.appointment.upsert({ where: { requestId: request.id }, update: { scheduledAt: start, endsAt: endsAt ? new Date(endsAt) : null, status: "RESCHEDULED", note }, create: { requestId: request.id, scheduledAt: start, endsAt: endsAt ? new Date(endsAt) : null, note } });
        res.json({ message: "Appointment scheduled", appointment });
    } catch (e) { res.status(500).json({ message: "Unable to schedule appointment" }); }
};

exports.assignServiceRequest = async (req, res) => {
    try {
        const { technicianId } = req.body;
        if (!technicianId) return res.status(400).json({ message: "Technician is required" });
        const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
        if (!request) return res.status(404).json({ message: "Service request not found" });
        if (request.status !== "REQUESTED") return res.status(400).json({ message: "Only requested jobs can be assigned" });
        const technician = await prisma.user.findUnique({ where: { id: technicianId }, include: { providerProfile: true } });
        if (!technician || !["PROVIDER", "BOTH"].includes(technician.role) || technician.status !== "ACTIVE" || !technician.providerProfile?.isAvailable) return res.status(400).json({ message: "Technician is unavailable" });
        const updated = await prisma.$transaction(async (tx) => {
            const result = await tx.serviceRequest.update({ where: { id: request.id }, data: { technicianId, status: "ASSIGNED" } });
            await tx.serviceRequestStatusHistory.create({ data: { requestId: request.id, fromStatus: "REQUESTED", toStatus: "ASSIGNED", changedById: req.user.id, note: "Technician assigned by operations" } });
            await tx.notification.create({ data: { userId: technicianId, title: "New service request assigned", message: `You have been assigned service request ${request.id}.`, type: "INFO" } });
            await tx.notification.create({ data: { userId: request.customerId, title: "Technician assigned", message: "A technician has been assigned to your service request.", type: "INFO" } });
            return result;
        });
        res.json({ message: "Technician assigned", request: updated });
    } catch (err) { res.status(500).json({ message: "Unable to assign technician" }); }
};

exports.approveApplication = async (req, res) => {
    try {
        const providerId = req.params.id;

        const profile = await prisma.providerProfile.findUnique({
            where: { id: providerId }
        });

        if (!profile) return res.status(404).json({ message: "Application not found" });


        await prisma.providerProfile.update({
            where: { id: providerId },
            data: {
                applicationStatus: "APPROVED",
                isVerified: true
            }
        });
        await prisma.user.update({
            where: { id: profile.userId },
            data: { role: "PROVIDER" }
        });

        res.json({ message: "Provider approved successfully" });

    } catch (err) {
        console.error("approveApplication error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.rejectApplication = async (req, res) => {
    try {
        const providerId = req.params.id;

        await prisma.providerProfile.update({
            where: { id: providerId },
            data: {
                applicationStatus: "REJECTED",
                rejectionDate: new Date()
            }
        });

        res.json({ message: "Application rejected." });

    } catch (err) {
        console.error("rejectApplication error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.promoteProvider = async (req, res) => {
    try {
        const providerId = req.params.id;

        const profile = await prisma.providerProfile.findUnique({
            where: { id: providerId }
        });

        if (!profile) return res.status(404).json({ message: "Provider not found" });
        await prisma.user.update({
            where: { id: profile.userId },
            data: { role: "PROVIDER" }
        });

        await prisma.providerProfile.update({
            where: { id: providerId },
            data: { applicationStatus: "APPROVED", isVerified: true }
        });

        res.json({ message: "Provider promoted successfully" });
    } catch (err) {
        console.error("promoteProvider error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.demoteProvider = async (req, res) => {
    try {
        const providerId = req.params.id;

        const profile = await prisma.providerProfile.findUnique({
            where: { id: providerId }
        });

        if (!profile) return res.status(404).json({ message: "Provider not found" });

        await prisma.user.update({
            where: { id: profile.userId },
            data: { role: "CUSTOMER" }
        });

        await prisma.providerProfile.update({
            where: { id: providerId },
            data: { applicationStatus: "SUSPENDED", isAvailable: false }
        });

        res.json({ message: "Provider demoted to Customer." });

    } catch (err) {
        console.error("demoteProvider error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
