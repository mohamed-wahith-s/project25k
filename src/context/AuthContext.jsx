import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (identifier, password) => {
    // Simulated login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (identifier && password) {
          const newUser = { 
            email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
            name: identifier.split('@')[0],
            phone: !identifier.includes('@') ? identifier : '',
            isSubscribed: false
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          localStorage.removeItem('isSubscribed'); // Clear old global flag
          resolve(newUser);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const signup = (userData) => {
    // Simulated signup
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { username, email, phone, password } = userData;
        if (username && email && phone && password) {
          const newUser = { username, email, phone, name: username, isSubscribed: false };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          localStorage.removeItem('isSubscribed'); // Clear old global flag
          resolve(newUser);
        } else {
          reject(new Error('Please fill in all fields'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isSubscribed');
  };

  const updateUser = (data) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
