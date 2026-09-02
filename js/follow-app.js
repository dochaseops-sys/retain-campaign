/**
 * Retain - Standalone External Follow & Confirmation Page Coordinator
 * For contacts and external followers only (no internal campaign or admin links).
 */

import { store } from './store.js';
import { renderSocialCards } from './components/socialCards.js';
import { renderReferralForm } from './components/referralForm.js';

// Toast Manager
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

function renderFollowPage() {
  renderSocialCards();
  renderReferralForm();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  store.subscribe(() => {
    renderFollowPage();
  });

  const mobileBtn = document.getElementById('follow-mobile-menu-btn');
  const mobileDrawer = document.getElementById('follow-mobile-menu-drawer');
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
    });

    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
      });
    });
  }

  renderFollowPage();
});
