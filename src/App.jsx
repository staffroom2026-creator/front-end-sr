import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import WhyItChanges from './components/WhyItChanges';
import HowItWorks from './components/HowItWorks';
import FAQs from './components/FAQs';
import FooterCTA from './components/FooterCTA';
import ScrollReveal from './components/ScrollReveal';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import UserType from './pages/UserType';
import TeacherInfo from './pages/TeacherInfo';
import SchoolInfo from './pages/SchoolInfo';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

function LandingPage() {
  return (
    <div className="font-sans text-gray-900 bg-[#FAF9F6] min-h-screen">
      <Navbar />
      <Hero />
      <ScrollReveal><Features /></ScrollReveal>
      <ScrollReveal><WhyItChanges /></ScrollReveal>
      <ScrollReveal><HowItWorks /></ScrollReveal>
      <ScrollReveal><FAQs /></ScrollReveal>
      <ScrollReveal><FooterCTA /></ScrollReveal>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/user-type" element={<UserType />} />
        <Route path="/teacher-info" element={<TeacherInfo />} />
        <Route path="/sch-info" element={<SchoolInfo />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
