/* ==========================================================
   CAMPUSRADAR — GLOBAL UI & APPLICATION INITIALIZER
   ========================================================== */

const Main = {
  init() {
    this.initTheme();
    this.renderNavbar();
    this.renderFooter();
    this.highlightActivePage();
    this.initMobileNav();
    this.initScrollReveal();
  },

  /* ── Theme Switcher UX (Dark / Light / System) ── */
  initTheme() {
    const saved = localStorage.getItem('campusradar-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    // Listen for OS system theme changes if no manual preference saved
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('campusradar-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    });
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('campusradar-theme', next);

    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
      btn.title = next === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btn.setAttribute('aria-label', next === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
  },

  renderNavbar() {
    const navElement = document.getElementById('main-navbar');
    if (!navElement) return;

    const user = window.Auth ? window.Auth.getUser() : null;
    const isLoggedIn = !!user;
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    let authButtonsHtml = '';
    if (isLoggedIn) {
      const dashboardLink = user.role === 'Student' ? '/dashboard.html' : '/admin.html';
      authButtonsHtml = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <a href="${dashboardLink}" class="btn btn-secondary btn-sm">
            <span style="width:7px; height:7px; border-radius:50%; background:var(--status-success); display:inline-block;"></span>
            ${user.name.split(' ')[0]} (${user.role})
          </a>
          <button onclick="window.Auth.logout()" class="btn btn-outline btn-sm">Logout</button>
        </div>
      `;
    } else {
      authButtonsHtml = `
        <a href="/login.html" class="btn btn-primary btn-sm">Sign In / Register</a>
      `;
    }

    navElement.innerHTML = `
      <div class="container navbar-container">
        <a href="/index.html" class="brand-logo">
          <img src="/assets/logo.png" alt="CampusRadar Logo" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\' fill=\\'%234F7CDB\\'><circle cx=\\'50\\' cy=\\'50\\' r=\\'40\\' stroke=\\'%234F7CDB\\' stroke-width=\\'8\\' fill=\\'none\\'/><line x1=\\'50\\' y1=\\'50\\' x2=\\'80\\' y2=\\'20\\' stroke=\\'%234F7CDB\\' stroke-width=\\'8\\'/></svg>';">
          Campus<span class="brand-accent">Radar</span>
        </a>

        <ul class="nav-links" id="nav-menu">
          <li><a href="/index.html" class="nav-link">Home</a></li>
          <li><a href="/events.html" class="nav-link">Events</a></li>
          <li><a href="/placements.html" class="nav-link">Placement Hub</a></li>
          <li><a href="/announcements.html" class="nav-link">Announcements</a></li>
          <li><a href="/clubs.html" class="nav-link">Clubs</a></li>
          <li><a href="/past-events.html" class="nav-link">Past Events</a></li>
        </ul>

        <div class="nav-actions">
          <button class="theme-toggle" id="theme-toggle-btn"
                  onclick="Main.toggleTheme()"
                  title="${currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
            ${currentTheme === 'dark' ? '☀️' : '🌙'}
          </button>
          ${authButtonsHtml}
          <button class="mobile-toggle btn btn-secondary btn-sm" id="mobile-nav-toggle" style="display:none;">☰</button>
        </div>
      </div>
    `;
  },

  renderFooter() {
    const footerElement = document.getElementById('main-footer');
    if (!footerElement) return;

    footerElement.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="brand-logo" style="margin-bottom: 12px;">
              Campus<span class="brand-accent">Radar</span>
            </div>
            <p style="font-size: 0.88rem; max-width: 300px;">
              "Everything Happening on Campus, In One Place."
            </p>
            <div style="margin-top: 14px; font-size: 0.8rem; color: var(--text-muted);">
              <span class="badge badge-highlight" style="font-size: 0.7rem;">Academic Exhibition Prototype</span>
            </div>
          </div>

          <div>
            <h4 style="margin-bottom: 14px; font-size: 0.93rem;">Discovery Hubs</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.87rem;">
              <li><a href="/events.html">Campus Events</a></li>
              <li><a href="/placements.html">Placement Hub</a></li>
              <li><a href="/announcements.html">Notice Board</a></li>
              <li><a href="/clubs.html">Club Directory</a></li>
              <li><a href="/past-events.html">Past Archives</a></li>
            </ul>
          </div>

          <div>
            <h4 style="margin-bottom: 14px; font-size: 0.93rem;">Exhibition Roles</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.87rem;">
              <li><a href="#" onclick="window.Auth.loginAsDemoAccount('student'); return false;">Student View</a></li>
              <li><a href="#" onclick="window.Auth.loginAsDemoAccount('club'); return false;">Club President</a></li>
              <li><a href="#" onclick="window.Auth.loginAsDemoAccount('placement'); return false;">Placement Head</a></li>
              <li><a href="#" onclick="window.Auth.loginAsDemoAccount('faculty'); return false;">Faculty In-Charge</a></li>
              <li><a href="#" onclick="window.Auth.loginAsDemoAccount('admin'); return false;">Super Admin</a></li>
            </ul>
          </div>

          <div>
            <h4 style="margin-bottom: 14px; font-size: 0.93rem;">Prototype Disclaimer</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
              Verified institutional authentication and VTOP/ERP synchronization can be integrated in production.
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          <div>© 2026 CampusRadar Prototype Development Team. All rights reserved.</div>
          <div>Your Campus. One Radar.</div>
        </div>
      </div>
    `;
  },

  highlightActivePage() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path === '/' && href === '/index.html')) {
        link.classList.add('active');
      }
    });
  },

  initMobileNav() {
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', () => {
        menu.classList.toggle('mobile-open');
      });
    }
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${window.Utils ? window.Utils.escapeHTML(message) : message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  /* ── Motion System: IntersectionObserver Scroll Reveal ── */
  initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('scroll-reveal-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    // Auto-attach scroll reveal to sections and main container features
    setTimeout(() => {
      const revealTargets = document.querySelectorAll('section, .feature-card, .event-card-item, .placement-card, .announcement-card');
      revealTargets.forEach(el => {
        if (!el.closest('.hero')) {
          el.classList.add('scroll-reveal');
          observer.observe(el);
        }
      });
    }, 100);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Main.init();
});

window.Main = Main;
