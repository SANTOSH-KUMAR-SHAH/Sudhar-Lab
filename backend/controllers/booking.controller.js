const prisma = require("../utils/db");
const getDayAndTime = require("../utils/getDayAndTime");
exports.getSlotsForDate = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const dayName = new Date(date)
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();

    const service = await prisma.providerService.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.availability) {
      return res.json({ slots: [] });
    }

    const daySlots = service.availability[dayName];
    if (!daySlots) return res.json({ slots: [] });

    const slots = Object.keys(daySlots).map((time) => {
      const val = daySlots[time];

      const isBooked =
        Array.isArray(val) &&
        val.length > 0 &&
        typeof val[0] === "string" &&
        val[0].match(/^[0-9a-fA-F-]{36}$/); // uuid

      // Calculate end time
      const [h, m] = time.split(":").map(Number);
      const startMins = h * 60 + m;
      const endMins = startMins + (service.duration || 60);
      const endH = Math.floor(endMins / 60);
      const endM = endMins % 60;
      const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      return {
        time,
        booked: isBooked,
        start: time,
        end: endTime
      };
    });

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

    const { day, time } = getDayAndTime(slot);

    const availability = service.availability;
    const daySlots = availability[day];

    if (!daySlots || !daySlots[time])
      return res.status(400).json({ message: "Slot not available" });

    // If booked array has a booking UUID → already booked
    if (
      Array.isArray(daySlots[time]) &&
      daySlots[time].length > 0 &&
      daySlots[time][0].match(/^[0-9a-fA-F-]{36}$/)
    ) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    const bookingStart = new Date(slot);
    const bookingEnd = new Date(
      bookingStart.getTime() + service.duration * 60000
    );

    // Create booking first
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

    // Mark slot as booked (store booking ID)
    availability[day][time] = [booking.id];

    await prisma.providerService.update({
      where: { id: serviceId },
      data: { availability },
    });

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

    const service = await prisma.providerService.findUnique({
      where: { id: booking.serviceId },
    });

    const availability = service.availability;

    const { day, time } = getDayAndTime(booking.bookingStart);

    if (action === "cancel") {
      // Free the slot
      if (availability[day] && availability[day][time]) {
        availability[day][time] = [];
      }

      await prisma.providerService.update({
        where: { id: service.id },
        data: { availability },
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

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
