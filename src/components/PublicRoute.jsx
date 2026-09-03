import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

const hasCompletedTeacherSetup = (profile = {}) => {
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

  const hasLevels = Array.isArray(profile?.teaching_levels) && profile.teaching_levels.length > 0;

  return Boolean(
    String(profile?.skills || profile?.subjects || '').trim() ||
    String(profile?.location || profile?.preferred_location || '').trim() ||
    String(profile?.bio || '').trim() ||
    hasLevels ||
    String(profile?.experience_years || '').trim()
  );
};

export default function PublicRoute({ children }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [profileCheck, setProfileCheck] = useState({ loading: false, complete: true });

  useEffect(() => {
    if (!token || !user || (user?.role || user?.user_role) !== 'teacher') {
      setProfileCheck({ loading: false, complete: true });
      return undefined;
    }

    let active = true;
    setProfileCheck({ loading: true, complete: false });
    profileService.getMe()
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? {};
        const profile = payload?.profile || payload?.teacher_profile || payload || {};
        if (active) setProfileCheck({ loading: false, complete: hasCompletedTeacherSetup(profile) });
      })
      .catch(() => {
        if (active) setProfileCheck({ loading: false, complete: false });
      });

    return () => {
      active = false;
    };
  }, [token, user]);

  if (loading || profileCheck.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading...</div>;
  }

  if (token && user) {
    const role = user?.role || user?.user_role;
    const dashboardMap = {
      teacher: profileCheck.complete ? '/teacher-dashboard' : '/teacher-info',
      school: '/school-dashboard',
      admin: '/admin-dashboard',
    };

    const redirectTo = dashboardMap[role] || '/';
    const from = location.state?.from || redirectTo;

    return <Navigate to={from} replace state={{ from: location.pathname }} />;
  }

  return children;
}
