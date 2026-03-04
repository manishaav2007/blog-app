import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../context/AuthContext';
import { categories as defaultCategories, posts as defaultPosts } from '../data';
import './Home.css';


const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [animate, setAnimate] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { getPosts } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Get search query from URL
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    if (query) {
      setSearchQuery(query);
    }
  }, [location]);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // Filter posts based on search query and category
    if (posts.length > 0) {
      let filtered = posts;

      // Apply category filter
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(post => post.category === selectedCategory);
      }

      // Apply search filter
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredPosts(filtered);
    }
  }, [posts, selectedCategory, searchQuery]);

  const loadPosts = () => {
    setLoading(true);
    try {
      // Get all posts (predefined + user posts)
      const allPosts = getPosts();
      
      // Sort by date (newest first)
      const sortedPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setAnimate(true);
    setSelectedCategory(category);
    setTimeout(() => setAnimate(false), 500);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'All': '#95E1D3',
      'Campus Life': '#FF6B6B',
      'Academics': '#4ECDC4',
      'Food': '#FFE66D',
      'Career': '#A8E6CF'
    };
    return colors[category] || '#95E1D3';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading amazing posts...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="hero-section animate__animated animate__fadeInDown">
        <h1 className="page-title">
          Welcome to College Blog
        </h1>
        <p className="page-subtitle">
          Discover amazing stories from your campus community
        </p>
        
        {/* Search Results Info */}
        {searchQuery && (
          <div className="search-info">
            <span className="search-info-icon">🔍</span>
            <span className="search-info-text">
              Showing results for "{searchQuery}"
            </span>
            <button 
              className="search-info-clear"
              onClick={() => {
                setSearchQuery('');
                window.history.pushState({}, '', '/');
              }}
            >
              ✕ Clear
            </button>
          </div>
        )}

        <div className="hero-stats">
          <span className="stat-badge">
            <span className="stat-icon">📝</span>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'Post' : 'Posts'}
          </span>
          <span className="stat-badge">
            <span className="stat-icon">👥</span>
            500+ Readers
          </span>
          <span className="stat-badge">
            <span className="stat-icon">💬</span>
            {posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)} Comments
          </span>
        </div>
      </div>

      <div className="categories-section">
        <h3 className="categories-title animate__animated animate__fadeInUp">
          Browse Categories
        </h3>
        <div className="categories-container">
          {defaultCategories.map((category, index) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              style={{
                backgroundColor: selectedCategory === category ? getCategoryColor(category) : '#f8f9fa',
                color: selectedCategory === category ? 'white' : '#333',
                border: selectedCategory === category ? 'none' : '2px solid #e0e0e0',
                animation: `fadeIn 0.3s ease-out ${index * 0.1}s`
              }}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
              {selectedCategory === category && (
                <span className="category-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <div className={`posts-grid ${animate ? 'fade-animation' : ''}`}>
          {filteredPosts.map((post, index) => (
            <div 
              key={post.id}
              className="post-wrapper animate__animated animate__fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <div className="no-posts animate__animated animate__fadeIn">
          <div className="no-posts-content">
            <span className="no-posts-emoji">
              {searchQuery ? '🔍' : '😢'}
            </span>
            <h3>
              {searchQuery ? 'No Results Found' : 'No Posts Found'}
            </h3>
            <p>
              {searchQuery 
                ? `No posts match "${searchQuery}" in ${selectedCategory === 'All' ? 'all categories' : selectedCategory}.`
                : `No posts available in the "${selectedCategory}" category.`}
            </p>
            {searchQuery ? (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSearchQuery('');
                 window.history.pushState({}, '', '/#/');
                }}
              >
                Clear Search
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => handleCategoryChange('All')}
              >
                View All Posts
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;