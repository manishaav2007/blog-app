import React, { createContext, useState, useContext, useEffect } from 'react';
import { posts as predefinedPosts } from '../data';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);

  useEffect(() => {
    // Load initial data
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    // Initialize posts in localStorage if not exists
    initializePosts();
    
    // Load posts and deleted posts
    loadPosts();
    loadDeletedPosts();
    loadResetRequests();
    
    setLoading(false);
  }, []);

  const initializePosts = () => {
    // Check if posts exist in localStorage
    const existingPosts = localStorage.getItem('allPosts');
    if (!existingPosts) {
      // If not, save predefined posts to localStorage
      localStorage.setItem('allPosts', JSON.stringify(predefinedPosts));
    }
  };

  const loadPosts = () => {
    const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
    setAllPosts(posts);
  };

  const loadDeletedPosts = () => {
    const deleted = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
    setDeletedPosts(deleted);
  };

  const loadResetRequests = () => {
    const requests = JSON.parse(localStorage.getItem('resetRequests') || '[]');
    setResetRequests(requests);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("One special character");
    return errors;
  };

  const signup = (email, password, name) => {
    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      throw new Error("Password does not meet requirements");
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = existingUsers.find(u => u.email === email);
    
    if (userExists) {
      throw new Error("User already exists");
    }

    // Create new user
    const newUser = { 
      email, 
      name, 
      password,
      createdAt: new Date().toISOString(),
      posts: []
    };
    
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    // Store user without password for current session
    const userForSession = { email, name };
    localStorage.setItem('user', JSON.stringify(userForSession));
    setCurrentUser(userForSession);
    
    return userForSession;
  };

  const login = (email, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check password
    if (user.password !== password) {
      throw new Error("Incorrect password");
    }
    
    // Store user for session
    const userForSession = { email, name: user.name };
    localStorage.setItem('user', JSON.stringify(userForSession));
    setCurrentUser(userForSession);
    
    return userForSession;
  };

  // Forgot password - request reset
  const requestPasswordReset = (email) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("No account found with this email");
    }
    
    // Generate reset code (6-digit code)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date().getTime() + 15 * 60 * 1000; // 15 minutes from now
    
    // Create reset request
    const resetRequest = {
      email,
      code: resetCode,
      expiry: expiryTime,
      used: false
    };
    
    // Save reset request
    const existingRequests = JSON.parse(localStorage.getItem('resetRequests') || '[]');
    // Remove any existing requests for this email
    const filteredRequests = existingRequests.filter(req => req.email !== email);
    filteredRequests.push(resetRequest);
    localStorage.setItem('resetRequests', JSON.stringify(filteredRequests));
    setResetRequests(filteredRequests);
    
    // In a real app, you would send this code via email
    // For demo, we'll show it in an alert
    alert(`🔐 Password Reset Code: ${resetCode}\n\nThis code will expire in 15 minutes.\n\n(In a real app, this would be sent to your email.)`);
    
    return resetCode;
  };

  // Verify reset code
  const verifyResetCode = (email, code) => {
    const requests = JSON.parse(localStorage.getItem('resetRequests') || '[]');
    const request = requests.find(req => 
      req.email === email && 
      req.code === code && 
      !req.used &&
      req.expiry > new Date().getTime()
    );
    
    if (!request) {
      throw new Error("Invalid or expired reset code");
    }
    
    return true;
  };

  // Reset password
  const resetPassword = (email, code, newPassword) => {
    // Verify code again
    const requests = JSON.parse(localStorage.getItem('resetRequests') || '[]');
    const requestIndex = requests.findIndex(req => 
      req.email === email && 
      req.code === code && 
      !req.used &&
      req.expiry > new Date().getTime()
    );
    
    if (requestIndex === -1) {
      throw new Error("Invalid or expired reset code");
    }
    
    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      throw new Error("Password does not meet requirements");
    }
    
    // Update user password
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Mark reset request as used
    requests[requestIndex].used = true;
    localStorage.setItem('resetRequests', JSON.stringify(requests));
    setResetRequests(requests);
    
    return true;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Function to add a new post
  const addPost = (post) => {
    const newPost = {
      ...post,
      id: Date.now(), // Unique ID
      likes: 0,
      comments: [],
      authorEmail: currentUser?.email
    };

    // Get existing posts
    const existingPosts = JSON.parse(localStorage.getItem('allPosts') || '[]');
    
    // Add new post to the beginning of the array
    const updatedPosts = [newPost, ...existingPosts];
    
    // Save to localStorage
    localStorage.setItem('allPosts', JSON.stringify(updatedPosts));
    setAllPosts(updatedPosts);
    
    // Also save to user's posts
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(user => {
      if (user.email === currentUser?.email) {
        return {
          ...user,
          posts: [...(user.posts || []), newPost.id]
        };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    return newPost;
  };

  // Function to delete a post
  const deletePost = (postId) => {
    // Find the post to delete
    const postToDelete = allPosts.find(p => p.id === postId || p.id === parseInt(postId));
    
    if (!postToDelete) return;

    // Add to deleted posts history with timestamp
    const deletedPostWithMeta = {
      ...postToDelete,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser?.email
    };

    const updatedDeletedPosts = [deletedPostWithMeta, ...deletedPosts];
    localStorage.setItem('deletedPosts', JSON.stringify(updatedDeletedPosts));
    setDeletedPosts(updatedDeletedPosts);

    // Remove from all posts
    const updatedPosts = allPosts.filter(p => p.id !== postId && p.id !== parseInt(postId));
    localStorage.setItem('allPosts', JSON.stringify(updatedPosts));
    setAllPosts(updatedPosts);

    // Remove from user's posts in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(user => {
      if (user.email === currentUser?.email) {
        return {
          ...user,
          posts: (user.posts || []).filter(id => id !== postId && id !== parseInt(postId))
        };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    return postToDelete;
  };

  // Function to clear deleted posts history
  const clearDeletedHistory = () => {
    localStorage.setItem('deletedPosts', JSON.stringify([]));
    setDeletedPosts([]);
  };

  // Function to restore a deleted post
  const restorePost = (postId) => {
    // Find the post in deleted posts
    const postToRestore = deletedPosts.find(p => p.id === postId || p.id === parseInt(postId));
    
    if (!postToRestore) return;

    // Remove from deleted posts
    const { deletedAt, deletedBy, ...cleanPost } = postToRestore;
    const updatedDeletedPosts = deletedPosts.filter(p => p.id !== postId && p.id !== parseInt(postId));
    localStorage.setItem('deletedPosts', JSON.stringify(updatedDeletedPosts));
    setDeletedPosts(updatedDeletedPosts);

    // Add back to all posts
    const updatedPosts = [cleanPost, ...allPosts];
    localStorage.setItem('allPosts', JSON.stringify(updatedPosts));
    setAllPosts(updatedPosts);

    // Add back to user's posts
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(user => {
      if (user.email === cleanPost.authorEmail) {
        return {
          ...user,
          posts: [...(user.posts || []), cleanPost.id]
        };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    return cleanPost;
  };

  // Function to get all posts (predefined + user posts)
  const getPosts = () => {
    const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
    
    // If no posts in localStorage, return predefined posts
    if (posts.length === 0) {
      return predefinedPosts;
    }
    
    // Merge with predefined posts to ensure they're always there
    const allPredefinedIds = predefinedPosts.map(p => p.id);
    const existingIds = posts.map(p => p.id);
    
    // Add any missing predefined posts
    const missingPredefined = predefinedPosts.filter(p => !existingIds.includes(p.id));
    
    if (missingPredefined.length > 0) {
      const mergedPosts = [...posts, ...missingPredefined];
      // Sort by date (newest first)
      mergedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem('allPosts', JSON.stringify(mergedPosts));
      return mergedPosts;
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return posts;
  };

  // Function to get user's posts
  const getUserPosts = (userEmail) => {
    const allPosts = JSON.parse(localStorage.getItem('allPosts') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === userEmail);
    
    if (!user) return [];
    
    // Get posts by this user (either by authorEmail or by name)
    return allPosts.filter(post => 
      post.authorEmail === userEmail || 
      post.author === user.name
    );
  };

  // Function to get a single post by ID
  const getPostById = (postId) => {
    const allPosts = JSON.parse(localStorage.getItem('allPosts') || '[]');
    return allPosts.find(p => p.id === parseInt(postId) || p.id === postId);
  };

  // Function to update post (for likes/comments)
  const updatePost = (postId, updates) => {
    const allPosts = JSON.parse(localStorage.getItem('allPosts') || '[]');
    const updatedPosts = allPosts.map(post => 
      (post.id === parseInt(postId) || post.id === postId) 
        ? { ...post, ...updates } 
        : post
    );
    localStorage.setItem('allPosts', JSON.stringify(updatedPosts));
    setAllPosts(updatedPosts);
    return updatedPosts.find(p => p.id === postId || p.id === parseInt(postId));
  };

  // Function to get deleted posts history
  const getDeletedPosts = () => {
    return JSON.parse(localStorage.getItem('deletedPosts') || '[]');
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    addPost,
    deletePost,
    restorePost,
    clearDeletedHistory,
    getPosts,
    getUserPosts,
    getPostById,
    updatePost,
    getDeletedPosts
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};