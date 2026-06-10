import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getProfile } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    const { tokens, user } = res.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setUser(user);
    toast.success(`Welcome back, ${user.first_name}!`);
    return user;
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);