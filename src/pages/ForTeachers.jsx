import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SiteFooter from '../components/SiteFooter';
import classroomHelpImg from '../assets/classroom_help.webp';
import teacherRoleImg from '../assets/teacher-role.webp';
import smileyImg from '../assets/smiley.webp';
import recruitmentImg from '../assets/about_meeting.webp'; // Reused meeting image

export default function ForTeachers() {
  return (
    <div className="brand-typography font-sans text-gray-900 bg-[#FAF9F6] min-h-screen">
      <Navbar sticky />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Hero Left Content */}
        <div className="flex-1 max-w-xl">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-3">For Teachers</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-primary">More Opportunities,</span><br />
            Less Stress
          </h1>
          <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed">
            Staffroom helps teachers discover verified teaching opportunities, connect with private schools, and grow professionally through a platform built specifically for education.
          </p>
          <Link 
            to="/signup" 
            className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 text-sm md:text-base"
          >
            Create Teacher Account
          </Link>
        </div>

        {/* Hero Right Images - Staggered layout matching mockup */}
        <div className="flex-1 flex items-center justify-center gap-4 w-full h-[400px] md:h-[500px]">
          {/* Left image - medium */}
          <div className="w-1/3 h-[75%] rounded-3xl overflow-hidden shadow-md -translate-y-4">
            <img src={classroomHelpImg} alt="Teacher helping children" className="w-full h-full object-cover" />
          </div>
          {/* Center image - tall */}
          <div className="w-1/3 h-[95%] rounded-3xl overflow-hidden shadow-lg border-2 border-white">
            <img src={teacherRoleImg} alt="Male teacher writing" className="w-full h-full object-cover" />
          </div>
          {/* Right image - medium */}
          <div className="w-1/3 h-[75%] rounded-3xl overflow-hidden shadow-md translate-y-4">
            <img src={smileyImg} alt="Smiling teacher" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Why Staffroom for Teachers Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        <div className="bg-dark-green text-white p-8 md:p-12 rounded-3xl shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Staffroom for Teachers</h2>
          <div className="space-y-6 text-emerald-50/90 text-sm md:text-base leading-relaxed max-w-4xl">
            <p>
              Teaching opportunities are often scattered across informal channels, making it difficult for qualified educators to find reliable openings that match their skills and experience. Many teachers spend valuable time searching through unverified listings, relying on word of mouth, or navigating long and frustrating hiring processes.
            </p>
            <p>
              Staffroom changes that by creating a dedicated platform where teachers can access structured opportunities from trusted private schools in one place.
            </p>
          </div>
        </div>
      </section>

      {/* What Teachers Can Do on Staffroom */}
      <section className="bg-light-green/20 border-y border-emerald-500/5 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-14">
            What Teachers Can Do on Staffroom
          </h2>

          {/* Cards Grid */}
          <div className="space-y-6">
            {/* Top Row - 3 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center mb-6 shrink-0">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Access Verified Opportunities</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Discover teaching jobs from schools actively hiring qualified educators.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center mb-6 shrink-0">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Build a Professional Profile</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Showcase your teaching subjects, experience, qualifications, and strengths in a structured and professional way.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center mb-6 shrink-0">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Apply With Ease</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Apply to opportunities directly through the platform without unnecessary stress or paperwork.
                </p>
              </div>
            </div>

            {/* Bottom Row - 2 Cards Centered */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Card 4 */}
              <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center mb-6 shrink-0">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Increase Your Visibility</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Help schools discover your profile based on your expertise, teaching level, and location.
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center mb-6 shrink-0">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Grow Professionally</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Access opportunities that support your long-term teaching career and professional development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Designed for Modern Educators */}
      <section className="bg-dark-green text-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1CCB43]">
              Designed for Modern Educators
            </h2>
            <p className="text-emerald-50/90 text-sm md:text-base leading-relaxed">
              Whether you're an experienced teacher, a recent graduate entering the education field, or an educator searching for better opportunities, Staffroom is designed to simplify your journey and help you focus on what matters most — teaching and impact.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img 
              src={recruitmentImg} 
              alt="Educators planning meeting" 
              className="w-full h-auto object-cover max-h-[380px]" 
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-[#D6FBC5] min-h-screen flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Ready to Find Your Next Opportunity?
          </h2>
          <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed max-w-2xl mx-auto">
            Join a growing network of educators connecting with schools through Staffroom.
          </p>
          <Link 
            to="/signup" 
            className="inline-block bg-primary hover:bg-primary-dark text-white px-10 py-3.5 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/25"
          >
            Sign Up
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
