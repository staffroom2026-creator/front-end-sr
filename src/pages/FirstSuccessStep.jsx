import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

export default function FirstSuccessStep() {
  return (
    <div className="fss-page">
      <header className="fss-header">
        <Link to="/" className="fss-logo" aria-label="Staffroom home">
          <BrandLogo />
        </Link>
      </header>

      <main className="fss-main">
        <div className="fss-card">
          <div className="fss-icon-wrap" aria-hidden="true">
            <div className="fss-badge">
              <svg viewBox="0 0 64 64" className="fss-check" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 32.5L28.5 41L45 24.5" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="fss-orbit orbit-1" />
            <div className="fss-orbit orbit-2" />
            <div className="fss-orbit orbit-3" />
            <div className="fss-orbit orbit-4" />
            <div className="fss-orbit orbit-5" />
            <div className="fss-orbit orbit-6" />
          </div>

          <h1 className="fss-title">You&apos;re all set!</h1>

          <p className="fss-copy">
            Your Staffroom account has been created and your basic profile is ready.
          </p>

          <p className="fss-copy fss-copy--secondary">
            You can now explore teaching opportunities on Staffroom and complete the rest of your profile when you&apos;re ready.
          </p>

          <div className="fss-actions">
            <Link to="/" className="fss-btn fss-btn--primary">
              <span aria-hidden="true">⌕</span>
              Explore Jobs
            </Link>
            <Link to="/teacher-dashboard" className="fss-btn fss-btn--secondary">
              <span aria-hidden="true">◌</span>
              Go to My Profile
            </Link>
          </div>

          <div className="fss-dots" aria-label="Step indicator">
            <span className="fss-dot is-active" />
            <span className="fss-dot" />
          </div>
        </div>
      </main>

      <style>{`
        .fss-page {
          min-height: 100vh;
          background: #f3f3f2;
          color: #1b1d20;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        .fss-header {
          padding: 28px 0 0 60px;
        }

        .fss-logo {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          line-height: 1;
        }

        .fss-logo img {
          width: 158px;
          display: block;
          height: auto;
        }

        .fss-main {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 120px);
          padding: 20px;
        }

        .fss-card {
          width: 100%;
          max-width: 540px;
          text-align: center;
        }

        .fss-icon-wrap {
          position: relative;
          width: 138px;
          height: 138px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
        }

        .fss-badge {
          position: relative;
          z-index: 2;
          width: 96px;
          height: 96px;
          border-radius: 26px;
          background: #c8edd8;
          color: #0f9c4a;
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(19, 113, 59, 0.08);
        }

        .fss-check {
          width: 46px;
          height: 46px;
          stroke: currentColor;
        }

        .fss-orbit {
          position: absolute;
          border-radius: 999px;
          border: 2px solid rgba(15, 156, 74, 0.18);
          background: rgba(255, 255, 255, 0.06);
        }

        .orbit-1 { width: 116px; height: 116px; transform: rotate(18deg); }
        .orbit-2 { width: 124px; height: 124px; transform: rotate(12deg); }
        .orbit-3 { width: 132px; height: 132px; transform: rotate(28deg); }
        .orbit-4 { width: 116px; height: 116px; transform: rotate(58deg); }
        .orbit-5 { width: 124px; height: 124px; transform: rotate(76deg); }
        .orbit-6 { width: 132px; height: 132px; transform: rotate(103deg); }

        .fss-title {
          margin: 0;
          font-size: clamp(2.3rem, 3.2vw, 4rem);
          line-height: 1.04;
          letter-spacing: -0.065em;
          font-weight: 700;
          color: #1d2028;
        }

        .fss-copy {
          max-width: 500px;
          margin: 18px auto 0;
          font-size: 15px;
          line-height: 1.6;
          color: #60666d;
        }

        .fss-copy--secondary {
          margin-top: 10px;
        }

        .fss-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 22px;
          flex-wrap: wrap;
        }

        .fss-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 188px;
          height: 48px;
          padding: 0 20px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          transition: all 0.2s ease;
        }

        .fss-btn--primary {
          background: linear-gradient(180deg, #2fda59 0%, #1fcb48 100%);
          color: #0d1726;
          box-shadow: 0 8px 18px rgba(31, 203, 72, 0.25);
        }

        .fss-btn--secondary {
          background: #f8f8f8;
          color: #1c2430;
          border: 1px solid #dfe2e3;
        }

        .fss-btn:hover {
          transform: translateY(-1px);
        }

        .fss-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 28px;
        }

        .fss-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(17, 24, 39, 0.18);
        }

        .fss-dot.is-active {
          background: #1f2937;
        }

        @media (max-width: 640px) {
          .fss-header {
            padding-left: 24px;
          }

          .fss-logo img {
            width: 138px;
          }

          .fss-actions {
            flex-direction: column;
          }

          .fss-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
