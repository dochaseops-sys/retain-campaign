/**
 * Retain Social Growth Challenge - Admin Portal Coordinator & Auth Manager (Retain Brand Theme)
 */

import { store } from './store.js';
import { firebaseService } from './firebase-config.js';
import { renderAdminPortal } from './components/adminPortal.js';
import { renderAnalytics } from './components/analytics.js';
import { getSocialIcon } from './icons.js';

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

// Rejection Modal
let currentRejectSubmissionId = null;
window.openRejectModal = function(submissionId) {
  currentRejectSubmissionId = submissionId || window.currentRejectId;
  const modal = document.getElementById('reject-submission-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeRejectModal = function() {
  currentRejectSubmissionId = null;
  const modal = document.getElementById('reject-submission-modal');
  if (modal) modal.classList.add('hidden');
};

// Edit Platform Modal
let currentEditPlatformKey = null;
window.openEditPlatformModal = function(platformKey) {
  currentEditPlatformKey = platformKey;
  const modal = document.getElementById('edit-platform-modal');
  const state = store.getState();
  const plat = state.settings.platforms[platformKey];

  if (modal && plat) {
    document.getElementById('edit-plat-key').value = platformKey;
    document.getElementById('edit-plat-name').value = plat.name || '';
    document.getElementById('edit-plat-handle').value = plat.handle || '';
    document.getElementById('edit-plat-url').value = plat.url || '';
    document.getElementById('edit-plat-baseline').value = plat.baseline || 0;
    document.getElementById('edit-plat-enabled').checked = Boolean(plat.enabled);
    modal.classList.remove('hidden');
  }
};

window.closeEditPlatformModal = function() {
  currentEditPlatformKey = null;
  const modal = document.getElementById('edit-platform-modal');
  if (modal) modal.classList.add('hidden');
};

// Edit Outreach Template Modal
let currentEditTemplateKey = null;
window.openEditTemplateModal = function(templateKey) {
  currentEditTemplateKey = templateKey;
  const modal = document.getElementById('edit-template-modal');
  const state = store.getState();
  const templates = state.settings.templates || {};
  const tmpl = templates[templateKey];

  if (modal && tmpl) {
    document.getElementById('edit-template-key').value = templateKey;
    document.getElementById('edit-template-title').value = tmpl.title || tmpl.platform || '';
    document.getElementById('edit-template-body').value = tmpl.template || '';

    const subjectGroup = document.getElementById('edit-template-subject-group');
    const subjectInput = document.getElementById('edit-template-subject');
    if (templateKey === 'email') {
      if (subjectGroup) subjectGroup.classList.remove('hidden');
      if (subjectInput) subjectInput.value = tmpl.subject || '';
    } else {
      if (subjectGroup) subjectGroup.classList.add('hidden');
    }

    const iconWrapper = document.getElementById('modal-template-icon-wrapper');
    if (iconWrapper) {
      iconWrapper.innerHTML = getSocialIcon(templateKey, 'w-5 h-5 text-rose-400');
    }

    const heading = document.getElementById('modal-template-heading');
    if (heading) {
      heading.innerText = `Edit ${tmpl.platform || tmpl.title} Template`;
    }

    modal.classList.remove('hidden');
  }
};

window.closeEditTemplateModal = function() {
  currentEditTemplateKey = null;
  const modal = document.getElementById('edit-template-modal');
  if (modal) modal.classList.add('hidden');
};

// Firebase Config Modal
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

function renderAdminView() {
  const state = store.getState();
  const isAdminLoggedIn = store.isAdminLoggedIn();
  const loginSection = document.getElementById('admin-login-section');
  const dashboardContainer = document.getElementById('admin-dashboard-container');
  const navUserSection = document.getElementById('admin-nav-user-section');

  if (!isAdminLoggedIn) {
    if (loginSection) loginSection.classList.remove('hidden');
    if (dashboardContainer) dashboardContainer.classList.add('hidden');
    if (navUserSection) navUserSection.innerHTML = `
      <a href="index.html" class="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1">
        <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
        <span>Public Site</span>
      </a>
    `;
  } else {
    if (loginSection) loginSection.classList.add('hidden');
    if (dashboardContainer) dashboardContainer.classList.remove('hidden');

    const adminEmail = state.auth?.admin?.adminEmail || 'admin@retaindigital.io';
    if (navUserSection) {
      navUserSection.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-rose-500 font-bold text-xs shadow-sm">
              <i data-lucide="shield" class="w-4 h-4"></i>
            </div>
            <span class="text-xs font-bold text-slate-900 hidden sm:inline">${adminEmail}</span>
          </div>
          <button id="admin-logout-btn" class="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
            <span>Log Out</span>
          </button>
        </div>
      `;

      const logoutBtn = document.getElementById('admin-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          store.logoutAdmin();
          window.showToast('Administrator session ended.', 'info');
        });
      }
    }

    renderAdminPortal();
    renderAnalytics('analytics-container');
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  store.subscribe(() => {
    renderAdminView();
  });

  // Admin Login form submission
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-login-email').value;
      const pass = document.getElementById('admin-login-pass').value;
      try {
        store.loginAdmin(email, pass);
        loginForm.reset();
        window.showToast('Administrator authenticated successfully.', 'success');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // Edit Platform Form submission
  const editPlatForm = document.getElementById('modal-edit-platform-form');
  if (editPlatForm) {
    editPlatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const key = document.getElementById('edit-plat-key').value;
      const name = document.getElementById('edit-plat-name').value.trim();
      const handle = document.getElementById('edit-plat-handle').value.trim();
      const url = document.getElementById('edit-plat-url').value.trim();
      const baseline = parseInt(document.getElementById('edit-plat-baseline').value, 10) || 0;
      const enabled = document.getElementById('edit-plat-enabled').checked;

      if (!key) return;

      try {
        store.updateSocialPlatform(key, { name, handle, url, baseline, enabled });
        window.closeEditPlatformModal();
        window.showToast(`Updated ${name} link and details!`, 'success');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // Edit Outreach Template Form submission
  const editTemplateForm = document.getElementById('modal-edit-template-form');
  if (editTemplateForm) {
    editTemplateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const key = document.getElementById('edit-template-key').value;
      const title = document.getElementById('edit-template-title').value.trim();
      const template = document.getElementById('edit-template-body').value.trim();
      const subject = document.getElementById('edit-template-subject') ? document.getElementById('edit-template-subject').value.trim() : '';

      if (!key || !template) return;

      try {
        store.updateOutreachTemplate(key, { title, template, subject });
        window.closeEditTemplateModal();
        window.showToast(`Updated ${title} outreach template!`, 'success');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // Insert token buttons
  document.querySelectorAll('.insert-token-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-token');
      const textarea = document.getElementById('edit-template-body');
      if (textarea && token) {
        const start = textarea.selectionStart || textarea.value.length;
        const end = textarea.selectionEnd || textarea.value.length;
        const val = textarea.value;
        textarea.value = val.substring(0, start) + token + val.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }
    });
  });

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
        store.rejectSubmission(currentRejectSubmissionId, reason, 'Admin');
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

  renderAdminView();
});
