const prisma = require('../utils/db');

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalProviders = await prisma.user.count({ where: { role: "PROVIDER" } });
        const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });

        const totalServices = await prisma.providerService.count();

        const onlineProviders = await prisma.providerProfile.count({ where: { isAvailable: true, applicationStatus: "APPROVED" } });
        const pendingProviders = await prisma.providerProfile.count({ where: { applicationStatus: "PENDING" } });
        const approvedProviders = await prisma.providerProfile.count({ where: { applicationStatus: "APPROVED" } });

        const totalBookings = await prisma.booking.count();
        const activeBookings = await prisma.booking.count({ where: { status: { in: ["PENDING", "ACCEPTED"] } } });
        const completedBookings = await prisma.booking.count({ where: { status: "COMPLETED" } });
        const totalRevenueAgg = await prisma.booking.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } });

        res.json({
            users: {
                total: totalUsers,
                providers: totalProviders,
                customers: totalCustomers,
            },
            providers: {
                online: onlineProviders,
                pending: pendingProviders,
                approved: approvedProviders,
            },
            services: {
                total: totalServices,
            },
            bookings: {
                total: totalBookings,
                active: activeBookings,
                completed: completedBookings,
            },
            revenue: {
                total: totalRevenueAgg._sum.amount || 0,
            },
        });
    } catch (err) {
        console.error("getAdminStats error:", err);
        res.status(500).json({ message: "Server error fetching stats" });
    }
};
const getMonthlyStats = async (req, res) => {
    try {
        const rawData = await prisma.$queryRaw`
            SELECT
                TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
                COUNT(*) FILTER (WHERE status IN ('PENDING','ACCEPTED')) as active,
                COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
                COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) as revenue
            FROM "Booking"
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY DATE_TRUNC('month', "createdAt");
        `;

        const data = rawData.map(row => ({
            month: row.month,
            active: Number(row.active),
            completed: Number(row.completed),
            revenue: Number(row.revenue)
        }));

        res.json(data);
    } catch (err) {
        console.error("getMonthlyStats error:", err);
        res.status(500).json({ message: "Failed to fetch monthly stats" });
    }
};

module.exports = {
    getAdminStats,
    getMonthlyStats

};