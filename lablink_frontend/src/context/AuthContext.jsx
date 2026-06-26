import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loginUser, logoutUser, getProfile, verifyMfaLogin } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized           = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = localStorage.getItem('access_token');
    if (token) {
      getProfile()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.clear();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const applyAuthResponse = async (data) => {
    const tokens = data.tokens || {
      access:  data.access,
      refresh: data.refresh,
    };

    const userData = data.user || null;

    if (!tokens.access) {
      throw new Error('No access token received');
    }

    localStorage.setItem('access_token',  tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);

    let finalUser = userData;
    if (!finalUser) {
      const profileRes = await getProfile();
      finalUser = profileRes.data;
    }

    setUser(finalUser);
    toast.success(`Welcome back, ${finalUser.first_name}!`);
    return finalUser;
  };

  const login = async (credentials) => {
    const res = await loginUser(credentials);

    if (res.data.mfa_required) {
      return { mfaRequired: true, email: res.data.email };
    }

    return applyAuthResponse(res.data);
  };

  const completeMfaLogin = async (email, code) => {
    const res = await verifyMfaLogin({ email, code });
    return applyAuthResponse(res.data);
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await logoutUser(refresh);
    } catch {
      // fail silently
    } finally {
      localStorage.clear();
      setUser(null);
      toast.success('Logged out successfully.');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await getProfile();
      setUser(res.data);
      return res.data;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, setUser, loading, login, completeMfaLogin, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);