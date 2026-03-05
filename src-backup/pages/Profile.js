import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { posts } from '../data';
import './PostDetails.css';


const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/post/${id}`, message: 'Please login to view post details' } });
      return;
    }

    const foundPost = posts.find(p => p.id === parseInt(id));
    if (foundPost) {
      setPost(foundPost);
      setComments(foundPost.comments);
      setLikes(foundPost.likes);
    }
  }, [id, currentUser, navigate]);

  const handleLike = () => {
    setLikes(prev => prev + 1);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      user: currentUser.name,
      text: newComment,
      date: new Date().toISOString().split('T')[0]
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  if (!post) {
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
            <button type="submit" className="btn btn-primary comment-submit-btn">
              Post Comment
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