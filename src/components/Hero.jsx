import React from 'react';
import { Link } from 'react-router-dom';

// Import the images
import img5 from '../assets/Rectangle 5.png';
import img6 from '../assets/Rectangle 6.png';
import img7 from '../assets/Rectangle 7.png';
import img8 from '../assets/Rectangle 8.png';
import img9 from '../assets/Rectangle 9.png';
import img10 from '../assets/Rectangle 10.png';

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-24 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden min-h-[85vh] md:min-h-0">
      
      {/* Mobile Background Image Grid - visible only on mobile */}
      <div className="md:hidden absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top-left cluster */}
        <div className="absolute top-6 left-4 w-28 h-24 bg-gray-300 rounded-2xl rotate-[-6deg] opacity-30 overflow-hidden">
          <img src={img5} alt="Grid item" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-4 left-36 w-24 h-20 bg-gray-300 rounded-2xl rotate-[4deg] opacity-25 overflow-hidden">
          <img src={img6} alt="Grid item" className="w-full h-full object-cover" />
        </div>
        
        {/* Top-right cluster */}
        <div className="absolute top-10 right-4 w-28 h-28 bg-gray-300 rounded-2xl rotate-[6deg] opacity-30 overflow-hidden">
          <img src={img7} alt="Grid item" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-2 right-28 w-20 h-20 bg-gray-300 rounded-2xl rotate-[-3deg] opacity-20 overflow-hidden">
          <img src={img8} alt="Grid item" className="w-full h-full object-cover" />
        </div>

        {/* Middle-left */}
        <div className="absolute top-[38%] -left-4 w-32 h-28 bg-gray-300 rounded-2xl rotate-[-4deg] opacity-25 overflow-hidden">
          <img src={img9} alt="Grid item" className="w-full h-full object-cover" />
        </div>

        {/* Middle-right cluster */}
        <div className="absolute top-[30%] right-2 w-36 h-32 bg-gray-300 rounded-2xl rotate-[5deg] opacity-30 overflow-hidden">
          <img src={img10} alt="Grid item" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-[48%] right-8 w-28 h-24 bg-gray-300 rounded-2xl rotate-[-2deg] opacity-25 overflow-hidden">
          <img src={img5} alt="Grid item" className="w-full h-full object-cover" />
        </div>

        {/* Bottom-left */}
        <div className="absolute bottom-[22%] left-2 w-28 h-28 bg-gray-300 rounded-2xl rotate-[3deg] opacity-25 overflow-hidden">
          <img src={img6} alt="Grid item" className="w-full h-full object-cover" />
        </div>
        
        {/* Bottom-right */}
        <div className="absolute bottom-[16%] right-4 w-32 h-28 bg-gray-300 rounded-2xl rotate-[-5deg] opacity-30 overflow-hidden">
          <img src={img7} alt="Grid item" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-[30%] right-28 w-24 h-20 bg-gray-300 rounded-2xl rotate-[2deg] opacity-20 overflow-hidden">
          <img src={img8} alt="Grid item" className="w-full h-full object-cover" />
        </div>

        {/* Fade overlay to make images more subtle */}
        <div className="absolute inset-0 bg-[#FAF9F6]/40"></div> 
      </div>

      {/* Left Content */}
      <div className="flex-1 max-w-xl w-full relative z-10 flex flex-col justify-end md:justify-center min-h-[60vh] md:min-h-0 pt-20 md:pt-0 md:-translate-y-10">
        <h1 className="text-[2.75rem] md:text-6xl font-extrabold leading-[1.15] tracking-tight mb-4 md:mb-6 text-gray-900 animate-fade-in-up">
          <span className="text-primary">Connecting</span><br />
          Teachers,<br className="md:hidden" /><span className="hidden md:inline"> </span>Schools,<br />
          and<br className="md:hidden" /><span className="hidden md:inline"> </span>Opportunities.
        </h1>
        <p className="text-gray-600 text-sm md:text-lg mb-6 md:mb-8 max-w-md leading-relaxed animate-fade-in-up animation-delay-100">
          Staffroom is the trusted platform where young teachers find verified jobs, and schools hire the right talent with ease.
        </p>
        <Link to="/signup" className="inline-block text-center bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-bold text-base md:text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/30 w-full md:w-auto animate-fade-in-up animation-delay-200">
          Sign Up
        </Link>
      </div>

      {/* Desktop Image Grid - hidden on mobile */}
      <div className="hidden md:flex flex-1 gap-4 w-full justify-end relative animate-fade-in-up animation-delay-300">
        <div className="flex flex-col gap-4 mt-12">
          <div className="w-48 h-40 bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <img src={img5} alt="Grid item 5" className="w-full h-full object-cover" />
          </div>
          <div className="w-48 h-56 bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <img src={img6} alt="Grid item 6" className="w-full h-full object-cover" />
          </div>
          <div className="w-48 h-40 bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <img src={img7} alt="Grid item 7" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex flex-col gap-4 -mt-4">
           <div className="w-48 h-56 bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <img src={img8} alt="Grid item 8" className="w-full h-full object-cover" />
          </div>
          <div className="w-48 h-64 bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <img src={img9} alt="Grid item 9" className="w-full h-full object-cover" />
          </div>
          <div className="w-48 h-40 bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <img src={img10} alt="Grid item 10" className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      </div>
    </section>
  );
}
