import api from './api';

const donationService = {
  // Get all available donations (public)
  getAvailable: () => api.get('/donations/available'),

  // Get all NGOs (public)
  getAllNGOs: () => api.get('/donations/ngos'),

  // Get my NGO profile
  getMyNGO: () => api.get('/donations/ngo/my'),

  // Register NGO
  registerNGO: (data) => api.post('/donations/ngo', data),

  // Update NGO
  updateNGO: (id, data) => api.put(`/donations/ngo/${id}`, data),

  // Create donation (restaurant)
  createDonation: (data) => api.post('/donations', data),

  // Get my donations (restaurant)
  getMyDonations: () => api.get('/donations/my-donations'),

  // Get NGO's received donations
  getNGODonations: () => api.get('/donations/ngo/received'),

  // Request a donation (NGO)
  requestDonation: (donationId) => api.patch(`/donations/${donationId}/request`),

  // Accept a donation request (restaurant)
  acceptDonation: (donationId) => api.patch(`/donations/${donationId}/accept`),

  // Update donation status
  updateDonationStatus: (donationId, status) => api.patch(`/donations/${donationId}/status`, { status }),
};

export default donationService;
