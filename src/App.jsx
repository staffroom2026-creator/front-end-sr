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
import ScrollToTop from './components/ScrollToTop';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import AddPhoneNumber from './pages/AddPhoneNumber';
import VerifyPhone from './pages/VerifyPhone';
import UserType from './pages/UserType';
import TeacherInfo from './pages/TeacherInfo';
import SchoolInfo from './pages/SchoolInfo';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PageExplorer from './pages/PageExplorer';
import About from './pages/About';
import ForSchools from './pages/ForSchools';
import ForTeachers from './pages/ForTeachers';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Waitlist from './pages/Waitlist';
import JoinWaitlist from './pages/JoinWaitlist';

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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/add-phone-number" element={<AddPhoneNumber />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/user-type" element={<UserType />} />
        <Route path="/teacher-info" element={<TeacherInfo />} />
        <Route path="/sch-info" element={<SchoolInfo />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/application-submitted" element={<TeacherDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/for-schools" element={<ForSchools />} />
        <Route path="/for-teachers" element={<ForTeachers />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/join-waitlist" element={<JoinWaitlist />} />
        <Route path="/sitemap" element={<PageExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
