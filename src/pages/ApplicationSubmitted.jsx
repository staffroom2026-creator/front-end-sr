import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function ApplicationSubmitted() {
  const location = useLocation();
  const { user } = useAuth();
  const submission = location.state || {};
  const jobTitle = submission.job?.title || submission.title || 'Teaching Role';
  const schoolName = submission.job?.school || submission.school || 'School';
  const schoolLocation = submission.job?.location || submission.location || 'Location pending';
  const teacherName = user?.full_name || 'Teacher';

  return (
    <div className="font-sans text-[#1C1C1C] bg-[#F5F8FC] min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 md:px-8 py-16">
        <div className="bg-white rounded-[40px] shadow-[0_30px_90px_rgba(15,23,42,0.12)] p-10 md:p-14">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#E6F7EC] text-[#1CCB43] shadow-sm">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16A34A]">Application Submitted</p>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Application Submitted Successfully!</h1>
              <p className="max-w-2xl mx-auto text-sm md:text-base text-[#4B5563] leading-relaxed">
                {teacherName}'s professional profile has been delivered to the hiring committee for {jobTitle}. We will notify you when the school reviews your application.
              </p>
            </div>
          </div>

          <div className="mt-10 bg-[#F8FAFC] rounded-3xl border border-[#E5E7EB] p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#111827] text-white text-lg font-bold">M</div>
                <div>
                  <p className="text-xs tracking-[0.18em] uppercase text-[#16A34A] font-semibold">Position applied</p>
                  <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">{jobTitle}</h2>
                </div>
              </div>

              <div className="text-sm text-[#6B7280]">
                <p>{schoolName}</p>
                <p>{schoolLocation}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#111827]">Add a short note to the recruiter (Optional)</p>
              <textarea
                className="w-full min-h-[150px] rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] px-5 py-4 text-sm text-[#111827] outline-none focus:border-[#1CCB43] focus:ring-2 focus:ring-[#DCFCE7]"
                placeholder="Highlight a specific teaching achievement or personal motivation for the school..."
              />
            </div>

            <div className="flex flex-col justify-between gap-4">
              <button className="w-full rounded-3xl bg-[#1CCB43] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#17a63b]">
                Update Application Note
              </button>
              <button className="w-full rounded-3xl border border-[#D1D5DB] bg-white px-6 py-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F3F4F6]">
                View Application Status
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/teacher-dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#16A34A] hover:text-[#15803d]">
              Browse More Jobs in Nigeria
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
