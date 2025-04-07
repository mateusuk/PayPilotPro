// src/hooks/useFirestore.js
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import useAuth from './useAuth';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Custom hook for Firestore operations
 * 
 * @param {string} collectionName - The name of the Firestore collection
 * @returns {Object} Firestore operations and state
 */
const useFirestore = (collectionName) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  // Store the latest query for real-time updates
  const latestQuery = useRef(null);
  
  // Clean up function for unsubscribing from snapshots
  const unsubscribe = useRef(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (unsubscribe.current) {
        unsubscribe.current();
      }
    };
  }, []);
  
  /**
   * Get a document by ID
   * 
   * @param {string} id - The document ID
   * @returns {Promise<Object>} The document data
   */
  const getDocument = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Document not found');
      }
    } catch (err) {
      console.error(`Error getting document from ${collectionName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get documents with optional query constraints
   * 
   * @param {Array} queryConstraints - Array of query constraints (where, orderBy, limit, etc.)
   * @returns {Promise<Array>} Array of documents matching the query
   */
  const getDocuments = async (queryConstraints = []) => {
    try {
      setLoading(true);
      setError(null);
      
      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      setDocuments(results);
      return results;
    } catch (err) {
      console.error(`Error getting documents from ${collectionName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Subscribe to real-time updates of a query
   * 
   * @param {Array} queryConstraints - Array of query constraints
   * @returns {Function} Unsubscribe function
   */
  const subscribeToQuery = (queryConstraints = []) => {
    setLoading(true);
    setError(null);
    
    // Create query
    const q = query(collection(db, collectionName), ...queryConstraints);
    latestQuery.current = q;
    
    // Unsubscribe from previous listener if exists
    if (unsubscribe.current) {
      unsubscribe.current();
    }
    
    // Set up new listener
    unsubscribe.current = onSnapshot(
      q,
      (snapshot) => {
        const results = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        setDocuments(results);
        setLoading(false);
      },
      (err) => {
        console.error(`Error in real-time updates for ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );
    
    // Return unsubscribe function
    return unsubscribe.current;
  };
  
  /**
   * Add a new document to the collection
   * 
   * @param {Object} data - The document data to add
   * @returns {Promise<Object>} The added document with ID
   */
  const addDocument = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timestamps and user ID
      const dataWithMeta = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser?.uid || null
      };
      
      const docRef = await addDoc(collection(db, collectionName), dataWithMeta);
      
      // Return the new document with ID
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser?.uid || null
      };
    } catch (err) {
      console.error(`Error adding document to ${collectionName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Update a document in the collection
   * 
   * @param {string} id - The document ID to update
   * @param {Object} data - The document data to update
   * @returns {Promise<Object>} The updated document
   */
  const updateDocument = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add updated timestamp
      const updates = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updates);
      
      // Return the updated document
      return {
        id,
        ...data,
        updatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error(`Error updating document in ${collectionName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Delete a document from the collection
   * 
   * @param {string} id - The document ID to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  const deleteDocument = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteDoc(doc(db, collectionName, id));
      
      // If we have the documents in state, update them
      if (documents.length > 0) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
      }
      
      return true;
    } catch (err) {
      console.error(`Error deleting document from ${collectionName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Return all functions and state
  return {
    documents,
    error,
    loading,
    getDocument,
    getDocuments,
    subscribeToQuery,
    addDocument,
    updateDocument,
    deleteDocument
  };
};

export default useFirestore;