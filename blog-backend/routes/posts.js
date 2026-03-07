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
      .populate('author', 'username email profilePic')
      .populate('likes', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single post by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email profilePic')
      .populate('likes', 'username');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CREATE post (authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, image } = req.body;
    const post = new Post({
      title,
      content,
      category: category || 'Campus Life',
      image: image || '',
      author: req.userId
    });
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username email profilePic');
    
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
      post.likeCount = Math.max(0, post.likeCount - 1);
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

// DELETE post (only author)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;