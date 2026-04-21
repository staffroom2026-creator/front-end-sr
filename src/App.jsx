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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
