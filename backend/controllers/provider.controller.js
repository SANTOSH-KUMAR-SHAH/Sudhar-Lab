const prisma = require("../utils/db");
const { generateToken } = require("../utils/jwt");

exports.becomeProvider = async (req, res) => {
  try {
    const userId = req.user.id;
    const { aadharNumber } = req.body;

    if (!aadharNumber) {
      return res.status(400).json({ message: "Aadhaar number is required" });
    }

    let profile = await prisma.providerProfile.findUnique({ where: { userId } });

    if (profile) {
      if (profile.applicationStatus === "APPROVED") {
        return res.status(400).json({ message: "You are already a provider." });
      }
      if (profile.applicationStatus === "PENDING") {
        return res.status(400).json({ message: "Your application is already pending." });
      }
      if (profile.applicationStatus === "REJECTED" && profile.rejectionDate) {
        const rejectionTime = new Date(profile.rejectionDate).getTime();
        const now = Date.now();
        const twoWeeks = 14 * 24 * 60 * 60 * 1000;

        if (now - rejectionTime < twoWeeks) {
          const daysLeft = Math.ceil((twoWeeks - (now - rejectionTime)) / (24 * 60 * 60 * 1000));
          return res.status(403).json({ message: `You can re-apply in ${daysLeft} days.` });
        }
      }
    }


    if (profile) {
      profile = await prisma.providerProfile.update({
        where: { userId },
        data: {
          aadharNumber,
          applicationStatus: "PENDING",
          rejectionDate: null
        }
      });
    } else {
      profile = await prisma.providerProfile.create({
        data: {
          userId,
          aadharNumber,
          applicationStatus: "PENDING",
          isAvailable: true,
          schedule: {
            "Monday": { start: "09:00", end: "17:00" },
            "Tuesday": { start: "09:00", end: "17:00" },
            "Wednesday": { start: "09:00", end: "17:00" },
            "Thursday": { start: "09:00", end: "17:00" },
            "Friday": { start: "09:00", end: "17:00" }
          }
        }
      });
    }

    return res.status(200).json({
      message: "Application submitted successfully. Waiting for Admin approval.",
      profile
    });

  } catch (err) {
    console.error("becomeProvider error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProviderProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        services: {
          include: {
            category: true,
            subcategory: true,
          }
        }
      }
    });

    if (!profile) return res.status(404).json({ message: "Provider not found" });

    res.json({ profile });
  } catch (err) {
    console.error("getProviderProfile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyProviderProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      include: { user: true }
    });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isAvailable } = req.body;

    const profile = await prisma.providerProfile.update({
      where: { userId },
      data: { isAvailable }
    });

    res.json({ message: "Availability updated", profile });
  } catch (err) {
    console.error("updateAvailability error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { schedule } = req.body;

    const profile = await prisma.providerProfile.update({
      where: { userId },
      data: { schedule }
    });

    res.json({ message: "Schedule updated", profile });
  } catch (err) {
    console.error("updateSchedule error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProviderServices = async (req, res) => {
  try {
    const { id } = req.params;

    const services = await prisma.providerService.findMany({
      where: { providerId: id },
      include: {
        category: true,
        subcategory: true
      }
    });

    res.json({ services });
  } catch (err) {
    console.error("getProviderServices error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProviderEarnings = async (req, res) => {
  try {
    const providerId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: providerId },
      select: { earnings: true },
    });

    return res.json({ earnings: user ? user.earnings : 0 });
  } catch (err) {
    console.error("getProviderEarnings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.markAsComplete = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const providerId = req.user.id; // Authenticated provider's User ID

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true }
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Security: Ensure this booking belongs to the requesting provider
    if (booking.providerId !== providerId) {
      return res.status(403).json({ message: "Not authorized to complete this booking" });
    }

    if (booking.status === "COMPLETED") {
      return res.status(400).json({ message: "Booking is already completed" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Cannot complete a cancelled booking" });
    }

    // Update status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" }
    });

    // Add earnings to provider
    await prisma.user.update({
      where: { id: providerId },
      data: { earnings: { increment: booking.service.price } } // Assuming service price is the earning
    });

    res.json({ message: "Booking marked as completed" });
  } catch (err) {
    console.error("markAsComplete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};