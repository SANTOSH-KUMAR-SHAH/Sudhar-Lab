
const prisma = require("../utils/db");

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { subcategories: true, services: true } },
        subcategories: {
          take: 3,
          select: { id: true, name: true }
        }
      }
    });

    res.json({ categories });
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        subcategories: {
          include: {
            services: {
              where: {
                provider: {
                  isAvailable: true,
                  applicationStatus: "APPROVED"
                }
              },
              include: {
                provider: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ category });
  } catch (err) {
    console.error("getCategoryById error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProvidersByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const services = await prisma.providerService.findMany({
      where: {
        categoryId: id,
        provider: {
          isAvailable: true,
          applicationStatus: "APPROVED"
        }
      },
      include: {
        provider: {
          include: { user: true }
        },
        category: true,
      }
    });

    res.json({ services });
  } catch (err) {
    console.error("getProvidersByCategory error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await prisma.serviceSubCategory.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        categoryId: true,
      },
    });

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    return res.json({ subcategory });
  } catch (err) {
    console.log("getSubcategoryById error:", err);
    return res.status(500).json({ message: "Server error", err: err.message });
  }
};
