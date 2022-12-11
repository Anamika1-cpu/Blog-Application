const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../../config/database/token/generateToken");
const User = require("../../models/user/User");
const validateMongodbId = require("../../utils/validateMongoDbId");
const sgMail = require("@sendgrid/mail");
const { cloudinaryUploadImage } = require("../../utils/cloudinary");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//--------------------------------------//
//-------PROFILE PHOTO UPLOAD--------------//
//--------------------------------------//

exports.profilePhotoUploadCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  //1.Get the path to image
  const localPath = `public/images/profile/${req.file.filename}`;
  //2.Upload to cloudinary
  const imageUpload = await cloudinaryUploadImage(localPath);
  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imageUpload?.url,
    },
    {
      new: true,
    }
  );
  res.json(foundUser);
});
//--------------------------------------//
//-------REGISTER USER-----------------//
//--------------------------------------//
exports.userRegister = expressAsyncHandler(async (req, res, next) => {
  const userExists = await User.findOne({ email: req?.body?.email });
  if (userExists) return next(new Error("User already exists"));
  try {
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    return res.json(user);
  } catch (err) {
    return res.json(err);
  }
});

//--------------------------------------//
//-------LOGIN USER-----------------//
//--------------------------------------//
exports.loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userFound = await User.findOne({ email });

  //Check if password is matched
  if (userFound && (await userFound.isPasswordMatched(password))) {
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
});

//--------------------------------------//
//-------FETCH ALL USERS-----------------//
//--------------------------------------//
exports.fetchAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.json(err);
  }
  console.log(req.headers);
});

//--------------------------------------//
//-------DELETE USER-----------------//
//--------------------------------------//
exports.deleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const user = await User.findByIdAndDelete(id);
    res.json("User Deleted");
  } catch (err) {
    res.json(err);
  }
});

//--------------------------------------//
//-------FETCH SINGLE USER-----------------//
//--------------------------------------//
exports.fetchSingleUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (err) {
    res.json(err);
  }
});

//--------------------------------------//
//-------USER PROFILE-----------------//
//--------------------------------------//
exports.userProfile = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (err) {
    res.json(err);
  }
});

//--------------------------------------//
//-------UPDATE USER PROFILE-----------------//
//--------------------------------------//

exports.updateUser = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  validateMongodbId(_id);

  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
});

//--------------------------------------//
//-------UPDATE USER PASSWORD-----------------//
//--------------------------------------//

exports.updateUserPassword = expressAsyncHandler(async (req, res) => {
  //destructure the login user
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  //Find the user by _id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.json("user");
  }
});

//--------------------------------------//
//-------USER FOLLOWING-----------------//
//--------------------------------------//
exports.followingUser = expressAsyncHandler(async (req, res) => {
  const { followId } = req.body;
  const loginUserId = req.user.id;

  const targetedUser = await User.findById(followId);

  const alreadyFollowing = targetedUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );

  if (alreadyFollowing) throw new Error("You have alreay followed this user");
  await User.findByIdAndUpdate(
    followId,
    {
      $push: {
        followers: loginUserId,
      },
      isFollowing: true,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: followId },
    },
    { new: true }
  );
  console.log(followId, loginUserId);

  res.json("updated");
});

//--------------------------------------//
//------- USER UFOLLOWING-----------------//
//--------------------------------------//

exports.unfollowingUser = expressAsyncHandler(async (req, res) => {
  const { unfollowId } = req.body;
  const loginUserId = req.user.id;

  await User.findByIdAndUpdate(
    unfollowId,
    {
      $pull: {
        followers: loginUserId,
      },
      isFollowing: false,
    },
    {
      new: true,
    }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: {
        following: unfollowId,
      },
    },
    {
      new: true,
    }
  );
  res.json("You have successfully unfollowed");
});

//--------------------------------------//
//------- BLOCK USER-----------------//
//--------------------------------------//

exports.blockUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    {
      new: true,
    }
  );
  res.json(user);
});

//--------------------------------------//
//------- UNBLOCK USER-----------------//
//--------------------------------------//

exports.unblockUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    {
      new: true,
    }
  );
  res.json(user);
});

//--------------------------------------//
//------- SENDEMAIL - ACCOUNT VERIFICATION-------------//
//--------------------------------------//

exports.generateVeificationToken = expressAsyncHandler(async (req, res) => {
  try {
    //build your message
    const msg = {
      to: "gourhoney26@gmail.com",
      from: "anamikagour666@gmail.com",
      subject: "verify mail message",
      text: "Check it out",
    };
    await sgMail.send(msg);
    res.json("email sent successfully");
  } catch (err) {
    res.json(err);
  }
});
