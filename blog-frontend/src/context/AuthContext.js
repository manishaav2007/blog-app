import React, { createContext, useState, useContext, useEffect } from 'react';
import { posts as predefinedPosts } from '../data';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);

  useEffect(() => {
    // Load initial auth data
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setAuthToken(storedToken);
    }

    // Load deleted posts and reset requests (local-only demo features)
    loadDeletedPosts();
    loadResetRequests();

    // Fetch posts from API on startup (ignore errors, we'll fall back later)
    fetchPostsFromApi().finally(() => setLoading(false));
  }, []);

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

  const signup = async (email, password, name) => {
    // Validate password on the client too
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      throw new Error("Password does not meet requirements");
    }

    // Call backend API to register user
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: name,
        email,
        password
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create account');
    }

    const userForSession = {
      id: data.user?.id,
      email: data.user?.email || email,
      name: data.user?.username || name,
      profilePic: data.user?.profilePic || ''
    };

    // Store token and user in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      setAuthToken(data.token);
    }
    localStorage.setItem('user', JSON.stringify(userForSession));
    setCurrentUser(userForSession);

    // Optional: keep a simple users list in localStorage to support
    // the existing password reset flow in this demo app.
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = existingUsers.find(u => u.email === email);
    if (!userExists) {
      existingUsers.push({
        email,
        name: userForSession.name,
        password,
        createdAt: new Date().toISOString(),
        posts: []
      });
      localStorage.setItem('users', JSON.stringify(existingUsers));
    }

    return userForSession;
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    const userForSession = {
      id: data.user?.id,
      email: data.user?.email || email,
      name: data.user?.username || '',
      profilePic: data.user?.profilePic || ''
    };

    if (data.token) {
      localStorage.setItem('authToken', data.token);
      setAuthToken(data.token);
    }

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

  // Map a backend Post document into the shape used by the frontend
  const mapPostFromApi = (post) => {
    if (!post) return null;

    const createdAt = post.createdAt || new Date().toISOString();

    return {
      id: post._id,
      title: post.title,
      content: post.content,
      category: post.category || 'Campus Life',
      image: post.image || '',
      author: post.author?.username || 'Unknown',
      authorEmail: post.author?.email || '',
      date: new Date(createdAt).toISOString().split('T')[0],
      likes: post.likeCount || 0,
      comments: [], // comments are loaded separately in PostDetails
    };
  };

  // Fetch all posts from backend API
  const fetchPostsFromApi = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      const mapped = data.map(mapPostFromApi);
      // Sort newest first
      mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllPosts(mapped);
      return mapped;
    } catch (err) {
      console.error('Error fetching posts from API:', err);
      // Fallback to predefined demo posts if API fails
      setAllPosts(predefinedPosts);
      return predefinedPosts;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setAuthToken(null);
  };

  // Function to add a new post (calls backend)
  const addPost = async (post) => {
    if (!authToken) {
      throw new Error('You must be logged in to create a post');
    }

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        category: post.category,
        image: post.image,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create post');
    }

    const mapped = mapPostFromApi(data);
    setAllPosts((prev) => [mapped, ...prev]);
    return mapped;
  };

  // Function to delete a post (calls backend, keeps local deleted history)
  const deletePost = async (postId) => {
    if (!authToken) {
      throw new Error('You must be logged in to delete a post');
    }

    const postToDelete = allPosts.find((p) => p.id === postId || p.id === String(postId));
    if (!postToDelete) return;

    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete post');
    }

    // Add to deleted posts history with timestamp (local-only feature)
    const deletedPostWithMeta = {
      ...postToDelete,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser?.email,
    };

    const updatedDeletedPosts = [deletedPostWithMeta, ...deletedPosts];
    localStorage.setItem('deletedPosts', JSON.stringify(updatedDeletedPosts));
    setDeletedPosts(updatedDeletedPosts);

    const updatedPosts = allPosts.filter((p) => p.id !== postId && p.id !== String(postId));
    setAllPosts(updatedPosts);

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

    return cleanPost;
  };

  // Function to get all posts (from API, cached in state)
  const getPosts = async () => {
    if (allPosts.length > 0) {
      return allPosts;
    }
    return fetchPostsFromApi();
  };

  // Function to get user's posts
  const getUserPosts = async (userEmail) => {
    const posts = await getPosts();
    if (!userEmail) return [];
    return posts.filter(
      (post) => post.authorEmail === userEmail || post.author === currentUser?.name
    );
  };

  // Function to get a single post by ID
  const getPostById = async (postId) => {
    // Try from cache first
    const fromCache = allPosts.find(
      (p) => p.id === postId || p.id === String(postId)
    );
    if (fromCache) return fromCache;

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      const mapped = mapPostFromApi(data);
      setAllPosts((prev) => {
        const exists = prev.some((p) => p.id === mapped.id);
        return exists ? prev : [mapped, ...prev];
      });
      return mapped;
    } catch (err) {
      console.error('Error fetching post by id:', err);
      return null;
    }
  };

  // Function to update post in local cache (e.g. like count)
  const updatePost = (postId, updates) => {
    setAllPosts((prev) =>
      prev.map((post) =>
        post.id === postId || post.id === String(postId)
          ? { ...post, ...updates }
          : post
      )
    );
  };

  // Function to get deleted posts history
  const getDeletedPosts = () => {
    return JSON.parse(localStorage.getItem('deletedPosts') || '[]');
  };

  const value = {
    currentUser,
    authToken,
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