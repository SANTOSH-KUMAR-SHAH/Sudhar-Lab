const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/serviceRequest.controller");
const de = require("../controllers/diagnosisEstimate.controller");
const parts = require("../controllers/parts.controller");

router.use(auth);
router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getById);
router.patch("/:id/status", controller.changeStatus);
router.post("/:id/diagnosis", de.addDiagnosis);
router.post("/:id/estimate", de.createEstimate);
router.patch("/:id/estimate/decision", de.decideEstimate);
router.post("/:id/parts", parts.addUsage);
router.post("/:id/complete", parts.complete);
module.exports = router;
