import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { apiErrorMessage } from '../services/api';

const AuthContext = createContext(null);

const getStoredSessionValue = (key) => {
  const sessionValue = sessionStorage.getItem(key);
  if (sessionValue) return sessionValue;

  const legacyValue = localStorage.getItem(key);
  if (legacyValue) {
    sessionStorage.setItem(key, legacyValue);
    localStorage.removeItem(key);
    return legacyValue;
  }

  return null;
};

const safeParseUser = () => {
  try {
    const sessionValue = sessionStorage.getItem('staffroom_user');
    if (sessionValue) return JSON.parse(sessionValue);

    const legacyValue = localStorage.getItem('staffroom_user');
    if (legacyValue) {
      sessionStorage.setItem('staffroom_user', legacyValue);
      localStorage.removeItem('staffroom_user');
      return JSON.parse(legacyValue);
    }

    return null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(safeParseUser());
  const [token, setToken] = useState(getStoredSessionValue('staffroom_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const savedToken = getStoredSessionValue('staffroom_token');
      const savedUser = safeParseUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }

      setLoading(false);
    };

    initialize();
  }, []);

  const persistSession = (userData, newToken) => {
    if (newToken) {
      sessionStorage.setItem('staffroom_token', newToken);
      setToken(newToken);
    }

    if (userData) {
      sessionStorage.setItem('staffroom_user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const clearSession = () => {
    sessionStorage.removeItem('staffroom_token');
    sessionStorage.removeItem('staffroom_user');
    localStorage.removeItem('staffroom_token');
    localStorage.removeItem('staffroom_user');
    localStorage.removeItem('staffroom_verification_email');
    sessionStorage.removeItem('staffroom_verification_email');
    sessionStorage.removeItem('staffroom_teacher_profile');
    sessionStorage.removeItem('staffroom_school_profile');
    sessionStorage.removeItem('staffroom_jobs_cache');
    sessionStorage.removeItem('staffroom_applications_cache');
    setToken('');
    setUser(null);
  };

  const logout = () => {
    clearSession();
    window.location.href = '/signin';
  };

  const register = async (payload) => {
    const method = payload?.role === 'school' ? authService.register_sch : authService.register;
    const response = await method(payload);
    const result = response?.data ?? {};
    const userData = result?.data?.user ?? null;

    if (userData) {
      persistSession(userData, '');
    }

    return result;
  };

  const login = async (payload) => {
    const response = await authService.login(payload);
    const result = response?.data ?? {};
    const userData = result?.data?.user ?? null;
    const newToken = result?.data?.token ?? '';
    const resolvedUser = userData
      ? {
          ...userData,
          setup_completed: result?.data?.setup_completed ?? userData?.setup_completed ?? undefined,
          onboarding_required: result?.data?.onboarding_required ?? userData?.onboarding_required ?? undefined,
        }
      : null;

    // Only persist session when backend provides a token and the account is verified
    const emailVerified = result?.data?.email_verified ?? resolvedUser?.email_verified;
    if (newToken && resolvedUser && (emailVerified === undefined || emailVerified === true)) {
      persistSession(resolvedUser, newToken);
    }

    return result;
  };

  const refreshUser = async () => {
    const savedToken = getStoredSessionValue('staffroom_token');
    if (!savedToken) {
      setUser(null);
      setToken('');
      return null;
    }

    try {
      const response = await authService.getCurrentProfile();
      const payload = response?.data?.data ?? response?.data ?? {};
      const profileUser = payload?.user || payload?.profile || user;

      if (profileUser) {
        persistSession(profileUser, savedToken);
      }

      return profileUser;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
      setToken,
      apiErrorMessage,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
