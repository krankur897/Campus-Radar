/* ==========================================================
   CAMPUSRADAR — EVENTS DISCOVERY HUB MODULE
   ========================================================== */

const EventsPage = {
  state: {
    category: 'All',
    range: 'all',
    q: '',
    events: []
  },

  init() {
    this.bindEvents();
    this.loadEvents();
  },

  bindEvents() {
    // Search input with debounce
    const searchInput = document.getElementById('search-events-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.state.q = e.target.value.trim();
          this.loadEvents();
        }, 250);
      });
    }

    // Category filter pills
    const categoryPills = document.querySelectorAll('.category-pill');
    categoryPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        categoryPills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.state.category = e.target.getAttribute('data-category') || 'All';
        this.loadEvents();
      });
    });

    // Range filter pills (Upcoming, This Week, This Month)
    const rangePills = document.querySelectorAll('.range-pill');
    rangePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        rangePills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.state.range = e.target.getAttribute('data-range') || 'all';
        this.loadEvents();
      });
    });
  },

  async loadEvents() {
    const listContainer = document.getElementById('events-list-container');
    const countContainer = document.getElementById('events-count');

    if (listContainer) {
      listContainer.innerHTML = `
        <div class="loading-state">
          <div style="font-size:1.1rem; color:var(--accent-primary); margin-bottom:8px;">Scanning campus radar...</div>
          <p>Loading upcoming events across departments & clubs</p>
        </div>
      `;
    }

    try {
      const data = await window.API.getEvents({
        category: this.state.category,
        range: this.state.range,
        q: this.state.q,
        past: 'false'
      });

      this.state.events = data.events || [];

      if (countContainer) {
        countContainer.textContent = `${this.state.events.length} event${this.state.events.length === 1 ? '' : 's'} found`;
      }

      this.renderEvents();
    } catch (error) {
      if (listContainer) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <h3>We couldn't load campus events</h3>
            <p>${window.Utils.escapeHTML(error.message)}</p>
            <button onclick="EventsPage.loadEvents()" class="btn btn-secondary btn-sm" style="margin-top:12px;">Retry Scan</button>
          </div>
        `;
      }
    }
  },

  renderEvents() {
    const listContainer = document.getElementById('events-list-container');
    if (!listContainer) return;

    if (this.state.events.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state glass-card">
          <div style="font-size: 2rem; margin-bottom: 8px;">📡</div>
          <h3>No events found on the radar</h3>
          <p>Try adjusting your search criteria or category filters.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.state.events.map(event => {
      const dateParts = window.Utils.getDateParts(event.date);
      const isBookmarked = window.Utils.isBookmarked(event._id);
      const highlightBadge = event.isHighlight ? `<span class="badge badge-highlight">⚡ Campus Highlight</span>` : '';
      const deadlineInfo = window.Utils.getDeadlineBadge(event.registrationDeadline);
      const deadlineBadge = deadlineInfo ? `<span class="badge ${deadlineInfo.class}">${deadlineInfo.text}</span>` : '';

      const categoriesBadges = (event.categories || []).map(c => `<span class="badge badge-tag">${c}</span>`).join(' ');

      return `
        <div class="event-card-item glass-card ${event.isHighlight ? 'highlight-glow' : ''}">
          <div class="event-date-badge">
            <div class="event-date-day">${dateParts.day}</div>
            <div class="event-date-month">${dateParts.month}</div>
          </div>

          <div class="event-details-col">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              ${highlightBadge}
              ${categoriesBadges}
              ${deadlineBadge}
            </div>

            <h3 style="font-size: 1.15rem; margin-top:4px;">
              <a href="/event-details.html?id=${event._id}">${window.Utils.escapeHTML(event.title)}</a>
            </h3>

            <div class="event-meta-info">
              <span>📍 ${window.Utils.escapeHTML(event.venue)}</span>
              <span>⏰ ${event.startTime || '10:00 AM'}</span>
              <span>👤 ${window.Utils.escapeHTML(event.organizer)}</span>
            </div>
          </div>

          <div class="event-action-col">
            <button onclick="EventsPage.toggleBookmark('${event._id}')" class="btn btn-secondary btn-sm" title="Save Event">
              ${isBookmarked ? '★ Saved' : '☆ Save'}
            </button>
            <a href="/event-details.html?id=${event._id}" class="btn btn-primary btn-sm">View Details</a>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleBookmark(eventId) {
    const eventObj = this.state.events.find(e => e._id === eventId);
    if (!eventObj) return;

    const isSaved = window.Utils.toggleBookmark(eventObj);
    window.Main.showToast(isSaved ? 'Event bookmarked!' : 'Bookmark removed.', isSaved ? 'success' : 'info');
    this.renderEvents();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('events-page-identifier')) {
    EventsPage.init();
  }
});

window.EventsPage = EventsPage;
