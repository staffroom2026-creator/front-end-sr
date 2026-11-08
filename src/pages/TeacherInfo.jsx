import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Country, State } from 'country-state-city';
import { useAuth } from '../context/authContext.js';
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
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    title: 'Teacher',
    country: 'Nigeria',
    state: '',
    level: [],
    levelOpen: false,
    subjects: [],
  });
  const [subjectInput, setSubjectInput] = useState('');
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

  const teachingLevels = ['Pre KG', 'KG', 'Primary', 'Junior Secondary', 'Senior Secondary'];
  const subjectSuggestions = [
    'Agricultural Science', 'Arabic', 'Biology', 'Business Studies', 'Chemistry',
    'Christian Religious Studies', 'Civic Education', 'Computer Science', 'Creative Arts',
    'Economics', 'English Language', 'English Literature', 'French', 'Geography', 'Government',
    'History', 'Home Economics', 'Islamic Studies', 'Literature in English', 'Mathematics',
    'Music', 'Physical Education', 'Physics', 'Social Studies', 'Technical Drawing', 'Further Mathematics',
    'Accounting', 'Basic Science', 'Fine Arts', 'Marketing', 'Psychology', 'Sociology',
    'Art', 'Commerce', 'Drama', 'Spelling', 'Reading', 'Writing', 'Phonics', 'Health Education',
    'Basic Technology', 'Electrical Installation', 'Auto Mechanics', 'Food and Nutrition',
    'Catering', 'Computer Appreciation', 'Data Processing', 'Office Practice', 'Photography'
  ];

  const toggleTeachingLevel = (level) => {
    setForm((current) => ({
      ...current,
      level: current.level.includes(level)
        ? current.level.filter((item) => item !== level)
        : [...current.level, level],
    }));
  };

  const handleNext = async () => {
    const subjectList = form.subjects.filter(Boolean);
    if (!form.title || !form.country || form.level.length === 0 || subjectList.length === 0) {
      setError('Please complete all teacher profile fields before continuing.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        subjects: subjectList,
        skills: subjectList,
        teaching_levels: form.level,
        location: [form.state, form.country].filter(Boolean).join(', '),
        preferred_location: [form.state, form.country].filter(Boolean).join(', '),
        preferred_employment_type: form.level.includes('Primary') ? 'full-time' : 'part-time',
        role_title: form.title,
        bio: '',
        experience_years: 0,
        availability: 'Open',
        setup_completed: true,
      };

      const response = await profileService.updateTeacher(payload);
      const responsePayload = response?.data?.data ?? response?.data ?? {};
      const updatedProfile = responsePayload?.profile || responsePayload?.teacher_profile || responsePayload;
      const nextUser = user ? {
        ...user,
        role: user.role || 'teacher',
        setup_completed: true,
        onboarding_required: false,
        teacher_profile: updatedProfile,
      } : {
        role: 'teacher',
        setup_completed: true,
        onboarding_required: false,
        teacher_profile: updatedProfile,
      };
      setUser(nextUser);
      if (nextUser) {
        sessionStorage.setItem('staffroom_user', JSON.stringify(nextUser));
      }
      navigate('/1st-success-step', { replace: true });
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
    <Motion.div
      className="ti-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="ti-header">
        <Link to="/" className="ti-logo" aria-label="Staffroom home">
          <BrandLogo />
        </Link>
      </header>

      <main className="ti-main">
        <div className="ti-container">
          <div className="ti-header-copy">
            <h1 className="ti-title">Let’s set up your professional<br />profile</h1>
            <p className="ti-subtitle">
              Tell us a few details to get you started.<br />
              You can add more information later.
            </p>
          </div>

          <div className="ti-form">
            <Motion.section variants={itemVariants} className="ti-section">
              <label className="ti-label">Professional title</label>
              <div className="ti-helper">What best describes your current role?</div>
              <div className="ti-select-wrapper">
                <select
                  className="ti-select"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Head Teacher">Head Teacher</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Tutor">Tutor</option>
                </select>
                <span className="ti-chevron" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </div>
            </Motion.section>

            <Motion.section variants={itemVariants} className="ti-section">
              <label className="ti-label">Location</label>
              <div className="ti-helper">Where are you based?</div>
              <div className="ti-select-wrapper">
                <SearchableSelect
                  value={form.country}
                  placeholder={loadingLocations ? 'Loading countries...' : 'Nigeria'}
                  disabled={loadingLocations}
                  options={countries.map((country) => ({ value: country.name, label: country.name }))}
                  onChange={(country) => setForm((current) => ({ ...current, country, state: '' }))}
                />
              </div>
              <div className="ti-select-wrapper ti-state-wrap">
                <SearchableSelect
                  value={form.state}
                  placeholder={!form.country ? 'Choose country first' : 'Select state (optional)'}
                  disabled={!form.country || states.length === 0}
                  options={states.map((state) => ({ value: state.name, label: state.name }))}
                  onChange={(state) => setForm((current) => ({ ...current, state }))}
                />
              </div>
            </Motion.section>

            <Motion.section variants={itemVariants} className="ti-section">
              <label className="ti-label">Teaching level</label>
              <div className="ti-helper">Which level(s) do you teach?</div>
              <div className="ti-multiselect">
                <button
                  type="button"
                  className="ti-multiselect-trigger"
                  onClick={() => setForm((current) => ({ ...current, levelOpen: !current.levelOpen }))}
                >
                  <span className="ti-multiselect-value">
                    {form.level.length > 0 ? form.level.join(', ') : 'Select teaching level(s)'}
                  </span>
                  <span className="ti-chevron" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>

                {form.levelOpen && (
                  <div className="ti-multiselect-menu" role="listbox" aria-multiselectable="true">
                    {teachingLevels.map((level) => {
                      const selected = form.level.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          className={`ti-multiselect-option ${selected ? 'selected' : ''}`}
                          onClick={() => toggleTeachingLevel(level)}
                          aria-pressed={selected}
                        >
                          <span className="ti-checkmark" aria-hidden="true">{selected ? '✓' : ''}</span>
                          <span>{level}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Motion.section>

            <Motion.section variants={itemVariants} className="ti-section">
              <label className="ti-label">Subjects</label>
              <div className="ti-helper">Which subjects do you teach?</div>
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

              <div className="ti-subject-combobox">
                <input
                  type="text"
                  className="ti-subject-input"
                  value={subjectInput}
                  placeholder="Type to search and add subjects..."
                  onChange={(event) => setSubjectInput(event.target.value)}
                  onFocus={() => setSubjectInput((current) => current)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault();
                      addSubject(subjectInput);
                    }
                    if (event.key === 'Escape') {
                      setSubjectInput('');
                    }
                  }}
                  onBlur={() => {
                    window.setTimeout(() => {
                      if (subjectInput.trim()) {
                        addSubject(subjectInput);
                      }
                    }, 130);
                  }}
                />

                {subjectInput.trim() && (
                  <div className="ti-subject-dropdown" role="listbox">
                    {subjectSuggestions
                      .filter((subject) => {
                        const query = subjectInput.toLowerCase();
                        return subject.toLowerCase().includes(query)
                          && !form.subjects.some((selected) => selected.toLowerCase() === subject.toLowerCase());
                      })
                      .slice(0, 8)
                      .map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          className="ti-subject-option"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addSubject(subject)}
                        >
                          {subject}
                        </button>
                      ))}

                    {subjectInput.trim() && !subjectSuggestions.some((subject) => subject.toLowerCase() === subjectInput.trim().toLowerCase()) && (
                      <button
                        type="button"
                        className="ti-subject-option ti-subject-option--custom"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => addSubject(subjectInput)}
                      >
                        Add &ldquo;{subjectInput.trim()}&rdquo;
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            </Motion.section>
          </div>

          {error && (
            <div className="ti-error">{error}</div>
          )}

          <Motion.div variants={itemVariants} className="ti-footer">
            <button className="ti-next-btn" onClick={handleNext} disabled={saving}>
              {saving ? 'Saving…' : 'Next'}
            </button>
          </Motion.div>
        </div>
      </main>

      <style>{`
        :root {
          --ti-bg: #f3f3f2;
          --ti-panel: #f1f2f1;
          --ti-field: #f4f5f4;
          --ti-border: #dfe3df;
          --ti-border-strong: #d0d5d0;
          --ti-text: #111827;
          --ti-muted: #7a7d80;
          --ti-primary: #1fbe48;
          --ti-primary-dark: #1a9d40;
        }

        .ti-page {
          min-height: 100vh;
          background: var(--ti-bg);
          color: var(--ti-text);
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .ti-header {
          padding: 32px 0 0 56px;
        }

        .ti-logo {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          line-height: 1;
        }

        .ti-logo img {
          width: 158px;
          height: auto;
          display: block;
        }

        .ti-main {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          flex: 1;
          padding: 12px 20px 48px;
        }

        .ti-container {
          width: 100%;
          max-width: 480px;
        }

        .ti-header-copy {
          text-align: center;
          margin-bottom: 22px;
        }

        .ti-title {
          margin: 0;
          font-size: clamp(2.1rem, 3vw, 3.05rem);
          line-height: 1.08;
          letter-spacing: -0.06em;
          font-weight: 700;
          color: #1e1e1f;
        }

        .ti-subtitle {
          margin: 14px 0 0;
          color: #6d7179;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 500;
        }

        .ti-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ti-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ti-label {
          margin: 0;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 600;
          color: #1f2937;
        }

        .ti-helper {
          margin: 0;
          font-size: 12px;
          line-height: 1.4;
          color: #7d8289;
        }

        .ti-select-wrapper {
          position: relative;
        }

        .ti-state-wrap {
          margin-top: 8px;
        }

        .ti-select,
        .ti-search-select > input,
        .ti-subjects-input,
        .ti-multiselect-trigger {
          width: 100%;
          border-radius: 10px;
          border: 1px solid var(--ti-border);
          background: var(--ti-field);
          color: #1e2530;
          font-size: 14px;
          box-sizing: border-box;
        }

        .ti-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          height: 46px;
          padding: 0 42px 0 14px;
          outline: none;
          cursor: pointer;
          color: #1f2937;
        }

        .ti-multiselect {
          position: relative;
        }

        .ti-multiselect-trigger {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 46px;
          padding: 0 42px 0 14px;
          background: var(--ti-field);
          color: #1f2937;
          cursor: pointer;
          text-align: left;
          font: inherit;
          outline: none;
        }

        .ti-multiselect-value {
          color: #1f2937;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ti-multiselect-menu {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 8px);
          background: #ffffff;
          border: 1px solid var(--ti-border);
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(17, 24, 39, 0.08);
          z-index: 20;
          overflow: hidden;
        }

        .ti-multiselect-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 0;
          background: transparent;
          padding: 10px 12px;
          text-align: left;
          font: inherit;
          color: #1f2937;
          cursor: pointer;
        }

        .ti-multiselect-option:hover {
          background: #f3f5f5;
        }

        .ti-multiselect-option.selected {
          background: #edf7f0;
        }

        .ti-checkmark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #7d8289;
          font-size: 12px;
          font-weight: 700;
          color: #1a9d40;
          background: #fff;
        }

        .ti-select:focus,
        .ti-search-select > input:focus,
        .ti-subject-input:focus {
          outline: none;
          border-color: var(--ti-border-strong);
        }

        .ti-search-select {
          position: relative;
        }

        .ti-search-select > input {
          height: 46px;
          padding: 0 42px 0 14px;
          outline: none;
        }

        .ti-search-select::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 14px;
          width: 9px;
          height: 9px;
          border-right: 1.5px solid #6d7179;
          border-bottom: 1.5px solid #6d7179;
          transform: translateY(-65%) rotate(45deg);
          pointer-events: none;
        }

        .ti-search-options {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid var(--ti-border);
          border-radius: 8px;
          box-shadow: 0 14px 28px rgba(17, 24, 39, 0.08);
          max-height: 220px;
          overflow-y: auto;
          z-index: 20;
        }

        .ti-search-option {
          width: 100%;
          padding: 10px 12px;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #1f2937;
        }

        .ti-search-option:hover {
          background: #f3f5f5;
        }

        .ti-search-empty {
          display: block;
          padding: 10px 12px;
          color: var(--ti-muted);
          font-size: 13px;
        }

        .ti-chevron {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #61656d;
        }

        .ti-subjects-input {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 46px;
          padding: 8px 10px 10px;
        }

        .ti-subject-combobox {
          position: relative;
        }

        .ti-subject-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 6px);
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid var(--ti-border);
          border-radius: 8px;
          box-shadow: 0 14px 28px rgba(17, 24, 39, 0.08);
          z-index: 25;
          max-height: 240px;
          overflow-y: auto;
        }

        .ti-subject-option {
          width: 100%;
          border: none;
          background: transparent;
          text-align: left;
          padding: 10px 12px;
          color: #1f2937;
          cursor: pointer;
          font: inherit;
        }

        .ti-subject-option:hover {
          background: #f3f5f5;
        }

        .ti-subject-option--custom {
          color: #1a9d40;
          font-weight: 600;
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
          padding: 4px 8px;
          border-radius: 999px;
          background: #eafaf0;
          color: #1b8a3f;
          font-size: 12px;
          font-weight: 600;
        }

        .ti-subject-tag button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          line-height: 1;
        }

        .ti-subject-input {
          width: 100%;
          min-height: 24px;
          border: none;
          background: transparent;
          color: #1f2937;
          font-size: 14px;
          padding: 0;
          outline: none;
        }

        .ti-subject-input::placeholder {
          color: #9aa0a6;
        }

        .ti-error {
          margin-top: 12px;
          text-align: center;
          font-size: 13px;
          color: #c81d33;
        }

        .ti-footer {
          margin-top: 18px;
          display: flex;
          justify-content: center;
        }

        .ti-next-btn {
          width: 100%;
          max-width: 100%;
          height: 48px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(180deg, #2fda59 0%, #1fcb48 100%);
          color: #0f172a;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
          box-shadow: 0 8px 16px rgba(31, 203, 72, 0.28);
        }

        .ti-next-btn:hover {
          filter: brightness(0.98);
        }

        .ti-next-btn:active {
          transform: translateY(1px);
        }

        @media (max-width: 640px) {
          .ti-header {
            padding: 24px 0 0 24px;
          }

          .ti-logo img {
            width: 136px;
          }

          .ti-main {
            padding: 8px 18px 36px;
          }

          .ti-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </Motion.div>
  );
}
