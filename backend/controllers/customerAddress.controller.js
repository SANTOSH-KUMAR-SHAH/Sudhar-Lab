// backend/controllers/customerAddress.controller.js

const prisma = require("../utils/db");

/**
 * GET all addresses for the logged-in customer
 * GET /api/customers/addresses
 */
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    return res.json({ addresses });
  } catch (err) {
    console.error("getAddresses error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * CREATE address
 * POST /api/customers/addresses
 *
 * Body:
 *  { street, city, state, pincode, latitude?, longitude?, type? }
 */
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, pincode, latitude, longitude, type } = req.body;

    if (!street || !city || !state || !pincode) {
      return res.status(400).json({ message: "street, city, state and pincode are required" });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        street,
        city,
        state,
        pincode,
        latitude: typeof latitude !== "undefined" ? Number(latitude) : null,
        longitude: typeof longitude !== "undefined" ? Number(longitude) : null,
        type: type || "HOME",
      },
    });

    return res.status(201).json({ address: newAddress });
  } catch (err) {
    console.error("createAddress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE address
 * PUT /api/customers/addresses/:id
 */
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { street, city, state, pincode, latitude, longitude, type } = req.body;

    const addr = await prisma.address.findUnique({ where: { id: addressId } });
    if (!addr) return res.status(404).json({ message: "Address not found" });
    if (addr.userId !== userId) return res.status(403).json({ message: "Not allowed" });

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        street: street ?? undefined,
        city: city ?? undefined,
        state: state ?? undefined,
        pincode: pincode ?? undefined,
        latitude: typeof latitude !== "undefined" ? Number(latitude) : undefined,
        longitude: typeof longitude !== "undefined" ? Number(longitude) : undefined,
        type: type ?? undefined,
      },
    });

    return res.json({ address: updated });
  } catch (err) {
    console.error("updateAddress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE address
 * DELETE /api/customers/addresses/:id
 */
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const addr = await prisma.address.findUnique({ where: { id: addressId } });
    if (!addr) return res.status(404).json({ message: "Address not found" });
    if (addr.userId !== userId) return res.status(403).json({ message: "Not allowed" });

    await prisma.address.delete({ where: { id: addressId } });

    return res.json({ message: "Address deleted" });
  } catch (err) {
    console.error("deleteAddress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
