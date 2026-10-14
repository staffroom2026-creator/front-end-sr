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

const hasCompletedSchoolProfile = (profile = {}, account = {}) => {
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

export default function ProtectedRoute({ children, allowedRoles = [], requireSchoolProfile = false }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [profileCheck, setProfileCheck] = useState(null);
  const role = String(user?.role || user?.user_role || user?.account_type || '').trim().toLowerCase();
  const needsProfileCheck = Boolean(token && requireSchoolProfile && role === 'school');
  const userSetupFlag =
    user?.setup_completed ??
    user?.setupComplete ??
    user?.profile_complete ??
    user?.is_profile_complete ??
    user?.setupCompleted;
  const profileCheckKey = `${token}:${role}:${user?.user_id || user?.id || user?.email || ''}`;
  const profileCheckPending = needsProfileCheck && userSetupFlag === undefined && (
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
        const complete = hasCompletedSchoolProfile(profile, account);

        if (active) setProfileCheck({ key: profileCheckKey, user, complete });
      })
      .catch(() => {
        if (active) setProfileCheck({ key: profileCheckKey, user, complete: true });
      });

    return () => {
      active = false;
    };
  }, [profileCheckKey, profileCheckPending, user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  const onboardingRequired = user?.onboarding_required === true || user?.onboarding_required === 'true' || user?.onboarding_required === 1 || user?.onboarding_required === '1';
  if (onboardingRequired && requireSchoolProfile && role === 'school' && location.pathname !== '/sch-info') {
    return <Navigate to="/sch-info" replace state={{ from: location.pathname }} />;
  }

  if (profileCheckPending) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-gray-700">Loading profile...</div>;
  }

  const hasKnownSetupState = userSetupFlag !== undefined;
  const knownIsComplete = hasKnownSetupState && (userSetupFlag === true || userSetupFlag === 'true' || userSetupFlag === 1 || userSetupFlag === '1');

  if (requireSchoolProfile && role === 'school' && hasKnownSetupState && !knownIsComplete) {
    return <Navigate to="/sch-info" replace state={{ from: location.pathname }} />;
  }

  if (requireSchoolProfile && role === 'school' && profileCheck?.key === profileCheckKey && profileCheck?.user === user && !profileCheck.complete && !hasKnownSetupState) {
    return <Navigate to="/sch-info" replace state={{ from: location.pathname }} />;
  }

  return children;
}
