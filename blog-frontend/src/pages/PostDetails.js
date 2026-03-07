import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PostDetails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, authToken, getPostById } = useAuth();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/post/${id}`, message: 'Please login to view post details' } });
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load post details (from cache or API via context)
        const loadedPost = await getPostById(id);
        if (loadedPost) {
          setPost(loadedPost);
          setLikes(loadedPost.likes || 0);
        }

        // Load comments from backend
        const res = await fetch(`${API_URL}/comments/post/${id}`);
        if (res.ok) {
          const data = await res.json();
          const mappedComments = data.map((c) => ({
            id: c._id,
            user: c.author?.username || 'Anonymous',
            text: c.content,
            date: new Date(c.createdAt || new Date()).toISOString().split('T')[0],
          }));
          setComments(mappedComments);
        }
      } catch (error) {
        console.error('Error loading post details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, currentUser, navigate, getPostById]);

  const handleLike = async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_URL}/posts/${id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likeCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authToken) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_URL}/comments/post/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const c = await res.json();
        const mapped = {
          id: c._id,
          user: c.author?.username || currentUser.name,
          text: c.content,
          date: new Date(c.createdAt || new Date()).toISOString().split('T')[0],
        };
        setComments((prev) => [...prev, mapped]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading || !post) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="post-details-container">
      <button onClick={() => navigate('/')} className="btn btn-secondary back-btn">
        ← Back to Home
      </button>

      <article className="post-article">
        {post.image && <img src={post.image} alt={post.title} className="post-image" />}
        
        <h1 className="post-title">{post.title}</h1>
        <p className="post-meta">
          By {post.author} | {post.date}
        </p>
        
        <div className="post-content">
          <p>{post.content}</p>
        </div>

        <div className="post-actions">
          <button onClick={handleLike} className="btn like-btn">
            ❤️ {likes} Likes
          </button>
        </div>

        <div className="comments-section">
          <h3>Comments ({comments.length})</h3>
          
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              rows="3"
            />
            <button type="submit" className="btn btn-primary comment-submit-btn" disabled={submittingComment}>
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-user">{comment.user}</span>
                  <span className="comment-date">{comment.date}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetails;