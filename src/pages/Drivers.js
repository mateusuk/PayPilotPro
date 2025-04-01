// src/pages/Drivers.js
import React from 'react';
import { Helmet } from 'react-helmet';
import DriverList from '../components/drivers/DriverList';

const DriversPage = () => {
  return (
    <>
      <Helmet>
        <title>Drivers - PayPilotPro</title>
        <meta name="description" content="Manage your drivers and their information" />
      </Helmet>
      <DriverList />
    </>
  );
};

export default DriversPage;