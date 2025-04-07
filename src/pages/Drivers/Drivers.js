import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import DriverList from './components/DriverList/DriverList';
import DriverDetails from './components/DriverDetails/DriverDetails';
import DriverVehicle from './components/DriverVehicle/DriverVehicle';
import DriverFinancial from './components/DriverFinancial/DriverFinancial';
import DriverIncidents from './components/DriverIncidents/DriverIncidents';
import DriverEngagement from './components/DriverEngagement/DriverEngagement';
import './styles/drivers.css';

const DriversPage = () => {
  return (
    <>
      <Helmet>
        <title>Drivers - PayPilotPro</title>
        <meta name="description" content="Manage your drivers and their information" />
      </Helmet>
      <Routes>
        <Route index element={<DriverList />} />
        <Route path=":id" element={<DriverDetails />} />
        <Route path=":id/vehicle" element={<DriverVehicle />} />
        <Route path=":id/financial" element={<DriverFinancial />} />
        <Route path=":id/incidents" element={<DriverIncidents />} />
        <Route path=":id/engagement" element={<DriverEngagement />} />
      </Routes>
    </>
  );
};

export default DriversPage; 