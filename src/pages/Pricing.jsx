import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SiteFooter from '../components/SiteFooter';

import teacherImg from '../assets/early_adopter_teacher.webp';

export default function Pricing() {
  return (
    <div className="brand-typography font-sans text-gray-900 bg-white min-h-screen flex flex-col">
      <Navbar sticky />

      {/* Main Early Adopters Banner */}
      <main className="relative flex-1 bg-white overflow-hidden flex items-center">
        {/* Soft mint organic background shapes matching the design */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle radial/linear mint glow on right */}
          <div className="absolute -top-24 -right-24 w-[750px] h-[750px] rounded-full bg-[#E5F7EC]/70 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-[#EDF9F2]/90 blur-2xl" />
          
          {/* Fluid organic curve SVG accents */}
          <svg
            className="absolute right-0 top-0 h-full w-auto text-[#E7F8EE]/60 max-w-none"
            viewBox="0 0 800 650"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M320 0C440 80 470 200 420 320C370 440 430 550 560 650H800V0H320Z"
              fill="currentColor"
            />
          </svg>
          <svg
            className="absolute right-12 top-10 h-[85%] w-auto text-[#DCF5E6]/40 max-w-none"
            viewBox="0 0 600 600"
            fill="none"
          >
            <path
              d="M200 80C340 30 450 120 480 260C510 400 410 520 280 550C150 580 80 460 70 340C60 220 100 120 200 80Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left z-20">
              {/* Badge: Early Adopter Access */}
              <div className="inline-flex items-center gap-2 bg-[#E9F9EE] border border-[#B8F0C8] text-[#00A859] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-sm">
                <svg
                  className="w-4 h-4 text-[#00A859] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
                <span>Early Adopter Access</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-sora text-4xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-extrabold text-[#0B132B] tracking-tight leading-[1.1] mb-5">
                Full access for <br />
                our <span className="text-[#00C26D]">early adopters.</span>
              </h1>

              {/* Subheading / Description */}
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
                Onboarding, registration and all our features are free for now. Enjoy everything Staffroom has to offer as one of our early adopters. We appreciate you!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#00C26D] hover:bg-[#00ab60] text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-md shadow-[#00C26D]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get Started for Free</span>
                  <span aria-hidden="true" className="text-lg leading-none">&rarr;</span>
                </Link>
                <a
                  href="#learn-more"
                  className="inline-flex items-center justify-center bg-white hover:bg-emerald-50/40 border border-[#A7F3D0] text-[#00A859] px-7 py-3.5 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Column: Handwritten Note + Teacher Photo + Floating Quote Card */}
            <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center lg:justify-end min-h-[440px] sm:min-h-[500px] lg:min-h-[560px]">
              
              {/* Handwritten Note - Floating left of teacher */}
              <div className="absolute -top-4 left-0 sm:left-4 lg:-left-10 z-20 font-handwriting text-[#127131] -rotate-6 select-none pointer-events-none">
                <p className="text-xl sm:text-2xl lg:text-[25px] font-bold leading-tight">
                  Supporting<br />
                  teachers today<br />
                  for a brighter<br />
                  tomorrow.
                </p>
                <svg
                  className="w-24 sm:w-28 h-4 text-[#127131] mt-1"
                  viewBox="0 0 120 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                >
                  <path d="M4 14 Q 60 20, 116 6" />
                </svg>
              </div>

              {/* Center Teacher Image */}
              <div className="relative z-10 flex items-end justify-center pt-8">
                <img
                  src={teacherImg}
                  alt="Staffroom educator holding laptop"
                  className="h-[380px] sm:h-[480px] lg:h-[530px] w-auto max-w-full object-contain object-bottom drop-shadow-sm select-none"
                />
              </div>

              {/* Testimonial Quote Card - Floating on the right side */}
              <div className="absolute bottom-6 -right-2 sm:right-0 lg:-right-4 z-20 bg-white/95 backdrop-blur-md border border-gray-100/90 rounded-2xl p-5 sm:p-6 shadow-[0_16px_36px_rgba(0,0,0,0.07)] max-w-[260px] sm:max-w-[290px] xl:max-w-[310px] animate-fade-in-up">
                {/* Large Green Quotation Mark */}
                <div className="text-[#00C26D] mb-2 leading-none select-none" aria-hidden="true">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                  </svg>
                </div>
                {/* Quote Text */}
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed font-normal mb-3">
                  &ldquo;Staffroom is making it easier for me to find the right opportunities and grow in my teaching career.&rdquo;
                </p>
                {/* Author */}
                <p className="text-xs text-gray-400 font-medium">
                  &mdash; Teacher, Lagos
                </p>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Bottom CTA Section */}
      <section id="learn-more" className="bg-[#D6FBC5] min-h-screen flex flex-col items-center justify-center text-center scroll-mt-10">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Ready to Find Your Next Opportunity?
          </h2>
          <p className="text-gray-600 text-sm md:text-base mb-8 max-w-2xl leading-relaxed mx-auto">
            Join a growing network of educators connecting with schools through Staffroom.
          </p>
          <Link to="/signup" className="inline-block bg-primary hover:bg-primary-dark text-white px-10 py-3.5 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/25">
            Sign Up
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
