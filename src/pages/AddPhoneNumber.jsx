import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authHero from '../assets/auth-hero.webp';
import BrandLogo from '../components/BrandLogo';

export default function AddPhoneNumber() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (phoneRef.current) {
      phoneRef.current.focus();
    }
  }, []);

  const handlePhoneChange = (e) => {
    // Only allow digits, max 11 chars
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhone(val);
  };

  const isValid = phone.length >= 10;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/verify-phone');
    }, 1800);
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

        {/* Desktop-only Logo */}
        <Link className="desktop-logo" to="/">
          <BrandLogo className="brand-logo-image--white" />
        </Link>
        <div className="desktop-quote">
          <h2>Almost there.<br />Let's secure your account.</h2>
        </div>
      </div>

      {/* ── Form Section ── */}
      <div className="auth-form-wrapper">
        {/* Mobile-only Top Logo */}
        <div className="mobile-logo-container">
          <Link className="mobile-logo" to="/">
            <BrandLogo className="brand-logo-image--white" />
          </Link>
        </div>

        <div className="auth-inner-content">
          {/* Back Button */}
          <button
            id="add-phone-back-btn"
            type="button"
            onClick={() => navigate(-1)}
            className="back-arrow-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h1 className="auth-heading">Add Your Phone Number</h1>
          <p className="phone-subtitle text-adaptive">
            We'll send a verification code to this number
          </p>

          <div className="auth-glass-box">
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Phone Input Row */}
              <div className="phone-row">
                {/* Country Code Prefix */}
                <div className="country-prefix">
                  <span className="flag-icon-ng">
                    <span className="flag-stripe flag-green" />
                    <span className="flag-stripe flag-white" />
                    <span className="flag-stripe flag-green" />
                  </span>
                  <span className="country-code">+234</span>
                </div>

                {/* Phone Input */}
                <input
                  id="add-phone-input"
                  ref={phoneRef}
                  type="tel"
                  inputMode="numeric"
                  placeholder="8012345678"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="phone-input-field"
                  autoComplete="tel-national"
                  disabled={loading}
                />
              </div>

              {/* Next Button */}
              <button
                id="add-phone-next-btn"
                type="submit"
                disabled={loading || !isValid}
                className="submit-btn next-btn"
                style={{
                  backgroundColor: loading
                    ? '#a8e6b8'
                    : isValid
                    ? '#1CCB43'
                    : 'rgba(28, 203, 67, 0.25)',
                  color: isValid || loading ? '#111' : 'rgba(17,17,17,0.4)',
                }}
              >
                {loading ? (
                  <>
                    <svg className="spin-icon" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending code…
                  </>
                ) : (
                  'Next'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── General Layout ── */
        .auth-layout {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .auth-bg-layer > img {
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

        .phone-subtitle {
          font-size: 15px;
          margin: 0 0 28px 0;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.75);
        }

        .auth-glass-box {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 24px;
          box-sizing: border-box;
          overflow: hidden;
          width: 100%;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ── Phone Row ── */
        .phone-row {
          display: flex;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
        }

        .country-prefix {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          background-color: rgba(255,255,255,0.85);
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.3);
          white-space: nowrap;
          flex-shrink: 0;
          min-height: 52px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .flag-icon-ng {
          display: flex;
          gap: 0;
          width: 22px;
          height: 15px;
          overflow: hidden;
          border-radius: 2px;
          flex-shrink: 0;
          border: 0.5px solid rgba(0,0,0,0.08);
        }

        .flag-stripe {
          flex: 1;
          height: 100%;
        }

        .flag-green {
          background-color: #008751;
        }

        .flag-white {
          background-color: #ffffff;
        }

        .country-code {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          letter-spacing: 0.2px;
        }

        .phone-input-field {
          flex: 1;
          min-width: 0;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.3);
          background-color: rgba(255,255,255,0.85);
          font-size: 16px;
          font-weight: 500;
          color: #222;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          min-height: 52px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.8px;
          width: 100%;
        }

        .phone-input-field::placeholder {
          color: #aaa;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .phone-input-field:focus {
          border-color: #1CCB43;
          box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.15);
          background-color: #fff;
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
          box-sizing: border-box;
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
            font-family: 'Sora', sans-serif;
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

          .phone-subtitle {
            color: #888;
          }

          .text-adaptive {
            color: #555;
          }

          /* Desktop phone inputs */
          .country-prefix {
            background-color: #f3f4f6;
            border-color: #e5e5e5;
          }

          .phone-input-field {
            background-color: #f3f4f6;
            border-color: #e5e5e5;
          }

          .phone-input-field:focus {
            border-color: #1CCB43;
            box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.1);
            background-color: #fff;
          }
        }

        /* ── Small screens ── */
        @media (max-width: 380px) {
          .phone-row {
            gap: 8px;
          }
          .country-prefix {
            padding: 0 12px;
            gap: 6px;
          }
          .country-code {
            font-size: 14px;
          }
          .phone-input-field {
            padding: 12px 14px;
            font-size: 15px;
          }
        }

        @media (max-width: 767px) {
          .auth-form-wrapper {
            padding: 24px 16px 20px;
          }

          .mobile-logo {
            padding-left: 12px;
          }

          .auth-inner-content {
            max-width: 408px;
          }

          .auth-heading {
            margin-left: 10px;
            margin-bottom: 8px;
          }

          .phone-subtitle {
            margin-left: 10px;
          }

          .auth-glass-box {
            background: rgba(246, 255, 242, 0.97);
            border: 1px solid rgba(255, 255, 255, 0.75);
            border-radius: 32px;
            padding: 34px 16px 32px;
          }

          .country-prefix,
          .phone-input-field {
            min-height: 56px;
            border: 1.5px solid #b9c4c0;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.18);
          }

          .country-prefix {
            padding: 0 14px;
          }

          .phone-input-field {
            padding: 16px 18px;
            color: #374151;
          }

          .phone-input-field::placeholder {
            color: #68727d;
          }

          .country-code {
            color: #9aa49f;
          }

          .phone-input-field:focus {
            border-color: #22c55e;
            background: rgba(255, 255, 255, 0.35);
          }

          .submit-btn {
            padding: 16px;
            border-radius: 16px;
            background-color: #24dc5b !important;
            color: #14532d;
          }
        }
      `}</style>
    </motion.div>
  );
}
