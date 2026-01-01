const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const {
  getProviderProfile,
  getProviderServices,
  becomeProvider,
  getProviderEarnings
} = require("../controllers/provider.controller");
const checkRole = require("../middlewares/role.middleware");
const { addService: addProviderService } = require("../controllers/providerService.controller");

router.post("/become", auth, becomeProvider);
router.get("/earnings", auth, checkRole("PROVIDER"), getProviderEarnings);
router.get("/:id", getProviderProfile);
router.get("/:id/services", getProviderServices);
router.post("/services", auth, addProviderService);


module.exports = router;
