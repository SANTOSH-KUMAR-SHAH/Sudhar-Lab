const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");

const {
  getSlotsForDate,
  createBooking,
  updateBookingStatus,
  getProviderBookings,
  getCurrentBookingById
} = require("../controllers/booking.controller");
router.get(
  "/providers/:providerUserId/services/:serviceId/slots",
  getSlotsForDate
);
router.post("/", auth, checkRole("CUSTOMER"), createBooking);
router.patch("/:id/status", auth, updateBookingStatus);
router.get("/providers/bookings", auth, checkRole("PROVIDER"), getProviderBookings);
router.get("/current/:id", auth, checkRole("CUSTOMER"), getCurrentBookingById);


module.exports = router;
