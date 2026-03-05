import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreatePost.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const { currentUser, addPost } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    category: 'Campus Life'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [activeTip, setActiveTip] = useState(null);
  const [completedTips, setCompletedTips] = useState([]);
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);

  const categories = [
    { name: "Campus Life", icon: "🏛️", color: "#FF6B6B" },
    { name: "Academics", icon: "📚", color: "#4ECDC4" },
    { name: "Food", icon: "🍔", color: "#FFE66D" },
    { name: "Career", icon: "💼", color: "#A8E6CF" }
  ];

  const writingTips = [
    {
      id: 1,
      icon: "📖",
      title: "Engaging Title",
      description: "Make it catchy and descriptive to attract readers",
      tip: "Use power words like 'Ultimate', 'Essential', 'Proven'. Ask questions or make bold statements. Keep it under 60 characters for best results.",
      examples: [
        "❌ Bad: 'Study Tips'",
        "✅ Good: '10 Proven Study Tips That Actually Work'",
        "✅ Great: 'How I Aced All My Exams: The Ultimate Study Guide'"
      ],
      action: "Apply Title Tips",
      color: "#FF6B6B"
    },
    {
      id: 2,
      icon: "✍️",
      title: "Clear Structure",
      description: "Use paragraphs and break down complex ideas",
      tip: "Start with a hook, use subheadings, keep paragraphs short (3-4 sentences), and end with a strong conclusion.",
      examples: [
        "• Introduction: Hook your readers",
        "• Body: Break into sections with subheadings",
        "• Tips: Use bullet points for easy reading",
        "• Conclusion: Summarize and engage"
      ],
      action: "Apply Structure Template",
      color: "#4ECDC4"
    },
    {
      id: 3,
      icon: "🎯",
      title: "Be Authentic",
      description: "Share personal experiences and genuine insights",
      tip: "Readers connect with real stories. Share your failures and lessons learned. Use 'I' statements and be vulnerable.",
      examples: [
        "❌ Generic: 'Studying is important'",
        "✅ Personal: 'I failed my first exam, but here's what I learned...'",
        "✅ Authentic: 'The mistake that taught me more than any textbook'"
      ],
      action: "Add Personal Touch",
      color: "#FFE66D"
    },
    {
      id: 4,
      icon: "📸",
      title: "Add Images",
      description: "Visuals make your post more engaging",
      tip: "Posts with images get 94% more views. Use relevant, high-quality images. Add alt text for accessibility.",
      examples: [
        "• Use original photos when possible",
        "• Add captions to explain images",
        "• Space images throughout the post",
        "• Optimize image size for fast loading"
      ],
      action: "Get Image Tips",
      color: "#A8E6CF"
    }
  ];

  useEffect(() => {
    setCharCount(formData.content.length);
    setWordCount(formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0);
    
    // Auto-detect completed tips based on content
    const newCompletedTips = [];
    
    // Tip 1: Engaging Title (title length > 5 and contains power words)
    if (formData.title.length > 5) {
      const powerWords = ['ultimate', 'essential', 'proven', 'guide', 'tips', 'how', 'why', 'best', 'top', 'secret'];
      const hasPowerWord = powerWords.some(word => formData.title.toLowerCase().includes(word));
      if (hasPowerWord) newCompletedTips.push(1);
    }
    
    // Tip 2: Clear Structure (content has paragraphs and length > 200)
    if (formData.content.length > 200 && formData.content.includes('\n\n')) {
      newCompletedTips.push(2);
    }
    
    // Tip 3: Be Authentic (contains personal pronouns)
    if (formData.content.length > 100) {
      const personalWords = ['i ', 'me ', 'my ', 'mine ', 'myself', 'i\'ve', 'i\'m', 'i\'ll'];
      const hasPersonal = personalWords.some(word => formData.content.toLowerCase().includes(word));
      if (hasPersonal) newCompletedTips.push(3);
    }
    
    setCompletedTips(newCompletedTips);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation
    if (name === 'title') {
      if (value.length < 5) {
        setTitleError('Title must be at least 5 characters');
      } else if (value.length > 100) {
        setTitleError('Title must be less than 100 characters');
      } else {
        setTitleError('');
      }
    }

    if (name === 'content') {
      if (value.length < 50) {
        setContentError('Content must be at least 50 characters');
      } else if (value.length > 5000) {
        setContentError('Content must be less than 5000 characters');
      } else {
        setContentError('');
      }
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (formData.title.length < 5) {
      setTitleError('Title must be at least 5 characters');
      isValid = false;
    }

    if (formData.content.length < 50) {
      setContentError('Content must be at least 50 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleTipClick = (tip) => {
    setSelectedTip(tip);
    setShowTipModal(true);
  };

  const applyTip = (tipId) => {
    switch(tipId) {
      case 1: // Engaging Title
        if (!formData.title) {
          setFormData({
            ...formData,
            title: "How I [Achieved Something Amazing]: A Complete Guide"
          });
        } else {
          // Enhance existing title
          let newTitle = formData.title;
          if (!newTitle.toLowerCase().includes('how to') && !newTitle.toLowerCase().includes('guide')) {
            newTitle = "How to " + newTitle.charAt(0).toLowerCase() + newTitle.slice(1);
          }
          if (!newTitle.toLowerCase().includes('ultimate') && !newTitle.toLowerCase().includes('proven')) {
            newTitle = "The Ultimate Guide to " + newTitle;
          }
          setFormData({ ...formData, title: newTitle });
        }
        break;
        
      case 2: // Clear Structure
        const structureTemplate = `
Introduction:
[Start with a hook that grabs attention]

Main Point 1:
[Explain your first key idea with examples]

Main Point 2:
[Share another important aspect]

Tips & Tricks:
• Tip 1
• Tip 2
• Tip 3

Conclusion:
[Summarize and end with a thought-provoking question]
        `.trim();
        
        if (!formData.content) {
          setFormData({ ...formData, content: structureTemplate });
        } else {
          setFormData({ 
            ...formData, 
            content: formData.content + "\n\n" + structureTemplate 
          });
        }
        break;
        
      case 3: // Be Authentic
        const personalTemplate = `
I remember when I first [share a personal experience]. It taught me that [lesson learned].

One thing I've learned from my journey is [personal insight].

If you're going through something similar, know that [encouraging message]. I've been there, and here's what helped me...
        `.trim();
        
        setFormData({ 
          ...formData, 
          content: formData.content + "\n\n" + personalTemplate 
        });
        break;
        
      case 4: // Add Images
        const randomImage = getRandomImage();
        setFormData({ ...formData, image: randomImage });
        alert('✨ Random image added! You can change it anytime.');
        break;
        
      default:
        break;
    }
    
    setShowTipModal(false);
  };

  const getTipProgress = (tipId) => {
    return completedTips.includes(tipId) ? 100 : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Create new post object
    const newPost = {
      title: formData.title,
      content: formData.content,
      author: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      category: formData.category,
      image: formData.image || getRandomImage(),
      likes: 0,
      comments: []
    };

    // Add post using context
    addPost(newPost);
    
    // Show success message
    alert('✨ Post created successfully!');
    navigate('/');
  };

  const getRandomImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format",
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&auto=format",
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=500&auto=format",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format"
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const getProgressColor = () => {
    if (formData.content.length < 50) return '#FF6B6B';
    if (formData.content.length < 200) return '#FFE66D';
    if (formData.content.length < 1000) return '#4ECDC4';
    return '#A8E6CF';
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="create-post-container">
      <div className="create-post-wrapper">
        {/* Header Section */}
        <div className="create-post-header">
          <h1>
            <span className="header-icon">✍️</span>
            Share Your Story
          </h1>
          <p className="header-subtitle">
            Write about your experiences, thoughts, and ideas with the campus community
          </p>
          <div className="header-stats">
            <div className="stat-bubble">
              <span className="stat-icon">⏱️</span>
              <span className="stat-text">{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
            </div>
            <div className="stat-bubble">
              <span className="stat-icon">📝</span>
              <span className="stat-text">{wordCount} words</span>
            </div>
            <div className="stat-bubble">
              <span className="stat-icon">🎯</span>
              <span className="stat-text">{completedTips.length}/4 tips done</span>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="create-post-card">
          <form onSubmit={handleSubmit} className="create-post-form">
            {/* Category Selection */}
            <div className="form-section">
              <label className="section-label">
                <span className="label-icon">📌</span>
                Choose Category
              </label>
              <div className="category-grid">
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    className={`category-option ${formData.category === cat.name ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, category: cat.name })}
                  >
                    <div className="category-content" style={{ borderColor: cat.color }}>
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-name">{cat.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div className="form-section">
              <label className="section-label">
                <span className="label-icon">📝</span>
                Post Title <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., 'My First Day at University' or '5 Study Tips That Changed My Life'"
                  className={`title-input ${titleError ? 'error' : ''}`}
                  maxLength="100"
                />
                <div className="input-character-count">
                  {formData.title.length}/100
                </div>
              </div>
              {titleError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {titleError}
                </div>
              )}
            </div>

            {/* Content Input */}
            <div className="form-section">
              <label className="section-label">
                <span className="label-icon">📄</span>
                Your Story <span className="required">*</span>
              </label>
              <div className="textarea-wrapper">
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your amazing story here... Share your experiences, insights, and tips with the community!"
                  className={`content-textarea ${contentError ? 'error' : ''}`}
                  rows="8"
                />
                <div className="textarea-stats">
                  <span>Characters: {charCount}</span>
                  <span>Words: {wordCount}</span>
                  <span>Reading time: {Math.max(1, Math.ceil(wordCount / 200))} min</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, (formData.content.length / 200) * 100)}%`,
                      backgroundColor: getProgressColor()
                    }}
                  ></div>
                </div>
              </div>

              {contentError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {contentError}
                </div>
              )}
            </div>

            {/* Image URL Input */}
            <div className="form-section">
              <label className="section-label">
                <span className="label-icon">🖼️</span>
                Featured Image URL (Optional)
              </label>
              <div className="image-input-wrapper">
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/your-image.jpg"
                  className="image-input"
                />
                <button
                  type="button"
                  className="random-image-btn"
                  onClick={() => setFormData({ ...formData, image: getRandomImage() })}
                >
                  🎲 Random
                </button>
              </div>
              <p className="input-hint">
                Leave empty for a random featured image
              </p>
            </div>

            {/* Preview Toggle */}
            <div className="preview-toggle">
              <button
                type="button"
                className={`toggle-preview-btn ${showPreview ? 'active' : ''}`}
                onClick={() => setShowPreview(!showPreview)}
              >
                <span className="toggle-icon">{showPreview ? '👁️' : '👁️‍🗨️'}</span>
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className="live-preview">
                <h3 className="preview-title">
                  <span className="preview-icon">🔍</span>
                  Live Preview
                </h3>
                <div className="preview-card">
                  <div className="preview-image">
                    <img 
                      src={formData.image || getRandomImage()} 
                      alt="Preview"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format";
                      }}
                    />
                    <span className="preview-category" style={{
                      backgroundColor: categories.find(c => c.name === formData.category)?.color || '#667EEA'
                    }}>
                      {formData.category}
                    </span>
                  </div>
                  <div className="preview-content">
                    <h4>{formData.title || "Your Title Here"}</h4>
                    <div className="preview-meta">
                      <span>By {currentUser.name}</span>
                      <span>Just now</span>
                    </div>
                    <p className="preview-text">
                      {formData.content || "Your amazing content will appear here..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Writing Tips Section */}
            <div className="writing-tips-section">
              <h3 className="tips-title">
                <span className="tips-icon">💡</span>
                Writing Tips
                <span className="tips-progress">{completedTips.length}/4 completed</span>
              </h3>
              <div className="tips-grid">
                {writingTips.map((tip) => (
                  <div
                    key={tip.id}
                    className={`tip-card ${completedTips.includes(tip.id) ? 'completed' : ''}`}
                    onClick={() => handleTipClick(tip)}
                  >
                    <div className="tip-icon">{tip.icon}</div>
                    <h4>{tip.title}</h4>
                    <p>{tip.description}</p>
                    {completedTips.includes(tip.id) && (
                      <span className="tip-check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting || titleError || contentError}
              >
                {isSubmitting ? 'Publishing...' : '✨ Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && selectedTip && (
        <div className="tip-modal-overlay" onClick={() => setShowTipModal(false)}>
          <div className="tip-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTipModal(false)}>✕</button>
            
            <div className="modal-header" style={{ borderColor: selectedTip.color }}>
              <span className="modal-icon">{selectedTip.icon}</span>
              <h2>{selectedTip.title}</h2>
            </div>

            <div className="modal-body">
              <p className="modal-description">{selectedTip.description}</p>
              
              <div className="modal-section">
                <h4>💡 Pro Tip</h4>
                <p>{selectedTip.tip}</p>
              </div>

              <div className="modal-section">
                <h4>📋 Examples</h4>
                <div className="examples-list">
                  {selectedTip.examples.map((example, idx) => (
                    <div key={idx} className="example-item">
                      {example}
                    </div>
                  ))}
                </div>
              </div>

              {completedTips.includes(selectedTip.id) ? (
                <div className="tip-already-applied">
                  <span className="applied-icon">✓</span>
                  <p>You've already applied this tip!</p>
                </div>
              ) : (
                <button
                  className="apply-tip-btn"
                  style={{ backgroundColor: selectedTip.color }}
                  onClick={() => applyTip(selectedTip.id)}
                >
                  <span className="btn-icon">✨</span>
                  {selectedTip.action}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;