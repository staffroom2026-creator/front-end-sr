import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import authHero from '../assets/auth-hero.webp';
import BrandLogo from '../components/BrandLogo';

export default function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email address';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setError('');

    if (value && index < nextOtp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedOtp = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedOtp) return;

    const nextOtp = [...otp];
    pastedOtp.split('').forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    setError('');
    inputRefs.current[Math.min(pastedOtp.length, 6) - 1]?.focus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }

    navigate('/reset-password', { state: { email, otp: fullOtp } });
  };

  return (
    <main className="check-email-layout">
      <aside className="check-email-visual" aria-label="Staffroom">
        <img src={authHero} alt="Teacher working at a laptop" />
        <div className="check-email-overlay" />
        <Link className="check-email-logo" to="/" aria-label="Staffroom home">
          <BrandLogo className="brand-logo-image--white" />
        </Link>
      </aside>

      <section className="check-email-panel" aria-labelledby="check-email-title">
        <div className="check-email-content">
          <Link className="check-email-back" to="/forgot-password" aria-label="Back to forgot password">
            <ChevronLeft size={20} strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <h1 id="check-email-title">Check your email</h1>
          <p className="check-email-copy">We&apos;ve sent a password reset code to:<br />{email}</p>
          <p className="check-email-copy check-email-instructions">Enter the 6-digit code below to create a new password.</p>
          <form className="check-email-form" onSubmit={handleSubmit}>
            <span className="check-email-code-label">Verification code</span>
            <div className="check-email-otp-container" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
                  ref={(element) => { inputRefs.current[index] = element; }}
                  className={`check-email-otp-input ${digit ? 'filled' : ''} ${error ? 'otp-error' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  autoComplete="one-time-code"
                  aria-label={`Verification code digit ${index + 1}`}
                />
              ))}
            </div>
            {error && <p className="check-email-error" role="alert">{error}</p>}
            <button className="check-email-button" type="submit">
              Continue
            </button>
          </form>
        </div>
      </section>

      <style>{`
        .check-email-layout { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); font-family: 'DM Sans', sans-serif; background: #fafff8; }
        .check-email-visual { position: relative; min-height: 100vh; overflow: hidden; }
        .check-email-visual img, .check-email-overlay { position: absolute; inset: 0; width: 100%; height: 100%; }
        .check-email-visual img { object-fit: cover; object-position: center; }
        .check-email-overlay { background: rgba(41, 78, 32, 0.5); }
        .check-email-logo { position: absolute; top: 48px; left: 36px; z-index: 1; display: block; }
        .check-email-logo .brand-logo-image { width: 132px; }
        .check-email-panel { display: flex; align-items: center; justify-content: center; padding: 48px 32px; background: #fafff8; }
        .check-email-content { width: min(100%, 343px); margin-top: -4px; }
        .check-email-back { display: inline-flex; align-items: center; margin-bottom: 24px; color: #252b2a; }
        .check-email-content h1 { margin: 0; color: #1c2020; font-family: 'Sora', sans-serif; font-size: 37px; font-weight: 700; line-height: 1.08; letter-spacing: 0; }
        .check-email-copy { margin: 14px 0 0; color: #858b8c; font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
        .check-email-instructions { margin-top: 13px; }
        .check-email-form { display: flex; flex-direction: column; gap: 7px; margin-top: 21px; }
        .check-email-code-label { color: #374151; font-size: 12px; font-weight: 600; }
        .check-email-otp-container { display: flex; justify-content: center; gap: 8px; width: 100%; max-width: 320px; margin: 0 auto; }
        .check-email-otp-input { flex: 1 1 0; width: 100%; min-width: 0; height: 52px; border: 1.5px solid #b9c4c0; border-radius: 14px; background: rgba(255, 255, 255, 0.18); color: #374151; font: inherit; font-size: 22px; font-weight: 700; text-align: center; outline: none; caret-color: #1ccb43; transition: all 0.25s ease; }
        .check-email-otp-input:focus, .check-email-otp-input.filled { border-color: #22c55e; background: rgba(255, 255, 255, 0.35); box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.12); }
        .check-email-otp-input.otp-error { border-color: #ff5252; box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.15); }
        .check-email-error { margin: 1px 0 0; color: #b42318; font-size: 12px; line-height: 16px; }
        .check-email-button { display: flex; align-items: center; justify-content: center; width: 100%; height: 48px; margin-top: 14px; border: 0; border-radius: 12px; background: #25d94d; color: #102415; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background-color 160ms ease; }
        .check-email-button:hover { background: #1ccb43; }
        .check-email-back:focus-visible, .check-email-button:focus-visible { outline: 3px solid rgba(28, 203, 67, 0.35); outline-offset: 3px; }

        @media (max-width: 767px) {
          .check-email-layout { display: block; }
          .check-email-visual { min-height: 168px; height: 24vh; }
          .check-email-logo { top: 28px; left: 24px; }
          .check-email-panel { min-height: calc(100vh - 168px); align-items: flex-start; padding: 36px 24px 48px; }
          .check-email-content { margin: 0; }
        }
      `}</style>
    </main>
  );
}