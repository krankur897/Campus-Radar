/* ==========================================================
   CAMPUSRADAR — EVENT DETAILS PAGE MODULE
   ========================================================== */

const EventDetailsPage = {
  event: null,

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
      this.renderError('No event specified.');
      return;
    }

    try {
      this.event = await window.API.getEventById(id);
      this.render();
    } catch (error) {
      this.renderError('Event not found or failed to load.');
    }
  },

  render() {
    const container = document.getElementById('event-details-container');
    if (!container || !this.event) return;

    const e = this.event;
    const isSaved = window.Utils.isBookmarked(e._id);
    const deadlineInfo = window.Utils.getDeadlineBadge(e.registrationDeadline);
    const deadlineBadge = deadlineInfo ? `<span class="badge ${deadlineInfo.class}">${deadlineInfo.text}</span>` : '';
    const highlightBadge = e.isHighlight ? `<span class="badge badge-highlight">⚡ Campus Highlight</span>` : '';

    container.innerHTML = `
      <div class="event-details-hero">
        <img src="${e.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}" alt="${window.Utils.escapeHTML(e.title)} Poster">
        <div class="event-details-overlay">
          <div>
            <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
              ${highlightBadge}
              ${(e.categories || []).map(c => `<span class="badge badge-tag">${c}</span>`).join(' ')}
              ${deadlineBadge}
            </div>
            <h1 style="font-size:2.25rem;">${window.Utils.escapeHTML(e.title)}</h1>
          </div>
        </div>
      </div>

      <div class="event-details-grid">
        <div class="glass-card" style="padding: var(--space-lg);">
          <h3 style="margin-bottom: 12px;">About This Event</h3>
          <p style="white-space: pre-line; margin-bottom: var(--space-lg); font-size: 1.05rem;">
            ${window.Utils.escapeHTML(e.description)}
          </p>

          <h3 style="margin-bottom: 10px;">Eligibility Criteria</h3>
          <p style="margin-bottom: var(--space-lg);">${window.Utils.escapeHTML(e.eligibility || 'Open to all college students')}</p>

          <h3 style="margin-bottom: 10px;">Rules & Guidelines</h3>
          <p style="margin-bottom: var(--space-lg);">${window.Utils.escapeHTML(e.rules || 'Standard campus conduct guidelines apply.')}</p>

          <h3 style="margin-bottom: 10px;">Organizer Contact</h3>
          <p style="color: var(--accent-primary); font-weight:600;">${window.Utils.escapeHTML(e.contact || 'events@campusradar.edu')}</p>
        </div>

        <div style="display:flex; flex-direction:column; gap:var(--space-md);">
          <div class="glass-card" style="padding: var(--space-md);">
            <h3 style="font-size: 1.1rem; margin-bottom: 14px;">Event Details</h3>

            <div style="display:flex; flex-direction:column; gap:12px; font-size:0.95rem; color:var(--text-muted);">
              <div><strong>📅 Date:</strong> ${window.Utils.formatDate(e.date)}</div>
              <div><strong>⏰ Time:</strong> ${e.startTime} - ${e.endTime}</div>
              <div><strong>📍 Venue:</strong> ${window.Utils.escapeHTML(e.venue)}</div>
              <div><strong>👤 Organizer:</strong> ${window.Utils.escapeHTML(e.organizer)}</div>
              <div><strong>⏳ Registration Deadline:</strong> ${window.Utils.formatDate(e.registrationDeadline)}</div>
            </div>

            <div style="margin-top: 24px; display:flex; flex-direction:column; gap:10px;">
              <a href="${e.registrationUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width:100%; text-align:center;">
                REGISTER NOW ↗
              </a>
              <button onclick="EventDetailsPage.toggleBookmark()" class="btn btn-secondary" style="width:100%;">
                ${isSaved ? '★ Saved to Bookmarks' : '☆ Bookmark Event'}
              </button>
            </div>

            <p style="font-size:0.75rem; color:var(--text-dim); text-align:center; margin-top:12px;">
              External registration opens official link in a new tab.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  toggleBookmark() {
    if (!this.event) return;
    const isSaved = window.Utils.toggleBookmark(this.event);
    window.Main.showToast(isSaved ? 'Event saved to bookmarks!' : 'Event removed from bookmarks.', isSaved ? 'success' : 'info');
    this.render();
  },

  renderError(msg) {
    const container = document.getElementById('event-details-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state glass-card">
          <h3>${msg}</h3>
          <a href="/events.html" class="btn btn-primary" style="margin-top:16px;">Back to Events</a>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('event-details-page-identifier')) {
    EventDetailsPage.init();
  }
});

window.EventDetailsPage = EventDetailsPage;
