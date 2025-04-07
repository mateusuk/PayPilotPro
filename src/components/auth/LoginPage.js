// src/components/auth/LoginPage.js
import React from 'react';
import Login from './Login';
import { Helmet } from 'react-helmet';
import './styles.css';

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Login - PayPilotPro</title>
        <meta name="description" content="Login to your PayPilotPro account to manage your logistics operations" />
      </Helmet>
      <Login />
    </>
  );
};

export default LoginPage; 