import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - change this to your Flask server address
const API_URL = 'http://10.0.2.2:5000'; // For Android emulator
// const API_URL = 'http://localhost:5000/api'; // For iOS simulator
// const API_URL = 'https://your-production-server.com/api'; // For production

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth functions
export const register = async (name, email, password) => {
  try {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    
    // Store token and user data
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/reset-password', { token, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};

export const saveBudgetData = async (userId, formData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/save_budget_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        budget: formData.budget,
        hasTuition: formData.hasTuition,
        tuitionAmount: formData.tuitionAmount,
        rent: formData.rent,
        food: formData.food,
        transport: formData.transport
      })
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    return await response.json();
  } catch (error) {
    console.error('Save budget error:', error);
    throw error;
  }
};

export const getBudgetData = async (userId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/get_budget_data`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch budget data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get budget error:', error);
    throw error;
  }
};

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  isAuthenticated,
  saveBudgetData,
  getBudgetData
};