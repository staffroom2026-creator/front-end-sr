import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import schoolCampus from '../assets/school campus.jpg';
import {
  FiSearch, FiBell, FiMail, FiGrid, FiBriefcase,
  FiFileText, FiMessageSquare, FiSettings, FiPlus,
  FiMapPin, FiEye, FiZap, FiHome, FiCpu, FiBookmark, FiMap, FiFilter, FiCheck, FiChevronDown, FiClock,
  FiBook, FiShare2, FiLink, FiArrowLeft, FiCheckCircle, FiDollarSign, FiSend
} from 'react-icons/fi';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DUMMY_JOBS = [
  {
    id: 1,
    title: 'Senior Mathematics Lead',
    school: 'British International School',
    location: 'Lekki, Lagos',
    type: 'Full-time',
    timePosted: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    timeLabel: '2 hours ago',
    salaryStr: '₦350k',
    salaryMonthly: 350000,
    featured: true,
    hot: false,
    color: 'td-bg-gray',
    education: 'Senior Sec.',
    subject: 'Mathematics',
    tags: [],
    mobileOnly: false,
    about: "We are seeking a visionary Mathematics educator to lead our Senior Secondary department. This isn't just a teaching role; it's an opportunity to shape the pedagogical approach of one of Nigeria's most historic institutions.\n\nAs the Senior Mathematics Lead, you will be responsible for driving academic excellence, mentoring junior faculty, and ensuring our students are prepared for both national and international examinations with absolute confidence.",
    responsibilities: [
      "Design and implement a dynamic curriculum that bridges the gap between WAEC and IGCSE standards.",
      "Lead weekly departmental strategy sessions to review student performance data and pedagogical shifts.",
      "Spearhead the 'Maths for All' initiative, providing remedial support for struggling students and advanced tracks for high achievers.",
      "Maintain regular communication with parents regarding student progress and holistic development."
    ],
    requirements: {
      essential: [
        "B.Ed or B.Sc in Mathematics with PGDE.",
        "TRCN Registration is mandatory.",
        "Minimum 7 years teaching experience."
      ],
      desirable: [
        "Master's degree in Education.",
        "Experience with Google Classroom.",
        "Previous leadership experience."
      ]
    },
    employerInfo: "\"Providing a tradition of excellence since 1928, St. Gregory's College is dedicated to the holistic development of the Nigerian child through discipline and hard work.\"\n\nLocated in the heart of Ikoyi, our campus provides a serene and technologically advanced environment for both students and staff. We pride ourselves on our community of educators who are more than teachers—they are mentors.",
    employerImage: schoolCampus,
    deadline: "October 24th, 2024",
    verifiedRecruiter: true
  },
  {
    id: 2,
    title: 'English Language & Literature Teacher',
    school: 'Grace Academy',
    location: 'Benin City, Edo State',
    type: 'Contract',
    timePosted: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    timeLabel: '1 day ago',
    salaryStr: '₦180,000 / month',
    salaryMonthly: 180000,
    featured: false,
    hot: false,
    color: 'td-bg-gold',
    education: 'Secondary (SS1-SS3)',
    tags: [],
    mobileOnly: false
  },
  {
    id: 3,
    title: 'Vice Principal (Academic)',
    school: 'Atlantic Hall School',
    location: 'Epe, Lagos',
    type: 'Full-time',
    timePosted: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    timeLabel: 'Posted 2h ago',
    salaryStr: '₦650k - ₦800k',
    salaryMonthly: 650000,
    featured: false,
    hot: true,
    color: '',
    education: 'Tertiary Institution',
    tags: [],
    mobileOnly: true
  },
  {
    id: 4,
    title: 'Physics & Further Maths Expert',
    school: 'Home-Schooling Premium',
    location: 'Maitama, Abuja',
    type: 'Online',
    timePosted: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    timeLabel: '2 days ago',
    salaryStr: '₦15k / hour',
    salaryMonthly: 2400000,
    featured: false,
    hot: false,
    color: 'td-bg-purple',
    education: 'Secondary (SS1-SS3)',
    tags: [],
    mobileOnly: false
  },
  {
    id: 5,
    title: 'Computer Science Tutor',
    school: 'Grange School',
    location: 'Ikeja GRA',
    type: 'Part-time',
    timePosted: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    timeLabel: '1 day ago',
    salaryStr: '₦180,000 / month',
    salaryMonthly: 180000,
    featured: false,
    hot: false,
    color: 'td-bg-gray',
    education: 'Primary School',
    tags: ['STEM'],
    mobileOnly: true
  }
];

