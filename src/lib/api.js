const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('delivery-token'); // Changed from medicare-token
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
  });

  // Handle 401 responses (token expired or invalid)
  if (response.status === 401) {
    localStorage.removeItem('delivery-token');
    localStorage.removeItem('delivery-user');
    window.dispatchEvent(new Event('delivery-auth-change'));
    // Optionally redirect to login page
    // window.location.href = '/login';
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// Auth endpoints
export const login = (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const register = (details) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(details) });
export const getMe = () => apiRequest('/api/auth/me');

// Customer endpoints
export const getCustomerProfile = () => apiRequest('/api/customers/me');
export const updateCustomerProfile = (data) => apiRequest('/api/customers/me', { method: 'PUT', body: JSON.stringify(data) });

// Rider endpoints
export const getRiderProfile = () => apiRequest('/api/riders/me');
export const updateRiderProfile = (data) => apiRequest('/api/riders/me', { method: 'PUT', body: JSON.stringify(data) });
export const updateRiderAvailability = (status) => apiRequest('/api/riders/availability', { method: 'PATCH', body: JSON.stringify({ availability_status: status }) });
export const getAvailableRiders = () => apiRequest('/api/riders/available');

// Order endpoints
export const createOrder = (orderData) => apiRequest('/api/orders', { method: 'POST', body: JSON.stringify(orderData) });
export const getOrders = (params) => {
  // Build query string from params
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/api/orders${queryString ? '?' + queryString : ''}`);
};
export const getOrderById = (id) => apiRequest(`/api/orders/${id}`);
export const updateOrderStatus = (id, statusData) => apiRequest(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) });

// Payment endpoints
export const getPaymentByOrderId = (orderId) => apiRequest(`/api/payments/${orderId}`);
export const updatePaymentStatus = (orderId, paymentData) => apiRequest(`/api/payments/${orderId}`, { method: 'PATCH', body: JSON.stringify(paymentData) });

// Admin endpoints
export const getAdminStats = () => apiRequest('/api/admin/stats');
export const getAdminUsers = () => apiRequest('/api/admin/users');
export const getAdminOrders = () => apiRequest('/api/admin/orders');
export const getAdminRiders = () => apiRequest('/api/admin/riders');

export { apiRequest };