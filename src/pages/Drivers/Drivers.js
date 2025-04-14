import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import DriverList from './components/DriverList';
import DriverDetails from './components/DriverDetails';
import DriverVehicle from './components/DriverVehicle/DriverVehicle';
import DriverFinancial from './components/DriverFinancial/DriverFinancial';
import DriverIncidents from './components/DriverIncidents/DriverIncidents';
import DriverEngagement from './components/DriverEngagement/DriverEngagement';
import DriverLayout from './components/DriverLayout';
import './drivers-transitions.css';

// Wrap apenas os detalhes, não o layout completo, em CSSTransition
const DriverDetailsPage = () => (
  <DriverLayout activeTab="details">
    <DriverDetails />
  </DriverLayout>
);

const DriverVehiclePage = () => (
  <DriverLayout activeTab="vehicle">
    <DriverVehicle />
  </DriverLayout>
);

const DriverFinancialPage = () => (
  <DriverLayout activeTab="financial">
    <DriverFinancial />
  </DriverLayout>
);

const DriverIncidentsPage = () => (
  <DriverLayout activeTab="incidents">
    <DriverIncidents />
  </DriverLayout>
);

const DriverEngagementPage = () => (
  <DriverLayout activeTab="engagement">
    <DriverEngagement />
  </DriverLayout>
);

const Drivers = () => {
  return (
    <>
      <Helmet>
        <title>Drivers | PayPilotPro</title>
      </Helmet>
      <TransitionGroup component={null}>
        <CSSTransition key={location.key} classNames="page" timeout={300}>
          <Routes location={location}>
            <Route index element={<DriverList />} />
            <Route path=":id" element={<DriverDetailsPage />} />
            <Route path=":id/vehicle" element={<DriverVehiclePage />} />
            <Route path=":id/financial" element={<DriverFinancialPage />} />
            <Route path=":id/incidents" element={<DriverIncidentsPage />} />
            <Route path=":id/engagement" element={<DriverEngagementPage />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
};

export default Drivers; 