export default function TeacherDashboard() {
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    yearsExperience: '',
    resumeFile: null,
    motivation: ''
  });
  const [applicationNote, setApplicationNote] = useState('');

  useEffect(() => {
    if (location.pathname === '/application-submitted') {
      setActiveTab('application-submitted');
    } else if (location.pathname === '/teacher-dashboard') {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);
  
  const openApplyModal = () => {
    setApplicationStep(1);
    setShowApplyModal(true);
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
  };

  const handleApplicationInput = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0] || null;
    setApplicationForm(prev => ({ ...prev, resumeFile: file }));
  };

  const goToNextStep = () => {
    setApplicationStep(prev => Math.min(prev + 1, 3));
  };

  const goToPrevStep = () => {
    setApplicationStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    setShowApplyModal(false);
    setActiveTab('application-submitted');
    navigate('/application-submitted');
  };

  const handleNoteChange = (e) => {
    setApplicationNote(e.target.value);
  };

  // Job Feeds Filters State
  const [subjectSearch, setSubjectSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [keywordSearch, setKeywordSearch] = useState('');
  
  const [selectedEducation, setSelectedEducation] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [salaryRange, setSalaryRange] = useState(50000);
  const [sortBy, setSortBy] = useState('Newest First');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter Helpers
  const toggleEducation = (level) => {
    setSelectedEducation(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
  };

  const toggleJobType = (type) => {
    setSelectedJobTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const clearFilters = () => {
    setSelectedEducation([]);
    setSelectedJobTypes([]);
    setSalaryRange(50000);
    setSubjectSearch('');
    setLocationSearch('');
    setKeywordSearch('');
  };

  const filteredJobs = DUMMY_JOBS.filter(job => {
    const matchesSubject = job.title.toLowerCase().includes(subjectSearch.toLowerCase()) || job.school.toLowerCase().includes(subjectSearch.toLowerCase());
    const matchesLocation = job.location.toLowerCase().includes(locationSearch.toLowerCase());
    const matchesKeyword = job.title.toLowerCase().includes(keywordSearch.toLowerCase()) || job.school.toLowerCase().includes(keywordSearch.toLowerCase());

    if (subjectSearch && !matchesSubject) return false;
    if (locationSearch && !matchesLocation) return false;
    if (keywordSearch && !matchesKeyword) return false;

    if (selectedEducation.length > 0 && !selectedEducation.includes(job.education)) return false;
    if (selectedJobTypes.length > 0 && !selectedJobTypes.some(type => job.type.includes(type))) return false;
    if (job.salaryMonthly < salaryRange) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'Newest First') return b.timePosted - a.timePosted;
    if (sortBy === 'Oldest First') return a.timePosted - b.timePosted;
    if (sortBy === 'Highest Salary') return b.salaryMonthly - a.salaryMonthly;
    if (sortBy === 'Lowest Salary') return a.salaryMonthly - b.salaryMonthly;
    return 0;
  });

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

        <div className="td-content" ref={contentRef}>

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
                  </motion.div>

                  {/* Jobs Applied */}
                  <motion.div variants={cardVariants} className="td-stat-card td-mini-card">
                    <div className="td-mini-icon-circle green">
                      <FiSend />
                    </div>
                    <p className="td-mini-label">JOBS APPLIED</p>
                    <div className="td-mini-value-row">
                      <span className="td-mini-value">42</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111', marginLeft: '6px' }}>Total</span>
                    </div>
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
                  <a href="#">View All Vacancies</a>
                </div>

                <div className="td-job-list">
                  <motion.div variants={cardVariants} className="td-job-item">
                    <div className="td-job-icon td-job-icon--math">Σ</div>
                    <div className="td-job-details">
                      <div className="td-job-title-row">
                        <h3>HOD Mathematics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span className="td-job-type-badge">FULL-TIME</span>
                          <span style={{ fontSize: '11px', color: '#6C757D', fontWeight: '500' }}>3 days ago</span>
                        </div>
                      </div>
                      <p className="td-job-school">St. Gregory's College • Ikoyi, Lagos</p>
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
                        <h3>Physics Instructor</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span className="td-job-type-badge">RESIDENTIAL</span>
                          <span style={{ fontSize: '11px', color: '#6C757D', fontWeight: '500' }}>1 week ago</span>
                        </div>
                      </div>
                      <p className="td-job-school">Atlantic Hall School • Epe, Lagos</p>
                      <div className="td-job-tags">
                        <span>EPE</span>
                        <span>1 WEEK AGO</span>
                      </div>
                      <div className="td-job-footer">
                        <span className="td-job-salary">₦350k - ₦480k Monthly</span>
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

          {activeTab === 'jobs' && !selectedJob && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-jobs-tab">
              <div className="td-jobs-hero">
                <h1>Find your next <span className="td-highlight">teaching milestone.</span></h1>
                <p>Connecting Nigeria's finest educators with prestigious academic institutions.</p>
                
                <div className="td-jobs-search-bar td-desktop-search">
                  <motion.div whileHover={{ scale: 1.02 }} className="td-search-input-group">
                    <FiBriefcase className="td-search-icon" />
                    <input type="text" placeholder="Subject (e.g., Physics, English)" className="td-interactive-input" value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)} />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} className="td-search-input-group">
                    <FiMapPin className="td-search-icon" />
                    <input type="text" placeholder="Benin City, Lagos..." className="td-interactive-input" value={locationSearch} onChange={e => setLocationSearch(e.target.value)} />
                  </motion.div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-btn-primary"><FiSearch /> Find Jobs</motion.button>
                </div>

                <div className="td-mobile-jobs-search">
                  <motion.div whileHover={{ scale: 1.02 }} className="td-search-box-mobile">
                    <FiSearch className="td-search-icon" />
                    <input type="text" placeholder="Role, subject or keyword" className="td-interactive-input" value={keywordSearch} onChange={e => setKeywordSearch(e.target.value)} />
                  </motion.div>
                  <div className="td-mobile-filter-chips">
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`td-filter-chip ${locationSearch.toLowerCase().includes('lagos') ? 'td-chip-green' : 'td-chip-gray'}`}
                      onClick={() => setLocationSearch(locationSearch.toLowerCase().includes('lagos') ? '' : 'Lagos')}
                    >
                      <FiMapPin size={14} /> Lagos
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`td-filter-chip ${selectedJobTypes.includes('Full-time') ? 'td-chip-lightgreen' : 'td-chip-gray'}`}
                      onClick={() => toggleJobType('Full-time')}
                    >
                      <FiClock size={14} /> Full-time
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`td-filter-chip ${salaryRange >= 250000 ? 'td-chip-green' : 'td-chip-gray'}`}
                      onClick={() => setSalaryRange(salaryRange >= 250000 ? 50000 : 250000)}
                    >
                      <FiBriefcase size={14} /> ₦250k+
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="td-jobs-layout">
                <div className="td-jobs-filters td-desktop-only">
                  <div className="td-filter-header">
                    <h3>Filters</h3>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="td-clear-btn" onClick={clearFilters}>Clear all</motion.button>
                  </div>
                  
                  <div className="td-filter-group">
                    <h4>EDUCATION LEVEL</h4>
                    {['Secondary (SS1-SS3)', 'Primary School', 'Tertiary Institution'].map(level => (
                      <label key={level} className="td-checkbox-label" onClick={() => toggleEducation(level)}>
                        <div className={`td-checkbox-custom ${selectedEducation.includes(level) ? 'td-checked' : ''}`}>
                          {selectedEducation.includes(level) && <FiCheck size={12}/>}
                        </div>
                        {level}
                      </label>
                    ))}
                  </div>

                  <div className="td-filter-group">
                    <h4>JOB TYPE</h4>
                    <div className="td-filter-tags">
                      {['Full-time', 'Part-time', 'Online', 'Contract'].map(type => (
                        <motion.span 
                          key={type}
                          whileHover={{ scale: 1.05 }} 
                          whileTap={{ scale: 0.95 }} 
                          onClick={() => toggleJobType(type)}
                          className={`td-tag ${selectedJobTypes.includes(type) ? 'td-tag-active' : ''}`}
                        >
                          {type}
                        </motion.span>
                      ))}
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
                    <div className="td-desktop-showing">Showing <strong>{filteredJobs.length} jobs</strong> in Nigeria</div>
                    <div className="td-mobile-showing">
                      <h3>Recommended for you</h3>
                      <span>{filteredJobs.length} JOBS FOUND</span>
                    </div>
                    <div className="td-sort-by td-desktop-only" style={{ position: 'relative' }}>
                      Sort by: 
                      <strong 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }} 
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                      >
                        {sortBy} <FiChevronDown />
                      </strong>
                      {showSortDropdown && (
                        <div style={{ position: 'absolute', top: '30px', right: 0, background: '#fff', border: '1px solid #E9ECEF', borderRadius: '8px', padding: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '160px' }}>
                          {['Newest First', 'Oldest First', 'Highest Salary', 'Lowest Salary'].map(s => (
                            <div 
                              key={s} 
                              onClick={() => { setSortBy(s); setShowSortDropdown(false); }} 
                              style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px', borderRadius: '4px', background: sortBy === s ? '#F1F3F5' : 'transparent', fontWeight: sortBy === s ? '700' : '500', color: sortBy === s ? '#111' : '#495057' }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="td-feed-list">
                    {filteredJobs.length > 0 ? filteredJobs.map(job => {
                      if (job.hot) {
                        return (
                          <motion.div key={job.id} variants={cardVariants} className={`td-feed-card td-feed-card-hot ${job.mobileOnly ? 'td-mobile-only' : ''}`}>
                            <div className="td-hot-header">
                              <span className="td-hot-badge">HOT VACANCY</span>
                              <span className="td-hot-time">{job.timeLabel}</span>
                            </div>
                            <h3>{job.title}</h3>
                            <p>{job.school} <span className="td-dot">•</span> {job.location}</p>
                            <div className="td-hot-salary-range">SALARY RANGE</div>
                            <div className="td-hot-footer">
                              <div className="td-hot-salary-value">{job.salaryStr.split(' - ')[0]}</div>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-hot-action" onClick={() => setSelectedJob(job)}>View Details</motion.button>
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div key={job.id} variants={cardVariants} className={`td-feed-card ${job.mobileOnly ? 'td-mobile-only' : ''}`}>
                          <div className="td-fc-header">
                            <div className="td-fc-icon-wrapper">
                              <div className={`td-fc-icon ${job.color}`}>
                                <FiBriefcase size={20} color={job.color === 'td-bg-gold' ? '#947600' : job.color === 'td-bg-purple' ? '#5F3DC4' : '#495057'}/>
                              </div>
                            </div>
                            <div className="td-fc-main-info">
                              <div className="td-fc-title-row">
                                <h3>{job.title}</h3>
                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="td-bookmark-btn"><FiBookmark /></motion.button>
                              </div>
                              <p className="td-fc-school">{job.school} <span className="td-dot">•</span> {job.location}</p>
                            </div>
                            {job.featured && <div className="td-fc-badge-desktop"><span className="td-badge-featured"><FiCheck size={12}/> Featured</span></div>}
                          </div>
                          <div className="td-fc-meta">
                            <div className="td-fc-meta-item"><FiBriefcase /> {job.type}</div>
                            <div className="td-fc-meta-item"><FiClock /> {job.timeLabel}</div>
                            {job.tags.map(tag => <div key={tag} className="td-fc-meta-tag td-tag-stem">{tag}</div>)}
                          </div>
                          <div className="td-fc-footer">
                            <div className="td-fc-salary">{job.salaryStr.split(' / ')[0]} {job.salaryStr.includes(' / ') && <span>/ {job.salaryStr.split(' / ')[1]}</span>}</div>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-fc-action" onClick={() => setSelectedJob(job)}>View Details</motion.button>
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#6C757D' }}>
                        <p>No jobs found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                  
                  {filteredJobs.length > 0 && (
                    <div className="td-load-more-container">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-load-more-btn">Load More Jobs</motion.button>
                      <p>Showing {filteredJobs.length > 3 ? 3 : filteredJobs.length} of {filteredJobs.length} results</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && selectedJob && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-job-details-page">
              <div className="td-jd-back-nav" onClick={() => setSelectedJob(null)}>
                <FiArrowLeft /> Go Back to Job Feeds
              </div>

              <div className="td-jd-content-wrapper">
                {/* Main Content */}
                <div className="td-jd-main">
                  {selectedJob.featured && <div className="td-jd-featured-badge">FEATURED ROLE</div>}
                  
                  <div className="td-jd-header-block">
                    <div className="td-jd-logo-placeholder"><span>{selectedJob.school.charAt(0)}</span></div>
                    <div className="td-jd-header-text">
                      <h1>{selectedJob.title}</h1>
                      <p>{selectedJob.school}</p>
                    </div>
                  </div>

                  <div className="td-jd-info-pills">
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiMapPin /></div>
                      <div className="td-jd-pill-text">
                        <span>LOCATION</span>
                        <strong>{selectedJob.location}</strong>
                      </div>
                    </div>
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiDollarSign /></div>
                      <div className="td-jd-pill-text">
                        <span>SALARY</span>
                        <strong>{selectedJob.salaryStr}</strong>
                      </div>
                    </div>
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiClock /></div>
                      <div className="td-jd-pill-text">
                        <span>TYPE</span>
                        <strong>{selectedJob.type}</strong>
                      </div>
                    </div>
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiCheckCircle /></div>
                      <div className="td-jd-pill-text">
                        <span>LEVEL</span>
                        <strong>{selectedJob.education}</strong>
                      </div>
                    </div>
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiBook /></div>
                      <div className="td-jd-pill-text">
                        <span>SUBJECT</span>
                        <strong>{selectedJob.subject || 'General'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="td-jd-section">
                    <h2 className="td-jd-section-title"><span></span> About the job</h2>
                    <div className="td-jd-text-content">
                      {selectedJob.about ? selectedJob.about.split('\n\n').map((p, i) => <p key={i}>{p}</p>) : <p>Details coming soon.</p>}
                    </div>
                  </div>

                  <div className="td-jd-card-section">
                    <h2>Responsibilities</h2>
                    <ul className="td-jd-check-list">
                      {selectedJob.responsibilities ? selectedJob.responsibilities.map((r, i) => (
                        <li key={i}><FiCheckCircle className="td-jd-check-icon" /> {r}</li>
                      )) : <li>General teaching responsibilities.</li>}
                    </ul>
                  </div>

                  <div className="td-jd-section">
                    <h2>Requirements / Qualifications</h2>
                    <div className="td-jd-req-grid">
                      <div className="td-jd-req-card">
                        <h3 className="td-jd-req-essential">Essential</h3>
                        <ul>
                          {selectedJob.requirements?.essential ? selectedJob.requirements.essential.map((r, i) => (
                            <li key={i}>• {r}</li>
                          )) : <li>• Standard teaching degree</li>}
                        </ul>
                      </div>
                      <div className="td-jd-req-card">
                        <h3 className="td-jd-req-desirable">Desirable</h3>
                        <ul>
                          {selectedJob.requirements?.desirable ? selectedJob.requirements.desirable.map((r, i) => (
                            <li key={i}>• {r}</li>
                          )) : <li>• Additional certifications</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="td-jd-section">
                    <h2>About the employer</h2>
                    <div className="td-jd-employer-block">
                      <div className="td-jd-employer-text">
                        {selectedJob.employerInfo ? selectedJob.employerInfo.split('\n\n').map((p, i) => <p key={i}>{p}</p>) : <p>School information not provided.</p>}
                      </div>
                      <div className="td-jd-employer-img">
                        <img src={selectedJob.employerImage || schoolCampus} alt="School Campus" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="td-jd-sidebar">
                  <div className="td-jd-apply-card">
                    <div className="td-jd-deadline">
                      <span>APPLICATION DEADLINE</span>
                      <strong>{selectedJob.deadline || 'Ongoing'}</strong>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-jd-apply-btn" onClick={openApplyModal}>Apply Now</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-jd-save-btn"><FiBookmark /> Save Job</motion.button>
                    
                    <div className="td-jd-share">
                      <span>Share this role with your network:</span>
                      <div className="td-jd-share-icons">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><FiShare2 /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><FiLink /></motion.button>
                      </div>
                    </div>
                  </div>

                  {selectedJob.verifiedRecruiter && (
                    <div className="td-jd-verified-card">
                      <div className="td-jd-vc-header">
                        <FiCheckCircle className="td-jd-vc-icon" />
                        <strong>Verified Recruiter</strong>
                      </div>
                      <p>This school has a 94% response rate for applicants via Staffroom in the last 30 days.</p>
                    </div>
                  )}

                  <div className="td-jd-help-card">
                    <strong>Need help recruiting?</strong>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-jd-post-btn">Post a Job</motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'application-submitted' && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-application-submitted-page">
              <div className="td-application-submitted-card">
                <div className="td-success-badge">
                  <FiCheckCircle />
                </div>
                <h1>Application Submitted Successfully!</h1>
                <p className="td-submitted-description">Your professional profile has been delivered to the hiring committee in Lagos.</p>

                <div className="td-application-summary-card">
                  <div className="td-application-summary-left">
                    <div className="td-application-role-badge">POSITION APPLIED</div>
                    <h2>{selectedJob?.title || 'Teaching Role'}</h2>
                    <p className="td-application-company">{selectedJob?.school || 'Selected school'} · {selectedJob?.location || 'Location'}</p>
                  </div>
                  <div className="td-application-summary-icon">
                    <span>{selectedJob?.school?.charAt(0) || 'M'}</span>
                  </div>
                </div>

                <div className="td-application-note-section">
                  <label htmlFor="application-note">Add a short note to the recruiter (Optional)</label>
                  <textarea
                    id="application-note"
                    value={applicationNote}
                    onChange={handleNoteChange}
                    placeholder="Highlight a specific teaching achievement or personal motivation for BrightMind..."
                  />
                  <div className="td-note-counter">{applicationNote.length}/300</div>
                </div>

                <div className="td-application-actions">
                  <button className="td-application-btn td-application-btn--primary">Update Application Note</button>
                  <button className="td-application-btn td-application-btn--secondary">View Application Status</button>
                </div>

                <button className="td-link-button" onClick={() => { setActiveTab('jobs'); navigate('/teacher-dashboard'); }}>
                  Browse More Jobs in Nigeria →
                </button>
              </div>
            </motion.div>
          )}
          {['notifications', 'applications', 'application', 'messages', 'profile', 'settings'].includes(activeTab) && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="flex flex-col items-center justify-center h-full px-6 py-20 text-center" style={{ minHeight: '60vh' }}>
              <div className="inline-flex items-center gap-2 bg-[#1CCB43]/10 border border-[#1CCB43]/20 text-[#1CCB43] font-semibold text-sm px-4 py-2 rounded-full mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1CCB43] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1CCB43]"></span>
                </span>
                Page in progress
              </div>
              
              <div className="mb-10">
                <div className="relative mx-auto w-48 h-48">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#1CCB43]/20 animate-spin" style={{ animationDuration: '20s' }}></div>
                  <div className="absolute inset-6 rounded-full border-4 border-dashed border-[#1CCB43]/10 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                      <FiSettings className="w-16 h-16 text-[#1CCB43]" strokeWidth="1.5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4 capitalize">
                  {activeTab === 'application' ? 'applications' : activeTab} <span className="text-[#1CCB43]">Coming Soon</span>
                </h1>
                <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                  We're putting the final touches on this section of the dashboard. Check back soon!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Desktop FAB ── */}
      {showApplyModal && (
        <div className="td-modal-overlay">
          <div className="td-modal">
            <div className="td-modal-header">
              <div>
                <h2>Apply for {selectedJob?.title || 'this job'}</h2>
                <p>Complete the application steps below to proceed.</p>
              </div>
              <button className="td-modal-close" onClick={closeApplyModal}>&times;</button>
            </div>

            <div className="td-modal-step-indicator">
              <span className={applicationStep === 1 ? 'active' : ''}>1</span>
              <span className={applicationStep === 2 ? 'active' : ''}>2</span>
              <span className={applicationStep === 3 ? 'active' : ''}>3</span>
            </div>

            <form className="td-modal-form" onSubmit={handleSubmitApplication}>
              {applicationStep === 1 && (
                <div className="td-modal-step">
                  <h3>Personal details</h3>
                  <label>
                    Full name
                    <input name="name" type="text" value={applicationForm.name} onChange={handleApplicationInput} required placeholder="Jane Doe" />
                  </label>
                  <label>
                    Email address
                    <input name="email" type="email" value={applicationForm.email} onChange={handleApplicationInput} required placeholder="jane@example.com" />
                  </label>
                  <label>
                    Phone number
                    <input name="phone" type="tel" value={applicationForm.phone} onChange={handleApplicationInput} required placeholder="+234 800 000 0000" />
                  </label>
                </div>
              )}

              {applicationStep === 2 && (
                <div className="td-modal-step">
                  <h3>Qualifications</h3>
                  <label>
                    Years of teaching experience
                    <input name="yearsExperience" type="text" value={applicationForm.yearsExperience} onChange={handleApplicationInput} required placeholder="e.g. 5 years" />
                  </label>
                  <label className="td-upload-label">
                    Resume or CV upload
                    <div className="td-upload-input-wrapper">
                      <input
                        name="resumeFile"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileInput}
                        required
                      />
                      <div className="td-upload-placeholder">
                        <span>Choose a file or drag it here</span>
                        <small>Accepted: PDF, DOC, DOCX</small>
                      </div>
                    </div>
                    {applicationForm.resumeFile && (
                      <div className="td-upload-preview">
                        <strong>Selected file:</strong> {applicationForm.resumeFile.name}
                      </div>
                    )}
                  </label>
                </div>
              )}

              {applicationStep === 3 && (
                <div className="td-modal-step">
                  <h3>Why you</h3>
                  <label>
                    Why should this school hire you?
                    <textarea name="motivation" value={applicationForm.motivation} onChange={handleApplicationInput} required placeholder="Tell them why you're the best fit."></textarea>
                  </label>
                  <div className="td-modal-job-summary">
                    <strong>Role:</strong> {selectedJob?.title}
                    <strong>School:</strong> {selectedJob?.school}
                    <strong>Location:</strong> {selectedJob?.location}
                  </div>
                </div>
              )}

              <div className="td-modal-actions">
                {applicationStep > 1 ? (
                  <button type="button" className="td-modal-secondary-btn" onClick={goToPrevStep}>Back</button>
                ) : (
                  <div />
                )}

                {applicationStep < 3 ? (
                  <button type="button" className="td-modal-primary-btn" onClick={goToNextStep}>Next step</button>
                ) : (
                  <button type="submit" className="td-modal-primary-btn">Submit application</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

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
          justify-content: flex-end;
          gap: 32px;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 99;
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

        .td-application-submitted-page {
          width: 100%;
          max-width: 1150px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          padding-bottom: 32px;
        }

        .td-application-submitted-card {
          width: 100%;
          background: #fff;
          border-radius: 38px;
          padding: 42px 42px 38px;
          box-shadow: 0 32px 100px rgba(15, 23, 42, 0.08);
          display: grid;
          gap: 32px;
        }

        .td-success-badge {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #1CCB43;
          color: #fff;
          font-size: 28px;
          margin: 0 auto;
        }

        .td-application-submitted-card h1 {
          font-size: 2.5rem;
          margin: 0;
          color: #111827;
          text-align: center;
          line-height: 1.05;
        }

        .td-application-submitted-card .td-submitted-description {
          color: #6b7280;
          line-height: 1.8;
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }

        .td-application-summary-card {
          background: #f8fafc;
          border-radius: 28px;
          padding: 24px 24px 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          border: 1px solid #e5e7eb;
        }

        .td-application-summary-left {
          display: grid;
          gap: 10px;
        }

        .td-application-role-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #d1fae5;
          color: #16a34a;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 10px 16px;
          border-radius: 999px;
          width: fit-content;
        }

        .td-application-summary-card h2 {
          font-size: 1.5rem;
          margin: 0;
          color: #111827;
        }

        .td-application-company {
          margin: 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .td-application-summary-icon {
          width: 72px;
          height: 72px;
          border-radius: 22px;
          background: #111827;
          display: grid;
          place-items: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 1.4rem;
        }

        .td-application-note-section {
          width: 100%;
          background: #f8fafc;
          border-radius: 28px;
          padding: 24px;
          display: grid;
          gap: 14px;
          border: 1px solid #e5e7eb;
        }

        .td-application-note-section label {
          color: #111827;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .td-application-note-section textarea {
          width: 100%;
          min-height: 140px;
          border-radius: 24px;
          border: 1px solid #e5e7eb;
          background: #fff;
          padding: 18px;
          font-size: 0.95rem;
          color: #111827;
          outline: none;
          resize: vertical;
        }

        .td-note-counter {
          text-align: right;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .td-application-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          justify-content: center;
        }

        .td-application-btn {
          flex: 1 1 220px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 16px 24px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .td-application-btn--primary {
          background: #1CCB43;
          color: #fff;
        }

        .td-application-btn--secondary {
          background: #e5e7eb;
          color: #111827;
        }

        .td-link-button {
          justify-self: center;
          background: transparent;
          color: #16a34a;
          font-weight: 700;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 0.95rem;
        }

        .td-link-button:hover {
          text-decoration: underline;
        }

        .td-application-submitted-page .td-application-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .td-application-submitted-page .td-link-button {
          background: transparent;
          color: #16a34a;
          border: none;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          text-align: left;
        }

        .td-application-submitted-page .td-success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #dcfce7;
          color: #16a34a;
          font-size: 28px;
          box-shadow: inset 0 0 0 1px rgba(22, 163, 74, 0.1);
        }

        .td-application-submitted-page .td-section-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #16a34a;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .td-application-submitted-page h1 {
          font-size: 2.25rem;
          margin: 0;
          color: #111827;
        }

        .td-application-submitted-page .td-section-description {
          color: #6b7280;
          line-height: 1.8;
          max-width: 700px;
        }

        .td-application-submitted-page .td-application-card {
          background: #fff;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          grid-template-columns: 1fr auto;
        }

        .td-application-submitted-page .td-application-card-main {
          display: grid;
          gap: 10px;
        }

        .td-application-submitted-page .td-application-role-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ecfdf5;
          color: #16a34a;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 10px 14px;
          border-radius: 999px;
          width: fit-content;
        }

        .td-application-submitted-page .td-application-card h2 {
          font-size: 1.75rem;
          margin: 0;
          color: #111827;
        }

        .td-application-submitted-page .td-application-card p {
          margin: 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .td-application-submitted-page .td-application-note-section {
          background: #fff;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.06);
          display: grid;
          gap: 18px;
        }

        .td-application-submitted-page .td-application-note-section label {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111827;
        }

        .td-application-submitted-page .td-application-note-section textarea {
          width: 100%;
          min-height: 160px;
          border-radius: 24px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          padding: 20px;
          font-size: 0.95rem;
          color: #111827;
          outline: none;
          resize: vertical;
        }

        .td-application-submitted-page .td-note-counter {
          text-align: right;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .td-application-submitted-page .td-application-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: flex-start;
        }

        .td-application-submitted-page .td-application-btn {
          border-radius: 24px;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 16px 24px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .td-application-submitted-page .td-application-btn--primary {
          background: #1ccB43;
          color: #ffffff;
        }

        .td-application-submitted-page .td-application-btn--secondary {
          background: #f3f4f6;
          color: #111827;
        }

        .td-application-submitted-page .td-link-button {
          background: transparent;
          color: #16a34a;
          border: none;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          align-self: start;
        }

        .td-application-submitted-page .td-link-button:hover {
          text-decoration: underline;
        }

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
          .td-filter-chip { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0; cursor: pointer; border: none; outline: none; }
          .td-chip-green { background: #277a16; color: white; border: 1px solid #277a16; }
          .td-chip-lightgreen { background: #B5F0A5; color: #111; border: 1px solid #B5F0A5; }
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

        /* ═══════════════════════════════════════
           JOB DETAILS PAGE
        ═══════════════════════════════════════ */
        .td-job-details-page {
          padding: 32px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .td-jd-back-nav {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #495057;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 24px;
          transition: 0.2s;
        }
        .td-jd-back-nav:hover { color: #1CCB43; }

        .td-jd-content-wrapper {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: start;
        }

        .td-jd-main {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .td-jd-featured-badge {
          display: inline-block;
          background: #B5F0A5;
          color: #111;
          font-size: 10px;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 4px;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        .td-jd-header-block {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .td-jd-logo-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #F1F3F5;
          border: 1px solid #E9ECEF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          color: #ADB5BD;
        }
        .td-jd-header-text h1 {
          font-size: 32px;
          font-weight: 800;
          color: #212529;
          margin-bottom: 8px;
          line-height: 1.2;
        }
        .td-jd-header-text p {
          font-size: 16px;
          color: #495057;
          font-weight: 500;
        }

        .td-jd-info-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .td-jd-pill {
          background: #F8F9FA;
          border-radius: 16px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .td-jd-pill-icon {
          color: #277A16;
          font-size: 18px;
        }
        .td-jd-pill-text {
          display: flex;
          flex-direction: column;
        }
        .td-jd-pill-text span {
          font-size: 10px;
          color: #868E96;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .td-jd-pill-text strong {
          font-size: 14px;
          color: #212529;
          font-weight: 700;
        }

        .td-jd-section h2 {
          font-size: 20px;
          font-weight: 800;
          color: #212529;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .td-jd-section-title span {
          display: inline-block;
          width: 24px;
          height: 3px;
          background: #277A16;
          border-radius: 2px;
        }
        .td-jd-text-content {
          font-size: 15px;
          color: #495057;
          line-height: 1.7;
        }
        .td-jd-text-content p {
          margin-bottom: 16px;
        }

        .td-jd-card-section {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .td-jd-card-section h2 {
          font-size: 20px;
          font-weight: 800;
          color: #212529;
          margin-bottom: 24px;
        }
        .td-jd-check-list {
          list-style: none;
        }
        .td-jd-check-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 14px;
          color: #495057;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .td-jd-check-icon {
          color: #1CCB43;
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .td-jd-req-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .td-jd-req-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #E9ECEF;
        }
        .td-jd-req-essential {
          color: #277A16;
          font-weight: 800;
          font-size: 16px;
          margin-bottom: 16px;
        }
        .td-jd-req-desirable {
          color: #6C757D;
          font-weight: 800;
          font-size: 16px;
          margin-bottom: 16px;
        }
        .td-jd-req-card ul {
          list-style: none;
        }
        .td-jd-req-card li {
          font-size: 13px;
          color: #495057;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .td-jd-employer-block {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .td-jd-employer-text {
          flex: 1;
          font-size: 14px;
          color: #495057;
          line-height: 1.7;
        }
        .td-jd-employer-text p {
          margin-bottom: 16px;
        }
        .td-jd-employer-text p:first-child {
          font-style: italic;
          color: #212529;
          font-weight: 500;
        }
        .td-jd-employer-img {
          flex-shrink: 0;
          width: 240px;
          height: 160px;
          border-radius: 16px;
          overflow: hidden;
        }
        .td-jd-employer-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Right Sidebar */
        .td-jd-apply-card {
          background: #fff;
          border-radius: 32px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
          text-align: center;
        }
        .td-jd-deadline {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 8px;
        }
        .td-jd-deadline span {
          font-size: 10px;
          color: #868E96;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .td-jd-deadline strong {
          color: #D93025;
          font-weight: 800;
          font-size: 16px;
        }
        .td-jd-apply-btn {
          background: #1CCB43;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 24px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
        }
        .td-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }
        .td-modal {
          width: min(720px, 100%);
          max-height: min(90vh, 880px);
          overflow-y: auto;
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 32px 80px rgba(15, 23, 42, 0.18);
          padding: 32px;
          position: relative;
        }
        .td-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }
        .td-modal-header h2 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .td-modal-header p {
          color: #57606A;
          line-height: 1.6;
        }
        .td-modal-close {
          background: transparent;
          border: none;
          font-size: 28px;
          line-height: 1;
          color: #495057;
          cursor: pointer;
          padding: 4px 8px;
        }
        .td-modal-step-indicator {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 24px;
        }
        .td-modal-step-indicator span {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #F1F3F5;
          color: #495057;
          font-weight: 700;
        }
        .td-modal-step-indicator span.active {
          background: #1CCB43;
          color: white;
        }
        .td-modal-form label {
          display: block;
          margin-bottom: 18px;
          font-weight: 600;
          color: #343A40;
        }
        .td-modal-form input,
        .td-modal-form textarea {
          width: 100%;
          margin-top: 8px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid #E9ECEF;
          background: #F8F9FA;
          font-size: 14px;
          color: #212529;
          outline: none;
        }
        .td-modal-form textarea {
          min-height: 120px;
          resize: vertical;
        }
        .td-upload-label {
          padding: 0;
        }
        .td-upload-input-wrapper {
          position: relative;
          border: 1px dashed #CED4DA;
          border-radius: 18px;
          background: #F8F9FA;
          padding: 28px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 140px;
          gap: 10px;
        }
        .td-upload-input-wrapper input[type="file"] {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .td-upload-placeholder {
          pointer-events: none;
          text-align: center;
          color: #6C757D;
          font-size: 14px;
        }
        .td-upload-placeholder small {
          display: block;
          margin-top: 6px;
          color: #ADB5BD;
        }
        .td-upload-preview {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #E9ECEF;
          font-size: 14px;
          color: #212529;
        }
        .td-modal-actions {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .td-modal-primary-btn,
        .td-modal-secondary-btn {
          min-width: 180px;
          border: none;
          border-radius: 16px;
          padding: 14px 20px;
          font-weight: 700;
          cursor: pointer;
        }
        .td-modal-primary-btn {
          background: #1CCB43;
          color: #fff;
        }
        .td-modal-secondary-btn {
          background: #F1F3F5;
          color: #212529;
        }
        .td-modal-job-summary {
          margin-top: 18px;
          padding: 18px;
          border-radius: 18px;
          background: #F8F9FA;
          display: grid;
          gap: 12px;
          font-size: 14px;
          color: #495057;
        }
        .td-modal-job-summary strong {
          display: inline-block;
          min-width: 110px;
          color: #212529;
        }
        .td-jd-save-btn {
          background: #F1F3F5;
          color: #212529;
          border: none;
          padding: 16px;
          border-radius: 24px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .td-jd-share {
          margin-top: 16px;
        }
        .td-jd-share span {
          display: block;
          font-size: 12px;
          color: #6C757D;
          margin-bottom: 12px;
        }
        .td-jd-share-icons {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .td-jd-share-icons button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #F8F9FA;
          border: 1px solid #E9ECEF;
          color: #495057;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .td-jd-verified-card {
          background: #E8F5E9;
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .td-jd-vc-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #277A16;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .td-jd-vc-icon {
          font-size: 18px;
        }
        .td-jd-verified-card p {
          font-size: 12px;
          color: #495057;
          line-height: 1.5;
        }

        .td-jd-help-card {
          background: #DDF3E4;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }
        .td-jd-help-card strong {
          font-size: 13px;
          color: #111;
        }
        .td-jd-post-btn {
          background: #1CCB43;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .td-jd-content-wrapper {
            grid-template-columns: 1fr;
          }
          .td-jd-employer-block {
            flex-direction: column;
          }
          .td-jd-employer-img {
            width: 100%;
          }
          .td-jd-req-grid {
            grid-template-columns: 1fr;
          }
          .td-job-details-page {
            padding: 24px 16px;
          }
          .td-jd-header-block {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </motion.div>
  );
}