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
          
          <!-- Category Eyebrow Tag -->
          <div class="mb-4">
            <span class="category-eyebrow">(RETAIN GROWTH CHALLENGE)</span>
          </div>

          <!-- Headline with Marker Pen Highlight -->
          <h1 class="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-6">
            Grow the community. <br />
            Meet your <span class="marker-highlight">one of a kind</span> growth challenge.
          </h1>

          <!-- Supporting Text -->
          <p class="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
            ${settings.supportingText || 'Use your network to help more people discover Retain. Invite genuine followers, earn points and climb the leaderboard.'}
          </p>

          <!-- Floating Badges & Action Buttons -->
          <div class="flex flex-wrap items-center gap-4 mb-8">
            <a href="#employee-access-section" class="btn-retain flex items-center gap-2">
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
                <span class="text-xs text-slate-500 font-medium">${activeEmployees} active team members</span>
              </div>
              <div class="flex -space-x-2">
                <div class="w-7 h-7 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-bold text-[9px] border-2 border-white">SJ</div>
                <div class="w-7 h-7 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-[9px] border-2 border-white">KM</div>
                <div class="w-7 h-7 rounded-full bg-[#FB923C] text-white flex items-center justify-center font-bold text-[9px] border-2 border-white">ER</div>
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
                <span>Active Sprint &bull; Week 2 Live</span>
              </div>

              <!-- Grand Prize Title -->
              <h3 class="text-2xl sm:text-3xl font-black text-white leading-snug mb-4">
                Grand Champion: <br />
                <span class="text-[#FFEDD5]">MacBook Air M3</span> + $1,000 Grant
              </h3>

              <p class="text-rose-100/90 text-xs sm:text-sm leading-relaxed mb-6">
                Top referrer at the end of Week 4 takes home the flagship tech package and executive trophy.
              </p>
            </div>

            <!-- Bottom Section: Action & Social Proof Pill -->
            <div>
              <div class="mb-6">
                <a href="#employee-access-section" class="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-md transition-all">
                  <span>Get started now</span>
                  <i data-lucide="sparkles" class="w-3.5 h-3.5 text-rose-600"></i>
                </a>
              </div>

              <!-- Social Proof Pill Badge -->
              <div class="bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-gradient-retain text-white font-black text-xs flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <span class="text-xs font-bold text-white block">24+ Employees active</span>
                    <span class="text-[10px] text-rose-200">Competing for ₦1.5M Prize Pool</span>
                  </div>
                </div>
                <span class="text-xs font-bold text-[#FB923C]">Active 🔥</span>
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
            <div class="flex items-center gap-2 mb-3">
              <span class="category-eyebrow">(CAMPAIGN SPRINT COUNTDOWN)</span>
            </div>
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

          <!-- Big Stat Numbers (400+ / 100% / 6) -->
          <div class="lg:col-span-7">
            <div class="grid grid-cols-3 gap-6 text-center">
              <div>
                <span class="text-3xl sm:text-5xl font-black text-slate-900 block tracking-tight">400+</span>
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
  initCountdownTimer(settings.endDate || '2026-09-12T23:59:59');

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
