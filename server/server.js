const Post = require("./models/Post");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔴 Replace with your real password
mongoose.connect("mongodb+srv://manishaav2007_db_user:Manishaa123@cluster0.al3kuvg.mongodb.net/test?retryWrites=true&w=majority")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log("MongoDB Connection Error:");
    console.log(err);
});

app.post("/posts", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
