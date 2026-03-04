import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';


const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, requestPasswordReset, verifyResetCode, resetPassword } = useAuth();
  
  const from = location.state?.from || '/';
  const message = location.state?.message || '';

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters long");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("One special character (!@#$%^&*)");
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!isLogin && !showForgotPassword) {
      if (!password) {
        newErrors.password = "Password is required";
      } else {
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
          newErrors.password = passwordErrors;
        }
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!name) {
        newErrors.name = "Name is required";
      } else if (name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
    } else if (isLogin && !showForgotPassword) {
      if (!password) {
        newErrors.password = "Password is required";
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        login(email, password);
        navigate(from, { replace: true });
      } else {
        signup(email, password, name);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!email) {
      setErrors({ email: "Please enter your email" });
      return;
    }

    setIsLoading(true);
    
    try {
      await requestPasswordReset(email);
      setSuccessMessage(`Reset code sent to ${email}`);
      setResetStep(2);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!resetCode || resetCode.length !== 6) {
      setErrors({ code: "Please enter a valid 6-digit code" });
      return;
    }

    setIsLoading(true);
    
    try {
      await verifyResetCode(email, resetCode);
      setSuccessMessage("Code verified successfully!");
      setResetStep(3);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setErrors({ newPassword: passwordErrors });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    
    try {
      await resetPassword(email, resetCode, newPassword);
      setSuccessMessage("Password reset successfully! You can now login with your new password.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep(1);
        setEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password && !newPassword) return { strength: 0, label: '' };
    const pwd = showForgotPassword ? newPassword : password;
    if (!pwd) return { strength: 0, label: '' };
    
    const checks = [
      pwd.length >= 8,
      /[A-Z]/.test(pwd),
      /[a-z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[!@#$%^&*]/.test(pwd)
    ];
    
    const strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { strength: 20, label: 'Weak', color: '#FF6B6B' };
    if (strength <= 3) return { strength: 40, label: 'Fair', color: '#FFE66D' };
    if (strength <= 4) return { strength: 70, label: 'Good', color: '#4ECDC4' };
    return { strength: 100, label: 'Strong', color: '#A8E6CF' };
  };

  const passwordStrength = getPasswordStrength();

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          <button 
            className="back-to-login"
            onClick={() => {
              setShowForgotPassword(false);
              setResetStep(1);
              setErrors({});
              setSuccessMessage('');
            }}
          >
            ← Back to Login
          </button>

          <h2>Reset Password</h2>
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          
          {errors.form && (
            <div className="error-message">
              {errors.form}
            </div>
          )}

          {resetStep === 1 && (
            <form onSubmit={handleForgotPassword} className="login-form">
              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({});
                  }}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <p className="reset-info">
                We'll send a 6-digit verification code to this email address.
              </p>

              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {resetStep === 2 && (
            <form onSubmit={handleVerifyCode} className="login-form">
              <div className="form-group">
                <label>Verification Code <span className="required">*</span></label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => {
                    setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setErrors({});
                  }}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  className={errors.code ? 'error' : ''}
                />
                {errors.code && <span className="error-text">{errors.code}</span>}
              </div>

              <p className="reset-info">
                Enter the 6-digit code sent to {email}
              </p>

              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button 
                type="button"
                className="resend-code-btn"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Resend Code
              </button>
            </form>
          )}

          {resetStep === 3 && (
            <form onSubmit={handleResetPassword} className="login-form">
              <div className="form-group">
                <label>New Password <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors({});
                    }}
                    placeholder="Enter new password"
                    className={errors.newPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password <span className="required">*</span></label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    setErrors({});
                  }}
                  placeholder="Confirm new password"
                  className={errors.confirmNewPassword ? 'error' : ''}
                />
                {errors.confirmNewPassword && (
                  <span className="error-text">{errors.confirmNewPassword}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Welcome Back! 👋' : 'Join Our Community! 🎓'}</h2>
        
        {message && (
          <div className="info-message">
            {message}
          </div>
        )}
        
        {errors.form && (
          <div className="error-message">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: null });
                }}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address <span className="required">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: null });
              }}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: null });
                }}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {isLogin && (
              <div className="forgot-password-link">
                <button 
                  type="button"
                  className="forgot-password-btn"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password <span className="required">*</span></label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirmPassword: null });
                }}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
        
        <p className="toggle-auth">
          {isLogin ? "New to College Blog? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setPassword('');
              setConfirmPassword('');
            }} 
            className="toggle-btn"
          >
            {isLogin ? 'Create an account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;