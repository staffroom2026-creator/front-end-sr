import React, { useEffect, useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import {
  FiBell,
  FiBriefcase,
  FiCheckCircle,
  FiChevronRight,
  FiClipboard,
  FiGrid,
  FiLogOut,
  FiMessageSquare,
  FiMoreVertical,
  FiSettings,
  FiShield,
  FiUser,
  FiUsers,
  FiClock,
  FiBarChart2,
  FiChevronLeft,
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiDownload,
  FiMapPin,
  FiUserCheck,
  FiX,
} from 'react-icons/fi';

const navItems = [
  ['overview', 'Dashboard', FiGrid],
  ['jobs', 'Jobs', FiBriefcase],
  ['verification', 'Schools', FiShield],
  ['teachers', 'Teachers', FiUsers],
  ['reports', 'Reports', FiClipboard],
  ['notifications', 'Notifications', FiBell],
  ['settings', 'Settings', FiSettings],
];

const overviewStats = [
  { label: 'Total Teachers', value: '1,284', note: 'Total teacher accounts', tone: 'neutral', icon: FiUsers },
  { label: 'Total Schools', value: '326', note: 'Total schools registered', tone: 'neutral', icon: FiGrid },
  { label: 'Active Jobs', value: '184', note: 'Jobs currently visible to teachers', tone: 'neutral', icon: FiBriefcase },
  { label: 'Pending Reviews', value: '17', note: 'Jobs waiting for review', tone: 'warning', icon: FiClock },
];

const summaryCards = [
  { label: 'Published', value: '184', accent: 'green' },
  { label: 'Pending', value: '17', accent: 'amber' },
  { label: 'Changes Req.', value: '8', accent: 'gray' },
  { label: 'Rejected', value: '12', accent: 'red' },
];

const reviewRows = [
  {
    school: 'Mathematics Teacher',
    schoolSub: 'Bright Future International School',
    hours: '2 hours ago',
    status: 'Pending',
    action: 'Review',
  },
  {
    school: 'English Teacher',
    schoolSub: 'Greenfield Academy',
    hours: '5 hours ago',
    status: 'Pending',
    action: 'Review',
  },
  {
    school: 'Primary School Teacher',
    schoolSub: 'Royal Academy',
    hours: '1 day ago',
    status: 'Pending',
    action: 'Review',
  },
];

const recentActivity = [
  { type: 'success', icon: FiCheckCircle, text: 'Admin Sarah approved job', subtext: 'Science Teacher', time: '10 mins ago' },
  { type: 'notice', icon: FiClipboard, text: 'Oakwood High submitted new', subtext: 'job PE Instructor', time: '45 mins ago' },
  { type: 'info', icon: FiCheckCircle, text: 'Admin Mike rejected job', subtext: 'Substitute Teacher', time: '2 hours ago' },
  { type: 'muted', icon: FiUser, text: 'Jane Doe completed teacher', subtext: 'verification', time: '3 hours ago' },
];

const quickStats = [
  { value: '24', label: 'Verification req.', icon: FiShield },
  { value: '5', label: 'New reports', icon: FiBarChart2 },
];

const jobFilters = ['All', 'Pending Review', 'Changes Requested', 'Published', 'Rejected', 'Closed', 'Reported'];
const JOBS_PER_PAGE = 5;
const schoolFilters = ['All Schools', 'Active', 'Suspended', 'Recently Joined'];
const SCHOOLS_PER_PAGE = 5;

const schoolRows = [
  { name: 'Greenfield Academy', type: 'Private Secondary School', location: 'Benin City, Edo State', email: 'admin@greenfieldacademy.com', joined: 'Aug 27, 2026', status: 'Active' },
  { name: 'Crescent International', type: 'Private Primary School', location: 'Lagos, Nigeria', email: 'hello@crescent.edu.ng', joined: 'Oct 12, 2025', status: 'Active' },
  { name: 'Sunrise College', type: 'Vocational Center', location: 'Abuja, FCT', email: 'contact@sunrisecollege.org', joined: 'Jan 05, 2026', status: 'Suspended' },
];
const schoolDataset = Array.from({ length: 156 }, (_, index) => {
  const school = schoolRows[index % schoolRows.length];
  return index < schoolRows.length ? school : { ...school, name: `${school.name} ${index + 1}`, email: `admin${index + 1}@staffroom.school` };
});
const teacherFilters = ['All Teachers', 'Active', 'Suspended', 'Recently Joined'];
const TEACHERS_PER_PAGE = 3;
const teacherRows = [
  { name: 'John Doe', title: 'Mathematics Teacher', subject: 'Mathematics · Secondary', location: 'Benin City, Edo State', contact: 'john.doe@gmail.com', joined: 'Aug 24, 2026', status: 'Active' },
  { name: 'Sarah Adebayo', title: 'Senior Science Tutor', subject: 'Physics · Senior Secondary', location: 'Lagos, Lagos State', contact: 's.adebayo@school.edu', joined: 'Sep 01, 2025', status: 'Suspended' },
  { name: 'Chika Nwosu', title: 'Language Instructor', subject: 'English · Primary', location: 'Abuja, FCT', contact: 'cnwosu@edu.ng', joined: 'Jan 15, 2026', status: 'Active' },
];
const teacherDataset = Array.from({ length: 45 }, (_, index) => {
  const teacher = teacherRows[index % teacherRows.length];
  return index < teacherRows.length ? teacher : { ...teacher, name: `${teacher.name} ${index + 1}`, contact: `teacher${index + 1}@staffroom.school` };
});

const allJobs = [
  {
    title: 'Senior Mathematics Teacher',
    school: "St. Jude's Academy",
    location: 'Benin City, Edo, Nigeria',
    status: 'Pending Review',
    submitted: 'Oct 24, 2023',
    updated: 'Oct 24, 2023',
    action: 'Review',
  },
  {
    title: 'Primary Years Educator',
    school: 'Oakwood Primary',
    location: 'Manchester, UK',
    status: 'Published',
    submitted: 'Oct 22, 2023',
    updated: 'Oct 23, 2023',
    action: 'View',
  },
  {
    title: 'Primary Years Educator',
    school: 'Oakwood Primary',
    location: 'Manchester, UK',
    status: 'Published',
    submitted: 'Oct 22, 2023',
    updated: 'Oct 23, 2023',
    action: 'View',
  },
  {
    title: 'Head of Science',
    school: 'Riverside High',
    location: 'Birmingham, UK',
    status: 'Rejected',
    submitted: 'Oct 20, 2023',
    updated: 'Oct 21, 2023',
    action: 'Details',
  },
  {
    title: 'Head of Science',
    school: 'Riverside High',
    location: 'Birmingham, UK',
    status: 'Rejected',
    submitted: 'Oct 20, 2023',
    updated: 'Oct 21, 2023',
    action: 'Details',
  },
];

const jobDataset = Array.from({ length: 243 }, (_, index) => {
  const sourceJob = allJobs[index % allJobs.length];
  const generatedStatus = jobFilters[1 + (index % (jobFilters.length - 1))];
  const status = index < allJobs.length ? sourceJob.status : generatedStatus;

  return {
    ...sourceJob,
    title: index < allJobs.length ? sourceJob.title : `${sourceJob.title} ${index + 1}`,
    status,
    action: status === 'Pending Review' ? 'Review' : status === 'Published' ? 'View' : 'Details',
  };
});

function JobReviewView({ job, onBack }) {
  const [feedback, setFeedback] = useState(null);
  const [isFeedbackClosing, setIsFeedbackClosing] = useState(false);
  const canReview = job.status === 'Pending Review' || job.status === 'Changes Requested';

  useEffect(() => {
    if (!feedback) return undefined;
    const closeStartId = window.setTimeout(() => setIsFeedbackClosing(true), 1200);
    const removeId = window.setTimeout(() => setFeedback(null), 1500);
    return () => {
      window.clearTimeout(closeStartId);
      window.clearTimeout(removeId);
    };
  }, [feedback]);

  const showFeedback = (status) => {
    setIsFeedbackClosing(false);
    setFeedback(status);
  };

  return (
    <section className="internal-admin-job-review">
      <div className="internal-admin-review-toolbar">
        <div className="internal-admin-review-title">
          <button type="button" className="internal-admin-review-back" onClick={onBack} aria-label="Back to all jobs">
            <FiArrowLeft size={17} />
          </button>
          <div>
            <h1>{canReview ? 'Review Job Posting' : 'Job Posting Details'}</h1>
            <span className={`internal-admin-job-status ${job.status.toLowerCase().replace(' ', '-')}`}>
              {job.status}
            </span>
          </div>
        </div>

        {canReview && (
          <div className="internal-admin-review-actions">
            <button type="button" className="internal-admin-reject-button" onClick={() => showFeedback('rejected')}>
              <FiX size={14} /> Reject
            </button>
            <button type="button" className="internal-admin-approve-button" onClick={() => showFeedback('approved')}>
              <FiCheck size={14} /> Approve &amp; Publish
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <div className="internal-admin-snack-backdrop">
          <section className={`internal-admin-snack-box ${feedback} ${isFeedbackClosing ? 'is-closing' : ''}`} role="alert" aria-live="assertive">
            <div className="internal-admin-snack-icon">
              {feedback === 'approved' ? <FiCheck size={30} /> : <FiX size={30} />}
            </div>
            <div className="internal-admin-snack-copy">
              <h2>Job {feedback} successfully</h2>
              <p>This job has been {feedback} successfully.</p>
            </div>
            <button type="button" className="internal-admin-snack-close" aria-label="Close notification" onClick={() => setFeedback(null)}>
              <FiX size={29} />
            </button>
            <button type="button" className="internal-admin-snack-confirm" onClick={() => setFeedback(null)}>Okay</button>
          </section>
        </div>
      )}

      <div className="internal-admin-review-layout">
        <div className="internal-admin-review-main-column">
          <section className="internal-admin-review-card internal-admin-job-summary-card">
            <div className="internal-admin-job-summary-heading">
              <div>
                <h2>{job.title}</h2>
                <p><FiUserCheck size={12} /> Bright Future International School <span>•</span> <FiMapPin size={12} /> Lagos, Nigeria</p>
                <p><FiCalendar size={12} /> Full Time</p>
              </div>
              <span className="internal-admin-job-reference">ID: JOB-88924</span>
            </div>
            <div className="internal-admin-job-summary-details">
              <div><small>Salary Range</small><strong>₦150,000 -<br />₦200,000</strong></div>
              <div><small>Experience</small><strong>2+ years</strong></div>
              <div><small>Deadline</small><strong>Sep 15, 2026</strong></div>
              <div><small>Subject Area</small><strong>Mathematics</strong></div>
            </div>
          </section>

          <section className="internal-admin-review-card">
            <h3>Job Description</h3>
            <p>Bright Future International School is seeking a dedicated and passionate Mathematics Teacher to join our junior secondary school faculty. The ideal candidate will have a strong grasp of the Nigerian national curriculum as well as IGCSE mathematics standards.</p>
            <p>You will be responsible for creating a stimulating learning environment, developing engaging lesson plans, and preparing students for local and international examinations.</p>
          </section>

          <div className="internal-admin-review-two-column">
            <section className="internal-admin-review-card">
              <h3>Responsibilities</h3>
              <ul>
                <li>Plan, prepare and deliver instructional activities that facilitate active learning experiences.</li>
                <li>Develop schemes of work and lesson plans in line with curriculum objectives.</li>
                <li>Establish and communicate clear objectives for all learning activities.</li>
                <li>Prepare classroom materials and provide a variety of learning materials.</li>
                <li>Observe and evaluate student&apos;s performance and development.</li>
                <li>Assign and grade class work, homework, tests and assignments.</li>
              </ul>
            </section>

            <section className="internal-admin-review-card">
              <h3>Requirements</h3>
              <ul className="internal-admin-requirement-list">
                <li>Education: Minimum of B.Ed or B.Sc in Mathematics with PGDE.</li>
                <li>Experience: 2+ years teaching Senior Secondary Mathematics.</li>
                <li>Subject Expertise in Further Mathematics is an added advantage.</li>
                <li>Skills: Proficiency in educational technology.</li>
                <li>Certifications: TRCN registration required.</li>
              </ul>
            </section>
          </div>

          <section className="internal-admin-review-card internal-admin-application-card">
            <h3>Application Information</h3>
            <div className="internal-admin-application-details">
              <div><small>Method</small><span>Through Staffroom Platform</span></div>
              <div><small>Required Documents</small><div className="internal-admin-document-buttons"><button type="button"><FiDownload size={11} /> CV/Resume</button><button type="button"><FiDownload size={11} /> Cover Letter</button></div></div>
            </div>
          </section>
        </div>

        <aside className="internal-admin-review-side-column">
          <section className="internal-admin-review-card internal-admin-school-profile-card">
            <div className="internal-admin-school-cover" />
            <div className="internal-admin-school-profile-content">
              <div className="internal-admin-school-avatar">B</div>
              <div className="internal-admin-school-profile-title"><h3>Bright Future Intl</h3><span>Verified</span></div>
              <p><FiMapPin size={12} /> Ikeja, Lagos</p>
              <div className="internal-admin-school-tags"><span>Private School</span><span>Secondary</span></div>
              <button type="button" className="internal-admin-profile-button">View Full Profile</button>
            </div>
          </section>

          {canReview && (
            <section className="internal-admin-review-checklist">
              <h3><FiUserCheck size={16} /> Internal Review</h3>
              <small>Review Checklist</small>
              {['Title is clear and standard', 'Salary range is realistic', 'Description contains no discriminatory language', 'Requirements align with role', 'School profile is fully verified'].map((item) => (
                <label key={item}><input type="checkbox" /> <span>{item}</span></label>
              ))}
              <label className="internal-admin-notes-label" htmlFor="internal-review-notes">Internal Notes <span>(Not visible to school)</span></label>
              <textarea id="internal-review-notes" placeholder="Add notes about this job posting or reasons for rejection/changes..." />
            </section>
          )}
        </aside>
      </div>
    </section>
  );
}

function SchoolProfileView({ school, onBack }) {
  const [isSuspended, setIsSuspended] = useState(school.status === 'Suspended');

  return (
    <section className="internal-admin-school-profile-view">
      <div className="internal-admin-school-profile-breadcrumb">Schools <span>›</span> {school.name}</div>
      <section className="internal-admin-school-profile-header">
        <div className="internal-admin-school-profile-brand"><span className="internal-admin-school-profile-logo">{school.name.charAt(0)}</span><div><h2>{school.name}</h2><p>{school.type} • {school.location}</p><small>Joined {school.joined}</small></div></div>
        <div className="internal-admin-school-profile-header-actions"><span className={`internal-admin-school-status ${isSuspended ? 'suspended' : 'active'}`}>{isSuspended ? 'Suspended' : 'Active'}</span><button type="button" className="internal-admin-school-suspend-button" onClick={() => setIsSuspended((value) => !value)}>{isSuspended ? 'Activate School' : 'Suspend School'}</button></div>
      </section>

      <div className="internal-admin-school-stat-grid">
        {[['Total Teachers', '64'], ['Active Jobs', '8'], ['Closed Jobs', '14'], ['Applications', '187']].map(([label, value]) => <div key={label} className="internal-admin-school-stat"><small>{label}</small><strong>{value}</strong></div>)}
      </div>

      <section className="internal-admin-school-profile-panel internal-admin-school-timeline"><h3>Activity Timeline</h3><div className="internal-admin-timeline-item"><span>✓</span><div><strong>Updated school profile</strong><small>Yesterday</small></div></div><div className="internal-admin-timeline-item"><span>□</span><div><strong>Posted Mathematics Teacher</strong><small>Aug 25, 2026</small></div></div><div className="internal-admin-timeline-item"><span>▱</span><div><strong>School joined Staffroom</strong><small>{school.joined}</small></div></div></section>

      <section className="internal-admin-school-profile-panel internal-admin-school-information"><h3>School Information</h3><div className="internal-admin-school-info-grid"><div><small>School Name</small><strong>{school.name}</strong><small>School Type</small><strong>{school.type}</strong><small>Location</small><strong>Nigeria, {school.location.replace('Nigeria', '').trim()}</strong></div><div><small>Contact Information</small><strong>{school.email}</strong><strong>+234 801 234 5678</strong></div></div></section>

      <section className="internal-admin-school-profile-panel internal-admin-school-recent-jobs"><div className="internal-admin-school-panel-heading"><h3>Recent Jobs</h3><button type="button" onClick={onBack}>View All</button></div><div className="internal-admin-school-jobs-heading"><span>Role</span><span>Type</span><span>Apps</span><span>Posted</span><span>Status</span></div>{[['Mathematics Teacher', 'Full-time', '24', 'Aug 25, 2026'], ['English HOD', 'Full-time', '12', 'Sep 01, 2026']].map(([role, type, apps, posted]) => <div className="internal-admin-school-job-row" key={role}><strong>{role}</strong><span>{type}</span><span>{apps}</span><span>{posted}</span><span className="internal-admin-school-status active">Active</span></div>)}</section>
    </section>
  );
}

function TeacherProfileView({ teacher, onBack }) {
  return (
    <section className="internal-admin-teacher-profile-view">
      <div className="internal-admin-teacher-breadcrumb">Teachers <span>›</span> {teacher.name}</div>
      <section className="internal-admin-teacher-profile-header"><div className="internal-admin-teacher-avatar">{teacher.name.charAt(0)}</div><div><h2>{teacher.name}</h2><p>{teacher.title} • {teacher.subject}</p><small>{teacher.location}</small></div><span className={`internal-admin-school-status ${teacher.status.toLowerCase()}`}>{teacher.status}</span><button type="button" className="internal-admin-teacher-back" onClick={onBack}>Back to Teachers</button></section>
      <div className="internal-admin-teacher-profile-grid"><section className="internal-admin-school-profile-panel"><h3>Professional Information</h3><p><strong>Primary Subject</strong>{teacher.subject}</p><p><strong>Professional Title</strong>{teacher.title}</p><p><strong>Date Joined</strong>{teacher.joined}</p></section><section className="internal-admin-school-profile-panel"><h3>Contact Information</h3><p><strong>Email</strong>{teacher.contact}</p><p><strong>Location</strong>{teacher.location}</p><p><strong>Profile Status</strong>{teacher.status}</p></section></div>
      <section className="internal-admin-school-profile-panel"><div className="internal-admin-school-panel-heading"><h3>Recent Applications</h3><button type="button" onClick={onBack}>Back to Teachers</button></div><div className="internal-admin-teacher-application-row"><strong>Mathematics Teacher</strong><span>Bright Future International School</span><span>Active</span></div><div className="internal-admin-teacher-application-row"><strong>English HOD</strong><span>Oakwood Primary</span><span>Closed</span></div></section>
    </section>
  );
}

export default function InternalAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeJobFilter, setActiveJobFilter] = useState('All');
  const [activeJobPage, setActiveJobPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeSchoolFilter, setActiveSchoolFilter] = useState('All Schools');
  const [activeSchoolPage, setActiveSchoolPage] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [activeTeacherFilter, setActiveTeacherFilter] = useState('All Teachers');
  const [activeTeacherPage, setActiveTeacherPage] = useState(1);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const activeTabLabel = navItems.find(([key]) => key === activeTab)?.[1] || 'Dashboard';
  const filteredJobs = jobDataset.filter((job) => activeJobFilter === 'All' || job.status === activeJobFilter);
  const totalJobPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const pageStartIndex = (activeJobPage - 1) * JOBS_PER_PAGE;
  const visibleJobs = filteredJobs.slice(pageStartIndex, pageStartIndex + JOBS_PER_PAGE);
  const resultStart = filteredJobs.length === 0 ? 0 : pageStartIndex + 1;
  const resultEnd = Math.min(pageStartIndex + JOBS_PER_PAGE, filteredJobs.length);
  const filteredSchools = schoolDataset.filter((school) => activeSchoolFilter === 'All Schools' || school.status === activeSchoolFilter);
  const schoolTotalPages = Math.max(1, Math.ceil(filteredSchools.length / SCHOOLS_PER_PAGE));
  const visibleSchools = filteredSchools.slice((activeSchoolPage - 1) * SCHOOLS_PER_PAGE, activeSchoolPage * SCHOOLS_PER_PAGE);
  const schoolPaginationPages = activeSchoolPage <= 3
    ? [1, 2, 3].filter((page) => page <= schoolTotalPages)
    : [...new Set([1, activeSchoolPage - 1, activeSchoolPage, Math.min(activeSchoolPage + 1, schoolTotalPages)])].sort((a, b) => a - b);
  const schoolPaginationItems = schoolPaginationPages.reduce((items, page, index) => {
    if (index > 0 && page - schoolPaginationPages[index - 1] > 1) items.push(`ellipsis-${page}`);
    items.push(page);
    return items;
  }, []);
  if (schoolPaginationPages[schoolPaginationPages.length - 1] < schoolTotalPages) schoolPaginationItems.push('ellipsis-end');
  const filteredTeachers = teacherDataset.filter((teacher) => (activeTeacherFilter === 'All Teachers' || teacher.status === activeTeacherFilter) && `${teacher.name} ${teacher.contact} ${teacher.subject} ${teacher.location}`.toLowerCase().includes(teacherSearch.toLowerCase()));
  const teacherTotalPages = Math.max(1, Math.ceil(filteredTeachers.length / TEACHERS_PER_PAGE));
  const visibleTeachers = filteredTeachers.slice((activeTeacherPage - 1) * TEACHERS_PER_PAGE, activeTeacherPage * TEACHERS_PER_PAGE);
  const teacherPaginationPages = activeTeacherPage <= 3
    ? [1, 2, 3].filter((page) => page <= teacherTotalPages)
    : [...new Set([1, activeTeacherPage - 1, activeTeacherPage, Math.min(activeTeacherPage + 1, teacherTotalPages)])].sort((a, b) => a - b);
  const teacherPaginationItems = teacherPaginationPages.reduce((items, page, index) => {
    if (index > 0 && page - teacherPaginationPages[index - 1] > 1) items.push(`ellipsis-${page}`);
    items.push(page);
    return items;
  }, []);
  if (teacherPaginationPages[teacherPaginationPages.length - 1] < teacherTotalPages) teacherPaginationItems.push('ellipsis-end');
  const paginationPages = activeJobPage <= 3
    ? [1, 2, 3].filter((page) => page <= totalJobPages)
    : [...new Set([1, activeJobPage - 1, activeJobPage, Math.min(activeJobPage + 1, totalJobPages)])].sort((a, b) => a - b);
  const paginationItems = paginationPages.reduce((items, page, index) => {
    if (index > 0 && page - paginationPages[index - 1] > 1) items.push(`ellipsis-${page}`);
    items.push(page);
    return items;
  }, []);
  if (paginationPages[paginationPages.length - 1] < totalJobPages) paginationItems.push('ellipsis-end');

  const openJobReview = (job) => {
    setSelectedJob(job);
    setActiveTab('job-review');
  };

  const openSchoolProfile = (school) => {
    setSelectedSchool(school);
    setActiveTab('school-profile');
  };

  const openTeacherProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setActiveTab('teacher-profile');
  };

  return (
    <div className="internal-admin-shell">
      <div className="internal-admin-frame">
        <aside className="internal-admin-sidebar">
          <div className="internal-admin-sidebar-inner">
            <div className="internal-admin-brand">
              <BrandLogo />
            </div>

            <nav className="internal-admin-nav">
              {navItems.map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  className={`internal-admin-nav-item ${key === activeTab ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(key)}
                  aria-current={key === activeTab ? 'page' : undefined}
                >
                  {React.createElement(Icon, { size: 18 })}
                  <span>{label}</span>
                  {key === 'reports' && <i className="internal-admin-dot" />}
                </button>
              ))}
            </nav>

            <button type="button" className="internal-admin-logout">
              <FiLogOut size={17} />
              Log out
            </button>
          </div>
        </aside>

        <div className="internal-admin-main">
          <header className="internal-admin-header">
            <div className="internal-admin-header-tools">
              <button type="button" className="internal-admin-bell" aria-label="Notifications">
                <FiBell size={17} />
              </button>

              <div className="internal-admin-user-divider" />
              <div className="internal-admin-user-meta">
                <strong>Admin User</strong>
                <span>BrightMinds Academy</span>
              </div>
              <div className="internal-admin-user-avatar" aria-label="Admin User" title="Admin User">
                A
              </div>
            </div>
          </header>

          <main className="internal-admin-content">
            {activeTab !== 'job-review' && activeTab !== 'school-profile' && activeTab !== 'teacher-profile' && <div className="internal-admin-overview-header">
              <div>
                <div className="internal-admin-breadcrumb">Dashboard / {activeTabLabel}</div>
                <h1>{activeTab === 'jobs' ? 'All Jobs' : activeTabLabel === 'Dashboard' ? 'Overview' : activeTabLabel}</h1>
                <p>
                  {activeTab === 'jobs'
                    ? 'View all jobs submitted through Staffroom.'
                    : activeTab === 'overview'
                    ? 'Monitor Staffroom activity and review job submissions.'
                    : `Manage Staffroom ${activeTabLabel.toLowerCase()} from this workspace.`}
                </p>
              </div>
            </div>}

            {activeTab === 'job-review' && selectedJob ? (
              <JobReviewView job={selectedJob} onBack={() => { setSelectedJob(null); setActiveTab('jobs'); }} />
            ) : activeTab === 'school-profile' && selectedSchool ? (
              <SchoolProfileView school={selectedSchool} onBack={() => { setSelectedSchool(null); setActiveTab('verification'); }} />
            ) : activeTab === 'teacher-profile' && selectedTeacher ? (
              <TeacherProfileView teacher={selectedTeacher} onBack={() => { setSelectedTeacher(null); setActiveTab('teachers'); }} />
            ) : activeTab === 'overview' ? <>
            <section className="internal-admin-stat-grid">
              {overviewStats.map((item) => (
                <div key={item.label} className={`internal-admin-stat-card ${item.tone}`}>
                  <div className="internal-admin-stat-label">
                    <span>{item.label}</span>
                    {React.createElement(item.icon, { size: 19 })}
                  </div>
                  <strong>{item.value}</strong>
                  <small>{item.note}</small>
                </div>
              ))}
            </section>

            <div className="internal-admin-summary-row">
              <section className="internal-admin-summary-panel">
                <div className="internal-admin-panel-header">
                  <h3>Job Status Summary</h3>
                  <div className="internal-admin-meta-icons">
                    <button type="button" aria-label="summary actions">
                      <FiMoreVertical size={14} />
                    </button>
                  </div>
                </div>

                <div className="internal-admin-summary-grid">
                  {summaryCards.map((item) => (
                    <div key={item.label} className={`internal-admin-summary-card ${item.accent}`}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <div className="internal-admin-quick-stats">
                {quickStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="internal-admin-quick-stat">
                      {React.createElement(Icon, { size: 14 })}
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="internal-admin-lower-grid">
              <section className="internal-admin-panel left-panel">
                <div className="internal-admin-panel-header">
                  <h3>Jobs Pending Review</h3>
                  <button type="button" className="internal-admin-link-button">
                    View All <FiChevronRight size={14} />
                  </button>
                </div>

                <div className="internal-admin-table-head">
                  <span>Job Title / School</span>
                  <span>Submitted</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {reviewRows.map((row) => (
                  <div key={row.school} className="internal-admin-table-row">
                    <div className="internal-admin-school-cell">
                      <strong>{row.school}</strong>
                      <small>{row.schoolSub}</small>
                    </div>
                    <span className="internal-admin-timespan">{row.hours}</span>
                    <span className="internal-admin-status-pill pending">{row.status}</span>
                    <button type="button" className="internal-admin-review-btn">
                      {row.action}
                    </button>
                  </div>
                ))}
              </section>

              <aside className="internal-admin-side-column">
                <section className="internal-admin-panel right-panel">
                  <div className="internal-admin-panel-header">
                    <h3>Recent Activity</h3>
                  </div>

                  <div className="internal-admin-activity-list">
                    {recentActivity.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={`${item.text}-${item.time}`} className={`internal-admin-activity-item ${item.type}`}>
                          <span className="internal-admin-activity-icon">
                            {React.createElement(Icon, { size: 14 })}
                          </span>
                          <div>
                            <strong>{item.text}</strong>
                            <small>{item.subtext}</small>
                            <time>{item.time}</time>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </aside>
            </div>
            </> : activeTab === 'jobs' ? (
              <section className="internal-admin-jobs-view">
                <div className="internal-admin-job-filters" role="tablist" aria-label="Filter jobs">
                  {jobFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      role="tab"
                      aria-selected={activeJobFilter === filter}
                      className={activeJobFilter === filter ? 'is-active' : ''}
                      onClick={() => {
                        setActiveJobFilter(filter);
                        setActiveJobPage(1);
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="internal-admin-jobs-table-wrap">
                  <div className="internal-admin-jobs-table" role="table" aria-label="All jobs">
                    <div className="internal-admin-jobs-table-row internal-admin-jobs-table-heading" role="row">
                      <span role="columnheader">Job Title</span>
                      <span role="columnheader">School</span>
                      <span role="columnheader">Location</span>
                      <span role="columnheader">Status</span>
                      <span role="columnheader">Submitted</span>
                      <span role="columnheader">Last Updated</span>
                      <span role="columnheader">Action</span>
                    </div>

                    {visibleJobs.length > 0 ? visibleJobs.map((job, index) => (
                        <div className="internal-admin-jobs-table-row" role="row" key={`${job.title}-${pageStartIndex + index}`}>
                          <strong role="cell">{job.title}</strong>
                          <span role="cell">{job.school}</span>
                          <span role="cell">{job.location}</span>
                          <span role="cell">
                            <span className={`internal-admin-job-status ${job.status.toLowerCase().replace(' ', '-')}`}>
                              {job.status}
                            </span>
                          </span>
                          <span role="cell">{job.submitted}</span>
                          <span role="cell">{job.updated}</span>
                          <button type="button" className="internal-admin-job-action" onClick={() => openJobReview(job)}>{job.action}</button>
                        </div>
                      )) : (
                        <div className="internal-admin-jobs-empty" role="row">No jobs found for this filter.</div>
                      )}
                  </div>

                  <footer className="internal-admin-jobs-footer">
                    <span>Showing {resultStart} to {resultEnd} of {filteredJobs.length} results</span>
                    <div className="internal-admin-job-pagination" aria-label="Job pages">
                      <button
                        type="button"
                        aria-label="Previous page"
                        disabled={activeJobPage === 1}
                        onClick={() => setActiveJobPage((page) => Math.max(1, page - 1))}
                      >
                        <FiChevronLeft size={14} />
                      </button>
                      {paginationItems.map((item) => item.toString().startsWith('ellipsis') ? (
                        <span key={item}>...</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          className={activeJobPage === item ? 'is-active' : ''}
                          onClick={() => setActiveJobPage(item)}
                        >
                          {item}
                        </button>
                      ))}
                      <button
                        type="button"
                        aria-label="Next page"
                        disabled={activeJobPage >= totalJobPages}
                        onClick={() => setActiveJobPage((page) => Math.min(totalJobPages, page + 1))}
                      >
                        <FiChevronRight size={14} />
                      </button>
                    </div>
                  </footer>
                </div>
              </section>
            ) : activeTab === 'verification' ? (
              <section className="internal-admin-schools-view">
                <div className="internal-admin-school-toolbar">
                  <div className="internal-admin-school-filters" role="tablist" aria-label="Filter schools">
                    {schoolFilters.map((filter) => (
                      <button key={filter} type="button" role="tab" aria-selected={activeSchoolFilter === filter} className={activeSchoolFilter === filter ? 'is-active' : ''} onClick={() => { setActiveSchoolFilter(filter); setActiveSchoolPage(1); }}>
                        {filter}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="internal-admin-school-filter-button" aria-label="Filter schools">≡</button>
                </div>

                <div className="internal-admin-schools-table-wrap">
                  <div className="internal-admin-schools-table" role="table" aria-label="Schools">
                    <div className="internal-admin-schools-row internal-admin-schools-heading" role="row">
                      <span role="columnheader">School</span><span role="columnheader">Type</span><span role="columnheader">Location</span><span role="columnheader">Contact Email</span><span role="columnheader">Date Joined</span><span role="columnheader">Status</span><span role="columnheader">Action</span>
                    </div>
                    {visibleSchools.length > 0 ? visibleSchools.map((school) => (
                      <div className="internal-admin-schools-row" role="row" key={school.name}>
                        <strong role="cell"><span className="internal-admin-school-logo">{school.name.charAt(0)}</span>{school.name}</strong>
                        <span role="cell">{school.type}</span><span role="cell">{school.location}</span><span role="cell">{school.email}</span><span role="cell">{school.joined}</span>
                        <span role="cell"><span className={`internal-admin-school-status ${school.status.toLowerCase()}`}>{school.status}</span></span>
                        <button type="button" className="internal-admin-school-action" onClick={() => openSchoolProfile(school)}>View<br />Profile</button>
                      </div>
                    )) : <div className="internal-admin-schools-empty">No schools found for this filter.</div>}
                  </div>
                  <footer className="internal-admin-schools-footer">
                    <span>Showing {filteredSchools.length ? (activeSchoolPage - 1) * SCHOOLS_PER_PAGE + 1 : 0} to {Math.min(activeSchoolPage * SCHOOLS_PER_PAGE, filteredSchools.length)} of {filteredSchools.length} entries</span>
                    <div className="internal-admin-school-pagination" aria-label="School pages">
                      <button type="button" disabled={activeSchoolPage === 1} onClick={() => setActiveSchoolPage((page) => Math.max(1, page - 1))}>‹</button>
                      {schoolPaginationItems.map((item) => item.toString().startsWith('ellipsis') ? <span key={item}>...</span> : <button key={item} type="button" className={activeSchoolPage === item ? 'is-active' : ''} onClick={() => setActiveSchoolPage(item)}>{item}</button>)}
                      <button type="button" disabled={activeSchoolPage >= schoolTotalPages} onClick={() => setActiveSchoolPage((page) => Math.min(schoolTotalPages, page + 1))}>›</button>
                    </div>
                  </footer>
                </div>
              </section>
            ) : activeTab === 'teachers' ? (
              <section className="internal-admin-teachers-view">
                <div className="internal-admin-teachers-toolbar"><label className="internal-admin-teacher-search"><FiUsers size={17} /><input value={teacherSearch} onChange={(event) => { setTeacherSearch(event.target.value); setActiveTeacherPage(1); }} placeholder="Search by name, email, subject or location..." aria-label="Search teachers" /></label><div className="internal-admin-school-filters" role="tablist" aria-label="Filter teachers">{teacherFilters.map((filter) => <button key={filter} type="button" role="tab" aria-selected={activeTeacherFilter === filter} className={activeTeacherFilter === filter ? 'is-active' : ''} onClick={() => { setActiveTeacherFilter(filter); setActiveTeacherPage(1); }}>{filter}</button>)}</div></div>
                <div className="internal-admin-schools-table-wrap internal-admin-teachers-table-wrap"><div className="internal-admin-teachers-table"><div className="internal-admin-teachers-row internal-admin-schools-heading"><span>Teacher</span><span>Professional Title</span><span>Primary Subject</span><span>Location</span><span>Contact</span><span>Date Joined</span><span>Status</span><span>Action</span></div>{visibleTeachers.length > 0 ? visibleTeachers.map((teacher) => <div className="internal-admin-teachers-row" key={teacher.name}><strong><span className="internal-admin-teacher-mini-avatar">{teacher.name.charAt(0)}</span>{teacher.name}</strong><span>{teacher.title}</span><span>{teacher.subject}</span><span>{teacher.location}</span><span>{teacher.contact}</span><span>{teacher.joined}</span><span><span className={`internal-admin-school-status ${teacher.status.toLowerCase()}`}>{teacher.status}</span></span><button type="button" className="internal-admin-school-action" onClick={() => openTeacherProfile(teacher)}>View<br />Profile ›</button></div>) : <div className="internal-admin-schools-empty">No teachers found for this search or filter.</div>}</div><footer className="internal-admin-schools-footer"><span>Showing {filteredTeachers.length ? (activeTeacherPage - 1) * TEACHERS_PER_PAGE + 1 : 0} to {Math.min(activeTeacherPage * TEACHERS_PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length} entries</span><div className="internal-admin-school-pagination" aria-label="Teacher pages"><button type="button" aria-label="Previous teacher page" disabled={activeTeacherPage === 1} onClick={() => setActiveTeacherPage((page) => Math.max(1, page - 1))}>‹</button>{teacherPaginationItems.map((item) => item.toString().startsWith('ellipsis') ? <span key={item}>...</span> : <button key={item} type="button" className={activeTeacherPage === item ? 'is-active' : ''} onClick={() => setActiveTeacherPage(item)}>{item}</button>)}<button type="button" aria-label="Next teacher page" disabled={activeTeacherPage >= teacherTotalPages} onClick={() => setActiveTeacherPage((page) => Math.min(teacherTotalPages, page + 1))}>›</button></div></footer></div>
              </section>
            ) : (
              <section className="internal-admin-tab-placeholder">
                <div className="internal-admin-placeholder-icon">
                  {React.createElement(navItems.find(([key]) => key === activeTab)?.[2] || FiGrid, { size: 22 })}
                </div>
                <h2>{activeTabLabel}</h2>
                <p>This {activeTabLabel.toLowerCase()} tab is ready for its workflow and data.</p>
              </section>
            )}
          </main>
        </div>
      </div>

      <style>{`
        :root {
          --ia-bg: #f5f5f4;
          --ia-panel: #ffffff;
          --ia-sidebar: #ffffff;
          --ia-line: #dfe2df;
          --ia-text: #20221f;
          --ia-muted: #68706c;
          --ia-soft: #edf5ef;
          --ia-green: #17853d;
          --ia-green-soft: #e2f5e7;
          --ia-orange: #f5eaa8;
          --ia-red: #ff684e;
          --ia-gray: #e7e9e8;
        }

        * { box-sizing: border-box; }

        .internal-admin-shell {
          min-height: 100vh;
          background: var(--ia-bg);
          color: var(--ia-text);
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        .internal-admin-frame {
          display: flex;
          max-width: 1440px;
          margin: 0 auto;
          min-height: 100vh;
          background: var(--ia-bg);
          border-left: 1px solid var(--ia-line);
          border-right: 1px solid var(--ia-line);
        }

        .internal-admin-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 20;
          width: 236px;
          height: 100vh;
          background: var(--ia-sidebar);
          border-right: 1px solid var(--ia-line);
          overflow-y: auto;
        }

        .internal-admin-sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 18px 14px 18px;
        }

        .internal-admin-brand {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 4px 8px 18px;
        }

        .internal-admin-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 12px;
        }

        .internal-admin-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          border: none;
          background: transparent;
          color: #2f3f35;
          padding: 10px 12px;
          border-radius: 10px;
          text-align: left;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .internal-admin-nav-item svg {
          flex-shrink: 0;
          color: #4d5a52;
        }

        .internal-admin-nav-item.is-active {
          background: #dff3e5;
          color: #075b2b;
          box-shadow: inset 3px 0 0 #168642;
        }

        .internal-admin-nav-item.is-active svg {
          color: #075b2b;
        }

        .internal-admin-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fe5c5c;
          margin-left: auto;
          box-shadow: 0 0 0 3px rgba(254, 92, 92, 0.15);
        }

        .internal-admin-logout {
          margin-top: auto;
          border: none;
          background: #ff684e;
          color: white;
          font-weight: 700;
          border-radius: 18px;
          padding: 13px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: none;
        }

        .internal-admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          margin-left: 236px;
        }

        .internal-admin-header {
          position: fixed;
          top: 0;
          right: 0;
          left: 236px;
          z-index: 15;
          height: 72px;
          border-bottom: 1px solid var(--ia-line);
          background: rgba(255, 255, 255, 0.78);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 28px 0 24px;
          backdrop-filter: blur(10px);
        }

        .internal-admin-header-tools {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-left: auto;
        }

        .internal-admin-bell {
          width: 42px;
          height: 42px;
          border: none;
          background: transparent;
          border-radius: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #35443d;
          cursor: pointer;
        }

        .internal-admin-user-divider {
          width: 1px;
          height: 40px;
          background: #d5dbd6;
          margin: 0 2px;
        }

        .internal-admin-user-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.15;
        }

        .internal-admin-user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #d8f1dd 0%, #a9e2b8 100%);
          color: #19492a;
          font-size: 12px;
          font-weight: 800;
          border: 2px solid #17853d;
        }

        .internal-admin-user-meta strong {
          font-size: 12px;
          color: #1e2d26;
        }

        .internal-admin-user-meta span {
          font-size: 10px;
          color: #6e7c73;
        }

        .internal-admin-content {
          padding: 98px 32px 36px;
          overflow: auto;
        }

        .internal-admin-overview-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .internal-admin-breadcrumb {
          color: #68706c;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .internal-admin-overview-header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .internal-admin-overview-header p {
          margin: 8px 0 0;
          color: #56605a;
          font-size: 14px;
        }

        .internal-admin-tab-placeholder {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid var(--ia-line);
          border-radius: 14px;
          background: #ffffff;
          color: var(--ia-muted);
          text-align: center;
        }

        .internal-admin-placeholder-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--ia-soft);
          color: var(--ia-green);
        }

        .internal-admin-tab-placeholder h2 {
          margin: 0;
          color: var(--ia-text);
          font-size: 20px;
        }

        .internal-admin-tab-placeholder p {
          margin: 0;
          font-size: 13px;
        }

        .internal-admin-job-review {
          color: #27342e;
        }

        .internal-admin-review-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 0 13px;
          border-bottom: 1px solid #d5dad6;
        }

        .internal-admin-review-title,
        .internal-admin-review-actions,
        .internal-admin-job-summary-heading,
        .internal-admin-school-profile-title {
          display: flex;
          align-items: center;
        }

        .internal-admin-review-title {
          gap: 10px;
        }

        .internal-admin-review-title h1 {
          margin: 0 0 4px;
          font-size: 17px;
          line-height: 1.1;
        }

        .internal-admin-review-title .internal-admin-job-status {
          min-height: 17px;
          padding: 2px 7px;
          font-size: 9px;
        }

        .internal-admin-review-back,
        .internal-admin-review-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .internal-admin-review-back {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #56645c;
        }

        .internal-admin-review-actions {
          gap: 10px;
        }

        .internal-admin-review-actions button {
          min-height: 34px;
          gap: 6px;
          padding: 7px 18px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
        }

        .internal-admin-reject-button {
          border: 1px solid #f1c4c0;
          background: #ffffff;
          color: #d95b51;
        }

        .internal-admin-approve-button {
          border: 1px solid #075b2b;
          background: #075b2b;
          color: #ffffff;
        }

        .internal-admin-review-notice {
          margin: 12px 0 0;
          padding: 9px 12px;
          border: 1px solid #b9ddc1;
          border-radius: 5px;
          background: #effaf1;
          color: #26713b;
          font-size: 12px;
        }

        .internal-admin-snack-backdrop {
          position: fixed;
          top: 18px;
          left: 50%;
          z-index: 50;
          width: min(420px, calc(100% - 32px));
          transform: translateX(-50%);
        }

        .internal-admin-snack-box {
          position: relative;
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 16px;
          width: 100%;
          min-height: 172px;
          padding: 18px 18px 16px 18px;
          border: 1px solid #d5d7da;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 4px 15px rgba(24, 31, 26, 0.16);
        }

        .internal-admin-snack-box.is-closing {
          animation: internal-admin-snack-exit 300ms ease-in-out forwards;
        }

        @keyframes internal-admin-snack-exit {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-14px);
          }
        }

        .internal-admin-snack-icon {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 50%;
          background: #128332;
          color: #ffffff;
        }

        .internal-admin-snack-box.rejected .internal-admin-snack-icon {
          background: #d85d52;
        }

        .internal-admin-snack-copy {
          padding: 5px 30px 0 0;
        }

        .internal-admin-snack-copy h2 {
          margin: 0;
          color: #080908;
          font-size: 16px;
          line-height: 1.15;
        }

        .internal-admin-snack-copy p {
          margin: 25px 0 0;
          color: #111312;
          font-size: 14px;
          line-height: 1.2;
        }

        .internal-admin-snack-close {
          position: absolute;
          top: 14px;
          right: 14px;
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          border: none;
          background: transparent;
          color: #080908;
          cursor: pointer;
        }

        .internal-admin-snack-confirm {
          position: absolute;
          right: 18px;
          bottom: 16px;
          min-width: 105px;
          min-height: 40px;
          padding: 8px 19px;
          border: none;
          border-radius: 22px;
          background: #26dc55;
          color: #07120a;
          font-size: 14px;
          cursor: pointer;
        }

        .internal-admin-snack-confirm:hover {
          background: #19c947;
        }

        .internal-admin-review-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 204px;
          gap: 14px;
          margin-top: 18px;
        }

        .internal-admin-review-main-column,
        .internal-admin-review-side-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }

        .internal-admin-review-card {
          padding: 14px;
          border: 1px solid #d4dbd6;
          border-radius: 6px;
          background: #ffffff;
        }

        .internal-admin-review-card h2,
        .internal-admin-review-card h3,
        .internal-admin-review-card p {
          margin: 0;
        }

        .internal-admin-review-card h3 {
          padding-bottom: 8px;
          border-bottom: 1px solid #dce2dd;
          color: #33423a;
          font-size: 13px;
          font-weight: 600;
        }

        .internal-admin-job-summary-heading {
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }

        .internal-admin-job-summary-heading h2 {
          color: #273746;
          font-size: 17px;
          font-weight: 500;
        }

        .internal-admin-job-summary-heading p {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 5px;
          color: #58665f;
          font-size: 10px;
        }

        .internal-admin-job-summary-heading p span {
          margin: 0 3px;
          color: #9ca6a0;
        }

        .internal-admin-job-reference {
          padding: 4px 7px;
          background: #edf4fb;
          color: #5d7e9c;
          font-size: 9px;
          white-space: nowrap;
        }

        .internal-admin-job-summary-details {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 15px;
          padding-top: 12px;
          border-top: 1px solid #dce2dd;
        }

        .internal-admin-job-summary-details div,
        .internal-admin-application-details div {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .internal-admin-job-summary-details small,
        .internal-admin-application-details small,
        .internal-admin-review-checklist > small {
          color: #6f7b74;
          font-size: 9px;
        }

        .internal-admin-job-summary-details strong {
          color: #435149;
          font-size: 10px;
          font-weight: 500;
        }

        .internal-admin-review-card > p {
          margin-top: 10px;
          color: #58645e;
          font-size: 10px;
          line-height: 1.55;
        }

        .internal-admin-review-two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .internal-admin-review-card ul {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 11px 0 0;
          padding-left: 17px;
          color: #58645e;
          font-size: 10px;
          line-height: 1.45;
        }

        .internal-admin-requirement-list {
          list-style: none;
          padding-left: 0 !important;
        }

        .internal-admin-requirement-list li::before {
          content: '✥';
          margin-right: 5px;
          color: #318060;
        }

        .internal-admin-application-details {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 28px;
          margin-top: 11px;
          color: #46554d;
          font-size: 10px;
        }

        .internal-admin-document-buttons {
          display: flex;
          flex-direction: row !important;
          gap: 5px !important;
        }

        .internal-admin-document-buttons button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 5px;
          border: 1px solid #bccbd8;
          border-radius: 2px;
          background: #eaf2fa;
          color: #405568;
          font-size: 9px;
          cursor: pointer;
        }

        .internal-admin-school-profile-card {
          padding: 0;
          overflow: hidden;
        }

        .internal-admin-school-cover {
          height: 47px;
          border-bottom: 1px solid #cbd8df;
          background: linear-gradient(135deg, #dbe9f6 0%, #f1f5f7 48%, #c5d9eb 100%);
        }

        .internal-admin-school-profile-content {
          position: relative;
          padding: 23px 10px 10px;
        }

        .internal-admin-school-avatar {
          position: absolute;
          top: -16px;
          left: 10px;
          display: grid;
          width: 32px;
          height: 32px;
          place-items: center;
          border: 3px solid #ffffff;
          border-radius: 7px;
          background: #eff4e8;
          color: #638057;
          font-size: 14px;
          font-weight: 700;
        }

        .internal-admin-school-profile-title {
          justify-content: space-between;
          gap: 6px;
        }

        .internal-admin-school-profile-title h3 {
          border: none;
          padding: 0;
          font-size: 13px;
        }

        .internal-admin-school-profile-title span {
          padding: 3px 5px;
          border-radius: 2px;
          background: #dff3df;
          color: #4d9a5c;
          font-size: 8px;
        }

        .internal-admin-school-profile-content p {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 6px;
          color: #5c6962;
          font-size: 9px;
        }

        .internal-admin-school-tags {
          display: flex;
          gap: 4px;
          margin-top: 9px;
        }

        .internal-admin-school-tags span {
          padding: 3px 5px;
          background: #e6effd;
          color: #4c6d91;
          font-size: 8px;
        }

        .internal-admin-profile-button {
          width: 100%;
          margin-top: 10px;
          padding: 5px;
          border: 1px solid #cbd8ce;
          border-radius: 3px;
          background: #ffffff;
          color: #4c8060;
          font-size: 9px;
          cursor: pointer;
        }

        .internal-admin-review-checklist {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 12px 10px 13px;
          border: 1px solid #b8cce7;
          border-radius: 6px;
          background: #dceaff;
        }

        .internal-admin-review-checklist h3 {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 3px;
          color: #334e6b;
          font-size: 13px;
          font-weight: 500;
        }

        .internal-admin-review-checklist label {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          color: #52667d;
          font-size: 9px;
          line-height: 1.25;
        }

        .internal-admin-review-checklist input {
          accent-color: #2c7b57;
          margin: 0;
        }

        .internal-admin-review-checklist .internal-admin-notes-label {
          display: block;
          margin-top: 4px;
          color: #4d6178;
          font-size: 8px;
          font-weight: 600;
        }

        .internal-admin-notes-label span {
          font-weight: 400;
        }

        .internal-admin-review-checklist textarea {
          width: 100%;
          min-height: 65px;
          resize: vertical;
          padding: 7px;
          border: 1px solid #bdcfe4;
          border-radius: 3px;
          background: #ffffff;
          color: #4f5e6e;
          font: inherit;
          font-size: 9px;
        }

        .internal-admin-jobs-view {
          min-width: 0;
        }

        .internal-admin-schools-view {
          position: relative;
          min-width: 0;
        }

        .internal-admin-school-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 15px;
          border-bottom: 1px solid #d7dbd8;
        }

        .internal-admin-school-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .internal-admin-school-filters button,
        .internal-admin-school-filter-button {
          min-height: 31px;
          padding: 6px 15px;
          border: 1px solid #cbd4ce;
          border-radius: 16px;
          background: #ffffff;
          color: #536058;
          font-size: 11px;
          cursor: pointer;
        }

        .internal-admin-school-filters button.is-active {
          border-color: #075b2b;
          background: #006044;
          color: #ffffff;
        }

        .internal-admin-school-filter-button {
          display: grid;
          width: 28px;
          min-height: 28px;
          padding: 0;
          place-items: center;
          border-radius: 7px;
          font-size: 15px;
          transform: rotate(90deg);
        }

        .internal-admin-schools-table-wrap {
          margin-top: 22px;
          overflow: hidden;
          border: 1px solid #d2d8d4;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 2px 5px rgba(34, 49, 39, 0.05);
        }

        .internal-admin-schools-table {
          overflow-x: auto;
        }

        .internal-admin-schools-row {
          display: grid;
          grid-template-columns: minmax(175px, 1.3fr) minmax(105px, .8fr) minmax(105px, .8fr) minmax(190px, 1.35fr) 92px 90px 82px;
          min-width: 950px;
          align-items: center;
          gap: 17px;
          padding: 15px 22px;
          color: #536058;
          font-size: 12px;
          line-height: 1.45;
        }

        .internal-admin-schools-heading {
          min-height: 58px;
          background: #f4f4f3;
          border-bottom: 1px solid #d2d8d4;
          color: #435047;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .internal-admin-schools-row:not(.internal-admin-schools-heading) {
          min-height: 91px;
          border-bottom: 1px solid #d2d8d4;
        }

        .internal-admin-schools-row:last-child {
          border-bottom: none;
        }

        .internal-admin-schools-row strong {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #182c40;
          font-size: 13px;
          line-height: 1.2;
        }

        .internal-admin-school-logo {
          display: grid;
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          place-items: center;
          border: 1px solid #ccd8d0;
          border-radius: 8px;
          background: #f4faf5;
          color: #4b9b64;
          font-size: 16px;
        }

        .internal-admin-school-status {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
        }

        .internal-admin-school-status.active {
          background: #d5f2d3;
          color: #2b9b4b;
        }

        .internal-admin-school-status.suspended {
          background: #ffdcd8;
          color: #ef675d;
        }

        .internal-admin-school-action {
          border: none;
          background: transparent;
          color: #006044;
          font-size: 12px;
          line-height: 1.2;
          cursor: pointer;
        }

        .internal-admin-schools-empty {
          padding: 30px;
          color: #68706c;
          text-align: center;
        }

        .internal-admin-schools-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 54px;
          padding: 9px 22px;
          color: #536058;
          font-size: 12px;
        }

        .internal-admin-school-pagination {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .internal-admin-school-pagination button {
          display: grid;
          width: 27px;
          height: 27px;
          place-items: center;
          border: none;
          border-radius: 5px;
          background: transparent;
          color: #526158;
          cursor: pointer;
        }

        .internal-admin-school-pagination button.is-active {
          background: #e5efea;
          color: #006044;
        }

        .internal-admin-school-pagination button:disabled {
          cursor: default;
          opacity: .4;
        }

        .internal-admin-school-profile-popover {
          position: fixed;
          top: 50%;
          left: 50%;
          z-index: 40;
          width: min(330px, calc(100% - 32px));
          padding: 22px;
          transform: translate(-50%, -50%);
          border: 1px solid #d2d8d4;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 12px 35px rgba(24, 31, 26, .18);
        }

        .internal-admin-school-profile-popover button {
          float: right;
          border: none;
          background: transparent;
          font-size: 22px;
          cursor: pointer;
        }

        .internal-admin-school-profile-popover h2 {
          margin: 0 0 14px;
          color: #182c40;
          font-size: 20px;
        }

        .internal-admin-school-profile-popover p {
          margin: 7px 0;
          color: #536058;
          font-size: 12px;
        }

        .internal-admin-school-profile-view { min-width: 0; color: #4d5c54; }
        .internal-admin-school-profile-breadcrumb { margin-bottom: 16px; color: #66736b; font-size: 11px; }
        .internal-admin-school-profile-breadcrumb span { margin: 0 5px; color: #9ca69f; }
        .internal-admin-school-profile-header,
        .internal-admin-school-profile-brand,
        .internal-admin-school-profile-header-actions,
        .internal-admin-school-panel-heading { display: flex; align-items: center; }
        .internal-admin-school-profile-header { justify-content: space-between; gap: 18px; padding: 15px; border: 1px solid #d5ddd8; border-radius: 8px; background: #fff; }
        .internal-admin-school-profile-brand { gap: 14px; }
        .internal-admin-school-profile-logo { display: grid; width: 62px; height: 62px; place-items: center; border: 1px solid #cbd8d0; border-radius: 6px; background: #edf4fb; color: #526f66; font-size: 25px; font-weight: 700; }
        .internal-admin-school-profile-brand h2 { margin: 0; color: #182c40; font-size: 22px; }
        .internal-admin-school-profile-brand p { margin: 4px 0; font-size: 11px; }
        .internal-admin-school-profile-brand small { color: #86918b; font-size: 10px; }
        .internal-admin-school-profile-header-actions { gap: 18px; }
        .internal-admin-school-suspend-button { padding: 9px 17px; border: 1px solid #ee827a; border-radius: 4px; background: #fff; color: #d7584f; font-size: 11px; font-weight: 700; cursor: pointer; }
        .internal-admin-school-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 130px)); justify-content: center; gap: 12px; margin: 16px 0; }
        .internal-admin-school-stat { display: flex; min-height: 98px; flex-direction: column; justify-content: space-between; padding: 13px 11px; border: 1px solid #dce1de; border-radius: 6px; background: #fff; box-shadow: 0 1px 3px rgba(38, 50, 42, .04); }
        .internal-admin-school-stat small { color: #68736d; font-size: 9px; }
        .internal-admin-school-stat strong { color: #26364a; font-size: 19px; }
        .internal-admin-school-profile-panel { margin-bottom: 16px; padding: 16px; border: 1px solid #d5ddd8; border-radius: 8px; background: #fff; }
        .internal-admin-school-profile-panel h3 { margin: 0 0 14px; padding-bottom: 10px; border-bottom: 1px solid #dce2dd; color: #33423a; font-size: 14px; }
        .internal-admin-school-timeline { min-height: 168px; }
        .internal-admin-timeline-item { display: flex; gap: 9px; margin: 11px 0; }
        .internal-admin-timeline-item > span { display: grid; width: 18px; height: 18px; place-items: center; border: 2px solid #59a681; border-radius: 50%; color: #318060; font-size: 10px; }
        .internal-admin-timeline-item strong, .internal-admin-timeline-item small { display: block; }
        .internal-admin-timeline-item strong { color: #51615a; font-size: 11px; }
        .internal-admin-timeline-item small { color: #7f8983; font-size: 9px; }
        .internal-admin-school-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 70px; }
        .internal-admin-school-info-grid div { display: flex; flex-direction: column; gap: 5px; }
        .internal-admin-school-info-grid small { margin-top: 4px; color: #66736b; font-size: 9px; font-weight: 700; }
        .internal-admin-school-info-grid strong { color: #405047; font-size: 11px; font-weight: 500; }
        .internal-admin-school-panel-heading { justify-content: space-between; }
        .internal-admin-school-panel-heading h3 { flex: 1; }
        .internal-admin-school-panel-heading button { border: none; background: transparent; color: #006044; font-size: 11px; font-weight: 700; cursor: pointer; }
        .internal-admin-school-jobs-heading, .internal-admin-school-job-row { display: grid; grid-template-columns: 2fr 1fr .7fr 1.2fr 1fr; gap: 12px; align-items: center; padding: 9px 0; font-size: 10px; }
        .internal-admin-school-jobs-heading { background: #edf3ff; color: #68736d; text-align: center; }
        .internal-admin-school-job-row { border-bottom: 1px solid #e0e4e1; color: #59665f; text-align: center; }
        .internal-admin-school-job-row strong { color: #425149; font-size: 10px; font-weight: 500; }
        .internal-admin-school-job-row .internal-admin-school-status { justify-self: center; padding: 3px 8px; font-size: 9px; }

        .internal-admin-teachers-view { min-width: 0; }
        .internal-admin-teachers-toolbar { display: flex; align-items: center; gap: 14px; padding: 15px; border: 1px solid #d1dbd4; border-radius: 9px; background: #fff; }
        .internal-admin-teacher-search { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 230px; height: 43px; padding: 0 11px; border: 1px solid #c8d3cc; border-radius: 7px; color: #52635a; }
        .internal-admin-teacher-search input { width: 100%; border: 0; outline: 0; background: transparent; color: #52635a; font: inherit; font-size: 13px; }
        .internal-admin-teacher-search input::placeholder { color: #84918a; }
        .internal-admin-teachers-toolbar .internal-admin-school-filters { flex-wrap: nowrap; }
        .internal-admin-teachers-table-wrap { margin-top: 22px; }
        .internal-admin-teachers-table { overflow: visible; }
        .internal-admin-teachers-row { display: grid; grid-template-columns: 1.15fr 1fr 1fr .9fr 1.25fr .75fr .72fr .7fr; min-width: 0; align-items: center; gap: 10px; padding: 14px 20px; color: #536058; font-size: 12px; line-height: 1.35; }
        .internal-admin-teachers-row:not(.internal-admin-schools-heading) { min-height: 78px; border-bottom: 1px solid #d2d8d4; }
        .internal-admin-teachers-row > * { min-width: 0; overflow-wrap: anywhere; }
        .internal-admin-teachers-row strong { display: flex; align-items: center; gap: 9px; color: #182c40; font-size: 13px; }
        .internal-admin-teacher-mini-avatar { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid #c4d1d0; border-radius: 50%; background: #e4f0f4; color: #3e7182; font-size: 14px; }
        .internal-admin-teacher-profile-view { min-width: 0; color: #4d5c54; }
        .internal-admin-teacher-breadcrumb { margin-bottom: 16px; color: #66736b; font-size: 11px; }
        .internal-admin-teacher-breadcrumb span { margin: 0 5px; color: #9ca69f; }
        .internal-admin-teacher-profile-header { display: flex; align-items: center; gap: 14px; padding: 17px; border: 1px solid #d5ddd8; border-radius: 8px; background: #fff; }
        .internal-admin-teacher-avatar { display: grid; width: 64px; height: 64px; place-items: center; border-radius: 50%; background: #e5f0f5; color: #3e7182; font-size: 24px; font-weight: 700; }
        .internal-admin-teacher-profile-header h2 { margin: 0; color: #182c40; font-size: 22px; }
        .internal-admin-teacher-profile-header p { margin: 4px 0; font-size: 11px; }
        .internal-admin-teacher-profile-header small { color: #7b8780; font-size: 10px; }
        .internal-admin-teacher-profile-header .internal-admin-school-status { margin-left: auto; }
        .internal-admin-teacher-back { padding: 8px 12px; border: 1px solid #cbd8d0; border-radius: 5px; background: #fff; color: #006044; font-size: 11px; cursor: pointer; }
        .internal-admin-teacher-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
        .internal-admin-teacher-profile-grid p { display: flex; flex-direction: column; gap: 5px; margin: 13px 0; color: #59665f; font-size: 11px; }
        .internal-admin-teacher-profile-grid p strong { color: #69756e; font-size: 9px; }
        .internal-admin-teacher-application-row { display: grid; grid-template-columns: 1fr 1fr 90px; gap: 12px; padding: 11px 0; border-bottom: 1px solid #e0e4e1; color: #59665f; font-size: 11px; }
        .internal-admin-teacher-application-row strong { color: #425149; font-weight: 600; }

        .internal-admin-job-filters {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
          padding-bottom: 14px;
          border-bottom: 1px solid #d7dbd8;
        }

        .internal-admin-job-filters button {
          min-height: 31px;
          padding: 6px 14px;
          border: 1px solid #d5dad6;
          border-radius: 10px;
          background: transparent;
          color: #4e5953;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .internal-admin-job-filters button:hover,
        .internal-admin-job-filters button.is-active {
          border-color: #075b2b;
          background: #064c2d;
          color: #ffffff;
        }

        .internal-admin-jobs-table-wrap {
          margin-top: 20px;
          border: 1px solid #cfd5d1;
          border-radius: 4px;
          background: #ffffff;
          overflow: hidden;
        }

        .internal-admin-jobs-table {
          overflow-x: auto;
        }

        .internal-admin-jobs-table-row {
          display: grid;
          grid-template-columns: minmax(155px, 1.25fr) minmax(125px, 1fr) minmax(125px, 1fr) minmax(112px, 0.9fr) minmax(110px, 0.95fr) minmax(110px, 0.95fr) 80px;
          min-width: 920px;
          align-items: center;
          column-gap: 18px;
          padding: 15px 14px;
        }

        .internal-admin-jobs-table-heading {
          min-height: 49px;
          padding-top: 13px;
          padding-bottom: 13px;
          background: #fafafa;
          border-bottom: 1px solid #cfd5d1;
          color: #68706c;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .internal-admin-jobs-table-row:not(.internal-admin-jobs-table-heading) {
          min-height: 85px;
          border-bottom: 1px solid #d9ddda;
          color: #4e5953;
          font-size: 12px;
          line-height: 1.35;
        }

        .internal-admin-jobs-table-row:last-child {
          border-bottom: none;
        }

        .internal-admin-jobs-table-row strong {
          color: #2d3330;
          font-weight: 500;
        }

        .internal-admin-jobs-table-row > span,
        .internal-admin-jobs-table-row > strong {
          min-width: 0;
        }

        .internal-admin-job-status {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 4px 9px;
          border-radius: 12px;
          font-size: 11px;
          white-space: nowrap;
        }

        .internal-admin-job-status::before {
          content: '';
          width: 9px;
          height: 9px;
          margin-right: 4px;
          border: 1px solid currentColor;
          border-radius: 50%;
        }

        .internal-admin-job-status.pending-review {
          background: #fff1c4;
          color: #9a7625;
        }

        .internal-admin-job-status.published {
          background: #cff9bc;
          color: #3c9843;
        }

        .internal-admin-job-status.rejected {
          background: #ffe0dc;
          color: #ee7666;
        }

        .internal-admin-job-status.changes-requested {
          background: #dbeafe;
          color: #3478bd;
        }

        .internal-admin-job-status.reported {
          background: #ffedd5;
          color: #c56b1a;
        }

        .internal-admin-job-status.closed {
          background: #eeeeee;
          color: #68706c;
        }

        .internal-admin-job-action {
          width: fit-content;
          border: none;
          background: transparent;
          color: #386957;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .internal-admin-job-action:hover {
          color: #075b2b;
          text-decoration: underline;
        }

        .internal-admin-jobs-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 48px;
          padding: 8px 13px;
          background: #fafafa;
          color: #5e6962;
          font-size: 11px;
        }

        .internal-admin-job-pagination {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .internal-admin-job-pagination button {
          display: inline-grid;
          place-items: center;
          min-width: 27px;
          height: 28px;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: #53605a;
          font-size: 12px;
          cursor: pointer;
        }

        .internal-admin-job-pagination button.is-active {
          background: #087d3d;
          color: #ffffff;
        }

        .internal-admin-job-pagination button:disabled {
          cursor: default;
          opacity: 0.45;
        }

        .internal-admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .internal-admin-stat-card {
          background: #ffffff;
          border: 1px solid var(--ia-line);
          border-radius: 12px;
          padding: 16px 16px 14px;
          min-height: 118px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(27, 38, 18, 0.04);
        }

        .internal-admin-stat-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .internal-admin-stat-label span {
          color: #222824;
          font-size: 14px;
          font-weight: 500;
        }

        .internal-admin-stat-label svg { color: #4e5b53; }

        .internal-admin-stat-card strong {
          font-size: 28px;
          letter-spacing: -0.04em;
          color: #191f1d;
          line-height: 1;
        }

        .internal-admin-stat-card small {
          color: #56605a;
          font-size: 12px;
          line-height: 1.35;
          max-width: 170px;
        }

        .internal-admin-stat-card.accent {
          background: #ffffff;
        }

        .internal-admin-stat-card.warning {
          background: #fff2a9;
          border-color: #e0ca62;
        }

        .internal-admin-summary-panel,
        .internal-admin-panel {
          background: #ffffff;
          border: 1px solid var(--ia-line);
            border-radius: 14px;
          box-shadow: 0 1px 3px rgba(19, 31, 25, 0.04);
        }

        .internal-admin-summary-panel {
           padding: 0 14px 14px;
          margin-bottom: 0;
        }

        .internal-admin-summary-row {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(250px, 1fr);
          align-items: start;
          gap: 18px;
          margin-bottom: 18px;
        }

        .internal-admin-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
            padding: 14px 0 12px;
          gap: 12px;
        }

        .internal-admin-panel-header h3 {
          margin: 0;
          font-size: 16px;
          letter-spacing: -0.02em;
        }

        .internal-admin-meta-icons button {
          border: 1px solid var(--ia-line);
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: transparent;
          color: #5e6b63;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .internal-admin-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .internal-admin-summary-card {
          border: 1px solid var(--ia-line);
          background: #f6f7f6;
          border-radius: 14px;
          min-height: 78px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
             min-height: 86px;
        }

        .internal-admin-summary-card strong {
          font-size: 27px;
          letter-spacing: -0.06em;
          margin-bottom: 8px;
          line-height: 1;
        }

        .internal-admin-summary-card span {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #5d6a61;
          font-weight: 700;
        }

        .internal-admin-summary-card.green {
          background: #edf9f0;
          border-color: #cde5d3;
        }

        .internal-admin-summary-card.green strong { color: #1e8c3c; }

        .internal-admin-summary-card.amber {
          background: #fff4b6;
          border-color: #e8d57c;
        }

        .internal-admin-summary-card.amber strong { color: #b57a00; }

        .internal-admin-summary-card.gray {
          background: #ffffff;
          border-color: #cfd5d1;
        }

        .internal-admin-summary-card.gray strong { color: #4c5d5b; }

        .internal-admin-summary-card.red {
          background: #ffffff;
          border-color: #cfd5d1;
        }

        .internal-admin-summary-card.red strong { color: #d84a4a; }

        .internal-admin-lower-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(270px, 0.9fr);
          gap: 18px;
        }

        .internal-admin-panel {
          padding: 0 16px 12px;
        }

        .left-panel {
          align-self: start;
          min-height: 340px;
        }

        .internal-admin-link-button {
          border: none;
          background: transparent;
          color: #1f2343;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
        }

        .internal-admin-table-head,
        .internal-admin-table-row {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) 112px 104px 92px;
          align-items: center;
          gap: 12px;
        }

        .internal-admin-table-head {
          padding: 10px 0 11px;
          font-size: 10px;
          color: #7c857f;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border-bottom: 1px solid var(--ia-line);
        }

        .internal-admin-table-row {
          padding: 16px 0;
          border-bottom: 1px solid rgba(227, 231, 224, 0.8);
        }

        .internal-admin-table-row:last-child {
          border-bottom: none;
        }

        .internal-admin-school-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .internal-admin-school-cell strong {
          font-size: 14px;
          color: #1d2322;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .internal-admin-school-cell small,
        .internal-admin-timespan {
          color: #56605a;
          font-size: 12px;
        }

        .internal-admin-status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 11px;
          padding: 7px 10px;
          font-weight: 700;
          width: fit-content;
          border: 1px solid transparent;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .internal-admin-status-pill.pending {
          background: #f1faf2;
          color: #24372b;
          border-color: transparent;
          border-radius: 0;
          padding: 5px 8px;
        }

        .internal-admin-review-btn {
          border: 1px solid #1f2343;
          background: #ffffff;
          color: #1f2343;
          padding: 8px 15px;
          border-radius: 8px;
          font-weight: 500;
          width: fit-content;
          cursor: pointer;
        }

        .internal-admin-side-column {
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-width: 0;
          width: 100%;
        }

        .internal-admin-quick-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .internal-admin-quick-stat {
          min-height: 94px;
          border: 1px solid #cfd5d1;
          border-radius: 12px;
          background: #ffffff;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          color: #a6ada8;
        }

        .internal-admin-quick-stat strong {
          color: #252a27;
          font-size: 24px;
          font-weight: 500;
          margin-top: 1px;
        }

        .internal-admin-quick-stat span {
          color: #a6ada8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .right-panel {
          padding-bottom: 14px;
          min-height: 0;
          align-self: start;
          width: 100%;
          position: relative;
          top: -38px;
        }

        .internal-admin-activity-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-top: 2px;
        }

        .internal-admin-activity-item {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr);
          gap: 10px;
          align-items: flex-start;
          border-radius: 0;
          padding: 10px 4px;
          border: none;
          border-top: 1px solid var(--ia-line);
          background: #ffffff;
        }

        .internal-admin-activity-item strong {
          display: block;
          font-size: 12px;
          color: #1d2322;
          line-height: 1.35;
          margin-top: 2px;
        }

        .internal-admin-activity-item small {
          display: block;
          font-size: 11px;
          color: #252a27;
          margin-top: 2px;
        }

        .internal-admin-activity-item time {
          display: block;
          font-size: 10px;
          color: #b1b7b3;
          padding-top: 4px;
        }

        .internal-admin-activity-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #eaf3ef;
          color: #2d7d4a;
          margin-top: 1px;
        }

        .internal-admin-activity-item.notice .internal-admin-activity-icon {
          background: #fef1d6;
          color: #b77d00;
        }

        .internal-admin-activity-item.info .internal-admin-activity-icon {
          background: #e9f0ff;
          color: #3756c3;
        }

        .internal-admin-activity-item.muted .internal-admin-activity-icon {
          background: #eef1f0;
          color: #586662;
        }

        @media (max-width: 1120px) {
          .internal-admin-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .internal-admin-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .internal-admin-lower-grid {
            grid-template-columns: 1fr;
          }

          .internal-admin-summary-row {
            grid-template-columns: minmax(0, 1fr) minmax(230px, 0.7fr);
          }
        }

        @media (max-width: 860px) {
          .internal-admin-frame {
            display: block;
          }

          .internal-admin-sidebar {
            display: none;
          }

          .internal-admin-main {
            margin-left: 0;
          }

          .internal-admin-content {
            padding: 20px 16px 28px;
          }

          .internal-admin-header {
            left: 0;
            padding: 0 16px;
            height: 74px;
          }

          .internal-admin-header-tools {
            width: 100%;
            justify-content: flex-end;
            gap: 10px;
          }

          .internal-admin-content {
            padding-top: 101px;
          }

          .internal-admin-stat-grid,
          .internal-admin-summary-grid,
          .internal-admin-summary-row {
            grid-template-columns: 1fr;
          }

          .internal-admin-table-head {
            display: none;
          }

          .internal-admin-table-row {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 14px 0 18px;
          }

          .internal-admin-jobs-table-wrap {
            margin-top: 14px;
          }

          .internal-admin-school-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .internal-admin-school-filters {
            width: 100%;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 2px;
          }

          .internal-admin-school-filters button {
            flex: 0 0 auto;
          }

          .internal-admin-school-filter-button {
            align-self: flex-end;
          }

          .internal-admin-school-profile-header,
          .internal-admin-school-profile-header-actions { align-items: flex-start; }
          .internal-admin-school-profile-header { flex-direction: column; }
          .internal-admin-school-profile-header-actions { width: 100%; justify-content: space-between; }
          .internal-admin-school-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .internal-admin-school-info-grid { grid-template-columns: 1fr; gap: 16px; }
          .internal-admin-school-jobs-heading, .internal-admin-school-job-row { min-width: 520px; }
          .internal-admin-teachers-toolbar { align-items: stretch; flex-direction: column; }
          .internal-admin-teachers-toolbar .internal-admin-school-filters { overflow-x: auto; }
          .internal-admin-teacher-profile-header { align-items: flex-start; flex-wrap: wrap; }
          .internal-admin-teacher-profile-header .internal-admin-school-status { margin-left: 0; }
          .internal-admin-teacher-profile-grid { grid-template-columns: 1fr; }

          .internal-admin-schools-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }

          .internal-admin-jobs-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }

          .internal-admin-review-toolbar,
          .internal-admin-review-title {
            align-items: flex-start;
          }

          .internal-admin-review-toolbar {
            flex-direction: column;
          }

          .internal-admin-review-actions {
            width: 100%;
          }

          .internal-admin-review-actions button {
            flex: 1;
          }

          .internal-admin-review-layout,
          .internal-admin-review-two-column {
            grid-template-columns: 1fr;
          }

          .internal-admin-job-summary-details,
          .internal-admin-application-details {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .internal-admin-review-btn,
          .internal-admin-status-pill {
            width: fit-content;
          }
        }
      `}</style>
    </div>
  );
}
