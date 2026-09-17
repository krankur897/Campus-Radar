/* ==========================================================
   CAMPUSRADAR — UTILITY & HELPERS
   ========================================================== */

const Utils = {
  // Format YYYY-MM-DD or ISO string to readable format e.g. "Oct 24, 2026"
  formatDate(dateString) {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  // Extract Day and Month for date badge e.g. { day: '24', month: 'OCT' }
  getDateParts(dateString) {
    if (!dateString) return { day: '--', month: 'TBD' };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { day: '--', month: 'TBD' };
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    };
  },

  // Calculate deadline status text (e.g., "Deadline Today", "Closing Soon (2 Days)", "Closed")
  getDeadlineBadge(deadlineString) {
    if (!deadlineString) return null;
    const deadline = new Date(deadlineString);
    if (isNaN(deadline.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Closed', class: 'badge-tag' };
    } else if (diffDays === 0) {
      return { text: 'Deadline Today', class: 'badge-urgent' };
    } else if (diffDays <= 3) {
      return { text: `Closing Soon (${diffDays}d)`, class: 'badge-deadline' };
    } else {
      return { text: `${diffDays} days left`, class: 'badge-tag' };
    }
  },

  // Safe HTML string escaping
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // LocalStorage Bookmark Manager for Students
  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem('campusradar_bookmarks') || '[]');
    } catch (e) {
      return [];
    }
  },

  isBookmarked(eventId) {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.id === eventId || b._id === eventId);
  },

  toggleBookmark(eventObj) {
    let bookmarks = this.getBookmarks();
    const id = eventObj.id || eventObj._id;
    const index = bookmarks.findIndex(b => (b.id || b._id) === id);

    if (index > -1) {
      bookmarks.splice(index, 1);
      localStorage.setItem('campusradar_bookmarks', JSON.stringify(bookmarks));
      return false; // Removed
    } else {
      bookmarks.push({
        _id: id,
        id: id,
        title: eventObj.title,
        date: eventObj.date,
        venue: eventObj.venue,
        categories: eventObj.categories,
        organizer: eventObj.organizer
      });
      localStorage.setItem('campusradar_bookmarks', JSON.stringify(bookmarks));
      return true; // Added
    }
  }
};

window.Utils = Utils;
