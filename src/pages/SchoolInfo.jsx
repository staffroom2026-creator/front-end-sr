import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Country, State, City } from 'country-state-city';
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

function SearchableSelect({ value, options, placeholder, disabled, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="si-search-select">
      <input
        type="text"
        value={open ? query : (selectedOption?.label || '')}
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
        <div className="si-search-options" role="listbox">
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className="si-search-option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setQuery(option.label);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          )) : <span className="si-search-empty">No matches found</span>}
        </div>
      )}
    </div>
  );
}

export default function SchoolInfo() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const savedDraft = (() => {
    try {
      const raw = localStorage.getItem('staffroom_school_signup_draft');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [form, setForm] = useState({
    schoolName: savedDraft?.schoolName || '',
    country: '',
    state: '',
    city: '',
    address: '',
    schoolEmail: savedDraft?.email || '',
    phone: savedDraft?.phone || '',
    type: '',
    logo: null
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const lockedFields = {
    schoolName: Boolean(savedDraft?.schoolName),
    schoolEmail: Boolean(savedDraft?.email),
    phone: Boolean(savedDraft?.phone)
  };

  useEffect(() => {
    let active = true;

    profileService.getMe().then((response) => {
      const payload = response?.data?.data ?? response?.data ?? {};
      const profile = payload?.profile || payload?.school_profile || payload?.school || {};
      const account = payload?.user || {};
      const locationParts = String(profile.location || '').split(',').map((part) => part.trim()).filter(Boolean);
      const country = profile.country || locationParts.at(-1) || '';
      const state = profile.state || (locationParts.length > 1 ? locationParts.at(-2) : '');
      const city = profile.city || (locationParts.length > 2 ? locationParts.at(-3) : '');

      if (active) {
        setForm((current) => ({
          ...current,
          schoolName: profile.school_name || account.full_name || current.schoolName,
          schoolEmail: profile.email || account.email || current.schoolEmail,
          phone: profile.phone || account.phone || current.phone,
          address: profile.address || current.address,
          country: country || current.country,
          state: state || current.state,
          city: city || current.city,
          type: profile.school_type || current.type,
        }));
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      const allCountries = Country.getAllCountries() || [];
      setCountries(allCountries.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setCountries([]);
      setError('Unable to load location options right now. Please try again.');
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  useEffect(() => {
    if (!form.country) {
      setStates([]);
      setCities([]);
      setForm((prev) => ({ ...prev, state: '', city: '' }));
      return;
    }

    const selectedCountry = countries.find((country) => country.name === form.country);
    if (!selectedCountry) {
      setStates([]);
      setCities([]);
      setForm((prev) => ({ ...prev, state: '', city: '' }));
      return;
    }

    const countryStates = (State.getStatesOfCountry(selectedCountry.isoCode) || []).sort((a, b) => a.name.localeCompare(b.name));
    setStates(countryStates);
    setCities([]);

    setForm((prev) => {
      if (prev.state && countryStates.some((state) => state.name === prev.state)) {
        return prev;
      }

      return { ...prev, state: '', city: '' };
    });
  }, [countries, form.country]);

  useEffect(() => {
    if (!form.country || !form.state) {
      setCities([]);
      setForm((prev) => ({ ...prev, city: '' }));
      return;
    }

    const selectedCountry = countries.find((country) => country.name === form.country);
    const selectedState = states.find((state) => state.name === form.state);

    if (!selectedCountry || !selectedState) {
      setCities([]);
      setForm((prev) => ({ ...prev, city: '' }));
      return;
    }

    const countryCities = (City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode) || []).sort((a, b) => a.name.localeCompare(b.name));
    setCities(countryCities);

    setForm((prev) => {
      if (prev.city && countryCities.some((city) => city.name === prev.city)) {
        return prev;
      }

      return { ...prev, city: '' };
    });
  }, [countries, form.country, form.state, states]);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleNext = async () => {
    if (!form.schoolName.trim() || !form.country || !form.state.trim() || !form.city.trim() || !form.type || !form.schoolEmail.trim() || !form.phone.trim()) {
      setError('Please complete all school profile details before continuing.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (form.logo) {
        const logoFormData = new FormData();
        logoFormData.append('logo', form.logo);
        await profileService.uploadLogo(logoFormData);
      }

      const response = await profileService.updateSchool({
        school_name: form.schoolName.trim(),
        address: form.address.trim() || form.city.trim(),
        location: `${form.city.trim()}, ${form.state.trim()}, ${form.country}`,
        state: form.state.trim(),
        country: form.country,
        city: form.city.trim(),
        email: form.schoolEmail.trim(),
        phone: form.phone.trim(),
        setup_completed: true,
        school_type: form.type,
        website: '',
      });

      const profilePayload = response?.data?.data ?? response?.data ?? {};
      const updatedSchoolProfile = profilePayload?.profile || profilePayload?.school_profile || profilePayload?.school || profilePayload || {};
      const nextUser = user ? {
        ...user,
        role: user.role || 'school',
        setup_completed: true,
        onboarding_required: false,
        school_profile: updatedSchoolProfile,
      } : {
        role: 'school',
        setup_completed: true,
        onboarding_required: false,
        school_profile: updatedSchoolProfile,
      };

      setUser(nextUser);
      sessionStorage.setItem('staffroom_user', JSON.stringify(nextUser));

      localStorage.removeItem('staffroom_school_signup_draft');
      localStorage.removeItem('staffroom_verification_email');
      localStorage.removeItem('staffroom_verification_role');

      navigate('/school-dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to save your school profile right now.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div
      className="si-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="si-header">
        <Link to="/" className="si-logo">
          <BrandLogo />
        </Link>
        <button onClick={() => navigate('/signup')} className="si-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      </header>

      <main className="si-main">
        <div className="si-container">
          <div className="si-page-intro">
            <button onClick={() => navigate('/signup')} className="si-intro-back" aria-label="Back to sign up">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1>Let's set up your school</h1>
              <p>Add a few details to get your school profile ready. You can complete the rest later.</p>
            </div>
          </div>

          <div className="si-card">
            <section className="si-form-section">
              <h2>School Information</h2>
              <div className="si-field-grid">
                <label className={`si-field ${lockedFields.schoolName ? 'si-field-locked' : ''}`}><span>School Name<em>*</em></span><input type="text" placeholder="e.g. Springfield Elementary" value={form.schoolName} readOnly={lockedFields.schoolName} onChange={(e) => setForm({...form, schoolName: e.target.value})} /></label>
                <label className="si-field"><span>School Type<em>*</em></span><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}><option value="" disabled>Select a type...</option><option value="private">Private</option><option value="public">Public</option><option value="international">International</option></select></label>
              </div>
            </section>

            <section className="si-form-section">
              <h2>Location</h2>
              <div className="si-field-grid">
                <label className="si-field"><span>Country<em>*</em></span>
                  <SearchableSelect
                    value={form.country}
                    placeholder={loadingLocations ? 'Loading countries...' : 'Search country...'}
                    disabled={loadingLocations || countries.length === 0}
                    options={countries.map((country) => ({ value: country.name, label: country.name }))}
                    onChange={(country) => setForm({ ...form, country, state: '', city: '' })}
                  />
                </label>
                <label className="si-field"><span>State<em>*</em></span>
                  <SearchableSelect
                    value={form.state}
                    placeholder={!form.country ? 'Choose country first' : 'Search state...'}
                    disabled={!form.country || states.length === 0}
                    options={states.map((state) => ({ value: state.name, label: state.name }))}
                    onChange={(state) => setForm({ ...form, state, city: '' })}
                  />
                </label>
                <label className="si-field"><span>City<em>*</em></span>
                  <SearchableSelect
                    value={form.city}
                    placeholder={!form.state ? 'Choose state first' : 'Search city...'}
                    disabled={!form.state || cities.length === 0}
                    options={cities.map((city) => ({ value: city.name, label: city.name }))}
                    onChange={(city) => setForm({ ...form, city })}
                  />
                </label>
              </div>
              <label className="si-field si-field-full"><span>School Address <small>(Optional)</small></span><input type="text" placeholder="Street address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></label>
            </section>

            <section className="si-form-section">
              <h2>Contact Information</h2>
              <div className="si-field-grid">
                <label className={`si-field ${lockedFields.schoolEmail ? 'si-field-locked' : ''}`}><span>School Email<em>*</em></span><input type="email" placeholder="admin@school.com" value={form.schoolEmail} readOnly={lockedFields.schoolEmail} onChange={(e) => setForm({...form, schoolEmail: e.target.value})} /></label>
                <label className={`si-field ${lockedFields.phone ? 'si-field-locked' : ''}`}><span>Phone Number<em>*</em></span><input type="tel" placeholder="+234 XXX XXXX" value={form.phone} readOnly={lockedFields.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></label>
              </div>
            </section>

            <section className="si-form-section si-bottom-section">
              <div className="si-logo-field"><h2>School Logo</h2><p>Optional - You can add this later</p><div className="si-upload-box">{logoPreview ? <img src={logoPreview} alt="School logo preview" className="si-upload-preview" /> : <><span className="si-upload-placeholder">▧</span><span className="si-upload-text">Upload logo</span></>}<input type="file" accept="image/*" className="si-file-input" onChange={(e) => { const logo = e.target.files[0]; if (!logo) return; setForm({...form, logo}); setLogoPreview(URL.createObjectURL(logo)); }} /></div></div>
              <button type="button" className="si-next-btn" onClick={handleNext} disabled={saving}>{saving ? 'Saving…' : 'Complete school setup'}</button>
            </section>
          </div>

          {error && (
            <div style={{ marginTop: '16px', color: '#b91c1c', fontSize: '14px', textAlign: 'center' }}>{error}</div>
          )}

        </div>
      </main>

      <style>{`
        :root {
          --si-bg: #f3f2ef;
          --si-card: #ffffff;
          --si-border: #dbe3de;
          --si-field: #f5f7f6;
          --si-field-strong: #eef5f0;
          --si-text: #2e3745;
          --si-muted: #67707a;
          --si-placeholder: #c4cbc7;
          --si-green: #1ecb41;
          --si-green-dark: #14532d;
          --si-red: #db4a4a;
        }

        .si-page {
          min-height: 100vh;
          background: var(--si-bg);
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          color: var(--si-text);
        }

        .si-header {
          padding: 26px 40px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .si-back-btn {
          background: none;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #68727d;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .si-back-btn:hover {
          color: #111827;
        }

        .si-logo {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }

        .si-main {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 8px 20px 28px;
        }

        .si-container {
          width: 100%;
          max-width: 760px;
        }

        .si-page-intro {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
        }

        .si-intro-back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          margin-top: 2px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #111827;
          cursor: pointer;
        }

        .si-page-intro h1 {
          margin: 0 0 8px;
          color: var(--si-text);
          font-size: 23px;
          line-height: 1.25;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .si-page-intro p {
          margin: 0;
          color: var(--si-text);
          font-size: 12px;
          line-height: 1.5;
        }

        .si-card {
          width: 100%;
          padding: 22px 22px 18px;
          background: var(--si-card);
          border: 1px solid var(--si-border);
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(38, 56, 44, 0.06);
        }

        .si-form-section {
          padding-bottom: 18px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--si-border);
        }

        .si-form-section:last-of-type {
          margin-bottom: 0;
          border-bottom: none;
        }

        .si-form-section h2 {
          margin: 0 0 16px;
          color: var(--si-text);
          font-size: 13px;
          line-height: 1.3;
          font-weight: 700;
        }

        .si-field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 12px;
        }

        .si-field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 6px;
          color: var(--si-text);
          font-size: 10px;
          font-weight: 700;
        }

        .si-field em {
          color: var(--si-red);
          font-style: normal;
        }

        .si-field small {
          color: #95a0a9;
          font-size: 9px;
          font-weight: 400;
        }

        .si-field input,
        .si-field select {
          width: 100%;
          min-width: 0;
          height: 40px;
          padding: 9px 11px;
          border: 1px solid #cfd8d2;
          border-radius: 6px;
          background: var(--si-field);
          color: var(--si-text);
          font-family: inherit;
          font-size: 11px;
          font-weight: 400;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .si-field input::placeholder {
          color: var(--si-placeholder);
        }

        .si-field input:focus,
        .si-field select:focus {
          border-color: var(--si-green);
          background: var(--si-field-strong);
          box-shadow: 0 0 0 3px rgba(28, 203, 67, 0.12);
        }

        .si-search-select {
          position: relative;
        }

        .si-search-options {
          position: absolute;
          z-index: 10;
          top: calc(100% + 4px);
          right: 0;
          left: 0;
          max-height: 190px;
          overflow-y: auto;
          padding: 4px;
          border: 1px solid #cfd8d2;
          border-radius: 6px;
          background: #ffffff;
          box-shadow: 0 8px 18px rgba(38, 56, 44, 0.12);
        }

        .si-search-option {
          display: block;
          width: 100%;
          padding: 9px 10px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--si-text);
          font: inherit;
          font-size: 11px;
          text-align: left;
          cursor: pointer;
        }

        .si-search-option:hover,
        .si-search-option:focus-visible {
          background: var(--si-field-strong);
          outline: none;
        }

        .si-search-empty {
          display: block;
          padding: 9px 10px;
          color: var(--si-muted);
          font-size: 11px;
        }

        .si-field-locked input {
          background: #e9efeb;
          color: #56635b;
          cursor: not-allowed;
        }

        .si-field-locked input:focus {
          border-color: #cfd8d2;
          background: #e9efeb;
          box-shadow: none;
        }

        .si-field input:not(:placeholder-shown),
        .si-field select:not([value='']) {
          background: var(--si-field-strong);
        }

        .si-field-full {
          margin-top: 14px;
        }

        .si-bottom-section {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
          gap: 24px;
          align-items: end;
          padding-bottom: 0;
          margin-bottom: 0;
          border-bottom: none;
        }

        .si-logo-field {
          min-width: 0;
        }

        .si-logo-field h2 {
          margin-bottom: 5px;
        }

        .si-logo-field p {
          margin: 0 0 10px;
          color: var(--si-muted);
          font-size: 10px;
          line-height: 1.4;
        }

        .si-upload-box {
          position: relative;
          width: 100%;
          min-height: 66px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          padding: 8px 10px;
          border: 1px solid #ced8d0;
          border-radius: 6px;
          background: var(--si-field);
          overflow: hidden;
          cursor: pointer;
        }

        .si-upload-placeholder {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #d2d9d3;
          border-radius: 5px;
          color: #c0c7c1;
          font-size: 20px;
          background: #f8faf8;
        }

        .si-upload-text {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 24px;
          padding: 4px 10px;
          border: 1px solid #b6d7be;
          border-radius: 5px;
          color: #14643a;
          font-size: 10px;
          font-weight: 700;
          background: rgba(28, 203, 67, 0.06);
        }

        .si-upload-preview {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 0;
        }

        .si-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .si-next-btn {
          align-self: end;
          width: 100%;
          max-width: 260px;
          justify-self: end;
          padding: 13px 16px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(180deg, #22d552 0%, #1ecb41 100%);
          color: var(--si-green-dark);
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .si-next-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(30, 203, 67, 0.18);
        }

        .si-next-btn:disabled {
          opacity: 0.75;
          cursor: wait;
          transform: none;
        }

        @media (max-width: 768px) {
          .si-header {
            padding: 20px 16px;
          }

          .si-main {
            align-items: flex-start;
            padding: 8px 16px 42px;
          }

          .si-page-intro {
            margin-bottom: 18px;
          }

          .si-page-intro h1 {
            font-size: 22px;
          }

          .si-page-intro p {
            line-height: 1.5;
          }

          .si-card {
            padding: 18px 16px;
          }

          .si-field-grid,
          .si-bottom-section {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .si-bottom-section {
            align-items: stretch;
          }

          .si-next-btn {
            max-width: none;
            justify-self: stretch;
          }
        }
      `}</style>
    </Motion.div>
  );
}
