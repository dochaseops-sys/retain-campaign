/**
 * Retain Social Growth Challenge - Campaign Overview Page Coordinator
 * Manages rendering of campaign rules, scoring, prizes, leaderboard, and countdown.
 */

import { store } from './store.js';
import { renderHero } from './components/hero.js';
import { renderHowItWorks } from './components/howItWorks.js';
import { renderPrizesSection } from './components/prizesSection.js';
import { renderScoringSection } from './components/scoringSection.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { renderRulesAccordion } from './components/rulesAccordion.js';

// Global Toast Manager
window.showToast = function(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-slate-900 border-slate-800 text-white',
    error: 'bg-rose-900 border-rose-800 text-white',
    info: 'bg-slate-900 border-slate-800 text-white',
    warning: 'bg-amber-900 border-amber-800 text-white'
  };

  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    info: 'info',
    warning: 'alert-triangle'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-bold animate-slide-up ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 text-rose-400 flex-shrink-0"></i>
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

function renderWinnerBanner() {
  const container = document.getElementById('winner-celebration-banner');
  if (!container) return;

  const state = store.getState();
  if (state.settings.winnerPublished && state.settings.winnerDetails?.winner) {
    const winner = state.settings.winnerDetails.winner;
    container.classList.remove('hidden');
    container.className = 'w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-rose-500 to-orange-500 text-white shadow-xl border-b border-white/20 relative z-50 animate-slide-up';
    container.innerHTML = `
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-white text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
            <i data-lucide="crown" class="w-5 h-5 text-amber-500"></i>
          </div>
          <div>
            <span class="text-xs font-black uppercase tracking-wider block">OFFICIAL CAMPAIGN WINNER FINALIZED!</span>
            <p class="text-sm font-black">
              Congratulations <span class="underline decoration-white decoration-2">${winner.name}</span> (${winner.department}) &bull; Champion with ${winner.totalPoints} verified points!
            </p>
          </div>
        </div>
        <a href="#leaderboard-section" class="px-4 py-1.5 rounded-full bg-white text-slate-950 font-black text-xs hover:bg-slate-100 transition-all shadow-md flex-shrink-0">
          View Final Standings &rarr;
        </a>
      </div>
    `;
  } else {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
}

function renderAnnouncementBanner() {
  const container = document.getElementById('announcement-banner');
  if (!container) return;

  const state = store.getState();
  const ann = state.settings.announcement;

  if (!ann || !ann.enabled || !ann.message) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  const typeBg = {
    info: 'bg-slate-900 text-white border-slate-800',
    warning: 'bg-amber-500 text-slate-950 border-amber-400',
    success: 'bg-emerald-600 text-white border-emerald-500',
    urgent: 'bg-rose-600 text-white border-rose-500 animate-pulse'
  };

  container.className = `w-full py-2.5 px-4 text-xs font-bold flex items-center justify-between shadow-md border-b relative z-50 ${typeBg[ann.type] || typeBg.info}`;
  container.innerHTML = `
    <div class="max-w-7xl mx-auto flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <i data-lucide="bell" class="w-4 h-4"></i>
        <span>${ann.message}</span>
      </div>
      <button onclick="document.getElementById('announcement-banner').classList.add('hidden')" class="opacity-70 hover:opacity-100 text-xs">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `;
}

function renderCampaignPage() {
  renderWinnerBanner();
  renderAnnouncementBanner();
  renderHero();
  renderHowItWorks();
  renderPrizesSection();
  renderScoringSection();
  renderLeaderboard();
  renderRulesAccordion();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // Mobile drawer toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
    });

    mobileDrawer.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
      });
    });
  }

  store.subscribe(() => {
    renderCampaignPage();
  });

  renderCampaignPage();
});
