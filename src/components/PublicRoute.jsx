import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext.js';
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
  const [profileCheck, setProfileCheck] = useState(null);
  const role = String(user?.role || user?.user_role || user?.account_type || '').trim().toLowerCase();
  const userSetupFlag =
    user?.setup_completed ??
    user?.setupComplete ??
    user?.profile_complete ??
    user?.is_profile_complete ??
    user?.setupCompleted;
  const needsProfileCheck = Boolean(token && user && ['school', 'school_admin'].includes(role) && userSetupFlag === undefined);
  const profileCheckKey = `${token}:${role}:${user?.user_id || user?.id || user?.email || ''}`;
  const profileCheckPending = needsProfileCheck && (
    profileCheck?.key !== profileCheckKey || profileCheck?.user !== user
  );

  useEffect(() => {
    if (!profileCheckPending) return undefined;

    let active = true;
    profileService.getMe()
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? {};
        const profile = payload?.profile || payload?.teacher_profile || payload?.school_profile || payload?.school || payload || {};
        const account = payload?.user || {};
        const complete = hasCompletedSchoolSetup(profile, account);

        if (active) setProfileCheck({ key: profileCheckKey, user, complete });
      })
      .catch(() => {
        if (active) setProfileCheck({ key: profileCheckKey, user, complete: false });
      });

    return () => {
      active = false;
    };
  }, [profileCheckKey, profileCheckPending, user]);

  if (loading || profileCheckPending) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading...</div>;
  }

  if (token && user) {
    const authPages = ['/signup', '/verify-email', '/forgot-password', '/check-email', '/reset-password'];
    if (authPages.includes(location.pathname)) {
      return children;
    }

    const hasKnownSetupState = userSetupFlag !== undefined;
    const isSetupComplete = hasKnownSetupState && (userSetupFlag === true || userSetupFlag === 'true' || userSetupFlag === 1 || userSetupFlag === '1');

    if (role === 'school' || role === 'school_admin') {
      if (hasKnownSetupState && !isSetupComplete) {
        if (location.pathname !== '/sch-info') {
          return <Navigate to="/sch-info" replace state={{ from: location.pathname }} />;
        }
        return children;
      }

      if (hasKnownSetupState && isSetupComplete && location.pathname === '/sch-info') {
        return <Navigate to="/school-dashboard" replace state={{ from: location.pathname }} />;
      }

      if (!hasKnownSetupState && profileCheck?.key === profileCheckKey && profileCheck?.user === user && !profileCheck.complete) {
        if (location.pathname !== '/sch-info') {
          return <Navigate to="/sch-info" replace state={{ from: location.pathname }} />;
        }
        return children;
      }
    }

    if (role && ['teacher', 'school', 'admin', 'police'].includes(role)) {
      const dashboardMap = {
        teacher: '/teacher-dashboard',
        school: '/school-dashboard',
        school_admin: '/school-dashboard',
        admin: '/admin-dashboard',
        police: '/internal-admin-dashboard',
      };

      const redirectTo = dashboardMap[role] || '/';
      const from = location.state?.from && location.state.from !== '/sch-info' && location.state.from !== '/teacher-info'
        ? location.state.from
        : redirectTo;

      if (location.pathname !== from && !(['school', 'school_admin'].includes(role) && !hasKnownSetupState && location.pathname === '/sch-info')) {
        return <Navigate to={from} replace state={{ from: location.pathname }} />;
      }
    }
  }

  return children;
}
