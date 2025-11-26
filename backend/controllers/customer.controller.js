const prisma = require("../utils/db");

exports.getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("getCustomerProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      return res.status(400).json({ message: "Nothing to update" });
    }
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      if (!email.includes("@") || (!email.includes(".") && !email.includes(".com"))) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("updateCustomerProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      orderBy: { bookingStart: "desc" },
      include: {
        service: {
          select: {
            id: true,
            price: true,
            duration: true,
            description: true,
            category: { select: { id: true, name: true } },
            subcategory: { select: { id: true, name: true } },
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return res.json({ bookings });
  } catch (err) {
    console.error("getCustomerBookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
