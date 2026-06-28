import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Check for logged-in user on page load
  useEffect(() => {
    // We still use localStorage JUST to keep the user logged in after a refresh
    const storedUser = localStorage.getItem('smartSocUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. REAL LOGIN FUNCTION
  const login = async (email, password) => {
    try {
      // Talk to the backend!
      const response = await axios.post('https://smart-society-rr5e.onrender.com/api/users/login', { email, password });
      
      const loggedInUser = response.data.user;
      
      // Save to state and local storage
      setUser(loggedInUser);
      localStorage.setItem('smartSocUser', JSON.stringify(loggedInUser));
      
      // Route based on role
      if (loggedInUser.role === 'admin') navigate('/admin');
      else if (loggedInUser.role === 'resident') navigate('/resident');
      else if (loggedInUser.role === 'guard') navigate('/security');
      
      return { success: true };
    } catch (error) {
      // Catch the error sent from our backend (e.g., "Invalid email or password")
      return { success: false, error: error.response?.data?.error || "Login failed to connect" };
    }
  };

  // 3. REAL REGISTER FUNCTION
  const register = async (userData) => {
    try {
      // Talk to the backend!
      const response = await axios.post('https://smart-society-rr5e.onrender.com/api/users/register', userData);
      
      const newUser = response.data.user;
      
      // Log them in immediately after registering
      setUser(newUser);
      localStorage.setItem('smartSocUser', JSON.stringify(newUser));
      
      // Route based on role
      if (newUser.role === 'admin') navigate('/admin');
      else if (newUser.role === 'resident') navigate('/resident');
      else if (newUser.role === 'guard') navigate('/security');

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Registration failed" };
    }
  };

  // 4. LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartSocUser');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);