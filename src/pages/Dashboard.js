// src/pages/Dashboard.js
import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardComponent from '../components/layout/Dashboard';

const DashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard - PayPilotPro</title>
        <meta name="description" content="View your logistics dashboard with key metrics and insights" />
      </Helmet>
      <DashboardComponent />
    </>
  );
};

export default DashboardPage;