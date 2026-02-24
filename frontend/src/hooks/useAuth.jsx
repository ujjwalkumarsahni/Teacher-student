// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Agar aap JWT decode kar rahe hain
          try {
            // const decoded = jwtDecode(token); // Agar jwt-decode use kar rahe hain
            // setUser(decoded);
            
            // Ya agar aap simple user object store kar rahe hain
            const userStr = localStorage.getItem('user');
            if (userStr) {
              setUser(JSON.parse(userStr));
            }
          } catch (decodeError) {
            console.error('Token decode error:', decodeError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};  