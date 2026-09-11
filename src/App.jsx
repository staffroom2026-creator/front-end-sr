import React, { Suspense, lazy } from 'react';
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
import AdminSignIn from './pages/AdminSignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import CheckEmail from './pages/CheckEmail';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AddPhoneNumber from './pages/AddPhoneNumber';
import VerifyPhone from './pages/VerifyPhone';
import TeacherInfo from './pages/TeacherInfo';
import SchoolInfo from './pages/SchoolInfo';
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const InternalAdminDashboard = lazy(() => import('./pages/InternalAdminDashboard'));
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

function DashboardLoader({ label = 'Dashboard' }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f6f8f7',
      display: 'grid',
      placeItems: 'center',
      padding: '32px 20px',
      fontFamily: '"DM Sans", sans-serif',
      color: '#172238',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1180px',
        background: '#ffffff',
        border: '1px solid #e7eceb',
        borderRadius: '22px',
        padding: '20px 22px',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '18px' }}>
          <div style={{
            width: '120px',
            height: '14px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #eef1ef 25%, #f9fafb 50%, #eef1ef 75%)',
            backgroundSize: '200% 100%',
            animation: 'dashboardSkeletonPulse 1.4s ease infinite',
          }} />
          <div style={{
            width: '120px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, #eef1ef 25%, #f9fafb 50%, #eef1ef 75%)',
            backgroundSize: '200% 100%',
            animation: 'dashboardSkeletonPulse 1.4s ease infinite',
          }} />
        </div>

        <div style={{
          width: '44%',
          height: '34px',
          borderRadius: '10px',
          background: 'linear-gradient(90deg, #eef1ef 25%, #f9fafb 50%, #eef1ef 75%)',
          backgroundSize: '200% 100%',
          animation: 'dashboardSkeletonPulse 1.4s ease infinite',
          marginBottom: '18px',
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map((item) => (
            <div key={item} style={{
              height: '150px',
              borderRadius: '18px',
              background: 'linear-gradient(90deg, #eef1ef 25%, #f9fafb 50%, #eef1ef 75%)',
              backgroundSize: '200% 100%',
              animation: 'dashboardSkeletonPulse 1.4s ease infinite',
            }} />
          ))}
        </div>

        <style>{`
          @keyframes dashboardSkeletonPulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
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
        <Route path="/admin-signin" element={<PublicRoute><AdminSignIn /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/check-email" element={<PublicRoute><CheckEmail /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
        <Route path="/add-phone-number" element={<PublicRoute><AddPhoneNumber /></PublicRoute>} />
        <Route path="/verify-phone" element={<PublicRoute><VerifyPhone /></PublicRoute>} />
        <Route path="/teacher-info" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherInfo /></ProtectedRoute>} />
        <Route path="/sch-info" element={<PublicRoute><SchoolInfo /></PublicRoute>} />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Suspense fallback={<DashboardLoader label="Teacher dashboard" />}>
                <TeacherDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="/application-submitted" element={<ApplicationSubmitted />} />
        <Route
          path="/internal-admin-dashboard"
          element={
            <Suspense fallback={<DashboardLoader label="Admin dashboard" />}>
              <InternalAdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={<DashboardLoader label="Admin dashboard" />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school-dashboard"
          element={
            <ProtectedRoute allowedRoles={['school']} requireSchoolProfile>
              <Suspense fallback={<DashboardLoader label="School dashboard" />}>
                <AdminDashboard />
              </Suspense>
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
