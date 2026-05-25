import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // Required import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Modern Studio'); 
  const [loading, setLoading] = useState(true); // Required to prevent flash on refresh

  // Required: Listen for Supabase Auth changes
  useEffect(() => {
    // Check current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for sign-in/sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Required: Update logout to talk to Supabase
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      workspaceName, 
      setWorkspaceName 
    }}>
      {/* Required: Don't render app until we know if user is logged in */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);