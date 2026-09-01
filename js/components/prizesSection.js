/**
 * Retain Social Growth Challenge - Prizes & Rewards Showcase Component (Retain Brand Theme)
 */

import { store } from '../store.js';

export function renderPrizesSection() {
  const container = document.getElementById('prizes-section');
  if (!container) return;

  const state = store.getState();
  const prizes = state.settings.prizes || {};

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="category-eyebrow mb-3">(PRIZES & REWARDS)</span>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 mt-2 mb-4">
          Compete for <span class="marker-highlight">cash rewards</span>.
        </h2>
        <p class="text-slate-600 text-base leading-relaxed">
          Over ₦95,000 in total cash prizes and executive trophies for Dochase top performers.
        </p>
      </div>

      <!-- Prizes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- 2nd Place Prize Card -->
        <div class="modern-card p-8 flex flex-col justify-between border-slate-200 hover:scale-105 transition-all">
          <div>
            <div class="flex items-center justify-between mb-6">
              <span class="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center border border-slate-200">2</span>
              <span class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700">Runner-Up</span>
            </div>
            
            <div class="w-16 h-16 rounded-2xl bg-slate-900 text-rose-400 flex items-center justify-center mb-6 shadow-md">
              <i data-lucide="award" class="w-8 h-8"></i>
            </div>

            <h3 class="text-xl font-black text-slate-900 mb-2">${prizes.second?.reward || '₦30,000 Cash Prize'}</h3>
            <p class="text-xs text-slate-600 leading-relaxed mb-6">
              ${prizes.second?.desc || 'Awarded to the #2 ranked employee on the final verified leaderboard + executive silver plaque.'}
            </p>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">Position</span>
            <span class="text-sm font-black text-slate-900">2nd Place</span>
          </div>
        </div>

        <!-- 1st Place Grand Champion Card (Featured / Taller) -->
        <div class="retain-card p-8 sm:p-10 flex flex-col justify-between relative md:-translate-y-4 shadow-2xl hover:scale-105 transition-all">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FB923C] text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <i data-lucide="crown" class="w-3.5 h-3.5"></i>
            <span>Grand Champion</span>
          </div>

          <div>
            <div class="flex items-center justify-between mb-6 mt-2">
              <span class="w-10 h-10 rounded-2xl bg-white/20 text-white font-black text-sm flex items-center justify-center border border-white/20">1</span>
              <span class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white text-slate-950">Grand Prize</span>
            </div>

            <div class="w-20 h-20 rounded-2xl bg-white text-slate-950 flex items-center justify-center mb-6 shadow-xl ring-4 ring-rose-400/40">
              <i data-lucide="trophy" class="w-9 h-9 text-rose-600"></i>
            </div>

            <h3 class="text-2xl font-black text-white mb-2 leading-snug">${prizes.first?.reward || '₦50,000 Cash Prize'}</h3>
            <p class="text-xs sm:text-sm text-rose-100/90 leading-relaxed mb-6">
              ${prizes.first?.desc || 'Awarded to the #1 overall growth champion with the highest verified score + executive gold trophy.'}
            </p>
          </div>

          <div class="pt-4 border-t border-white/20 flex items-center justify-between">
            <span class="text-xs font-bold text-rose-200">Position</span>
            <span class="text-base font-black text-white">1st Place Champion</span>
          </div>
        </div>

        <!-- 3rd Place Prize Card -->
        <div class="modern-card p-8 flex flex-col justify-between border-slate-200 hover:scale-105 transition-all">
          <div>
            <div class="flex items-center justify-between mb-6">
              <span class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 font-black text-sm flex items-center justify-center border border-amber-200">3</span>
              <span class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800">2nd Runner-Up</span>
            </div>

            <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6 shadow-md">
              <i data-lucide="star" class="w-8 h-8"></i>
            </div>

            <h3 class="text-xl font-black text-slate-900 mb-2">${prizes.third?.reward || '₦15,000 Cash Prize'}</h3>
            <p class="text-xs text-slate-600 leading-relaxed mb-6">
              ${prizes.third?.desc || 'Awarded to the #3 ranked employee on the final verified leaderboard.'}
            </p>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">Position</span>
            <span class="text-sm font-black text-slate-900">3rd Place</span>
          </div>
        </div>

      </div>

    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
