import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import schoolCampus from '../assets/school campus.jpg';
import estherProfileImg from '../assets/esther_profile.jpg';
import {
  FiSearch, FiBell, FiMail, FiGrid, FiBriefcase,
  FiFileText, FiMessageSquare, FiSettings, FiPlus,
  FiMapPin, FiEye, FiZap, FiHome, FiCpu, FiBookmark, FiMap, FiFilter, FiCheck, FiChevronDown, FiClock,
  FiBook, FiShare2, FiLink, FiArrowLeft, FiArrowRight, FiCheckCircle, FiDollarSign, FiSend, FiCalendar, FiAlertTriangle,
  FiUser, FiEdit2, FiTrash2, FiRotateCw, FiShield, FiAward, FiDownload, FiLock,
  FiGlobe, FiEyeOff, FiInfo, FiKey, FiMonitor, FiSmartphone, FiLogOut
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
    title: 'Mathematics Tutor - SS2/SS3',
    school: 'British International School',
    location: 'Benin',
    type: 'Full-time',
    timePosted: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    timeLabel: '2 hours ago',
    salaryStr: '₦350,000 / month',
    salaryMonthly: 350000,
    featured: true,
    hot: false,
    color: 'td-bg-gray',
    education: 'Secondary (SS1-SS3)',
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
    location: 'Benin City, Edo state',
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
    timePosted: new Date(Date.now() - 2 * 60 * 60 * 1000),
    timeLabel: 'Posted 2h ago',
    salaryStr: '₦650k – ₦800k',
    salaryMonthly: 650000,
    featured: false,
    hot: true,
    color: '',
    education: 'Tertiary Institution',
    tags: [],
    mobileOnly: false
  },
  {
    id: 4,
    title: 'Computer Science Tutor',
    school: 'Grange School',
    location: 'Ikeja GRA',
    type: 'Part time',
    timePosted: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    timeLabel: '1 day ago',
    salaryStr: '₦180,000 / month',
    salaryMonthly: 180000,
    featured: false,
    hot: false,
    color: 'td-bg-gray',
    education: 'Primary School',
    tags: ['STEM'],
    mobileOnly: false
  }
];

const DUMMY_APPLICATIONS = [
  {
    id: 1,
    title: 'Senior Mathematics Teacher',
    school: 'Lagos British School, Victoria Island',
    icon: <FiBook size={24} />,
    tags: [
      { label: 'FULL-TIME', type: 'primary' },
      { label: 'REMOTE FRIENDLY', type: 'secondary' },
      { label: '₦850,000 - 1,200,000', type: 'secondary' }
    ],
    status: 'Submitted',
    appliedDate: '12 / 10 / 2024',
    expiresIn: '4 days',
    actionText: 'View Details',
    urgent: false
  },
  {
    id: 2,
    title: 'Physics Department Head',
    school: 'Corona Schools Trust Council, Gbagada',
    icon: <FiZap size={24} />,
    tags: [
      { label: 'CONTRACT', type: 'primary' },
      { label: 'ON-SITE', type: 'secondary' },
      { label: '₦1,500,000 - 2,000,000', type: 'secondary' }
    ],
    status: 'Under Review',
    appliedDate: '05 / 11 / 2024',
    expiresIn: null,
    actionText: 'Track Progress',
    urgent: true
  },
  {
    id: 3,
    title: 'Creative Arts Instructor',
    school: 'Atlantic Hall, Epe',
    icon: <FiCheckCircle size={24} />,
    tags: [
      { label: 'FULL-TIME', type: 'primary' }
    ],
    status: 'WITHDRAWN',
    appliedDate: '01 / 09 / 24',
    expiresIn: null,
    actionText: 'Re-apply',
    urgent: false
  }
];

