import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch, FiBell, FiMail, FiGrid, FiBriefcase,
  FiFileText, FiMessageSquare, FiSettings, FiPlus,
  FiMapPin, FiEye, FiZap, FiHome, FiCpu, FiBookmark, FiMap, FiFilter, FiCheck, FiChevronDown, FiClock
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [salaryRange, setSalaryRange] = useState(250000);

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
          <div className={`td-nav-item ${activeTab === 'dashboard' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FiGrid /> <span>Dashboard</span>
          </div>
          <div className={`td-nav-item ${activeTab === 'jobs' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('jobs')}>
            <FiBriefcase /> <span>Job Feeds</span>
          </div>
          <div className={`td-nav-item ${activeTab === 'notifications' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <FiBell /> <span>Notifications</span>
          </div>
          <div className={`td-nav-item ${activeTab === 'applications' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('applications')}>
            <FiFileText /> <span>Applications</span>
          </div>
          <div className={`td-nav-item ${activeTab === 'messages' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('messages')}>
            <FiMessageSquare /> <span>Messages</span>
          </div>
          <div className={`td-nav-item ${activeTab === 'settings' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('settings')}>
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

          {activeTab === 'dashboard' && (
            <>
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
            </>
          )}

          {activeTab === 'jobs' && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-jobs-tab">
              <div className="td-jobs-hero">
                <h1>Find your next <span className="td-highlight">teaching milestone.</span></h1>
                <p>Connecting Nigeria's finest educators with prestigious academic institutions.</p>
                
                <div className="td-jobs-search-bar td-desktop-search">
                  <motion.div whileHover={{ scale: 1.02 }} className="td-search-input-group">
                    <FiBriefcase className="td-search-icon" />
                    <input type="text" placeholder="Subject (e.g., Physics, English)" className="td-interactive-input" />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} className="td-search-input-group">
                    <FiMapPin className="td-search-icon" />
                    <input type="text" placeholder="Benin City, Lagos..." className="td-interactive-input" />
                  </motion.div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-btn-primary"><FiSearch /> Find Jobs</motion.button>
                </div>

                <div className="td-mobile-jobs-search">
                  <motion.div whileHover={{ scale: 1.02 }} className="td-search-box-mobile">
                    <FiSearch className="td-search-icon" />
                    <input type="text" placeholder="Role, subject or keyword" className="td-interactive-input" />
                  </motion.div>
                  <div className="td-mobile-filter-chips">
                    <div className="td-filter-chip td-chip-green"><FiMapPin size={14} /> Lagos</div>
                    <div className="td-filter-chip td-chip-lightgreen"><FiClock size={14} /> Full-time</div>
                    <div className="td-filter-chip td-chip-gray"><FiBriefcase size={14} /> ₦250k+</div>
                  </div>
                </div>
              </div>

              <div className="td-jobs-layout">
                <div className="td-jobs-filters td-desktop-only">
                  <div className="td-filter-header">
                    <h3>Filters</h3>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="td-clear-btn">Clear all</motion.button>
                  </div>
                  
                  <div className="td-filter-group">
                    <h4>EDUCATION LEVEL</h4>
                    <label className="td-checkbox-label">
                      <div className="td-checkbox-custom td-checked"><FiCheck size={12}/></div>
                      Secondary (SS1-SS3)
                    </label>
                    <label className="td-checkbox-label">
                      <div className="td-checkbox-custom"></div>
                      Primary School
                    </label>
                    <label className="td-checkbox-label">
                      <div className="td-checkbox-custom"></div>
                      Tertiary Institution
                    </label>
                  </div>

                  <div className="td-filter-group">
                    <h4>JOB TYPE</h4>
                    <div className="td-filter-tags">
                      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-tag td-tag-active">Full-time</motion.span>
                      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-tag">Part-time</motion.span>
                      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-tag">Online</motion.span>
                      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-tag">Contract</motion.span>
                    </div>
                  </div>

                  <div className="td-filter-group">
                    <h4>MONTHLY SALARY (₦): ₦{salaryRange.toLocaleString()}</h4>
                    <div className="td-progress-scroll-wrapper">
                      <input 
                        type="range" 
                        min="50000" 
                        max="1000000" 
                        step="10000"
                        value={salaryRange} 
                        onChange={(e) => setSalaryRange(e.target.value)}
                        className="td-progress-scroll-input" 
                      />
                      <div className="td-range-labels">
                        <span>₦50k</span>
                        <span>₦1M+</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="td-jobs-list-container">
                  <div className="td-jobs-list-header">
                    <div className="td-desktop-showing">Showing <strong>124 jobs</strong> in Nigeria</div>
                    <div className="td-mobile-showing">
                      <h3>Recommended for you</h3>
                      <span>124 JOBS FOUND</span>
                    </div>
                    <div className="td-sort-by td-desktop-only">
                      Sort by: <strong>Newest First</strong> <FiChevronDown />
                    </div>
                  </div>

                  <div className="td-feed-list">
                    <motion.div variants={cardVariants} className="td-feed-card">
                      <div className="td-fc-header">
                        <div className="td-fc-icon-wrapper">
                          <div className="td-fc-icon td-bg-gray">
                            <FiBriefcase size={20} color="#495057"/>
                          </div>
                        </div>
                        <div className="td-fc-main-info">
                          <div className="td-fc-title-row">
                            <h3>Mathematics Tutor – SS2/SS3</h3>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="td-bookmark-btn"><FiBookmark /></motion.button>
                          </div>
                          <p className="td-fc-school">British International School <span className="td-dot">•</span> Lekki, Lagos State</p>
                        </div>
                        <div className="td-fc-badge-desktop"><span className="td-badge-featured"><FiCheck size={12}/> Featured</span></div>
                      </div>
                      <div className="td-fc-meta">
                        <div className="td-fc-meta-item"><FiBriefcase /> Full-time</div>
                        <div className="td-fc-meta-item"><FiClock /> 2 hours ago</div>
                      </div>
                      <div className="td-fc-footer">
                        <div className="td-fc-salary">₦350,000 <span>/ month</span></div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-fc-action">View Details</motion.button>
                      </div>
                    </motion.div>

                    <motion.div variants={cardVariants} className="td-feed-card">
                      <div className="td-fc-header">
                        <div className="td-fc-icon-wrapper">
                          <div className="td-fc-icon td-bg-gold">
                            <FiBriefcase size={20} color="#947600"/>
                          </div>
                        </div>
                        <div className="td-fc-main-info">
                          <div className="td-fc-title-row">
                            <h3>English Language & Literature Teacher</h3>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="td-bookmark-btn"><FiBookmark /></motion.button>
                          </div>
                          <p className="td-fc-school">Grace Academy <span className="td-dot">•</span> Benin City, Edo State</p>
                        </div>
                      </div>
                      <div className="td-fc-meta">
                        <div className="td-fc-meta-item"><FiBriefcase /> Contract</div>
                        <div className="td-fc-meta-item"><FiClock /> 1 day ago</div>
                      </div>
                      <div className="td-fc-footer">
                        <div className="td-fc-salary">₦180,000 <span>/ month</span></div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-fc-action">View Details</motion.button>
                      </div>
                    </motion.div>

                    <motion.div variants={cardVariants} className="td-feed-card td-feed-card-hot td-mobile-only">
                      <div className="td-hot-header">
                        <span className="td-hot-badge">HOT VACANCY</span>
                        <span className="td-hot-time">Posted 2h ago</span>
                      </div>
                      <h3>Vice Principal (Academic)</h3>
                      <p>Atlantic Hall School <span className="td-dot">•</span> Epe, Lagos</p>
                      <div className="td-hot-salary-range">SALARY RANGE</div>
                      <div className="td-hot-footer">
                        <div className="td-hot-salary-value">₦650k - ₦800k</div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-hot-action">Apply Fast</motion.button>
                      </div>
                    </motion.div>

                    <motion.div variants={cardVariants} className="td-feed-card">
                      <div className="td-fc-header">
                        <div className="td-fc-icon-wrapper">
                          <div className="td-fc-icon td-bg-purple">
                            <FiBriefcase size={20} color="#5F3DC4"/>
                          </div>
                        </div>
                        <div className="td-fc-main-info">
                          <div className="td-fc-title-row">
                            <h3>Physics & Further Maths Expert</h3>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="td-bookmark-btn"><FiBookmark /></motion.button>
                          </div>
                          <p className="td-fc-school">Home-Schooling Premium <span className="td-dot">•</span> Maitama, Abuja</p>
                        </div>
                      </div>
                      <div className="td-fc-meta">
                        <div className="td-fc-meta-item"><FiBriefcase /> Online/Remote</div>
                        <div className="td-fc-meta-item"><FiClock /> 2 days ago</div>
                      </div>
                      <div className="td-fc-footer">
                        <div className="td-fc-salary">₦15k <span>/ hour</span></div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-fc-action">View Details</motion.button>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={cardVariants} className="td-feed-card td-mobile-only">
                      <div className="td-fc-header">
                        <div className="td-fc-icon-wrapper">
                          <div className="td-fc-icon td-bg-gray">
                            <FiBriefcase size={20} color="#495057"/>
                          </div>
                        </div>
                        <div className="td-fc-main-info">
                          <div className="td-fc-title-row">
                            <h3>Computer Science Tutor</h3>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="td-bookmark-btn"><FiBookmark /></motion.button>
                          </div>
                          <p className="td-fc-school">Grange School <span className="td-dot">•</span> Ikeja GRA</p>
                        </div>
                      </div>
                      <div className="td-fc-meta">
                        <div className="td-fc-meta-item"><FiBriefcase /> Part time</div>
                        <div className="td-fc-meta-item"><FiClock /> 1 day ago</div>
                        <div className="td-fc-meta-tag td-tag-stem">STEM</div>
                      </div>
                      <div className="td-fc-footer">
                        <div className="td-fc-salary">₦180,000 <span>/ month</span></div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-fc-action">View Details</motion.button>
                      </div>
                    </motion.div>

                  </div>
                  
                  <div className="td-load-more-container">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-load-more-btn">Load More Jobs</motion.button>
                    <p>Showing 3 of 124 results</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Desktop FAB ── */}
      <button className="td-fab"><FiPlus /></button>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="td-mobile-bottomnav">
        {[
          { id: 'dashboard', icon: <FiHome />, label: 'HOME' },
          { id: 'jobs', icon: <FiBriefcase />, label: 'JOBS' },
          { id: 'application', icon: <FiFileText />, label: 'APPLICATIONS' },
          { id: 'profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, label: 'PROFILE' },
          { id: 'settings', icon: <FiSettings />, label: 'SETTINGS' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`td-bottomnav-tab ${activeTab === tab.id ? 'td-bottomnav-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
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
           JOB FEEDS TAB
        ═══════════════════════════════════════ */
        .td-jobs-tab { display: flex; flex-direction: column; }
        .td-jobs-hero { margin-bottom: 32px; }
        .td-jobs-hero h1 { font-size: 36px; font-weight: 800; color: #111; margin-bottom: 8px; }
        .td-highlight { color: #1CCB43; }
        .td-jobs-hero p { color: #6C757D; font-size: 15px; margin-bottom: 24px; max-width: 500px; }
        
        .td-desktop-search { display: flex; gap: 16px; background: #fff; padding: 12px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .td-search-input-group { flex: 1; display: flex; align-items: center; background: #F8F9FA; padding: 12px 16px; border-radius: 12px; gap: 12px; }
        .td-search-input-group input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
        .td-btn-primary { background: #0b7a24; color: white; border: none; padding: 0 24px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        .td-btn-primary:hover { background: #09611c; }
        
        .td-mobile-jobs-search { display: none; }

        .td-jobs-layout { display: flex; gap: 32px; align-items: flex-start; }
        .td-jobs-filters { width: 260px; flex-shrink: 0; }
        .td-filter-header { display: flex; justify-content: space-between; margin-bottom: 24px; align-items: center; }
        .td-filter-header h3 { font-size: 16px; font-weight: 800; }
        .td-clear-btn { background: none; border: none; color: #1CCB43; font-size: 12px; font-weight: 600; cursor: pointer; }
        
        .td-filter-group { margin-bottom: 32px; }
        .td-filter-group h4 { font-size: 12px; color: #6C757D; font-weight: 800; margin-bottom: 16px; letter-spacing: 0.5px; }
        .td-checkbox-label { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #495057; margin-bottom: 12px; cursor: pointer; }
        .td-checkbox-custom { width: 20px; height: 20px; border-radius: 6px; border: 2px solid #DEE2E6; display: flex; align-items: center; justify-content: center; }
        .td-checkbox-custom.td-checked { background: #1CCB43; border-color: #1CCB43; color: white; }
        
        .td-filter-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .td-tag { padding: 8px 16px; border-radius: 20px; background: #E9ECEF; color: #495057; font-size: 13px; font-weight: 600; cursor: pointer; }
        .td-tag-active { background: #B5F0A5; color: #111; }
        
        .td-progress-scroll-wrapper { position: relative; padding-top: 10px; }
        .td-progress-scroll-input {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: #DEE2E6;
          border-radius: 3px;
          outline: none;
          margin-bottom: 12px;
        }
        .td-progress-scroll-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #1CCB43;
          border-radius: 50%;
          cursor: pointer;
          transition: 0.2s;
        }
        .td-progress-scroll-input::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 10px rgba(28,203,67,0.4);
        }
        .td-progress-scroll-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #1CCB43;
          border-radius: 50%;
          cursor: pointer;
          transition: 0.2s;
        }
        .td-progress-scroll-input::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
        .td-range-labels { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #111; }
        
        .td-interactive-input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; transition: 0.3s; }
        .td-interactive-input:focus { color: #1CCB43; }
        .td-search-input-group { border: 2px solid transparent; transition: 0.3s; }
        .td-search-input-group:focus-within { border-color: #1CCB43; background: #fff; box-shadow: 0 4px 12px rgba(28,203,67,0.1); }

        .td-jobs-list-container { flex: 1; }
        .td-jobs-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .td-desktop-showing { font-size: 14px; color: #6C757D; }
        .td-sort-by { font-size: 14px; color: #6C757D; display: flex; align-items: center; gap: 8px; }
        .td-mobile-showing { display: none; }
        
        .td-feed-list { display: flex; flex-direction: column; gap: 16px; }
        .td-feed-card { background: white; border-radius: 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px; border: 1px solid #E9ECEF; }
        .td-fc-header { display: flex; gap: 16px; }
        .td-fc-icon-wrapper { flex-shrink: 0; }
        .td-fc-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .td-bg-gray { background: #E9ECEF; }
        .td-bg-gold { background: #E5D59F; }
        .td-bg-purple { background: #D0C6F5; }
        .td-fc-main-info { flex: 1; }
        .td-fc-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .td-fc-title-row h3 { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 4px; }
        .td-bookmark-btn { background: none; border: none; color: #ADB5BD; font-size: 20px; cursor: pointer; }
        .td-fc-school { font-size: 13px; color: #6C757D; font-weight: 500; }
        .td-dot { margin: 0 6px; color: #DEE2E6; }
        .td-fc-badge-desktop { display: flex; align-items: flex-start; }
        .td-badge-featured { background: #B5F0A5; color: #111; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 4px; }
        
        .td-fc-meta { display: flex; gap: 24px; align-items: center; margin-left: 64px; }
        .td-fc-meta-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6C757D; font-weight: 600; }
        
        .td-fc-footer { display: flex; justify-content: space-between; align-items: center; margin-left: 64px; }
        .td-fc-salary { font-size: 18px; font-weight: 800; color: #111; }
        .td-fc-salary span { font-size: 13px; color: #6C757D; font-weight: 500; }
        .td-fc-action { background: #0b7a24; color: white; border: none; padding: 10px 24px; border-radius: 24px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .td-fc-action:hover { background: #09611c; }

        .td-load-more-container { text-align: center; margin-top: 32px; }
        .td-load-more-btn { background: transparent; border: 2px solid #0b7a24; color: #0b7a24; padding: 12px 32px; border-radius: 24px; font-weight: 700; font-size: 14px; cursor: pointer; margin-bottom: 12px; }
        .td-load-more-container p { font-size: 13px; color: #6C757D; }

        .td-mobile-only { display: none; }

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

          /* Job Feeds Mobile */
          .td-jobs-hero h1 { font-size: 28px; }
          .td-desktop-search { display: none; }
          .td-mobile-jobs-search { display: block; }
          .td-search-box-mobile { background: #E9ECEF; border-radius: 24px; display: flex; align-items: center; padding: 12px 16px; margin-bottom: 16px; }
          .td-search-box-mobile input { border: none; background: transparent; outline: none; margin-left: 12px; width: 100%; font-size: 14px; }
          .td-mobile-filter-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
          .td-filter-chip { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
          .td-chip-green { background: #277a16; color: white; }
          .td-chip-lightgreen { background: #B5F0A5; color: #111; }
          .td-chip-gray { background: #F8F9FA; color: #111; border: 1px solid #E9ECEF; }

          .td-jobs-filters { display: none; }
          .td-desktop-showing { display: none; }
          .td-sort-by { display: none; }
          
          .td-mobile-showing { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 16px; margin-top: 8px; }
          .td-mobile-showing h3 { font-size: 16px; font-weight: 800; color: #111; }
          .td-mobile-showing span { font-size: 11px; font-weight: 800; color: #1CCB43; letter-spacing: 0.5px; text-transform: uppercase; }

          .td-fc-meta, .td-fc-footer { margin-left: 0; margin-top: 16px; }
          .td-fc-badge-desktop { display: none; }
          .td-fc-title-row h3 { font-size: 16px; max-width: 85%; }
          .td-fc-salary { font-size: 20px; color: #1CCB43; }
          
          .td-feed-card-hot { background: #277a16; color: white; border: none; box-shadow: 0 10px 20px rgba(39, 122, 22, 0.2); }
          .td-hot-header { display: flex; justify-content: space-between; margin-bottom: 16px; align-items: center; }
          .td-hot-badge { background: rgba(255,255,255,0.2); font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 12px; letter-spacing: 0.5px; }
          .td-hot-time { font-size: 11px; opacity: 0.8; }
          .td-feed-card-hot h3 { font-size: 20px; color: white; margin-bottom: 8px; font-weight: 800; }
          .td-feed-card-hot p { color: rgba(255,255,255,0.8); font-size: 13px; }
          .td-feed-card-hot .td-dot { color: rgba(255,255,255,0.4); }
          .td-hot-salary-range { font-size: 10px; opacity: 0.7; font-weight: 800; margin-top: 24px; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase; }
          .td-hot-footer { display: flex; justify-content: space-between; align-items: center; }
          .td-hot-salary-value { font-size: 22px; font-weight: 800; }
          .td-hot-action { background: white; color: #277a16; border: none; padding: 12px 24px; border-radius: 24px; font-weight: 800; font-size: 13px; cursor: pointer; }

          .td-mobile-only { display: flex; }
          
          .td-fc-meta-tag { margin-left: auto; background: #E8F9ED; color: #1CCB43; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 12px; letter-spacing: 0.5px; }

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