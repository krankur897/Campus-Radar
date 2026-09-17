/* ==========================================================
   CAMPUSRADAR — ADMIN & MANAGEMENT PORTAL MODULE
   ========================================================== */

const AdminPage = {
  activeTab: 'overview',
  user: null,

  init() {
    this.user = window.Auth ? window.Auth.getUser() : null;

    if (!this.user || this.user.role === 'Student') {
      window.Main.showToast('Access restricted to staff/admin roles.', 'error');
      setTimeout(() => window.location.href = '/login.html', 1000);
      return;
    }

    this.renderSidebar();
    this.bindEvents();
    
    // Set default active tab based on role
    if (this.user.role === 'ClubPresident') this.switchTab('events');
    else if (this.user.role === 'PlacementHead') this.switchTab('placements');
    else if (this.user.role === 'Faculty') this.switchTab('announcements');
    else this.switchTab('overview');
  },

  renderSidebar() {
    const sidebar = document.getElementById('admin-sidebar-nav');
    if (!sidebar) return;

    const role = this.user.role;
    let itemsHtml = '';

    if (role === 'Admin') {
      itemsHtml = `
        <div class="admin-nav-item active" data-tab="overview">📊 Overview & Stats</div>
        <div class="admin-nav-item" data-tab="moderation">🛡️ Content Moderation</div>
        <div class="admin-nav-item" data-tab="events">📅 Event Manager</div>
        <div class="admin-nav-item" data-tab="placements">💼 Placement Manager</div>
        <div class="admin-nav-item" data-tab="announcements">📢 Notice Manager</div>
        <div class="admin-nav-item" data-tab="clubs">🏛️ Club Directory Manager</div>
      `;
    } else if (role === 'ClubPresident') {
      itemsHtml = `
        <div class="admin-nav-item active" data-tab="events">📅 My Club Events</div>
      `;
    } else if (role === 'PlacementHead') {
      itemsHtml = `
        <div class="admin-nav-item active" data-tab="placements">💼 Placement Opportunities</div>
      `;
    } else if (role === 'Faculty') {
      itemsHtml = `
        <div class="admin-nav-item active" data-tab="announcements">📢 Department Notices</div>
      `;
    }

    sidebar.innerHTML = itemsHtml;
  },

  bindEvents() {
    const sidebar = document.getElementById('admin-sidebar-nav');
    if (sidebar) {
      sidebar.addEventListener('click', (e) => {
        const item = e.target.closest('.admin-nav-item');
        if (item) {
          const tab = item.getAttribute('data-tab');
          document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          this.switchTab(tab);
        }
      });
    }
  },

  switchTab(tab) {
    this.activeTab = tab;
    const contentArea = document.getElementById('admin-tab-content');
    if (!contentArea) return;

    contentArea.innerHTML = `<div class="loading-state"><p>Loading management panel...</p></div>`;

    if (tab === 'overview') this.loadOverview();
    else if (tab === 'moderation') this.loadModeration();
    else if (tab === 'events') this.loadEventManager();
    else if (tab === 'placements') this.loadPlacementManager();
    else if (tab === 'announcements') this.loadAnnouncementManager();
    else if (tab === 'clubs') this.loadClubManager();
  },

  // 1. Overview Tab
  async loadOverview() {
    const contentArea = document.getElementById('admin-tab-content');
    try {
      const stats = await window.API.getAdminStats();
      contentArea.innerHTML = `
        <h2>Admin Overview & Analytics</h2>
        <p style="margin-bottom: var(--space-md); font-size:0.9rem;">Real-time summary of active campus information</p>

        <div class="stats-overview-grid">
          <div class="stat-card glass-card">
            <span style="font-size:0.85rem; color:var(--text-muted);">Active Events</span>
            <div class="stat-value">${stats.activeEvents}</div>
          </div>
          <div class="stat-card glass-card">
            <span style="font-size:0.85rem; color:var(--text-muted);">Placement Drives</span>
            <div class="stat-value" style="color:var(--status-success);">${stats.placements}</div>
          </div>
          <div class="stat-card glass-card">
            <span style="font-size:0.85rem; color:var(--text-muted);">Notices Published</span>
            <div class="stat-value" style="color:var(--status-info);">${stats.announcements}</div>
          </div>
          <div class="stat-card glass-card">
            <span style="font-size:0.85rem; color:var(--text-muted);">Pending Approvals</span>
            <div class="stat-value" style="color:${stats.pendingApprovals > 0 ? 'var(--status-warning)' : 'var(--text-muted)'};">${stats.pendingApprovals}</div>
          </div>
        </div>

        <div class="glass-card" style="padding: var(--space-md);">
          <h3>Quick Management Shortcuts</h3>
          <div style="display:flex; gap:12px; margin-top:12px; flex-wrap:wrap;">
            <button onclick="AdminPage.openCreateEventModal()" class="btn btn-primary btn-sm">+ Create New Event</button>
            <button onclick="AdminPage.openCreatePlacementModal()" class="btn btn-secondary btn-sm">+ Create Placement Drive</button>
            <button onclick="AdminPage.openCreateAnnouncementModal()" class="btn btn-secondary btn-sm">+ Post Notice</button>
          </div>
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = `<div class="empty-state">Failed to load admin statistics.</div>`;
    }
  },

  // 2. Moderation Tab (Approve / Reject submitted events, Toggle Highlights)
  async loadModeration() {
    const contentArea = document.getElementById('admin-tab-content');
    try {
      const data = await window.API.getAdminPending();
      const pendingEvents = data.pendingEvents || [];
      const highlightRequests = data.highlightRequests || [];

      let pendingHtml = '';
      if (pendingEvents.length === 0) {
        pendingHtml = `<p style="color:var(--text-muted); font-size:0.9rem;">No pending event submissions requiring review.</p>`;
      } else {
        pendingHtml = pendingEvents.map(e => `
          <div class="glass-card" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="badge badge-warning" style="margin-bottom:4px;">Pending Review</span>
              <h4 style="font-size:1.05rem;">${window.Utils.escapeHTML(e.title)}</h4>
              <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">
                Organizer: <strong>${window.Utils.escapeHTML(e.organizer)}</strong> | Date: ${window.Utils.formatDate(e.date)}
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button onclick="AdminPage.approveEvent('${e._id}')" class="btn btn-primary btn-sm">Approve & Publish</button>
              <button onclick="AdminPage.rejectEvent('${e._id}')" class="btn btn-danger btn-sm">Reject</button>
            </div>
          </div>
        `).join('');
      }

      contentArea.innerHTML = `
        <h2>Content Moderation & Approval Workflow</h2>
        <p style="margin-bottom: var(--space-md); font-size:0.9rem;">Review club event submissions before public publication</p>

        <div style="margin-bottom: 24px;">
          <h3 style="margin-bottom:12px;">Pending Event Submissions</h3>
          ${pendingHtml}
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = `<div class="empty-state">Failed to load moderation requests.</div>`;
    }
  },

  async approveEvent(id) {
    try {
      const res = await window.API.approveEvent(id);
      window.Main.showToast(res.message, 'success');
      this.loadModeration();
    } catch (e) {}
  },

  async rejectEvent(id) {
    try {
      const res = await window.API.rejectEvent(id);
      window.Main.showToast(res.message, 'info');
      this.loadModeration();
    } catch (e) {}
  },

  // 3. Event Manager Tab
  async loadEventManager() {
    const contentArea = document.getElementById('admin-tab-content');
    try {
      const data = await window.API.getEvents({ past: 'false', status: this.user.role === 'Admin' ? '' : 'Published' });
      const events = data.events || [];

      contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
          <div>
            <h2>Event Management</h2>
            <p style="font-size:0.875rem; color:var(--text-muted);">Create, edit, delete, or request Campus Highlights</p>
          </div>
          <button onclick="AdminPage.openCreateEventModal()" class="btn btn-primary btn-sm">+ Create Event</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${events.map(e => `
            <div class="glass-card" style="padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
                  <span class="badge ${e.status === 'Published' ? 'badge-hostel' : 'badge-warning'}">${e.status}</span>
                  ${e.isHighlight ? '<span class="badge badge-highlight">⚡ Campus Highlight</span>' : ''}
                </div>
                <h4 style="font-size:1.05rem;">${window.Utils.escapeHTML(e.title)}</h4>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">
                  📅 ${window.Utils.formatDate(e.date)} | 📍 ${window.Utils.escapeHTML(e.venue)} | 👤 ${window.Utils.escapeHTML(e.organizer)}
                </div>
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                ${this.user.role === 'Admin' ? `
                  <button onclick="AdminPage.toggleHighlight('${e._id}')" class="btn btn-outline btn-sm">
                    ${e.isHighlight ? 'Remove Highlight' : '⚡ Set Highlight'}
                  </button>
                ` : ''}
                <button onclick="AdminPage.deleteEvent('${e._id}')" class="btn btn-secondary btn-sm" style="color:var(--status-danger);">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = `<div class="empty-state">Failed to load events.</div>`;
    }
  },

  async toggleHighlight(id) {
    try {
      const res = await window.API.toggleHighlight(id);
      window.Main.showToast(res.message, 'success');
      this.loadEventManager();
    } catch (e) {}
  },

  async deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await window.API.deleteEvent(id);
      window.Main.showToast('Event deleted successfully.', 'success');
      this.loadEventManager();
    } catch (e) {}
  },

  // Event Creation Modal Form
  openCreateEventModal() {
    const modalHtml = `
      <div class="modal-overlay active" id="admin-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Create New Campus Event</h3>
            <button onclick="AdminPage.closeModal()" class="modal-close">&times;</button>
          </div>
          <form onsubmit="AdminPage.submitEventForm(event)">
            <div class="form-group">
              <label class="form-label">Event Title *</label>
              <input type="text" id="ev-title" class="form-input" required placeholder="e.g. AI & Robotics Hackathon 2026">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select id="ev-category" class="form-select">
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Competition">Competition</option>
                  <option value="Club Event">Club Event</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Date (YYYY-MM-DD) *</label>
                <input type="date" id="ev-date" class="form-input" required>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Venue *</label>
                <input type="text" id="ev-venue" class="form-input" required placeholder="e.g. CS Seminar Hall A">
              </div>

              <div class="form-group">
                <label class="form-label">Organizer *</label>
                <input type="text" id="ev-organizer" class="form-input" required value="${this.user.clubAffiliation || this.user.name}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Registration URL *</label>
              <input type="url" id="ev-reg-url" class="form-input" required placeholder="https://forms.gle/..." value="https://campusradar.edu/register">
            </div>

            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea id="ev-desc" class="form-textarea" rows="3" required placeholder="Detailed overview of event..."></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
              <button type="button" onclick="AdminPage.closeModal()" class="btn btn-secondary btn-sm">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Publish Event</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async submitEventForm(e) {
    e.preventDefault();
    const eventData = {
      title: document.getElementById('ev-title').value,
      categories: [document.getElementById('ev-category').value],
      date: document.getElementById('ev-date').value,
      venue: document.getElementById('ev-venue').value,
      organizer: document.getElementById('ev-organizer').value,
      registrationUrl: document.getElementById('ev-reg-url').value,
      registrationDeadline: document.getElementById('ev-date').value,
      description: document.getElementById('ev-desc').value
    };

    try {
      const res = await window.API.createEvent(eventData);
      window.Main.showToast(res.message, 'success');
      this.closeModal();
      this.loadEventManager();
    } catch (err) {}
  },

  closeModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.remove();
  },

  // 4. Placement Manager Tab
  async loadPlacementManager() {
    const contentArea = document.getElementById('admin-tab-content');
    try {
      const data = await window.API.getPlacements({});
      const placements = data.placements || [];

      contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
          <div>
            <h2>Placement Opportunity Management</h2>
            <p style="font-size:0.875rem; color:var(--text-muted);">Create and manage recruitment drives & internships</p>
          </div>
          <button onclick="AdminPage.openCreatePlacementModal()" class="btn btn-primary btn-sm">+ Create Placement Drive</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${placements.map(p => `
            <div class="glass-card" style="padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span class="badge badge-tag" style="margin-bottom:4px;">${p.type}</span>
                <h4 style="font-size:1.05rem;">${window.Utils.escapeHTML(p.company)} — ${window.Utils.escapeHTML(p.role)}</h4>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">
                  Compensation: <strong style="color:var(--status-success);">${window.Utils.escapeHTML(p.compensation)}</strong> | Deadline: ${window.Utils.formatDate(p.deadline)}
                </div>
              </div>
              <button onclick="AdminPage.deletePlacement('${p._id}')" class="btn btn-secondary btn-sm" style="color:var(--status-danger);">Delete</button>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = `<div class="empty-state">Failed to load placements.</div>`;
    }
  },

  openCreatePlacementModal() {
    const modalHtml = `
      <div class="modal-overlay active" id="admin-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Create Placement Opportunity</h3>
            <button onclick="AdminPage.closeModal()" class="modal-close">&times;</button>
          </div>
          <form onsubmit="AdminPage.submitPlacementForm(event)">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Company Name *</label>
                <input type="text" id="pl-company" class="form-input" required placeholder="e.g. Google">
              </div>
              <div class="form-group">
                <label class="form-label">Role Title *</label>
                <input type="text" id="pl-role" class="form-input" required placeholder="e.g. Software Engineer">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Opportunity Type</label>
                <select id="pl-type" class="form-select">
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="FTE + Internship">FTE + Internship</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Compensation (CTC/Stipend) *</label>
                <input type="text" id="pl-comp" class="form-input" required placeholder="e.g. 18 LPA or ₹50,000/mo">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Min CGPA *</label>
                <input type="number" step="0.1" id="pl-cgpa" class="form-input" required value="7.0">
              </div>
              <div class="form-group">
                <label class="form-label">Application Deadline *</label>
                <input type="date" id="pl-deadline" class="form-input" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Application Link *</label>
              <input type="url" id="pl-url" class="form-input" required value="https://campusradar.edu/careers">
            </div>

            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea id="pl-desc" class="form-textarea" rows="3" required placeholder="Job description and requirements..."></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
              <button type="button" onclick="AdminPage.closeModal()" class="btn btn-secondary btn-sm">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Publish Opportunity</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async submitPlacementForm(e) {
    e.preventDefault();
    const data = {
      company: document.getElementById('pl-company').value,
      role: document.getElementById('pl-role').value,
      type: document.getElementById('pl-type').value,
      compensation: document.getElementById('pl-comp').value,
      minCGPA: parseFloat(document.getElementById('pl-cgpa').value),
      deadline: document.getElementById('pl-deadline').value,
      applicationUrl: document.getElementById('pl-url').value,
      description: document.getElementById('pl-desc').value,
      driveDate: document.getElementById('pl-deadline').value
    };

    try {
      const res = await window.API.createPlacement(data);
      window.Main.showToast(res.message, 'success');
      this.closeModal();
      this.loadPlacementManager();
    } catch (err) {}
  },

  async deletePlacement(id) {
    if (!confirm('Delete placement drive?')) return;
    try {
      await window.API.deletePlacement(id);
      window.Main.showToast('Placement deleted.', 'success');
      this.loadPlacementManager();
    } catch (e) {}
  },

  // 5. Announcement Manager Tab
  async loadAnnouncementManager() {
    const contentArea = document.getElementById('admin-tab-content');
    try {
      const data = await window.API.getAnnouncements({});
      const announcements = data.announcements || [];

      contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
          <div>
            <h2>Announcement & Notice Management</h2>
            <p style="font-size:0.875rem; color:var(--text-muted);">Publish official notices and emergency updates</p>
          </div>
          <button onclick="AdminPage.openCreateAnnouncementModal()" class="btn btn-primary btn-sm">+ Post Notice</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${announcements.map(a => `
            <div class="glass-card" style="padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
                  <span class="badge badge-tag">${a.badge}</span>
                  <span style="font-size:0.8rem; color:var(--accent-primary); font-weight:600;">${window.Utils.escapeHTML(a.source)}</span>
                </div>
                <h4 style="font-size:1.05rem;">${window.Utils.escapeHTML(a.title)}</h4>
              </div>
              <button onclick="AdminPage.deleteAnnouncement('${a._id}')" class="btn btn-secondary btn-sm" style="color:var(--status-danger);">Delete</button>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = `<div class="empty-state">Failed to load announcements.</div>`;
    }
  },

  openCreateAnnouncementModal() {
    const modalHtml = `
      <div class="modal-overlay active" id="admin-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Post Institutional Announcement</h3>
            <button onclick="AdminPage.closeModal()" class="modal-close">&times;</button>
          </div>
          <form onsubmit="AdminPage.submitAnnouncementForm(event)">
            <div class="form-group">
              <label class="form-label">Title *</label>
              <input type="text" id="an-title" class="form-input" required placeholder="e.g. Mid-Term Examination Seating Plan">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Department / Source *</label>
                <input type="text" id="an-source" class="form-input" required value="${this.user.department || 'Academic Cell'}">
              </div>
              <div class="form-group">
                <label class="form-label">Urgency Badge</label>
                <select id="an-badge" class="form-select">
                  <option value="GENERAL">GENERAL</option>
                  <option value="URGENT">URGENT</option>
                  <option value="DEADLINE">DEADLINE</option>
                  <option value="ACADEMIC">ACADEMIC</option>
                  <option value="EXAM">EXAM</option>
                  <option value="HOSTEL">HOSTEL</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notice Content *</label>
              <textarea id="an-content" class="form-textarea" rows="4" required placeholder="Detailed notice details..."></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
              <button type="button" onclick="AdminPage.closeModal()" class="btn btn-secondary btn-sm">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Post Notice</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async submitAnnouncementForm(e) {
    e.preventDefault();
    const data = {
      title: document.getElementById('an-title').value,
      source: document.getElementById('an-source').value,
      badge: document.getElementById('an-badge').value,
      content: document.getElementById('an-content').value
    };

    try {
      const res = await window.API.createAnnouncement(data);
      window.Main.showToast(res.message, 'success');
      this.closeModal();
      this.loadAnnouncementManager();
    } catch (err) {}
  },

  async deleteAnnouncement(id) {
    if (!confirm('Delete announcement notice?')) return;
    try {
      await window.API.deleteAnnouncement(id);
      window.Main.showToast('Announcement deleted.', 'success');
      this.loadAnnouncementManager();
    } catch (e) {}
  },

  // 6. Club Manager Tab
  async loadClubManager() {
    const contentArea = document.getElementById('admin-tab-content');
    try {
      const data = await window.API.getClubs({});
      const clubs = data.clubs || [];

      contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
          <div>
            <h2>Club Directory Management</h2>
            <p style="font-size:0.875rem; color:var(--text-muted);">Manage campus organizations and leadership</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${clubs.map(c => `
            <div class="glass-card" style="padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span class="badge badge-tag">${c.category}</span>
                <h4 style="font-size:1.05rem; margin-top:2px;">${window.Utils.escapeHTML(c.name)}</h4>
                <div style="font-size:0.85rem; color:var(--text-muted);">President: ${window.Utils.escapeHTML(c.presidentName)}</div>
              </div>
              <span class="badge badge-highlight">${c.activeEventCount || 0} Active Events</span>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = `<div class="empty-state">Failed to load clubs.</div>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-page-identifier')) {
    AdminPage.init();
  }
});

window.AdminPage = AdminPage;
