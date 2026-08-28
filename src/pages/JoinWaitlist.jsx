import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/school campus.jpg';
import BrandLogo from '../components/BrandLogo';

export default function JoinWaitlist() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    userType: '',
    schoolName: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="font-sans text-gray-900 bg-[#FAF9F6]">
      {/* Navbar */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="School classroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-emerald-600/75 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between py-6">
            <Link to="/" className="flex items-center gap-2 text-white">
              <BrandLogo />
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link to="/for-schools" className="hover:text-white transition-colors">For schools</Link>
              <Link to="/for-teachers" className="hover:text-white transition-colors">For teachers</Link>
            </div>

            <Link
              to="/signup"
              className="hidden md:inline-block bg-white text-emerald-700 font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-black/10 transition hover:bg-emerald-50"
            >
              Sign Up
            </Link>
          </div>

          {/* Hero Content */}
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center py-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white max-w-3xl leading-tight mb-6">
              Join the waitlist
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-white/85 leading-relaxed mb-10">
              We're building the future of education recruitment. Join the waitlist and be part of the journey from day one.
            </p>
            <button
              className="inline-flex items-center justify-center gap-2 bg-[#1CCB43] hover:bg-[#17a538] text-white font-bold px-8 py-3 rounded-full shadow-xl shadow-[#1CCB43]/30 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Get early access
            </button>
          </div>
        </div>
      </div>

      {/* Reserve Your Spot Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1CCB43] mb-4">
          Reserve Your Spot
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600 text-sm md:text-base leading-relaxed">
          Join teachers and school leaders who are ready for a simpler, faster, and more reliable way to connect.
        </p>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12">How it works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Join the Waitlist',
              description: 'Fill the form with the correct details to be among the first to know when Staffroom launches.',
            },
            {
              title: 'Get Notified',
              description: 'We\'ll notify you when the platform becomes available and invite you to explore its features.',
            },
            {
              title: 'Start Connecting',
              description: 'Discover opportunities or find qualified educators through a platform built specifically for education.',
            },
          ].map((item, index) => (
            <div key={index} className="text-left">
              <h4 className="text-lg font-semibold text-[#1CCB43] mb-3">{item.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-[#E8F9EB] rounded-3xl max-w-3xl mx-auto px-6 md:px-12 py-16 my-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CCB43] bg-white"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Phone number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+234"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CCB43] bg-white"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CCB43] bg-white"
                required
              />
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">I am a</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CCB43] bg-white appearance-none cursor-pointer"
                required
              >
                <option value="">Select</option>
                <option value="teacher">Teacher</option>
                <option value="school">School Administrator</option>
              </select>
            </div>
          </div>

          {(formData.userType === 'teacher' || formData.userType === 'school') && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">School Name</label>
              <input
                type="text"
                name="schoolName"
                placeholder="Enter your school name"
                value={formData.schoolName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CCB43] bg-white"
                required
              />
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#1CCB43] hover:bg-[#17a538] text-white font-bold px-8 py-3 rounded-full shadow-xl shadow-[#1CCB43]/30 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Get early access
            </button>
          </div>
        </form>
      </section>

      {/* Footer Spacing */}
      <div className="h-16 bg-[#D6FBC5]"></div>
    </div>
  );
}
