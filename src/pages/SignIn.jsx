import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authHero from '../assets/auth-hero.png';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      const user = result?.data?.user;
      const role = user?.role || 'teacher';

      if (role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (role === 'school') {
        navigate('/school-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="auth-layout"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ── Background Image Layer ── */}
      <div className="auth-bg-layer">
        <img src={authHero} alt="Teacher working at laptop" />
        <div className="auth-overlay" />

        {/* Desktop-only Logo & Quote */}
        <Link className="desktop-logo" to="/">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Staffroom</span>
        </Link>
        <div className="desktop-quote">
          <h2>Welcome back to<br />Staffroom.</h2>
        </div>
      </div>

      {/* ── Form Section ── */}
      <div className="auth-form-wrapper">
        {/* Mobile-only Top Logo */}
        <div className="mobile-logo-container">
          <Link className="mobile-logo" to="/">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Staffroom</span>
          </Link>
        </div>

        <div className="auth-inner-content">
          <h1 className="auth-heading">Sign in</h1>

          <div className="auth-glass-box">
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email */}
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Remember me + Forgot password */}
              <div className="form-extras">
                <label className="remember-label text-adaptive">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              {/* Don't have account */}
              <p className="no-account-text text-adaptive">
                Don't have an account?{' '}
                <Link to="/signup" className="create-link">
                  Create now.
                </Link>
              </p>

              {/* Divider — or */}
              <div className="divider">
                <div className="line" />
                <span className="or-text">or</span>
                <div className="line" />
              </div>

              {/* Submit button */}
              {error && (
                <div className="error-message" style={{ marginBottom: '12px', color: '#b91c1c', fontSize: '14px' }}>{error}</div>
              )}

              <button
                id="signin-submit-btn"
                type="submit"
                disabled={loading}
                className="submit-btn"
                style={{ backgroundColor: loading ? '#a8e6b8' : '#1CCB43' }}
              >
                {loading ? (
                  <>
                    <svg className="spin-icon" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@100;300;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        /* General Layout */
        .auth-layout {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
          position: relative;
        }

        .auth-bg-layer img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .auth-overlay {
          position: absolute;
          inset: 0;
          background: rgba(30, 60, 30, 0.55);
        }

        /* Mobile First Defaults */
        .auth-layout {
          flex-direction: column;
        }
        
        .auth-bg-layer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: 1;
        }

        .desktop-logo, .desktop-quote {
          display: none;
        }

        .auth-form-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          min-height: 100vh;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
        }

        .mobile-logo-container {
          display: flex;
          margin-bottom: 30px;
          padding-top: 10px;
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #fff;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.5px;
        }

        .auth-inner-content {
          width: 100%;
          max-width: 420px;
          margin: auto; /* Vertically and horizontally center in available space */
        }

        .auth-heading {
          font-size: 34px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 20px 0;
          letter-spacing: -0.5px;
        }

        .auth-glass-box {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 24px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid transparent;
          background-color: #FAFAF8;
          font-size: 14px;
          color: #333;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-field:focus {
          border-color: #bbb;
          box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.12);
        }

        .password-toggle-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .form-extras {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .remember-label input {
          width: 15px;
          height: 15px;
          accent-color: #1CCB43;
          cursor: pointer;
        }

        .text-adaptive {
          color: #fff;
        }

        .forgot-link {
          font-size: 14px;
          color: #ff5252;
          font-weight: 500;
          text-decoration: none;
        }

        .no-account-text {
          font-size: 14px;
          margin: 0;
          text-align: center;
        }

        .create-link {
          color: #1a6ce8;
          font-weight: 600;
          text-decoration: none;
        }
        
        .create-link:hover { text-decoration: underline; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }

        .divider .line {
          flex: 1;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.3);
        }

        .divider .or-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          color: #111;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.2s;
          letter-spacing: 0.2px;
        }

        .submit-btn:disabled { cursor: not-allowed; }

        .spin-icon {
          animation: spin 1s linear infinite;
        }
        .spin-icon circle { opacity: 0.25; }
        .spin-icon path { opacity: 0.75; }

        /* Desktop Adjustments */
        @media (min-width: 768px) {
          .auth-layout {
            flex-direction: row;
          }
          
          .auth-bg-layer {
            position: relative;
            width: 50%;
            height: auto;
            flex-shrink: 0;
            overflow: hidden;
          }

          .desktop-logo {
            position: absolute;
            top: 28px;
            left: 32px;
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            z-index: 10;
            color: #fff;
            font-weight: 700;
            font-size: 18px;
            letter-spacing: -0.5px;
          }
          
          .desktop-quote {
            position: absolute;
            bottom: 360px;
            left: 40px;
            right: 40px;
            z-index: 10;
          }

          .desktop-quote h2 {
            color: #fff;
            font-family: 'Poppins', sans-serif;
            font-size: 2.6em;
            font-weight: 100;
            line-height: 1.25;
            margin: 0;
          }

          .auth-form-wrapper {
            flex: 1;
            padding: 48px 32px;
            background-color: #FAFAF8;
            min-height: 100vh;
            justify-content: center;
          }

          .mobile-logo-container {
            display: none;
          }

          /* Desktop uses regular styling, no glassmorphism */
          .auth-glass-box {
            background: transparent;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border: none;
            padding: 0;
          }

          .auth-heading {
            font-size: 38px;
            font-weight: 700;
            color: #111;
            margin: 0 0 28px 0;
            letter-spacing: -1px;
          }

          .text-adaptive {
            color: #444; 
          }
          
          .input-field {
            background-color: #f3f4f6;
          }

          .divider .line {
            background-color: #ddd;
          }
          
          .divider .or-text {
            color: #aaa;
          }
        }
      `}</style>
    </motion.div>
  );
}
