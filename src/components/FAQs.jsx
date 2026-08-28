import React, { useState } from 'react';

const teacherFaqs = [
  {
    question: 'Who can use Staffroom as a teacher?',
    answer: 'Staffroom is designed for qualified teachers looking for teaching opportunities with private schools.',
  },
  {
    question: 'Are the jobs on Staffroom verified?',
    answer: 'We review job postings to help ensure opportunities come from legitimate schools. We still encourage teachers to review each opportunity carefully before applying.',
  },
  {
    question: 'Do I have to pay to apply for jobs?',
    answer: 'No. Teachers can create a profile and apply for available teaching opportunities without paying an application fee.',
  },
  {
    question: 'What information can schools see on my profile?',
    answer: 'Schools can view the professional information you make available, including your subjects, teaching levels, experience, education, availability, CV, and TRCN verification status.',
  },
  {
    question: 'How do I apply for a teaching job?',
    answer: 'Find a job that matches your experience and qualifications, review the job details, select Apply, confirm your CV and cover letter, and submit your application.',
  },
  {
    question: 'What happens after I apply?',
    answer: 'The school can review your application and update its status. You will be notified when there is an important update, such as being shortlisted or invited to an interview.',
  },
  {
    question: 'Can I apply for multiple jobs?',
    answer: 'Yes. You can apply for multiple positions that match your qualifications, experience, and career interests.',
  },
  {
    question: 'What does the TRCN Verified badge mean?',
    answer: 'It means the TRCN certificate submitted by the teacher has been reviewed and verified through Staffroom\'s verification process.',
  },
];

const schoolFaqs = [
  {
    question: 'Who can use Staffroom as a school?',
    answer: 'Staffroom is designed for private schools, school owners, principals, HR teams, and authorized school administrators looking to recruit teachers.',
  },
  {
    question: 'Can we search for teachers without posting a job?',
    answer: 'Yes. Schools can browse and search teacher profiles using criteria such as subject, teaching level, qualification, experience, location, and availability.',
  },
  {
    question: 'What information can we see about a teacher?',
    answer: "Depending on the teacher's profile visibility, you can view their professional information, including subjects, teaching levels, education, experience, availability, CV, and TRCN verification status.",
  },
  {
    question: 'How do we know if a teacher is TRCN verified?',
    answer: 'Teachers can submit their TRCN certificate for verification. Once verified, their profile will display a TRCN Verified badge.',
  },
  {
    question: 'How do we post a teaching vacancy?',
    answer: 'Create your school account, open Jobs, select Post a Job, provide the role details and requirements, then publish the vacancy.',
  },
  {
    question: 'How do we review applicants?',
    answer: 'Open one of your active job posts and select View Applicants. You can review each applicant\'s profile, CV, and cover letter before deciding what to do next.',
  },
  {
    question: 'Can we shortlist or reject applicants?',
    answer: 'Yes. Schools can update application statuses, shortlist suitable candidates, reject applications, and move shortlisted candidates to the next stage of recruitment.',
  },
  {
    question: 'Can we use saved messages when shortlisting candidates?',
    answer: 'Yes. Schools can create reusable response templates for common recruitment messages and customize them before sending.',
  },
  {
    question: 'Can we close a job after hiring?',
    answer: 'Yes. You can close a job when you are no longer accepting applications.',
  },
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
                <span className="font-semibold text-gray-900 text-sm md:text-base">{faq.question}</span>
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
              
              <div
                className={`faq-answer-wrapper ${openIndex === idx ? 'faq-answer-wrapper--open' : ''}`}
                aria-hidden={openIndex !== idx}
              >
                <div className="pb-4 md:pb-6 pr-8 md:pr-12 text-gray-600 text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .faq-answer-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 300ms ease-out, opacity 200ms ease-out;
        }

        .faq-answer-wrapper > div {
          min-height: 0;
          overflow: hidden;
        }

        .faq-answer-wrapper--open {
          grid-template-rows: 1fr;
          opacity: 1;
          transition: grid-template-rows 300ms ease-in, opacity 200ms ease-in;
        }
      `}</style>
    </section>
  );
}
