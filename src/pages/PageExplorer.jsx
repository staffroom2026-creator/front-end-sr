import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const pages = [
  // ── Public / Marketing Pages ──────────────────────────────────
  { name: 'Landing Page',    path: '/',            description: 'The main landing page with hero, features, how it works, and FAQs.', icon: '🏠' },
  { name: 'About',           path: '/about',       description: 'Story behind Staffroom — mission, vision, and what the platform provides.', icon: '💡' },
  { name: 'For Schools',     path: '/for-schools', description: 'Marketing page for school administrators: hire qualified teachers without the stress.', icon: '🏫' },
  { name: 'For Teachers',    path: '/for-teachers',description: 'Marketing page for educators: more opportunities, less stress.', icon: '🎓' },
  { name: 'Pricing',         path: '/pricing',     description: 'Pricing plans page — currently showing a coming-soon waitlist state.', icon: '💳' },
  { name: 'Contact',         path: '/contact',     description: 'Contact page with inquiry form, email, phone, location, and social links.', icon: '✉️' },
  { name: 'Waitlist',        path: '/waitlist',    description: 'Waitlist page for users waiting for product updates and early access.', icon: '⏳' },
  { name: 'Join Waitlist',   path: '/join-waitlist', description: 'Sign-up form for joining the Staffroom waitlist.', icon: '🧾' },
  { name: 'Application Submitted', path: '/application-submitted', description: 'Confirmation page shown after a job application is submitted.', icon: '✅' },
  { name: 'Site Map',        path: '/sitemap',     description: 'Interactive sitemap page for navigating the app structure.', icon: '🗺️' },

  // ── Auth Flow ─────────────────────────────────────────────────
  { name: 'Sign In',         path: '/signin',           description: 'User login page with email/password authentication.', icon: '🔑' },
  { name: 'Sign Up',         path: '/signup',           description: 'New user registration page.', icon: '📝' },
  { name: 'Verify Email',    path: '/verify-email',     description: 'Email verification screen sent after sign-up.', icon: '📧' },
  { name: 'Add Phone',       path: '/add-phone-number', description: 'Step to add phone number for multi-factor authentication.', icon: '📱' },
  { name: 'Verify Phone',    path: '/verify-phone',     description: 'Phone number OTP verification screen.', icon: '✅' },

  // ── Onboarding Flow ───────────────────────────────────────────
  { name: 'Teacher Info',    path: '/teacher-info',     description: 'Onboarding form to capture teacher profile details.', icon: '🧑‍🏫' },
  { name: 'School Info',     path: '/sch-info',         description: 'Onboarding form to capture school profile details.', icon: '🏛️' },

  // ── Dashboards ────────────────────────────────────────────────
  { name: 'Teacher Dashboard', path: '/teacher-dashboard', description: 'Main interface for teachers — jobs, profile, and applications.', icon: '📊' },
  { name: 'Admin Dashboard',   path: '/admin-dashboard',   description: 'Management interface for school administrators.', icon: '⚙️' },
];

