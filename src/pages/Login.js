// src/pages/Login.js
import React from 'react';
import Login from '../components/auth/Login';
import { Helmet } from 'react-helmet';

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