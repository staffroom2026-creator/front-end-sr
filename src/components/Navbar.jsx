import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="relative">
      <div className="flex items-center justify-between py-6 px-6 md:px-8 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 animate-fade-in">
          <div className="w-5 h-5 bg-primary rounded-br-lg rounded-tl-lg rounded-tr-sm rounded-bl-sm flex items-center justify-center"></div>
          <span className="font-bold text-xl tracking-tight">Staffroom</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700 animate-fade-in-up animation-delay-100">
          <a href="#" className="hover:text-primary transition-colors">Pricing</a>
          <Link to="/about" className="hover:text-primary transition-colors font-bold text-gray-900 border-b-2 border-transparent hover:border-primary pb-1">About</Link>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
          <Link to="/sch-info" className="hover:text-primary transition-colors">For schools</Link>
          <Link to="/teacher-info" className="hover:text-primary transition-colors relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary">For teachers</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 animate-fade-in-up animation-delay-200">
          <Link to="/signup" className="bg-primary hover:bg-primary-dark text-white px-7 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 text-sm">
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50 px-6 py-6 flex flex-col gap-4">
          <a href="#" className="text-gray-700 font-medium py-2 hover:text-primary transition-colors">Pricing</a>
          <Link to="/about" className="text-gray-900 font-bold py-2 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <a href="#" className="text-gray-700 font-medium py-2 hover:text-primary transition-colors">Contact</a>
          <Link to="/sch-info" className="text-gray-700 font-medium py-2 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>For schools</Link>
          <Link to="/teacher-info" className="text-gray-700 font-medium py-2 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>For teachers</Link>
          <Link to="/signup" className="block text-center bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-xl font-semibold transition-colors mt-2 w-full" onClick={() => setMobileMenuOpen(false)}>
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
