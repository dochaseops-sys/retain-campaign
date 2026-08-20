/**
 * DoChase Social Growth Challenge - Public Follower Landing Page Coordinator
 */

import { store } from './store.js';
import { renderHero } from './components/hero.js';
import { renderHowItWorks } from './components/howItWorks.js';
import { renderSocialCards } from './components/socialCards.js';
import { renderScoringSection } from './components/scoringSection.js';
import { renderReferralForm } from './components/referralForm.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { renderTimeline } from './components/timeline.js';
import { renderRulesAccordion } from './components/rulesAccordion.js';

// Global Toast Manager
window.showToast = function(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-100',
    info: 'bg-slate-900/90 border-sky-500/50 text-sky-100',
    warning: 'bg-amber-950/90 border-amber-500/50 text-amber-100'
  };

  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    info: 'info',
    warning: 'alert-triangle'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-semibold animate-slide-up ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

function renderAnnouncementBanner() {
  const banner = document.getElementById('pinned-announcement-banner');
  if (!banner) return;

  const state = store.getState();
  const ann = state.settings.announcement;

  if (ann && ann.enabled && ann.message) {
    banner.classList.remove('hidden');
    const msgEl = document.getElementById('announcement-message-text');
    if (msgEl) msgEl.innerText = ann.message;
  } else {
    banner.classList.add('hidden');
  }
}

function renderWinnerBanner() {
  const banner = document.getElementById('winner-celebration-banner');
  if (!banner) return;

  const state = store.getState();
  if (state.settings.winnerPublished && state.settings.winnerDetails) {
    banner.classList.remove('hidden');
    const details = state.settings.winnerDetails;
    const nameEl = document.getElementById('winner-name-text');
    const pointsEl = document.getElementById('winner-points-text');
    const deptEl = document.getElementById('winner-dept-text');

    if (nameEl) nameEl.innerText = details.winner.name;
    if (pointsEl) pointsEl.innerText = `${details.winner.totalPoints} points (${details.winner.verifiedFollowerCount} verified followers)`;
    if (deptEl) deptEl.innerText = details.winner.department;
  } else {
    banner.classList.add('hidden');
  }
}

function renderPublicPage() {
  renderAnnouncementBanner();
  renderWinnerBanner();
  renderHero();
  renderHowItWorks();
  renderSocialCards();
  renderScoringSection();
  renderReferralForm();
  renderLeaderboard();
  renderTimeline();
  renderRulesAccordion();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  store.subscribe(() => {
    renderPublicPage();
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
    });
  }

  renderPublicPage();
});
