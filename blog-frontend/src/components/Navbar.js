import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home with search query
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">College Blog</span>
          </Link>
          {currentUser && (
            <span className="nav-welcome">
              👋 Welcome, {currentUser.name}!
            </span>
          )}
        </div>
        
        <button className="mobile-menu-btn" onClick={() => document.querySelector('.nav-menu').classList.toggle('show')}>
          ☰
        </button>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              <span className="nav-icon">🏠</span>
              Home
            </Link>
          </li>
          
          {currentUser ? (
            <>
              <li className="nav-item">
                <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                  <span className="nav-icon">👤</span>
                  Profile
                </Link>
              </li>
              <li className="nav-item">
               <Link to="/create" className={`nav-link ${isActive('/create')}`}>
                  <span className="nav-icon">✍️</span>
                  Create Post
                </Link>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                <span className="nav-icon">🔐</span>
                Login
              </Link>
            </li>
          )}

          {/* Search Button */}
          <li className="nav-item search-item">
            <button 
              className="nav-link search-btn"
              onClick={() => setShowSearch(!showSearch)}
            >
              <span className="nav-icon">🔍</span>
              Search
            </button>
            
            {/* Search Dropdown */}
            {showSearch && (
              <div className="search-dropdown">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input-nav"
                    autoFocus
                  />
                  <button type="submit" className="search-submit">Search</button>
                </form>
                <div className="search-tips">
                  <p>🔍 Search by title, content, or category</p>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;