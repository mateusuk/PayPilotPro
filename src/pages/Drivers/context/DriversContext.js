import React, { createContext, useContext, useState, useCallback } from 'react';
import useFirestore from '../../../hooks/useFirestore';
import { where } from 'firebase/firestore';

const DriversContext = createContext();

export const useDrivers = () => {
  const context = useContext(DriversContext);
  if (!context) {
    throw new Error('useDrivers must be used within a DriversProvider');
  }
  return context;
};

export const DriversProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const firestore = useFirestore('drivers');

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getDriversByStatus = useCallback(async (status) => {
    setLoading(true);
    try {
      const drivers = await firestore.getDocuments([where('status', '==', status)]);
      return drivers;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  const addDriver = useCallback(async (driverData) => {
    setLoading(true);
    try {
      const newDriver = await firestore.add({
        ...driverData,
        createdAt: new Date().toISOString(),
        status: 'invited',
        onboardingProgress: 0
      });
      return newDriver;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  const updateDriver = useCallback(async (driverId, data) => {
    setLoading(true);
    try {
      await firestore.update(driverId, data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  const deleteDriver = useCallback(async (driverId) => {
    setLoading(true);
    try {
      await firestore.remove(driverId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  const getDriverById = useCallback(async (driverId) => {
    setLoading(true);
    try {
      const driver = await firestore.get(driverId);
      return driver;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  const value = {
    loading,
    error,
    clearError,
    getDriversByStatus,
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById
  };

  return (
    <DriversContext.Provider value={value}>
      {children}
    </DriversContext.Provider>
  );
};

export default DriversContext; 