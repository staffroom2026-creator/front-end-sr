import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { api, apiErrorMessage } from '../services/api';

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

const decodeJwtPayload = (token) => {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return {};
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')));
  } catch {
    return {};
  }
};

const findRole = (value, depth = 0) => {
  if (!value || depth > 5 || typeof value !== 'object') return '';

  const directRole = value.role ?? value.user_role ?? value.account_type ?? value.role_name ?? value.accountRole ?? value.userRole ?? value.roleType;
  if (typeof directRole === 'string' && directRole.trim()) return directRole.trim().toLowerCase();

  if (Array.isArray(value)) {
    for (const item of value) {
      const nestedRole = findRole(item, depth + 1);
      if (nestedRole) return nestedRole;
    }
    return '';
  }

  for (const nestedValue of Object.values(value)) {
    const nestedRole = findRole(nestedValue, depth + 1);
    if (nestedRole) return nestedRole;
  }

  return '';
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
    return response?.data ?? {};
  };

  const login = async (payload) => {
    const response = await authService.login(payload);
    const result = response?.data ?? {};
    const responseData = result?.data ?? {};
    const newToken = responseData?.token ?? responseData?.access_token ?? result?.token ?? result?.access_token ?? '';
    const tokenPayload = decodeJwtPayload(newToken);
    const nestedUser = responseData?.user || responseData?.account || result?.user || result?.account;
    const directResponseUser = nestedUser || Object.fromEntries(
      Object.entries(responseData || {}).filter(([key]) => !['token', 'access_token', 'email_verified', 'setup_completed', 'onboarding_required'].includes(key)),
    );
    const userData = directResponseUser && Object.keys(directResponseUser).length ? directResponseUser : {};
    let resolvedRole = findRole(userData) || findRole(responseData) || findRole(result) || findRole(tokenPayload);
    let resolvedAccount = userData;

    if (newToken && (!resolvedRole || !nestedUser || !resolvedAccount?.user_id || !resolvedAccount?.full_name)) {
      try {
        const profileResponse = await api.get('/api/profiles/me', {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        const profilePayload = profileResponse?.data?.data ?? profileResponse?.data ?? {};
        const profileAccount = profilePayload?.user || profilePayload?.account || profilePayload?.profile || profilePayload;
        resolvedRole = findRole(userData) || findRole(profileAccount) || findRole(profilePayload) || resolvedRole;
        resolvedAccount = profileAccount && typeof profileAccount === 'object'
          ? { ...resolvedAccount, ...profileAccount }
          : resolvedAccount;
      } catch {
        // Keep the original login response so the caller can show its auth error.
      }
    }

    const normalizedRole = String(resolvedRole ?? tokenPayload?.role ?? userData?.role ?? userData?.user_role ?? userData?.account_type ?? '').trim().toLowerCase();
    const resolvedUser = resolvedAccount
      ? {
          ...resolvedAccount,
          user_id: resolvedAccount?.user_id ?? tokenPayload?.user_id ?? tokenPayload?.sub,
          email: resolvedAccount?.email ?? tokenPayload?.email ?? payload?.email,
          role: normalizedRole,
          setup_completed: responseData?.setup_completed ?? resolvedAccount?.setup_completed ?? undefined,
          onboarding_required: responseData?.onboarding_required ?? resolvedAccount?.onboarding_required ?? undefined,
        }
      : null;

    // Only persist session when backend provides a token and the account is verified
    const emailVerified = result?.data?.email_verified ?? resolvedUser?.email_verified;
    if (newToken && resolvedUser && (emailVerified === undefined || emailVerified === true)) {
      persistSession(resolvedUser, newToken);
    }

    return {
      ...result,
      data: {
        ...responseData,
        user: resolvedUser,
        token: newToken,
      },
    };
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
      const profileUser = payload?.user || payload?.account || payload?.profile;
      const mergedUser = profileUser && typeof profileUser === 'object'
        ? { ...(user || {}), ...profileUser, role: findRole(profileUser) || findRole(user) || user?.role }
        : user;

      if (mergedUser) {
        persistSession(mergedUser, savedToken);
      }

      return mergedUser;
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
