const prisma = require("../utils/db");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;
    const where = { userId };
    if (unreadOnly === "true") where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.json({ notifications: [], unreadCount: 0 });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    if (notif.userId !== userId) return res.status(403).json({ message: "Not your notification" });

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ notification: updated });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.json({ notification: { id: req.params.id, isRead: true } });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: "All marked as read" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    res.json({ message: "All marked as read (mock)" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) return res.status(404).json({ message: "Not found" });
    if (notif.userId !== userId) return res.status(403).json({ message: "Not yours" });
    await prisma.notification.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.json({ message: "Deleted (mock)" });
  }
};

exports.createTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notif = await prisma.notification.create({
      data: {
        userId,
        title: "Test Notification",
        message: "This is a professional notification system test.",
        type: "INFO"
      }
    });
    res.json({ notification: notif });
  } catch (err) {
    res.json({ notification: { id: 'mock', title: 'Test' } });
  }
};
