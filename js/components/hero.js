/**
 * Retain Social Growth Challenge - Hero Component (Retain Brand Theme)
 */

import { store } from '../store.js';

let countdownInterval = null;

export function renderHero() {
  const container = document.getElementById('hero-section');
  if (!container) return;

  const state = store.getState();
  const { settings, employees, submissions } = state;
  const verifiedCount = submissions.filter(s => s.status === 'verified').length;
  const activeEmployees = employees.filter(e => (e.totalPoints || 0) > 0).length || employees.length;

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      
      <!-- Pinned Announcement Banner (if enabled) -->
      ${settings.announcement && settings.announcement.enabled ? `
        <div class="mb-10 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-slate-900 flex items-center justify-between gap-4 shadow-sm animate-slide-up">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full bg-slate-900 text-rose-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              <i data-lucide="zap" class="w-4 h-4"></i>
            </span>
            <span class="text-xs sm:text-sm font-bold text-slate-800">${settings.announcement.message}</span>
          </div>
          <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-white flex-shrink-0">PINNED</span>
        </div>
      ` : ''}

      <!-- Main Hero Split Grid (Editorial Retain Composition) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
        
        <!-- Left Column: Editorial Headline & Floating Widgets -->
        <div class="lg:col-span-7">

          <!-- Headline with Marker Pen Highlight -->
          <h1 class="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-6">
            Grow the community. <br />
            <span class="marker-highlight">Own the leaderboard</span>.
          </h1>

          <!-- Supporting Text -->
          <p class="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
            ${settings.supportingText || 'This is your Growth Challenge, invite genuine followers, earn points, and see your name climb to the top!'}
          </p>

          <!-- Floating Badges & Action Buttons -->
          <div class="flex flex-wrap items-center gap-4 mb-8">
            <a href="employee.html" class="btn-retain flex items-center gap-2">
              <span>Join the Challenge</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
            <a href="#leaderboard-section" class="btn-outline-pill flex items-center gap-2">
              <i data-lucide="trophy" class="w-4 h-4 text-rose-600"></i>
              <span>View Leaderboard</span>
            </a>
          </div>

          <!-- Floating Micro-Widgets Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/80">
            
            <!-- Widget 1: Team Report Card -->
            <div class="modern-card p-4 flex items-center justify-between gap-3">
              <div>
                <span class="text-[11px] font-bold text-slate-800 block">Staff Participation</span>
                <span class="text-xs text-slate-500 font-medium">${employees.length > 0 ? `${employees.length} team members registered` : 'All Retain employees eligible'}</span>
              </div>
              <div class="flex -space-x-2">
                ${employees.length > 0 ? employees.slice(0, 3).map(e => `
                  <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] border-2 border-white text-white" style="background-color: ${e.color || '#EF4444'}">${e.avatar || (e.name ? e.name.substring(0, 2).toUpperCase() : 'RD')}</div>
                `).join('') : `
                  <div class="w-7 h-7 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-bold text-[9px] border-2 border-white">RD</div>
                  <div class="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[9px] border-2 border-white">RT</div>
                  <div class="w-7 h-7 rounded-full bg-[#FB923C] text-white flex items-center justify-center font-bold text-[9px] border-2 border-white">HQ</div>
                `}
              </div>
            </div>

            <!-- Widget 2: Floating Pill -->
            <div class="modern-card p-4 flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-slate-900 text-rose-400 flex items-center justify-center flex-shrink-0">
                <i data-lucide="shield-check" class="w-4 h-4"></i>
              </div>
              <div>
                <span class="text-[11px] font-extrabold text-slate-900 block">100% Verified Referrals</span>
                <span class="text-xs text-slate-500">Strict fair-play policy</span>
              </div>
            </div>

          </div>

        </div>

        <!-- Right Column: Retain Gradient Hero Card -->
        <div class="lg:col-span-5">
          <div class="retain-card p-8 sm:p-10 flex flex-col justify-between min-h-[440px]">
            
            <!-- Top Status Pill -->
            <div>
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-6">
                <span class="w-2 h-2 rounded-full bg-[#FB923C] animate-ping"></span>
                <span>Active Sprint &bull; 30-Day Sprint Live</span>
              </div>

              <!-- Grand Prize Title -->
              <h3 class="text-2xl sm:text-3xl font-black text-white leading-snug mb-4">
                Grand Champion: <br />
                <span class="text-[#FFEDD5]">₦50,000</span> Cash Prize
              </h3>

              <p class="text-rose-100/90 text-xs sm:text-sm leading-relaxed mb-6">
                Top referrer at the end of the challenge takes home the ₦50,000 grand prize and executive champion trophy.
              </p>
            </div>

            <!-- Bottom Section: Action & Social Proof Pill -->
            <div>
              <div class="mb-6">
                <a href="employee.html" class="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-md transition-all">
                  <span>Get started now</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-rose-600"></i>
                </a>
              </div>

              <!-- Social Proof Pill Badge -->
              <div class="bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-white/15 text-white font-black text-xs flex items-center justify-center">
                    <i data-lucide="award" class="w-4 h-4 text-amber-300"></i>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-white block">${employees.length > 0 ? `${employees.length} Team Members Registered` : 'All Departments Competing'}</span>
                    <span class="text-[10px] text-rose-200">₦95,000 Prize Pool & Trophies</span>
                  </div>
                </div>
                <span class="text-xs font-bold text-[#FB923C] flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#FB923C] animate-ping"></span>
                  <span>Active</span>
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Live Countdown Timer & High Impact Stats -->
      <div class="modern-card p-8 sm:p-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Countdown Block -->
          <div class="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
            <h4 class="text-lg font-black text-slate-900 mb-4">Time Remaining in Challenge</h4>
            
            <div class="grid grid-cols-4 gap-3 text-center">
              <div class="bg-[#FAFBF7] border border-slate-200 rounded-2xl p-3 shadow-inner">
                <span id="hero-cd-days" class="text-2xl sm:text-3xl font-black text-slate-900 block font-mono">00</span>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DAYS</span>
              </div>
              <div class="bg-[#FAFBF7] border border-slate-200 rounded-2xl p-3 shadow-inner">
                <span id="hero-cd-hours" class="text-2xl sm:text-3xl font-black text-slate-900 block font-mono">00</span>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">HOURS</span>
              </div>
              <div class="bg-[#FAFBF7] border border-slate-200 rounded-2xl p-3 shadow-inner">
                <span id="hero-cd-mins" class="text-2xl sm:text-3xl font-black text-slate-900 block font-mono">00</span>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MINS</span>
              </div>
              <div class="bg-[#FAFBF7] border border-slate-200 rounded-2xl p-3 shadow-inner">
                <span id="hero-cd-secs" class="text-2xl sm:text-3xl font-black text-rose-600 block font-mono">00</span>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SECS</span>
              </div>
            </div>
          </div>

          <!-- Big Stat Numbers -->
          <div class="lg:col-span-7">
            <div class="grid grid-cols-3 gap-6 text-center">
              <div>
                <span class="text-3xl sm:text-5xl font-black text-slate-900 block tracking-tight">${verifiedCount}</span>
                <span class="text-xs sm:text-sm font-semibold text-slate-500 mt-1 block">Verified Referrals</span>
              </div>
              <div class="border-x border-slate-200 px-4">
                <span class="text-3xl sm:text-5xl font-black text-slate-900 block tracking-tight">100%</span>
                <span class="text-xs sm:text-sm font-semibold text-slate-500 mt-1 block">Organic Reach</span>
              </div>
              <div>
                <span class="text-3xl sm:text-5xl font-black text-slate-900 block tracking-tight">6</span>
                <span class="text-xs sm:text-sm font-semibold text-slate-500 mt-1 block">Active Channels</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  `;

  // Start countdown timer
  initCountdownTimer(settings.endDate || '2026-09-30T23:59:59');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function initCountdownTimer(targetDateStr) {
  if (countdownInterval) clearInterval(countdownInterval);

  function update() {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    const daysEl = document.getElementById('hero-cd-days');
    const hoursEl = document.getElementById('hero-cd-hours');
    const minsEl = document.getElementById('hero-cd-mins');
    const secsEl = document.getElementById('hero-cd-secs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    if (diff <= 0) {
      daysEl.innerText = '00';
      hoursEl.innerText = '00';
      minsEl.innerText = '00';
      secsEl.innerText = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minsEl.innerText = String(mins).padStart(2, '0');
    secsEl.innerText = String(secs).padStart(2, '0');
  }

  update();
  countdownInterval = setInterval(update, 1000);
}
