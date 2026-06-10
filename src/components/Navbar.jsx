import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="relative">
      <div className="flex items-center justify-between py-6 px-6 md:px-8 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 animate-fade-in no-underline text-gray-900">
          <div className="w-5 h-5 bg-primary rounded-br-lg rounded-tl-lg rounded-tr-sm rounded-bl-sm flex items-center justify-center"></div>
          <span className="font-bold text-xl tracking-tight">Staffroom</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium animate-fade-in-up animation-delay-100">
          <Link 
            to="/pricing" 
            className={`hover:text-primary transition-colors pb-1 border-b-2 ${isActive('/pricing') ? 'text-gray-900 font-bold border-primary' : 'text-gray-700 border-transparent'}`}
          >
            Pricing
          </Link>
          <Link 
            to="/about" 
            className={`hover:text-primary transition-colors pb-1 border-b-2 ${isActive('/about') ? 'text-gray-900 font-bold border-primary' : 'text-gray-700 border-transparent'}`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`hover:text-primary transition-colors pb-1 border-b-2 ${isActive('/contact') ? 'text-gray-900 font-bold border-primary' : 'text-gray-700 border-transparent'}`}
          >
            Contact
          </Link>
          <Link 
            to="/for-schools" 
            className={`hover:text-primary transition-colors pb-1 border-b-2 ${isActive('/for-schools') ? 'text-gray-900 font-bold border-primary' : 'text-gray-700 border-transparent'}`}
          >
            For schools
          </Link>
          <Link 
            to="/for-teachers" 
            className={`hover:text-primary transition-colors pb-1 border-b-2 ${isActive('/for-teachers') ? 'text-gray-900 font-bold border-primary' : 'text-gray-700 border-transparent'}`}
          >
            For teachers
          </Link>
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
          <Link to="/pricing" className={`font-medium py-2 hover:text-primary transition-colors ${isActive('/pricing') ? 'text-primary font-bold' : 'text-gray-700'}`} onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link to="/about" className={`font-medium py-2 hover:text-primary transition-colors ${isActive('/about') ? 'text-primary font-bold' : 'text-gray-700'}`} onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/contact" className={`font-medium py-2 hover:text-primary transition-colors ${isActive('/contact') ? 'text-primary font-bold' : 'text-gray-700'}`} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <Link to="/for-schools" className={`font-medium py-2 hover:text-primary transition-colors ${isActive('/for-schools') ? 'text-primary font-bold' : 'text-gray-700'}`} onClick={() => setMobileMenuOpen(false)}>For schools</Link>
          <Link to="/for-teachers" className={`font-medium py-2 hover:text-primary transition-colors ${isActive('/for-teachers') ? 'text-primary font-bold' : 'text-gray-700'}`} onClick={() => setMobileMenuOpen(false)}>For teachers</Link>
          <Link to="/signup" className="block text-center bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-xl font-semibold transition-colors mt-2 w-full" onClick={() => setMobileMenuOpen(false)}>
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
