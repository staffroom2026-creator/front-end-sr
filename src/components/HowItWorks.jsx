import React from 'react';

export default function HowItWorks() {
  return (
    <section className="bg-gray-50/50 py-14 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-8 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-gray-900">How it works</h2>

        <div className="bg-white rounded-2xl md:rounded-3xl w-full p-6 md:p-12 shadow-sm border border-gray-100 relative">
          
          {/* Header Row - Desktop */}
          <div className="hidden md:flex justify-between font-bold text-lg mb-12 relative z-10 w-full pl-20 pr-10">
            <div className="flex-1 text-gray-900">For Teachers</div>
            <div className="flex-1 text-gray-900">For Schools</div>
          </div>

          {/* Mobile: For Teachers heading */}
          <h3 className="md:hidden text-lg font-bold text-gray-900 mb-6">For Teachers</h3>

          <div className="relative">
            {/* Center Timeline Line - Desktop only */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2"></div>
            
            {/* Mobile Timeline Line */}
            <div className="md:hidden absolute left-[15px] top-0 bottom-0 w-px bg-gray-200"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row mb-10 md:mb-16 relative">
              <div className="flex-1 md:text-left pr-4 md:pr-16 pl-12 md:pl-0">
                <p className="text-gray-600 text-sm md:text-base">
                  <span className="font-semibold text-gray-900 mr-1 block md:inline">Create your profile.</span>
                  Showcase your skills, experience, and passions.
                </p>
              </div>
              
              {/* Icon */}
              <div className="absolute left-[4px] md:left-1/2 md:-translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 w-[22px] h-[22px] md:w-10 md:h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Desktop: School column */}
              <div className="hidden md:block flex-1 md:text-left pl-16">
                <p className="text-gray-600 text-sm md:text-base">
                  <span className="font-semibold text-gray-900 mr-1 block md:inline">Create your school profile.</span>
                  Highlight your teaching needs.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row mb-10 md:mb-16 relative">
              <div className="flex-1 md:text-left pr-4 md:pr-16 pl-12 md:pl-0">
                <p className="text-gray-600 text-sm md:text-base">
                  <span className="font-semibold text-gray-900 mr-1 block md:inline">Explore.</span>
                  Search the Staffroom platform for the right fit for you.
                </p>
              </div>
              
              {/* Icon */}
              <div className="absolute left-[4px] md:left-1/2 md:-translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 w-[22px] h-[22px] md:w-10 md:h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Desktop: School column */}
              <div className="hidden md:block flex-1 md:text-left pl-16">
                <p className="text-gray-600 text-sm md:text-base">
                  <span className="font-semibold text-gray-900 mr-1 block md:inline">List opportunities.</span>
                  Get seen by top teaching talent in your area.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row mb-10 md:mb-0 relative">
              <div className="flex-1 md:text-left pr-4 md:pr-16 pl-12 md:pl-0">
                <p className="text-gray-600 text-sm md:text-base">
                  <span className="font-semibold text-gray-900 mr-1 block md:inline">Apply seamlessly.</span>
                  Get connected with schools directly on our platform.
                </p>
              </div>
              
              {/* Icon */}
              <div className="absolute left-[4px] md:left-1/2 md:-translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 w-[22px] h-[22px] md:w-10 md:h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Desktop: School column */}
              <div className="hidden md:block flex-1 md:text-left pl-16">
                <p className="text-gray-600 text-sm md:text-base">
                  <span className="font-semibold text-gray-900 mr-1 block md:inline">Connect with teachers.</span>
                  Hire your next top performer seamlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile: For Schools section */}
          <div className="md:hidden mt-10">
            <h3 className="text-lg font-bold text-gray-900 mb-6">For Schools</h3>
            
            <div className="relative">
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-200"></div>
              
              <div className="mb-10 relative pl-12">
                <div className="absolute left-[4px] top-0 w-[22px] h-[22px] bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10">
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold text-gray-900 block">Create your school profile.</span>
                  Highlight your teaching needs.
                </p>
              </div>

              <div className="mb-10 relative pl-12">
                <div className="absolute left-[4px] top-0 w-[22px] h-[22px] bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10">
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold text-gray-900 block">List opportunities.</span>
                  Get seen by top teaching talent in your area.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-[4px] top-0 w-[22px] h-[22px] bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10">
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold text-gray-900 block">Connect with teachers.</span>
                  Hire your next top performer seamlessly.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
