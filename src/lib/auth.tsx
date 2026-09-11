import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from './api';
import type { User } from './types';

type OtpChallenge = {
  requiresOtp: true;
  challengeId: string;
  otpSentTo: string;
  /** Only present when EMAIL_PROVIDER=console or Resend fallback */
  devCode?: string;
  notice?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<OtpChallenge>;
  verifyOtp: (
    challengeId: string,
    code: string,
  ) => Promise<{ user: User; adminBootstrap?: unknown }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    // Always hit /auth/me. The session cookie is httpOnly on the API host
    // (often another origin: Vercel → Render), so document.cookie cannot see it.
    // hasSessionFlag() is only a same-origin hint and must not gate restore.
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<OtpChallenge>('/auth/login', {
      email,
      password,
    });
    return data;
  }, []);

  const verifyOtp = useCallback(async (challengeId: string, code: string) => {
    const { data } = await api.post<{
      user: User;
      adminBootstrap?: unknown;
    }>('/auth/login/otp', { challengeId, code });
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      verifyOtp,
      logout,
      refreshMe,
      isAdmin: user?.role === 'ADMIN',
    }),
    [user, loading, login, verifyOtp, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
