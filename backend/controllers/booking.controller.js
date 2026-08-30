const prisma = require("../utils/db");
const getDayAndTime = require("../utils/getDayAndTime");
const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const toTimeStr = (totalMins) => {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

exports.getSlotsForDate = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const service = await prisma.providerService.findUnique({
      where: { id: serviceId },
      include: { provider: true }
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (!service.provider.isAvailable) {
      return res.json({ slots: [], message: "Provider is currently unavailable" });
    }

    const targetDate = new Date(date);
    const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" });

    const schedule = service.provider.schedule || {};
    const daySchedule = schedule[dayName];

    if (!daySchedule || !daySchedule.start || !daySchedule.end) {
      return res.json({ slots: [] });
    }

    const startOfDay = toMinutes(daySchedule.start);
    const endOfDay = toMinutes(daySchedule.end);
    const serviceDuration = service.duration || 60;
    const startDateTime = new Date(`${date}T00:00:00.000Z`);
    const endDateTime = new Date(`${date}T23:59:59.999Z`);

    const existingBookings = await prisma.booking.findMany({
      where: {
        providerId: service.providerId,
        bookingStart: {
          gte: startDateTime,
          lte: endDateTime
        },
        status: { not: "CANCELLED" }
      },
      select: { bookingStart: true, bookingEnd: true }
    });

    const slots = [];
    let currentMins = startOfDay;

    while (currentMins + serviceDuration <= endOfDay) {
      const slotStartMins = currentMins;
      const slotEndMins = currentMins + serviceDuration;
      const isConflict = existingBookings.some(booking => {
        const bStart = booking.bookingStart;
        const bEnd = booking.bookingEnd;
        const bStartMins = bStart.getUTCHours() * 60 + bStart.getUTCMinutes();
        const bEndMins = bEnd.getUTCHours() * 60 + bEnd.getUTCMinutes();
        return slotStartMins < bEndMins && slotEndMins > bStartMins;
      });

      if (!isConflict) {
        slots.push({
          time: toTimeStr(slotStartMins),
          booked: false,
          start: toTimeStr(slotStartMins),
          end: toTimeStr(slotEndMins)
        });
      }

      currentMins += 30;
    }

    return res.json({ slots });
  } catch (err) {
    console.error("getSlotsForDate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { serviceId, providerUserId, slot, address } = req.body;
    if (!serviceId || !providerUserId || !slot)
      return res.status(400).json({
        message: "serviceId, providerUserId and slot are required",
      });

    const service = await prisma.providerService.findUnique({
      where: { id: serviceId },
    });

    if (!service)
      return res.status(404).json({ message: "Service not found" });

    const bookingStart = new Date(slot);
    const bookingEnd = new Date(bookingStart.getTime() + service.duration * 60000);
    const conflict = await prisma.booking.findFirst({
      where: {
        providerId: providerUserId,
        status: { not: "CANCELLED" },
        OR: [
          {

            bookingStart: { gte: bookingStart, lt: bookingEnd }
          },
          {

            bookingEnd: { gt: bookingStart, lte: bookingEnd }
          },
          {

            bookingStart: { lte: bookingStart },
            bookingEnd: { gte: bookingEnd }
          }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId,
        providerId: providerUserId,
        serviceId,
        bookingStart,
        bookingEnd,
        amount: service.price,
        address: address || null,
      },
    });

    // Notify provider about new request
    try {
      await prisma.notification.create({
        data: {
          userId: providerUserId,
          title: "New Booking Request",
          message: `You have a new booking request.`,
          type: "BOOKING_REQUEST",
          bookingId: booking.id
        }
      });
    } catch (e) { console.log("notify create error", e.message); }

    return res.status(201).json({ booking });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    let status =
      action === "accept"
        ? "ACCEPTED"
        : action === "cancel"
          ? "CANCELLED"
          : action === "complete"
            ? "COMPLETED"
            : null;

    if (!status)
      return res.status(400).json({ message: "Invalid action" });

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    // === Permission & State Validation ===
    // 1. COMPLETED bookings cannot be changed
    if (booking.status === "COMPLETED") {
      return res.status(400).json({ message: "Cannot change a COMPLETED booking. It is already finished." });
    }
    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Booking is already CANCELLED." });
    }

    // 2. Role-based rules
    if (action === "accept" || action === "complete") {
      // Only provider who owns the booking can accept/complete
      if (booking.providerId !== userId && userRole !== "ADMIN") {
        return res.status(403).json({ message: "Only the assigned technician (or admin) can " + action + " this booking" });
      }
      if (action === "accept" && booking.status !== "PENDING") {
        return res.status(400).json({ message: "Only PENDING bookings can be accepted. Current: " + booking.status });
      }
      if (action === "complete" && booking.status !== "ACCEPTED") {
        return res.status(400).json({ message: "Only ACCEPTED bookings can be marked completed." });
      }
    }

    if (action === "cancel") {
      const isCustomer = booking.customerId === userId;
      const isProvider = booking.providerId === userId;
      const isAdmin = userRole === "ADMIN";
      if (!isCustomer && !isProvider && !isAdmin) {
        return res.status(403).json({ message: "You are not part of this booking" });
      }
      // Customer can cancel PENDING or ACCEPTED, but NOT after COMPLETED (already handled)
      // Provider can cancel only PENDING (reject)
      if (isProvider && !isAdmin && booking.status !== "PENDING") {
        return res.status(400).json({ message: "Provider can only cancel (reject) PENDING requests" });
      }
      // Customer cancel allowed for PENDING and ACCEPTED
      if (isCustomer && booking.status !== "PENDING" && booking.status !== "ACCEPTED") {
        return res.status(400).json({ message: "Cannot cancel booking in " + booking.status + " state" });
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // === Notifications ===
    try {
      if (status === "ACCEPTED") {
        await prisma.notification.create({
          data: {
            userId: booking.customerId,
            title: "Booking Accepted",
            message: `Your booking has been accepted by the technician.`,
            type: "BOOKING_ACCEPTED",
            bookingId: booking.id
          }
        });
      } else if (status === "CANCELLED") {
        const cancelledByCustomer = booking.customerId === userId;
        const notifyUserId = cancelledByCustomer ? booking.providerId : booking.customerId;
        const who = cancelledByCustomer ? "Customer" : "Technician";
        await prisma.notification.create({
          data: {
            userId: notifyUserId,
            title: "Booking Cancelled",
            message: `Booking was cancelled by ${who}.`,
            type: "BOOKING_CANCELLED",
            bookingId: booking.id
          }
        });
      } else if (status === "COMPLETED") {
        await prisma.notification.create({
          data: {
            userId: booking.customerId,
            title: "Service Completed",
            message: `Your service has been marked as completed. Please leave a review!`,
            type: "BOOKING_COMPLETED",
            bookingId: booking.id
          }
        });
      }
    } catch (e) { console.log("notification error", e.message); }

    return res.json({ message: "Booking updated", booking: updated });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { providerId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        service: true,
      },
      orderBy: { bookingStart: "asc" },
    });

    return res.json({ bookings });
  } catch (err) {
    console.error("getProviderBookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCurrentBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: {
            category: true,
            subcategory: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.customerId !== userId)
      return res
        .status(403)
        .json({ message: "Unauthorized request" });

    return res.json({ booking });
  } catch (err) {
    console.error("getCurrentBookingById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
