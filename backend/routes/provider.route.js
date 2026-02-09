const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const {
  getProviderProfile,
  getProviderServices,
  becomeProvider,
  getProviderEarnings,
  getProviderStats,
  updateAvailability,
  updateSchedule,
  getMyProviderProfile,
  markAsComplete
} = require("../controllers/provider.controller");
const checkRole = require("../middlewares/role.middleware");
const { addService: addProviderService } = require("../controllers/providerService.controller");

router.post("/become", auth, becomeProvider);


router.get("/me", auth, getMyProviderProfile);
router.patch("/availability", auth, updateAvailability);
router.patch("/schedule", auth, updateSchedule);
router.patch("/bookings/:bookingId/complete", auth, markAsComplete);

router.get("/stats", auth, checkRole("PROVIDER"), getProviderStats);
router.get("/earnings", auth, checkRole("PROVIDER"), getProviderEarnings);
router.get("/:id", getProviderProfile);
router.get("/:id/services", getProviderServices);
router.post("/services", auth, addProviderService);



module.exports = router;
