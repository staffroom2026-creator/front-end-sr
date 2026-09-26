import React from 'react';
import stressedTeacher from '../assets/stressed_teacher.webp';
import stressedHeadTeacher from '../assets/stressed_head_teacher.webp';

export default function Features() {
  return (
    <section className="py-14 md:py-24" style={{ background: '#f0faf2' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-16 text-[#1a1a2e] w-full">
          Finding the Right Fit Shouldn't Be This Difficult
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl">
          {/* Card 1 – For Teachers */}
          <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 duration-300 flex flex-col">
            <div className="h-52 md:h-64 bg-gray-200 w-full relative">
              <img
                src={stressedTeacher}
                alt="Stressed teacher outside a school"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col flex-1">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 3L22 8.5L12 14L2 8.5L12 3Z" fill="#1CCB43" />
                  <path d="M6 11.5V17C6 17 8.5 20 12 20C15.5 20 18 17 18 17V11.5" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-bold tracking-widest text-[#1CCB43] uppercase">For Teachers</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-[#1a1a2e] leading-snug">
                Finding the right teaching job shouldn't be a hassle.
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-[15px] flex-1">
                Skip scattered job searches and uncertainty. Find relevant teaching opportunities in one place.
              </p>
              <div className="mt-6">
                <a
                  href="/for-teachers"
                  className="inline-block border border-[#1CCB43] text-[#1a1a2e] font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#1CCB43] hover:text-white transition-colors duration-200"
                >
                  Find Teaching Jobs
                </a>
              </div>
            </div>
          </div>

          {/* Card 2 – For Schools */}
          <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 duration-300 flex flex-col">
            <div className="h-52 md:h-64 bg-gray-200 w-full relative">
              <img
                src={stressedHeadTeacher}
                alt="Stressed school administrator at a desk"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col flex-1">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3" y="10" width="18" height="11" rx="1.5" stroke="#1CCB43" strokeWidth="1.8" />
                  <path d="M9 21V15H15V21" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 10L12 3L21 10" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-bold tracking-widest text-[#1CCB43] uppercase">For Schools</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-[#1a1a2e] leading-snug">
                Hiring the right teacher shouldn't be stressful.
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-[15px] flex-1">
                Spend less time on scattered applications and manual hiring. Find the educators your school needs.
              </p>
              <div className="mt-6">
                <a
                  href="/for-schools"
                  className="inline-block border border-[#1CCB43] text-[#1a1a2e] font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#1CCB43] hover:text-white transition-colors duration-200"
                >
                  Find Teachers
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
