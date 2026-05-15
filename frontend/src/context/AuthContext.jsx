import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('users/profile/');
          setUser(res.data);
        } catch (err) {
          console.error("Auth check failed", err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('users/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    const profileRes = await api.get('users/profile/');
    setUser(profileRes.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const register = async (userData) => {
    const res = await api.post('users/register/', userData);
    return res.data;
  };

  const googleLogin = async (credential) => {
    const res = await api.post('users/google/', { credential });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    const profileRes = await api.get('users/profile/');
    setUser(profileRes.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, googleLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
