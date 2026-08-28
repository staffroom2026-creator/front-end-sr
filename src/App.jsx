import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import WhyItChanges from './components/WhyItChanges';
import HowItWorks from './components/HowItWorks';
import FAQs from './components/FAQs';
import FooterCTA from './components/FooterCTA';
import SiteFooter from './components/SiteFooter';
import ScrollReveal from './components/ScrollReveal';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import AddPhoneNumber from './pages/AddPhoneNumber';
import VerifyPhone from './pages/VerifyPhone';
import TeacherInfo from './pages/TeacherInfo';
import SchoolInfo from './pages/SchoolInfo';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationSubmitted from './pages/ApplicationSubmitted';
import PageExplorer from './pages/PageExplorer';
import About from './pages/About';
import ForSchools from './pages/ForSchools';
import ForTeachers from './pages/ForTeachers';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Waitlist from './pages/Waitlist';
import JoinWaitlist from './pages/JoinWaitlist';
import Terms from './pages/Terms';

function LandingPage() {
  return (
    <div className="brand-typography font-sans text-gray-900 bg-[#FAF9F6] min-h-screen">
      <Navbar sticky />
      <Hero />
      <ScrollReveal><Features /></ScrollReveal>
      <ScrollReveal><WhyItChanges /></ScrollReveal>
      <ScrollReveal><HowItWorks /></ScrollReveal>
      <ScrollReveal><FAQs /></ScrollReveal>
      <ScrollReveal><FooterCTA /></ScrollReveal>
      <SiteFooter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
        <Route path="/add-phone-number" element={<PublicRoute><AddPhoneNumber /></PublicRoute>} />
        <Route path="/verify-phone" element={<PublicRoute><VerifyPhone /></PublicRoute>} />
        <Route path="/teacher-info" element={<PublicRoute><TeacherInfo /></PublicRoute>} />
        <Route path="/sch-info" element={<PublicRoute><SchoolInfo /></PublicRoute>} />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/application-submitted" element={<ApplicationSubmitted />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'school']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school-dashboard"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/for-schools" element={<ForSchools />} />
        <Route path="/for-teachers" element={<ForTeachers />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/join-waitlist" element={<JoinWaitlist />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/sitemap" element={<PageExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
