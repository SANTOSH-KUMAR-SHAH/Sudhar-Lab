const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, createTestNotification } = require("../controllers/notification.controller");

router.use(auth);
router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);
router.post("/test", createTestNotification);

module.exports = router;
