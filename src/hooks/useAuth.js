// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * 
 * Provides access to user information and authentication functions:
 * - currentUser: The currently authenticated user
 * - register: Function to register a new user
 * - login: Function to log in a user
 * - logout: Function to log out the current user
 * - resetPassword: Function to initiate a password reset
 * - error: Any authentication error message
 * - clearError: Function to clear error messages
 * - loading: Loading state for authentication operations
 */
const useAuth = () => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return auth;
};

export default useAuth;