export default function TeacherDashboard() {
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileSubTab, setProfileSubTab] = useState('overview');
  const [selectedJob, setSelectedJob] = useState(null);

  // ── Personal Info Tab state ──
  const [personalFirstName, setPersonalFirstName] = useState('Esther');
  const [personalLastName, setPersonalLastName] = useState('Egharevba');
  const [personalPhone, setPersonalPhone] = useState('0803 456 7890');
  const [personalCity, setPersonalCity] = useState('Benin City');
  const [personalState, setPersonalState] = useState('Edo State');

  // ── Education Tab state ──
  const [educationList, setEducationList] = useState([
    {
      id: 1,
      degree: 'B.Ed Mathematics',
      institution: 'University of Benin',
      period: '2015 – 2019',
      status: 'Completed'
    }
  ]);
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [newEduForm, setNewEduForm] = useState({
    degree: '',
    institution: '',
    startYear: '2015',
    endYear: '2019',
    status: 'Completed'
  });

  // ── Teaching Experience Tab state ──
  const [experienceList, setExperienceList] = useState([
    {
      id: 1,
      role: 'Senior Mathematics Teacher',
      school: 'Bright Future College',
      location: 'Benin City',
      period: 'SEPT 2021 – PRESENT',
      description: 'Lead mathematics educator for senior secondary classes with a specialized focus on intensive WAEC and NECO preparation. Developed standardized curriculum assessments and significantly improved student pass rates in consecutive academic years.'
    }
  ]);
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [expForm, setExpForm] = useState({
    role: '',
    school: '',
    location: '',
    period: '',
    description: ''
  });
  const [editingExpId, setEditingExpId] = useState(null);

  // ── CV / Resume Tab state ──
  const [activeResume, setActiveResume] = useState({
    name: 'Esther_Egharevba_CV.pdf',
    uploadDate: 'Uploaded Oct 24, 2024',
    size: '1.2 MB'
  });

  // ── Availability Tab state ──
  const [availEmpType, setAvailEmpType] = useState('full-time');
  const [availLocation, setAvailLocation] = useState('Benin City, Edo State');
  const [availStartOption, setAvailStartOption] = useState('immediately');
  const [showProfileUpdatedModal, setShowProfileUpdatedModal] = useState(false);

  // ── Settings Subtab state ──
  const [settingsSubTab, setSettingsSubTab] = useState('overview');
  const [visibilitySetting, setVisibilitySetting] = useState('schools');
  const [personalInfoOrigin, setPersonalInfoOrigin] = useState('profile');

  // ── Professional Info Tab state ──
  const [profTitle, setProfTitle] = useState('Senior Mathematics Educator');
  const [profSummary, setProfSummary] = useState('Experienced educator with 8+ years focused on WAEC preparation.');
  const [profYearsExp, setProfYearsExp] = useState('8+ years');
  const [profEmpPref, setProfEmpPref] = useState('Full Time');
  const [profTeachMode, setProfTeachMode] = useState('Hydrid');
  const [profSubjects, setProfSubjects] = useState(['Mathematics', 'Further Mathematics']);
  const [profTeachingLevels, setProfTeachingLevels] = useState(['JSS (Junior Secondary)', 'Senior Secondary']);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
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
  const [savedJobIds, setSavedJobIds] = useState([]);

  const handleToggleSaveJob = (jobId) => {
    setSavedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  // ── Settings state ──
  const [settingsProfile, setSettingsProfile] = useState({
    fullName: 'Mrs. Adeola Olawale',
    email: 'adeola.o@academic.r',
    phone: '+234 803 123 4567'
  });
  const [settingsEngagement, setSettingsEngagement] = useState('Full-time');
  const [settingsLocations, setSettingsLocations] = useState(['Lagos, Nigeria', 'Abuja (FCT)']);
  const [settingsSalary, setSettingsSalary] = useState('350,000 - 500,000');
  const [notifToggles, setNotifToggles] = useState({
    jobMatch: true,
    appStatus: true,
    directMsg: true,
    sysAnnounce: false
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);

  const toggleNotif = (key) => {
    setNotifToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  // Notifications State
  const [notifFilter, setNotifFilter] = useState('All');
  const [visibleNotifCount, setVisibleNotifCount] = useState(12);

  const DUMMY_NOTIFICATIONS = [
    {
      id: 1,
      type: 'job',
      title: 'New Job Match: Senior Physics Lead',
      description: 'A high-priority role at St. Andrews International aligns with your expertise in Quantum Mechanics curriculum development.',
      time: '2 mins ago',
      isNew: true,
      read: false,
      category: 'Job Alerts'
    },
    {
      id: 2,
      type: 'message',
      title: 'Message from Dr. Abayomi Olatunji',
      description: '"We reviewed your portfolio and would love to discuss the weekend seminar opportunity further..."',
      time: '1 hour ago',
      isNew: false,
      read: false,
      category: 'Job Alerts'
    },
    {
      id: 3,
      type: 'account',
      title: 'Profile Verification Complete',
      description: 'Your professional credentials have been successfully verified. You now have a "Trusted Educator" badge on your profile.',
      time: '4 hours ago',
      isNew: false,
      read: true,
      category: 'Account'
    },
    {
      id: 4,
      type: 'job',
      title: 'Application Update: Greensprings School',
      description: 'Your application for the Chemistry Teacher position has been shortlisted. The interview is scheduled for next week.',
      time: '6 hours ago',
      isNew: false,
      read: true,
      category: 'Job Alerts'
    },
    {
      id: 5,
      type: 'account',
      title: 'Password Changed Successfully',
      description: 'Your account password was updated. If you did not make this change, please contact support immediately.',
      time: '1 day ago',
      isNew: false,
      read: true,
      category: 'Account'
    },
    {
      id: 6,
      type: 'message',
      title: 'Message from Lagos Prep Academy',
      description: '"Thank you for your interest. We would like to schedule a follow-up call regarding the HOD position..."',
      time: '1 day ago',
      isNew: false,
      read: true,
      category: 'Job Alerts'
    },
    {
      id: 7,
      type: 'job',
      title: 'New Job Match: Biology Teacher',
      description: 'A new position at Dowen College matches your profile. Apply before the deadline closes.',
      time: '2 days ago',
      isNew: false,
      read: true,
      category: 'Job Alerts'
    },
    {
      id: 8,
      type: 'account',
      title: 'Profile Viewed by Atlantic Hall',
      description: 'A recruiter from Atlantic Hall School has viewed your profile. Consider updating your CV to stand out.',
      time: '2 days ago',
      isNew: false,
      read: true,
      category: 'Account'
    },
    {
      id: 9,
      type: 'job',
      title: 'New Job Match: Mathematics Instructor',
      description: 'British International School is hiring a Mathematics Instructor for their Lekki campus. Salary: ₦400k - ₦550k.',
      time: '3 days ago',
      isNew: false,
      read: true,
      category: 'Job Alerts'
    },
    {
      id: 10,
      type: 'message',
      title: 'Message from Mrs. Adebayo',
      description: '"I noticed you applied to our institution. Could you share references from your previous schools?"',
      time: '3 days ago',
      isNew: false,
      read: true,
      category: 'Job Alerts'
    },
    {
      id: 11,
      type: 'account',
      title: 'Welcome to Staffroom!',
      description: 'Thank you for joining Staffroom. Complete your profile to get matched with top schools in Nigeria.',
      time: '1 week ago',
      isNew: false,
      read: true,
      category: 'Account'
    },
    {
      id: 12,
      type: 'job',
      title: 'Deadline Reminder: Grace Academy',
      description: 'The application deadline for the English Teacher role at Grace Academy is tomorrow. Submit your application now.',
      time: '1 week ago',
      isNew: false,
      read: true,
      category: 'Job Alerts'
    }
  ];

  const filteredNotifications = DUMMY_NOTIFICATIONS.filter(n => {
    if (notifFilter === 'All') return true;
    if (notifFilter === 'Unread') return !n.read;
    return n.category === notifFilter;
  });

  const totalNotifications = 48;

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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="td-nav-icon">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Dashboard</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'jobs' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('jobs')}>
            <FiBriefcase size={18} className="td-nav-icon" />
            <span>Job Listing</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'applications' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('applications')}>
            <FiFileText size={18} className="td-nav-icon" />
            <span>Applications</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'notifications' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <FiBell size={18} className="td-nav-icon" />
            <span>Notifications</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'profile' ? 'td-nav-item--active' : ''}`} onClick={() => { setActiveTab('profile'); setProfileSubTab('overview'); }}>
            <FiUser size={18} className="td-nav-icon" />
            <span>Profile</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'settings' ? 'td-nav-item--active' : ''}`} onClick={() => setActiveTab('settings')}>
            <FiSettings size={18} className="td-nav-icon" />
            <span>Settings</span>
          </div>
        </nav>

        <div className="td-sidebar-footer">
          <div className="td-logout-container">
            <button className="td-logout-btn" onClick={() => navigate('/login')}>
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="td-main-wrapper">

        {/* ── Mobile Top Bar ── */}
        {activeTab === 'notifications' ? (
          <header className="td-mobile-notif-topbar">
            <button className="td-mobile-back-btn" onClick={() => setActiveTab('dashboard')}>
              <FiArrowLeft size={24} />
            </button>
            <span className="td-mobile-notif-title">Notifications</span>
            <div style={{ width: 24 }}></div>
          </header>
        ) : activeTab === 'applications' || activeTab === 'application' ? (
          <header className="td-mobile-notif-topbar">
            <button className="td-mobile-back-btn" onClick={() => setActiveTab('dashboard')}>
              <FiArrowLeft size={24} />
            </button>
            <span className="td-mobile-notif-title">Job Applications</span>
            <div style={{ width: 24 }}></div>
          </header>
        ) : (
          <header className="td-mobile-topbar">
            <div className="td-mobile-avatar" onClick={() => { setActiveTab('profile'); setProfileSubTab('overview'); }} style={{ cursor: 'pointer' }}>
              <img src={estherProfileImg} alt="Avatar" />
            </div>
            <div className="td-mobile-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1CCB43">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span>Staffroom</span>
            </div>
            <button className="td-mobile-bell" onClick={() => setActiveTab('notifications')}>
              <FiBell />
              <span className="td-bell-dot" />
            </button>
          </header>
        )}

        {/* ── Desktop Top Bar ── */}
        <header className="td-topbar">
          <div className="td-search-box">
            <FiSearch className="td-search-icon" />
            <input type="text" placeholder="Search vacancies in Lagos..." />
          </div>
          <div className="td-topbar-actions">
            <div className="td-icon-badge" onClick={() => setActiveTab('notifications')}><FiBell /></div>
            <div className="td-icon-badge"><FiMail /></div>
            <div className="td-user-avatar" onClick={() => { setActiveTab('profile'); setProfileSubTab('overview'); }} style={{ cursor: 'pointer' }}>
              <img src={estherProfileImg} alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="td-content" ref={contentRef}>

          {activeTab === 'dashboard' && (
            <>
          {/* ── Welcome Area ── */}
          <div className="td-welcome-header">
            <div>
              <h1 className="td-welcome-title">Welcome, Mrs Adeloa</h1>
              {/* Desktop subtitle */}
              <p className="td-subtitle">Your academic career overview for today.</p>
              {/* Mobile location */}
              <div className="td-mobile-location">
                <FiMapPin size={13} color="#4A5568" />
                <span>Victoria Island, Lagos</span>
              </div>
            </div>
            <div className="td-location-badge">
              <FiMapPin size={14} color="#1CCB43" />
              <span>Victoria Island, Lagos</span>
            </div>
          </div>

          <div className="td-grid-main">
            {/* Left Content / Main Feed */}
            <div className="td-left-col">

              {/* ── Stats Overview ── */}
              <div className="td-stats-row">
                {/* Profile Strength Card */}
                <motion.div variants={cardVariants} className="td-stat-card td-profile-card">
                  <div className="td-card-header">
                    <span className="td-profile-title">Profile Strength</span>
                    <span className="td-percent-badge">75%</span>
                  </div>
                  {/* Mobile profile strength layout */}
                  <div className="td-mobile-profile-strength">
                    <div className="td-mobile-ps-top">
                      <div className="td-mobile-ps-left">
                        <p className="td-mobile-ps-label">PROFILE STRENGTH</p>
                        <span className="td-mobile-ps-value">75%</span>
                      </div>
                      <div className="td-mobile-ps-icon"><FiZap size={20} /></div>
                    </div>
                    <div className="td-progress-bar">
                      <div className="td-progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <p className="td-card-hint">Almost there! Add a certification to reach 100%.</p>
                  </div>
                  {/* Desktop layout */}
                  <div className="td-desktop-profile-strength">
                    <div className="td-progress-bar">
                      <div className="td-progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <p className="td-card-hint">
                      Your profile is missing some vital<br />to enable you apply for jobs.
                    </p>
                    <button className="td-complete-profile-btn">Complete Profile →</button>
                  </div>
                </motion.div>

                {/* Mini cards wrapper */}
                <div className="td-stats-mini-wrapper">
                  {/* Profile Views */}
                  <motion.div variants={cardVariants} className="td-stat-card td-mini-card td-mini-card--views">
                    <div className="td-mini-icon-circle">
                      <FiEye size={18} />
                    </div>
                    <span className="td-mobile-stat-number">1,284</span>
                    <p className="td-mini-label">PROFILE VIEWS</p>
                    <div className="td-mini-value-row">
                      <span className="td-mini-value td-desktop-stat-val">1,284</span>
                      <span className="td-mini-growth">+12%</span>
                    </div>
                    <span className="td-mobile-subtext">+12% this week</span>
                  </motion.div>

                  {/* Jobs Applied */}
                  <motion.div variants={cardVariants} className="td-stat-card td-mini-card td-mini-card--applied">
                    <div className="td-mini-icon-circle">
                      <FiSend size={18} className="td-desktop-icon" />
                      <FiBriefcase size={18} className="td-mobile-icon" />
                    </div>
                    <span className="td-mobile-stat-number">42</span>
                    <p className="td-mini-label">
                      <span>JOBS APPLIED</span>
                    </p>
                    <div className="td-mini-value-row td-desktop-val-row">
                      <span className="td-mini-value">42</span>
                      <span className="td-mini-unit">Total</span>
                    </div>
                    <span className="td-mobile-subtext td-mobile-subtext--gray">Total applied</span>
                  </motion.div>

                  {/* Pending Review (desktop only) */}
                  <motion.div variants={cardVariants} className="td-stat-card td-mini-card td-mini-card--pending td-desktop-only-card">
                    <div className="td-mini-icon-circle">
                      <FiFileText size={18} />
                    </div>
                    <p className="td-mini-label">PENDING REVIEW</p>
                    <div className="td-mini-value-row">
                      <span className="td-mini-value">08</span>
                      <span className="td-mini-action">Action Req.</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ── Active / Priority Job Feeds ── */}
              <div className="td-jobs-section">
                <div className="td-section-header">
                  <h2>
                    <span className="td-desktop-label">Active Job Feeds</span>
                    <span className="td-mobile-label">Priority Job Feeds</span>
                  </h2>
                  <a href="#" className="td-view-all-link">
                    <span className="td-desktop-text">View All Vacancies</span>
                    <span className="td-mobile-text">View All</span>
                  </a>
                </div>

                <div className="td-job-list">
                  {/* Job 1: HOD Mathematics */}
                  <motion.div variants={cardVariants} className="td-job-item">
                    <div className="td-job-header-row">
                      <div className="td-job-avatar td-job-avatar--math">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#687588" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" strokeDasharray="2 3" />
                          <path d="M9 12h6" />
                          <path d="M12 9v6" />
                        </svg>
                      </div>
                      <div className="td-job-info-main">
                        <div className="td-job-title-line">
                          <h3>HOD Mathematics</h3>
                          <div className="td-job-badge-col td-desktop-badge-col">
                            <span className="td-job-type-badge td-job-type-badge--full">FULL-TIME</span>
                            <span className="td-job-time-ago">3 days ago</span>
                          </div>
                        </div>
                        <p className="td-job-school">St. Gregory's College <span className="td-job-bullet">•</span> Ikoyi, Lagos</p>
                        
                        {/* Mobile tags */}
                        <div className="td-job-tags td-mobile-only-tags">
                          <span className="td-mobile-tag--green">LAGOS</span>
                          <span className="td-mobile-tag--gray">3 DAYS AGO</span>
                        </div>
                        
                        {/* Desktop tags */}
                        <div className="td-job-tags td-desktop-tags">
                          <span>POSTGRADUATE DEGREE</span>
                          <span>8+ YEARS EXPERIENCE</span>
                          <span>LEADERSHIP</span>
                        </div>
                      </div>
                    </div>

                    <div className="td-job-footer">
                      <span className="td-job-salary">₦450k – ₦600k Monthly</span>
                      <a href="#" className="td-quick-apply">Quick Apply →</a>
                    </div>
                  </motion.div>

                  {/* Job 2: Physics Instructor */}
                  <motion.div variants={cardVariants} className="td-job-item">
                    <div className="td-job-header-row">
                      <div className="td-job-avatar td-job-avatar--school">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#687588" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="4" width="16" height="16" rx="3" />
                          <circle cx="12" cy="10" r="3" />
                          <path d="M8 18h8" />
                        </svg>
                      </div>
                      <div className="td-job-info-main">
                        <div className="td-job-title-line">
                          <h3>Physics Instructor</h3>
                          <div className="td-job-badge-col td-desktop-badge-col">
                            <span className="td-job-type-badge td-job-type-badge--res">RESIDENTIAL</span>
                            <span className="td-job-time-ago">1 week ago</span>
                          </div>
                        </div>
                        <p className="td-job-school">Atlantic Hall School <span className="td-job-bullet">•</span> Epe, Lagos</p>
                        
                        {/* Mobile tags */}
                        <div className="td-job-tags td-mobile-only-tags">
                          <span className="td-mobile-tag--green">EPE</span>
                          <span className="td-mobile-tag--gray">1 WEEK AGO</span>
                        </div>
                      </div>
                    </div>

                    <div className="td-job-footer">
                      <span className="td-job-salary">₦350k – ₦480k Monthly</span>
                      <a href="#" className="td-quick-apply">Quick Apply →</a>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ── Mobile CTA Card ── */}
              <motion.div variants={cardVariants} className="td-mobile-cta-card">
                <div className="td-mobile-cta-text">
                  <h3>Enhance Your<br />Visibility</h3>
                  <p>Schools in Victoria Island are looking for certified teachers.</p>
                </div>
                <button className="td-mobile-cta-btn">UPDATE CV</button>
              </motion.div>

            </div>

            {/* ── Right Sidebar (Desktop Only - hidden in clean single column layout or kept empty) ── */}
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
                    <FiSearch className="td-search-icon" size={18} />
                    <input type="text" placeholder="Role, subject or keyword" className="td-interactive-input" value={keywordSearch} onChange={e => setKeywordSearch(e.target.value)} />
                  </motion.div>
                  <div className="td-mobile-filter-chips">
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`td-filter-chip ${locationSearch.toLowerCase().includes('lagos') ? 'td-chip-active-green' : 'td-chip-soft'}`}
                      onClick={() => setLocationSearch(locationSearch.toLowerCase().includes('lagos') ? '' : 'Lagos')}
                    >
                      <FiMapPin size={13} /> Lagos
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`td-filter-chip ${selectedJobTypes.includes('Full-time') ? 'td-chip-active-lightgreen' : 'td-chip-soft'}`}
                      onClick={() => toggleJobType('Full-time')}
                    >
                      <FiClock size={13} /> Full-time
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`td-filter-chip ${salaryRange >= 250000 ? 'td-chip-active-green' : 'td-chip-soft'}`}
                      onClick={() => setSalaryRange(salaryRange >= 250000 ? 50000 : 250000)}
                    >
                      <FiBriefcase size={13} /> ₦250k+
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
                      <div className="td-mobile-rec-info">
                        <h3>Recommended for you</h3>
                        <span>124 JOBS FOUND</span>
                      </div>
                      <button className="td-mobile-saved-btn">
                        <FiBookmark size={14} /> Saved
                      </button>
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
                          <motion.div key={job.id} variants={cardVariants} className="td-feed-card td-feed-card-hot">
                            <div className="td-hot-header">
                              <span className="td-hot-badge">HOT VACANCY</span>
                              <span className="td-hot-time">{job.timeLabel}</span>
                            </div>
                            <h3 className="td-hot-title">{job.title}</h3>
                            <p className="td-hot-school">{job.school} <span className="td-dot">•</span> {job.location}</p>
                            <div className="td-hot-salary-range">SALARY RANGE</div>
                            <div className="td-hot-footer">
                              <div className="td-hot-salary-value">{job.salaryStr}</div>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-hot-action" onClick={() => setSelectedJob(job)}>Apply Fast</motion.button>
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div key={job.id} variants={cardVariants} className="td-feed-card td-feed-card-standard">
                          <div className="td-fc-header">
                            <div className="td-fc-icon-wrapper">
                              <div className={`td-fc-icon ${job.color || 'td-bg-gray'}`}>
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
                            <div className="td-fc-meta-item"><FiClock size={13} color="#475569" /> {job.type}</div>
                            <div className="td-fc-meta-item"><FiClock size={13} color="#475569" /> {job.timeLabel}</div>
                            {job.tags && job.tags.map(tag => <div key={tag} className="td-fc-meta-tag td-tag-stem">{tag}</div>)}
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
                    <div className="td-load-more-container td-desktop-only">
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
                <FiArrowLeft /> Back to Jobs
              </div>
              <div className="td-jd-content-wrapper">
                {/* Main Content */}
                <div className="td-jd-main">
                  <div className="td-jd-badge-row">
                    {selectedJob.featured && <span className="td-jd-featured-tag">FEATURED ROLE</span>}
                  </div>
                  
                  <div className="td-jd-header-block">
                    <div className="td-jd-logo-placeholder">
                      {selectedJob.employerImage ? (
                        <img src={selectedJob.employerImage} alt="School Logo" className="td-jd-logo-img" />
                      ) : (
                        <span>{selectedJob.school.charAt(0)}</span>
                      )}
                    </div>
                    <div className="td-jd-header-text">
                      <h1>{selectedJob.title}</h1>
                      <p>{selectedJob.school}</p>
                    </div>
                  </div>

                  <div className="td-jd-info-pills">
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiMapPin size={15} /></div>
                      <div className="td-jd-pill-text">
                        <span>LOCATION</span>
                        <strong>{selectedJob.location === 'Benin' ? 'Benin, Edo' : selectedJob.location}</strong>
                      </div>
                    </div>
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiDollarSign size={15} /></div>
                      <div className="td-jd-pill-text">
                        <span>SALARY</span>
                        <strong>{selectedJob.salaryStr === '₦350,000 / month' ? '₦350' : selectedJob.salaryStr}</strong>
                      </div>
                    </div>
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiClock size={15} /></div>
                      <div className="td-jd-pill-text">
                        <span>TYPE</span>
                        <strong>{selectedJob.type}</strong>
                      </div>
                    </div>
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiFileText size={15} /></div>
                      <div className="td-jd-pill-text">
                        <span>LEVEL</span>
                        <strong>{selectedJob.education === 'Secondary (SS1-SS3)' ? 'Senior Sec.' : selectedJob.education}</strong>
                      </div>
                    </div>
                    <div className="td-jd-pill">
                      <div className="td-jd-pill-icon"><FiBook size={15} /></div>
                      <div className="td-jd-pill-text">
                        <span>SUBJECT</span>
                        <strong>{selectedJob.subject || 'Mathematics'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="td-jd-section">
                    <h2 className="td-jd-section-title"><span className="td-jd-green-dash"></span> About the job</h2>
                    <div className="td-jd-text-content">
                      {selectedJob.about ? selectedJob.about.split('\n\n').map((p, i) => <p key={i}>{p}</p>) : <p>We are seeking a visionary Mathematics educator to lead our Senior Secondary department. This isn't just a teaching role; it's an opportunity to shape the pedagogical approach of one of Nigeria's most historic institutions.<br/><br/>As the Senior Mathematics Lead, you will be responsible for driving academic excellence, mentoring junior faculty, and ensuring our students are prepared for both national and international examinations with absolute confidence.</p>}
                    </div>
                  </div>

                  <div className="td-jd-card-section">
                    <h2>Responsibilities</h2>
                    <ul className="td-jd-check-list">
                      {selectedJob.responsibilities ? selectedJob.responsibilities.map((r, i) => (
                        <li key={i}>
                          <span className="td-jd-check-circle-wrapper"><FiCheckCircle className="td-jd-check-icon" /></span>
                          <span>{r}</span>
                        </li>
                      )) : (
                        <>
                          <li>
                            <span className="td-jd-check-circle-wrapper"><FiCheckCircle className="td-jd-check-icon" /></span>
                            <span>Design and implement a dynamic curriculum that bridges the gap between WAEC and IGCSE standards.</span>
                          </li>
                          <li>
                            <span className="td-jd-check-circle-wrapper"><FiCheckCircle className="td-jd-check-icon" /></span>
                            <span>Lead weekly departmental strategy sessions to review student performance data and pedagogical shifts.</span>
                          </li>
                          <li>
                            <span className="td-jd-check-circle-wrapper"><FiCheckCircle className="td-jd-check-icon" /></span>
                            <span>Spearhead the 'Maths for All' initiative, providing remedial support for struggling students and advanced tracks for high achievers.</span>
                          </li>
                          <li>
                            <span className="td-jd-check-circle-wrapper"><FiCheckCircle className="td-jd-check-icon" /></span>
                            <span>Maintain regular communication with parents regarding student progress and holistic development.</span>
                          </li>
                        </>
                      )}
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
                          )) : (
                            <>
                              <li>• B.Ed or B.Sc in Mathematics with PGDE.</li>
                              <li>• TRCN Registration is mandatory.</li>
                              <li>• Minimum 7 years teaching experience.</li>
                            </>
                          )}
                        </ul>
                      </div>
                      <div className="td-jd-req-card">
                        <h3 className="td-jd-req-desirable">Desirable</h3>
                        <ul>
                          {selectedJob.requirements?.desirable ? selectedJob.requirements.desirable.map((r, i) => (
                            <li key={i}>• {r}</li>
                          )) : (
                            <>
                              <li>• Master's degree in Education.</li>
                              <li>• Experience with Google Classroom.</li>
                              <li>• Previous leadership experience.</li>
                            </>
                          )}
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
                        <strong>{selectedJob.deadline || 'October 24th, 2024'}</strong>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="td-jd-apply-btn"
                        onClick={() => {
                          setShowApplyModal(false);
                          setActiveTab('application-submitted');
                        }}
                      >
                        Apply Now
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`td-jd-save-btn ${selectedJob && savedJobIds.includes(selectedJob.id) ? 'td-jd-save-btn--saved' : ''}`}
                        onClick={() => selectedJob && handleToggleSaveJob(selectedJob.id)}
                      >
                        <FiBookmark
                          size={18}
                          style={{
                            strokeWidth: 2.5,
                            fill: selectedJob && savedJobIds.includes(selectedJob.id) ? 'currentColor' : 'none'
                          }}
                        />
                        {selectedJob && savedJobIds.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
                      </motion.button>
                      
                      <div className="td-jd-share">
                        <span>Share this role with your network:</span>
                        <div className="td-jd-share-icons">
                          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="td-jd-share-icon-btn">
                            <FiShare2 size={18} style={{ strokeWidth: 2.2 }} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="td-jd-share-icon-btn">
                            <FiLink size={18} style={{ strokeWidth: 2.2 }} />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {selectedJob.verifiedRecruiter && (
                      <div className="td-jd-verified-card">
                        <div className="td-jd-vc-header">
                          <div className="td-jd-vc-badge-icon">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L14.4 3.7L17.3 3.3L18.8 5.8L21.5 6.9L21.7 9.8L23.4 12.1L21.7 14.4L21.5 17.3L18.8 18.4L17.3 20.9L14.4 20.5L12 22.2L9.6 20.5L6.7 20.9L5.2 18.4L2.5 17.3L2.3 14.4L0.6 12.1L2.3 9.8L2.5 6.9L5.2 5.8L6.7 3.3L9.6 3.7L12 2Z" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              <path d="M8.5 12L11 14.5L16 9.5" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="td-jd-vc-titles">
                            <span>Verified</span>
                            <span>Recruiter</span>
                          </div>
                        </div>
                        <p>This school has a 94% response rate for applicants via Staffroom in the last 30 days.</p>
                      </div>
                    )}
                  </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'application-submitted' && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-application-submitted-page">
              <div className="td-application-submitted-card">
                <div className="td-success-badge">
                  <FiCheck className="td-success-check-icon" />
                </div>
                <h1>Application Submitted Successfully!</h1>
                <p className="td-submitted-description">
                  Your professional profile has been delivered to the<br className="td-desktop-break" /> hiring committee in Lagos.
                </p>

                <div className="td-application-summary-card">
                  <div className="td-app-school-logo">
                    {selectedJob?.employerImage ? (
                      <img src={selectedJob.employerImage} alt="School Logo" className="td-app-logo-img" />
                    ) : (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L4 6V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V6L12 2Z" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        <path d="M9 12L11 14L15 10" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="td-app-info-block">
                    <span className="td-app-position-badge">POSITION APPLIED</span>
                    <h2>{selectedJob?.title || 'Mathematics Tutor'}</h2>
                    <div className="td-app-meta-line">
                      <FiBook size={13} className="td-app-meta-icon" />
                      <span>{selectedJob?.school || 'BrightMind Academy'}</span>
                      <span className="td-app-dot">·</span>
                      <FiMapPin size={13} className="td-app-meta-icon" />
                      <span>{selectedJob?.location === 'Benin' ? 'Benin, Edo' : (selectedJob?.location || 'Lagos, Nigeria')}</span>
                    </div>
                  </div>
                </div>

                <div className="td-application-actions">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="td-application-btn td-application-btn--primary"
                  >
                    Update Application Note
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="td-application-btn td-application-btn--secondary"
                    onClick={() => setActiveTab('applications')}
                  >
                    View Application Status
                  </motion.button>
                </div>

                <button
                  className="td-app-browse-more"
                  onClick={() => {
                    setSelectedJob(null);
                    setActiveTab('jobs');
                  }}
                >
                  <span>View More Jobs in Nigeria</span>
                  <FiArrowRight className="td-app-arrow" />
                </button>
              </div>
            </motion.div>
          )}
          {activeTab === 'notifications' && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-notif-page">
              <div className="td-notif-header td-desktop-only">
                <h1>Notifications</h1>
                <p>Stay updated with your latest academic opportunities and account activities.</p>
              </div>

              <div className="td-notif-filter-tabs td-desktop-only">
                {['All', 'Unread', 'Job Alerts', 'Account'].map(filter => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`td-notif-filter-btn ${notifFilter === filter ? 'td-notif-filter-btn--active' : ''}`}
                    onClick={() => setNotifFilter(filter)}
                  >
                    {filter}
                  </motion.button>
                ))}
              </div>

              <div className="td-notif-section-label td-desktop-only">RECENT ACTIVITIES</div>
              <div className="td-notif-mobile-section-label td-mobile-only">New</div>

              <div className="td-notif-list">
                {filteredNotifications.slice(0, visibleNotifCount).map(notif => (
                  <motion.div
                    key={notif.id}
                    variants={cardVariants}
                    className={`td-notif-card ${!notif.read ? 'td-notif-card--unread' : ''}`}
                  >
                    <div className="td-notif-card-icon">
                      {notif.type === 'job' && (
                        <div className="td-notif-icon-circle td-notif-icon--job">
                          <FiBriefcase size={18} />
                        </div>
                      )}
                      {notif.type === 'message' && (
                        <div className="td-notif-icon-circle td-notif-icon--message">
                          <FiMessageSquare size={18} />
                        </div>
                      )}
                      {notif.type === 'account' && (
                        <div className="td-notif-icon-circle td-notif-icon--account">
                          <FiCheckCircle size={18} />
                        </div>
                      )}
                    </div>

                    <div className="td-notif-card-body">
                      <div className="td-notif-card-top">
                        <h3>{notif.title}</h3>
                        <div className="td-notif-card-meta">
                          {notif.type !== 'job' && <span className="td-notif-time">{notif.time}</span>}
                          {notif.isNew && <span className="td-notif-new-badge">NEW</span>}
                        </div>
                      </div>
                      <p className="td-notif-card-desc">{notif.description}</p>

                      <div className="td-notif-card-actions">
                        <div className="td-desktop-only" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {notif.type === 'job' && (
                            <>
                              <span className="td-notif-time-mobile"><FiClock size={12} /> {notif.time}</span>
                              <a href="#" className="td-notif-link">View details</a>
                            </>
                          )}
                          {notif.type === 'message' && (
                            <>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-notif-btn td-notif-btn--primary">Reply</motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-notif-btn td-notif-btn--outline">Archive</motion.button>
                            </>
                          )}
                        </div>
                        <div className="td-mobile-only td-mobile-action-row">
                          <span className="td-notif-mobile-link">View Details</span>
                          <span className="td-notif-mobile-time">{notif.time.replace(' mins ago', 'm ago').replace(' min ago', 'm ago').replace(' hours ago', 'h ago').replace(' hour ago', 'h ago').replace(' days ago', 'd ago').replace(' day ago', 'd ago')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="td-notif-empty">
                  <FiBell size={40} />
                  <p>No notifications in this category.</p>
                </div>
              )}

              {filteredNotifications.length > 0 && (
                <div className="td-notif-footer td-desktop-only">
                  <p className="td-notif-count">Showing {Math.min(visibleNotifCount, filteredNotifications.length)} of {totalNotifications} notifications</p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="td-notif-load-more"
                    onClick={() => setVisibleNotifCount(prev => prev + 12)}
                  >
                    Load More
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
          {(activeTab === 'applications' || activeTab === 'application') && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-app-page">
              <div className="td-desktop-only td-app-header">
                <h1>Job Applications</h1>
                <p>Manage and track the status of your <span className="td-app-highlight">11 active applications.</span></p>
              </div>

              <div className="td-mobile-only td-app-mobile-stats">
                <div className="td-app-stat-card td-app-stat-white">
                  <div className="td-app-stat-icon-wrapper td-app-stat-icon-dark">
                    <FiCheckCircle size={18} />
                  </div>
                  <h2>08</h2>
                  <span>SUBMITTED</span>
                </div>
                <div className="td-app-stat-card td-app-stat-green">
                  <div className="td-app-stat-icon-wrapper td-app-stat-icon-light">
                    <FiClock size={18} />
                  </div>
                  <h2>03</h2>
                  <span>UNDER REVIEW</span>
                </div>
              </div>

              <div className="td-app-list">
                {DUMMY_APPLICATIONS.map(app => (
                  <div key={app.id} className="td-app-card">
                    <div className="td-app-card-left">
                      <div className="td-app-icon-wrapper">
                        {app.icon}
                      </div>
                      <div className="td-app-content">
                        <div className="td-app-title-row">
                          <h3>{app.title}</h3>
                          <span className={`td-app-status-badge ${app.status === 'WITHDRAWN' ? 'td-app-status-badge--withdrawn' : ''}`}>{app.status}</span>
                        </div>
                        <p className="td-app-school">{app.school}</p>
                        <div className="td-app-tags">
                          {app.tags.map((tag, idx) => (
                            <span key={idx} className={`td-app-tag td-app-tag--${tag.type}`}>{tag.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="td-app-card-footer">
                      <div className="td-app-footer-left">
                        <span className="td-app-date"><FiCalendar size={14} /> Applied: {app.appliedDate}</span>
                        {app.expiresIn && (
                          <span className="td-app-expires"><FiClock size={14} /> Expires in {app.expiresIn}</span>
                        )}
                        {app.urgent && (
                          <span className="td-app-urgent"><FiAlertTriangle size={14} /> {app.urgent === true ? 'Urgent Hiring' : 'Urgent Hiring'}</span>
                        )}
                      </div>
                      <button className="td-app-action-btn">{app.actionText}</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-settings-page">

              {/* ── Settings Overview: 4 Category Boxes ── */}
              {settingsSubTab === 'overview' && (
                <>
                  <h1 className="td-settings-title">Settings</h1>
                  <div className="td-settings-category-grid">

                    {/* Account Settings */}
                    <motion.div
                      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }}
                      className="td-settings-category-card"
                      onClick={() => {
                        setPersonalInfoOrigin('settings');
                        setActiveTab('profile');
                        setProfileSubTab('personal-info');
                      }}
                    >
                      <div className="td-settings-cat-icon-wrap td-settings-cat-icon--teal">
                        <FiUser size={22} />
                      </div>
                      <div className="td-settings-cat-text">
                        <h3>Account Settings</h3>
                        <p>Manage your personal information and preferences</p>
                      </div>
                      <FiArrowRight size={20} className="td-settings-cat-arrow" />
                    </motion.div>

                    {/* Privacy & Profile Visibility */}
                    <motion.div
                      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }}
                      className="td-settings-category-card"
                      onClick={() => setSettingsSubTab('privacy')}
                    >
                      <div className="td-settings-cat-icon-wrap td-settings-cat-icon--blue">
                        <FiEye size={22} />
                      </div>
                      <div className="td-settings-cat-text">
                        <h3>Privacy &amp; Profile Visibility</h3>
                        <p>Control who can see your profile and data</p>
                      </div>
                      <FiArrowRight size={20} className="td-settings-cat-arrow" />
                    </motion.div>

                    {/* Security & Login Activity */}
                    <motion.div
                      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }}
                      className="td-settings-category-card"
                      onClick={() => setSettingsSubTab('security')}
                    >
                      <div className="td-settings-cat-icon-wrap td-settings-cat-icon--orange">
                        <FiShield size={22} />
                      </div>
                      <div className="td-settings-cat-text">
                        <h3>Security &amp; Login Activity</h3>
                        <p>Password, two-factor auth and active sessions</p>
                      </div>
                      <FiArrowRight size={20} className="td-settings-cat-arrow" />
                    </motion.div>

                    {/* Legal */}
                    <motion.div
                      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }}
                      className="td-settings-category-card"
                      onClick={() => setSettingsSubTab('legal')}
                    >
                      <div className="td-settings-cat-icon-wrap td-settings-cat-icon--purple">
                        <FiFileText size={22} />
                      </div>
                      <div className="td-settings-cat-text">
                        <h3>Legal</h3>
                        <p>Terms of service, privacy policy and more</p>
                      </div>
                      <FiArrowRight size={20} className="td-settings-cat-arrow" />
                    </motion.div>

                  </div>
                </>
              )}

              {/* ── Account Settings Subtab (Emptied) ── */}
              {settingsSubTab === 'account' && (
                <div className="td-settings-subtab-wrap">
                  <button className="td-settings-breadcrumb-btn" onClick={() => setSettingsSubTab('overview')}>
                    <FiArrowLeft size={16} /> Settings / Account Settings
                  </button>
                  <h1 className="td-settings-title">Account Settings</h1>
                  <div className="td-settings-subtab-placeholder">
                    <FiUser size={40} style={{ color: '#10b981', marginBottom: 12 }} />
                    <p>Account settings content is empty.</p>
                  </div>
                </div>
              )}

              {/* ── Privacy Subtab ── */}
              {settingsSubTab === 'privacy' && (
                <div className="td-privacy-wrap">

                  {/* Breadcrumb */}
                  <button className="td-privacy-breadcrumb" onClick={() => setSettingsSubTab('overview')}>
                    <FiArrowLeft size={16} />
                    <span>Settings/ ...Privacy &amp; Profile Visibility</span>
                  </button>

                  {/* Header */}
                  <div className="td-privacy-header">
                    <h1 className="td-privacy-title">Privacy &amp; Profile Visibility</h1>
                    <p className="td-privacy-subtitle">
                      Manage how schools and recruiters can see your professional profile and application information on Staffroom.
                    </p>
                  </div>

                  {/* Top 2-Column Row */}
                  <div className="td-privacy-top-grid">

                    {/* Left Card: Profile Discoverability */}
                    <div className="td-privacy-card td-privacy-card--discover">
                      <div className="td-privacy-discover-top">
                        <div className="td-privacy-card-title-row">
                          <span className="td-privacy-card-icon td-privacy-icon--darkgreen">
                            <FiGlobe size={18} />
                          </span>
                          <h2 className="td-privacy-card-heading">Profile Discoverability</h2>
                        </div>
                        <div className="td-privacy-badge-circle">
                          <FiCheckCircle size={22} className="td-privacy-check-icon" />
                        </div>
                      </div>

                      <p className="td-privacy-card-desc">
                        When enabled, verified schools and recruiters can find your profile when searching for candidates. This increases your chances of being headhunted for relevant roles.
                      </p>

                      <div className="td-privacy-status-box">
                        <FiInfo size={15} className="td-privacy-status-icon" />
                        <span className="td-privacy-status-text">
                          <strong>Status: Visible to Schools.</strong> Your profile is currently active in the candidate pool.
                        </span>
                      </div>
                    </div>

                    {/* Right Card: Application Data */}
                    <div className="td-privacy-card td-privacy-card--appdata">
                      <div className="td-privacy-card-title-row">
                        <span className="td-privacy-card-icon td-privacy-icon--darkgreen">
                          <FiShare2 size={18} />
                        </span>
                        <h2 className="td-privacy-card-heading">Application Data</h2>
                      </div>

                      <p className="td-privacy-card-desc">
                        When you apply for a job, employers receive a snapshot of your profile as it appears at the time of application.
                      </p>

                      <button className="td-privacy-view-btn">
                        View Shared Data
                      </button>
                    </div>

                  </div>

                  {/* Bottom Card: Specific Visibility Controls */}
                  <div className="td-privacy-controls-card">
                    <h2 className="td-privacy-controls-title">Specific Visibility Controls</h2>
                    <div className="td-privacy-divider" />

                    <div className="td-privacy-controls-inner">
                      <h3 className="td-privacy-controls-subtitle">Who can see your profile?</h3>
                      <p className="td-privacy-controls-hint">Choose your primary visibility setting. This affects how recruiters and schools find you.</p>

                      <div className="td-privacy-options-list">

                        {/* Option 1: Schools on Staffroom */}
                        <div
                          className={`td-privacy-option-card ${visibilitySetting === 'schools' ? 'td-privacy-option-card--active' : ''}`}
                          onClick={() => setVisibilitySetting('schools')}
                        >
                          <div className="td-privacy-option-icon">
                            <FiGlobe size={18} />
                          </div>
                          <div className="td-privacy-option-text">
                            <div className="td-privacy-option-title-row">
                              <span className="td-privacy-option-title">Schools on Staffroom</span>
                              <span className="td-privacy-rec-pill">RECOMMENDED</span>
                            </div>
                            <p className="td-privacy-option-desc">
                              Your profile is visible to all registered schools and recruiters searching for candidates.
                            </p>
                          </div>
                        </div>

                        {/* Option 2: Only schools I apply to */}
                        <div
                          className={`td-privacy-option-card ${visibilitySetting === 'applied' ? 'td-privacy-option-card--active' : ''}`}
                          onClick={() => setVisibilitySetting('applied')}
                        >
                          <div className="td-privacy-option-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                              <line x1="9" y1="6" x2="9.01" y2="6"></line>
                              <line x1="15" y1="6" x2="15.01" y2="6"></line>
                              <line x1="9" y1="10" x2="9.01" y2="10"></line>
                              <line x1="15" y1="10" x2="15.01" y2="10"></line>
                              <line x1="9" y1="14" x2="9.01" y2="14"></line>
                              <line x1="15" y1="14" x2="15.01" y2="14"></line>
                              <line x1="9" y1="18" x2="15" y2="18"></line>
                            </svg>
                          </div>
                          <div className="td-privacy-option-text">
                            <div className="td-privacy-option-title-row">
                              <span className="td-privacy-option-title">Only schools I apply to</span>
                            </div>
                            <p className="td-privacy-option-desc">
                              Your profile is hidden from search, but visible to schools where you submit an application.
                            </p>
                          </div>
                        </div>

                        {/* Option 3: Nobody */}
                        <div
                          className={`td-privacy-option-card ${visibilitySetting === 'nobody' ? 'td-privacy-option-card--active' : ''}`}
                          onClick={() => setVisibilitySetting('nobody')}
                        >
                          <div className="td-privacy-option-icon">
                            <FiEyeOff size={18} />
                          </div>
                          <div className="td-privacy-option-text">
                            <div className="td-privacy-option-title-row">
                              <span className="td-privacy-option-title">Nobody</span>
                            </div>
                            <p className="td-privacy-option-desc">
                              Your profile is completely hidden. Useful if you are currently employed and not looking.
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ── Security Subtab ── */}
              {settingsSubTab === 'security' && (
                <div className="td-sec-wrap">

                  {/* Breadcrumb */}
                  <button className="td-sec-breadcrumb" onClick={() => setSettingsSubTab('overview')}>
                    <FiArrowLeft size={16} />
                    <span>Settings/ ...Security &amp; Login Activity</span>
                  </button>

                  {/* Top Section: Password and security */}
                  <div className="td-sec-top-header">
                    <div>
                      <h1 className="td-sec-top-title">Password and security</h1>
                      <p className="td-sec-top-subtitle">Manage your fundamental account details and login credentials securely.</p>
                    </div>
                    <div className="td-sec-deco-circle" />
                  </div>

                  {/* Password Card */}
                  <div className="td-sec-pwd-card">
                    <div className="td-sec-pwd-left">
                      <div className="td-sec-pwd-title-row">
                        <FiKey size={15} className="td-sec-pwd-icon" />
                        <span className="td-sec-pwd-title">Password</span>
                      </div>
                      <div className="td-sec-pwd-dots">••••••••••••</div>
                      <span className="td-sec-pwd-last">Last changed 3 months ago</span>
                    </div>
                    <button className="td-sec-btn td-sec-btn--green">
                      Change Password
                    </button>
                  </div>

                  {/* Secure Account Updates Card */}
                  <div className="td-sec-info-banner">
                    <div className="td-sec-info-icon-wrap">
                      <FiShield size={16} />
                    </div>
                    <div>
                      <h4 className="td-sec-info-title">Secure Account Updates</h4>
                      <p className="td-sec-info-desc">
                        Updating your email or password will require re-authentication and verification codes sent to your current trusted devices to ensure your account remains secure.
                      </p>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="td-sec-section-spacer" />

                  {/* Lower Section: Security & Login Activity */}
                  <div className="td-sec-main-header">
                    <h2 className="td-sec-main-title">Security &amp; Login Activity</h2>
                    <p className="td-sec-main-subtitle">Manage your account security, passwords, and active sessions.</p>
                  </div>

                  {/* Card 1: Authentication */}
                  <div className="td-sec-auth-card">
                    <div className="td-sec-auth-header">
                      <div className="td-sec-card-title-row">
                        <FiKey size={18} className="td-sec-green-icon" />
                        <h3 className="td-sec-card-heading">Authentication</h3>
                      </div>
                    </div>

                    {/* Watermark Lock Icon */}
                    <div className="td-sec-watermark-lock">
                      <FiLock size={84} />
                    </div>

                    <div className="td-sec-auth-body">
                      <div className="td-sec-auth-col">
                        <span className="td-sec-col-label">LAST PASSWORD CHANGE</span>
                        <strong className="td-sec-col-value">October 12, 2023</strong>
                        <span className="td-sec-col-hint">approx. 2 months ago</span>
                      </div>

                      <div className="td-sec-auth-col">
                        <span className="td-sec-col-label">TWO-FACTOR AUTHENTICATION</span>
                        <div className="td-sec-2fa-badge">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                          <span>Disabled</span>
                        </div>
                      </div>

                      <div className="td-sec-auth-action">
                        <button className="td-sec-btn td-sec-btn--darkgreen">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Active Sessions */}
                  <div className="td-sec-card">
                    <div className="td-sec-card-title-row">
                      <div className="td-sec-green-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                      </div>
                      <h3 className="td-sec-card-heading">Active Sessions</h3>
                    </div>

                    <div className="td-sec-sessions-list">
                      {/* Session 1: Windows PC */}
                      <div className="td-sec-session-item td-sec-session-item--current">
                        <div className="td-sec-session-icon">
                          <FiMonitor size={18} />
                        </div>
                        <div className="td-sec-session-info">
                          <div className="td-sec-session-name-row">
                            <strong className="td-sec-session-name">Windows PC - Chrome</strong>
                            <span className="td-sec-curr-badge">CURRENT</span>
                          </div>
                          <span className="td-sec-session-ip">Lagos, Nigeria • IP: 197.210.64.12</span>
                          <span className="td-sec-session-status">Active now</span>
                        </div>
                      </div>

                      {/* Session 2: Android Phone */}
                      <div className="td-sec-session-item">
                        <div className="td-sec-session-icon">
                          <FiSmartphone size={18} />
                        </div>
                        <div className="td-sec-session-info">
                          <strong className="td-sec-session-name">Android Phone - Chrome</strong>
                          <span className="td-sec-session-ip">Abuja, Nigeria • IP: 105.112.44.8</span>
                          <span className="td-sec-session-status">Active 2 hours ago</span>
                        </div>
                        <button className="td-sec-signout-btn">
                          <FiLogOut size={13} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Recent Login Activity */}
                  <div className="td-sec-card">
                    <div className="td-sec-recent-header">
                      <div className="td-sec-card-title-row">
                        <FiClock size={18} className="td-sec-green-icon" />
                        <h3 className="td-sec-card-heading">Recent Login Activity</h3>
                      </div>
                      <button className="td-sec-view-log-btn">View Full Log</button>
                    </div>

                    <div className="td-sec-timeline">
                      {/* Item 1 */}
                      <div className="td-sec-timeline-item">
                        <div className="td-sec-timeline-dot td-sec-dot--green" />
                        <div className="td-sec-timeline-content">
                          <strong className="td-sec-log-title">Successful Login</strong>
                          <span className="td-sec-log-device">Windows PC - Chrome</span>
                          <span className="td-sec-log-location">
                            <FiMapPin size={12} /> Benin City, Nigeria
                          </span>
                        </div>
                        <div className="td-sec-timeline-meta">
                          <span className="td-sec-log-time">Today, 08:45 AM</span>
                          <span className="td-sec-ip-pill">197.210.88.3</span>
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div className="td-sec-timeline-item">
                        <div className="td-sec-timeline-dot td-sec-dot--green" />
                        <div className="td-sec-timeline-content">
                          <strong className="td-sec-log-title">Successful Login</strong>
                          <span className="td-sec-log-device">Android Phone - Chrome</span>
                          <span className="td-sec-log-location">
                            <FiMapPin size={12} /> Abuja, Nigeria
                          </span>
                        </div>
                        <div className="td-sec-timeline-meta">
                          <span className="td-sec-log-time">Yesterday, 14:30 PM</span>
                          <span className="td-sec-ip-pill">105.112.44.8</span>
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div className="td-sec-timeline-item td-sec-timeline-item--last">
                        <div className="td-sec-timeline-dot td-sec-dot--red" />
                        <div className="td-sec-timeline-content">
                          <strong className="td-sec-log-title td-sec-log-title--red">Failed Login Attempt</strong>
                          <span className="td-sec-log-device">MacBook Pro - Safari</span>
                          <span className="td-sec-log-location">
                            <FiMapPin size={12} /> Unknown Location
                          </span>
                        </div>
                        <div className="td-sec-timeline-meta">
                          <span className="td-sec-log-time">Dec 10, 2023, 11:20 PM</span>
                          <span className="td-sec-ip-pill td-sec-ip-pill--red">192.168.1.1</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ── Legal Subtab ── */}
              {settingsSubTab === 'legal' && (
                <div className="td-legal-wrap">

                  {/* Breadcrumb */}
                  <button className="td-legal-breadcrumb" onClick={() => setSettingsSubTab('overview')}>
                    <FiArrowLeft size={16} />
                    <span>Settings/ ...Legal</span>
                  </button>

                  {/* Header */}
                  <div className="td-legal-header">
                    <h1 className="td-legal-title">Legal</h1>
                    <p className="td-legal-subtitle">
                      Review our policies and terms that govern your use of the Staffroom platform.
                      <br />
                      We prioritize transparency and security in our academic professional network.
                    </p>
                  </div>

                  {/* 3-Column Policy Cards Grid */}
                  <div className="td-legal-grid">

                    {/* Card 1: Terms of Service */}
                    <div className="td-legal-card">
                      <div className="td-legal-card-icon-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"></path>
                          <path d="m16 16 6-6"></path>
                          <path d="m8 8 6-6"></path>
                          <path d="m9 7 8 8"></path>
                          <path d="m21 11-8-8"></path>
                        </svg>
                      </div>
                      <h3 className="td-legal-card-title">Terms of Service</h3>
                      <p className="td-legal-card-desc">
                        Read the rules, guidelines, and agreements for using the Staffroom platform. These terms
                      </p>
                      <button className="td-legal-card-link">
                        <span>Read Terms</span>
                        <FiArrowRight size={14} />
                      </button>
                    </div>

                    {/* Card 2: Privacy Policy */}
                    <div className="td-legal-card">
                      <div className="td-legal-card-icon-wrap">
                        <FiShield size={18} />
                      </div>
                      <h3 className="td-legal-card-title">Privacy Policy</h3>
                      <p className="td-legal-card-desc">
                        Understand how we collect, use, and protect your personal and professional data. We are...
                      </p>
                      <button className="td-legal-card-link">
                        <span>Read Policy</span>
                        <FiArrowRight size={14} />
                      </button>
                    </div>

                    {/* Card 3: Cookie Policy */}
                    <div className="td-legal-card">
                      <div className="td-legal-card-icon-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                          <path d="M8.5 8.5v.01"></path>
                          <path d="M16 15.5v.01"></path>
                          <path d="M12 12v.01"></path>
                          <path d="M11 17v.01"></path>
                          <path d="M7 14v.01"></path>
                        </svg>
                      </div>
                      <h3 className="td-legal-card-title">Cookie Policy</h3>
                      <p className="td-legal-card-desc">
                        Learn about the cookies and tracking technologies we use to improve your platform...
                      </p>
                      <button className="td-legal-card-link">
                        <span>Manage Cookies</span>
                        <FiArrowRight size={14} />
                      </button>
                    </div>

                  </div>

                  {/* Bottom Assistance Banner */}
                  <div className="td-legal-help-banner">
                    <div className="td-legal-help-text">
                      <h3 className="td-legal-help-title">Need specific legal assistance?</h3>
                      <p className="td-legal-help-desc">If you have questions regarding our policies, our support team is available.</p>
                    </div>
                    <button className="td-legal-contact-btn">
                      Contact Support
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-profile-tab-page">
              {profileSubTab === 'overview' ? (
                <>
                  <h1 className="td-profile-main-title">Profile</h1>

                  {/* Top Profile Summary Card */}
                  <div className="td-profile-header-card">
                    <div className="td-profile-header-left">
                      <div className="td-profile-avatar-container">
                        <img src={estherProfileImg} alt="Esther Egharevba" className="td-profile-avatar-img" />
                      </div>
                      <div className="td-profile-info-block">
                        <div className="td-profile-name-row">
                          <h2>Esther Egharevba</h2>
                          <svg className="td-profile-verified-badge" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L14.4 3.7L17.3 3.3L18.8 5.8L21.5 6.9L21.7 9.8L23.4 12.1L21.7 14.4L21.5 17.3L18.8 18.4L17.3 20.9L14.4 20.5L12 22.2L9.6 20.5L6.7 20.9L5.2 18.4L2.5 17.3L2.3 14.4L0.6 12.1L2.3 9.8L2.5 6.9L5.2 5.8L6.7 3.3L9.6 3.7L12 2Z" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.5 12L11 14.5L16 9.5" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="td-profile-role-title">Mathematics Teacher</p>
                        <div className="td-profile-meta-row">
                          <div className="td-profile-meta-item">
                            <FiMapPin size={15} className="td-profile-meta-icon" />
                            <span>Benin City, Edo State</span>
                          </div>
                          <div className="td-profile-meta-item">
                            <svg className="td-profile-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                              <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
                            </svg>
                            <span>8+ Years Experience</span>
                          </div>
                          <div className="td-profile-trcn-pill" onClick={() => setProfileSubTab('trcn-certification')} style={{ cursor: 'pointer' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2L14.4 3.7L17.3 3.3L18.8 5.8L21.5 6.9L21.7 9.8L23.4 12.1L21.7 14.4L21.5 17.3L18.8 18.4L17.3 20.9L14.4 20.5L12 22.2L9.6 20.5L6.7 20.9L5.2 18.4L2.5 17.3L2.3 14.4L0.6 12.1L2.3 9.8L2.5 6.9L5.2 5.8L6.7 3.3L9.6 3.7L12 2Z"/>
                              <path d="M9 12l2 2 4-4"/>
                            </svg>
                            <span>TRCN Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="td-profile-header-actions">
                      <button className="td-profile-btn-preview" onClick={() => { setPersonalInfoOrigin('profile'); setProfileSubTab('personal-info'); }}>
                        <FiEye size={15} />
                        <span>Preview Profile</span>
                      </button>
                      <button className="td-profile-btn-edit" onClick={() => { setPersonalInfoOrigin('profile'); setProfileSubTab('personal-info'); }}>
                        <FiEdit2 size={14} />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                  </div>

                  {/* 6 Sections Grid */}
                  <div className="td-profile-grid">
                    {/* 1. Personal Info */}
                    <motion.div whileHover={{ y: -3 }} className="td-profile-section-card" onClick={() => { setPersonalInfoOrigin('profile'); setProfileSubTab('personal-info'); }}>
                      <div className="td-psc-top">
                        <div className="td-psc-icon-box td-psc-icon-teal">
                          <FiUser size={18} />
                        </div>
                        <FiArrowRight size={18} className="td-psc-arrow" />
                      </div>
                      <h3 className="td-psc-title">Personal Info</h3>
                    </motion.div>

                    {/* 2. Professional Info */}
                    <motion.div whileHover={{ y: -3 }} className="td-profile-section-card" onClick={() => setProfileSubTab('professional-info')}>
                      <div className="td-psc-top">
                        <div className="td-psc-icon-box td-psc-icon-teal">
                          <FiBriefcase size={18} />
                        </div>
                        <FiArrowRight size={18} className="td-psc-arrow" />
                      </div>
                      <h3 className="td-psc-title">Professional Info</h3>
                    </motion.div>

                    {/* 3. Education */}
                    <motion.div whileHover={{ y: -3 }} className="td-profile-section-card" onClick={() => setProfileSubTab('education')}>
                      <div className="td-psc-top">
                        <div className="td-psc-icon-box td-psc-icon-teal">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
                          </svg>
                        </div>
                        <FiArrowRight size={18} className="td-psc-arrow" />
                      </div>
                      <h3 className="td-psc-title">Education</h3>
                    </motion.div>

                    {/* 4. Teaching Experience */}
                    <motion.div whileHover={{ y: -3 }} className="td-profile-section-card" onClick={() => setProfileSubTab('teaching-experience')}>
                      <div className="td-psc-top">
                        <div className="td-psc-icon-box td-psc-icon-teal">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                            <path d="M12 7v5l4 2"/>
                          </svg>
                        </div>
                        <FiArrowRight size={18} className="td-psc-arrow" />
                      </div>
                      <h3 className="td-psc-title">Teaching Experience</h3>
                    </motion.div>

                    {/* 5. TRCN Certification */}
                    <motion.div whileHover={{ y: -3 }} className="td-profile-section-card" onClick={() => setProfileSubTab('trcn-certification')}>
                      <div className="td-psc-top">
                        <div className="td-psc-icon-box td-psc-icon-green">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L14.4 3.7L17.3 3.3L18.8 5.8L21.5 6.9L21.7 9.8L23.4 12.1L21.7 14.4L21.5 17.3L18.8 18.4L17.3 20.9L14.4 20.5L12 22.2L9.6 20.5L6.7 20.9L5.2 18.4L2.5 17.3L2.3 14.4L0.6 12.1L2.3 9.8L2.5 6.9L5.2 5.8L6.7 3.3L9.6 3.7L12 2Z"/>
                            <path d="M9 12l2 2 4-4"/>
                          </svg>
                        </div>
                        <FiArrowRight size={18} className="td-psc-arrow" />
                      </div>
                      <h3 className="td-psc-title">TRCN Certification</h3>
                    </motion.div>

                    {/* 6. CV / Resume */}
                    <motion.div whileHover={{ y: -3 }} className="td-profile-section-card" onClick={() => setProfileSubTab('cv-resume')}>
                      <div className="td-psc-top">
                        <div className="td-psc-icon-box td-psc-icon-teal">
                          <FiFileText size={18} />
                        </div>
                        <FiArrowRight size={18} className="td-psc-arrow" />
                      </div>
                      <h3 className="td-psc-title">CV / Resume</h3>
                    </motion.div>

                    {/* 7. Availability */}
                    <motion.div whileHover={{ y: -3 }} className="td-profile-section-card" onClick={() => setProfileSubTab('availability')}>
                      <div className="td-psc-top">
                        <div className="td-psc-icon-box td-psc-icon-teal">
                          <FiClock size={18} />
                        </div>
                        <FiArrowRight size={18} className="td-psc-arrow" />
                      </div>
                      <h3 className="td-psc-title">Availability</h3>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="td-subtab-view">
                  {/* 1. Personal Info Tab */}
                  {profileSubTab === 'personal-info' && (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-pers-info-page">
                      {/* Top Breadcrumb Header */}
                      <div
                        className="td-pers-breadcrumb"
                        onClick={() => {
                          if (personalInfoOrigin === 'settings') {
                            setActiveTab('settings');
                            setSettingsSubTab('overview');
                          } else {
                            setProfileSubTab('overview');
                          }
                        }}
                      >
                        <FiArrowLeft size={16} className="td-pers-back-icon" />
                        <span>{personalInfoOrigin === 'settings' ? 'Settings/ ...Personal information' : 'Profile/ ...Personal information'}</span>
                      </div>

                      {/* Main Title & Description */}
                      <div className="td-pers-header-section">
                        <h1 className="td-pers-page-title">Personal Information</h1>
                        <p className="td-pers-page-desc">
                          Update your basic identity and contact details.
                        </p>
                      </div>

                      {/* Card Container */}
                      <div className="td-pers-card">
                        <div className="td-pers-grid">
                          {/* First Name */}
                          <div className="td-pers-field-group">
                            <label className="td-pers-label">First Name</label>
                            <input
                              type="text"
                              className="td-pers-input"
                              value={personalFirstName}
                              onChange={(e) => setPersonalFirstName(e.target.value)}
                            />
                          </div>

                          {/* Last Name */}
                          <div className="td-pers-field-group">
                            <label className="td-pers-label">Last Name</label>
                            <input
                              type="text"
                              className="td-pers-input"
                              value={personalLastName}
                              onChange={(e) => setPersonalLastName(e.target.value)}
                            />
                          </div>

                          {/* City/Location */}
                          <div className="td-pers-field-group">
                            <label className="td-pers-label">City/Location</label>
                            <input
                              type="text"
                              className="td-pers-input"
                              value={personalCity}
                              onChange={(e) => setPersonalCity(e.target.value)}
                            />
                          </div>

                          {/* State */}
                          <div className="td-pers-field-group">
                            <label className="td-pers-label">State</label>
                            <div className="td-pers-select-wrap">
                              <select
                                className="td-pers-select"
                                value={personalState}
                                onChange={(e) => setPersonalState(e.target.value)}
                              >
                                <option value="Edo State">Edo State</option>
                                <option value="Lagos State">Lagos State</option>
                                <option value="Abuja (FCT)">Abuja (FCT)</option>
                                <option value="Delta State">Delta State</option>
                                <option value="Rivers State">Rivers State</option>
                                <option value="Ogun State">Ogun State</option>
                                <option value="Oyo State">Oyo State</option>
                                <option value="Kaduna State">Kaduna State</option>
                                <option value="Kano State">Kano State</option>
                                <option value="Enugu State">Enugu State</option>
                              </select>
                              <FiChevronDown className="td-pers-select-arrow" size={16} />
                            </div>
                          </div>
                        </div>

                        {/* Phone Number Box Card */}
                        <div className="td-pers-contact-card">
                          <div className="td-pers-contact-info">
                            <div className="td-pers-contact-header">
                              <FiSmartphone size={15} className="td-pers-contact-icon" />
                              <span className="td-pers-contact-label">Phone Number</span>
                            </div>
                            <div className="td-pers-contact-value">{personalPhone}</div>
                            <div className="td-pers-contact-badge td-pers-badge--info">
                              <FiInfo size={13} />
                              <span>Used for 2FA</span>
                            </div>
                          </div>
                          <button type="button" className="td-pers-contact-btn">
                            Change Phone Number
                          </button>
                        </div>

                        {/* Email Address Box Card */}
                        <div className="td-pers-contact-card">
                          <div className="td-pers-contact-info">
                            <div className="td-pers-contact-header">
                              <FiMail size={15} className="td-pers-contact-icon" />
                              <span className="td-pers-contact-label">Email Address</span>
                            </div>
                            <div className="td-pers-contact-value">esther.egharevba@email.com</div>
                            <div className="td-pers-contact-badge td-pers-badge--verified">
                              <FiCheckCircle size={13} />
                              <span>Verified</span>
                            </div>
                          </div>
                          <button type="button" className="td-pers-contact-btn">
                            Change Email
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="td-pers-actions-row">
                          <button
                            type="button"
                            className="td-pers-cancel-btn"
                            onClick={() => {
                              if (personalInfoOrigin === 'settings') {
                                setActiveTab('settings');
                                setSettingsSubTab('overview');
                              } else {
                                setProfileSubTab('overview');
                              }
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="td-pers-save-btn"
                            onClick={() => setProfileSubTab('update-success')}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. Professional Info Tab */}
                  {profileSubTab === 'professional-info' && (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-prof-info-page">
                      {/* Top Breadcrumb */}
                      <div className="td-prof-breadcrumb" onClick={() => setProfileSubTab('overview')}>
                        <FiArrowLeft size={16} className="td-prof-back-icon" />
                        <span>Settings/ ...Professional information</span>
                      </div>

                      {/* Back to Profile & Edit Profile Row */}
                      <div className="td-prof-nav-bar">
                        <button
                          type="button"
                          className="td-prof-back-btn"
                          onClick={() => setProfileSubTab('overview')}
                        >
                          <FiArrowLeft size={16} />
                          <span>Back to Profile</span>
                        </button>
                        <button
                          type="button"
                          className="td-prof-edit-profile-btn"
                          onClick={() => setProfileSubTab('personal-info')}
                        >
                          <FiEdit2 size={14} />
                          <span>Edit Profile</span>
                        </button>
                      </div>

                      {/* Hero Header Card */}
                      <div className="td-prof-hero-card">
                        <div className="td-prof-hero-decor" />
                        <div className="td-prof-hero-content">
                          <img
                            src={estherProfileImg}
                            alt="Esther Egharevba"
                            className="td-prof-hero-avatar"
                          />
                          <div className="td-prof-hero-details">
                            <div className="td-prof-hero-name-row">
                              <h1 className="td-prof-hero-name">Esther Egharevba</h1>
                              <span className="td-prof-trcn-verified-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>TRCN Verified</span>
                              </span>
                            </div>
                            <p className="td-prof-hero-role">Mathematics Teacher</p>
                            <div className="td-prof-hero-meta-row">
                              <div className="td-prof-hero-meta-item">
                                <FiMapPin size={15} />
                                <span>Benin City, Edo State</span>
                              </div>
                              <div className="td-prof-hero-meta-item">
                                <FiBriefcase size={15} />
                                <span>8+ Years Experience</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2-Column Main Content Grid */}
                      <div className="td-prof-view-grid">
                        {/* Upper Left: Professional Summary */}
                        <div className="td-prof-card">
                          <div className="td-prof-card-head">
                            <div className="td-prof-card-icon-wrap">
                              <FiFileText size={18} color="#15803D" />
                            </div>
                            <h2>Professional Summary</h2>
                          </div>
                          <p className="td-prof-summary-text">
                            Dedicated and results–driven Mathematics Educator with over 8 years of experience fostering academic excellence in diverse classroom settings. Proven ability to translate complex mathematical concepts into accessible, engaging lessons that improve student comprehension and standardized test scores. Committed to creating an inclusive learning environment and integrating modern pedagogical technologies to enhance the learning experience.
                          </p>
                        </div>

                        {/* Upper Right: Subjects & Teaching Levels */}
                        <div className="td-prof-card">
                          <div className="td-prof-card-head">
                            <div className="td-prof-card-icon-wrap">
                              <FiBook size={18} color="#15803D" />
                            </div>
                            <h2>Subjects</h2>
                          </div>
                          <div className="td-prof-subject-pills-row">
                            <span className="td-prof-sub-pill">Mathematics</span>
                            <span className="td-prof-sub-pill">Further Mathematics</span>
                            <span className="td-prof-sub-pill">Basic Science</span>
                          </div>

                          <div className="td-prof-card-head" style={{ marginTop: '24px' }}>
                            <div className="td-prof-card-icon-wrap">
                              <FiCheckCircle size={18} color="#15803D" />
                            </div>
                            <h2>Teaching Levels</h2>
                          </div>
                          <div className="td-prof-levels-col">
                            <span className="td-prof-level-pill">Senior Secondary (SS1–SS3)</span>
                            <span className="td-prof-level-pill">Junior Secondary (JSS1–JSS3)</span>
                          </div>
                        </div>

                        {/* Lower Left: Experience */}
                        <div className="td-prof-card">
                          <div className="td-prof-card-head">
                            <div className="td-prof-card-icon-wrap">
                              <FiBriefcase size={18} color="#15803D" />
                            </div>
                            <h2>Experience</h2>
                          </div>

                          <div className="td-prof-exp-items-list">
                            <div className="td-prof-exp-item-card">
                              <div className="td-prof-exp-item-left">
                                <span className="td-prof-exp-date td-prof-exp-date--present">2018 - Present</span>
                                <h3 className="td-prof-exp-title">Senior Mathematics Teacher</h3>
                                <p className="td-prof-exp-school">Word of Faith Group of Schools, Benin City</p>
                              </div>
                              <div className="td-prof-exp-cap-badge">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                  <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
                                </svg>
                              </div>
                            </div>

                            <div className="td-prof-exp-item-card">
                              <div className="td-prof-exp-item-left">
                                <span className="td-prof-exp-date">2015 - 2018</span>
                                <h3 className="td-prof-exp-title">Subject Teacher (Mathematics)</h3>
                                <p className="td-prof-exp-school">Nosakhare Model Education Centre</p>
                              </div>
                              <div className="td-prof-exp-cap-badge">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                  <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Lower Right: Education + Certification & Documents */}
                        <div className="td-prof-right-col-stack">
                          {/* Education Box */}
                          <div className="td-prof-card">
                            <div className="td-prof-card-head">
                              <div className="td-prof-card-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                  <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
                                </svg>
                              </div>
                              <h2>Education</h2>
                            </div>

                            <div className="td-prof-edu-item">
                              <div className="td-prof-edu-icon-box">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 5H3l9-5z"/>
                                </svg>
                              </div>
                              <div className="td-prof-edu-info">
                                <h3>B.Sc. Ed. Mathematics</h3>
                                <p className="td-prof-edu-inst">University of Benin (UNIBEN)</p>
                                <span className="td-prof-edu-period">2010 - 2014</span>
                              </div>
                            </div>
                          </div>

                          {/* Certification & Documents Box */}
                          <div className="td-prof-card">
                            <div className="td-prof-card-head">
                              <div className="td-prof-card-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="8" r="7"/>
                                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                </svg>
                              </div>
                              <h2>Certification & Documents</h2>
                            </div>

                            {/* TRCN Status Box */}
                            <div className="td-prof-trcn-box">
                              <div className="td-prof-trcn-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                  <path d="m9 12 2 2 4-4"/>
                                </svg>
                                <div>
                                  <h4>TRCN Registered Educator</h4>
                                  <p>Registration No: ED/12345/2015</p>
                                </div>
                              </div>
                              <span className="td-prof-active-badge">ACTIVE</span>
                            </div>

                            {/* Download Buttons */}
                            <div className="td-prof-downloads-col">
                              <button
                                type="button"
                                className="td-prof-download-btn"
                                onClick={() => alert('Downloading Esther_Egharevba_CV.pdf')}
                              >
                                <FiDownload size={14} />
                                <span>Download CV (PDF)</span>
                              </button>
                              <button
                                type="button"
                                className="td-prof-download-btn"
                                onClick={() => alert('Downloading Esther_Egharevba_Cover_Letter.pdf')}
                              >
                                <FiDownload size={14} />
                                <span>Download Cover Letter (PDF)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Education Tab */}
                  {profileSubTab === 'education' && (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-edu-info-page">
                      {/* Top Breadcrumb Header */}
                      <div className="td-edu-breadcrumb" onClick={() => setProfileSubTab('overview')}>
                        <FiArrowLeft size={16} className="td-edu-back-icon" />
                        <span>Settings/ ...Education</span>
                      </div>

                      {/* Header Row */}
                      <div className="td-edu-header-row">
                        <div className="td-edu-header-left">
                          <h1 className="td-edu-page-title">Education</h1>
                          <p className="td-edu-page-desc">
                            Manage your academic history and qualifications.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="td-edu-add-btn"
                          onClick={() => setShowAddEduModal(true)}
                        >
                          + Add Education
                        </button>
                      </div>

                      {/* Education Cards Grid */}
                      <div className="td-edu-grid">
                        {educationList.map((edu) => (
                          <div key={edu.id} className="td-edu-card">
                            {/* Decorative background circle */}
                            <div className="td-edu-card-decor" />

                            {/* Degree Icon */}
                            <div className="td-edu-icon-badge">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
                              </svg>
                            </div>

                            {/* Details */}
                            <div className="td-edu-details">
                              <h2 className="td-edu-degree">{edu.degree}</h2>
                              <div className="td-edu-inst-row">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 5H3l9-5z"/>
                                </svg>
                                <span>{edu.institution}</span>
                              </div>
                            </div>

                            <div className="td-edu-divider" />

                            {/* Footer info: Period + Status */}
                            <div className="td-edu-card-footer">
                              <span className="td-edu-period-pill">{edu.period}</span>
                              <span className="td-edu-status-badge">
                                <FiCheckCircle size={14} color="#15803D" />
                                <span>{edu.status}</span>
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Add Qualification Dashed Card */}
                        <div
                          className="td-edu-add-card"
                          onClick={() => setShowAddEduModal(true)}
                        >
                          <div className="td-edu-add-icon-circle">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="16"/>
                              <line x1="8" y1="12" x2="16" y2="12"/>
                            </svg>
                          </div>
                          <h3 className="td-edu-add-title">Add Qualification</h3>
                          <p className="td-edu-add-desc">
                            Include your degrees, diplomas, or relevant certificates.
                          </p>
                        </div>
                      </div>

                      {/* Modal for adding education */}
                      {showAddEduModal && (
                        <div className="td-modal-overlay" onClick={() => setShowAddEduModal(false)}>
                          <div className="td-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="td-modal-header">
                              <h2>Add Qualification</h2>
                              <button className="td-modal-close" onClick={() => setShowAddEduModal(false)}>✕</button>
                            </div>
                            <div className="td-modal-body">
                              <div className="td-pers-field-group" style={{ marginBottom: '16px' }}>
                                <label className="td-pers-label">Degree / Certificate</label>
                                <input
                                  type="text"
                                  placeholder="e.g. B.Ed Mathematics"
                                  className="td-pers-input"
                                  value={newEduForm.degree}
                                  onChange={(e) => setNewEduForm({ ...newEduForm, degree: e.target.value })}
                                />
                              </div>
                              <div className="td-pers-field-group" style={{ marginBottom: '16px' }}>
                                <label className="td-pers-label">Institution / University</label>
                                <input
                                  type="text"
                                  placeholder="e.g. University of Benin"
                                  className="td-pers-input"
                                  value={newEduForm.institution}
                                  onChange={(e) => setNewEduForm({ ...newEduForm, institution: e.target.value })}
                                />
                              </div>
                              <div className="td-pers-grid" style={{ marginBottom: '16px' }}>
                                <div className="td-pers-field-group">
                                  <label className="td-pers-label">Start Year</label>
                                  <input
                                    type="text"
                                    placeholder="2015"
                                    className="td-pers-input"
                                    value={newEduForm.startYear}
                                    onChange={(e) => setNewEduForm({ ...newEduForm, startYear: e.target.value })}
                                  />
                                </div>
                                <div className="td-pers-field-group">
                                  <label className="td-pers-label">End Year</label>
                                  <input
                                    type="text"
                                    placeholder="2019"
                                    className="td-pers-input"
                                    value={newEduForm.endYear}
                                    onChange={(e) => setNewEduForm({ ...newEduForm, endYear: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="td-modal-footer">
                              <button
                                type="button"
                                className="td-pers-cancel-btn"
                                onClick={() => setShowAddEduModal(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="td-pers-save-btn"
                                onClick={() => {
                                  if (newEduForm.degree && newEduForm.institution) {
                                    setEducationList([
                                      ...educationList,
                                      {
                                        id: Date.now(),
                                        degree: newEduForm.degree,
                                        institution: newEduForm.institution,
                                        period: `${newEduForm.startYear} – ${newEduForm.endYear}`,
                                        status: 'Completed'
                                      }
                                    ]);
                                    setNewEduForm({
                                      degree: '',
                                      institution: '',
                                      startYear: '2015',
                                      endYear: '2019',
                                      status: 'Completed'
                                    });
                                    setShowAddEduModal(false);
                                  }
                                }}
                              >
                                Add Education
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 4. Teaching Experience Tab */}
                  {profileSubTab === 'teaching-experience' && (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-exp-info-page">
                      {/* Top Breadcrumb Header */}
                      <div className="td-exp-breadcrumb" onClick={() => setProfileSubTab('overview')}>
                        <FiArrowLeft size={16} className="td-exp-back-icon" />
                        <span>Settings/ ...Teaching Experience</span>
                      </div>

                      {/* Header Row */}
                      <div className="td-exp-header-row">
                        <div className="td-exp-header-left">
                          <h1 className="td-exp-page-title">Teaching Experience</h1>
                          <p className="td-exp-page-desc">
                            Document your work history and pedagogical achievements to build a strong professional profile.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="td-exp-add-btn"
                          onClick={() => {
                            setEditingExpId(null);
                            setExpForm({
                              role: '',
                              school: '',
                              location: '',
                              period: '',
                              description: ''
                            });
                            setShowAddExpModal(true);
                          }}
                        >
                          + Add Experience
                        </button>
                      </div>

                      {/* Timeline & Experience List */}
                      <div className="td-exp-timeline-container">
                        {experienceList.map((exp, index) => (
                          <div key={exp.id} className="td-exp-timeline-item">
                            {/* Left Timeline Marker Column */}
                            <div className="td-exp-timeline-marker-col">
                              <div className="td-exp-node-active">
                                <div className="td-exp-node-inner-dot" />
                              </div>
                              <div className="td-exp-timeline-line" />
                              {index === experienceList.length - 1 && (
                                <div className="td-exp-node-empty" />
                              )}
                            </div>

                            {/* Right Experience Card */}
                            <div className="td-exp-card">
                              <div className="td-exp-card-header">
                                <div>
                                  <h2 className="td-exp-role">{exp.role}</h2>
                                  <div className="td-exp-school-location">
                                    <span>{exp.school}</span>
                                    <span className="td-exp-dot-sep">•</span>
                                    <span>{exp.location}</span>
                                  </div>
                                </div>
                                <div className="td-exp-badge">
                                  <FiCalendar size={13} className="td-exp-badge-icon" />
                                  <span>{exp.period}</span>
                                </div>
                              </div>

                              <p className="td-exp-desc">{exp.description}</p>

                              <div className="td-exp-divider" />

                              <div className="td-exp-actions">
                                <button
                                  type="button"
                                  className="td-exp-action-btn td-exp-action-edit"
                                  onClick={() => {
                                    setEditingExpId(exp.id);
                                    setExpForm({
                                      role: exp.role,
                                      school: exp.school,
                                      location: exp.location,
                                      period: exp.period,
                                      description: exp.description
                                    });
                                    setShowAddExpModal(true);
                                  }}
                                >
                                  <FiEdit2 size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="td-exp-action-btn td-exp-action-delete"
                                  onClick={() => {
                                    setExperienceList(experienceList.filter(item => item.id !== exp.id));
                                  }}
                                >
                                  <FiTrash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Modal for adding/editing experience */}
                      {showAddExpModal && (
                        <div className="td-modal-overlay" onClick={() => setShowAddExpModal(false)}>
                          <div className="td-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="td-modal-header">
                              <h2>{editingExpId ? 'Edit Experience' : 'Add Experience'}</h2>
                              <button className="td-modal-close" onClick={() => setShowAddExpModal(false)}>✕</button>
                            </div>
                            <div className="td-modal-body">
                              <div className="td-pers-field-group" style={{ marginBottom: '16px' }}>
                                <label className="td-pers-label">Role / Job Title</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Senior Mathematics Teacher"
                                  className="td-pers-input"
                                  value={expForm.role}
                                  onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                                />
                              </div>
                              <div className="td-pers-grid" style={{ marginBottom: '16px' }}>
                                <div className="td-pers-field-group">
                                  <label className="td-pers-label">School / Institution</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Bright Future College"
                                    className="td-pers-input"
                                    value={expForm.school}
                                    onChange={(e) => setExpForm({ ...expForm, school: e.target.value })}
                                  />
                                </div>
                                <div className="td-pers-field-group">
                                  <label className="td-pers-label">Location (City)</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Benin City"
                                    className="td-pers-input"
                                    value={expForm.location}
                                    onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="td-pers-field-group" style={{ marginBottom: '16px' }}>
                                <label className="td-pers-label">Employment Period</label>
                                <input
                                  type="text"
                                  placeholder="e.g. SEPT 2021 – PRESENT"
                                  className="td-pers-input"
                                  value={expForm.period}
                                  onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                                />
                              </div>
                              <div className="td-pers-field-group" style={{ marginBottom: '16px' }}>
                                <label className="td-pers-label">Description / Responsibilities</label>
                                <textarea
                                  rows={4}
                                  placeholder="Describe your key pedagogical responsibilities, student achievements, and leadership..."
                                  className="td-prof-textarea"
                                  value={expForm.description}
                                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="td-modal-footer">
                              <button
                                type="button"
                                className="td-pers-cancel-btn"
                                onClick={() => setShowAddExpModal(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="td-pers-save-btn"
                                onClick={() => {
                                  if (expForm.role && expForm.school) {
                                    if (editingExpId) {
                                      setExperienceList(experienceList.map(item =>
                                        item.id === editingExpId ? { ...item, ...expForm } : item
                                      ));
                                    } else {
                                      setExperienceList([
                                        ...experienceList,
                                        {
                                          id: Date.now(),
                                          ...expForm
                                        }
                                      ]);
                                    }
                                    setShowAddExpModal(false);
                                  }
                                }}
                              >
                                {editingExpId ? 'Save Changes' : 'Add Experience'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 5. TRCN Certification Tab */}
                  {profileSubTab === 'trcn-certification' && (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-trcn-info-page">
                      {/* Top Breadcrumb Header */}
                      <div className="td-trcn-breadcrumb" onClick={() => setProfileSubTab('overview')}>
                        <FiArrowLeft size={16} className="td-trcn-back-icon" />
                        <span>Settings/ ...TRCN Certification</span>
                      </div>

                      {/* Header Row */}
                      <div className="td-trcn-header-row">
                        <h1 className="td-trcn-page-title">TRCN Certification</h1>
                        <p className="td-trcn-page-desc">
                          Manage your Teachers Registration Council of Nigeria credentials.
                        </p>
                      </div>

                      {/* 2-Column Grid Layout */}
                      <div className="td-trcn-grid-layout">
                        {/* LEFT COLUMN */}
                        <div className="td-trcn-left-col">
                          {/* Top TRCN Status Card */}
                          <div className="td-trcn-status-card">
                            {/* Decorative soft green corner blob */}
                            <div className="td-trcn-decor-blob" />

                            <div className="td-trcn-status-left">
                              <div className="td-trcn-status-title-row">
                                <h2 className="td-trcn-card-title">TRCN Status</h2>
                                <span className="td-trcn-active-pill">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span>Active & Validated</span>
                                </span>
                              </div>

                              <div className="td-trcn-number-row">
                                <span className="td-trcn-number-label">TRCN Number:</span>
                                <span className="td-trcn-number-val">TRCN/EDO/123456</span>
                              </div>
                            </div>

                            <div className="td-trcn-status-actions">
                              <button
                                type="button"
                                className="td-trcn-btn-view"
                                onClick={() => alert('Viewing TRCN Certificate: TRCN/EDO/123456')}
                              >
                                <FiEye size={16} />
                                <span>View Certificate</span>
                              </button>
                              <button
                                type="button"
                                className="td-trcn-btn-update"
                                onClick={() => alert('Update TRCN documentation flow')}
                              >
                                <FiRotateCw size={14} />
                                <span>Update</span>
                              </button>
                            </div>
                          </div>

                          {/* 2 Sub-Cards Row (Issuance Details + Verification Log) */}
                          <div className="td-trcn-subcards-grid">
                            {/* Card A: Issuance Details */}
                            <div className="td-trcn-subcard">
                              <div className="td-trcn-subcard-header">
                                <FiCalendar size={16} className="td-trcn-subcard-icon" />
                                <h3>Issuance Details</h3>
                              </div>

                              <div className="td-trcn-subcard-fields">
                                <div className="td-trcn-field-item">
                                  <label>Date Issued</label>
                                  <p>15 August 2021</p>
                                </div>
                                <div className="td-trcn-field-item">
                                  <label>Valid Until</label>
                                  <p>14 August 2026</p>
                                </div>
                              </div>
                            </div>

                            {/* Card B: Verification Log */}
                            <div className="td-trcn-subcard">
                              <div className="td-trcn-subcard-header">
                                <FiShield size={16} className="td-trcn-subcard-icon" />
                                <h3>Verification Log</h3>
                              </div>

                              <div className="td-trcn-log-timeline">
                                <div className="td-trcn-log-entry">
                                  <div className="td-trcn-log-dot td-trcn-log-dot--green" />
                                  <div className="td-trcn-log-info">
                                    <h4>Validated by Staffroom Admin</h4>
                                    <span>22 Sep 2023</span>
                                  </div>
                                </div>

                                <div className="td-trcn-log-entry">
                                  <div className="td-trcn-log-dot td-trcn-log-dot--gray" />
                                  <div className="td-trcn-log-info">
                                    <h4>Document Uploaded</h4>
                                    <span>20 Sep 2023</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN (Why this matters) */}
                        <div className="td-trcn-right-col">
                          <div className="td-trcn-why-card">
                            <div className="td-trcn-why-header">
                              <div className="td-trcn-why-icon-box">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="8" r="7"/>
                                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                </svg>
                              </div>
                              <h2>Why this matters</h2>
                            </div>

                            <p className="td-trcn-why-intro">
                              A validated TRCN certificate significantly boosts your profile visibility to top educational institutions.
                            </p>

                            <div className="td-trcn-benefits-list">
                              <div className="td-trcn-benefit-item">
                                <svg className="td-trcn-check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <p>
                                  <strong>Higher Ranking:</strong> Verified profiles appear first in recruiter search results.
                                </p>
                              </div>

                              <div className="td-trcn-benefit-item">
                                <svg className="td-trcn-check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <p>
                                  <strong>Trust & Credibility:</strong> Schools prioritize candidates with verified professional standing.
                                </p>
                              </div>

                              <div className="td-trcn-benefit-item">
                                <svg className="td-trcn-check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <p>
                                  <strong>Premium Opportunities:</strong> Access exclusive job listings that require mandatory TRCN certification.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 6. CV / Resume Tab */}
                  {profileSubTab === 'cv-resume' && (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-cv-info-page">
                      {/* Top Breadcrumb Header */}
                      <div className="td-cv-breadcrumb" onClick={() => setProfileSubTab('overview')}>
                        <FiArrowLeft size={16} className="td-cv-back-icon" />
                        <span>Settings/ ...CV/ Resume</span>
                      </div>

                      {/* Header Row */}
                      <div className="td-cv-header-row">
                        <h1 className="td-cv-page-title">CV / Resume</h1>
                        <p className="td-cv-page-desc">
                          Manage your curriculum vitae. Ensure your document is up-to-date to stand out to prospective employers.
                        </p>
                      </div>

                      {/* 2-Column Grid Layout */}
                      <div className="td-cv-grid-layout">
                        {/* LEFT COLUMN */}
                        <div className="td-cv-left-col">
                          {/* Current Active Resume Card */}
                          <div className="td-cv-active-card">
                            <div className="td-cv-active-header">
                              <div className="td-cv-title-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                  <line x1="16" y1="13" x2="8" y2="13"/>
                                  <line x1="16" y1="17" x2="8" y2="17"/>
                                  <polyline points="10 9 9 9 8 9"/>
                                </svg>
                                <h2>Current Active Resume</h2>
                              </div>
                              <span className="td-cv-secure-pill">
                                <FiLock size={12} />
                                <span>Securely Stored</span>
                              </span>
                            </div>

                            {/* Inner File Item Box */}
                            <div className="td-cv-file-box">
                              <div className="td-cv-pdf-icon-box">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                  <text x="7.5" y="17" fontSize="6.5" fontWeight="bold" fill="#15803D" stroke="none" fontFamily="sans-serif">PDF</text>
                                </svg>
                              </div>
                              <div className="td-cv-file-info">
                                <h3>{activeResume.name}</h3>
                                <span>{activeResume.uploadDate} • {activeResume.size}</span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="td-cv-actions-row">
                              <button
                                type="button"
                                className="td-cv-btn-view"
                                onClick={() => alert(`Previewing ${activeResume.name}`)}
                              >
                                <FiEye size={15} />
                                <span>View Document</span>
                              </button>
                              <button
                                type="button"
                                className="td-cv-btn-download"
                                onClick={() => alert(`Downloading ${activeResume.name}`)}
                              >
                                <FiDownload size={15} />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>

                          {/* Privacy Assured Card */}
                          <div className="td-cv-privacy-card">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="td-cv-shield-icon">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                              <path d="m9 12 2 2 4-4"/>
                            </svg>
                            <div className="td-cv-privacy-info">
                              <h3>Privacy Assured</h3>
                              <p>
                                Your resume is securely stored and only shared with verified institutions you apply to. We use industry-standard encryption to protect your data.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Replace Resume */}
                        <div className="td-cv-right-col">
                          <div className="td-cv-replace-card">
                            <div className="td-cv-replace-header">
                              <h2>Replace Resume</h2>
                              <p>Uploading a new document will immediately replace your current active resume.</p>
                            </div>

                            <label className="td-cv-dropzone">
                              <input
                                type="file"
                                accept=".pdf,.docx,.doc"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    setActiveResume({
                                      name: file.name,
                                      uploadDate: 'Uploaded Just now',
                                      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                    });
                                    alert(`Uploaded ${file.name} successfully!`);
                                  }
                                }}
                              />
                              <div className="td-cv-cloud-icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="16 16 12 12 8 16"/>
                                  <line x1="12" y1="12" x2="12" y2="21"/>
                                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                  <polyline points="16 16 12 12 8 16"/>
                                </svg>
                              </div>
                              <strong className="td-cv-drop-prompt">Drag and drop your new CV here</strong>
                              <span className="td-cv-drop-sub">or click to browse from your device</span>
                              <span className="td-cv-drop-formats">SUPPORTED FORMATS: PDF, DOCX (MAX 5MB)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 7. Availability Tab */}
                  {profileSubTab === 'availability' && (
                    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-avail-info-page">
                      {/* Top Breadcrumb Header */}
                      <div className="td-avail-breadcrumb" onClick={() => setProfileSubTab('overview')}>
                        <FiArrowLeft size={16} className="td-avail-back-icon" />
                        <span>Settings/ ...Availability</span>
                      </div>

                      {/* Header Row */}
                      <div className="td-avail-header-row">
                        <h1 className="td-avail-page-title">Availability</h1>
                        <p className="td-avail-page-desc">
                          Manage your current work status and location preferences.
                        </p>
                      </div>

                      {/* Main Form Card */}
                      <div className="td-avail-card">
                        {/* Section 1: Employment Type */}
                        <div className="td-avail-section">
                          <h2 className="td-avail-section-title">Employment Type</h2>
                          <p className="td-avail-section-desc">Select the type of roles you are currently looking for.</p>

                          <div className="td-avail-emp-grid">
                            {/* Option 1: Full Time */}
                            <div
                              className={`td-avail-emp-card ${availEmpType === 'full-time' ? 'td-avail-emp-card--active' : ''}`}
                              onClick={() => setAvailEmpType('full-time')}
                            >
                              <div className="td-avail-emp-left">
                                <div className={`td-avail-radio-circle ${availEmpType === 'full-time' ? 'td-avail-radio-circle--active' : ''}`}>
                                  {availEmpType === 'full-time' && <div className="td-avail-radio-inner" />}
                                </div>
                                <div className="td-avail-emp-info">
                                  <h3>Full Time</h3>
                                  <span>Standard 40–hour work week</span>
                                </div>
                              </div>
                              {availEmpType === 'full-time' && (
                                <div className="td-avail-check-badge">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Option 2: Part Time */}
                            <div
                              className={`td-avail-emp-card ${availEmpType === 'part-time' ? 'td-avail-emp-card--active' : ''}`}
                              onClick={() => setAvailEmpType('part-time')}
                            >
                              <div className="td-avail-emp-left">
                                <div className={`td-avail-radio-circle ${availEmpType === 'part-time' ? 'td-avail-radio-circle--active' : ''}`}>
                                  {availEmpType === 'part-time' && <div className="td-avail-radio-inner" />}
                                </div>
                                <div className="td-avail-emp-info">
                                  <h3>Part Time</h3>
                                  <span>Flexible hours, less than 40h/wk</span>
                                </div>
                              </div>
                              {availEmpType === 'part-time' && (
                                <div className="td-avail-check-badge">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Option 3: Contract */}
                            <div
                              className={`td-avail-emp-card ${availEmpType === 'contract' ? 'td-avail-emp-card--active' : ''}`}
                              onClick={() => setAvailEmpType('contract')}
                            >
                              <div className="td-avail-emp-left">
                                <div className={`td-avail-radio-circle ${availEmpType === 'contract' ? 'td-avail-radio-circle--active' : ''}`}>
                                  {availEmpType === 'contract' && <div className="td-avail-radio-inner" />}
                                </div>
                                <div className="td-avail-emp-info">
                                  <h3>Contract</h3>
                                  <span>Fixed-term teaching assignments</span>
                                </div>
                              </div>
                              {availEmpType === 'contract' && (
                                <div className="td-avail-check-badge">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Option 4: Substitute */}
                            <div
                              className={`td-avail-emp-card ${availEmpType === 'substitute' ? 'td-avail-emp-card--active' : ''}`}
                              onClick={() => setAvailEmpType('substitute')}
                            >
                              <div className="td-avail-emp-left">
                                <div className={`td-avail-radio-circle ${availEmpType === 'substitute' ? 'td-avail-radio-circle--active' : ''}`}>
                                  {availEmpType === 'substitute' && <div className="td-avail-radio-inner" />}
                                </div>
                                <div className="td-avail-emp-info">
                                  <h3>Substitute</h3>
                                  <span>On-call short term coverage</span>
                                </div>
                              </div>
                              {availEmpType === 'substitute' && (
                                <div className="td-avail-check-badge">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Preferred Location */}
                        <div className="td-avail-section">
                          <h2 className="td-avail-section-title">Preferred Location</h2>
                          <p className="td-avail-section-desc">Where are you looking to work?</p>

                          <div className="td-avail-loc-field">
                            <label className="td-avail-field-label">City & State</label>
                            <div className="td-avail-loc-input-wrap">
                              <FiMapPin size={16} className="td-avail-loc-icon" />
                              <input
                                type="text"
                                className="td-avail-loc-input"
                                value={availLocation}
                                onChange={(e) => setAvailLocation(e.target.value)}
                              />
                            </div>
                            <span className="td-avail-field-hint">This helps us match you with schools in your area.</span>
                          </div>
                        </div>

                        {/* Section 3: Available From */}
                        <div className="td-avail-section">
                          <h2 className="td-avail-section-title">Available From</h2>
                          <p className="td-avail-section-desc">When can you start a new position?</p>

                          <div className="td-avail-start-grid">
                            {/* Choice 1: Immediately */}
                            <button
                              type="button"
                              className={`td-avail-start-btn ${availStartOption === 'immediately' ? 'td-avail-start-btn--active' : ''}`}
                              onClick={() => setAvailStartOption('immediately')}
                            >
                              <FiZap size={18} className="td-avail-start-icon" />
                              <span>Immediately</span>
                            </button>

                            {/* Choice 2: In 2 Weeks */}
                            <button
                              type="button"
                              className={`td-avail-start-btn ${availStartOption === '2-weeks' ? 'td-avail-start-btn--active' : ''}`}
                              onClick={() => setAvailStartOption('2-weeks')}
                            >
                              <FiCalendar size={18} className="td-avail-start-icon" />
                              <span>In 2 Weeks</span>
                            </button>

                            {/* Choice 3: Specific Date */}
                            <button
                              type="button"
                              className={`td-avail-start-btn ${availStartOption === 'specific-date' ? 'td-avail-start-btn--active' : ''}`}
                              onClick={() => setAvailStartOption('specific-date')}
                            >
                              <FiCalendar size={18} className="td-avail-start-icon" />
                              <span>Specific Date</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="td-avail-actions-row">
                          <button
                            type="button"
                            className="td-pers-cancel-btn"
                            onClick={() => setProfileSubTab('overview')}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="td-pers-save-btn"
                            onClick={() => setProfileSubTab('update-success')}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 8. Profile Updated Successfully Full Screen Overlay Modal */}
                  {(profileSubTab === 'update-success' || showProfileUpdatedModal) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="td-profile-success-overlay"
                    >
                      {/* Back Arrow */}
                      <button
                        type="button"
                        className="td-success-overlay-back-btn"
                        onClick={() => {
                          setShowProfileUpdatedModal(false);
                          if (profileSubTab === 'update-success') {
                            setProfileSubTab('overview');
                          }
                        }}
                        title="Back to profile"
                      >
                        <FiArrowLeft size={24} />
                      </button>

                      {/* Centered Modal Card */}
                      <div className="td-success-card">
                        {/* Success Icon */}
                        <div className="td-success-icon-outer">
                          <div className="td-success-icon-inner">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        </div>

                        {/* Title */}
                        <h1 className="td-success-title">
                          Profile Updated<br />Successfully
                        </h1>

                        {/* Subtitle */}
                        <p className="td-success-desc">
                          Your professional profile has been updated successfully and is ready for schools to discover.
                        </p>

                        {/* Progress Status */}
                        <div className="td-success-progress-section">
                          <div className="td-success-progress-bar" />
                          <span className="td-success-progress-text">Completion Status: 100%</span>
                        </div>

                        {/* Actions */}
                        <div className="td-success-actions-row">
                          <button
                            type="button"
                            className="td-success-view-profile-btn"
                            onClick={() => {
                              setShowProfileUpdatedModal(false);
                              setProfileSubTab('professional-info');
                            }}
                          >
                            View My Profile
                          </button>
                          <button
                            type="button"
                            className="td-success-dashboard-btn"
                            onClick={() => {
                              setShowProfileUpdatedModal(false);
                              setActiveTab('overview');
                            }}
                          >
                            Go to Dashboard
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}


          {['messages'].includes(activeTab) && (
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
                  {activeTab} <span className="text-[#1CCB43]">Coming Soon</span>
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

      {/* ── Mobile Bottom Nav ── */}
      <nav className="td-mobile-bottomnav">
        {[
          { id: 'dashboard', icon: <FiGrid />, label: 'HOME' },
          { id: 'jobs', icon: <FiBriefcase />, label: 'JOBS' },
          { id: 'application', icon: <FiFileText />, label: 'APPLICATIONS' },
          { id: 'settings', icon: <FiSettings />, label: 'SETTINGS' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`td-bottomnav-tab ${activeTab === tab.id ? 'td-bottomnav-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="td-bottomnav-icon-wrapper">
              <span className="td-bottomnav-icon">{tab.icon}</span>
            </span>
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
          border-right: 1px solid #EEF2F6;
          display: flex;
          flex-direction: column;
          padding: 28px 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .td-logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px 36px;
          font-weight: 800;
          font-size: 19px;
          color: #1E293B;
        }

        .td-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 16px;
        }

        .td-nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          color: #334155;
          cursor: pointer;
          transition: 0.2s ease;
          font-size: 14px;
          font-weight: 600;
          border-radius: 18px;
          position: relative;
        }
        .td-nav-item:hover {
          color: #0F172A;
          background: #F8FAFC;
        }
        .td-nav-item--active {
          color: #2E7D32;
          background: #E8F5E9;
          font-weight: 700;
        }
        .td-nav-item--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 4px;
          background: #1B5E20;
          border-radius: 4px;
        }
        .td-nav-item--active .td-nav-icon {
          color: #2E7D32;
          stroke: #2E7D32;
        }
        .td-nav-icon {
          color: #475569;
          stroke: #475569;
          flex-shrink: 0;
        }

        .td-sidebar-footer {
          margin-top: auto;
          padding: 0 16px 16px;
        }
        .td-logout-container {
          background: #FFE8E5;
          border-radius: 20px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .td-logout-btn {
          width: 100%;
          background: #FF5E3A;
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease;
          box-shadow: 0 2px 8px rgba(255, 94, 58, 0.25);
        }
        .td-logout-btn:hover {
          background: #F44E28;
        }
        .td-logout-btn:active {
          transform: scale(0.98);
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

        /* ═══════════════════════════════════════
           APPLICATION SUBMITTED PAGE
        ═══════════════════════════════════════ */
        .td-application-submitted-page {
          width: 100%;
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px 60px;
          position: relative;
        }

        .td-application-submitted-page::before {
          content: '';
          position: absolute;
          top: 8%;
          left: 12%;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0) 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
        }

        .td-application-submitted-page::after {
          content: '';
          position: absolute;
          bottom: 6%;
          right: 10%;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.10) 0%, rgba(34, 197, 94, 0) 70%);
          filter: blur(50px);
          pointer-events: none;
          z-index: 0;
        }

        .td-application-submitted-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 720px;
          background: #FFFFFF;
          border-radius: 36px;
          padding: 56px 48px 44px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(0, 0, 0, 0.02);
          border: 1px solid #F1F4F9;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .td-success-badge {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #15803D;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          box-shadow: 0 8px 20px rgba(21, 128, 61, 0.25);
        }

        .td-success-check-icon {
          color: #22C55E;
          font-size: 26px;
          stroke-width: 3;
        }

        .td-application-submitted-card h1 {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 10px;
          line-height: 1.25;
          letter-spacing: -0.5px;
        }

        .td-submitted-description {
          font-size: 14.5px;
          color: #64748B;
          line-height: 1.6;
          margin: 0 auto 32px;
          max-width: 480px;
          font-weight: 450;
        }

        .td-application-summary-card {
          width: 100%;
          background: #F0F3F7;
          border-radius: 26px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          text-align: left;
          border: none;
        }

        .td-app-school-logo {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #0B1320;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .td-app-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .td-app-info-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .td-app-position-badge {
          background: #DCFCE7;
          color: #166534;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.4px;
          padding: 3px 10px;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 3px;
        }

        .td-app-info-block h2 {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 4px;
          line-height: 1.2;
        }

        .td-app-meta-line {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748B;
          font-weight: 500;
        }

        .td-app-meta-icon {
          color: #94A3B8;
        }

        .td-app-dot {
          color: #CBD5E1;
          font-weight: 700;
        }

        .td-application-actions {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 28px;
        }

        .td-application-btn {
          width: 100%;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 14.5px;
          padding: 15px 22px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .td-application-btn--primary {
          background: #20D051;
          color: #FFFFFF;
          box-shadow: 0 8px 20px rgba(32, 208, 81, 0.32);
        }

        .td-application-btn--primary:hover {
          background: #1BBF48;
          box-shadow: 0 10px 24px rgba(32, 208, 81, 0.42);
        }

        .td-application-btn--secondary {
          background: #DFE3E8;
          color: #334155;
        }

        .td-application-btn--secondary:hover {
          background: #D3D8DF;
        }

        .td-app-browse-more {
          margin-top: 26px;
          background: transparent;
          border: none;
          color: #166534;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .td-app-browse-more:hover {
          color: #15803D;
          gap: 12px;
        }

        .td-app-arrow {
          font-size: 16px;
        }

        @media (max-width: 640px) {
          .td-application-submitted-card {
            padding: 36px 20px 28px;
            border-radius: 28px;
          }
          .td-application-actions {
            grid-template-columns: 1fr;
          }
          .td-application-summary-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .td-app-meta-line {
            flex-wrap: wrap;
          }
        }

        /* Welcome Header */
        .td-welcome-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 36px;
        }
        .td-welcome-title {
          font-size: 32px;
          font-weight: 800;
          color: #2D3748;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .td-subtitle {
          color: #718096;
          font-size: 15px;
          font-weight: 400;
        }

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
          border: 1px solid #E2E8F0;
          padding: 8px 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #2D3748;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        /* Grid */
        .td-grid-main {
          display: block;
          width: 100%;
        }
        .td-left-col {
          width: 100%;
        }
        .td-right-col {
          display: none;
        }

        /* ═══════════════════════════════════════
           STATS ROW
        ═══════════════════════════════════════ */
        .td-stats-row {
          display: grid;
          grid-template-columns: 1.35fr 1fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 48px;
          align-items: stretch;
        }
        .td-stats-row .td-profile-card {
          width: 100%;
        }
        .td-stats-mini-wrapper {
          display: contents; /* on desktop, children participate in parent grid directly */
        }

        .td-stat-card {
          background: #fff;
          border-radius: 32px;
          padding: 28px 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          position: relative;
        }
        
        .td-profile-card {
          border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Desktop profile card internals */
        .td-mobile-profile-strength { display: none; }
        .td-desktop-profile-strength {
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        .td-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .td-profile-title {
          font-size: 16px;
          font-weight: 700;
          color: #1A202C;
        }
        .td-percent-badge {
          background: #68D391;
          color: #fff;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .td-progress-bar {
          height: 8px;
          background: #EDF2F7;
          border-radius: 9999px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .td-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22C55E 0%, #4ADE80 100%);
          border-radius: 9999px;
          transition: width 0.8s ease;
        }

        .td-card-hint {
          font-size: 13px;
          color: #718096;
          line-height: 1.4;
          margin-bottom: 24px;
        }

        .td-complete-profile-btn {
          width: 100%;
          background: #22C55E;
          color: #fff;
          border: none;
          padding: 14px 20px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(34, 197, 94, 0.25);
        }
        .td-complete-profile-btn:hover {
          background: #16A34A;
        }

        /* 3 Mini Cards on Desktop */
        .td-mini-card {
          background: #F8FAFC;
          border-radius: 32px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          border: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.015);
        }
        
        .td-mini-card--views::before {
          content: '';
          position: absolute;
          left: 0;
          top: 24px;
          bottom: 24px;
          width: 3px;
          background: #22C55E;
          border-radius: 0 4px 4px 0;
        }
        
        .td-mini-card--applied::before {
          content: '';
          position: absolute;
          left: 0;
          top: 24px;
          bottom: 24px;
          width: 3px;
          background: #22C55E;
          border-radius: 0 4px 4px 0;
        }

        .td-mini-card--pending::before {
          content: '';
          position: absolute;
          left: 0;
          top: 24px;
          bottom: 24px;
          width: 3px;
          background: #DC2626;
          border-radius: 0 4px 4px 0;
        }

        .td-mini-icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #22C55E;
          margin-bottom: 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .td-mini-card--pending .td-mini-icon-circle {
          color: #DC2626;
        }

        .td-mini-label {
          font-size: 12px;
          font-weight: 800;
          color: #1A202C;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
        }
        .td-mini-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .td-mini-value {
          font-size: 32px;
          font-weight: 800;
          color: #1A202C;
          line-height: 1;
        }
        .td-mini-growth {
          color: #22C55E;
          font-size: 12px;
          font-weight: 700;
        }
        .td-mini-unit {
          font-size: 13px;
          font-weight: 600;
          color: #4A5568;
        }
        .td-mini-action {
          font-size: 12px;
          font-weight: 700;
          color: #DC2626;
        }

        /* Desktop-only card hidden on mobile */
        .td-desktop-only-card { display: flex; }

        /* ═══════════════════════════════════════
           JOBS SECTION
        ═══════════════════════════════════════ */
        .td-jobs-section {
          margin-top: 16px;
        }
        .td-jobs-section h2 {
          font-size: 26px;
          font-weight: 800;
          color: #2D3748;
          letter-spacing: -0.3px;
        }
        .td-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .td-view-all-link {
          font-size: 13px;
          color: #22C55E;
          font-weight: 700;
          text-decoration: none;
        }
        .td-view-all-link:hover {
          text-decoration: underline;
        }

        .td-mobile-label { display: none; }
        .td-desktop-label { display: inline; }

        .td-mobile-stat-number { display: none; }
        .td-mobile-subtext { display: none; }
        .td-mobile-icon { display: none; }
        .td-desktop-icon { display: block; }
        .td-mobile-text { display: none; }
        .td-desktop-text { display: inline; }
        .td-desktop-stat-val { display: inline; }
        .td-desktop-val-row { display: flex; }
        .td-desktop-badge-col { display: flex; }

        .td-job-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .td-job-item {
          background: #fff;
          border-radius: 28px;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          border: 1px solid #F1F5F9;
          box-shadow: 0 4px 20px rgba(0,0,0,0.015);
        }

        .td-job-header-row {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .td-job-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .td-job-avatar--school {
          background: #E2E8F0;
        }

        .td-job-info-main {
          flex: 1;
        }
        .td-job-title-line {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }
        .td-job-title-line h3 {
          font-size: 17px;
          font-weight: 800;
          color: #1A202C;
        }

        .td-job-badge-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .td-job-type-badge {
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 9999px;
          letter-spacing: 0.5px;
        }
        .td-job-type-badge--full {
          background: #E8F9ED;
          color: #22C55E;
        }
        .td-job-type-badge--res {
          background: #E8F9ED;
          color: #22C55E;
        }

        .td-job-time-ago {
          font-size: 11px;
          color: #718096;
          font-weight: 500;
        }

        .td-job-school {
          font-size: 13px;
          color: #718096;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .td-job-bullet {
          color: #CBD5E0;
          font-size: 10px;
        }

        .td-job-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .td-job-tags span {
          background: #F1F5F9;
          color: #475569;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.6px;
          padding: 6px 14px;
          border-radius: 9999px;
        }
        .td-desktop-tags { display: flex; }
        .td-mobile-only-tags { display: none; }

        .td-job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #F1F5F9;
          margin-top: 20px;
          padding-top: 20px;
        }
        .td-job-salary {
          font-size: 14px;
          font-weight: 800;
          color: #22C55E;
        }
        .td-quick-apply {
          font-size: 13px;
          font-weight: 700;
          color: #22C55E;
          text-decoration: none;
        }
        .td-quick-apply:hover {
          text-decoration: underline;
        }

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
          .td-jobs-hero { margin-bottom: 24px; }
          .td-jobs-hero h1 { font-size: 32px; font-weight: 800; color: #1E293B; letter-spacing: -0.6px; line-height: 1.2; margin-bottom: 20px; }
          .td-jobs-hero p { display: none; }
          .td-desktop-search { display: none; }
          .td-mobile-jobs-search { display: block; }
          
          .td-search-box-mobile {
            background: #E2E8F0;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            padding: 14px 20px;
            margin-bottom: 16px;
          }
          .td-search-box-mobile .td-search-icon { color: #64748B; }
          .td-search-box-mobile input {
            border: none;
            background: transparent;
            outline: none;
            margin-left: 10px;
            width: 100%;
            font-size: 14px;
            color: #1E293B;
          }
          .td-search-box-mobile input::placeholder {
            color: #64748B;
          }

          .td-mobile-filter-chips {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 8px;
          }
          .td-filter-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 18px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
            flex-shrink: 0;
            cursor: pointer;
            border: none;
            outline: none;
          }
          .td-chip-active-green {
            background: #1B5E20;
            color: #ffffff;
          }
          .td-chip-active-lightgreen {
            background: #DCFCE7;
            color: #166534;
          }
          .td-chip-soft {
            background: #F1F5F9;
            color: #334155;
          }

          .td-jobs-filters { display: none; }
          .td-desktop-showing { display: none; }
          .td-sort-by { display: none; }
          
          .td-mobile-showing {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 20px;
            margin-top: 12px;
          }
          .td-mobile-rec-info h3 {
            font-size: 18px;
            font-weight: 800;
            color: #1E293B;
            margin-bottom: 2px;
          }
          .td-mobile-rec-info span {
            font-size: 11px;
            font-weight: 800;
            color: #15803D;
            letter-spacing: 0.6px;
            text-transform: uppercase;
          }
          .td-mobile-saved-btn {
            background: #DCFCE7;
            color: #166534;
            border: none;
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
          }

          /* Job Cards list on Mobile */
          .td-feed-list {
            gap: 16px;
          }

          /* Standard Job Card on Mobile */
          .td-feed-card-standard {
            background: #fff;
            border-radius: 28px;
            padding: 22px 20px;
            border: 1px solid #EEF2F6;
            box-shadow: 0 4px 20px rgba(0,0,0,0.02);
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .td-feed-card-standard .td-fc-header {
            display: flex;
            gap: 14px;
            align-items: flex-start;
          }
          .td-feed-card-standard .td-fc-icon-wrapper {
            flex-shrink: 0;
          }
          .td-feed-card-standard .td-fc-icon {
            width: 46px;
            height: 46px;
            border-radius: 14px;
            background: #2D3748;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .td-feed-card-standard .td-fc-icon.td-bg-gold {
            background: #A38C52;
            color: #fff;
          }
          .td-feed-card-standard .td-fc-icon.td-bg-gray {
            background: #2E473F;
            color: #fff;
          }
          .td-feed-card-standard .td-fc-icon.td-bg-purple {
            background: #4A3A5A;
            color: #fff;
          }
          .td-feed-card-standard .td-fc-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2px;
          }
          .td-feed-card-standard .td-fc-title-row h3 {
            font-size: 15px;
            font-weight: 800;
            color: #1E293B;
            line-height: 1.3;
          }
          .td-feed-card-standard .td-bookmark-btn {
            color: #64748B;
            font-size: 16px;
            padding: 0;
            margin-left: 8px;
          }
          .td-feed-card-standard .td-fc-school {
            font-size: 12px;
            color: #64748B;
            font-weight: 500;
          }
          .td-feed-card-standard .td-fc-meta {
            margin-left: 0;
            margin-top: 0;
            display: flex;
            gap: 16px;
            align-items: center;
          }
          .td-feed-card-standard .td-fc-meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: #475569;
            font-weight: 600;
          }
          .td-feed-card-standard .td-fc-meta-tag {
            margin-left: auto;
            background: #F1F5F9;
            color: #15803D;
            font-size: 9px;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 6px;
            letter-spacing: 0.5px;
          }
          .td-feed-card-standard .td-fc-footer {
            margin-left: 0;
            margin-top: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .td-feed-card-standard .td-fc-salary {
            font-size: 18px;
            font-weight: 800;
            color: #15803D;
          }
          .td-feed-card-standard .td-fc-salary span {
            font-size: 11px;
            color: #64748B;
            font-weight: 500;
          }
          .td-feed-card-standard .td-fc-action {
            background: #1B5E20;
            color: #ffffff;
            border: none;
            padding: 10px 22px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
          }

          /* Hot Card on Mobile */
          .td-feed-card-hot {
            background: linear-gradient(135deg, #1B5E20 0%, #0F3E14 100%);
            color: white;
            border-radius: 28px;
            padding: 24px 20px;
            border: none;
            box-shadow: 0 10px 25px rgba(27, 94, 32, 0.25);
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .td-hot-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: center;
          }
          .td-hot-badge {
            background: rgba(255,255,255,0.18);
            font-size: 9px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 8px;
            letter-spacing: 0.6px;
            color: #fff;
          }
          .td-hot-time {
            font-size: 11px;
            color: rgba(255,255,255,0.8);
            font-weight: 500;
          }
          .td-hot-title {
            font-size: 18px;
            color: white;
            margin-bottom: 2px;
            font-weight: 800;
            line-height: 1.3;
          }
          .td-hot-school {
            color: rgba(255,255,255,0.8);
            font-size: 12px;
            font-weight: 500;
          }
          .td-feed-card-hot .td-dot { color: rgba(255,255,255,0.4); }
          .td-hot-salary-range {
            font-size: 9px;
            color: rgba(255,255,255,0.65);
            font-weight: 800;
            margin-top: 14px;
            margin-bottom: 2px;
            letter-spacing: 0.6px;
            text-transform: uppercase;
          }
          .td-hot-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .td-hot-salary-value {
            font-size: 18px;
            font-weight: 800;
            color: #fff;
          }
          .td-hot-action {
            background: #ffffff;
            color: #1B5E20;
            border: none;
            padding: 10px 24px;
            border-radius: 9999px;
            font-weight: 800;
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          /* Mobile helper classes & visibility */
          .td-mobile-stat-number { display: block; font-size: 26px; font-weight: 800; color: #1E293B; margin-bottom: 4px; line-height: 1; }
          .td-mobile-subtext { display: block; font-size: 11px; font-weight: 700; color: #22C55E; margin-top: 4px; }
          .td-mobile-subtext--gray { color: #64748B; }
          .td-mobile-icon { display: block; }
          .td-desktop-icon { display: none; }
          .td-desktop-stat-val { display: none; }
          .td-desktop-val-row { display: none; }
          .td-desktop-badge-col { display: none; }
          .td-mobile-text { display: inline; }
          .td-desktop-text { display: none; }

          /* Profile card: show mobile variant, hide desktop variant */
          .td-mobile-profile-strength { display: block; }
          .td-desktop-profile-strength { display: none; }
          .td-card-header { display: none; }

          /* Main wrapper */
          .td-main-wrapper { overflow: visible; }

          /* Content padding */
          .td-content { padding: 24px 20px; }

          /* Welcome */
          .td-welcome-header {
            margin-bottom: 24px;
            flex-direction: column;
            align-items: flex-start;
          }
          .td-welcome-header h1 { font-size: 28px; font-weight: 800; color: #1E293B; letter-spacing: -0.5px; margin-bottom: 4px; }
          .td-mobile-location {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 13px;
            color: #64748B;
            font-weight: 500;
          }

          /* Grid: single column on mobile */
          .td-grid-main {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .td-right-col { display: none; }

          /* Stats Row */
          .td-stats-row {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 32px;
          }
          .td-stats-row .td-profile-card {
            width: 100%;
          }
          .td-stats-mini-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            width: 100%;
          }
          .td-profile-card {
            border-radius: 28px;
            padding: 24px 22px;
            background: #fff;
            border: 1px solid #EEF2F6;
            box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          }
          .td-mobile-ps-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }
          .td-mobile-ps-label {
            font-size: 11px;
            font-weight: 700;
            color: #64748B;
            letter-spacing: 0.6px;
            margin-bottom: 4px;
          }
          .td-mobile-ps-value {
            font-size: 38px;
            font-weight: 800;
            color: #166534;
            line-height: 1;
          }
          .td-mobile-ps-icon {
            width: 44px;
            height: 44px;
            background: #DCFCE7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #15803D;
          }
          .td-profile-card .td-progress-bar {
            height: 8px;
            border-radius: 9999px;
            background: #F1F5F9;
            margin-bottom: 14px;
          }
          .td-profile-card .td-progress-fill {
            background: #22C55E;
            border-radius: 9999px;
          }
          .td-profile-card .td-card-hint {
            font-size: 12px;
            color: #475569;
            line-height: 1.4;
            margin-bottom: 0;
            font-weight: 500;
          }

          /* Mini cards on mobile */
          .td-mini-card {
            border-radius: 28px;
            padding: 20px 18px;
            background: #F8FAFC;
            border: none;
            box-shadow: none;
          }
          .td-mini-card--views::before,
          .td-mini-card--applied::before,
          .td-mini-card--pending::before {
            display: none;
          }
          .td-mini-icon-circle {
            width: 32px;
            height: 32px;
            background: transparent;
            box-shadow: none;
            margin-bottom: 12px;
            color: #166534;
          }
          .td-mini-card .td-mini-label {
            font-size: 10px;
            font-weight: 700;
            color: #64748B;
            letter-spacing: 0.5px;
            margin-bottom: 0;
          }

          /* Job Section */
          .td-jobs-section { margin-bottom: 24px; }
          .td-jobs-section h2 { font-size: 20px; font-weight: 800; color: #1E293B; letter-spacing: -0.3px; }
          .td-view-all-link { font-size: 12px; color: #166534; font-weight: 700; }

          /* Job cards: left green border accent */
          .td-job-item {
            border-radius: 20px;
            padding: 18px 16px;
            background: #fff;
            border: none;
            border-left: 3.5px solid #22C55E;
            box-shadow: 0 4px 16px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
          }
          .td-job-header-row {
            display: flex;
            gap: 14px;
            align-items: center;
          }
          .td-job-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #F8F3E6;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 0;
          }
          .td-job-avatar--school {
            background: #F1F5F9;
          }
          .td-job-title-line h3 {
            font-size: 14px;
            font-weight: 800;
            color: #1E293B;
            line-height: 1.3;
            margin-bottom: 2px;
          }
          .td-job-school {
            font-size: 12px;
            color: #64748B;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .td-job-tags.td-desktop-tags { display: none; }
          .td-job-tags.td-mobile-only-tags {
            display: flex;
            gap: 6px;
          }
          .td-mobile-tag--green {
            background: #DCFCE7 !important;
            color: #166534 !important;
            font-size: 9px !important;
            font-weight: 800 !important;
            padding: 4px 8px !important;
            border-radius: 6px !important;
          }
          .td-mobile-tag--gray {
            background: #F1F5F9 !important;
            color: #475569 !important;
            font-size: 9px !important;
            font-weight: 800 !important;
            padding: 4px 8px !important;
            border-radius: 6px !important;
          }
          .td-job-footer { display: none; }

          /* Mobile CTA Card */
          .td-mobile-cta-card {
            background: #86EFAC;
            border-radius: 24px;
            padding: 24px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-top: 12px;
          }
          .td-mobile-cta-text h3 {
            font-size: 16px;
            font-weight: 800;
            color: #0F172A;
            margin-bottom: 6px;
            line-height: 1.25;
          }
          .td-mobile-cta-text p {
            font-size: 11px;
            color: #166534;
            line-height: 1.35;
            font-weight: 500;
          }
          .td-mobile-cta-btn {
            background: #1E1B4B;
            color: #fff;
            border: none;
            padding: 10px 16px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.4px;
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
          padding: 24px 32px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .td-jd-back-nav {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #64748B;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: color 0.2s;
        }
        .td-jd-back-nav:hover { color: #22C55E; }

        .td-jd-content-wrapper {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: start;
        }

        .td-jd-main {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .td-jd-badge-row {
          margin-bottom: 4px;
        }
        .td-jd-featured-tag {
          display: inline-block;
          background: #DCFCE7;
          color: #166534;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 8px;
          letter-spacing: 0.3px;
        }

        .td-jd-header-block {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .td-jd-logo-placeholder {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: #F8F9FA;
          border: 1px solid #E9ECEF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          color: #ADB5BD;
          overflow: hidden;
        }
        .td-jd-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .td-jd-header-text h1 {
          font-size: 34px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 4px;
          line-height: 1.15;
          letter-spacing: -0.8px;
        }
        .td-jd-header-text p {
          font-size: 15px;
          color: #475569;
          font-weight: 600;
        }

        .td-jd-info-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
        }
        .td-jd-pill {
          background: #F1F5F9;
          border-radius: 16px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 120px;
        }
        .td-jd-pill-icon {
          color: #15803D;
          font-size: 16px;
          display: flex;
          align-items: center;
        }
        .td-jd-pill-text {
          display: flex;
          flex-direction: column;
        }
        .td-jd-pill-text span {
          font-size: 9px;
          color: #64748B;
          text-transform: uppercase;
          font-weight: 800;
          margin-bottom: 1px;
          letter-spacing: 0.5px;
        }
        .td-jd-pill-text strong {
          font-size: 13px;
          color: #0F172A;
          font-weight: 800;
        }

        .td-jd-section h2 {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .td-jd-green-dash {
          display: inline-block;
          width: 20px;
          height: 3px;
          background: #22C55E;
          border-radius: 2px;
        }
        .td-jd-text-content {
          font-size: 14px;
          color: #475569;
          line-height: 1.7;
          font-weight: 500;
        }
        .td-jd-text-content p {
          margin-bottom: 16px;
        }

        .td-jd-card-section {
          background: #fff;
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.015);
          border: 1px solid #F1F5F9;
        }
        .td-jd-card-section h2 {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
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
          color: #475569;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .td-jd-check-circle-wrapper {
          color: #22C55E;
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 1px;
          display: flex;
          align-items: center;
        }
        .td-jd-check-icon {
          stroke-width: 2.5;
        }

        .td-jd-req-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .td-jd-req-card {
          background: #fff;
          border-radius: 28px;
          padding: 28px 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.015);
          border: 1px solid #EEF2F6;
        }
        .td-jd-req-essential {
          color: #15803D;
          font-weight: 800;
          font-size: 16px;
          margin-bottom: 16px;
        }
        .td-jd-req-desirable {
          color: #15803D;
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

        /* ── Right Sidebar ── */
        .td-jd-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: 24px;
        }

        .td-jd-apply-card {
          background: #FFFFFF;
          border-radius: 44px;
          padding: 44px 34px 36px;
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.03);
          border: 1px solid #F1F4F8;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .td-jd-deadline {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 26px;
        }
        .td-jd-deadline span {
          font-size: 13px;
          font-weight: 700;
          color: #8C96A6;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .td-jd-deadline strong {
          font-size: 24px;
          font-weight: 800;
          color: #BF360C;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }

        .td-jd-apply-btn {
          width: 100%;
          background: #20D051;
          color: #FFFFFF;
          border: none;
          padding: 16px 24px;
          border-radius: 9999px;
          font-size: 16.5px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(32, 208, 81, 0.38);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .td-jd-apply-btn:hover {
          background: #1BBF48;
          box-shadow: 0 12px 28px rgba(32, 208, 81, 0.45);
        }

        .td-jd-save-btn {
          width: 100%;
          background: #DFE3E8;
          color: #1E293B;
          border: none;
          padding: 16px 24px;
          border-radius: 9999px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s ease;
        }
        .td-jd-save-btn:hover {
          background: #D3D8DF;
        }
        .td-jd-save-btn--saved {
          background: #DCFCE7 !important;
          color: #166534 !important;
        }
        .td-jd-save-btn--saved:hover {
          background: #BBF7D0 !important;
        }

        .td-jd-share {
          margin-top: 26px;
          padding-top: 22px;
          border-top: 1px solid #F1F4F8;
          text-align: center;
        }
        .td-jd-share span {
          display: block;
          font-size: 13.5px;
          color: #64748B;
          font-weight: 500;
          margin-bottom: 16px;
        }
        .td-jd-share-icons {
          display: flex;
          justify-content: center;
          gap: 14px;
        }
        .td-jd-share-icon-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #F1F4F8;
          border: none;
          color: #15803D;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .td-jd-share-icon-btn:hover {
          background: #E2E8F0;
          color: #166534;
        }

        .td-jd-verified-card {
          background: #EFF5ED;
          border-radius: 36px;
          padding: 26px 28px 28px;
          text-align: left;
        }
        .td-jd-vc-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }
        .td-jd-vc-badge-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .td-jd-vc-titles {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
          font-size: 16px;
          font-weight: 800;
          color: #166534;
        }
        .td-jd-verified-card p {
          font-size: 13.5px;
          color: #556272;
          line-height: 1.55;
          margin: 0;
          font-weight: 400;
        }

        .td-jd-help-card {
          display: none;
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
        .td-desktop-only {
          /* default visible */
        }
        .td-mobile-only {
          display: none !important;
        }

        /* ═══════════════════════════════════════
           NOTIFICATIONS PAGE
        ═══════════════════════════════════════ */
        .td-notif-page {
          max-width: 820px;
          margin: 0 auto;
          width: 100%;
        }

        .td-notif-header {
          margin-bottom: 28px;
        }
        .td-notif-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .td-notif-header p {
          color: #6C757D;
          font-size: 14px;
          margin: 0;
        }

        .td-notif-filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .td-notif-filter-btn {
          padding: 8px 20px;
          border-radius: 999px;
          border: 1px solid #E9ECEF;
          background: #fff;
          color: #495057;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .td-notif-filter-btn:hover {
          border-color: #1CCB43;
          color: #1CCB43;
        }
        .td-notif-filter-btn--active {
          background: #1CCB43;
          color: #fff;
          border-color: #1CCB43;
        }
        .td-notif-filter-btn--active:hover {
          background: #17b53b;
          color: #fff;
        }

        .td-notif-section-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          color: #ADB5BD;
          font-weight: 700;
          margin-bottom: 16px;
          padding-left: 4px;
        }

        .td-notif-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .td-notif-card {
          display: flex;
          gap: 24px;
          padding: 32px 40px;
          background: #fff;
          border: none;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
          transition: background 0.2s, box-shadow 0.2s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .td-notif-card:hover {
          background: #fff;
          box-shadow: 0 8px 30px rgba(0,0,0,0.035);
        }
        .td-notif-card--unread {
          background: #fff;
        }
        .td-notif-card--unread::before {
          content: '';
          position: absolute;
          left: 0;
          top: 24px;
          bottom: 24px;
          width: 5px;
          background: #277A16;
          border-radius: 0 4px 4px 0;
        }
        .td-notif-card--unread:hover {
          background: #fff;
        }

        .td-notif-card-icon {
          flex-shrink: 0;
          padding-top: 2px;
        }
        .td-notif-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E8F9ED;
          color: #1CCB43;
          border: 1px solid #C3E6CB;
        }
        .td-notif-icon--job {
          /* unified circular styles matching design */
        }
        .td-notif-icon--message {
          /* unified circular styles matching design */
        }
        .td-notif-icon--account {
          /* unified circular styles matching design */
        }

        .td-notif-card-body {
          flex: 1;
          min-width: 0;
        }
        .td-notif-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 4px;
        }
        .td-notif-card-top h3 {
          font-size: 15px;
          font-weight: 700;
          color: #111;
          margin: 0;
          line-height: 1.4;
        }
        .td-notif-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .td-notif-time {
          font-size: 12px;
          color: #ADB5BD;
          white-space: nowrap;
        }
        .td-notif-new-badge {
          font-size: 11px;
          font-weight: 800;
          color: #1CCB43;
          background: #E8F9ED;
          padding: 3px 10px;
          border-radius: 999px;
          letter-spacing: 0.05em;
        }

        .td-notif-card-desc {
          font-size: 13.5px;
          color: #6C757D;
          line-height: 1.6;
          margin: 0 0 10px;
        }

        .td-notif-card-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .td-notif-time-mobile {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #ADB5BD;
        }
        .td-notif-link {
          font-size: 13px;
          font-weight: 700;
          color: #1CCB43;
          text-decoration: none;
        }
        .td-notif-link:hover {
          text-decoration: underline;
        }

        .td-notif-btn {
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .td-notif-btn--primary {
          background: #1CCB43;
          color: #fff;
        }
        .td-notif-btn--primary:hover {
          background: #17b53b;
        }
        .td-notif-btn--outline {
          background: #F1F3F5;
          color: #495057;
          border: 1px solid #DEE2E6;
        }
        .td-notif-btn--outline:hover {
          background: #E9ECEF;
        }

        .td-notif-empty {
          text-align: center;
          padding: 60px 20px;
          color: #ADB5BD;
        }
        .td-notif-empty p {
          margin-top: 16px;
          font-size: 14px;
        }

        .td-notif-footer {
          text-align: center;
          padding: 32px 0 8px;
        }
        .td-notif-count {
          font-size: 13px;
          color: #ADB5BD;
          margin-bottom: 12px;
          font-style: italic;
        }
        .td-notif-load-more {
          padding: 10px 32px;
          border-radius: 10px;
          border: 1px solid #DEE2E6;
          background: #fff;
          color: #111;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .td-notif-load-more:hover {
          border-color: #1CCB43;
          color: #1CCB43;
        }

        /* Custom mobile topbar for notifications */
        .td-mobile-notif-topbar {
          display: none;
        }

        @media (max-width: 768px) {
          .td-desktop-only {
            display: none !important;
          }
          .td-mobile-only {
            display: block !important;
          }
          .td-mobile-notif-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 20px;
            background: #fff;
            border-bottom: 1px solid #F1F3F5;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .td-mobile-back-btn {
            background: none;
            border: none;
            color: #111;
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 4px;
          }
          .td-mobile-notif-title {
            font-size: 18px;
            font-weight: 800;
            color: #111;
          }

          .td-notif-page {
            padding: 16px 12px;
          }
          .td-notif-mobile-section-label {
            font-size: 18px;
            font-weight: 800;
            color: #111;
            margin-bottom: 16px;
            margin-top: 8px;
            padding-left: 4px;
          }

          .td-notif-list {
            gap: 16px;
          }
          .td-notif-card {
            background: #fff;
            border-radius: 28px !important;
            border: none !important;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.035);
            padding: 24px;
            margin-bottom: 0;
            display: flex;
            gap: 16px;
          }
          .td-notif-card--unread {
            background: #fff;
            border-left: none; /* simple uniform cards on mobile matching design */
          }

          .td-notif-icon-circle {
            background: #1CCB43 !important;
            color: #fff !important;
            border-radius: 50% !important;
            width: 38px;
            height: 38px;
          }

          .td-notif-card-body {
            display: flex;
            flex-direction: column;
          }
          .td-notif-card-top h3 {
            font-size: 16px;
            font-weight: 800;
            color: #111;
            line-height: 1.4;
          }
          .td-notif-card-meta {
            display: none;
          }
          .td-notif-card-desc {
            font-size: 13.5px;
            color: #495057;
            line-height: 1.6;
            margin-top: 6px;
            margin-bottom: 16px;
          }

          .td-mobile-action-row {
            display: flex !important;
            justify-content: space-between;
            width: 100%;
            align-items: center;
          }
          .td-notif-mobile-link {
            font-size: 14px;
            font-weight: 700;
            color: #1CCB43;
            cursor: pointer;
          }
          .td-notif-mobile-time {
            font-size: 13px;
            color: #ADB5BD;
          }

          /* Active bottomnav tab icon styling (image match) */
          .td-bottomnav-tab--active .td-bottomnav-icon-wrapper {
            background: #E8F9ED;
            width: 56px;
            height: 32px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2px;
          }
          .td-bottomnav-tab .td-bottomnav-icon-wrapper {
            width: 56px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2px;
          }
          .td-bottomnav-tab .td-bottomnav-icon {
            color: #ADB5BD;
            font-size: 20px;
          }
          .td-bottomnav-tab--active .td-bottomnav-icon {
            color: #1CCB43;
          }
          .td-bottomnav-label {
            font-size: 9px;
            font-weight: 700;
            color: #ADB5BD;
          }
          .td-bottomnav-tab--active .td-bottomnav-label {
            color: #1CCB43;
            font-weight: 800;
          }
          }
        }

        /* ═══════════════════════════════════════
           APPLICATIONS TAB
        ═══════════════════════════════════════ */
        .td-app-page {
          padding: 32px;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }
        .td-app-header {
          margin-bottom: 32px;
        }
        .td-app-header h1 {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          margin-bottom: 8px;
        }
        .td-app-header p {
          color: #6C757D;
          font-size: 15px;
        }
        .td-app-highlight {
          color: #1CCB43;
          font-weight: 700;
        }
        .td-app-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .td-app-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 20px;
          border: 1px solid #E9ECEF;
        }
        .td-app-card-left {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .td-app-icon-wrapper {
          width: 50px;
          height: 50px;
          background: #E8F9ED;
          color: #1CCB43;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .td-app-content {
          flex: 1;
        }
        .td-app-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }
        .td-app-title-row h3 {
          font-size: 18px;
          font-weight: 800;
          color: #111;
          margin: 0;
        }
        .td-app-status-badge {
          background: #E8F9ED;
          color: #1CCB43;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 12px;
        }
        .td-app-school {
          color: #495057;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .td-app-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .td-app-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .td-app-tag--primary {
          background: #E8F9ED;
          color: #1CCB43;
        }
        .td-app-tag--secondary {
          background: #F1F3F5;
          color: #495057;
        }
        .td-app-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px dashed #E9ECEF;
          padding-top: 16px;
        }
        .td-app-footer-left {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .td-app-date, .td-app-expires, .td-app-urgent {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
        }
        .td-app-date { color: #6C757D; }
        .td-app-expires { color: #6C757D; }
        .td-app-urgent { color: #FF4757; }
        
        .td-app-action-btn {
          color: #1CCB43;
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .td-app-action-btn:hover {
          color: #17B238;
        }

        @media (max-width: 768px) {
          .td-app-page {
            padding: 16px;
            padding-bottom: 90px;
          }
          .td-app-header h1 {
            font-size: 24px;
          }
          .td-app-mobile-stats {
            display: flex !important;
            gap: 16px;
            margin-bottom: 24px;
            width: 100%;
          }
          .td-app-stat-card {
            flex: 1;
            border-radius: 20px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          }
          .td-app-stat-white {
            background: #fff;
            border: 1px solid #E9ECEF;
          }
          .td-app-stat-green {
            background: #1CCB43;
            color: #fff;
          }
          .td-app-stat-icon-wrapper {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .td-app-stat-white .td-app-stat-icon-wrapper {
            background: #1CCB43;
            color: #fff;
          }
          .td-app-stat-green .td-app-stat-icon-wrapper {
            background: rgba(255,255,255,0.3);
            color: #111;
          }
          .td-app-stat-card h2 {
            font-size: 32px;
            font-weight: 800;
            margin: 0;
            line-height: 1;
          }
          .td-app-stat-white h2 { color: #111; }
          .td-app-stat-card span {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .td-app-stat-white span { color: #6C757D; }

          .td-app-card {
            position: relative;
            padding: 20px;
          }
          .td-app-card-left {
            flex-direction: column;
            gap: 12px;
          }
          .td-app-title-row {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
          .td-app-status-badge {
            position: absolute;
            top: 20px;
            right: 20px;
          }
          .td-app-card-footer {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .td-app-footer-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .td-app-status-badge--withdrawn {
            background: #E9ECEF !important;
            color: #6C757D !important;
          }
          .td-app-date, .td-app-expires, .td-app-urgent {
            font-size: 11px;
          }
          .td-app-action-btn {
            font-size: 13px;
          }
        }

        /* ═══════════════════════════════════════
           SETTINGS PAGE
        ═══════════════════════════════════════ */
        .td-settings-page {
          padding: 32px;
          width: 100%;
        }
        .td-settings-title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          margin-bottom: 28px;
        }

        /* ── Category Grid ── */
        .td-settings-category-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 640px;
        }
        .td-settings-category-card {
          display: flex;
          align-items: center;
          gap: 18px;
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 16px;
          padding: 20px 24px;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .td-settings-category-card:hover {
          border-color: #10b981;
        }
        .td-settings-cat-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .td-settings-cat-icon--teal  { background: #E6FAF5; color: #10b981; }
        .td-settings-cat-icon--blue  { background: #EBF4FF; color: #3B82F6; }
        .td-settings-cat-icon--orange{ background: #FFF4E6; color: #F59E0B; }
        .td-settings-cat-icon--purple{ background: #F3F0FF; color: #8B5CF6; }
        .td-settings-cat-text {
          flex: 1;
        }
        .td-settings-cat-text h3 {
          font-size: 16px;
          font-weight: 700;
          color: #111;
          margin: 0 0 4px 0;
        }
        .td-settings-cat-text p {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
        }
        .td-settings-cat-arrow {
          color: #9CA3AF;
          flex-shrink: 0;
        }

        /* ── Subtab wrapper ── */
        .td-settings-subtab-wrap {
          width: 100%;
        }
        .td-settings-breadcrumb-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          margin-bottom: 20px;
          transition: color 0.15s;
        }
        .td-settings-breadcrumb-btn:hover { color: #10b981; }

        /* ── Account Settings Subtab ── */
        .td-accs-wrap {
          width: 100%;
          max-width: 760px;
        }
        .td-accs-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.15s;
        }
        .td-accs-breadcrumb:hover { color: #10b981; }
        .td-accs-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
        }
        .td-accs-title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .td-accs-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }
        .td-accs-deco-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #E6FAF5;
          flex-shrink: 0;
          margin-left: 16px;
          margin-top: -20px;
        }
        .td-accs-menu-card {
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .td-accs-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .td-accs-row:hover { background: #F9FAFB; }
        .td-accs-row-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .td-accs-icon--green {
          background: #E6FAF5;
          color: #10b981;
        }
        .td-accs-row-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .td-accs-row-title {
          font-size: 15px;
          font-weight: 600;
          color: #111;
        }
        .td-accs-row-sub {
          font-size: 13px;
          color: #6B7280;
          line-height: 1.4;
        }
        .td-accs-row-arrow {
          color: #9CA3AF;
          flex-shrink: 0;
        }
        .td-accs-divider {
          height: 1px;
          background: #F3F4F6;
          margin: 0 24px;
        }
        .td-accs-info-card {
          background: #F0F4FF;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .td-accs-info-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E6FAF5;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .td-accs-info-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #111;
          margin: 0 0 5px 0;
        }
        .td-accs-info-text {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
          line-height: 1.55;
        }

        /* ── Privacy & Profile Visibility Subtab ── */
        .td-privacy-wrap {
          width: 100%;
          max-width: 860px;
        }
        .td-privacy-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #111827;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.15s;
        }
        .td-privacy-breadcrumb:hover { color: #10b981; }
        .td-privacy-header {
          margin-bottom: 24px;
        }
        .td-privacy-title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .td-privacy-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }
        .td-privacy-top-grid {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 18px;
          margin-bottom: 24px;
        }
        @media (max-width: 860px) {
          .td-privacy-top-grid {
            grid-template-columns: 1fr;
          }
        }
        .td-privacy-card {
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 18px;
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
        }
        .td-privacy-discover-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .td-privacy-card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .td-privacy-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .td-privacy-icon--darkgreen {
          color: #005A36;
        }
        .td-privacy-card-heading {
          font-size: 16.5px;
          font-weight: 700;
          color: #111;
          margin: 0;
        }
        .td-privacy-badge-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #EEF7FF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: -6px;
          margin-right: -6px;
        }
        .td-privacy-check-icon {
          color: #15803D;
        }
        .td-privacy-card-desc {
          font-size: 13.5px;
          color: #6B7280;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }
        .td-privacy-status-box {
          background: #EEF4FF;
          border-radius: 12px;
          padding: 13px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: auto;
        }
        .td-privacy-status-icon {
          color: #4B5563;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .td-privacy-status-text {
          font-size: 13px;
          color: #374151;
          line-height: 1.45;
        }
        .td-privacy-status-text strong {
          color: #111;
          font-weight: 700;
        }
        .td-privacy-view-btn {
          width: 100%;
          border: 1.5px solid #111827;
          background: transparent;
          border-radius: 50px;
          padding: 10px 16px;
          font-size: 13.5px;
          font-weight: 600;
          color: #111;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: auto;
          text-align: center;
        }
        .td-privacy-view-btn:hover {
          background: #111827;
          color: #fff;
        }
        .td-privacy-controls-card {
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 18px;
          padding: 24px;
        }
        .td-privacy-controls-title {
          font-size: 19px;
          font-weight: 700;
          color: #111;
          margin: 0 0 18px 0;
        }
        .td-privacy-divider {
          height: 1px;
          background: #F3F4F6;
          margin: 0 0 20px 0;
        }
        .td-privacy-controls-subtitle {
          font-size: 14.5px;
          font-weight: 600;
          color: #111;
          margin: 0 0 6px 0;
        }
        .td-privacy-controls-hint {
          font-size: 13.5px;
          color: #6B7280;
          margin: 0 0 18px 0;
        }
        .td-privacy-options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .td-privacy-option-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          border-radius: 14px;
          border: 1.5px solid #E5E7EB;
          background: #fff;
          cursor: pointer;
          transition: all 0.18s;
        }
        .td-privacy-option-card:hover {
          border-color: #CBD5E1;
        }
        .td-privacy-option-card--active {
          border-color: #005A36;
          background: #F0F6FF;
        }
        .td-privacy-option-icon {
          color: #005A36;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .td-privacy-option-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .td-privacy-option-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .td-privacy-option-title {
          font-size: 15px;
          font-weight: 600;
          color: #111;
        }
        .td-privacy-rec-pill {
          background: #E6F7F0;
          color: #0D9488;
          font-size: 10.5px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 50px;
          letter-spacing: 0.4px;
        }
        .td-privacy-option-desc {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
          line-height: 1.45;
        }

        /* ── Security & Login Activity Subtab ── */
        .td-sec-wrap {
          width: 100%;
          max-width: 860px;
        }
        .td-sec-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #111827;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.15s;
        }
        .td-sec-breadcrumb:hover { color: #10b981; }
        .td-sec-top-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .td-sec-top-title {
          font-size: 26px;
          font-weight: 800;
          color: #111;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .td-sec-top-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }
        .td-sec-deco-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #E6FAF5;
          flex-shrink: 0;
          margin-left: 16px;
          margin-top: -20px;
        }
        .td-sec-pwd-card {
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.02);
        }
        .td-sec-pwd-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .td-sec-pwd-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .td-sec-pwd-icon {
          color: #6B7280;
        }
        .td-sec-pwd-title {
          font-size: 14.5px;
          font-weight: 600;
          color: #111;
        }
        .td-sec-pwd-dots {
          font-size: 18px;
          letter-spacing: 2px;
          color: #374151;
          font-weight: 700;
          line-height: 1.2;
        }
        .td-sec-pwd-last {
          font-size: 12.5px;
          color: #9CA3AF;
        }
        .td-sec-btn {
          padding: 10px 22px;
          border-radius: 50px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.18s;
        }
        .td-sec-btn--green {
          background: #15803D;
          color: #fff;
        }
        .td-sec-btn--green:hover {
          background: #166534;
        }
        .td-sec-btn--darkgreen {
          background: #004D2C;
          color: #fff;
          padding: 11px 24px;
        }
        .td-sec-btn--darkgreen:hover {
          background: #003B22;
        }
        .td-sec-info-banner {
          background: #F0F4FF;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 32px;
        }
        .td-sec-info-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E6FAF5;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .td-sec-info-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #111;
          margin: 0 0 4px 0;
        }
        .td-sec-info-desc {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }
        .td-sec-section-spacer {
          height: 8px;
          margin-bottom: 24px;
        }
        .td-sec-main-header {
          margin-bottom: 20px;
        }
        .td-sec-main-title {
          font-size: 26px;
          font-weight: 800;
          color: #111;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .td-sec-main-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }
        .td-sec-auth-card {
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 18px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .td-sec-watermark-lock {
          position: absolute;
          right: 28px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.08;
          color: #111;
          pointer-events: none;
        }
        .td-sec-card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .td-sec-green-icon {
          color: #005A36;
          display: flex;
          align-items: center;
        }
        .td-sec-card-heading {
          font-size: 17px;
          font-weight: 700;
          color: #111;
          margin: 0;
        }
        .td-sec-auth-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .td-sec-auth-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .td-sec-col-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #9CA3AF;
          letter-spacing: 0.5px;
        }
        .td-sec-col-value {
          font-size: 16px;
          font-weight: 700;
          color: #111;
        }
        .td-sec-col-hint {
          font-size: 12.5px;
          color: #6B7280;
        }
        .td-sec-2fa-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #FEE2E2;
          color: #DC2626;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 50px;
          width: fit-content;
          margin-top: 2px;
        }
        .td-sec-card {
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .td-sec-devices-icon {
          color: #005A36;
          display: flex;
          align-items: center;
        }
        .td-sec-sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .td-sec-session-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 14px;
          border: 1px solid #E5E7EB;
          background: #fff;
        }
        .td-sec-session-item--current {
          background: #F0F6FF;
          border-color: #E0E7FF;
        }
        .td-sec-session-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #EFF6FF;
          color: #2563EB;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .td-sec-session-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .td-sec-session-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .td-sec-session-name {
          font-size: 14.5px;
          font-weight: 600;
          color: #111;
        }
        .td-sec-curr-badge {
          background: #004D2C;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 50px;
          letter-spacing: 0.4px;
        }
        .td-sec-session-ip {
          font-size: 12.5px;
          color: #6B7280;
        }
        .td-sec-session-status {
          font-size: 12px;
          color: #9CA3AF;
        }
        .td-sec-signout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #DC2626;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .td-sec-signout-btn:hover {
          background: #FEE2E2;
        }
        .td-sec-recent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .td-sec-view-log-btn {
          background: none;
          border: none;
          color: #111827;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }
        .td-sec-timeline {
          display: flex;
          flex-direction: column;
          position: relative;
          padding-left: 8px;
        }
        .td-sec-timeline-item {
          display: flex;
          align-items: flex-start;
          position: relative;
          padding-bottom: 24px;
          padding-left: 24px;
          border-left: 2px solid #E5E7EB;
          margin-left: 6px;
        }
        .td-sec-timeline-item--last {
          border-left-color: transparent;
          padding-bottom: 0;
        }
        .td-sec-timeline-dot {
          position: absolute;
          left: -7px;
          top: 3px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #10B981;
        }
        .td-sec-dot--green {
          border-color: #10B981;
        }
        .td-sec-dot--red {
          border-color: #DC2626;
        }
        .td-sec-timeline-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .td-sec-log-title {
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }
        .td-sec-log-title--red {
          color: #DC2626;
        }
        .td-sec-log-device {
          font-size: 12.5px;
          color: #4B5563;
        }
        .td-sec-log-location {
          font-size: 12px;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .td-sec-timeline-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .td-sec-log-time {
          font-size: 12px;
          color: #6B7280;
        }
        .td-sec-ip-pill {
          background: #F1F5F9;
          color: #475569;
          font-size: 11.5px;
          font-family: monospace;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .td-sec-ip-pill--red {
          background: #FEE2E2;
          color: #DC2626;
        }

        /* ── Legal Subtab ── */
        .td-legal-wrap {
          width: 100%;
          max-width: 860px;
        }
        .td-legal-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #111827;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.15s;
        }
        .td-legal-breadcrumb:hover { color: #10b981; }
        .td-legal-header {
          margin-bottom: 28px;
        }
        .td-legal-title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }
        .td-legal-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
          line-height: 1.55;
        }
        .td-legal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }
        @media (max-width: 860px) {
          .td-legal-grid {
            grid-template-columns: 1fr;
          }
        }
        .td-legal-card {
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 18px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .td-legal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.05);
        }
        .td-legal-card-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #EEF7FF;
          color: #005A36;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          flex-shrink: 0;
        }
        .td-legal-card-title {
          font-size: 17px;
          font-weight: 700;
          color: #111;
          margin: 0 0 10px 0;
        }
        .td-legal-card-desc {
          font-size: 13px;
          color: #6B7280;
          line-height: 1.5;
          margin: 0 0 20px 0;
          flex: 1;
        }
        .td-legal-card-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #005A36;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          margin-top: auto;
          width: fit-content;
          transition: gap 0.15s;
        }
        .td-legal-card-link:hover {
          gap: 9px;
        }
        .td-legal-help-banner {
          background: #F0F4FF;
          border: 1px solid #E0E7FF;
          border-radius: 16px;
          padding: 22px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .td-legal-help-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .td-legal-help-title {
          font-size: 16.5px;
          font-weight: 700;
          color: #111;
          margin: 0;
        }
        .td-legal-help-desc {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
        }
        .td-legal-contact-btn {
          border: 1.5px solid #111827;
          background: transparent;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 13.5px;
          font-weight: 600;
          color: #111;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .td-legal-contact-btn:hover {
          background: #111827;
          color: #fff;
        }
        .td-settings-subtab-placeholder {
          background: #fff;
          border: 2px dashed #E5E7EB;
          border-radius: 16px;
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #9CA3AF;
          font-size: 15px;
          max-width: 640px;
        }
        .td-settings-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .td-settings-left,
        .td-settings-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .td-settings-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #E9ECEF;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .td-settings-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .td-settings-card-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .td-settings-card-title h2 {
          font-size: 17px;
          font-weight: 700;
          color: #111;
          margin: 0;
        }
        .td-settings-card-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .td-settings-card-icon--green {
          background: #E8F9ED;
          color: #1CCB43;
        }
        .td-settings-card-icon--red {
          background: #FFE8E8;
          color: #DC3545;
        }
        .td-settings-badge {
          background: #E8F9ED;
          color: #1CCB43;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid #c3f0d0;
        }

        /* Profile row */
        .td-settings-profile-row {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        .td-settings-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .td-settings-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #E8F9ED;
        }
        .td-settings-avatar-edit {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1CCB43;
          border: 2px solid #fff;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 11px;
        }
        .td-settings-profile-fields {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .td-settings-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: #ADB5BD;
          letter-spacing: 0.8px;
          margin-bottom: 4px;
        }
        .td-settings-input {
          width: 100%;
          border: 1px solid #E9ECEF;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: #111;
          background: #F8F9FA;
          outline: none;
          transition: 0.2s;
          font-family: inherit;
        }
        .td-settings-input:focus {
          border-color: #1CCB43;
          background: #fff;
        }
        .td-settings-input--no-border {
          border: none;
          background: transparent;
          flex: 1;
          padding: 0;
        }
        .td-settings-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Academic Credentials */
        .td-settings-credential-row {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #F8F9FA;
          border-radius: 12px;
          border-left: 4px solid #1CCB43;
          padding: 14px;
          margin-bottom: 16px;
        }
        .td-settings-cred-icon {
          color: #1CCB43;
          flex-shrink: 0;
        }
        .td-settings-cred-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .td-settings-cred-info strong {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }
        .td-settings-cred-info span {
          font-size: 12px;
          color: #6C757D;
        }
        .td-settings-replace-btn {
          background: none;
          border: none;
          color: #1CCB43;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .td-settings-degree-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .td-settings-degree-card {
          background: #F8F9FA;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .td-settings-degree-label {
          font-size: 9px;
          font-weight: 700;
          color: #ADB5BD;
          letter-spacing: 0.8px;
        }
        .td-settings-degree-card strong {
          font-size: 13px;
          font-weight: 700;
          color: #111;
        }
        .td-settings-degree-school {
          font-size: 12px;
          color: #6C757D;
        }
        .td-settings-subjects {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .td-settings-subject-tag {
          background: #E8F9ED;
          color: #1CCB43;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 8px;
        }
        .td-settings-subject-add {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px dashed #ADB5BD;
          background: none;
          color: #ADB5BD;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          line-height: 1;
        }

        /* Account Security */
        .td-settings-security-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid #F1F3F5;
        }
        .td-settings-security-item:last-child { border-bottom: none; }
        .td-settings-security-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .td-settings-security-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #F1F3F5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6C757D;
        }
        .td-settings-security-left strong {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }
        .td-settings-security-sub {
          font-size: 12px;
          color: #ADB5BD;
        }
        .td-settings-reset-btn {
          background: #DC3545;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .td-settings-reset-btn:hover { background: #c82333; }

        /* Toggle switch */
        .td-settings-toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: #DEE2E6;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
          padding: 0;
        }
        .td-settings-toggle--on { background: #1CCB43; }
        .td-settings-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: left 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          display: block;
        }
        .td-settings-toggle--on .td-settings-toggle-thumb { left: 23px; }

        /* Job Preferences */
        .td-settings-engagement-tabs {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }
        .td-settings-eng-tab {
          padding: 7px 16px;
          border-radius: 20px;
          border: 1.5px solid #E9ECEF;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #495057;
          cursor: pointer;
          transition: 0.2s;
        }
        .td-settings-eng-tab--active {
          border-color: #1CCB43;
          color: #1CCB43;
          background: #E8F9ED;
        }
        .td-settings-location-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1.5px solid #E9ECEF;
          border-radius: 10px;
          padding: 10px 14px;
          margin-top: 8px;
          font-size: 14px;
          color: #111;
          background: #fff;
        }
        .td-settings-location-chip > svg { color: #ADB5BD; }
        .td-settings-location-chip span { flex: 1; }
        .td-settings-chip-remove {
          background: none;
          border: none;
          color: #ADB5BD;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          padding: 0;
        }
        .td-settings-add-city {
          display: block;
          width: 100%;
          margin-top: 8px;
          border: 1.5px dashed #ADB5BD;
          border-radius: 10px;
          padding: 10px;
          background: none;
          color: #6C757D;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          transition: 0.2s;
        }
        .td-settings-add-city:hover { border-color: #1CCB43; color: #1CCB43; }
        .td-settings-salary-input {
          display: flex;
          align-items: center;
          border: 1.5px solid #E9ECEF;
          border-radius: 10px;
          padding: 10px 14px;
          background: #F8F9FA;
          margin-top: 6px;
          gap: 8px;
        }
        .td-settings-salary-icon {
          font-size: 15px;
          color: #6C757D;
          font-weight: 700;
        }
        .td-settings-salary-hint {
          font-size: 12px;
          color: #6C757D;
          margin-top: 8px;
        }
        .td-settings-save-btn {
          width: 100%;
          margin-top: 20px;
          background: #1CCB43;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
        }

        /* Notification section */
        .td-settings-notif-section-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: #ADB5BD;
          letter-spacing: 0.8px;
          margin: 12px 0 6px;
        }
        .td-settings-notif-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #F1F3F5;
          font-size: 14px;
          color: #111;
        }
        .td-settings-notif-row:last-child { border-bottom: none; }
        .td-settings-notif-row--muted { color: #ADB5BD; }

        /* Help card */
        .td-settings-help-card {
          background: #1A6B2F;
          border-radius: 20px;
          padding: 24px;
          color: #fff;
        }
        .td-settings-help-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .td-settings-help-card p {
          font-size: 13px;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 20px;
        }
        .td-settings-speak-btn {
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.4);
          color: #fff;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: 0.2s;
        }
        .td-settings-speak-btn:hover { background: rgba(255,255,255,0.25); }

        @media (max-width: 1024px) {
          .td-settings-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .td-settings-page {
            padding: 16px;
            padding-bottom: 90px;
          }
          .td-settings-profile-row {
            flex-direction: column;
            align-items: center;
          }
          .td-settings-two-col {
            grid-template-columns: 1fr;
          }
          .td-settings-degree-row {
            grid-template-columns: 1fr;
          }
        }

        /* ═══════════════════════════════════════
           PROFILE TAB
        ═══════════════════════════════════════ */
        .td-profile-tab-page {
          padding: 8px 16px 48px;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }

        .td-profile-main-title {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.5px;
          margin-bottom: 24px;
        }

        .td-profile-header-card {
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #F1F5F9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
        }

        .td-profile-header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .td-profile-avatar-container {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-profile-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .td-profile-info-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .td-profile-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .td-profile-name-row h2 {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .td-profile-verified-badge {
          flex-shrink: 0;
        }

        .td-profile-role-title {
          font-size: 14.5px;
          color: #64748B;
          font-weight: 500;
          margin: 2px 0 10px;
        }

        .td-profile-meta-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .td-profile-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #475569;
          font-weight: 500;
        }

        .td-profile-meta-icon {
          color: #475569;
          flex-shrink: 0;
        }

        .td-profile-trcn-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #DCFCE7;
          color: #15803D;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
        }

        .td-profile-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .td-profile-btn-preview {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 8px;
          border: 1.5px solid #1E293B;
          background: #FFFFFF;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-profile-btn-preview:hover {
          background: #F8FAFC;
        }

        .td-profile-btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          background: #0D4E33;
          color: #FFFFFF;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-profile-btn-edit:hover {
          background: #0B442C;
        }

        .td-profile-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .td-profile-section-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #F1F5F9;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
          padding: 24px 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 145px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .td-profile-section-card:hover {
          border-color: #E2E8F0;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
        }

        .td-psc-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .td-psc-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-psc-icon-teal {
          background: #E0F2FE;
          color: #0284C7;
        }

        .td-psc-icon-green {
          background: #DCFCE7;
          color: #16A34A;
        }

        .td-psc-arrow {
          color: #CBD5E1;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .td-profile-section-card:hover .td-psc-arrow {
          color: #64748B;
          transform: translateX(3px);
        }

        .td-psc-title {
          font-size: 17px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          margin-top: 32px;
          letter-spacing: -0.2px;
        }

        @media (max-width: 1024px) {
          .td-profile-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .td-profile-header-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
          }
          .td-profile-header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .td-profile-header-actions {
            width: 100%;
            justify-content: flex-start;
            margin-top: 8px;
          }
          .td-profile-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .td-profile-tab-page {
            padding: 16px 12px 90px;
          }
        }

        /* ═══════════════════════════════════════
           PROFILE SUB-TABS
        ═══════════════════════════════════════ */
        .td-subtab-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .td-subtab-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;
        }

        .td-subtab-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-subtab-back-btn:hover {
          background: #F8FAFC;
          color: #0F172A;
          border-color: #CBD5E1;
        }

        .td-subtab-pill-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .td-subtab-pill {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 600;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-subtab-pill:hover {
          color: #0F172A;
          border-color: #CBD5E1;
        }

        .td-subtab-pill--active {
          background: #E8F5E9;
          border-color: #10B981;
          color: #047857;
          font-weight: 700;
        }

        .td-subtab-card {
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #F1F5F9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          padding: 32px;
        }

        .td-subtab-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 24px;
          border-bottom: 1px solid #F1F5F9;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .td-subtab-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .td-subtab-header-left h2 {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .td-subtab-header-left p {
          font-size: 13.5px;
          color: #64748B;
          margin: 2px 0 0;
        }

        .td-subtab-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .td-subtab-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .td-subtab-field-full {
          grid-column: span 2;
        }

        .td-subtab-field label {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.5px;
        }

        .td-subtab-input, .td-subtab-textarea {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: #0F172A;
          font-family: inherit;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }

        .td-subtab-input:focus, .td-subtab-textarea:focus {
          background: #FFFFFF;
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .td-subtab-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #F1F5F9;
        }

        .td-subtab-save-btn {
          background: #0D4E33;
          color: #FFFFFF;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
          font-family: inherit;
        }

        .td-subtab-save-btn:hover {
          background: #0B442C;
        }

        .td-subtab-add-btn {
          background: #F1F5F9;
          color: #0F172A;
          border: 1px solid #E2E8F0;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-subtab-add-btn:hover {
          background: #E2E8F0;
        }

        .td-subtab-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .td-subtab-item-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #F8FAFC;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
        }

        .td-subtab-item-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .td-subtab-item-details {
          flex: 1;
        }

        .td-subtab-item-details h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 4px;
        }

        .td-subtab-role-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .td-subtab-role-row h3 {
          margin: 0;
        }

        .td-subtab-present-badge {
          background: #DCFCE7;
          color: #15803D;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .td-subtab-item-inst {
          font-size: 13.5px;
          color: #475569;
          font-weight: 500;
          margin: 0 0 6px;
        }

        .td-subtab-item-meta {
          display: inline-block;
          font-size: 12.5px;
          color: #64748B;
          font-weight: 500;
        }

        .td-subtab-item-desc {
          font-size: 13.5px;
          color: #475569;
          line-height: 1.5;
          margin-top: 10px;
        }

        .td-subtab-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #DCFCE7;
          color: #15803D;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 12.5px;
          font-weight: 700;
        }

        .td-subtab-trcn-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #F8FAFC;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          padding: 24px;
        }

        .td-subtab-trcn-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #EEF2F6;
        }

        .td-subtab-trcn-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .td-subtab-trcn-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.5px;
        }

        .td-subtab-trcn-val {
          font-size: 14.5px;
          font-weight: 700;
          color: #0F172A;
        }

        .td-subtab-doc-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #F8FAFC;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          flex-wrap: wrap;
          gap: 16px;
        }

        .td-subtab-doc-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .td-subtab-doc-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-subtab-doc-left h3 {
          font-size: 14.5px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 2px;
        }

        .td-subtab-doc-left span {
          font-size: 12px;
          color: #64748B;
        }

        .td-subtab-doc-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .td-subtab-btn-outline {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-subtab-btn-outline:hover {
          background: #F1F5F9;
        }

        .td-subtab-btn-primary {
          background: #0D4E33;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #FFFFFF;
          cursor: pointer;
          transition: background 0.2s ease;
          font-family: inherit;
        }

        .td-subtab-btn-primary:hover {
          background: #0B442C;
        }

        .td-subtab-upload-dropzone {
          margin-top: 20px;
          border: 2px dashed #CBD5E1;
          border-radius: 16px;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #FAFAFA;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .td-subtab-upload-dropzone:hover {
          border-color: #10B981;
          background: #F0FDF4;
        }

        .td-subtab-upload-dropzone p {
          font-size: 14px;
          color: #334155;
          margin: 0;
        }

        .td-subtab-upload-dropzone span {
          font-size: 12px;
          color: #94A3B8;
        }

        /* ═══════════════════════════════════════
           EXACT PROFESSIONAL INFO TAB DESIGN
        ═══════════════════════════════════════ */
        .td-prof-info-page {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-prof-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: color 0.15s ease;
        }

        .td-prof-breadcrumb:hover {
          color: #16A34A;
        }

        .td-prof-back-icon {
          color: #0F172A;
        }

        .td-prof-header-section {
          margin-bottom: 28px;
        }

        .td-prof-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .td-prof-page-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          max-width: 650px;
          margin: 0;
        }

        .td-prof-grid-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 28px;
          align-items: start;
        }

        /* ═══════════════════════════════════════
           EXACT PROFESSIONAL INFORMATION TAB DESIGN
        ═══════════════════════════════════════ */
        .td-prof-info-page {
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-prof-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 16px;
          transition: color 0.15s ease;
        }

        .td-prof-breadcrumb:hover {
          color: #16A34A;
        }

        .td-prof-back-icon {
          color: #0F172A;
        }

        .td-prof-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
        }

        .td-prof-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #15803D;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
        }

        .td-prof-edit-profile-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-prof-edit-profile-btn:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }

        .td-prof-hero-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 24px 28px;
          position: relative;
          overflow: hidden;
          margin-bottom: 28px;
        }

        .td-prof-hero-decor {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: #F0FDF4;
          z-index: 0;
          pointer-events: none;
        }

        .td-prof-hero-content {
          display: flex;
          align-items: center;
          gap: 22px;
          position: relative;
          z-index: 1;
        }

        .td-prof-hero-avatar {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }

        .td-prof-hero-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .td-prof-hero-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .td-prof-hero-name {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.4px;
        }

        .td-prof-trcn-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #DCFCE7;
          border: 1px solid #BBF7D0;
          color: #15803D;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 9999px;
        }

        .td-prof-hero-role {
          font-size: 14.5px;
          font-weight: 600;
          color: #475569;
          margin: 0 0 4px;
        }

        .td-prof-hero-meta-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .td-prof-hero-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748B;
          font-weight: 500;
        }

        .td-prof-view-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .td-prof-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 24px 28px;
        }

        .td-prof-card-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .td-prof-card-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-prof-card-head h2 {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .td-prof-summary-text {
          font-size: 13px;
          color: #475569;
          line-height: 1.65;
          margin: 0;
        }

        .td-prof-subject-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .td-prof-sub-pill {
          background: #EEF4FF;
          color: #2563EB;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 14px;
          border-radius: 9999px;
          border: 1px solid #DBEAFE;
        }

        .td-prof-levels-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .td-prof-level-pill {
          background: #F1F5F9;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 14px;
          border-radius: 9999px;
        }

        .td-prof-exp-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .td-prof-exp-item-card {
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          gap: 14px;
        }

        .td-prof-exp-item-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .td-prof-exp-date {
          font-size: 11.5px;
          font-weight: 600;
          color: #64748B;
        }

        .td-prof-exp-date--present {
          color: #15803D;
        }

        .td-prof-exp-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }

        .td-prof-exp-school {
          font-size: 12px;
          color: #64748B;
          margin: 0;
        }

        .td-prof-exp-cap-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0D4E33;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .td-prof-right-col-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .td-prof-edu-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .td-prof-edu-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .td-prof-edu-info h3 {
          font-size: 14.5px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 2px;
        }

        /* ═══════════════════════════════════════
           EXACT PERSONAL INFO TAB DESIGN
        ═══════════════════════════════════════ */
        .td-pers-info-page {
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-pers-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: color 0.15s ease;
        }

        .td-pers-breadcrumb:hover {
          color: #16A34A;
        }

        .td-pers-back-icon {
          color: #0F172A;
        }

        .td-pers-header-section {
          margin-bottom: 28px;
        }

        .td-pers-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .td-pers-page-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
        }

        .td-pers-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E9ECEF;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          padding: 32px 32px 28px;
        }

        .td-pers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 24px;
          margin-bottom: 20px;
        }

        .td-pers-field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .td-pers-label {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }

        .td-pers-input {
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          color: #111827;
          font-family: inherit;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
        }

        .td-pers-input:focus {
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .td-pers-select-wrap {
          position: relative;
          width: 100%;
        }

        .td-pers-select {
          appearance: none;
          -webkit-appearance: none;
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          border-radius: 8px;
          padding: 12px 40px 12px 16px;
          font-size: 14px;
          color: #111827;
          font-family: inherit;
          font-weight: 500;
          outline: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .td-pers-select:focus {
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .td-pers-select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748B;
          pointer-events: none;
        }

        .td-pers-contact-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 22px;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          margin-bottom: 16px;
          background: #FFFFFF;
        }

        .td-pers-contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .td-pers-contact-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .td-pers-contact-icon {
          color: #6B7280;
        }

        .td-pers-contact-label {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }

        .td-pers-contact-value {
          font-size: 14.5px;
          color: #374151;
          font-weight: 500;
        }

        .td-pers-contact-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          margin-top: 2px;
        }

        .td-pers-badge--info {
          color: #6B7280;
        }

        .td-pers-badge--verified {
          color: #10B981;
          font-weight: 600;
        }

        .td-pers-contact-btn {
          border: 1.5px solid #111827;
          background: transparent;
          border-radius: 50px;
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          font-family: inherit;
        }

        .td-pers-contact-btn:hover {
          background: #111827;
          color: #FFFFFF;
        }

        .td-pers-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
        }

        .td-pers-cancel-btn {
          background: #FFFFFF;
          border: 1.5px solid #D1D5DB;
          border-radius: 50px;
          padding: 10px 24px;
          font-size: 13.5px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .td-pers-cancel-btn:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }

        .td-pers-save-btn {
          background: #15803D;
          color: #FFFFFF;
          border: none;
          border-radius: 50px;
          padding: 10px 24px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(21, 128, 61, 0.25);
        }

        .td-pers-save-btn:hover {
          background: #166534;
        }

        /* ═══════════════════════════════════════
           EXACT EDUCATION TAB DESIGN
        ═══════════════════════════════════════ */
        .td-edu-info-page {
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-edu-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: color 0.15s ease;
        }

        .td-edu-breadcrumb:hover {
          color: #16A34A;
        }

        .td-edu-back-icon {
          color: #0F172A;
        }

        .td-edu-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .td-edu-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .td-edu-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .td-edu-page-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
        }

        .td-edu-add-btn {
          background: #15803D;
          color: #FFFFFF;
          border: none;
          border-radius: 9999px;
          padding: 10px 22px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(21, 128, 61, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .td-edu-add-btn:hover {
          background: #166534;
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.35);
        }

        .td-edu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 320px));
          gap: 24px;
          align-items: stretch;
        }

        .td-edu-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 24px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 200px;
        }

        .td-edu-card-decor {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 95px;
          height: 95px;
          border-radius: 50%;
          background: #F1F5F9;
          z-index: 0;
          pointer-events: none;
        }

        .td-edu-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          margin-bottom: 16px;
        }

        .td-edu-details {
          position: relative;
          z-index: 1;
          margin-bottom: 16px;
        }

        .td-edu-degree {
          font-size: 19px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }

        .td-edu-inst-row {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13.5px;
          color: #64748B;
          font-weight: 500;
        }

        .td-edu-divider {
          height: 1px;
          background: #F1F5F9;
          margin-bottom: 16px;
          width: 100%;
        }

        .td-edu-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .td-edu-period-pill {
          background: #F1F5F9;
          color: #475569;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 12px;
        }

        .td-edu-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #15803D;
          font-size: 12.5px;
          font-weight: 600;
        }

        .td-edu-add-card {
          background: #FFFFFF;
          border: 1.5px dashed #CBD5E1;
          border-radius: 16px;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 200px;
        }

        .td-edu-add-card:hover {
          border-color: #10B981;
          background: #F0FDF4;
        }

        .td-edu-add-icon-circle {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          transition: transform 0.2s ease;
        }

        .td-edu-add-card:hover .td-edu-add-icon-circle {
          transform: scale(1.08);
        }

        .td-edu-add-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 5px;
        }

        .td-edu-add-desc {
          font-size: 12px;
          color: #64748B;
          line-height: 1.4;
          margin: 0;
          max-width: 190px;
        }

        /* ═══════════════════════════════════════
           EXACT TEACHING EXPERIENCE TAB DESIGN
        ═══════════════════════════════════════ */
        .td-exp-info-page {
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-exp-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: color 0.15s ease;
        }

        .td-exp-breadcrumb:hover {
          color: #16A34A;
        }

        .td-exp-back-icon {
          color: #0F172A;
        }

        .td-exp-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .td-exp-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .td-exp-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .td-exp-page-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
          max-width: 620px;
        }

        .td-exp-add-btn {
          background: #15803D;
          color: #FFFFFF;
          border: none;
          border-radius: 9999px;
          padding: 10px 22px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(21, 128, 61, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .td-exp-add-btn:hover {
          background: #166534;
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.35);
        }

        .td-exp-timeline-container {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }

        .td-exp-timeline-item {
          display: flex;
          gap: 24px;
          position: relative;
        }

        .td-exp-timeline-marker-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 32px;
          flex-shrink: 0;
          position: relative;
          padding-top: 18px;
        }

        .td-exp-node-active {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid #15803D;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          flex-shrink: 0;
        }

        .td-exp-node-inner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #15803D;
        }

        .td-exp-timeline-line {
          width: 2px;
          background: #E2E8F0;
          flex: 1;
          margin: 4px 0;
          min-height: 120px;
        }

        .td-exp-node-empty {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #CBD5E1;
          background: #FFFFFF;
          margin-bottom: 8px;
          z-index: 2;
          flex-shrink: 0;
        }

        .td-exp-card {
          flex: 1;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 26px 30px;
          margin-bottom: 24px;
        }

        .td-exp-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .td-exp-role {
          font-size: 20px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }

        .td-exp-school-location {
          font-size: 13.5px;
          color: #475569;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .td-exp-dot-sep {
          color: #94A3B8;
        }

        .td-exp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F0FDF4;
          border: 1px solid #DCFCE7;
          color: #15803D;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 9999px;
          letter-spacing: 0.4px;
        }

        .td-exp-badge-icon {
          color: #15803D;
        }

        .td-exp-desc {
          font-size: 13.5px;
          color: #475569;
          line-height: 1.6;
          margin: 16px 0 20px;
        }

        .td-exp-divider {
          height: 1px;
          background: #F1F5F9;
          margin-bottom: 16px;
          width: 100%;
        }

        .td-exp-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .td-exp-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: opacity 0.15s ease;
        }

        .td-exp-action-btn:hover {
          opacity: 0.8;
        }

        .td-exp-action-edit {
          color: #334155;
        }

        .td-exp-action-delete {
          color: #DC2626;
        }

        /* ═══════════════════════════════════════
           EXACT TRCN CERTIFICATION TAB DESIGN
        ═══════════════════════════════════════ */
        .td-trcn-info-page {
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-trcn-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: color 0.15s ease;
        }

        .td-trcn-breadcrumb:hover {
          color: #16A34A;
        }

        .td-trcn-back-icon {
          color: #0F172A;
        }

        .td-trcn-header-row {
          margin-bottom: 32px;
        }

        .td-trcn-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .td-trcn-page-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
        }

        .td-trcn-grid-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        .td-trcn-left-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .td-trcn-status-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 26px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          position: relative;
          overflow: hidden;
          flex-wrap: wrap;
        }

        .td-trcn-decor-blob {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: #ECFDF5;
          z-index: 0;
          pointer-events: none;
        }

        .td-trcn-status-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .td-trcn-status-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .td-trcn-card-title {
          font-size: 19px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .td-trcn-active-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #DCFCE7;
          border: 1px solid #BBF7D0;
          color: #15803D;
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 9999px;
        }

        .td-trcn-number-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .td-trcn-number-label {
          font-size: 12.5px;
          color: #64748B;
          font-weight: 600;
        }

        .td-trcn-number-val {
          font-size: 14.5px;
          color: #1E293B;
          font-weight: 700;
        }

        .td-trcn-status-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .td-trcn-btn-view {
          background: #0D4E33;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
          font-family: inherit;
        }

        .td-trcn-btn-view:hover {
          background: #093b26;
        }

        .td-trcn-btn-update {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          color: #334155;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-trcn-btn-update:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }

        .td-trcn-subcards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .td-trcn-subcard {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .td-trcn-subcard-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .td-trcn-subcard-icon {
          color: #64748B;
        }

        .td-trcn-subcard-header h3 {
          font-size: 13.5px;
          font-weight: 700;
          color: #334155;
          margin: 0;
        }

        .td-trcn-subcard-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .td-trcn-field-item label {
          font-size: 11.5px;
          color: #64748B;
          font-weight: 500;
          display: block;
          margin-bottom: 2px;
        }

        .td-trcn-field-item p {
          font-size: 14.5px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }

        .td-trcn-log-timeline {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .td-trcn-log-entry {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .td-trcn-log-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .td-trcn-log-dot--green {
          background: #15803D;
        }

        .td-trcn-log-dot--gray {
          background: #CBD5E1;
        }

        .td-trcn-log-info h4 {
          font-size: 13px;
          font-weight: 700;
          color: #1E293B;
          margin: 0 0 2px;
        }

        .td-trcn-log-info span {
          font-size: 11.5px;
          color: #64748B;
          font-weight: 500;
        }

        .td-trcn-right-col {
          display: flex;
          flex-direction: column;
        }

        .td-trcn-why-card {
          background: #F3F7FD;
          border: 1px solid #E0EBF9;
          border-radius: 20px;
          padding: 26px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .td-trcn-why-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .td-trcn-why-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-trcn-why-header h2 {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .td-trcn-why-intro {
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        .td-trcn-benefits-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 4px;
        }

        .td-trcn-benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .td-trcn-check-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .td-trcn-benefit-item p {
          font-size: 12.5px;
          color: #334155;
          line-height: 1.5;
          margin: 0;
        }

        .td-trcn-benefit-item strong {
          color: #0F172A;
          font-weight: 700;
        }

        /* ═══════════════════════════════════════
           EXACT CV / RESUME TAB DESIGN
        ═══════════════════════════════════════ */
        .td-cv-info-page {
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-cv-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: color 0.15s ease;
        }

        .td-cv-breadcrumb:hover {
          color: #16A34A;
        }

        .td-cv-back-icon {
          color: #0F172A;
        }

        .td-cv-header-row {
          margin-bottom: 32px;
        }

        .td-cv-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .td-cv-page-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
        }

        .td-cv-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: start;
        }

        .td-cv-left-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .td-cv-active-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 26px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .td-cv-active-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .td-cv-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .td-cv-title-wrap h2 {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .td-cv-secure-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #E0F2FE;
          color: #0284C7;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 9999px;
        }

        .td-cv-file-box {
          background: #F8FAFC;
          border: 1px solid #F1F5F9;
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .td-cv-pdf-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .td-cv-file-info h3 {
          font-size: 14px;
          font-weight: 700;
          color: #1E293B;
          margin: 0 0 3px;
        }

        .td-cv-file-info span {
          font-size: 12px;
          color: #64748B;
          font-weight: 500;
        }

        .td-cv-actions-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .td-cv-btn-view {
          background: #0D4E33;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
          font-family: inherit;
        }

        .td-cv-btn-view:hover {
          background: #093b26;
        }

        .td-cv-btn-download {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          color: #334155;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-cv-btn-download:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }

        .td-cv-privacy-card {
          background: #EEF4FF;
          border: 1px solid #DBEAFE;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .td-cv-shield-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .td-cv-privacy-info h3 {
          font-size: 13px;
          font-weight: 700;
          color: #1E3A8A;
          margin: 0 0 4px;
        }

        .td-cv-privacy-info p {
          font-size: 12px;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        .td-cv-right-col {
          display: flex;
          flex-direction: column;
        }

        .td-cv-replace-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 26px 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .td-cv-replace-header h2 {
          font-size: 19px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }

        .td-cv-replace-header p {
          font-size: 13px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
        }

        .td-cv-dropzone {
          border: 1.5px dashed #CBD5E1;
          border-radius: 14px;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #FFFFFF;
        }

        .td-cv-dropzone:hover {
          border-color: #10B981;
          background: #F0FDF4;
        }

        .td-cv-cloud-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          transition: transform 0.2s ease;
        }

        .td-cv-dropzone:hover .td-cv-cloud-icon-box {
          transform: scale(1.08);
        }

        .td-cv-drop-prompt {
          font-size: 13.5px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 3px;
        }

        .td-cv-drop-sub {
          font-size: 12px;
          color: #64748B;
        }

        .td-cv-drop-formats {
          font-size: 10.5px;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.5px;
          margin-top: 20px;
        }

        /* ═══════════════════════════════════════
           EXACT AVAILABILITY TAB DESIGN
        ═══════════════════════════════════════ */
        .td-avail-info-page {
          max-width: 820px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-avail-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1E293B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: color 0.15s ease;
        }

        .td-avail-breadcrumb:hover {
          color: #16A34A;
        }

        .td-avail-back-icon {
          color: #0F172A;
        }

        .td-avail-header-row {
          margin-bottom: 32px;
        }

        .td-avail-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .td-avail-page-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
        }

        .td-avail-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          padding: 36px 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .td-avail-section {
          display: flex;
          flex-direction: column;
        }

        .td-avail-section-title {
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 4px;
        }

        .td-avail-section-desc {
          font-size: 12.5px;
          color: #64748B;
          margin: 0 0 16px;
        }

        .td-avail-emp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .td-avail-emp-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .td-avail-emp-card:hover {
          border-color: #CBD5E1;
          background: #F8FAFC;
        }

        .td-avail-emp-card--active {
          background: #F0F4FF;
          border-color: #3B82F6;
        }

        .td-avail-emp-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .td-avail-radio-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }

        .td-avail-radio-circle--active {
          border-color: #2563EB;
          background: #2563EB;
        }

        .td-avail-radio-inner {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFFFFF;
        }

        .td-avail-emp-info h3 {
          font-size: 13.5px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 2px;
        }

        .td-avail-emp-info span {
          font-size: 11.5px;
          color: #64748B;
        }

        .td-avail-check-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #15803D;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .td-avail-loc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .td-avail-field-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #334155;
        }

        .td-avail-loc-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px 14px;
          transition: all 0.2s ease;
        }

        .td-avail-loc-input-wrap:focus-within {
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .td-avail-loc-icon {
          color: #64748B;
          flex-shrink: 0;
        }

        .td-avail-loc-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 13.5px;
          color: #1E293B;
          font-weight: 500;
          font-family: inherit;
          width: 100%;
        }

        .td-avail-field-hint {
          font-size: 11.5px;
          color: #64748B;
          margin-top: 2px;
        }

        .td-avail-start-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .td-avail-start-btn {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-avail-start-btn:hover {
          border-color: #CBD5E1;
          background: #F8FAFC;
        }

        .td-avail-start-btn--active {
          border-color: #15803D;
          background: #F0FDF4;
        }

        .td-avail-start-icon {
          color: #15803D;
        }

        .td-avail-start-btn span {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
        }

        .td-avail-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          padding-top: 8px;
        }

        /* ═══════════════════════════════════════
           PROFILE UPDATED SUCCESS FULL SCREEN OVERLAY
        ═══════════════════════════════════════ */
        .td-profile-success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background: #FAFAFA;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow-y: auto;
        }

        .td-success-overlay-back-btn {
          position: absolute;
          top: 36px;
          left: 36px;
          background: none;
          border: none;
          color: #0F172A;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease;
          z-index: 10;
        }

        .td-success-overlay-back-btn:hover {
          background: #F1F5F9;
        }

        .td-success-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #F1F5F9;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.04);
          padding: 44px 38px 38px;
          max-width: 460px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .td-success-icon-outer {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #E8F7EE;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
        }

        .td-success-icon-inner {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #15803D;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-success-title {
          font-size: 25px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 12px;
          line-height: 1.25;
          letter-spacing: -0.4px;
        }

        .td-success-desc {
          font-size: 13.5px;
          color: #64748B;
          line-height: 1.55;
          margin: 0 0 26px;
          max-width: 380px;
        }

        .td-success-progress-section {
          width: 100%;
          margin-bottom: 28px;
        }

        .td-success-progress-bar {
          width: 100%;
          height: 6px;
          background: #15803D;
          border-radius: 9999px;
          margin-bottom: 8px;
        }

        .td-success-progress-text {
          font-size: 12px;
          font-weight: 700;
          color: #15803D;
          display: block;
        }

        .td-success-actions-row {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
        }

        .td-success-view-profile-btn {
          flex: 1;
          background: #15803D;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          padding: 12px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
          font-family: inherit;
        }

        .td-success-view-profile-btn:hover {
          background: #166534;
        }

        .td-success-dashboard-btn {
          flex: 1;
          background: #F8FAFC;
          color: #1E293B;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .td-success-dashboard-btn:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }

        .td-empty-settings-box {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px dashed #CBD5E1;
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          text-align: center;
          margin-top: 10px;
        }

        .td-empty-settings-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #E8F7EE;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-empty-settings-text {
          font-size: 14px;
          color: #64748B;
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 540px) {
          .td-success-card {
            padding: 32px 20px;
          }
          .td-success-actions-row {
            flex-direction: column;
          }
          .td-success-view-profile-btn,
          .td-success-dashboard-btn {
            width: 100%;
          }
        }

        @media (max-width: 900px) {
          .td-prof-grid-layout {
            grid-template-columns: 1fr;
          }
          .td-prof-pref-card {
            max-width: 100%;
          }
          .td-trcn-grid-layout {
            grid-template-columns: 1fr;
          }
          .td-cv-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .td-pers-grid {
            grid-template-columns: 1fr;
          }
          .td-pers-empty-cell {
            display: none;
          }
          .td-pers-card {
            padding: 24px 20px;
          }
          .td-pers-actions-row {
            flex-direction: column-reverse;
            width: 100%;
          }
          .td-pers-cancel-btn,
          .td-pers-save-btn {
            width: 100%;
          }
          .td-edu-grid {
            grid-template-columns: 1fr;
          }
          .td-edu-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .td-edu-add-btn {
            width: 100%;
            justify-content: center;
          }
          .td-exp-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .td-exp-add-btn {
            width: 100%;
            justify-content: center;
          }
          .td-exp-timeline-item {
            gap: 14px;
          }
          .td-exp-card {
            padding: 20px 16px;
          }
          .td-exp-role {
            font-size: 17px;
          }
          .td-trcn-subcards-grid {
            grid-template-columns: 1fr;
          }
          .td-trcn-status-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .td-trcn-status-actions {
            width: 100%;
            flex-direction: column;
          }
          .td-trcn-btn-view,
          .td-trcn-btn-update {
            width: 100%;
            justify-content: center;
          }
          .td-cv-actions-row {
            flex-direction: column;
            width: 100%;
          }
          .td-cv-btn-view,
          .td-cv-btn-download {
            width: 100%;
            justify-content: center;
          }
          .td-avail-emp-grid {
            grid-template-columns: 1fr;
          }
          .td-avail-start-grid {
            grid-template-columns: 1fr;
          }
          .td-avail-card {
            padding: 24px 20px;
          }
          .td-avail-actions-row {
            flex-direction: column-reverse;
            width: 100%;
          }
        }
      `}</style>
    </motion.div>
  );
}