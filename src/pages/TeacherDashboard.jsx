import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiBell, FiMail, FiGrid, FiBriefcase, 
  FiFileText, FiMessageSquare, FiSettings, FiPlus 
} from 'react-icons/fi';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function TeacherDashboard() {
  return (
    <motion.div 
      className="td-layout"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Sidebar ── */}
      <aside className="td-sidebar">
        <div className="td-logo-area">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#1CCB43">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Staffroom</span>
        </div>

        <nav className="td-nav">
          <div className="td-nav-item td-nav-item--active">
            <FiGrid /> <span>Dashboard</span>
          </div>
          <div className="td-nav-item">
            <FiBriefcase /> <span>Job Feeds</span>
          </div>
          <div className="td-nav-item">
            <FiBell /> <span>Notifications</span>
          </div>
          <div className="td-nav-item">
            <FiFileText /> <span>Applications</span>
          </div>
          <div className="td-nav-item">
            <FiMessageSquare /> <span>Messages</span>
          </div>
          <div className="td-nav-item">
            <FiSettings /> <span>Settings</span>
          </div>
        </nav>

        <div className="td-sidebar-footer">
          <div className="td-recruiting-card">
            <p>Need help recruiting?</p>
            <button className="td-post-job-btn">Post a Job</button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="td-main-wrapper">
        {/* Top Header */}
        <header className="td-topbar">
          <div className="td-search-box">
            <FiSearch className="td-search-icon" />
            <input type="text" placeholder="Search vacancies in Lagos..." />
          </div>
          <div className="td-topbar-actions">
            <div className="td-icon-badge"><FiBell /></div>
            <div className="td-icon-badge"><FiMail /></div>
            <div className="td-user-avatar">
              <img src="https://ui-avatars.com/api/?name=Mrs+Adeloa&background=A8E6B8&color=1CCB43" alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="td-content">
          {/* Welcome Area */}
          <div className="td-welcome-header">
            <div>
              <h1>Welcome, Mrs Adeloa</h1>
              <p className="td-subtitle">Your academic career overview for today.</p>
            </div>
            <div className="td-location-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1CCB43">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>Victoria Island, Lagos</span>
            </div>
          </div>

          <div className="td-grid-main">
            {/* Left Content */}
            <div className="td-left-col">
              {/* Stats Overview Row */}
              <div className="td-stats-row">
                <motion.div variants={cardVariants} className="td-stat-card td-profile-card">
                  <div className="td-card-header">
                    <span>Profile Strength</span>
                    <span className="td-percent-badge">75%</span>
                  </div>
                  <div className="td-progress-bar">
                    <div className="td-progress-fill" style={{ width: '75%' }}></div>
                  </div>
                  <p className="td-card-hint">Your profile is missing some vital academic certifications popular with Tier-1 schools.</p>
                  <button className="td-complete-profile-btn">Complete Profile →</button>
                </motion.div>

                <motion.div variants={cardVariants} className="td-stat-card td-mini-card">
                  <div className="td-mini-icon-circle"><FiSearch /></div>
                  <p className="td-mini-label">PROFILE VIEWS</p>
                  <div className="td-mini-value-row">
                    <span className="td-mini-value">1,284</span>
                    <span className="td-mini-growth">+12%</span>
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} className="td-stat-card td-mini-card">
                  <div className="td-mini-icon-circle green"><FiBriefcase /></div>
                  <p className="td-mini-label">JOBS APPLIED</p>
                  <div className="td-mini-value-row">
                    <span className="td-mini-value">42</span>
                    <span className="td-mini-total">Total</span>
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} className="td-stat-card td-mini-card">
                  <div className="td-mini-icon-circle red"><FiFileText /></div>
                  <p className="td-mini-label">PENDING REVIEW</p>
                  <div className="td-mini-value-row">
                    <span className="td-mini-value">08</span>
                    <span className="td-mini-action">Action Req.</span>
                  </div>
                </motion.div>
              </div>

              {/* Active Job Feeds Section */}
              <div className="td-jobs-section">
                <div className="td-section-header">
                  <h2>Active Job Feeds</h2>
                  <a href="#">View All Vacancies</a>
                </div>

                <div className="td-job-list">
                  <motion.div variants={cardVariants} className="td-job-item">
                    <div className="td-job-icon">Σ</div>
                    <div className="td-job-details">
                      <div className="td-job-title-row">
                        <h3>HOD Mathematics</h3>
                        <span className="td-job-type-badge">FULL-TIME</span>
                      </div>
                      <p className="td-job-school">St. Gregory's College • Ikoyi, Lagos</p>
                      <div className="td-job-tags">
                        <span>POSTGRADUATE DEGREE</span>
                        <span>8+ YEARS EXPERIENCE</span>
                        <span>LEADERSHIP</span>
                      </div>
                      <div className="td-job-footer">
                        <span className="td-job-salary">₦450k - ₦600k Monthly</span>
                        <span className="td-job-time">3 days ago</span>
                        <a href="#" className="td-quick-apply">Quick Apply →</a>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={cardVariants} className="td-job-item">
                    <div className="td-job-icon school">A</div>
                    <div className="td-job-details">
                      <div className="td-job-title-row">
                        <h3>Physics Instructor</h3>
                        <span className="td-job-type-badge residential">RESIDENTIAL</span>
                      </div>
                      <p className="td-job-school">Atlantic Hall School • Epe, Lagos</p>
                      <div className="td-job-footer">
                        <span className="td-job-salary">₦350k - ₦480k Monthly</span>
                        <span className="td-job-time">1 week ago</span>
                        <a href="#" className="td-quick-apply">Quick Apply →</a>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Content */}
            <div className="td-right-col">
              <motion.div variants={cardVariants} className="td-side-section">
                <h3>Upcoming Interviews</h3>
                <div className="td-interview-item">
                  <div className="td-date-box">
                    <span className="td-day">24</span>
                    <span className="td-month">OCT</span>
                  </div>
                  <div className="td-int-info">
                    <h4>Dowen College</h4>
                    <p>Senior Admin Role • 10:00 AM</p>
                  </div>
                </div>
                <div className="td-interview-item">
                  <div className="td-date-box green">
                    <span className="td-day">27</span>
                    <span className="td-month">OCT</span>
                  </div>
                  <div className="td-int-info">
                    <h4>Green Springs</h4>
                    <p>Interview Prep • 02:30 PM</p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={cardVariants} className="td-pro-card">
                <div className="td-pro-badge">★</div>
                <h3>Staffroom Pro</h3>
                <p>Get priority listing in elite school searches across Abuja and Lagos.</p>
                <button className="td-upgrade-btn">Upgrade Plan</button>
              </motion.div>

              <motion.div variants={cardVariants} className="td-shortcuts-section">
                <h3>QUICK SHORTCUTS</h3>
                <div className="td-shortcuts-row">
                  <div className="td-shortcut">
                    <FiFileText />
                    <span>Update CV</span>
                  </div>
                  <div className="td-shortcut">
                    <FiMessageSquare />
                    <span>Messages</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <button className="td-fab"><FiPlus /></button>

      <style>{`
        .td-layout {
          display: flex;
          background-color: #F8F9FA;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        /* Sidebar Styling */
        .td-sidebar {
          width: 240px;
          background: #fff;
          border-right: 1px solid #E9ECEF;
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .td-logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 24px 40px;
          font-weight: 700;
          font-size: 18px;
        }

        .td-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .td-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: #6C757D;
          cursor: pointer;
          transition: 0.2s;
          font-size: 14px;
        }

        .td-nav-item:hover { color: #111; }

        .td-nav-item--active {
          color: #1CCB43;
          background: #E8F9ED;
          border-right: 3px solid #1CCB43;
          font-weight: 600;
        }

        .td-sidebar-footer {
          margin-top: auto;
          padding: 0 16px;
        }

        .td-recruiting-card {
          background: #E8F9ED;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .td-recruiting-card p {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .td-post-job-btn {
          width: 100%;
          background: #1CCB43;
          color: #fff;
          border: none;
          padding: 8px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Main Content Styling */
        .td-main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .td-topbar {
          height: 70px;
          background: #fff;
          border-bottom: 1px solid #E9ECEF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
        }

        .td-search-box {
          background: #E9ECEF;
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 8px 16px;
          width: 320px;
        }

        .td-search-icon { color: #6C757D; }

        .td-search-box input {
          background: transparent;
          border: none;
          outline: none;
          margin-left: 10px;
          font-size: 14px;
          width: 100%;
        }

        .td-topbar-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .td-icon-badge {
          font-size: 20px;
          color: #6C757D;
          cursor: pointer;
        }

        .td-user-avatar img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .td-content {
          padding: 32px;
        }

        .td-welcome-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .td-welcome-header h1 { font-size: 28px; font-weight: 700; color: #111; margin-bottom: 4px; }
        .td-subtitle { color: #6C757D; font-size: 15px; }

        .td-location-badge {
          background: #fff;
          border: 1px solid #E9ECEF;
          padding: 8px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .td-grid-main {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
        }

        .td-stats-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        .td-stat-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .td-profile-card { border: 1px solid #E9ECEF; }

        .td-card-header { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 16px; }
        .td-percent-badge { background: #E8F9ED; color: #1CCB43; padding: 4px 8px; border-radius: 12px; font-size: 12px; }

        .td-progress-bar { height: 8px; background: #F1F3F5; border-radius: 4px; margin-bottom: 16px; }
        .td-progress-fill { height: 100%; background: #1CCB43; border-radius: 4px; }

        .td-card-hint { font-size: 12px; color: #6C757D; line-height: 1.5; margin-bottom: 20px; }

        .td-complete-profile-btn {
          width: 100%;
          background: #1CCB43;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-mini-card { display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .td-mini-icon-circle { 
          width: 32px; height: 32px; border-radius: 50%; background: #E9ECEF; display: flex; align-items: center; justify-content: center; color: #6C757D; margin-bottom: 16px;
        }
        .td-mini-icon-circle.green { background: #E8F9ED; color: #1CCB43; }
        .td-mini-icon-circle.red { background: #FFE8E8; color: #FA5252; }

        .td-mini-label { font-size: 11px; font-weight: 700; color: #6C757D; margin-bottom: 8px; }
        .td-mini-value-row { display: flex; align-items: baseline; gap: 8px; }
        .td-mini-value { font-size: 24px; font-weight: 800; }
        .td-mini-growth { color: #1CCB43; font-size: 12px; font-weight: 600; }
        .td-mini-total, .td-mini-action { font-size: 12px; color: #6C757D; }

        .td-jobs-section h2 { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
        .td-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .td-section-header a { font-size: 13px; color: #1CCB43; font-weight: 600; text-decoration: none; }

        .td-job-list { display: flex; flex-direction: column; gap: 16px; }

        .td-job-item {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          gap: 20px;
          border: 1px solid #E9ECEF;
        }

        .td-job-icon {
          width: 50px; height: 50px; background: #F1F3F5; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #6C757D; font-size: 20px;
        }

        .td-job-details { flex: 1; }
        .td-job-title-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .td-job-title-row h3 { font-size: 16px; font-weight: 700; }
        .td-job-type-badge { background: #E8F9ED; color: #1CCB43; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; }
        .td-job-type-badge.residential { background: #FFF9DB; color: #F59F00; }

        .td-job-school { font-size: 13px; color: #6C757D; margin-bottom: 12px; }

        .td-job-tags { display: flex; gap: 8px; margin-bottom: 16px; }
        .td-job-tags span { background: #F1F3F5; color: #495057; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }

        .td-job-footer { display: flex; align-items: center; gap: 16px; border-top: 1px solid #F1F3F5; pt: 16px; margin-top: 16px; padding-top: 16px; }
        .td-job-salary { font-size: 13px; font-weight: 700; color: #1CCB43; }
        .td-job-time { font-size: 12px; color: #ADB5BD; flex: 1; }
        .td-quick-apply { font-size: 13px; font-weight: 700; color: #1CCB43; text-decoration: none; }

        /* Right Sidebar Content */
        .td-side-section { background: #fff; border-radius: 24px; padding: 24px; margin-bottom: 24px; }
        .td-side-section h3 { font-size: 15px; font-weight: 700; margin-bottom: 20px; }

        .td-interview-item { display: flex; gap: 16px; margin-bottom: 16px; }
        .td-date-box { width: 44px; height: 50px; background: #F1F3F5; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .td-date-box.green { background: #E8F9ED; }
        .td-day { font-size: 18px; font-weight: 800; }
        .td-month { font-size: 9px; font-weight: 700; color: #6C757D; }
        .td-int-info h4 { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
        .td-int-info p { font-size: 11px; color: #6C757D; }

        .td-pro-card {
          background: #0D4E2E;
          border-radius: 24px;
          padding: 24px;
          color: #fff;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .td-pro-badge { font-size: 24px; margin-bottom: 12px; }
        .td-pro-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .td-pro-card p { font-size: 12px; opacity: 0.8; line-height: 1.5; margin-bottom: 20px; }
        .td-upgrade-btn { width: 100%; background: #1CCB43; color: #fff; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; }

        .td-shortcuts-section h3 { font-size: 13px; font-weight: 800; color: #495057; margin-bottom: 20px; letter-spacing: 0.5px; }
        .td-shortcuts-row { display: flex; gap: 16px; }
        .td-shortcut { 
          flex: 1; background: #fff; border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s;
        }
        .td-shortcut:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .td-shortcut svg { font-size: 20px; color: #1CCB43; }
        .td-shortcut span { font-size: 11px; font-weight: 700; color: #495057; }

        .td-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0D4E2E;
          color: #fff;
          border: none;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          cursor: pointer;
        }
      `}</style>
    </motion.div>
  );
}
