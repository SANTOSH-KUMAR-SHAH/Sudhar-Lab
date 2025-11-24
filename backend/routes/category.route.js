const router = require("express").Router();
const {
  getCategories,
  getCategoryById,
  getProvidersByCategory,
} = require("../controllers/category.controller");

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/:id/providers", getProvidersByCategory);

module.exports = router;
