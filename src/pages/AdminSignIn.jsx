import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authHero from '../assets/auth-hero.webp';
import BrandLogo from '../components/BrandLogo';

export default function AdminSignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }

    navigate('/internal-admin-dashboard');
  };

  return (
    <motion.div
      className="admin-auth-layout"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="admin-auth-bg-layer">
        <img src={authHero} alt="Staffroom admin workspace" />
        <div className="admin-auth-overlay" />

        <Link className="admin-auth-desktop-logo" to="/">
          <BrandLogo className="brand-logo-image--white" />
        </Link>
      </div>

      <div className="admin-auth-form-wrapper">
        <div className="admin-auth-mobile-logo">
          <Link to="/">
            <BrandLogo className="brand-logo-image--white" />
          </Link>
        </div>

        <div className="admin-auth-inner">
          <h1 className="admin-auth-heading">Sign in as Admin</h1>

          <div className="admin-auth-glass">
            <form onSubmit={handleSubmit} className="admin-auth-form">
              <label className="admin-auth-label" htmlFor="admin-signin-email">
                <span>Email address</span>
                <input
                  id="admin-signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@staffroom.ng"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="admin-auth-input"
                />
              </label>

              <label className="admin-auth-label" htmlFor="admin-signin-password">
                <span>Password</span>
                <div className="admin-auth-password-wrap">
                  <input
                    id="admin-signin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="admin-auth-input"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    className="admin-auth-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((current) => !current)}
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
              </label>

              {error && <div className="admin-auth-error">{error}</div>}

              <button type="submit" className="admin-auth-submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .admin-auth-layout {
          position: relative;
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0f172a;
        }

        .admin-auth-bg-layer {
          position: fixed;
          inset: 0;
          z-index: 1;
          width: 100%;
          height: 100vh;
        }

        .admin-auth-bg-layer img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .admin-auth-overlay {
          position: absolute;
          inset: 0;
          background: rgba(14, 30, 24, 0.68);
        }

        .admin-auth-desktop-logo{
          display: none;
        }

        .admin-auth-form-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 20px;
        }

        .admin-auth-mobile-logo {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          z-index: 3;
        }

        .admin-auth-inner {
          width: 100%;
          max-width: 420px;
        }

        .admin-auth-heading {
          margin: 0 0 18px;
          color: #ffffff;
          font-size: 34px;
          font-weight: 700;
          letter-spacing: -0.06em;
        }

        .admin-auth-glass {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 24px;
          padding: 24px;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 20px 40px rgba(12, 16, 15, 0.18);
        }

        .admin-auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-auth-label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: rgba(255, 255, 255, 0.86);
          font-size: 13px;
          font-weight: 600;
        }

        .admin-auth-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          background: rgba(250, 250, 248, 0.98);
          color: #1f2937;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-auth-input:focus {
          border-color: rgba(28, 203, 67, 0.7);
          box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.12);
        }

        .admin-auth-password-wrap {
          position: relative;
        }

        .admin-auth-password-toggle {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #5d6470;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-auth-error {
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.28);
          color: #ffd3d3;
          font-size: 13px;
          line-height: 1.4;
        }

        .admin-auth-submit {
          margin-top: 8px;
          width: 100%;
          min-height: 48px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #1ccb43 0%, #16a34a 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.02em;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
          box-shadow: 0 10px 20px rgba(28, 203, 67, 0.2);
        }

        .admin-auth-submit:hover {
          transform: translateY(-1px);
        }

        .admin-auth-submit:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        @media (min-width: 900px) {
          .admin-auth-layout {
            flex-direction: row;
          }

          .admin-auth-bg-layer {
            position: absolute;
          }

          .admin-auth-desktop-logo{
            display: block;
          }

          .admin-auth-form-wrapper {
            justify-content: center;
            padding: 48px 32px;
          }

          .admin-auth-mobile-logo {
            display: none;
          }

          .admin-auth-desktop-logo {
            position: absolute;
            left: 52px;
            top: 40px;
            z-index: 2;
          }

          .admin-auth-inner {
            width: min(100%, 420px);
          }
        }
      `}</style>
    </motion.div>
  );
}
