/* ==========================================================
   CAMPUSRADAR — STUDENT DASHBOARD MODULE
   ========================================================== */

const StudentDashboard = {
  init() {
    this.renderWelcome();
    this.renderBookmarks();
    this.loadUpcomingDeadlines();
  },

  renderWelcome() {
    const user = window.Auth ? window.Auth.getUser() : null;
    const welcomeContainer = document.getElementById('dashboard-welcome');

    if (welcomeContainer) {
      const name = user ? user.name : 'Student Discovery Portal';
      const dept = user && user.department ? user.department : 'General Student Overview';
      welcomeContainer.innerHTML = `
        <h1 style="font-size: 1.85rem;">Welcome back, ${window.Utils.escapeHTML(name)}</h1>
        <p style="color: var(--accent-primary); font-weight: 500; font-size: 0.95rem; margin-top:4px;">${window.Utils.escapeHTML(dept)}</p>
      `;
    }
  },

  renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    if (!container) return;

    const bookmarks = window.Utils.getBookmarks();

    if (bookmarks.length === 0) {
      container.innerHTML = `
        <div class="empty-state glass-card">
          <div style="font-size:1.5rem; margin-bottom:6px;">☆</div>
          <h4>You haven't saved any events yet</h4>
          <p style="font-size:0.875rem; margin-bottom:12px;">Browse events on CampusRadar and click "Save" to keep track of deadlines.</p>
          <a href="/events.html" class="btn btn-outline btn-sm">Explore Events</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${bookmarks.map(b => `
          <div class="glass-card" style="padding: 12px 16px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <h4 style="font-size:1rem;"><a href="/event-details.html?id=${b.id || b._id}">${window.Utils.escapeHTML(b.title)}</a></h4>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                📍 ${window.Utils.escapeHTML(b.venue || 'Campus')} | 📅 ${window.Utils.formatDate(b.date)}
              </div>
            </div>
            <button onclick="StudentDashboard.removeBookmark('${b.id || b._id}')" class="btn btn-secondary btn-sm" style="color:var(--status-danger);">Remove</button>
          </div>
        `).join('')}
      </div>
    `;
  },

  removeBookmark(eventId) {
    window.Utils.toggleBookmark({ _id: eventId });
    window.Main.showToast('Bookmark removed.', 'info');
    this.renderBookmarks();
  },

  async loadUpcomingDeadlines() {
    const deadlinesContainer = document.getElementById('deadlines-container');
    if (!deadlinesContainer) return;

    try {
      const [eventsData, placementsData] = await Promise.all([
        window.API.getEvents({ range: 'week' }),
        window.API.getPlacements({})
      ]);

      const events = (eventsData.events || []).slice(0, 3);
      const placements = (placementsData.placements || []).slice(0, 3);

      if (events.length === 0 && placements.length === 0) {
        deadlinesContainer.innerHTML = `<p style="font-size:0.875rem; color:var(--text-muted);">No urgent deadlines this week.</p>`;
        return;
      }

      const eventsHtml = events.map(e => `
        <div style="padding:10px; border-bottom:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between;">
          <div>
            <span class="badge badge-tag" style="font-size:0.7rem;">Event</span>
            <div style="font-weight:600; font-size:0.9rem; margin-top:2px;">${window.Utils.escapeHTML(e.title)}</div>
          </div>
          <div style="font-size:0.8rem; color:var(--status-warning); font-weight:600;">Reg Deadline: ${window.Utils.formatDate(e.registrationDeadline)}</div>
        </div>
      `).join('');

      const placementsHtml = placements.map(p => `
        <div style="padding:10px; border-bottom:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between;">
          <div>
            <span class="badge badge-tag" style="font-size:0.7rem; border-color:var(--status-success); color:var(--status-success);">Placement</span>
            <div style="font-weight:600; font-size:0.9rem; margin-top:2px;">${window.Utils.escapeHTML(p.company)} - ${window.Utils.escapeHTML(p.role)}</div>
          </div>
          <div style="font-size:0.8rem; color:var(--status-danger); font-weight:600;">Apply By: ${window.Utils.formatDate(p.deadline)}</div>
        </div>
      `).join('');

      deadlinesContainer.innerHTML = eventsHtml + placementsHtml;
    } catch (e) {
      deadlinesContainer.innerHTML = `<p style="font-size:0.85rem; color:var(--text-dim);">Failed to load deadlines.</p>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard-page-identifier')) {
    StudentDashboard.init();
  }
});

window.StudentDashboard = StudentDashboard;
