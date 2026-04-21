import React, { useState } from 'react';

const teacherFaqs = [
  "What happens after I apply for a job?",
  "How do schools contact me?",
  "How can I improve my chances of getting hired?",
  "Can I update my profile after signing up?",
  "What if I don't get selected?"
];

const schoolFaqs = [
  "How do I post a new job opportunity?",
  "What is the process for reviewing teacher applications?",
  "Can I filter candidates by specific qualifications?",
  "How do I contact a candidate for an interview?",
  "Is there a limit to how many jobs we can post?"
];

export default function FAQs() {
  const [activeTab, setActiveTab] = useState('teachers');
  const [openIndex, setOpenIndex] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setOpenIndex(null);
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const currentFaqs = activeTab === 'teachers' ? teacherFaqs : schoolFaqs;

  return (
    <section className="py-14 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-8 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">FAQs</h2>
        <p className="text-gray-600 mb-8 md:mb-10 text-sm md:text-base">Everything You Need To Know</p>

        {/* Tabs */}
        <div className="flex bg-white shadow-sm border border-gray-100 rounded-full p-1 mb-8 md:mb-12 relative w-64 md:w-72 h-[44px] md:h-[48px]">
           <button 
             onClick={() => handleTabChange('teachers')}
             className={`flex-1 rounded-full text-sm font-semibold transition-colors z-10 ${activeTab === 'teachers' ? 'text-white' : 'text-gray-600'}`}
           >
             Teachers
           </button>
           <button 
             onClick={() => handleTabChange('schools')}
             className={`flex-1 rounded-full text-sm font-semibold transition-colors z-10 ${activeTab === 'schools' ? 'text-white' : 'text-gray-600'}`}
           >
             Schools
           </button>
           {/* Tab highlight pill */}
           <div 
             className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-300 ${activeTab === 'teachers' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
           />
        </div>

        {/* Accordion */}
        <div className="w-full bg-white rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-4 md:p-8">
          {currentFaqs.map((faq, idx) => (
            <div key={idx} className="border-b border-gray-100 last:border-0">
              <button 
                onClick={() => toggleAccordion(idx)}
                className="w-full py-4 md:py-6 flex items-center justify-between text-left hover:text-primary transition-colors focus:outline-none"
              >
                <span className="font-semibold text-gray-900 text-sm md:text-base">{faq}</span>
                <span className="ml-4 md:ml-6 flex-shrink-0">
                  {openIndex === idx ? (
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              </button>
              
              {openIndex === idx && (
                <div className="pb-4 md:pb-6 pr-8 md:pr-12 text-gray-600 text-sm md:text-base leading-relaxed">
                  Placeholder text for the answer to "{faq}". This provides helpful context for the person inquiring about the platform.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