const PageExplorer = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const cardRefs = useRef([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = pages.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHover = (index) => {
    setHoveredIndex(index);
    if (cardRefs.current[index]) {
      cardRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30 overflow-x-hidden">
      {/* Animated Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Premium Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 group cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="text-lg font-black text-white">S</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-md font-bold tracking-tight leading-none">Staffroom</span>
              <span className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase">Visual Explorer</span>
            </div>
          </div>

          {/* Search Bar - Hidden on very small screens, or full width on md */}
          <div className="flex-grow max-w-lg">
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:border-primary/50 transition-all">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Find a page..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full placeholder:text-gray-500"
              />
            </div>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold transition-all shrink-0"
          >
            <span className="hidden sm:inline">Exit</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="pt-32 md:pt-40 pb-24 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero Section */}
          <div className="relative mb-16 md:mb-24 text-center px-4">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase animate-fade-in">
              System Architecture Visualizer
            </div>
            <h1 className="text-4xl md:text-7xl font-black mb-6 md:mb-8 tracking-tighter animate-fade-in-up leading-tight">
              App <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 italic">Landscape</span>
            </h1>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100">
              Interactive overview of the Staffroom ecosystem. {window.innerWidth < 768 ? 'Tap' : 'Hover'} to focus, click to explore.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            {filteredPages.map((page, index) => (
              <div
                key={page.path}
                ref={(el) => (cardRefs.current[index] = el)}
                onMouseEnter={() => handleHover(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative min-h-[500px] lg:h-[420px] perspective-1000 transition-all duration-700
                  ${hoveredIndex === index ? 'z-30 scale-[1.01] md:scale-[1.02]' : 'z-10'}
                `}
              >
                {/* Responsive Card Content */}
                <div className={`relative h-full w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col lg:flex-row
                  ${hoveredIndex === index 
                    ? 'shadow-[0_40px_80px_-15px_rgba(28,203,67,0.3)] bg-white/10 border-primary/20' 
                    : 'bg-white/5 border border-white/5 shadow-2xl'
                  }
                  ${hoveredIndex === index && window.innerWidth >= 1024 ? 'rotate-x-1 rotate-y-1' : ''}
                `}>
                  {/* Top/Left: Iframe Preview */}
                  <div className="relative w-full lg:w-2/3 h-64 lg:h-full bg-[#0a0a0a] overflow-hidden lg:border-r border-b lg:border-b-0 border-white/5">
                    <div className={`w-full h-full transition-transform duration-[2s] ease-out
                      ${hoveredIndex === index ? 'scale-110 translate-y-[-2%]' : 'scale-100'}
                    `}>
                      <iframe
                        src={page.path}
                        title={page.name}
                        className="w-[1280px] h-[800px] origin-top-left scale-[0.25] sm:scale-[0.3] md:scale-[0.35] lg:scale-[0.38] xl:scale-[0.42] pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-1000"
                        style={{ border: 'none' }}
                      />
                    </div>
                    {/* Floating Badge (Mobile Only Top Right) */}
                    <div className="absolute top-4 left-4 flex gap-1.5 z-20">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40" />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                    </div>
                  </div>

                  {/* Bottom/Right: Content Info */}
                  <div className="w-full lg:w-1/3 h-auto lg:h-full flex flex-col p-6 md:p-8 bg-gradient-to-br from-white/[0.02] to-transparent relative z-20">
                    <div className="flex items-start justify-between mb-4 lg:mb-6">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-xl md:text-2xl transition-all duration-500
                        ${hoveredIndex === index ? 'scale-110 bg-primary/20 border-primary/30 -translate-y-1' : ''}
                      `}>
                        {page.icon}
                      </div>
                      <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] md:text-[9px] font-mono text-gray-500 tracking-wider">
                        {page.path}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 tracking-tight group-hover:text-primary transition-colors duration-500">
                        {page.name}
                      </h3>
                      <p className={`text-xs md:text-sm text-gray-400 leading-relaxed transition-all duration-700
                        ${hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-60 lg:translate-y-2'}
                      `}>
                        {page.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className={`mt-6 lg:mt-auto transition-all duration-700 transform
                      ${hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 lg:opacity-0'}
                      ${window.innerWidth < 1024 ? 'opacity-100 translate-y-0' : ''}
                    `}>
                      <button
                        onClick={() => navigate(page.path)}
                        className="group/btn relative w-full py-3.5 md:py-4 bg-primary hover:bg-white text-black font-black rounded-xl md:rounded-2xl 
                          overflow-hidden transition-all duration-500 shadow-lg shadow-primary/10 active:scale-95 flex items-center justify-center gap-2 text-xs md:text-sm"
                      >
                        Launch
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Glow Effect (Desktop Only) */}
                  {hoveredIndex === index && window.innerWidth >= 1024 && (
                    <div className="absolute inset-[-100px] bg-primary/5 blur-[80px] rounded-full -z-10 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredPages.length === 0 && (
            <div className="py-24 md:py-40 text-center">
              <div className="text-4xl md:text-6xl mb-6 text-gray-700">🔍</div>
              <h2 className="text-xl md:text-3xl font-bold mb-2">No pages found</h2>
              <p className="text-sm md:text-base text-gray-500">Try searching for another route.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 md:py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white font-bold text-[10px]">S</div>
            <span className="text-xs font-bold tracking-tight">Staffroom Visual &copy; 2026</span>
          </div>
          <div className="flex gap-6 text-[9px] font-bold text-gray-500 tracking-widest uppercase">
            <span>Docs</span>
            <span>Security</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>

      <style>{`
        :root {
          --color-primary: #1CCB43;
          --color-primary-dark: #16a336;
        }
        .text-primary { color: var(--color-primary); }
        .bg-primary { background-color: var(--color-primary); }
        .border-primary\\/30 { border-color: rgba(28, 203, 67, 0.3); }
        
        .perspective-1000 { perspective: 1000px; }
        .rotate-x-1 { transform: rotateX(2deg); }
        .rotate-y-1 { transform: rotateY(-2deg); }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-fade-in-up { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animation-delay-100 { animation-delay: 100ms; }
      `}</style>
    </div>
  );
};

export default PageExplorer;
