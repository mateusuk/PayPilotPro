// src/pages/Register.js
import React from 'react';
import Register from '../components/auth/Register';
import { Helmet } from 'react-helmet';

const RegisterPage = () => {
  return (
    <>
      <Helmet>
        <title>Create Account - PayPilotPro</title>
        <meta name="description" content="Create a new PayPilotPro account to start managing your logistics operations" />
      </Helmet>
      <Register />
    </>
  );
};

export default RegisterPage;