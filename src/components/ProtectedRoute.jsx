import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

const hasCompletedTeacherProfile = (profile = {}) => {
  const setupFlag =
    profile?.setup_completed ??
    profile?.setupComplete ??
    profile?.profile_complete ??
    profile?.is_profile_complete ??
    profile?.setupCompleted;

  if (setupFlag === true || setupFlag === 'true' || setupFlag === 1) {
    return true;
  }

  if (setupFlag === false || setupFlag === 'false' || setupFlag === 0) {
    return false;
  }

  const skillText = String(profile?.skills || profile?.subjects || '').trim();
  const locationText = String(profile?.location || profile?.preferred_location || '').trim();
  const levels = Array.isArray(profile?.teaching_levels)
    ? profile.teaching_levels
    : typeof profile?.teaching_levels === 'string'
      ? profile.teaching_levels.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

  return Boolean(
    skillText ||
    locationText ||
    levels.length ||
    String(profile?.bio || '').trim() ||
    String(profile?.experience_years || '').trim()
  );
};

export default function ProtectedRoute({ children, allowedRoles = [], requireTeacherProfile = false }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [profileCheck, setProfileCheck] = useState({ loading: requireTeacherProfile, complete: true });

  useEffect(() => {
    if (!requireTeacherProfile || user?.role !== 'teacher' || !token) {
      setProfileCheck({ loading: false, complete: true });
      return undefined;
    }

    let active = true;
    profileService.getMe()
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? {};
        const profile = payload?.profile || payload?.teacher_profile || payload || {};
        if (active) setProfileCheck({ loading: false, complete: hasCompletedTeacherProfile(profile) });
      })
      .catch(() => {
        if (active) setProfileCheck({ loading: false, complete: true });
      });

    return () => {
      active = false;
    };
  }, [requireTeacherProfile, token, user?.role]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  const role = user?.role || user?.user_role;

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (profileCheck.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading profile...</div>;
  }

  if (requireTeacherProfile && role === 'teacher' && !profileCheck.complete) {
    return <Navigate to="/teacher-info" replace state={{ from: location.pathname }} />;
  }

  return children;
}
