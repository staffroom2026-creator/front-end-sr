import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch, FiBell, FiMail, FiGrid, FiBriefcase,
  FiFileText, FiMessageSquare, FiSettings, FiPlus,
  FiMapPin, FiEye, FiZap, FiHome, FiCpu
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
  const [mobileTab, setMobileTab] = useState('home');

  return (
    <motion.div
      className="td-layout"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Desktop Sidebar ── */}
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

        {/* ── Mobile Top Bar ── */}
        <header className="td-mobile-topbar">
          <div className="td-mobile-avatar">
            <img src="https://ui-avatars.com/api/?name=Mrs+Adeloa&background=A8E6B8&color=1CCB43" alt="Avatar" />
          </div>
          <div className="td-mobile-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1CCB43">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Staffroom</span>
          </div>
          <button className="td-mobile-bell">
            <FiBell />
            <span className="td-bell-dot" />
          </button>
        </header>

        {/* ── Desktop Top Bar ── */}
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

          {/* ── Welcome Area ── */}
          <div className="td-welcome-header">
            <div>
              <h1>Welcome, Mrs Adeloa</h1>
              {/* Desktop subtitle */}
              <p className="td-subtitle">Your academic career overview for today.</p>
              {/* Mobile location */}
              <div className="td-mobile-location">
                <FiMapPin size={12} color="#1CCB43" />
                <span>Victoria Island, Lagos</span>
              </div>
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

              {/* ── Stats Overview ── */}
              <div className="td-stats-row">
                {/* Profile Strength Card */}
                <motion.div variants={cardVariants} className="td-stat-card td-profile-card">
                  <div className="td-card-header">
                    <span>Profile Strength</span>
                    <span className="td-percent-badge">75%</span>
                  </div>
                  {/* Mobile profile strength layout */}
                  <div className="td-mobile-profile-strength">
                    <p className="td-mobile-ps-label">PROFILE STRENGTH</p>
                    <div className="td-mobile-ps-row">
                      <span className="td-mobile-ps-value">85%</span>
                      <div className="td-mobile-ps-icon"><FiZap size={18} /></div>
                    </div>
                    <div className="td-progress-bar">
                      <div className="td-progress-fill" style={{ width: '85%' }}></div>
                    </div>
                    <p className="td-card-hint">Almost there! Add a certification to reach 100%.</p>
                  </div>
                  {/* Desktop layout */}
                  <div className="td-desktop-profile-strength">
                    <div className="td-progress-bar">
                      <div className="td-progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <p className="td-card-hint">Your profile is missing some vital academic certifications popular with Tier-1 schools.</p>
                    <button className="td-complete-profile-btn">Complete Profile →</button>
                  </div>
                </motion.div>

                {/* Mini cards row — 2-col on mobile, inline on desktop */}
                <div className="td-stats-mini-wrapper">
                  {/* Profile Views */}
                  <motion.div variants={cardVariants} className="td-stat-card td-mini-card">
                    <div className="td-mini-icon-circle">
                      <FiEye />
                    </div>
                    <p className="td-mini-label">PROFILE VIEWS</p>
                    <div className="td-mini-value-row">
                      <span className="td-mini-value">1,284</span>
                      <span className="td-mini-growth">+12%</span>
                    </div>
                    <span className="td-mini-sub">this week</span>
                  </motion.div>

                  {/* Active Feeds */}
                  <motion.div variants={cardVariants} className="td-stat-card td-mini-card">
                    <div className="td-mini-icon-circle green">
                      <FiBriefcase />
                    </div>
                    <p className="td-mini-label">ACTIVE FEEDS</p>
                    <div className="td-mini-value-row">
                      <span className="td-mini-value">14</span>
                    </div>
                    <span className="td-mini-sub">3 new today</span>
                  </motion.div>

                  {/* Pending Review (desktop only) */}
                  <motion.div variants={cardVariants} className="td-stat-card td-mini-card td-desktop-only-card">
                    <div className="td-mini-icon-circle red"><FiFileText /></div>
                    <p className="td-mini-label">PENDING REVIEW</p>
                    <div className="td-mini-value-row">
                      <span className="td-mini-value">08</span>
                      <span className="td-mini-action">Action Req.</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ── Active Job Feeds ── */}
              <div className="td-jobs-section">
                <div className="td-section-header">
                  <h2>
                    <span className="td-desktop-label">Active Job Feeds</span>
                    <span className="td-mobile-label">Priority Job Feeds</span>
                  </h2>
                  <a href="#">View All</a>
                </div>

                <div className="td-job-list">
                  <motion.div variants={cardVariants} className="td-job-item">
                    <div className="td-job-icon td-job-icon--math">Σ</div>
                    <div className="td-job-details">
                      <div className="td-job-title-row">
                        <h3>Mathematics Teacher (IGCSE)</h3>
                        <span className="td-job-type-badge">FULL-TIME</span>
                      </div>
                      <p className="td-job-school">Lekki British School • Ikoyi, Lagos</p>
                      <div className="td-job-tags">
                        <span>LAGOS</span>
                        <span>3 DAYS AGO</span>
                      </div>
                      {/* Desktop extra tags */}
                      <div className="td-job-tags td-desktop-tags">
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
                    <div className="td-job-icon td-job-icon--school">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#9ca3af">
                        <path d="M12 3L1 9l4 2.18V15l7 3.82L19 15v-3.82L21 10V17h2V9L12 3zm5 11.99l-5 2.73-5-2.73v-3.06L12 15l5-3.07v3.06z"/>
                      </svg>
                    </div>
                    <div className="td-job-details">
                      <div className="td-job-title-row">
                        <h3>Head of Primary Studies</h3>
                        <span className="td-job-type-badge td-job-type-badge--exec">EXECUTIVE</span>
                      </div>
                      <p className="td-job-school">Corona Schools Trust • Executive</p>
                      <div className="td-job-tags">
                        <span>IKOYI</span>
                        <span>JUST NOW</span>
                      </div>
                      <div className="td-job-footer">
                        <span className="td-job-salary">₦350k - ₦480k Monthly</span>
                        <span className="td-job-time">1 week ago</span>
                        <a href="#" className="td-quick-apply">Quick Apply →</a>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ── Mobile CTA Card ── */}
              <motion.div variants={cardVariants} className="td-mobile-cta-card">
                <div className="td-mobile-cta-text">
                  <h3>Enhance Your Visibility</h3>
                  <p>Schools in Victoria Island are looking for certified teachers.</p>
                </div>
                <button className="td-mobile-cta-btn">UPDATE CV</button>
              </motion.div>

            </div>

            {/* ── Right Sidebar (Desktop Only) ── */}
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

      {/* ── Desktop FAB ── */}
      <button className="td-fab"><FiPlus /></button>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="td-mobile-bottomnav">
        {[
          { id: 'home', icon: <FiHome />, label: 'HOME' },
          { id: 'jobs', icon: <FiBriefcase />, label: 'JOBS' },
          { id: 'apps', icon: <FiCpu />, label: 'APPS' },
          { id: 'profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, label: 'PROFILE' },
          { id: 'settings', icon: <FiSettings />, label: 'SETTINGS' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`td-bottomnav-tab ${mobileTab === tab.id ? 'td-bottomnav-tab--active' : ''}`}
            onClick={() => setMobileTab(tab.id)}
          >
            <span className="td-bottomnav-icon">{tab.icon}</span>
            <span className="td-bottomnav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .td-layout {
          display: flex;
          background-color: #F8F9FA;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        /* ═══════════════════════════════════════
           SIDEBAR (Desktop)
        ═══════════════════════════════════════ */
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

        .td-nav { display: flex; flex-direction: column; gap: 4px; }

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

        .td-sidebar-footer { margin-top: auto; padding: 0 16px; }
        .td-recruiting-card {
          background: #E8F9ED;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        .td-recruiting-card p { font-size: 12px; font-weight: 600; margin-bottom: 12px; }
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

        /* ═══════════════════════════════════════
           MAIN WRAPPER
        ═══════════════════════════════════════ */
        .td-main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ═══════════════════════════════════════
           DESKTOP TOPBAR
        ═══════════════════════════════════════ */
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
        .td-topbar-actions { display: flex; align-items: center; gap: 20px; }
        .td-icon-badge { font-size: 20px; color: #6C757D; cursor: pointer; }
        .td-user-avatar img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        /* ═══════════════════════════════════════
           MOBILE TOPBAR
        ═══════════════════════════════════════ */
        .td-mobile-topbar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: #fff;
          border-bottom: 1px solid #F1F3F5;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .td-mobile-avatar img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #E8F9ED;
        }
        .td-mobile-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 17px;
          letter-spacing: -0.3px;
          color: #111;
        }
        .td-mobile-bell {
          background: none;
          border: none;
          font-size: 22px;
          color: #111;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
        }
        .td-bell-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 8px;
          height: 8px;
          background: #1CCB43;
          border-radius: 50%;
          border: 1.5px solid #fff;
        }

        /* ═══════════════════════════════════════
           CONTENT AREA
        ═══════════════════════════════════════ */
        .td-content { padding: 32px; }

        /* Welcome Header */
        .td-welcome-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .td-welcome-header h1 { font-size: 28px; font-weight: 700; color: #111; margin-bottom: 4px; }
        .td-subtitle { color: #6C757D; font-size: 15px; }

        .td-mobile-location {
          display: none;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6C757D;
          margin-top: 4px;
        }

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
          white-space: nowrap;
        }

        /* Grid */
        .td-grid-main {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
        }

        /* ═══════════════════════════════════════
           STATS ROW
        ═══════════════════════════════════════ */
        .td-stats-row {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          align-items: stretch;
        }
        .td-stats-row .td-profile-card { flex: 1.5; }
        .td-stats-mini-wrapper {
          display: contents; /* on desktop, children participate in parent flex directly */
        }
        .td-stats-mini-wrapper .td-mini-card { flex: 1; }

        .td-stat-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .td-profile-card { border: 1px solid #E9ECEF; }

        /* Desktop profile card internals */
        .td-mobile-profile-strength { display: none; }
        .td-desktop-profile-strength { display: block; }

        .td-card-header { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 16px; }
        .td-percent-badge { background: #E8F9ED; color: #1CCB43; padding: 4px 8px; border-radius: 12px; font-size: 12px; }

        .td-progress-bar { height: 8px; background: #F1F3F5; border-radius: 4px; margin-bottom: 16px; }
        .td-progress-fill { height: 100%; background: #1CCB43; border-radius: 4px; transition: width 0.8s ease; }

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

        .td-mini-card {
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .td-mini-icon-circle {
          width: 32px; height: 32px; border-radius: 50%;
          background: #E9ECEF;
          display: flex; align-items: center; justify-content: center;
          color: #6C757D;
          margin-bottom: 16px;
        }
        .td-mini-icon-circle.green { background: #E8F9ED; color: #1CCB43; }
        .td-mini-icon-circle.red { background: #FFE8E8; color: #FA5252; }

        .td-mini-label { font-size: 11px; font-weight: 700; color: #6C757D; margin-bottom: 8px; }
        .td-mini-value-row { display: flex; align-items: baseline; gap: 8px; }
        .td-mini-value { font-size: 24px; font-weight: 800; color: #111; }
        .td-mini-growth { color: #1CCB43; font-size: 12px; font-weight: 600; }
        .td-mini-sub { font-size: 11px; color: #1CCB43; font-weight: 600; margin-top: 4px; }
        .td-mini-total, .td-mini-action { font-size: 12px; color: #6C757D; }

        /* Desktop-only card hidden on mobile */
        .td-desktop-only-card { display: flex; }

        /* ═══════════════════════════════════════
           JOBS SECTION
        ═══════════════════════════════════════ */
        .td-jobs-section h2 { font-size: 22px; font-weight: 700; }
        .td-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .td-section-header a { font-size: 13px; color: #1CCB43; font-weight: 600; text-decoration: none; }

        .td-mobile-label { display: none; }
        .td-desktop-label { display: inline; }

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
          width: 50px; height: 50px;
          background: #F1F3F5;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          color: #6C757D;
          font-size: 20px;
          flex-shrink: 0;
        }
        .td-job-icon--math { background: #F8F0FF; color: #7C3AED; }
        .td-job-icon--school { background: #F1F3F5; }

        .td-job-details { flex: 1; }
        .td-job-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 8px; }
        .td-job-title-row h3 { font-size: 16px; font-weight: 700; }

        .td-job-type-badge { background: #E8F9ED; color: #1CCB43; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; white-space: nowrap; }
        .td-job-type-badge--exec { background: #FFF9DB; color: #F59F00; }

        .td-job-school { font-size: 13px; color: #6C757D; margin-bottom: 12px; }

        .td-job-tags { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .td-job-tags span {
          background: #F1F3F5;
          color: #495057;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .td-desktop-tags { display: flex; }

        .td-job-footer {
          display: flex;
          align-items: center;
          gap: 16px;
          border-top: 1px solid #F1F3F5;
          margin-top: 16px;
          padding-top: 16px;
          flex-wrap: wrap;
        }
        .td-job-salary { font-size: 13px; font-weight: 700; color: #1CCB43; }
        .td-job-time { font-size: 12px; color: #ADB5BD; flex: 1; }
        .td-quick-apply { font-size: 13px; font-weight: 700; color: #1CCB43; text-decoration: none; }

        /* Mobile CTA Card */
        .td-mobile-cta-card { display: none; }

        /* ═══════════════════════════════════════
           RIGHT SIDEBAR (Desktop only)
        ═══════════════════════════════════════ */
        .td-side-section { background: #fff; border-radius: 24px; padding: 24px; margin-bottom: 24px; }
        .td-side-section h3 { font-size: 15px; font-weight: 700; margin-bottom: 20px; }

        .td-interview-item { display: flex; gap: 16px; margin-bottom: 16px; }
        .td-date-box {
          width: 44px; height: 50px;
          background: #F1F3F5;
          border-radius: 8px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
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
        .td-upgrade-btn {
          width: 100%;
          background: #1CCB43;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-shortcuts-section h3 { font-size: 13px; font-weight: 800; color: #495057; margin-bottom: 20px; letter-spacing: 0.5px; }
        .td-shortcuts-row { display: flex; gap: 16px; }
        .td-shortcut {
          flex: 1; background: #fff; border-radius: 20px; padding: 20px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          cursor: pointer; transition: 0.2s;
        }
        .td-shortcut:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .td-shortcut svg { font-size: 20px; color: #1CCB43; }
        .td-shortcut span { font-size: 11px; font-weight: 700; color: #495057; }

        /* ═══════════════════════════════════════
           FAB (Desktop)
        ═══════════════════════════════════════ */
        .td-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: #0D4E2E;
          color: #fff;
          border: none;
          font-size: 24px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        /* ═══════════════════════════════════════
           MOBILE BOTTOM NAV
        ═══════════════════════════════════════ */
        .td-mobile-bottomnav { display: none; }

        /* ═══════════════════════════════════════
           MOBILE BREAKPOINT ≤ 768px
        ═══════════════════════════════════════ */
        @media (max-width: 768px) {
          .td-layout {
            flex-direction: column;
            background: #F4F5F7;
            padding-bottom: 80px;
          }

          /* Hide desktop elements */
          .td-sidebar { display: none; }
          .td-topbar { display: none; }
          .td-fab { display: none; }
          .td-location-badge { display: none; }
          .td-desktop-label { display: none; }
          .td-desktop-tags { display: none; }
          .td-desktop-only-card { display: none; }
          .td-subtitle { display: none; }

          /* Show mobile elements */
          .td-mobile-topbar { display: flex; }
          .td-mobile-location { display: flex; }
          .td-mobile-label { display: inline; }
          .td-mobile-cta-card { display: flex; }
          .td-mobile-bottomnav { display: flex; }

          /* Profile card: show mobile variant, hide desktop variant */
          .td-mobile-profile-strength { display: block; }
          .td-desktop-profile-strength { display: none; }
          .td-card-header { display: none; }

          /* Main wrapper */
          .td-main-wrapper { overflow: visible; }

          /* Content padding */
          .td-content { padding: 20px 16px; }

          /* Welcome */
          .td-welcome-header {
            margin-bottom: 20px;
            flex-direction: column;
            align-items: flex-start;
          }
          .td-welcome-header h1 { font-size: 26px; font-weight: 800; }

          /* Grid: single column on mobile */
          .td-grid-main {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .td-right-col { display: none; }

          /* Stats Row */
          .td-stats-row {
            flex-direction: column;
            gap: 12px;
            margin-bottom: 28px;
          }
          .td-stats-row .td-profile-card { flex: none; }
          .td-stats-mini-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .td-stats-mini-wrapper .td-mini-card { flex: none; }
          .td-profile-card {
            border-radius: 20px;
            padding: 20px;
            border: none;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          }
          .td-mobile-ps-label {
            font-size: 11px;
            font-weight: 700;
            color: #6C757D;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .td-mobile-ps-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .td-mobile-ps-value {
            font-size: 40px;
            font-weight: 800;
            color: #1CCB43;
            line-height: 1;
          }
          .td-mobile-ps-icon {
            width: 48px; height: 48px;
            background: #E8F9ED;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #1CCB43;
          }
          .td-profile-card .td-progress-bar {
            height: 10px;
            border-radius: 6px;
            margin-bottom: 14px;
          }
          .td-profile-card .td-card-hint {
            font-size: 13px;
            color: #6C757D;
            margin-bottom: 0;
          }

          /* Mini cards: 2-column side by side */
          .td-stats-row .td-mini-card {
            display: none; /* hide individually, then show pair */
          }
          /* Show mini cards in a 2-col row using a wrapper trick via nth-child */
          .td-stats-row .td-mini-card:nth-child(2),
          .td-stats-row .td-mini-card:nth-child(3) {
            display: flex;
          }
          /* Force them into a row using CSS grid on parent */
          .td-stats-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }
          /* Profile card spans full */
          .td-stats-row .td-profile-card {
            grid-column: 1 / -1;
          }
          /* 2 mini cards in a row */
          .td-mini-cards-row-mobile {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .td-mini-card {
            border-radius: 20px;
            padding: 18px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          }
          .td-mini-icon-circle { margin-bottom: 12px; }
          .td-mini-value { font-size: 28px; }

          /* Job Section */
          .td-jobs-section { margin-bottom: 20px; }
          .td-jobs-section h2 { font-size: 20px; font-weight: 800; }

          /* Job cards: left green border accent */
          .td-job-item {
            border-radius: 16px;
            padding: 16px;
            gap: 14px;
            border: none;
            border-left: 4px solid #1CCB43;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          }
          .td-job-icon {
            width: 44px; height: 44px;
            border-radius: 50%;
            font-size: 18px;
          }
          .td-job-icon--math { background: #F8F0FF; }
          .td-job-icon--school { background: #F1F3F5; }

          .td-job-title-row h3 { font-size: 15px; }
          .td-job-footer { display: none; }

          /* Mobile CTA Card */
          .td-mobile-cta-card {
            background: #B5F0A5;
            border-radius: 20px;
            padding: 22px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-top: 8px;
          }
          .td-mobile-cta-text h3 {
            font-size: 16px;
            font-weight: 800;
            color: #111;
            margin-bottom: 6px;
          }
          .td-mobile-cta-text p {
            font-size: 12px;
            color: #2D5016;
            line-height: 1.4;
          }
          .td-mobile-cta-btn {
            background: #111;
            color: #fff;
            border: none;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.5px;
            cursor: pointer;
            white-space: nowrap;
          }

          /* Bottom Nav */
          .td-mobile-bottomnav {
  position: fixed;
  bottom: 12px;
  left: 12px;
  right: 12px;
  background: rgba(255,255,255,0.85);
  border: 1px solid rgba(255,255,255,0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 200;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
          .td-bottomnav-tab {
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            border-radius: 12px;
            transition: 0.15s;
          }
          .td-bottomnav-tab--active {
            background: #E8F9ED;
          }
          .td-bottomnav-icon {
            font-size: 20px;
            color: #ADB5BD;
            display: flex;
            align-items: center;
          }
          .td-bottomnav-tab--active .td-bottomnav-icon {
            color: #1CCB43;
          }
          .td-bottomnav-label {
            font-size: 9px;
            font-weight: 800;
            color: #ADB5BD;
            letter-spacing: 0.3px;
          }
          .td-bottomnav-tab--active .td-bottomnav-label {
            color: #1CCB43;
          }
        }

      `}</style>
    </motion.div>
  );
}