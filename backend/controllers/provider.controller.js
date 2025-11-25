const prisma = require("../utils/db");
const { generateToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");

exports.becomeProvider = async (req, res) => {
    try {
        const userId = req.user.id;
    // Update user role to PROVIDER (or BOTH if desired)
    await prisma.user.update({
      where: { id: userId },
      data: { role: "PROVIDER" }
    });

    // If provider profile already exists, return it (idempotent)
    let profile = await prisma.providerProfile.findUnique({ where: { userId } });

    if (!profile) {
      profile = await prisma.providerProfile.create({
        data: {
          userId,
          bio: null,
          experience: null,
          isVerified: false,
        }
      });
    }

    // Fetch latest user data to include in token
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Generate a fresh token so the client's token reflects new role
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Set httpOnly cookie similar to login controller
    res.cookie("token", token, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      // domain: process.env.NODE_ENV === 'production' ? 'localhelpbackendv2.onrender.com' : 'localhost',
      maxAge: 3600000,
    });

    return res.status(200).json({ 
      message: "User upgraded to provider successfully",
      token,
      profile
    });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getProviderProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        services: {
          include: {
            category: true,
            subcategory: true,
          }
        }
      }
    });

    if (!profile) return res.status(404).json({ message: "Provider not found" });

    res.json({ profile });
  } catch (err) {
    console.error("getProviderProfile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Provider services
exports.getProviderServices = async (req, res) => {
  try {
    const { id } = req.params;

    const services = await prisma.providerService.findMany({
      where: { providerId: id },
      include: {
        category: true,
        subcategory: true
      }
    });

    res.json({ services });
  } catch (err) {
    console.error("getProviderServices error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

