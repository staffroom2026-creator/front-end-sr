import React from 'react';
import { Link } from 'react-router-dom';

export default function FooterCTA() {
  return (
    <section className="bg-[#effef2] py-32 md:py-40 mt-16 md:mt-24 min-h-screen flex flex-col justify-center">
      <div className="max-w-3xl mx-auto px-6 md:px-8 flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-4 md:mb-6 text-gray-900 leading-tight">
          Start Building The Future<br />With Staffroom
        </h2>
        
        <p className="text-gray-700 text-base md:text-lg mb-8 md:mb-10 max-w-2xl leading-relaxed">
          Whether you're a young graduate seeking your first job, a seasoned educator, or a parent searching for a place, Staffroom is the home for building a great portfolio.
        </p>
        
        <Link to="/signup" className="inline-block text-center bg-primary hover:bg-primary-dark text-white px-10 py-3.5 rounded-full font-bold text-base md:text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 w-full md:w-auto">
          Sign Up
        </Link>
      </div>
    </section>
  );
}
