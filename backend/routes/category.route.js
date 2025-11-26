const router = require("express").Router();
const {
  getCategories,
  getCategoryById,
  getProvidersByCategory,
  getSubcategoryById
} = require("../controllers/category.controller");

router.get("/subcategory/:id", getSubcategoryById);

router.get("/:id/providers", getProvidersByCategory);

router.get("/:id", getCategoryById);

router.get("/", getCategories);

module.exports = router;
