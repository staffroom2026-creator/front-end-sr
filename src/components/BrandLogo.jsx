import React from 'react';
import logo from '../assets/logo.png';

export default function BrandLogo({ className = '' }) {
  return <img src={logo} alt="Staffroom" className={`brand-logo-image ${className}`.trim()} />;
}
