import React, { useState, useRef, useEffect } from 'react';

const tabs = [
  {
    key: 'teachers',
    label: 'FOR TEACHERS',
    heading: 'Build your teaching career',
    steps: [
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
        title: '1. Create your profile',
        desc: 'Showcase your experience, subjects, skills and preferences',
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        ),
        title: '2. Discover relevant opportunities',
        desc: 'Find verified schools and teaching roles that match your profile',
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        ),
        title: '3. Apply and move forward',
        desc: 'Apply, manage interviews and track your progress in one place.',
      },
    ],
  },
  {
    key: 'schools',
    label: 'FOR SCHOOLS',
    heading: 'Find the right educators',
    steps: [
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        ),
        title: '1. Set up your school profile',
        desc: 'Present your school, culture and the educators you need.',
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        title: '2. Find the right teachers',
        desc: 'Post vacancies or discover verified educators on your area.',
      },
      {
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1CCB43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
        title: '3. Interview and hire',
        desc: 'Shortlist candidates, manage interviews and complete your hiring process.',
      },
    ],
  },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('teachers');
  const [scrollProgress, setScrollProgress] = useState(0);
  // wrapperRef is the tall outer div that provides the scroll budget
  const wrapperRef = useRef(null);
  const tab = tabs.find((t) => t.key === activeTab);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      // scrolled = how many px of the wrapper have passed the top of the viewport
      const scrolled = -rect.top;
      // total scrollable distance = wrapper height - viewport height
      const total = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      setScrollProgress(progress);
      setActiveTab(progress >= 0.5 ? 'schools' : 'teachers');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Per-tab line progress: resets 0 to 1 for each half
  const halfProgress = scrollProgress < 0.5
    ? scrollProgress * 2
    : (scrollProgress - 0.5) * 2;

  return (
    // Outer wrapper — 200vh gives a full viewport of scroll budget beyond the panel itself
    <div ref={wrapperRef} style={{ height: '200vh' }}>
      {/* Sticky inner panel — stays pinned until the wrapper scrolls past */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: '#f0faf2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-8 w-full">

          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              How Staffroom Works
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              From finding the right opportunity to making the right hire, staffroom keeps the process simple for everyone
            </p>
          </div>

          {/* Tab toggle — hidden, scroll drives the active tab */}
          <div className="hidden">
            <div className="flex bg-white border border-gray-200 rounded-full p-1 shadow-sm relative w-64 h-[46px]">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  id={`hiw-tab-${t.key}`}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 rounded-full text-sm font-semibold transition-colors z-10 ${
                    activeTab === t.key ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {t.key === 'teachers' ? 'Teachers' : 'Schools'}
                </button>
              ))}
              {/* Sliding pill */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1CCB43] rounded-full transition-all duration-300 ${
                  activeTab === 'teachers' ? 'left-1' : 'left-[calc(50%+2px)]'
                }`}
              />
            </div>
          </div>

          {/* Content: two-column split */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center">

            {/* Left: Label + Heading */}
            <div className="md:w-[38%] md:pr-12">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                {tab.label}
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                {tab.heading}
              </h3>
            </div>

            {/* Center divider — scroll-driven progress line (desktop only) */}
            <div
              className="hidden md:flex flex-col items-center mx-6"
              style={{ alignSelf: 'stretch', minHeight: '260px' }}
            >
              <div
                className="relative flex-1 w-[2px] overflow-hidden rounded-full"
                style={{ background: '#e5e7eb' }}
              >
                <div
                  className="absolute top-0 left-0 w-full rounded-full"
                  style={{
                    height: `${halfProgress * 100}%`,
                    background: '#1a1a2e',
                    transition: 'height 0.05s linear',
                  }}
                />
              </div>
            </div>

            {/* Right: Step cards */}
            <div className="flex-1 flex flex-col gap-4 md:pl-8">
              {tab.steps.map((step, i) => (
                <div
                  key={`${activeTab}-${i}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2"
                  style={{
                    animation: 'fadeInUp 0.35s ease both',
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  {/* Icon in green tinted circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                    style={{ background: '#e8f9eb' }}
                  >
                    {step.icon}
                  </div>
                  <p className="font-bold text-gray-900 text-sm md:text-[15px]">{step.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Card entrance animation */}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
