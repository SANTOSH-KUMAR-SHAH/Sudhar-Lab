const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");

const {
  getMyServices,
  addService,
  updateService,
  deleteService,
  updateAvailability,
  getServiceById
} = require("../controllers/providerService.controller");

router.get("/", auth, checkRole("PROVIDER"), getMyServices);
router.get("/:serviceId", getServiceById);
router.post("/", auth, checkRole("PROVIDER"), addService);
router.put("/:serviceId", auth, checkRole("PROVIDER"), updateService);
router.put(
  "/:serviceId/availability",
  auth,
  checkRole("PROVIDER"),
  updateAvailability
);
router.delete("/:serviceId", auth, checkRole("PROVIDER"), deleteService);

module.exports = router;
