import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Country, State } from 'country-state-city';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { apiErrorMessage } from '../services/api';
import BrandLogo from '../components/BrandLogo';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

function SearchableSelect({ value, options, placeholder, disabled, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="ti-search-select">
      <input
        type="text"
        value={open ? query : (selectedOption?.label || value || '')}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && !disabled && (
        <div className="ti-search-options" role="listbox">
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className="ti-search-option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setQuery(option.label);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          )) : <span className="ti-search-empty">No matches found</span>}
        </div>
      )}
    </div>
  );
}

const parseSubjectList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(/[;,|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function TeacherInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    country: '',
    state: '',
    level: '',
    subjects: [],
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [setupAlreadyCompleted, setSetupAlreadyCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    setCountries((Country.getAllCountries() || []).sort((a, b) => a.name.localeCompare(b.name)));
    setLoadingLocations(false);
  }, []);

  useEffect(() => {
    if (!form.country) {
      setStates([]);
      return;
    }

    const selectedCountry = countries.find((country) => country.name === form.country);
    setStates(selectedCountry
      ? (State.getStatesOfCountry(selectedCountry.isoCode) || []).sort((a, b) => a.name.localeCompare(b.name))
      : []);
  }, [countries, form.country]);

  useEffect(() => {
    let active = true;
    profileService.getMe().then((response) => {
      const payload = response?.data?.data ?? response?.data ?? {};
      const profile = payload?.profile || payload?.teacher_profile || payload || {};
      const setupComplete =
        profile?.setup_completed ??
        profile?.setupComplete ??
        profile?.profile_complete ??
        profile?.is_profile_complete;

      if (setupComplete === true || setupComplete === 'true' || setupComplete === 1) {
        setSetupAlreadyCompleted(true);
        navigate('/teacher-dashboard', { replace: true });
        return;
      }

      const locationParts = String(profile.location || '').split(',').map((value) => value.trim()).filter(Boolean);
      const savedCountry = locationParts.at(-1) || '';
      const savedState = locationParts.length > 1 ? locationParts.at(-2) : '';
      const countryMatch = (Country.getAllCountries() || []).find((country) => country.name.toLowerCase() === savedCountry.toLowerCase());
      const stateMatch = countryMatch
        ? (State.getStatesOfCountry(countryMatch.isoCode) || []).find((state) => state.name.toLowerCase() === savedState.toLowerCase())
        : null;
      if (active) {
        const subjectList = parseSubjectList(profile.subjects || profile.skills || []);
        setForm((current) => ({
          ...current,
          country: countryMatch?.name || savedCountry,
          state: stateMatch?.name || savedState,
          subjects: subjectList,
        }));
      }
    }).catch(() => {
      // A new teacher may not have a profile record yet.
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  const addSubject = (value) => {
    const subject = String(value || '').trim();
    if (!subject) return;

    setForm((current) => {
      const nextSubjects = parseSubjectList(current.subjects);
      const normalized = subject.replace(/[,;]+$/, '').trim();
      if (!normalized) return current;
      if (nextSubjects.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
        return current;
      }

      return {
        ...current,
        subjects: [...nextSubjects, normalized],
      };
    });
    setSubjectInput('');
  };

  const removeSubject = (subject) => {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.filter((item) => item !== subject),
    }));
  };

  const handleNext = async () => {
    const subjectList = form.subjects.filter(Boolean);
    if (!form.country || !form.state || !form.level || subjectList.length === 0) {
      setError('Please complete all teacher profile fields before continuing.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        subjects: subjectList,
        skills: subjectList,
        teaching_levels: [form.level],
        location: `${form.state}, ${form.country}`.trim(),
        preferred_location: `${form.state}, ${form.country}`.trim(),
        preferred_employment_type: form.level === 'primary' ? 'full-time' : 'part-time',
        role_title: 'Teacher',
        bio: '',
        experience_years: 0,
        availability: 'Open',
        setup_completed: true,
      };

      await profileService.updateTeacher(payload);
      await profileService.getMe();
      const nextUser = user ? { ...user, role: user.role || 'teacher' } : user;
      if (nextUser) {
        localStorage.setItem('staffroom_user', JSON.stringify(nextUser));
      }
      navigate('/teacher-dashboard', { replace: true });
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      const fieldDetails = backendErrors && typeof backendErrors === 'object'
        ? Object.entries(backendErrors).map(([field, detail]) => `${field}: ${detail}`).join('; ')
        : '';
      setError(fieldDetails || apiErrorMessage(err, 'Unable to save your profile right now.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="ti-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ── */}
      <header className="ti-header">
        <Link to="/" className="ti-logo">
          <BrandLogo />
        </Link>
        <button onClick={() => navigate(setupAlreadyCompleted ? '/teacher-dashboard' : '/signup')} className="ti-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="ti-main">
        <div className="ti-container">
          <div className="ti-grid ti-grid--single">
            {/* ── Left Column ── */}
            <div className="ti-col">
              <motion.section variants={itemVariants} className="ti-section">
                <label className="ti-label">Location</label>
                <div className="ti-select-wrapper">
                  <SearchableSelect
                    value={form.country}
                    placeholder={loadingLocations ? 'Loading countries...' : 'Search country...'}
                    disabled={loadingLocations}
                    options={countries.map((country) => ({ value: country.name, label: country.name }))}
                    onChange={(country) => setForm((current) => ({ ...current, country, state: '' }))}
                  />
                </div>
                <div className="ti-select-wrapper" style={{ marginTop: '12px' }}>
                  <SearchableSelect
                    value={form.state}
                    placeholder={!form.country ? 'Choose country first' : 'Search state...'}
                    disabled={!form.country || states.length === 0}
                    options={states.map((state) => ({ value: state.name, label: state.name }))}
                    onChange={(state) => setForm((current) => ({ ...current, state }))}
                  />
                </div>
              </motion.section>

              <motion.section variants={itemVariants} className="ti-section">
                <label className="ti-label">Teaching Level</label>
                <div className="ti-select-wrapper">
                  <select 
                    className="ti-select"
                    value={form.level}
                    onChange={(e) => setForm({...form, level: e.target.value})}
                  >
                    <option value="" disabled hidden>Select</option>
                    <option value="Pre KG">Pre KG</option>
                    <option value="KG">KG</option>
                    <option value="Primary">Primary</option>
                    <option value="Junior Secondary">Junior Secondary</option>
                    <option value="Senior Secondary">Senior Secondary</option>
                    <option value="Tertiary">Tertiary</option>
                  </select>
                  <span className="ti-chevron">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </motion.section>

              <motion.section variants={itemVariants} className="ti-section">
                <label className="ti-label">Subjects</label>
                <div className="ti-subjects-input">
                  {form.subjects.length > 0 && (
                    <div className="ti-subject-tags">
                      {form.subjects.map((subject) => (
                        <span key={subject} className="ti-subject-tag">
                          {subject}
                          <button type="button" aria-label={`Remove ${subject}`} onClick={() => removeSubject(subject)}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    className="ti-subject-input"
                    value={subjectInput}
                    placeholder="Type to add a subject..."
                    onChange={(event) => setSubjectInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ',') {
                        event.preventDefault();
                        addSubject(subjectInput);
                      }
                    }}
                    onBlur={() => {
                      if (subjectInput.trim()) {
                        addSubject(subjectInput);
                      }
                    }}
                  />
                </div>
              </motion.section>
            </div>

          </div>

          {error && (
            <div style={{ marginTop: '16px', color: '#b91c1c', fontSize: '14px', textAlign: 'center' }}>{error}</div>
          )}

          {/* ── Next Button ── */}
          <motion.div variants={itemVariants} className="ti-footer">
            <button className="ti-next-btn" onClick={handleNext} disabled={saving}>
              {saving ? 'Saving…' : 'Next'}
            </button>
            <div className="ti-dots">
              <span className="ti-dot" />
              <span className="ti-dot ti-dot--active" />
            </div>
          </motion.div>
        </div>
      </main>

      <style>{`
        .ti-page {
          min-height: 100vh;
          background-color: #F0F0EE;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          color: #2D3748;
        }

        .ti-header {
          padding: 24px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ti-back-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #718096;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }

        .ti-back-btn:hover {
          color: #111;
        }

        .ti-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #111;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.4px;
        }

        .ti-main {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .ti-container {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .ti-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }

        .ti-grid--single {
          grid-template-columns: minmax(0, 1fr);
          max-width: 520px;
          margin: 0 auto;
          width: 100%;
        }

        .ti-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ti-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ti-label {
          font-weight: 600;
          font-size: 16px;
          color: #2D3748;
        }

        .ti-select-wrapper {
          position: relative;
        }

        .ti-search-select {
          position: relative;
        }

        .ti-search-select > input {
          width: 100%;
          padding: 14px 40px 14px 16px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          background-color: #E2E8F0;
          font-size: 14px;
          color: #2D3748;
          outline: none;
          box-sizing: border-box;
        }

        .ti-search-select > input:focus {
          border-color: #CBD5E0;
          background-color: #FAFAFA;
        }

        .ti-search-select::after {
          content: '⌄';
          position: absolute;
          top: 11px;
          right: 16px;
          color: #718096;
          font-size: 18px;
          pointer-events: none;
        }

        .ti-search-options {
          position: absolute;
          z-index: 10;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          max-height: 220px;
          overflow-y: auto;
          padding: 4px;
          border: 1px solid #CBD5E0;
          border-radius: 10px;
          background: #FFFFFF;
          box-shadow: 0 10px 24px rgba(45, 55, 72, 0.14);
        }

        .ti-search-option {
          display: block;
          width: 100%;
          padding: 10px 12px;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: #2D3748;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
        }

        .ti-search-option:hover {
          background: #F0FDF4;
          color: #166534;
        }

        .ti-search-empty {
          display: block;
          padding: 10px 12px;
          color: #718096;
          font-size: 13px;
        }

        .ti-select {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          background-color: #E2E8F0;
          font-size: 14px;
          color: #718096;
          appearance: none;
          outline: none;
          cursor: pointer;
        }

        .ti-subjects-input {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          padding: 12px 12px 10px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          background-color: #F8FAFC;
        }

        .ti-subject-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ti-subject-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 999px;
          background: #DCFCE7;
          color: #166534;
          font-size: 13px;
          font-weight: 600;
        }

        .ti-subject-tag button {
          border: none;
          background: transparent;
          color: #166534;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
        }

        .ti-subject-input {
          width: 100%;
          border: none;
          background: transparent;
          color: #2D3748;
          font-size: 14px;
          outline: none;
          min-height: 28px;
        }

        .ti-subject-input::placeholder {
          color: #94A3B8;
        }

        /* First input in Location section has a white background/border in image */
        .ti-col .ti-section:first-child .ti-select-wrapper:first-of-type .ti-select {
          background-color: #FAFAFA;
          border: 1px solid #CBD5E0;
        }

        .ti-chevron {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #718096;
        }

        .ti-textarea {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background-color: #EBEBEB;
          font-size: 14px;
          color: #2D3748;
          resize: none;
          outline: none;
          font-family: inherit;
        }

        .ti-textarea::placeholder {
          color: #A0AEC0;
        }

        .ti-upload-box {
          position: relative;
          width: 100%;
          height: 180px;
          border-radius: 12px;
          background-color: #EBEBEB;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          overflow: hidden;
        }

        .ti-upload-text {
          font-size: 14px;
          color: #A0AEC0;
        }

        .ti-upload-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ti-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .ti-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }

        .ti-next-btn {
          width: 100%;
          max-width: 320px;
          padding: 16px;
          background-color: #1CCB43;
          color: #111;
          font-weight: 700;
          font-size: 15px;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .ti-next-btn:hover {
          background-color: #17B83B;
        }

        .ti-dots {
          display: flex;
          gap: 8px;
        }

        .ti-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #CBD5E0;
        }

        .ti-dot--active {
          background-color: #2D3748;
        }

        @media (max-width: 768px) {
          .ti-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .ti-container {
            max-width: 100%;
            gap: 24px;
          }
          .ti-header {
            padding: 20px;
          }
          .ti-main {
            align-items: flex-start;
            padding: 16px;
          }
        }

        @media (min-width: 769px) {
          .ti-page {
            background-color: #f7f7f6;
            font-family: 'Sora', sans-serif;
          }

          .ti-header {
            padding: 46px 88px;
          }

          .ti-main {
            align-items: flex-start;
            padding: 28px 32px 44px;
          }

          .ti-container {
            max-width: 760px;
            gap: 24px;
          }

          .ti-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .ti-grid--single {
            max-width: 620px;
          }

          .ti-col {
            gap: 18px;
          }

          .ti-label {
            font-size: 14px;
            color: #293047;
          }

          .ti-select,
          .ti-textarea,
          .ti-upload-box {
            border-radius: 13px;
          }

          .ti-select {
            padding: 13px 16px;
            font-family: 'Sora', sans-serif;
            font-size: 12px;
          }

          .ti-search-select > input {
            padding: 13px 40px 13px 16px;
            border-radius: 13px;
            font-family: 'Sora', sans-serif;
            font-size: 12px;
          }

          .ti-textarea {
            font-family: 'Sora', sans-serif;
          }

          .ti-footer {
            margin-top: 2px;
            gap: 18px;
          }

          .ti-next-btn {
            max-width: 343px;
            border-radius: 13px;
            font-family: 'Sora', sans-serif;
          }
        }
      `}</style>
    </motion.div>
  );
}
