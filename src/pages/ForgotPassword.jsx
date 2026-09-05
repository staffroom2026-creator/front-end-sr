import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail } from 'lucide-react';
import authHero from '../assets/auth-hero.webp';
import BrandLogo from '../components/BrandLogo';
import { apiErrorMessage } from '../services/api';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      setSubmitting(true);
      setError('');
      await authService.forgotPassword({ email: normalizedEmail });
      navigate('/check-email', { state: { email: normalizedEmail } });
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to send the password reset code.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="password-reset-layout">
      <aside className="password-reset-visual" aria-label="Staffroom">
        <img src={authHero} alt="Teacher working at a laptop" />
        <div className="password-reset-overlay" />
        <Link className="password-reset-logo" to="/" aria-label="Staffroom home">
          <BrandLogo className="brand-logo-image--white" />
        </Link>
      </aside>

      <section className="password-reset-panel" aria-labelledby="forgot-password-title">
        <div className="password-reset-content">
          <Link className="password-reset-back" to="/signin" aria-label="Back to sign in">
            <ChevronLeft size={20} strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <h1 id="forgot-password-title">Forgot your<br />password?</h1>
          <p className="password-reset-description">
            No worries. Enter the email address linked to your Staffroom account and we&apos;ll send you a password reset code.
          </p>

          <form className="password-reset-form" onSubmit={handleSubmit}>
            <label htmlFor="reset-email">Email Address</label>
            <div className="password-reset-input-wrap">
              <Mail size={17} strokeWidth={1.8} aria-hidden="true" />
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {error && <p className="password-reset-feedback password-reset-error" role="alert">{error}</p>}
            <button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Next'}</button>
          </form>
        </div>
      </section>

      <style>{`
        .password-reset-layout {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          font-family: 'DM Sans', sans-serif;
          background: #fafff8;
        }

        .password-reset-visual {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .password-reset-visual img,
        .password-reset-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .password-reset-visual img { object-fit: cover; object-position: center; }
        .password-reset-overlay { background: rgba(41, 78, 32, 0.5); }
        .password-reset-logo { position: absolute; top: 48px; left: 36px; z-index: 1; display: block; }
        .password-reset-logo .brand-logo-image { width: 132px; }

        .password-reset-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: #fafff8;
        }

        .password-reset-content { width: min(100%, 343px); margin-top: -4px; }
        .password-reset-back { display: inline-flex; align-items: center; color: #252b2a; margin-bottom: 24px; }
        .password-reset-back:focus-visible, .password-reset-form input:focus-visible, .password-reset-form button:focus-visible { outline: 3px solid rgba(28, 203, 67, 0.35); outline-offset: 3px; }
        .password-reset-content h1 { margin: 0; color: #1c2020; font-family: 'Sora', sans-serif; font-size: 37px; font-weight: 700; line-height: 1.08; letter-spacing: 0; }
        .password-reset-description { margin: 7px 0 18px; color: #858b8c; font-size: 12px; line-height: 18px; }
        .password-reset-form { display: flex; flex-direction: column; gap: 8px; }
        .password-reset-form label { color: #374151; font-size: 12px; font-weight: 600; }
        .password-reset-input-wrap { display: flex; align-items: center; height: 42px; padding: 0 11px; border: 1px solid #d5ddda; border-radius: 7px; background: transparent; color: #c0cac6; }
        .password-reset-input-wrap:focus-within { border-color: #1ccb43; box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.12); }
        .password-reset-form input { min-width: 0; flex: 1; padding: 0 8px; border: 0; background: transparent; color: #26302d; font: inherit; font-size: 12px; outline: none; }
        .password-reset-form input::placeholder { color: #adb7b3; }
        .password-reset-form button { height: 48px; margin-top: 17px; border: 0; border-radius: 12px; background: #25d94d; color: #102415; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background-color 160ms ease; }
        .password-reset-form button:hover:not(:disabled) { background: #1ccb43; }
        .password-reset-form button:disabled { cursor: wait; opacity: 0.7; }
        .password-reset-feedback { margin: 2px 0 0; font-size: 12px; line-height: 17px; }
        .password-reset-error { color: #b42318; }
        .password-reset-success { color: #16763a; }

        @media (max-width: 767px) {
          .password-reset-layout { display: block; background: #fafff8; }
          .password-reset-visual { min-height: 168px; height: 24vh; }
          .password-reset-logo { top: 28px; left: 24px; }
          .password-reset-panel { min-height: calc(100vh - 168px); align-items: flex-start; padding: 36px 24px 48px; }
          .password-reset-content { margin: 0; }
        }
      `}</style>
    </main>
  );
}