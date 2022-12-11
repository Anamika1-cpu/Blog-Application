const express = require("express");
const {
  userRegister,
  loginUser,
  fetchAllUsers,
  deleteUser,
  fetchSingleUser,
  userProfile,
  updateUser,
  updateUserPassword,
  followingUser,
  unfollowingUser,
  blockUser,
  unblockUser,
  generateVeificationToken,
  profilePhotoUploadCtrl,
} = require("../../controllers/user/userCntrl");
const authMiddleware = require("../../middlewares/error/auth/authMiddleware");
const {
  profilePhotoUpload,
  profilePhotoResize,
} = require("../../middlewares/error/uploads/profilePhoto");

const router = express.Router();

router.post("/register", userRegister);

router.post("/login", loginUser);
router.put(
  "/profilePhoto-upload",
  authMiddleware,
  profilePhotoUpload.single("image"),
  profilePhotoResize,
  profilePhotoUploadCtrl
);

router.get("/", authMiddleware, fetchAllUsers);

router.delete("/:id", deleteUser);

router.get("/:id", fetchSingleUser);

router.put("/:id", authMiddleware, updateUser);

router.patch("/password", authMiddleware, updateUserPassword);

router.get("/profile/:id", authMiddleware, userProfile);

router.patch("/follow", authMiddleware, followingUser);

router.patch("/unfollow", authMiddleware, unfollowingUser);

router.put("/block-user/:id", authMiddleware, blockUser);

router.put("/unblock-user/:id", authMiddleware, unblockUser);

router.patch("/send-email", authMiddleware, generateVeificationToken);
module.exports = router;
