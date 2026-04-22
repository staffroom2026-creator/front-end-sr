import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

export default function TeacherInfo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    country: '',
    state: '',
    level: '',
    subjects: '',
    bio: '',
    photo: null
  });

  const handleNext = () => {
    // Navigate to signup or next step
    navigate('/teacher-dashboard');
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#1CCB43">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Staffroom</span>
        </Link>
        <button onClick={() => navigate('/user-type')} className="ti-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="ti-main">
        <div className="ti-container">
          <div className="ti-grid">
            {/* ── Left Column ── */}
            <div className="ti-col">
              <motion.section variants={itemVariants} className="ti-section">
                <label className="ti-label">Location</label>
                <div className="ti-select-wrapper">
                  <select 
                    className="ti-select"
                    value={form.country}
                    onChange={(e) => setForm({...form, country: e.target.value})}
                  >
                    <option value="" disabled hidden>Country</option>
                    <option value="nigeria">Nigeria</option>
                    <option value="ghana">Ghana</option>
                    <option value="kenya">Kenya</option>
                  </select>
                  <span className="ti-chevron">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
                <div className="ti-select-wrapper" style={{ marginTop: '12px' }}>
                  <select 
                    className="ti-select"
                    value={form.state}
                    onChange={(e) => setForm({...form, state: e.target.value})}
                  >
                    <option value="" disabled hidden>State</option>
                    <option value="lagos">Lagos</option>
                    <option value="abuja">Abuja</option>
                    <option value="accra">Accra</option>
                  </select>
                  <span className="ti-chevron">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
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
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="tertiary">Tertiary</option>
                  </select>
                  <span className="ti-chevron">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </motion.section>

              <motion.section variants={itemVariants} className="ti-section">
                <label className="ti-label">Subject(s)</label>
                <textarea 
                  className="ti-textarea"
                  placeholder="Eg, Mathematics, etc."
                  value={form.subjects}
                  onChange={(e) => setForm({...form, subjects: e.target.value})}
                  style={{ height: '140px' }}
                />
              </motion.section>
            </div>

            {/* ── Right Column ── */}
            <div className="ti-col">
              <motion.section variants={itemVariants} className="ti-section">
                <label className="ti-label">Short bio</label>
                <textarea 
                  className="ti-textarea"
                  placeholder="Text"
                  value={form.bio}
                  onChange={(e) => setForm({...form, bio: e.target.value})}
                  style={{ height: '180px' }}
                />
              </motion.section>

              <motion.section variants={itemVariants} className="ti-section">
                <label className="ti-label">Profile Photo</label>
                <div className="ti-upload-box">
                  <span className="ti-upload-text">Upload photo</span>
                  <input 
                    type="file" 
                    className="ti-file-input" 
                    onChange={(e) => setForm({...form, photo: e.target.files[0]})}
                  />
                </div>
              </motion.section>
            </div>
          </div>

          {/* ── Next Button ── */}
          <motion.div variants={itemVariants} className="ti-footer">
            <button className="ti-next-btn" onClick={handleNext}>
              Next
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
          font-family: 'Inter', sans-serif;
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
            max-width: 500px;
          }
          .ti-header {
            padding: 20px;
          }
        }
      `}</style>
    </motion.div>
  );
}
