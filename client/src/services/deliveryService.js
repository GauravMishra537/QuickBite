import api from './api';

const deliveryService = {
  // Get delivery partner profile
  getProfile: () => api.get('/deliveries/profile'),

  // Register as delivery partner
  register: (data) => api.post('/deliveries/register', data),

  // Update profile
  updateProfile: (data) => api.put('/deliveries/profile', data),

  // Toggle availability (online/offline)
  toggleAvailability: () => api.patch('/deliveries/toggle-availability'),

  // Update location
  updateLocation: (coords) => api.patch('/deliveries/location', coords),

  // Get available deliveries
  getAvailable: () => api.get('/deliveries/available'),

  // Get active deliveries (currently assigned)
  getActive: () => api.get('/deliveries/active'),

  // Accept a delivery
  acceptDelivery: (orderId) => api.patch(`/deliveries/accept/${orderId}`),

  // Complete a delivery
  completeDelivery: (orderId) => api.patch(`/deliveries/complete/${orderId}`),

  // Get delivery history
  getHistory: () => api.get('/deliveries/history'),

  // Get earnings
  getEarnings: () => api.get('/deliveries/earnings'),
};

export default deliveryService;
