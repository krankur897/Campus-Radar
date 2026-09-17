/* ==========================================================
   CAMPUSRADAR — INTERACTIVE RADAR WIDGET ENGINE
   Whole-radar container hover expansion, scale(1) subtle dots,
   compact 190px information cards, keyboard & mobile touch support.
   ========================================================== */

const RadarWidget = {
  activeBlip: null,
  popupElement: null,
  heroContainer: null,
  widgetElement: null,
  blipDataMap: new Map(),

  init() {
    const heroContainer = document.querySelector('.hero-visual');
    const widget = document.querySelector('.radar-widget');
    if (!widget || !heroContainer) return;

    this.heroContainer = heroContainer;
    this.widgetElement = widget;

    this.bindWidgetHover(widget);
    this.createPopupElement(heroContainer);
    this.bindBlips(widget);
    this.bindLiveData();
  },

  /* Whole-radar container hover listener */
  bindWidgetHover(widget) {
    widget.addEventListener('mouseenter', () => {
      widget.classList.add('is-hovered');
    });

    widget.addEventListener('mouseleave', (e) => {
      if (e.relatedTarget && this.popupElement && this.popupElement.contains(e.relatedTarget)) return;
      widget.classList.remove('is-hovered');
    });
  },

  createPopupElement(container) {
    let popup = document.getElementById('radar-info-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'radar-info-popup';
      popup.className = 'radar-info-card';
      popup.setAttribute('role', 'tooltip');
      popup.setAttribute('aria-hidden', 'true');
      container.appendChild(popup);
    }
    this.popupElement = popup;

    popup.addEventListener('mouseenter', () => {
      if (this.activeBlip && this.popupElement) {
        this.popupElement.classList.add('active');
        if (this.widgetElement) this.widgetElement.classList.add('is-hovered');
      }
    });

    popup.addEventListener('mouseleave', () => {
      this.hideCard();
      if (this.widgetElement) this.widgetElement.classList.remove('is-hovered');
    });
  },

  setFallbackData(blip, index) {
    const fallbacks = [
      {
        id: 'event-1',
        category: 'EVENT',
        categoryIcon: '📅',
        type: 'event',
        title: 'National Tech Summit',
        date: 'Sep 22 • 10:00 AM',
        location: 'CS Hall B',
        badgeStyle: 'background:rgba(59, 130, 246, 0.15); color:#3B82F6;',
        link: '/events.html'
      },
      {
        id: 'placement-1',
        category: 'PLACEMENT',
        categoryIcon: '💼',
        type: 'placement',
        title: 'Google Hiring Drive',
        date: 'Sep 27 • Placement Cell',
        location: 'Bengaluru / Hybrid',
        badgeStyle: 'background:rgba(16, 185, 129, 0.15); color:#10B981;',
        link: '/placements.html'
      },
      {
        id: 'notice-1',
        category: 'ANNOUNCEMENT',
        categoryIcon: '📢',
        type: 'notice',
        title: 'Mid-Sem Exam Schedule',
        date: 'Posted Today • Exam Cell',
        location: 'Main Block',
        badgeStyle: 'background:rgba(245, 158, 11, 0.15); color:#F59E0B;',
        link: '/announcements.html'
      },
      {
        id: 'club-1',
        category: 'CAMPUS CLUB',
        categoryIcon: '🎭',
        type: 'club',
        title: 'Resonance Auditions',
        date: 'Sep 25 • 05:30 PM',
        location: 'Open Air Theatre',
        badgeStyle: 'background:rgba(139, 92, 246, 0.15); color:#8B5CF6;',
        link: '/clubs.html'
      }
    ];

    const data = fallbacks[index % fallbacks.length];
    this.blipDataMap.set(blip, data);
    blip.setAttribute('aria-label', `${data.category}: ${data.title}`);
  },

  bindBlips(widget) {
    const blips = widget.querySelectorAll('.radar-blip');

    blips.forEach((blip, index) => {
      blip.setAttribute('tabindex', '0');
      blip.setAttribute('role', 'button');
      blip.setAttribute('aria-haspopup', 'true');
      blip.setAttribute('aria-expanded', 'false');

      this.setFallbackData(blip, index);

      const triggerShow = () => this.showCard(blip);
      const triggerHide = (e) => {
        if (e && e.relatedTarget && this.popupElement && this.popupElement.contains(e.relatedTarget)) return;
        this.hideCard(blip);
      };

      // Pointer & Mouse Events
      blip.addEventListener('mouseenter', triggerShow);
      blip.addEventListener('mouseover', triggerShow);
      blip.addEventListener('pointerenter', triggerShow);

      blip.addEventListener('mouseleave', triggerHide);
      blip.addEventListener('pointerleave', triggerHide);

      // Keyboard Focus
      blip.addEventListener('focus', triggerShow);
      blip.addEventListener('blur', triggerHide);

      // Click / Touch Navigation
      blip.addEventListener('click', (e) => {
        const isMobile = window.innerWidth <= 768;
        const data = this.blipDataMap.get(blip);
        if (isMobile && this.activeBlip !== blip) {
          e.preventDefault();
          this.showCard(blip);
        } else if (data && data.link) {
          window.location.href = data.link;
        }
      });

      blip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const data = this.blipDataMap.get(blip);
          if (data && data.link) {
            window.location.href = data.link;
          }
        }
      });
    });
  },

  showCard(blip) {
    if (!this.popupElement || !this.heroContainer) return;
    const data = this.blipDataMap.get(blip);
    if (!data) return;

    if (this.activeBlip && this.activeBlip !== blip) {
      this.activeBlip.classList.remove('active');
      this.activeBlip.setAttribute('aria-expanded', 'false');
    }

    this.activeBlip = blip;
    blip.classList.add('active');
    blip.setAttribute('aria-expanded', 'true');

    const escape = (str) => (window.Utils ? window.Utils.escapeHTML(str) : str || '');

    // Populate Compact Preview Card
    this.popupElement.innerHTML = `
      <div class="radar-card-header">
        <span class="radar-card-category" style="${data.badgeStyle}">
          ${data.categoryIcon} ${escape(data.category)}
        </span>
      </div>
      <div class="radar-card-title">${escape(data.title)}</div>
      <div class="radar-card-meta-line">
        <span>📅 ${escape(data.date)}</span>
        <a href="${data.link || '/events.html'}" class="radar-card-action">View →</a>
      </div>
    `;

    // Viewport-aware BoundingRect Positioning
    const containerRect = this.heroContainer.getBoundingClientRect();
    const blipRect = blip.getBoundingClientRect();

    const blipX = blipRect.left - containerRect.left + blipRect.width / 2;
    const blipY = blipRect.top - containerRect.top + blipRect.height / 2;

    const popupWidth = 190;
    const popupHeight = 85;

    let posX, posY;

    if (blipX > containerRect.width * 0.5) {
      posX = blipX - popupWidth - 12;
    } else {
      posX = blipX + 16;
    }

    if (blipY > containerRect.height * 0.5) {
      posY = blipY - popupHeight + 10;
    } else {
      posY = blipY - 10;
    }

    posX = Math.max(10, Math.min(posX, containerRect.width - popupWidth - 10));
    posY = Math.max(10, Math.min(posY, containerRect.height - popupHeight - 10));

    this.popupElement.style.left = `${posX}px`;
    this.popupElement.style.top = `${posY}px`;

    this.popupElement.classList.add('active');
    this.popupElement.setAttribute('aria-hidden', 'false');
  },

  hideCard(blipTarget) {
    const target = blipTarget || this.activeBlip;
    if (target) {
      target.classList.remove('active');
      target.setAttribute('aria-expanded', 'false');
    }

    if (target === this.activeBlip || !blipTarget) {
      this.activeBlip = null;
      if (this.popupElement) {
        this.popupElement.classList.remove('active');
        this.popupElement.setAttribute('aria-hidden', 'true');
      }
    }
  },

  async bindLiveData() {
    if (!window.API) return;
    try {
      const [eventsRes, placementsRes, noticesRes, clubsRes] = await Promise.allSettled([
        window.API.getEvents ? window.API.getEvents({ limit: 1 }) : Promise.reject(),
        window.API.getPlacements ? window.API.getPlacements({ limit: 1 }) : Promise.reject(),
        window.API.getAnnouncements ? window.API.getAnnouncements({ limit: 1 }) : Promise.reject(),
        window.API.getClubs ? window.API.getClubs({ limit: 1 }) : Promise.reject()
      ]);

      const blips = document.querySelectorAll('.radar-blip');
      if (blips.length === 0) return;

      // Event Blip (#0)
      if (eventsRes.status === 'fulfilled' && eventsRes.value?.events?.length > 0 && blips[0]) {
        const ev = eventsRes.value.events[0];
        const data = this.blipDataMap.get(blips[0]);
        if (data) {
          data.title = ev.title;
          data.date = `${window.Utils ? window.Utils.formatDate(ev.date) : ev.date} • ${ev.startTime || '10:00 AM'}`;
          data.location = ev.venue || data.location;
          data.link = `/event-details.html?id=${ev._id}`;
        }
      }

      // Placement Blip (#1)
      if (placementsRes.status === 'fulfilled' && placementsRes.value?.placements?.length > 0 && blips[1]) {
        const pl = placementsRes.value.placements[0];
        const data = this.blipDataMap.get(blips[1]);
        if (data) {
          const compName = pl.companyName || pl.company || pl.title || 'Google';
          data.title = `${compName} Drive`;
          data.date = `Deadline: ${window.Utils && pl.deadline ? window.Utils.formatDate(pl.deadline) : 'Sep 27'}`;
          data.link = '/placements.html';
        }
      }

      // Announcement Blip (#2)
      if (noticesRes.status === 'fulfilled' && noticesRes.value?.announcements?.length > 0 && blips[2]) {
        const an = noticesRes.value.announcements[0];
        const data = this.blipDataMap.get(blips[2]);
        if (data) {
          data.title = an.title;
          data.date = `Posted: ${window.Utils ? window.Utils.formatDate(an.createdAt) : 'Today'}`;
          data.link = '/announcements.html';
        }
      }

      // Club Blip (#3)
      if (clubsRes.status === 'fulfilled' && clubsRes.value?.clubs?.length > 0 && blips[3]) {
        const cl = clubsRes.value.clubs[0];
        const data = this.blipDataMap.get(blips[3]);
        if (data) {
          data.title = `${cl.name} Auditions`;
          data.date = 'Sep 25 • 05:30 PM';
          data.link = '/clubs.html';
        }
      }
    } catch (err) {
      console.warn('Radar live data sync fallback active:', err);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  RadarWidget.init();
});

window.RadarWidget = RadarWidget;
