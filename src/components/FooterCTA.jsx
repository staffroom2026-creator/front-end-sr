import React from 'react';
import { Link } from 'react-router-dom';

export default function FooterCTA() {
  return (
    <section className="bg-light-green/20 border-t border-emerald-500/5 min-h-screen flex flex-col items-center justify-center mt-0">
      <div className="max-w-4xl mx-auto px-6 md:px-8 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 md:mb-6 text-gray-900 leading-tight">
          Ready to Find Your<br />Next Opportunity?
        </h2>

        <p className="text-gray-600 text-sm md:text-base mb-8 max-w-2xl leading-relaxed">
          Join a growing network of educators connecting with schools through Staffroom.
        </p>

        <Link to="/signup" className="inline-block text-center bg-primary hover:bg-primary-dark text-white px-10 py-3.5 rounded-xl font-bold text-base transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/25">
          Sign Up
        </Link>
      </div>
    </section>
  );
}
