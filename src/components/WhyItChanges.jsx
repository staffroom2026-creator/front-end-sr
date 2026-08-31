import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import teacherImg from '../assets/smiley.webp';
import schoolImg from '../assets/happy_head_teacher.webp';

export default function WhyItChanges() {
  const [activeTab, setActiveTab] = useState('teachers');

  return (
    <section className="py-10 md:py-24">
      {/* Header & Toggle Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center">
        <h2 className="text-[22px] md:text-3xl font-bold mb-6 md:mb-10 text-gray-900 text-center">
          Why this changes everything
        </h2>

        {/* Tabs */}
        <div className="flex bg-white shadow-sm border border-gray-200 rounded-full p-1 mb-6 md:mb-16 relative w-72 md:w-72 h-[48px]">
           <button 
             onClick={() => setActiveTab('teachers')}
             className={`flex-1 rounded-full text-sm font-semibold transition-colors z-10 ${activeTab === 'teachers' ? 'text-white' : 'text-[#1a1a1a]'}`}
           >
             Teachers
           </button>
           <button 
             onClick={() => setActiveTab('schools')}
             className={`flex-1 rounded-full text-sm font-semibold transition-colors z-10 ${activeTab === 'schools' ? 'text-white' : 'text-[#1a1a1a]'}`}
           >
             Schools
           </button>
           {/* Tab highlight pill */}
           <div 
             className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1CCB43] rounded-full transition-all duration-300 ${activeTab === 'teachers' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
           />
        </div>
      </div>

      {/* Content Wrapper - Full width green on mobile, transparent on desktop */}
      <div className="w-full bg-[#187532] md:bg-transparent pt-8 pb-10 md:py-0">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          
          {/* Card Container */}
          <div className="w-full max-w-5xl mx-auto rounded-none md:rounded-3xl md:overflow-hidden flex flex-col md:flex-row h-auto md:h-[400px] md:shadow-lg">
            
            {/* Image Area - On mobile it's above text, on desktop it's right (so we use flex-col on mobile and md:flex-row, meaning text goes below image on mobile. Wait, in Flex column, first child is top. Let's put Image first for mobile, but use flex row for desktop). */}
            {/* Actually, it's easier to put Text first, but use flex-col-reverse on mobile! */}
            
            {/* Left Area (Text) */}
            <div className="flex-1 md:bg-dark-green md:p-16 flex flex-col justify-center text-white mt-6 md:mt-0 order-2 md:order-1">
              <h3 className="text-[#1CCB43] md:text-white text-[17px] md:text-2xl font-bold mb-4 md:mb-8 font-sora">
                {activeTab === 'teachers' ? (
                  <>
                    <span className="md:hidden">Teacher & Job Seekers</span>
                    <span className="hidden md:inline">Teachers & Job Seekers</span>
                  </>
                ) : (
                  'Schools & Institutions'
                )}
              </h3>
              
              {activeTab === 'teachers' ? (
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span className="text-[15px] md:text-lg">
                      <span className="md:hidden">Access verified opportunities.</span>
                      <span className="hidden md:inline">Access to the best opportunities</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span className="text-[15px] md:text-lg">
                      <span className="md:hidden">Earn extra income through side teaching.</span>
                      <span className="hidden md:inline">Earn more than you thought was possible</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span className="text-[15px] md:text-lg">
                      <span className="md:hidden">Build skills with training and resources.</span>
                      <span className="hidden md:inline">Up level with training and more. Now.</span>
                    </span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span className="text-[15px] md:text-lg">Reach top-tier teaching talent quickly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span className="text-[15px] md:text-lg">Streamline your hiring process</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span className="text-[15px] md:text-lg">Save time and resources effectively</span>
                  </li>
                </ul>
              )}
            </div>
            
            {/* Right Area (Image) */}
            <div className="md:flex-1 relative h-[280px] md:h-auto w-full overflow-hidden rounded-[20px] md:rounded-none order-1 md:order-2 shadow-sm md:shadow-none shrink-0 border border-transparent bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  src={activeTab === 'teachers' ? teacherImg : schoolImg} 
                  alt={activeTab === 'teachers' ? "Happy Teacher" : "Happy Head Teacher"} 
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
          </div>
          
          {/* Mobile Carousel Indicators */}
          <div className="flex md:hidden justify-center gap-2 mt-8">
            <div className={`w-2 h-2 rounded-full ${activeTab === 'teachers' ? 'bg-[#1CCB43]' : 'bg-white/60'}`}></div>
            <div className={`w-2 h-2 rounded-full ${activeTab === 'schools' ? 'bg-[#1CCB43]' : 'bg-white/60'}`}></div>
          </div>
          
        </div>
      </div>
      
      {/* Desktop Carousel Indicators */}
      <div className="hidden md:flex justify-center gap-2 mt-8">
        <div className={`w-2 h-2 rounded-full ${activeTab === 'teachers' ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
        <div className={`w-2 h-2 rounded-full ${activeTab === 'schools' ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
      </div>
    </section>
  );
}
