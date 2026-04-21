import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authHero from '../assets/auth-hero.png';

export default function SignUp() {
  const [role, setRole] = useState('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="auth-layout">
      {/* ── Background Image Layer ── */}
      <div className="auth-bg-layer">
        <img
          src={authHero}
          alt="Teacher working at laptop"
        />
        <div className="auth-overlay" />

        {/* Desktop-only Logo & Quote */}
        <Link className="desktop-logo" to="/">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Staffroom</span>
        </Link>
        <div className="desktop-quote">
          <h2>Ready to connect, teach, or hire? <br /> Join Staffroom today.</h2>
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
          <h1 className="auth-heading">Create an account</h1>

          <div className="auth-glass-box">
            
            {/* Teachers / Schools toggle */}
            <div className="role-toggle-container">
              {[
                { id: 'teacher', label: 'Teachers' },
                { id: 'school', label: 'Schools' },
              ].map((r) => (
                <button
                  key={r.id}
                  id={`role-${r.id}`}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`role-toggle-btn ${role === r.id ? 'active' : ''}`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* First name */}
              <input
                id="signup-firstname"
                type="text"
                required
                autoComplete="given-name"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="input-field"
              />

              {/* Last name */}
              <input
                id="signup-lastname"
                type="text"
                required
                autoComplete="family-name"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="input-field"
              />

              {/* Email */}
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />

              {/* Phone — Nigerian flag prefix */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="phone-prefix">
                  {/* Nigeria flag emoji representation */}
                  <span className="flag-icon">
                    <span style={{ flex: 1, backgroundColor: '#008751' }} />
                    <span style={{ flex: 1, backgroundColor: '#fff' }} />
                    <span style={{ flex: 1, backgroundColor: '#008751' }} />
                  </span>
                </div>
                <input
                  id="signup-phone"
                  type="tel"
                  placeholder="8012345678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  style={{ flex: 1 }}
                />
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  style={{ paddingRight: '44px' }}
                />
                <EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} id="signup-toggle-password" />
              </div>

              {/* Confirm password */}
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Confirmed password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field"
                  style={{ paddingRight: '44px' }}
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} id="signup-toggle-confirm" />
              </div>

              {/* Sign Up button */}
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={loading}
                className="submit-btn"
                style={{ backgroundColor: loading ? '#a8e6b8' : '#1CCB43', marginTop: '6px' }}
              >
                {loading ? (
                  <>
                    <svg className="spin-icon" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing up…
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Footer link */}
            <p className="footer-login-text text-adaptive">
              Already have a Staffroom account?{' '}
              <Link to="/signin" className="login-link">
                Sign in.
              </Link>
            </p>
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
          /* Keep enough padding at bottom for scrolling */
          padding-bottom: 40px; 
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
          margin: 0 auto auto auto;
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
        
        .role-toggle-container {
          display: flex;
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 50px;
          padding: 4px;
          margin-bottom: 22px;
          gap: 4px;
        }

        .role-toggle-btn {
          flex: 1;
          padding: 10px 0;
          border-radius: 50px;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          background-color: transparent;
          color: #fff;
        }

        .role-toggle-btn.active {
          background-color: #1CCB43;
          color: #111;
          box-shadow: 0 2px 8px rgba(28,203,67,0.25);
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid transparent;
          background-color: #f3f4f6;
          font-size: 14px;
          color: #333;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-field::placeholder {
          color: #888;
        }

        .input-field:focus {
          border-color: #bbb;
          box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.12);
        }

        .phone-prefix {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          background-color: #f3f4f6;
          border-radius: 12px;
          border: 1px solid transparent;
          white-space: nowrap;
          font-size: 14px;
          color: #333;
          font-weight: 500;
          flex-shrink: 0;
        }

        .flag-icon {
          display: flex;
          gap: 1px;
          width: 20px;
          height: 14px;
          overflow: hidden;
          border-radius: 2px;
          flex-shrink: 0;
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
          letter-spacing: 0.3px;
        }

        .submit-btn:disabled { cursor: not-allowed; }

        .spin-icon {
          animation: spin 1s linear infinite;
        }
        .spin-icon circle { opacity: 0.25; }
        .spin-icon path { opacity: 0.75; }

        .footer-login-text {
          text-align: center;
          font-size: 14px;
          margin-top: 24px;
          color: #fff; /* For mobile */
        }

        .login-link {
          color: #1CCB43;
          font-weight: 600;
          text-decoration: none;
        }

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
            padding: 40px 32px;
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
            font-size: 34px;
            font-weight: 700;
            color: #111;
            margin: 0 0 24px 0;
            letter-spacing: -0.8px;
          }

          .role-toggle-container {
            background-color: #fff;
            border: 1px solid #e6e6e6;
          }

          .role-toggle-btn {
            color: #555;
          }
          
          .role-toggle-btn.active {
            color: #111;
          }

          .footer-login-text {
            color: #555;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Eye toggle helper ── */
function EyeToggle({ show, onToggle, id }) {
  return (
    <button
      type="button"
      id={id}
      onClick={onToggle}
      style={{
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#999',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {show ? (
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
  );
}
