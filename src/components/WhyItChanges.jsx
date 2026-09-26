import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import teacherImg from '../assets/smiley.webp';
import schoolImg from '../assets/happy_head_teacher.webp';

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0 mt-0.5"
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="10" fill="#1CCB43" />
    <path
      d="M5.5 10.5L8.5 13.5L14.5 7.5"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const tabContent = {
  teachers: {
    heading: 'Building your teaching career\nwith confidence',
    subheading:
      'Discover opportunities, apply easily and manage your applications all in one place.',
    bullets: [
      'Find teaching opportunities that match your profile',
      'Apply to jobs without repeating the same information',
      'Track your applications from one place',
      'Build a professional profile that schools can discover',
    ],
    cta: { label: 'Explore Teaching Jobs', href: '/for-teachers' },
    img: teacherImg,
    imgAlt: 'Happy teacher smiling at laptop',
  },
  schools: {
    heading: 'Find the right teachers\nfor your school',
    subheading:
      'Spend less time on scattered applications and manual hiring. Find the educators your school needs.',
    bullets: [
      'Access a pool of verified, qualified teachers',
      'Post vacancies and receive structured applications',
      'Review teacher profiles and track candidates',
      'Streamline your entire hiring process in one place',
    ],
    cta: { label: 'Find Teachers', href: '/for-schools' },
    img: schoolImg,
    imgAlt: 'Happy school administrator at desk',
  },
};

export default function WhyItChanges() {
  const [activeTab, setActiveTab] = useState('teachers');
  const content = tabContent[activeTab];

  return (
    <section className="py-10 md:py-20" style={{ background: '#F7FFF4' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center text-center mb-8 md:mb-12">
        <h2 className="text-[22px] md:text-3xl font-bold text-gray-900 mb-3">
          Everything you need to move forward
        </h2>
        <p className="text-gray-500 text-sm md:text-base max-w-xl">
          Spend less time on scattered applications and manual hiring. Find the educators your school needs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 md:mb-10">
        <div className="flex bg-white shadow-sm border border-gray-200 rounded-full p-1 relative w-64 h-[48px]">
          <button
            id="why-tab-teachers"
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 rounded-full text-sm font-semibold transition-colors z-10 ${
              activeTab === 'teachers' ? 'text-white' : 'text-[#1a1a1a]'
            }`}
          >
            Teachers
          </button>
          <button
            id="why-tab-schools"
            onClick={() => setActiveTab('schools')}
            className={`flex-1 rounded-full text-sm font-semibold transition-colors z-10 ${
              activeTab === 'schools' ? 'text-white' : 'text-[#1a1a1a]'
            }`}
          >
            Schools
          </button>
          {/* Sliding pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1CCB43] rounded-full transition-all duration-300 ${
              activeTab === 'teachers' ? 'left-1' : 'left-[calc(50%+2px)]'
            }`}
          />
        </div>
      </div>

      {/* Card */}
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left: Text */}
            <div className="flex-1 p-7 md:p-12 flex flex-col justify-center order-2 md:order-1">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-snug whitespace-pre-line">
                {content.heading}
              </h3>
              <p className="text-gray-500 text-sm md:text-[15px] mb-6">
                {content.subheading}
              </p>

              <ul className="space-y-3 mb-8">
                {content.bullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-gray-700 text-sm md:text-[15px]">{item}</span>
                  </li>
                ))}
              </ul>

              <div>
                <a
                  href={content.cta.href}
                  className="inline-block border border-[#1CCB43] text-gray-900 font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#1CCB43] hover:text-white transition-colors duration-200"
                >
                  {content.cta.label}
                </a>
              </div>
            </div>

            {/* Right: Image */}
            <div className="md:w-[44%] h-60 md:h-auto relative overflow-hidden order-1 md:order-2 bg-gray-100">
              <img
                src={content.img}
                alt={content.imgAlt}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              activeTab === 'teachers' ? 'bg-gray-800' : 'bg-gray-300'
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              activeTab === 'schools' ? 'bg-gray-800' : 'bg-gray-300'
            }`}
          />
        </div>
      </div>
    </section>
  );
}

