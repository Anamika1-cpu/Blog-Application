const expressAsyncHandler = require("express-async-handler");
const Category = require("../../models/category/Category");

exports.createCategory = expressAsyncHandler(async (req, res) => {
  console.log(req.user);
  try {
    const category = await Category.create({
      user: req?.user?._id,
      title: req?.body?.title,
    });
    res.json(category);
  } catch (err) {
    res.json(err);
  }
});
