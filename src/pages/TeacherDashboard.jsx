import React, { useState, useEffect, useEffectEvent, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';
import FeedbackButton from '../components/FeedbackButton';
import { useAuth } from '../context/authContext.js';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { featureService } from '../services/featureService';
import { profileService } from '../services/profileService';
import { accountService } from '../services/accountService';
import schoolCampusImage from '../assets/school campus.webp';
import { TEACHER_EXPERTISE_CATEGORIES, normalizeTeacherExpertise, toTeacherExpertisePayload } from '../services/teacherExpertiseService';
import { apiErrorMessage, API_ORIGIN } from '../services/api';
import {
  FiSearch, FiBell, FiMail, FiGrid, FiBriefcase,
  FiFileText, FiMessageSquare, FiSettings, FiPlus,
  FiMapPin, FiEye, FiZap, FiHome, FiCpu, FiBookmark, FiMap, FiFilter, FiCheck, FiChevronDown, FiClock,
  FiBook, FiShare2, FiLink, FiArrowLeft, FiArrowRight, FiCheckCircle, FiDollarSign, FiCreditCard, FiSend, FiCalendar, FiAlertTriangle,
  FiUser, FiEdit2, FiTrash2, FiX, FiRotateCw, FiShield, FiAward, FiDownload, FiUpload, FiLock, FiVideo,
  FiGlobe, FiEyeOff, FiInfo, FiKey, FiMonitor, FiSmartphone, FiLogOut, FiMoreHorizontal, FiMoreVertical, FiBarChart2, FiUsers, FiCopy, FiSliders
} from 'react-icons/fi';

const COVER_LETTER_MAX_LENGTH = 3000;
const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;
const CV_FILE_EXTENSIONS = ['pdf', 'doc', 'docx'];
const SUPPORTING_DOCUMENT_EXTENSIONS = [...CV_FILE_EXTENSIONS, 'jpg', 'jpeg', 'png'];

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return 'Size unavailable';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const getFileNameFromUrl = (url) => String(url || '').split(/[?#]/)[0].split('/').pop() || 'CV document';
const getDocumentMimeType = (fileName) => {
  const extension = String(fileName || '').split('.').pop()?.toLowerCase();
  return ({
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  })[extension] || '';
};

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const splitFullName = (fullName) => {
  const match = String(fullName || '').trim();
  if (!match) return { firstName: 'Teacher', lastName: '' };

  const parts = match.split(/\s+/);
  return {
    firstName: parts[0] || 'Teacher',
    lastName: parts.slice(1).join(' '),
  };
};

const normalizeProfileValue = (value, fallback = 'Not provided') => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
};

const formatJobAge = (value) => {
  if (!value) return 'Date unavailable';

  const postedDate = new Date(value);
  if (Number.isNaN(postedDate.getTime())) return 'Date unavailable';

  const now = new Date();
  const diffMs = now.getTime() - postedDate.getTime();

  if (diffMs <= 0) return 'Just now';

  const minutesAgo = Math.floor(diffMs / 60000);
  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) {
    return minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo === 1) return '1 hour ago';
  if (hoursAgo < 24) return `${hoursAgo} hours ago`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfPostedDay = new Date(postedDate.getFullYear(), postedDate.getMonth(), postedDate.getDate());
  const daysElapsed = Math.floor((startOfToday.getTime() - startOfPostedDay.getTime()) / 86400000);

  if (daysElapsed <= 0) return 'Today';
  if (daysElapsed === 1) return 'Yesterday';
  if (daysElapsed === 2) return '2 days ago';
  if (daysElapsed < 7) return `${daysElapsed} days ago`;

  const weeksElapsed = Math.floor(daysElapsed / 7);
  if (weeksElapsed === 1) return '1 week ago';
  if (weeksElapsed < 5) return `${weeksElapsed} weeks ago`;

  const monthsElapsed = Math.floor(daysElapsed / 30);
  if (monthsElapsed === 1) return '1 month ago';
  if (monthsElapsed < 12) return `${monthsElapsed} months ago`;

  const yearsElapsed = Math.floor(monthsElapsed / 12);
  if (yearsElapsed === 1) return '1 year ago';
  return `${yearsElapsed} years ago`;
};

const parseSubjectList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const getProfileSubjects = (profile = {}) => parseSubjectList(profile.skills || profile.subjects || []);

const parseResponsibilityList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parseResponsibilityList(parsed);
  } catch {
    // Fall back to the API's plain text representation.
  }

  return value
    .split(/[;|\n•]+/)
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
};

const parseLocationParts = (value) => {
  if (typeof value !== 'string') return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const PasswordField = ({ label, value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontSize: 12, textTransform: 'uppercase', color: '#4b5563', letterSpacing: 0.8 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ width: '100%', padding: '12px 44px 12px 14px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 14, outline: 'none' }}
        />
        <button
          type="button"
          aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setShowPassword((current) => !current)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#4b5563', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </label>
  );
};

const normalizeJobId = (value, fallback = '') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value).trim();
};

const getJobRelevanceScore = (job = {}) => {
  if (!job || typeof job !== 'object') return 0;
  const value = Number(
    job.relevance_score ??
    job.relevanceScore ??
    job.recommended_score ??
    job.score ??
    job.match_score ??
    job.priority_score ??
    0
  );
  return Number.isFinite(value) ? value : 0;
};

const parseMonthlySalary = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined || value === '') return 0;

  const salaryText = String(value).replace(/,/g, '').trim().toLowerCase();
  const match = salaryText.match(/(\d+(?:\.\d+)?)\s*(k|m)?/);
  if (!match) return 0;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return 0;
  if (match[2] === 'm') return amount * 1000000;
  if (match[2] === 'k') return amount * 1000;
  return amount;
};

const normalizeJobData = (job = {}, index = 0) => {
  const salaryValue = parseMonthlySalary(
    job.salary_monthly ??
    job.salaryMonthly ??
    job.monthly_salary ??
    job.salary_min ??
    job.min_salary ??
    job.salary ??
    job.salary_range
  );

  const salaryStr = salaryValue > 0
    ? `₦${salaryValue.toLocaleString()} / month`
    : (job.salaryStr || job.salary_range || 'Competitive');

  const timePosted = job.timePosted || job.created_at || job.posted_at || '';

  const realJobId = normalizeJobId(job.job_id || job.id || index, String(index));
  const relevanceScore = getJobRelevanceScore(job);
  const city = String(job.city || job.location_city || job.school_city || '').trim();
  const state = String(job.state || job.location_state || job.school_state || '').trim();
  const location = city && state
    ? `${city}, ${state}`
    : (job.location || city || state || 'Nigeria');

  return {
    id: realJobId,
    job_id: realJobId,
    title: job.title || job.role || job.position || 'Teaching Opportunity',
    school: job.school || job.school_name || job.employer || 'School',
    location,
    city,
    state,
    type: job.type || job.job_type || job.employment_type || 'Full-time',
    subject: job.subject || job.subject_area || 'Teaching',
    salaryStr,
    salaryMonthly: salaryValue,
    timeLabel: timePosted ? formatJobAge(timePosted) : (job.timeLabel || 'Date unavailable'),
    timePosted,
    hot: Boolean(job.hot || job.featured || job.is_hot),
    featured: Boolean(job.featured || job.is_featured),
    education: job.education || job.education_level || job.teaching_level || 'Secondary (SS1-SS3)',
    color: job.color || 'td-bg-darkgreen',
    iconType: job.iconType || 'academic',
    about: job.about || job.description || 'No job description available yet.',
    expectedStartDate: job.expected_start_date || job.start_date || job.job_start_date || '',
    responsibilities: parseResponsibilityList(job.responsibilities || job.job_responsibilities || job.duties),
    requirements: job.requirements || { essential: [], desirable: [] },
    required_experience: job.required_experience || job.requiredExperience || '',
    required_qualification: parseResponsibilityList(job.required_qualification || job.requiredQualification || job.qualifications || job.qualification),
    other_requirements: parseResponsibilityList(job.other_requirements || job.otherRequirements || job.requirements || []),
    employerInfo: job.employerInfo || job.employer_info || 'School information not provided.',
    employerImage: job.employerImage || job.employer_image || '',
    verifiedRecruiter: Boolean(job.verifiedRecruiter || job.verified_recruiter),
    deadline: job.deadline || job.application_deadline || 'October 24th, 2024',
    tags: Array.isArray(job.tags) ? job.tags : [],
    recommended: Boolean(job.recommended || relevanceScore > 0),
    relevanceScore,
  };
};

const normalizeApplicationData = (application = {}, index = 0) => {
  const status = application.status || application.application_status || 'Pending';
  const appliedAt = application.appliedDate || application.applied_at || application.created_at || '';
  const date = new Date(appliedAt);
  const applicationId = application.application_id || application.id || index;

  return {
    id: applicationId,
    application_id: applicationId,
    jobId: application.job_id || application.jobId || '',
    title: application.title || application.job_title || application.position || 'Teaching Opportunity',
    school: application.school || application.school_name || application.employer || 'School',
    status,
    appliedDate: appliedAt && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : 'Not available',
    appliedAt,
    location: application.location || application.job_location || '',
    employmentType: application.employment_type || application.job_type || application.type || '',
    expiresIn: application.expiresIn || application.expires_in || '',
    urgent: application.urgent ?? application.is_urgent ?? false,
    icon: application.icon || '📄',
    tags: Array.isArray(application.tags) ? application.tags : [{ type: 'neutral', label: status }],
    actionText: application.actionText || 'View',
    coverLetter: application.cover_letter || application.coverLetter || '',
    additionalInfo: application.additional_info || application.additionalInfo || '',
    cvUrl: application.cv_url || application.cvUrl || application.cv || '',
    interview: application.interview || null,
  };
};

const normalizeInterviewData = (response) => {
  if (!response || typeof response !== 'object') return null;

  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  const interview =
    payload?.interview ??
    payload?.data?.interview ??
    payload?.data ??
    payload?.result ??
    payload?.details ??
    payload;

  if (!interview || typeof interview !== 'object') return null;

  return {
    ...interview,
    interview_date: interview.interview_date ?? interview.date ?? payload?.interview_date ?? payload?.date ?? '',
    interview_time: interview.interview_time ?? interview.time ?? payload?.interview_time ?? payload?.time ?? '',
    venue: interview.venue ?? interview.location ?? payload?.venue ?? payload?.location ?? '',
    meeting_link: interview.meeting_link ?? payload?.meeting_link ?? '',
    updated_at: interview.updated_at ?? interview.updatedAt ?? payload?.updated_at ?? payload?.updatedAt ?? '',
  };
};

const getInitials = (fullName = '') => {
  const initials = String(fullName).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return initials || 'T';
};

const isFeaturedJob = (job = {}) => {
  const value = job.featured ?? job.is_featured ?? job.isFeatured;
  return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
};

const toTeacherAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^(data:|https?:\/\/)/i.test(assetPath)) return assetPath;
  return `${API_ORIGIN}/${String(assetPath).replace(/^\/+/, '')}`;
};

const toTeacherAssetDownloadUrl = (assetUrl) => {
  const url = new URL(assetUrl, API_ORIGIN);
  return url.origin === API_ORIGIN && url.pathname.startsWith('/uploads/')
    ? `${url.pathname}${url.search}`
    : assetUrl;
};

const formatMonthYear = (value) => {
  if (!/^\d{4}-\d{2}$/.test(String(value))) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(`${value}-01T00:00:00`));
};

const normalizeExperienceRecords = (value) => {
  let records = value;
  if (typeof records === 'string') {
    try {
      records = JSON.parse(records);
    } catch {
      records = [];
    }
  }
  if (!Array.isArray(records)) return [];

  return records.map((record, index) => {
    const startDate = record.start_date || record.startDate || record.start_month || '';
    const endDate = record.end_date || record.endDate || record.end_month || '';
    return {
      ...record,
      experience_id: record.experience_id || record.id || null,
      id: record.id || record.experience_id || `experience-${index}`,
      role: record.role || record.job_title || record.title || '',
      school: record.school || record.institution || record.company || '',
      location: record.location || record.city || '',
      start_date: startDate,
      end_date: endDate,
      description: record.description || record.responsibilities || '',
      period: record.period || [formatMonthYear(startDate), formatMonthYear(endDate)].filter(Boolean).join(' - '),
    };
  });
};

const normalizeEducationRecords = (value) => {
  if (!Array.isArray(value)) return [];

  return value.map((record, index) => ({
    ...record,
    education_id: record.education_id || record.id || null,
    id: record.education_id || record.id || `education-${index}`,
    degree: record.degree || record.qualification || '',
    other_degree: record.other_degree || record.degreeOther || '',
    field_of_study: record.field_of_study || record.fieldOfStudy || '',
    class_of_degree: record.class_of_degree || record.degree_class || record.classOfDegree || '',
    institution: record.institution || record.school || '',
    start_year: record.start_year || record.startYear || '',
    end_year: record.end_year || record.endYear || '',
    period: record.period || [record.start_year || record.startYear, record.end_year || record.endYear].filter(Boolean).join(' – '),
    status: record.status || 'Completed',
  }));
};

const isMeaningfulProfileValue = (value) => {
  if (Array.isArray(value)) return value.some((item) => String(item || '').trim());
  if (typeof value === 'number') return value >= 0;
  return Boolean(String(value || '').trim());
};

const calculateTeacherProfileCompletion = (profile = {}) => {
  const skills = parseSubjectList(profile.skills || profile.subjects || []);
  const teachingLevels = parseSubjectList(profile.teaching_levels || []);
  const education = normalizeEducationRecords(profile.education_history);
  const experience = normalizeExperienceRecords(profile.teaching_experience ?? profile.work_experience ?? profile.experience_history);
  const checks = [
    isMeaningfulProfileValue(profile.role_title),
    isMeaningfulProfileValue(profile.bio),
    Number(profile.experience_years) >= 0,
    isMeaningfulProfileValue(profile.preferred_employment_type),
    isMeaningfulProfileValue(profile.availability),
    skills.length > 0,
    teachingLevels.length > 0,
    isMeaningfulProfileValue(profile.preferred_location || profile.location),
    education.length > 0,
    experience.length > 0,
    isMeaningfulProfileValue(profile.cv_url),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const profileApiErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data || {};
  const fieldErrors = responseData.errors && typeof responseData.errors === 'object'
    ? Object.entries(responseData.errors).map(([field, message]) => `${field}: ${message}`).join(' ')
    : '';
  return fieldErrors || apiErrorMessage(error, fallback);
};

const applicationStatusLabel = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();
  if (normalizedStatus === 'under review' || normalizedStatus === 'reviewed') return 'Under Review';
  if (normalizedStatus === 'shortlisted' || normalizedStatus === 'interviewing') return 'Shortlisted';
  if (normalizedStatus === 'accepted' || normalizedStatus === 'hired') return 'Accepted';
  if (normalizedStatus === 'rejected') return 'Rejected';
  if (normalizedStatus === 'withdrawn') return 'Withdrawn';
  return 'Pending';
};

const getInterviewStart = (interview = {}) => {
  const date = interview.interview_date || interview.date;
  const time = interview.interview_time || interview.time;
  if (!date || !time) return null;
  const start = new Date(`${date}T${time}`);
  return Number.isNaN(start.getTime()) ? null : start;
};

const getApplicationDisplayStatus = (application = {}) => {
  const rawStatus = String(application.status || '').toLowerCase();
  if (application.interview && (rawStatus === 'shortlisted' || rawStatus === 'interviewing')) {
    return 'shortlisted';
  }
  return rawStatus;
};

const teacherLevelOptions = [
  'KG',
  'PRIMARY',
  'JUNIOR SECONDARY (JSS1 - JSS3)',
  'SENIOR SECONDARY (SS1 - SS2)',
];
const normalizeEducationLevel = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const normalized = raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  if (normalized.includes('kg')) return 'KG';
  if (normalized.includes('jss') || normalized.includes('junior secondary')) return 'JUNIOR SECONDARY (JSS1 - JSS3)';
  if (normalized.includes('ss') || normalized.includes('senior secondary')) return 'SENIOR SECONDARY (SS1 - SS2)';
  if (normalized.includes('primary')) return 'PRIMARY';
  if (normalized.includes('tertiary') || normalized.includes('university') || normalized.includes('college')) return 'Tertiary Institution';

  return raw;
};

const normalizeTeachingLevels = (value) => [...new Set(
  parseSubjectList(value).map(normalizeEducationLevel),
)];
const educationMonths = [
  ['01', 'January'], ['02', 'February'], ['03', 'March'], ['04', 'April'],
  ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'],
  ['09', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
];
const educationLevelOptions = ['OND', 'NCE', 'B.Sc', 'B.Ed', 'M.Ed', 'PhD', 'Other'];
const educationFieldOptions = ['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Education', 'Other'];
const createEducationForm = () => ({
  degree: '',
  institution: '',
  fieldOfStudy: '',
  fieldOfStudyOther: '',
  educationLevel: '',
  classOfDegree: '',
  startMonth: '',
  startYear: '',
  endMonth: '',
  endYear: '',
  currentlyStudying: false,
});

export default function TeacherDashboard() {
  const jobsPerPage = 20;
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileSubTab, setProfileSubTab] = useState('overview');
  const [showMoreInformationModal, setShowMoreInformationModal] = useState(false);
  const isRestoringDashboardHistory = useRef(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobOrigin, setSelectedJobOrigin] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [jobsCurrentPage, setJobsCurrentPage] = useState(1);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [isLoadingMoreJobs, setIsLoadingMoreJobs] = useState(false);
  const isLoadingMoreJobsRef = useRef(false);
  const [applications, setApplications] = useState([]);
  const [selectedTeacherInvitation, setSelectedTeacherInvitation] = useState(null);
  const [invitationResponseMessage, setInvitationResponseMessage] = useState('');
  const [showRescheduleInterviewForm, setShowRescheduleInterviewForm] = useState(false);
  const [rescheduleInterviewDraft, setRescheduleInterviewDraft] = useState({ date: '', time: '', message: '' });
  const [preparedInterviewResponse, setPreparedInterviewResponse] = useState(null);
  const [, setCurrentTime] = useState(() => Date.now());
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationSort, setApplicationSort] = useState('newest');
  const [notifications, setNotifications] = useState([]);
  const [showInvitationHistory, setShowInvitationHistory] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationActionLoading, setNotificationActionLoading] = useState({});
  const [loading, setLoading] = useState(false);
  const [appError, setAppError] = useState('');
  const [, setNotifError] = useState('');
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [profileState, setProfileState] = useState({});
  const [teacherProfileLoaded, setTeacherProfileLoaded] = useState(false);
  const [profileViewsCount, setProfileViewsCount] = useState(null);
  const [profileViewLogs, setProfileViewLogs] = useState([]);
  const [profileViewLogsLoading, setProfileViewLogsLoading] = useState(false);
  const [profileViewLogsError, setProfileViewLogsError] = useState('');
  const [profileViewLogsPage, setProfileViewLogsPage] = useState(1);
  const [profileViewLogsTotal, setProfileViewLogsTotal] = useState(0);
  const [profileViewSummary, setProfileViewSummary] = useState({ uniqueSchools: 0, lastViewedAt: '' });

  // ── Personal Info Tab state ──
  const [personalFirstName, setPersonalFirstName] = useState('Teacher');
  const [personalLastName, setPersonalLastName] = useState('');
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [personalPhone, setPersonalPhone] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalCity, setPersonalCity] = useState('');
  const [personalState, setPersonalState] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneChangeError, setPhoneChangeError] = useState('');
  const [savingPhoneNumber, setSavingPhoneNumber] = useState(false);
  const [newEmailAddress, setNewEmailAddress] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [savingEmailAddress, setSavingEmailAddress] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [pendingEmailAddress, setPendingEmailAddress] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState(['', '', '', '', '', '']);
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState(['', '', '', '', '', '']);
  const [showPhoneSuccessSnackbar, setShowPhoneSuccessSnackbar] = useState(false);
  const [showEmailSuccessSnackbar, setShowEmailSuccessSnackbar] = useState(false);
  const [showCvSuccessSnackbar, setShowCvSuccessSnackbar] = useState(false);

  // ── Education Tab state ──
  const [educationList, setEducationList] = useState([]);
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [showPostEducationModal, setShowPostEducationModal] = useState(false);
  const [newEduForm, setNewEduForm] = useState(createEducationForm);
  const [educationDocumentFile, setEducationDocumentFile] = useState(null);
  const [educationDocumentError, setEducationDocumentError] = useState('');
  const educationDocumentInputRef = useRef(null);
  const [sessionCertifications, setSessionCertifications] = useState([]);
  const [editingCertificationId, setEditingCertificationId] = useState(null);
  const [showAddCertificationModal, setShowAddCertificationModal] = useState(false);
  const [certificationForm, setCertificationForm] = useState({
    name: '',
    organisation: '',
    number: '',
    issueMonth: '',
    issueYear: '',
    expiryMonth: '',
    expiryYear: '',
    doesNotExpire: false,
    notes: '',
  });
  const [certificationFile, setCertificationFile] = useState(null);
  const [certificationError, setCertificationError] = useState('');
  const [certificationFileError, setCertificationFileError] = useState('');
  const certificationFileInputRef = useRef(null);
  const [educationError, setEducationError] = useState('');
  const [savingEducation, setSavingEducation] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);

  // ── Teaching Experience Tab state ──
  const [experienceList, setExperienceList] = useState([]);
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [showPostExperienceModal, setShowPostExperienceModal] = useState(false);
  const [expForm, setExpForm] = useState({
    role: '',
    school: '',
    location: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [editingExpId, setEditingExpId] = useState(null);
  const [experienceError, setExperienceError] = useState('');
  const [savingExperience, setSavingExperience] = useState(false);

  // ── CV / Resume Tab state ──
  const [activeResume, setActiveResume] = useState({
    name: 'CV not uploaded',
    uploadDate: 'Not available',
    size: '0 KB'
  });

  // ── Availability Tab state ──
  const [availEmpType, setAvailEmpType] = useState('full-time');
  const [availLocation, setAvailLocation] = useState('');
  const [availStartOption, setAvailStartOption] = useState('immediately');
  const [availSpecificDate, setAvailSpecificDate] = useState('');
  const [availabilityDraft, setAvailabilityDraft] = useState(null);
  const [availabilityTagInput, setAvailabilityTagInput] = useState('');
  const [availabilityLocationInput, setAvailabilityLocationInput] = useState('');
  const [availabilityModalError, setAvailabilityModalError] = useState('');
  const [availabilitySessionExtras, setAvailabilitySessionExtras] = useState({
    employmentTypes: [],
    workArrangements: [],
    salaryRange: '',
    relocationPreference: '',
    notes: '',
  });
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [showProfileUpdatedModal, setShowProfileUpdatedModal] = useState(false);
  const [profileCompletionNotice, setProfileCompletionNotice] = useState('');

  const getAvailabilityStartOption = (profile) => {
    const availableFrom = String(profile?.available_from || '').slice(0, 10);
    if (!availableFrom) return 'immediately';

    const updatedDate = String(profile?.updated_at || profile?.updatedAt || '').slice(0, 10);
    if (!updatedDate) return 'specific-date';

    const daysAfterUpdate = Math.round(
      (Date.parse(`${availableFrom}T00:00:00Z`) - Date.parse(`${updatedDate}T00:00:00Z`)) / 86400000
    );

    if (daysAfterUpdate === 0) return 'immediately';
    if (daysAfterUpdate === 14) return '2-weeks';
    if (daysAfterUpdate > 14 && daysAfterUpdate <= 31) return 'within-month';
    return 'specific-date';
  };

  // ── Settings Subtab state ──
  const [settingsSubTab, setSettingsSubTab] = useState('overview');
  const [loginActivityView, setLoginActivityView] = useState('recent');
  const [loginActivity, setLoginActivity] = useState([]);
  const [loginActivityLoading, setLoginActivityLoading] = useState(false);
  const [loginActivityError, setLoginActivityError] = useState('');
  const [loginActivityPage, setLoginActivityPage] = useState(1);
  const [loginActivityTotal, setLoginActivityTotal] = useState(0);
  const [visibilitySetting, setVisibilitySetting] = useState('schools');
  const [personalInfoOrigin, setPersonalInfoOrigin] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [accountPreferences, setAccountPreferences] = useState({
    job_matches: true,
    application_status: true,
    direct_messages: true,
    system_updates: false,
  });
  const [jobAlertPreferences, setJobAlertPreferences] = useState({
    enabled: true,
    subjects: [],
    teaching_level: '',
    location: '',
  });
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState('');
  const [preferencesError, setPreferencesError] = useState('');

  const formatLoginActivityDate = (value) => {
    const date = new Date(String(value || '').replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const formatLoginDevice = (value) => {
    const device = String(value || '').trim();
    if (!device) return 'Web browser';
    return device.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatProfileViewDate = (value) => {
    const date = new Date(String(value || '').replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };

  const normalizeProfileViewLogs = (items = []) => items.filter(Boolean).map((entry) => ({
    id: entry.view_id,
    schoolName: entry.school_name || 'School',
    schoolLogo: entry.logo_url || '',
    location: [entry.lga, entry.state].filter(Boolean).join(', '),
    viewedAt: formatProfileViewDate(entry.viewed_at),
    timestamp: new Date(String(entry.viewed_at || '').replace(' ', 'T')).getTime() || 0,
  })).sort((first, second) => second.timestamp - first.timestamp);

  const loadProfileViewLogs = async ({ page = 1, append = false } = {}) => {
    try {
      setProfileViewLogsLoading(true);
      setProfileViewLogsError('');
      const response = await profileService.getProfileViews({ page, per_page: 10 });
      const payload = response?.data?.data ?? response?.data ?? {};
      const logs = normalizeProfileViewLogs(payload.views || []);
      setProfileViewsCount(Number(payload.summary?.total_views || 0));
      setProfileViewSummary({
        uniqueSchools: Number(payload.summary?.unique_schools || 0),
        lastViewedAt: payload.summary?.last_viewed_at || '',
      });
      setProfileViewLogs((current) => {
        const combined = append ? [...current, ...logs] : logs;
        return Array.from(new Map(combined.map((entry) => [entry.id, entry])).values())
          .sort((first, second) => second.timestamp - first.timestamp);
      });
      setProfileViewLogsPage(Number(payload.pagination?.current_page || page));
      setProfileViewLogsTotal(Number(payload.pagination?.total || 0));
    } catch (error) {
      setProfileViewLogsError(apiErrorMessage(error, 'Unable to load profile view logs.'));
    } finally {
      setProfileViewLogsLoading(false);
    }
  };

  const loadLoginActivity = async ({ page = 1, append = false } = {}) => {
    try {
      setLoginActivityLoading(true);
      setLoginActivityError('');
      const response = await accountService.getLoginActivity({ page, limit: 10 });
      const payload = response?.data?.data ?? response?.data ?? {};
      const rawItems = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(response?.data?.login_activity)
          ? response.data.login_activity
          : [];
      const normalizedItems = rawItems
        .filter(Boolean)
        .map((entry) => ({
          id: entry.id,
          title: 'Successful Login',
          device: formatLoginDevice(entry.device_name),
          ipAddress: entry.ip_address || 'IP unavailable',
          location: entry.location || '',
          time: formatLoginActivityDate(entry.login_at),
          timestamp: new Date(String(entry.login_at || '').replace(' ', 'T')).getTime() || 0,
        }))
        .sort((first, second) => second.timestamp - first.timestamp);
      setLoginActivity((current) => {
        const combined = append ? [...current, ...normalizedItems] : normalizedItems;
        return Array.from(new Map(combined.map((entry) => [entry.id, entry])).values())
          .sort((first, second) => second.timestamp - first.timestamp);
      });
      setLoginActivityPage(Number(payload?.page || page));
      setLoginActivityTotal(Number(payload?.total || 0));
    } catch (error) {
      setLoginActivityError(apiErrorMessage(error, 'Unable to load login activity.'));
    } finally {
      setLoginActivityLoading(false);
    }
  };

  const refreshLoginActivity = useEffectEvent((options) => loadLoginActivity(options));

  useEffect(() => {
    if (settingsSubTab === 'security') {
      refreshLoginActivity({ page: 1 });
    }
  }, [settingsSubTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeTab, profileSubTab, settingsSubTab, selectedJob, selectedJobOrigin, applicationStatusFilter]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!showPhoneSuccessSnackbar) return undefined;

    const timeoutId = window.setTimeout(() => setShowPhoneSuccessSnackbar(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [showPhoneSuccessSnackbar]);

  useEffect(() => {
    if (!showEmailSuccessSnackbar) return undefined;

    const timeoutId = window.setTimeout(() => setShowEmailSuccessSnackbar(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [showEmailSuccessSnackbar]);

  useEffect(() => {
    if (!showCvSuccessSnackbar) return undefined;

    const timeoutId = window.setTimeout(() => setShowCvSuccessSnackbar(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [showCvSuccessSnackbar]);

  useEffect(() => {
    if (!profileCompletionNotice) return undefined;

    const timeoutId = window.setTimeout(() => setProfileCompletionNotice(''), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [profileCompletionNotice]);

  // ── Professional Info Tab state ──
  const [profTitle, setProfTitle] = useState('Teacher');
  const [profSummary, setProfSummary] = useState('');
  const profSummaryEditedRef = useRef(false);
  const [profYearsExp, setProfYearsExp] = useState('0+ years');
  const [profEmpPref, setProfEmpPref] = useState('Open');
  const [profTeachMode, setProfTeachMode] = useState('Open');
  const [profSubjects, setProfSubjects] = useState([]);
  const [profTeachingLevels, setProfTeachingLevels] = useState([]);
  const [skillExpertise, setSkillExpertise] = useState(() => normalizeTeacherExpertise());
  const [editingExpertiseCategory, setEditingExpertiseCategory] = useState('');
  const [expertiseDraftTags, setExpertiseDraftTags] = useState([]);
  const [expertiseTagInput, setExpertiseTagInput] = useState('');
  const [showBasicProfileModal, setShowBasicProfileModal] = useState(false);
  const [basicProfileError, setBasicProfileError] = useState('');
  const [profileShareMessage, setProfileShareMessage] = useState('');
  const [basicProfileDraft, setBasicProfileDraft] = useState({
    title: '',
    location: '',
    subjects: [],
    teachingLevels: [],
    summary: '',
  });
  const [basicProfileSubjectInput, setBasicProfileSubjectInput] = useState('');
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [profilePhotoError, setProfilePhotoError] = useState('');
  const profilePhotoInputRef = useRef(null);
  const [savingProfessionalInfo, setSavingProfessionalInfo] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationReviewMode, setApplicationReviewMode] = useState(false);
  const [applicationConsent, setApplicationConsent] = useState(false);
  const [showApplicationSuccessModal, setShowApplicationSuccessModal] = useState(false);
  const [reviewCoverLetterEditing, setReviewCoverLetterEditing] = useState(false);
  const [reviewCvEditing, setReviewCvEditing] = useState(false);
  const [reviewCvPreviewOpen, setReviewCvPreviewOpen] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const [sortBy, setSortBy] = useState('Newest First');

  useEffect(() => {
    const historyKey = 'teacher-dashboard-view';
    const currentState = window.history.state || {};

    if (!currentState[historyKey]) {
      window.history.replaceState(
        { ...currentState, [historyKey]: { activeTab: 'dashboard', profileSubTab: 'overview' } },
        '',
        window.location.href
      );
    }

    const handlePopState = (event) => {
      const dashboardView = event.state?.[historyKey];
      if (!dashboardView) return;

      isRestoringDashboardHistory.current = true;
      setActiveTab(dashboardView.activeTab || 'dashboard');
      setProfileSubTab(dashboardView.profileSubTab || 'overview');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isRestoringDashboardHistory.current) {
      isRestoringDashboardHistory.current = false;
      return;
    }

    const historyKey = 'teacher-dashboard-view';
    const currentView = window.history.state?.[historyKey];
    const nextView = { activeTab, profileSubTab };
    if (currentView?.activeTab === activeTab && currentView?.profileSubTab === profileSubTab) return;

    window.history.pushState(
      { ...(window.history.state || {}), [historyKey]: nextView },
      '',
      window.location.href
    );
  }, [activeTab, profileSubTab]);

  const profileFullName = (user?.full_name || [personalFirstName, personalLastName].filter(Boolean).join(' ') || 'Teacher').trim() || 'Teacher';
  const profileLocation = profileState?.location || [personalCity, personalState].filter(Boolean).join(', ') || 'Location not set';
  const profileRoleTitle = profileState?.role_title || profTitle || 'Teacher';
  const profilePreferredEmployment = String(profileState?.preferred_employment_type || '').replace(/[-_]/g, ' ');
  const sessionEmploymentSummary = availabilitySessionExtras.employmentTypes
    .map((type) => type.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(', ');
  const moreJobPreferenceSummary = sessionEmploymentSummary
    ? `${sessionEmploymentSummary}${profileState?.preferred_location ? ` · ${profileState.preferred_location}` : ''}`
    : profilePreferredEmployment
      ? `${profilePreferredEmployment.replace(/\b\w/g, (letter) => letter.toUpperCase())}${profileState?.preferred_location ? ` · ${profileState.preferred_location}` : ''}`
    : 'Tell us the roles, locations and employment types you are interested in.';
  const profileAvailableFromDate = profileState?.available_from
    ? new Date(`${String(profileState.available_from).slice(0, 10)}T00:00:00`)
    : null;
  const moreAvailabilitySummary = profileAvailableFromDate && !Number.isNaN(profileAvailableFromDate.getTime())
    ? `Available from ${profileAvailableFromDate.toLocaleDateString()}.`
    : 'Let schools know when you are available to start.';
  const moreDocumentName = activeResume?.url
    ? activeResume.name
    : String(profileState?.cv_url || '').split('/').pop();
  const moreDocumentsSummary = profileState?.cv_url || activeResume?.url
    ? `CV uploaded: ${moreDocumentName || 'View your uploaded CV.'}`
    : 'Upload your CV and other relevant documents (e.g. testimonials).';
  const isTrcnVerified = Boolean(
    profileState?.trcn_verified ||
    profileState?.is_trcn_verified ||
    profileState?.trcn_verified_at ||
    (typeof profileState?.trcn_status === 'string' && /verified|validated|active/i.test(profileState.trcn_status))
  );
  const trcnStatusLabel = isTrcnVerified
    ? 'TRCN Verified'
    : (profileState?.trcn_number ? 'TRCN Pending Verification' : 'TRCN Not Verified');
  const trcnStatusBadge = isTrcnVerified ? 'ACTIVE' : (profileState?.trcn_number ? 'PENDING' : 'NOT VERIFIED');
  const trcnStatusCardText = isTrcnVerified ? 'Active & Validated' : (profileState?.trcn_number ? 'Pending Verification' : 'Not Verified');
  const totalApplications = applications.length || 0;
  const pendingApplications = applications.filter(app => {
    const s = String(app?.status || '').toLowerCase();
    return s === 'pending' || s === 'shortlisted';
  }).length;
  const visibleApplications = applications
    .filter((application) => {
      const status = getApplicationDisplayStatus(application);
      const matchesStatus = applicationStatusFilter === 'all' || status === applicationStatusFilter;
      const searchTerm = applicationSearch.trim().toLowerCase();
      const matchesSearch = !searchTerm || [application.title, application.school, application.location, application.status].join(' ').toLowerCase().includes(searchTerm);
      return matchesStatus && matchesSearch;
    })
    .sort((first, second) => {
      const firstDate = new Date(first.appliedAt).getTime() || 0;
      const secondDate = new Date(second.appliedAt).getTime() || 0;
      return applicationSort === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
    });
  const selectedJobApplication = selectedJob
    ? applications.find((application) => String(application.jobId) === String(selectedJob.job_id || selectedJob.id))
    : null;
  const getTeacherJobFitScore = useCallback((job = {}) => {
    const teacherProfile = profileState || {};
    let score = 0;
    const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    const employmentPreference = normalize(teacherProfile.preferred_employment_type);
    const employmentType = normalize(job.employment_type || job.type || job.job_type);
    if (employmentPreference && employmentType) {
      const employmentAliases = {
        fulltime: 'full time',
        'full time': 'full time',
        parttime: 'part time',
        'part time': 'part time',
      };
      const preferredType = employmentAliases[employmentPreference.replace(/\s/g, '')] || employmentAliases[employmentPreference] || employmentPreference;
      const jobType = employmentAliases[employmentType.replace(/\s/g, '')] || employmentAliases[employmentType] || employmentType;
      if (preferredType === jobType || preferredType.includes(jobType) || jobType.includes(preferredType)) score += 4;
    }

    const preferredLocation = normalize(teacherProfile.preferred_location || teacherProfile.location);
    const jobLocation = normalize([job.location, job.city, job.state].filter(Boolean).join(' '));
    if (preferredLocation && jobLocation && preferredLocation !== 'nigeria') {
      const preferredParts = preferredLocation.split(' ').filter((part) => part.length > 2);
      if (jobLocation.includes(preferredLocation) || preferredLocation.includes(jobLocation)) {
        score += 4;
      } else if (preferredParts.some((part) => jobLocation.includes(part))) {
        score += 2;
      }
    }

    const teacherSubjects = parseSubjectList(teacherProfile.skills || teacherProfile.subjects).map(normalize).filter(Boolean);
    const jobSubjectText = normalize([job.subject, job.title, ...(Array.isArray(job.tags) ? job.tags : [])].join(' '));
    if (teacherSubjects.some((subject) => jobSubjectText.includes(subject) || subject.includes(jobSubjectText))) score += 5;

    const teacherLevels = parseSubjectList(teacherProfile.teaching_levels).map(normalize).filter(Boolean);
    const jobLevel = normalize(job.education || job.teaching_level || job.education_level);
    if (teacherLevels.some((level) => jobLevel.includes(level) || level.includes(jobLevel))) score += 3;

    const teacherExperience = Number(teacherProfile.experience_years);
    const requiredExperience = Number(String(job.required_experience || '').match(/\d+(?:\.\d+)?/)?.[0]);
    if (Number.isFinite(teacherExperience) && Number.isFinite(requiredExperience)) {
      score += teacherExperience >= requiredExperience ? 2 : -1;
    }

    const availableFrom = String(teacherProfile.available_from || '').slice(0, 10);
    const expectedStart = String(job.expectedStartDate || job.expected_start_date || job.start_date || '').slice(0, 10);
    if (availableFrom && expectedStart) {
      const availableTime = Date.parse(`${availableFrom}T00:00:00Z`);
      const expectedTime = Date.parse(`${expectedStart}T00:00:00Z`);
      if (Number.isFinite(availableTime) && Number.isFinite(expectedTime)) {
        score += availableTime <= expectedTime ? 2 : -3;
      }
    }

    return score;
  }, [profileState]);
  const sortJobsByPreference = useCallback((jobList = [], sortMode = sortBy) => {
    return [...jobList].sort((a, b) => {
      const featuredOrder = Number(isFeaturedJob(b)) - Number(isFeaturedJob(a));
      const aTimeValue = new Date(a.timePosted || a.created_at || 0).getTime();
      const bTimeValue = new Date(b.timePosted || b.created_at || 0).getTime();
      const aTime = Number.isFinite(aTimeValue) ? aTimeValue : 0;
      const bTime = Number.isFinite(bTimeValue) ? bTimeValue : 0;
      const aSalary = Number(a.salaryMonthly || 0);
      const bSalary = Number(b.salaryMonthly || 0);
      const aRecommended = Number(
        a.relevanceScore ??
        a.relevance_score ??
        getJobRelevanceScore(a) ??
        (a.recommended ? 1 : 0) ??
        0
      );
      const bRecommended = Number(
        b.relevanceScore ??
        b.relevance_score ??
        getJobRelevanceScore(b) ??
        (b.recommended ? 1 : 0) ??
        0
      );

      if (sortMode === 'Recommended') {
        const fitDifference = getTeacherJobFitScore(b) - getTeacherJobFitScore(a);
        return fitDifference || featuredOrder || bRecommended - aRecommended || bTime - aTime;
      }
      if (sortMode === 'Newest First') return featuredOrder || bTime - aTime;
      if (sortMode === 'Oldest First') return featuredOrder || aTime - bTime;
      if (sortMode === 'Highest Salary') return featuredOrder || bSalary - aSalary;
      if (sortMode === 'Lowest Salary') return featuredOrder || aSalary - bSalary;
      return featuredOrder || bRecommended - aRecommended || bTime - aTime;
    });
  }, [getTeacherJobFitScore, sortBy]);
  const dashboardJobs = useMemo(() => {
    const recommendedJobs = sortJobsByPreference(
      jobs.filter((job) => job.recommended),
      'Newest First',
    );
    if (recommendedJobs.length) return recommendedJobs.slice(0, 5);

    const fallbackJobs = [...jobs];
    for (let index = fallbackJobs.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [fallbackJobs[index], fallbackJobs[randomIndex]] = [fallbackJobs[randomIndex], fallbackJobs[index]];
    }
    return fallbackJobs.slice(0, 5);
  }, [jobs, sortJobsByPreference]);
  const upcomingInterviews = applications
    .map((application) => {
      const normalizedInterview = normalizeInterviewData(application.interview) || normalizeInterviewData(application) || null;
      return { ...application, interview: normalizedInterview };
    })
    .filter((application) => {
      const interview = normalizeInterviewData(application.interview) || null;
      const start = getInterviewStart(interview || {});
      const status = String(application.status || '').toLowerCase();
      return Boolean(interview) && (status === 'shortlisted' || status === 'interviewing') && start && start.getTime() >= Date.now();
    })
    .sort((first, second) => {
      const firstDate = getInterviewStart(first.interview || {})?.getTime?.() ?? 0;
      const secondDate = getInterviewStart(second.interview || {})?.getTime?.() ?? 0;
      return secondDate - firstDate;
    })
    .slice(0, 3);
  const invitationItems = (() => {
    const records = notifications.flatMap((notification, index) => {
      let payload = notification.data || notification.metadata || notification.payload || {};
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          payload = {};
        }
      }
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) payload = {};

      const searchableText = [
        notification.type,
        notification.title,
        notification.description,
        payload.type,
        payload.title,
      ].filter(Boolean).join(' ').toLowerCase();
      const isInvitation = /\binvit(?:e|ed|ation|ations)\b/.test(searchableText);
      if (!isInvitation) return [];

      const isInterview = searchableText.includes('interview');
      const job = payload.job && typeof payload.job === 'object' ? payload.job : {};
      const applicationId = payload.application_id || notification.application_id;
      const jobId = normalizeJobId(payload.job_id || payload.jobId || job.job_id || job.id || notification.job_id);
      const application = applications.find((item) => (
        (applicationId && String(item.application_id || item.id) === String(applicationId)) ||
        (jobId && String(item.jobId) === jobId)
      ));
      const jobRecord = jobs.find((item) => normalizeJobId(item.job_id || item.id) === jobId) || null;
      const receivedAt = notification.created_at || notification.sent_at || payload.created_at || '';
      const expiresAt = payload.expires_at || payload.expiration_date || payload.deadline || notification.expires_at || '';
      const expiryDate = expiresAt ? new Date(expiresAt) : null;
      const expired = expiryDate && !Number.isNaN(expiryDate.getTime()) && expiryDate.getTime() < Date.now();
      const invitationStatus = String(payload.invitation_status || notification.invitation_status || payload.status || '').toLowerCase();
      const isApplied = Boolean(application && !isInterview);
      const isHistory = Boolean(
        expired ||
        isApplied ||
        /expired|cancelled|canceled|declined|rejected|accepted|applied|completed|withdrawn|closed/.test(invitationStatus)
      );
      const receivedDate = receivedAt ? new Date(receivedAt) : null;
      const daysRemaining = expiryDate && !Number.isNaN(expiryDate.getTime())
        ? Math.ceil((expiryDate.getTime() - Date.now()) / 86400000)
        : null;

      return [{
        key: `notification-${notification.id || index}`,
        invitationId: payload.invitation_id || notification.invitation_id || notification.id || '',
        kind: isInterview ? 'interview' : 'apply',
        school: payload.school_name || payload.school?.name || notification.school_name || notification.school || notification.sender_name || 'School invitation',
        schoolLocation: payload.school?.location || payload.school_location || notification.school_location || jobRecord?.location || '',
        schoolDetails: payload.school && typeof payload.school === 'object' ? payload.school : {},
        role: job.title || payload.job_title || payload.position_title || payload.role_title || application?.title || 'Teaching opportunity',
        receivedAt: receivedDate && !Number.isNaN(receivedDate.getTime())
          ? receivedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : notification.time || 'Recently',
        receivedTimestamp: receivedDate && !Number.isNaN(receivedDate.getTime()) ? receivedDate.getTime() : 0,
        expiresAt: expiryDate && !Number.isNaN(expiryDate.getTime()) ? expiryDate : null,
        daysRemaining,
        details: notification.description || payload.message || '',
        status: isApplied ? 'Applied' : expired ? 'Expired' : invitationStatus || '',
        isHistory,
        jobId,
        jobRecord,
        jobPayload: job,
        payload,
        application,
        notification,
      }];
    });

    const notifiedInterviewKeys = new Set(records
      .filter((record) => record.kind === 'interview')
      .flatMap((record) => [
        record.application ? `application-${record.application.id}` : '',
        record.jobId ? `job-${record.jobId}` : '',
      ])
      .filter(Boolean));
    const interviewRecords = applications
      .filter((application) => {
        const status = String(application.status || '').toLowerCase();
        const interview = normalizeInterviewData(application.interview) || normalizeInterviewData(application) || null;
        if (!interview || !/shortlisted|interviewing/.test(status)) return false;
        const start = getInterviewStart(interview);
        if (!start) return false;
        return !notifiedInterviewKeys.has(`application-${application.id}`)
          && !notifiedInterviewKeys.has(`job-${application.jobId}`);
      })
      .map((application) => {
        const interview = normalizeInterviewData(application.interview) || normalizeInterviewData(application) || {};
        const start = getInterviewStart(interview);
        const isHistory = Boolean(start && start.getTime() < Date.now());
        return {
          key: `interview-${application.id}`,
          kind: 'interview',
          school: application.school || 'School',
          role: application.title || 'Teaching opportunity',
          receivedAt: application.appliedDate || 'Recently',
          receivedTimestamp: new Date(application.appliedAt || 0).getTime() || 0,
          expiresAt: start,
          daysRemaining: null,
          details: `${interview.interview_date || ''}${interview.interview_time ? ` at ${interview.interview_time}` : ''}${interview.venue ? ` · ${interview.venue}` : interview.meeting_link ? ` · ${interview.meeting_link}` : ''}`,
          status: isHistory ? 'Completed' : 'Invited to Interview',
          isHistory,
          jobId: normalizeJobId(application.jobId),
          application,
          notification: null,
        };
      });

    return [...records, ...interviewRecords].sort((first, second) => second.receivedTimestamp - first.receivedTimestamp);
  })();
  const activeInvitations = invitationItems
    .filter((invitation) => !invitation.isHistory)
    .sort((first, second) => {
      if (first.daysRemaining !== null && second.daysRemaining !== null) return first.daysRemaining - second.daysRemaining;
      if (first.daysRemaining !== null) return -1;
      if (second.daysRemaining !== null) return 1;
      return first.receivedTimestamp - second.receivedTimestamp;
    });
  const previousInvitations = invitationItems.filter((invitation) => invitation.isHistory);

  const openTeacherInvitation = (invitation) => {
    setInvitationResponseMessage('');
    setShowRescheduleInterviewForm(false);
    setRescheduleInterviewDraft({ date: '', time: '', message: '' });
    setPreparedInterviewResponse(null);
    setSelectedTeacherInvitation(invitation);
    if (invitation?.notification && !invitation.notification.read) {
      handleMarkNotificationAsRead(invitation.notification.id);
    }
  };
  const renderTeacherInvitationDetails = () => {
    const invitation = selectedTeacherInvitation;
    if (!invitation) return null;

    const payload = invitation.payload || {};
    const job = invitation.jobPayload || invitation.jobRecord || {};
    const school = invitation.schoolDetails || {};
    const role = job.title || payload.job_title || payload.position_title || payload.role_title || invitation.role;
    const location = invitation.schoolLocation || school.location || [school.city, school.state, payload.city, payload.state].filter(Boolean).join(', ');
    const employmentType = job.employment_type || job.type || job.job_type || payload.employment_type || '';
    const teachingLevel = job.education || job.education_level || job.teaching_level || payload.teaching_level || '';
    const subject = job.subject || payload.subject || '';
    const salary = job.salaryStr || job.salary || job.salary_range || payload.salary_range || '';
    const about = job.about || job.description || payload.opportunity_description || payload.job_description || '';
    const personalNote = payload.personal_note || payload.invitation_message || payload.message || invitation.details || '';
    const contactEmail = payload.contact_email || school.contact_email || school.email || '';
    const schoolId = school.id || school.school_id || payload.school_id || '';
    const invitationId = invitation.invitationId || '';
    const isActive = !invitation.isHistory;
    const interview = normalizeInterviewData(
      payload.interview || payload.interview_details || invitation.application?.interview || payload,
    ) || {};
    const interviewDateValue = interview.interview_date || payload.proposed_interview_date || payload.interview_date || '';
    const interviewTimeValue = interview.interview_time || payload.proposed_interview_time || payload.interview_time || '';
    const interviewDate = interviewDateValue ? new Date(`${String(interviewDateValue).slice(0, 10)}T00:00:00`) : null;
    const interviewDateLabel = interviewDate && !Number.isNaN(interviewDate.getTime())
      ? new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(interviewDate)
      : 'Date to be confirmed';
    const interviewTimeDate = interviewTimeValue && !/am|pm/i.test(interviewTimeValue)
      ? new Date(`2000-01-01T${interviewTimeValue}`)
      : null;
    const interviewTimeLabel = interviewTimeValue
      ? interviewTimeDate && !Number.isNaN(interviewTimeDate.getTime())
        ? interviewTimeDate.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
        : interviewTimeValue
      : 'Time to be confirmed';
    const interviewDuration = Number(interview.duration_minutes || interview.duration || payload.duration_minutes || 30);
    const interviewVenue = interview.venue || payload.venue || payload.interview_location || '';
    const interviewLink = interview.meeting_link || interview.meeting_url || payload.meeting_link || payload.meeting_url || '';
    const interviewMode = String(interview.mode || payload.interview_mode || (interviewLink ? 'online' : interviewVenue ? 'in-person' : '')).toLowerCase();
    const schoolCampus = school.campus || school.campus_name || payload.campus || payload.campus_name || '';
    const schoolDescription = school.description || payload.school_description || '';
    const interviewMessage = payload.personal_note || payload.invitation_message || payload.message || invitation.details || '';
    const mapLocation = interviewVenue || school.address || school.location || invitation.schoolLocation || '';
    const checklistItems = Array.isArray(payload.interview_checklist) && payload.interview_checklist.length
      ? payload.interview_checklist
      : ['Review the role and school information', 'Test your webcam and microphone', 'Prepare examples of your teaching experience'];
    const rawInvitationStatus = String(invitation.status || '').trim().toLowerCase();
    const invitationStatusLabel = invitation.isHistory
      ? rawInvitationStatus.replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Invitation Closed'
      : 'Invited to Apply';
    const dateLabel = invitation.expiresAt
      ? invitation.expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    const schoolInitials = String(invitation.school).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

    return (
      <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-invitations-page td-invitation-detail-page">
        <div className="td-invitation-detail-topline">
          <button type="button" className="td-invitation-back" onClick={() => {
            setSelectedTeacherInvitation(null);
            setInvitationResponseMessage('');
          }}>
            <FiArrowLeft size={14} /> Back to Invitations
          </button>
          <span className="td-invitation-id"><i /> {isActive ? 'Invitation Active' : invitation.status || 'Invitation Closed'}{invitationId ? ` · ID: ${invitationId}` : ''}</span>
        </div>

        <header className="td-invitation-detail-heading">
          <span className="td-invitation-eyebrow"><FiShield size={12} /> {invitation.kind === 'interview' ? 'Interview invitation' : 'Direct academic invitation'}</span>
          <h1>{invitation.kind === 'interview' ? 'Interview Invitation' : 'Invitation to Apply'}</h1>
          <p>
            {invitation.kind === 'interview'
              ? `${invitation.school} would like to meet with you about this opportunity.`
              : `${invitation.school} has reviewed your credentials and invited you to apply for this role.`}
          </p>
        </header>

        {invitation.kind === 'interview' ? (
          <>
            <div className="td-interview-invitation-layout">
              <div className="td-interview-invitation-primary-column">
                <section className="td-interview-invitation-card">
                  <div className="td-interview-invitation-school">
                    <span className="td-interview-school-mark"><FiShield size={23} /></span>
                    <div className="td-interview-school-copy">
                      <h2>{invitation.school} <FiCheckCircle size={14} /></h2>
                      <span><FiMapPin size={12} /> {location || 'Location not provided'}</span>
                    </div>
                    <div className="td-interview-school-dates">
                      <span>Received {invitation.receivedAt}</span>
                      {dateLabel && <small><FiClock size={10} /> Expires: {dateLabel}</small>}
                    </div>
                  </div>

                  <section className="td-interview-role-panel">
                    <span>Role offer</span>
                    <h2>{role}</h2>
                    <div className="td-invitation-detail-tags">
                      {employmentType && <span><FiBriefcase size={12} /> {employmentType}</span>}
                      {teachingLevel && <span><FiBook size={12} /> {teachingLevel}</span>}
                      {subject && <span><FiAward size={12} /> {subject}</span>}
                    </div>
                  </section>

                  <section className="td-interview-schedule-panel">
                    <span className="td-interview-schedule-icon"><FiCalendar size={17} /></span>
                    <div className="td-interview-schedule-content">
                      <div className="td-interview-panel-title">
                        <h3>Proposed Interview</h3>
                        <span><i /> Action required</span>
                      </div>
                      <div className="td-interview-schedule-meta">
                        <span><FiCalendar size={13} /> {interviewDateLabel}</span>
                        <span><FiClock size={13} /> {interviewTimeLabel}{interviewDuration > 0 ? ` – ${interviewDuration} mins` : ''}</span>
                      </div>
                      <p>
                        {interviewMode === 'online' || interviewLink
                          ? <> <FiVideo size={12} /> Video interview via {interview.platform || payload.meeting_platform || 'Staffroom Meet'} <small>(Link will be shared upon acceptance)</small></>
                          : <><FiMapPin size={12} /> {interviewVenue || 'Venue to be confirmed'}{schoolCampus ? ` · ${schoolCampus}` : ''}</>}
                      </p>
                    </div>
                  </section>

                  <section className="td-interview-message-panel">
                    <span className="td-interview-message-icon"><FiMessageSquare size={16} /></span>
                    <div className="td-interview-message-content">
                      <h3>Message from the School</h3>
                      <div>
                        <strong>Dear Candidate,</strong>
                        <p>{interviewMessage || `${invitation.school} would like to meet you to discuss the ${role} role and learn more about your teaching experience.`}</p>
                        <strong className="td-interview-message-signoff">— {payload.contact_person || school.contact_person || `${invitation.school} Recruitment Board`}</strong>
                      </div>
                    </div>
                  </section>

                  {invitation.jobRecord ? (
                    <button type="button" className="td-invitation-spec-link" onClick={() => {
                      setSelectedJobOrigin('jobs');
                      setSelectedJob(invitation.jobRecord);
                      setActiveTab('jobs');
                      setSelectedTeacherInvitation(null);
                    }}>
                      <span><FiFileText size={17} /></span>
                      <span><strong>View full job specification &amp; curriculum scope</strong><small>See duties, requirements, and more details for this role.</small></span>
                      <FiArrowRight size={15} />
                    </button>
                  ) : (
                    <div className="td-invitation-spec-link td-interview-spec-unavailable">
                      <span><FiFileText size={17} /></span>
                      <span><strong>Full job specification &amp; curriculum scope</strong><small>Details will appear here when included in the interview invitation.</small></span>
                    </div>
                  )}
                  {invitationResponseMessage && <p className="td-invitation-response-note" role="status">{invitationResponseMessage}</p>}
                </section>

                <section className="td-interview-response-card">
                  <button type="button" className="td-interview-accept-button" disabled={!isActive} onClick={() => setInvitationResponseMessage('Accepting this interview will be available when the interview response endpoint is connected.')}>
                    <FiCheckCircle size={14} /> Accept Interview
                  </button>
                  <button type="button" className="td-interview-reschedule-button" disabled={!isActive} onClick={() => {
                    setInvitationResponseMessage('');
                    setPreparedInterviewResponse(null);
                    setShowRescheduleInterviewForm((visible) => !visible);
                  }}>
                    <FiRotateCw size={14} /> Request Another Time
                  </button>
                  <button type="button" className="td-interview-decline-button" disabled={!isActive} onClick={() => setInvitationResponseMessage('Declining this interview will be available when the interview response endpoint is connected.')}>
                    <FiX size={14} /> Decline
                  </button>
                  {showRescheduleInterviewForm && (
                    <form className="td-interview-reschedule-form" onSubmit={(event) => {
                      event.preventDefault();
                      if (!rescheduleInterviewDraft.date || !rescheduleInterviewDraft.time) {
                        setInvitationResponseMessage('Choose a preferred date and time to prepare your request.');
                        return;
                      }
                      setPreparedInterviewResponse({
                        invitation_id: invitation.invitationId || null,
                        action: 'request_another_time',
                        proposed_date: rescheduleInterviewDraft.date,
                        proposed_time: rescheduleInterviewDraft.time,
                        message: rescheduleInterviewDraft.message.trim(),
                      });
                      setInvitationResponseMessage('Your preferred time is prepared below. It has not been sent because the interview response endpoint is not connected yet.');
                    }}>
                      <h3>Suggest another interview time</h3>
                      <label>Preferred date<input type="date" value={rescheduleInterviewDraft.date} onChange={(event) => setRescheduleInterviewDraft((draft) => ({ ...draft, date: event.target.value }))} required /></label>
                      <label>Preferred time<input type="time" value={rescheduleInterviewDraft.time} onChange={(event) => setRescheduleInterviewDraft((draft) => ({ ...draft, time: event.target.value }))} required /></label>
                      <label>Message to the school<textarea rows="3" value={rescheduleInterviewDraft.message} onChange={(event) => setRescheduleInterviewDraft((draft) => ({ ...draft, message: event.target.value }))} placeholder="Add a note (optional)" /></label>
                      <button type="submit">Prepare request</button>
                      {preparedInterviewResponse && (
                        <p className="td-interview-prepared-request">
                          Prepared for {new Date(`${preparedInterviewResponse.proposed_date}T${preparedInterviewResponse.proposed_time}`).toLocaleString()}
                        </p>
                      )}
                    </form>
                  )}
                </section>
              </div>

              <aside className="td-interview-invitation-aside">
                <section className="td-interview-school-profile-card">
                  <div className="td-interview-school-cover">
                    <img src={school.profile_image || school.cover_image || schoolCampusImage} alt={`${invitation.school} campus`} />
                    <span><FiMapPin size={10} /> {schoolCampus || 'Campus view'}</span>
                  </div>
                  <div className="td-interview-school-profile-body">
                    <h2>About {invitation.school}</h2>
                    <p>{schoolDescription || 'School profile details will be available when included with the invitation.'}</p>
                    <div className="td-interview-school-stat-row">
                      <span><small>Student Body</small><strong>{school.student_count || school.students || '—'}</strong></span>
                      <span><small>Student : Teacher</small><strong>{school.student_teacher_ratio || school.teacher_student_ratio || '—'}</strong></span>
                    </div>
                    <button type="button" onClick={() => setInvitationResponseMessage('The full school profile will be available when school profile details are connected.')}>View full school profile <FiArrowRight size={13} /></button>
                  </div>
                </section>

                <section className="td-interview-campus-card">
                  <div className="td-interview-campus-title"><h2>Campus Location</h2><span>{school.area || school.district || ''}</span></div>
                  <div className="td-interview-map" role="img" aria-label={`Map location: ${mapLocation || location || 'not provided'}`}>
                    <span className="td-interview-map-road td-interview-map-road--one" />
                    <span className="td-interview-map-road td-interview-map-road--two" />
                    <span className="td-interview-map-road td-interview-map-road--three" />
                    <span className="td-interview-map-water" />
                    <span className="td-interview-map-label td-interview-map-label--one">Victoria Island</span>
                    <span className="td-interview-map-label td-interview-map-label--two">Mainland</span>
                    <span className="td-interview-map-pin"><FiMapPin size={15} /></span>
                    <span className="td-interview-map-address"><FiMapPin size={10} /> {mapLocation || location || 'Location details not provided'}</span>
                  </div>
                </section>

                <section className="td-interview-assistance-card">
                  <span><FiInfo size={16} /></span>
                  <div><h2>Need assistance?</h2><p>Have scheduling conflicts or questions before confirming? You can chat directly with the talent coordinator.</p>
                    {contactEmail && <a href={`mailto:${contactEmail}`}>Contact {payload.contact_person || 'Academic HR'} <FiArrowRight size={11} /></a>}
                  </div>
                </section>

                <section className="td-interview-checklist-card">
                  <h2><FiCheckCircle size={13} /> Interview Checklist</h2>
                  <ul>{checklistItems.map((item, index) => <li key={`${item}-${index}`}><FiCheck size={12} />{item}</li>)}</ul>
                </section>
              </aside>
            </div>
          </>
        ) : (
          <>
            <div className="td-invitation-detail-grid">
              <section className="td-invitation-detail-main-card">
                <div className="td-invitation-detail-school">
                  <span className="td-invitation-school-mark">{schoolInitials}</span>
                  <div>
                    <h2>{invitation.school} <FiCheckCircle size={14} /></h2>
                    <span><FiMapPin size={12} /> {location || 'Location not provided'}</span>
                    <span><FiCalendar size={12} /> Received {invitation.receivedAt}</span>
                  </div>
                  <div className="td-invitation-detail-badges">
                    <span className="td-invitation-status">{invitationStatusLabel}</span>
                    {dateLabel && <small><FiClock size={11} /> Expires: {dateLabel}</small>}
                  </div>
                </div>

                <div className="td-invitation-position">
                  <span>Offered position</span>
                  <h2>{role}</h2>
                  <div className="td-invitation-detail-tags">
                    {employmentType && <span><FiBriefcase size={12} /> {employmentType}</span>}
                    {teachingLevel && <span><FiBook size={12} /> {teachingLevel}</span>}
                    {subject && <span><FiAward size={12} /> {subject}</span>}
                    {salary && <span><FiDollarSign size={12} /> {salary}</span>}
                  </div>
                </div>

                <section className="td-invitation-about">
                  <h3>About the opportunity</h3>
                  <p>{about || `${invitation.school} has invited you to apply for the ${role} position. Review the opportunity details with the school before applying.`}</p>
                </section>

                {invitation.jobRecord && (
                  <button type="button" className="td-invitation-spec-link" onClick={() => {
                    setSelectedJobOrigin('jobs');
                    setSelectedJob(invitation.jobRecord);
                    setActiveTab('jobs');
                    setSelectedTeacherInvitation(null);
                  }}>
                    <span><FiFileText size={17} /></span>
                    <span><strong>View full job specification &amp; curriculum requirements</strong><small>See duties, requirements, and more details for this role.</small></span>
                    <FiArrowRight size={15} />
                  </button>
                )}

                {personalNote && (
                  <blockquote className="td-invitation-personal-note">
                    <span><FiMessageSquare size={16} /></span>
                    <div><strong>Personal note from the hiring team</strong><p>{personalNote}</p><small>— {invitation.school} hiring team</small></div>
                  </blockquote>
                )}

                {invitationResponseMessage && <p className="td-invitation-response-note" role="status">{invitationResponseMessage}</p>}

                <div className="td-invitation-response-actions">
                  <button type="button" className="td-invitation-apply-button" onClick={() => {
                    if (invitation.jobRecord) {
                      openApplyModal(invitation.jobRecord, { review: true });
                    } else {
                      setInvitationResponseMessage('Applying from an invitation will be available when the invitation details endpoint provides the linked job.');
                    }
                  }} disabled={!isActive}>
                    <FiCheckCircle size={15} /> Apply for this role <FiArrowRight size={15} />
                  </button>
                  <button type="button" className="td-invitation-decline-button" onClick={() => {
                    setInvitationResponseMessage('Declining invitations will be available when the invitation response endpoint is connected.');
                  }} disabled={!isActive}>
                    <FiX size={15} /> Decline invitation
                  </button>
                </div>
              </section>

              <aside className="td-invitation-detail-aside">
                <section className="td-invitation-school-about">
                  <div className="td-invitation-school-cover">
                    {school.campus || school.campus_name ? <span><FiMapPin size={11} /> {school.campus || school.campus_name}</span> : null}
                  </div>
                  <div className="td-invitation-school-about-body">
                    <h2>About {invitation.school}</h2>
                    <p>{school.description || payload.school_description || 'School profile details will be available when the invitation details endpoint is connected.'}</p>
                    <div className="td-invitation-school-facts">
                      {(school.student_count || school.students) && <span><FiUsers size={12} /> {school.student_count || school.students} Students</span>}
                      {(school.established_year || school.year_established) && <span><FiCalendar size={12} /> Est. {school.established_year || school.year_established}</span>}
                      {school.location_type && <span><FiMapPin size={12} /> {school.location_type}</span>}
                      {school.school_type && <span><FiBook size={12} /> {school.school_type}</span>}
                    </div>
                    {schoolId && <button type="button" onClick={() => setInvitationResponseMessage('School profile details will be available when the invitation details endpoint is connected.')}>View school profile <FiArrowRight size={13} /></button>}
                  </div>
                </section>

                <section className="td-invitation-help-card">
                  <h2><FiInfo size={15} /> Need help?</h2>
                  <p>If you have questions about the invitation, role, or schedule, contact the school directly.</p>
                  {contactEmail && <a href={`mailto:${contactEmail}`}><FiMail size={13} /> {contactEmail} <FiArrowRight size={12} /></a>}
                  <button type="button" onClick={() => setInvitationResponseMessage('Platform guidance will be available here.')}>
                    <FiShield size={13} /> Platform FAQ &amp; Guidelines <FiArrowRight size={12} />
                  </button>
                </section>

                <p className="td-invitation-protection"><FiShield size={13} /> Your contact information is protected until you formally apply.</p>
              </aside>
            </div>

            <div className="td-invitation-benefits">
              <div><span><FiZap size={15} /></span><strong>Priority review</strong><p>Your invitation lets the school know you are interested.</p></div>
              <div><span><FiClock size={15} /></span><strong>School follow-up</strong><p>Schools will follow up through the contact details they provide.</p></div>
              <div><span><FiShield size={15} /></span><strong>Staffroom verified</strong><p>Institution information is shown when supplied with the invitation.</p></div>
            </div>
          </>
        )}
      </Motion.div>
    );
  };
  const getProfileStrengthValue = () => {
    const rawServerStrength = profileState?.profile_strength;
    const serverStrength = Number(rawServerStrength);
    const hasServerStrength = rawServerStrength !== undefined && rawServerStrength !== null && rawServerStrength !== '';
    const strength = hasServerStrength && Number.isFinite(serverStrength)
      ? serverStrength
      : calculateTeacherProfileCompletion(profileState);
    if (!Number.isFinite(strength)) return 0;
    return Math.min(100, Math.max(0, strength));
  };
  const getProfileViewsValue = () => {
    const views = Number(profileViewsCount ?? 0);
    if (!Number.isFinite(views)) return 0;
    return Math.max(0, views);
  };
  const profileStrengthValue = getProfileStrengthValue();
  const profileViewsValue = getProfileViewsValue();
  const isSetupComplete = [
    profileState?.setup_completed,
    profileState?.setupComplete,
    profileState?.profile_complete,
    profileState?.is_profile_complete,
    user?.setup_completed,
    user?.setupComplete,
    user?.profile_complete,
    user?.is_profile_complete,
  ].some((value) => value === true || value === 'true' || value === 1 || value === '1');
  const profileCompletionSteps = [
    { key: 'onboarding', label: 'Initial Setup', completed: isSetupComplete },
    {
      key: 'personal-info',
      label: 'Personal Information',
      completed: Boolean(
        personalFirstName.trim() &&
        personalLastName.trim() &&
        (personalEmail || user?.email) &&
        (personalPhone || user?.phone) &&
        (personalCity || personalState || profileState?.location)
      ),
    },
    {
      key: 'professional-info',
      label: 'Professional Information',
      completed: Boolean(
        profileState?.role_title &&
        profileState?.bio?.trim() &&
        profileState?.experience_years !== null &&
        profileState?.experience_years !== undefined &&
        profileState?.preferred_employment_type &&
        profileState?.availability &&
        parseSubjectList(profileState?.skills || profileState?.subjects || []).length > 0 &&
        parseSubjectList(profileState?.teaching_levels || []).length > 0
      ),
    },
    {
      key: 'education',
      label: 'Education',
      completed: normalizeEducationRecords(profileState?.education_history || educationList).length > 0,
    },
    {
      key: 'teaching-experience',
      label: 'Teaching Experience',
      completed: normalizeExperienceRecords(
        profileState?.teaching_experience ?? profileState?.work_experience ?? profileState?.experience_history ?? experienceList
      ).length > 0,
    },
    {
      key: 'trcn-certification',
      label: 'TRCN Certification',
      completed: Boolean(profileState?.trcn_number || profileState?.trcn_certificate_url || !profileState?.trcn_required),
    },
    {
      key: 'cv-resume',
      label: 'CV / Resume',
      completed: Boolean(profileState?.cv_url || activeResume?.url),
    },
    {
      key: 'availability',
      label: 'Availability',
      completed: Boolean(
        (profileState?.preferred_employment_type || profileState?.employment_type) &&
        (profileState?.preferred_location || profileState?.location) &&
        profileState?.availability &&
        profileState?.available_from
      ),
    },
  ];
  const completedProfileStepCount = profileCompletionSteps.filter((step) => step.completed).length;
  const profileCompletionPercent = Math.round((completedProfileStepCount / profileCompletionSteps.length) * 100);
  const nextProfileStep = profileCompletionSteps.find((step) => !step.completed) || null;
  const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
  const profileCompletionModalSession = useRef({ userKey: '', shown: false });
  const profileCompletionModalItems = [
    {
      key: 'teaching-experience',
      label: 'Teaching Experience',
      description: 'Add at least one current or most recent teaching experience.',
      icon: <FiBriefcase size={25} style={{ color: '#1f9ad7' }} />,
      button: 'Add experience',
      completed: normalizeExperienceRecords(
        profileState?.teaching_experience ?? profileState?.work_experience ?? profileState?.experience_history ?? experienceList,
      ).length > 0,
    },
    {
      key: 'education',
      label: 'Education & Certifications',
      description: 'Add your highest qualification and any relevant teaching certifications (e.g. TRCN).',
      icon: <FiAward size={25} style={{ color: '#9c5ad9' }} />,
      button: 'Add education',
      completed: normalizeEducationRecords(profileState?.education_history || educationList).length > 0,
    },
  ].filter((item) => !item.completed);

  useEffect(() => {
    const userKey = String(user?.user_id || user?.id || user?.email || 'teacher');
    if (profileCompletionModalSession.current.userKey !== userKey) {
      profileCompletionModalSession.current = { userKey, shown: false };
    }

    if (
      activeTab !== 'dashboard' ||
      !teacherProfileLoaded ||
      profileCompletionModalItems.length === 0 ||
      profileCompletionModalSession.current.shown
    ) return undefined;

    profileCompletionModalSession.current.shown = true;
    setShowProfileCompletionModal(true);
    return undefined;
  }, [activeTab, profileCompletionModalItems.length, teacherProfileLoaded, user?.user_id, user?.id, user?.email]);

  const dismissProfileCompletionModal = () => {
    setShowProfileCompletionModal(false);
  };

  const goToNextProfileStep = () => {
    if (!nextProfileStep) return;
    if (nextProfileStep.key === 'onboarding') {
      navigate('/teacher-info');
      return;
    }
    if (nextProfileStep.key === 'personal-info') setPersonalInfoOrigin('profile');
    setActiveTab('profile');
    if (nextProfileStep.key === 'availability') {
      openAvailabilityPreferencesModal();
      return;
    }
    setProfileSubTab(nextProfileStep.key);
  };
  const hasRequiredTeacherApplicationData = () => {
    const educationEntries = normalizeEducationRecords(profileState?.education_history || []);
    const experienceEntries = normalizeExperienceRecords(
      profileState?.teaching_experience ?? profileState?.work_experience ?? profileState?.experience_history ?? []
    );

    return Boolean(
      educationEntries.length > 0 &&
      experienceEntries.length > 0 &&
      (
        profileState?.setup_completed === true ||
        profileState?.setup_completed === 'true' ||
        profileState?.setup_completed === 1 ||
        profileState?.setup_completed === '1' ||
        profileStrengthValue >= 100
      )
    );
  };
  const isTeacherProfileComplete = hasRequiredTeacherApplicationData();
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    yearsExperience: '',
    resumeFile: null,
    useExistingCv: true,
    coverLetter: '',
    additionalInfo: '',
  });
  const [applyDetailsLoading, setApplyDetailsLoading] = useState(false);
  const [alreadyAppliedState, setAlreadyAppliedState] = useState(false);
  const [existingCvUrl, setExistingCvUrl] = useState('');
  const profileCvUrl = toTeacherAssetUrl(existingCvUrl || activeResume?.url || profileState?.cv_url || '');
  const teacherCvUrl = toTeacherAssetUrl(activeResume?.url || profileState?.cv_url || '');
  const cvDocumentUrl = activeResume?.url || profileState?.cv_url || '';
  const cvDocumentName = activeResume?.url && activeResume.name && activeResume.name !== profileFullName
    ? activeResume.name
    : getFileNameFromUrl(cvDocumentUrl);
  const [applicationRequirements, setApplicationRequirements] = useState(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const [pendingCvFile, setPendingCvFile] = useState(null);
  const [showPostCvModal, setShowPostCvModal] = useState(false);
  const hasCvDocument = Boolean(teacherCvUrl || pendingCvFile);
  const displayedCvName = pendingCvFile?.name || cvDocumentName;
  const [cvUploadLoading, setCvUploadLoading] = useState(false);
  const [supportingDocuments, setSupportingDocuments] = useState([]);
  const [supportingDocumentsDraft, setSupportingDocumentsDraft] = useState(null);
  const [savingDocuments, setSavingDocuments] = useState(false);
  const [manageDocumentsError, setManageDocumentsError] = useState('');
  const [cvDropActive, setCvDropActive] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const cvFileInputRef = useRef(null);
  const supportingDocumentFileInputRef = useRef(null);
  const previousDocumentUrlsRef = useRef(new Set());

  useEffect(() => {
    const currentUrls = new Set([
      ...supportingDocuments,
      ...(supportingDocumentsDraft || []),
    ].map((document) => document.previewUrl));
    previousDocumentUrlsRef.current.forEach((url) => {
      if (!currentUrls.has(url)) URL.revokeObjectURL(url);
    });
    previousDocumentUrlsRef.current = currentUrls;
  }, [supportingDocuments, supportingDocumentsDraft]);

  useEffect(() => () => {
    previousDocumentUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const savedEmploymentTypes = availabilitySessionExtras.employmentTypes.length
    ? availabilitySessionExtras.employmentTypes
    : profileState?.preferred_employment_type
      ? [String(profileState.preferred_employment_type)]
      : [];
  const moreEmploymentDisplay = savedEmploymentTypes
    .map((type) => type.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(', ');
  const moreLocationDisplay = String(profileState?.preferred_location || '').split(';').map((location) => location.trim()).filter(Boolean).join(', ');
  const availableFromDate = profileState?.available_from ? new Date(`${String(profileState.available_from).slice(0, 10)}T00:00:00`) : null;
  const moreAvailabilityDisplay = availableFromDate && !Number.isNaN(availableFromDate.getTime())
    ? availableFromDate <= new Date(new Date().toDateString())
      ? 'Available immediately'
      : `Available ${availableFromDate.toLocaleDateString()}`
    : '';
  const moreRelocationDisplay = availabilitySessionExtras.relocationPreference;
  const hasPopulatedPreferences = Boolean(
    moreAvailabilityDisplay ||
    moreEmploymentDisplay ||
    moreLocationDisplay ||
    moreRelocationDisplay
  );
  const hasPopulatedDocuments = Boolean(teacherCvUrl || supportingDocuments.length);
  const hasPopulatedMoreContent = hasPopulatedPreferences || hasPopulatedDocuments;

  useEffect(() => {
    if (!documentPreview) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handlePreviewKeyDown = (event) => {
      if (event.key === 'Escape') setDocumentPreview(null);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handlePreviewKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handlePreviewKeyDown);
    };
  }, [documentPreview]);

  const handleResumeAction = (mode) => {
    if (!profileCvUrl) {
      setAppError('No resume uploaded for this teacher profile.');
      return;
    }

    if (mode === 'view') {
      openDocumentPreview({
        name: activeResume?.url && activeResume.name ? activeResume.name : getFileNameFromUrl(profileCvUrl),
        uri: profileCvUrl,
      });
      return;
    }

    const sourceFileName = getFileNameFromUrl(profileCvUrl);
    const fileExtension = sourceFileName.match(/\.([^.]+)$/)?.[1];
    const downloadName = activeResume?.name
      ? fileExtension && !activeResume.name.toLowerCase().endsWith(`.${fileExtension.toLowerCase()}`)
        ? `${activeResume.name}.${fileExtension}`
        : activeResume.name
      : sourceFileName;
    const link = document.createElement('a');
    link.href = toTeacherAssetDownloadUrl(profileCvUrl);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCvUpload = async (file) => {
    if (!file) return false;

    try {
      const formData = new FormData();
      formData.append('cv', file);
      const response = await profileService.uploadCv(formData);
      const uploadedCvUrl = response?.data?.data?.cv_url
        || response?.data?.data?.profile?.cv_url
        || response?.data?.cv_url;
      await refreshTeacherProfile();

      if (uploadedCvUrl) {
        const cvUrl = toTeacherAssetUrl(uploadedCvUrl);
        setProfileState((currentProfile) => ({ ...(currentProfile || {}), cv_url: uploadedCvUrl }));
        setActiveResume({
          name: file.name,
          uploadDate: new Date().toLocaleDateString(),
          size: formatFileSize(file.size),
          url: cvUrl,
        });
      }

      return true;
    } catch (err) {
      setAppError(apiErrorMessage(err, 'Unable to upload CV.'));
      return false;
    }
  };

  const handleCvSelection = (event) => {
    const nextFile = event.target.files && event.target.files[0];
    if (!nextFile) return;

    const extension = nextFile.name.split('.').pop()?.toLowerCase();
    if (!CV_FILE_EXTENSIONS.includes(extension)) {
      setManageDocumentsError('Choose a PDF, DOC, or DOCX file for your CV.');
      event.target.value = '';
      return;
    }
    if (nextFile.size > MAX_CV_FILE_SIZE) {
      setManageDocumentsError('The CV must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    setPendingCvFile(nextFile);
    setManageDocumentsError('');
    event.target.value = '';
  };

  const confirmCvUpload = async () => {
    if (!pendingCvFile) return;

    setCvUploadLoading(true);
    try {
      const uploaded = await handleCvUpload(pendingCvFile);
      if (uploaded) {
        setPendingCvFile(null);
        if (cvFileInputRef.current) cvFileInputRef.current.value = '';
        setShowCvSuccessSnackbar(true);
        setShowPostCvModal(true);
      }
    } finally {
      setCvUploadLoading(false);
    }
  };

  const cancelCvUpload = () => setPendingCvFile(null);

  const handleSupportingDocumentSelection = (files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    const invalidFile = selectedFiles.find((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return !SUPPORTING_DOCUMENT_EXTENSIONS.includes(extension);
    });
    if (invalidFile) {
      setManageDocumentsError('Supporting documents must be PDF, DOC, DOCX, JPG, or PNG files.');
      return;
    }

    const existingDocuments = supportingDocumentsDraft || supportingDocuments;
    const newDocuments = selectedFiles
      .filter((file) => !existingDocuments.some((document) => (
        document.name === file.name && document.size === file.size && document.lastModified === file.lastModified
      )))
      .map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        addedAt: new Date().toLocaleDateString(),
        previewUrl: URL.createObjectURL(file),
        file,
      }));
    setSupportingDocumentsDraft([...existingDocuments, ...newDocuments]);
    setManageDocumentsError('');
  };

  const openCvDocumentsModal = () => {
    setPendingCvFile(null);
    setSupportingDocumentsDraft([...supportingDocuments]);
    setManageDocumentsError('');
    setProfileSubTab('cv-resume');
  };

  const openDocumentPreview = (document) => {
    if (!document?.uri) {
      setAppError('This document is not available to preview.');
      return;
    }
    setDocumentPreview({
      name: document.name || getFileNameFromUrl(document.uri),
      uri: document.uri,
      type: getDocumentMimeType(document.name) || getDocumentMimeType(getFileNameFromUrl(document.uri)),
    });
  };

  const renderDocumentPreviewModal = () => documentPreview && (
    <div
      className="td-modal-overlay td-document-preview-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setDocumentPreview(null);
      }}
    >
      <section className="td-document-preview-modal" role="dialog" aria-modal="true" aria-labelledby="td-document-preview-title">
        <header>
          <div><h2 id="td-document-preview-title">{documentPreview.name}</h2><p>Document preview</p></div>
          <button type="button" aria-label="Close document preview" onClick={() => setDocumentPreview(null)}><FiX size={19} /></button>
        </header>
        <div className="td-document-preview-viewer">
          {documentPreview.type === 'application/pdf'
            ? <iframe className="td-document-preview-frame" src={documentPreview.uri} title={`${documentPreview.name} preview`} />
            : documentPreview.type?.startsWith('image/')
              ? <img className="td-document-preview-image" src={documentPreview.uri} alt={documentPreview.name} />
              : (
                <div className="td-document-preview-unsupported">
                  <FiInfo size={22} />
                  <strong>Preview not available for this file type</strong>
                  <span>{documentPreview.name} cannot be previewed in the browser. PDF, JPG and PNG previews are supported.</span>
                </div>
              )}
        </div>
      </section>
    </div>
  );

  const closeCvDocumentsModal = () => {
    if (savingDocuments) return;
    setPendingCvFile(null);
    setSupportingDocumentsDraft(null);
    setManageDocumentsError('');
    setCvDropActive(false);
    setProfileSubTab('more');
  };

  const isCvDocumentsOpen = profileSubTab === 'cv-resume';
  useEffect(() => {
    if (!isCvDocumentsOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleModalKeyDown = (event) => {
      if (event.key === 'Escape' && !savingDocuments) {
        setPendingCvFile(null);
        setSupportingDocumentsDraft(null);
        setManageDocumentsError('');
        setCvDropActive(false);
        setProfileSubTab('more');
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleModalKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleModalKeyDown);
    };
  }, [isCvDocumentsOpen, savingDocuments]);

  const handleSaveDocuments = async (event) => {
    event.preventDefault();
    if (savingDocuments) return;
    if (!teacherCvUrl && !pendingCvFile) {
      setManageDocumentsError('A CV is required. Select your CV before saving.');
      return;
    }

    setSavingDocuments(true);
    setManageDocumentsError('');
    try {
      if (pendingCvFile) {
        const uploaded = await handleCvUpload(pendingCvFile);
        if (!uploaded) {
          setManageDocumentsError('CV upload failed. Please review the dashboard alert and try again.');
          return;
        }
        setPendingCvFile(null);
        setShowCvSuccessSnackbar(true);
      }

      if (supportingDocumentsDraft) setSupportingDocuments(supportingDocumentsDraft);
      setSupportingDocumentsDraft(null);
      setProfileSubTab('more');
    } finally {
      setSavingDocuments(false);
    }
  };

  const applyLoadedTeacherProfile = (profileData = {}) => {
    const profile = profileData?.profile || profileData?.teacher_profile || profileData || {};
    const account = profileData?.user || {};
    const { firstName, lastName } = splitFullName(account.full_name || user?.full_name || 'Teacher');

    setProfileState(profile);
    setPersonalFirstName(firstName);
    setPersonalLastName(lastName);
    setPersonalPhone(account.phone || '');
    setPersonalEmail(account.email || user?.email || '');
    setAvailLocation(profile.preferred_location || profile.location || '');
    setAvailEmpType(profile.preferred_employment_type || 'full-time');
    setAvailSpecificDate(profile.available_from || '');
    setAvailStartOption(getAvailabilityStartOption(profile));
    setProfTitle(profile.role_title || 'Teacher');
    if (!profSummaryEditedRef.current) setProfSummary(profile.bio || '');
    setProfYearsExp(profile.experience_years !== undefined && profile.experience_years !== null
      ? `${profile.experience_years}+ years`
      : 'Not provided');
    setProfEmpPref(profile.preferred_employment_type || 'Open');
    setProfTeachMode(profile.availability || 'Open');
    setProfSubjects(getProfileSubjects(profile));
    setProfTeachingLevels(normalizeTeachingLevels(profile.teaching_levels || []));
    setEducationList(normalizeEducationRecords(profile.education_history));
    setExperienceList(normalizeExperienceRecords(
      profile.teaching_experience ?? profile.work_experience ?? profile.experience_history,
    ));
  };

  const handleToggleSaveJob = async (jobId) => {
    const realJobId = normalizeJobId(jobId);

    if (!realJobId) {
      console.error('Save job failed: missing job id', jobId);
      return;
    }

    try {
      if (savedJobIds.includes(realJobId)) {
        await featureService.deleteSavedJob(realJobId);
        setSavedJobIds(prev => prev.filter(id => id !== realJobId));
      } else {
        await featureService.saveJob(realJobId);
        setSavedJobIds(prev => [...prev, realJobId]);
      }
    } catch (err) {
      console.error('Save job failed:', realJobId, apiErrorMessage(err, 'Unable to update saved jobs.'));
    }
  };

  const extractJobsResponse = (response) => {
    const payload = response?.data?.data ?? response?.data ?? response ?? {};
    const fallbackPayload = response?.data ?? response ?? {};
    return {
      jobs: [payload?.jobs, fallbackPayload?.jobs, payload, fallbackPayload].find(Array.isArray) || [],
      pagination: payload?.pagination || fallbackPayload?.pagination || response?.pagination || {},
    };
  };

  const getJobsPageCount = (pagination, resultCount = 0) => {
    const pageSize = Number(pagination?.per_page ?? pagination?.perPage ?? jobsPerPage);
    const reportedPages = Number(pagination?.total_pages ?? pagination?.totalPages ?? 0);
    const totalItems = Number(pagination?.total_items ?? pagination?.totalItems ?? 0);
    const pagesFromTotal = totalItems > 0 && pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;
    const probeNextPage = !reportedPages && !pagesFromTotal && resultCount >= pageSize ? 2 : 0;
    return Math.max(1, reportedPages, pagesFromTotal, probeNextPage);
  };

  const refreshJobListing = async () => {
    try {
      const response = await jobService.getJobs({ page: 1, per_page: jobsPerPage });
      const { jobs: jobsArray, pagination } = extractJobsResponse(response);

      setJobs((currentJobs) => {
        const currentJobsById = new Map(currentJobs.map((job) => [normalizeJobId(job.job_id || job.id), job]));
        jobsArray.forEach((job, index) => {
          const jobId = normalizeJobId(job.job_id || job.id || job?.job?.job_id || job?.job?.id);
          const existingJob = currentJobsById.get(jobId);
          currentJobsById.set(jobId, normalizeJobData({
            ...job,
            recommended: Boolean(job.recommended || existingJob?.recommended),
            relevance_score: getJobRelevanceScore(job) || existingJob?.relevanceScore || 0,
          }, index));
        });
        return Array.from(currentJobsById.values());
      });
      setJobsTotalPages(getJobsPageCount(pagination, jobsArray.length));
    } catch {
      return;
    }
  };

  const refreshTeacherProfile = async () => {
    try {
      const [jobsRes, recommendedJobsRes, applicationsRes, profileRes, notificationsRes, savedRes, profileViewsRes] = await Promise.all([
        jobService.getJobs({ page: 1, per_page: jobsPerPage }),
        jobService.getJobs({ recommended: 1, page: 1, per_page: 10 }).catch(() => null),
        applicationService.getMyApplications().catch(() => null),
        profileService.getMe(),
        featureService.getNotifications().catch(() => null),
        featureService.getSavedJobs().catch(() => null),
        profileService.getProfileViews({ page: 1, per_page: 10 }).catch(() => null),
      ]);

      const { jobs: jobsArray, pagination: jobsPagination } = extractJobsResponse(jobsRes);
      const { jobs: recommendedJobsArray } = extractJobsResponse(recommendedJobsRes);
      setJobsTotalPages(getJobsPageCount(jobsPagination, jobsArray.length));
      const recommendedLookup = new Map(
        recommendedJobsArray.map((job) => {
          const jobId = normalizeJobId(job.job_id || job.id || job?.job?.job_id || job?.job?.id);
          const recommendedJob = { ...job, recommended: true };
          return [jobId, recommendedJob];
        }).filter(([jobId]) => jobId)
      );
      const jobList = jobsArray.map((job) => {
        const jobId = normalizeJobId(job.job_id || job.id || job?.job?.job_id || job?.job?.id);
        const matchedRecommendation = recommendedLookup.get(jobId) || {};
        const mergedJob = {
          ...job,
          ...matchedRecommendation,
          recommended: Boolean(job.recommended || matchedRecommendation.recommended || getJobRelevanceScore(job) > 0 || getJobRelevanceScore(matchedRecommendation) > 0),
          relevance_score: Number(
            job.relevance_score ??
            job.relevanceScore ??
            matchedRecommendation.relevance_score ??
            matchedRecommendation.relevanceScore ??
            getJobRelevanceScore(matchedRecommendation) ??
            getJobRelevanceScore(job) ??
            0
          ),
        };
        return normalizeJobData(mergedJob);
      }).sort((a, b) => (Number(b.relevanceScore || 0) - Number(a.relevanceScore || 0)) || (new Date(b.timePosted || Date.now()).getTime() - new Date(a.timePosted || Date.now()).getTime()));
      const applicationList = (applicationsRes?.data?.data?.applications || applicationsRes?.data?.applications || []).map((app, idx) => normalizeApplicationData(app, idx));
      const applicationsWithInterviews = await Promise.all(applicationList.map(async (application) => {
        const applicationId = application.application_id || application.id;
        const status = String(application.status || '').toLowerCase();
        if (!applicationId || !status.match(/shortlisted|interviewing/)) {
          return application;
        }

        try {
          const interviewResponse = await applicationService.getInterview(applicationId);
          const interviewData = normalizeInterviewData(interviewResponse);
          return { ...application, interview: interviewData };
        } catch {
          return application;
        }
      }));
      const profileData = profileRes?.data?.data || {};
      const profile = profileData?.profile || profileData?.teacher_profile || profileData || {};
      const profileViewsData = profileViewsRes?.data?.data || profileViewsRes?.data || {};
      const totalViews = profileViewsData?.summary?.total_views;
      if (totalViews !== undefined && totalViews !== null) {
        setProfileViewsCount(Number(totalViews));
      }
      setProfileViewSummary({
        uniqueSchools: Number(profileViewsData?.summary?.unique_schools || 0),
        lastViewedAt: profileViewsData?.summary?.last_viewed_at || '',
      });
      setProfileViewLogs(normalizeProfileViewLogs(profileViewsData?.views || []));
      setProfileViewLogsPage(Number(profileViewsData?.pagination?.current_page || 1));
      setProfileViewLogsTotal(Number(profileViewsData?.pagination?.total || 0));
      const notificationList = notificationsRes?.data?.data?.notifications || notificationsRes?.data?.notifications || [];
      const savedJobs = (savedRes?.data?.data?.saved_jobs || savedRes?.data?.saved_jobs || [])
        .map(item => normalizeJobId(item.job_id ?? item.id))
        .filter(Boolean);
      const { firstName, lastName } = splitFullName(profileData?.user?.full_name || user?.full_name || 'Teacher');
      const nextNotifications = (notificationList || []).map((notification) => ({
        ...notification,
        id: notification.notification_id || notification.id,
        type: notification.type || 'job',
        title: notification.title || 'Notification',
        description: notification.message || notification.description || '',
        time: notification.created_at ? new Date(notification.created_at).toLocaleDateString() : 'Recently',
        isNew: Number(notification.is_read ?? notification.read ?? 0) === 0,
        read: Number(notification.is_read ?? notification.read ?? 0) === 1,
        category: notification.type === 'application_status' ? 'Job Alerts' : 'Account',
      }));

      setJobs((currentJobs) => {
        if (Number(jobsPagination.current_page) <= 1 && jobsCurrentPage <= 1) return jobList;
        const jobsById = new Map(currentJobs.map((job) => [normalizeJobId(job.job_id || job.id), job]));
        jobList.forEach((job) => {
          const jobId = normalizeJobId(job.job_id || job.id);
          const existingJob = jobsById.get(jobId);
          jobsById.set(jobId, {
            ...existingJob,
            ...job,
            recommended: Boolean(job.recommended || existingJob?.recommended),
            relevanceScore: job.relevanceScore || existingJob?.relevanceScore || 0,
          });
        });
        return Array.from(jobsById.values());
      });
      setApplications(applicationsWithInterviews);
      setProfileState(profile);
      setTeacherProfileLoaded(true);
      setPersonalFirstName(firstName);
      setPersonalLastName(lastName);
      setPersonalPhone(profileData?.user?.phone || '');
      setPersonalEmail(profileData?.user?.email || user?.email || '');
      const locationParts = parseLocationParts(profile.location || profile.preferred_location || '');
      setPersonalCity(locationParts[0] || '');
      setPersonalState(locationParts.slice(1).join(', ') || '');
      setAvailLocation(profile.preferred_location || profile.location || '');
      setAvailEmpType(profile.preferred_employment_type || 'full-time');
      setAvailSpecificDate(profile.available_from || '');
      setAvailStartOption(getAvailabilityStartOption(profile));
      setProfTitle(profile.role_title || 'Teacher');
      if (!profSummaryEditedRef.current) setProfSummary(profile.bio || '');
      setProfYearsExp(profile.experience_years ? `${profile.experience_years}+ years` : 'Not provided');
      setProfEmpPref(profile.preferred_employment_type || 'Open');
      setProfTeachMode(profile.availability || 'Open');
      setProfSubjects(getProfileSubjects(profile));
      setProfTeachingLevels(normalizeTeachingLevels(profile.teaching_levels || []));
      setEducationList(normalizeEducationRecords(profile.education_history));
      setExperienceList(normalizeExperienceRecords(
        profile.teaching_experience ?? profile.work_experience ?? profile.experience_history
      ));
      const cvUrl = toTeacherAssetUrl(profile.cv_url || '');
      const resumeDisplayName = (profileData?.user?.full_name || user?.full_name || [firstName, lastName].filter(Boolean).join(' ') || 'Current User').trim();
      setActiveResume({
        name: cvUrl ? resumeDisplayName : 'No resume uploaded',
        uploadDate: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Not provided',
        size: cvUrl ? 'Uploaded' : 'Not provided',
        url: cvUrl,
      });
      setSavedJobIds(savedJobs);
      setNotifications(nextNotifications);
    } catch (err) {
      setAppError(apiErrorMessage(err, 'Unable to load applications.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberUpdate = async (event) => {
    event.preventDefault();
    const phoneDigits = newPhoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setPhoneChangeError('Enter a valid Nigerian mobile number.');
      return;
    }

    try {
      setSavingPhoneNumber(true);
      setPhoneChangeError('');
      const response = await accountService.updateProfile({ phone: `+234${phoneDigits.slice(-10)}` });
      const payload = response?.data?.data ?? response?.data ?? {};
      const updatedPhone = payload?.user?.phone || payload?.phone || `+234${phoneDigits.slice(-10)}`;
      setPersonalPhone(updatedPhone);
      setPendingPhoneNumber(updatedPhone);
      setPhoneVerificationCode(['', '', '', '', '', '']);
      setNewPhoneNumber('');
      setShowPhoneVerificationModal(true);
      await refreshTeacherProfile();
    } catch (err) {
      setPhoneChangeError(apiErrorMessage(err, 'Unable to update your phone number.'));
    } finally {
      setSavingPhoneNumber(false);
    }
  };

  const handlePhoneVerificationSuccess = () => {
    setShowPhoneVerificationModal(false);
    setShowPhoneSuccessSnackbar(true);
  };

  const handleEmailVerificationSuccess = () => {
    setShowEmailVerificationModal(false);
    setShowEmailSuccessSnackbar(true);
  };

  const handleEmailAddressUpdate = async (event) => {
    event.preventDefault();
    const email = newEmailAddress.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailChangeError('Enter a valid email address.');
      return;
    }

    try {
      setSavingEmailAddress(true);
      setEmailChangeError('');
      const response = await accountService.updateEmail({ email });
      const payload = response?.data?.data ?? response?.data ?? {};
      const updatedEmail = payload?.user?.email || payload?.email || email;
      setPersonalEmail(updatedEmail);
      setPendingEmailAddress(updatedEmail);
      setEmailVerificationCode(['', '', '', '', '', '']);
      setNewEmailAddress('');
      setShowEmailVerificationModal(true);
      await refreshTeacherProfile();
    } catch (err) {
      setEmailChangeError(apiErrorMessage(err, 'Unable to update your email address.'));
    } finally {
      setSavingEmailAddress(false);
    }
  };

  const initializeDashboardData = useEffectEvent(() => Promise.all([
    refreshTeacherProfile(),
    loadAccountPreferences(),
  ]));

  const refreshDashboardJobs = useEffectEvent(() => refreshJobListing());

  useEffect(() => {
    initializeDashboardData();

    const jobRefreshInterval = window.setInterval(() => {
      refreshDashboardJobs();
    }, 30000);

    return () => window.clearInterval(jobRefreshInterval);
  }, []);

  const getEditableTeacherProfilePayload = ({ education_history, teaching_experience, ...overrides } = {}) => ({
    role_title: profTitle.trim(),
    bio: profSummary.trim(),
    experience_years: Math.max(0, Number.parseInt(profYearsExp, 10) || 0),
    preferred_employment_type: profEmpPref,
    availability: ['Open', 'Available', 'Not available'].includes(profTeachMode) ? profTeachMode : 'Open',
    skills: Array.isArray(profSubjects) ? profSubjects.filter(Boolean) : [],
    teaching_levels: Array.isArray(profTeachingLevels) ? profTeachingLevels.filter(Boolean) : [],
    preferred_location: availLocation.trim(),
    ...(education_history === undefined ? {} : { education_history }),
    ...(teaching_experience === undefined ? {} : { teaching_experience }),
    ...overrides,
  });

  const applyCanonicalTeacherProfile = (profile) => {
    const nextProfile = profile && typeof profile === 'object' ? profile : {};
    setProfileState(nextProfile);
    setProfTitle(nextProfile.role_title || 'Teacher');
    setProfSummary(nextProfile.bio || '');
    profSummaryEditedRef.current = false;
    setProfYearsExp(nextProfile.experience_years ? `${nextProfile.experience_years}+ years` : '0+ years');
    setProfEmpPref(nextProfile.preferred_employment_type || 'Open');
    setProfTeachMode(nextProfile.availability || 'Open');
    setProfSubjects(getProfileSubjects(nextProfile));
    setProfTeachingLevels(normalizeTeachingLevels(nextProfile.teaching_levels || []));
    setAvailLocation(nextProfile.preferred_location || nextProfile.location || '');
    setAvailEmpType(nextProfile.preferred_employment_type || 'full-time');
    setAvailSpecificDate(nextProfile.available_from || '');
    setAvailStartOption(getAvailabilityStartOption(nextProfile));
    setEducationList(normalizeEducationRecords(nextProfile.education_history));
    setExperienceList(normalizeExperienceRecords(nextProfile.teaching_experience));
    return nextProfile;
  };

  const saveUnifiedTeacherProfile = async (overrides = {}) => {
    const response = await profileService.updateTeacher(getEditableTeacherProfilePayload(overrides));
    const responseBody = response?.data || {};
    const responseData = responseBody?.data || {};
    const responseProfile = responseData?.profile || responseBody?.profile || responseData?.teacher_profile;
    const hasProfileFields = responseProfile && Object.keys(responseProfile).some((key) => key !== 'user_id');
    const updatedProfile = hasProfileFields ? responseProfile : await (async () => {
      const profileResponse = await profileService.getMe();
      const profilePayload = profileResponse?.data?.data ?? profileResponse?.data ?? {};
      return profilePayload?.profile || profilePayload?.teacher_profile || {};
    })();
    applyCanonicalTeacherProfile(updatedProfile);
    return updatedProfile;
  };

  const toEducationPayload = (records) => records.map(({ education_id, degree, other_degree, institution, field_of_study, class_of_degree, start_year, end_year, status }) => ({
    education_id: education_id || null,
    degree: String(degree || '').trim(),
    other_degree: String(other_degree || '').trim() || null,
    institution: String(institution || '').trim(),
    field_of_study: (field_of_study || '').trim(),
    class_of_degree: (class_of_degree || '').trim(),
    start_year: Number.parseInt(start_year, 10),
    end_year: end_year ? Number.parseInt(end_year, 10) : null,
    status,
  }));

  const toExperiencePayload = (records) => records.map(({ experience_id, role, school, location, start_date, end_date, description }) => ({
    experience_id: experience_id || null,
    role: role.trim(),
    school: school.trim(),
    location: location.trim(),
    start_date,
    end_date: end_date || null,
    description: description.trim(),
  }));

  const closeEducationModal = () => {
    if (savingEducation) return;
    setShowAddEduModal(false);
    setEducationError('');
    setEducationDocumentError('');
    setEducationDocumentFile(null);
    if (educationDocumentInputRef.current) educationDocumentInputRef.current.value = '';
  };

  const resetCertificationForm = () => {
    setEditingCertificationId(null);
    setCertificationForm({
      name: '',
      organisation: '',
      number: '',
      issueMonth: '',
      issueYear: '',
      expiryMonth: '',
      expiryYear: '',
      doesNotExpire: false,
      notes: '',
    });
    setCertificationFile(null);
    setCertificationError('');
    setCertificationFileError('');
    if (certificationFileInputRef.current) certificationFileInputRef.current.value = '';
  };

  const closeCertificationModal = () => {
    setShowAddCertificationModal(false);
    resetCertificationForm();
  };

  const handleSaveCertification = (event) => {
    event.preventDefault();
    const form = certificationForm;
    if (!form.name.trim() || !form.organisation.trim() || !form.issueMonth || !form.issueYear) {
      setCertificationError('Complete the certification name, issuing organisation, and issue date.');
      return;
    }
    if (!form.doesNotExpire && Boolean(form.expiryMonth) !== Boolean(form.expiryYear)) {
      setCertificationError('Select both the expiry month and year, or mark that the certification does not expire.');
      return;
    }
    if (!form.doesNotExpire && form.expiryMonth && form.expiryYear) {
      const issueDate = `${form.issueYear}-${form.issueMonth}`;
      const expiryDate = `${form.expiryYear}-${form.expiryMonth}`;
      if (expiryDate < issueDate) {
        setCertificationError('The expiry date must be after the issue date.');
        return;
      }
    }

    const savedCertification = {
        ...form,
        name: form.name.trim(),
        organisation: form.organisation.trim(),
        number: form.number.trim(),
        notes: form.notes.trim(),
        fileName: certificationFile?.name || sessionCertifications.find(({ id }) => id === editingCertificationId)?.fileName || '',
        id: editingCertificationId || `session-certification-${Date.now()}`,
      };
    setSessionCertifications((certifications) => editingCertificationId
      ? certifications.map((certification) => certification.id === editingCertificationId ? savedCertification : certification)
      : [...certifications, savedCertification]);
    closeCertificationModal();
  };

  const handleSaveEducation = async () => {
    const isAddingEducation = !editingEducationId;
    const startYear = String(newEduForm.startYear || '');
    const endYear = String(newEduForm.endYear || '');
    const degree = newEduForm.degree.trim();
    const fieldOfStudy = newEduForm.fieldOfStudy === 'Other'
      ? newEduForm.fieldOfStudyOther.trim()
      : newEduForm.fieldOfStudy.trim();
    if (!degree || !newEduForm.institution.trim() || !fieldOfStudy || !newEduForm.educationLevel || !startYear || !newEduForm.startMonth) {
      setEducationError('Complete all required qualification, institution, field of study, education level, and start date fields.');
      return;
    }
    if (newEduForm.fieldOfStudy === 'Other' && !fieldOfStudy) {
      setEducationError('Enter your field of study.');
      return;
    }
    if (!newEduForm.currentlyStudying && (!endYear || !newEduForm.endMonth)) {
      setEducationError('Select an end date or mark that you are currently studying here.');
      return;
    }
    if (!/^\d{4}$/.test(startYear) || (!newEduForm.currentlyStudying && !/^\d{4}$/.test(endYear))) {
      setEducationError('Select a valid start and end year.');
      return;
    }
    const startDate = `${startYear}-${newEduForm.startMonth}`;
    const endDate = `${endYear}-${newEduForm.endMonth}`;
    if (!newEduForm.currentlyStudying && endDate < startDate) {
      setEducationError('The end date must be after the start date.');
      return;
    }

    const educationRecord = {
      education_id: editingEducationId || null,
      degree,
      other_degree: '',
      institution: newEduForm.institution.trim(),
      field_of_study: fieldOfStudy,
      class_of_degree: newEduForm.classOfDegree.trim(),
      start_year: startYear,
      end_year: newEduForm.currentlyStudying ? '' : endYear,
      status: newEduForm.currentlyStudying ? 'In Progress' : 'Completed',
    };
    const nextEducationList = editingEducationId
      ? educationList.map((item) => item.education_id === editingEducationId ? { ...item, ...educationRecord } : item)
      : [...educationList, educationRecord];

    try {
      setSavingEducation(true);
      setEducationError('');
      await saveUnifiedTeacherProfile({
        education_history: toEducationPayload(nextEducationList),
        teaching_experience: toExperiencePayload(experienceList),
      });
      setNewEduForm(createEducationForm());
      setEducationDocumentFile(null);
      setEducationDocumentError('');
      if (educationDocumentInputRef.current) educationDocumentInputRef.current.value = '';
      setEditingEducationId(null);
      setShowAddEduModal(false);
      if (isAddingEducation) setShowPostEducationModal(true);
    } catch (err) {
      setEducationError(profileApiErrorMessage(err, 'Unable to save education.'));
    } finally {
      setSavingEducation(false);
    }
  };

  const handleDeleteExperience = async (experience) => {
    const nextExperienceList = experienceList.filter((item) => item !== experience);
    try {
      setSavingExperience(true);
      setExperienceError('');
      await saveUnifiedTeacherProfile({
        education_history: toEducationPayload(educationList),
        teaching_experience: toExperiencePayload(nextExperienceList),
      });
    } catch (err) {
      setExperienceError(profileApiErrorMessage(err, 'Unable to delete teaching experience.'));
    } finally {
      setSavingExperience(false);
    }
  };

  const handleDeleteEducation = async (education) => {
    const nextEducationList = educationList.filter((item) => item !== education);
    try {
      setSavingEducation(true);
      setEducationError('');
      await saveUnifiedTeacherProfile({
        education_history: toEducationPayload(nextEducationList),
        teaching_experience: toExperiencePayload(experienceList),
      });
    } catch (err) {
      setEducationError(profileApiErrorMessage(err, 'Unable to delete education.'));
    } finally {
      setSavingEducation(false);
    }
  };

  const openExpertiseModal = (category) => {
    setEditingExpertiseCategory(category);
    setExpertiseDraftTags(skillExpertise[category] || []);
    setExpertiseTagInput('');
  };

  const closeExpertiseModal = () => {
    setEditingExpertiseCategory('');
    setExpertiseDraftTags([]);
    setExpertiseTagInput('');
  };

  const addExpertiseTag = () => {
    const tag = expertiseTagInput.trim();
    if (!tag || expertiseDraftTags.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) return;
    setExpertiseDraftTags((tags) => [...tags, tag]);
    setExpertiseTagInput('');
  };

  const saveExpertiseTags = (event) => {
    event.preventDefault();
    setSkillExpertise((categories) => toTeacherExpertisePayload({
      ...categories,
      [editingExpertiseCategory]: expertiseDraftTags,
    }));
    closeExpertiseModal();
  };

  const activeExpertiseCategory = TEACHER_EXPERTISE_CATEGORIES.find(({ key }) => key === editingExpertiseCategory);

  const openBasicProfileModal = () => {
    setBasicProfileDraft({
      title: profileState?.role_title || profTitle || '',
      location: profileState?.preferred_location || profileState?.location || availLocation || '',
      subjects: getProfileSubjects(profileState).length ? getProfileSubjects(profileState) : profSubjects,
      teachingLevels: normalizeTeachingLevels(profileState?.teaching_levels || profTeachingLevels),
      summary: profileState?.bio || profSummary || '',
    });
    setBasicProfileSubjectInput('');
    setBasicProfileError('');
    setProfilePhotoError('');
    setShowBasicProfileModal(true);
  };

  const handleProfilePhotoSelection = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfilePhotoError('Choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfilePhotoError('The profile photo must be 2 MB or smaller.');
      return;
    }

    try {
      setProfilePhotoUploading(true);
      setProfilePhotoError('');
      const formData = new FormData();
      formData.append('profile_photo', file);
      const response = await accountService.uploadProfilePhoto(formData);
      const payload = response?.data?.data ?? response?.data ?? {};
      const photoUrl = payload?.user?.profile_photo || payload?.profile_photo;
      if (!photoUrl) throw new Error('The server did not return the uploaded profile photo.');
      setProfileState((current) => ({ ...current, profile_photo: photoUrl }));
    } catch (error) {
      setProfilePhotoError(apiErrorMessage(error, 'Unable to upload profile photo.'));
    } finally {
      setProfilePhotoUploading(false);
    }
  };

  useEffect(() => {
    if (!showBasicProfileModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleModalKeyDown = (event) => {
      if (event.key === 'Escape' && !savingProfessionalInfo && !profilePhotoUploading) {
        setShowBasicProfileModal(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleModalKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleModalKeyDown);
    };
  }, [showBasicProfileModal, savingProfessionalInfo, profilePhotoUploading]);

  const handleSaveBasicProfile = async (event) => {
    event.preventDefault();
    if (!basicProfileDraft.title.trim() || !basicProfileDraft.location.trim() || basicProfileDraft.subjects.length === 0 || basicProfileDraft.teachingLevels.length === 0 || !basicProfileDraft.summary.trim()) {
      setBasicProfileError('Complete all required fields before saving.');
      return;
    }

    try {
      setSavingProfessionalInfo(true);
      setBasicProfileError('');
      await saveUnifiedTeacherProfile({
        role_title: basicProfileDraft.title.trim(),
        preferred_location: basicProfileDraft.location.trim(),
        skills: basicProfileDraft.subjects,
        teaching_levels: basicProfileDraft.teachingLevels,
        bio: basicProfileDraft.summary.trim(),
        education_history: toEducationPayload(educationList),
        teaching_experience: toExperiencePayload(experienceList),
      });
      setShowBasicProfileModal(false);
    } catch (error) {
      setBasicProfileError(profileApiErrorMessage(error, 'Unable to save profile information.'));
    } finally {
      setSavingProfessionalInfo(false);
    }
  };

  const savedAvailabilityDate = String(profileState?.available_from || '').slice(0, 10);
  const savedAvailabilityOption = getAvailabilityStartOption(profileState);
  const availabilityHasChanges = (
    availEmpType !== (profileState?.preferred_employment_type || 'full-time') ||
    availLocation.trim() !== (profileState?.preferred_location || profileState?.location || '').trim() ||
    availStartOption !== savedAvailabilityOption ||
    (availStartOption === 'specific-date' && availSpecificDate !== savedAvailabilityDate)
  );

  const handleSaveAvailability = async () => {
    const availableFrom = availStartOption === 'specific-date'
      ? availSpecificDate
      : availStartOption === '2-weeks'
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    if (availStartOption === 'specific-date' && !availSpecificDate) {
      setAppError('Select a date when you will be available.');
      return;
    }

    try {
      setSavingAvailability(true);
      setAppError('');
      await saveUnifiedTeacherProfile({
        preferred_employment_type: availEmpType,
        preferred_location: availLocation.trim(),
        available_from: availableFrom,
        availability: 'Open',
        education_history: toEducationPayload(educationList),
        teaching_experience: toExperiencePayload(experienceList),
      });
      setAvailStartOption(availStartOption);
      setShowProfileUpdatedModal(true);
    } catch (err) {
      setAppError(profileApiErrorMessage(err, 'Unable to save availability.'));
    } finally {
      setSavingAvailability(false);
    }
  };

  const openAvailabilityPreferencesModal = () => {
    const savedEmploymentType = String(profileState?.preferred_employment_type || '').toLowerCase().replace(/[\s_]+/g, '-');
    const employmentTypes = availabilitySessionExtras.employmentTypes.length > 1
      ? [...availabilitySessionExtras.employmentTypes]
      : ['full-time', 'part-time', 'contract'].includes(savedEmploymentType)
        ? [savedEmploymentType]
        : [...availabilitySessionExtras.employmentTypes];
    const currentLevels = normalizeTeachingLevels(profileState?.teaching_levels || profTeachingLevels);
    const teachingLevels = [
      ...(currentLevels.includes('KG') ? ['Early Years'] : []),
      ...(currentLevels.includes('PRIMARY') ? ['Primary'] : []),
      ...(currentLevels.some((level) => level.includes('SECONDARY')) ? ['Secondary'] : []),
      ...(currentLevels.some((level) => /tertiary|post-secondary/i.test(level)) ? ['Post-Secondary'] : []),
    ];

    setAvailabilityDraft({
      roles: [...profSubjects],
      locations: availLocation.split(';').map((location) => location.trim()).filter(Boolean),
      employmentTypes,
      teachingLevels,
      availableStart: getAvailabilityStartOption(profileState || {}),
      specificDate: String(profileState?.available_from || '').slice(0, 10),
      workArrangements: [...availabilitySessionExtras.workArrangements],
      salaryRange: availabilitySessionExtras.salaryRange,
      relocationPreference: availabilitySessionExtras.relocationPreference,
      notes: availabilitySessionExtras.notes,
    });
    setAvailabilityTagInput('');
    setAvailabilityLocationInput('');
    setAvailabilityModalError('');
    setProfileSubTab('availability');
  };

  const closeAvailabilityPreferencesModal = () => {
    if (savingAvailability) return;
    setAvailabilityDraft(null);
    setAvailabilityModalError('');
    setProfileSubTab('more');
  };

  const isAvailabilityPreferencesOpen = profileSubTab === 'availability' && Boolean(availabilityDraft);
  useEffect(() => {
    if (!isAvailabilityPreferencesOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleModalKeyDown = (event) => {
      if (event.key === 'Escape' && !savingAvailability) {
        setAvailabilityDraft(null);
        setAvailabilityModalError('');
        setProfileSubTab('more');
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleModalKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleModalKeyDown);
    };
  }, [isAvailabilityPreferencesOpen, savingAvailability]);

  const addAvailabilityDraftTag = () => {
    const tag = availabilityTagInput.trim();
    if (!tag || availabilityDraft.roles.some((role) => role.toLocaleLowerCase() === tag.toLocaleLowerCase())) return;
    setAvailabilityDraft((draft) => ({ ...draft, roles: [...draft.roles, tag] }));
    setAvailabilityTagInput('');
  };

  const addAvailabilityDraftLocation = () => {
    const location = availabilityLocationInput.trim();
    if (!location || availabilityDraft.locations.some((item) => item.toLocaleLowerCase() === location.toLocaleLowerCase())) return;
    setAvailabilityDraft((draft) => ({ ...draft, locations: [...draft.locations, location] }));
    setAvailabilityLocationInput('');
  };

  const handleSaveAvailabilityPreferences = async (event) => {
    event.preventDefault();
    if (!availabilityDraft) return;
    if (availabilityDraft.availableStart === 'specific-date' && !availabilityDraft.specificDate) {
      setAvailabilityModalError('Choose the date you will be available to start.');
      return;
    }

    const startDate = new Date();
    const dayOffset = availabilityDraft.availableStart === '2-weeks' ? 14 : availabilityDraft.availableStart === 'within-month' ? 30 : 0;
    if (availabilityDraft.availableStart !== 'specific-date') startDate.setDate(startDate.getDate() + dayOffset);
    const availableFrom = availabilityDraft.availableStart === 'specific-date'
      ? availabilityDraft.specificDate
      : `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const apiTeachingLevels = [
      ...(availabilityDraft.teachingLevels.includes('Early Years') ? ['KG'] : []),
      ...(availabilityDraft.teachingLevels.includes('Primary') ? ['PRIMARY'] : []),
      ...(availabilityDraft.teachingLevels.includes('Secondary') ? ['JUNIOR SECONDARY (JSS1 - JSS3)', 'SENIOR SECONDARY (SS1 - SS2)'] : []),
      ...(availabilityDraft.teachingLevels.includes('Post-Secondary') ? ['Tertiary Institution'] : []),
    ];
    const preferredEmploymentType = availabilityDraft.employmentTypes.length === 1
      ? availabilityDraft.employmentTypes[0]
      : profEmpPref;
    const preferredLocation = availabilityDraft.locations.join('; ');

    try {
      setSavingAvailability(true);
      setAvailabilityModalError('');
      await saveUnifiedTeacherProfile({
        skills: availabilityDraft.roles,
        teaching_levels: apiTeachingLevels,
        preferred_employment_type: preferredEmploymentType,
        preferred_location: preferredLocation,
        available_from: availableFrom,
        availability: 'Open',
        education_history: toEducationPayload(educationList),
        teaching_experience: toExperiencePayload(experienceList),
      });
      setAvailabilitySessionExtras({
        employmentTypes: [...availabilityDraft.employmentTypes],
        workArrangements: [...availabilityDraft.workArrangements],
        salaryRange: availabilityDraft.salaryRange,
        relocationPreference: availabilityDraft.relocationPreference,
        notes: availabilityDraft.notes.trim(),
      });
      if (availabilityDraft.employmentTypes.length === 1) setAvailEmpType(availabilityDraft.employmentTypes[0]);
      setAvailLocation(preferredLocation);
      setProfileCompletionNotice('Job preferences and availability saved.');
      setAvailabilityDraft(null);
      setProfileSubTab('more');
    } catch (error) {
      setAvailabilityModalError(profileApiErrorMessage(error, 'Unable to save job preferences and availability.'));
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    const firstName = personalFirstName.trim();
    const lastName = personalLastName.trim();
    if (!firstName || !lastName) {
      setAppError('First name and last name are required.');
      return;
    }

    try {
      setSavingPersonalInfo(true);
      setAppError('');
      await accountService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
      });
      await saveUnifiedTeacherProfile({
        education_history: toEducationPayload(educationList),
        teaching_experience: toExperiencePayload(experienceList),
      });
      setShowProfileUpdatedModal(true);
    } catch (err) {
      setAppError(profileApiErrorMessage(err, 'Unable to save personal information.'));
    } finally {
      setSavingPersonalInfo(false);
    }
  };

  const handleSaveExperience = async () => {
    const isAddingExperience = !editingExpId;
    if (!expForm.role.trim() || !expForm.school.trim() || !/^\d{4}-\d{2}$/.test(expForm.start_date) || (expForm.end_date && !/^\d{4}-\d{2}$/.test(expForm.end_date))) {
      setExperienceError('Complete the role, school, and valid start and end months.');
      return;
    }
    if (expForm.end_date && expForm.end_date < expForm.start_date) {
      setExperienceError('The end month must be after the start month.');
      return;
    }
    if (expForm.description.length > 5000) {
      setExperienceError('Description must not exceed 5000 characters.');
      return;
    }

    const experienceRecord = {
      ...expForm,
      experience_id: editingExpId || null,
      role: expForm.role.trim(),
      school: expForm.school.trim(),
      location: expForm.location.trim(),
      description: expForm.description.trim(),
      period: [formatMonthYear(expForm.start_date), formatMonthYear(expForm.end_date)].filter(Boolean).join(' - '),
    };
    const experiencePayload = toExperiencePayload([experienceRecord])[0];

    try {
      setSavingExperience(true);
      setExperienceError('');
      if (editingExpId) {
        await profileService.updateExperience(editingExpId, experiencePayload);
      } else {
        await profileService.createExperience(experiencePayload);
      }
      const response = await profileService.getMe();
      const profileData = response?.data?.data ?? response?.data ?? {};
      applyLoadedTeacherProfile(profileData);
      setShowAddExpModal(false);
      if (isAddingExperience) setShowPostExperienceModal(true);
    } catch (err) {
      setExperienceError(profileApiErrorMessage(err, 'Unable to save teaching experience.'));
    } finally {
      setSavingExperience(false);
    }
  };

  // ── Settings state ──
  const loadAccountPreferences = async () => {
    try {
      const [preferencesResponse, jobAlertsResponse] = await Promise.all([
        accountService.getPreferences().catch(() => null),
        featureService.getJobAlerts().catch(() => null),
      ]);

      const payload = preferencesResponse?.data?.data ?? preferencesResponse?.data?.preferences ?? preferencesResponse?.data ?? {};
      const normalized = payload && typeof payload === 'object' && !Array.isArray(payload)
        ? payload
        : {};

      const jobAlertsPayload = jobAlertsResponse?.data?.data ?? jobAlertsResponse?.data?.job_alerts ?? jobAlertsResponse?.data ?? {};
      const normalizedJobAlerts = jobAlertsPayload && typeof jobAlertsPayload === 'object' && !Array.isArray(jobAlertsPayload)
        ? jobAlertsPayload
        : {};

      setAccountPreferences({
        job_matches: Boolean(normalized.job_matches ?? normalized.jobMatch ?? true),
        application_status: Boolean(normalized.application_status ?? normalized.appStatus ?? true),
        direct_messages: Boolean(normalized.direct_messages ?? normalized.directMsg ?? true),
        system_updates: Boolean(normalized.system_updates ?? normalized.sysAnnounce ?? false),
      });
      setJobAlertPreferences({
        enabled: Boolean(normalizedJobAlerts.enabled ?? true),
        subjects: Array.isArray(normalizedJobAlerts.subjects) ? normalizedJobAlerts.subjects : [],
        teaching_level: normalizedJobAlerts.teaching_level ?? normalizedJobAlerts.teachingLevel ?? '',
        location: normalizedJobAlerts.location ?? '',
      });
    } catch (err) {
      setPreferencesError(apiErrorMessage(err, 'Unable to load notification preferences.'));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    const { current_password, new_password, confirm_password } = passwordForm;
    if (!current_password || !new_password || !confirm_password) {
      setPasswordError('Please complete all password fields.');
      return;
    }
    if (new_password !== confirm_password) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      await accountService.updatePassword({ current_password, new_password, confirm_password });
      setPasswordMessage('Password updated successfully.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordError(apiErrorMessage(err, 'Unable to update password.'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handlePreferenceToggle = async (key) => {
    const nextValue = !accountPreferences[key];
    const nextPreferences = { ...accountPreferences, [key]: nextValue };
    setAccountPreferences(nextPreferences);
    setPreferencesError('');
    setPreferencesMessage('');

    try {
      setSavingPreferences(true);
      await accountService.updatePreferences(nextPreferences);
      if (key === 'job_matches') {
        await featureService.updateJobAlerts({
          ...jobAlertPreferences,
          enabled: nextValue,
        });
      }
      setPreferencesMessage('Notification preferences saved.');
    } catch (err) {
      setPreferencesError(apiErrorMessage(err, 'Unable to save notification preferences.'));
      setAccountPreferences(accountPreferences);
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    const passwordValue = passwordForm.current_password || window.prompt('Enter your password to confirm account deletion:');
    if (!passwordValue) return;

    const confirmed = window.confirm('This action will delete your Staffroom account. This cannot be undone. Continue?');
    if (!confirmed) return;

    try {
      await accountService.deleteAccount({ password: passwordValue });
      logout();
    } catch (err) {
      setPasswordError(apiErrorMessage(err, 'Unable to delete account.'));
    }
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

  const openApplyModal = async (targetJob = null, options = {}) => {
    const jobToApply = targetJob || selectedJob;
    if (!jobToApply) return;

    if (!hasRequiredTeacherApplicationData()) {
      setSelectedJob(null);
      setApplicationError('');
      setProfileSubTab('overview');
      setActiveTab('profile');
      setProfileCompletionNotice('Please complete your profile setup before applying for a job.');
      return;
    }

    setSelectedJob(jobToApply);
    const jobId = normalizeJobId(jobToApply.job_id || jobToApply.id);

    setApplicationForm({
      name: profileFullName,
      email: personalEmail || user?.email || '',
      phone: personalPhone || user?.phone || '',
      yearsExperience: profYearsExp || '',
      resumeFile: null,
      coverLetterFile: null,
      useExistingCv: true,
      coverLetter: String(profileState?.cover_letter || profileState?.coverLetter || '').slice(0, COVER_LETTER_MAX_LENGTH),
      additionalInfo: '',
    });
    setApplicationStep(1);
    setApplicationReviewMode(Boolean(options.review));
    setApplicationConsent(false);
    setReviewCoverLetterEditing(!(profileState?.cover_letter || profileState?.coverLetter || '').trim());
    setReviewCvEditing(false);
    setAlreadyAppliedState(false);
    setApplicationRequirements(null);
    setApplicationError('');
    setApplyDetailsLoading(true);
    setShowApplyModal(true);

    try {
      const response = await applicationService.getApplyDetails(jobId);
      const payload = response?.data?.data ?? response?.data ?? {};
      if (payload.already_applied) {
        setAlreadyAppliedState(true);
      }
      const cvUrl = payload.existing_cv_url || activeResume?.url || profileState?.cv_url || '';
      setExistingCvUrl(cvUrl);
      setApplicationRequirements(payload.requirements || null);
    } catch {
      setExistingCvUrl(activeResume?.url || profileState?.cv_url || '');
      setApplicationRequirements(null);
    } finally {
      setApplyDetailsLoading(false);
    }
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setApplicationReviewMode(false);
    setApplicationConsent(false);
    setReviewCoverLetterEditing(false);
    setReviewCvEditing(false);
    setAlreadyAppliedState(false);
    setApplicationRequirements(null);
    setApplicationError('');
  };

  const handleApplicationInput = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: name === 'coverLetter' ? value.slice(0, COVER_LETTER_MAX_LENGTH) : value,
    }));
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0] || null;
    setApplicationForm(prev => ({ ...prev, resumeFile: file, useExistingCv: false }));
  };

  const refreshApplications = async () => {
    const response = await applicationService.getMyApplications();
    const applicationPayload = response?.data?.data?.applications || response?.data?.applications || [];
    const nextApplications = Array.isArray(applicationPayload)
      ? applicationPayload.map((application, index) => normalizeApplicationData(application, index))
      : [];
    setApplications(nextApplications);
    return nextApplications;
  };

  const goToNextStep = () => {
    setApplicationError('');
    if (!hasRequiredTeacherApplicationData()) {
      setProfileSubTab('overview');
      setActiveTab('profile');
      setShowApplyModal(false);
      setProfileCompletionNotice('Please complete your profile setup before applying for a job.');
      return;
    }
    if (applicationStep === 1) {
      if (!applicationForm.name.trim() || !applicationForm.email.trim() || !applicationForm.phone.trim()) {
        setApplicationError('Please complete your name, email address, and phone number before continuing.');
        return;
      }
    } else if (applicationStep === 2) {
      const hasCv = (applicationForm.useExistingCv && (existingCvUrl || activeResume?.url || profileState?.cv_url)) || Boolean(applicationForm.resumeFile);
      if (!hasCv) {
        setApplicationError('Please select your profile CV or upload a new CV document.');
        return;
      }
    }
    setApplicationStep(prev => Math.min(prev + 1, 3));
  };

  const goToPrevStep = () => {
    setApplicationError('');
    setApplicationStep(prev => Math.max(prev - 1, 1));
  };

  const submitJobApplication = async () => {
    if (!hasRequiredTeacherApplicationData()) {
      setShowApplyModal(false);
      setProfileSubTab('overview');
      setActiveTab('profile');
      setProfileCompletionNotice('Please complete your profile setup before applying for a job.');
      return;
    }

    if (!selectedJob) {
      setApplicationError('Please select a job before applying.');
      return;
    }

    const jobId = normalizeJobId(selectedJob.job_id || selectedJob.id);
    const coverLetterText = applicationForm.coverLetter.trim();

    if (coverLetterText.length > COVER_LETTER_MAX_LENGTH) {
      setApplicationError(`Your cover letter must be no more than ${COVER_LETTER_MAX_LENGTH} characters.`);
      return;
    }

    const hasCv = (applicationForm.useExistingCv && (existingCvUrl || activeResume?.url || profileState?.cv_url)) || Boolean(applicationForm.resumeFile);
    if (!hasCv) {
      setApplicationError('Please upload a CV document or use your existing profile CV.');
      return;
    }

    try {
      setSubmittingApplication(true);
      setApplicationError('');

      let payload;
      if (!applicationForm.useExistingCv && applicationForm.resumeFile) {
        payload = new FormData();
        payload.append('cover_letter', coverLetterText);
        if (applicationForm.additionalInfo.trim()) {
          payload.append('additional_info', applicationForm.additionalInfo.trim());
        }
        payload.append('cv', applicationForm.resumeFile);
      } else {
        payload = {
          cover_letter: coverLetterText,
          ...(applicationForm.additionalInfo.trim() ? { additional_info: applicationForm.additionalInfo.trim() } : {}),
        };
      }

      await applicationService.applyToJob(jobId, payload);

      try {
        await refreshApplications();
      } catch (refreshError) {
        setAppError(apiErrorMessage(refreshError, 'Application submitted, but applications list could not be refreshed.'));
      }

      setShowApplyModal(false);
      if (applicationReviewMode) {
        setApplicationReviewMode(false);
        setShowApplicationSuccessModal(true);
      } else {
        setActiveTab('application-submitted');
      }
    } catch (err) {
      setApplicationError(apiErrorMessage(err, 'Unable to submit your application right now.'));
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    await submitJobApplication();
  };

  // Notifications State
  const [notifFilter, setNotifFilter] = useState('All');
  const [visibleNotifCount, setVisibleNotifCount] = useState(12);

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'All') return true;
    if (notifFilter === 'Unread') return !n.read;
    return n.category === notifFilter;
  });

  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;
  const totalNotifications = notifications.length || 0;

  const handleMarkNotificationAsRead = async (notificationId) => {
    if (!notificationId) return;

    setNotificationActionLoading((current) => ({ ...current, [notificationId]: 'read' }));
    try {
      await featureService.markNotificationRead(notificationId);
      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId
          ? { ...notification, read: true, isNew: false }
          : notification
      )));
      setSelectedNotification((current) => (
        current && current.id === notificationId
          ? { ...current, read: true, isNew: false }
          : current
      ));
    } catch (err) {
      setNotifError(apiErrorMessage(err, 'Unable to mark this notification as read.'));
    } finally {
      setNotificationActionLoading((current) => {
        const next = { ...current };
        delete next[notificationId];
        return next;
      });
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification.id).filter(Boolean);
    if (!unreadIds.length) return;

    try {
      await Promise.all(unreadIds.map((notificationId) => featureService.markNotificationRead(notificationId)));
      setNotifications((current) => current.map((notification) => ({
        ...notification,
        read: true,
        isNew: false,
      })));
    } catch (err) {
      setNotifError(apiErrorMessage(err, 'Unable to mark notifications as read.'));
    }
  };

  useEffect(() => {
    const refreshNotifications = async () => {
      try {
        const response = await featureService.getNotifications({ page: 1, per_page: 50 });
        const notificationList = response?.data?.data?.notifications || response?.data?.notifications || [];
        if (!Array.isArray(notificationList)) return;
        setNotifications(notificationList.map((notification) => {
          const readValue = notification.is_read ?? notification.read;
          const read = readValue === true || readValue === 'true' || Number(readValue) === 1;
          return {
            ...notification,
            id: notification.notification_id || notification.id,
            type: notification.type || 'job',
            title: notification.title || 'Notification',
            description: notification.message || notification.description || '',
            time: notification.created_at ? new Date(notification.created_at).toLocaleDateString() : 'Recently',
            isNew: !read,
            read,
            category: notification.type === 'application_status' ? 'Job Alerts' : 'Account',
          };
        }));
      } catch {
        // Keep the current notification state when polling is unavailable.
      }
    };

    const intervalId = window.setInterval(refreshNotifications, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleDeleteNotification = async (notificationId) => {
    if (!notificationId) return;

    setNotificationActionLoading((current) => ({ ...current, [notificationId]: 'delete' }));
    try {
      await featureService.deleteNotification(notificationId);
      setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
      if (selectedNotification?.id === notificationId) {
        setIsNotificationModalOpen(false);
        setSelectedNotification(null);
      }
    } catch (err) {
      setNotifError(apiErrorMessage(err, 'Unable to delete this notification.'));
    } finally {
      setNotificationActionLoading((current) => {
        const next = { ...current };
        delete next[notificationId];
        return next;
      });
    }
  };

  const openNotificationModal = async (notification) => {
    if (!notification) return;

    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);

    if (!notification.read) {
      await handleMarkNotificationAsRead(notification.id);
    }
  };

  // Job Feeds Filters State
  const [subjectSearch, setSubjectSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [keywordSearch, setKeywordSearch] = useState('');

  const [selectedEducation, setSelectedEducation] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [salaryRange, setSalaryRange] = useState(50000);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [displayedJobsCount, setDisplayedJobsCount] = useState(20);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

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
    setDisplayedJobsCount(20);
  };

  const handleLoadMore = async () => {
    if (displayedJobsCount < filteredJobs.length) {
      setDisplayedJobsCount((previousCount) => previousCount + 20);
      return;
    }

    if (jobsCurrentPage >= jobsTotalPages || isLoadingMoreJobsRef.current) return;

    const nextPage = jobsCurrentPage + 1;
    isLoadingMoreJobsRef.current = true;
    setIsLoadingMoreJobs(true);

    try {
      const response = await jobService.getJobs({ page: nextPage, per_page: jobsPerPage });
      const { jobs: nextJobs, pagination } = extractJobsResponse(response);
      const normalizedJobs = nextJobs.map((job, index) => normalizeJobData(job, index));

      setJobs((currentJobs) => {
        const jobsById = new Map(currentJobs.map((job) => [normalizeJobId(job.job_id || job.id), job]));
        normalizedJobs.forEach((job) => {
          const jobId = normalizeJobId(job.job_id || job.id);
          const existingJob = jobsById.get(jobId);
          jobsById.set(jobId, {
            ...existingJob,
            ...job,
            recommended: Boolean(job.recommended || existingJob?.recommended),
            relevanceScore: job.relevanceScore || existingJob?.relevanceScore || 0,
          });
        });
        return Array.from(jobsById.values());
      });
      setJobsCurrentPage(Number(pagination.current_page) || nextPage);
      setJobsTotalPages(getJobsPageCount(pagination, nextJobs.length));
      setDisplayedJobsCount((previousCount) => previousCount + 20);
    } catch {
      return;
    } finally {
      isLoadingMoreJobsRef.current = false;
      setIsLoadingMoreJobs(false);
    }
  };

  const filteredJobs = sortJobsByPreference(
    jobs.filter(job => {
      const title = String(job.title || '').toLowerCase();
      const school = String(job.school || '').toLowerCase();
      const location = String(job.location || '').toLowerCase();
      const subject = String(job.subject || '').toLowerCase();
      const matchesSubject = title.includes(subjectSearch.toLowerCase()) || school.includes(subjectSearch.toLowerCase()) || subject.includes(subjectSearch.toLowerCase());
      const matchesLocation = location.includes(locationSearch.toLowerCase());
      const matchesKeyword = title.includes(keywordSearch.toLowerCase()) || school.includes(keywordSearch.toLowerCase()) || subject.includes(keywordSearch.toLowerCase());

      if (subjectSearch && !matchesSubject) return false;
      if (locationSearch && !matchesLocation) return false;
      if (keywordSearch && !matchesKeyword) return false;

      const jobEducation = normalizeEducationLevel(job.education || job.education_level || job.teaching_level || '');
      if (selectedEducation.length > 0 && !selectedEducation.some(level => normalizeEducationLevel(level) === jobEducation)) return false;
      if (selectedJobTypes.length > 0 && !selectedJobTypes.some(type => String(job.type).toLowerCase().includes(type.toLowerCase()))) return false;
      if (Number(job.salaryMonthly || 0) < Number(salaryRange || 0)) return false;

      if (showSavedOnly) {
        const jobId = normalizeJobId(job.job_id || job.id);
        if (!savedJobIds.includes(jobId)) return false;
      }

      return true;
    })
  );
  const hasMoreJobResults = displayedJobsCount < filteredJobs.length || jobsCurrentPage < jobsTotalPages;

  const handleNavTabChange = (nextTab) => {
    setActiveTab(nextTab);
    setSelectedTeacherInvitation(null);
    setInvitationResponseMessage('');
    setSelectedJob(null);
    setSelectedJobOrigin('jobs');
    setSelectedNotification(null);
    setIsNotificationModalOpen(false);
    setNotificationActionLoading({});
    setApplicationStatusFilter('all');
    setApplicationSearch('');
    setApplicationSort('newest');
    setProfileSubTab('overview');
    setSettingsSubTab('overview');
    setLoginActivityView('recent');
    setPersonalInfoOrigin('profile');
    setShowApplicationSuccessModal(false);
    setReviewCoverLetterEditing(false);
    setReviewCvEditing(false);
    setApplicationStep(1);
  };

  const openProfileSection = (section) => {
    if (section === 'personal-info') setPersonalInfoOrigin('profile');
    if (section === 'availability') {
      openAvailabilityPreferencesModal();
      return;
    }
    if (section === 'cv-resume') {
      openCvDocumentsModal();
      return;
    }
    setProfileSubTab(section);
  };

  const handleProfileNavigationClick = (section) => {
    openProfileSection(section);
    if (!window.matchMedia('(max-width: 768px)').matches) return;

    const sectionSelectors = {
      overview: '.td-profile-overview-panel',
      'teaching-experience': '.td-exp-info-page',
      education: '.td-edu-info-page',
      'professional-info': '.td-prof-edit-page',
      more: '.td-more-page',
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = document.querySelector(sectionSelectors[section]);
        if (!target) return;

        const nav = document.querySelector('.td-profile-tabs');
        const stickyOffset = 68 + (nav?.getBoundingClientRect().height || 0) + 8;
        const targetTop = window.scrollY + target.getBoundingClientRect().top - stickyOffset;
        window.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: 'smooth' });
      });
    });
  };

  const renderProfileNavigation = (activeSection) => {
    const moreSections = ['more', 'personal-info', 'trcn-certification', 'cv-resume', 'availability'];
    return (
      <nav className="td-profile-tabs" aria-label="Profile sections">
        <button type="button" className={activeSection === 'overview' ? 'is-active' : ''} aria-current={activeSection === 'overview' ? 'page' : undefined} onClick={() => handleProfileNavigationClick('overview')}><FiUser size={15} />Overview</button>
        <button type="button" className={activeSection === 'teaching-experience' ? 'is-active' : ''} aria-current={activeSection === 'teaching-experience' ? 'page' : undefined} onClick={() => handleProfileNavigationClick('teaching-experience')}><FiBriefcase size={15} />Experience</button>
        <button type="button" className={activeSection === 'education' ? 'is-active' : ''} aria-current={activeSection === 'education' ? 'page' : undefined} onClick={() => handleProfileNavigationClick('education')}><FiAward size={15} />Education &amp; Certifications</button>
        <button type="button" className={activeSection === 'professional-info' ? 'is-active' : ''} aria-current={activeSection === 'professional-info' ? 'page' : undefined} onClick={() => handleProfileNavigationClick('professional-info')}><FiZap size={15} />Skills</button>
        <button type="button" className={moreSections.includes(activeSection) ? 'is-active' : ''} aria-current={activeSection === 'more' ? 'page' : undefined} onClick={() => handleProfileNavigationClick('more')}><FiMoreHorizontal size={16} />More</button>
      </nav>
    );
  };

  const renderProfileSectionOverview = (activeSection) => (
    <>
      {profileCompletionNotice && (
        <div
          role="status"
          style={{
            width: '100%',
            margin: '0 0 14px',
            padding: '12px 16px',
            border: '1px solid #86efac',
            borderRadius: 12,
            background: '#f0fdf4',
            color: '#166534',
            boxShadow: '0 8px 24px rgba(22, 101, 52, 0.14)',
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {profileCompletionNotice}
        </div>
      )}
      <div className="td-profile-page-heading">
        <div>
          <h1 className="td-profile-main-title">My Profile</h1>
          <p>Manage your professional profile so schools can learn more about you.</p>
        </div>
        <button type="button" className="td-profile-btn-preview" onClick={() => setProfileSubTab('profile-preview')}>
          <FiEye size={15} />
          <span>Preview Profile</span>
        </button>
      </div>
      <div className="td-profile-overview-shell">
        <div className="td-profile-overview-top">
          <div className="td-profile-header-card">
            <div className="td-profile-header-left">
              <div className="td-profile-avatar-container">
                {profileState?.avatar_url || profileState?.profile_photo || profileState?.photo_url ? (
                  <img src={toTeacherAssetUrl(profileState.avatar_url || profileState.profile_photo || profileState.photo_url)} alt="" />
                ) : (
                  <div className="td-profile-avatar-initials" aria-label={profileFullName}>{getInitials(profileFullName)}</div>
                )}
              </div>
              <div className="td-profile-info-block">
                <div className="td-profile-name-row">
                  <h2>{profileFullName}</h2>
                  <svg className="td-profile-verified-badge" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14.4 3.7L17.3 3.3L18.8 5.8L21.5 6.9L21.7 9.8L23.4 12.1L21.7 14.4L21.5 17.3L18.8 18.4L17.3 20.9L14.4 20.5L12 22.2L9.6 20.5L6.7 20.9L5.2 18.4L2.5 17.3L2.3 14.4L0.6 12.1L2.3 9.8L2.5 6.9L5.2 5.8L6.7 3.3L9.6 3.7L12 2Z" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.5 12L11 14.5L16 9.5" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="td-profile-subject-title">{profSubjects.length ? profSubjects.slice(0, 2).join(', ') : profileRoleTitle}</p>
                <p className="td-profile-role-title">{profileRoleTitle}</p>
                <div className="td-profile-meta-row">
                  <div className="td-profile-meta-item"><FiMapPin size={15} className="td-profile-meta-icon" /><span>{profileLocation}</span></div>
                  {profTeachingLevels.length > 0 && <div className="td-profile-meta-item"><FiAward size={15} className="td-profile-meta-icon" /><span>{profTeachingLevels.slice(0, 2).join(', ')}</span></div>}
                  {profSubjects.length > 0 && <div className="td-profile-meta-item"><FiBook size={15} className="td-profile-meta-icon" /><span>{profSubjects.slice(0, 2).join(', ')}</span></div>}
                </div>
                <div className="td-profile-header-actions">
                  <button type="button" className="td-profile-btn-edit" onClick={openBasicProfileModal}>
                    <FiEdit2 size={14} />
                    <span>Edit basic info</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <section className={`td-profile-readiness ${nextProfileStep ? 'is-incomplete' : 'is-complete'}`} aria-label="Profile completion status">
            <div className="td-readiness-heading">
              <span className="td-readiness-icon">{nextProfileStep ? <FiEdit2 size={18} /> : <FiCheckCircle size={20} />}</span>
              <div>
                <strong>{nextProfileStep ? 'Keep building your profile' : "You're ready to apply!"}</strong>
                <p>{nextProfileStep ? 'Complete the key sections below to help schools review your applications.' : 'Your profile contains the information schools need to review your applications.'}</p>
              </div>
            </div>
            <div className="td-readiness-progress" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profileCompletionPercent}>
              <span style={{ width: `${profileCompletionPercent}%` }} />
            </div>
            <div className="td-readiness-checklist">
              {[
                { key: 'professional-info', label: 'Basic & Professional Information' },
                { key: 'education', label: 'Education & Certifications' },
                { key: 'teaching-experience', label: 'Teaching Experience' },
              ].map((item) => {
                const completed = Boolean(profileCompletionSteps.find((step) => step.key === item.key)?.completed);
                return <span key={item.key} className={completed ? 'is-complete' : ''}><FiCheckCircle size={14} />{item.label}</span>;
              })}
            </div>
          </section>
        </div>
      </div>
      {renderProfileNavigation(activeSection)}
    </>
  );

  return (
    <Motion.div
      className="td-layout"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Desktop Sidebar ── */}
      <aside className="td-sidebar">
        <div className="td-logo-area">
          <BrandLogo />
        </div>

        <nav className="td-nav">
          <div className={`td-nav-item ${activeTab === 'dashboard' ? 'td-nav-item--active' : ''}`} onClick={() => handleNavTabChange('dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="td-nav-icon">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Dashboard</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'jobs' ? 'td-nav-item--active' : ''}`} onClick={() => handleNavTabChange('jobs')}>
            <FiBriefcase size={18} className="td-nav-icon" />
            <span>Job Listing</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'notifications' ? 'td-nav-item--active' : ''}`} onClick={() => handleNavTabChange('notifications')}>
            <FiBell size={18} className="td-nav-icon" />
            <span>Notifications</span>
            {unreadNotificationCount > 0 && <i className="td-nav-notification-dot" aria-label="Unread notifications" />}
          </div>

          <div className={`td-nav-item ${activeTab === 'applications' ? 'td-nav-item--active' : ''}`} onClick={() => handleNavTabChange('applications')}>
            <FiFileText size={18} className="td-nav-icon" />
            <span>Applications</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'invitations' ? 'td-nav-item--active' : ''}`} onClick={() => handleNavTabChange('invitations')}>
            <FiMail size={18} className="td-nav-icon" />
            <span>Invitations</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'settings' ? 'td-nav-item--active' : ''}`} onClick={() => { handleNavTabChange('settings'); setSettingsSubTab('overview'); }}>
            <FiSettings size={18} className="td-nav-icon" />
            <span>Settings</span>
          </div>

          <div className={`td-nav-item ${activeTab === 'profile' ? 'td-nav-item--active' : ''}`} onClick={() => { handleNavTabChange('profile'); setProfileSubTab('overview'); }}>
            <FiUser size={18} className="td-nav-icon" />
            <span>Profile</span>
          </div>
        </nav>

        <div className="td-sidebar-footer">
          <button type="button" onClick={logout} className="td-sidebar-logout">
            <FiLogOut size={17} />
            Log out
          </button>
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
        ) : activeTab === 'invitations' ? (
          <header className="td-mobile-notif-topbar">
            <button className="td-mobile-back-btn" onClick={() => {
              if (selectedTeacherInvitation) {
                setSelectedTeacherInvitation(null);
                setInvitationResponseMessage('');
              } else {
                setActiveTab('dashboard');
              }
            }}>
              <FiArrowLeft size={24} />
            </button>
            <span className="td-mobile-notif-title">{selectedTeacherInvitation ? 'Invitation details' : 'Invitations'}</span>
            <div style={{ width: 24 }}></div>
          </header>
        ) : (
          <header className="td-mobile-topbar">
            <div className="td-mobile-avatar" onClick={() => { setActiveTab('profile'); setProfileSubTab('overview'); }} style={{ cursor: 'pointer' }}>
              <div className="td-avatar-initials" aria-label={profileFullName}>{profileFullName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div>
            </div>
            <div className="td-mobile-brand">
              <BrandLogo />
            </div>
            <div className="td-mobile-topbar-actions">
              <button className="td-mobile-bell" onClick={() => setActiveTab('notifications')} style={{ position: 'relative' }}>
                <FiBell />
                {unreadNotificationCount > 0 && (
                  <span className="td-bell-dot" style={{ position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '999px', background: '#dc2626', color: '#fff', fontSize: '10px', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
              <button type="button" className="td-mobile-logout-btn" onClick={logout} aria-label="Log out">
                <FiLogOut size={18} />
              </button>
            </div>
          </header>
        )}

        {/* ── Desktop Top Bar ── */}
        <header className="td-topbar">
          <div className="td-topbar-actions">
            <div className="td-icon-badge" onClick={() => setActiveTab('notifications')} style={{ position: 'relative' }}>
              <FiBell />
              {unreadNotificationCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', minWidth: '18px', height: '18px', borderRadius: '999px', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 4px' }}>
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </div>
            <div className="td-user-avatar" onClick={() => { setActiveTab('profile'); setProfileSubTab('overview'); }} style={{ cursor: 'pointer' }}>
              <div className="td-avatar-initials td-avatar-initials--topbar" aria-label={profileFullName}>{profileFullName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <div className="td-content" ref={contentRef}>

          {showProfileCompletionModal && activeTab === 'dashboard' && profileCompletionModalItems.length > 0 && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
              <div style={{ width: 'min(560px, 100%)', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', background: '#fff', borderRadius: '16px', boxShadow: '0 18px 60px rgba(15, 23, 42, 0.18)', padding: '20px 22px 18px', border: '1px solid #e5e7eb', position: 'relative' }}>
                <button type="button" onClick={dismissProfileCompletionModal} aria-label="Close profile completion modal" style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', border: 'none', background: 'transparent', borderRadius: '999px', color: '#4b5563', fontSize: '24px', lineHeight: 1, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <FiX size={22} />
                </button>

                <h2 style={{ margin: '0 30px 0 0', fontSize: 'clamp(1.25rem, 3vw, 1.55rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1f2937', lineHeight: 1.2 }}>
                  Complete a few profile details to apply
                </h2>

                <p style={{ margin: '8px 0 0', color: '#4b5563', fontSize: '0.84rem', lineHeight: 1.45 }}>
                  To apply for this job, please complete the following information on your profile. This helps schools understand your background and ensure a better match.
                </p>

                <div style={{ marginTop: '12px', background: '#effbf4', border: '1px solid #c7efd7', borderRadius: '12px', padding: '11px 13px', display: 'flex', alignItems: 'center', gap: '11px' }}>
                  <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', background: '#18a957', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 8px 18px rgba(24, 169, 87, 0.2)' }}>
                    <FiLock size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0f766e' }}>Almost there</div>
                    <div style={{ marginTop: '3px', fontSize: '0.82rem', color: '#1f2937', lineHeight: 1.4 }}>
                      <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '2px' }}>You&apos;re {profileCompletionModalItems.length} steps away from applying</strong>
                      Complete the missing information below. It only takes a few minutes.
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', letterSpacing: '-0.02em' }}>Missing information</h3>
                  <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.4 }}>
                    You&apos;ve already completed some parts of your profile. Add the items below to continue.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                  {profileCompletionModalItems.map((item) => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', padding: '9px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '34px', height: '34px', flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#edf6ff', border: '1px solid #dceafc' }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1f2937' }}>{item.label}</div>
                          <div style={{ marginTop: '2px', color: '#4b5563', fontSize: '0.75rem', lineHeight: 1.35 }}>{item.description}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('profile');
                          setProfileSubTab(item.key === 'professional-info' ? 'overview' : item.key);
                          setShowProfileCompletionModal(false);
                        }}
                        style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#111827', borderRadius: '8px', padding: '7px 9px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        {item.button} <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '10px', background: '#eff6ff', border: '1px solid #d3e6ff', borderRadius: '9px', padding: '9px 11px', color: '#4b5563', fontSize: '0.74rem', lineHeight: 1.4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#0ea5e9', color: '#fff', fontSize: '12px', fontWeight: 700, marginRight: '8px' }}>i</span>
                  Skills, job preferences, availability and additional documents are optional. You can add them later to improve your visibility to schools.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <button type="button" onClick={dismissProfileCompletionModal} style={{ minWidth: '82px', border: '1px solid #cbd5e1', background: '#fff', color: '#111827', borderRadius: '8px', padding: '8px 12px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="button" onClick={() => { setActiveTab('profile'); setProfileSubTab('overview'); setShowProfileCompletionModal(false); }} style={{ minWidth: '140px', border: 'none', background: '#22c55e', color: '#fff', borderRadius: '8px', padding: '8px 14px', fontWeight: 700, fontSize: '0.82rem', boxShadow: '0 6px 16px rgba(34, 197, 94, 0.2)', cursor: 'pointer' }}>
                    Go to My Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              {/* ── Welcome Area ── */}
              <div className="td-welcome-header">
                <div>
                  <h1 className="td-welcome-title">Welcome, {profileFullName}</h1>
                  {/* Desktop subtitle */}
                  <p className="td-subtitle">Your academic career overview for today.</p>
                  {/* Mobile location */}
                  <div className="td-mobile-location">
                    <FiMapPin size={13} color="#4A5568" />
                    <span>{profileLocation}</span>
                  </div>
                </div>
                <div className="td-location-badge">
                  <FiMapPin size={14} color="#1CCB43" />
                  <span>{profileLocation}</span>
                </div>
              </div>

              <div className="td-grid-main">
                {/* Left Content / Main Feed */}
                <div className="td-left-col">

                  {/* ── Stats Overview ── */}
                  <div className="td-stats-row">
                    {/* Profile Strength Card */}
                    {nextProfileStep && (
                    <Motion.div
                      variants={cardVariants}
                      className="td-stat-card td-profile-card"
                    >
                      <div className="td-card-header">
                        <div className="td-profile-completion-heading">
                          <span className="td-profile-title">Profile Completion</span>
                          <div className="td-profile-completion-count">
                            <strong>{completedProfileStepCount} / {profileCompletionSteps.length} steps</strong>
                            <span className={nextProfileStep ? '' : 'is-complete'}>
                              {nextProfileStep ? 'In Progress' : 'Completed'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="td-desktop-profile-strength">
                        <div className="td-profile-content-block">
                          <div className="td-progress-bar">
                            <div className="td-progress-fill" style={{ width: `${profileCompletionPercent}%` }}></div>
                          </div>
                          <p className="td-card-hint">
                            {nextProfileStep
                              ? `Your profile is missing some key details. Complete your ${nextProfileStep.label} next.`
                              : 'Your profile is complete. You are ready to apply for jobs.'}
                          </p>
                        </div>
                        {nextProfileStep && (
                          <button type="button" className="td-complete-profile-btn" onClick={goToNextProfileStep}>
                            {nextProfileStep.key === 'onboarding' ? 'Complete Setup' : 'Complete Profile'} →
                          </button>
                        )}
                      </div>
                    </Motion.div>
                    )}

                    {/* Mini cards wrapper */}
                    <div className="td-stats-mini-wrapper">
                      {/* Profile Views */}
                      <Motion.div variants={cardVariants} className="td-stat-card td-mini-card td-mini-card--views">
                        <div className="td-mini-icon-circle">
                          <FiEye size={18} />
                        </div>
                        <span className="td-mobile-stat-number">{profileViewsValue}</span>
                        <p className="td-mini-label">PROFILE VIEWS</p>
                        <div className="td-mini-value-row">
                          <span className="td-mini-value td-desktop-stat-val">{profileViewsValue}</span>
                        </div>
                        <span className="td-mobile-subtext">{profileViewsValue > 0 ? 'Based on profile analytics' : 'No profile views yet'}</span>
                        <button type="button" className="td-profile-views-log-link" onClick={() => { setActiveTab('settings'); setSettingsSubTab('profile-view-logs'); loadProfileViewLogs({ page: 1 }); }}>
                          View full log
                        </button>
                      </Motion.div>

                      {/* Jobs Applied */}
                      <Motion.div variants={cardVariants} className="td-stat-card td-mini-card td-mini-card--applied">
                        <div className="td-mini-icon-circle">
                          <FiSend size={18} className="td-desktop-icon" />
                          <FiBriefcase size={18} className="td-mobile-icon" />
                        </div>
                        <span className="td-mobile-stat-number">{totalApplications}</span>
                        <p className="td-mini-label">
                          <span>JOBS APPLIED</span>
                        </p>
                        <div className="td-mini-value-row td-desktop-val-row">
                          <span className="td-mini-value">{totalApplications}</span>
                        </div>
                        <span className="td-mobile-subtext td-mobile-subtext--gray">Total applied</span>
                      </Motion.div>

                      {/* Pending Applications */}
                      <Motion.div variants={cardVariants} className="td-stat-card td-mini-card td-mini-card--pending td-desktop-only-card">
                        <div className="td-mini-icon-circle td-mini-icon-circle--pending">
                          <FiFileText size={18} />
                        </div>
                        <p className="td-mini-label td-mini-label--pending">PENDING APPLICATIONS</p>
                        <div className="td-mini-value-row">
                          <span className="td-mini-value td-mini-value--pending">{pendingApplications}</span>
                        </div>
                        <span className="td-mobile-subtext td-mobile-subtext--gray">{pendingApplications > 0 ? 'Awaiting school response' : 'No pending applications'}</span>
                      </Motion.div>
                    </div>
                  </div>

                  {/* ── Active Job Feeds ── */}
                  <div className="td-jobs-section">
                    <div className="td-section-header">
                      <h2>
                        <span className="td-desktop-label">Recommended Jobs</span>
                        <span className="td-mobile-label">Recommended Jobs</span>
                      </h2>
                      <a onClick={() => setActiveTab('jobs')} className="td-view-all-link">
                        <span className="td-desktop-text">View All Vacancies</span>
                        <span className="td-mobile-text">View All</span>
                      </a>
                    </div>

                    <div className="td-job-list">
                      {dashboardJobs.length > 0 ? dashboardJobs.map((job) => (
                        <Motion.div
                          key={job.id}
                          variants={cardVariants}
                          className="td-job-item"
                          onClick={() => {
                            setActiveTab('jobs');
                            setSelectedJobOrigin('dashboard');
                            setSelectedJob(job);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="td-job-header-row">
                            <div className="td-job-info-main">
                              <div className="td-job-title-line">
                                <h3>{job.title}</h3>
                                <div className="td-job-badge-col td-desktop-badge-col">
                                  <span className="td-job-type-badge td-job-type-badge--full">{String(job.type || 'FULL-TIME').toUpperCase()}</span>
                                </div>
                              </div>
                              <p className="td-job-school">{job.school}</p>

                              <div className="td-job-tags td-mobile-only-tags">
                                <span className="td-mobile-tag--green">{String(job.location || '').toUpperCase()}</span>
                                <span className="td-mobile-tag--gray">{job.timeLabel}</span>
                              </div>

                            </div>
                          </div>

                          <div className="td-job-tags td-desktop-tags">
                            <span><FiBook aria-hidden="true" size={12} />{job.subject || 'Teaching'}</span>
                            <span><FiClock aria-hidden="true" size={12} />{job.type || 'Full-time'}</span>
                            <span><FiMapPin aria-hidden="true" size={12} />{job.location}</span>
                            <span><FiClock aria-hidden="true" size={12} />{job.timeLabel || 'Date unavailable'}</span>
                          </div>

                          <div className="td-job-footer">
                            <div className="td-job-salary-inline">
                              <FiCreditCard aria-hidden="true" size={14} />
                              <span>{job.salaryStr || 'Competitive'}</span>
                            </div>
                            <button
                              type="button"
                              className="td-quick-apply"
                              onClick={(e) => {
                                e.stopPropagation();
                                openApplyModal(job, { review: true });
                              }}
                            >
                              Apply →
                            </button>
                          </div>
                        </Motion.div>
                      )) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No active jobs available right now.</div>
                      )}
                    </div>
                  </div>

                </div>

                {/* ── Right Sidebar (Desktop Only - hidden in clean single column layout or kept empty) ── */}
                <div className="td-right-col">
                  <Motion.div variants={cardVariants} className="td-side-section">
                    <h3>Upcoming Interviews</h3>
                    {upcomingInterviews.length > 0 ? (
                      upcomingInterviews.map((app) => {
                        const interview = app.interview || {};
                        const interviewDate = new Date(interview.interview_date || interview.date || '');
                        const hasInterviewDate = !Number.isNaN(interviewDate.getTime());
                        const interviewLocation = interview.venue || interview.meeting_link || interview.location || 'Location not provided';
                        return (
                          <div key={app.id} className="td-interview-item">
                            <div className="td-date-box">
                              <span className="td-day">{hasInterviewDate ? interviewDate.getDate() : '--'}</span>
                              <span className="td-month">{hasInterviewDate ? interviewDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'DATE'}</span>
                            </div>
                            <div className="td-int-info">
                              <h4>{app.school}</h4>
                              <p>{app.title}</p>
                              <p>{interview.interview_time || interview.time || 'Time not provided'} • {interviewLocation}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="td-interview-item">
                        <div className="td-int-info">
                          <h4>No interviews scheduled</h4>
                          <p>Your application pipeline will appear here.</p>
                        </div>
                      </div>
                    )}
                  </Motion.div>

                  <Motion.div variants={cardVariants} className="td-pro-card">
                    <div className="td-pro-badge">★</div>
                    <h3>School Match Status</h3>
                    <p>{jobs.length > 0 ? `${jobs.length} active opportunities are matching your profile.` : 'No active school matches yet.'}</p>
                    <button className="td-upgrade-btn" onClick={() => setActiveTab('jobs')}>View Jobs</button>
                  </Motion.div>

                  <Motion.div variants={cardVariants} className="td-shortcuts-section">
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
                  </Motion.div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'jobs' && !selectedJob && (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-jobs-tab">

              {/* ── Hero ── */}
              <div className="td-jobs-hero">
                <div className="td-jobs-hero-top">
                  <div className="td-jobs-hero-text">
                    <h1>Find your next <span className="td-highlight">teaching milestone.</span></h1>
                    <p>Connecting Nigeria's finest educators with prestigious academic institutions.</p>
                  </div>
                  <button
                    className={`td-saved-jobs-btn ${showSavedOnly ? 'td-saved-jobs-btn--active' : ''}`}
                    onClick={() => {
                      setShowSavedOnly(!showSavedOnly);
                      setDisplayedJobsCount(20);
                    }}
                  >
                    <FiBookmark size={14} /> Saved Jobs
                  </button>
                </div>

                {/* Desktop Search */}
                <div className="td-jobs-search-bar td-desktop-search">
                  <div className="td-search-input-group">
                    <FiBriefcase className="td-search-icon" size={16} />
                    <input type="text" placeholder="Subject (e.g., Physics, English)" className="td-interactive-input" value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)} />
                  </div>
                  <div className="td-search-divider" />
                  <div className="td-search-input-group">
                    <FiMapPin className="td-search-icon" size={16} />
                    <input type="text" placeholder="Benin City, Edo..." className="td-interactive-input" value={locationSearch} onChange={e => setLocationSearch(e.target.value)} />
                  </div>
                  <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-btn-primary"><FiSearch size={14} /> Find Jobs</Motion.button>
                </div>

                {/* Mobile Search & Chips */}
                <div className="td-mobile-jobs-search">
                  <div className="td-search-box-mobile">
                    <FiSearch className="td-search-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Role, subject or keyword"
                      className="td-interactive-input"
                      value={keywordSearch}
                      onChange={e => setKeywordSearch(e.target.value)}
                    />
                  </div>
                  <div className="td-mobile-filter-chips">
                    <button
                      type="button"
                      className={`td-filter-chip ${locationSearch.toLowerCase().includes('lagos') ? 'td-chip-active-green' : 'td-chip-soft'}`}
                      onClick={() => setLocationSearch(locationSearch.toLowerCase().includes('lagos') ? '' : 'Lagos')}
                    >
                      <FiMapPin size={13} /> Lagos
                    </button>
                    <button
                      type="button"
                      className={`td-filter-chip ${selectedJobTypes.includes('Full-time') ? 'td-chip-active-lightgreen' : 'td-chip-soft'}`}
                      onClick={() => toggleJobType('Full-time')}
                    >
                      <FiClock size={13} /> Full-time
                    </button>
                    <button
                      type="button"
                      className={`td-filter-chip ${salaryRange >= 250000 ? 'td-chip-active-green' : 'td-chip-soft'}`}
                      onClick={() => setSalaryRange(salaryRange >= 250000 ? 50000 : 250000)}
                    >
                      <FiBriefcase size={13} /> ₦250k+
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Main layout ── */}
              <div className={`td-jobs-layout ${filtersCollapsed ? 'td-jobs-layout--filters-collapsed' : ''}`}>

                {/* Sidebar Filters */}
                <div className={`td-jobs-filters td-desktop-only ${filtersCollapsed ? 'td-jobs-filters--collapsed' : ''}`}>
                  <div className="td-filter-header">
                    <h3>Filters</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button type="button" className="td-clear-btn" onClick={clearFilters}>Clear all</button>
                      <button type="button" className="td-clear-btn" onClick={() => setFiltersCollapsed((current) => !current)} aria-expanded={!filtersCollapsed}>
                        {filtersCollapsed ? 'Expand' : 'Collapse'}
                      </button>
                    </div>
                  </div>

                  {!filtersCollapsed && <div className="td-filter-group">
                    <h4>EDUCATION LEVEL</h4>
                    {teacherLevelOptions.map(level => (
                      <label key={level} className="td-checkbox-label" onClick={() => toggleEducation(level)}>
                        <div className={`td-checkbox-custom ${selectedEducation.includes(level) ? 'td-checked' : ''}`}>
                          {selectedEducation.includes(level) && <FiCheck size={12} />}
                        </div>
                        {level}
                      </label>
                    ))}
                  </div>}

                  {!filtersCollapsed && <div className="td-filter-group">
                    <h4>JOB TYPE</h4>
                    <div className="td-filter-tags">
                      {['Full-time', 'Part-time', 'Online', 'Contract'].map(type => (
                        <span
                          key={type}
                          onClick={() => toggleJobType(type)}
                          className={`td-tag ${selectedJobTypes.includes(type) ? 'td-tag-active' : ''}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>}

                  {!filtersCollapsed && <div className="td-filter-group">
                    <h4>MONTHLY SALARY (₦)</h4>
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
                  </div>}
                </div>

                {/* Job Cards */}
                <div className="td-jobs-list-container">
                  <div className="td-jobs-list-header">
                    <div className="td-desktop-showing">Showing <strong>{filteredJobs.length} jobs</strong> in Nigeria</div>
                    <div className="td-mobile-showing">
                      <div className="td-mobile-rec-info">
                        <h3>Recommended for you</h3>
                        <span>{filteredJobs.length} JOBS FOUND</span>
                      </div>
                      <button
                        className={`td-mobile-saved-btn ${showSavedOnly ? 'td-mobile-saved-btn--active' : ''}`}
                        onClick={() => {
                          setShowSavedOnly(!showSavedOnly);
                          setDisplayedJobsCount(20);
                        }}
                      >
                        <FiBookmark size={14} /> Saved
                      </button>
                    </div>
                    <div className="td-sort-by td-desktop-only" style={{ position: 'relative' }}>
                      Sort by:
                      <strong
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px', color: '#15803D' }}
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                      >
                        {sortBy} <FiChevronDown size={14} />
                      </strong>
                      {showSortDropdown && (
                        <div style={{ position: 'absolute', top: '30px', right: 0, background: '#fff', border: '1px solid #E9ECEF', borderRadius: '8px', padding: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '160px' }}>
                          {['Recommended', 'Newest First', 'Oldest First', 'Highest Salary', 'Lowest Salary'].map(s => (
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
                    {filteredJobs.length > 0 ? filteredJobs.slice(0, displayedJobsCount).map(job => {
                      if (job.hot) {
                        return (
                          <Motion.div key={job.id} variants={cardVariants} className="td-feed-card td-feed-card-hot">
                            <div className="td-hot-header">
                              <span className="td-hot-badge">HOT VACANCY</span>
                              <span className="td-hot-time">{job.timeLabel}</span>
                            </div>
                            <h3 className="td-hot-title">{job.title}</h3>
                            <p className="td-hot-school">{job.school} <span className="td-dot">•</span> {job.location}</p>
                            <div className="td-hot-salary-range">SALARY RANGE</div>
                            <div className="td-hot-footer">
                              <div className="td-hot-salary-value">{job.salaryStr}</div>
                              <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-hot-action" onClick={(e) => { e.stopPropagation(); openApplyModal(job, { review: true }); }}>
                                Apply Fast
                              </Motion.button>
                            </div>
                          </Motion.div>
                        );
                      }

                      return (
                        <Motion.div key={job.id} variants={cardVariants} className="td-feed-card td-feed-card-standard">
                          <Motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`td-bookmark-btn ${savedJobIds.includes(normalizeJobId(job.job_id || job.id)) ? 'td-bookmark-btn--saved' : ''}`}
                            onClick={() => handleToggleSaveJob(job.job_id || job.id)}
                            title={savedJobIds.includes(normalizeJobId(job.job_id || job.id)) ? 'Remove from saved' : 'Save job'}
                            aria-label={savedJobIds.includes(normalizeJobId(job.job_id || job.id)) ? 'Remove from saved jobs' : 'Save job'}
                          >
                            <FiBookmark
                              size={18}
                              style={{ fill: savedJobIds.includes(normalizeJobId(job.job_id || job.id)) ? '#15803D' : 'none' }}
                            />
                          </Motion.button>

                          {/* Card Header */}
                          <div className="td-fc-header">
                            <div className="td-fc-main-info">
                              <div className="td-fc-title-row">
                                <h3>{job.title}</h3>
                                <div className="td-fc-title-actions">
                                  {job.featured && (
                                    <div className="td-fc-badge-desktop">
                                      <span className="td-badge-featured"><FiCheck size={12} /> Featured</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="td-fc-school">
                                {job.school}
                              </p>
                            </div>
                          </div>

                          {/* Meta row */}
                          <div className="td-fc-meta">
                            <div className="td-fc-meta-item">
                              <FiClock size={13} color="#6C757D" />
                              <span>{job.type}</span>
                            </div>
                            <div className="td-fc-meta-item">
                              <FiClock size={13} color="#6C757D" />
                              <span>{job.timeLabel}</span>
                            </div>
                            <div className="td-fc-meta-item">
                              <FiMapPin size={13} />
                              <span>{job.location}</span>
                            </div>
                            {job.tags && job.tags.map(tag => (
                              <span key={tag} className="td-fc-meta-tag">{tag}</span>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="td-fc-footer">
                            <div className="td-fc-footer-actions">
                              <div className="td-fc-footer-salary">
                                <FiCreditCard size={13} />
                                <span>{job.salaryStr || 'Salary available on request'}</span>
                              </div>
                              <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-fc-action" onClick={() => { setSelectedJobOrigin('jobs'); setSelectedJob(job); }}>
                                View Details
                              </Motion.button>
                            </div>
                          </div>
                        </Motion.div>
                      );
                    }) : (
                      <div className="td-empty-state">
                        <div className="td-empty-state-icon">
                          <FiSearch size={22} />
                        </div>
                        <h3>No jobs found matching your criteria.</h3>
                        <p>Try adjusting your filters or search terms to see more opportunities.</p>
                        <button
                          type="button"
                          className="td-empty-state-btn"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>

                  {hasMoreJobResults && (
                    <div className="td-load-more-container">
                      <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-load-more-btn" onClick={handleLoadMore} disabled={isLoadingMoreJobs}>{isLoadingMoreJobs ? 'Loading Jobs...' : 'Load More Jobs'}</Motion.button>
                      <p>Showing {Math.min(displayedJobsCount, filteredJobs.length)} of {filteredJobs.length} loaded results</p>
                    </div>
                  )}
                  {filteredJobs.length > 0 && displayedJobsCount >= filteredJobs.length && jobsCurrentPage >= jobsTotalPages && (
                    <div className="td-load-more-container">
                      <p>Showing all {Math.min(displayedJobsCount, filteredJobs.length)} results</p>
                    </div>
                  )}
                </div>
              </div>
            </Motion.div>
          )}

          {activeTab === 'jobs' && selectedJob && (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="school-job-detail-page td-job-details-page">
              <div className="school-job-detail-back td-jd-back-nav" onClick={() => { setSelectedJob(null); setActiveTab(selectedJobOrigin); }}>
                <button type="button">{selectedJobOrigin === 'applications' ? 'Applications' : 'Jobs'}</button>
                <span>›</span>
                <strong>{selectedJob.title}</strong>
              </div>

              {!selectedJobApplication && !isTeacherProfileComplete && (
                <div className="td-jd-profile-incomplete" role="alert">
                  <FiAlertCircle size={18} />
                  <p>You can’t apply for jobs until your profile is complete.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (nextProfileStep) {
                        goToNextProfileStep();
                      } else {
                        setActiveTab('profile');
                        setProfileSubTab('overview');
                      }
                    }}
                  >
                    Complete your profile <FiArrowRight size={14} />
                  </button>
                </div>
              )}

              <section className="school-job-detail-hero td-jd-hero">
                <div className="school-job-detail-hero-main td-jd-hero-main">
                  <h2>{selectedJob.title}</h2>

                  <div className="td-jd-meta-stack">
                    <div className="school-job-detail-meta-row td-jd-meta-row td-jd-meta-row--primary">
                      {selectedJobApplication ? (
                        <span className="school-job-detail-meta-item td-jd-meta-item td-jd-applied-pill">
                          <FiCalendar size={13} />Applied on {selectedJobApplication.appliedDate || 'recently'}
                        </span>
                      ) : (
                        <span className="school-job-detail-meta-item td-jd-meta-item td-jd-meta-item--money"><FiCreditCard size={13} />{selectedJob.salaryStr || '₦60,000 / month'}</span>
                      )}
                      {selectedJobApplication && ['shortlisted', 'interviewing'].includes(String(selectedJobApplication.status || '').trim().toLowerCase()) ? null : (
                        <span className="school-job-detail-status td-jd-status">{selectedJobApplication ? 'Applied' : 'Active'}</span>
                      )}
                    </div>
                    <div className="school-job-detail-meta-row td-jd-meta-row td-jd-meta-row--secondary">
                      {selectedJobApplication && (
                        <span className="school-job-detail-meta-item td-jd-meta-item td-jd-salary-pill"><FiCreditCard size={13} />{selectedJob.salaryStr || '₦60,000 / month'}</span>
                      )}
                      <span className="school-job-detail-meta-item td-jd-meta-item"><FiBook size={13} />{selectedJob.type || 'Full-time'}</span>
                      <span className="school-job-detail-meta-item td-jd-meta-item"><FiMapPin size={13} />{selectedJob.location === 'Benin' ? 'Lagos, Nigeria' : (selectedJob.location || 'Lagos, Nigeria')}</span>
                      <span className="school-job-detail-meta-item td-jd-meta-item"><FiBook size={13} />{selectedJob.subject || 'Mathematics'}</span>
                      {selectedJob.education && (
                        <span className="school-job-detail-meta-item td-jd-meta-item"><FiAward size={13} />{selectedJob.education}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="td-jd-action-panel">
                  {!selectedJobApplication ? (
                    <button type="button" className="school-job-detail-primary td-jd-primary-btn" onClick={() => openApplyModal(selectedJob, { review: true })}>Apply</button>
                  ) : (
                    <span className={`td-app-status-badge td-app-status-badge--${getApplicationDisplayStatus(selectedJobApplication).replace(/\s+/g, '-')}`}>
                      {applicationStatusLabel(getApplicationDisplayStatus(selectedJobApplication))}
                    </span>
                  )}
                </div>
              </section>

              <section className="school-job-detail-body td-jd-body">
                <div className="school-job-detail-section td-jd-section">
                  <h3>Job Summary</h3>
                  <p>{selectedJob.about || 'No job description has been published for this role yet.'}</p>
                </div>

                <div className="school-job-detail-section td-jd-section">
                  <h3>Responsibilities</h3>
                  <ul className="school-job-detail-check-list td-jd-check-list">
                    {(selectedJob.responsibilities && selectedJob.responsibilities.length > 0 ? selectedJob.responsibilities : ['No responsibilities have been provided for this role yet.']).map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="school-job-detail-section td-jd-section">
                  <h3>Required Experience</h3>
                  <ul className="school-job-detail-bullets td-jd-bullets">
                    {selectedJob.required_experience
                      ? <li>{String(selectedJob.required_experience)} of teaching experience</li>
                      : <li>{selectedJob.experience || 'Relevant teaching experience preferred.'}</li>}
                  </ul>
                </div>

                <div className="school-job-detail-section td-jd-section">
                  <h3>Required Qualification</h3>
                  <ul className="school-job-detail-bullets td-jd-bullets">
                    {(selectedJob.required_qualification && selectedJob.required_qualification.length > 0)
                      ? selectedJob.required_qualification.map((item, index) => <li key={`qualification-${index}`}>{item}</li>)
                      : <li>{selectedJob.qualification || 'B.Ed or equivalent qualification.'}</li>}
                  </ul>
                </div>

                <div className="school-job-detail-section td-jd-section">
                  <h3>Other Requirement</h3>
                  <ul className="school-job-detail-bullets td-jd-bullets">
                    {(selectedJob.other_requirements && selectedJob.other_requirements.length > 0)
                      ? selectedJob.other_requirements.map((item, index) => <li key={`other-requirement-${index}`}>{item}</li>)
                      : <li>{(applicationRequirements || selectedJob.requirements)?.essential?.length ? (applicationRequirements || selectedJob.requirements).essential.join('; ') : 'No additional requirements have been provided.'}</li>}
                  </ul>
                </div>
              </section>
            </Motion.div>
          )}
          {activeTab === 'application-submitted' && (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-application-submitted-page">
              <div className="td-application-submitted-card">
                <div className="td-success-badge">
                  <FiCheck className="td-success-check-icon" />
                </div>
                <h1>Application Submitted Successfully!</h1>
                <p className="td-submitted-description">
                  Your application has been sent to {selectedJob?.school || 'the hiring team'} for review.
                </p>

                <div className="td-application-summary-card">
                  <div className="td-app-school-logo">
                    {selectedJob?.employerImage ? (
                      <img src={selectedJob.employerImage} alt="School Logo" className="td-app-logo-img" />
                    ) : (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L4 6V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V6L12 2Z" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <path d="M9 12L11 14L15 10" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="td-app-info-block">
                    <span className="td-app-position-badge">POSITION APPLIED</span>
                    <h2>{selectedJob?.title || 'Mathematics Tutor'}</h2>
                    <div className="td-app-meta-line">
                      <FiBook size={13} className="td-app-meta-icon" />
                      <span>{selectedJob?.school || 'School'}</span>
                      <span className="td-app-dot">·</span>
                      <FiMapPin size={13} className="td-app-meta-icon" />
                      <span>{selectedJob?.location === 'Benin' ? 'Benin, Edo' : (selectedJob?.location || 'Lagos, Nigeria')}</span>
                    </div>
                  </div>
                </div>

                <div className="td-application-actions">
                  <Motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="td-application-btn td-application-btn--primary"
                  >
                    Update Application Note
                  </Motion.button>
                  <Motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="td-application-btn td-application-btn--secondary"
                    onClick={() => setActiveTab('applications')}
                  >
                    View Application Status
                  </Motion.button>
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
            </Motion.div>
          )}
          {activeTab === 'notifications' && (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-notif-page">
              <div className="td-notif-back td-desktop-only" onClick={() => setActiveTab('dashboard')}>
                <FiArrowLeft size={14} />
                <span>Notification</span>
              </div>
              <div className="td-notif-header td-desktop-only">
                <div>
                  <h1>Notifications</h1>
                  <p>Stay up to date with your applications, job opportunities, and account updates.</p>
                </div>
                <div className="td-notif-header-actions">
                  <span className="td-notif-unread-summary"><span /> {unreadNotificationCount} unread</span>
                  <button type="button" className="td-notif-mark-read" onClick={handleMarkAllNotificationsAsRead}>
                    Mark all as read
                  </button>
                </div>
              </div>

              <div className="td-notif-filter-tabs td-desktop-only">
                {['All', 'Unread', 'Job Alerts', 'Account'].map(filter => (
                  <Motion.button
                    key={filter}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`td-notif-filter-btn ${notifFilter === filter ? 'td-notif-filter-btn--active' : ''}`}
                    onClick={() => setNotifFilter(filter)}
                  >
                    {filter}
                  </Motion.button>
                ))}
              </div>

              <div className="td-notif-section-label td-desktop-only">RECENT ACTIVITIES</div>
              <div className="td-notif-mobile-section-label td-mobile-only">New</div>

              <div className="td-notif-list">
                {filteredNotifications.slice(0, visibleNotifCount).map(notif => (
                  <Motion.div
                    key={notif.id}
                    variants={cardVariants}
                    className={`td-notif-card ${!notif.read ? 'td-notif-card--unread' : ''}`}
                    onClick={() => openNotificationModal(notif)}
                    style={{ cursor: 'pointer' }}
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
                              <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-notif-btn td-notif-btn--primary">Reply</Motion.button>
                              <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="td-notif-btn td-notif-btn--outline">Archive</Motion.button>
                            </>
                          )}
                        </div>
                        <div className="td-mobile-only td-mobile-action-row">
                          <span className="td-notif-mobile-link">View Details</span>
                          <span className="td-notif-mobile-time">{notif.time.replace(' mins ago', 'm ago').replace(' min ago', 'm ago').replace(' hours ago', 'h ago').replace(' hour ago', 'h ago').replace(' days ago', 'd ago').replace(' day ago', 'd ago')}</span>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </div>

              {isNotificationModalOpen && selectedNotification && (
                <div
                  style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'grid', placeItems: 'center', padding: '20px', zIndex: 1000 }}
                  onClick={() => setIsNotificationModalOpen(false)}
                >
                  <Motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    style={{ width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '22px', padding: '24px', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.2)' }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                      <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Notifications</h3>
                      <button type="button" onClick={() => setIsNotificationModalOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '26px', color: '#475569', cursor: 'pointer' }} aria-label="Close notifications">×</button>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '17px', color: '#111827' }}>{selectedNotification.title}</strong>
                        {!selectedNotification.read && (
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '999px' }}>UNREAD</span>
                        )}
                      </div>
                      <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>{selectedNotification.description}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', color: '#64748b', fontSize: '12px', marginBottom: '20px' }}>
                      <span>{selectedNotification.time}</span>
                      <span>•</span>
                      <span>{selectedNotification.category || 'Account'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(selectedNotification.id)}
                        disabled={notificationActionLoading[selectedNotification.id] === 'delete'}
                        style={{ flex: '1 1 100%', width: '100%', minHeight: '42px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', color: '#0f172a', fontWeight: 600, cursor: notificationActionLoading[selectedNotification.id] === 'delete' ? 'not-allowed' : 'pointer' }}
                      >
                        {notificationActionLoading[selectedNotification.id] === 'delete' ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </Motion.div>
                </div>
              )}

              {filteredNotifications.length === 0 && (
                <div className="td-notif-empty">
                  <FiBell size={40} />
                  <p>No notifications in this category.</p>
                </div>
              )}

              {filteredNotifications.length > visibleNotifCount && (
                <div className="td-notif-footer td-desktop-only">
                  <p className="td-notif-count">Showing {Math.min(visibleNotifCount, filteredNotifications.length)} of {totalNotifications} notifications</p>
                  <Motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="td-notif-load-more"
                    onClick={() => setVisibleNotifCount(prev => prev + 12)}
                  >
                    Load More
                  </Motion.button>
                </div>
              )}
            </Motion.div>
          )}
          {activeTab === 'invitations' && (
            selectedTeacherInvitation ? renderTeacherInvitationDetails() : invitationItems.length > 0 ? (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-invitations-page">
              <header className="td-invitations-heading">
                <div>
                  <span className="td-invitations-eyebrow"><FiShield size={13} /> Teacher direct placement</span>
                  <h1>Invitations</h1>
                  <p>Review and respond to prioritized invitations, requests, and direct outreach from schools.</p>
                </div>
                <div className="td-invitations-summary">
                  <span><FiCheckCircle size={15} /> Invitations</span>
                  <strong>{invitationItems.length}</strong>
                  <small>{activeInvitations.length} awaiting response</small>
                </div>
              </header>

              {activeInvitations.length > 0 && (
                <div className="td-invitations-alert">
                  <span className="td-invitations-alert-icon"><FiClock size={17} /></span>
                  <div>
                    <strong>{activeInvitations.length} {activeInvitations.length === 1 ? 'invitation' : 'invitations'} awaiting your review</strong>
                    <p>Review the details and follow up with the school when you are ready.</p>
                  </div>
                </div>
              )}

              <section className="td-invitation-section">
                <div className="td-invitation-section-heading">
                  <h2>Needs your response <span>{activeInvitations.length}</span></h2>
                  <small>Sorted by urgency</small>
                </div>
                {activeInvitations.length > 0 ? (
                  <div className="td-invitation-list">
                    {activeInvitations.map((invitation) => (
                      <article key={invitation.key} className="td-invitation-card">
                        <div className="td-invitation-card-main">
                          <div className="td-invitation-school-mark" aria-hidden="true">
                            {String(invitation.school).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                          </div>
                          <div className="td-invitation-card-copy">
                            <div className="td-invitation-school-line">
                              <h3>{invitation.school}</h3>
                              <span className="td-invitation-type"><FiCheckCircle size={11} /> {invitation.kind === 'interview' ? 'Interview invitation' : 'School invitation'}</span>
                            </div>
                            <p className="td-invitation-role">{invitation.role}</p>
                            <div className="td-invitation-meta">
                              <span><FiCalendar size={13} /> Received {invitation.receivedAt}</span>
                              {invitation.daysRemaining !== null && (
                                <span className={invitation.daysRemaining <= 5 ? 'is-urgent' : ''}>
                                  <FiClock size={13} /> {invitation.daysRemaining < 0 ? 'Expired' : `Expires in ${invitation.daysRemaining} ${invitation.daysRemaining === 1 ? 'day' : 'days'}`}
                                </span>
                              )}
                              {invitation.kind === 'interview' && invitation.details && <span><FiVideo size={13} /> {invitation.details}</span>}
                            </div>
                          </div>
                          <div className="td-invitation-card-actions">
                            <span className="td-invitation-status">{invitation.kind === 'interview' ? 'Invited to Interview' : 'Invited to Apply'}</span>
                            <button type="button" onClick={() => openTeacherInvitation(invitation)}>
                              {invitation.kind === 'interview' ? 'Review Invitation' : 'View Invitation'} <FiArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                        {invitation.details && invitation.kind !== 'interview' && (
                          <div className="td-invitation-note"><FiMessageSquare size={13} /><span>{invitation.details}</span></div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="td-invitation-history-empty">You’re all caught up. New invitations that need a response will appear here.</div>
                )}
              </section>

              <section className="td-invitation-section td-invitation-history-section">
                <div className="td-invitation-section-heading">
                  <h2>Previous invitations <span className="is-muted">{previousInvitations.length}</span></h2>
                  <button type="button" className="td-invitation-history-toggle" onClick={() => setShowInvitationHistory((visible) => !visible)}>
                    <FiFilter size={13} /> {showInvitationHistory ? 'Hide history' : 'Show history'}
                  </button>
                </div>
                {showInvitationHistory && (
                  previousInvitations.length > 0 ? (
                    <div className="td-invitation-list td-invitation-list--history">
                      {previousInvitations.map((invitation) => (
                        <article key={invitation.key} className="td-invitation-card td-invitation-card--history">
                          <div className="td-invitation-card-main">
                            <div className="td-invitation-school-mark" aria-hidden="true">
                              {String(invitation.school).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                            </div>
                            <div className="td-invitation-card-copy">
                              <h3>{invitation.school}</h3>
                              <p className="td-invitation-role">{invitation.role}</p>
                              <div className="td-invitation-meta"><span><FiCalendar size={13} /> Received {invitation.receivedAt}</span></div>
                            </div>
                            <div className="td-invitation-card-actions">
                              <span className={`td-invitation-status td-invitation-status--history ${String(invitation.status).toLowerCase().replace(/\s+/g, '-')}`}>
                                {invitation.status || 'Closed'}
                              </span>
                              <button type="button" className="is-secondary" onClick={() => openTeacherInvitation(invitation)}>
                                View Details <FiArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="td-invitation-history-empty">Previous invitations will appear here after they are completed or expire.</div>
                  )
                )}
              </section>

              <aside className="td-invitation-privacy">
                <span className="td-invitation-privacy-icon"><FiShield size={16} /></span>
                <div>
                  <strong>Not seeing an anticipated invitation?</strong>
                  <p>Institutions verify teacher qualifications before sending invitations. You can also manage how schools discover your profile.</p>
                </div>
                <button type="button" onClick={() => { setActiveTab('settings'); setSettingsSubTab('privacy'); }}>
                  Check Placement Privacy Settings <FiArrowRight size={14} />
                </button>
              </aside>
            </Motion.div>
            ) : (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
              <div style={{ padding: '4px 6px 0 0', marginBottom: '18px' }}>
                <h1 style={{ fontSize: '2.3rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#1a1a1a', margin: 0 }}>Invitations</h1>
                <p style={{ marginTop: '8px', fontSize: '1.05rem', color: '#4b5563' }}>Review and respond to invitations from schools.</p>
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '48px 24px 28px', minHeight: '640px' }}>
                <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '180px', height: '136px', marginBottom: '20px' }}>
                    <div style={{ position: 'absolute', left: '18px', top: '28px', width: '144px', height: '92px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #dfe7ec', boxShadow: '0 10px 18px rgba(15, 23, 42, 0.06)' }} />
                    <div style={{ position: 'absolute', left: '42px', top: '22px', width: '96px', height: '64px', border: '1px solid #dfe7ec', borderRadius: '12px', background: '#ffffff', transform: 'skewY(-8deg)' }} />
                    <div style={{ position: 'absolute', left: '12px', top: '62px', width: '64px', height: '18px', borderRadius: '999px', background: '#cfe7dc', transform: 'rotate(-18deg)' }} />
                    <div style={{ position: 'absolute', left: '105px', top: '62px', width: '64px', height: '18px', borderRadius: '999px', background: '#dfe7ec', transform: 'rotate(18deg)' }} />
                    <div style={{ position: 'absolute', left: '74px', top: '48px', width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2e9', border: '2px solid #2d9d71', display: 'grid', placeItems: 'center' }}>
                      <FiMail size={18} color="#0f766e" />
                    </div>
                    <div style={{ position: 'absolute', left: '34px', top: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#e0f2e9', border: '2px solid #2d9d71', display: 'grid', placeItems: 'center' }}>
                      <FiMail size={12} color="#0f766e" />
                    </div>
                    <div style={{ position: 'absolute', right: '18px', top: '18px', width: '18px', height: '18px', borderRadius: '50%', background: '#f3f4f6', border: '2px solid #cbd5e1' }} />
                    <div style={{ position: 'absolute', right: '24px', top: '74px', width: '12px', height: '12px', borderRadius: '50%', background: '#b7dcc6' }} />
                    <div style={{ position: 'absolute', left: '132px', top: '82px', width: '22px', height: '22px', borderRadius: '50%', background: '#d1fae5', border: '2px solid #2d9d71', display: 'grid', placeItems: 'center' }}>
                      <FiPlus size={12} color="#1d7a52" />
                    </div>
                  </div>

                  <h2 style={{ margin: '8px 0 10px', fontSize: '2.2rem', lineHeight: 1.2, fontWeight: 800, color: '#111827', textAlign: 'center' }}>You don't have any invitations yet</h2>
                  <p style={{ maxWidth: '520px', margin: 0, textAlign: 'center', color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.7 }}>
                    When a school is interested in your profile, they may invite you to apply for a role or to attend an interview. You'll see their invitations here.
                  </p>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '30px' }}>
                    <button type="button" onClick={() => { setActiveTab('jobs'); setSelectedJob(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', color: '#1f2937', fontWeight: 600, cursor: 'pointer' }}>
                      <FiSearch size={15} /> Browse Jobs
                    </button>
                    <button type="button" onClick={() => { setActiveTab('profile'); setProfileSubTab('professional-info'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', color: '#1f2937', fontWeight: 600, cursor: 'pointer' }}>
                      <FiShield size={15} /> Optimize Candidate Profile
                    </button>
                  </div>

                  <div style={{ width: '100%', marginTop: '36px', background: '#e5e7eb', borderRadius: '14px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #dfe3e8', color: '#1f2937' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#d1fae5', display: 'grid', placeItems: 'center', color: '#166534' }}>
                      <FiSearch size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap' }}>
                      <p style={{ flex: '1 1 0%', minWidth: 0, margin: 0, fontSize: '0.98rem', lineHeight: 1.5 }}>
                        <strong style={{ fontWeight: 700 }}>Want to be discovered faster?</strong><br />
                        <span style={{ color: '#4b5563' }}>Proactively fill in the right details and update your profile so schools can find you.</span>
                      </p>
                      <button type="button" onClick={() => {
                        setActiveTab('profile');
                        setProfileSubTab('overview');
                        openBasicProfileModal();
                      }} style={{ flexShrink: 0, whiteSpace: 'nowrap', border: 'none', background: '#d1fae5', color: '#166534', fontWeight: 700, cursor: 'pointer', padding: '10px 16px', borderRadius: '10px' }}>
                        Edit Credentials →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
            )
          )}

          {(activeTab === 'applications' || activeTab === 'application') && (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-app-page">
              <div className="td-app-header">
                <h1>Applications</h1>
                <p>Keep track of your teaching applications and follow your progress.</p>
              </div>
              <div className="td-app-toolbar">
                <div className="td-app-filter-tabs" role="tablist" aria-label="Application status">
                  {[['all', 'All'], ['pending', 'Pending'], ['shortlisted', 'Shortlisted'], ['rejected', 'Rejected']].map(([value, label]) => (
                    <button type="button" key={value} role="tab" aria-selected={applicationStatusFilter === value} className={applicationStatusFilter === value ? 'is-active' : ''} onClick={() => setApplicationStatusFilter(value)}>{label}</button>
                  ))}
                </div>
                <div className="td-app-toolbar-actions">
                  <label className="td-app-search"><FiSearch size={14} /><input type="search" value={applicationSearch} onChange={(event) => setApplicationSearch(event.target.value)} placeholder="Search applications..." /></label>
                  <select aria-label="Sort applications" value={applicationSort} onChange={(event) => setApplicationSort(event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option></select>
                </div>
              </div>
              <div className="td-app-list">
                {appError && <div style={{ color: '#b91c1c', marginBottom: '12px' }}>{appError}</div>}
                {!loading && visibleApplications.length === 0 && !appError && <div className="td-app-empty">No applications match this filter.</div>}
                {visibleApplications.map(app => (
                  <div key={app.id} className="td-app-card">
                    <div className="td-app-card-left">
                      <div className="td-app-icon-wrapper"><FiBriefcase size={20} /></div>
                      <div className="td-app-content">
                        <div className="td-app-title-row">
                          <h3>{app.title}</h3>
                        </div>
                        <p className="td-app-school">{app.school}</p>
                        <div className="td-app-meta"><span><FiMapPin /> {app.location || 'Location not available'}</span>{app.employmentType && <span><FiBriefcase /> {app.employmentType}</span>}<span><FiCalendar /> Applied: {app.appliedDate}</span></div>
                        {app.interview && <div className="td-app-interview"><FiCalendar /> Interview: {app.interview.interview_date || 'Date not provided'} at {app.interview.interview_time || 'Time not provided'}{app.interview.venue ? ` - ${app.interview.venue}` : app.interview.meeting_link ? ` - ${app.interview.meeting_link}` : ''}</div>}
                        {app.additionalInfo && <div className="td-app-additional-info"><FiInfo /> <span><strong>Additional information:</strong> {app.additionalInfo}</span></div>}
                      </div>
                    </div>
                    <div className="td-app-card-footer">
                      <span className={`td-app-status-badge td-app-status-badge--${getApplicationDisplayStatus(app).replace(/\s+/g, '-')}`}>{applicationStatusLabel(getApplicationDisplayStatus(app))}</span>
                      <button type="button" className="td-app-action-btn" onClick={() => { const job = jobs.find((item) => String(item.id) === String(app.jobId) || String(item.job_id) === String(app.jobId)); if (job) { setSelectedJobOrigin('applications'); setSelectedJob(job); setActiveTab('jobs'); } }}>View Application</button>
                    </div>
                  </div>
                ))}
              </div>
            </Motion.div>
          )}
          {activeTab === 'settings' && (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-settings-page">

              {/* ── Settings Overview: 4 Category Boxes ── */}
              {settingsSubTab === 'overview' && (
                <>
                  <h1 className="td-settings-title">Settings</h1>
                  <div className="td-settings-category-grid">

                    {/* Account Settings */}
                    <Motion.div
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
                    </Motion.div>

                    {/* Privacy & Profile Visibility */}
                    <Motion.div
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
                    </Motion.div>

                    {/* Security & Login Activity */}
                    <Motion.div
                      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }}
                      className="td-settings-category-card"
                      onClick={() => { setLoginActivityView('recent'); setSettingsSubTab('security'); }}
                    >
                      <div className="td-settings-cat-icon-wrap td-settings-cat-icon--orange">
                        <FiShield size={22} />
                      </div>
                      <div className="td-settings-cat-text">
                        <h3>Security &amp; Login Activity</h3>
                        <p>Password, two-factor auth and active sessions</p>
                      </div>
                      <FiArrowRight size={20} className="td-settings-cat-arrow" />
                    </Motion.div>

                    {/* Legal */}
                    <Motion.div
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
                    </Motion.div>

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

              {settingsSubTab === 'profile-view-logs' && (
                <div className="td-sec-wrap td-profile-view-logs-page">
                  <button className="td-sec-breadcrumb" onClick={() => { setSettingsSubTab('overview'); setActiveTab('dashboard'); }}>
                    <FiArrowLeft size={16} />
                    <span>Back to dashboard</span>
                  </button>
                  <div className="td-sec-top-header">
                    <div>
                      <span className="td-profile-view-logs-eyebrow">PROFILE ANALYTICS</span>
                      <h1 className="td-sec-top-title">Profile view logs</h1>
                      <p className="td-sec-top-subtitle">See which schools have viewed your teacher profile and when.</p>
                    </div>
                  </div>
                  <div className="td-profile-view-summary-grid">
                    <div className="td-profile-view-summary-card td-profile-view-summary-card--total">
                      <span className="td-profile-view-summary-label">Total views</span>
                      <strong>{profileViewsCount ?? 0}</strong>
                      <FiEye size={18} />
                    </div>
                    <div className="td-profile-view-summary-card">
                      <span className="td-profile-view-summary-label">Unique schools</span>
                      <strong>{profileViewSummary.uniqueSchools}</strong>
                      <FiBriefcase size={18} />
                    </div>
                    <div className="td-profile-view-summary-card">
                      <span className="td-profile-view-summary-label">Last viewed</span>
                      <strong>{profileViewSummary.lastViewedAt ? formatProfileViewDate(profileViewSummary.lastViewedAt) : 'No views yet'}</strong>
                      <FiClock size={18} />
                    </div>
                  </div>
                  <div className="td-sec-card td-profile-view-logs-card">
                    <div className="td-profile-view-logs-card-header">
                      <div>
                        <h2 className="td-sec-card-heading">Schools that viewed your profile</h2>
                        <p>Recent activity appears first.</p>
                      </div>
                      <span className="td-profile-view-count-chip">{profileViewLogsTotal} total</span>
                    </div>
                    {profileViewLogsLoading && profileViewLogs.length === 0 ? <p className="td-sec-login-state">Loading profile views...</p> : profileViewLogsError && profileViewLogs.length === 0 ? <p className="td-sec-login-state td-sec-login-state--error">{profileViewLogsError}</p> : profileViewLogs.length === 0 ? <p className="td-sec-login-state">No schools have viewed your profile yet.</p> : (
                      <div className="td-profile-view-log-list">
                        {profileViewLogs.map((entry) => (
                          <div className="td-profile-view-log-item" key={entry.id}>
                            <div className="td-profile-view-log-logo">
                              {entry.schoolLogo ? <img src={toTeacherAssetUrl(entry.schoolLogo)} alt="" /> : <FiBriefcase size={18} />}
                            </div>
                            <div className="td-profile-view-log-info">
                              <strong>{entry.schoolName}</strong>
                              {entry.location && <span><FiMapPin size={12} /> {entry.location}</span>}
                            </div>
                            <time>{entry.viewedAt}</time>
                          </div>
                        ))}
                      </div>
                    )}
                    {profileViewLogs.length < profileViewLogsTotal && (
                      <button type="button" className="td-sec-view-log-btn" onClick={() => loadProfileViewLogs({ page: profileViewLogsPage + 1, append: true })} disabled={profileViewLogsLoading}>
                        {profileViewLogsLoading ? 'Loading...' : 'Load More'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Security Subtab ── */}
              {settingsSubTab === 'security' && loginActivityView === 'recent' && (
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

                  <form id="change-password-form" className="td-sec-card" onSubmit={handlePasswordChange} style={{ padding: 24, marginTop: 16 }}>
                    <div className="td-sec-card-title-row" style={{ marginBottom: 18 }}>
                      <FiKey size={18} className="td-sec-green-icon" />
                      <h3 className="td-sec-card-heading">Change Password</h3>
                    </div>

                    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                      <PasswordField
                        label="Current password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
                        placeholder="Enter current password"
                      />

                      <PasswordField
                        label="New password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))}
                        placeholder="Enter new password"
                      />

                      <PasswordField
                        label="Confirm password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>

                    {passwordError && <p style={{ color: '#b91c1c', marginTop: 12 }}>{passwordError}</p>}
                    {passwordMessage && <p style={{ color: '#166534', marginTop: 12 }}>{passwordMessage}</p>}

                    <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                      <button type="submit" className="td-sec-btn td-sec-btn--darkgreen" disabled={updatingPassword}>
                        {updatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                      <button type="button" className="td-sec-btn" onClick={() => setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })}>
                        Clear
                      </button>
                    </div>
                  </form>

                  <div className="td-sec-card" style={{ padding: 24, marginTop: 16 }}>
                    <div className="td-sec-card-title-row" style={{ marginBottom: 18 }}>
                      <FiBell size={18} className="td-sec-green-icon" />
                      <h3 className="td-sec-card-heading">Notification Preferences</h3>
                    </div>

                    <div style={{ display: 'grid', gap: 12 }}>
                      {Object.entries({
                        job_matches: 'Job matches',
                        application_status: 'Application status updates',
                        direct_messages: 'Direct messages',
                        system_updates: 'System announcements',
                      }).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePreferenceToggle(key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '1px solid #d1d5db',
                            background: accountPreferences[key] ? '#ecfdf5' : '#f9fafb',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{label}</span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 46,
                            height: 24,
                            borderRadius: 999,
                            background: accountPreferences[key] ? '#10b981' : '#cbd5e1',
                            color: 'white',
                            fontSize: 11,
                            fontWeight: 700,
                          }}>
                            {accountPreferences[key] ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      ))}
                    </div>

                    {preferencesError && <p style={{ color: '#b91c1c', marginTop: 12 }}>{preferencesError}</p>}
                    {preferencesMessage && <p style={{ color: '#166534', marginTop: 12 }}>{preferencesMessage}</p>}
                    {savingPreferences && <p style={{ color: '#2563eb', marginTop: 12 }}>Saving preferences...</p>}
                  </div>

                  <div className="td-sec-card" style={{ padding: 24, marginTop: 16 }}>
                    <div className="td-sec-card-title-row" style={{ marginBottom: 8 }}>
                      <FiTrash2 size={18} className="td-sec-green-icon" />
                      <h3 className="td-sec-card-heading">Delete Account</h3>
                    </div>
                    <p style={{ color: '#4b5563', marginBottom: 16 }}>
                      This will permanently remove your Staffroom account and associated profile data.
                    </p>
                    <button type="button" className="td-sec-btn td-sec-btn--darkgreen" onClick={handleDeleteAccount}>
                      Delete My Account
                    </button>
                  </div>

                  <div className="td-sec-section-spacer" />

                  <div className="td-sec-main-header">
                    <h2 className="td-sec-main-title">Security &amp; Login Activity</h2>
                    <p className="td-sec-main-subtitle">Manage your account security, passwords, and active sessions.</p>
                  </div>

                  <div className="td-sec-auth-card">
                    <div className="td-sec-auth-header">
                      <div className="td-sec-card-title-row">
                        <FiKey size={18} className="td-sec-green-icon" />
                        <h3 className="td-sec-card-heading">Authentication</h3>
                      </div>
                    </div>

                    <div className="td-sec-watermark-lock">
                      <FiLock size={84} /><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </div>

                    <div className="td-sec-auth-body">
                      <div className="td-sec-auth-col">
                        <span className="td-sec-col-label">LAST PASSWORD CHANGE</span>
                        <strong className="td-sec-col-value">Updated from the dashboard</strong>
                        <span className="td-sec-col-hint">Password updates are synced to the live backend</span>
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
                        <button type="button" className="td-sec-btn td-sec-btn--darkgreen" onClick={() => document.getElementById('change-password-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>

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
                      <div className="td-sec-session-item td-sec-session-item--current">
                        <div className="td-sec-session-icon">
                          <FiMonitor size={18} />
                        </div>
                        <div className="td-sec-session-info">
                          <div className="td-sec-session-name-row">
                            <strong className="td-sec-session-name">Current Session</strong>
                            <span className="td-sec-curr-badge">CURRENT</span>
                          </div>
                          <span className="td-sec-session-ip">{user?.email || 'Teacher account'} • Active now</span>
                          <span className="td-sec-session-status">Secure login using JWT session</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="td-sec-card">
                    <div className="td-sec-recent-header">
                      <div className="td-sec-card-title-row">
                        <FiClock size={18} className="td-sec-green-icon" />
                        <h3 className="td-sec-card-heading">Recent Login Activity</h3>
                      </div>
                      <button type="button" className="td-sec-view-log-btn" onClick={() => setLoginActivityView('full')}>View Full Log</button>
                    </div>

                    <div className="td-sec-timeline">
                      {loginActivityLoading ? <p className="td-sec-login-state">Loading login activity...</p> : loginActivityError ? <p className="td-sec-login-state td-sec-login-state--error">{loginActivityError}</p> : loginActivity.length === 0 ? <p className="td-sec-login-state">No login activity recorded.</p> : loginActivity.slice(0, 3).map((entry) => (
                        <div className="td-sec-timeline-item" key={entry.id}>
                          <div className="td-sec-timeline-dot td-sec-dot--green" />
                          <div className="td-sec-timeline-content">
                            <strong className="td-sec-log-title">{entry.title}</strong>
                            <span className="td-sec-log-device">{entry.device}</span>
                            {entry.location && <span className="td-sec-log-location"><FiMapPin size={12} /> {entry.location}</span>}
                          </div>
                          <div className="td-sec-timeline-meta">
                            <span className="td-sec-log-time">{entry.time}</span>
                            <span className="td-sec-ip-pill">{entry.ipAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {settingsSubTab === 'security' && loginActivityView === 'full' && (
                <div className="td-sec-wrap td-sec-login-log-page">
                  <button className="td-sec-breadcrumb" onClick={() => setLoginActivityView('recent')}>
                    <FiArrowLeft size={16} />
                    <span>Security &amp; Login Activity</span>
                  </button>
                  <div className="td-sec-top-header">
                    <div>
                      <h1 className="td-sec-top-title">Full Login Activity</h1>
                      <p className="td-sec-top-subtitle">Review all recorded sign-in activity for your account.</p>
                    </div>
                  </div>
                  <div className="td-sec-card td-sec-login-log-card">
                    <div className="td-sec-card-title-row">
                      <FiClock size={18} className="td-sec-green-icon" />
                      <h2 className="td-sec-card-heading">Login Logs</h2>
                    </div>
                    <div className="td-sec-timeline">
                      {loginActivityLoading && loginActivity.length === 0 ? <p className="td-sec-login-state">Loading login activity...</p> : loginActivityError && loginActivity.length === 0 ? <p className="td-sec-login-state td-sec-login-state--error">{loginActivityError}</p> : loginActivity.length === 0 ? <p className="td-sec-login-state">No login activity recorded.</p> : loginActivity.map((entry) => (
                        <div className="td-sec-timeline-item" key={entry.id}>
                          <div className="td-sec-timeline-dot td-sec-dot--green" />
                          <div className="td-sec-timeline-content">
                            <strong className="td-sec-log-title">{entry.title}</strong>
                            <span className="td-sec-log-device">{entry.device}</span>
                            {entry.location && <span className="td-sec-log-location"><FiMapPin size={12} /> {entry.location}</span>}
                          </div>
                          <div className="td-sec-timeline-meta">
                            <span className="td-sec-log-time">{entry.time}</span>
                            <span className="td-sec-ip-pill">{entry.ipAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {loginActivity.length < loginActivityTotal && (
                      <button type="button" className="td-sec-view-log-btn" onClick={() => loadLoginActivity({ page: loginActivityPage + 1, append: true })} disabled={loginActivityLoading}>
                        {loginActivityLoading ? 'Loading...' : 'Load More'}
                      </button>
                    )}
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
                      <button type="button" className="td-legal-card-link" onClick={() => setSettingsSubTab('legal-terms')}>
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
                      <button type="button" className="td-legal-card-link" onClick={() => setSettingsSubTab('legal-privacy')}>
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
                      <button type="button" className="td-legal-card-link" onClick={() => setSettingsSubTab('legal-cookies')}>
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

              {['legal-terms', 'legal-privacy', 'legal-cookies'].includes(settingsSubTab) && (
                <div className="td-legal-document-wrap">
                  <button className="td-legal-breadcrumb" onClick={() => setSettingsSubTab('legal')}>
                    <FiArrowLeft size={16} />
                    <span>Settings / Legal</span>
                  </button>

                  <div className="td-legal-document">
                    <div className="td-legal-document-icon">
                      {settingsSubTab === 'legal-terms' ? <FiFileText size={22} /> : settingsSubTab === 'legal-privacy' ? <FiShield size={22} /> : <FiGlobe size={22} />}
                    </div>
                    <h1 className="td-legal-title">
                      {settingsSubTab === 'legal-terms' ? 'Terms of Service' : settingsSubTab === 'legal-privacy' ? 'Privacy Policy' : 'Cookie Policy'}
                    </h1>
                    {settingsSubTab === 'legal-terms' && (
                      <>
                        <p className="td-legal-document-lead">These terms explain the rules and responsibilities that apply when you use Staffroom.</p>
                        <h2>Using Staffroom</h2>
                        <p>Staffroom connects qualified teachers with schools. Please provide accurate information, keep your account secure, and use the platform only for legitimate education recruitment purposes.</p>
                        <h2>Your account and content</h2>
                        <p>You are responsible for activity on your account and for the accuracy of profiles, applications, documents, and other content you submit. Do not impersonate another person or upload misleading or unlawful content.</p>
                      </>
                    )}
                    {settingsSubTab === 'legal-privacy' && (
                      <>
                        <p className="td-legal-document-lead">This policy explains how Staffroom handles the personal and professional information you provide.</p>
                        <h2>Information we use</h2>
                        <p>We use account, profile, application, and communication information to operate the platform, connect teachers with schools, improve our services, and protect the Staffroom community.</p>
                        <h2>Your choices</h2>
                        <p>You can review and update profile information through your account settings. Profile visibility controls let you manage how schools and recruiters discover your professional profile.</p>
                      </>
                    )}
                    {settingsSubTab === 'legal-cookies' && (
                      <>
                        <p className="td-legal-document-lead">Cookies and similar technologies help Staffroom remember your preferences and keep the platform reliable.</p>
                        <h2>How cookies help</h2>
                        <p>We may use essential cookies for sign-in and security, along with limited analytics technologies to understand platform usage and improve the experience.</p>
                        <h2>Managing cookies</h2>
                        <p>You can manage cookies through your browser settings. Blocking essential cookies may affect sign-in and other dashboard features.</p>
                      </>
                    )}
                  </div>
                </div>
              )}

            </Motion.div>
          )}
          {activeTab === 'profile' && (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-profile-tab-page">
              {profileSubTab === 'profile-preview' && !showBasicProfileModal ? (
                <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-profile-preview-page">
                  <header className="td-preview-page-heading">
                    <div>
                      <button type="button" className="td-preview-back-btn" onClick={() => setProfileSubTab('overview')}>
                        <FiArrowLeft size={17} />
                        <span>Back to profile</span>
                      </button>
                      <h1>Preview Your Profile</h1>
                    </div>
                    <div className="td-preview-page-actions">
                      <button type="button" className="td-preview-edit-btn" onClick={openBasicProfileModal}>
                        <FiEdit2 size={15} /> Edit Profile
                      </button>
                      <button
                        type="button"
                        className="td-preview-share-btn"
                        onClick={async () => {
                          const shareData = { title: `${profileFullName} | Teacher Profile`, url: window.location.href };
                          try {
                            if (navigator.share) await navigator.share(shareData);
                            else {
                              await navigator.clipboard.writeText(shareData.url);
                              setProfileShareMessage('Profile link copied to clipboard.');
                            }
                          } catch (error) {
                            if (error.name !== 'AbortError') {
                              console.error('Unable to share teacher profile.', error);
                              setProfileShareMessage('Unable to share the profile link.');
                            }
                          }
                        }}
                      >
                        <FiShare2 size={15} /> Share Profile
                      </button>
                    </div>
                  </header>
                  {profileShareMessage && <p className="td-preview-share-message" role="status">{profileShareMessage}</p>}

                  <section className="td-preview-card">
                    <header className="td-preview-hero">
                      <div className="td-preview-avatar" aria-label={profileFullName}>
                        {profileState?.avatar_url || profileState?.profile_photo || profileState?.photo_url ? (
                          <img src={toTeacherAssetUrl(profileState.avatar_url || profileState.profile_photo || profileState.photo_url)} alt="" />
                        ) : getInitials(profileFullName)}
                      </div>
                      <div className="td-preview-hero-copy">
                        <div className="td-preview-name-row">
                          <h2>{profileFullName}</h2>
                          <span className={`td-preview-verified ${isTrcnVerified ? '' : 'td-preview-verified--muted'}`}><FiCheckCircle size={12} />{trcnStatusLabel}</span>
                        </div>
                        <p>{profileRoleTitle}</p>
                        <div className="td-preview-meta">
                          <span><FiMapPin size={15} />{profileLocation}</span>
                          <span><FiAward size={15} />{profYearsExp}</span>
                        </div>
                      </div>
                    </header>

                    <section className="td-preview-section td-preview-summary">
                      <h2><FiFileText /> Professional Summary</h2>
                      <p>{profSummary || 'No professional summary has been provided.'}</p>
                    </section>

                    <section className="td-preview-section td-preview-experience">
                      <h2><FiBriefcase /> Professional Experience</h2>
                      {experienceList.length ? <div className="td-preview-list">{experienceList.map((experience, index) => (
                        <article key={`${experience.role || 'experience'}-${index}`} className="td-preview-list-item">
                          <div className="td-preview-timeline-dot" />
                          <div>
                            <span>{normalizeProfileValue(experience.period)}</span>
                            <strong>{normalizeProfileValue(experience.role, 'Role not provided')}</strong>
                            <p>{normalizeProfileValue(experience.school, 'School not provided')}{experience.location ? ` · ${experience.location}` : ''}</p>
                            {experience.description && <p className="td-preview-experience-description">{experience.description}</p>}
                          </div>
                        </article>
                      ))}</div> : <p className="td-preview-empty">No professional experience has been provided.</p>}
                    </section>

                    <div className="td-preview-grid">
                      <div className="td-preview-column">
                        <section className="td-preview-section">
                          <h2><FiBook /> Education</h2>
                          {educationList.length ? educationList.map((education, index) => (
                            <article key={`${education.degree || 'education'}-${index}`} className="td-preview-education-item">
                              <FiBook /><div><strong>{normalizeProfileValue(education.degree, 'Qualification not provided')}</strong><p>{normalizeProfileValue(education.institution, 'Institution not provided')}</p><span>{normalizeProfileValue(education.period)}</span></div>
                            </article>
                          )) : <p className="td-preview-empty">No education has been provided.</p>}
                        </section>

                        <section className="td-preview-section">
                          <h2><FiAward /> Professional Certifications</h2>
                          {sessionCertifications.length || profileState?.trcn_number ? (
                            <div className="td-preview-certification-list">
                              {sessionCertifications.map((certification) => (
                                <article key={certification.id} className="td-preview-certification-item">
                                  <FiShield />
                                  <div><strong>{certification.name}</strong><p>{certification.organisation}{certification.number ? ` · ${certification.number}` : ''}</p></div>
                                </article>
                              ))}
                              {profileState?.trcn_number && (
                                <article className="td-preview-certification-item">
                                  <FiShield />
                                  <div><strong>TRCN Registered Educator</strong><p>Registration No: {profileState.trcn_number}</p></div>
                                  <span className={`td-preview-certification-status ${isTrcnVerified ? '' : 'is-muted'}`}>{trcnStatusBadge}</span>
                                </article>
                              )}
                            </div>
                          ) : <p className="td-preview-empty">No professional certifications have been provided.</p>}
                        </section>

                        <section className="td-preview-section">
                          <h2><FiGlobe /> Languages</h2>
                          <div className="td-preview-tags">{skillExpertise.languages.length ? skillExpertise.languages.map((language) => <span key={language}>{language}</span>) : <em>Not provided</em>}</div>
                        </section>
                      </div>

                      <div className="td-preview-column">
                        <section className="td-preview-section">
                          <h2><FiZap /> Skills &amp; Expertise</h2>
                          <dl className="td-preview-expertise-details">
                            <div>
                              <dt>Subjects:</dt>
                              <dd>{profSubjects.length ? profSubjects.join(', ') : 'Not provided'}</dd>
                            </div>
                            <div>
                              <dt>Teaching Levels:</dt>
                              <dd>{profTeachingLevels.length ? profTeachingLevels.join(', ') : 'Not provided'}</dd>
                            </div>
                            <div>
                              <dt>Teaching Skills:</dt>
                              <dd>{skillExpertise.teachingSkills.length ? skillExpertise.teachingSkills.join(', ') : 'Not provided'}</dd>
                            </div>
                          </dl>
                        </section>

                        <section className="td-preview-section">
                          <h2><FiBook /> Curriculum &amp; Examination Experience</h2>
                          <div className="td-preview-tags">{skillExpertise.curriculumExperience.length ? skillExpertise.curriculumExperience.map((item) => <span key={item}>{item}</span>) : <em>Not provided</em>}</div>
                        </section>

                        <section className="td-preview-section">
                          <h2><FiMonitor /> Digital &amp; Classroom Tools</h2>
                          <div className="td-preview-tags">{skillExpertise.classroomTools.length ? skillExpertise.classroomTools.map((tool) => <span key={tool}>{tool}</span>) : <em>Not provided</em>}</div>
                        </section>
                      </div>
                    </div>

                    {activeResume?.url && (
                      <footer className="td-preview-resume">
                        <span><FiFileText /> CV / Resume</span>
                        <strong>{activeResume.name}</strong>
                        <div className="td-preview-doc-actions">
                          <button type="button" onClick={() => handleResumeAction('download')}><FiDownload /> Download</button>
                          <button type="button" onClick={() => handleResumeAction('view')}><FiEye /> Preview</button>
                        </div>
                      </footer>
                    )}
                  </section>
                  {renderDocumentPreviewModal()}
                </Motion.div>
              ) : profileSubTab === 'overview' || showBasicProfileModal ? (
                <>
                  {profileCompletionNotice && (
                    <div
                      role="status"
                      style={{
                        width: '100%',
                        margin: '0 0 14px',
                        padding: '12px 16px',
                        border: '1px solid #86efac',
                        borderRadius: 12,
                        background: '#f0fdf4',
                        color: '#166534',
                        boxShadow: '0 8px 24px rgba(22, 101, 52, 0.14)',
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      {profileCompletionNotice}
                    </div>
                  )}
                  <div className="td-profile-page-heading">
                    <div>
                      <h1 className="td-profile-main-title">My Profile</h1>
                      <p>Manage your professional profile so schools can learn more about you.</p>
                    </div>
                    <button type="button" className="td-profile-btn-preview" onClick={() => setProfileSubTab('profile-preview')}>
                      <FiEye size={15} />
                      <span>Preview Profile</span>
                    </button>
                  </div>

                  <div className="td-profile-overview-shell">
                  <div className="td-profile-overview-top">
                  <div className="td-profile-header-card">
                    <div className="td-profile-header-left">
                      <div className="td-profile-avatar-container">
                        {profileState?.avatar_url || profileState?.profile_photo || profileState?.photo_url ? (
                          <img src={toTeacherAssetUrl(profileState.avatar_url || profileState.profile_photo || profileState.photo_url)} alt="" />
                        ) : (
                          <div className="td-profile-avatar-initials" aria-label={profileFullName}>{getInitials(profileFullName)}</div>
                        )}
                      </div>
                      <div className="td-profile-info-block">
                        <div className="td-profile-name-row">
                          <h2>{profileFullName}</h2>
                          <svg className="td-profile-verified-badge" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L14.4 3.7L17.3 3.3L18.8 5.8L21.5 6.9L21.7 9.8L23.4 12.1L21.7 14.4L21.5 17.3L18.8 18.4L17.3 20.9L14.4 20.5L12 22.2L9.6 20.5L6.7 20.9L5.2 18.4L2.5 17.3L2.3 14.4L0.6 12.1L2.3 9.8L2.5 6.9L5.2 5.8L6.7 3.3L9.6 3.7L12 2Z" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8.5 12L11 14.5L16 9.5" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="td-profile-subject-title">{profSubjects.length ? profSubjects.slice(0, 2).join(', ') : profileRoleTitle}</p>
                        <p className="td-profile-role-title">{profileRoleTitle}</p>
                        <div className="td-profile-meta-row">
                        <div className="td-profile-meta-item"><FiMapPin size={15} className="td-profile-meta-icon" /><span>{profileLocation}</span></div>
                        {profTeachingLevels.length > 0 && <div className="td-profile-meta-item"><FiAward size={15} className="td-profile-meta-icon" /><span>{profTeachingLevels.slice(0, 2).join(', ')}</span></div>}
                        {profSubjects.length > 0 && <div className="td-profile-meta-item"><FiBook size={15} className="td-profile-meta-icon" /><span>{profSubjects.slice(0, 2).join(', ')}</span></div>}
                        </div>
                        <div className="td-profile-header-actions">
                        <button type="button" className="td-profile-btn-edit" onClick={openBasicProfileModal}>
                          <FiEdit2 size={14} />
                          <span>Edit basic info</span>
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <section className={`td-profile-readiness ${nextProfileStep ? 'is-incomplete' : 'is-complete'}`} aria-label="Profile completion status">
                    <div className="td-readiness-heading">
                      <span className="td-readiness-icon">{nextProfileStep ? <FiEdit2 size={18} /> : <FiCheckCircle size={20} />}</span>
                      <div>
                        <strong>{nextProfileStep ? 'Keep building your profile' : "You're ready to apply!"}</strong>
                        <p>{nextProfileStep ? 'Complete the key sections below to help schools review your applications.' : 'Your profile contains the information schools need to review your applications.'}</p>
                      </div>
                    </div>
                    <div className="td-readiness-progress" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profileCompletionPercent}>
                      <span style={{ width: `${profileCompletionPercent}%` }} />
                    </div>
                    <div className="td-readiness-checklist">
                      {[
                        { key: 'professional-info', label: 'Basic & Professional Information' },
                        { key: 'education', label: 'Education & Certifications' },
                        { key: 'teaching-experience', label: 'Teaching Experience' },
                      ].map((item) => {
                        const completed = Boolean(profileCompletionSteps.find((step) => step.key === item.key)?.completed);
                        return <span key={item.key} className={completed ? 'is-complete' : ''}><FiCheckCircle size={14} />{item.label}</span>;
                      })}
                    </div>
                  </section>
                  </div>
                  </div>
                  {renderProfileNavigation('overview')}

                  <section className="td-profile-overview-panel">
                    <div className="td-profile-overview-panel-heading">
                      <div className="td-overview-icon"><FiUser size={20} /></div>
                      <div>
                        <h2>Basic &amp; Professional Information</h2>
                        <p>This information appears on your profile and helps schools understand your background.</p>
                      </div>
                      <button type="button" onClick={openBasicProfileModal}><FiEdit2 size={14} />Edit</button>
                    </div>
                    <div className="td-profile-overview-details">
                      <div className="td-overview-detail-list">
                        <div><FiBriefcase size={16} /><span><strong>{profileRoleTitle || 'Not provided'}</strong><small>Professional title</small></span></div>
                        <div><FiMapPin size={16} /><span><strong>{profileLocation || 'Not provided'}</strong><small>Location</small></span></div>
                        <div><FiBook size={16} /><span><strong>{profSubjects.length ? profSubjects.join(', ') : 'Not provided'}</strong><small>Subjects</small></span></div>
                        <div><FiAward size={16} /><span><strong>{profTeachingLevels.length ? profTeachingLevels.join(', ') : 'Not provided'}</strong><small>Teaching levels</small></span></div>
                      </div>
                      <div className="td-overview-summary">
                        <h3><FiFileText size={16} />Professional summary</h3>
                        <p>{profSummary || 'Add a short professional summary to introduce your teaching experience and approach.'}</p>
                      </div>
                    </div>
                  </section>
                  {showBasicProfileModal && (
                    <div className="td-basic-profile-modal-backdrop" onMouseDown={(event) => {
                      if (event.target === event.currentTarget && !savingProfessionalInfo) setShowBasicProfileModal(false);
                    }}>
                      <form className="td-basic-profile-modal" role="dialog" aria-modal="true" aria-labelledby="td-basic-profile-title" onSubmit={handleSaveBasicProfile}>
                        <header className="td-basic-profile-modal-header">
                          <div>
                            <h2 id="td-basic-profile-title">Edit Basic &amp; Professional Information</h2>
                            <p>This information appears on your profile and helps schools understand your background and expertise.</p>
                          </div>
                          <button type="button" aria-label="Close edit profile dialog" onClick={() => setShowBasicProfileModal(false)} disabled={savingProfessionalInfo}><FiX size={20} /></button>
                        </header>

                        <div className="td-basic-profile-modal-body">
                          <section className="td-basic-profile-photo">
                            <h3>Profile photo</h3>
                            <div className="td-basic-profile-photo-row">
                              <div className="td-basic-profile-avatar">
                                {profileState?.avatar_url || profileState?.profile_photo || profileState?.photo_url
                                  ? <img src={toTeacherAssetUrl(profileState.avatar_url || profileState.profile_photo || profileState.photo_url)} alt="" />
                                  : getInitials(profileFullName)}
                              </div>
                              <div className="td-basic-profile-photo-controls">
                                <button type="button" onClick={() => profilePhotoInputRef.current?.click()} disabled={profilePhotoUploading}>
                                  <FiUpload size={13} />{profilePhotoUploading ? 'Uploading...' : 'Change photo'}
                                </button>
                                <input ref={profilePhotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePhotoSelection} hidden />
                                <p>JPG, PNG or WebP. Max size 2 MB.</p>
                                {profilePhotoError && <small role="alert">{profilePhotoError}</small>}
                              </div>
                            </div>
                          </section>

                          <section>
                            <h3 className="td-basic-profile-section-title">Professional details</h3>
                            <div className="td-basic-profile-fields">
                              <label>
                                <span className="td-basic-profile-label-text">Professional title <span aria-hidden="true">*</span></span>
                                <input required value={basicProfileDraft.title} onChange={(event) => setBasicProfileDraft((draft) => ({ ...draft, title: event.target.value }))} placeholder="e.g. Mathematics Teacher" />
                                <small>Use a clear title that describes your teaching role.</small>
                              </label>
                              <label>
                                <span className="td-basic-profile-label-text">Location <span aria-hidden="true">*</span></span>
                                <input required value={basicProfileDraft.location} onChange={(event) => setBasicProfileDraft((draft) => ({ ...draft, location: event.target.value }))} placeholder="City, State or Region" />
                                <small>City, State or Region</small>
                              </label>

                              <div className="td-basic-profile-field">
                                <label className="td-basic-profile-label-text" htmlFor="td-basic-profile-subject-input">Primary subjects <span aria-hidden="true">*</span></label>
                                <div className="td-basic-profile-chipbox">
                                  {basicProfileDraft.subjects.map((subject) => (
                                    <button key={subject} type="button" onClick={() => setBasicProfileDraft((draft) => ({ ...draft, subjects: draft.subjects.filter((entry) => entry !== subject) }))} aria-label={`Remove ${subject}`}>
                                      {subject}<FiX size={12} />
                                    </button>
                                  ))}
                                  <input
                                    id="td-basic-profile-subject-input"
                                    value={basicProfileSubjectInput}
                                    onChange={(event) => setBasicProfileSubjectInput(event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === 'Enter' && basicProfileSubjectInput.trim()) {
                                        event.preventDefault();
                                        const subject = basicProfileSubjectInput.trim();
                                        setBasicProfileDraft((draft) => draft.subjects.includes(subject) ? draft : ({ ...draft, subjects: [...draft.subjects, subject] }));
                                        setBasicProfileSubjectInput('');
                                      }
                                    }}
                                    placeholder="Type a subject and press Enter"
                                  />
                                </div>
                                <small>Add each subject and press Enter. Select a subject chip to remove it.</small>
                              </div>

                              <fieldset className="td-basic-profile-levels">
                                <legend>Teaching levels <span aria-hidden="true">*</span></legend>
                                <div>
                                  {teacherLevelOptions.map((level) => (
                                    <label key={level}>
                                      <input
                                        type="checkbox"
                                        checked={basicProfileDraft.teachingLevels.includes(level)}
                                        onChange={() => setBasicProfileDraft((draft) => ({
                                          ...draft,
                                          teachingLevels: draft.teachingLevels.includes(level)
                                            ? draft.teachingLevels.filter((entry) => entry !== level)
                                            : [...draft.teachingLevels, level],
                                        }))}
                                      />
                                      {level}
                                    </label>
                                  ))}
                                </div>
                                <small>Select the teaching levels you are qualified or experienced to teach.</small>
                              </fieldset>

                              <label className="td-basic-profile-summary">
                                <span className="td-basic-profile-label-text">Professional summary <span aria-hidden="true">*</span></span>
                                <textarea required maxLength={500} value={basicProfileDraft.summary} onChange={(event) => setBasicProfileDraft((draft) => ({ ...draft, summary: event.target.value }))} placeholder="Share your teaching background, experience and what you bring to a school." />
                                <small>Write a short introduction for schools. <span>{basicProfileDraft.summary.length}/500 characters</span></small>
                              </label>
                            </div>
                          </section>
                          {basicProfileError && <p className="td-basic-profile-error" role="alert">{basicProfileError}</p>}
                        </div>

                        <footer className="td-basic-profile-modal-footer">
                          <button type="button" onClick={() => setShowBasicProfileModal(false)} disabled={savingProfessionalInfo}>Cancel</button>
                          <button type="submit" disabled={savingProfessionalInfo}>{savingProfessionalInfo ? 'Saving...' : 'Save changes'}</button>
                        </footer>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <div className="td-subtab-view">
                  {renderProfileSectionOverview(profileSubTab)}
                  {profileSubTab === 'more' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-more-page">
                      <section className="td-more-card">
                        <header className="td-more-heading">
                          <h1>More</h1>
                          <p>Add optional information to personalise your job search and give schools a more complete view of you.</p>
                        </header>
                        {!hasPopulatedMoreContent ? (
                          <>
                            <div className="td-more-empty-state">
                              <div className="td-more-illustration" aria-hidden="true">
                                <span className="td-more-illustration-backdrop" />
                                <div className="td-more-illustration-document">
                                  <span className="td-more-illustration-avatar"><FiUser size={17} /></span>
                                  <i /><i /><i /><i />
                                </div>
                                <span className="td-more-illustration-plus"><FiPlus size={22} /></span>
                              </div>
                              <h2>Add more information (optional)</h2>
                              <p>Job preferences, availability and supporting documents can help schools find the right opportunities for you.</p>
                              <button type="button" onClick={() => setShowMoreInformationModal(true)}>
                                <FiPlus size={16} />Add Information
                              </button>
                            </div>
                            <div className="td-more-shortcuts">
                              <button type="button" className="td-more-shortcut" onClick={openAvailabilityPreferencesModal}>
                                <span className="td-more-shortcut-icon td-more-shortcut-icon--green"><FiBriefcase size={18} /></span>
                                <span><strong>Job preferences</strong><small>{moreJobPreferenceSummary}</small></span>
                              </button>
                              <button type="button" className="td-more-shortcut" onClick={openAvailabilityPreferencesModal}>
                                <span className="td-more-shortcut-icon td-more-shortcut-icon--blue"><FiCalendar size={18} /></span>
                                <span><strong>Availability</strong><small>{moreAvailabilitySummary}</small></span>
                              </button>
                              <button type="button" className="td-more-shortcut" onClick={() => openProfileSection('cv-resume')}>
                                <span className="td-more-shortcut-icon td-more-shortcut-icon--purple"><FiFileText size={18} /></span>
                                <span><strong>Documents</strong><small>{moreDocumentsSummary}</small></span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="td-more-populated">
                            {hasPopulatedPreferences && (
                              <section className="td-more-populated-card">
                                <header className="td-more-populated-header">
                                  <span className="td-more-populated-icon td-more-populated-icon--green"><FiSliders size={17} /></span>
                                  <div><h2>Job Preferences &amp; Availability</h2><p>Let schools know your job preferences and availability. This helps us show you more relevant opportunities.</p></div>
                                  <button type="button" onClick={openAvailabilityPreferencesModal}><FiEdit2 size={13} />Edit</button>
                                </header>
                                <div className="td-more-populated-details">
                                  {moreAvailabilityDisplay && <div><FiCalendar size={15} /><span><small>Availability</small><strong>{moreAvailabilityDisplay}</strong></span></div>}
                                  {moreEmploymentDisplay && <div><FiFileText size={15} /><span><small>Employment type</small><strong>{moreEmploymentDisplay}</strong></span></div>}
                                  {moreLocationDisplay && <div><FiMapPin size={15} /><span><small>Preferred locations</small><strong>{moreLocationDisplay}</strong></span></div>}
                                  {moreRelocationDisplay && <div><FiArrowRight size={15} /><span><small>Relocation preference</small><strong>{moreRelocationDisplay}</strong></span></div>}
                                </div>
                              </section>
                            )}
                            <section className="td-more-populated-card td-more-documents-card">
                                <header className="td-more-populated-header">
                                  <span className="td-more-populated-icon td-more-populated-icon--blue"><FiFileText size={17} /></span>
                                  <div><h2>Documents</h2><p>Upload your CV and other supporting documents. These are optional but can help schools learn more about you.</p></div>
                                  <button type="button" onClick={() => openProfileSection('cv-resume')}><FiFileText size={13} />Manage Documents</button>
                                </header>
                                {hasPopulatedDocuments ? (
                                  <div className="td-more-document-list">
                                  {teacherCvUrl && (
                                    <div className="td-more-document-row">
                                      <button type="button" className="td-more-document-main" onClick={() => openDocumentPreview({ name: cvDocumentName, uri: teacherCvUrl })}>
                                        <span className={`td-more-document-icon ${getDocumentMimeType(cvDocumentName) === 'application/pdf' ? 'is-pdf' : 'is-doc'}`}><FiFileText size={15} /></span>
                                        <span className="td-more-document-info"><strong>{cvDocumentName}</strong><small>Uploaded {activeResume?.uploadDate || 'Date unavailable'} · {activeResume?.size && activeResume.size !== 'Uploaded' ? activeResume.size : 'Size unavailable'}</small></span>
                                      </button>
                                      <span className="td-more-document-status"><FiCheck size={11} />Uploaded</span>
                                      <details className="td-more-document-menu">
                                        <summary aria-label={`Options for ${cvDocumentName}`}><FiMoreVertical size={16} /></summary>
                                        <div><button type="button" onClick={() => openDocumentPreview({ name: cvDocumentName, uri: teacherCvUrl })}>Preview document</button></div>
                                      </details>
                                    </div>
                                  )}
                                  {supportingDocuments.map((document) => {
                                    const mimeType = getDocumentMimeType(document.name);
                                    const iconClass = mimeType === 'application/pdf'
                                      ? 'is-pdf'
                                      : mimeType.startsWith('image/')
                                        ? 'is-image'
                                        : 'is-doc';
                                    return (
                                      <div className="td-more-document-row" key={document.id}>
                                        <button type="button" className="td-more-document-main" onClick={() => openDocumentPreview({ name: document.name, uri: document.previewUrl })}>
                                          <span className={`td-more-document-icon ${iconClass}`}><FiFileText size={15} /></span>
                                          <span className="td-more-document-info"><strong>{document.name}</strong><small>Added {document.addedAt} · {formatFileSize(document.size)}</small></span>
                                        </button>
                                        <span className="td-more-document-status"><FiCheck size={11} />Added</span>
                                        <details className="td-more-document-menu">
                                          <summary aria-label={`Options for ${document.name}`}><FiMoreVertical size={16} /></summary>
                                          <div><button type="button" onClick={() => openDocumentPreview({ name: document.name, uri: document.previewUrl })}>Preview document</button></div>
                                        </details>
                                      </div>
                                    );
                                  })}
                                  </div>
                                ) : (
                                  <div className="td-more-documents-empty">
                                    <span><FiFileText size={17} /></span>
                                    <strong>No documents added yet</strong>
                                    <p>Upload your CV or supporting documents to help schools learn more about you.</p>
                                    <button type="button" onClick={() => openProfileSection('cv-resume')}><FiPlus size={13} />Add documents</button>
                                  </div>
                                )}
                              </section>
                          </div>
                        )}
                      </section>
                      {showMoreInformationModal && (
                        <div
                          className="td-modal-overlay td-more-modal-overlay"
                          onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setShowMoreInformationModal(false);
                          }}
                        >
                          <section className="td-more-modal" role="dialog" aria-modal="true" aria-labelledby="td-more-modal-title">
                            <header>
                              <div><h2 id="td-more-modal-title">Add more information</h2><p>Choose an area to update. Your changes use the existing profile forms.</p></div>
                              <button type="button" aria-label="Close add information dialog" onClick={() => setShowMoreInformationModal(false)}><FiX size={19} /></button>
                            </header>
                            <div className="td-more-modal-options">
                              <button type="button" onClick={() => { setShowMoreInformationModal(false); openProfileSection('personal-info'); }}>
                                <FiUser size={17} /><span><strong>Personal information</strong><small>Update your identity and contact details.</small></span><FiArrowRight size={16} />
                              </button>
                              <button type="button" onClick={() => { setShowMoreInformationModal(false); openProfileSection('trcn-certification'); }}>
                                <FiAward size={17} /><span><strong>TRCN certification</strong><small>Review your registration and verification details.</small></span><FiArrowRight size={16} />
                              </button>
                              <button type="button" onClick={() => { setShowMoreInformationModal(false); openAvailabilityPreferencesModal(); }}>
                                <FiBriefcase size={17} /><span><strong>Job preferences</strong><small>Choose employment type and preferred location.</small></span><FiArrowRight size={16} />
                              </button>
                              <button type="button" onClick={() => { setShowMoreInformationModal(false); openAvailabilityPreferencesModal(); }}>
                                <FiCalendar size={17} /><span><strong>Availability</strong><small>Set when you can start a new position.</small></span><FiArrowRight size={16} />
                              </button>
                              <button type="button" onClick={() => { setShowMoreInformationModal(false); openProfileSection('cv-resume'); }}>
                                <FiFileText size={17} /><span><strong>CV / Resume</strong><small>Upload or replace your supporting document.</small></span><FiArrowRight size={16} />
                              </button>
                            </div>
                          </section>
                        </div>
                      )}
                      {renderDocumentPreviewModal()}
                    </Motion.div>
                  )}
                  {/* 1. Personal Info Tab */}
                  {profileSubTab === 'personal-info' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-pers-info-page">
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
                            <label className="td-pers-label">
                              First Name <span className="td-pers-required-marker" aria-hidden="true">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              className="td-pers-input"
                              value={personalFirstName}
                              onChange={(e) => setPersonalFirstName(e.target.value)}
                            />
                          </div>

                          {/* Last Name */}
                          <div className="td-pers-field-group">
                            <label className="td-pers-label">
                              Last Name <span className="td-pers-required-marker" aria-hidden="true">*</span>
                            </label>
                            <input
                              required
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
                          <button type="button" className="td-pers-contact-btn" onClick={() => { setNewPhoneNumber(''); setPhoneChangeError(''); setProfileSubTab('change-phone'); }}>
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
                            <div className="td-pers-contact-value">{personalEmail || 'No email available'}</div>
                            <div className="td-pers-contact-badge td-pers-badge--verified">
                              <FiCheckCircle size={13} />
                              <span>Verified</span>
                            </div>
                          </div>
                          <button type="button" className="td-pers-contact-btn" onClick={() => { setNewEmailAddress(''); setEmailChangeError(''); setProfileSubTab('change-email'); }}>
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
                            onClick={handleSavePersonalInfo}
                            disabled={savingPersonalInfo}
                          >
                            {savingPersonalInfo ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </Motion.div>
                  )}

                  {/* Change Phone Number Tab */}
                  {profileSubTab === 'change-phone' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-change-phone-page">
                      <button type="button" className="td-change-back-btn" onClick={() => setProfileSubTab('personal-info')}>
                        <FiArrowLeft size={16} />
                        <span>Personal Information</span>
                      </button>
                      <div className="td-change-phone-header">
                        <h1 className="td-change-phone-title">Change phone number</h1>
                        <p className="td-change-phone-desc">Enter your phone number. We'll send a verification code to confirm it.</p>
                      </div>

                      <form className="td-change-phone-card" onSubmit={handlePhoneNumberUpdate}>
                        <label className="td-change-phone-field">
                          <span>Current phone number</span>
                          <div className="td-change-phone-current">
                            <FiLock size={14} />
                            <span>{personalPhone || 'No phone number available'}</span>
                          </div>
                        </label>

                        <label className="td-change-phone-field">
                          <span>New phone number <span className="td-pers-required-marker" aria-hidden="true">*</span></span>
                          <div className="td-change-phone-input-wrap">
                            <span className="td-change-phone-prefix">NG (+234)<FiChevronDown size={14} /></span>
                            <input
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel-national"
                              required
                              placeholder="Enter mobile number"
                              value={newPhoneNumber}
                              onChange={(event) => setNewPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 11))}
                              disabled={savingPhoneNumber}
                            />
                          </div>
                        </label>

                        {phoneChangeError && <p className="td-change-phone-error" role="alert">{phoneChangeError}</p>}

                        <div className="td-change-phone-actions">
                          <button type="button" className="td-change-phone-cancel" onClick={() => setProfileSubTab('personal-info')} disabled={savingPhoneNumber}>Cancel</button>
                          <button type="submit" className="td-change-phone-submit" disabled={savingPhoneNumber || newPhoneNumber.replace(/\D/g, '').length < 10}>
                            {savingPhoneNumber ? 'Saving...' : 'Continue'}
                          </button>
                        </div>
                      </form>

                      <div className="td-change-phone-security">
                        <FiShield size={15} />
                        <div>
                          <strong>Secure Account Updates</strong>
                          <p>Updating your email or password will require re-authentication and verification codes sent to your current trusted devices to ensure your account remains secure.</p>
                        </div>
                      </div>
                    </Motion.div>
                  )}

                  {/* Change Email Tab */}
                  {profileSubTab === 'change-email' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-change-email-page">
                      <button type="button" className="td-change-back-btn" onClick={() => setProfileSubTab('personal-info')}>
                        <FiArrowLeft size={16} />
                        <span>Personal Information</span>
                      </button>
                      <div className="td-change-email-header">
                        <h1 className="td-change-email-title">Change email address</h1>
                        <p className="td-change-email-desc">Enter your new email address. We'll send a verification code to confirm it.</p>
                      </div>

                      <form className="td-change-email-card" onSubmit={handleEmailAddressUpdate}>
                        <label className="td-change-email-field">
                          <span>Current email</span>
                          <div className="td-change-email-current">
                            <FiLock size={14} />
                            <span>{personalEmail || 'No email available'}</span>
                          </div>
                        </label>

                        <label className="td-change-email-field">
                          <span>New email address <span className="td-pers-required-marker" aria-hidden="true">*</span></span>
                          <input
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="e.g. adeyemi.t@school.edu"
                            value={newEmailAddress}
                            onChange={(event) => setNewEmailAddress(event.target.value)}
                            disabled={savingEmailAddress}
                          />
                        </label>

                        {emailChangeError && <p className="td-change-email-error" role="alert">{emailChangeError}</p>}

                        <div className="td-change-email-actions">
                          <button type="button" className="td-change-email-cancel" onClick={() => setProfileSubTab('personal-info')} disabled={savingEmailAddress}>Cancel</button>
                          <button type="submit" className="td-change-email-submit" disabled={savingEmailAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailAddress.trim())}>
                            {savingEmailAddress ? 'Saving...' : 'Continue'}
                          </button>
                        </div>
                      </form>

                      <div className="td-change-email-security">
                        <FiShield size={15} />
                        <div>
                          <strong>Secure Account Updates</strong>
                          <p>Updating your email or password will require re-authentication and verification codes sent to your current trusted devices to ensure your account remains secure.</p>
                        </div>
                      </div>
                    </Motion.div>
                  )}

                  {/* 2. Professional Info Tab */}
                  {profileSubTab === 'professional-info' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-prof-edit-page">
                      <section className="td-prof-skills-card">
                        <header className="td-prof-skills-heading">
                          <span className="td-prof-skills-heading-icon"><FiBarChart2 size={22} /></span>
                          <div>
                            <h1>Skills &amp; Expertise</h1>
                            <p>Showcase your teaching expertise, curriculum experience and professional capabilities.</p>
                          </div>
                        </header>
                        <div className="td-prof-skills-list">
                          {TEACHER_EXPERTISE_CATEGORIES.map((category, index) => {
                            const CategoryIcon = [FiUsers, FiBook, FiMonitor, FiGlobe][index];
                            const iconColor = ['green', 'blue', 'purple', 'orange'][index];
                            return (
                              <article className="td-prof-skills-item" key={category.key}>
                                <span className={`td-prof-skills-item-icon td-prof-skills-item-icon--${iconColor}`}><CategoryIcon size={20} /></span>
                                <div className="td-prof-skills-item-content">
                                  <div className="td-prof-skills-item-title">
                                    <div><h2>{category.title}</h2><p>{category.description}</p></div>
                                    <button type="button" onClick={() => openExpertiseModal(category.key)}><FiEdit2 size={13} />Edit</button>
                                  </div>
                                  <div className="td-prof-skills-tags">
                                    {skillExpertise[category.key].map((item) => <span key={item}>{item}</span>)}
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                      {editingExpertiseCategory && (
                        <div
                          className="td-modal-overlay td-prof-skills-modal-overlay"
                          onMouseDown={(event) => {
                            if (event.target === event.currentTarget) closeExpertiseModal();
                          }}
                        >
                          <form
                            className="td-prof-skills-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="td-prof-skills-modal-title"
                            onSubmit={saveExpertiseTags}
                          >
                            <header className="td-prof-skills-modal-header">
                              <div>
                                <h2 id="td-prof-skills-modal-title">Edit {activeExpertiseCategory?.title}</h2>
                                <p>Manage the items shown in this section of your profile.</p>
                              </div>
                              <button type="button" aria-label="Close skills editor" onClick={closeExpertiseModal}><FiX size={19} /></button>
                            </header>
                            <div className="td-prof-skills-modal-body">
                              <label htmlFor="td-prof-skills-tag-input">Add an item</label>
                              <div className="td-prof-skills-input-row">
                                <input
                                  id="td-prof-skills-tag-input"
                                  value={expertiseTagInput}
                                  onChange={(event) => setExpertiseTagInput(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.preventDefault();
                                      addExpertiseTag();
                                    }
                                  }}
                                  placeholder={editingExpertiseCategory === 'languages' ? 'e.g. Yoruba — Fluent' : 'Enter a skill or area of expertise'}
                                />
                                <button type="button" onClick={addExpertiseTag} disabled={!expertiseTagInput.trim()}><FiPlus size={15} />Add</button>
                              </div>
                              <div className="td-prof-skills-modal-tags" aria-label={`${editingExpertiseCategory} items`}>
                                {expertiseDraftTags.map((tag) => (
                                  <span key={tag}>
                                    {tag}
                                    <button
                                      type="button"
                                      aria-label={`Remove ${tag}`}
                                      onClick={() => setExpertiseDraftTags((tags) => tags.filter((item) => item !== tag))}
                                    >
                                      <FiX size={13} />
                                    </button>
                                  </span>
                                ))}
                                {expertiseDraftTags.length === 0 && <p>No items added. Add one above.</p>}
                              </div>
                              <p className="td-prof-skills-session-note">Changes are kept for this browser session and are not saved to your profile.</p>
                            </div>
                            <footer className="td-prof-skills-modal-footer">
                              <button type="button" onClick={closeExpertiseModal}>Cancel</button>
                              <button type="submit">Save Changes</button>
                            </footer>
                          </form>
                        </div>
                      )}
                    </Motion.div>
                  )}
                  {profileSubTab === 'professional-info-legacy' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-prof-info-page">
                      {/* Edit Profile Row */}
                      <div className="td-prof-nav-bar">
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
                          <div className="td-prof-hero-avatar td-prof-hero-avatar--initials" aria-label={profileFullName}>
                            {profileFullName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="td-prof-hero-details">
                            <div className="td-prof-hero-name-row">
                              <h1 className="td-prof-hero-name">{profileFullName}</h1>
                              <span
                                className="td-prof-trcn-verified-badge"
                                style={{
                                  background: isTrcnVerified ? '#ecfdf5' : '#f8fafc',
                                  color: isTrcnVerified ? '#166534' : '#475569',
                                  borderColor: isTrcnVerified ? '#bbf7d0' : '#dfe7f1'
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isTrcnVerified ? '#15803D' : '#64748B'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>{trcnStatusLabel}</span>
                              </span>
                            </div>
                            <p className="td-prof-hero-role">{profileRoleTitle}</p>
                            <div className="td-prof-hero-meta-row">
                              <div className="td-prof-hero-meta-item">
                                <FiMapPin size={15} />
                                <span>{profileLocation}</span>
                              </div>
                              <div className="td-prof-hero-meta-item">
                                <FiBriefcase size={15} />
                                <span>{profYearsExp}</span>
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
                            {profSummary || 'No professional summary has been added yet. Complete your profile to help schools understand your teaching background.'}
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
                            {profSubjects.length > 0 ? profSubjects.map(subject => (
                              <span key={subject} className="td-prof-sub-pill">{subject}</span>
                            )) : <span className="td-prof-sub-pill">No subjects added yet</span>}
                          </div>

                          <div className="td-prof-card-head" style={{ marginTop: '24px' }}>
                            <div className="td-prof-card-icon-wrap">
                              <FiCheckCircle size={18} color="#15803D" />
                            </div>
                            <h2>Teaching Levels</h2>
                          </div>
                          <div className="td-prof-levels-col">
                            {profTeachingLevels.length > 0 ? profTeachingLevels.map(level => (
                              <span key={level} className="td-prof-level-pill">{level}</span>
                            )) : <span className="td-prof-level-pill">Not provided</span>}
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
                            {experienceList.length > 0 ? experienceList.map((exp, index) => (
                              <div key={index} className="td-prof-exp-item-card">
                                <div className="td-prof-exp-item-left">
                                  <span className="td-prof-exp-date td-prof-exp-date--present">{normalizeProfileValue(exp.period, 'Not provided')}</span>
                                  <h3 className="td-prof-exp-title">{normalizeProfileValue(exp.role, 'Role not provided')}</h3>
                                  <p className="td-prof-exp-school">{normalizeProfileValue(exp.school, 'School not provided')}</p>
                                </div>
                                <div className="td-prof-exp-cap-badge">
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                                  </svg>
                                </div>
                              </div>
                            )) : <p style={{ color: '#64748B', margin: 0 }}>No work experience added.</p>}
                          </div>
                        </div>

                        {/* Lower Right: Education + Certification & Documents */}
                        <div className="td-prof-right-col-stack">
                          {/* Education Box */}
                          <div className="td-prof-card">
                            <div className="td-prof-card-head">
                              <div className="td-prof-card-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                  <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                                </svg>
                              </div>
                              <h2>Education</h2>
                            </div>

                            {educationList.length > 0 ? educationList.map((edu, index) => (
                              <div key={index} className="td-prof-edu-item">
                                <div className="td-prof-edu-icon-box">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 5H3l9-5z" />
                                  </svg>
                                </div>
                                <div className="td-prof-edu-info">
                                  <h3>{normalizeProfileValue(edu.degree, 'Degree not provided')}</h3>
                                  <p className="td-prof-edu-inst">{normalizeProfileValue(edu.institution, 'Institution not provided')}</p>
                                  <span className="td-prof-edu-period">{normalizeProfileValue(edu.period, 'Not provided')}</span>
                                </div>
                              </div>
                            )) : <p style={{ color: '#64748B', margin: 0 }}>No education added.</p>}
                          </div>

                          {/* Certification & Documents Box */}
                          <div className="td-prof-card">
                            <div className="td-prof-card-head">
                              <div className="td-prof-card-icon-wrap">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="8" r="7" />
                                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                </svg>
                              </div>
                              <h2>Certification & Documents</h2>
                            </div>

                            <div className="td-prof-trcn-box">
                              <div className="td-prof-trcn-left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                  <path d="m9 12 2 2 4-4" />
                                </svg>
                                <div>
                                  <h4>{profileState?.trcn_number ? 'TRCN Registered Educator' : 'TRCN certificate not provided'}</h4>
                                  <p>{profileState?.trcn_number ? `Registration No: ${profileState.trcn_number}` : 'No TRCN number added yet.'}</p>
                                </div>
                              </div>
                              <span className="td-prof-active-badge">{trcnStatusBadge}</span>
                            </div>

                            <div className="td-prof-downloads-col">
                              <button
                                type="button"
                                className="td-prof-download-btn"
                                onClick={() => handleResumeAction('download')}
                              >
                                <FiDownload size={14} />
                                <span>{activeResume?.url ? 'Download CV' : 'No resume uploaded'}</span>
                              </button>
                              <button
                                type="button"
                                className="td-prof-download-btn"
                                onClick={() => window.open(activeResume?.url || '#', '_blank', 'noopener,noreferrer')}
                              >
                                <FiEye size={14} />
                                <span>{activeResume?.url ? 'View CV' : 'No resume uploaded'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Motion.div>
                  )}

                  {/* 3. Education Tab */}
                  {profileSubTab === 'education' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-edu-info-page">
                      <div className="td-edu-panels">
                        <section className="td-edu-panel">
                          <header className="td-edu-panel-heading">
                            <span className="td-edu-panel-icon td-edu-panel-icon--education"><FiBook size={17} /></span>
                            <div>
                              <h1>Education</h1>
                              <p>Add your academic qualifications to show your educational background.</p>
                            </div>
                            {educationList.length > 0 && (
                              <button
                                type="button"
                                className="td-edu-add-btn"
                                onClick={() => {
                                  setEditingEducationId(null);
                                  setEducationError('');
                                  setNewEduForm(createEducationForm());
                                  setEducationDocumentFile(null);
                                  setEducationDocumentError('');
                                  setShowAddEduModal(true);
                                }}
                              >
                                <FiPlus size={14} />Add Education
                              </button>
                            )}
                          </header>

                          {educationList.length ? (
                            <div className="td-edu-grid">
                              {educationList.map((edu) => (
                                <article key={edu.id} className="td-edu-card">
                                  <div className="td-edu-card-icon" aria-hidden="true">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 21h18M4 10h16M6 21V10m4 11V10m4 11V10m4 11V10M2 10l10-7 10 7" />
                                    </svg>
                                  </div>
                                  <div className="td-edu-card-details">
                                    <h2>{edu.degree || 'Qualification not provided'}</h2>
                                    <p>{edu.institution || 'Institution not provided'}</p>
                                    <div className="td-edu-card-meta">
                                      <span><FiCalendar size={12} />{edu.period || 'Dates not provided'}</span>
                                      {edu.class_of_degree && (
                                        <>
                                          <i aria-hidden="true" />
                                          <span>{edu.class_of_degree}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="td-edu-card-actions">
                                    <button
                                      type="button"
                                      className="td-edu-card-edit"
                                      aria-label={`Edit ${edu.degree || 'education'}`}
                                      onClick={() => {
                                        setEditingEducationId(edu.education_id);
                                        setNewEduForm({
                                          ...createEducationForm(),
                                          degree: edu.degree || '',
                                          institution: edu.institution,
                                          fieldOfStudy: educationFieldOptions.includes(edu.field_of_study) ? edu.field_of_study : (edu.field_of_study ? 'Other' : ''),
                                          fieldOfStudyOther: educationFieldOptions.includes(edu.field_of_study) ? '' : (edu.field_of_study || ''),
                                          classOfDegree: edu.class_of_degree || '',
                                          startYear: String(edu.start_year || ''),
                                          endYear: String(edu.end_year || ''),
                                          currentlyStudying: edu.status === 'In Progress',
                                        });
                                        setEducationDocumentFile(null);
                                        setEducationDocumentError('');
                                        setEducationError('');
                                        setShowAddEduModal(true);
                                      }}
                                    >
                                      <FiEdit2 size={13} />
                                      <span>Edit</span>
                                    </button>
                                    <details className="td-edu-card-more">
                                      <summary aria-label={`More actions for ${edu.degree || 'education'}`}><FiMoreVertical size={17} /></summary>
                                      <button type="button" onClick={() => handleDeleteEducation(edu)}>
                                        <FiTrash2 size={14} />
                                        <span>Delete</span>
                                      </button>
                                    </details>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : (
                            <div className="td-edu-empty-content">
                              <div className="td-edu-empty-illustration td-edu-empty-illustration--education" aria-hidden="true">
                                <div className="td-edu-empty-document"><FiBook size={19} /></div>
                                <i />
                                <b />
                              </div>
                              <h2>No educational qualifications added yet</h2>
                              <button
                                type="button"
                                className="td-edu-add-btn"
                                onClick={() => {
                                  setEditingEducationId(null);
                                  setEducationError('');
                                  setNewEduForm(createEducationForm());
                                  setEducationDocumentFile(null);
                                  setEducationDocumentError('');
                                  setShowAddEduModal(true);
                                }}
                              >
                                <FiPlus size={14} />Add Education
                              </button>
                            </div>
                          )}
                        </section>

                        <section className="td-edu-panel">
                          <header className="td-edu-panel-heading">
                            <span className="td-edu-panel-icon td-edu-panel-icon--certification"><FiAward size={17} /></span>
                            <div>
                              <h2>Professional Certifications</h2>
                              <p>Add your professional certifications, such as TRCN and other relevant credentials.</p>
                            </div>
                            {(profileState?.trcn_number || profileState?.trcn_certificate_url || sessionCertifications.length > 0) && (
                              <button type="button" className="td-edu-add-btn" onClick={() => { resetCertificationForm(); setShowAddCertificationModal(true); }}>
                                <FiPlus size={14} />Add Certification
                              </button>
                            )}
                          </header>

                          {profileState?.trcn_number || profileState?.trcn_certificate_url || sessionCertifications.length > 0 ? (
                            <>
                              {sessionCertifications.map((certification) => (
                                <div key={certification.id} className="td-edu-certification-record">
                                  <div className="td-edu-certification-icon"><FiAward size={17} /></div>
                                  <div className="td-edu-certification-details">
                                    <h3>{certification.name}</h3>
                                    <p>{certification.organisation}{certification.number ? ` · ${certification.number}` : ''}</p>
                                    <div className="td-edu-certification-meta">
                                      <span><FiCalendar size={12} />Issued {educationMonths.find(([month]) => month === certification.issueMonth)?.[1]} {certification.issueYear}</span>
                                      {certification.doesNotExpire
                                        ? <span>Does not expire</span>
                                        : certification.expiryMonth && certification.expiryYear
                                          ? <span>Expires {educationMonths.find(([month]) => month === certification.expiryMonth)?.[1]} {certification.expiryYear}</span>
                                          : null}
                                      {certification.notes && <span>{certification.notes}</span>}
                                    </div>
                                    <span className="td-edu-session-only-badge">Session only · not saved to profile</span>
                                  </div>
                                  <div className="td-edu-certification-actions">
                                    <button
                                      type="button"
                                      className="td-edu-certification-edit"
                                      onClick={() => {
                                        setEditingCertificationId(certification.id);
                                        setCertificationForm({
                                          name: certification.name,
                                          organisation: certification.organisation,
                                          number: certification.number,
                                          issueMonth: certification.issueMonth,
                                          issueYear: certification.issueYear,
                                          expiryMonth: certification.expiryMonth,
                                          expiryYear: certification.expiryYear,
                                          doesNotExpire: certification.doesNotExpire,
                                          notes: certification.notes,
                                        });
                                        setCertificationFile(null);
                                        setCertificationError('');
                                        setCertificationFileError('');
                                        setShowAddCertificationModal(true);
                                      }}
                                    >
                                      <FiEdit2 size={13} />Edit
                                    </button>
                                    <details className="td-edu-certification-more">
                                      <summary aria-label={`More actions for ${certification.name}`}><FiMoreVertical size={17} /></summary>
                                      <button
                                        type="button"
                                        onClick={() => setSessionCertifications((items) => items.filter((item) => item.id !== certification.id))}
                                      >
                                        <FiTrash2 size={13} />Delete
                                      </button>
                                    </details>
                                  </div>
                                </div>
                              ))}
                              {(profileState?.trcn_number || profileState?.trcn_certificate_url) && (
                                <div className="td-edu-certification-record">
                                  <div className="td-edu-certification-icon td-edu-certification-icon--trcn">TRCN</div>
                                  <div className="td-edu-certification-details">
                                    <h3>Teachers Registration Council of Nigeria (TRCN)</h3>
                                    <p>Registered Teacher{profileState?.trcn_number ? ` · ${profileState.trcn_number}` : ''}</p>
                                    <div className="td-edu-certification-meta">
                                      {profileState?.trcn_issued_at && <span><FiCalendar size={12} />Registered: {new Date(profileState.trcn_issued_at).getFullYear()}</span>}
                                      {profileState?.trcn_valid_until && <span>Expires: {new Date(profileState.trcn_valid_until).getFullYear()}</span>}
                                    </div>
                                  </div>
                                  <span className={`td-edu-certification-status${isTrcnVerified ? ' is-verified' : ''}`}>
                                    {isTrcnVerified && <FiCheckCircle size={12} />}
                                    {isTrcnVerified ? 'Verified' : trcnStatusBadge}
                                  </span>
                                  <div className="td-edu-certification-actions">
                                    <button type="button" className="td-edu-certification-edit" onClick={() => setProfileSubTab('trcn-certification')}>
                                      <FiEdit2 size={13} />Edit
                                    </button>
                                    <details className="td-edu-certification-more">
                                      <summary aria-label="More TRCN certification actions"><FiMoreVertical size={17} /></summary>
                                      <button type="button" onClick={() => setProfileSubTab('trcn-certification')}>
                                        <FiEye size={13} />View details
                                      </button>
                                    </details>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="td-edu-empty-content">
                              <div className="td-edu-empty-illustration td-edu-empty-illustration--certification" aria-hidden="true">
                                <div className="td-edu-empty-document"><FiAward size={19} /></div>
                                <i />
                                <b />
                              </div>
                              <h2>No professional certifications added yet</h2>
                              <button type="button" className="td-edu-add-btn" onClick={() => { resetCertificationForm(); setShowAddCertificationModal(true); }}>
                                <FiPlus size={14} />Add Certification
                              </button>
                            </div>
                          )}
                        </section>
                      </div>

                      {showAddCertificationModal && (
                        <div className="td-modal-overlay td-certification-form-overlay" onMouseDown={(event) => {
                          if (event.target === event.currentTarget) closeCertificationModal();
                        }}>
                          <form className="td-modal-content td-certification-modal" role="dialog" aria-modal="true" aria-labelledby="td-certification-modal-title" onSubmit={handleSaveCertification}>
                            <header className="td-certification-modal-header">
                              <div>
                                <h2 id="td-certification-modal-title">{editingCertificationId ? 'Edit Professional Certification' : 'Add Professional Certification'}</h2>
                                <p>Add a professional certification such as TRCN or other relevant credentials.</p>
                              </div>
                              <button type="button" className="td-certification-modal-close" aria-label="Close certification form" onClick={closeCertificationModal}><FiX size={19} /></button>
                            </header>

                            <div className="td-certification-modal-body">
                              <div className="td-certification-form-grid">
                                <label className="td-certification-field td-certification-field--full">
                                  <span>Certification name <b aria-hidden="true">*</b></span>
                                  <input required value={certificationForm.name} onChange={(event) => setCertificationForm({ ...certificationForm, name: event.target.value })} placeholder="e.g. TRCN, ICAN, Cambridge International Certificate" />
                                  <small>Enter the official name of the certification.</small>
                                </label>

                                <label className="td-certification-field">
                                  <span>Issuing organisation <b aria-hidden="true">*</b></span>
                                  <input required value={certificationForm.organisation} onChange={(event) => setCertificationForm({ ...certificationForm, organisation: event.target.value })} placeholder="e.g. Teachers Registration Council of Nigeria" />
                                  <small>Name of the organisation that issued the certification.</small>
                                </label>

                                <label className="td-certification-field">
                                  <span>Certificate number <em>(optional)</em></span>
                                  <input value={certificationForm.number} onChange={(event) => setCertificationForm({ ...certificationForm, number: event.target.value })} placeholder="e.g. TRCN/123456" />
                                  <small>Enter the certificate number if available.</small>
                                </label>

                                <div className="td-certification-field">
                                  <span className="td-certification-label">Issue date <b aria-hidden="true">*</b></span>
                                  <div className="td-certification-date-fields">
                                    <select aria-label="Issue month" required value={certificationForm.issueMonth} onChange={(event) => setCertificationForm({ ...certificationForm, issueMonth: event.target.value })}>
                                      <option value="">Month</option>
                                      {educationMonths.map(([value, month]) => <option key={value} value={value}>{month}</option>)}
                                    </select>
                                    <select aria-label="Issue year" required value={certificationForm.issueYear} onChange={(event) => setCertificationForm({ ...certificationForm, issueYear: event.target.value })}>
                                      <option value="">Year</option>
                                      {Array.from({ length: 127 }, (_, index) => new Date().getFullYear() - index).map((year) => <option key={year} value={String(year)}>{year}</option>)}
                                    </select>
                                  </div>
                                </div>

                                <div className="td-certification-field">
                                  <span className="td-certification-label">Expiry date <em>(optional)</em></span>
                                  <div className="td-certification-date-fields">
                                    <select aria-label="Expiry month" disabled={certificationForm.doesNotExpire} value={certificationForm.expiryMonth} onChange={(event) => setCertificationForm({ ...certificationForm, expiryMonth: event.target.value })}>
                                      <option value="">Month</option>
                                      {educationMonths.map(([value, month]) => <option key={value} value={value}>{month}</option>)}
                                    </select>
                                    <select aria-label="Expiry year" disabled={certificationForm.doesNotExpire} value={certificationForm.expiryYear} onChange={(event) => setCertificationForm({ ...certificationForm, expiryYear: event.target.value })}>
                                      <option value="">Year</option>
                                      {Array.from({ length: 127 }, (_, index) => new Date().getFullYear() - index).map((year) => <option key={year} value={String(year)}>{year}</option>)}
                                    </select>
                                  </div>
                                  <label className="td-certification-no-expiry">
                                    <input type="checkbox" checked={certificationForm.doesNotExpire} onChange={(event) => setCertificationForm({ ...certificationForm, doesNotExpire: event.target.checked, expiryMonth: '', expiryYear: '' })} />
                                    <span>This certification does not expire</span>
                                  </label>
                                </div>

                                <div className="td-certification-field td-certification-field--full">
                                  <span className="td-certification-label">Certificate / Document <em>(optional)</em></span>
                                  <input
                                    ref={certificationFileInputRef}
                                    className="td-certification-file-input"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0] || null;
                                      const extension = file?.name.split('.').pop()?.toLowerCase();
                                      if (file && file.size > 5 * 1024 * 1024) {
                                        setCertificationFileError('The selected file exceeds the 5 MB limit.');
                                        setCertificationFile(null);
                                        event.target.value = '';
                                        return;
                                      }
                                      if (file && !['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
                                        setCertificationFileError('Choose a PDF, JPG, or PNG file.');
                                        setCertificationFile(null);
                                        event.target.value = '';
                                        return;
                                      }
                                      setCertificationFileError('');
                                      setCertificationFile(file);
                                    }}
                                  />
                                  <button type="button" className={`td-certification-document-upload ${certificationFile ? 'has-file' : ''}`} onClick={() => certificationFileInputRef.current?.click()}>
                                    <span className="td-certification-upload-icon"><FiFileText size={17} /></span>
                                    <span><strong>{certificationFile?.name || 'Upload certificate (PDF, JPG or PNG)'}</strong><small>Max 5 MB</small></span>
                                  </button>
                                  {certificationFileError && <small className="td-certification-file-error" role="alert">{certificationFileError}</small>}
                                </div>

                                <label className="td-certification-field td-certification-field--full">
                                  <span>Additional notes <em>(optional)</em></span>
                                  <textarea maxLength={300} value={certificationForm.notes} onChange={(event) => setCertificationForm({ ...certificationForm, notes: event.target.value })} placeholder="e.g. Any relevant details about this certification" />
                                  <small className="td-certification-notes-count">{certificationForm.notes.length}/300</small>
                                </label>
                              </div>

                              <p className="td-certification-modal-notice">Certification details and documents are kept in this browser session only and are not saved to your profile.</p>
                              {certificationError && <p className="td-certification-form-error" role="alert">{certificationError}</p>}
                            </div>

                            <footer className="td-certification-modal-footer">
                              <button type="button" className="td-certification-cancel" onClick={closeCertificationModal}>Cancel</button>
                              <button type="submit" className="td-certification-save">Save Certification</button>
                            </footer>
                          </form>
                        </div>
                      )}

                      {/* Modal for adding education */}
                      {showAddEduModal && (
                        <div className="td-modal-overlay td-education-form-overlay" onClick={(event) => {
                          if (event.target === event.currentTarget) closeEducationModal();
                        }}>
                          <form className="td-modal-content td-edu-modal-content" role="dialog" aria-modal="true" aria-labelledby="td-edu-modal-title" onSubmit={(event) => { event.preventDefault(); handleSaveEducation(); }}>
                            <header className="td-edu-modal-header">
                              <div>
                                <h2 id="td-edu-modal-title">{editingEducationId ? 'Edit Education' : 'Add Education'}</h2>
                                <p>Add an academic qualification to your profile.</p>
                              </div>
                              <button type="button" className="td-edu-modal-close" aria-label="Close education form" onClick={closeEducationModal} disabled={savingEducation}><FiX size={19} /></button>
                            </header>

                            <div className="td-edu-modal-body">
                              <div className="td-edu-form-grid">
                                <label className="td-edu-form-field td-edu-form-field--full">
                                  <span>Qualification title <b aria-hidden="true">*</b></span>
                                  <input className="td-pers-input" required type="text" placeholder="e.g. Bachelor of Education (B.Ed)" value={newEduForm.degree} onChange={(event) => setNewEduForm({ ...newEduForm, degree: event.target.value })} />
                                  <small>The name of your qualification (e.g. B.Ed, B.Sc, M.Ed).</small>
                                </label>

                                <label className="td-edu-form-field">
                                  <span>Institution <b aria-hidden="true">*</b></span>
                                  <input className="td-pers-input" required type="text" placeholder="e.g. University of Benin" value={newEduForm.institution} onChange={(event) => setNewEduForm({ ...newEduForm, institution: event.target.value })} />
                                  <small>Name of the institution where you studied.</small>
                                </label>

                                <label className="td-edu-form-field">
                                  <span>Field of study <b aria-hidden="true">*</b></span>
                                  <select className="td-pers-input" required value={newEduForm.fieldOfStudy} onChange={(event) => setNewEduForm({ ...newEduForm, fieldOfStudy: event.target.value, fieldOfStudyOther: '' })}>
                                    <option value="">Select field of study</option>
                                    {educationFieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}
                                  </select>
                                  <small>e.g. Mathematics, English, Biology</small>
                                </label>

                                {newEduForm.fieldOfStudy === 'Other' && (
                                  <label className="td-edu-form-field td-edu-form-field--full">
                                    <span>Enter field of study <b aria-hidden="true">*</b></span>
                                    <input className="td-pers-input" required type="text" placeholder="Your field of study" value={newEduForm.fieldOfStudyOther} onChange={(event) => setNewEduForm({ ...newEduForm, fieldOfStudyOther: event.target.value })} />
                                  </label>
                                )}

                                <label className="td-edu-form-field">
                                  <span>Education level <b aria-hidden="true">*</b></span>
                                  <select className="td-pers-input" required value={newEduForm.educationLevel} onChange={(event) => setNewEduForm({ ...newEduForm, educationLevel: event.target.value })}>
                                    <option value="">Select education level</option>
                                    {educationLevelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                                  </select>
                                  <small>e.g. OND, NCE, B.Sc, B.Ed, M.Ed, PhD</small>
                                </label>

                                <label className="td-edu-form-field">
                                  <span>Grade / Classification <em>(optional)</em></span>
                                  <input className="td-pers-input" type="text" placeholder="e.g. Second Class Upper" value={newEduForm.classOfDegree} onChange={(event) => setNewEduForm({ ...newEduForm, classOfDegree: event.target.value })} />
                                  <small>e.g. First Class, Second Class Upper, Distinction</small>
                                </label>

                                <div className="td-edu-form-field">
                                  <span className="td-edu-form-label">Start date <b aria-hidden="true">*</b></span>
                                  <div className="td-edu-date-fields">
                                    <select aria-label="Start month" required value={newEduForm.startMonth} onChange={(event) => setNewEduForm({ ...newEduForm, startMonth: event.target.value })}>
                                      <option value="">Month</option>
                                      {educationMonths.map(([value, month]) => <option key={value} value={value}>{month}</option>)}
                                    </select>
                                    <select aria-label="Start year" required value={newEduForm.startYear} onChange={(event) => setNewEduForm({ ...newEduForm, startYear: event.target.value })}>
                                      <option value="">Year</option>
                                      {Array.from({ length: 127 }, (_, index) => new Date().getFullYear() - index).map((year) => <option key={year} value={String(year)}>{year}</option>)}
                                    </select>
                                  </div>
                                </div>

                                <div className="td-edu-form-field">
                                  <span className="td-edu-form-label">End date {!newEduForm.currentlyStudying && <b aria-hidden="true">*</b>}</span>
                                  <div className="td-edu-date-fields">
                                    <select aria-label="End month" required={!newEduForm.currentlyStudying} disabled={newEduForm.currentlyStudying} value={newEduForm.endMonth} onChange={(event) => setNewEduForm({ ...newEduForm, endMonth: event.target.value })}>
                                      <option value="">Month</option>
                                      {educationMonths.map(([value, month]) => <option key={value} value={value}>{month}</option>)}
                                    </select>
                                    <select aria-label="End year" required={!newEduForm.currentlyStudying} disabled={newEduForm.currentlyStudying} value={newEduForm.endYear} onChange={(event) => setNewEduForm({ ...newEduForm, endYear: event.target.value })}>
                                      <option value="">Year</option>
                                      {Array.from({ length: 127 }, (_, index) => new Date().getFullYear() - index).map((year) => <option key={year} value={String(year)}>{year}</option>)}
                                    </select>
                                  </div>
                                  <label className="td-edu-currently-studying">
                                    <input
                                      type="checkbox"
                                      checked={newEduForm.currentlyStudying}
                                      onChange={(event) => setNewEduForm({
                                        ...newEduForm,
                                        currentlyStudying: event.target.checked,
                                        endMonth: '',
                                        endYear: '',
                                      })}
                                    />
                                    <span>I am currently studying here</span>
                                  </label>
                                </div>

                                <div className="td-edu-form-field td-edu-form-field--full">
                                  <span className="td-edu-form-label">Certificate / Document <em>(optional)</em></span>
                                  <input
                                    ref={educationDocumentInputRef}
                                    className="td-edu-document-input"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0] || null;
                                      const extension = file?.name.split('.').pop()?.toLowerCase();
                                      if (file && file.size > 5 * 1024 * 1024) {
                                        setEducationDocumentError('The selected file exceeds the 5 MB limit.');
                                        setEducationDocumentFile(null);
                                        event.target.value = '';
                                        return;
                                      }
                                      if (file && !['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
                                        setEducationDocumentError('Choose a PDF, JPG, or PNG file.');
                                        setEducationDocumentFile(null);
                                        event.target.value = '';
                                        return;
                                      }
                                      setEducationDocumentError('');
                                      setEducationDocumentFile(file);
                                    }}
                                  />
                                  <button type="button" className={`td-edu-document-upload ${educationDocumentFile ? 'has-file' : ''}`} onClick={() => educationDocumentInputRef.current?.click()}>
                                    <span className="td-edu-upload-icon"><FiUpload size={16} /></span>
                                    <span>{educationDocumentFile ? <><strong>{educationDocumentFile.name}</strong><small>Selected file · Max 5 MB</small></> : <><strong>Upload certificate (PDF, JPG or PNG)</strong><small>Max 5 MB</small></>}</span>
                                  </button>
                                  {educationDocumentError && <small className="td-edu-document-error" role="alert">{educationDocumentError}</small>}
                                </div>
                              </div>

                              <p className="td-edu-modal-notice">Your qualification, institution, field of study, grade, years, and study status will be saved. Education level, months, and the selected document are not saved yet.</p>
                              {educationError && <p className="td-exp-modal-error" role="alert">{educationError}</p>}
                            </div>

                            <footer className="td-edu-modal-footer">
                              <button type="button" className="td-edu-modal-cancel" onClick={closeEducationModal} disabled={savingEducation}>Cancel</button>
                              <button type="submit" className="td-edu-modal-save" disabled={savingEducation}>
                                {savingEducation ? 'Saving...' : 'Save Education'}
                              </button>
                            </footer>
                          </form>
                        </div>
                      )}

                      {showPostEducationModal && (
                        <div className="td-modal-overlay td-edu-next-step-overlay" onClick={() => setShowPostEducationModal(false)}>
                          <div
                            className="td-edu-next-step-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="td-edu-next-step-title"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="td-edu-next-step-close"
                              aria-label="Close education options"
                              onClick={() => setShowPostEducationModal(false)}
                            >
                              <FiX size={18} />
                            </button>
                            <div className="td-edu-next-step-icon"><FiCheckCircle size={22} /></div>
                            <h2 id="td-edu-next-step-title">Education added</h2>
                            <p>
                              {nextProfileStep
                                ? `Would you like to add another education qualification or continue to ${nextProfileStep.label}?`
                                : 'Your profile completion steps are finished. You can add another education qualification or return to your profile.'}
                            </p>
                            <div className="td-edu-next-step-actions">
                              <button
                                type="button"
                                className="td-edu-next-step-secondary"
                                onClick={() => {
                                  setShowPostEducationModal(false);
                                  setEditingEducationId(null);
                                  setEducationError('');
                                  setNewEduForm(createEducationForm());
                                  setEducationDocumentFile(null);
                                  setEducationDocumentError('');
                                  setShowAddEduModal(true);
                                }}
                              >
                                Add another education
                              </button>
                              <button
                                type="button"
                                className="td-edu-next-step-primary"
                                onClick={() => {
                                  setShowPostEducationModal(false);
                                  if (nextProfileStep) {
                                    goToNextProfileStep();
                                  } else {
                                    setProfileSubTab('overview');
                                  }
                                }}
                              >
                                {nextProfileStep ? `Continue to ${nextProfileStep.label}` : 'Finish profile'}
                                {nextProfileStep && <FiArrowRight size={15} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Motion.div>
                  )}

                  {/* 4. Teaching Experience Tab */}
                  {profileSubTab === 'teaching-experience' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-exp-info-page">
                      {/* Header Row */}
                      <div className="td-exp-header-row">
                        <div className="td-exp-header-left">
                          <span className="td-exp-section-icon" aria-hidden="true"><FiBriefcase size={17} /></span>
                          <div>
                            <h1 className="td-exp-page-title">Teaching Experience</h1>
                            <p className="td-exp-page-desc">
                              Add your teaching and relevant work experience. At least one current or recent experience is required to apply for jobs.
                            </p>
                          </div>
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
                              start_date: '',
                              end_date: '',
                              description: ''
                            });
                            setExperienceError('');
                            setShowAddExpModal(true);
                          }}
                        >
                          <FiPlus size={15} />
                          <span>Add Experience</span>
                        </button>
                      </div>

                      {/* Timeline & Experience List */}
                      <div className="td-exp-timeline-container">
                        {experienceList.length === 0 ? (
                          <div className="td-profile-empty-state td-exp-empty-state">
                            <FiBriefcase size={34} />
                            <h3>No teaching experience added</h3>
                            <p>Add your teaching roles and work history to build a stronger professional profile.</p>
                          </div>
                        ) : experienceList.map((exp) => {
                          const isCurrentRole = !exp.end_date || exp.is_current || exp.currently_working;
                          const startLabel = formatMonthYear(exp.start_date);
                          const endLabel = isCurrentRole ? 'Present' : formatMonthYear(exp.end_date);
                          const experiencePeriod = startLabel
                            ? `${startLabel} – ${endLabel || 'Present'}`
                            : (exp.period || 'Dates not provided');

                          return (
                            <article key={exp.id} className="td-exp-card">
                              <div className="td-exp-card-icon" aria-hidden="true"><FiHome size={17} /></div>
                              <div className="td-exp-card-content">
                                <div className="td-exp-card-header">
                                  <div className="td-exp-card-heading">
                                    <h2 className="td-exp-role">{exp.role || 'Teaching role'}</h2>
                                    <p className="td-exp-school">{exp.school || 'School not provided'}</p>
                                  </div>
                                  <div className="td-exp-actions">
                                    <button
                                      type="button"
                                      className="td-exp-action-btn td-exp-action-edit"
                                      onClick={() => {
                                        setEditingExpId(exp.experience_id);
                                        setExpForm({
                                          role: exp.role,
                                          school: exp.school,
                                          location: exp.location,
                                          start_date: exp.start_date || '',
                                          end_date: exp.end_date || '',
                                          description: exp.description
                                        });
                                        setExperienceError('');
                                        setShowAddExpModal(true);
                                      }}
                                    >
                                      <FiEdit2 size={13} />
                                      <span>Edit</span>
                                    </button>
                                    <details className="td-exp-more">
                                      <summary aria-label={`More actions for ${exp.role || 'teaching experience'}`}><FiMoreVertical size={17} /></summary>
                                      <button type="button" onClick={() => handleDeleteExperience(exp)}>
                                        <FiTrash2 size={14} />
                                        <span>Delete</span>
                                      </button>
                                    </details>
                                  </div>
                                </div>
                                <div className="td-exp-meta-row">
                                  {exp.location && <span><FiMapPin size={12} />{exp.location}</span>}
                                  <span><FiCalendar size={12} />{experiencePeriod}</span>
                                  {isCurrentRole && <span className="td-exp-current-badge">Current</span>}
                                </div>
                                {exp.description && <p className="td-exp-desc">{exp.description}</p>}
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      {/* Modal for adding/editing experience */}
                      {showAddExpModal && (
                        <div className="td-modal-overlay" onClick={() => setShowAddExpModal(false)}>
                          <div className="td-modal-content td-exp-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="td-modal-header">
                              <h2>{editingExpId ? 'Edit Experience' : 'Add Experience'}</h2>
                              <button className="td-modal-close" onClick={() => setShowAddExpModal(false)}>✕</button>
                            </div>
                            <div className="td-modal-body">
                              <div className="td-pers-field-group" style={{ marginBottom: '16px' }}>
                                <label className="td-pers-label">Role / Job Title <span className="td-pers-required-marker" aria-hidden="true">*</span></label>
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
                                  <label className="td-pers-label">School / Institution <span className="td-pers-required-marker" aria-hidden="true">*</span></label>
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
                              <div className="td-pers-grid td-exp-period-grid" style={{ marginBottom: '16px' }}>
                                <div className="td-pers-field-group">
                                  <label className="td-pers-label">Start Month and Year <span className="td-pers-required-marker" aria-hidden="true">*</span></label>
                                  <input type="month" className="td-pers-input" value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} />
                                </div>
                                <div className="td-pers-field-group">
                                  <label className="td-pers-label">End Month and Year</label>
                                  <input type="month" className="td-pers-input" min={expForm.start_date || undefined} value={expForm.end_date} onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })} />
                                </div>
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
                            {experienceError && <p className="td-exp-modal-error">{experienceError}</p>}
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
                                disabled={savingExperience}
                                onClick={handleSaveExperience}
                              >
                                {savingExperience ? 'Saving...' : editingExpId ? 'Save Changes' : 'Add Experience'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {showPostExperienceModal && (
                        <div className="td-modal-overlay td-edu-next-step-overlay" onClick={() => setShowPostExperienceModal(false)}>
                          <div
                            className="td-edu-next-step-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="td-exp-next-step-title"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="td-edu-next-step-close"
                              aria-label="Close experience options"
                              onClick={() => setShowPostExperienceModal(false)}
                            >
                              <FiX size={18} />
                            </button>
                            <div className="td-edu-next-step-icon"><FiCheckCircle size={22} /></div>
                            <h2 id="td-exp-next-step-title">Experience added</h2>
                            <p>
                              {nextProfileStep
                                ? `Would you like to add another teaching experience or continue to ${nextProfileStep.label}?`
                                : 'Your profile completion steps are finished. You can add another teaching experience or return to your profile.'}
                            </p>
                            <div className="td-edu-next-step-actions">
                              <button
                                type="button"
                                className="td-edu-next-step-secondary"
                                onClick={() => {
                                  setShowPostExperienceModal(false);
                                  setEditingExpId(null);
                                  setExperienceError('');
                                  setExpForm({ role: '', school: '', location: '', start_date: '', end_date: '', description: '' });
                                  setShowAddExpModal(true);
                                }}
                              >
                                Add another experience
                              </button>
                              <button
                                type="button"
                                className="td-edu-next-step-primary"
                                onClick={() => {
                                  setShowPostExperienceModal(false);
                                  if (nextProfileStep) {
                                    goToNextProfileStep();
                                  } else {
                                    setProfileSubTab('overview');
                                  }
                                }}
                              >
                                {nextProfileStep ? `Continue to ${nextProfileStep.label}` : 'Finish profile'}
                                {nextProfileStep && <FiArrowRight size={15} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Motion.div>
                  )}

                  {/* 5. TRCN Certification Tab */}
                  {profileSubTab === 'trcn-certification' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-trcn-info-page">
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
                            <div className="td-trcn-decor-blob" />

                            <div className="td-trcn-status-left">
                              <div className="td-trcn-status-title-row">
                                <h2 className="td-trcn-card-title">TRCN Status</h2>
                                <span className="td-trcn-active-pill">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span>{trcnStatusCardText}</span>
                                </span>
                              </div>

                              <div className="td-trcn-number-row">
                                <span className="td-trcn-number-label">TRCN Number:</span>
                                <span className="td-trcn-number-val">{profileState?.trcn_number || 'Not available yet'}</span>
                              </div>
                            </div>

                            <div className="td-trcn-status-actions">
                              <button
                                type="button"
                                className="td-trcn-btn-view"
                                onClick={() => profileState?.trcn_certificate_url && window.open(profileState.trcn_certificate_url, '_blank', 'noopener,noreferrer')}
                                disabled={!profileState?.trcn_certificate_url}
                              >
                                <FiEye size={16} />
                                <span>{profileState?.trcn_certificate_url ? 'View Certificate' : 'No certificate'}</span>
                              </button>
                              <button
                                type="button"
                                className="td-trcn-btn-update"
                                onClick={() => setProfileSubTab('overview')}
                              >
                                <FiRotateCw size={14} />
                                <span>Refresh</span>
                              </button>
                            </div>
                          </div>

                          <div className="td-trcn-subcards-grid">
                            <div className="td-trcn-subcard">
                              <div className="td-trcn-subcard-header">
                                <FiCalendar size={16} className="td-trcn-subcard-icon" />
                                <h3>Issuance Details</h3>
                              </div>

                              <div className="td-trcn-subcard-fields">
                                <div className="td-trcn-field-item">
                                  <label>Date Issued</label>
                                  <p>{profileState?.trcn_issued_at ? new Date(profileState.trcn_issued_at).toLocaleDateString() : 'Not provided'}</p>
                                </div>
                                <div className="td-trcn-field-item">
                                  <label>Valid Until</label>
                                  <p>{profileState?.trcn_valid_until ? new Date(profileState.trcn_valid_until).toLocaleDateString() : 'Not provided'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="td-trcn-subcard">
                              <div className="td-trcn-subcard-header">
                                <FiShield size={16} className="td-trcn-subcard-icon" />
                                <h3>Verification Log</h3>
                              </div>

                              <div className="td-trcn-log-timeline">
                                {profileState?.trcn_number ? (
                                  <>
                                    <div className="td-trcn-log-entry">
                                      <div className="td-trcn-log-dot td-trcn-log-dot--green" />
                                      <div className="td-trcn-log-info">
                                        <h4>Validated by Staffroom admin</h4>
                                        <span>{profileState?.trcn_verified_at ? new Date(profileState.trcn_verified_at).toLocaleDateString() : 'Recently'}</span>
                                      </div>
                                    </div>
                                    <div className="td-trcn-log-entry">
                                      <div className="td-trcn-log-dot td-trcn-log-dot--gray" />
                                      <div className="td-trcn-log-info">
                                        <h4>Document uploaded</h4>
                                        <span>{profileState?.updated_at ? new Date(profileState.updated_at).toLocaleDateString() : 'Recently'}</span>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="td-trcn-log-entry">
                                    <div className="td-trcn-log-dot td-trcn-log-dot--gray" />
                                    <div className="td-trcn-log-info">
                                      <h4>No TRCN record on file</h4>
                                      <span>Update your profile to add it</span>
                                    </div>
                                  </div>
                                )}
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
                                  <circle cx="12" cy="8" r="7" />
                                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
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
                    </Motion.div>
                  )}

                  {/* 6. CV / Resume Tab */}
                  {profileSubTab === 'cv-resume' && (
                    <div className="td-modal-overlay td-manage-docs-overlay" onMouseDown={(event) => {
                      if (event.target === event.currentTarget) closeCvDocumentsModal();
                    }}>
                      <form className="td-manage-docs-modal" role="dialog" aria-modal="true" aria-labelledby="td-manage-docs-title" onSubmit={handleSaveDocuments}>
                        <header className="td-manage-docs-header">
                          <div>
                            <h1 id="td-manage-docs-title">Manage Documents</h1>
                            <p>Upload your CV and other relevant documents. Supported formats: PDF, DOC, DOCX, JPG, PNG.</p>
                          </div>
                          <button type="button" aria-label="Close document manager" onClick={closeCvDocumentsModal} disabled={savingDocuments}><FiX size={18} /></button>
                        </header>

                        <div className="td-manage-docs-body">
                          <section className="td-manage-docs-section">
                            <div className="td-manage-docs-section-heading">
                              <span className="td-manage-docs-heading-icon td-manage-docs-heading-icon--blue"><FiFileText size={17} /></span>
                              <div><h2>CV <small>(Required)</small></h2><p>Upload your most recent CV. This is the primary document schools will view.</p></div>
                            </div>
                            <div
                              className={`td-manage-docs-dropzone${cvDropActive ? ' is-active' : ''}`}
                              onDragEnter={(event) => { event.preventDefault(); setCvDropActive(true); }}
                              onDragOver={(event) => { event.preventDefault(); setCvDropActive(true); }}
                              onDragLeave={(event) => { event.preventDefault(); setCvDropActive(false); }}
                              onDrop={(event) => {
                                event.preventDefault();
                                setCvDropActive(false);
                                handleCvSelection({ target: { files: event.dataTransfer.files, value: '' } });
                              }}
                            >
                              <input ref={cvFileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvSelection} hidden />
                              <span className="td-manage-docs-cloud"><FiUpload size={19} /></span>
                              <strong>{pendingCvFile ? pendingCvFile.name : 'Drag and drop your CV here'}</strong>
                              <span>{pendingCvFile ? 'Selected file · Save changes to upload' : 'or'}</span>
                              <button type="button" onClick={() => cvFileInputRef.current?.click()} disabled={savingDocuments}>
                                {pendingCvFile ? 'Choose another file' : 'Select file'}
                              </button>
                              <small>PDF, DOC, DOCX (Max 5 MB)</small>
                            </div>

                            {hasCvDocument && (
                              <div className="td-manage-docs-row">
                                <span className={`td-manage-docs-file-icon ${getFileNameFromUrl(displayedCvName).toLowerCase().endsWith('.pdf') ? 'is-pdf' : 'is-doc'}`}><FiFileText size={18} /></span>
                                <span className="td-manage-docs-file-info">
                                  <strong>{pendingCvFile ? pendingCvFile.name : cvDocumentName}</strong>
                                  <small>{pendingCvFile
                                    ? `Selected · ${formatFileSize(pendingCvFile.size)}`
                                    : `Uploaded ${activeResume?.uploadDate || 'Date unavailable'} · ${activeResume?.size && activeResume.size !== 'Uploaded' ? activeResume.size : 'Size unavailable'}`}</small>
                                </span>
                                <button type="button" className="td-manage-docs-view" onClick={() => openDocumentPreview({ name: cvDocumentName, uri: teacherCvUrl })} disabled={Boolean(pendingCvFile) || !teacherCvUrl}>
                                  <FiEye size={14} />View
                                </button>
                                <details className="td-manage-docs-menu">
                                  <summary aria-label="CV document options"><FiMoreVertical size={17} /></summary>
                                  <div>
                                    <button type="button" onClick={() => cvFileInputRef.current?.click()}>Replace CV</button>
                                    {pendingCvFile && <button type="button" onClick={() => setPendingCvFile(null)}>Discard selection</button>}
                                  </div>
                                </details>
                              </div>
                            )}
                          </section>

                          <section className="td-manage-docs-section td-manage-docs-supporting">
                            <div className="td-manage-docs-section-heading">
                              <span className="td-manage-docs-heading-icon td-manage-docs-heading-icon--purple"><FiCopy size={17} /></span>
                              <div><h2>Supporting Documents <small>(Optional)</small></h2><p>Upload any other documents that may support your application (e.g. certificates, testimonials).</p></div>
                              <button type="button" className="td-manage-docs-add" onClick={() => supportingDocumentFileInputRef.current?.click()} disabled={savingDocuments}>
                                <FiPlus size={14} />Add document
                              </button>
                              <input
                                ref={supportingDocumentFileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                multiple
                                onChange={(event) => {
                                  handleSupportingDocumentSelection(event.target.files);
                                  event.target.value = '';
                                }}
                                hidden
                              />
                            </div>
                            <div className="td-manage-docs-support-list">
                              {(supportingDocumentsDraft || supportingDocuments).map((document) => {
                                const extension = document.name.split('.').pop()?.toLowerCase();
                                const iconClass = extension === 'pdf'
                                  ? 'is-pdf'
                                  : ['jpg', 'jpeg', 'png'].includes(extension)
                                    ? 'is-image'
                                    : 'is-doc';
                                return (
                                  <div className="td-manage-docs-row" key={document.id}>
                                    <span className={`td-manage-docs-file-icon ${iconClass}`}><FiFileText size={18} /></span>
                                    <span className="td-manage-docs-file-info">
                                      <strong>{document.name}</strong>
                                      <small>Added this session · {formatFileSize(document.size)}</small>
                                    </span>
                                    <button type="button" className="td-manage-docs-view" onClick={() => openDocumentPreview({ name: document.name, uri: document.previewUrl })}>
                                      <FiEye size={14} />View
                                    </button>
                                    <details className="td-manage-docs-menu">
                                      <summary aria-label={`Options for ${document.name}`}><FiMoreVertical size={17} /></summary>
                                      <div><button type="button" onClick={() => setSupportingDocumentsDraft((currentDocuments) => (currentDocuments || supportingDocuments).filter((item) => item.id !== document.id))}>Remove document</button></div>
                                    </details>
                                  </div>
                                );
                              })}
                            </div>
                          </section>

                          <div className="td-manage-docs-info">
                            <FiInfo size={15} />
                            <span>Keep your documents clear and up to date. Make sure they are readable and show the correct information.</span>
                          </div>
                          <p className="td-manage-docs-api-note">Your CV is uploaded to your profile. Supporting documents are kept in this page session only because the current API does not provide a supporting-document upload endpoint.</p>
                          {manageDocumentsError && <p className="td-manage-docs-error" role="alert">{manageDocumentsError}</p>}
                        </div>

                        <footer className="td-manage-docs-footer">
                          <button type="button" onClick={closeCvDocumentsModal} disabled={savingDocuments}>Cancel</button>
                          <button type="submit" disabled={savingDocuments}>{savingDocuments ? 'Saving...' : 'Save changes'}</button>
                        </footer>
                      </form>
                    </div>
                  )}
                  {profileSubTab === 'cv-resume' && renderDocumentPreviewModal()}
                  {profileSubTab === 'cv-resume-legacy' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-cv-info-page">
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
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                  <polyline points="10 9 9 9 8 9" />
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
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <text x="7.5" y="17" fontSize="6.5" fontWeight="bold" fill="#15803D" stroke="none" fontFamily="sans-serif">PDF</text>
                                </svg>
                              </div>
                              <div className="td-cv-file-info">
                                <h3>{activeResume?.url ? activeResume.name : 'No resume uploaded'}</h3>
                                <span>{activeResume?.url ? `${activeResume.uploadDate} • ${activeResume.size}` : 'Not provided'}</span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="td-cv-actions-row">
                              <button
                                type="button"
                                className="td-cv-btn-view"
                                onClick={() => handleResumeAction('view')}
                                disabled={!activeResume?.url}
                              >
                                <FiEye size={15} />
                                <span>{activeResume?.url ? 'View Document' : 'No document'}</span>
                              </button>
                              <button
                                type="button"
                                className="td-cv-btn-download"
                                onClick={() => handleResumeAction('download')}
                                disabled={!activeResume?.url}
                              >
                                <FiDownload size={15} />
                                <span>{activeResume?.url ? 'Download' : 'Unavailable'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Privacy Assured Card */}
                          <div className="td-cv-privacy-card">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="td-cv-shield-icon">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              <path d="m9 12 2 2 4-4" />
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

                            {pendingCvFile ? (
                              <div className="td-cv-confirm-box">
                                <div className="td-cv-confirm-file">
                                  <span className="td-cv-confirm-label">Selected file</span>
                                  <strong>{pendingCvFile.name}</strong>
                                </div>
                                <div className="td-cv-confirm-actions">
                                  <button
                                    type="button"
                                    className="td-cv-confirm-btn td-cv-confirm-btn--upload"
                                    onClick={confirmCvUpload}
                                    disabled={cvUploadLoading}
                                  >
                                    {cvUploadLoading ? 'Uploading...' : 'Upload'}
                                  </button>
                                  <button
                                    type="button"
                                    className="td-cv-confirm-btn td-cv-confirm-btn--cancel"
                                    onClick={cancelCvUpload}
                                    disabled={cvUploadLoading}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="td-cv-dropzone">
                                <input
                                  ref={cvFileInputRef}
                                  type="file"
                                  accept=".pdf,.docx,.doc"
                                  className="hidden"
                                  onChange={handleCvSelection}
                                />
                                <div className="td-cv-cloud-icon-box">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 16 12 12 8 16" />
                                    <line x1="12" y1="12" x2="12" y2="21" />
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                    <polyline points="16 16 12 12 8 16" />
                                  </svg>
                                </div>
                                <strong className="td-cv-drop-prompt">Drag and drop your new CV here</strong>
                                <span className="td-cv-drop-sub">or click to browse from your device</span>
                                <span className="td-cv-drop-formats">SUPPORTED FORMATS: PDF, DOCX (MAX 5MB)</span>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                      {showPostCvModal && (
                        <div className="td-modal-overlay td-edu-next-step-overlay" onClick={() => setShowPostCvModal(false)}>
                          <div
                            className="td-edu-next-step-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="td-cv-next-step-title"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="td-edu-next-step-close"
                              aria-label="Close resume options"
                              onClick={() => setShowPostCvModal(false)}
                            >
                              <FiX size={18} />
                            </button>
                            <div className="td-edu-next-step-icon"><FiCheckCircle size={22} /></div>
                            <h2 id="td-cv-next-step-title">CV / Resume uploaded</h2>
                            <p>
                              {nextProfileStep
                                ? `Would you like to upload another CV or continue to ${nextProfileStep.label}?`
                                : 'Your profile completion steps are finished. You can upload another CV or return to your profile.'}
                            </p>
                            <div className="td-edu-next-step-actions">
                              <button
                                type="button"
                                className="td-edu-next-step-secondary"
                                onClick={() => {
                                  cvFileInputRef.current?.click();
                                  setShowPostCvModal(false);
                                }}
                              >
                                Choose another CV
                              </button>
                              <button
                                type="button"
                                className="td-edu-next-step-primary"
                                onClick={() => {
                                  setShowPostCvModal(false);
                                  if (nextProfileStep) {
                                    goToNextProfileStep();
                                  } else {
                                    setProfileSubTab('overview');
                                  }
                                }}
                              >
                                {nextProfileStep ? `Continue to ${nextProfileStep.label}` : 'Finish profile'}
                                {nextProfileStep && <FiArrowRight size={15} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Motion.div>
                  )}

                  {profileSubTab === 'availability' && availabilityDraft && (
                    <div className="td-modal-overlay td-avail-preferences-overlay" onMouseDown={(event) => {
                      if (event.target === event.currentTarget) closeAvailabilityPreferencesModal();
                    }}>
                      <form className="td-avail-preferences-modal" role="dialog" aria-modal="true" aria-labelledby="td-avail-preferences-title" onSubmit={handleSaveAvailabilityPreferences}>
                        <header className="td-avail-preferences-header">
                          <div>
                            <h1 id="td-avail-preferences-title">Job Preferences &amp; Availability</h1>
                            <p>Tell us what kind of opportunities you're interested in and when you're available.</p>
                          </div>
                          <button type="button" aria-label="Close preferences" onClick={closeAvailabilityPreferencesModal} disabled={savingAvailability}><FiX size={18} /></button>
                        </header>

                        <div className="td-avail-preferences-body">
                          <section className="td-avail-preferences-section">
                            <div className="td-avail-preferences-section-heading">
                              <span className="td-avail-preferences-icon td-avail-preferences-icon--green"><FiBriefcase size={17} /></span>
                              <div><h2>Job Preferences</h2><p>Select the roles, locations and employment types you are interested in.</p></div>
                            </div>
                            <div className="td-avail-preferences-grid">
                              <div className="td-avail-pref-field">
                                <label htmlFor="td-avail-role-input">Preferred roles / subjects</label>
                                <div className="td-avail-pref-input-wrap"><FiSearch size={14} /><input id="td-avail-role-input" value={availabilityTagInput} onChange={(event) => setAvailabilityTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addAvailabilityDraftTag(); } }} placeholder="Search or select roles or subjects" /></div>
                                <div className="td-avail-pref-tags">
                                  {availabilityDraft.roles.map((role) => <span key={role}>{role}<button type="button" aria-label={`Remove ${role}`} onClick={() => setAvailabilityDraft((draft) => ({ ...draft, roles: draft.roles.filter((item) => item !== role) }))}><FiX size={12} /></button></span>)}
                                </div>
                              </div>
                              <div className="td-avail-pref-field">
                                <label htmlFor="td-avail-location-input">Preferred locations</label>
                                <div className="td-avail-pref-input-wrap"><FiSearch size={14} /><input id="td-avail-location-input" value={availabilityLocationInput} onChange={(event) => setAvailabilityLocationInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addAvailabilityDraftLocation(); } }} placeholder="Search or select locations" /></div>
                                <div className="td-avail-pref-tags">
                                  {availabilityDraft.locations.map((location) => <span key={location}>{location}<button type="button" aria-label={`Remove ${location}`} onClick={() => setAvailabilityDraft((draft) => ({ ...draft, locations: draft.locations.filter((item) => item !== location) }))}><FiX size={12} /></button></span>)}
                                </div>
                              </div>
                              <fieldset className="td-avail-pref-fieldset">
                                <legend>Employment type</legend>
                                <div className="td-avail-pref-checkboxes td-avail-pref-checkboxes--inline">
                                  {[['full-time', 'Full-time'], ['part-time', 'Part-time'], ['contract', 'Contract']].map(([value, label]) => (
                                    <label key={value}><input type="checkbox" checked={availabilityDraft.employmentTypes.includes(value)} onChange={() => setAvailabilityDraft((draft) => ({ ...draft, employmentTypes: draft.employmentTypes.includes(value) ? draft.employmentTypes.filter((item) => item !== value) : [...draft.employmentTypes, value] }))} /><span>{label}</span></label>
                                  ))}
                                </div>
                              </fieldset>
                              <fieldset className="td-avail-pref-fieldset">
                                <legend>Preferred teaching level</legend>
                                <div className="td-avail-pref-checkboxes">
                                  {['Early Years', 'Primary', 'Secondary', 'Post-Secondary'].map((level) => (
                                    <label key={level}><input type="checkbox" checked={availabilityDraft.teachingLevels.includes(level)} onChange={() => setAvailabilityDraft((draft) => ({ ...draft, teachingLevels: draft.teachingLevels.includes(level) ? draft.teachingLevels.filter((item) => item !== level) : [...draft.teachingLevels, level] }))} /><span>{level}</span></label>
                                  ))}
                                </div>
                              </fieldset>
                            </div>
                          </section>

                          <section className="td-avail-preferences-section">
                            <div className="td-avail-preferences-section-heading">
                              <span className="td-avail-preferences-icon td-avail-preferences-icon--blue"><FiCalendar size={17} /></span>
                              <div><h2>Availability</h2><p>Let schools know when you are available to start and your work arrangement preferences.</p></div>
                            </div>
                            <div className="td-avail-preferences-grid">
                              <label className="td-avail-pref-field" htmlFor="td-avail-start-select">
                                <span>Available to start</span>
                                <select id="td-avail-start-select" value={availabilityDraft.availableStart} onChange={(event) => setAvailabilityDraft((draft) => ({ ...draft, availableStart: event.target.value }))}>
                                  <option value="immediately">Immediately</option>
                                  <option value="2-weeks">Within 2 weeks</option>
                                  <option value="within-month">Within 1 month</option>
                                  <option value="specific-date">Select a date</option>
                                </select>
                                {availabilityDraft.availableStart === 'specific-date' && <input aria-label="Available start date" type="date" min={new Date().toISOString().slice(0, 10)} value={availabilityDraft.specificDate} onChange={(event) => setAvailabilityDraft((draft) => ({ ...draft, specificDate: event.target.value }))} />}
                              </label>
                              <fieldset className="td-avail-pref-fieldset">
                                <legend>Work arrangement</legend>
                                <div className="td-avail-pref-checkboxes td-avail-pref-checkboxes--inline">
                                  {['On-site', 'Hybrid', 'Remote'].map((arrangement) => (
                                    <label key={arrangement}><input type="checkbox" checked={availabilityDraft.workArrangements.includes(arrangement)} onChange={() => setAvailabilityDraft((draft) => ({ ...draft, workArrangements: draft.workArrangements.includes(arrangement) ? draft.workArrangements.filter((item) => item !== arrangement) : [...draft.workArrangements, arrangement] }))} /><span>{arrangement}</span></label>
                                  ))}
                                </div>
                              </fieldset>
                            </div>
                          </section>

                          <section className="td-avail-preferences-section">
                            <div className="td-avail-preferences-section-heading">
                              <span className="td-avail-preferences-icon td-avail-preferences-icon--purple"><FiFileText size={17} /></span>
                              <div><h2>Additional preferences <small>(optional)</small></h2><p>These details help schools find better opportunities for you.</p></div>
                            </div>
                            <div className="td-avail-preferences-grid">
                              <label className="td-avail-pref-field" htmlFor="td-avail-salary">
                                <span>Expected salary <small>(optional)</small></span>
                                <select id="td-avail-salary" value={availabilityDraft.salaryRange} onChange={(event) => setAvailabilityDraft((draft) => ({ ...draft, salaryRange: event.target.value }))}>
                                  <option value="">Select a salary range</option>
                                  <option value="Below NGN 100,000">Below NGN 100,000</option>
                                  <option value="NGN 100,000–200,000">NGN 100,000–200,000</option>
                                  <option value="NGN 200,000–300,000">NGN 200,000–300,000</option>
                                  <option value="NGN 300,000–500,000">NGN 300,000–500,000</option>
                                  <option value="NGN 500,000–750,000">NGN 500,000–750,000</option>
                                  <option value="Above NGN 750,000">Above NGN 750,000</option>
                                </select>
                              </label>
                              <label className="td-avail-pref-field" htmlFor="td-avail-relocation">
                                <span>Willing to relocate <small>(optional)</small></span>
                                <select id="td-avail-relocation" value={availabilityDraft.relocationPreference} onChange={(event) => setAvailabilityDraft((draft) => ({ ...draft, relocationPreference: event.target.value }))}>
                                  <option value="">Select a preference</option>
                                  <option value="Open to relocation">Open to relocation</option>
                                  <option value="Within my state">Within my state</option>
                                  <option value="Not willing to relocate">Not willing to relocate</option>
                                </select>
                              </label>
                            </div>
                          </section>

                          <section className="td-avail-preferences-section td-avail-preferences-section--notes">
                            <div className="td-avail-preferences-section-heading">
                              <span className="td-avail-preferences-icon td-avail-preferences-icon--orange"><FiInfo size={17} /></span>
                              <div><h2>Additional notes <small>(optional)</small></h2><p>Add any other information that may be relevant to your job search.</p></div>
                            </div>
                            <label className="td-avail-pref-notes">
                              <textarea aria-label="Additional notes" maxLength={500} value={availabilityDraft.notes} onChange={(event) => setAvailabilityDraft((draft) => ({ ...draft, notes: event.target.value }))} placeholder="e.g. Preferred curriculum, special requirements, or other relevant information." />
                              <small>{availabilityDraft.notes.length}/500</small>
                            </label>
                          </section>
                          <p className="td-avail-pref-session-note">Multiple employment selections, work arrangement, salary, relocation, and notes are kept in memory while this dashboard remains open. The profile endpoint supports only one employment type and does not support the other listed fields.</p>
                          {availabilityModalError && <p className="td-avail-pref-error" role="alert">{availabilityModalError}</p>}
                        </div>

                        <footer className="td-avail-preferences-footer">
                          <button type="button" onClick={closeAvailabilityPreferencesModal} disabled={savingAvailability}>Cancel</button>
                          <button type="submit" disabled={savingAvailability}>{savingAvailability ? 'Saving...' : 'Save changes'}</button>
                        </footer>
                      </form>
                    </div>
                  )}

                  {/* Legacy availability form is retained for existing in-flight navigation history. */}
                  {profileSubTab === 'availability-legacy' && (
                    <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="td-avail-info-page">
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
                          {availStartOption === 'specific-date' && (
                            <div className="td-avail-loc-field" style={{ marginTop: '16px' }}>
                              <label className="td-avail-field-label" htmlFor="teacher-available-from">Available date</label>
                              <input
                                id="teacher-available-from"
                                type="date"
                                className="td-avail-loc-input"
                                value={availSpecificDate}
                                min={new Date().toISOString().slice(0, 10)}
                                onChange={(event) => setAvailSpecificDate(event.target.value)}
                              />
                            </div>
                          )}
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
                            onClick={handleSaveAvailability}
                            disabled={savingAvailability || !availabilityHasChanges || (availStartOption === 'specific-date' && !availSpecificDate)}
                          >
                            {savingAvailability ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </Motion.div>
                  )}

                  {/* 8. Profile Updated Successfully Full Screen Overlay Modal */}
                  {(profileSubTab === 'update-success' || showProfileUpdatedModal) && (
                    <Motion.div
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
                          {nextProfileStep
                            ? `Your profile has been saved. Complete your ${nextProfileStep.label} next.`
                            : 'Your profile is complete and ready for schools to discover.'}
                        </p>

                        {/* Progress Status */}
                        <div className="td-success-progress-section">
                          <div
                            className="td-success-progress-bar"
                            role="progressbar"
                            aria-label="Profile completion"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={profileCompletionPercent}
                          >
                            <div className="td-success-progress-fill" style={{ width: `${profileCompletionPercent}%` }} />
                          </div>
                          <span className="td-success-progress-text">
                            Completion Status: {completedProfileStepCount} of {profileCompletionSteps.length} steps ({profileCompletionPercent}%)
                          </span>
                        </div>

                        {/* Actions */}
                        {nextProfileStep && (
                          <button
                            type="button"
                            className="td-success-next-step-btn"
                            onClick={() => {
                              setShowProfileUpdatedModal(false);
                              goToNextProfileStep();
                            }}
                          >
                            {nextProfileStep.key === 'onboarding' ? 'Complete Setup' : `Complete ${nextProfileStep.label}`} <FiArrowRight size={15} />
                          </button>
                        )}
                        <div className="td-success-actions-row">
                          <button
                            type="button"
                            className="td-success-view-profile-btn"
                            onClick={() => {
                              setShowProfileUpdatedModal(false);
                              setProfileSubTab('profile-preview');
                            }}
                          >
                            View My Profile
                          </button>
                          <button
                            type="button"
                            className="td-success-dashboard-btn"
                            onClick={() => {
                              setShowProfileUpdatedModal(false);
                              setActiveTab('dashboard');
                              setProfileSubTab('overview');
                            }}
                          >
                            Go to Dashboard
                          </button>
                        </div>
                      </div>
                    </Motion.div>
                  )}
                </div>
              )}
            </Motion.div>
          )}


          {['messages'].includes(activeTab) && (
            <Motion.div variants={pageVariants} initial="hidden" animate="visible" className="flex flex-col items-center justify-center h-full px-6 py-20 text-center" style={{ minHeight: '60vh' }}>
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
            </Motion.div>
          )}
        </div>
      </div>

      {/* ── Application Modal ── */}
      {showApplyModal && applicationReviewMode && (
        <div className="td-review-modal-overlay" onClick={closeApplyModal}>
          <div className="td-review-modal" onClick={(event) => event.stopPropagation()}>
            <header className="td-review-modal-header">
              <div>
                <h2>Review Your Application</h2>
                <p>Applying to {selectedJob?.school || 'this school'}</p>
              </div>
              <button type="button" className="td-review-modal-close" onClick={closeApplyModal} aria-label="Close application review">×</button>
            </header>

            <div className="td-review-modal-body">
              <section className="td-review-applicant-card">
                <h3>Applicant Summary</h3>
                <div className="td-review-applicant-content">
                  <div className="td-review-avatar">{getInitials(profileFullName)}</div>
                  <div>
                    <strong>{profileFullName}</strong>
                    <p>{profileRoleTitle} • {profYearsExp}</p>
                    <div className="td-review-pills">
                      <span><FiMapPin size={12} />{profileLocation}</span>
                      {isTrcnVerified && <span><FiCheckCircle size={12} />TRCN Verified</span>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="td-review-section">
                <div className="td-review-section-heading"><h3>Your CV / Resume</h3>{(existingCvUrl || activeResume?.url || profileState?.cv_url) && !reviewCvEditing && <button type="button" onClick={() => setReviewCvEditing(true)}>Update CV</button>}</div>
                {(existingCvUrl || activeResume?.url || profileState?.cv_url) && !reviewCvEditing ? (
                  <div className="td-review-document-row">
                    <div className="td-review-document-icon"><FiFileText size={18} /></div>
                    <div className="td-review-document-copy">
                      <strong>{activeResume?.name || existingCvUrl.split('/').pop() || 'Profile CV'}</strong>
                      <span>Last updated: {activeResume.uploadDate}</span>
                    </div>
                    <button
                      type="button"
                      className="td-review-document-action"
                      onClick={() => setReviewCvPreviewOpen((open) => !open)}
                      aria-label={reviewCvPreviewOpen ? 'Hide CV preview' : 'Preview CV'}
                      aria-expanded={reviewCvPreviewOpen}
                    >
                      <FiEye size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="td-review-upload-field">
                    <FiUpload size={17} />
                    <span>{applicationForm.resumeFile ? applicationForm.resumeFile.name : 'Upload a CV for this application'}</span>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} />
                  </label>
                )}
                {reviewCvPreviewOpen && (
                  <div className="td-review-document-preview">
                    <div className="td-review-document-preview-header">
                      <strong>CV preview</strong>
                      <div>
                        <button type="button" onClick={() => handleResumeAction('download')}>Download CV</button>
                        <button type="button" onClick={() => setReviewCvPreviewOpen(false)}>Close preview</button>
                      </div>
                    </div>
                    <iframe
                      className="td-review-pdf-preview"
                      src={profileCvUrl}
                      title="CV preview"
                    />
                  </div>
                )}
              </section>

              <section className="td-review-section">
                <div className="td-review-section-heading"><h3>Your Cover Letter</h3>{applicationForm.coverLetter.trim() && !reviewCoverLetterEditing && <button type="button" onClick={() => setReviewCoverLetterEditing(true)}>Update cover letter</button>}</div>
                {applicationForm.coverLetter.trim() && !reviewCoverLetterEditing ? (
                  <div className="td-review-existing-letter">{applicationForm.coverLetter}</div>
                ) : (
                  <label className="td-review-letter-field">
                    <span>Cover letter (Optional, up to {COVER_LETTER_MAX_LENGTH} characters)</span>
                    <div className="td-review-letter-editor">
                      <textarea
                        value={applicationForm.coverLetter}
                        onChange={(event) => setApplicationForm((current) => ({ ...current, coverLetter: event.target.value.slice(0, COVER_LETTER_MAX_LENGTH), coverLetterFile: null }))}
                        placeholder="Explain why you are a good fit for this role."
                        maxLength={COVER_LETTER_MAX_LENGTH}
                        rows={6}
                      />
                      <button
                        type="button"
                        className="td-review-letter-confirm"
                        onClick={() => {
                          setApplicationError('');
                          setReviewCoverLetterEditing(false);
                        }}
                        aria-label="Confirm cover letter"
                        title="Confirm cover letter"
                      >
                        <FiCheck size={16} />
                      </button>
                    </div>
                    <span className="td-cover-letter-counter" aria-live="polite">
                      {applicationForm.coverLetter.length} / {COVER_LETTER_MAX_LENGTH} characters
                    </span>
                  </label>
                )}
              </section>

              {applicationError && <p className="td-review-error" role="alert">{applicationError}</p>}

              <label className="td-review-consent">
                <input type="checkbox" checked={applicationConsent} onChange={(event) => setApplicationConsent(event.target.checked)} />
                <span>I confirm that the information provided in this application is true and accurate to the best of my knowledge. I understand that any false statements may result in disqualification from the hiring process. <span className="td-pers-required-marker" aria-hidden="true">*</span></span>
              </label>
            </div>

            <footer className="td-review-modal-footer">
              <button type="button" className="td-review-back-btn" onClick={closeApplyModal} disabled={submittingApplication}>Back</button>
              <button type="button" className="td-review-submit-btn" onClick={submitJobApplication} disabled={!applicationConsent || submittingApplication || (!(existingCvUrl || activeResume?.url || profileState?.cv_url || applicationForm.resumeFile))}>
                {submittingApplication ? 'Submitting...' : 'Submit Application'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {showApplyModal && !applicationReviewMode && (
        <div className="td-modal-overlay" onClick={closeApplyModal}>
          <div className="td-modal" onClick={(e) => e.stopPropagation()}>
            <div className="td-modal-header">
              <div>
                <h2>Apply for {selectedJob?.title || 'this position'}</h2>
                <p>{selectedJob?.school} • {selectedJob?.location}</p>
              </div>
              <button type="button" className="td-modal-close" onClick={closeApplyModal}>&times;</button>
            </div>

            {applyDetailsLoading ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
                <FiRotateCw size={28} className="spin" style={{ marginBottom: '14px', color: '#16a34a' }} />
                <p style={{ fontWeight: 600 }}>Checking application requirements...</p>
              </div>
            ) : alreadyAppliedState ? (
              <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: '24px', fontWeight: 700 }}>✓</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Already Applied</h3>
                <p style={{ color: '#475569', marginBottom: '24px', lineHeight: 1.6 }}>You have already submitted an application for this role at <strong>{selectedJob?.school}</strong>.</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="td-modal-primary-btn"
                    onClick={() => {
                      closeApplyModal();
                      setActiveTab('applications');
                    }}
                  >
                    View Application Status
                  </button>
                  <button type="button" className="td-modal-secondary-btn" onClick={closeApplyModal}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="td-modal-step-indicator">
                  <span className={applicationStep === 1 ? 'active' : ''}>1</span>
                  <span className={applicationStep === 2 ? 'active' : ''}>2</span>
                  <span className={applicationStep === 3 ? 'active' : ''}>3</span>
                </div>

                <form className="td-modal-form" onSubmit={handleSubmitApplication}>
                  {applicationError && (
                    <div className="td-form-error" style={{ padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '14px', marginBottom: '18px' }}>
                      {applicationError}
                    </div>
                  )}

                  {applicationStep === 1 && (
                    <div className="td-modal-step">
                      <h3>1. Candidate Details</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Verify your contact information before proceeding to your CV and cover letter.</p>
                      <label>
                        Full name <span className="td-pers-required-marker" aria-hidden="true">*</span>
                        <input name="name" type="text" value={applicationForm.name} onChange={handleApplicationInput} required placeholder="Jane Doe" />
                      </label>
                      <label>
                        Email address <span className="td-pers-required-marker" aria-hidden="true">*</span>
                        <input name="email" type="email" value={applicationForm.email} onChange={handleApplicationInput} required placeholder="jane@example.com" />
                      </label>
                      <label>
                        Phone number <span className="td-pers-required-marker" aria-hidden="true">*</span>
                        <input name="phone" type="tel" value={applicationForm.phone} onChange={handleApplicationInput} required placeholder="+234 800 000 0000" />
                      </label>
                      <label>
                        Years of teaching experience
                        <input name="yearsExperience" type="text" value={applicationForm.yearsExperience} onChange={handleApplicationInput} placeholder="e.g. 5 years" />
                      </label>
                    </div>
                  )}

                  {applicationStep === 2 && (
                    <div className="td-modal-step">
                      <h3>2. Curriculum Vitae (CV) <span className="td-pers-required-marker" aria-hidden="true">*</span></h3>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Attach your CV to give the employer a complete view of your academic background.</p>

                      {(existingCvUrl || activeResume?.url || profileState?.cv_url) && (
                        <div
                          style={{
                            padding: '14px 16px',
                            borderRadius: '14px',
                            border: applicationForm.useExistingCv ? '2px solid #16a34a' : '1px solid #e2e8f0',
                            background: applicationForm.useExistingCv ? '#f0fdf4' : '#fff',
                            marginBottom: '16px',
                            cursor: 'pointer',
                          }}
                          onClick={() => setApplicationForm(prev => ({ ...prev, useExistingCv: true }))}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="cvChoice"
                              checked={applicationForm.useExistingCv}
                              onChange={() => setApplicationForm(prev => ({ ...prev, useExistingCv: true }))}
                            />
                            <div>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Use profile CV on file</strong>
                              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                                {(existingCvUrl || activeResume?.url || profileState?.cv_url)?.split('/').pop() || activeResume?.name || 'Current Profile CV'}
                              </p>
                            </div>
                          </label>
                        </div>
                      )}

                      <div
                        style={{
                          padding: '14px 16px',
                          borderRadius: '14px',
                          border: !applicationForm.useExistingCv || !(existingCvUrl || activeResume?.url || profileState?.cv_url) ? '2px solid #16a34a' : '1px solid #e2e8f0',
                          background: !applicationForm.useExistingCv || !(existingCvUrl || activeResume?.url || profileState?.cv_url) ? '#f0fdf4' : '#fff',
                          cursor: 'pointer',
                        }}
                        onClick={() => setApplicationForm(prev => ({ ...prev, useExistingCv: false }))}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="cvChoice"
                            checked={!applicationForm.useExistingCv || !(existingCvUrl || activeResume?.url || profileState?.cv_url)}
                            onChange={() => setApplicationForm(prev => ({ ...prev, useExistingCv: false }))}
                          />
                          <div>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>Upload a new CV document</strong>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Upload a PDF, DOC, or DOCX document for this job application.</p>
                          </div>
                        </label>

                        {(!applicationForm.useExistingCv || !(existingCvUrl || activeResume?.url || profileState?.cv_url)) && (
                          <div className="td-upload-input-wrapper" style={{ marginTop: '14px' }}>
                            <input
                              name="resumeFile"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                handleFileInput(e);
                                setApplicationForm(prev => ({ ...prev, useExistingCv: false }));
                              }}
                            />
                            <div className="td-upload-placeholder">
                              <FiDownload size={22} color="#16a34a" />
                              <span>Click to browse or drop your CV file here</span>
                              <small>Accepted formats: PDF, DOC, DOCX</small>
                            </div>
                            {applicationForm.resumeFile && (
                              <div className="td-upload-preview" style={{ width: '100%', textAlign: 'center', fontWeight: 600, color: '#166534' }}>
                                Selected file: {applicationForm.resumeFile.name}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {applicationStep === 3 && (
                    <div className="td-modal-step">
                      <h3>3. Cover Letter & Additional Information</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Add a cover letter to explain why you are a good fit for this position (optional).</p>

                      <label>
                        Cover letter (Optional)
                        <textarea
                          name="coverLetter"
                          value={applicationForm.coverLetter}
                          onChange={handleApplicationInput}
                          placeholder="Introduce yourself, your teaching experience, key accomplishments, and why you are interested in joining this school..."
                          maxLength={COVER_LETTER_MAX_LENGTH}
                          style={{ minHeight: '130px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                          <span>No minimum length</span>
                          <span style={{ color: applicationForm.coverLetter.length >= COVER_LETTER_MAX_LENGTH ? '#dc2626' : '#64748b' }}>{applicationForm.coverLetter.length}/{COVER_LETTER_MAX_LENGTH} chars</span>
                        </div>
                      </label>

                      <label style={{ marginTop: '14px' }}>
                        Additional relevant information (Optional)
                        <textarea
                          name="additionalInfo"
                          value={applicationForm.additionalInfo}
                          onChange={handleApplicationInput}
                          placeholder="Include any extra details such as your availability date, TRCN registration number, salary preferences, or references..."
                          style={{ minHeight: '80px' }}
                        />
                      </label>

                      <div className="td-modal-job-summary" style={{ marginTop: '16px' }}>
                        <div><strong>Role:</strong> {selectedJob?.title}</div>
                        <div><strong>School:</strong> {selectedJob?.school}</div>
                        <div><strong>CV Attached:</strong> {applicationForm.useExistingCv ? 'Profile CV on file' : (applicationForm.resumeFile?.name || 'File attached')}</div>
                      </div>
                    </div>
                  )}

                  <div className="td-modal-actions" style={{ marginTop: '24px' }}>
                    {applicationStep > 1 ? (
                      <button type="button" className="td-modal-secondary-btn" onClick={goToPrevStep} disabled={submittingApplication}>Back</button>
                    ) : (
                      <div />
                    )}

                    {applicationStep < 3 ? (
                      <button type="button" className="td-modal-primary-btn" onClick={goToNextStep}>Next step</button>
                    ) : (
                      <button
                        type="submit"
                        className="td-modal-primary-btn"
                        disabled={submittingApplication}
                        style={{ opacity: submittingApplication ? 0.7 : 1 }}
                      >
                        {submittingApplication ? 'Submitting Application...' : 'Submit Application'}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {showPhoneVerificationModal && profileSubTab === 'change-phone' && (
        <div className="td-phone-verify-overlay" onClick={() => setShowPhoneVerificationModal(false)}>
          <div className="td-phone-verify-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="td-phone-verify-close"
              onClick={() => setShowPhoneVerificationModal(false)}
              aria-label="Close phone verification"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="td-phone-verify-icon"><FiMail size={17} /></div>
            <h2>Verify your new<br />phone number</h2>
            <p className="td-phone-verify-description">We sent a verification code to your new phone number</p>
            <span className="td-phone-verify-number">
              {pendingPhoneNumber ? `${pendingPhoneNumber.slice(0, 5)}${'*'.repeat(Math.max(0, pendingPhoneNumber.length - 9))}${pendingPhoneNumber.slice(-4)}` : 'Phone number'}
            </span>

            <div className="td-phone-verify-code" role="group" aria-label="Phone verification code">
              {phoneVerificationCode.map((digit, index) => (
                <input
                  key={`phone-code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  aria-label={`Verification digit ${index + 1}`}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, '').slice(-1);
                    setPhoneVerificationCode((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
                    if (value) event.target.nextElementSibling?.focus();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !digit) event.currentTarget.previousElementSibling?.focus();
                  }}
                />
              ))}
            </div>

            <button type="button" className="td-phone-verify-submit" onClick={handlePhoneVerificationSuccess} disabled={phoneVerificationCode.some((digit) => !digit)}>
              Verify phone number <FiArrowRight size={15} />
            </button>

            <div className="td-phone-verify-divider" />
            <p className="td-phone-verify-resend">Didn't receive the code? <button type="button">Resend code</button></p>
            <button type="button" className="td-phone-verify-change" onClick={() => { setShowPhoneVerificationModal(false); setProfileSubTab('change-phone'); }}>Change phone number</button>
          </div>
        </div>
      )}

      {showEmailVerificationModal && profileSubTab === 'change-email' && (
        <div className="td-email-verify-overlay" onClick={() => setShowEmailVerificationModal(false)}>
          <div className="td-email-verify-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="td-email-verify-close"
              onClick={() => setShowEmailVerificationModal(false)}
              aria-label="Close email verification"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="td-email-verify-icon"><FiMail size={17} /></div>
            <h2>Verify your new email</h2>
            <p className="td-email-verify-description">We sent a verification code to your new email address.</p>
            <span className="td-email-verify-address">
              {pendingEmailAddress ? `${pendingEmailAddress.slice(0, 1)}****${pendingEmailAddress.slice(pendingEmailAddress.indexOf('@'))}` : 'Email address'}
            </span>

            <div className="td-email-verify-code" role="group" aria-label="Email verification code">
              {emailVerificationCode.map((digit, index) => (
                <input
                  key={`email-code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  aria-label={`Verification digit ${index + 1}`}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, '').slice(-1);
                    setEmailVerificationCode((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
                    if (value) event.target.nextElementSibling?.focus();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !digit) event.currentTarget.previousElementSibling?.focus();
                  }}
                />
              ))}
            </div>

            <button type="button" className="td-email-verify-submit" onClick={handleEmailVerificationSuccess} disabled={emailVerificationCode.some((digit) => !digit)}>
              Verify email <FiArrowRight size={15} />
            </button>

            <div className="td-email-verify-divider" />
            <p className="td-email-verify-resend">Didn't receive the code? <button type="button">Resend code</button></p>
            <button type="button" className="td-email-verify-change" onClick={() => { setShowEmailVerificationModal(false); setProfileSubTab('change-email'); }}>Change email address</button>
          </div>
        </div>
      )}

      {showPhoneSuccessSnackbar && (
        <div className="td-phone-success-snackbar" role="status">
          <div className="td-phone-success-icon"><FiCheck size={15} /></div>
          <div className="td-phone-success-copy">
            <strong>Phone number successfully changed</strong>
            <span>Your phone number has been changed successfully.</span>
          </div>
          <button type="button" onClick={() => setShowPhoneSuccessSnackbar(false)} aria-label="Dismiss success message">×</button>
          <button type="button" className="td-phone-success-ok" onClick={() => setShowPhoneSuccessSnackbar(false)}>Okay</button>
        </div>
      )}

      {showEmailSuccessSnackbar && (
        <div className="td-phone-success-snackbar" role="status">
          <div className="td-phone-success-icon"><FiCheck size={15} /></div>
          <div className="td-phone-success-copy">
            <strong>Email successfully changed</strong>
            <span>Your email has been changed successfully.</span>
          </div>
          <button type="button" onClick={() => setShowEmailSuccessSnackbar(false)} aria-label="Dismiss success message">×</button>
          <button type="button" className="td-phone-success-ok" onClick={() => setShowEmailSuccessSnackbar(false)}>Okay</button>
        </div>
      )}

      {showCvSuccessSnackbar && (
        <div className="td-phone-success-snackbar" role="status">
          <div className="td-phone-success-icon"><FiCheck size={15} /></div>
          <div className="td-phone-success-copy">
            <strong>CV successfully updated</strong>
            <span>Your new CV is now on your profile.</span>
          </div>
          <button type="button" onClick={() => setShowCvSuccessSnackbar(false)} aria-label="Dismiss success message">×</button>
          <button type="button" className="td-phone-success-ok" onClick={() => setShowCvSuccessSnackbar(false)}>Okay</button>
        </div>
      )}

      {showApplicationSuccessModal && (
        <div className="td-application-success-overlay" onClick={() => setShowApplicationSuccessModal(false)}>
          <div className="td-application-success-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="td-application-success-close" onClick={() => setShowApplicationSuccessModal(false)} aria-label="Close application success">×</button>
            <div className="td-application-success-icon"><FiCheck size={22} /></div>
            <h2>Application Submitted Successfully!</h2>
            <p>Your professional profile has been delivered to the hiring committee.</p>

            <div className="td-application-success-summary">
              <div className="td-application-success-logo">
                {selectedJob?.employerImage ? <img src={selectedJob.employerImage} alt="" /> : <FiAward size={23} />}
              </div>
              <div>
                <span>POSITION APPLIED</span>
                <strong>{selectedJob?.title || 'Teaching Opportunity'}</strong>
                <p><FiBook size={12} /> {selectedJob?.school || 'School'} <i>•</i> <FiMapPin size={12} /> {selectedJob?.location || 'Location not provided'}</p>
              </div>
            </div>

            <div className="td-application-success-actions">
              <button type="button" className="td-application-success-note" onClick={() => setShowApplicationSuccessModal(false)}>Update Application Note</button>
              <button type="button" className="td-application-success-status" onClick={() => { setShowApplicationSuccessModal(false); setActiveTab('applications'); }}>View Application Status</button>
            </div>
            <button type="button" className="td-application-success-more" onClick={() => { setShowApplicationSuccessModal(false); setSelectedJob(null); setActiveTab('jobs'); }}>
              View More Jobs in Nigeria <FiArrowRight size={15} />
            </button>
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
            onClick={() => handleNavTabChange(tab.id)}
          >
            <span className="td-bottomnav-icon-wrapper">
              <span className="td-bottomnav-icon">{tab.icon}</span>
            </span>
            <span className="td-bottomnav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <FeedbackButton user={user} audience="Teacher" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .td-layout {
          display: flex;
          background-color: #F8F9FA;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
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
        .td-nav-notification-dot {
          width: 7px;
          height: 7px;
          margin-left: auto;
          border-radius: 50%;
          background: #c92c31;
          box-shadow: 0 0 0 2px rgba(201, 44, 49, 0.12);
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
        .td-sidebar-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: calc(100% - 24px);
          margin: 16px 12px 0;
          padding: 8px 12px;
          border: 1px solid rgba(220, 38, 38, 0.18);
          border-radius: 10px;
          background: rgba(254, 242, 242, 0.9);
          color: #b91c1c;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .td-sidebar-logout:hover {
          background: #fee2e2;
          border-color: rgba(220, 38, 38, 0.32);
          color: #991b1b;
          transform: translateY(-1px);
        }
        .td-sidebar-logout svg {
          stroke: currentColor;
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
        .td-avatar-initials {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d1fae5, #bbf7d0);
          color: #14532d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.04em;
          border: 2px solid #E8F9ED;
        }
        .td-avatar-initials--topbar {
          width: 40px;
          height: 40px;
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
        .td-mobile-topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .td-mobile-avatar .td-avatar-initials {
          width: 38px;
          height: 38px;
          border: 2px solid #E8F9ED;
          font-size: 12px;
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
        .td-mobile-logout-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(220, 38, 38, 0.16);
          border-radius: 50%;
          background: rgba(254, 242, 242, 0.9);
          color: #b91c1c;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .td-mobile-logout-btn:hover {
          background: #fee2e2;
          border-color: rgba(220, 38, 38, 0.32);
          color: #991b1b;
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

        @media (min-width: 769px) {
          .td-content { padding-top: 76px; }
        }

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
          margin-bottom: 16px;
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
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 48px;
          align-items: stretch;
        }
        .td-stats-row .td-profile-card {
          width: 100%;
        }
        .td-stats-mini-wrapper {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .td-stat-card {
          background: #ffffff;
          border: 1px solid #edf1f3;
          border-radius: 24px;
          padding: 22px 20px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.03);
          position: relative;
        }
        
        .td-profile-card {
          border: 1px solid #edf1f3;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Desktop profile card internals */
        .td-mobile-profile-strength { display: none; }
        .td-desktop-profile-strength {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
          gap: 18px;
          flex: 1;
        }
        .td-profile-content-block {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .td-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .td-profile-title {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
        }
        .td-profile-completion-heading {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .td-profile-completion-count {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .td-profile-completion-count strong {
          color: #1f2937;
          font-size: 22px;
          font-weight: 800;
          line-height: 1.15;
        }
        .td-profile-completion-count span {
          padding: 4px 8px;
          border-radius: 999px;
          background: #fff7dc;
          color: #7c5b00;
          font-size: 11px;
          font-weight: 600;
        }
        .td-profile-completion-count span.is-complete {
          background: #dcfce7;
          color: #166534;
        }
        .td-percent-badge {
          background: #dcfce7;
          color: #166534;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .td-progress-bar {
          height: 10px;
          background: #edf2f7;
          border-radius: 9999px;
          margin-bottom: 14px;
          overflow: hidden;
        }
        .td-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
          border-radius: 9999px;
          transition: width 0.8s ease;
        }

        .td-card-hint {
          font-size: 13px;
          color: #667085;
          line-height: 1.45;
          margin: 0;
          max-width: 560px;
        }

        .td-complete-profile-btn {
          width: auto;
          min-width: 180px;
          height: 46px;
          background: #22c55e;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(34, 197, 94, 0.18);
        }
        .td-complete-profile-btn:hover {
          background: #16A34A;
        }

        /* 3 Mini Cards on Desktop */
        .td-mini-card {
          background: #ffffff;
          border: 1px solid #e6ebee;
          border-radius: 20px;
          padding: 20px 18px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .td-mini-card:hover {
          transform: translateY(-3px);
          border-color: #d8e7dc;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }
        
        .td-mini-card--views::before,
        .td-mini-card--applied::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: linear-gradient(180deg, #22c55e 0%, #4ade80 100%);
          border-radius: 20px 0 0 20px;
        }

        .td-mini-card--pending::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: linear-gradient(180deg, #ef4444 0%, #f87171 100%);
          border-radius: 20px 0 0 20px;
        }

        .td-mini-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #ecfdf5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #15803d;
          margin-bottom: 20px;
          box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.08);
        }

        .td-mini-icon-circle--pending {
          background: #fef2f2;
          color: #dc2626;
        }

        .td-mini-label {
          font-size: 12px;
          font-weight: 800;
          color: #1A202C;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
        }

        .td-mini-label--pending {
          color: #000000;
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
        .td-mini-unit--pending {
          color: #dc2626;
          font-weight: 700;
        }
        .td-mini-value--pending {
          color: #000000;
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
          cursor: pointer;
        }
        .td-view-all-link:hover {
          text-decoration: underline;
          cursor: pointer;
        }

        .td-mobile-label { display: none; }
        .td-desktop-label { display: inline; }

        .td-mobile-stat-number { display: none; }
        .td-mobile-subtext { display: none; }
        .td-profile-views-log-link {
          align-self: flex-start;
          margin-top: auto;
          padding: 6px 0 0;
          border: 0;
          background: transparent;
          color: #15803D;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .td-profile-views-log-link:hover { color: #166534; }
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
          padding: 20px 32px;
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
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .td-job-title-line {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
          min-height: 26px;
        }
        .td-job-title-line h3 {
          font-size: 17px;
          font-weight: 800;
          color: #1A202C;
        }

        .td-job-badge-col {
          position: absolute;
          top: 0;
          right: 0;
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
          margin: 0;
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
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .td-desktop-tags { display: flex; margin-top: 24px; }
        .td-mobile-only-tags { display: none; }

        .td-job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #F1F5F9;
          margin-top: 14px;
          padding-top: 14px;
          gap: 12px;
        }
        .td-job-salary-inline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #0F172A;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }
        .td-job-salary-inline svg {
          color: #10B981;
        }
        .td-quick-apply {
          background: #22C55E;
          color: white;
          border: none;
          padding: 10px 28px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
          white-space: nowrap;
          margin-left: auto;
        }
        .td-quick-apply:hover {
          background: #16A34A;
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

        /* Hero */
        .td-jobs-hero { margin-bottom: 28px; }
        .td-jobs-hero-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .td-jobs-hero-text h1 { font-size: 34px; font-weight: 800; color: #111; margin: 0 0 6px; line-height: 1.2; }
        .td-highlight { color: #16A34A; }
        .td-jobs-hero-text p { color: #6C757D; font-size: 14px; margin: 0; }

        /* Saved Jobs Button */
        .td-saved-jobs-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #DCFCE7;
          color: #15803D;
          border: none;
          border-radius: 50px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
          transition: background 0.15s ease;
        }
        .td-saved-jobs-btn:hover { background: #BBF7D0; }
        .td-saved-jobs-btn--active {
          background: #BBF7D0;
          color: #15803D;
          font-weight: 700;
        }
        .td-saved-jobs-btn--active:hover { background: #86EFAC; }

        /* Search Bar */
        .td-desktop-search {
          display: flex;
          align-items: center;
          gap: 0;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          overflow: hidden;
        }
        .td-search-input-group {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 14px 18px;
          gap: 10px;
          background: transparent;
          border: none;
        }
        .td-search-input-group input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; color: #111; }
        .td-search-input-group input::placeholder { color: #9CA3AF; }
        .td-search-divider { width: 1px; height: 28px; background: #E5E7EB; flex-shrink: 0; }
        .td-search-icon { color: #6C757D; flex-shrink: 0; }
        .td-btn-primary {
          background: #15803D;
          color: white;
          border: none;
          padding: 14px 26px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          font-family: inherit;
          border-radius: 0 12px 12px 0;
        }
        .td-btn-primary:hover { background: #166534; }
        .td-interactive-input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
        .td-interactive-input:focus { color: #15803D; }

        .td-mobile-jobs-search { display: none; }

        /* Layout */
        .td-jobs-layout { display: flex; gap: 32px; align-items: flex-start; }
        .td-jobs-layout--filters-collapsed { gap: 16px; }

        /* Filters sidebar */
        .td-jobs-filters { width: 220px; flex-shrink: 0; position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto; transition: width 0.2s ease; }
        .td-jobs-filters--collapsed { width: 100px; max-height: none; overflow: visible; }
        .td-jobs-filters--collapsed .td-filter-header { flex-direction: column; align-items: flex-start; gap: 10px; }
        .td-jobs-filters--collapsed .td-clear-btn:first-of-type { display: none; }
        .td-filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .td-filter-header h3 { font-size: 15px; font-weight: 800; color: #111; margin: 0; }
        .td-clear-btn { background: none; border: none; color: #16A34A; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; }

        .td-filter-group { margin-bottom: 28px; }
        .td-filter-group h4 { font-size: 11px; color: #6C757D; font-weight: 800; margin: 0 0 14px; letter-spacing: 0.6px; text-transform: uppercase; }
        .td-checkbox-label { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #374151; margin-bottom: 12px; cursor: pointer; user-select: none; }
        .td-checkbox-custom { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #D1D5DB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
        .td-checkbox-custom.td-checked { background: #15803D; border-color: #15803D; color: white; }

        .td-filter-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .td-tag { padding: 7px 14px; border-radius: 20px; background: #F3F4F6; color: #374151; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: 1.5px solid transparent; }
        .td-tag:hover { border-color: #D1FAE5; background: #ECFDF5; }
        .td-tag-active { background: #DCFCE7; color: #15803D; border-color: #86EFAC; }

        .td-progress-scroll-wrapper { padding-top: 4px; }
        .td-progress-scroll-input {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: #E5E7EB;
          border-radius: 3px;
          outline: none;
          margin-bottom: 10px;
        }
        .td-progress-scroll-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: white;
          border: 2.5px solid #15803D;
          border-radius: 50%;
          cursor: pointer;
        }
        .td-range-labels { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #111; }

        /* Job Cards List */
        .td-jobs-list-container { flex: 1; min-width: 0; }
        .td-jobs-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .td-desktop-showing { font-size: 13.5px; color: #6C757D; }
        .td-sort-by { font-size: 13.5px; color: #6C757D; display: flex; align-items: center; }
        .td-mobile-showing { display: none; }

        .td-feed-list { display: flex; flex-direction: column; gap: 12px; }
        .td-feed-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 16px 18px;
          border: 1px solid #E2E8F0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          min-height: 104px;
          position: relative;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .td-feed-card:hover {
          transform: translateY(-2px);
          border-color: #BBF7D0;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
        }

        .td-feed-card-standard {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          grid-template-areas: "header" "meta" "footer";
          align-items: stretch;
          gap: 14px;
          min-height: 168px;
          padding: 20px 32px;
          border-radius: 28px;
          border: 1px solid #F1F5F9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.015);
        }

        .td-feed-card-standard:hover {
          border-color: #BBF7D0;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
        }

        /* Card header - icon + info */
        .td-fc-header { 
          display: flex;
          align-items: center;
          gap: 14px;
          grid-area: header;
          width: 100%;
          flex: none;
          min-width: 250px;
          padding-right: 46px;
          margin-bottom: 8px;
        }
        .td-fc-icon-wrapper { flex-shrink: 0; }
        .td-fc-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E8F5E9;
          color: #15803D;
          font-size: 20px;
        }
        .td-bg-gray { background: #E8F5E9; }
        
        /* Main info container */
        .td-fc-main-info { 
          flex: 1;
          min-width: 180px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .td-fc-main-info h3 { 
          font-size: 15px;
          font-weight: 800;
          color: #172033;
          margin: 0;
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .td-fc-school { 
          font-size: 12px;
          color: #64748B;
          margin: 0;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .td-fc-school strong { color: #666; font-weight: 600; }
        .td-dot { margin: 0 3px; color: #CCC; }
        
        /* Featured badge */
        .td-fc-title-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          margin-left: 8px;
          flex-shrink: 0;
        }
        .td-fc-badge-desktop {
          display: flex;
          justify-content: flex-end;
          flex-shrink: 0;
        }
        .td-badge-featured {
          background: #DCFCE7;
          color: #15803D;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        /* Meta badges - job type and time */
        .td-fc-meta { 
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          grid-area: meta;
          width: 100%;
          min-width: 0;
          margin: 0;
        }
        .td-fc-meta-item { 
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 9999px;
          background: #F1F5F9;
          font-size: 10px;
          color: #475569;
          font-weight: 800;
          letter-spacing: 0.3px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .td-fc-meta-salary {
          background: #E8F9ED;
          color: #15803D;
        }

        /* Salary display */
        .td-fc-salary {
          font-size: 13px;
          font-weight: 700;
          color: #111;
          white-space: nowrap;
          flex-shrink: 0;
          order: 3;
          margin-left: auto;
        }
        .td-fc-salary span { 
          font-size: 10px;
          font-weight: 500;
          color: #999;
        }

        /* Footer actions */
        .td-fc-footer { 
          display: flex;
          align-items: center;
          gap: 6px;
          grid-area: footer;
          width: 100%;
          justify-content: flex-end;
          flex-shrink: 0;
          padding-top: 12px;
          border-top: 1px solid #F1F5F9;
        }
        .td-fc-footer-actions { 
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          width: 100%;
        }
        .td-fc-footer-salary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #15803D;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .td-fc-action {
          background: #15803D;
          color: white;
          border: none;
          padding: 10px 28px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }
        .td-fc-action:hover { background: #166534; }
        .td-bookmark-btn {
          position: absolute;
          top: 20px;
          right: 32px;
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          color: #9CA3AF;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .td-bookmark-btn:hover {
          border-color: #15803D;
          color: #15803D;
        }
        .td-bookmark-btn--saved {
          background: #DCFCE7;
          border-color: #86EFAC;
          color: #15803D;
        }

        /* Load More */
        .td-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 42px 26px;
          border: 1px dashed #D5E5DA;
          border-radius: 20px;
          background: #F8FBF9;
          color: #4B5B5A;
          text-align: center;
        }
        .td-empty-state-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #EAF7EE;
          color: #15803D;
        }
        .td-empty-state h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
          font-weight: 800;
        }
        .td-empty-state p {
          margin: 0;
          max-width: 420px;
          color: #5D6972;
          font-size: 14px;
          line-height: 1.5;
        }
        .td-empty-state-btn {
          appearance: none;
          border: 0;
          border-radius: 999px;
          background: #15803D;
          color: #ffffff;
          padding: 10px 18px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .td-load-more-container { text-align: center; margin-top: 32px; }
        .td-load-more-btn {
          background: transparent;
          border: 2px solid #15803D;
          color: #15803D;
          padding: 12px 32px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 12px;
          font-family: inherit;
          transition: all 0.15s;
        }
        .td-load-more-btn:hover { background: #15803D; color: white; }
        .td-load-more-container p { font-size: 13px; color: #6C757D; margin: 0; }

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
          .td-jobs-hero { margin-bottom: 20px; }
          .td-jobs-hero h1 { font-size: 30px; font-weight: 800; color: #1E293B; letter-spacing: -0.6px; line-height: 1.25; margin-bottom: 18px; }
          .td-jobs-hero p { display: none; }
          .td-desktop-search { display: none; }
          .td-mobile-jobs-search { display: block; }
          
          .td-search-box-mobile {
            background: #E5E7EB;
            border-radius: 50px;
            display: flex;
            align-items: center;
            padding: 13px 20px;
            margin-bottom: 14px;
          }
          .td-search-box-mobile .td-search-icon { color: #64748B; flex-shrink: 0; }
          .td-search-box-mobile input {
            border: none;
            background: transparent;
            outline: none;
            margin-left: 10px;
            width: 100%;
            font-size: 14px;
            color: #1E293B;
            font-family: inherit;
          }
          .td-search-box-mobile input::placeholder {
            color: #64748B;
          }

          .td-mobile-filter-chips {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 4px;
          }
          .td-filter-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 9px 18px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
            flex-shrink: 0;
            cursor: pointer;
            border: none;
            outline: none;
            font-family: inherit;
          }
          .td-chip-active-green {
            background: #15803D;
            color: #ffffff;
          }
          .td-chip-active-lightgreen {
            background: #DCFCE7;
            color: #15803D;
          }
          .td-chip-soft {
            background: #F1F5F9;
            color: #374151;
          }

          .td-jobs-filters { display: none; }
          .td-desktop-showing { display: none; }
          .td-sort-by { display: none; }
          
          .td-mobile-showing {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 18px;
            margin-top: 10px;
          }
          .td-mobile-rec-info h3 {
            font-size: 17px;
            font-weight: 800;
            color: #1E293B;
            margin: 0 0 2px;
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
            color: #15803D;
            border: none;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.3s ease;
          }
          .td-mobile-saved-btn:hover {
            background: #BBF7D0;
            transform: scale(1.05);
          }
          .td-mobile-saved-btn--active {
            background: #15803D;
            color: #DCFCE7;
          }
          .td-mobile-saved-btn--active:hover {
            background: #166534;
          }

          /* Job Cards list on Mobile */
          .td-feed-list {
            gap: 16px;
          }

          /* Standard Job Card on Mobile */
          .td-feed-card-standard {
            background: #FFFFFF;
            border-radius: 24px;
            padding: 20px 18px;
            border: 1px solid #EEF2F6;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
          }
          .td-feed-card-standard .td-fc-header {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            padding-right: 40px;
          }
          .td-feed-card-standard .td-fc-icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #F1F5F9;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .td-feed-card-standard .td-fc-icon {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .td-feed-card-standard .td-fc-icon.td-bg-darkgreen {
            background: #1B3F35;
            color: #ffffff;
          }
          .td-feed-card-standard .td-fc-icon.td-bg-gold {
            background: #A38C52;
            color: #ffffff;
          }
          .td-feed-card-standard .td-fc-icon.td-bg-gray {
            background: #2D3748;
            color: #ffffff;
          }
          .td-feed-card-standard .td-fc-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2px;
          }
          .td-feed-card-standard .td-fc-title-row h3 {
            font-size: 15.5px;
            font-weight: 800;
            color: #1E293B;
            line-height: 1.3;
            margin: 0;
          }
          .td-feed-card-standard .td-bookmark-btn {
            top: 20px;
            right: 18px;
            background: transparent;
            border: none;
            color: #94A3B8;
            font-size: 18px;
            padding: 0;
            margin-left: 8px;
            cursor: pointer;
            width: auto;
            height: auto;
          }
          .td-feed-card-standard .td-bookmark-btn--saved {
            color: #15803D;
          }
          .td-feed-card-standard .td-fc-school {
            font-size: 12.5px;
            color: #64748B;
            font-weight: 500;
            margin: 0;
          }
          .td-feed-card-standard .td-fc-meta {
            gap: 8px;
          }
          .td-feed-card-standard .td-fc-meta-item {
            padding: 5px 8px;
            font-size: 10px;
            gap: 4px;
          }
          .td-feed-card-standard .td-fc-meta-tag {
            margin-left: auto;
            background: #DCFCE7;
            color: #15803D;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 6px;
            letter-spacing: 0.5px;
          }
          .td-feed-card-standard .td-fc-footer {
            margin-left: 0;
            margin-top: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: nowrap;
          }
          .td-feed-card-standard .td-fc-salary {
            font-size: 17px;
            font-weight: 800;
            color: #15803D;
          }
          .td-feed-card-standard .td-fc-salary span {
            font-size: 11.5px;
            color: #64748B;
            font-weight: 500;
          }
          .td-feed-card-standard .td-fc-action {
            background: #15803D;
            color: #ffffff;
            border: none;
            padding: 9px 20px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 12.5px;
            cursor: pointer;
            font-family: inherit;
          }

          /* Hot Card on Mobile */
          .td-feed-card-hot {
            background: linear-gradient(135deg, #15803D 0%, #0F3E14 100%);
            color: white;
            border-radius: 24px;
            padding: 22px 18px;
            border: none;
            box-shadow: 0 10px 25px rgba(21, 128, 61, 0.25);
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
            margin: 0 0 2px;
            font-weight: 800;
            line-height: 1.3;
          }
          .td-hot-school {
            color: rgba(255,255,255,0.8);
            font-size: 12.5px;
            font-weight: 500;
            margin: 0;
          }
          .td-feed-card-hot .td-dot { color: rgba(255,255,255,0.4); }
          .td-hot-salary-range {
            font-size: 9.5px;
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
            color: #15803D;
            border: none;
            padding: 9px 22px;
            border-radius: 50px;
            font-weight: 800;
            font-size: 12.5px;
            cursor: pointer;
            font-family: inherit;
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

          /* Profile card: retain the desktop presentation on mobile */
          .td-mobile-profile-strength { display: none; }
          .td-desktop-profile-strength {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 18px;
          }
          .td-card-header {
            display: flex;
            margin-bottom: 18px;
          }

          /* Main wrapper */
          .td-main-wrapper { overflow: visible; }

          /* Content padding */
          .td-content { padding: 64px 20px 24px; }

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
            border-radius: 24px;
            padding: 22px 20px;
            background: #ffffff;
            border: 1px solid #edf1f3;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.03);
          }
          .td-profile-card .td-complete-profile-btn {
            width: 100%;
            min-width: 0;
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
            border-radius: 20px;
            padding: 20px 18px;
            background: #ffffff;
            border: 1px solid #e6ebee;
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
          }
          .td-mini-card--views::before,
          .td-mini-card--applied::before,
          .td-mini-card--pending::before {
            display: block;
          }
          .td-mini-icon-circle {
            width: 40px;
            height: 40px;
            background: #ecfdf5;
            box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.08);
            margin-bottom: 20px;
            color: #15803d;
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
           EXTRA SMALL SCREENS ≤ 360px
        ═══════════════════════════════════════ */
        @media (max-width: 360px) {
          /* Content spacing */
          .td-content { padding: 64px 16px 20px; }

          /* Hero Section */
          .td-jobs-hero { margin-bottom: 18px; }
          .td-jobs-hero h1 { font-size: 26px; font-weight: 800; margin-bottom: 14px; }
          .td-jobs-hero-top { flex-direction: column-reverse; gap: 14px; }

          /* Saved Jobs Button */
          .td-saved-jobs-btn {
            width: 100%;
            justify-content: center;
            padding: 8px 14px;
            font-size: 12px;
          }

          /* Search Bar Mobile */
          .td-search-box-mobile {
            padding: 11px 16px;
            margin-bottom: 12px;
            border-radius: 40px;
          }
          .td-search-box-mobile input {
            margin-left: 8px;
            font-size: 13px;
          }

          /* Filter Chips */
          .td-mobile-filter-chips {
            gap: 8px;
            margin-bottom: 14px;
          }
          .td-filter-chip {
            padding: 7px 14px;
            font-size: 12px;
          }

          /* Job Cards */
          .td-feed-card-standard {
            padding: 16px 14px;
            border-radius: 20px;
            gap: 10px;
            margin-bottom: 12px;
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
          }

          /* Card Header */
          .td-feed-card-standard .td-fc-header {
            gap: 10px;
            padding-right: 34px;
          }
          .td-feed-card-standard .td-fc-icon-wrapper {
            width: 44px;
            height: 44px;
            min-width: 44px;
          }
          .td-feed-card-standard .td-fc-icon {
            width: 28px;
            height: 28px;
          }

          /* Title Row */
          .td-feed-card-standard .td-fc-title-row {
            gap: 6px;
          }
          .td-feed-card-standard .td-fc-title-row h3 {
            font-size: 14px;
            line-height: 1.3;
          }
          .td-feed-card-standard .td-bookmark-btn {
            top: 16px;
            right: 14px;
            margin-left: 0;
            min-width: 24px;
          }

          /* School Info */
          .td-feed-card-standard .td-fc-school {
            font-size: 12px;
            margin-bottom: 4px;
          }

          /* Meta Info */
          .td-feed-card-standard .td-fc-meta {
            gap: 10px;
            flex: 1;
            margin-bottom: 0;
          }
          .td-feed-card-standard .td-fc-meta-item {
            font-size: 11px;
            gap: 4px;
          }

          /* Salary & Footer */
          .td-feed-card-standard .td-fc-footer {
            gap: 8px;
            flex-wrap: wrap !important;
          }
          .td-feed-card-standard .td-fc-salary {
            font-size: 15px;
            flex-basis: auto;
          }
          .td-feed-card-standard .td-fc-salary span {
            font-size: 10px;
          }
          .td-feed-card-standard .td-fc-action {
            padding: 8px 16px;
            font-size: 12px;
            min-width: 100px;
          }

          /* Hot Card */
          .td-feed-card-hot {
            padding: 18px 16px;
            gap: 6px;
          }
          .td-hot-title {
            font-size: 16px;
            margin-bottom: 2px;
          }
          .td-hot-school {
            font-size: 12px;
          }
          .td-hot-footer {
            flex-wrap: wrap;
            gap: 10px;
          }
          .td-hot-salary-value {
            font-size: 16px;
          }
          .td-hot-action {
            padding: 8px 18px;
            font-size: 12px;
            flex-grow: 1;
          }

          /* Mobile showing info */
          .td-mobile-showing {
            flex-wrap: wrap;
            gap: 10px;
          }
          .td-mobile-rec-info h3 {
            font-size: 15px;
          }

          /* Load More Button */
          .td-load-more-btn {
            padding: 10px 20px;
            font-size: 12px;
          }

          /* Bottom Nav */
          .td-mobile-bottomnav {
            bottom: 10px;
            left: 10px;
            right: 10px;
            padding: 6px 0;
          }
          .td-bottomnav-tab {
            padding: 4px 8px;
            gap: 2px;
          }
          .td-bottomnav-label {
            font-size: 8px;
          }
        }

        /* ═══════════════════════════════════════
           JOB DETAILS PAGE
        ═══════════════════════════════════════ */
        .td-job-details-page {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          color: #1f2a33;
          padding: 24px 0 48px;
        }

        .td-jd-back-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          color: #71808a;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .td-jd-back-nav button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #617078;
          font: inherit;
          cursor: pointer;
        }
        .td-jd-back-nav strong {
          color: #56646d;
          font-weight: 600;
        }

        .td-jd-profile-incomplete {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 14px;
          padding: 12px 14px;
          border: 1px solid #f2c8bd;
          border-radius: 10px;
          background: #fff8f5;
          color: #a8432d;
        }
        .td-jd-profile-incomplete > svg { flex: 0 0 auto; }
        .td-jd-profile-incomplete p {
          flex: 1;
          margin: 0;
          color: #92412f;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
        }
        .td-jd-profile-incomplete button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 34px;
          padding: 0 12px;
          border: 0;
          border-radius: 7px;
          background: #147a45;
          color: #fff;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .td-jd-profile-incomplete button:hover { background: #116438; }

        .td-jd-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px 18px 14px;
          border: 1px solid #e1e5e0;
          border-radius: 10px;
          background: #fff;
        }
        .td-jd-hero-main {
          flex: 1;
          min-width: 0;
        }
        .td-jd-hero h2 {
          margin: 0 0 12px;
          color: #1d2433;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .td-jd-meta-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .td-jd-meta-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin: 0;
          color: #5b6774;
          font-size: 12px;
          font-weight: 600;
        }
        .td-jd-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: #4d5966;
          padding: 0;
          border: 0;
          border-radius: 0;
        }
        .td-jd-meta-item svg {
          color: #596673;
        }
        .td-jd-meta-item--money {
          color: #1f2a33;
          font-weight: 700;
        }
        .td-jd-applied-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 26px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #edf9f1;
          border: 1px solid #d7eedb;
          color: #1d6b3a;
          font-size: 11px;
          font-weight: 700;
        }
        .td-jd-salary-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 26px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f4f7f5;
          border: 1px solid #e2e8e6;
          color: #1f2a33;
          font-size: 11px;
          font-weight: 700;
        }
        .td-jd-status {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 0 10px;
          border-radius: 999px;
          background: #dff3e5;
          color: #247544;
          font-size: 10px;
          font-weight: 700;
          text-transform: capitalize;
        }
        .td-jd-action-panel {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-width: 120px;
        }
        .td-jd-primary-btn {
          min-height: 36px;
          padding: 0 18px;
          border-radius: 999px;
          background: #1ecb5a;
          border: 1px solid #1ecb5a;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 10px 18px rgba(30, 203, 90, 0.18);
          cursor: pointer;
        }

        .td-jd-body {
          min-height: 420px;
          margin-top: 18px;
          padding: 22px 18px 4px;
          border: 1px solid #e1e5e0;
          border-radius: 10px;
          background: #fff;
        }
        .td-jd-section {
          padding: 0 0 18px;
        }
        .td-jd-section:last-child { padding-bottom: 0; }
        .td-jd-section h3 {
          margin: 0 0 12px;
          padding-left: 10px;
          border-left: 3px solid #1c8a47;
          color: #1f2a33;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.4;
        }
        .td-jd-section p,
        .td-jd-section li {
          color: #4c5865;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 500;
        }
        .td-jd-section p {
          max-width: 760px;
          margin: 0;
        }
        .td-jd-check-list,
        .td-jd-bullets {
          margin: 0;
          padding-left: 0;
          list-style: none;
        }
        .td-jd-check-list li,
        .td-jd-bullets li {
          position: relative;
          margin-bottom: 8px;
        }
        .td-jd-check-list li {
          padding-left: 22px;
        }
        .td-jd-check-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #1c8a47;
          font-weight: 700;
        }
        .td-jd-bullets {
          padding-left: 18px;
        }
        .td-jd-bullets li::marker {
          color: #1c8a47;
        }

        @media (max-width: 680px) {
          .td-jd-profile-incomplete { align-items: flex-start; flex-wrap: wrap; }
          .td-jd-profile-incomplete p { flex-basis: calc(100% - 32px); }
          .td-jd-profile-incomplete button { margin-left: 28px; }
          .td-jd-hero {
            flex-direction: column;
            align-items: flex-start;
            padding: 18px 14px 12px;
          }
          .td-jd-action-panel {
            width: 100%;
            justify-content: flex-start;
          }
          .td-jd-primary-btn {
            width: 100%;
          }
          .td-jd-body {
            padding: 16px 14px 4px;
          }
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

        .td-review-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.38);
        }

        .td-review-modal {
          width: min(620px, 100%);
          max-height: calc(100vh - 32px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #D9E1DC;
          border-radius: 14px;
          background: #FFFFFF;
          box-shadow: 0 20px 56px rgba(15, 23, 42, 0.22);
        }

        .td-review-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 14px 20px 12px;
          border-bottom: 1px solid #E5E7EB;
        }

        .td-review-modal-header h2 {
          color: #172033;
          font-size: 22px;
          font-weight: 800;
        }

        .td-review-modal-header p {
          margin-top: 4px;
          color: #64748B;
          font-size: 12px;
        }

        .td-review-modal-close {
          border: 0;
          padding: 0;
          color: #475569;
          background: transparent;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
        }

        .td-review-modal-body {
          min-height: 0;
          max-height: none;
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
        }

        .td-review-applicant-card {
          padding: 11px 14px;
          border: 1px solid #CBD8D0;
          border-radius: 7px;
          background: #F4F3F3;
        }

        .td-review-applicant-card h3,
        .td-review-section-heading h3 {
          color: #27364A;
          font-size: 12px;
          font-weight: 800;
        }

        .td-review-applicant-content {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }

        .td-review-avatar {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          border-radius: 50%;
          color: #FFFFFF;
          background: #64748B;
          font-size: 15px;
          font-weight: 800;
        }

        .td-review-applicant-content strong {
          color: #172033;
          font-size: 16px;
        }

        .td-review-applicant-content p {
          margin-top: 2px;
          color: #64748B;
          font-size: 12px;
        }

        .td-review-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .td-review-pills span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 7px;
          border-radius: 4px;
          color: #475569;
          background: #E7EEF0;
          font-size: 10px;
        }

        .td-review-pills span:last-child {
          color: #166534;
          background: #D9F2E1;
        }

        .td-review-section {
          margin-top: 13px;
        }

        .td-review-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
        }

        .td-review-section-heading span {
          color: #166534;
          font-size: 10px;
          font-weight: 600;
        }

        .td-review-section-heading button {
          border: 0;
          padding: 0;
          color: #166534;
          background: transparent;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-review-document-row {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 62px;
          padding: 10px 14px;
          border: 1px solid #CBD8D0;
          border-radius: 7px;
        }

        .td-review-document-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 4px;
          color: #DC2626;
          background: #FEE2E2;
        }

        .td-review-document-copy {
          display: grid;
          gap: 3px;
          min-width: 0;
          flex: 1;
        }

        .td-review-document-copy strong,
        .td-review-document-copy span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .td-review-document-copy strong {
          color: #334155;
          font-size: 13px;
        }

        .td-review-document-copy span {
          color: #64748B;
          font-size: 11px;
        }

        .td-review-document-action {
          display: grid;
          place-items: center;
          border: 0;
          padding: 5px;
          flex-shrink: 0;
          color: #64748B;
          background: transparent;
          cursor: pointer;
        }

        .td-review-document-action:hover {
          color: #166534;
        }

        .td-review-document-preview {
          margin-top: 12px;
          overflow: hidden;
          border: 1px solid #CBD8D0;
          border-radius: 8px;
          background: #F8FAFC;
        }

        .td-review-document-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 12px;
          border-bottom: 1px solid #E2E8F0;
          background: #FFFFFF;
        }

        .td-review-document-preview-header strong {
          color: #334155;
          font-size: 12px;
        }

        .td-review-document-preview-header > div {
          display: flex;
          gap: 12px;
        }

        .td-review-document-preview-header button {
          border: 0;
          padding: 0;
          color: #166534;
          background: transparent;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-review-pdf-preview {
          display: block;
          width: 100%;
          height: min(65vh, 680px);
          border: 0;
          background: #FFFFFF;
        }

        .td-review-upload-field {
          position: relative;
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 62px;
          padding: 10px 14px;
          border: 1px dashed #94A3B8;
          border-radius: 7px;
          color: #166534;
          background: #F8FAFC;
          font-size: 12px;
          cursor: pointer;
        }

        .td-review-upload-field input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          opacity: 0;
        }

        .td-review-existing-letter {
          max-height: 100px;
          overflow-y: auto;
          padding: 12px 13px;
          border: 1px solid #CBD8D0;
          border-radius: 7px;
          color: #475569;
          background: #F8FAFC;
          font-size: 12px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .td-review-letter-field {
          display: grid;
          gap: 7px;
          width: 100%;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
        }

        .td-review-letter-field textarea {
          display: block;
          width: 100%;
          min-height: 132px;
          padding: 12px 13px;
          border: 1px solid #CBD8D0;
          border-radius: 8px;
          outline: none;
          color: #334155;
          background: #FFFFFF;
          font: inherit;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.55;
          resize: vertical;
        }

        .td-review-letter-field textarea::placeholder {
          color: #94A3B8;
        }

        .td-review-letter-field textarea:focus {
          border-color: #16A34A;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }

        .td-cover-letter-counter {
          color: #b42318;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.4;
        }

        .td-cover-letter-counter.is-valid {
          color: #166534;
        }

        .td-review-letter-editor {
          position: relative;
          width: 100%;
        }

        .td-review-letter-editor textarea {
          padding-right: 48px;
        }

        .td-review-letter-confirm {
          position: absolute;
          right: 10px;
          bottom: 10px;
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          color: #FFFFFF;
          background: #15803D;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .td-review-letter-confirm:hover {
          background: #166534;
          transform: scale(1.05);
        }

        .td-review-cover-letter {
          display: block;
          width: 100%;
          min-height: 82px;
          resize: vertical;
          padding: 11px 13px;
          border: 1px solid #CBD8D0;
          border-radius: 7px;
          outline: none;
          color: #334155;
          background: #FFFFFF;
          font: inherit;
          font-size: 12px;
        }

        .td-review-cover-letter:focus {
          border-color: #16A34A;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }

        .td-review-error {
          margin-top: 14px;
          color: #B91C1C;
          font-size: 12px;
        }

        .td-review-consent {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #E5E7EB;
          color: #475569;
          font-size: 12px;
          line-height: 1.45;
          cursor: pointer;
        }

        .td-review-consent input {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          accent-color: #15803D;
        }

        .td-review-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 12px 20px;
          border-top: 1px solid #E5E7EB;
          background: #F7F9FC;
        }

        .td-review-back-btn,
        .td-review-submit-btn {
          min-width: 110px;
          padding: 11px 22px;
          border-radius: 24px;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-review-back-btn {
          color: #334155;
          background: #FFFFFF;
          border: 1px solid #94A3B8;
        }

        .td-review-submit-btn {
          color: #FFFFFF;
          background: #15803D;
          border: 1px solid #15803D;
        }

        .td-review-submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .td-application-success-overlay {
          position: fixed;
          inset: 0;
          z-index: 1150;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.42);
        }

        .td-application-success-modal {
          position: relative;
          width: min(505px, 100%);
          padding: 28px 30px 25px;
          border-radius: 14px;
          background: #FFFFFF;
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.25);
          text-align: center;
        }

        .td-application-success-close {
          position: absolute;
          top: 16px;
          right: 18px;
          border: 0;
          padding: 0;
          color: #64748B;
          background: transparent;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }

        .td-application-success-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          margin: 0 auto 14px;
          border-radius: 50%;
          color: #FFFFFF;
          background: #15803D;
        }

        .td-application-success-modal h2 {
          color: #172033;
          font-size: 20px;
          font-weight: 800;
        }

        .td-application-success-modal > p {
          max-width: 330px;
          margin: 8px auto 24px;
          color: #64748B;
          font-size: 12px;
          line-height: 1.45;
        }

        .td-application-success-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border-radius: 16px;
          background: #F1F3F4;
          text-align: left;
        }

        .td-application-success-logo {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 50%;
          color: #F59E0B;
          background: #172033;
        }

        .td-application-success-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .td-application-success-summary > div:last-child {
          display: grid;
          gap: 3px;
          min-width: 0;
        }

        .td-application-success-summary span {
          width: fit-content;
          padding: 3px 7px;
          border-radius: 8px;
          color: #166534;
          background: #D9F2D2;
          font-size: 9px;
          font-weight: 800;
        }

        .td-application-success-summary strong {
          overflow: hidden;
          color: #172033;
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .td-application-success-summary p {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748B;
          font-size: 10px;
        }

        .td-application-success-summary p i {
          font-style: normal;
          color: #94A3B8;
        }

        .td-application-success-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 28px;
        }

        .td-application-success-note,
        .td-application-success-status {
          min-height: 35px;
          border: 0;
          border-radius: 20px;
          padding: 8px 12px;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-application-success-note {
          color: #000000;
          background: #2AE156;
        }

        .td-application-success-status {
          color: #475569;
          background: #E2E4E7;
        }

        .td-application-success-more {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 22px;
          border: 0;
          padding: 0;
          color: #15803D;
          background: transparent;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .td-review-modal-overlay {
            padding: 12px;
          }

          .td-review-modal-header,
          .td-review-modal-body,
          .td-review-modal-footer {
            padding-left: 18px;
            padding-right: 18px;
          }

          .td-review-modal-footer {
            justify-content: stretch;
          }

          .td-review-back-btn,
          .td-review-submit-btn {
            flex: 1;
            min-width: 0;
          }

          .td-application-success-modal {
            padding: 24px 18px 22px;
          }

          .td-application-success-actions {
            grid-template-columns: 1fr;
          }
        }

        .td-phone-verify-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.43);
        }

        .td-phone-verify-modal {
          position: relative;
          width: min(486px, 100%);
          padding: 26px 26px 20px;
          border-radius: 8px;
          background: #FFFFFF;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.24);
          text-align: center;
        }

        .td-phone-verify-close {
          position: absolute;
          top: -42px;
          right: -42px;
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border: 3px solid #111827;
          border-radius: 50%;
          color: #111827;
          background: transparent;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .td-phone-verify-close span {
          margin-top: -2px;
        }

        .td-phone-verify-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          margin: 0 auto 17px;
          border-radius: 50%;
          color: #064E3B;
          background: #E6F0FF;
        }

        .td-phone-verify-modal h2 {
          color: #0F172A;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.18;
        }

        .td-phone-verify-description {
          margin-top: 8px;
          color: #64748B;
          font-size: 11px;
        }

        .td-phone-verify-number {
          display: inline-block;
          margin-top: 9px;
          padding: 3px 11px;
          border-radius: 12px;
          color: #1E293B;
          background: #EEF4FF;
          font-size: 10px;
          font-weight: 700;
        }

        .td-phone-verify-code {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
        }

        .td-phone-verify-code input {
          width: 37px;
          height: 37px;
          border: 1px solid #D9DEE6;
          border-radius: 5px;
          outline: none;
          color: #0F172A;
          background: #FFFFFF;
          font: inherit;
          font-size: 17px;
          font-weight: 700;
          text-align: center;
        }

        .td-phone-verify-code input:focus {
          border-color: #134E4A;
          box-shadow: 0 0 0 2px rgba(19, 78, 74, 0.1);
        }

        .td-phone-verify-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: min(275px, 100%);
          min-height: 35px;
          border: 1px solid #2AE156;
          border-radius: 20px;
          color: #000000;
          background: #2AE156;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-phone-verify-submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .td-phone-verify-divider {
          height: 1px;
          margin: 20px 0 10px;
          background: #F1F5F9;
        }

        .td-phone-verify-resend {
          color: #64748B;
          font-size: 11px;
        }

        .td-phone-verify-resend button,
        .td-phone-verify-change {
          border: 0;
          padding: 0;
          color: #0F172A;
          background: transparent;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .td-phone-verify-change {
          margin-top: 12px;
          color: #64748B;
          font-weight: 500;
        }

        .td-email-verify-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.43);
        }

        .td-email-verify-modal {
          position: relative;
          width: min(486px, 100%);
          padding: 26px 26px 20px;
          border-radius: 8px;
          background: #FFFFFF;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.24);
          text-align: center;
        }

        .td-email-verify-close {
          position: absolute;
          top: -42px;
          right: -42px;
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border: 3px solid #111827;
          border-radius: 50%;
          color: #111827;
          background: transparent;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .td-email-verify-close span {
          margin-top: -2px;
        }

        .td-email-verify-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          margin: 0 auto 17px;
          border-radius: 50%;
          color: #064E3B;
          background: #E6F0FF;
        }

        .td-email-verify-modal h2 {
          color: #0F172A;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.18;
        }

        .td-email-verify-description {
          max-width: 240px;
          margin: 8px auto 0;
          color: #64748B;
          font-size: 11px;
          line-height: 1.45;
        }

        .td-email-verify-address {
          display: inline-block;
          margin-top: 9px;
          padding: 3px 11px;
          border-radius: 12px;
          color: #1E293B;
          background: #EEF4FF;
          font-size: 10px;
          font-weight: 700;
        }

        .td-email-verify-code {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
        }

        .td-email-verify-code input {
          width: 37px;
          height: 37px;
          border: 1px solid #D9DEE6;
          border-radius: 5px;
          outline: none;
          color: #0F172A;
          background: #FFFFFF;
          font: inherit;
          font-size: 17px;
          font-weight: 700;
          text-align: center;
        }

        .td-email-verify-code input:focus {
          border-color: #134E4A;
          box-shadow: 0 0 0 2px rgba(19, 78, 74, 0.1);
        }

        .td-email-verify-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: min(275px, 100%);
          min-height: 35px;
          border: 1px solid #2AE156;
          border-radius: 20px;
          color: #000000;
          background: #2AE156;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-email-verify-submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .td-email-verify-divider {
          height: 1px;
          margin: 20px 0 10px;
          background: #F1F5F9;
        }

        .td-email-verify-resend {
          color: #64748B;
          font-size: 11px;
        }

        .td-email-verify-resend button,
        .td-email-verify-change {
          border: 0;
          padding: 0;
          color: #0F172A;
          background: transparent;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .td-email-verify-change {
          margin-top: 12px;
          color: #64748B;
          font-weight: 500;
        }

        .td-phone-success-snackbar {
          position: fixed;
          top: 84px;
          left: 50%;
          z-index: 1200;
          display: grid;
          grid-template-columns: 24px minmax(0, 1fr) 18px;
          column-gap: 10px;
          align-items: start;
          width: min(270px, calc(100vw - 32px));
          min-height: 123px;
          padding: 12px 10px 10px 12px;
          border: 1px solid #D9DEE6;
          border-radius: 9px;
          background: #FFFFFF;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
          transform: translateX(-50%);
        }

        .td-phone-success-icon {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #FFFFFF;
          background: #15803D;
        }

        .td-phone-success-copy {
          display: grid;
          min-width: 0;
          align-content: start;
          gap: 7px;
          padding-top: 1px;
          color: #111827;
          font-size: 10.5px;
          line-height: 1.35;
        }

        .td-phone-success-copy strong {
          font-size: 10.5px;
          font-weight: 800;
          line-height: 1.25;
        }

        .td-phone-success-copy span {
          color: #1F2937;
          line-height: 1.35;
        }

        .td-phone-success-snackbar > button:not(.td-phone-success-ok) {
          justify-self: end;
          border: 0;
          padding: 0;
          color: #111827;
          background: transparent;
          font-size: 19px;
          line-height: 18px;
          cursor: pointer;
        }

        .td-phone-success-ok {
          grid-column: 2 / 4;
          justify-self: end;
          min-width: 75px;
          margin-top: 8px;
          padding: 8px 19px;
          border: 0;
          border-radius: 20px;
          color: #000000;
          background: #2AE156;
          font: inherit;
          font-size: 10.5px;
          font-weight: 500;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .td-phone-verify-modal {
            padding: 24px 16px 18px;
          }

          .td-email-verify-modal {
            padding: 24px 16px 18px;
          }

          .td-phone-verify-close {
            top: -38px;
            right: 0;
          }

          .td-email-verify-close {
            top: -38px;
            right: 0;
          }

          .td-phone-verify-code,
          .td-email-verify-code {
            gap: 8px;
          }
        }

        .td-modal-content {
          width: min(406px, 100%);
          overflow: hidden;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.28);
        }
        .td-edu-modal-content {
          width: min(690px, 100%);
          max-height: min(728px, calc(100vh - 32px));
          display: flex;
          flex-direction: column;
          border-radius: 16px;
        }
        .td-edu-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 25px 30px 12px;
        }
        .td-edu-modal-header h2 {
          margin: 0 0 4px;
          color: #1e293b;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -.3px;
        }
        .td-edu-modal-header p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
        }
        .td-edu-modal-close {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          margin: -2px -5px 0 0;
          border-radius: 6px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
        }
        .td-edu-modal-close:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .td-edu-modal-body {
          min-height: 0;
          padding: 13px 30px 10px;
          overflow-y: auto;
        }
        .td-edu-form-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 16px;
        }
        .td-edu-form-field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 5px;
          color: #1e293b;
          font-size: 11px;
          font-weight: 650;
        }
        .td-edu-form-field--full {
          grid-column: 1 / -1;
        }
        .td-edu-form-field > span:not(.td-edu-form-label) {
          line-height: 1.25;
        }
        .td-edu-form-field b {
          color: #ef4444;
          font-weight: 700;
        }
        .td-edu-form-field em {
          color: #64748b;
          font-style: normal;
          font-weight: 400;
        }
        .td-edu-form-field .td-pers-input,
        .td-edu-date-fields select {
          width: 100%;
          min-width: 0;
          height: 44px;
          padding: 0 13px;
          border: 1px solid #dce4ed;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #475569;
          font: inherit;
          font-size: 12px;
          font-weight: 400;
          box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
        }
        .td-edu-form-field .td-pers-input:focus,
        .td-edu-date-fields select:focus {
          border-color: #86efac;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, .1);
        }
        .td-edu-form-field .td-pers-input::placeholder {
          color: #64748b;
          opacity: 1;
        }
        .td-edu-form-field > small {
          min-height: 13px;
          color: #64748b;
          font-size: 9px;
          font-weight: 400;
          line-height: 1.35;
        }
        .td-edu-form-label {
          line-height: 1.25;
        }
        .td-edu-date-fields {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 8px;
        }
        .td-edu-date-fields select {
          height: 39px;
          padding: 0 10px;
        }
        .td-edu-date-fields select:disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }
        .td-edu-currently-studying {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
          color: #64748b;
          font-size: 10px;
          font-weight: 400;
          cursor: pointer;
        }
        .td-edu-currently-studying input {
          width: 15px;
          height: 15px;
          margin: 0;
          accent-color: #16a34a;
        }
        .td-edu-document-input {
          display: none;
        }
        .td-edu-document-upload {
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          min-height: 76px;
          padding: 12px 16px;
          border: 1px dashed #86efac;
          border-radius: 10px;
          background: #fff;
          color: #64748b;
          text-align: left;
          cursor: pointer;
        }
        .td-edu-document-upload:hover {
          background: #f7fef9;
          border-color: #22c55e;
        }
        .td-edu-upload-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border-radius: 9px;
          background: #ecfdf5;
          color: #059669;
        }
        .td-edu-document-upload > span:last-child {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 3px;
        }
        .td-edu-document-upload strong {
          overflow: hidden;
          color: #64748b;
          font-size: 10px;
          font-weight: 500;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .td-edu-document-upload small {
          color: #64748b;
          font-size: 9px;
          font-weight: 400;
        }
        .td-edu-document-error {
          color: #b42318;
          font-size: 10px;
        }
        .td-edu-modal-notice {
          margin: 11px 0 0;
          padding: 8px 10px;
          border-radius: 6px;
          background: #f8fafc;
          color: #64748b;
          font-size: 9px;
          line-height: 1.4;
        }
        .td-edu-modal-body .td-exp-modal-error {
          margin: 10px 0 0;
          color: #b42318;
          font-size: 10px;
        }
        .td-edu-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 12px 30px 20px;
        }
        .td-edu-modal-footer button {
          min-height: 39px;
          padding: 0 18px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #fff;
          color: #1e293b;
          font: inherit;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }
        .td-edu-modal-footer .td-edu-modal-save {
          border-color: #20d653;
          background: #20d653;
          color: #064e24;
        }
        .td-edu-modal-footer .td-edu-modal-save:hover {
          border-color: #16c34a;
          background: #16c34a;
        }
        .td-edu-modal-footer button:disabled {
          cursor: wait;
          opacity: .7;
        }
        .td-edu-next-step-overlay { z-index: 1010; }
        .td-edu-next-step-modal {
          position: relative;
          width: min(440px, 100%);
          padding: 30px;
          border: 1px solid #e2e8e4;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 20px 56px rgba(15, 23, 42, 0.22);
          text-align: center;
        }
        .td-edu-next-step-close {
          position: absolute;
          top: 12px;
          right: 12px;
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }
        .td-edu-next-step-close:hover { background: #f1f5f9; color: #1e293b; }
        .td-edu-next-step-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: #e8f7ee;
          color: #15803d;
        }
        .td-edu-next-step-modal h2 { margin: 0 0 8px; color: #172033; font-size: 20px; font-weight: 750; }
        .td-edu-next-step-modal p { margin: 0 auto 22px; max-width: 360px; color: #64748b; font-size: 14px; line-height: 1.5; }
        .td-edu-next-step-actions { display: flex; justify-content: center; gap: 10px; }
        .td-edu-next-step-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 42px;
          padding: 0 16px;
          border: 1px solid transparent;
          border-radius: 8px;
          font: inherit;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
        }
        .td-edu-next-step-secondary { background: #f8fafc; border-color: #dbe2e8 !important; color: #334155; }
        .td-edu-next-step-secondary:hover { background: #f1f5f9; }
        .td-edu-next-step-primary { background: #15803d; color: #fff; }
        .td-edu-next-step-primary:hover { background: #166534; }
        @media (max-width: 540px) {
          .td-edu-next-step-modal { padding: 28px 20px 20px; }
          .td-edu-next-step-actions { flex-direction: column; }
          .td-edu-next-step-actions button { width: 100%; }
        }
        .td-exp-modal-content { max-height: calc(100vh - 32px); overflow-y: auto; }
        .td-exp-modal-content .td-modal-header {
          align-items: center;
          margin: 0;
          padding: 20px 22px 16px;
          border-bottom: 1px solid #edf1f4;
        }
        .td-exp-modal-content .td-modal-header h2 { margin: 0; color: #1e293b; font-size: 18px; font-weight: 700; }
        .td-exp-modal-content .td-modal-close { display: grid; place-items: center; width: 30px; height: 30px; padding: 0; border-radius: 50%; color: #64748b; font-size: 18px; }
        .td-exp-modal-content .td-modal-close:hover { background: #f1f5f9; color: #1e293b; }
        .td-exp-modal-content .td-modal-body { padding: 20px 22px 4px; }
        .td-exp-modal-content .td-pers-field-group { margin-bottom: 17px !important; }
        .td-exp-modal-content .td-pers-label { color: #475569; font-size: 11px; font-weight: 700; }
        .td-exp-modal-content .td-pers-input, .td-exp-modal-content .td-prof-textarea { width: 100%; border: 1px solid #d9e0e7; border-radius: 7px; background: #fff; color: #1e293b; font: inherit; font-size: 12px; outline: none; }
        .td-exp-modal-content .td-pers-input { min-height: 40px; }
        .td-exp-modal-content .td-exp-period-grid { margin-bottom: 17px !important; }
        .td-exp-modal-content input[type='month'] { padding-right: 8px; }
        .td-exp-modal-error { margin: -6px 22px 12px; color: #b42318; font-size: 11px; font-weight: 600; }
        .td-exp-modal-content .td-prof-textarea { min-height: 88px; padding: 10px 12px; line-height: 1.5; resize: vertical; }
        .td-exp-modal-content .td-pers-input:focus, .td-exp-modal-content .td-prof-textarea:focus { border-color: #15946e; box-shadow: 0 0 0 3px rgba(21, 148, 110, .12); }
        .td-exp-modal-content .td-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 0; padding: 16px 22px 20px; border-top: 1px solid #edf1f4; background: #fbfcfd; }
        .td-exp-modal-content .td-pers-cancel-btn, .td-exp-modal-content .td-pers-save-btn { min-height: 38px; padding: 0 17px; border-radius: 7px; font-size: 12px; }
        .td-exp-modal-content .td-pers-save-btn { background: #0d7c57; }
        .td-exp-modal-content .td-pers-save-btn:hover { background: #096846; }
        .td-exp-modal-content .td-pers-save-btn:disabled { cursor: wait; opacity: .7; }
        @media (max-width: 480px) {
          .td-modal-overlay { padding: 16px; }
          .td-edu-panel .td-edu-card {
            grid-template-columns: 36px minmax(0, 1fr) auto;
            gap: 9px;
            padding: 10px;
          }
          .td-edu-card-icon {
            width: 36px;
            height: 36px;
          }
          .td-edu-card-actions {
            gap: 4px;
          }
          .td-edu-panel > .td-edu-certification-record {
            display: grid;
            grid-template-columns: 43px minmax(0, 1fr) auto;
            gap: 10px;
            padding: 10px;
          }
          .td-edu-certification-icon {
            grid-column: 1;
            grid-row: 1;
          }
          .td-edu-certification-details {
            grid-column: 2 / 4;
            grid-row: 1;
          }
          .td-edu-certification-status {
            grid-column: 2;
            grid-row: 2;
            justify-self: start;
          }
          .td-edu-certification-actions {
            grid-column: 3;
            grid-row: 2;
          }
          .td-edu-modal-content { max-height: calc(100vh - 24px); }
          .td-edu-modal-header { padding: 20px 18px 10px; }
          .td-edu-modal-body { padding: 12px 18px 8px; }
          .td-edu-form-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
          .td-edu-form-field--full { grid-column: auto; }
          .td-edu-modal-footer { padding: 10px 18px 16px; }
          .td-edu-modal-footer button { flex: 1; }
          .td-certification-modal { max-height: calc(100vh - 24px); }
          .td-certification-modal-header { padding: 20px 18px 14px; }
          .td-certification-modal-body { padding: 14px 18px 10px; }
          .td-certification-form-grid { grid-template-columns: minmax(0, 1fr); gap: 13px; }
          .td-certification-field--full { grid-column: auto; }
          .td-certification-modal-footer { padding: 12px 18px 16px; }
          .td-certification-modal-footer button { flex: 1; }
          .td-exp-modal-content .td-modal-header { padding: 18px 18px 14px; }
          .td-exp-modal-content .td-modal-body { padding: 18px 18px 2px; }
          .td-exp-modal-content .td-modal-footer { padding: 14px 18px 18px; }
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
          max-width: 100%;
          margin: 0 auto;
          width: 100%;
        }

        .td-notif-back {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #111;
          font-size: 11px;
          margin-bottom: 28px;
          cursor: pointer;
        }

        .td-notif-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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

        .td-notif-header-actions {
          display: flex;
          align-items: center;
          gap: 28px;
          padding-top: 8px;
        }

        .td-notif-unread-summary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #277a5f;
          font-size: 11px;
          white-space: nowrap;
        }

        .td-notif-unread-summary span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #277a5f;
        }

        .td-notif-mark-read {
          border: none;
          padding: 0;
          background: transparent;
          color: #277a5f;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
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
          gap: 0;
        }

        .td-notif-card {
          display: flex;
          gap: 18px;
          padding: 18px 12px 18px 18px;
          background: #fff;
          border: none;
          border-bottom: 1px solid #e5e9e7;
          border-radius: 0;
          box-shadow: none;
          transition: background 0.2s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .td-notif-card:hover {
          background: #fbfdfb;
          box-shadow: none;
        }
        .td-notif-card--unread {
          background: #fff;
        }
        .td-notif-card--unread::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #277A16;
          border-radius: 0;
        }
        .td-notif-card--unread:hover {
          background: #fff;
        }

        .td-notif-card-icon {
          flex-shrink: 0;
          padding-top: 0;
        }
        .td-notif-icon-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E8F9ED;
          color: #1CCB43;
          border: none;
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
          font-size: 11px;
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
          font-size: 10px;
          color: #607064;
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
          font-size: 10px;
          color: #607064;
          line-height: 1.5;
          margin: 0 0 8px;
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
          font-size: 10px;
          color: #607064;
        }
        .td-notif-link {
          font-size: 10px;
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
          padding: 24px 0 8px;
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

        .td-invitations-page { width: 100%; max-width: 1180px; margin: 0 auto; padding: 28px 18px 48px; color: #202b3d; }
        .td-invitations-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
        .td-invitations-heading h1 { margin: 4px 0 2px; color: #202124; font-size: 30px; line-height: 1.2; font-weight: 800; }
        .td-invitations-heading p { max-width: 580px; color: #6b7280; font-size: 14px; line-height: 1.5; }
        .td-invitations-eyebrow { display: inline-flex; align-items: center; gap: 6px; color: #17813b; font-size: 10px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
        .td-invitations-summary { display: grid; grid-template-columns: auto auto; align-items: center; column-gap: 8px; min-width: 180px; padding: 10px 14px; border: 1px solid #e8ebea; border-radius: 12px; background: #f0f1f0; }
        .td-invitations-summary > span { display: inline-flex; align-items: center; gap: 6px; color: #4b5563; font-size: 11px; }
        .td-invitations-summary > span svg { color: #138536; }
        .td-invitations-summary > strong { color: #138536; font-size: 15px; text-align: right; }
        .td-invitations-summary > small { grid-column: 1 / -1; margin-top: 3px; color: #6b7280; font-size: 10px; }
        .td-invitations-alert { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; padding: 12px 15px; border: 1px solid #e8ebea; border-radius: 12px; background: #f0f1f0; }
        .td-invitations-alert-icon { display: grid; place-items: center; flex: 0 0 34px; width: 34px; height: 34px; border: 1px solid #c9e8d0; border-radius: 10px; background: #fff; color: #138536; }
        .td-invitations-alert strong { display: block; color: #252a2d; font-size: 13px; font-weight: 750; }
        .td-invitations-alert p { margin-top: 2px; color: #70777b; font-size: 11px; line-height: 1.4; }
        .td-invitation-section { margin-top: 24px; }
        .td-invitation-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .td-invitation-section-heading h2 { display: flex; align-items: center; gap: 8px; color: #24292c; font-size: 16px; font-weight: 750; }
        .td-invitation-section-heading h2 span { display: grid; place-items: center; min-width: 19px; height: 19px; padding: 0 5px; border-radius: 999px; background: #138536; color: #fff; font-size: 10px; }
        .td-invitation-section-heading h2 span.is-muted { background: #e8e9e9; color: #727779; }
        .td-invitation-section-heading > small { color: #73797d; font-size: 10px; }
        .td-invitation-history-toggle { display: inline-flex; align-items: center; gap: 5px; border: 0; background: transparent; color: #62696d; font-size: 11px; cursor: pointer; }
        .td-invitation-list { display: flex; flex-direction: column; gap: 10px; }
        .td-invitation-card { padding: 15px; border: 1px solid #e9ecef; border-radius: 12px; background: #fff; box-shadow: 0 2px 8px rgba(30, 40, 35, .025); }
        .td-invitation-card-main { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .td-invitation-school-mark { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border: 1px solid #e7e9e8; border-radius: 10px; background: #f0f1f0; color: #52705c; font-size: 12px; font-weight: 800; }
        .td-invitation-card-copy { flex: 1; min-width: 0; }
        .td-invitation-school-line { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
        .td-invitation-card-copy h3 { margin: 0; overflow: hidden; color: #262a2d; font-size: 13px; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
        .td-invitation-type { display: inline-flex; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 999px; background: #f0f1f0; color: #646c68; font-size: 9px; white-space: nowrap; }
        .td-invitation-type svg { color: #16803c; }
        .td-invitation-role { margin: 4px 0 5px; color: #545b5f; font-size: 11px; }
        .td-invitation-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 12px; color: #71787b; font-size: 10px; }
        .td-invitation-meta span { display: inline-flex; align-items: center; gap: 4px; }
        .td-invitation-meta span.is-urgent { color: #15803d; font-weight: 700; }
        .td-invitation-card-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 10px; }
        .td-invitation-status { max-width: 110px; padding: 5px 8px; border-radius: 999px; background: #e9f8e9; color: #247a38; font-size: 9px; font-weight: 700; text-align: center; }
        .td-invitation-card-actions > button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 112px; padding: 9px 12px; border: 1px solid #16803c; border-radius: 7px; background: #16803c; color: #fff; font-size: 10px; font-weight: 700; cursor: pointer; }
        .td-invitation-card-actions > button:hover { background: #116b32; }
        .td-invitation-card-actions > button.is-secondary { border-color: transparent; background: transparent; color: #16803c; }
        .td-invitation-card-actions > button.is-secondary:hover { background: #f0f8f2; }
        .td-invitation-note { display: flex; align-items: flex-start; gap: 7px; margin-top: 12px; padding: 9px 11px; border-radius: 7px; background: #f0f1f0; color: #50575a; font-size: 10px; line-height: 1.45; }
        .td-invitation-note svg { flex: 0 0 auto; margin-top: 1px; color: #16803c; }
        .td-invitation-status--history { background: #eceeed; color: #686e6b; }
        .td-invitation-status--history.expired { background: #eceeed; color: #686e6b; }
        .td-invitation-status--history.cancelled, .td-invitation-status--history.canceled, .td-invitation-status--history.rejected { background: #ffe4e1; color: #b6473d; }
        .td-invitation-status--history.applied, .td-invitation-status--history.accepted, .td-invitation-status--history.completed { background: #e9f8e9; color: #247a38; }
        .td-invitation-history-empty { padding: 15px; border: 1px dashed #dfe4e1; border-radius: 10px; color: #73797d; font-size: 11px; }
        .td-invitation-privacy { display: flex; align-items: center; gap: 12px; margin-top: 30px; padding: 15px; border: 1px solid #e8ebea; border-radius: 12px; background: #f0f1f0; }
        .td-invitation-privacy-icon { display: grid; place-items: center; flex: 0 0 32px; width: 32px; height: 32px; border-radius: 50%; background: #d7f5d9; color: #16803c; }
        .td-invitation-privacy > div { flex: 1; }
        .td-invitation-privacy strong { color: #252a2d; font-size: 11px; }
        .td-invitation-privacy p { margin-top: 3px; color: #70777b; font-size: 10px; line-height: 1.4; }
        .td-invitation-privacy > button { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: #16803c; font-size: 10px; font-weight: 700; text-align: left; cursor: pointer; }
        .td-invitation-detail-topline { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .td-invitation-back { display: inline-flex; align-items: center; gap: 5px; padding: 0; border: 0; background: transparent; color: #16803c; font-size: 11px; font-weight: 700; cursor: pointer; }
        .td-invitation-id { display: inline-flex; align-items: center; gap: 6px; color: #73797d; font-size: 10px; }
        .td-invitation-id i { width: 7px; height: 7px; border-radius: 50%; background: #16803c; }
        .td-invitation-detail-heading { margin-bottom: 20px; }
        .td-invitation-detail-heading h1 { margin: 4px 0; color: #202124; font-size: 27px; line-height: 1.2; font-weight: 800; }
        .td-invitation-detail-heading p { color: #666e72; font-size: 12px; line-height: 1.55; }
        .td-invitation-detail-grid { display: grid; grid-template-columns: minmax(0, 1.9fr) minmax(210px, .9fr); align-items: start; gap: 16px; }
        .td-invitation-detail-main-card, .td-invitation-school-about, .td-invitation-help-card { border: 1px solid #e8ebea; border-radius: 11px; background: #fff; }
        .td-invitation-detail-main-card { padding: 17px; }
        .td-invitation-detail-school { display: flex; align-items: flex-start; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid #edf0ef; }
        .td-invitation-detail-school > div:nth-child(2) { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 4px; }
        .td-invitation-detail-school h2 { display: flex; align-items: center; gap: 4px; margin: 0; color: #262a2d; font-size: 13px; font-weight: 750; }
        .td-invitation-detail-school h2 svg { color: #16803c; }
        .td-invitation-detail-school > div:nth-child(2) > span { display: flex; align-items: center; gap: 4px; color: #6d7478; font-size: 10px; }
        .td-invitation-detail-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
        .td-invitation-detail-badges small { display: inline-flex; align-items: center; gap: 4px; color: #16803c; font-size: 9px; white-space: nowrap; }
        .td-invitation-position { padding: 15px 0 12px; }
        .td-invitation-position > span { color: #697175; font-size: 9px; letter-spacing: .04em; text-transform: uppercase; }
        .td-invitation-position h2 { margin: 3px 0 9px; color: #16803c; font-size: 17px; font-weight: 750; }
        .td-invitation-detail-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .td-invitation-detail-tags span { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; background: #eef0ef; color: #4a5350; font-size: 9px; }
        .td-invitation-detail-tags svg { color: #16803c; }
        .td-invitation-about { margin: 10px 0 14px; }
        .td-invitation-about h3 { margin-bottom: 5px; color: #292e30; font-size: 12px; font-weight: 750; }
        .td-invitation-about p { color: #626a6e; font-size: 10px; line-height: 1.65; white-space: pre-line; }
        .td-invitation-spec-link { display: flex; align-items: center; gap: 9px; width: 100%; padding: 10px; border: 0; border-radius: 8px; background: #f0f1f0; text-align: left; cursor: pointer; }
        .td-invitation-spec-link > span:first-child { display: grid; place-items: center; flex: 0 0 28px; width: 28px; height: 28px; border-radius: 7px; background: #fff; color: #16803c; }
        .td-invitation-spec-link > span:nth-child(2) { display: flex; flex: 1; flex-direction: column; gap: 2px; }
        .td-invitation-spec-link strong { color: #303638; font-size: 9px; }
        .td-invitation-spec-link small { color: #71787b; font-size: 8px; }
        .td-invitation-spec-link > svg { color: #59615e; }
        .td-invitation-personal-note { display: flex; gap: 9px; margin: 8px 0 0; padding: 12px; border-radius: 9px; background: #f1faef; color: #275b34; }
        .td-invitation-personal-note > span { display: grid; place-items: center; flex: 0 0 22px; width: 22px; height: 22px; border-radius: 50%; background: #16803c; color: #fff; }
        .td-invitation-personal-note > div { min-width: 0; }
        .td-invitation-personal-note strong { font-size: 9px; }
        .td-invitation-personal-note p { margin-top: 4px; color: #48584b; font-size: 9px; font-style: italic; line-height: 1.55; white-space: pre-line; }
        .td-invitation-personal-note small { display: block; margin-top: 5px; color: #67736a; font-size: 8px; }
        .td-invitation-response-note { margin-top: 10px; padding: 8px 10px; border-radius: 7px; background: #fff8e6; color: #765d1b; font-size: 10px; line-height: 1.45; }
        .td-invitation-response-actions { display: flex; align-items: center; gap: 8px; margin-top: 16px; padding-top: 4px; }
        .td-invitation-response-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 36px; border-radius: 7px; font-size: 10px; font-weight: 700; cursor: pointer; }
        .td-invitation-apply-button { flex: 1; border: 1px solid #16803c; background: #16803c; color: #fff; }
        .td-invitation-apply-button:hover:not(:disabled) { background: #116b32; }
        .td-invitation-decline-button { padding: 0 10px; border: 1px solid transparent; background: transparent; color: #c62828; }
        .td-invitation-response-actions button:disabled { opacity: .5; cursor: not-allowed; }
        .td-invitation-detail-aside { display: flex; flex-direction: column; gap: 12px; }
        .td-invitation-school-cover { position: relative; display: flex; align-items: flex-end; height: 78px; padding: 9px; border-radius: 11px 11px 0 0; background: linear-gradient(135deg, #e8ece9, #dce5df); }
        .td-invitation-school-cover > span { display: inline-flex; align-items: center; gap: 4px; padding: 3px 6px; border-radius: 999px; background: rgba(67, 76, 70, .38); color: #fff; font-size: 8px; }
        .td-invitation-school-about-body { padding: 12px; }
        .td-invitation-school-about-body h2 { margin-bottom: 6px; color: #292e30; font-size: 11px; font-weight: 750; }
        .td-invitation-school-about-body p, .td-invitation-help-card p { color: #687074; font-size: 9px; line-height: 1.55; }
        .td-invitation-school-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 7px 5px; margin-top: 10px; }
        .td-invitation-school-facts span { display: inline-flex; align-items: center; gap: 4px; color: #5c6560; font-size: 8px; }
        .td-invitation-school-facts svg { color: #16803c; }
        .td-invitation-school-about-body > button { display: inline-flex; align-items: center; gap: 4px; margin-top: 11px; padding: 0; border: 0; background: transparent; color: #16803c; font-size: 9px; font-weight: 700; cursor: pointer; }
        .td-invitation-help-card { padding: 12px; }
        .td-invitation-help-card h2 { display: flex; align-items: center; gap: 6px; margin-bottom: 7px; color: #292e30; font-size: 11px; }
        .td-invitation-help-card h2 svg { color: #16803c; }
        .td-invitation-help-card a, .td-invitation-help-card > button { display: flex; align-items: center; gap: 6px; width: 100%; margin-top: 8px; padding: 7px; border: 1px solid #e8ebea; border-radius: 6px; background: #fff; color: #48504d; font-size: 8px; text-decoration: none; cursor: pointer; }
        .td-invitation-help-card a svg:first-child, .td-invitation-help-card > button svg:first-child { color: #16803c; }
        .td-invitation-help-card a svg:last-child, .td-invitation-help-card > button svg:last-child { margin-left: auto; }
        .td-invitation-protection { display: flex; align-items: center; gap: 5px; padding: 9px; border-radius: 7px; background: #f0f1f0; color: #606966; font-size: 8px; }
        .td-invitation-protection svg { flex: 0 0 auto; color: #16803c; }
        .td-invitation-benefits { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
        .td-invitation-benefits > div { display: grid; grid-template-columns: 24px minmax(0, 1fr); align-items: start; gap: 3px 7px; padding: 11px; border: 1px solid #e8ebea; border-radius: 9px; background: #fff; }
        .td-invitation-benefits > div > span { display: grid; place-items: center; grid-row: span 2; width: 24px; height: 24px; border-radius: 6px; background: #e5f7e6; color: #16803c; }
        .td-invitation-benefits strong { color: #313738; font-size: 9px; }
        .td-invitation-benefits p { color: #71787b; font-size: 8px; line-height: 1.4; }
        .td-interview-invitation-placeholder { display: flex; align-items: flex-start; gap: 12px; max-width: 680px; padding: 20px; border: 1px solid #e8ebea; border-radius: 11px; background: #fff; }
        .td-interview-invitation-placeholder h2 { margin: 6px 0 3px; color: #292e30; font-size: 17px; }
        .td-interview-invitation-placeholder p { color: #60696d; font-size: 11px; }
        .td-interview-invitation-placeholder .td-interview-invitation-detail-copy { margin-top: 10px; }
        .td-interview-invitation-placeholder small { display: block; margin-top: 14px; color: #71787b; font-size: 9px; line-height: 1.5; }
        .td-interview-invitation-layout { display: grid; grid-template-columns: minmax(0, 1.9fr) minmax(220px, .9fr); align-items: start; gap: 16px; }
        .td-interview-invitation-primary-column, .td-interview-invitation-aside { display: flex; min-width: 0; flex-direction: column; gap: 12px; }
        .td-interview-invitation-card { display: flex; flex-direction: column; gap: 12px; padding: 17px; border: 1px solid #e8ebea; border-radius: 11px; background: #fff; }
        .td-interview-invitation-school { display: flex; align-items: center; gap: 10px; }
        .td-interview-school-mark { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; border-radius: 9px; background: #f0f1f0; color: #16803c; }
        .td-interview-school-mark svg { filter: drop-shadow(0 1px 0 #fff); }
        .td-interview-school-copy { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 3px; }
        .td-interview-school-copy h2 { display: flex; align-items: center; gap: 4px; margin: 0; color: #262a2d; font-size: 13px; font-weight: 750; }
        .td-interview-school-copy h2 svg { color: #16803c; fill: #16803c; }
        .td-interview-school-copy > span { display: inline-flex; align-items: center; gap: 4px; color: #6d7478; font-size: 9px; }
        .td-interview-school-dates { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; color: #6d7478; font-size: 9px; text-align: right; }
        .td-interview-school-dates small { display: inline-flex; align-items: center; gap: 3px; padding: 3px 6px; border-radius: 999px; background: #e9f8e9; color: #427350; font-size: 8px; }
        .td-interview-role-panel { padding: 13px; border-radius: 9px; background: #f0f1f0; }
        .td-interview-role-panel > span { color: #697175; font-size: 8px; text-transform: uppercase; }
        .td-interview-role-panel h2 { margin: 3px 0 8px; color: #24292c; font-size: 16px; font-weight: 750; }
        .td-interview-role-panel .td-invitation-detail-tags span { background: #fff; }
        .td-interview-schedule-panel { display: flex; align-items: flex-start; gap: 10px; padding: 13px; border: 1px solid #e8ebea; border-radius: 9px; background: #f0f1f0; }
        .td-interview-schedule-icon { display: grid; place-items: center; flex: 0 0 30px; width: 30px; height: 30px; border-radius: 7px; background: #dce8ff; color: #16803c; }
        .td-interview-schedule-content { flex: 1; min-width: 0; }
        .td-interview-panel-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .td-interview-panel-title h3, .td-interview-message-content h3 { margin: 0; color: #303638; font-size: 11px; font-weight: 750; }
        .td-interview-panel-title > span { display: inline-flex; align-items: center; gap: 4px; color: #16803c; font-size: 8px; }
        .td-interview-panel-title > span i { width: 6px; height: 6px; border-radius: 50%; background: #16803c; }
        .td-interview-schedule-meta { display: flex; flex-wrap: wrap; gap: 5px 13px; margin-top: 8px; }
        .td-interview-schedule-meta > span, .td-interview-schedule-content > p { display: inline-flex; align-items: center; gap: 4px; color: #4f575a; font-size: 9px; }
        .td-interview-schedule-content > p { flex-wrap: wrap; margin-top: 6px; }
        .td-interview-schedule-content > p svg { flex: 0 0 auto; color: #4f575a; }
        .td-interview-schedule-content > p small { color: #16803c; font-size: 8px; }
        .td-interview-message-panel { display: flex; align-items: flex-start; gap: 10px; padding: 13px; border-radius: 9px; background: #f0f1f0; }
        .td-interview-message-icon { display: grid; place-items: center; flex: 0 0 27px; width: 27px; height: 27px; border-radius: 7px; background: #e4e6e5; color: #65706b; }
        .td-interview-message-content { flex: 1; min-width: 0; }
        .td-interview-message-content > div { margin-top: 7px; padding: 10px; border-radius: 7px; background: #fff; }
        .td-interview-message-content > div > strong:first-child { color: #353b3d; font-size: 9px; }
        .td-interview-message-content p { margin: 5px 0; color: #60696d; font-size: 9px; line-height: 1.55; white-space: pre-line; }
        .td-interview-message-content .td-interview-message-signoff { color: #16803c; font-size: 8px; }
        .td-interview-spec-unavailable { cursor: default; }
        .td-interview-response-card { display: grid; grid-template-columns: 1fr 1fr 0.6fr; gap: 8px; padding: 13px; border: 1px solid #e8ebea; border-radius: 10px; background: #fff; }
        .td-interview-response-card > button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 36px; padding: 7px 9px; border: 1px solid transparent; border-radius: 7px; font-size: 9px; font-weight: 700; cursor: pointer; }
        .td-interview-response-card > button:disabled { opacity: .5; cursor: not-allowed; }
        .td-interview-accept-button { background: #16803c; color: #fff; }
        .td-interview-accept-button:hover:not(:disabled) { background: #116b32; }
        .td-interview-reschedule-button { border-color: #e8ebea !important; background: #fff; color: #424a46; }
        .td-interview-decline-button { background: #fff0ef; color: #c62828; }
        .td-interview-reschedule-form { display: grid; grid-column: 1 / -1; grid-template-columns: 1fr 1fr; gap: 9px; padding: 12px; border: 1px solid #e8ebea; border-radius: 8px; background: #fafbfa; }
        .td-interview-reschedule-form h3 { grid-column: 1 / -1; color: #303638; font-size: 11px; }
        .td-interview-reschedule-form label { display: flex; flex-direction: column; gap: 4px; color: #555e59; font-size: 9px; }
        .td-interview-reschedule-form label:nth-of-type(3) { grid-column: 1 / -1; }
        .td-interview-reschedule-form input, .td-interview-reschedule-form textarea { width: 100%; padding: 8px; border: 1px solid #dfe4e1; border-radius: 6px; background: #fff; color: #252a2d; font: inherit; font-size: 10px; }
        .td-interview-reschedule-form > button { grid-column: 1 / -1; justify-self: end; padding: 8px 12px; border: 0; border-radius: 6px; background: #16803c; color: #fff; font-size: 9px; font-weight: 700; cursor: pointer; }
        .td-interview-prepared-request { grid-column: 1 / -1; margin: 0; color: #765d1b; font-size: 9px; line-height: 1.45; }
        .td-interview-school-profile-card, .td-interview-campus-card, .td-interview-checklist-card { overflow: hidden; border: 1px solid #e8ebea; border-radius: 10px; background: #fff; }
        .td-interview-school-cover { position: relative; height: 118px; overflow: hidden; background: #e4ebe6; }
        .td-interview-school-cover img { width: 100%; height: 100%; object-fit: cover; }
        .td-interview-school-cover > span { position: absolute; bottom: 8px; left: 8px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 7px; border-radius: 999px; background: rgba(26, 34, 29, .55); color: #fff; font-size: 8px; }
        .td-interview-school-profile-body { padding: 12px; }
        .td-interview-school-profile-body h2, .td-interview-campus-title h2, .td-interview-assistance-card h2 { margin: 0; color: #292e30; font-size: 11px; font-weight: 750; }
        .td-interview-school-profile-body > p { margin-top: 6px; color: #687074; font-size: 9px; line-height: 1.55; }
        .td-interview-school-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 9px; }
        .td-interview-school-stat-row > span { display: flex; flex-direction: column; gap: 3px; padding: 7px; border-radius: 6px; background: #f0f1f0; }
        .td-interview-school-stat-row small { color: #687074; font-size: 8px; }
        .td-interview-school-stat-row strong { color: #303638; font-size: 11px; }
        .td-interview-school-profile-body > button { display: inline-flex; align-items: center; gap: 4px; margin-top: 10px; padding: 0; border: 0; background: transparent; color: #16803c; font-size: 9px; font-weight: 700; cursor: pointer; }
        .td-interview-campus-card { padding: 11px; }
        .td-interview-campus-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
        .td-interview-campus-title > span { color: #687074; font-size: 8px; }
        .td-interview-map { position: relative; height: 112px; overflow: hidden; border-radius: 7px; background: #dceae3; }
        .td-interview-map::before, .td-interview-map::after { position: absolute; content: ''; background: #f1e7d2; }
        .td-interview-map::before { top: 48%; left: -5%; width: 115%; height: 12px; transform: rotate(-20deg); }
        .td-interview-map::after { top: -15%; left: 42%; width: 10px; height: 135%; transform: rotate(27deg); }
        .td-interview-map-water { position: absolute; right: -25px; bottom: -34px; width: 105px; height: 75px; border-radius: 50%; background: #a7dce0; }
        .td-interview-map-road { position: absolute; z-index: 1; height: 4px; border: 1px solid rgba(255,255,255,.9); border-radius: 50%; background: #f8f6e8; }
        .td-interview-map-road--one { top: 34%; left: -5%; width: 65%; transform: rotate(21deg); }
        .td-interview-map-road--two { top: 63%; left: 25%; width: 85%; transform: rotate(-10deg); }
        .td-interview-map-road--three { top: 9%; left: 51%; width: 75%; transform: rotate(67deg); }
        .td-interview-map-label { position: absolute; z-index: 2; color: #77928a; font-size: 7px; }
        .td-interview-map-label--one { top: 16%; right: 8%; }
        .td-interview-map-label--two { bottom: 19%; left: 12%; }
        .td-interview-map-pin { position: absolute; z-index: 3; top: 36%; left: 49%; display: grid; place-items: center; width: 25px; height: 25px; border: 2px solid #fff; border-radius: 50% 50% 50% 0; background: #d94841; color: #fff; transform: rotate(-45deg); box-shadow: 0 2px 6px rgba(0,0,0,.2); }
        .td-interview-map-pin svg { transform: rotate(45deg); }
        .td-interview-map-address { position: absolute; z-index: 4; right: 5px; bottom: 5px; display: inline-flex; align-items: center; gap: 3px; max-width: 90%; padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,.92); color: #43514a; font-size: 7px; }
        .td-interview-assistance-card { display: flex; align-items: flex-start; gap: 9px; padding: 13px; border-radius: 10px; background: #f0f1f0; }
        .td-interview-assistance-card > span { display: grid; place-items: center; flex: 0 0 25px; width: 25px; height: 25px; border-radius: 50%; background: #fff; color: #16803c; }
        .td-interview-assistance-card > div { flex: 1; }
        .td-interview-assistance-card p { margin-top: 5px; color: #687074; font-size: 9px; line-height: 1.5; }
        .td-interview-assistance-card a { display: inline-flex; align-items: center; gap: 4px; margin-top: 7px; color: #16803c; font-size: 8px; font-weight: 700; text-decoration: none; }
        .td-interview-checklist-card { padding: 12px; }
        .td-interview-checklist-card h2 { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; color: #303638; font-size: 10px; }
        .td-interview-checklist-card h2 svg, .td-interview-checklist-card li svg { color: #16803c; }
        .td-interview-checklist-card ul { display: flex; flex-direction: column; gap: 5px; margin: 0; padding: 0; list-style: none; }
        .td-interview-checklist-card li { display: flex; align-items: flex-start; gap: 5px; color: #687074; font-size: 8px; line-height: 1.4; }
        .td-interview-checklist-card li svg { flex: 0 0 auto; }
        @media (max-width: 768px) {
          .td-invitations-page { padding: 18px 14px 90px; }
          .td-invitations-heading { align-items: flex-start; flex-direction: column; gap: 12px; }
          .td-invitations-heading h1 { font-size: 25px; }
          .td-invitations-summary { width: 100%; }
          .td-invitation-card-main { align-items: flex-start; flex-wrap: wrap; }
          .td-invitation-card-copy { flex-basis: calc(100% - 54px); }
          .td-invitation-card-actions { width: 100%; justify-content: space-between; padding-left: 52px; }
          .td-invitation-card-actions > button { min-width: 125px; }
          .td-invitation-privacy { align-items: flex-start; flex-wrap: wrap; }
          .td-invitation-privacy > div { flex-basis: calc(100% - 48px); }
          .td-invitation-privacy > button { margin-left: 44px; }
          .td-invitation-detail-topline { align-items: flex-start; }
          .td-invitation-id { max-width: 55%; text-align: right; }
          .td-invitation-detail-heading h1 { font-size: 23px; }
          .td-invitation-detail-grid { grid-template-columns: minmax(0, 1fr); }
          .td-invitation-detail-main-card { padding: 14px; }
          .td-invitation-detail-school { flex-wrap: wrap; }
          .td-invitation-detail-badges { width: 100%; flex-direction: row; justify-content: flex-end; }
          .td-invitation-benefits { grid-template-columns: minmax(0, 1fr); }
          .td-invitation-benefits > div { grid-template-columns: 28px minmax(0, 1fr); }
          .td-interview-invitation-layout { grid-template-columns: minmax(0, 1fr); }
          .td-interview-invitation-card { padding: 13px; }
          .td-interview-school-dates { font-size: 8px; }
          .td-interview-response-card { grid-template-columns: minmax(0, 1fr); }
          .td-interview-response-card > button { min-height: 40px; }
          .td-interview-reschedule-form { grid-template-columns: minmax(0, 1fr); }
          .td-interview-reschedule-form h3, .td-interview-reschedule-form label:nth-of-type(3) { grid-column: auto; }
          .td-interview-reschedule-form > button { grid-column: auto; justify-self: stretch; }
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

        .td-app-page { max-width: 1180px; padding: 28px 18px 48px; }
        .td-app-header { margin-bottom: 18px; }
        .td-app-header h1 { margin-bottom: 2px; color: #202b3d; font-size: 28px; line-height: 1.25; }
        .td-app-header p { color: #7a8493; font-size: 14px; }
        .td-app-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 20px; }
        .td-app-filter-tabs { display: flex; flex-wrap: wrap; gap: 7px; }
        .td-app-filter-tabs button { min-width: 48px; padding: 7px 14px; border-radius: 999px; background: #e7eef9; color: #58677d; font-size: 12px; font-weight: 700; cursor: pointer; }
        .td-app-filter-tabs button.is-active { background: #182338; color: #fff; }
        .td-app-toolbar-actions { display: flex; align-items: center; gap: 8px; }
        .td-app-search { display: flex; align-items: center; gap: 7px; width: 180px; height: 34px; padding: 0 10px; border: 1px solid #e0e6ee; border-radius: 6px; background: #fff; color: #a3afbf; }
        .td-app-search input { min-width: 0; flex: 1; color: #344054; font-size: 12px; outline: none; }
        .td-app-toolbar select { height: 34px; padding: 0 28px 0 10px; border: 1px solid #e0e6ee; border-radius: 6px; background: #fff; color: #58677d; font-size: 12px; font-weight: 700; cursor: pointer; }
        .td-app-list { gap: 10px; }
        .td-app-card { min-height: 106px; padding: 15px; border: 1px solid #e7ebf0; border-radius: 8px; box-shadow: none; flex-direction: row; align-items: center; justify-content: space-between; gap: 20px; }
        .td-app-card-left { min-width: 0; gap: 11px; align-items: flex-start; }
        .td-app-icon-wrapper { width: 32px; height: 32px; border-radius: 6px; background: #d8ecfa; color: #337696; }
        .td-app-title-row { margin-bottom: 1px; }
        .td-app-title-row h3 { color: #313b4a; font-size: 16px; font-weight: 700; }
        .td-app-school { margin-bottom: 12px; color: #77808b; font-size: 12px; }
        .td-app-meta { display: flex; flex-wrap: wrap; gap: 9px; color: #8a95a3; font-size: 11px; }
        .td-app-meta span { display: inline-flex; align-items: center; gap: 3px; }
        .td-app-meta svg { width: 12px; height: 12px; }
        .td-app-cover-letter,
        .td-app-additional-info {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }
        .td-app-cover-letter svg { color: #15803d; flex-shrink: 0; margin-top: 2px; }
        .td-app-additional-info svg { color: #2563eb; flex-shrink: 0; margin-top: 2px; }
        .td-app-cover-letter span,
        .td-app-additional-info span {
          display: block;
          overflow-wrap: anywhere;
        }
        .td-app-cover-letter strong,
        .td-app-additional-info strong { color: #475569; }
        .td-app-card-footer { flex: 0 0 auto; min-width: 105px; padding: 0; border: 0; flex-direction: column; align-items: flex-end; gap: 26px; }
        .td-app-status-badge { padding: 5px 10px; border-radius: 999px; background: #fff1b8; color: #8a6910; font-size: 11px; text-transform: capitalize; }
        .td-app-status-badge--shortlisted { background: #d7f8d6; color: #238b37; }
        .td-app-status-badge--rejected { background: #ffe0da; color: #e35942; }
        .td-app-status-badge--withdrawn { background: #e7ebf0; color: #6b7280; }
        .td-app-action-btn { min-width: 110px; min-height: 32px; padding: 0 12px; border: 1px solid #cfd6df; border-radius: 6px; color: #4b5563; font-size: 12px; font-weight: 700; }
        .td-app-action-btn:hover { border-color: #8896a7; background: #f8fafc; color: #273449; }
        .td-app-empty { padding: 32px; border: 1px dashed #d8e0e9; border-radius: 8px; color: #6b7788; font-size: 14px; text-align: center; }
        @media (max-width: 768px) {
          .td-app-page { padding: 18px 14px 88px; }
          .td-app-header { margin-bottom: 16px; }
          .td-app-toolbar { align-items: stretch; flex-direction: column; }
          .td-app-toolbar-actions { width: 100%; }
          .td-app-search { width: 100%; flex: 1; }
          .td-app-card { min-height: 0; padding: 14px; align-items: stretch; flex-direction: column; gap: 13px; }
          .td-app-card-left { gap: 10px; }
          .td-app-title-row h3 { padding-right: 80px; font-size: 13px; }
          .td-app-school { margin-bottom: 9px; }
          .td-app-card-footer { width: 100%; min-width: 0; flex-direction: row; align-items: center; gap: 10px; }
          .td-app-status-badge { position: static; }
          .td-app-action-btn { margin-left: auto; }
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
          width: 100%;
          max-width: 100%;
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
          transition: color 0.15s ease, opacity 0.15s ease;
        }
        .td-settings-breadcrumb-btn:hover {
          color: #10b981;
        }
        .td-settings-breadcrumb-btn .td-breadcrumb-current,
        .td-accs-breadcrumb .td-breadcrumb-current,
        .td-privacy-breadcrumb .td-breadcrumb-current,
        .td-sec-breadcrumb .td-breadcrumb-current,
        .td-legal-breadcrumb .td-breadcrumb-current {
          color: #111827;
          font-weight: 600;
        }
        .td-settings-breadcrumb-btn:hover .td-breadcrumb-current,
        .td-accs-breadcrumb:hover .td-breadcrumb-current,
        .td-privacy-breadcrumb:hover .td-breadcrumb-current,
        .td-sec-breadcrumb:hover .td-breadcrumb-current,
        .td-legal-breadcrumb:hover .td-breadcrumb-current {
          color: #111827;
        }

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
          transition: color 0.15s ease, opacity 0.15s ease;
        }
        .td-accs-breadcrumb:hover,
        .td-privacy-breadcrumb:hover,
        .td-sec-breadcrumb:hover,
        .td-legal-breadcrumb:hover {
          color: #10b981;
        }
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
          color: #6B7280;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.15s ease, opacity 0.15s ease;
        }
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
          grid-template-columns: 1fr;
          gap: 18px;
          margin-bottom: 24px;
          width: 100%;
        }
        @media (max-width: 860px) {
          .td-privacy-top-grid {
            grid-template-columns: 1fr;
          }
        }
        .td-privacy-card {
          width: 100%;
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
          color: #6B7280;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.15s ease, opacity 0.15s ease;
        }
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
        .td-profile-view-logs-page {
          max-width: 900px;
        }
        .td-profile-view-logs-eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #15803D;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }
        .td-profile-view-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 4px 0 20px;
        }
        .td-profile-view-summary-card {
          position: relative;
          min-height: 94px;
          padding: 18px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
          border-radius: 14px;
          background: #fff;
        }
        .td-profile-view-summary-card--total {
          border-color: #BBE7CD;
          background: #F0FAF4;
        }
        .td-profile-view-summary-label {
          display: block;
          margin-bottom: 10px;
          color: #64748B;
          font-size: 11px;
          font-weight: 700;
        }
        .td-profile-view-summary-card strong {
          display: block;
          color: #17212B;
          font-size: 22px;
          line-height: 1.2;
        }
        .td-profile-view-summary-card > svg {
          position: absolute;
          right: 16px;
          bottom: 16px;
          color: #15803D;
          opacity: 0.7;
        }
        .td-profile-view-logs-card {
          padding: 24px;
        }
        .td-profile-view-logs-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 18px;
          border-bottom: 1px solid #EEF1EF;
        }
        .td-profile-view-logs-card-header p {
          margin: 6px 0 0;
          color: #7A8791;
          font-size: 12px;
        }
        .td-profile-view-count-chip {
          flex-shrink: 0;
          padding: 6px 10px;
          border-radius: 999px;
          background: #F0F6F2;
          color: #167343;
          font-size: 11px;
          font-weight: 700;
        }
        .td-profile-view-log-list {
          display: flex;
          flex-direction: column;
        }
        .td-profile-view-log-item {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          padding: 17px 0;
          border-bottom: 1px solid #F0F2F1;
        }
        .td-profile-view-log-item:last-child {
          border-bottom: 0;
        }
        .td-profile-view-log-logo {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          overflow: hidden;
          border: 1px solid #E3EAE5;
          border-radius: 12px;
          background: #F2F8F4;
          color: #15803D;
        }
        .td-profile-view-log-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .td-profile-view-log-info {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }
        .td-profile-view-log-info strong {
          overflow: hidden;
          color: #1F2937;
          font-size: 14px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .td-profile-view-log-info span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #7A8791;
          font-size: 11px;
        }
        .td-profile-view-log-item time {
          flex-shrink: 0;
          color: #64748B;
          font-size: 11px;
          text-align: right;
        }
        .td-profile-view-logs-card > .td-sec-view-log-btn {
          margin-top: 18px;
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
          color: #6B7280;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.15s ease, opacity 0.15s ease;
        }
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
        .td-legal-document-wrap {
          width: 100%;
          max-width: 860px;
        }
        .td-legal-document {
          background: #fff;
          border: 1px solid #E9ECEF;
          border-radius: 18px;
          padding: 28px 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .td-legal-document-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #EEF7FF;
          color: #005A36;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .td-legal-document-lead,
        .td-legal-document p {
          color: #6B7280;
          font-size: 14px;
          line-height: 1.65;
          margin: 0 0 20px;
        }
        .td-legal-document h2 {
          color: #111;
          font-size: 17px;
          font-weight: 700;
          margin: 24px 0 8px;
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
          .td-mobile-settings-logout-wrap {
            display: flex;
            width: 100%;
            margin-top: 24px;
          }
          .td-mobile-settings-logout-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            border-radius: 14px;
            background: #FF5E3A;
            color: #fff;
            padding: 14px 18px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(255, 94, 58, 0.2);
          }
        }

        @media (min-width: 769px) {
          .td-mobile-settings-logout-wrap {
            display: none;
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

        .td-profile-page-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .td-profile-page-heading .td-profile-main-title { margin: 0; }
        .td-profile-page-heading p { margin-top: 3px; color: #64748b; font-size: 13px; }
        .td-profile-overview-shell { display: flex; flex-direction: column; align-items: stretch; gap: 0; width: 100%; }
        .td-profile-overview-top { display: grid; grid-template-columns: minmax(0, 1.42fr) minmax(0, 1fr); align-items: stretch; align-content: start; gap: 20px; margin: 0 0 18px; }
        .td-profile-overview-top .td-profile-header-card { min-width: 0; min-height: 202px; margin: 0; padding: 22px 24px; border-radius: 18px; box-shadow: 0 2px 10px rgba(15, 23, 42, .035); }
        .td-profile-overview-top .td-profile-header-left { min-width: 0; align-items: flex-start; gap: 22px; }
        .td-profile-overview-top .td-profile-info-block { min-width: 0; }
        .td-profile-overview-top .td-profile-avatar-container { width: clamp(86px, 10vw, 112px); height: clamp(86px, 10vw, 112px); }
        .td-profile-overview-top .td-profile-name-row h2 { font-size: clamp(20px, 2.1vw, 26px); line-height: 1.15; }
        .td-profile-overview-top .td-profile-verified-badge { width: 18px; height: auto; }
        .td-profile-subject-title { margin: 2px 0 0; color: #64748b; font-size: clamp(14px, 1.5vw, 17px); line-height: 1.25; font-weight: 500; }
        .td-profile-overview-top .td-profile-role-title { margin: 1px 0 0; color: #64748b; font-size: clamp(13px, 1.4vw, 16px); line-height: 1.25; }
        .td-profile-overview-top .td-profile-meta-row { gap: 7px 12px; margin-top: 12px; }
        .td-profile-overview-top .td-profile-meta-item { position: relative; gap: 6px; font-size: clamp(11px, 1.2vw, 13px); color: #64748b; }
        .td-profile-overview-top .td-profile-meta-item svg { width: 15px; height: auto; color: #94a3b8; }
        .td-profile-overview-top .td-profile-meta-item + .td-profile-meta-item::before { width: 1px; height: 1.2em; margin-right: 8px; background: #e2e8f0; content: ''; }
        .td-profile-overview-top .td-profile-header-actions { margin-top: 14px; }
        .td-profile-avatar-container img { width: 100%; height: 100%; object-fit: cover; }
        .td-profile-overview-top .td-profile-btn-edit { padding: 7px 10px; border-radius: 8px; background: #f8fafc; color: #1f2937; border: 1px solid #dbe2ea; font-size: 11px; white-space: nowrap; }
        .td-profile-overview-top .td-profile-btn-edit:hover { background: #f8fafc; }
        .td-profile-readiness { min-width: 0; padding: 18px 20px; border: 1px solid #d1fae5; border-radius: 14px; background: #f0fdf7; color: #166534; }
        .td-profile-readiness.is-incomplete { border-color: #dbeafe; background: #f5f9ff; color: #1e3a5f; }
        .td-readiness-heading { display: flex; align-items: flex-start; gap: 12px; }
        .td-readiness-icon { display: grid; width: 32px; height: 32px; flex: 0 0 32px; place-items: center; border-radius: 50%; background: #059669; color: #fff; }
        .td-profile-readiness.is-incomplete .td-readiness-icon { background: #2563eb; }
        .td-readiness-heading strong { display: block; padding-top: 2px; font-size: 15px; }
        .td-readiness-heading p { margin-top: 3px; color: #4b5563; font-size: 11px; line-height: 1.5; }
        .td-readiness-progress { height: 5px; overflow: hidden; margin-top: 14px; border-radius: 99px; background: rgba(148, 163, 184, .24); }
        .td-readiness-progress span { display: block; height: 100%; border-radius: inherit; background: #10b981; transition: width .3s ease; }
        .td-profile-readiness.is-incomplete .td-readiness-progress span { background: #3b82f6; }
        .td-readiness-checklist { display: grid; gap: 7px; margin-top: 12px; }
        .td-readiness-checklist span { display: flex; align-items: center; gap: 7px; color: #64748b; font-size: 11px; }
        .td-readiness-checklist span.is-complete { color: #15803d; }

        .td-profile-tabs { position: relative; z-index: 5; display: flex; flex-wrap: wrap; align-items: stretch; gap: 4px; min-height: 48px; margin-bottom: 18px; padding: 0 8px; overflow: visible; border: 1px solid #e8edf2; border-radius: 12px; background: #fff; box-shadow: 0 2px 8px rgba(15, 23, 42, .035); }
        .td-profile-tabs > button, .td-profile-more > summary { display: inline-flex; align-items: center; justify-content: center; gap: 7px; flex: 0 0 auto; padding: 0 13px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: #475569; font: inherit; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer; }
        .td-profile-tabs > button:hover, .td-profile-more > summary:hover { color: #15803d; }
        .td-profile-tabs > button.is-active { border-bottom-color: #16a34a; color: #15803d; }
        .td-profile-tabs > button:focus-visible { outline: 2px solid #16a34a; outline-offset: -3px; }
        .td-profile-tabs button svg, .td-profile-more summary svg { color: #94a3b8; }
        .td-profile-tabs > button.is-active svg { color: #15803d; }
        .td-profile-more { position: relative; z-index: 6; display: flex; flex: 0 0 auto; }
        .td-profile-more > summary { list-style: none; }
        .td-profile-more > summary::-webkit-details-marker { display: none; }
        .td-profile-more[open] > summary { color: #15803d; }
        .td-profile-more > summary.is-active { border-bottom-color: #16a34a; color: #15803d; }
        .td-profile-more-menu { position: absolute; top: calc(100% + 4px); right: 0; z-index: 10; display: grid; min-width: 220px; padding: 6px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 12px 28px rgba(15, 23, 42, .16); }
        .td-profile-more-menu button { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border: 0; border-radius: 7px; background: transparent; color: #334155; text-align: left; font: inherit; font-size: 12px; cursor: pointer; }
        .td-profile-more-menu button:hover { background: #f0fdf4; color: #15803d; }
        .td-more-page { width: 100%; }
        .td-more-card { min-height: 610px; padding: 26px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, .025); }
        .td-more-heading h1 { margin: 0; color: #252525; font-size: 17px; font-weight: 700; }
        .td-more-heading p { margin: 4px 0 0; color: #6b7280; font-size: 11px; line-height: 1.5; }
        .td-more-empty-state { display: flex; min-height: 376px; flex-direction: column; align-items: center; justify-content: center; padding: 22px 16px 27px; text-align: center; }
        .td-more-illustration { position: relative; display: grid; width: 150px; height: 139px; place-items: center; margin-bottom: 12px; }
        .td-more-illustration-backdrop { position: absolute; width: 137px; height: 127px; border-radius: 32px; background: #eefaf7; transform: rotate(3deg); }
        .td-more-illustration-document { position: relative; display: flex; width: 92px; height: 119px; flex-direction: column; gap: 7px; padding: 13px 10px; border-radius: 11px; background: #fff; box-shadow: 0 5px 14px rgba(15, 23, 42, .12); }
        .td-more-illustration-avatar { display: grid; width: 21px; height: 21px; place-items: center; margin-bottom: 3px; border: 1px solid #7dd3fc; border-radius: 50%; color: #0ea5e9; }
        .td-more-illustration-document i { display: block; width: 100%; height: 5px; border-radius: 5px; background: #e2e8f0; }
        .td-more-illustration-document i:nth-of-type(2) { width: 90%; }
        .td-more-illustration-document i:nth-of-type(3) { width: 75%; }
        .td-more-illustration-document i:nth-of-type(4) { width: 55%; }
        .td-more-illustration-plus { position: absolute; right: 15px; bottom: 5px; display: grid; width: 37px; height: 37px; place-items: center; border: 3px solid #fff; border-radius: 50%; background: #10b981; color: #fff; }
        .td-more-empty-state h2 { margin: 0; color: #252525; font-size: 15px; font-weight: 700; }
        .td-more-empty-state > p { max-width: 330px; margin: 8px 0 18px; color: #6b7280; font-size: 11px; line-height: 1.6; }
        .td-more-empty-state > button { display: inline-flex; min-height: 34px; align-items: center; justify-content: center; gap: 7px; padding: 0 17px; border: 0; border-radius: 7px; background: #20d653; color: #064e24; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
        .td-more-empty-state > button:hover { background: #16c34a; }
        .td-more-shortcuts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; padding: 28px 10px 4px; border-top: 1px solid #edf1f5; }
        .td-more-shortcut { display: flex; min-width: 0; align-items: flex-start; gap: 12px; padding: 4px 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
        .td-more-shortcut:hover strong { color: #15803d; }
        .td-more-shortcut-icon { display: grid; width: 39px; height: 39px; flex: 0 0 39px; place-items: center; border-radius: 50%; }
        .td-more-shortcut-icon--green { background: #ecfdf5; color: #059669; }
        .td-more-shortcut-icon--blue { background: #eff8ff; color: #0ea5e9; }
        .td-more-shortcut-icon--purple { background: #faf5ff; color: #a855f7; }
        .td-more-shortcut > span:last-child { display: grid; gap: 4px; min-width: 0; }
        .td-more-shortcut strong { color: #252525; font-size: 11px; font-weight: 700; transition: color .15s ease; }
        .td-more-shortcut small { color: #6b7280; font-size: 10px; line-height: 1.5; }
        .td-more-populated { display: grid; gap: 12px; margin-top: 18px; }
        .td-more-populated-card { padding: 18px; border: 1px solid #e2e8f0; border-radius: 13px; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, .025); }
        .td-more-populated-header { display: flex; min-width: 0; align-items: center; gap: 11px; padding-bottom: 15px; border-bottom: 1px solid #edf1f5; }
        .td-more-populated-icon { display: grid; width: 31px; height: 31px; flex: 0 0 31px; place-items: center; border-radius: 50%; }
        .td-more-populated-icon--green { background: #e8fbf2; color: #059669; }
        .td-more-populated-icon--blue { background: #eff6ff; color: #3b82f6; }
        .td-more-populated-header > div { min-width: 0; flex: 1 1 auto; }
        .td-more-populated-header h2 { margin: 0; color: #252525; font-size: 12px; font-weight: 700; line-height: 1.35; }
        .td-more-populated-header p { margin: 2px 0 0; color: #717783; font-size: 9px; line-height: 1.45; }
        .td-more-populated-header > button { display: inline-flex; min-height: 27px; flex: 0 0 auto; align-items: center; justify-content: center; gap: 5px; padding: 0 9px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; color: #334155; font: inherit; font-size: 9px; font-weight: 600; white-space: nowrap; cursor: pointer; }
        .td-more-populated-header > button:hover { border-color: #b7dfc4; color: #15803d; }
        .td-more-populated-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 18px; padding-top: 16px; }
        .td-more-populated-details > div { display: flex; min-width: 0; align-items: flex-start; gap: 8px; color: #8ca0bc; }
        .td-more-populated-details > div > svg { flex: 0 0 auto; margin-top: 2px; }
        .td-more-populated-details > div > span { display: grid; min-width: 0; gap: 2px; }
        .td-more-populated-details small { color: #737b86; font-size: 9px; line-height: 1.35; }
        .td-more-populated-details strong { overflow-wrap: anywhere; color: #303943; font-size: 10px; font-weight: 650; line-height: 1.4; }
        .td-more-documents-card { padding-bottom: 13px; }
        .td-more-document-list { display: grid; gap: 0; padding-top: 8px; }
        .td-more-documents-empty { display: flex; min-height: 120px; flex-direction: column; align-items: center; justify-content: center; padding: 18px 14px 12px; text-align: center; }
        .td-more-documents-empty > span { display: grid; width: 35px; height: 35px; place-items: center; margin-bottom: 7px; border-radius: 50%; background: #eff6ff; color: #3b82f6; }
        .td-more-documents-empty > strong { color: #334155; font-size: 10px; font-weight: 650; }
        .td-more-documents-empty > p { max-width: 330px; margin: 3px 0 9px; color: #737b86; font-size: 9px; line-height: 1.45; }
        .td-more-documents-empty > button { display: inline-flex; min-height: 27px; align-items: center; justify-content: center; gap: 5px; padding: 0 10px; border: 1px solid #dbe3ec; border-radius: 6px; background: #fff; color: #334155; font: inherit; font-size: 9px; font-weight: 600; cursor: pointer; }
        .td-more-documents-empty > button:hover { border-color: #b7dfc4; color: #15803d; }
        .td-more-document-row { display: flex; min-width: 0; min-height: 47px; align-items: center; gap: 9px; padding: 5px 3px; border-bottom: 1px solid #f1f3f6; }
        .td-more-document-row:last-child { border-bottom: 0; }
        .td-more-document-main { display: flex; min-width: 0; flex: 1 1 auto; align-items: center; gap: 10px; border-radius: 6px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
        .td-more-document-main:hover .td-more-document-info strong { color: #15803d; }
        .td-more-document-icon { display: grid; width: 26px; height: 26px; flex: 0 0 26px; place-items: center; border: 1px solid transparent; border-radius: 7px; }
        .td-more-document-icon.is-pdf { border-color: #fee2e2; background: #fff1f2; color: #ef4444; }
        .td-more-document-icon.is-doc { border-color: #e2e8f0; background: #f1f5f9; color: #64748b; }
        .td-more-document-icon.is-image { border-color: #d1fae5; background: #ecfdf5; color: #059669; }
        .td-more-document-info { display: grid; min-width: 0; gap: 2px; }
        .td-more-document-info strong { overflow: hidden; color: #303943; font-size: 9px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
        .td-more-document-info small { color: #737b86; font-size: 8px; line-height: 1.35; }
        .td-more-document-status { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 999px; background: #ecfdf5; color: #15803d; font-size: 8px; font-weight: 600; white-space: nowrap; }
        .td-more-document-menu { position: relative; flex: 0 0 auto; }
        .td-more-document-menu > summary { display: grid; width: 24px; height: 27px; place-items: center; border-radius: 5px; color: #94a3b8; list-style: none; cursor: pointer; }
        .td-more-document-menu > summary::-webkit-details-marker { display: none; }
        .td-more-document-menu > summary:hover, .td-more-document-menu[open] > summary { background: #f1f5f9; color: #475569; }
        .td-more-document-menu > div { position: absolute; top: calc(100% + 3px); right: 0; z-index: 8; display: grid; min-width: 132px; padding: 5px; border: 1px solid #e2e8f0; border-radius: 7px; background: #fff; box-shadow: 0 8px 20px rgba(15, 23, 42, .14); }
        .td-more-document-menu > div button { padding: 7px; border-radius: 5px; color: #475569; text-align: left; font: inherit; font-size: 9px; cursor: pointer; }
        .td-more-document-menu > div button:hover { background: #f1f5f9; color: #15803d; }
        .td-more-modal-overlay { z-index: 1100; background: rgba(15, 23, 42, .48); }
        .td-more-modal { width: min(520px, 100%); max-height: calc(100vh - 40px); overflow: auto; border: 1px solid #e6edf3; border-radius: 14px; background: #fff; box-shadow: 0 20px 60px rgba(15, 23, 42, .2); }
        .td-more-modal > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px 18px; border-bottom: 1px solid #edf1f4; }
        .td-more-modal > header h2 { margin: 0; color: #1f2937; font-size: 17px; font-weight: 700; }
        .td-more-modal > header p { margin: 5px 0 0; color: #64748b; font-size: 12px; line-height: 1.45; }
        .td-more-modal > header > button { display: grid; width: 30px; height: 30px; flex: 0 0 30px; place-items: center; border-radius: 7px; color: #64748b; cursor: pointer; }
        .td-more-modal > header > button:hover { background: #f1f5f9; color: #1f2937; }
        .td-more-modal-options { display: grid; gap: 8px; padding: 16px; }
        .td-more-modal-options > button { display: flex; min-width: 0; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e7edf3; border-radius: 9px; background: #fff; color: #64748b; text-align: left; cursor: pointer; }
        .td-more-modal-options > button:hover { border-color: #b7dfc4; background: #f8fdf9; color: #15803d; }
        .td-more-modal-options > button > span { display: grid; flex: 1; gap: 3px; }
        .td-document-preview-overlay { z-index: 2200; padding: 18px; background: rgba(15, 23, 42, .68); }
        .td-document-preview-modal { display: flex; width: min(940px, 100%); max-height: min(96vh, 1000px); flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 24px 70px rgba(15, 23, 42, .32); }
        .td-document-preview-modal > header { display: flex; min-width: 0; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 15px 20px; border-bottom: 1px solid #e9eef4; }
        .td-document-preview-modal > header > div { min-width: 0; }
        .td-document-preview-modal > header h2 { overflow: hidden; margin: 0; color: #1f2937; font-size: 13px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
        .td-document-preview-modal > header p { margin: 3px 0 0; color: #64748b; font-size: 10px; }
        .td-document-preview-modal > header > button { display: grid; width: 29px; height: 29px; flex: 0 0 29px; place-items: center; border-radius: 6px; color: #64748b; cursor: pointer; }
        .td-document-preview-modal > header > button:hover { background: #f1f5f9; color: #1f2937; }
        .td-document-preview-viewer { display: flex; min-height: 240px; height: min(84vh, 820px); overflow: auto; background: #eef2f6; }
        .td-document-preview-viewer > div,
        .td-document-preview-viewer #react-doc-viewer,
        .td-document-preview-viewer #proxy-renderer { display: flex; width: 100%; height: 100%; min-height: 0; flex: 1 1 auto; flex-direction: column; }
        .td-document-preview-frame { display: block; width: 100%; height: 100%; min-height: 0; flex: 1 1 auto; border: 0; background: #fff; }
        .td-document-preview-image { display: block; width: auto; max-width: 100%; height: auto; max-height: 100%; margin: 0 auto; object-fit: contain; }
        .td-document-preview-unsupported { display: flex; min-height: 240px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px; color: #64748b; text-align: center; }
        .td-document-preview-unsupported > svg { color: #3b82f6; }
        .td-document-preview-unsupported > strong { color: #334155; font-size: 13px; }
        .td-document-preview-unsupported > span { max-width: 420px; font-size: 11px; line-height: 1.5; }
        .td-more-modal-options strong { color: #273449; font-size: 12px; font-weight: 650; }
        .td-more-modal-options small { color: #64748b; font-size: 11px; line-height: 1.4; }
        .td-avail-preferences-overlay { z-index: 1150; padding: 22px; background: rgba(15, 23, 42, .62); }
        .td-avail-preferences-modal { display: flex; width: min(710px, 100%); max-height: min(90vh, 760px); flex-direction: column; overflow: hidden; border: 1px solid #e6edf3; border-radius: 12px; background: #fff; box-shadow: 0 24px 70px rgba(15, 23, 42, .3); }
        .td-avail-preferences-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 22px 14px; border-bottom: 1px solid #eef2f6; }
        .td-avail-preferences-header h1 { margin: 0; color: #252525; font-size: 16px; font-weight: 700; line-height: 1.35; }
        .td-avail-preferences-header p { margin: 4px 0 0; color: #6b7280; font-size: 10px; line-height: 1.45; }
        .td-avail-preferences-header > button { display: grid; width: 28px; height: 28px; flex: 0 0 28px; place-items: center; border-radius: 6px; color: #94a3b8; cursor: pointer; }
        .td-avail-preferences-header > button:hover { background: #f1f5f9; color: #334155; }
        .td-avail-preferences-body { min-height: 0; overflow-y: auto; padding: 0 22px; }
        .td-avail-preferences-section { padding: 15px 0 17px; border-bottom: 1px solid #edf1f5; }
        .td-avail-preferences-section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .td-avail-preferences-icon { display: grid; width: 29px; height: 29px; flex: 0 0 29px; place-items: center; border-radius: 50%; }
        .td-avail-preferences-icon--green { background: #ecfdf5; color: #059669; }
        .td-avail-preferences-icon--blue { background: #eff6ff; color: #2563eb; }
        .td-avail-preferences-icon--purple { background: #faf5ff; color: #a855f7; }
        .td-avail-preferences-icon--orange { background: #fffbeb; color: #d97706; }
        .td-avail-preferences-section-heading h2 { margin: 0; color: #252525; font-size: 12px; font-weight: 700; line-height: 1.35; }
        .td-avail-preferences-section-heading h2 small { color: #6b7280; font-size: 10px; font-weight: 500; }
        .td-avail-preferences-section-heading p { margin: 2px 0 0; color: #6b7280; font-size: 9px; line-height: 1.4; }
        .td-avail-preferences-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; padding-left: 38px; }
        .td-avail-pref-field { display: flex; min-width: 0; flex-direction: column; gap: 5px; color: #303943; font-size: 9px; font-weight: 650; }
        .td-avail-pref-field small { color: #6b7280; font-size: 9px; font-weight: 400; }
        .td-avail-pref-input-wrap { display: flex; min-height: 29px; align-items: center; gap: 7px; padding: 0 9px; border: 1px solid #dbe3ec; border-radius: 6px; background: #fff; color: #94a3b8; }
        .td-avail-pref-input-wrap:focus-within { border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(59, 130, 246, .1); }
        .td-avail-pref-input-wrap input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #334155; font: inherit; font-size: 9px; font-weight: 400; }
        .td-avail-pref-tags { display: flex; flex-wrap: wrap; gap: 5px; min-height: 21px; }
        .td-avail-pref-tags > span { display: inline-flex; min-height: 21px; align-items: center; gap: 3px; padding: 2px 5px 2px 7px; border: 1px solid #dce7f8; border-radius: 5px; background: #eff6ff; color: #334155; font-size: 8px; font-weight: 500; }
        .td-avail-pref-tags > span button { display: grid; width: 14px; height: 14px; place-items: center; border-radius: 3px; color: #64748b; cursor: pointer; }
        .td-avail-pref-tags > span button:hover { background: #dbeafe; color: #b42318; }
        .td-avail-pref-fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
        .td-avail-pref-fieldset legend { margin-bottom: 6px; color: #303943; font-size: 9px; font-weight: 650; }
        .td-avail-pref-checkboxes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 12px; }
        .td-avail-pref-checkboxes--inline { display: flex; flex-wrap: wrap; gap: 12px; }
        .td-avail-pref-checkboxes label { display: inline-flex; min-width: 0; align-items: center; gap: 5px; color: #475569; font-size: 9px; font-weight: 400; cursor: pointer; }
        .td-avail-pref-checkboxes input { width: 13px; height: 13px; flex: 0 0 13px; margin: 0; accent-color: #059669; }
        .td-avail-pref-field select,
        .td-avail-pref-field > input[type='date'] { width: 100%; min-height: 29px; padding: 0 9px; border: 1px solid #dbe3ec; border-radius: 6px; background: #fff; color: #334155; font: inherit; font-size: 9px; font-weight: 400; }
        .td-avail-pref-field select:focus,
        .td-avail-pref-field > input[type='date']:focus,
        .td-avail-pref-notes textarea:focus { border-color: #60a5fa; outline: 0; box-shadow: 0 0 0 2px rgba(59, 130, 246, .1); }
        .td-avail-preferences-section--notes { padding-bottom: 12px; border-bottom: 0; }
        .td-avail-pref-notes { display: block; padding-left: 38px; }
        .td-avail-pref-notes textarea { display: block; width: 100%; min-height: 56px; padding: 8px 10px; border: 1px solid #dbe3ec; border-radius: 6px; color: #334155; font: inherit; font-size: 9px; line-height: 1.45; resize: vertical; }
        .td-avail-pref-notes > small { display: block; margin-top: 4px; color: #6b7280; font-size: 8px; text-align: right; }
        .td-avail-pref-session-note { margin: 0 0 12px 38px; padding: 7px 9px; border-radius: 5px; background: #fffbeb; color: #92400e; font-size: 8px; line-height: 1.45; }
        .td-avail-pref-error { margin: 0 0 12px 38px; color: #b42318; font-size: 10px; }
        .td-avail-preferences-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 11px 22px; border-top: 1px solid #eef2f6; background: #fff; }
        .td-avail-preferences-footer > button { min-width: 67px; min-height: 30px; padding: 0 12px; border: 1px solid #dbe3ec; border-radius: 6px; background: #fff; color: #334155; font: inherit; font-size: 9px; font-weight: 600; cursor: pointer; }
        .td-avail-preferences-footer > button[type='submit'] { min-width: 94px; border-color: #20d653; background: #20d653; color: #064e24; }
        .td-avail-preferences-footer > button[type='submit']:hover:not(:disabled) { background: #16c34a; }
        .td-avail-preferences-footer > button:disabled { cursor: wait; opacity: .65; }
        .td-manage-docs-overlay { z-index: 1160; padding: 18px; background: rgba(15, 23, 42, .62); }
        .td-manage-docs-modal { display: flex; width: min(700px, 100%); max-height: min(92vh, 840px); flex-direction: column; overflow: hidden; border: 1px solid #e6edf3; border-radius: 12px; background: #fff; box-shadow: 0 24px 70px rgba(15, 23, 42, .3); }
        .td-manage-docs-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 28px 15px; border-bottom: 1px solid #eef2f6; }
        .td-manage-docs-header h1 { margin: 0; color: #252525; font-size: 19px; font-weight: 700; line-height: 1.3; }
        .td-manage-docs-header p { margin: 5px 0 0; color: #717783; font-size: 11px; line-height: 1.45; }
        .td-manage-docs-header > button { display: grid; width: 28px; height: 28px; flex: 0 0 28px; place-items: center; border-radius: 6px; color: #94a3b8; cursor: pointer; }
        .td-manage-docs-header > button:hover { background: #f1f5f9; color: #334155; }
        .td-manage-docs-header > button:disabled { cursor: wait; opacity: .6; }
        .td-manage-docs-body { min-height: 0; overflow-y: auto; padding: 0 28px 16px; }
        .td-manage-docs-section { padding: 16px 0 14px; border-bottom: 1px solid #edf1f5; }
        .td-manage-docs-section-heading { display: flex; min-width: 0; align-items: center; gap: 12px; margin-bottom: 12px; }
        .td-manage-docs-heading-icon { display: grid; width: 36px; height: 36px; flex: 0 0 36px; place-items: center; border-radius: 50%; }
        .td-manage-docs-heading-icon--blue { background: #eff8ff; color: #0ea5e9; }
        .td-manage-docs-heading-icon--purple { background: #faf5ff; color: #a855f7; }
        .td-manage-docs-section-heading > div { min-width: 0; flex: 1 1 auto; }
        .td-manage-docs-section-heading h2 { margin: 0; color: #252525; font-size: 13px; font-weight: 700; line-height: 1.4; }
        .td-manage-docs-section-heading h2 small { color: #737b86; font-size: 10px; font-weight: 400; }
        .td-manage-docs-section-heading p { margin: 2px 0 0; color: #717783; font-size: 10px; line-height: 1.4; }
        .td-manage-docs-dropzone { display: flex; min-height: 158px; flex-direction: column; align-items: center; justify-content: center; padding: 14px; border: 2px dashed #cbd9ff; border-radius: 14px; background: #fbfcff; text-align: center; transition: border-color .15s ease, background .15s ease; }
        .td-manage-docs-dropzone.is-active, .td-manage-docs-dropzone:hover { border-color: #60a5fa; background: #f5f9ff; }
        .td-manage-docs-cloud { display: grid; width: 42px; height: 42px; place-items: center; margin-bottom: 8px; border-radius: 50%; background: #f1f5ff; color: #818cf8; }
        .td-manage-docs-dropzone > strong { max-width: 100%; overflow-wrap: anywhere; color: #4b5563; font-size: 12px; font-weight: 600; }
        .td-manage-docs-dropzone > span:not(.td-manage-docs-cloud) { margin-top: 2px; color: #717783; font-size: 10px; }
        .td-manage-docs-dropzone > button { min-height: 30px; margin-top: 7px; padding: 0 18px; border: 1px solid #22a66a; border-radius: 7px; background: #fff; color: #15803d; font: inherit; font-size: 10px; font-weight: 600; cursor: pointer; }
        .td-manage-docs-dropzone > button:hover:not(:disabled) { background: #f0fdf4; }
        .td-manage-docs-dropzone > button:disabled { cursor: wait; opacity: .6; }
        .td-manage-docs-dropzone > small { margin-top: 8px; color: #717783; font-size: 9px; }
        .td-manage-docs-row { position: relative; display: flex; min-width: 0; min-height: 64px; align-items: center; gap: 12px; margin-top: 12px; padding: 9px 13px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, .035); }
        .td-manage-docs-file-icon { display: grid; width: 36px; height: 36px; flex: 0 0 36px; place-items: center; border: 1px solid transparent; border-radius: 8px; }
        .td-manage-docs-file-icon.is-pdf { border-color: #fee2e2; background: #fff1f2; color: #e11d48; }
        .td-manage-docs-file-icon.is-doc { border-color: #dbeafe; background: #eff6ff; color: #2563eb; }
        .td-manage-docs-file-icon.is-image { border-color: #d1fae5; background: #ecfdf5; color: #059669; }
        .td-manage-docs-file-info { display: grid; min-width: 0; flex: 1 1 auto; gap: 3px; }
        .td-manage-docs-file-info strong { overflow: hidden; color: #303943; font-size: 11px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
        .td-manage-docs-file-info small { color: #737b86; font-size: 9px; line-height: 1.4; }
        .td-manage-docs-view { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 5px; padding: 6px 5px; color: #596575; font: inherit; font-size: 10px; font-weight: 600; cursor: pointer; }
        .td-manage-docs-view:hover:not(:disabled) { color: #15803d; }
        .td-manage-docs-view:disabled { cursor: default; opacity: .45; }
        .td-manage-docs-menu { position: relative; flex: 0 0 auto; }
        .td-manage-docs-menu > summary { display: grid; width: 25px; height: 30px; place-items: center; border-radius: 5px; color: #94a3b8; list-style: none; cursor: pointer; }
        .td-manage-docs-menu > summary::-webkit-details-marker { display: none; }
        .td-manage-docs-menu > summary:hover, .td-manage-docs-menu[open] > summary { background: #f1f5f9; color: #475569; }
        .td-manage-docs-menu > div { position: absolute; top: calc(100% + 3px); right: 0; z-index: 5; display: grid; min-width: 142px; padding: 5px; border: 1px solid #e2e8f0; border-radius: 7px; background: #fff; box-shadow: 0 8px 20px rgba(15, 23, 42, .14); }
        .td-manage-docs-menu > div button { padding: 8px; border-radius: 5px; color: #475569; text-align: left; font: inherit; font-size: 10px; cursor: pointer; }
        .td-manage-docs-menu > div button:hover { background: #f1f5f9; color: #15803d; }
        .td-manage-docs-supporting { padding-top: 16px; }
        .td-manage-docs-supporting .td-manage-docs-section-heading { margin-bottom: 12px; }
        .td-manage-docs-add { display: inline-flex; min-height: 29px; flex: 0 0 auto; align-items: center; justify-content: center; gap: 5px; padding: 0 10px; border: 1px solid #22a66a; border-radius: 7px; background: #fff; color: #15803d; font: inherit; font-size: 10px; font-weight: 600; white-space: nowrap; cursor: pointer; }
        .td-manage-docs-add:hover:not(:disabled) { background: #f0fdf4; }
        .td-manage-docs-add:disabled { cursor: wait; opacity: .6; }
        .td-manage-docs-support-list { display: grid; gap: 0; }
        .td-manage-docs-support-list .td-manage-docs-row { margin-top: 0; }
        .td-manage-docs-support-list .td-manage-docs-row + .td-manage-docs-row { margin-top: 12px; }
        .td-manage-docs-info { display: flex; align-items: center; gap: 9px; margin-top: 13px; padding: 11px 12px; border: 1px solid #dbeafe; border-radius: 9px; background: #eff6ff; color: #4b5563; font-size: 10px; line-height: 1.5; }
        .td-manage-docs-info svg { flex: 0 0 auto; color: #3b82f6; fill: #3b82f6; stroke: #fff; }
        .td-manage-docs-api-note { margin: 8px 0 0; color: #64748b; font-size: 9px; line-height: 1.45; }
        .td-manage-docs-error { margin: 10px 0 0; color: #b42318; font-size: 10px; line-height: 1.45; }
        .td-manage-docs-footer { display: flex; justify-content: flex-end; gap: 9px; padding: 12px 28px; border-top: 1px solid #eef2f6; background: #fbfcfd; }
        .td-manage-docs-footer > button { min-width: 80px; min-height: 33px; padding: 0 15px; border: 1px solid #dbe3ec; border-radius: 7px; background: #fff; color: #334155; font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
        .td-manage-docs-footer > button[type='submit'] { min-width: 112px; border-color: #20d653; background: #20d653; color: #064e24; }
        .td-manage-docs-footer > button[type='submit']:hover:not(:disabled) { background: #16c34a; }
        .td-manage-docs-footer > button:disabled { cursor: wait; opacity: .65; }
        .td-profile-overview-panel { padding: 20px 22px; border: 1px solid #e5eaf0; border-radius: 14px; background: #fff; box-shadow: 0 2px 10px rgba(15, 23, 42, .035); }
        .td-profile-overview-panel-heading { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid #edf1f5; }
        .td-overview-icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 50%; background: #eff6ff; color: #3b82f6; }
        .td-profile-overview-panel-heading h2 { color: #1e293b; font-size: 16px; font-weight: 700; }
        .td-profile-overview-panel-heading p { margin-top: 3px; color: #64748b; font-size: 11px; }
        .td-profile-overview-panel-heading > button { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; padding: 7px 12px; border: 1px solid #dbe2ea; border-radius: 8px; background: #fff; color: #334155; font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
        .td-profile-overview-panel-heading > button:hover { border-color: #86c99b; color: #15803d; }
        .td-profile-overview-details { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; padding-top: 18px; }
        .td-overview-detail-list { display: grid; gap: 16px; }
        .td-overview-detail-list > div { display: flex; align-items: flex-start; gap: 10px; color: #94a3b8; }
        .td-overview-detail-list > div > svg { flex: 0 0 auto; margin-top: 2px; }
        .td-overview-detail-list span { display: grid; gap: 2px; min-width: 0; }
        .td-overview-detail-list strong { overflow-wrap: anywhere; color: #334155; font-size: 12px; font-weight: 650; }
        .td-overview-detail-list small { color: #94a3b8; font-size: 10px; }
        .td-overview-summary { padding-left: 22px; border-left: 1px solid #edf1f5; }
        .td-overview-summary h3 { display: flex; align-items: center; gap: 8px; color: #334155; font-size: 12px; font-weight: 700; }
        .td-overview-summary h3 svg { color: #94a3b8; }
        .td-overview-summary p { margin-top: 8px; color: #64748b; font-size: 12px; line-height: 1.7; white-space: pre-wrap; }

        .td-basic-profile-modal-backdrop { position: fixed; inset: 0; z-index: 2500; display: grid; place-items: center; padding: 18px; background: rgba(15, 23, 42, .52); }
        .td-basic-profile-modal { display: flex; flex-direction: column; width: min(690px, 100%); max-height: min(860px, calc(100dvh - 36px)); overflow: hidden; border: 1px solid #e6ebf0; border-radius: 16px; background: #fff; box-shadow: 0 24px 70px rgba(15, 23, 42, .25); }
        .td-basic-profile-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px 24px 16px; border-bottom: 1px solid #edf1f5; }
        .td-basic-profile-modal-header h2 { color: #1f2937; font-size: 19px; line-height: 1.3; font-weight: 700; }
        .td-basic-profile-modal-header p { max-width: 560px; margin-top: 4px; color: #64748b; font-size: 12px; line-height: 1.5; }
        .td-basic-profile-modal-header > button { display: grid; width: 30px; height: 30px; flex: 0 0 30px; place-items: center; border: 0; border-radius: 7px; background: transparent; color: #64748b; cursor: pointer; }
        .td-basic-profile-modal-header > button:hover { background: #f1f5f9; color: #1f2937; }
        .td-basic-profile-modal-body { overflow-y: auto; padding: 18px 24px; }
        .td-basic-profile-modal-body h3 { margin: 0; color: #1f2937; font-size: 13px; font-weight: 700; }
        .td-basic-profile-photo { margin-bottom: 18px; }
        .td-basic-profile-photo-row { display: flex; align-items: center; gap: 14px; margin-top: 10px; }
        .td-basic-profile-avatar { display: grid; width: 68px; height: 68px; flex: 0 0 68px; place-items: center; overflow: hidden; border-radius: 50%; background: #e8eef6; color: #334155; font-size: 20px; font-weight: 700; }
        .td-basic-profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .td-basic-profile-photo-controls { display: grid; justify-items: start; gap: 5px; }
        .td-basic-profile-photo-controls > button { display: inline-flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #334155; font: inherit; font-size: 10px; font-weight: 650; cursor: pointer; }
        .td-basic-profile-photo-controls > button:hover:not(:disabled) { border-color: #94a3b8; background: #f8fafc; }
        .td-basic-profile-photo-controls > button:disabled { opacity: .6; cursor: wait; }
        .td-basic-profile-photo-controls p, .td-basic-profile-photo-controls small { color: #64748b; font-size: 10px; }
        .td-basic-profile-photo-controls small { color: #b42318; }
        .td-basic-profile-section-title { margin-bottom: 12px !important; }
        .td-basic-profile-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
        .td-basic-profile-fields > label, .td-basic-profile-field > label:not(.td-basic-profile-label-text) { display: grid; gap: 6px; color: #334155; font-size: 11px; font-weight: 650; }
        .td-basic-profile-label-text { display: inline-flex; align-items: center; gap: 3px; }
        .td-basic-profile-label-text > span, .td-basic-profile-levels legend > span { color: #dc2626; }
        .td-basic-profile-fields input:not([type='checkbox']), .td-basic-profile-fields textarea { width: 100%; min-width: 0; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #1f2937; font: inherit; font-size: 12px; outline: none; }
        .td-basic-profile-fields input:not([type='checkbox']) { height: 38px; padding: 0 11px; }
        .td-basic-profile-fields textarea { min-height: 96px; padding: 10px 11px; resize: vertical; line-height: 1.55; }
        .td-basic-profile-fields input:focus, .td-basic-profile-fields textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, .12); }
        .td-basic-profile-fields small { display: flex; justify-content: space-between; gap: 8px; color: #64748b; font-size: 10px; font-weight: 400; line-height: 1.45; }
        .td-basic-profile-field { min-width: 0; }
        .td-basic-profile-chipbox { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-height: 42px; padding: 5px 7px; border: 1px solid #cbd5e1; border-radius: 8px; }
        .td-basic-profile-chipbox:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, .12); }
        .td-basic-profile-chipbox button { display: inline-flex; align-items: center; gap: 5px; padding: 5px 7px; border: 0; border-radius: 6px; background: #f1f5f9; color: #334155; font: inherit; font-size: 10px; cursor: pointer; }
        .td-basic-profile-chipbox input:not([type='checkbox']) { flex: 1 1 160px; height: 26px; padding: 0 4px; border: 0; outline: none; box-shadow: none; }
        .td-basic-profile-levels { min-width: 0; margin: 0; padding: 0; border: 0; }
        .td-basic-profile-levels legend { margin-bottom: 7px; color: #334155; font-size: 11px; font-weight: 650; }
        .td-basic-profile-levels > div { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
        .td-basic-profile-levels label { display: flex; align-items: center; gap: 7px; color: #475569; font-size: 10px; cursor: pointer; }
        .td-basic-profile-levels input { width: 14px; height: 14px; accent-color: #16a34a; }
        .td-basic-profile-summary { grid-column: 1 / -1; }
        .td-basic-profile-error { margin-top: 12px; color: #b42318; font-size: 11px; }
        .td-basic-profile-modal-footer { display: flex; justify-content: flex-end; gap: 9px; padding: 14px 24px; border-top: 1px solid #edf1f5; }
        .td-basic-profile-modal-footer button { min-width: 88px; padding: 9px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #1f2937; font: inherit; font-size: 11px; font-weight: 650; cursor: pointer; }
        .td-basic-profile-modal-footer button[type='submit'] { min-width: 112px; border-color: #22c55e; background: #22c55e; color: #fff; }
        .td-basic-profile-modal-footer button[type='submit']:hover:not(:disabled) { background: #16a34a; }
        .td-basic-profile-modal-footer button:disabled { opacity: .6; cursor: wait; }

        .td-profile-main-title {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.5px;
          margin-bottom: 24px;
        }

        .td-profile-header-card {
          background: #FFFFFF;
          border-radius: 22px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.04);
          padding: 26px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 26px;
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
          background: linear-gradient(135deg, #d1fae5, #bbf7d0);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-profile-avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 24px;
          color: #14532d;
          letter-spacing: 0.04em;
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
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 2px;
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
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #BBF7D0;
          line-height: 1.2;
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

        .td-prof-edit-page { width: 100%; max-width: none; padding-bottom: 40px; }
        .td-prof-skills-card { padding: 28px; border: 1px solid #e6edf3; border-radius: 14px; background: #fff; }
        .td-prof-skills-heading { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }
        .td-prof-skills-heading-icon { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 46px; border-radius: 50%; background: #eff6ff; color: #2563eb; }
        .td-prof-skills-heading h1 { margin: 0; color: #252525; font-size: 20px; font-weight: 700; line-height: 1.3; }
        .td-prof-skills-heading p { margin: 4px 0 0; color: #6b7280; font-size: 15px; line-height: 1.4; }
        .td-prof-skills-list { display: flex; flex-direction: column; gap: 28px; }
        .td-prof-skills-item { display: grid; grid-template-columns: 42px minmax(0, 1fr); align-items: start; gap: 15px; min-height: 136px; padding: 23px; border: 1px solid #edf2f7; border-radius: 14px; background: #f8fafc; }
        .td-prof-skills-item-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; }
        .td-prof-skills-item-icon--green { background: #ecfdf5; color: #059669; }
        .td-prof-skills-item-icon--blue { background: #eff6ff; color: #2563eb; }
        .td-prof-skills-item-icon--purple { background: #faf5ff; color: #9333ea; }
        .td-prof-skills-item-icon--orange { background: #fffbeb; color: #d97706; }
        .td-prof-skills-item-content { min-width: 0; }
        .td-prof-skills-item-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .td-prof-skills-item-title h2 { margin: 0; color: #252525; font-size: 15px; font-weight: 700; line-height: 1.35; }
        .td-prof-skills-item-title p { margin: 3px 0 0; color: #6b7280; font-size: 13px; line-height: 1.4; }
        .td-prof-skills-item-title button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-width: 76px; min-height: 34px; margin-top: 0; padding: 0 12px; border: 1px solid #dbe3ec; border-radius: 8px; background: #fff; color: #303943; font: inherit; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .td-prof-skills-item-title button:disabled { cursor: default; opacity: 1; }
        .td-prof-skills-tags { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 17px; }
        .td-prof-skills-tags span { display: inline-flex; align-items: center; min-height: 30px; padding: 4px 13px; border: 1px solid #dce5ef; border-radius: 999px; background: #f1f5f9; color: #252525; font-size: 12px; line-height: 1.3; }
        .td-prof-skills-modal-overlay { z-index: 1100; background: rgba(15, 23, 42, .48); }
        .td-prof-skills-modal { display: flex; flex-direction: column; width: min(520px, 100%); max-height: calc(100vh - 40px); overflow: hidden; border: 1px solid #e6edf3; border-radius: 14px; background: #fff; box-shadow: 0 20px 60px rgba(15, 23, 42, .2); }
        .td-prof-skills-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px 18px; border-bottom: 1px solid #edf1f4; }
        .td-prof-skills-modal-header h2 { margin: 0; color: #1f2937; font-size: 17px; font-weight: 700; }
        .td-prof-skills-modal-header p { margin: 5px 0 0; color: #64748b; font-size: 12px; line-height: 1.45; }
        .td-prof-skills-modal-header > button { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 30px; border-radius: 7px; color: #64748b; cursor: pointer; }
        .td-prof-skills-modal-header > button:hover { background: #f1f5f9; color: #1f2937; }
        .td-prof-skills-modal-body { overflow-y: auto; padding: 20px 24px; }
        .td-prof-skills-modal-body > label { display: block; margin-bottom: 7px; color: #344054; font-size: 12px; font-weight: 650; }
        .td-prof-skills-input-row { display: flex; gap: 8px; }
        .td-prof-skills-input-row input { min-width: 0; min-height: 40px; flex: 1; padding: 0 11px; border: 1px solid #d9e0e7; border-radius: 7px; background: #fff; color: #1f2937; font: inherit; font-size: 12px; outline: none; }
        .td-prof-skills-input-row input:focus { border-color: #15946e; box-shadow: 0 0 0 3px rgba(21, 148, 110, .1); }
        .td-prof-skills-input-row > button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-width: 74px; padding: 0 12px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #334155; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
        .td-prof-skills-input-row > button:disabled { cursor: not-allowed; opacity: .55; }
        .td-prof-skills-modal-tags { display: flex; flex-wrap: wrap; gap: 8px; min-height: 44px; margin-top: 17px; }
        .td-prof-skills-modal-tags > span { display: inline-flex; align-items: center; gap: 5px; min-height: 32px; padding: 3px 6px 3px 11px; border: 1px solid #dce5ef; border-radius: 999px; background: #f1f5f9; color: #334155; font-size: 11px; }
        .td-prof-skills-modal-tags > span > button { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; color: #64748b; cursor: pointer; }
        .td-prof-skills-modal-tags > span > button:hover { background: #e2e8f0; color: #b42318; }
        .td-prof-skills-modal-tags > p { align-self: center; margin: 0; color: #64748b; font-size: 12px; }
        .td-prof-skills-session-note { margin: 18px 0 0; padding: 10px 12px; border-radius: 7px; background: #fffbeb; color: #92400e; font-size: 11px; line-height: 1.45; }
        .td-prof-skills-modal-footer { display: flex; justify-content: flex-end; gap: 9px; padding: 14px 24px 18px; border-top: 1px solid #edf1f4; background: #fbfcfd; }
        .td-prof-skills-modal-footer > button { min-height: 36px; padding: 0 14px; border: 1px solid #dbe3ec; border-radius: 7px; background: #fff; color: #334155; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
        .td-prof-skills-modal-footer > button[type='submit'] { border-color: #15803d; background: #15803d; color: #fff; }
        .td-prof-skills-modal-footer > button[type='submit']:hover { background: #166534; }
        @media (max-width: 720px) {
          .td-prof-edit-page { padding-bottom: 88px; }
          .td-more-card { min-height: 0; padding: 20px; }
          .td-more-empty-state { min-height: 340px; }
          .td-more-populated { margin-top: 16px; }
          .td-more-populated-card { padding: 15px; }
          .td-more-populated-details { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .td-more-populated-header { align-items: flex-start; }
          .td-document-preview-overlay { padding: 10px; }
          .td-document-preview-modal { max-height: calc(100vh - 20px); }
          .td-document-preview-viewer { height: calc(100vh - 100px); }
          .td-more-shortcuts { grid-template-columns: 1fr; gap: 16px; padding: 20px 4px 2px; }
          .td-more-shortcut { align-items: center; }
          .td-more-modal { max-height: calc(100vh - 32px); }
          .td-avail-preferences-overlay { padding: 14px; }
          .td-avail-preferences-modal { max-height: calc(100vh - 28px); }
          .td-manage-docs-overlay { padding: 12px; }
          .td-manage-docs-modal { max-height: calc(100vh - 24px); }
          .td-manage-docs-header { padding: 18px 20px 13px; }
          .td-manage-docs-body { padding: 0 20px 14px; }
          .td-manage-docs-footer { padding-right: 20px; padding-left: 20px; }
          .td-avail-preferences-grid { padding-left: 0; }
          .td-avail-pref-notes { padding-left: 0; }
          .td-avail-pref-session-note,
          .td-avail-pref-error { margin-left: 0; }
          .td-prof-skills-card { padding: 20px; }
          .td-prof-skills-heading { align-items: flex-start; gap: 12px; margin-bottom: 20px; }
          .td-prof-skills-heading h1 { font-size: 18px; }
          .td-prof-skills-heading p { font-size: 13px; }
          .td-prof-skills-list { gap: 16px; }
          .td-prof-skills-item { min-height: 0; padding: 16px; gap: 12px; }
          .td-prof-skills-modal { max-height: calc(100vh - 32px); }
        }
        @media (max-width: 480px) {
          .td-more-card { padding: 16px; }
          .td-more-heading p { max-width: 34ch; }
          .td-more-empty-state { min-height: 320px; padding: 18px 4px 22px; }
          .td-more-populated-card { padding: 12px; }
          .td-more-populated-header { flex-wrap: wrap; gap: 8px; }
          .td-more-populated-header > div { flex-basis: calc(100% - 42px); }
          .td-more-populated-header > button { margin-left: 39px; }
          .td-more-populated-details { grid-template-columns: minmax(0, 1fr); gap: 10px; padding-top: 12px; }
          .td-more-document-row { gap: 6px; }
          .td-more-document-status { padding: 3px 5px; font-size: 7px; }
          .td-more-document-info strong { font-size: 8px; }
          .td-document-preview-overlay { padding: 6px; }
          .td-document-preview-modal { max-height: calc(100vh - 12px); border-radius: 9px; }
          .td-document-preview-modal > header { padding: 12px; }
          .td-document-preview-viewer { height: calc(100vh - 76px); }
          .td-more-illustration { transform: scale(.9); margin-top: -6px; margin-bottom: 5px; }
          .td-more-empty-state h2 { font-size: 14px; }
          .td-more-empty-state > p { font-size: 10px; }
          .td-more-modal-overlay { padding: 12px; }
          .td-more-modal > header { padding: 18px 16px 14px; }
          .td-more-modal-options { padding: 12px; }
          .td-more-modal-options > button { gap: 9px; padding: 10px; }
          .td-avail-preferences-overlay { padding: 8px; }
          .td-avail-preferences-modal { max-height: calc(100vh - 16px); border-radius: 9px; }
          .td-manage-docs-overlay { padding: 8px; }
          .td-manage-docs-modal { max-height: calc(100vh - 16px); border-radius: 9px; }
          .td-manage-docs-header { padding: 15px 14px 11px; }
          .td-manage-docs-header h1 { font-size: 17px; }
          .td-manage-docs-header p { max-width: 46ch; font-size: 10px; }
          .td-manage-docs-body { padding: 0 14px 12px; }
          .td-manage-docs-section-heading { gap: 9px; }
          .td-manage-docs-section-heading p { font-size: 9px; }
          .td-manage-docs-dropzone { min-height: 145px; }
          .td-manage-docs-row { gap: 8px; padding: 8px; }
          .td-manage-docs-file-icon { width: 32px; height: 32px; flex-basis: 32px; }
          .td-manage-docs-file-info strong { font-size: 10px; }
          .td-manage-docs-view { gap: 3px; font-size: 9px; }
          .td-manage-docs-add { min-height: 27px; padding: 0 7px; font-size: 9px; }
          .td-manage-docs-footer { padding: 10px 14px; }
          .td-manage-docs-footer > button { flex: 1; }
          .td-avail-preferences-header { padding: 15px 14px 11px; }
          .td-avail-preferences-header h1 { font-size: 14px; }
          .td-avail-preferences-body { padding: 0 14px; }
          .td-avail-preferences-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; }
          .td-avail-preferences-section { padding: 12px 0; }
          .td-avail-pref-checkboxes--inline { gap: 10px; }
          .td-avail-preferences-footer { padding: 10px 14px; }
          .td-prof-skills-card { padding: 14px; }
          .td-prof-skills-heading-icon { width: 40px; height: 40px; flex-basis: 40px; }
          .td-prof-skills-heading { gap: 10px; margin-bottom: 16px; }
          .td-prof-skills-heading h1 { font-size: 16px; }
          .td-prof-skills-heading p { font-size: 12px; }
          .td-prof-skills-item { grid-template-columns: 34px minmax(0, 1fr); gap: 10px; padding: 13px; }
          .td-prof-skills-item-icon { width: 34px; height: 34px; }
          .td-prof-skills-item-title { flex-wrap: wrap; }
          .td-prof-skills-item-title h2 { font-size: 13px; }
          .td-prof-skills-item-title p { font-size: 11px; }
          .td-prof-skills-item-title button { min-height: 32px; }
          .td-prof-skills-tags { gap: 7px; margin-top: 12px; }
          .td-prof-skills-tags span { min-height: 27px; padding: 4px 10px; font-size: 11px; }
          .td-prof-skills-modal-overlay { padding: 12px; }
          .td-prof-skills-modal-header { padding: 18px 16px 14px; }
          .td-prof-skills-modal-body { padding: 16px; }
          .td-prof-skills-modal-footer { padding: 12px 16px 16px; }
          .td-prof-skills-modal-footer > button { flex: 1; }
        }

        .td-profile-preview-page { max-width: 1120px; margin: 0 auto; padding: 12px 0 42px; color: #253044; }
        .td-preview-page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
        .td-preview-page-heading h1 { margin-top: 7px; color: #202b3d; font-size: 25px; line-height: 1.2; font-weight: 700; }
        .td-preview-back-btn { display: inline-flex; align-items: center; gap: 7px; padding: 0; color: #657185; font-size: 12px; font-weight: 600; cursor: pointer; }
        .td-preview-page-actions { display: flex; flex-wrap: wrap; gap: 10px; }
        .td-preview-page-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 38px; padding: 0 14px; border: 1px solid #d5dce5; border-radius: 6px; background: #fff; color: #344256; font-size: 12px; font-weight: 600; cursor: pointer; }
        .td-preview-page-actions button:hover { background: #f7faf9; border-color: #9ab8ad; }
        .td-preview-share-message { margin: -8px 0 14px; color: #08755d; font-size: 12px; }
        .td-preview-card { overflow: hidden; padding: 0 30px 28px; border: 1px solid #e7ebef; border-radius: 9px; background: #fff; box-shadow: 0 4px 18px rgba(15, 23, 42, .06); }
        .td-preview-hero { display: flex; align-items: center; gap: 22px; min-height: 154px; padding: 27px 0; }
        .td-preview-avatar { display: grid; place-items: center; width: 88px; height: 88px; flex: 0 0 88px; overflow: hidden; border: 3px solid #e7ecef; border-radius: 50%; background: #e5f0ec; color: #08755d; font-size: 26px; font-weight: 700; }
        .td-preview-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .td-preview-hero-copy { min-width: 0; }
        .td-preview-name-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
        .td-preview-name-row h2 { color: #1f2c3d; font-size: 22px; line-height: 1.2; font-weight: 700; }
        .td-preview-verified { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 999px; background: #e5f5ee; color: #168263; font-size: 10px; font-weight: 700; }
        .td-preview-verified--muted { background: #f1f3f5; color: #64748b; }
        .td-preview-hero-copy > p { margin-top: 5px; color: #4e5c6e; font-size: 14px; }
        .td-preview-meta { display: flex; flex-wrap: wrap; gap: 17px; margin-top: 11px; color: #6b7789; font-size: 12px; }
        .td-preview-meta span { display: inline-flex; align-items: center; gap: 6px; }
        .td-preview-meta svg { color: #08755d; }
        .td-preview-section { min-width: 0; padding: 20px 0; }
        .td-preview-section h2 { display: flex; align-items: center; gap: 9px; color: #263447; font-size: 15px; font-weight: 700; }
        .td-preview-section h2 svg { flex: 0 0 auto; color: #08755d; }
        .td-preview-summary > p { margin-top: 12px; color: #5d6878; font-size: 12px; line-height: 1.75; white-space: pre-line; }
        .td-preview-experience .td-preview-list { margin-top: 17px; }
        .td-preview-list { display: grid; gap: 16px; }
        .td-preview-list-item { position: relative; display: flex; gap: 13px; padding: 0 0 0 2px; }
        .td-preview-timeline-dot { width: 11px; height: 11px; flex: 0 0 11px; margin-top: 3px; border: 2px solid #128064; border-radius: 50%; background: #fff; }
        .td-preview-list-item > div:last-child { min-width: 0; }
        .td-preview-list-item span, .td-preview-education-item span { display: block; color: #718093; font-size: 10px; font-weight: 600; }
        .td-preview-list-item strong, .td-preview-education-item strong { display: block; margin-top: 4px; color: #273449; font-size: 13px; line-height: 1.35; }
        .td-preview-list-item p, .td-preview-education-item p { margin-top: 3px; color: #718096; font-size: 11px; line-height: 1.5; }
        .td-preview-list-item .td-preview-experience-description { margin-top: 7px; color: #566274; white-space: pre-line; }
        .td-preview-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 36px; }
        .td-preview-column { min-width: 0; }
        .td-preview-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .td-preview-tags span { padding: 6px 10px; border-radius: 5px; background: #f1f6f4; color: #40594f; font-size: 10px; }
        .td-preview-tags em { color: #64748b; font-size: 12px; font-style: normal; }
        .td-preview-expertise-details { display: grid; gap: 8px; margin-top: 12px; }
        .td-preview-expertise-details > div { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 8px; }
        .td-preview-expertise-details dt { color: #273449; font-size: 10px; font-weight: 700; }
        .td-preview-expertise-details dd { min-width: 0; color: #4b5563; font-size: 10px; line-height: 1.55; }
        .td-preview-education-item, .td-preview-certification-item { display: flex; align-items: flex-start; gap: 11px; margin-top: 14px; }
        .td-preview-education-item > svg, .td-preview-certification-item > svg { width: 29px; height: 29px; flex: 0 0 29px; padding: 7px; border-radius: 5px; background: #eff5f3; color: #08755d; }
        .td-preview-education-item > div, .td-preview-certification-item > div { min-width: 0; }
        .td-preview-certification-list { display: grid; gap: 14px; }
        .td-preview-certification-item strong { color: #273449; font-size: 12px; }
        .td-preview-certification-item p { margin-top: 4px; color: #718096; font-size: 10px; line-height: 1.5; }
        .td-preview-certification-status { margin-left: auto; padding: 3px 7px; border-radius: 999px; background: #e5f5ee; color: #168263; font-size: 9px; font-weight: 700; }
        .td-preview-certification-status.is-muted { background: #f1f3f5; color: #64748b; }
        .td-preview-empty { margin-top: 12px; color: #718096; font-size: 11px; }
        .td-preview-resume { display: flex; align-items: center; flex-wrap: wrap; gap: 13px; padding-top: 19px; }
        .td-preview-resume > span { display: inline-flex; align-items: center; gap: 6px; color: #344256; font-size: 12px; font-weight: 700; }
        .td-preview-resume > span svg { color: #08755d; }
        .td-preview-resume > strong { color: #718096; font-size: 11px; font-weight: 500; }
        .td-preview-doc-actions { display: flex; gap: 7px; margin-left: auto; }
        .td-preview-doc-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 30px; padding: 0 9px; border: 1px solid #cfd6df; border-radius: 5px; background: #fff; color: #475569; font-size: 10px; font-weight: 600; cursor: pointer; }
        .td-preview-doc-actions button:hover { background: #f8fafc; }
        @media (max-width: 720px) {
          .td-profile-preview-page { padding: 8px 0 88px; }
          .td-preview-page-heading { align-items: flex-start; flex-direction: column; gap: 13px; }
          .td-preview-page-heading h1 { font-size: 22px; }
          .td-preview-page-actions { width: 100%; }
          .td-preview-page-actions button { flex: 1; }
          .td-preview-card { padding: 0 18px 22px; }
          .td-preview-hero { align-items: flex-start; gap: 14px; min-height: unset; padding: 22px 0; }
          .td-preview-avatar { width: 62px; height: 62px; flex-basis: 62px; font-size: 19px; }
          .td-preview-name-row h2 { font-size: 18px; }
          .td-preview-meta { gap: 8px 14px; }
          .td-preview-grid { grid-template-columns: 1fr; gap: 0; }
          .td-preview-expertise-details > div { grid-template-columns: 100px minmax(0, 1fr); }
          .td-preview-resume { align-items: flex-start; flex-direction: column; }
          .td-preview-doc-actions { margin-left: 0; }
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
          width: 100%;
          min-height: 134px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          font: inherit;
          color: inherit;
          background: #FAFAFA;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .td-profile-section-card:hover {
          border-color: #B9D8C3;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
        }

        .td-profile-section-card:focus-visible {
          outline: 3px solid rgba(22, 133, 59, 0.25);
          outline-offset: 2px;
        }

        .td-psc-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .td-psc-icon-box {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          background: #EFF4FF;
          color: #13833B;
        }

        .td-psc-status {
          padding: 7px 9px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
        }

        .td-psc-status.is-complete {
          color: #08752E;
          background: #E5F7EA;
        }

        .td-psc-status.is-incomplete {
          color: #9A7800;
          background: #FBF7DF;
        }

        .td-psc-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .td-psc-arrow {
          flex: 0 0 auto;
          color: #13833B;
          transition: transform 0.2s ease;
        }

        .td-profile-section-card:hover .td-psc-arrow {
          transform: translateX(2px);
        }

        .td-psc-title {
          font-size: 20px;
          font-weight: 600;
          color: #555555;
          margin: 0;
          letter-spacing: -0.25px;
        }

        @media (max-width: 1024px) {
          .td-profile-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .td-profile-page-heading { align-items: flex-start; }
          .td-profile-overview-top { grid-template-columns: 1fr; }
          .td-profile-overview-top .td-profile-header-card { min-height: 0; padding: 22px; }
          .td-profile-overview-top .td-profile-header-left { flex-direction: row; align-items: flex-start; gap: 18px; }
          .td-profile-overview-top .td-profile-avatar-container { width: clamp(76px, 18vw, 120px); height: clamp(76px, 18vw, 120px); }
          .td-profile-overview-top .td-profile-header-actions { width: auto; margin: 0 0 0 auto; }
          .td-profile-overview-top .td-profile-meta-row { align-items: flex-start; }
          .td-profile-overview-top .td-profile-header-actions { margin: 16px 0 0; }
          .td-profile-overview-top .td-profile-btn-edit { padding: 9px 12px; font-size: 12px; }
          .td-profile-tabs { margin-right: -4px; border-radius: 10px; }
          .td-profile-overview-panel { padding: 16px; }
          .td-profile-overview-details { grid-template-columns: 1fr; gap: 16px; }
          .td-overview-summary { padding: 14px 0 0; border-top: 1px solid #edf1f5; border-left: 0; }
        }

        @media (max-width: 480px) {
          .td-basic-profile-modal-backdrop { padding: 10px; }
          .td-basic-profile-modal { max-height: calc(100dvh - 20px); border-radius: 12px; }
          .td-basic-profile-modal-header, .td-basic-profile-modal-body { padding-right: 16px; padding-left: 16px; }
          .td-basic-profile-modal-header h2 { font-size: 16px; }
          .td-basic-profile-fields { grid-template-columns: 1fr; gap: 12px; }
          .td-basic-profile-summary { grid-column: auto; }
          .td-basic-profile-levels > div { grid-template-columns: 1fr; }
          .td-basic-profile-modal-footer { padding: 12px 16px; }
          .td-profile-page-heading { align-items: center; }
          .td-profile-page-heading p { max-width: 230px; font-size: 11px; }
          .td-profile-page-heading > .td-profile-btn-preview { gap: 5px; padding: 7px 9px; font-size: 10px; }
          .td-profile-overview-top .td-profile-header-card { align-items: stretch; }
          .td-profile-overview-top .td-profile-header-left { align-items: flex-start; }
          .td-profile-overview-top .td-profile-name-row h2 { font-size: 18px; }
          .td-profile-overview-top .td-profile-header-actions { margin: 14px 0 0; }
          .td-profile-readiness { padding: 15px; }
          .td-readiness-checklist { grid-template-columns: 1fr; }
          .td-profile-overview-panel-heading { align-items: flex-start; }
          .td-profile-overview-panel-heading p { max-width: 220px; }
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
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #d1fae5, #bbf7d0);
          color: #14532d;
          font-weight: 800;
          font-size: 22px;
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
          border-radius: 18px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.03);
          padding: 22px 24px;
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
          border-radius: 18px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.03);
          padding: 30px 30px 28px;
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

        .td-pers-required-marker {
          color: #DC2626;
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

        .td-change-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          border: 0;
          padding: 0;
          color: #1E293B;
          background: transparent;
          font: inherit;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .td-change-back-btn:hover {
          color: #16A34A;
        }

        .td-change-email-page {
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-change-email-header {
          margin-bottom: 28px;
        }

        .td-change-email-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .td-change-email-desc {
          max-width: 420px;
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
        }

        .td-change-email-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px 20px 16px;
        }

        .td-change-email-field {
          display: grid;
          gap: 7px;
          margin-bottom: 14px;
          color: #111827;
          font-size: 12px;
          font-weight: 700;
        }

        .td-change-email-current,
        .td-change-email-field input {
          display: flex;
          align-items: center;
          width: 100%;
          min-height: 32px;
          border: 1px solid #D6DBE3;
          border-radius: 20px;
          color: #374151;
          background: #F1F5FF;
          font: inherit;
          font-size: 12px;
          font-weight: 500;
        }

        .td-change-email-current {
          gap: 8px;
          padding: 0 10px;
          color: #6B7280;
        }

        .td-change-email-field input {
          padding: 7px 12px;
          outline: none;
          background: #FFFFFF;
        }

        .td-change-email-field input:focus {
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .td-change-email-field input::placeholder {
          color: #CBD0D9;
        }

        .td-change-email-error {
          margin: -3px 0 10px;
          color: #B91C1C;
          font-size: 12px;
        }

        .td-change-email-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
          padding-top: 14px;
          border-top: 1px solid #F1F5F9;
        }

        .td-change-email-cancel,
        .td-change-email-submit {
          border-radius: 22px;
          padding: 9px 22px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-change-email-cancel {
          color: #134E4A;
          background: #FFFFFF;
          border: 1px solid #134E4A;
        }

        .td-change-email-submit {
          color: #FFFFFF;
          background: #EEF0F3;
          border: 1px solid #EEF0F3;
        }

        .td-change-email-submit:not(:disabled) {
          color: #000000;
          background: #2AE156;
          border-color: #2AE156;
        }

        .td-change-email-cancel:disabled,
        .td-change-email-submit:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .td-change-email-security {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding: 16px;
          border-radius: 8px;
          color: #14532D;
          background: #EEF2FF;
          font-size: 12px;
        }

        .td-change-email-security strong {
          display: block;
          margin-bottom: 2px;
          color: #172554;
        }

        .td-change-email-security p {
          max-width: 680px;
          color: #475569;
          line-height: 1.45;
        }

        @media (max-width: 640px) {
          .td-change-email-card {
            padding: 20px 16px 16px;
          }

          .td-change-email-actions {
            justify-content: stretch;
          }

          .td-change-email-cancel,
          .td-change-email-submit {
            flex: 1;
          }
        }

        .td-change-phone-page {
          max-width: 1050px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 60px;
        }

        .td-change-phone-header {
          margin-bottom: 28px;
        }

        .td-change-phone-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .td-change-phone-desc {
          max-width: 420px;
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
        }

        .td-change-phone-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 38px 40px 20px;
        }

        .td-change-phone-field {
          display: grid;
          gap: 7px;
          margin-bottom: 20px;
          color: #111827;
          font-size: 12px;
          font-weight: 700;
        }

        .td-change-phone-current,
        .td-change-phone-input-wrap {
          display: flex;
          align-items: center;
          min-height: 34px;
          border: 1px solid #D6DBE3;
          border-radius: 20px;
          overflow: hidden;
        }

        .td-change-phone-current {
          gap: 8px;
          padding: 0 12px;
          color: #6B7280;
          background: #F1F5FF;
          font-weight: 500;
        }

        .td-change-phone-input-wrap {
          background: #FFFFFF;
        }

        .td-change-phone-prefix {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          align-self: stretch;
          padding: 0 12px;
          color: #374151;
          background: #F1F5FF;
          border-right: 1px solid #D6DBE3;
          font-weight: 500;
          white-space: nowrap;
        }

        .td-change-phone-input-wrap input {
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          padding: 8px 12px;
          color: #111827;
          background: transparent;
          font: inherit;
          font-weight: 500;
        }

        .td-change-phone-input-wrap input::placeholder {
          color: #CBD0D9;
        }

        .td-change-phone-error {
          margin: -4px 0 12px;
          color: #B91C1C;
          font-size: 12px;
        }

        .td-change-phone-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 32px;
          padding-top: 14px;
          border-top: 1px solid #F1F5F9;
        }

        .td-change-phone-cancel,
        .td-change-phone-submit {
          border-radius: 22px;
          padding: 9px 22px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .td-change-phone-cancel {
          color: #134E4A;
          background: #FFFFFF;
          border: 1px solid #134E4A;
        }

        .td-change-phone-submit {
          color: #FFFFFF;
          background: #EEF0F3;
          border: 1px solid #EEF0F3;
        }

        .td-change-phone-submit:not(:disabled) {
          color: #000000;
          background: #2AE156;
          border-color: #2AE156;
        }

        .td-change-phone-cancel:disabled,
        .td-change-phone-submit:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .td-change-phone-security {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding: 16px;
          border-radius: 8px;
          color: #14532D;
          background: #EEF2FF;
          font-size: 12px;
        }

        .td-change-phone-security strong {
          display: block;
          margin-bottom: 2px;
          color: #172554;
        }

        .td-change-phone-security p {
          max-width: 680px;
          color: #475569;
          line-height: 1.45;
        }

        @media (max-width: 640px) {
          .td-change-phone-card {
            padding: 24px 18px 18px;
          }

          .td-change-phone-actions {
            justify-content: stretch;
          }

          .td-change-phone-cancel,
          .td-change-phone-submit {
            flex: 1;
          }
        }

        /* ═══════════════════════════════════════
           EXACT EDUCATION TAB DESIGN
        ═══════════════════════════════════════ */
        .td-edu-info-page {
          max-width: none;
          margin: 0 auto;
          width: 100%;
          padding: 8px 0 60px;
        }

        .td-edu-panels {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .td-edu-panel {
          display: flex;
          flex-direction: column;
          min-height: 292px;
          padding: 18px;
          border: 1px solid #e6edf3;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, .025);
        }

        .td-edu-panel-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 32px;
        }

        .td-edu-panel-heading > div {
          min-width: 0;
          flex: 1;
        }

        .td-edu-panel-heading h1,
        .td-edu-panel-heading h2 {
          margin: 0 0 2px;
          color: #1e293b;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.3;
        }

        .td-edu-panel-heading p {
          margin: 0;
          color: #64748b;
          font-size: 10px;
          line-height: 1.4;
        }

        .td-edu-panel-icon {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border-radius: 50%;
        }

        .td-edu-panel-icon--education {
          background: #ecfdf5;
          color: #22c55e;
        }

        .td-edu-panel-icon--certification {
          background: #eff8ff;
          color: #2da8e8;
        }

        .td-edu-empty-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          padding: 10px 0 2px;
          text-align: center;
        }

        .td-edu-empty-illustration {
          position: relative;
          display: grid;
          place-items: center;
          width: 128px;
          height: 94px;
          margin-bottom: 10px;
          border-radius: 999px;
        }

        .td-edu-empty-illustration--education {
          background: #f0fdf7;
          color: #64748b;
        }

        .td-edu-empty-illustration--certification {
          background: #f2faff;
          color: #38bdf8;
        }

        .td-edu-empty-document {
          display: grid;
          place-items: start center;
          width: 54px;
          height: 72px;
          padding-top: 10px;
          border: 1px solid #d9e8f3;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(15, 23, 42, .03);
        }

        .td-edu-empty-document::after {
          width: 30px;
          height: 3px;
          margin-top: 4px;
          border-radius: 3px;
          background: #e2e8f0;
          box-shadow: 0 6px 0 #e2e8f0, 0 12px 0 #e2e8f0;
          content: '';
        }

        .td-edu-empty-illustration--education .td-edu-empty-document svg {
          color: #64748b;
          padding: 4px;
          border-radius: 50%;
          background: #f1f5f9;
        }

        .td-edu-empty-illustration--certification .td-edu-empty-document svg {
          color: #38bdf8;
          padding: 4px;
          border-radius: 50%;
          background: #eff8ff;
        }

        .td-edu-empty-illustration > i,
        .td-edu-empty-illustration > b {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #6ee7b7;
        }

        .td-edu-empty-illustration > i {
          top: 13px;
          left: 21px;
          transform: rotate(45deg);
        }

        .td-edu-empty-illustration > b {
          top: 30px;
          right: 18px;
        }

        .td-edu-empty-illustration--certification > i,
        .td-edu-empty-illustration--certification > b {
          background: #7dd3fc;
        }

        .td-edu-empty-content > h2 {
          margin: 0 0 12px;
          color: #1e293b;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.4;
        }

        .td-edu-panel .td-edu-add-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 28px;
          padding: 0 13px;
          border: 0;
          border-radius: 7px;
          background: #20d653;
          box-shadow: none;
          color: #064e24;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
        }

        .td-edu-panel-heading > .td-edu-add-btn {
          flex: 0 0 auto;
          margin-left: auto;
        }

        .td-edu-panel .td-edu-add-btn:hover {
          background: #16c34a;
          box-shadow: 0 2px 6px rgba(22, 163, 74, .16);
        }

        .td-edu-certification-record {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
          max-width: none;
          margin: auto;
          padding: 15px 16px;
          border: 1px solid #edf0f3;
          border-radius: 12px;
          background: #fff;
        }
        .td-edu-panel > .td-edu-certification-record {
          max-width: none;
          margin: 14px 0 0;
        }

        .td-edu-certification-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border: 1px solid #e3e7ec;
          border-radius: 9px;
          background: #f8fafc;
          color: #374151;
          font-size: 11px;
          font-weight: 700;
        }

        .td-edu-certification-icon--trcn {
          letter-spacing: -.3px;
        }

        .td-edu-certification-details {
          min-width: 0;
          flex: 1;
          align-self: center;
        }

        .td-edu-certification-details h3 {
          margin: 0 0 3px;
          color: #252525;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
        }

        .td-edu-certification-details p {
          margin: 0 0 6px;
          color: #6b7280;
          font-size: 11px;
          line-height: 1.35;
        }

        .td-edu-certification-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          color: #717780;
          font-size: 10px;
          line-height: 1.4;
        }

        .td-edu-certification-meta > span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .td-edu-certification-meta > span + span::before {
          width: 1px;
          height: 12px;
          margin-right: 1px;
          background: #e2e5e9;
          content: '';
        }

        .td-edu-certification-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: 25px;
          padding: 0 10px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .td-edu-certification-status.is-verified {
          background: #e3fbef;
          color: #15803d;
        }

        .td-edu-certification-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 1px;
        }

        .td-edu-certification-edit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-width: 67px;
          min-height: 31px;
          padding: 0 10px;
          border: 1px solid #e3e7ec;
          border-radius: 7px;
          background: #fff;
          color: #303943;
          font: inherit;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .td-edu-certification-edit:hover {
          background: #f8fafc;
          color: #15803d;
        }

        .td-edu-certification-more {
          position: relative;
        }

        .td-edu-certification-more > summary {
          display: grid;
          place-items: center;
          width: 24px;
          height: 31px;
          border-radius: 6px;
          color: #9aa2ad;
          cursor: pointer;
          list-style: none;
        }

        .td-edu-certification-more > summary::-webkit-details-marker {
          display: none;
        }

        .td-edu-certification-more > summary:hover,
        .td-edu-certification-more[open] > summary {
          background: #f1f5f9;
          color: #475569;
        }

        .td-edu-certification-more > button {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          z-index: 8;
          display: flex;
          align-items: center;
          gap: 7px;
          width: max-content;
          min-width: 105px;
          height: 34px;
          padding: 0 10px;
          border: 1px solid #e5ebf1;
          border-radius: 7px;
          background: #fff;
          box-shadow: 0 6px 18px rgba(15, 23, 42, .12);
          color: #b42318;
          font: inherit;
          font-size: 10px;
          text-align: left;
          cursor: pointer;
        }

        .td-edu-certification-more > button:hover {
          background: #fef2f2;
        }

        .td-edu-session-only-badge {
          display: inline-block;
          margin-top: 6px;
          color: #b45309;
          font-size: 10px;
          font-weight: 700;
        }
        .td-edu-certification-file {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          max-width: 150px;
          overflow: hidden;
          color: #64748b;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .td-certification-modal {
          width: min(690px, 100%);
          max-height: min(90vh, 840px);
          display: flex;
          flex-direction: column;
          border-radius: 16px;
        }
        .td-certification-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 25px 30px 17px;
          border-bottom: 1px solid #edf1f4;
        }
        .td-certification-modal-header h2 {
          margin: 0 0 4px;
          color: #1e293b;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -.3px;
        }
        .td-certification-modal-header p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
        }
        .td-certification-modal-close {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          margin: -2px -5px 0 0;
          border-radius: 6px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
        }
        .td-certification-modal-close:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .td-certification-modal-body {
          min-height: 0;
          padding: 17px 30px 11px;
          overflow-y: auto;
        }
        .td-certification-form-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 17px 16px;
        }
        .td-certification-field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 5px;
          color: #1e293b;
          font-size: 11px;
          font-weight: 650;
        }
        .td-certification-field--full {
          grid-column: 1 / -1;
        }
        .td-certification-field b {
          color: #ef4444;
          font-weight: 700;
        }
        .td-certification-field em {
          color: #64748b;
          font-style: normal;
          font-weight: 400;
        }
        .td-certification-field input:not([type='checkbox']),
        .td-certification-field select,
        .td-certification-field textarea {
          width: 100%;
          min-width: 0;
          min-height: 44px;
          padding: 0 13px;
          border: 1px solid #dce4ed;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #475569;
          font: inherit;
          font-size: 12px;
          font-weight: 400;
          box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
        }
        .td-certification-field input::placeholder,
        .td-certification-field textarea::placeholder {
          color: #64748b;
          opacity: 1;
        }
        .td-certification-field input:focus,
        .td-certification-field select:focus,
        .td-certification-field textarea:focus {
          border-color: #bfdbfe;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
        }
        .td-certification-field select:disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }
        .td-certification-field > small {
          color: #64748b;
          font-size: 9px;
          font-weight: 400;
          line-height: 1.35;
        }
        .td-certification-label {
          line-height: 1.25;
        }
        .td-certification-date-fields {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 8px;
        }
        .td-certification-date-fields select {
          min-height: 40px;
          padding: 0 10px;
        }
        .td-certification-no-expiry {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
          color: #334155;
          font-size: 10px;
          font-weight: 400;
          cursor: pointer;
        }
        .td-certification-no-expiry input {
          width: 15px;
          height: 15px;
          margin: 0;
          accent-color: #16a34a;
        }
        .td-certification-file-input {
          display: none;
        }
        .td-certification-document-upload {
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          min-height: 76px;
          padding: 12px 16px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          background: #fff;
          color: #64748b;
          text-align: left;
          cursor: pointer;
        }
        .td-certification-document-upload:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }
        .td-certification-upload-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #f8fafc;
          color: #7890a8;
        }
        .td-certification-document-upload > span:last-child {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 3px;
        }
        .td-certification-document-upload strong {
          overflow: hidden;
          color: #334155;
          font-size: 10px;
          font-weight: 500;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .td-certification-document-upload small {
          color: #64748b;
          font-size: 9px;
          font-weight: 400;
        }
        .td-certification-file-error,
        .td-certification-form-error {
          color: #b42318 !important;
          font-size: 10px !important;
        }
        .td-certification-field textarea {
          min-height: 76px;
          padding: 11px 13px;
          line-height: 1.45;
          resize: vertical;
        }
        .td-certification-field .td-certification-notes-count {
          align-self: flex-end;
          margin-top: 2px;
          color: #64748b;
        }
        .td-certification-modal-notice {
          margin: 10px 0 0;
          color: #9a6700;
          font-size: 9px;
          line-height: 1.4;
        }
        .td-certification-form-error {
          margin: 8px 0 0;
        }
        .td-certification-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 13px 30px 22px;
          border-top: 1px solid #edf1f4;
        }
        .td-certification-modal-footer button {
          min-height: 39px;
          padding: 0 18px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #fff;
          color: #1e293b;
          font: inherit;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }
        .td-certification-modal-footer .td-certification-save {
          border-color: #20d653;
          background: #20d653;
          color: #064e24;
        }
        .td-certification-modal-footer .td-certification-save:hover {
          border-color: #16c34a;
          background: #16c34a;
        }
        .td-certification-modal-footer button:disabled {
          cursor: wait;
          opacity: .7;
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

        .td-edu-grid--empty { grid-template-columns: minmax(0, 1fr); }

        .td-profile-empty-state {
          grid-column: 1 / -1;
          min-height: calc(100vh - 330px);
          padding: 48px 24px;
          border: 1px dashed #CBD5E1;
          border-radius: 16px;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #94A3B8;
        }

        .td-profile-empty-state svg { color: #94A3B8; margin-bottom: 16px; }
        .td-profile-empty-state h3 { margin: 0 0 8px; color: #1E293B; font-size: 18px; font-weight: 800; }
        .td-profile-empty-state p { max-width: 360px; margin: 0 0 20px; color: #64748B; font-size: 13px; line-height: 1.5; }

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

        .td-edu-panel .td-edu-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 9px;
          margin-top: 14px;
        }

        .td-edu-panel .td-edu-card {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) auto;
          align-items: center;
          gap: 14px;
          min-height: 76px;
          padding: 13px 15px;
          overflow: visible;
          border: 1px solid #e8eef4;
          border-radius: 9px;
          box-shadow: none;
        }

        .td-edu-card-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border: 1px solid #e7eef5;
          border-radius: 8px;
          background: #f8fafc;
          color: #64748b;
        }

        .td-edu-card-details {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 3px;
        }

        .td-edu-card-details h2 {
          overflow: hidden;
          margin: 0;
          color: #1e293b;
          font-size: 12px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .td-edu-card-details p,
        .td-edu-card-details small {
          overflow: hidden;
          margin: 0;
          color: #64748b;
          font-size: 10px;
          font-weight: 500;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .td-edu-card-meta {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
          line-height: 1.3;
        }

        .td-edu-card-meta > span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .td-edu-card-meta svg {
          flex: 0 0 auto;
          color: #94a3b8;
        }

        .td-edu-card-meta > i {
          width: 1px;
          height: 12px;
          flex: 0 0 1px;
          background: #e2e8f0;
        }

        .td-edu-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .td-edu-card-actions button {
          display: grid;
          place-items: center;
          width: 30px;
          height: 29px;
          border: 1px solid #e1e7ee;
          border-radius: 6px;
          background: #fff;
          color: #64748b;
          cursor: pointer;
        }

        .td-edu-card-actions .td-edu-card-edit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: auto;
          min-width: 68px;
          padding: 0 10px;
          color: #334155;
          font: inherit;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .td-edu-card-actions button:hover {
          background: #f8fafc;
          color: #15803d;
        }

        .td-edu-card-more {
          position: relative;
        }

        .td-edu-card-more > summary {
          display: grid;
          place-items: center;
          width: 24px;
          height: 29px;
          border-radius: 6px;
          color: #94a3b8;
          cursor: pointer;
          list-style: none;
        }

        .td-edu-card-more > summary::-webkit-details-marker {
          display: none;
        }

        .td-edu-card-more > summary:hover,
        .td-edu-card-more[open] > summary {
          background: #f1f5f9;
          color: #475569;
        }

        .td-edu-card-more > button {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          z-index: 8;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 7px;
          width: 104px;
          height: 34px;
          padding: 0 10px;
          border: 1px solid #e5ebf1;
          border-radius: 7px;
          background: #fff;
          box-shadow: 0 6px 18px rgba(15, 23, 42, .12);
          color: #b42318;
          font: inherit;
          font-size: 10px;
          text-align: left;
        }

        .td-edu-card-more > button:hover {
          background: #fef2f2;
          color: #b42318;
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
          margin-bottom: 18px;
          gap: 16px;
        }

        .td-exp-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .td-exp-section-icon {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          border: 1px solid #dceefc;
          border-radius: 50%;
          background: #f0f9ff;
          color: #475569;
        }

        .td-exp-page-title {
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 2px;
          letter-spacing: -0.2px;
        }

        .td-exp-page-desc {
          font-size: 11px;
          color: #64748B;
          line-height: 1.45;
          margin: 0;
          max-width: 520px;
        }

        .td-exp-add-btn {
          background: #16c653;
          color: #FFFFFF;
          border: none;
          border-radius: 7px;
          padding: 8px 13px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          box-shadow: 0 2px 5px rgba(22, 163, 74, 0.16);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex: 0 0 auto;
        }

        .td-exp-add-btn:hover {
          background: #12ae49;
          box-shadow: 0 3px 8px rgba(22, 163, 74, 0.22);
        }

        .td-exp-timeline-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .td-exp-empty-state { width: 100%; }

        .td-exp-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
          background: #FFFFFF;
          border-radius: 10px;
          border: 1px solid #e6edf3;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.025);
          padding: 15px 16px;
        }

        .td-exp-card-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          border: 1px solid #edf2f7;
          border-radius: 7px;
          background: #f8fafc;
          color: #64748b;
        }

        .td-exp-card-content {
          min-width: 0;
          flex: 1;
        }

        .td-exp-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .td-exp-card-heading {
          min-width: 0;
        }

        .td-exp-role {
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 2px;
          letter-spacing: 0;
        }

        .td-exp-school {
          font-size: 10.5px;
          color: #475569;
          font-weight: 600;
          margin: 0;
        }

        .td-exp-meta-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px 12px;
          margin-top: 7px;
          color: #64748b;
          font-size: 9px;
          line-height: 1.3;
        }

        .td-exp-meta-row > span:not(.td-exp-current-badge) {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .td-exp-meta-row svg {
          flex: 0 0 auto;
          color: #7890a8;
        }

        .td-exp-current-badge {
          padding: 3px 8px;
          border-radius: 999px;
          background: #dcfce7;
          color: #15803d;
          font-size: 9px;
          font-weight: 700;
        }

        .td-exp-desc {
          font-size: 9px;
          color: #475569;
          line-height: 1.5;
          margin: 8px 0 0;
        }

        .td-exp-actions {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex: 0 0 auto;
        }

        .td-exp-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: 25px;
          padding: 0 8px;
          border: 1px solid #e6edf3;
          border-radius: 6px;
          background: #fff;
          font-size: 9px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s ease;
        }

        .td-exp-action-btn:hover {
          opacity: 0.8;
        }

        .td-exp-action-edit {
          color: #334155;
        }

        .td-exp-more {
          position: relative;
        }

        .td-exp-more > summary {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          list-style: none;
        }

        .td-exp-more > summary::-webkit-details-marker {
          display: none;
        }

        .td-exp-more > summary:hover,
        .td-exp-more[open] > summary {
          background: #f1f5f9;
        }

        .td-exp-more > button {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          z-index: 6;
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 100px;
          padding: 8px 10px;
          border: 1px solid #e6edf3;
          border-radius: 7px;
          background: #fff;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
          color: #b42318;
          font: inherit;
          font-size: 10px;
          text-align: left;
          cursor: pointer;
        }

        .td-exp-more > button:hover {
          background: #fef2f2;
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
          border-radius: 18px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.03);
          padding: 24px 26px;
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
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
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
          min-width: 0;
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
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .td-cv-file-info {
          min-width: 0;
          flex: 1 1 auto;
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

        .td-cv-confirm-box {
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #F8FAFC;
        }

        .td-cv-confirm-file {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }

        .td-cv-confirm-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748B;
        }

        .td-cv-confirm-file strong {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          word-break: break-word;
        }

        .td-cv-confirm-actions {
          display: flex;
          gap: 10px;
          width: 100%;
        }

        .td-cv-confirm-btn {
          flex: 1;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .td-cv-confirm-btn--upload {
          background: #2563EB;
          color: #FFFFFF;
          border: 1px solid #2563EB;
        }

        .td-cv-confirm-btn--upload:hover {
          background: #1D4ED8;
          border-color: #1D4ED8;
        }

        .td-cv-confirm-btn--cancel {
          background: #FFFFFF;
          color: #334155;
          border: 1px solid #CBD5E1;
        }

        .td-cv-confirm-btn--cancel:hover {
          background: #F8FAFC;
        }

        .td-cv-confirm-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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
          background: #e5e7eb;
          border-radius: 9999px;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .td-success-progress-fill {
          height: 100%;
          background: #15803D;
          border-radius: inherit;
          transition: width 0.3s ease;
        }

        .td-success-progress-text {
          font-size: 12px;
          font-weight: 700;
          color: #15803D;
          display: block;
        }

        .td-success-next-step-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 44px;
          margin: 0 0 14px;
          padding: 10px 16px;
          border: 0;
          border-radius: 8px;
          background: #22c55e;
          color: #14532d;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .td-success-next-step-btn:hover {
          background: #16a34a;
          color: #fff;
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
          .td-pers-info-page {
            padding: 8px 12px 88px;
          }
          .td-pers-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .td-pers-empty-cell {
            display: none;
          }
          .td-pers-card {
            padding: 20px 16px;
            width: 100%;
          }
          .td-pers-contact-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .td-pers-contact-btn {
            width: 100%;
          }
          .td-pers-actions-row {
            flex-direction: column-reverse;
            width: 100%;
          }
          .td-pers-cancel-btn,
          .td-pers-save-btn {
            width: 100%;
          }
          .td-pers-page-title {
            font-size: 24px;
          }
          .td-pers-breadcrumb {
            font-size: 12px;
          }
          .td-edu-grid {
            grid-template-columns: 1fr;
          }
          .td-edu-panel {
            min-height: 270px;
            padding: 14px;
          }
          .td-edu-add-btn {
            width: auto;
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
            gap: 9px;
            padding: 12px;
          }
          .td-exp-role {
            font-size: 12px;
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
          .td-profile-view-summary-grid {
            grid-template-columns: 1fr;
          }
          .td-profile-view-logs-card {
            padding: 20px 16px;
          }
          .td-profile-view-logs-card-header {
            align-items: flex-start;
          }
          .td-profile-view-log-item {
            align-items: flex-start;
            flex-wrap: wrap;
          }
          .td-profile-view-log-item time {
            width: calc(100% - 56px);
            margin-left: 56px;
            text-align: left;
          }
        }

        @media (max-width: 760px) {
          .td-edu-panel > .td-edu-certification-record {
            display: grid;
            grid-template-columns: 43px minmax(0, 1fr) auto;
            gap: 10px 12px;
            padding: 12px;
          }

          .td-edu-certification-icon {
            grid-column: 1;
            grid-row: 1;
          }

          .td-edu-certification-details {
            grid-column: 2 / 4;
            grid-row: 1;
          }

          .td-edu-certification-status {
            grid-column: 2;
            grid-row: 2;
            justify-self: start;
          }

          .td-edu-certification-actions {
            grid-column: 3;
            grid-row: 2;
          }

          .td-edu-card-more > button {
            right: 0;
          }
        }

        @media (max-width: 480px) {
          .td-edu-panel-heading {
            flex-wrap: wrap;
          }

          .td-edu-panel-heading > div {
            flex-basis: calc(100% - 42px);
          }

          .td-edu-panel-heading > .td-edu-add-btn {
            margin-left: 40px;
          }

          .td-edu-panel .td-edu-card {
            grid-template-columns: 36px minmax(0, 1fr);
            align-items: start;
            gap: 9px 10px;
            padding: 11px;
          }

          .td-edu-card-icon {
            grid-column: 1;
            grid-row: 1;
          }

          .td-edu-card-details {
            grid-column: 2;
            grid-row: 1;
            min-width: 0;
          }

          .td-edu-card-details h2,
          .td-edu-card-details p,
          .td-edu-card-details small {
            white-space: normal;
            overflow-wrap: anywhere;
          }

          .td-edu-card-meta {
            flex-wrap: wrap;
            row-gap: 5px;
          }

          .td-edu-card-meta > span {
            white-space: normal;
          }

          .td-edu-card-actions {
            grid-column: 2;
            grid-row: 2;
            justify-self: end;
          }

          .td-edu-card-more > summary,
          .td-edu-certification-more > summary {
            width: 36px;
            height: 36px;
          }

          .td-edu-panel > .td-edu-certification-record {
            grid-template-columns: 36px minmax(0, 1fr);
            gap: 10px;
            padding: 11px;
          }

          .td-edu-certification-icon {
            grid-column: 1;
            grid-row: 1;
            width: 36px;
            height: 36px;
            flex-basis: 36px;
          }

          .td-edu-certification-details {
            grid-column: 2;
            grid-row: 1;
            min-width: 0;
          }

          .td-edu-certification-details h3,
          .td-edu-certification-details p {
            overflow-wrap: anywhere;
          }

          .td-edu-certification-meta {
            align-items: flex-start;
            flex-direction: column;
            gap: 4px;
          }

          .td-edu-certification-meta > span + span::before {
            display: none;
          }

          .td-edu-certification-status {
            grid-column: 2;
            grid-row: 2;
            justify-self: start;
          }

          .td-edu-certification-actions {
            grid-column: 2;
            grid-row: 3;
            justify-self: end;
          }

          .td-edu-certification-more > button {
            right: 0;
          }
        }

        @media (max-width: 900px) {
          .td-profile-overview-top {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 720px) {
          .td-profile-tab-page {
            min-width: 0;
            padding: 14px 12px 88px;
          }

          .td-profile-page-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .td-profile-page-heading p {
            max-width: 100%;
          }

          .td-profile-page-heading > .td-profile-btn-preview {
            min-height: 40px;
          }

          .td-profile-overview-top {
            gap: 12px;
          }

          .td-profile-overview-top .td-profile-header-card {
            padding: 18px;
          }

          .td-profile-overview-top .td-profile-header-left {
            width: 100%;
            gap: 14px;
          }

          .td-profile-overview-top .td-profile-info-block {
            flex: 1 1 0;
          }

          .td-profile-overview-top .td-profile-name-row {
            flex-wrap: wrap;
          }

          .td-profile-overview-top .td-profile-name-row h2 {
            overflow-wrap: anywhere;
          }

          .td-profile-overview-top .td-profile-meta-row {
            flex-wrap: wrap;
          }

          .td-profile-overview-top .td-profile-meta-item + .td-profile-meta-item::before {
            display: none;
          }

          .td-profile-tabs {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            gap: 4px;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding: 4px;
            position: sticky;
            top: 68px;
            z-index: 99;
            width: calc(100% + 64px);
            margin-left: -32px;
            border-radius: 0;
            background: #fff;
            box-shadow: 0 3px 12px rgba(15, 23, 42, .1);
          }

          .td-profile-tabs::-webkit-scrollbar {
            display: none;
          }

          .td-profile-tabs > button {
            flex: 0 0 auto;
            min-height: 44px;
            padding: 7px 12px;
            white-space: nowrap;
            line-height: 1.3;
            text-align: center;
          }

          .td-profile-overview-panel {
            padding: 16px;
          }

          .td-profile-overview-panel-heading {
            display: grid;
            grid-template-columns: 38px minmax(0, 1fr);
            align-items: start;
            gap: 10px;
          }

          .td-profile-overview-panel-heading > div:nth-child(2) {
            min-width: 0;
          }

          .td-profile-overview-panel-heading h2 {
            overflow-wrap: anywhere;
          }

          .td-profile-overview-panel-heading > button {
            grid-column: 2;
            justify-self: start;
            margin-left: 0;
          }

          .td-profile-overview-details {
            gap: 14px;
          }

          .td-profile-overview-details > * {
            min-width: 0;
          }

          .td-profile-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .td-profile-section-card {
            min-height: 120px;
            padding: 16px;
          }

          .td-psc-title {
            font-size: 17px;
            overflow-wrap: anywhere;
          }

          .td-subtab-view {
            gap: 14px;
          }

          .td-subtab-top-nav {
            align-items: stretch;
            gap: 12px;
          }

          .td-subtab-pill-bar {
            width: 100%;
          }

          .td-subtab-card {
            padding: 20px;
            border-radius: 16px;
          }

          .td-subtab-card-header {
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 18px;
          }

          .td-subtab-header-left {
            min-width: 0;
            gap: 12px;
          }

          .td-subtab-header-left h2 {
            font-size: 18px;
            overflow-wrap: anywhere;
          }

          .td-subtab-form-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .td-subtab-field-full {
            grid-column: auto;
          }

          .td-profile-tab-page .td-subtab-input,
          .td-profile-tab-page .td-subtab-textarea {
            min-width: 0;
            width: 100%;
          }

          .td-prof-skills-card {
            padding: 20px;
          }

          .td-prof-skills-heading {
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 20px;
          }

          .td-prof-skills-heading h1 {
            font-size: 18px;
          }

          .td-prof-skills-heading p {
            font-size: 13px;
          }

          .td-prof-skills-item {
            grid-template-columns: 34px minmax(0, 1fr);
            gap: 12px;
            padding: 16px;
          }

          .td-prof-skills-item-icon {
            width: 34px;
            height: 34px;
          }

          .td-prof-skills-item-title {
            flex-wrap: wrap;
            gap: 10px;
          }

          .td-more-card {
            min-height: 0;
            padding: 20px;
          }

          .td-profile-tab-page .td-basic-profile-modal-backdrop,
          .td-profile-tab-page .td-prof-skills-modal-overlay,
          .td-profile-tab-page .td-education-form-overlay {
            padding: 12px;
          }

          .td-profile-tab-page .td-basic-profile-modal,
          .td-profile-tab-page .td-prof-skills-modal {
            max-height: calc(100dvh - 24px);
          }
        }

        @media (max-width: 480px) {
          .td-profile-tab-page {
            padding-right: 10px;
            padding-left: 10px;
          }

          .td-profile-overview-top .td-profile-header-card {
            padding: 15px;
          }

          .td-profile-overview-top .td-profile-header-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .td-profile-overview-top .td-profile-avatar-container {
            width: 72px;
            height: 72px;
          }

          .td-profile-overview-top .td-profile-header-actions {
            margin-top: 12px;
          }

          .td-profile-readiness {
            padding: 14px;
          }

          .td-profile-tabs {
            width: calc(100% + 60px);
            margin-left: -30px;
          }

          .td-profile-tabs > button {
            gap: 5px;
            padding: 7px 5px;
            font-size: 11px;
          }

          .td-profile-overview-panel {
            padding: 14px;
          }

          .td-profile-overview-panel-heading {
            grid-template-columns: 32px minmax(0, 1fr);
            gap: 8px;
          }

          .td-profile-overview-panel-heading .td-overview-icon {
            width: 32px;
            height: 32px;
          }

          .td-profile-overview-panel-heading h2 {
            font-size: 14px;
          }

          .td-profile-overview-panel-heading p {
            font-size: 10px;
          }

          .td-profile-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .td-profile-section-card {
            min-height: 110px;
          }

          .td-subtab-card {
            padding: 16px;
            border-radius: 13px;
          }

          .td-subtab-header-left {
            align-items: flex-start;
          }

          .td-subtab-actions {
            justify-content: stretch;
          }

          .td-subtab-save-btn {
            width: 100%;
          }

          .td-prof-skills-card {
            padding: 15px;
          }

          .td-prof-skills-heading-icon {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
          }

          .td-prof-skills-item {
            grid-template-columns: minmax(0, 1fr);
            gap: 10px;
            padding: 14px;
          }

          .td-prof-skills-item-title button {
            min-height: 40px;
          }

          .td-prof-skills-input-row {
            flex-wrap: wrap;
          }

          .td-prof-skills-input-row > button {
            min-height: 40px;
          }
        }

        @media (max-width: 360px) {
          .td-profile-tabs {
            width: calc(100% + 52px);
            margin-left: -26px;
          }
        }
      `}</style>
    </Motion.div>
  );
}