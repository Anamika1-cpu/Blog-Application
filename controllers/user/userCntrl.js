const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../../config/database/token/generateToken");
const User = require("../../models/user/User");
const validateMongodbId = require("../../utils/validateMongoDbId");

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

exports.fetchAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.json(err);
  }
});

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
