// backend/controllers/booking.controller.js

const prisma = require("../utils/db");
const { makeSlotDate, rangesOverlap } = require("../utils/slots");

/**
 * GET available slots for a provider service on a given date
 * Route:
 *  GET /api/bookings/providers/:providerUserId/services/:serviceId/slots?date=YYYY-MM-DD
 */
exports.getSlotsForDate = async (req, res) => {
  try {
    const { providerUserId, serviceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date (YYYY-MM-DD) is required" });
    }

    // Get providerProfile -> to verify provider exists
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: providerUserId },
    });
    if (!providerProfile) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Service info
    const service = await prisma.providerService.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Determine weekday
    const weekdayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const d = new Date(date + "T00:00:00");
    const dayKey = weekdayNames[d.getDay()];

    // Get availability array: e.g. ["09:00","10:00","11:00"]
    const availabilityList =
      (service.availability && service.availability[dayKey]) || [];

    // Convert availability times into start/end Date objects
    const slots = availabilityList.map((timeStr) => {
      const start = makeSlotDate(date, timeStr);
      const end = new Date(start.getTime() + service.duration * 60000);

      return {
        time: timeStr,
        start,
        end,
        available: true,
      };
    });

    // Fetch existing bookings for that provider user on this date
    const dayStart = new Date(date + "T00:00:00");
    const dayEnd = new Date(date + "T23:59:59");

    const bookings = await prisma.booking.findMany({
      where: {
        providerId: providerUserId,
        bookingStart: { gte: dayStart, lte: dayEnd },
      },
    });

    // Determine which slots are still free
    const finalSlots = slots.map((slot) => {
      const isBooked = bookings.some((b) =>
        rangesOverlap(slot.start, slot.end, b.bookingStart, b.bookingEnd)
      );

      return {
        ...slot,
        available: !isBooked,
      };
    });

    return res.json({ slots: finalSlots });
  } catch (err) {
    console.error("getSlotsForDate error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * CREATE BOOKING
 * Route:
 *   POST /api/bookings
 *
 * Body:
 * {
 *   "serviceId": "...",
 *   "providerUserId": "...",
 *   "slot": "2025-12-01T09:00:00",
 *   "address": "optional"
 * }
 */
exports.createBooking = async (req, res) => {
  try {
    const customerUserId = req.user.id;     // Logged in user
    const { serviceId, providerUserId, slot, address } = req.body;

    if (!serviceId || !providerUserId || !slot) {
      return res.status(400).json({
        message: "serviceId, providerUserId and slot are required",
      });
    }

    const service = await prisma.providerService.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const providerUser = await prisma.user.findUnique({
      where: { id: providerUserId },
    });
    if (!providerUser) {
      return res.status(404).json({ message: "Provider user not found" });
    }

    // Compute start & end
    const bookingStart = new Date(slot);
    const bookingEnd = new Date(
      bookingStart.getTime() + service.duration * 60000
    );

    // Conflict check
    const existing = await prisma.booking.count({
      where: {
        providerId: providerUserId,
        bookingStart: { lt: bookingEnd },
        bookingEnd: { gt: bookingStart },
      },
    });

    if (existing > 0) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customerUserId,
        providerId: providerUserId,
        serviceId,
        bookingStart,
        bookingEnd,
        amount: service.price,
        address: address || null,
      },
    });

    return res.status(201).json({ booking });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE BOOKING STATUS
 * Route:
 *   PATCH /api/bookings/:id/status
 *
 * Body:
 *   { "action": "accept" | "cancel" | "complete" }
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { action } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Authorisation
    const isCustomer = booking.customerId === userId;
    const isProvider = booking.providerId === userId;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let newStatus = booking.status;

    if (action === "accept") {
      if (!isProvider) {
        return res.status(403).json({ message: "Only provider can accept" });
      }
      newStatus = "ACCEPTED";
    } else if (action === "cancel") {
      newStatus = "CANCELLED";
    } else if (action === "complete") {
      if (!isProvider) {
        return res.status(403).json({ message: "Only provider can complete" });
      }
      newStatus = "COMPLETED";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
    });

    return res.json({ booking: updated });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// GET all bookings for logged-in provider
exports.getProviderBookings = async (req, res) => {
  try {
    const providerUserId = req.user.id; // provider's userId from JWT

    const bookings = await prisma.booking.findMany({
      where: { providerId: providerUserId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        service: true,
      },
      orderBy: { bookingStart: "asc" }
    });

    return res.json({ bookings });
  } catch (err) {
    console.error("getProviderBookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// GET all bookings for logged-in customer

