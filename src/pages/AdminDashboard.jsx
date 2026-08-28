import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { apiErrorMessage } from '../services/api';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import BrandLogo from '../components/BrandLogo';
import { FiAlertCircle, FiArrowLeft, FiBell, FiBriefcase, FiCalendar, FiCheckCircle, FiChevronDown, FiClock, FiFileText, FiGrid, FiInfo, FiLogOut, FiMessageSquare, FiPlus, FiSearch, FiSettings, FiTrash2, FiUsers } from 'react-icons/fi';

const emptyJobForm = {
  title: '',
  description: '',
  role_type: 'Mathematics Teacher',
  employment_type: 'full-time',
  salary_range: '100k-150k',
  location: '',
  requirements: '',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({});
  const [verifications, setVerifications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const isSchool = user?.role === 'school';

  const currentUserId = useMemo(
    () => user?.user_id || user?.id || user?.school_id || '',
    [user]
  );

  const loadSchoolJobs = async () => {
    try {
      const response = await jobService.getJobs({});
      const jobList = response?.data?.data?.jobs || response?.data?.jobs || [];

      if (isSchool && currentUserId) {
        const ownedJobs = jobList.filter((job) => {
          const candidate = job.school_id || job.user_id || job.created_by || '';
          return candidate === currentUserId || candidate === user?.id;
        });
        setJobs(ownedJobs.length ? ownedJobs : jobList.slice(0, 5));
      } else {
        setJobs(jobList.slice(0, 5));
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to load school jobs.'));
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, verificationsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getVerifications(),
        ]);

        const statsPayload = statsRes?.data?.data ?? statsRes?.data ?? {};
        const verificationPayload = verificationsRes?.data?.data?.verifications ?? verificationsRes?.data?.verifications ?? [];

        setStats(statsPayload);
        setVerifications(verificationPayload);

        if (isSchool) {
          await loadSchoolJobs();
        }
      } catch (err) {
        setError(apiErrorMessage(err, 'Unable to load dashboard data.'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isSchool, currentUserId]);

  const loadApplicantsForJob = async (jobId) => {
    if (!jobId) return;

    try {
      const response = await applicationService.getApplicantsByJob(jobId);
      const list = response?.data?.data?.applications || response?.data?.applications || [];
      setApplicantsByJob((prev) => ({ ...prev, [jobId]: list }));
    } catch (err) {
      setApplicantsByJob((prev) => ({ ...prev, [jobId]: [] }));
    }
  };

  useEffect(() => {
    if (!isSchool || !jobs.length) return;

    jobs.forEach((job) => {
      const jobId = job.job_id || job.id;
      if (jobId) {
        loadApplicantsForJob(jobId);
      }
    });
  }, [isSchool, jobs]);

  const handleCreateJob = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      const response = await jobService.createJob(jobForm);
      const newJob = response?.data?.data || response?.data || jobForm;

      setJobs((prev) => [
        {
          ...(newJob.job || newJob),
          job_id: newJob.job_id || newJob.id || `JOB-${Date.now()}`,
          title: newJob.title || jobForm.title,
          location: newJob.location || jobForm.location,
          status: newJob.status || 'active',
        },
        ...prev,
      ]);
      setJobForm(emptyJobForm);
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to create this job.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!jobId) return;

    try {
      setError('');
      await jobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => (job.job_id || job.id) !== jobId));
      setApplicantsByJob((prev) => {
        const next = { ...prev };
        delete next[jobId];
        return next;
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to delete this job.'));
    }
  };

  const handleStatusChange = async (jobId, applicationId, nextStatus) => {
    if (!jobId || !applicationId || !nextStatus) return;

    try {
      setStatusUpdating((prev) => ({ ...prev, [applicationId]: true }));
      setError('');
      await applicationService.updateApplicationStatus(applicationId, { status: nextStatus });

      setApplicantsByJob((prev) => ({
        ...prev,
        [jobId]: (prev[jobId] || []).map((app) => {
          const currentId = app.application_id || app.id;
          return currentId === applicationId ? { ...app, status: nextStatus } : app;
        }),
      }));
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to update application status.'));
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const adminLabel = user?.role === 'school' ? 'School Dashboard' : 'Admin Dashboard';

  const navItems = isSchool
    ? [
        ['overview', 'Dashboard', FiGrid],
        ['jobs', 'Jobs', FiBriefcase],
        ['applicants', 'Applicants', FiUsers],
        ['notifications', 'Notifications', FiBell],
        ['settings', 'Settings', FiSettings],
      ]
    : [
        ['overview', 'Dashboard', FiGrid],
        ['verifications', 'Verifications', FiCheckCircle],
        ['notifications', 'Notifications', FiBell],
        ['settings', 'Settings', FiSettings],
      ];

  const allApplicants = Object.entries(applicantsByJob).flatMap(([jobId, applicants]) =>
    applicants.map((app) => ({ ...app, jobId }))
  );

  const renderSchoolOverview = () => {
    const totalApplicants = Number(stats.total_applications ?? allApplicants.length ?? 0);
    const activeJobs = Number(stats.active_jobs ?? jobs.length ?? 0);
    const shortlistedApplicants = allApplicants.filter((app) => String(app.status || '').toLowerCase() === 'shortlisted').length;

    return (
      <div className="school-overview">
        <section className="school-overview-hero">
          <div className="school-welcome-panel">
            <h2>Good morning, {user?.full_name || 'BrightMind Academy'}</h2>
            <p>Manage your school's hiring and find the right teachers for your team.<br />Review recent applications and schedule upcoming interviews.</p>
            <div className="school-overview-actions">
              <button type="button" onClick={() => setActiveTab('post-job')}><FiPlus size={14} /> Post a Job</button>
              <button type="button" onClick={() => setActiveTab('applicants')}>View Applicants</button>
            </div>
          </div>

          <div className="school-profile-card">
            <div className="school-profile-heading">
              <span className="school-profile-icon"><FiCheckCircle size={14} /></span>
              <div><strong>School Profile</strong><span>Attract top educators</span></div>
            </div>
            <div className="school-profile-progress-label"><span>Completeness</span><strong>75%</strong></div>
            <div className="school-profile-progress"><span /></div>
            <p><FiInfo size={11} /> Add a cover photo to reach 100%</p>
          </div>
        </section>

        <section className="school-stat-grid" aria-label="School recruitment statistics">
          {[
            ['Active Jobs', activeJobs, FiBriefcase],
            ['Total Applicants', totalApplicants, FiUsers],
            ['Shortlisted', shortlistedApplicants, FiCheckCircle],
            ['Interviews', 0, FiCalendar],
          ].map(([label, value, Icon]) => (
            <div key={label} className="school-stat-card">
              <span>{label}</span>
              {React.createElement(Icon, { size: 17 })}
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="school-overview-section school-applicants-section">
          <div className="school-section-heading"><h3>Recent Applicants</h3><button type="button" onClick={() => setActiveTab('applicants')}>View All <span>→</span></button></div>
          <div className="school-applicant-table">
            <div className="school-table-row school-table-head"><span>Applicant Name</span><span>Job Info</span><span>Status</span><span>Action</span></div>
            {(allApplicants.length ? allApplicants.slice(0, 3) : [{ application_id: 'empty', teacher_name: 'No applicants yet.', status: 'Waiting' }]).map((app, index) => {
              const status = app.status || 'New';
              return <div className="school-table-row" key={app.application_id || app.id || index}><span className="school-applicant-name"><i>{String(app.teacher_name || app.teacher_email || 'Applicant').slice(0, 2).toUpperCase()}</i>{app.teacher_name || app.teacher_email || 'Applicant'}</span><span>{jobs.find((job) => (job.job_id || job.id) === app.jobId)?.title || 'Teaching opportunity'}</span><span><b className={`school-status school-status-${String(status).toLowerCase()}`}>{status}</b></span><button type="button" onClick={() => setActiveTab('applicants')} className="school-review-button">Review</button></div>;
            })}
          </div>
        </section>

        <section className="school-overview-section school-postings-section">
          <div className="school-section-heading"><h3>Active Postings</h3><button type="button" onClick={() => setActiveTab('jobs')}>View All <span>→</span></button></div>
          <div className="school-posting-grid">
            {(jobs.length ? jobs.slice(0, 2) : [{ job_id: 'empty', title: 'No active postings', location: 'Create your first job' }]).map((job) => { const jobId = job.job_id || job.id; return <div className="school-posting-card" key={jobId}><div><strong>{job.title || 'Teaching role'}</strong><span>{job.employment_type || 'Full-time'} · {job.location || 'Location pending'}</span></div><FiBriefcase className="school-posting-icon" size={16} /><div className="school-posting-footer"><span><FiUsers size={13} /> {(applicantsByJob[jobId] || []).length} Applicants</span><small>Posted recently</small></div></div>; })}
          </div>
        </section>

        <section className="school-overview-section school-interviews-section">
          <div className="school-section-heading"><h3>Upcoming Interviews</h3><FiCalendar size={15} /></div>
          <div className="school-empty-interviews"><span><FiCalendar size={15} /></span><div><strong>No upcoming interviews</strong><small>Scheduled interviews will appear here.</small></div></div>
          <button type="button" className="school-schedule-button">View Full Schedule</button>
        </section>
      </div>
    );
  };

  const renderDesktopNotifications = () => (
    <div className="school-desktop-notifications">
      <div className="school-notifications-heading">
        <div><h2>Notifications</h2><p><strong>12 UNREAD</strong><span>You have new updates.</span></p></div>
        <button type="button"><FiCheckCircle size={14} /> Mark all as read</button>
      </div>
      <div className="school-notifications-panel">
        <h3>Today</h3>
        <div className="school-notification-highlight school-notification-highlight--green"><span className="school-notification-icon"><FiFileText size={17} /></span><div><b>NEW APPLICATION</b><strong>Tunde Bello applied for Senior Mathematics Teacher</strong><p>The applicant has 8 years of experience and matches 90% of your required qualifications. Review their profile to proceed.</p></div><time>2 hours ago</time></div>
        <div className="school-notification-highlight"><span className="school-notification-icon"><FiMessageSquare size={17} /></span><div><b>RESPONSE</b><strong>Mr. Segun responded to your message</strong><p>"Thank you for the update. I will be available for the interview next Tuesday at 10 AM as requested."</p></div><time>4 hours ago</time></div>
        <div className="school-notification-highlight school-notification-highlight--red"><span className="school-notification-icon"><FiAlertCircle size={17} /></span><div><b>EXPIRY WARNING</b><strong>Job posting expires in 3 days</strong><p>Your listing for 'Assistant Principal' will be removed soon. Consider extending the duration or reviewing current applicants.</p></div><time>5 hours ago</time></div>
        <h3>Yesterday</h3>
        <div className="school-notification-simple"><span className="school-notification-icon"><FiFileText size={17} /></span><div><b>NEW APPLICATION</b><strong>Sarah Jenkins applied for Biology Teacher</strong><p>Profile overview and CV attached for review.</p></div><time>Yesterday, 2:30 PM</time></div>
        <div className="school-notification-simple"><span className="school-notification-icon"><FiCheckCircle size={17} /></span><div><b>SYSTEM</b><strong>Subscription Renewed Successfully</strong><p>Your 'Premium School' plan has been renewed for another month.</p></div><time>Yesterday, 9:00 AM</time></div>
        <h3>Earlier</h3>
        <div className="school-notification-simple"><span className="school-notification-icon"><FiFileText size={17} /></span><div><b>NEW APPLICATION</b><strong>David Osa applied for Physics Teacher</strong></div><time>Oct 12</time></div>
        <button type="button" className="school-load-more">Load More <FiChevronDown size={13} /></button>
      </div>
    </div>
  );

  const renderJobForm = () => (
    <div className="rounded-2xl border border-[#dfe5e1] bg-white p-6 text-left shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172238]">Post a New Job</h2>
          <p className="mt-1 text-sm text-[#718078]">Create a clear opportunity for qualified educators.</p>
        </div>
        <FiBriefcase className="text-[#1ccb43]" size={24} />
      </div>
      <form onSubmit={handleCreateJob} className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-[#dfe5e1] bg-[#f8faf8] px-3 py-3 text-sm outline-none focus:border-[#1ccb43]" placeholder="Job title" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required />
        <input className="rounded-xl border border-[#dfe5e1] bg-[#f8faf8] px-3 py-3 text-sm outline-none focus:border-[#1ccb43]" placeholder="Location" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} required />
        <input className="rounded-xl border border-[#dfe5e1] bg-[#f8faf8] px-3 py-3 text-sm outline-none focus:border-[#1ccb43]" placeholder="Role type" value={jobForm.role_type} onChange={(e) => setJobForm({ ...jobForm, role_type: e.target.value })} />
        <input className="rounded-xl border border-[#dfe5e1] bg-[#f8faf8] px-3 py-3 text-sm outline-none focus:border-[#1ccb43]" placeholder="Employment type" value={jobForm.employment_type} onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })} />
        <input className="rounded-xl border border-[#dfe5e1] bg-[#f8faf8] px-3 py-3 text-sm outline-none focus:border-[#1ccb43] md:col-span-2" placeholder="Salary range" value={jobForm.salary_range} onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })} />
        <textarea className="rounded-xl border border-[#dfe5e1] bg-[#f8faf8] px-3 py-3 text-sm outline-none focus:border-[#1ccb43] md:col-span-2" placeholder="Job description" rows={4} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} required />
        <textarea className="rounded-xl border border-[#dfe5e1] bg-[#f8faf8] px-3 py-3 text-sm outline-none focus:border-[#1ccb43] md:col-span-2" placeholder="Requirements" rows={3} value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} />
        <button type="submit" disabled={submitting} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1ccb43] px-5 py-3 text-sm font-bold text-[#12331f] hover:bg-[#17b53a] disabled:opacity-60">
          <FiPlus /> {submitting ? 'Posting…' : 'Publish Job'}
        </button>
      </form>
    </div>
  );

  const renderJobs = () => (
    <div className="rounded-2xl border border-[#dfe5e1] bg-white p-6 text-left shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-[#172238]">Your Job Posts</h2><p className="mt-1 text-sm text-[#718078]">Manage roles and review incoming applications.</p></div>
        <button type="button" onClick={() => setActiveTab('post-job')} className="inline-flex items-center gap-2 rounded-full bg-[#1ccb43] px-4 py-2 text-xs font-bold text-[#12331f]"><FiPlus /> Post a job</button>
      </div>
      {jobs.length === 0 ? <p className="py-10 text-center text-sm text-[#718078]">No jobs published yet.</p> : <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => { const jobId = job.job_id || job.id; return <div key={jobId} className="rounded-xl border border-[#e4e9e5] p-4">
          <div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="font-bold text-[#172238]">{job.title || 'Teaching role'}</h3><p className="mt-1 text-xs text-[#718078]">{job.location || 'Location pending'} · {job.employment_type || 'full-time'}</p></div><button type="button" onClick={() => handleDeleteJob(jobId)} className="text-[#dc5b5b]" aria-label="Delete job"><FiTrash2 /></button></div>
          <p className="mb-4 line-clamp-2 text-sm text-[#607064]">{job.description || 'No description provided.'}</p>
          <div className="flex items-center justify-between border-t border-[#edf0ed] pt-3 text-xs text-[#718078]"><span><FiUsers className="mr-1 inline" />{(applicantsByJob[jobId] || []).length} applicants</span><button type="button" onClick={() => setActiveTab('applicants')} className="font-bold text-[#16843d]">View applicants</button></div>
        </div>; })}
      </div>}
    </div>
  );

  const renderApplicants = () => (
    <div className="rounded-2xl border border-[#dfe5e1] bg-white p-6 text-left shadow-sm">
      <div className="mb-5"><h2 className="text-xl font-bold text-[#172238]">Recent Applicants</h2><p className="mt-1 text-sm text-[#718078]">Review candidates and move them through your hiring process.</p></div>
      {allApplicants.length === 0 ? <p className="py-10 text-center text-sm text-[#718078]">No applicants yet.</p> : <div className="space-y-3">{allApplicants.map((app, index) => { const appId = app.application_id || app.id || index; const currentStatus = (app.status || 'pending').toLowerCase(); return <div key={appId} className="grid gap-3 rounded-xl border border-[#e4e9e5] p-4 md:grid-cols-[1fr_1fr_160px] md:items-center"><div><p className="font-semibold text-[#172238]">{app.teacher_name || app.teacher_email || 'Applicant'}</p><p className="text-xs text-[#718078]">{app.teacher_email || 'Teacher profile'}</p></div><p className="text-sm text-[#607064]">{jobs.find((job) => (job.job_id || job.id) === app.jobId)?.title || 'Teaching opportunity'}</p><select value={currentStatus} disabled={!!statusUpdating[appId]} onChange={(e) => handleStatusChange(app.jobId, appId, e.target.value)} className="rounded-lg border border-[#dfe5e1] bg-[#f8faf8] px-2 py-2 text-xs text-[#172238] outline-none"><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="shortlisted">Shortlisted</option><option value="rejected">Rejected</option><option value="hired">Hired</option></select></div>; })}</div>}
    </div>
  );

  return (
    <div className="admin-dashboard-shell min-h-screen bg-[#f6f8f7] text-[#172238]">
      <div className="flex min-h-screen">
        <aside className="admin-desktop-sidebar hidden w-56 shrink-0 border-r border-[#e3e8e4] bg-white p-5 md:block">
          <div className="admin-sidebar-inner">
            <div className="admin-sidebar-brand"><BrandLogo /></div>
            <nav className="admin-sidebar-nav">
              {navItems.map(([key, label, Icon]) => (
                <button key={key} type="button" onClick={() => setActiveTab(key)} className={`admin-sidebar-nav-item ${activeTab === key ? 'is-active' : ''}`}>
                  <Icon size={19} />
                  <span>{isSchool && key === 'applicants' ? 'Teachers' : label}</span>
                  {key === 'notifications' && <i className="admin-sidebar-notification-dot" />}
                </button>
              ))}
            </nav>
            {isSchool && <div className="admin-sidebar-help"><strong>Need help recruiting?</strong><button type="button" onClick={() => setActiveTab('post-job')}><FiPlus size={14} />Post a Job</button></div>}
            <button type="button" onClick={logout} className="admin-sidebar-logout"><FiLogOut size={17} />Log out</button>
          </div>
        </aside>

        <div className="admin-dashboard-main-wrapper flex min-w-0 flex-1 flex-col">
          <header className="admin-desktop-header flex items-center justify-between border-b border-[#e3e8e4] bg-white px-5 py-4 md:px-8">
            <div className="admin-topbar-spacer" />
            <label className="admin-topbar-search">
              <FiSearch size={18} />
              <input type="search" placeholder="Search vacancies in Lagos..." aria-label="Search vacancies" />
            </label>
            <div className="admin-topbar-account">
              <button type="button" onClick={() => setActiveTab('notifications')} className="admin-topbar-notifications" aria-label="Notifications"><FiBell size={18} /><span /></button>
              <div className="admin-topbar-divider" />
              <div className="admin-topbar-user"><strong>{user?.admin_name || 'Admin User'}</strong><span>{user?.school_name || user?.full_name || 'BrightMind Academy'}</span></div>
              <button type="button" onClick={logout} className="admin-topbar-avatar" aria-label="Log out">
                {user?.profile_image || user?.avatar_url || user?.profile_picture ? <img src={user.profile_image || user.avatar_url || user.profile_picture} alt="" /> : <span>{(user?.full_name || 'BM').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>}
              </button>
            </div>
          </header>

          <header className="admin-mobile-header">
            <div className="admin-mobile-avatar" aria-label={user?.full_name || 'School administrator'}>
              {(user?.full_name || 'School').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <BrandLogo />
            <button type="button" onClick={() => setActiveTab('notifications')} className="admin-mobile-bell" aria-label="Notifications">
              <FiBell size={20} />
              <span />
            </button>
          </header>

          <main className="admin-dashboard-main w-full flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-gray-600 shadow-sm">
            Loading dashboard data…
          </div>
        ) : (
          <>
            {isSchool && activeTab === 'overview' && renderSchoolOverview()}
            {activeTab === 'overview' && !isSchool && <>
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h2 className="text-2xl font-bold">Good morning, {user?.full_name || (isSchool ? 'School Administrator' : 'Admin')}</h2><p className="mt-1 text-sm text-[#718078]">Manage your school's hiring and recruitment activity.</p></div>{isSchool && <button type="button" onClick={() => setActiveTab('post-job')} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1ccb43] px-5 py-3 text-sm font-bold text-[#12331f]"><FiPlus /> Post a job</button>}</div>
            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['total_users', 'Total Users'],
                ['total_teachers', 'Teachers'],
                ['total_schools', 'Schools'],
                ['total_jobs', 'Jobs'],
                ['active_jobs', 'Active Jobs'],
                ['total_applications', 'Applications'],
                ['pending_verifications', 'Pending Verifications'],
              ].map(([key, label]) => (
                <div key={key} className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
                  <div className="mt-3 text-3xl font-bold text-gray-900">{stats[key] ?? 0}</div>
                </div>
              ))}
            </div>

            {isSchool && <div className="mb-6 grid gap-4 md:grid-cols-3">{[['active_jobs', 'Active Jobs', FiBriefcase], ['total_applications', 'Total Applicants', FiUsers], ['pending_verifications', 'Pending Reviews', FiClock]].map(([key, label, Icon]) => <div key={key} className="rounded-2xl border border-[#dfe5e1] bg-white p-5 shadow-sm"><Icon className="mb-4 text-[#8ca49a]" /><p className="text-xs text-[#718078]">{label}</p><p className="mt-2 text-3xl font-bold">{stats[key] ?? 0}</p></div>)}</div>}

            {isSchool && activeTab === 'overview' && (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-800">Your Job Posts</h2>
                {jobs.length === 0 ? (
                  <p className="text-gray-600">No jobs published yet.</p>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => {
                      const jobId = job.job_id || job.id;
                      const applicants = applicantsByJob[jobId] || [];

                      return (
                        <div key={jobId} className="rounded-xl border border-gray-200 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold text-gray-800">{job.title || 'Teaching role'}</div>
                              <div className="text-sm text-gray-500">{job.location || 'Location pending'} • {job.employment_type || 'full-time'}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteJob(jobId)}
                              className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>

                          <div className="text-sm text-gray-600">
                            {job.description || 'No description provided.'}
                          </div>

                          <div className="mt-3 rounded-lg bg-gray-50 p-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Applicants</div>
                            {applicants.length === 0 ? (
                              <div className="text-sm text-gray-500">No applicants yet.</div>
                            ) : (
                              <div className="space-y-2">
                                {applicants.slice(0, 6).map((app, idx) => {
                                  const appId = app.application_id || app.id || idx;
                                  const currentStatus = (app.status || 'pending').toLowerCase();

                                  return (
                                    <div key={appId} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="text-gray-700">{app.teacher_name || app.teacher_email || 'Applicant'}</span>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-emerald-700">
                                          {currentStatus}
                                        </span>
                                      </div>

                                      <div className="mt-2">
                                        <select
                                          value={currentStatus}
                                          disabled={!!statusUpdating[appId]}
                                          onChange={(e) => handleStatusChange(jobId, appId, e.target.value)}
                                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 outline-none"
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="reviewed">Reviewed</option>
                                          <option value="shortlisted">Shortlisted</option>
                                          <option value="rejected">Rejected</option>
                                          <option value="hired">Hired</option>
                                        </select>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!isSchool && activeTab === 'verifications' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-800">Pending Verifications</h2>
                {verifications.length === 0 ? (
                  <p className="text-gray-600">No pending verification requests right now.</p>
                ) : (
                  <div className="space-y-3">
                    {verifications.map((item) => (
                      <div key={item.profile_id || item.user_id || item.school_name} className="rounded-xl border border-gray-200 p-3">
                        <div className="font-semibold text-gray-800">{item.school_name || 'School Profile'}</div>
                        <div className="text-sm text-gray-500">{item.state || item.address || 'Location pending'}</div>
                        <span className="mt-2 inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 uppercase">
                          {item.verification_status || 'pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            </>}
            {activeTab === 'post-job' && isSchool && renderJobForm()}
            {activeTab === 'jobs' && isSchool && renderJobs()}
            {activeTab === 'applicants' && isSchool && renderApplicants()}
            {isSchool && activeTab === 'notifications' && renderDesktopNotifications()}
            {activeTab === 'notifications' && <>
              <div className="admin-mobile-notification-header">
                <button type="button" onClick={() => setActiveTab('overview')} aria-label="Back to dashboard"><FiArrowLeft size={22} /></button>
                <h2>Notifications</h2>
                <span />
              </div>
              <div className="admin-mobile-notifications-content rounded-2xl border border-[#dfe5e1] bg-white p-10 text-center shadow-sm"><FiBell className="mx-auto mb-4 text-[#1ccb43]" size={32} /><h2 className="text-xl font-bold">Notifications</h2><p className="mt-2 text-sm text-[#718078]">You are all caught up.</p></div>
            </>}
            {activeTab === 'settings' && <div className="rounded-2xl border border-[#dfe5e1] bg-white p-10 text-center shadow-sm"><FiSettings className="mx-auto mb-4 text-[#1ccb43]" size={32} /><h2 className="text-xl font-bold">Settings</h2><p className="mt-2 text-sm text-[#718078]">Dashboard preferences will appear here.</p></div>}
          </>
        )}
            </div>
          </main>
        </div>
      </div>
      <nav className="admin-mobile-bottomnav" aria-label="Mobile dashboard navigation">
        {navItems.map(([key, label, Icon]) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)} className={activeTab === key ? 'is-active' : ''}>
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <style>{`
        .school-overview {
          color: #20252b;
          font-family: 'DM Sans', sans-serif;
        }
        .school-overview-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(260px, 1fr);
          gap: 16px;
          margin-bottom: 14px;
        }
        .school-welcome-panel,
        .school-profile-card,
        .school-overview-section {
          border: 1px solid #d9dddf;
          border-radius: 18px;
          background: #fff;
        }
        .school-welcome-panel { padding: 24px 22px; }
        .school-welcome-panel h2 {
          margin: 0 0 7px;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: 0;
        }
        .school-welcome-panel p {
          margin: 0;
          color: #62686d;
          font-size: 13px;
          line-height: 1.5;
        }
        .school-overview-actions { display: flex; gap: 10px; margin-top: 16px; }
        .school-overview-actions button,
        .school-section-heading button,
        .school-review-button,
        .school-schedule-button {
          border: 1px solid #d9dddf;
          border-radius: 999px;
          background: #fff;
          color: #20252b;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }
        .school-overview-actions button { padding: 9px 14px; }
        .school-overview-actions button:first-child { display: inline-flex; align-items: center; gap: 5px; border-color: #1ccb43; background: #1ccb43; }
        .school-profile-card { padding: 25px 16px 16px; }
        .school-profile-heading { display: flex; align-items: center; gap: 10px; }
        .school-profile-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #e1f0d5; color: #356947; }
        .school-profile-heading div { display: flex; flex-direction: column; gap: 3px; }
        .school-profile-heading strong { font-size: 13px; font-weight: 500; }
        .school-profile-heading span:last-child { color: #6c7276; font-size: 11px; }
        .school-profile-progress-label { display: flex; justify-content: space-between; margin-top: 16px; font-size: 11px; }
        .school-profile-progress-label strong { font-weight: 700; }
        .school-profile-progress { height: 5px; margin-top: 5px; overflow: hidden; border-radius: 999px; background: #e2e5e6; }
        .school-profile-progress span { display: block; width: 75%; height: 100%; border-radius: inherit; background: #073e32; }
        .school-profile-card p { display: flex; align-items: center; gap: 4px; margin: 10px 0 0; color: #62686d; font-size: 10px; }
        .school-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 30px; }
        .school-stat-card { position: relative; min-height: 105px; padding: 13px 15px; border: 1px solid #d9dddf; border-radius: 18px; background: #f5f6f7; }
        .school-stat-card > span { display: block; font-size: 11px; }
        .school-stat-card > svg { position: absolute; top: 13px; right: 14px; color: #c5cacc; }
        .school-stat-card > strong { display: block; margin-top: 43px; font-size: 29px; font-weight: 700; line-height: 1; }
        .school-overview-section { overflow: hidden; margin-bottom: 14px; }
        .school-section-heading { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; }
        .school-section-heading h3 { margin: 0; font-size: 15px; font-weight: 500; }
        .school-section-heading button { border: 0; padding: 0; font-size: 11px; }
        .school-section-heading button span { font-size: 14px; }
        .school-applicant-table { border-top: 1px solid #e1e4e5; }
        .school-table-row { display: grid; grid-template-columns: 1.2fr 1.25fr .7fr .65fr; align-items: center; min-height: 42px; padding: 0 16px; border-bottom: 1px solid #e1e4e5; color: #454b50; font-size: 11px; }
        .school-table-row:last-child { border-bottom: 0; }
        .school-table-head { min-height: 29px; background: #fafbfb; color: #747b80; font-size: 10px; }
        .school-applicant-name { display: flex; align-items: center; gap: 8px; color: #292f34; }
        .school-applicant-name i { display: grid; place-items: center; width: 21px; height: 21px; border-radius: 50%; background: #cfe8db; color: #355b49; font-size: 7px; font-style: normal; font-weight: 700; }
        .school-status { width: fit-content; padding: 4px 8px; border-radius: 999px; background: #dfe3e6; color: #5d666c; font-size: 9px; font-weight: 700; }
        .school-status-shortlisted { background: #dcebd1; color: #41673a; }
        .school-status-new { background: #073e32; color: #fff; }
        .school-review-button { padding: 5px 10px; justify-self: start; border-radius: 3px; font-size: 10px; }
        .school-posting-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 16px 16px; }
        .school-posting-card { position: relative; min-height: 84px; padding: 13px; border: 1px solid #d9dddf; border-radius: 8px; }
        .school-posting-card > div:first-child { display: flex; flex-direction: column; gap: 4px; }
        .school-posting-card strong { font-size: 12px; font-weight: 500; }
        .school-posting-card span { color: #62686d; font-size: 10px; }
        .school-posting-icon { position: absolute; top: 13px; right: 13px; padding: 5px; width: 25px; height: 25px; border-radius: 4px; background: #e4edff; color: #667d9d; }
        .school-posting-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; }
        .school-posting-footer span { display: flex; align-items: center; gap: 4px; color: #263f36; font-weight: 700; }
        .school-posting-footer small { color: #62686d; font-size: 9px; }
        .school-interviews-section { padding-bottom: 14px; }
        .school-interviews-section > .school-section-heading { padding-bottom: 12px; }
        .school-empty-interviews { display: flex; align-items: center; gap: 10px; margin: 0 16px 10px; padding: 12px; border-radius: 8px; background: #f5f6f7; }
        .school-empty-interviews > span { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #dcefe5; color: #346850; }
        .school-empty-interviews div { display: flex; flex-direction: column; gap: 3px; }
        .school-empty-interviews strong { font-size: 11px; font-weight: 600; }
        .school-empty-interviews small { color: #62686d; font-size: 10px; }
        .school-schedule-button { display: block; width: calc(100% - 32px); margin: 0 16px; padding: 7px; border-radius: 5px; font-size: 10px; }
        .school-desktop-notifications { display: none; }
        .school-notifications-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .school-notifications-heading h2 { margin: 0; color: #20252b; font-size: 28px; font-weight: 700; }
        .school-notifications-heading p { display: flex; align-items: center; gap: 10px; margin: 6px 0 0; color: #62686d; font-size: 12px; }
        .school-notifications-heading p strong { padding: 4px 10px; border-radius: 999px; background: #22dd55; color: #07331b; font-size: 9px; }
        .school-notifications-heading button { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: #16843d; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
        .school-notifications-panel { padding: 32px 35px 20px; border-radius: 28px; background: #fff; box-shadow: 0 8px 25px rgba(23, 34, 56, .05); }
        .school-notifications-panel > h3 { margin: 0 0 17px; color: #20252b; font-size: 15px; font-weight: 600; }
        .school-notifications-panel > h3:not(:first-child) { margin-top: 35px; }
        .school-notification-highlight { display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; gap: 18px; align-items: start; margin-bottom: 8px; padding: 20px; border-radius: 24px; background: #f5f5f7; }
        .school-notification-highlight--green { background: #f4f4f6; }
        .school-notification-highlight--red { background: #f4f4f6; }
        .school-notification-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #edf0ed; color: #526158; }
        .school-notification-highlight--green .school-notification-icon { background: #dff3e6; color: #467a4c; }
        .school-notification-highlight--red .school-notification-icon { background: #ffd9d6; color: #bb2027; }
        .school-notification-highlight b, .school-notification-simple b { display: block; margin-bottom: 5px; color: #47624e; font-size: 9px; font-weight: 700; letter-spacing: .04em; }
        .school-notification-highlight--red b { color: #c4262c; }
        .school-notification-highlight strong, .school-notification-simple strong { display: block; color: #20252b; font-size: 14px; font-weight: 500; }
        .school-notification-highlight p, .school-notification-simple p { margin: 6px 0 0; color: #62686d; font-size: 11px; line-height: 1.45; }
        .school-notification-highlight time, .school-notification-simple time { color: #62686d; font-size: 10px; white-space: nowrap; }
        .school-notification-simple { display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; gap: 18px; align-items: start; padding: 15px 20px; }
        .school-notification-simple .school-notification-icon { background: #eef0f1; }
        .school-load-more { display: flex; align-items: center; justify-content: center; gap: 8px; width: fit-content; min-width: 126px; margin: 27px auto 0; padding: 10px 17px; border: 1px solid #dfe2e4; border-radius: 999px; background: #eef0f1; color: #20252b; font: inherit; font-size: 11px; font-weight: 600; line-height: 1; cursor: pointer; transition: background .2s ease, border-color .2s ease, box-shadow .2s ease; }
        .school-load-more:hover { border-color: #cbd1ce; background: #e3e7e5; box-shadow: 0 3px 10px rgba(23, 34, 56, .08); }
        .school-load-more svg { color: #526158; stroke-width: 2.5; }

        .admin-sidebar-inner { display: flex; flex-direction: column; min-height: calc(100vh - 40px); }
        .admin-sidebar-brand { display: flex; align-items: center; min-height: 44px; margin: 0 14px 42px; }
        .admin-sidebar-brand .brand-logo-image { width: 142px; }
        .admin-sidebar-nav { display: flex; flex-direction: column; gap: 7px; }
        .admin-sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          min-height: 44px;
          padding: 0 15px;
          border: 0;
          border-radius: 0 16px 16px 0;
          background: transparent;
          color: #252b3d;
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: background .2s ease, color .2s ease;
        }
        .admin-sidebar-nav-item:hover { background: #f2f8f3; }
        .admin-sidebar-nav-item.is-active { background: #e1f4e7; color: #125f31; }
        .admin-sidebar-nav-item.is-active::before { position: absolute; top: 0; bottom: 0; left: 0; width: 3px; border-radius: 0 4px 4px 0; background: #16843d; content: ''; }
        .admin-sidebar-nav-item svg { flex: 0 0 auto; }
        .admin-sidebar-notification-dot { width: 7px; height: 7px; margin-left: auto; border-radius: 50%; background: #c92c31; }
        .admin-sidebar-help { margin-top: auto; padding: 17px 16px 15px; border-radius: 17px; background: #e4f7e9; }
        .admin-sidebar-help strong { display: block; margin-bottom: 10px; color: #14552d; font-size: 12px; font-weight: 600; }
        .admin-sidebar-help button { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; padding: 11px 8px; border: 0; border-radius: 999px; background: #22dd55; color: #07331b; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
        .admin-sidebar-logout { display: flex; align-items: center; gap: 10px; margin: 16px 12px 0; padding: 4px 0; border: 0; background: transparent; color: #65716a; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
        .admin-topbar-spacer { flex: 1; }
        .admin-topbar-search { display: flex; align-items: center; gap: 14px; width: 282px; height: 45px; margin-left: auto; padding: 0 16px; border-radius: 16px; background: #e3e5e6; color: #526158; }
        .admin-topbar-search input { width: 100%; border: 0; outline: 0; background: transparent; color: #27312d; font: inherit; font-size: 12px; }
        .admin-topbar-search input::placeholder { color: #7c858b; opacity: 1; }
        .admin-topbar-account { display: flex; align-items: center; gap: 13px; margin-left: 25px; }
        .admin-topbar-notifications { position: relative; display: grid; place-items: center; padding: 0; border: 0; background: transparent; color: #48544c; cursor: pointer; }
        .admin-topbar-notifications span { position: absolute; top: 0; right: -2px; width: 5px; height: 5px; border-radius: 50%; background: #c92c31; }
        .admin-topbar-divider { width: 1px; height: 28px; background: #d4d9d6; }
        .admin-topbar-user { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; white-space: nowrap; }
        .admin-topbar-user strong { color: #20252b; font-size: 13px; font-weight: 700; }
        .admin-topbar-user span { color: #707a75; font-size: 11px; }
        .admin-topbar-avatar { display: grid; place-items: center; width: 36px; height: 36px; overflow: hidden; padding: 0; border: 2px solid #16843d; border-radius: 50%; background: #dcefe2; color: #166534; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
        .admin-topbar-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .admin-mobile-notification-header { display: none; }
        @media (min-width: 769px) {
          .admin-desktop-sidebar { position: fixed; z-index: 30; top: 0; bottom: 0; left: 0; overflow-y: auto; }
          .admin-dashboard-main-wrapper { margin-left: 14rem; }
          .admin-desktop-header { position: fixed; z-index: 25; top: 0; right: 0; left: 14rem; min-height: 68px; }
          .admin-dashboard-main { padding-top: 92px; }
        }
        @media (min-width: 769px) {
          .school-desktop-notifications { display: block; }
          .admin-mobile-notifications-content { display: none; }
        }

        .admin-mobile-header,
        .admin-mobile-bottomnav { display: none; }

        @media (max-width: 768px) {
          .admin-dashboard-shell { background: #f4f5f7; padding-bottom: 78px; }
          .admin-dashboard-shell > .flex { min-height: 0; }
          .school-overview-hero { grid-template-columns: 1fr; gap: 12px; }
          .school-welcome-panel { padding: 22px 18px; }
          .school-welcome-panel h2 { font-size: 21px; }
          .school-profile-card { padding: 18px 16px; }
          .school-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 22px; }
          .school-stat-card { min-height: 92px; padding: 12px; }
          .school-stat-card > strong { margin-top: 35px; font-size: 26px; }
          .school-overview-section { border-radius: 16px; }
          .school-table-row { grid-template-columns: 1.25fr 1fr .7fr .55fr; padding: 0 11px; font-size: 8px; }
          .school-table-head { font-size: 7px; }
          .school-posting-grid { grid-template-columns: 1fr; }
          .admin-mobile-notification-header { display: flex; align-items: center; justify-content: space-between; min-height: 44px; margin: -4px 0 16px; }
          .admin-mobile-notification-header button { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%; background: #fff; color: #20252b; box-shadow: 0 2px 8px rgba(23, 34, 56, .06); }
          .admin-mobile-notification-header h2 { margin: 0; color: #20252b; font-size: 18px; font-weight: 700; }
          .admin-mobile-notification-header span { width: 36px; height: 36px; }
          .admin-desktop-sidebar,
          .admin-desktop-header { display: none; }
          .admin-dashboard-main-wrapper { margin-left: 0; }
          .admin-mobile-header {
            display: flex;
            position: relative;
            align-items: center;
            justify-content: space-between;
            height: 68px;
            padding: 0 20px;
            background: #fff;
            border-bottom: 1px solid #e7ebe8;
          }
          .admin-mobile-header .brand-logo-image { width: 126px; }
          .admin-mobile-avatar {
            display: grid;
            place-items: center;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #dcf6e3;
            color: #166534;
            font-size: 11px;
            font-weight: 800;
          }
          .admin-mobile-bell {
            position: relative;
            display: grid;
            place-items: center;
            width: 34px;
            height: 34px;
            border: 0;
            background: transparent;
            color: #526158;
          }
          .admin-mobile-bell span {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #dc5b5b;
          }
          .admin-dashboard-main { padding: 24px 18px 20px; }
          .admin-dashboard-main > div { max-width: none; }
          .admin-dashboard-main h2 { line-height: 1.25; }
          .admin-dashboard-main .mb-6:first-child { margin-bottom: 22px; }
          .admin-dashboard-main .mb-6:first-child h2 { font-size: 23px; }
          .admin-dashboard-main .mb-6:first-child p { font-size: 13px; line-height: 1.5; }
          .admin-dashboard-main .mb-6:first-child button { width: 100%; justify-content: center; }
          .admin-dashboard-main .grid.md\\:grid-cols-2.xl\\:grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 14px;
          }
          .admin-dashboard-main .grid.md\\:grid-cols-2.xl\\:grid-cols-4 > div,
          .admin-dashboard-main .grid.md\\:grid-cols-3 > div {
            border-radius: 20px;
            padding: 16px;
          }
          .admin-dashboard-main .grid.md\\:grid-cols-2.xl\\:grid-cols-4 > div:nth-child(n+4) { display: none; }
          .admin-dashboard-main .grid.md\\:grid-cols-2.xl\\:grid-cols-4 > div > div:last-child { margin-top: 8px; font-size: 26px; }
          .admin-dashboard-main .grid.md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 20px; }
          .admin-dashboard-main .grid.md\\:grid-cols-3 > div { padding: 12px 10px; }
          .admin-dashboard-main .grid.md\\:grid-cols-3 svg { width: 18px; margin-bottom: 10px; }
          .admin-dashboard-main .grid.md\\:grid-cols-3 p:last-child { margin-top: 5px; font-size: 22px; }
          .admin-dashboard-main .rounded-2xl { border-radius: 22px; }
          .admin-dashboard-main .rounded-2xl.bg-white { padding: 18px; }
          .admin-dashboard-main .rounded-2xl.bg-white > h2 { font-size: 18px; }
          .admin-dashboard-main .rounded-xl { border-radius: 16px; }
          .admin-mobile-bottomnav {
            position: fixed;
            z-index: 20;
            right: 0;
            bottom: 0;
            left: 0;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            padding: 10px 8px calc(10px + env(safe-area-inset-bottom));
            background: rgba(255, 255, 255, .72);
            border: 1px solid rgba(255, 255, 255, .82);
            border-bottom: 0;
            border-radius: 24px 24px 0 0;
            box-shadow: 0 -8px 28px rgba(23, 34, 56, .08), inset 0 1px 0 rgba(255, 255, 255, .7);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
            backdrop-filter: blur(18px) saturate(140%);
          }
          .admin-mobile-bottomnav button {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            border: 0;
            background: transparent;
            color: #8a9890;
            font-size: 10px;
            font-weight: 700;
          }
          .admin-mobile-bottomnav button.is-active { color: #16843d; }
        }
      `}</style>
    </div>
  );
}
