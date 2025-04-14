import axios from 'axios';

// Create axios instance with default config
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export { instance as default };
export { default as axios } from 'axios'; 