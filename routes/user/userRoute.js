const express = require("express");
const {
  userRegister,
  loginUser,
  fetchAllUsers,
  deleteUser,
  fetchSingleUser,
} = require("../../controllers/user/userCntrl");

const router = express.Router();

router.post("/register", userRegister);

router.post("/login", loginUser);

router.get("/", fetchAllUsers);

router.delete("/:id", deleteUser);

router.get("/:id", fetchSingleUser);

module.exports = router;
