const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");

const {
  getMyServices,
  addService,
  updateService,
  deleteService
} = require("../controllers/providerService.controller");

// Provider-only routes
router.get("/", auth, checkRole("PROVIDER"), getMyServices);
router.post("/", auth, checkRole("PROVIDER"), addService);
router.put("/:serviceId", auth, checkRole("PROVIDER"), updateService);
router.delete("/:serviceId", auth, checkRole("PROVIDER"), deleteService);

module.exports = router;
