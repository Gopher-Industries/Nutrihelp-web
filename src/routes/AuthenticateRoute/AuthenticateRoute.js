import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../context/user.context';

const AuthenticateRoute = ({ children }) => {
  const { currentUser, setCurrentUser } = useContext(UserContext);

  // Development mode bypass - set to true to bypass authentication
  const DEVELOPMENT_MODE = true;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const expirationTime = user.expirationTime;

      if (expirationTime && Date.now() > expirationTime) {
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
    }
  }, [setCurrentUser]);

  // If in development mode, bypass authentication
  if (DEVELOPMENT_MODE) {
    return children;
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

export default AuthenticateRoute;