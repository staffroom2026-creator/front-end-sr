import React from 'react';
import logo from '../assets/logo.webp';

export default function BrandLogo({ className = '' }) {
  return <img src={logo} alt="Staffroom" loading="eager" decoding="async" className={`brand-logo-image ${className}`.trim()} />;
}
