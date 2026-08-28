import React, { useState } from 'react';
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
    location: '',
    type: '',
    description: '',
    logo: null
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!form.schoolName.trim() || !form.location.trim() || !form.type || !form.description.trim()) {
      setError('Please complete all school profile details before continuing.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await profileService.updateSchool({
        school_name: form.schoolName.trim(),
        address: form.location.trim(),
        location: form.location.trim(),
        state: form.location.trim(),
        website: '',
      });

      navigate('/admin-dashboard');
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
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>School Information</h1>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: '40px' }}>
            Tell us more about your school to get started.
          </p>

          <div className="si-grid">
            <div className="si-col">
              <motion.section variants={itemVariants} className="si-section">
                <label className="si-label">School Name</label>
                <input 
                  type="text" 
                  className="si-input" 
                  placeholder="Enter school name"
                  value={form.schoolName}
                  onChange={(e) => setForm({...form, schoolName: e.target.value})}
                />
              </motion.section>

              <motion.section variants={itemVariants} className="si-section">
                <label className="si-label">Location</label>
                <input 
                  type="text" 
                  className="si-input" 
                  placeholder="City, Country"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                />
              </motion.section>

              <motion.section variants={itemVariants} className="si-section">
                <label className="si-label">School Type</label>
                <select 
                  className="si-select"
                  value={form.type}
                  onChange={(e) => setForm({...form, type: e.target.value})}
                >
                  <option value="" disabled hidden>Select type</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="international">International</option>
                </select>
              </motion.section>
            </div>

            <div className="si-col">
              <motion.section variants={itemVariants} className="si-section">
                <label className="si-label">Short Description</label>
                <textarea 
                  className="si-textarea"
                  placeholder="A brief overview of your institution"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  style={{ height: '140px' }}
                />
              </motion.section>

              <motion.section variants={itemVariants} className="si-section">
                <label className="si-label">School Logo</label>
                <div className="si-upload-box">
                  <span className="si-upload-text">Upload logo</span>
                  <input 
                    type="file" 
                    className="si-file-input" 
                    onChange={(e) => setForm({...form, logo: e.target.files[0]})}
                  />
                </div>
              </motion.section>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: '16px', color: '#b91c1c', fontSize: '14px', textAlign: 'center' }}>{error}</div>
          )}

          <motion.div variants={itemVariants} className="si-footer">
            <button className="si-next-btn" onClick={handleNext} disabled={saving}>
              {saving ? 'Saving…' : 'Next'}
            </button>
            <div className="si-dots">
              <span className="si-dot" />
              <span className="si-dot si-dot--active" />
            </div>
          </motion.div>
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
      `}</style>
    </motion.div>
  );
}
