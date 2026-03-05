import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BlogCard.css';

const BlogCard = ({ post }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleViewDetails = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/post/${post.id}`, message: 'Please login to view post details' } });
    } else {
      navigate(`/post/${post.id}`);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Campus Life': '#FF6B6B',
      'Academics': '#4ECDC4',
      'Food': '#FFE66D',
      'Career': '#A8E6CF',
      'default': '#95E1D3'
    };
    return colors[category] || colors.default;
  };

  return (
    <div className="blog-card animate__animated animate__fadeInUp">
      <div className="blog-image-container">
        {post.image && <img src={post.image} alt={post.title} className="blog-image" />}
        <span className="blog-category" style={{ backgroundColor: getCategoryColor(post.category) }}>
          {post.category}
        </span>
      </div>
      <div className="blog-content">
        <h2 className="blog-title">{post.title}</h2>
        <p className="blog-author">By {post.author} | {post.date}</p>
        <p className="blog-preview">{post.content.substring(0, 120)}...</p>
        <div className="blog-stats">
          <span className="likes">❤️ {post.likes} likes</span>
          <span className="comments">💬 {post.comments.length} comments</span>
        </div>
        <button onClick={handleViewDetails} className="btn btn-primary view-details-btn">
          View Details
        </button>
      </div>
    </div>
  );
};

export default BlogCard;