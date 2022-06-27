const { ObjectId } = require("mongodb");
const postModel = require("../model/post");

const createPost = async (req, res, next) => {
  try {
    const userData = req.user;

    let {
      title,
      location,
      image,
      status = "Waiting",
      identifyMark,
      secretInformations,
      createdAt = Date.now(),
      updatedAt = Date.now(),
    } = req.body;

    const newPost = await postModel.create({
      title: title,
      location: location,
      image: image,
      status: status,
      identifyMark: identifyMark,
      secretInformations: secretInformations,
      createdAt: createdAt,
      updatedAt: updatedAt,
      user: Object(`${userData._id}`),
    });
    return res.status(200).send({
      message: "post created successfully",
      data: newPost,
    });
  } catch (error) {
    console.log(error);
  }
};

const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    let { title, location, image, identifyMark, secretInformations } = req.body;

    const post = await postModel.findOne({
      _id: postId,
      status: "Waiting",
    });
    console.log(post);
    if (post) {
      await postModel
        .updateOne({
          title: title,
          location: location,
          image: image,
          identifyMark: identifyMark,
          secretInformations: secretInformations,
          updatedAt: Date.now(),
        })
        .where("_id", new ObjectId(postId));
    } else {
      return res.status(200).send({
        message: "Only update post in Waiting status",
      });
    }

    return res.status(200).send({
      message: "post updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllPosts = async (req, res) => {
  try {
    const values = req.body.searchValue;
    // let { status = "Waiting" } = req.body.status;
    let data;
    // console.log(status);
    if (values) {
      data = await postModel
        .find({ title: { $regex: values } /*, status: { $in: status }*/ })
        .populate("user");

      console.log("data");
    }
    if (!values) {
      console.log("data");
      data = await postModel.find({}).populate("user");
    }

    return res.status(200).send({
      messages: "successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const getOne = async (req, res) => {
  try {
    const { postId } = req.params;
    const data = await postModel.aggregate([
      { $match: { _id: new ObjectId(postId) } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "users",
        },
      },
    ]);

    console.log(data);
    return res.status(200).send({
      message: "successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const approvePostByAdmin = async (req, res) => {
  try {
    const { postId } = req.params;
    // console.log(postId);
    const approvePost = await postModel.findOne({
      status: "Waiting",
      _id: postId,
    });
    // console.log(approvePost);
    if (approvePost) {
      await postModel
        .updateOne({
          status: "Approved",
        })
        .where("_id", postId);
    }
    return res.status(200).send({
      messages: "successfully",
      data: approvePost,
    });
  } catch (error) {
    console.log(error);
  }
};

const updateStatusToFoundByUser = async (req, res) => {
  try {
    const { postId } = req.params;
    const updateStatus = await postModel.findOne({
      status: "Approved",
      _id: postId,
    });
    // console.log(updateStatus);
    if (updateStatus) {
      await postModel
        .updateOne({
          status: "Found",
        })
        .where("_id", postId);
    }

    return res.status(200).send({
      messages: "successfully",
      data: "updated",
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  createPost,
  editPost,
  getAllPosts,
  getOne,
  approvePostByAdmin,
  updateStatusToFoundByUser,
};
