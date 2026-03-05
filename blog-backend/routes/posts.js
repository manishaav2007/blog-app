const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET all posts (public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username profilePic')
      .populate('likes', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE post (authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({
      title,
      content,
      author: req.userId
    });
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePic');
    
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LIKE/UNLIKE post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const hasLiked = post.likes.includes(req.userId);
    
    if (hasLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.userId);
      post.likeCount -= 1;
    } else {
      // Like
      post.likes.push(req.userId);
      post.likeCount += 1;
      
      // Create notification (if not liking own post)
      if (post.author.toString() !== req.userId) {
        const notification = new Notification({
          recipient: post.author,
          sender: req.userId,
          type: 'like',
          post: post._id
        });
        await notification.save();
      }
    }
    
    await post.save();
    res.json({ likeCount: post.likeCount, liked: !hasLiked });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;