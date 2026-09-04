import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import authHero from '../assets/auth-hero.webp';
import BrandLogo from '../components/BrandLogo';

export default function CheckEmail() {
  const location = useLocation();
  const email = location.state?.email || 'your email address';
  const openMailClient = () => {
    window.location.href = 'mailto:';
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
          <h1 id="check-email-title">Check you email</h1>
          <p className="check-email-copy">We&apos;ve sent a password reset link to:<br />{email}</p>
          <p className="check-email-copy check-email-instructions">Open the email and follow the link to create a new password.</p>
          <button className="check-email-button" type="button" onClick={openMailClient}>
            Open Email
          </button>
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
        .check-email-button { display: flex; align-items: center; justify-content: center; width: 100%; height: 48px; margin-top: 21px; border: 0; border-radius: 12px; background: #25d94d; color: #102415; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background-color 160ms ease; }
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