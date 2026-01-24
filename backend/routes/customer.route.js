

const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");

const { getCustomerProfile, updateCustomerProfile, getCustomerBookings, getAllCustomers, getAllProviders, } = require("../controllers/customer.controller");


router.get("/me", auth, checkRole("CUSTOMER"), getCustomerProfile);
router.patch("/update", auth, checkRole("CUSTOMER"), updateCustomerProfile);
router.get("/bookings", auth, checkRole("CUSTOMER"), getCustomerBookings);
router.get("/all-customers", auth, checkRole("CUSTOMER"), getAllCustomers);
router.get("/all-providers", auth, checkRole("CUSTOMER"), getAllProviders);

module.exports = router;
