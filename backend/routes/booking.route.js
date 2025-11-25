const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");

const {
  getSlotsForDate,
  createBooking,
  updateBookingStatus,
} = require("../controllers/booking.controller");
router.get(
  "/providers/:providerUserId/services/:serviceId/slots",
  getSlotsForDate
);
router.post("/", auth, checkRole("CUSTOMER"), createBooking);
router.patch("/:id/status", auth, updateBookingStatus);

module.exports = router;
