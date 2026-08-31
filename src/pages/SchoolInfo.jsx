import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

export default function SchoolInfo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    schoolName: '',
    country: '',
    state: '',
    city: '',
    address: '',
    schoolEmail: '',
    phone: '',
    type: '',
    logo: null
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

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

      await profileService.updateSchool({
        school_name: form.schoolName.trim(),
        address: form.address.trim() || form.city.trim(),
        location: `${form.city.trim()}, ${form.state.trim()}, ${form.country}`,
        state: form.state.trim(),
        country: form.country,
        city: form.city.trim(),
        email: form.schoolEmail.trim(),
        phone: form.phone.trim(),
        school_type: form.type,
        website: '',
      });

      navigate('/admin-dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to save your school profile right now.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
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
                <label className="si-field"><span>School Name<em>*</em></span><input type="text" placeholder="e.g. Springfield Elementary" value={form.schoolName} onChange={(e) => setForm({...form, schoolName: e.target.value})} /></label>
                <label className="si-field"><span>School Type<em>*</em></span><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}><option value="" disabled>Select a type...</option><option value="private">Private</option><option value="public">Public</option><option value="international">International</option></select></label>
              </div>
            </section>

            <section className="si-form-section">
              <h2>Location</h2>
              <div className="si-field-grid">
                <label className="si-field"><span>Country<em>*</em></span><select value={form.country} onChange={(e) => setForm({...form, country: e.target.value})}><option value="" disabled>Select country...</option><option value="Nigeria">Nigeria</option><option value="Ghana">Ghana</option><option value="Kenya">Kenya</option></select></label>
                <label className="si-field"><span>State<em>*</em></span><input type="text" placeholder="e.g. Lagos" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} /></label>
                <label className="si-field"><span>City<em>*</em></span><input type="text" placeholder="e.g. Ikeja" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} /></label>
              </div>
              <label className="si-field si-field-full"><span>School Address <small>(Optional)</small></span><input type="text" placeholder="Street address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></label>
            </section>

            <section className="si-form-section">
              <h2>Contact Information</h2>
              <div className="si-field-grid">
                <label className="si-field"><span>School Email<em>*</em></span><input type="email" placeholder="admin@school.com" value={form.schoolEmail} onChange={(e) => setForm({...form, schoolEmail: e.target.value})} /></label>
                <label className="si-field"><span>Phone Number<em>*</em></span><input type="tel" placeholder="+234 XXX XXXX" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></label>
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
        .si-page {
          min-height: 100vh;
          background-color: #F0F0EE;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          color: #2D3748;
        }
        .si-header { 
          padding: 24px 40px; 
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .si-back-btn {
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

        .si-back-btn:hover {
          color: #111;
        }

        .si-logo { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #111; font-weight: 700; font-size: 18px; }
        .si-main { flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .si-container { width: 100%; max-width: 900px; }
        .si-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        .si-col { display: flex; flex-direction: column; gap: 24px; }
        .si-section { display: flex; flex-direction: column; gap: 8px; }
        .si-label { font-weight: 600; font-size: 16px; }
        .si-input, .si-select, .si-textarea {
          width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #E2E8F0; background-color: #FAFAFA; font-size: 14px; outline: none;
        }
        .si-textarea { resize: none; background-color: #EBEBEB; border: none; }
        .si-upload-box {
          position: relative; width: 100%; height: 160px; border-radius: 12px; background-color: #EBEBEB; display: flex; justify-content: center; align-items: center; cursor: pointer; overflow: hidden;
        }
        .si-upload-text { font-size: 14px; color: #A0AEC0; }
        .si-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .si-footer { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-top: 40px; }
        .si-next-btn {
          width: 100%; max-width: 320px; padding: 16px; background-color: #1CCB43; color: #111; font-weight: 700; border-radius: 50px; border: none; cursor: pointer;
        }
        .si-dots { display: flex; gap: 8px; }
        .si-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #CBD5E0; }
        .si-dot--active { background-color: #2D3748; }

        @media (max-width: 768px) {
          .si-grid { grid-template-columns: 1fr; gap: 24px; }
        }

        .si-page-intro {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 24px;
        }

        .si-intro-back {
          display: flex;
          flex-shrink: 0;
          margin-top: 2px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #111827;
          cursor: pointer;
        }

        .si-page-intro h1 {
          margin: 0 0 8px;
          color: #293047;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 700;
        }

        .si-page-intro p {
          margin: 0;
          color: #293047;
          font-size: 12px;
        }

        .si-card {
          width: 100%;
          padding: 24px 22px;
          background: #fff;
          border: 1px solid #d6ddd8;
          border-radius: 8px;
          box-shadow: 0 8px 20px rgba(30, 55, 40, 0.08);
        }

        .si-form-section {
          padding-bottom: 20px;
          margin-bottom: 18px;
          border-bottom: 1px solid #dce3de;
        }

        .si-form-section h2 {
          margin: 0 0 16px;
          color: #293047;
          font-size: 14px;
          line-height: 1.2;
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
          gap: 5px;
          color: #293047;
          font-size: 10px;
          font-weight: 700;
        }

        .si-field em {
          color: #e05252;
          font-style: normal;
        }

        .si-field small {
          color: #a5aca8;
          font-size: 9px;
          font-weight: 400;
        }

        .si-field input,
        .si-field select {
          width: 100%;
          min-width: 0;
          padding: 9px 11px;
          border: 1px solid #c8d0cc;
          border-radius: 5px;
          background: #f9faf9;
          color: #293047;
          font-family: inherit;
          font-size: 11px;
          font-weight: 400;
          outline: none;
        }

        .si-field input::placeholder {
          color: #c8cecb;
        }

        .si-field input:focus,
        .si-field select:focus {
          border-color: #1ccb43;
          box-shadow: 0 0 0 2px rgba(28, 203, 67, 0.12);
        }

        .si-field-full {
          margin-top: 14px;
        }

        .si-bottom-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: end;
          gap: 70px;
          padding-bottom: 0;
          margin-bottom: 0;
          border-bottom: 0;
        }

        .si-logo-field h2 {
          margin-bottom: 5px;
        }

        .si-logo-field p {
          margin: 0 0 10px;
          color: #293047;
          font-size: 9px;
        }

        .si-upload-box {
          height: 66px;
          display: flex;
          justify-content: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid #c8d0cc;
          border-radius: 5px;
          background: #f9faf9;
        }

        .si-upload-placeholder {
          display: flex;
          width: 34px;
          align-items: center;
          justify-content: center;
          border: 1px solid #c8d0cc;
          border-radius: 5px;
          color: #c0c8c3;
          font-size: 20px;
        }

        .si-upload-text {
          align-self: center;
          padding: 6px 10px;
          border: 1px solid #b9d3c0;
          border-radius: 5px;
          color: #17683a;
          font-size: 10px;
          font-weight: 700;
        }

        .si-upload-preview {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }

        .si-next-btn {
          width: 100%;
          max-width: none;
          padding: 13px 12px;
          border-radius: 999px;
          background: #24dc5b;
          color: #14532d;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
        }

        .si-next-btn:hover {
          background: #1ccb43;
        }

        @media (max-width: 768px) {
          .si-main {
            align-items: flex-start;
            padding: 24px 16px 48px;
          }

          .si-header {
            padding: 20px 16px;
          }

          .si-page-intro h1 {
            font-size: 21px;
          }

          .si-page-intro p {
            line-height: 1.5;
          }

          .si-card {
            padding: 20px 16px;
          }

          .si-field-grid,
          .si-bottom-section {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .si-bottom-section {
            align-items: stretch;
          }
        }
      `}</style>
    </motion.div>
  );
}
