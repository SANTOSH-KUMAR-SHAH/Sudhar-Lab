const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");

const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/customerAddress.controller");

// All routes are customer-only
router.get("/", auth, checkRole("CUSTOMER"), getAddresses);
router.post("/", auth, checkRole("CUSTOMER"), createAddress);
router.put("/:id", auth, checkRole("CUSTOMER"), updateAddress);
router.delete("/:id", auth, checkRole("CUSTOMER"), deleteAddress);

module.exports = router;
