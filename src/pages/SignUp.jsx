import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authHero from '../assets/auth-hero.webp';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
  });

  const handlePhoneChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      phone: event.target.value.replace(/\D/g, ''),
    }));
  };

  const passwordsDoNotMatch = Boolean(form.confirmPassword) && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions to continue.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const payload =
        role === 'teacher'
          ? {
              full_name: `${form.firstName} ${form.lastName}`.trim(),
              first_name: form.firstName,
              last_name: form.lastName,
              terms: 1,
              email: form.email,
              phone: form.phone,
              password: form.password,
              role: 'teacher',
            }
          : {
              full_name: form.schoolName.trim(),
              email: form.email,
              phone: form.phone,
              password: form.password,
              role: 'school',
              school_type: 'private',
              terms: 1,
            };

      const result = await register(payload);
      const emailToVerify = form.email;
      const schoolDraft = role === 'school'
        ? {
            schoolName: form.schoolName,
            email: form.email,
            phone: form.phone,
          }
        : null;

      // Store email and role so the verification flow can route school signups correctly.
      localStorage.setItem('staffroom_verification_email', emailToVerify);
      localStorage.setItem('staffroom_verification_role', role);
      if (schoolDraft) {
        localStorage.setItem('staffroom_school_signup_draft', JSON.stringify(schoolDraft));
      }
      // Redirect user to email verification step before login
      navigate('/verify-email', { state: { email: emailToVerify, role } });
    } catch (err) {
      setError(apiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => open ? (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="su-layout">

      {/* ══════════════════════════════════
          MOBILE VIEW (< 768px)
          Full-screen image + glass card
      ══════════════════════════════════ */}
      <div className="su-mobile-view">
        {/* Background */}
        <img src={authHero} alt="" className="su-mob-bg" />
        <div className="su-mob-overlay" />

        {/* Logo */}
        <Link to="/" className="su-mob-logo">
          <BrandLogo className="brand-logo-image--white" />
        </Link>

        {/* Content */}
        <div className="su-mob-content">
          <h1 className="su-mob-title">Create an account</h1>

          {/* Glass card */}
          <div className="su-mob-card">

            {/* Role selector for Mobile */}
            <div className="su-mob-role-section">
              <p className="su-mob-role-label">Sign up as</p>
              <div className="su-mob-role-pills">
                <button
                  type="button"
                  id="mob-role-teacher"
                  className={`su-mob-pill ${role === 'teacher' ? 'su-mob-pill--active' : ''}`}
                  onClick={() => setRole('teacher')}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  id="mob-role-admin"
                  className={`su-mob-pill ${role === 'school' ? 'su-mob-pill--active' : ''}`}
                  onClick={() => setRole('school')}
                >
                  School Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="su-mob-form">

              {error && (
                <div className="su-error" style={{ color: '#b91c1c', marginBottom: '12px', fontSize: '13px' }}>{error}</div>
              )}

              {/* Teacher fields */}
              {role === 'teacher' && (
                <>
                  <input id="mob-firstname" type="text" required autoComplete="given-name"
                    placeholder="First Name" value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="su-mob-input" />
                  <input id="mob-lastname" type="text" required autoComplete="family-name"
                    placeholder="Last Name" value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="su-mob-input" />
                  <input id="mob-email" type="email" required autoComplete="email"
                    placeholder="Email Address" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="su-mob-input" />
                  <input id="mob-phone" type="tel" inputMode="numeric" required autoComplete="tel"
                    placeholder="Phone number" value={form.phone}
                    onChange={handlePhoneChange}
                    className="su-mob-input" />
                </>
              )}

              {/* School Admin fields */}
              {role === 'school' && (
                <>
                  <input id="mob-school" type="text" required autoComplete="organization"
                    placeholder="Schools name" value={form.schoolName}
                    onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                    className="su-mob-input" />
                  <input id="mob-official-email" type="email" required autoComplete="email"
                    placeholder="Official Email address" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="su-mob-input" />
                  <input id="mob-school-phone" type="tel" inputMode="numeric" required autoComplete="tel"
                    placeholder="Phone number" value={form.phone}
                    onChange={handlePhoneChange}
                    className="su-mob-input" />
                </>
              )}

              {/* Password */}
              <div className="su-mob-input-wrap">
                <input id="mob-password" type={showPassword ? 'text' : 'password'} required
                  autoComplete="new-password" placeholder="Password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="su-mob-input su-mob-input--icon" />
                <button type="button" className="su-mob-eye" onClick={() => setShowPassword(!showPassword)}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Confirm password */}
              <div className="su-mob-input-wrap">
                <input id="mob-confirm" type={showConfirm ? 'text' : 'password'} required
                  autoComplete="new-password" placeholder="Confirmed password" value={form.confirmPassword}
                  aria-invalid={passwordsDoNotMatch}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="su-mob-input su-mob-input--icon" />
                <button type="button" className="su-mob-eye" onClick={() => setShowConfirm(!showConfirm)}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {passwordsDoNotMatch && <p className="su-password-error" role="alert">Passwords do not match.</p>}

              {/* Terms Checkbox */}
              <label className="su-mob-terms-row" htmlFor="mob-terms">
                <input id="mob-terms" type="checkbox" className="su-mob-checkbox"
                  checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                <span className="su-mob-terms-text">
                  I confirm that i agree to the{' '}
                  <Link to="/terms" className="su-mob-terms-link">terms and conditions</Link>
                  {' '}below
                </span>
              </label>

              {/* Sign Up */}
              <button id="mob-submit" type="submit" disabled={loading || !agreedToTerms} className="su-mob-submit">
                {loading ? (
                  <>
                    <svg className="su-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing up…
                  </>
                ) : 'Sign Up'}
              </button>

            </form>

            {/* Footer */}
            <p className="su-mob-footer">
              Already have a Staffroom account?{' '}
              <Link to="/signin" className="su-mob-signin">Sign in.</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          DESKTOP VIEW (≥ 768px)
          Split: photo left | form right
      ══════════════════════════════════ */}
      <div className="su-desktop-view">

        {/* Left: Photo Panel */}
        <div className="su-photo-panel">
          <img src={authHero} alt="Teacher working at laptop" className="su-photo-img" />
          <div className="su-photo-overlay" />
          <Link to="/" className="su-logo">
            <BrandLogo className="brand-logo-image--white" />
          </Link>
          <div className="su-photo-quote">
            <p>Ready to connect, teach, or hire?<br />Join Staffroom today.</p>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="su-form-panel">
          <div className="su-form-inner">

            <h1 className="su-title">Create an account</h1>

            {/* Role toggle */}
            <div className="su-role-section">
              <p className="su-role-label">Sign up as</p>
              <div className="su-role-pills">
                <button type="button" id="signup-role-teacher"
                  className={`su-pill ${role === 'teacher' ? 'su-pill--active' : ''}`}
                  onClick={() => setRole('teacher')}>Teacher</button>
                <button type="button" id="signup-role-admin"
                  className={`su-pill ${role === 'school' ? 'su-pill--active' : ''}`}
                  onClick={() => setRole('school')}>School Admin</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="su-form">

              {error && (
                <div className="su-error" style={{ color: '#b91c1c', marginBottom: '12px', fontSize: '14px' }}>{error}</div>
              )}

              {/* Teacher fields */}
              {role === 'teacher' && (
                <>
                  <input id="signup-firstname" type="text" required autoComplete="given-name"
                    placeholder="First name" value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="su-input" />
                  <input id="signup-lastname" type="text" required autoComplete="family-name"
                    placeholder="Last name" value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="su-input" />
                  <input id="signup-email" type="email" required autoComplete="email"
                    placeholder="Email address" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="su-input" />
                  <input id="signup-phone" type="tel" inputMode="numeric" required autoComplete="tel"
                    placeholder="Phone number" value={form.phone}
                    onChange={handlePhoneChange}
                    className="su-input" />
                </>
              )}

              {/* School Admin fields */}
              {role === 'school' && (
                <>
                  <input id="signup-school-name" type="text" required autoComplete="organization"
                    placeholder="Schools name" value={form.schoolName}
                    onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                    className="su-input" />
                  <input id="signup-official-email" type="email" required autoComplete="email"
                    placeholder="Official Email address" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="su-input" />
                  <input id="signup-school-phone" type="tel" inputMode="numeric" required autoComplete="tel"
                    placeholder="Phone number" value={form.phone}
                    onChange={handlePhoneChange}
                    className="su-input" />
                </>
              )}

              {/* Password */}
              <div className="su-input-wrap">
                <input id="signup-password" type={showPassword ? 'text' : 'password'} required
                  autoComplete="new-password" placeholder="Password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="su-input su-input--icon" />
                <button type="button" id="signup-toggle-password" className="su-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Confirm password */}
              <div className="su-input-wrap">
                <input id="signup-confirm-password" type={showConfirm ? 'text' : 'password'} required
                  autoComplete="new-password" placeholder="Confirmed password" value={form.confirmPassword}
                  aria-invalid={passwordsDoNotMatch}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="su-input su-input--icon" />
                <button type="button" id="signup-toggle-confirm" className="su-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {passwordsDoNotMatch && <p className="su-password-error" role="alert">Passwords do not match.</p>}

              {/* Terms */}
              <label className="su-terms-row" htmlFor="signup-terms">
                <input id="signup-terms" type="checkbox" className="su-checkbox"
                  checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                <span className="su-terms-text">
                  I confirm that i agree to the{' '}
                  <Link to="/terms" className="su-terms-link">terms and conditions</Link>
                  {' '}below
                </span>
              </label>

              {/* Submit */}
              <button id="signup-submit-btn" type="submit"
                disabled={loading || !agreedToTerms} className="su-submit-btn">
                {loading ? (
                  <><svg className="su-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>Signing up…</>
                ) : 'Sign Up'}
              </button>

            </form>

            <p className="su-footer-text">
              Already have a Staffroom account?{' '}
              <Link to="/signin" className="su-signin-link">Sign in.</Link>
            </p>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes su-spin { to { transform: rotate(360deg); } }
        .su-spin { animation: su-spin 1s linear infinite; flex-shrink: 0; }
        .su-spin circle { opacity: 0.25; }
        .su-spin path { opacity: 0.75; }
        *, *::before, *::after { box-sizing: border-box; }
        .su-password-error { margin: -4px 0 0; color: #b91c1c; font-size: 12px; line-height: 16px; }
        .su-input[aria-invalid="true"], .su-mob-input[aria-invalid="true"] { border-color: #b91c1c; }

        .su-layout {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        /* ════════════════════════════════
           MOBILE VIEW
        ════════════════════════════════ */
        .su-mobile-view {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: relative;
        }
        .su-desktop-view { display: none; }

        /* Background image */
        .su-mob-bg {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          z-index: 0;
        }

        /* Green overlay */
        .su-mob-overlay {
          position: fixed;
          inset: 0;
          background: rgba(120, 230, 68, 0.25);
          z-index: 1;
        }

        /* Logo */
        .su-mob-logo {
          position: fixed;
          top: 28px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          z-index: 10;
          letter-spacing: -0.3px;
        }

        /* Content wrapper */
        .su-mob-content {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 100vh;
          padding: 100px 16px 24px;
        }

        /* Title */
        .su-mob-title {
          font-size: 32px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 20px 4px;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        /* Glass card */
        .su-mob-card {
          background: rgba(246, 255, 242, 0.97);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 32px;
          padding: 36px 27px 48px;
        }

        /* Mobile Role Selector */
        .su-mob-role-section {
          margin-bottom: 14px;
        }
        .su-mob-role-label {
          font-size: 13px;
          color: #374151;
          margin: 0 0 8px 2px;
          font-weight: 500;
        }
        .su-mob-role-pills {
          display: flex;
          gap: 8px;
        }
        .su-mob-pill {
          padding: 8px 18px;
          border-radius: 50px;
          border: 1.5px solid #cbd5d1;
          background: transparent;
          font-size: 13.5px;
          font-weight: 600;
          color: #aeb7b3;
          cursor: pointer;
          transition: all 0.18s;
          font-family: 'DM Sans', sans-serif;
        }
        .su-mob-pill--active {
          background: #24dc5b;
          border-color: #24dc5b;
          color: #14532d;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.35);
        }

        .su-mob-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Mobile inputs */
        .su-mob-input {
          width: 100%;
          padding: 15px 18px;
          border-radius: 16px;
          border: 1.5px solid #b9c4c0;
          background: rgba(255, 255, 255, 0.18);
          font-size: 14px;
          color: #374151;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.18s;
        }
        .su-mob-input::placeholder { color: #68727d; }
        .su-mob-input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.15);
          background: rgba(255,255,255,0.35);
        }
        .su-mob-input--icon { padding-right: 48px; }

        .su-mob-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .su-mob-eye {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #6B7280;
          padding: 0;
          display: flex;
          align-items: center;
        }

        /* Mobile Terms */
        .su-mob-terms-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          margin: 4px 2px 2px;
        }
        .su-mob-checkbox {
          width: 17px;
          height: 17px;
          margin-top: 2px;
          border-radius: 4px;
          cursor: pointer;
          accent-color: #22C55E;
          flex-shrink: 0;
        }
        .su-mob-terms-text {
          font-size: 13px;
          color: #b8c0bd;
          line-height: 1.4;
        }
        .su-mob-terms-link {
          font-weight: 700;
          color: #263247;
          text-decoration: underline;
        }

        /* Mobile submit */
        .su-mob-submit {
          width: 100%;
          padding: 16px;
          background: transparent;
          color: #596171;
          border: 1.5px solid #b9c4c0;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.18s;
          margin-top: 4px;
        }
        .su-mob-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .su-mob-submit:hover:not(:disabled) { opacity: 0.9; }

        /* Mobile footer */
        .su-mob-footer {
          text-align: center;
          font-size: 13.5px;
          color: #263247;
          margin: 22px 0 0;
        }
        .su-mob-signin {
          color: #1fd957;
          font-weight: 600;
          text-decoration: none;
        }

        /* ════════════════════════════════
           DESKTOP VIEW (≥ 768px)
        ════════════════════════════════ */
        @media (min-width: 768px) {
          .su-mobile-view { display: none; }
          .su-desktop-view {
            display: flex;
            min-height: 100vh;
            background: #F5F7F0;
          }

          /* Photo panel */
          .su-photo-panel {
            position: relative;
            width: 50%;
            flex-shrink: 0;
            overflow: hidden;
          }
          .su-photo-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
          }
          .su-photo-overlay {
            position: absolute;
            inset: 0;
            background: rgba(120, 230, 68, 0.25);
            z-index: 1;
          }
          .su-logo {
            position: absolute;
            top: 28px;
            left: 30px;
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: #fff;
            font-weight: 700;
            font-size: 17px;
            letter-spacing: -0.4px;
            z-index: 2;
          }
          .su-photo-quote {
            position: absolute;
            top: 40%;
            transform: translateY(-20%);
            left: 20px;
            right: 40px;
            z-index: 2;
          }
          .su-photo-quote p {
            color: #fff;
            font-family: 'Sora', sans-serif;
            font-weight: 400;
            font-style: normal;
            font-size: 28px;
            line-height: 55px;
            letter-spacing: 0;
            margin: 0;
            padding: 0 120px;
          }

          /* Form panel */
          .su-form-panel {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 32px;
            background: #F5F7F0;
            min-height: 100vh;
          }
          .su-form-inner {
            width: 100%;
            max-width: 420px;
          }

          /* Title */
          .su-title {
            font-size: 36px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 24px 0;
            letter-spacing: -0.8px;
            line-height: 1.15;
          }

          /* Role Toggle */
          .su-role-section { margin-bottom: 24px; }
          .su-role-label {
            font-size: 13px;
            color: #6B7280;
            margin: 0 0 10px 0;
            font-weight: 400;
          }
          .su-role-pills { display: flex; gap: 10px; }
          .su-pill {
            padding: 9px 22px;
            border-radius: 50px;
            border: 1.5px solid #D1D5DB;
            background: transparent;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            cursor: pointer;
            transition: all 0.18s;
            font-family: 'DM Sans', sans-serif;
          }
          .su-pill:hover { border-color: #9CA3AF; }
          .su-pill--active {
            background: #22C55E;
            border-color: #22C55E;
            color: #fff;
          }

          /* Form */
          .su-form { display: flex; flex-direction: column; gap: 12px; }

          /* Inputs */
          .su-input {
            width: 100%;
            padding: 14px 18px;
            border-radius: 50px;
            border: 1.5px solid #E5E7EB;
            background: #fff;
            font-size: 14px;
            color: #374151;
            outline: none;
            transition: border-color 0.18s, box-shadow 0.18s;
            font-family: 'DM Sans', sans-serif;
          }
          .su-input::placeholder { color: #9CA3AF; }
          .su-input:focus {
            border-color: #22C55E;
            box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
          }
          .su-input--icon { padding-right: 48px; }
          .su-input-wrap { position: relative; display: flex; align-items: center; }
          .su-eye-btn {
            position: absolute;
            right: 16px;
            background: none;
            border: none;
            cursor: pointer;
            color: #9CA3AF;
            padding: 0;
            display: flex;
            align-items: center;
            transition: color 0.15s;
          }
          .su-eye-btn:hover { color: #6B7280; }

          /* Terms */
          .su-terms-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            cursor: pointer;
            margin: 4px 0;
          }
          .su-checkbox {
            width: 17px;
            height: 17px;
            margin-top: 2px;
            border: 1.5px solid #D1D5DB;
            border-radius: 4px;
            cursor: pointer;
            accent-color: #22C55E;
            flex-shrink: 0;
          }
          .su-terms-text { font-size: 13.5px; color: #6B7280; line-height: 1.5; }
          .su-terms-link { font-weight: 700; color: #111827; text-decoration: none; }
          .su-terms-link:hover { text-decoration: underline; }

          /* Submit */
          .su-submit-btn {
            width: 100%;
            padding: 15px;
            background: #111827;
            color: #fff;
            border: none;
            border-radius: 50px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: background 0.18s, opacity 0.18s;
            font-family: 'DM Sans', sans-serif;
            margin-top: 4px;
            letter-spacing: 0.2px;
          }
          .su-submit-btn:hover:not(:disabled) { background: #1F2937; }
          .su-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .su-spin { animation: su-spin 1s linear infinite; }
          .su-spin circle { opacity: 0.25; }
          .su-spin path { opacity: 0.75; }

          /* Footer */
          .su-footer-text {
            text-align: center;
            font-size: 14px;
            color: #6B7280;
            margin-top: 20px;
          }
          .su-signin-link {
            color: #22C55E;
            font-weight: 600;
            text-decoration: none;
          }
          .su-signin-link:hover { text-decoration: underline; }
        }
      `}</style>
    </div>
  );
}
