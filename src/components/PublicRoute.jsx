import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

const getSetupFlag = (profile = {}) => {
  const setupFlag =
    profile?.setup_completed ??
    profile?.setupComplete ??
    profile?.profile_complete ??
    profile?.is_profile_complete ??
    profile?.setupCompleted;

  if (setupFlag === true || setupFlag === 'true' || setupFlag === 1 || setupFlag === '1') {
    return true;
  }

  if (setupFlag === false || setupFlag === 'false' || setupFlag === 0 || setupFlag === '0') {
    return false;
  }

  return undefined;
};

const hasCompletedTeacherSetup = (profile = {}) => {
  const setupFlag = getSetupFlag(profile);
  if (setupFlag !== undefined) {
    return setupFlag;
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

const hasCompletedSchoolSetup = (profile = {}, account = {}) => {
  const setupFlag = getSetupFlag(profile);
  if (setupFlag !== undefined) {
    return setupFlag;
  }

  return Boolean(
    profile?.school_name ||
    account?.full_name ||
    profile?.school_type ||
    profile?.address ||
    profile?.city ||
    profile?.state ||
    profile?.country ||
    profile?.email ||
    account?.email ||
    profile?.phone ||
    account?.phone
  );
};

export default function PublicRoute({ children }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [profileCheck, setProfileCheck] = useState({ loading: false, complete: true });

  useEffect(() => {
    const role = user?.role || user?.user_role;
    if (!token || !user || !role || !['teacher', 'school'].includes(role)) {
      setProfileCheck({ loading: false, complete: true });
      return undefined;
    }

    const userSetupFlag =
      user?.setup_completed ??
      user?.setupComplete ??
      user?.profile_complete ??
      user?.is_profile_complete ??
      user?.setupCompleted;

    if (userSetupFlag !== undefined) {
      const isComplete = userSetupFlag === true || userSetupFlag === 'true' || userSetupFlag === 1 || userSetupFlag === '1';
      setProfileCheck({ loading: false, complete: isComplete });
      return undefined;
    }

    let active = true;
    setProfileCheck({ loading: true, complete: false });
    profileService.getMe()
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? {};
        const profile = payload?.profile || payload?.teacher_profile || payload?.school_profile || payload?.school || payload || {};
        const account = payload?.user || {};
        const complete = role === 'teacher'
          ? hasCompletedTeacherSetup(profile)
          : hasCompletedSchoolSetup(profile, account);

        if (active) setProfileCheck({ loading: false, complete });
      })
      .catch(() => {
        if (active) setProfileCheck({ loading: false, complete: false });
      });

    return () => {
      active = false;
    };
  }, [token, user, user?.setup_completed, user?.setupComplete, user?.profile_complete, user?.is_profile_complete, user?.setupCompleted]);

  if (loading || profileCheck.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading...</div>;
  }

  if (token && user) {
    const authPages = ['/signin', '/signup', '/verify-email', '/forgot-password', '/check-email', '/reset-password'];
    if (authPages.includes(location.pathname)) {
      return children;
    }

    const role = user?.role || user?.user_role;
    const userSetupFlag =
      user?.setup_completed ??
      user?.setupComplete ??
      user?.profile_complete ??
      user?.is_profile_complete ??
      user?.setupCompleted;
    const hasKnownSetupState = userSetupFlag !== undefined;
    const isSetupComplete = hasKnownSetupState && (userSetupFlag === true || userSetupFlag === 'true' || userSetupFlag === 1 || userSetupFlag === '1');

    if (role === 'teacher') {
      if (hasKnownSetupState && !isSetupComplete && location.pathname !== '/teacher-info') {
        return <Navigate to="/teacher-info" replace state={{ from: location.pathname }} />;
      }

      if (hasKnownSetupState && isSetupComplete && location.pathname === '/teacher-info') {
        return <Navigate to="/teacher-dashboard" replace state={{ from: location.pathname }} />;
      }

      if (!hasKnownSetupState && !profileCheck.complete && location.pathname !== '/teacher-info') {
        return <Navigate to="/teacher-info" replace state={{ from: location.pathname }} />;
      }
    }

    if (role === 'school') {
      if (hasKnownSetupState && !isSetupComplete) {
        if (location.pathname !== '/sch-info') {
          return <Navigate to="/sch-info" replace state={{ from: location.pathname }} />;
        }
        return children;
      }

      if (hasKnownSetupState && isSetupComplete && location.pathname === '/sch-info') {
        return <Navigate to="/school-dashboard" replace state={{ from: location.pathname }} />;
      }

      if (!hasKnownSetupState && !profileCheck.complete) {
        if (location.pathname !== '/sch-info') {
          return <Navigate to="/sch-info" replace state={{ from: location.pathname }} />;
        }
        return children;
      }
    }

    if (role && ['teacher', 'school', 'admin'].includes(role)) {
      const dashboardMap = {
        teacher: '/teacher-dashboard',
        school: '/school-dashboard',
        admin: '/admin-dashboard',
      };

      const redirectTo = dashboardMap[role] || '/';
      const from = location.state?.from && location.state.from !== '/sch-info' && location.state.from !== '/teacher-info'
        ? location.state.from
        : redirectTo;

      if (location.pathname !== from && !(role === 'school' && !hasKnownSetupState && location.pathname === '/sch-info')) {
        return <Navigate to={from} replace state={{ from: location.pathname }} />;
      }
    }
  }

  return children;
}
