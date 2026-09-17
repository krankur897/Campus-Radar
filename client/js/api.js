/* ==========================================================
   CAMPUSRADAR — UNIFIED API CLIENT MODULE
   ========================================================== */

const API_BASE = '/api';

const API = {
  getToken() {
    return localStorage.getItem('campusradar_token');
  },

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed.');
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error);
      if (window.Main && window.Main.showToast) {
        window.Main.showToast(error.message || 'Network or Server Error', 'error');
      }
      throw error;
    }
  },

  // Auth API
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  // Events API
  async getEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/events${query ? `?${query}` : ''}`);
  },

  async getEventById(id) {
    return this.request(`/events/${id}`);
  },

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  // Placements API
  async getPlacements(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/placements${query ? `?${query}` : ''}`);
  },

  async createPlacement(placementData) {
    return this.request('/placements', {
      method: 'POST',
      body: JSON.stringify(placementData)
    });
  },

  async updatePlacement(id, placementData) {
    return this.request(`/placements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(placementData)
    });
  },

  async deletePlacement(id) {
    return this.request(`/placements/${id}`, {
      method: 'DELETE'
    });
  },

  // Announcements API
  async getAnnouncements(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/announcements${query ? `?${query}` : ''}`);
  },

  async createAnnouncement(announcementData) {
    return this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData)
    });
  },

  async updateAnnouncement(id, announcementData) {
    return this.request(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData)
    });
  },

  async deleteAnnouncement(id) {
    return this.request(`/announcements/${id}`, {
      method: 'DELETE'
    });
  },

  // Clubs API
  async getClubs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/clubs${query ? `?${query}` : ''}`);
  },

  async getClubById(id) {
    return this.request(`/clubs/${id}`);
  },

  async createClub(clubData) {
    return this.request('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData)
    });
  },

  async updateClub(id, clubData) {
    return this.request(`/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clubData)
    });
  },

  async deleteClub(id) {
    return this.request(`/clubs/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin API
  async getAdminStats() {
    return this.request('/admin/stats');
  },

  async getAdminPending() {
    return this.request('/admin/pending');
  },

  async approveEvent(id) {
    return this.request(`/admin/content/${id}/approve`, { method: 'PUT' });
  },

  async rejectEvent(id) {
    return this.request(`/admin/content/${id}/reject`, { method: 'PUT' });
  },

  async toggleHighlight(id) {
    return this.request(`/admin/events/${id}/toggle-highlight`, { method: 'PUT' });
  }
};

window.API = API;
