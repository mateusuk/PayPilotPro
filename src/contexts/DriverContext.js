// src/contexts/DriverContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from './AuthContext';

const DriverContext = createContext();

export function useDrivers() {
  return useContext(DriverContext);
}

export function DriverProvider({ children }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Fetch all drivers
  useEffect(() => {
    if (!currentUser) {
      setDrivers([]);
      setLoading(false);
      return;
    }

    async function fetchDrivers() {
      try {
        setLoading(true);
        setError('');
        
        // Query drivers from Firestore
        const q = query(
          collection(db, 'drivers'), 
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const driversData = [];
        
        querySnapshot.forEach((doc) => {
          driversData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setDrivers(driversData);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError('Failed to load drivers. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDrivers();
  }, [currentUser]);

  // Add a new driver
  async function addDriver(driverData) {
    try {
      setError('');
      
      // Prepare driver data with timestamps
      const newDriver = {
        ...driverData,
        status: 'invited',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'drivers'), newDriver);
      
      // Return the new driver with ID
      return {
        id: docRef.id,
        ...newDriver,
        createdAt: new Date().toISOString(), // Convert for immediate display
        updatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error adding driver:', err);
      setError('Failed to add driver. Please try again.');
      throw err;
    }
  }

  // Get a single driver by ID
  async function getDriver(id) {
    try {
      setError('');
      const docRef = doc(db, 'drivers', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        setError('Driver not found');
        return null;
      }
    } catch (err) {
      console.error('Error getting driver:', err);
      setError('Failed to load driver details. Please try again.');
      throw err;
    }
  }

  // Update driver information
  async function updateDriver(id, data) {
    try {
      setError('');
      const driverRef = doc(db, 'drivers', id);
      
      // Add updated timestamp
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(driverRef, updateData);
      
      // Update local state
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.id === id ? { ...driver, ...data, updatedAt: new Date().toISOString() } : driver
        )
      );
      
      return { id, ...data };
    } catch (err) {
      console.error('Error updating driver:', err);
      setError('Failed to update driver. Please try again.');
      throw err;
    }
  }

  // Delete a driver
  async function deleteDriver(id) {
    try {
      setError('');
      await deleteDoc(doc(db, 'drivers', id));
      
      // Update local state
      setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting driver:', err);
      setError('Failed to delete driver. Please try again.');
      throw err;
    }
  }

  // Upload driver document
  async function uploadDriverDocument(driverId, file, documentType) {
    try {
      setError('');
      
      // Create reference to storage
      const storageRef = ref(storage, `drivers/${driverId}/documents/${documentType}_${file.name}`);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update driver document in Firestore
      const driverRef = doc(db, 'drivers', driverId);
      const driverDoc = await getDoc(driverRef);
      
      if (driverDoc.exists()) {
        const documents = driverDoc.data().documents || {};
        
        await updateDoc(driverRef, {
          documents: {
            ...documents,
            [documentType]: {
              url: downloadURL,
              fileName: file.name,
              uploadedAt: new Date().toISOString(),
              status: 'pending_review'
            }
          },
          updatedAt: serverTimestamp()
        });
        
        return downloadURL;
      } else {
        throw new Error('Driver not found');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
      throw err;
    }
  }

  // Get drivers by status
  async function getDriversByStatus(status) {
    try {
      setError('');
      const q = query(
        collection(db, 'drivers'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const driversData = [];
      
      querySnapshot.forEach((doc) => {
        driversData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return driversData;
    } catch (err) {
      console.error(`Error getting drivers with status ${status}:`, err);
      setError(`Failed to load ${status} drivers. Please try again.`);
      throw err;
    }
  }

  const value = {
    drivers,
    loading,
    error,
    addDriver,
    getDriver,
    updateDriver,
    deleteDriver,
    uploadDriverDocument,
    getDriversByStatus,
    clearError: () => setError('')
  };

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );
}