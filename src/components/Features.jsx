import React from 'react';
import stressedTeacher from '../assets/stressed_teacher.jpeg';
import stressedHeadTeacher from '../assets/stressed_head_teacher.jpeg';

export default function Features() {
  return (
    <section className="bg-gray-50/50 py-14 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-16 text-[#2D2B42] w-full">
          Finding the Right Fit Shouldn't Be<br />This Difficult
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
            <div className="h-48 md:h-64 bg-gray-200 w-full relative">
              <img
                src={stressedTeacher}
                alt="Stressed teacher"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-10">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-[#2D2B42] pr-4">Finding a teaching job shouldn't be a hassle</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-[15px]">
                Skip the steps, long walks, and uncertainty, find jobs and get hired hired faster with staffroom.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
            <div className="h-48 md:h-64 bg-gray-200 w-full relative">
              <img
                src={stressedHeadTeacher}
                alt="Stressed head teacher"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-10">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-[#2D2B42] pr-4">Hiring the right teacher shouldn't be stressful.</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-[15px]">
                Avoid delays, paperwork overload, and unstructured hiring. Staffroom makes it faster and easier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
