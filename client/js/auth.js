/* ==========================================================
   CAMPUSRADAR — AUTHENTICATION & SESSION MANAGER
   ========================================================== */

const Auth = {
  getUser() {
    try {
      const userStr = localStorage.getItem('campusradar_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user, token) {
    if (user) {
      localStorage.setItem('campusradar_user', JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem('campusradar_token', token);
    }
  },

  logout() {
    localStorage.removeItem('campusradar_user');
    localStorage.removeItem('campusradar_token');
    if (window.Main && window.Main.showToast) {
      window.Main.showToast('Logged out successfully.', 'info');
    }
    window.location.href = '/login.html';
  },

  isLoggedIn() {
    return !!this.getUser() && !!localStorage.getItem('campusradar_token');
  },

  getRole() {
    const user = this.getUser();
    return user ? user.role : 'Visitor';
  },

  // Pre-configured Exhibition Demo Accounts
  DEMO_ACCOUNTS: {
    student: { email: 'student@demo.campusradar.local', password: 'demo123', label: 'Student' },
    club: { email: 'club@demo.campusradar.local', password: 'demo123', label: 'Club President' },
    placement: { email: 'placement@demo.campusradar.local', password: 'demo123', label: 'Placement Head' },
    faculty: { email: 'faculty@demo.campusradar.local', password: 'demo123', label: 'Faculty' },
    admin: { email: 'admin@demo.campusradar.local', password: 'demo123', label: 'Super Admin' }
  },

  async loginAsDemoAccount(roleKey) {
    const account = this.DEMO_ACCOUNTS[roleKey];
    if (!account) return;

    try {
      const response = await window.API.login(account.email, account.password);
      this.setUser(response.user, response.token);
      if (window.Main && window.Main.showToast) {
        window.Main.showToast(`Logged in as ${response.user.name} (${response.user.role})`, 'success');
      }
      
      // Route based on role
      setTimeout(() => {
        if (response.user.role === 'Student') {
          window.location.href = '/dashboard.html';
        } else {
          window.location.href = '/admin.html';
        }
      }, 500);
    } catch (error) {
      console.error('Demo login error:', error);
    }
  }
};

window.Auth = Auth;
