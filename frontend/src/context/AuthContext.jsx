import React, { createContext, useContext, useState } from "react";
// No api import needed here

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Always start with user as null
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // No initial loading needed

  // useEffect hook removed - app will not load user from token automatically

  // Logout function
  const logout = () => {
    localStorage.removeItem("token"); // Remove token if it exists
    setUser(null);
  };

  // Function for Login.jsx to call after successful login and user fetch
  const setUserAfterLogin = (userData) => {
    setUser(userData);
  }

  return (
    // Provide user, loading state, logout function, and the new function
    <AuthContext.Provider value={{ user, loading, logout, setUserAfterLogin }}>
      {children}
    </AuthContext.Provider>
  );
};