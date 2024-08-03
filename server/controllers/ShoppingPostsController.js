import mongoose from "mongoose";
import ShoppingDay from "../models/ShoppingPostModel.js";
import User from "../models/UserModel.js";

/************************************ Get All Posts ************************************/

// extract string to "DD/MM/YYYY"
const parseDateComponents = (dateStr) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return { day, month, year };
};

// Compare 2 dates and returns oldest one
const compareDates = (post1, post2) => {
  const { day: d1, month: m1, year: y1 } = parseDateComponents(post1.date);
  const { day: d2, month: m2, year: y2 } = parseDateComponents(post2.date);

  if (y1 !== y2) return y1 - y2; // Compare years
  if (m1 !== m2) return m1 - m2; // Compare months
  return d1 - d2; // Compare days
};

const getPosts = async (req, res) => {
  try {
    // Grab all the posts from DB
    const posts = await ShoppingDay.find();
    posts.sort(compareDates);
    for (const post of posts) {
      post.shoppingList.sort((a, b) => b.priorityColor - a.priorityColor);
    }
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


/************************************ Create New ShoppingDay ************************************/
const addDate = async (req, res) => {
  // Grab the data from request body
  const { date, name } = req.body;

  // Check the fields are not empty
  if (!date || !name) {
    return res.status(400).json({ error: "Date are required" });
  }

  try {
    await ShoppingDay.create({ date: date, name: name, shoppingList: [] });
    res.status(200).json({ msg: date + " shopping date created." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/************************************ Create New ShoppingDay ************************************/
const updateDateItem = async (req, res) => {
  // Grab the data from request body
  const { shoppingListId, name, date } = req.body;

  // Check the fields are not empty
  if (!name || !date || !shoppingListId) {
    return res.status(400).json({ error: "name and date are required" });
  }

  try {
    await ShoppingDay.findByIdAndUpdate(
      shoppingListId,
      { name: name,
        date: date
       }
    );
    res.status(200).json({ msg: name + " shopping list updated." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


/************************************ Create New ShoppingDay ************************************/
const addPost = async (req, res) => {
  // Grab the data from request body
  const { title, count, shoppingListId, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title || !count || !shoppingListId || priorityColor === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Find the authenticated user using the user id provided by request object
  const user = await User.findById(req.user._id);

  try {
    // find shoppingDayList
    const shoppingDayList = await ShoppingDay.findOne({ _id: shoppingListId });

    if (shoppingDayList === undefined || shoppingDayList === null) {
      res.status(500).json({ msg: "no shoppingList found with this id" });
      return;
    }

    const shoppingDay = {
      user: user._id,
      username: user.name,
      title: title,
      count: count,
      priorityColor: priorityColor
    }

    shoppingDayList.shoppingList.push(shoppingDay);
    shoppingDayList.save();

    res.status(200).json({ msg: title + " shopping post created." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/************************************ Delete ShoppingDay ************************************/
const deletePost = async (req, res) => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: "Incorrect ID" });
  }

  const shoppingDayList = await ShoppingDay.findOne({
    shoppingList: {
      $elemMatch: { _id: req.params.id }
    }
  });

  if (shoppingDayList === undefined || shoppingDayList === null) {
    return res.status(400).json({ msg: "shopping list not found with this id" });
  }

  const shoppingPostIndex = shoppingDayList.shoppingList.findIndex((shoppingItem) => shoppingItem._id.equals(new mongoose.Types.ObjectId(req.params.id)));
  if (shoppingPostIndex === -1) {
    return res.status(400).json({ msg: "shopping post not found with this id" });
  }

  try {
    shoppingDayList.shoppingList.splice(shoppingPostIndex, 1);
    if (shoppingDayList.shoppingList.length > 0) {
      await shoppingDayList.save();
    } else {
      await shoppingDayList.deleteOne();
    }
    res.status(200).json({ msg: "shopping post was deleted." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/************************************ Delete all ShoppingDay ************************************/
const deletePosts = async (req, res) => {
  try {
    await ShoppingDay.deleteOne({ _id: req.params.id });
    res.status(200).json({ msg: "All shopping posts at this date were deleted." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/************************************ Update ShoppingDay ************************************/
const updatePost = async (req, res) => {
  // Grab the data from request body
  const { title, count, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title || !count || priorityColor === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Incorrect ID" });
  }

  const shoppingDayList = await ShoppingDay.findOne({
    shoppingList: {
      $elemMatch: { _id: req.params.id }
    }
  });

  if (shoppingDayList === undefined || shoppingDayList === null) {
    return res.status(400).json({ msg: "shopping list not found with this id" });
  }

  const shoppingPostIndex = shoppingDayList.shoppingList.findIndex((shoppingItem) => shoppingItem._id.equals(new mongoose.Types.ObjectId(req.params.id)));
  if (shoppingPostIndex === -1) {
    return res.status(400).json({ msg: "shopping post not found with this id" });
  }

  const user = await User.findById(req.user._id);

  const shoppingDay = {
    id: req.params.id,
    user: user._id,
    username: user.name,
    title: title,
    count: count,
    priorityColor: priorityColor
  }

  try {
    shoppingDayList.shoppingList.splice(shoppingPostIndex, 1);
    shoppingDayList.shoppingList.push(shoppingDay);
    await shoppingDayList.save();
    res.status(200).json({ success: title + " shopping post was updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getPosts, addDate, updateDateItem, addPost, deletePost, deletePosts, updatePost };
