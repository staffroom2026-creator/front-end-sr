import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import schoolOfficerImg from '../assets/school_officer.webp';
import femaleEducatorImg from '../assets/female_educator.webp';
import schoolCollabImg from '../assets/school_collab.webp';
import recruitmentImg from '../assets/about_meeting.webp'; // Reused meeting image

export default function ForSchools() {
  return (
    <div className="brand-typography font-sans text-gray-900 bg-[#FAF9F6] min-h-screen">
      <Navbar sticky />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Hero Left Content */}
        <div className="flex-1 max-w-xl">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-3">For Schools</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Hire <span className="text-primary">Qualified Teachers</span> Without the Hiring Stress
          </h1>
          <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed">
            Staffroom helps private schools simplify recruitment, discover qualified educators faster, and build stronger academic teams through a more structured hiring process.
          </p>
          <Link 
            to="/signup" 
            className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 text-sm md:text-base"
          >
            Create School Account
          </Link>
        </div>

        {/* Hero Right Images - Staggered layout matching mockup */}
        <div className="flex-1 flex items-center justify-center gap-4 w-full h-[400px] md:h-[500px]">
          {/* Left image - medium */}
          <div className="w-1/3 h-[75%] rounded-3xl overflow-hidden shadow-md -translate-y-4">
            <img src={schoolOfficerImg} alt="School principal" className="w-full h-full object-cover" />
          </div>
          {/* Center image - tall */}
          <div className="w-1/3 h-[95%] rounded-3xl overflow-hidden shadow-lg border-2 border-white">
            <img src={femaleEducatorImg} alt="Female teacher working" className="w-full h-full object-cover" />
          </div>
          {/* Right image - medium */}
          <div className="w-1/3 h-[75%] rounded-3xl overflow-hidden shadow-md translate-y-4">
            <img src={schoolCollabImg} alt="Teachers collaborating" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Why Staffroom for Schools Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        <div className="bg-dark-green text-white p-8 md:p-12 rounded-3xl shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Staffroom for Schools</h2>
          <div className="space-y-6 text-emerald-50/90 text-sm md:text-base leading-relaxed max-w-4xl">
            <p>
              Finding the right teachers shouldn't feel slow, scattered, or overwhelming. Many schools still rely on informal hiring methods, unstructured applications, and time-consuming recruitment processes that make it difficult to identify qualified candidates quickly.
            </p>
            <p>
              Staffroom provides a focused platform built specifically for education hiring — helping schools recruit more efficiently, manage applications better, and connect with educators in a more reliable way.
            </p>
          </div>
        </div>
      </section>

      {/* What Schools/Teachers Can Do on Staffroom */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Access Qualified Educators</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Discover teachers across different subjects, etc., through structured professional profiles.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center mb-6 shrink-0">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Simplify Recruitment</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Reduce hiring stress with a more organized process for posting jobs, reviewing applications, and managing candidates.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center mb-6 shrink-0">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Post Structured Opportunities</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Create clear and detailed job listings with subject requirements, expectations, and teaching qualifications.
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
                <h3 className="font-bold text-gray-900 text-lg mb-3">Hire Faster</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Connect with available educators quickly and reduce delays in filling important academic positions.
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center mb-6 shrink-0">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Build Stronger Academic Teams</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Find teachers who align with your institution's standards, values, and learning goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Built Specifically for Education */}
      <section className="bg-dark-green text-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1CCB43]">
              Recruitment Built Specifically for Education
            </h2>
            <p className="text-emerald-50/90 text-sm md:text-base leading-relaxed">
              Staffroom is designed to support private schools looking for a more modern and reliable way to recruit educators. Whether you're hiring for a growing academic team, replacing teaching staff, or preparing for a new session, the platform helps simplify the process without unnecessary complexity.
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
    </div>
  );
}
