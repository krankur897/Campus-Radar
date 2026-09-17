/* ==========================================================
   CAMPUSRADAR — ANNOUNCEMENTS NOTICE BOARD MODULE
   ========================================================== */

const AnnouncementsPage = {
  state: {
    badge: 'All',
    source: 'All',
    q: '',
    announcements: []
  },

  init() {
    this.bindEvents();
    this.loadAnnouncements();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-announcements-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.state.q = e.target.value.trim();
          this.loadAnnouncements();
        }, 250);
      });
    }

    const badgePills = document.querySelectorAll('.badge-pill');
    badgePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        badgePills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.state.badge = e.target.getAttribute('data-badge') || 'All';
        this.loadAnnouncements();
      });
    });

    const sourceSelect = document.getElementById('source-select');
    if (sourceSelect) {
      sourceSelect.addEventListener('change', (e) => {
        this.state.source = e.target.value;
        this.loadAnnouncements();
      });
    }
  },

  async loadAnnouncements() {
    const listContainer = document.getElementById('announcements-list-container');
    const countContainer = document.getElementById('announcements-count');

    if (listContainer) {
      listContainer.innerHTML = `
        <div class="loading-state">
          <div style="font-size:1.1rem; color:var(--accent-primary); margin-bottom:8px;">Scanning official notice board...</div>
          <p>Fetching latest institutional notices and academic alerts</p>
        </div>
      `;
    }

    try {
      const data = await window.API.getAnnouncements({
        badge: this.state.badge,
        source: this.state.source,
        q: this.state.q
      });

      this.state.announcements = data.announcements || [];

      if (countContainer) {
        countContainer.textContent = `${this.state.announcements.length} notice${this.state.announcements.length === 1 ? '' : 's'} found`;
      }

      this.renderAnnouncements();
    } catch (error) {
      if (listContainer) {
        listContainer.innerHTML = `
          <div class="empty-state glass-card">
            <h3>We couldn't load announcements</h3>
            <p>${window.Utils.escapeHTML(error.message)}</p>
          </div>
        `;
      }
    }
  },

  renderAnnouncements() {
    const listContainer = document.getElementById('announcements-list-container');
    if (!listContainer) return;

    if (this.state.announcements.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state glass-card">
          <h3>No announcements matching criteria</h3>
          <p>Try switching categories or clearing search filters.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.state.announcements.map(a => {
      let badgeClass = 'badge-academic';
      if (a.badge === 'URGENT') badgeClass = 'badge-urgent';
      if (a.badge === 'DEADLINE') badgeClass = 'badge-deadline';
      if (a.badge === 'EXAM') badgeClass = 'badge-exam';
      if (a.badge === 'HOSTEL') badgeClass = 'badge-hostel';

      const sourceLinkHtml = a.sourceUrl ? `
        <a href="${a.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
          Official Notice Link ↗
        </a>
      ` : '';

      const deadlineText = a.deadline ? `<span>⏳ Action Deadline: ${window.Utils.formatDate(a.deadline)}</span>` : '';

      return `
        <div class="announcement-card glass-card ${a.badge ? a.badge.toLowerCase() : ''}">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge ${badgeClass}">${a.badge}</span>
              <span style="font-weight:600; font-size:0.85rem; color:var(--accent-primary);">${window.Utils.escapeHTML(a.source)}</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-dim);">Posted: ${window.Utils.formatDate(a.postedAt)}</span>
          </div>

          <h3 style="font-size: 1.15rem; margin-bottom: 8px;">${window.Utils.escapeHTML(a.title)}</h3>
          <p style="font-size: 0.95rem; margin-bottom: 12px; line-height:1.6; white-space:pre-line;">
            ${window.Utils.escapeHTML(a.content)}
          </p>

          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size:0.85rem; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:10px;">
            ${deadlineText}
            ${sourceLinkHtml}
          </div>
        </div>
      `;
    }).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('announcements-page-identifier')) {
    AnnouncementsPage.init();
  }
});

window.AnnouncementsPage = AnnouncementsPage;
