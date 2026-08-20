/**
 * Retain Social Growth Challenge - Employee Portal Coordinator (Retain Brand Theme)
 */

import { store } from './store.js';
import { renderHero } from './components/hero.js';
import { renderHowItWorks } from './components/howItWorks.js';
import { renderScoringSection } from './components/scoringSection.js';
import { renderEmployeeDashboard } from './components/employeeDashboard.js';
import { renderSharingToolkit } from './components/sharingToolkit.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { renderTimeline } from './components/timeline.js';
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

function renderEmployeeView() {
  const state = store.getState();
  const isLoggedIn = store.isEmployeeLoggedIn();
  const loginBox = document.getElementById('employee-login-box');
  const dashboardContent = document.getElementById('employee-dashboard-content');
  const navUserSection = document.getElementById('nav-user-section');

  // Always render general campaign information
  renderHero();
  renderHowItWorks();
  renderScoringSection();
  renderLeaderboard();
  renderTimeline();
  renderRulesAccordion();

  if (!isLoggedIn) {
    if (loginBox) loginBox.classList.remove('hidden');
    if (dashboardContent) dashboardContent.classList.add('hidden');
    if (navUserSection) {
      navUserSection.innerHTML = `
        <a href="#employee-access-section" class="btn-dark-pill text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95">
          <i data-lucide="log-in" class="w-3.5 h-3.5 text-rose-400"></i>
          <span>Sign In / Register</span>
        </a>
      `;
    }
    renderLoginPills();
  } else {
    if (loginBox) loginBox.classList.add('hidden');
    if (dashboardContent) dashboardContent.classList.remove('hidden');

    const currentEmp = store.getCurrentEmployee();
    if (navUserSection) {
      navUserSection.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm" style="background-color: ${currentEmp.color || '#EF4444'}">
              ${currentEmp.avatar || 'RD'}
            </div>
            <span class="text-xs font-bold text-slate-900 hidden sm:inline">${currentEmp.name}</span>
          </div>
          <button id="emp-logout-btn" class="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5">
            <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
            <span>Log Out</span>
          </button>
        </div>
      `;

      const logoutBtn = document.getElementById('emp-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          store.logoutEmployee();
          window.showToast('Logged out successfully.', 'info');
        });
      }
    }

    renderEmployeeDashboard();
    renderSharingToolkit();
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderLoginPills() {
  const container = document.getElementById('quick-demo-employees');
  if (!container) return;

  const employees = store.getState().employees || [];
  container.innerHTML = employees.map(emp => `
    <button class="quick-emp-login-btn p-2.5 rounded-2xl bg-[#FAFBF7] hover:bg-white border border-slate-200 hover:border-rose-500 text-left transition-all flex items-center gap-2.5 group shadow-sm" data-code="${emp.referralCode}">
      <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-[10px] flex-shrink-0 shadow-sm" style="background-color: ${emp.color || '#EF4444'}">
        ${emp.avatar}
      </div>
      <div class="min-w-0">
        <span class="text-xs font-bold text-slate-900 block truncate group-hover:text-rose-600">${emp.name}</span>
        <span class="text-[10px] text-slate-400 font-mono block truncate">${emp.referralCode}</span>
      </div>
    </button>
  `).join('');

  container.querySelectorAll('.quick-emp-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      try {
        const emp = store.loginEmployee(code);
        window.showToast(`Welcome back, ${emp.name}!`, 'success');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  store.subscribe(() => {
    renderEmployeeView();
  });

  // Login form submission
  const loginForm = document.getElementById('employee-signin-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = document.getElementById('signin-identifier').value;
      try {
        const emp = store.loginEmployee(identifier);
        loginForm.reset();
        window.showToast(`Signed in as ${emp.name}!`, 'success');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // Registration form submission
  const regForm = document.getElementById('employee-register-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const dept = document.getElementById('reg-dept').value;

      try {
        const newEmp = store.registerEmployee(name, email, dept);
        store.loginEmployee(newEmp.referralCode);
        regForm.reset();
        window.showToast(`Registered successfully! Your code is ${newEmp.referralCode}`, 'success');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // Tab switching on login screen (Sign In vs Register)
  const tabSignIn = document.getElementById('tab-btn-signin');
  const tabRegister = document.getElementById('tab-btn-register');
  const paneSignIn = document.getElementById('pane-signin');
  const paneRegister = document.getElementById('pane-register');

  if (tabSignIn && tabRegister && paneSignIn && paneRegister) {
    tabSignIn.addEventListener('click', () => {
      tabSignIn.className = 'flex-1 py-2.5 rounded-full font-bold text-xs bg-slate-900 text-white shadow-sm transition-all';
      tabRegister.className = 'flex-1 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:text-slate-900 transition-all';
      paneSignIn.classList.remove('hidden');
      paneRegister.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.className = 'flex-1 py-2.5 rounded-full font-bold text-xs bg-slate-900 text-white shadow-sm transition-all';
      tabSignIn.className = 'flex-1 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:text-slate-900 transition-all';
      paneRegister.classList.remove('hidden');
      paneSignIn.classList.add('hidden');
    });
  }

  // Mobile Hamburger Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuDrawer.classList.toggle('hidden');
    });

    // Close drawer when a link is clicked
    mobileMenuDrawer.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuDrawer.classList.add('hidden');
      });
    });
  }

  renderEmployeeView();
});
