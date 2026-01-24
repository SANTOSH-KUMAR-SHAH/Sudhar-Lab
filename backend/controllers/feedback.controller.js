const prisma = require("../utils/db");

// --- REVIEWS ---

exports.createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const reviewerId = req.user.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { provider: true, customer: true }
        });

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Determine reviewed user (opposite of reviewer)
        let reviewedUserId;
        if (reviewerId === booking.customerId) {
            reviewedUserId = booking.providerId;
        } else if (reviewerId === booking.providerId) {
            reviewedUserId = booking.customerId; // Providers reviewing customers? Usually disallowed or one-way. Assuming one-way for now or both.
            // User request focuses on "post service ... option to give feedback" (Customer -> Provider)
        } else {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Check if review exists
        const existing = await prisma.review.findUnique({ where: { bookingId } });
        if (existing) return res.status(400).json({ message: "Review already exists" });

        const review = await prisma.review.create({
            data: {
                bookingId,
                reviewerId,
                reviewedUserId,
                rating: parseInt(rating),
                comment
            }
        });

        // Update provider profile rating (simple average)
        if (reviewerId === booking.customerId) {
            const aggs = await prisma.review.aggregate({
                where: { reviewedUserId: reviewedUserId },
                _avg: { rating: true }
            });
            await prisma.providerProfile.update({
                where: { userId: reviewedUserId },
                data: { rating: aggs._avg.rating || 0 }
            });
        }

        res.json({ message: "Review submitted", review });

    } catch (err) {
        console.error("createReview error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getProviderReviews = async (req, res) => {
    try {
        const providerId = req.user.id;
        // User reports received
        const reviews = await prisma.review.findMany({
            where: { reviewedUserId: providerId },
            include: { reviewer: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate rating distribution
        const total = reviews.length;
        const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / total || 0;

        res.json({ reviews, avg, total });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- REPORTS ---

exports.createReport = async (req, res) => {
    try {
        const { bookingId, issueType, description } = req.body;
        const reporterId = req.user.id; // Customer

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Ensure reporter is customer (orphaned report check)
        if (booking.customerId !== reporterId) {
            return res.status(403).json({ message: "Not authorized to report this booking" });
        }

        const report = await prisma.report.create({
            data: {
                bookingId,
                reporterId,
                providerId: booking.providerId,
                issueType,
                description
            }
        });

        res.json({ message: "Report submitted successfully", report });
    } catch (err) {
        console.error("createReport error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAdminReports = async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            include: {
                reporter: { select: { name: true, email: true } },
                provider: { select: { name: true, email: true } },
                booking: {
                    include: {
                        service: { include: { subcategory: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Also fetch recent reviews for Admin view
        const reviews = await prisma.review.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                reviewer: { select: { name: true } },
                reviewedUser: { select: { name: true } }
            }
        });

        res.json({ reports, reviews });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAdminFeedbackStats = async (req, res) => {
    try {
        // Just general stats
        const totalReviews = await prisma.review.count();
        const totalReports = await prisma.report.count();
        const pendingReports = await prisma.report.count({ where: { status: "OPEN" } });

        const recentReviews = await prisma.review.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { reviewer: { select: { name: true } }, reviewedUser: { select: { name: true } } }
        });

        res.json({ totalReviews, totalReports, pendingReports, recentReviews });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
