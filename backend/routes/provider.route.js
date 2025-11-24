const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const {
  getProviderProfile,
  getProviderServices,
  becomeProvider
} = require("../controllers/provider.controller");
const { addService: addProviderService } = require("../controllers/providerService.controller");

router.post("/become", auth, becomeProvider);
router.get("/:id", getProviderProfile);
router.get("/:id/services", getProviderServices);
// Route to add a service for the logged-in provider. This uses the canonical
// providerService controller which looks up the ProviderProfile and uses its id.
router.post("/services", auth, addProviderService);

module.exports = router;
