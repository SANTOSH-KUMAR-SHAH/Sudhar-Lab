const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/serviceRequest.controller");

router.use(auth);
router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getById);
router.patch("/:id/status", controller.changeStatus);
module.exports = router;
