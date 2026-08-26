import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authHero from '../assets/auth-hero.png';

export default function VerifyPhone() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Placeholder phone — in a real app, pass via route state
  const phoneNumber = '+2348123456​78';

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
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
      const nextEmpty = newCode.findIndex((c) => c === '');
      inputRefs.current[nextEmpty !== -1 ? nextEmpty : 5]?.focus();
    }
  };

  const isCodeComplete = code.every((d) => d !== '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isCodeComplete) return;
    setLoading(true);

    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      // After phone verification, send user to login instead of onboarding
      navigate('/signin');
    }, 2000);
  };

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(60);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

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
          <h2>One more step to<br />secure your account.</h2>
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
            id="verify-phone-back-btn"
            type="button"
            onClick={() => navigate(-1)}
            className="back-arrow-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h1 className="auth-heading">Verify your Phone number</h1>
          <p className="verify-phone-subtitle text-adaptive">
            We sent a 6-digit code to: <strong className="phone-highlight">{phoneNumber}</strong>
          </p>

          <div className="auth-glass-box">
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Enter code label + Edit link */}
              <div className="code-header-row">
                <span className="code-label text-adaptive">Enter code</span>
                <Link to="/add-phone-number" className="edit-link" id="verify-phone-edit-link">
                  Edit
                </Link>
              </div>

              {/* OTP Input Row */}
              <div className="otp-container" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`verify-phone-code-${index}`}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`otp-input ${digit ? 'filled' : ''}`}
                    disabled={loading}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                id="verify-phone-next-btn"
                type="submit"
                disabled={loading || !isCodeComplete}
                className="submit-btn next-btn"
                style={{
                  backgroundColor: loading
                    ? '#a8e6b8'
                    : isCodeComplete
                    ? '#1CCB43'
                    : 'rgba(28, 203, 67, 0.25)',
                  color: isCodeComplete || loading ? '#111' : 'rgba(17,17,17,0.4)',
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
                ) : (
                  'Next'
                )}
              </button>
            </form>

            {/* Resend link */}
            <p className="resend-footer text-adaptive">
              Didn't get the SMS?{' '}
              {canResend ? (
                <button
                  id="verify-phone-resend-btn"
                  type="button"
                  onClick={handleResend}
                  className="resend-link"
                >
                  Resend code.
                </button>
              ) : (
                <span className="resend-link resend-link--disabled">
                  Resend code.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@100;300;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── General Layout ── */
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

        /* ── Mobile First ── */
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

        /* ── Heading & Subtitle ── */
        .auth-heading {
          font-size: 34px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .verify-phone-subtitle {
          font-size: 15px;
          margin: 0 0 28px 0;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.75);
        }

        .phone-highlight {
          font-weight: 700;
          color: #fff;
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
          gap: 18px;
        }

        /* ── Code Header Row ── */
        .code-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: -4px;
        }

        .code-label {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
        }

        .edit-link {
          font-size: 15px;
          font-weight: 600;
          color: #1a5c3a;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .edit-link:hover {
          opacity: 0.75;
          text-decoration: underline;
        }

        /* ── OTP Inputs ── */
        .otp-container {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .otp-input {
          width: 50px;
          height: 54px;
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
          transition: all 0.25s ease;
          letter-spacing: 0.3px;
          margin-top: 4px;
        }

        .submit-btn:disabled {
          cursor: not-allowed;
        }

        .next-btn:not(:disabled):hover {
          box-shadow: 0 4px 16px rgba(28, 203, 67, 0.3);
          transform: translateY(-1px);
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }
        .spin-icon circle { opacity: 0.25; }
        .spin-icon path { opacity: 0.75; }

        /* ── Resend Footer ── */
        .resend-footer {
          text-align: center;
          font-size: 14px;
          margin: 22px 0 0 0;
          color: rgba(255, 255, 255, 0.75);
        }

        .resend-link {
          background: none;
          border: none;
          color: #1a5c3a;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          padding: 0;
          transition: opacity 0.2s;
        }

        .resend-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .resend-link--disabled {
          cursor: default;
          opacity: 0.4;
        }
        .resend-link--disabled:hover {
          opacity: 0.4;
          text-decoration: none;
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

          /* Desktop removes glassmorphism */
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
            margin: 0 0 8px 0;
            letter-spacing: -1px;
          }

          .verify-phone-subtitle {
            color: #888;
          }

          .phone-highlight {
            color: #111;
          }

          .text-adaptive {
            color: #555;
          }

          .code-label {
            color: #333;
          }

          .edit-link {
            color: #1a5c3a;
          }

          /* Desktop OTP style */
          .otp-input {
            width: 54px;
            height: 58px;
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

          .resend-footer {
            color: #888;
            text-align: left;
          }

          .resend-link {
            color: #1a5c3a;
          }
        }

        /* ── Small screens ── */
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
