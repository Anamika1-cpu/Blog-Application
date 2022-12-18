const express = require("express");
const {
  createCategory,
  fetchAllCategories,
  updateCategory,
  deleteCategory,
} = require("../../controllers/category/Category");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createCategory);

router.get("/", authMiddleware, fetchAllCategories);

router.get("/:id", authMiddleware, fetchAllCategories);

router.put("/:id", authMiddleware, updateCategory);

router.delete("/:id", authMiddleware, deleteCategory);

module.exports = router;
