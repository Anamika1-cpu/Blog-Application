const expressAsyncHandler = require("express-async-handler");
const Post = require("../../models/post/Post");
const validateMongodbId = require("../../utils/validateMongoDbId");
const Filter = require("bad-words");
const User = require("../../models/user/User");
const { cloudinaryUploadImage } = require("../../utils/cloudinary");
const fs = require("fs");
//----------------------------------------------//
// POST CREATION
//----------------------------------------------//

exports.createPost = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  const filter = new Filter();
  const isProfane = filter.isProfane(req.body.title, req.body.description);
  if (isProfane) {
    await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });
    throw new Error(
      "Creating Failed because it contains profane words and you have been blocked"
    );
  }
  console.log(req.file);
  //1.Get the path to image
  const localPath = `public/images/posts/${req.file.filename}`;
  //2.Upload to cloudinary
  const imageUpload = await cloudinaryUploadImage(localPath);

  try {
    const post = await Post.create({
      ...req.body,
      image: imageUpload?.url,
      user: _id,
      title: req.body.title,
    });
    //Remove image from local public folder
    fs.unlinkSync(localPath);
    res.json(post);
  } catch (err) {
    res.json(err);
  }
});

//----------------------------------------------//
// FETCH ALL POSTS
//----------------------------------------------//
exports.fetchAllPosts = expressAsyncHandler(async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.json(err);
  }
});

//----------------------------------------------//
// FETCH SINGLE POST
//----------------------------------------------//
exports.fetchSinglePost = expressAsyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongodbId(id);
  if (validateMongodbId)
    try {
      const post = await Post.findById(id).populate("user");

      //update num of views
      await Post.findByIdAndUpdate(
        id,
        {
          $inc: {
            numViews: +1,
          },
        },
        {
          new: true,
        }
      );
      res.json(post);
    } catch (err) {
      res.json(err);
    }
});

//----------------------------------------------//
// UPDATE  POST
//----------------------------------------------//
exports.updatePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...req.body,
        user: req.user._id,
      },
      {
        new: true,
      }
    );
    res.json(post);
  } catch (err) {
    res.json(err);
  }
});

//----------------------------------------------//
// DELETE POST
//----------------------------------------------//
exports.deletePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    await Post.findByIdAndDelete(id);
    res.json("Post deleted successfully");
  } catch (err) {
    res.json(err);
  }
});
