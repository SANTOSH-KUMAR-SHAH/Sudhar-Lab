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
            where: {
                role: "CUSTOMER" || "BOTH"
            }
        });

        res.json({ users });
    } catch (err) {
        console.error("getAllUsers error:", err);
        res.status(500).json({ message: "Server error" });
    }
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
