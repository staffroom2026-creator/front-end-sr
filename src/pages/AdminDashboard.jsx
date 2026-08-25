import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { apiErrorMessage } from '../services/api';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-5xl text-center">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1CCB43]">Staffroom</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-800">{adminLabel}</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>

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

            {isSchool && (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-800">Post a New Job</h2>
                <form onSubmit={handleCreateJob} className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                    placeholder="Job title"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    required
                  />
                  <input
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                    placeholder="Location"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    required
                  />
                  <input
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                    placeholder="Role type"
                    value={jobForm.role_type}
                    onChange={(e) => setJobForm({ ...jobForm, role_type: e.target.value })}
                  />
                  <input
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
                    placeholder="Employment type"
                    value={jobForm.employment_type}
                    onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                  />
                  <input
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none md:col-span-2"
                    placeholder="Salary range"
                    value={jobForm.salary_range}
                    onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                  />
                  <textarea
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none md:col-span-2"
                    placeholder="Job description"
                    rows={3}
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    required
                  />
                  <textarea
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none md:col-span-2"
                    placeholder="Requirements"
                    rows={2}
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  />
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full bg-[#1CCB43] px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-[#17b53a] disabled:opacity-60"
                    >
                      {submitting ? 'Posting…' : 'Publish Job'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isSchool && (
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

            {!isSchool && (
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
          </>
        )}
      </div>
    </div>
  );
}
