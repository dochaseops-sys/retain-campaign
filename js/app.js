/**
 * DoChase Social Growth Challenge - Main Application Coordinator
 */

import { store } from './store.js';
import { firebaseService } from './firebase-config.js';
import { renderHero } from './components/hero.js';
import { renderHowItWorks } from './components/howItWorks.js';
import { renderSocialCards } from './components/socialCards.js';
import { renderScoringSection } from './components/scoringSection.js';
import { renderEmployeeDashboard } from './components/employeeDashboard.js';
import { renderReferralForm } from './components/referralForm.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { renderTimeline } from './components/timeline.js';
import { renderSharingToolkit } from './components/sharingToolkit.js';
import { renderRulesAccordion } from './components/rulesAccordion.js';
import { renderAdminPortal } from './components/adminPortal.js';
import { renderAnalytics } from './components/analytics.js';

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

// Global Modals
window.openRegisterModal = function() {
  const modal = document.getElementById('register-employee-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeRegisterModal = function() {
  const modal = document.getElementById('register-employee-modal');
  if (modal) modal.classList.add('hidden');
};

let currentRejectSubmissionId = null;
window.openRejectModal = function(submissionId) {
  currentRejectSubmissionId = submissionId;
  const modal = document.getElementById('reject-submission-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeRejectModal = function() {
  currentRejectSubmissionId = null;
  const modal = document.getElementById('reject-submission-modal');
  if (modal) modal.classList.add('hidden');
};

window.openFirebaseModal = function() {
  const modal = document.getElementById('firebase-config-modal');
  if (modal) {
    const config = firebaseService.config || {};
    document.getElementById('fb-api-key').value = config.apiKey || '';
    document.getElementById('fb-project-id').value = config.projectId || '';
    document.getElementById('fb-auth-domain').value = config.authDomain || '';
    document.getElementById('fb-storage-bucket').value = config.storageBucket || '';
    document.getElementById('fb-app-id').value = config.appId || '';
    modal.classList.remove('hidden');
  }
};

window.closeFirebaseModal = function() {
  const modal = document.getElementById('firebase-config-modal');
  if (modal) modal.classList.add('hidden');
};

// Render All Components
function renderAll() {
  renderAnnouncementBanner();
  renderHero();
  renderHowItWorks();
  renderSocialCards();
  renderScoringSection();
  renderEmployeeDashboard();
  renderReferralForm();
  renderLeaderboard();
  renderTimeline();
  renderSharingToolkit();
  renderRulesAccordion();
  renderAdminPortal();
  renderAnalytics();
  renderWinnerBanner();
  updateRoleView();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Announcement Banner
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

// Winner Banner
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

// Role Switcher Management
function updateRoleView() {
  const state = store.getState();
  const role = state.currentRole;

  const roleBtns = document.querySelectorAll('.role-switcher-btn');
  roleBtns.forEach(btn => {
    const btnRole = btn.getAttribute('data-role');
    if (btnRole === role) {
      btn.className = 'role-switcher-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition-all';
    } else {
      btn.className = 'role-switcher-btn px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all';
    }
  });

  const empDashboardSection = document.getElementById('employee-dashboard-section');
  const sharingToolkitSection = document.getElementById('sharing-toolkit-section');
  const adminSection = document.getElementById('admin-portal-section');
  const analyticsSection = document.getElementById('analytics-section');

  // In 'public' role, hide admin portal to simulate external follower view
  if (role === 'public') {
    if (adminSection) adminSection.classList.add('hidden');
  } else if (role === 'employee') {
    if (adminSection) adminSection.classList.add('hidden');
  } else if (role === 'admin') {
    if (adminSection) adminSection.classList.remove('hidden');
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Subscribe to store updates
  store.subscribe(() => {
    renderAll();
  });

  // Role Switcher Listeners
  document.querySelectorAll('.role-switcher-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      store.setRole(role);
      if (role === 'employee') {
        document.getElementById('employee-dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (role === 'admin') {
        document.getElementById('admin-portal-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Custom event listener for role switching
  window.addEventListener('switch-role', (e) => {
    if (e.detail && e.detail.role) {
      store.setRole(e.detail.role);
    }
  });

  // Registration Modal Events
  const regForm = document.getElementById('modal-register-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modal-emp-name').value;
      const email = document.getElementById('modal-emp-email').value;
      const dept = document.getElementById('modal-emp-dept').value;

      try {
        const emp = store.registerEmployee(name, email, dept);
        regForm.reset();
        window.closeRegisterModal();
        store.setRole('employee');
        window.showToast(`Welcome ${emp.name}! Your referral code is ${emp.referralCode}`, 'success');
        document.getElementById('employee-dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // Reject Modal Events
  const rejectForm = document.getElementById('modal-reject-form');
  if (rejectForm) {
    rejectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const reasonSelect = document.getElementById('modal-reject-reason');
      const customReason = document.getElementById('modal-reject-custom');
      const reason = customReason.value.trim() || reasonSelect.value;

      if (!currentRejectSubmissionId) return;

      try {
        store.rejectSubmission(currentRejectSubmissionId, reason, 'Admin (Gbenga S.)');
        window.closeRejectModal();
        window.showToast('Submission marked as rejected with reason recorded.', 'warning');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // Firebase Config Modal Events
  const fbForm = document.getElementById('modal-firebase-form');
  if (fbForm) {
    fbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const apiKey = document.getElementById('fb-api-key').value.trim();
      const projectId = document.getElementById('fb-project-id').value.trim();
      const authDomain = document.getElementById('fb-auth-domain').value.trim();
      const storageBucket = document.getElementById('fb-storage-bucket').value.trim();
      const appId = document.getElementById('fb-app-id').value.trim();

      const config = { apiKey, projectId, authDomain, storageBucket, appId };
      firebaseService.saveConfig(config);
      await store.initFirebase();
      window.closeFirebaseModal();
      window.showToast('Firebase credentials saved and synchronized!', 'success');
    });
  }

  const fbClearBtn = document.getElementById('fb-clear-config-btn');
  if (fbClearBtn) {
    fbClearBtn.addEventListener('click', () => {
      firebaseService.clearConfig();
      window.closeFirebaseModal();
      window.showToast('Firebase configuration cleared. Running in local state mode.', 'info');
    });
  }

  // Mobile navigation drawer toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
    });
  }

  // Initial Render
  renderAll();
});
