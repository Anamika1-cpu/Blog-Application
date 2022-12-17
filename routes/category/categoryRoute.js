const express = require("express");
const { createCategory } = require("../../controllers/category/Category");
const router = express.Router();

router.post("/", createCategory);

module.exports = router;
