import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout, getUserPosts, deletePost, restorePost, clearDeletedHistory, getDeletedPosts } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Profile data
  const [userBio, setUserBio] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [userMajor, setUserMajor] = useState('');
  const [userYear, setUserYear] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [coverPicture, setCoverPicture] = useState('');

  // Available years for dropdown
  const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

  // Function to generate a consistent color based on user's name
  const getAvatarColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF9F1C',
      '#9B59B6', '#3498DB', '#E74C3C', '#1ABC9C', '#F39C12',
      '#2ECC71', '#E67E22', '#27AE60', '#C0392B', '#8E44AD'
    ];
    
    // Simple hash function to get consistent color for same name
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    loadUserData();
    loadUserProfile();
    loadDeletedPosts();
  }, [currentUser, navigate]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user's posts from backend (via context helper)
      const posts = await getUserPosts(currentUser.email);
      setUserPosts(posts);
      setFilteredPosts(posts);

      // Load notifications from localStorage
      const savedNotifications = localStorage.getItem(`notifications_${currentUser.email}`);
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeletedPosts = () => {
    const deleted = getDeletedPosts();
    // Filter only posts deleted by current user
    const userDeleted = deleted.filter(post => post.deletedBy === currentUser?.email);
    setDeletedPosts(userDeleted);
  };

  const loadUserProfile = () => {
    // Load user profile data from localStorage
    const userProfile = JSON.parse(localStorage.getItem(`profile_${currentUser.email}`) || '{}');
    setUserBio(userProfile.bio || '');
    setUserLocation(userProfile.location || '');
    setUserMajor(userProfile.major || '');
    setUserYear(userProfile.year || '');
    setProfilePicture(userProfile.profilePicture || '');
    setCoverPicture(userProfile.coverPicture || '');
  };

  const saveUserProfile = () => {
    const profileData = {
      bio: userBio,
      location: userLocation,
      major: userMajor,
      year: userYear,
      profilePicture: profilePicture,
      coverPicture: coverPicture
    };
    localStorage.setItem(`profile_${currentUser.email}`, JSON.stringify(profileData));
    setEditMode(false);
    alert('Profile updated successfully! ✨');
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePost(postToDelete.id);
      setUserPosts(userPosts.filter(p => p.id !== postToDelete.id));
      setShowDeleteModal(false);
      setPostToDelete(null);
      loadDeletedPosts(); // Refresh deleted posts
    }
  };

  const handleRestore = (post) => {
    restorePost(post.id);
    setDeletedPosts(deletedPosts.filter(p => p.id !== post.id));
    loadUserData(); // Refresh user posts
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your deleted posts history? This action cannot be undone.')) {
      clearDeletedHistory();
      setDeletedPosts([]);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem(`notifications_${currentUser.email}`, JSON.stringify([]));
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${currentUser.email}`, JSON.stringify(updated));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      default:
        return '📢';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getYearColor = (year) => {
    const colors = {
      'Freshman': '#4ECDC4',
      'Sophomore': '#FFE66D',
      'Junior': '#FF6B6B',
      'Senior': '#A8E6CF',
      'Graduate': '#667EEA'
    };
    return colors[year] || '#95E1D3';
  };

  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalComments = userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
  const avatarColor = getAvatarColor(currentUser.name);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Cover Photo */}
      <div className="profile-cover" style={{ backgroundImage: coverPicture ? `url(${coverPicture})` : 'none' }}>
        <div className="cover-gradient" style={{ display: coverPicture ? 'none' : 'block' }}></div>
        {editMode && (
          <div className="cover-upload-btn">
            <label htmlFor="cover-upload" className="upload-label">
              <span className="upload-icon">📷</span>
              Change Cover
            </label>
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              onChange={handleCoverPictureUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-wrapper">
          <div 
            className="profile-avatar" 
            style={{ 
              backgroundImage: profilePicture ? `url(${profilePicture})` : 'none',
              backgroundColor: !profilePicture ? avatarColor : 'transparent'
            }}
          >
            {!profilePicture && currentUser.name.charAt(0).toUpperCase()}
          </div>
          {editMode && (
            <div className="avatar-upload-btn">
              <label htmlFor="avatar-upload" className="upload-label">
                ✏️
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}
          {!editMode && (
            <button className="btn-edit-profile" onClick={() => setEditMode(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        <div className="profile-header-info">
          <h1 className="profile-name">{currentUser.name}</h1>
          <p className="profile-email">{currentUser.email}</p>
          
          {!editMode ? (
            <>
              <p className="profile-bio">{userBio || "No bio yet. Click edit to add one! ✨"}</p>
              <div className="profile-details">
                {userLocation && (
                  <span className="detail-item">
                    <span className="detail-icon">📍</span> {userLocation}
                  </span>
                )}
                {userMajor && (
                  <span className="detail-item">
                    <span className="detail-icon">📚</span> {userMajor}
                  </span>
                )}
                {userYear && (
                  <span className="detail-item">
                    <span className="detail-icon">🎓</span> 
                    <span className="year-badge" style={{ backgroundColor: getYearColor(userYear) }}>
                      {userYear}
                    </span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="profile-edit-form">
              <textarea
                placeholder="Tell us about yourself..."
                value={userBio}
                onChange={(e) => setUserBio(e.target.value)}
                className="bio-input"
                rows="3"
              />
              <div className="edit-fields">
                <input
                  type="text"
                  placeholder="Location"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="edit-input"
                />
                <input
                  type="text"
                  placeholder="Major/Department"
                  value={userMajor}
                  onChange={(e) => setUserMajor(e.target.value)}
                  className="edit-input"
                />
                <select
                  value={userYear}
                  onChange={(e) => setUserYear(e.target.value)}
                  className="edit-select"
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="edit-actions">
                <button onClick={saveUserProfile} className="btn-save">Save Changes</button>
                <button onClick={() => setEditMode(false)} className="btn-cancel">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <span className="stat-value">{userPosts.length}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{totalLikes}</span>
            <span className="stat-label">Likes</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💬</span>
            <span className="stat-value">{totalComments}</span>
            <span className="stat-label">Comments</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🗑️</span>
            <span className="stat-value">{deletedPosts.length}</span>
            <span className="stat-label">Deleted</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="btn-action btn-notification"
          >
            <span className="btn-icon">🔔</span>
            Notifications
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          <button onClick={() => navigate('/create-post')} className="btn-action btn-create">
            <span className="btn-icon">✍️</span>
            Create Post
          </button>
          <button onClick={handleLogout} className="btn-action btn-logout">
            <span className="btn-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>
              <span className="header-icon">🔔</span>
              Notifications
              {unreadCount > 0 && <span className="unread-count">{unreadCount} new</span>}
            </h3>
            <div className="notification-actions">
              {notifications.length > 0 && (
                <button onClick={clearAllNotifications} className="btn-clear-all">
                  Clear All
                </button>
              )}
              <button onClick={() => setShowNotifications(false)} className="btn-close">
                ✕
              </button>
            </div>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notif-emoji">🔔</span>
                <h4>No Notifications Yet</h4>
                <p>When someone likes or comments on your posts, you'll see it here!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  {!notification.read && <span className="notification-dot"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <span className="tab-icon">📝</span>
          My Posts
          <span className="tab-count">{userPosts.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <span className="tab-icon">📊</span>
          Activity
          <span className="tab-count">{notifications.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">🗑️</span>
          Deleted History
          <span className="tab-count">{deletedPosts.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* My Posts Tab */}
        {activeTab === 'posts' && (
          <div className="my-posts">
            <div className="posts-header">
              <h3>Your Posts ({userPosts.length})</h3>
              <button onClick={() => navigate('/create-post')} className="btn-create-small">
                + New Post
              </button>
            </div>

            {userPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3>No Posts Yet</h3>
                <p>Start sharing your stories with the campus community!</p>
                <button onClick={() => navigate('/create-post')} className="btn btn-primary">
                  ✨ Create Your First Post
                </button>
              </div>
            ) : (
              <div className="posts-grid">
                {userPosts.map((post, index) => (
                  <div key={post.id} className="post-card">
                    <div className="post-card-image">
                      <img src={post.image} alt={post.title} />
                      <span className="post-category" style={{
                        backgroundColor: post.category === 'Campus Life' ? '#FF6B6B' :
                                      post.category === 'Academics' ? '#4ECDC4' :
                                      post.category === 'Food' ? '#FFE66D' : '#A8E6CF'
                      }}>{post.category}</span>
                      <button 
                        className="post-delete-btn"
                        onClick={() => handleDeleteClick(post)}
                        title="Delete post"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="post-card-content">
                      <h4>{post.title}</h4>
                      <p className="post-date">{post.date}</p>
                      <p className="post-excerpt">{post.content.substring(0, 80)}...</p>
                      <div className="post-meta">
                        <span>❤️ {post.likes || 0}</span>
                        <span>💬 {post.comments?.length || 0}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="btn-view-post"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="activity-feed">
            <h3>Activity Feed</h3>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No Activity Yet</h3>
                <p>Your activity feed will show likes and comments on your posts</p>
              </div>
            ) : (
              <div className="activity-list">
                {notifications.map((activity, index) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon" style={{
                      background: activity.type === 'like' ? '#FF6B6B' : '#4ECDC4'
                    }}>
                      {getNotificationIcon(activity.type)}
                    </div>
                    <div className="activity-details">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deleted History Tab */}
        {activeTab === 'history' && (
          <div className="deleted-history">
            <div className="history-header">
              <h3>
                <span className="history-icon">🗑️</span>
                Deleted Posts History
              </h3>
              {deletedPosts.length > 0 && (
                <button className="btn-clear-history" onClick={handleClearHistory}>
                  🧹 Clear History
                </button>
              )}
            </div>

            {deletedPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗑️</div>
                <h3>No Deleted Posts</h3>
                <p>When you delete posts, they'll appear here</p>
              </div>
            ) : (
              <div className="deleted-posts-list">
                {deletedPosts.map((post) => (
                  <div key={post.id} className="deleted-post-item">
                    <div className="deleted-post-info">
                      <img src={post.image} alt={post.title} className="deleted-post-image" />
                      <div className="deleted-post-details">
                        <h4>{post.title}</h4>
                        <p>Deleted: {new Date(post.deletedAt).toLocaleDateString()}</p>
                        <p>❤️ {post.likes} • 💬 {post.comments?.length || 0}</p>
                      </div>
                    </div>
                    <button className="btn-restore" onClick={() => handleRestore(post)}>
                      ↩️ Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-icon">🗑️</div>
            <h3>Delete Post?</h3>
            <p>Are you sure you want to delete "{postToDelete.title}"?</p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon">🚪</div>
            <h3>Logout?</h3>
            <p>Are you sure you want to logout from your account?</p>
            <div className="logout-modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Stay
              </button>
              <button className="btn-logout-confirm" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;