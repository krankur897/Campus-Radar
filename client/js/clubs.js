/* ==========================================================
   CAMPUSRADAR — CLUB DIRECTORY MODULE
   ========================================================== */

const ClubsPage = {
  state: {
    category: 'All',
    q: '',
    clubs: []
  },

  init() {
    this.bindEvents();
    this.loadClubs();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-clubs-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.state.q = e.target.value.trim();
          this.loadClubs();
        }, 250);
      });
    }

    const categoryTabs = document.querySelectorAll('.club-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.state.category = e.target.getAttribute('data-category') || 'All';
        this.loadClubs();
      });
    });
  },

  async loadClubs() {
    const gridContainer = document.getElementById('clubs-grid-container');

    if (gridContainer) {
      gridContainer.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1;">
          <div style="font-size:1.1rem; color:var(--accent-primary); margin-bottom:8px;">Scanning student organizations...</div>
          <p>Loading active technical and cultural campus clubs</p>
        </div>
      `;
    }

    try {
      const data = await window.API.getClubs({
        category: this.state.category,
        q: this.state.q
      });

      this.state.clubs = data.clubs || [];
      this.renderClubs();
    } catch (error) {
      if (gridContainer) {
        gridContainer.innerHTML = `
          <div class="empty-state glass-card" style="grid-column: 1/-1;">
            <h3>We couldn't load club directory</h3>
            <p>${window.Utils.escapeHTML(error.message)}</p>
          </div>
        `;
      }
    }
  },

  renderClubs() {
    const gridContainer = document.getElementById('clubs-grid-container');
    if (!gridContainer) return;

    if (this.state.clubs.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state glass-card" style="grid-column: 1/-1;">
          <h3>No clubs found</h3>
          <p>Try searching for another club name or domain.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = this.state.clubs.map(c => {
      const activeEventBadge = c.activeEventCount > 0 
        ? `<span class="badge badge-highlight">⚡ ${c.activeEventCount} Active Event${c.activeEventCount > 1 ? 's' : ''}</span>`
        : `<span class="badge badge-tag">0 Active Events</span>`;

      return `
        <div class="glass-card" style="padding: var(--space-md); display:flex; flex-direction:column; justify-content:space-between; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px;">
              <img src="${c.logoUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80'}" alt="${window.Utils.escapeHTML(c.name)}" style="width:52px; height:52px; border-radius:12px; object-fit:cover; border:1px solid var(--border-primary);">
              <div>
                <span class="badge badge-tag" style="margin-bottom:4px;">${c.category}</span>
                <h3 style="font-size: 1.18rem; color: var(--text-primary);">${window.Utils.escapeHTML(c.name)}</h3>
              </div>
            </div>

            <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 14px;">
              ${window.Utils.escapeHTML(c.description)}
            </p>

            <div class="info-panel" style="display:flex; flex-direction:column; gap:6px;">
              <div><strong>President:</strong> ${window.Utils.escapeHTML(c.presidentName)}</div>
              <div><strong>Faculty In-Charge:</strong> ${window.Utils.escapeHTML(c.facultyInCharge)}</div>
              <div><strong>Contact:</strong> ${window.Utils.escapeHTML(c.contactEmail)}</div>
            </div>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; margin-top: auto; padding-top:12px; border-top:1px solid var(--border-primary);">
            ${activeEventBadge}
            <a href="/events.html?q=${encodeURIComponent(c.name)}" class="btn btn-secondary btn-sm">
              View Club Events ↗
            </a>
          </div>
        </div>
      `;
    }).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('clubs-page-identifier')) {
    ClubsPage.init();
  }
});

window.ClubsPage = ClubsPage;
