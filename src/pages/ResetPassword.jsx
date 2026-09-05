import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, ChevronLeft, Circle, Eye, EyeOff, X } from 'lucide-react';
import authHero from '../assets/auth-hero.webp';
import BrandLogo from '../components/BrandLogo';
import { apiErrorMessage } from '../services/api';
import { authService } from '../services/authService';

const passwordRules = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One number', test: (value) => /\d/.test(value) },
  { label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

function PasswordField({ id, label, value, onChange, visible, onToggle, placeholder }) {
  return (
    <label className="new-password-field" htmlFor={id}>
      <span>{label}</span>
      <span className="new-password-input-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
        <button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const refreshToken = location.state?.refreshToken || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const validPassword = passwordRules.every((rule) => rule.test(newPassword));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validPassword) {
      setError('Your new password does not meet all requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!refreshToken) {
      setError('Your password reset session has expired. Please request a new reset code.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await authService.resetPassword({
        refresh_token: refreshToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to reset your password. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const returnToSignIn = () => {
    navigate('/signin', { state: { passwordReset: true } });
  };

  return (
    <main className="new-password-layout">
      <aside className="new-password-visual" aria-label="Staffroom">
        <img src={authHero} alt="Teacher working at a laptop" />
        <div className="new-password-overlay" />
        <Link className="new-password-logo" to="/" aria-label="Staffroom home">
          <BrandLogo className="brand-logo-image--white" />
        </Link>
      </aside>

      <section className="new-password-panel" aria-labelledby="new-password-title">
        <div className="new-password-content">
          <Link className="new-password-back" to="/check-email" state={{ email: location.state?.email }} aria-label="Back to check email">
            <ChevronLeft size={20} strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <h1 id="new-password-title">Create new<br />password</h1>
          <p className="new-password-description">Choose a strong password for your Staffroom account.</p>

          <form className="new-password-form" onSubmit={handleSubmit}>
            <PasswordField id="new-password" label="New Password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} visible={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} placeholder="Enter new password" />
            <PasswordField id="confirm-password" label="Confirm Password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} placeholder="Confirm new password" />
            <ul className="new-password-rules" aria-label="Password requirements">
              {passwordRules.map((rule) => {
                const satisfied = rule.test(newPassword);
                return <li className={satisfied ? 'is-satisfied' : ''} key={rule.label}>{satisfied ? <CheckCircle2 size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}{rule.label}</li>;
              })}
            </ul>
            {error && <p className="new-password-error" role="alert">{error}</p>}
            <button className="new-password-submit" type="submit" disabled={submitting}>{submitting ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        </div>
      </section>

      {showSuccess && (
        <div className="password-success-backdrop">
          <section className="password-success-dialog" role="dialog" aria-modal="true" aria-labelledby="password-success-title">
            <div className="password-success-header">
              <span className="password-success-icon"><Check size={40} strokeWidth={3} aria-hidden="true" /></span>
              <h2 id="password-success-title">Password reset successfully</h2>
              <button type="button" onClick={returnToSignIn} aria-label="Close success message"><X size={39} strokeWidth={2.25} aria-hidden="true" /></button>
            </div>
            <p>Your password has been reset successfully</p>
            <button className="password-success-confirm" type="button" onClick={returnToSignIn}>Okay</button>
          </section>
        </div>
      )}

      <style>{`
        .new-password-layout { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); font-family: 'DM Sans', sans-serif; background: #fafff8; }
        .new-password-visual { position: relative; min-height: 100vh; overflow: hidden; }
        .new-password-visual img, .new-password-overlay { position: absolute; inset: 0; width: 100%; height: 100%; }
        .new-password-visual img { object-fit: cover; object-position: center; }
        .new-password-overlay { background: rgba(41, 78, 32, 0.5); }
        .new-password-logo { position: absolute; top: 48px; left: 36px; z-index: 1; display: block; }
        .new-password-logo .brand-logo-image { width: 132px; }
        .new-password-panel { display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
        .new-password-content { width: min(100%, 343px); margin-top: -4px; }
        .new-password-back { display: inline-flex; align-items: center; margin-bottom: 24px; color: #252b2a; }
        .new-password-content h1 { margin: 0; color: #1c2020; font-family: 'Sora', sans-serif; font-size: 37px; font-weight: 700; line-height: 1.08; letter-spacing: 0; }
        .new-password-description { margin: 8px 0 17px; color: #858b8c; font-size: 12px; line-height: 18px; }
        .new-password-form { display: flex; flex-direction: column; gap: 11px; }
        .new-password-field { display: flex; flex-direction: column; gap: 5px; color: #273343; font-size: 12px; font-weight: 700; }
        .new-password-input-wrap { display: flex; align-items: center; height: 42px; padding-left: 11px; border: 1px solid #d5ddda; border-radius: 7px; color: #84928e; }
        .new-password-input-wrap:focus-within { border-color: #1ccb43; box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.12); }
        .new-password-input-wrap input { min-width: 0; flex: 1; height: 100%; border: 0; background: transparent; color: #26302d; font: inherit; font-size: 12px; outline: 0; }
        .new-password-input-wrap input::placeholder { color: #84928e; font-weight: 400; }
        .new-password-input-wrap button { display: grid; width: 38px; height: 100%; place-items: center; border: 0; background: transparent; color: #87928f; cursor: pointer; }
        .new-password-rules { display: flex; flex-direction: column; gap: 7px; margin: 6px 0 7px; padding: 15px 12px; border: 1px solid #d5ddda; border-radius: 7px; color: #626c6b; font-size: 11px; line-height: 14px; list-style: none; }
        .new-password-rules li { display: flex; align-items: center; gap: 5px; }
        .new-password-rules .is-satisfied { color: #1c5b3a; font-weight: 600; }
        .new-password-rules .is-satisfied svg { color: #117a55; fill: #117a55; stroke: #fff; }
        .new-password-error { margin: -3px 0 0; color: #b42318; font-size: 12px; line-height: 16px; }
        .new-password-submit { height: 48px; margin-top: 0; border: 0; border-radius: 12px; background: #25d94d; color: #102415; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background-color 160ms ease; }
        .new-password-submit:hover { background: #1ccb43; }
        .new-password-submit:disabled { cursor: wait; opacity: 0.7; }
        .new-password-back:focus-visible, .new-password-input-wrap button:focus-visible, .new-password-submit:focus-visible { outline: 3px solid rgba(28, 203, 67, 0.35); outline-offset: 3px; }
        .password-success-backdrop { position: fixed; z-index: 50; inset: 0; display: grid; place-items: center; padding: 18px; background: rgba(19, 28, 23, 0.28); }
        .password-success-dialog { width: min(100%, 870px); min-height: 396px; padding: 30px 33px; border: 1px solid #a9afb0; border-radius: 29px; background: #fbfbfc; box-shadow: 0 6px 18px rgba(19, 28, 23, 0.18); color: #080909; }
        .password-success-header { display: flex; align-items: center; gap: 32px; }
        .password-success-icon { display: grid; width: 80px; height: 80px; flex: 0 0 auto; place-items: center; border-radius: 50%; background: #138435; color: #fff; }
        .password-success-header h2 { margin: 0; flex: 1; font-family: 'Sora', sans-serif; font-size: 30px; font-weight: 700; line-height: 1.2; }
        .password-success-header button { display: grid; width: 46px; height: 46px; place-items: center; border: 0; background: transparent; color: #080909; cursor: pointer; }
        .password-success-dialog > p { margin: 34px 0 0 87px; font-size: 30px; line-height: 1.2; }
        .password-success-confirm { display: block; width: 244px; height: 96px; margin: 84px 0 0 auto; border: 0; border-radius: 50px; background: #25d94d; color: #152238; font: inherit; font-size: 30px; cursor: pointer; }
        .password-success-confirm:hover { background: #1ccb43; }
        .password-success-header button:focus-visible, .password-success-confirm:focus-visible { outline: 3px solid rgba(28, 203, 67, 0.35); outline-offset: 3px; }

        @media (max-width: 767px) {
          .new-password-layout { display: block; }
          .new-password-visual { min-height: 168px; height: 24vh; }
          .new-password-logo { top: 28px; left: 24px; }
          .new-password-panel { min-height: calc(100vh - 168px); align-items: flex-start; padding: 36px 24px 48px; }
          .new-password-content { margin: 0; }
          .password-success-dialog { min-height: 300px; padding: 24px; border-radius: 20px; }
          .password-success-header { gap: 16px; }
          .password-success-icon { width: 54px; height: 54px; }
          .password-success-header h2 { font-size: 21px; }
          .password-success-header button { width: 32px; height: 32px; }
          .password-success-dialog > p { margin: 32px 0 0; font-size: 22px; }
          .password-success-confirm { width: 170px; height: 62px; margin-top: 54px; font-size: 22px; }
        }
      `}</style>
    </main>
  );
}