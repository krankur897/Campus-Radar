/* ==========================================================
   CAMPUSRADAR — PLACEMENT HUB MODULE
   ========================================================== */

const PlacementsPage = {
  state: {
    type: 'All',
    branch: 'All',
    minCGPA: '',
    q: '',
    placements: []
  },

  init() {
    this.bindEvents();
    this.loadPlacements();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-placements-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.state.q = e.target.value.trim();
          this.loadPlacements();
        }, 250);
      });
    }

    const typePills = document.querySelectorAll('.type-pill');
    typePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        typePills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.state.type = e.target.getAttribute('data-type') || 'All';
        this.loadPlacements();
      });
    });

    const branchSelect = document.getElementById('branch-select');
    if (branchSelect) {
      branchSelect.addEventListener('change', (e) => {
        this.state.branch = e.target.value;
        this.loadPlacements();
      });
    }
  },

  async loadPlacements() {
    const gridContainer = document.getElementById('placements-grid-container');
    const countContainer = document.getElementById('placements-count');

    if (gridContainer) {
      gridContainer.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1;">
          <div style="font-size:1.1rem; color:var(--accent-primary); margin-bottom:8px;">Scanning career opportunities...</div>
          <p>Fetching placement drives and internship openings</p>
        </div>
      `;
    }

    try {
      const data = await window.API.getPlacements({
        type: this.state.type,
        branch: this.state.branch,
        minCGPA: this.state.minCGPA,
        q: this.state.q
      });

      this.state.placements = data.placements || [];

      if (countContainer) {
        countContainer.textContent = `${this.state.placements.length} opportunit${this.state.placements.length === 1 ? 'y' : 'ies'} found`;
      }

      this.renderPlacements();
    } catch (error) {
      if (gridContainer) {
        gridContainer.innerHTML = `
          <div class="empty-state glass-card" style="grid-column: 1/-1;">
            <h3>No placement opportunities found</h3>
            <p>${window.Utils.escapeHTML(error.message)}</p>
          </div>
        `;
      }
    }
  },

  renderPlacements() {
    const gridContainer = document.getElementById('placements-grid-container');
    if (!gridContainer) return;

    if (this.state.placements.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state glass-card" style="grid-column: 1/-1;">
          <h3>No current opportunities available</h3>
          <p>Try adjusting your branch or opportunity type filters.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = this.state.placements.map(p => {
      const deadlineInfo = window.Utils.getDeadlineBadge(p.deadline);
      const deadlineBadge = deadlineInfo ? `<span class="badge ${deadlineInfo.class}">${deadlineInfo.text}</span>` : '';
      const branchesStr = (p.eligibleBranches || []).join(', ');

      return `
        <div class="placement-card glass-card">
          <div>
            <div class="placement-company-header">
              <div>
                <span class="badge badge-tag" style="margin-bottom:6px;">${p.type}</span>
                <h3 style="font-size: 1.25rem;">${window.Utils.escapeHTML(p.company)}</h3>
                <div style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500; margin-top:2px;">
                  ${window.Utils.escapeHTML(p.role)}
                </div>
              </div>
              <div class="placement-ctc">${window.Utils.escapeHTML(p.compensation)}</div>
            </div>

            <p style="font-size: 0.9rem; margin: 12px 0; color: var(--text-secondary); line-height: 1.55;">
              ${window.Utils.escapeHTML(p.description)}
            </p>

            <div class="info-panel" style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
              <div><strong>Eligible Branches:</strong> ${window.Utils.escapeHTML(branchesStr)}</div>
              <div><strong>Batch:</strong> ${window.Utils.escapeHTML(p.eligibleYear)} | <strong>Min CGPA:</strong> ${p.minCGPA}</div>
              <div><strong>Backlog Rule:</strong> ${window.Utils.escapeHTML(p.backlogRule)}</div>
              <div><strong>Location:</strong> ${window.Utils.escapeHTML(p.location)}</div>
              <div><strong>Drive Date:</strong> ${window.Utils.formatDate(p.driveDate)}</div>
            </div>

            <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:12px;">
              <strong style="color:var(--text-primary);">Selection Process:</strong> ${window.Utils.escapeHTML(p.selectionProcess)}
            </div>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top: auto; padding-top:12px; border-top:1px solid var(--border-primary);">
            ${deadlineBadge}
            <a href="${p.applicationUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              APPLY NOW ↗
            </a>
          </div>
        </div>
      `;
    }).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('placements-page-identifier')) {
    PlacementsPage.init();
  }
});

window.PlacementsPage = PlacementsPage;
