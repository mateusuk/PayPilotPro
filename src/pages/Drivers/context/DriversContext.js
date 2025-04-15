import React, { createContext, useContext, useState, useCallback } from 'react';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import useFirestore from '../../../hooks/useFirestore';

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
  const { currentUser } = useAuth();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getDriversByStatus = useCallback(async (status) => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    setLoading(true);
    try {
      // Usar a API nativa do Firebase
      const driversRef = collection(db, 'drivers');
      const q = query(
        driversRef, 
        where('userId', '==', currentUser.uid),
        where('status', '==', status)
      );
      const querySnapshot = await getDocs(q);
      
      const drivers = [];
      querySnapshot.forEach((doc) => {
        drivers.push({ id: doc.id, ...doc.data() });
      });
      
      return drivers;
    } catch (err) {
      console.error('Erro ao buscar motoristas por status:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addDriver = useCallback(async (driverData) => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    setLoading(true);
    try {
      console.log('DriversContext: Adicionando motorista:', driverData);
      
      // Adicionar metadados e userId
      const dataWithMeta = {
        ...driverData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
        onboardingProgress: 0
      };
      
      // Usar a API nativa do Firebase
      const docRef = await addDoc(collection(db, 'drivers'), dataWithMeta);
      
      console.log('DriversContext: Motorista adicionado com sucesso!');
      
      // Retornar o novo motorista com ID
      return {
        id: docRef.id,
        ...driverData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.uid
      };
    } catch (err) {
      console.error('DriversContext: Erro ao adicionar motorista:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateDriver = useCallback(async (driverId, data) => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    setLoading(true);
    try {
      console.log('DriversContext: Atualizando motorista com ID:', driverId, data);
      
      // Verificar se o driver pertence ao usuário atual
      const driverRef = doc(db, 'drivers', driverId);
      const driverSnap = await getDoc(driverRef);
      
      if (!driverSnap.exists()) {
        throw new Error('Motorista não encontrado');
      }
      
      const driverData = driverSnap.data();
      if (driverData.userId !== currentUser.uid) {
        throw new Error('Não autorizado a modificar este motorista');
      }
      
      // Adicionar timestamp de atualização
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(driverRef, updateData);
      
      return { id: driverId, ...data };
    } catch (err) {
      console.error('DriversContext: Erro ao atualizar motorista:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const deleteDriver = useCallback(async (driverId) => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    setLoading(true);
    try {
      // Verificar se o driver pertence ao usuário atual
      const driverRef = doc(db, 'drivers', driverId);
      const driverSnap = await getDoc(driverRef);
      
      if (!driverSnap.exists()) {
        throw new Error('Motorista não encontrado');
      }
      
      const driverData = driverSnap.data();
      if (driverData.userId !== currentUser.uid) {
        throw new Error('Não autorizado a deletar este motorista');
      }
      
      await deleteDoc(driverRef);
      return true;
    } catch (err) {
      console.error('DriversContext: Erro ao remover motorista:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const getDriverById = useCallback(async (driverId) => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    setLoading(true);
    try {
      console.log('DriversContext: Buscando motorista com ID:', driverId);
      
      const driverRef = doc(db, 'drivers', driverId);
      const driverSnap = await getDoc(driverRef);
      
      if (!driverSnap.exists()) {
        throw new Error('Motorista não encontrado');
      }
      
      const driverData = driverSnap.data();
      if (driverData.userId !== currentUser.uid) {
        throw new Error('Não autorizado a visualizar este motorista');
      }
      
      return { id: driverSnap.id, ...driverData };
    } catch (err) {
      console.error('DriversContext: Erro ao buscar motorista:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateDriverStatus = useCallback(async (driverId, newStatus) => {
    setLoading(true);
    try {
      console.log(`DriversContext: Atualizando status do motorista ${driverId} para ${newStatus}`);
      
      // Usar a API nativa do Firebase
      const driverRef = doc(db, 'drivers', driverId);
      
      // Obter driver atual primeiro para preservar outros campos
      const driverSnap = await getDoc(driverRef);
      if (!driverSnap.exists()) {
        throw new Error('Motorista não encontrado');
      }
      
      await updateDoc(driverRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      return { id: driverId, status: newStatus };
    } catch (err) {
      console.error('DriversContext: Erro ao atualizar status do motorista:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    loading,
    error,
    clearError,
    getDriversByStatus,
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById,
    updateDriverStatus
  };

  return (
    <DriversContext.Provider value={value}>
      {children}
    </DriversContext.Provider>
  );
};

export default DriversContext; 