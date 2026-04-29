import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authHero from '../assets/auth-hero.png';

export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    setError('');
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move back on Backspace when empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Allow arrow navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < pasteData.length; i++) {
        newCode[i] = pasteData[i];
      }
      setCode(newCode);
      // Focus the next empty input or the last one
      const nextEmpty = newCode.findIndex((c) => c === '');
      inputRefs.current[nextEmpty !== -1 ? nextEmpty : 5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    setError('');

    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/user-type');
      }, 1800);
    }, 2000);
  };

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(60);
    setCode(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCodeComplete = code.every((d) => d !== '');

  return (
    <motion.div
      className="auth-layout"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
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
          <h2>One last step to<br />join Staffroom.</h2>
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
          {/* Back Button — desktop only */}
          <button
            id="verify-email-back-btn"
            type="button"
            onClick={() => navigate(-1)}
            className="back-arrow-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h1 className="auth-heading">Verify your email</h1>

          <div className="auth-glass-box">
            {/* Mail Icon */}
            <div className="verify-icon-wrapper">
              <div className="verify-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13L2 4" />
                </svg>
              </div>
            </div>

            <p className="verify-subtitle text-adaptive">
              We've sent a 6-digit verification code to your email address. Enter the code below to verify your account.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* OTP Input Row */}
              <div className="otp-container" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`verify-code-${index}`}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`otp-input ${digit ? 'filled' : ''} ${error ? 'otp-error' : ''} ${success ? 'otp-success' : ''}`}
                    disabled={loading || success}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* Error message */}
              {error && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {error}
                </motion.p>
              )}

              {/* Success message */}
              {success && (
                <motion.div
                  className="success-banner"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Email verified successfully! Redirecting…</span>
                </motion.div>
              )}

              {/* Verify Button */}
              <button
                id="verify-submit-btn"
                type="submit"
                disabled={loading || !isCodeComplete || success}
                className="submit-btn"
                style={{
                  backgroundColor: loading
                    ? '#a8e6b8'
                    : success
                    ? '#16a336'
                    : isCodeComplete
                    ? '#1CCB43'
                    : 'rgba(28, 203, 67, 0.4)',
                  marginTop: '4px',
                }}
              >
                {loading ? (
                  <>
                    <svg className="spin-icon" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying…
                  </>
                ) : success ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verified
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>

            {/* Resend Code */}
            <div className="resend-section">
              <p className="resend-text text-adaptive">
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    id="resend-code-btn"
                    type="button"
                    onClick={handleResend}
                    className="resend-btn"
                  >
                    Resend code
                  </button>
                ) : (
                  <span className="resend-timer">
                    Resend in {formatTime(resendTimer)}
                  </span>
                )}
              </p>
            </div>

            {/* Back to sign up */}
            <p className="footer-login-text text-adaptive">
              Wrong email?{' '}
              <Link to="/signup" className="login-link">
                Go back to sign up.
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@100;300;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Pulse ring animation ── */
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.15; }
          100% { transform: scale(1); opacity: 0.4; }
        }

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
          margin: auto;
        }

        /* ── Back Arrow (hidden on mobile) ── */
        .back-arrow-btn {
          display: none;
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
          padding: 28px 24px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Verify Icon ── */
        .verify-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }

        .verify-icon-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(28, 203, 67, 0.15);
          border: 2px solid rgba(28, 203, 67, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1CCB43;
          position: relative;
        }

        .verify-icon-circle::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1.5px solid rgba(28, 203, 67, 0.12);
          animation: pulseRing 2.5s ease-in-out infinite;
        }

        .verify-subtitle {
          text-align: center;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 22px 0;
          color: rgba(255, 255, 255, 0.85);
        }

        /* ── OTP Inputs ── */
        .otp-container {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .otp-input {
          width: 50px;
          height: 56px;
          text-align: center;
          font-size: 22px;
          font-weight: 700;
          border-radius: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          outline: none;
          transition: all 0.25s ease;
          caret-color: #1CCB43;
          font-family: 'Inter', sans-serif;
          letter-spacing: 2px;
        }

        .otp-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .otp-input:focus {
          border-color: #1CCB43;
          box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.2);
          background: rgba(255, 255, 255, 0.18);
        }

        .otp-input.filled {
          border-color: rgba(28, 203, 67, 0.5);
          background: rgba(255, 255, 255, 0.18);
        }

        .otp-input.otp-error {
          border-color: #ff5252;
          box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.15);
          animation: shake 0.4s ease;
        }

        .otp-input.otp-success {
          border-color: #1CCB43;
          background: rgba(28, 203, 67, 0.12);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        /* ── Error / Success ── */
        .error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #ff5252;
          margin: 0;
          justify-content: center;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          background: rgba(28, 203, 67, 0.12);
          border: 1px solid rgba(28, 203, 67, 0.3);
          border-radius: 12px;
          padding: 14px 18px;
          color: #1CCB43;
          font-size: 14px;
          font-weight: 500;
        }

        /* ── Submit Button ── */
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

        /* ── Resend Section ── */
        .resend-section {
          text-align: center;
          margin-top: 20px;
        }

        .resend-text {
          font-size: 14px;
          margin: 0;
          color: rgba(255, 255, 255, 0.75);
        }

        .resend-btn {
          background: none;
          border: none;
          color: #1CCB43;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          padding: 0;
          transition: opacity 0.2s;
        }

        .resend-btn:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .resend-timer {
          color: rgba(255, 255, 255, 0.5);
          font-variant-numeric: tabular-nums;
          font-weight: 500;
        }

        /* ── Footer ── */
        .footer-login-text {
          text-align: center;
          font-size: 14px;
          margin-top: 16px;
          color: #fff;
        }

        .login-link {
          color: #1CCB43;
          font-weight: 600;
          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        .text-adaptive {
          color: #fff;
        }

        /* ── Desktop Adjustments ── */
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

          /* Desktop removes glassmorphism */
          .auth-glass-box {
            background: transparent;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border: none;
            padding: 0;
          }

          /* Desktop back arrow — visible */
          .back-arrow-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 10px;
            border: 1.5px solid #ddd;
            background: transparent;
            cursor: pointer;
            color: #555;
            margin-bottom: 28px;
            transition: all 0.2s ease;
            padding: 0;
          }

          .back-arrow-btn:hover {
            background: #f0f0f0;
            border-color: #ccc;
            color: #333;
          }

          .auth-heading {
            font-size: 38px;
            font-weight: 700;
            color: #111;
            margin: 0 0 24px 0;
            letter-spacing: -1px;
          }

          .verify-icon-circle {
            background: rgba(28, 203, 67, 0.08);
            border-color: rgba(28, 203, 67, 0.2);
          }

          .verify-subtitle {
            color: #666;
          }

          /* Desktop OTP style */
          .otp-input {
            width: 54px;
            height: 60px;
            border: 2px solid #e0e0e0;
            background: #f3f4f6;
            color: #111;
            font-size: 24px;
          }

          .otp-input:focus {
            border-color: #1CCB43;
            box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.12);
            background: #fff;
          }

          .otp-input.filled {
            border-color: rgba(28, 203, 67, 0.4);
            background: #fff;
          }

          .otp-input.otp-success {
            border-color: #1CCB43;
            background: rgba(28, 203, 67, 0.04);
          }

          .text-adaptive {
            color: #555;
          }

          .resend-text {
            color: #888;
          }

          .resend-timer {
            color: #aaa;
          }

          .footer-login-text {
            color: #555;
          }

          .success-banner {
            background: rgba(28, 203, 67, 0.06);
            border-color: rgba(28, 203, 67, 0.2);
          }
        }

        /* Small screens: shrink OTP boxes */
        @media (max-width: 380px) {
          .otp-container {
            gap: 6px;
          }
          .otp-input {
            width: 42px;
            height: 48px;
            font-size: 18px;
            border-radius: 10px;
          }
        }
      `}</style>
    </motion.div>
  );
}
