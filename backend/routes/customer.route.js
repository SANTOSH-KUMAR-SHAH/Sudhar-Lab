// backend/routes/customer.route.js

const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");

const {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerBookings,
} = require("../controllers/customer.controller");

// CUSTOMER: GET PROFILE
router.get(
  "/me",
  auth,
  checkRole("CUSTOMER"),
  getCustomerProfile
);

// CUSTOMER: UPDATE PROFILE
router.patch(
  "/update",
  auth,
  checkRole("CUSTOMER"),
  updateCustomerProfile
);

// CUSTOMER: GET BOOKINGS
router.get(
  "/bookings",
  auth,
  checkRole("CUSTOMER"),
  getCustomerBookings
);

module.exports = router;
