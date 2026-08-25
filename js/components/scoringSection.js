/**
 * Retain Social Growth Challenge - Scoring Section & Calculator Component (Retain Brand Theme)
 */

import { store } from '../store.js';
import { getPointsBreakdown } from '../scoring.js';

export function renderScoringSection() {
  const container = document.getElementById('scoring-section');
  if (!container) return;

  const state = store.getState();
  const activePlatforms = Object.entries(state.settings.platforms || {}).filter(([_, p]) => p.enabled);

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 mt-2 mb-4">
          Every action counts. Meet our <span class="marker-highlight">scoring rules</span>.
        </h2>
        <p class="text-slate-600 text-base leading-relaxed">
          Every verified action earns points. Maximize your score by encouraging contacts to follow multiple channels and engage with our content.
        </p>
      </div>

      <!-- Scoring Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        
        <!-- Card 1 -->
        <div class="modern-card p-7 flex flex-col justify-between group">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-rose-400 font-black text-base flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
              1x
            </div>
            <h3 class="text-lg font-black text-slate-900 mb-2">Single Platform Follow</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              One verified new follower on any participating campaign channel.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">Awarded</span>
            <span class="text-2xl font-black text-slate-900">1 pt</span>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="modern-card p-7 flex flex-col justify-between group border-2 border-rose-200 bg-[#FAFBF7]">
          <div>
            <div class="flex items-center justify-between mb-5">
              <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 font-black text-base flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                3x
              </div>
              <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white">Bonus</span>
            </div>
            <h3 class="text-lg font-black text-slate-900 mb-2">3-Platform Follow</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              One contact follows three different Retain official platforms.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500">Total Points</span>
            <span class="text-2xl font-black text-slate-900">4 pts</span>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="retain-card p-7 flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between mb-5">
              <div class="w-12 h-12 rounded-2xl bg-white text-rose-600 font-black text-base flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                All
              </div>
              <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">Super Bonus</span>
            </div>
            <h3 class="text-lg font-black text-white mb-2">All-Platform Follow</h3>
            <p class="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              One contact follows all 6 participating campaign channels.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
            <span class="text-xs font-bold text-rose-200">Total Points</span>
            <span class="text-2xl font-black text-white">6 pts</span>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="modern-card p-7 flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between mb-5">
              <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-black text-base flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                +1
              </div>
              <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">Engagement</span>
            </div>
            <h3 class="text-lg font-black text-slate-900 mb-2">Post Engagement</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A referred follower leaves a thoughtful comment or reaction on a recent post.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">Bonus Added</span>
            <span class="text-2xl font-black text-amber-600">+1 pt</span>
          </div>
        </div>

      </div>

      <!-- Interactive Scoring Calculator & Fair Play Box -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Interactive Calculator -->
        <div class="lg:col-span-7 modern-card p-8 sm:p-10">
          <div class="flex items-center gap-3.5 mb-7">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-rose-400 flex items-center justify-center shadow-sm">
              <i data-lucide="calculator" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900">Interactive Points Calculator</h3>
              <p class="text-xs text-slate-500 font-medium">Estimate what a single referral can earn you</p>
            </div>
          </div>

          <!-- Platform Checkbox Selector -->
          <div class="mb-6">
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              Select platforms followed by contact:
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              ${activePlatforms.map(([key, plat]) => `
                <label class="calc-plat-label flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#FAFBF7] border border-slate-200 hover:border-rose-500 cursor-pointer transition-all">
                  <input type="checkbox" name="calc-platform" value="${key}" class="calc-plat-cb rounded bg-white border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4" />
                  <span class="text-xs font-bold text-slate-800">${plat.name}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Engagement Checkbox -->
          <div class="mb-7">
            <label class="flex items-center gap-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer hover:border-amber-300 transition-all">
              <input type="checkbox" id="calc-engaged" class="rounded bg-white border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4" />
              <div class="text-xs">
                <span class="font-bold text-slate-900 block">Contact also commented or engaged on a Retain post</span>
                <span class="text-amber-800 font-medium">Adds +1 verified bonus point</span>
              </div>
            </label>
          </div>

          <!-- Live Score Result Box -->
          <div class="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg">
            <div>
              <span class="text-xs text-slate-400 block font-medium">Estimated Points for This Referral:</span>
              <span id="calc-summary" class="text-sm font-bold text-rose-400">0 platforms selected</span>
            </div>
            <div class="text-right">
              <span id="calc-total-points" class="text-3xl sm:text-4xl font-black text-white">0</span>
              <span class="text-[10px] text-slate-400 block font-black tracking-wider">POINTS</span>
            </div>
          </div>
        </div>

        <!-- Fair Play Disclaimer Notice -->
        <div class="lg:col-span-5 modern-card p-8 sm:p-10 border-slate-200 bg-[#FAFBF7]">
          <div class="flex items-center gap-3.5 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-rose-400 flex items-center justify-center shadow-sm">
              <i data-lucide="shield-alert" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900">Fair Play & Integrity</h3>
              <span class="text-xs text-slate-500 font-bold">Strict Campaign Verification</span>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            To ensure a fair and credible competition for all Retain employees:
          </p>

          <ul class="space-y-3 text-xs text-slate-700">
            <li class="flex items-start gap-2.5">
              <i data-lucide="x-circle" class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5"></i>
              <span><strong>Existing followers:</strong> Accounts following Retain prior to launch do not count.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <i data-lucide="x-circle" class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5"></i>
              <span><strong>Duplicate submissions:</strong> The same follower account cannot be claimed multiple times.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <i data-lucide="x-circle" class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5"></i>
              <span><strong>Bots & Fake Accounts:</strong> Automated bot follows or purchased followers result in immediate disqualification.</span>
            </li>
          </ul>

          <div class="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-2 font-medium">
            <i data-lucide="info" class="w-4 h-4 text-slate-700 flex-shrink-0"></i>
            <span>Points are awarded exclusively after administrative validation.</span>
          </div>
        </div>

      </div>

    </div>
  `;

  // Attach calculator listeners
  const checkboxes = container.querySelectorAll('.calc-plat-cb');
  const engagedCheckbox = document.getElementById('calc-engaged');
  const totalDisplay = document.getElementById('calc-total-points');
  const summaryDisplay = document.getElementById('calc-summary');

  function updateCalculator() {
    const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    const engaged = engagedCheckbox ? engagedCheckbox.checked : false;
    const totalActive = activePlatforms.length;

    const breakdown = getPointsBreakdown(selected, engaged, totalActive);
    if (totalDisplay) totalDisplay.innerText = breakdown.totalPoints;
    if (summaryDisplay) summaryDisplay.innerText = breakdown.summary;
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateCalculator));
  if (engagedCheckbox) engagedCheckbox.addEventListener('change', updateCalculator);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
