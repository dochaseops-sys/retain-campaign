/**
 * Retain Social Growth Challenge - Leaderboard Component (Retain Brand Theme)
 */

import { store } from '../store.js';

export function renderLeaderboard() {
  const container = document.getElementById('leaderboard-section');
  if (!container) return;

  const state = store.getState();
  const currentEmp = store.getCurrentEmployee();

  // Get unique departments for filter
  const departments = Array.from(new Set(state.employees.map(e => e.department))).sort();

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 mt-2 mb-4">
          Challenge <span class="marker-highlight">leaderboard</span>.
        </h2>
        <p class="text-slate-600 text-base leading-relaxed">
          Rankings are updated exclusively with <strong class="text-rose-600">verified follower points</strong>. Transparent and live audit updates.
        </p>
      </div>

      <!-- Podium for Top 3 Participants -->
      <div id="leaderboard-podium" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end max-w-4xl mx-auto">
        <!-- Will be filled dynamically -->
      </div>

      <!-- Filters & Search Bar -->
      <div class="modern-card p-4 sm:p-6 mb-6 sm:mb-8 border-slate-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          
          <!-- Department Filter Buttons -->
          <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto touch-scroll pb-2 sm:pb-0 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
            <button class="dept-filter-btn px-3.5 sm:px-4 py-2 rounded-full text-xs font-black transition-all bg-slate-900 text-white shadow-sm flex-shrink-0 touch-target" data-dept="all">
              All Departments
            </button>
            ${departments.map(dept => `
              <button class="dept-filter-btn px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0 touch-target" data-dept="${dept}">
                ${dept}
              </button>
            `).join('')}
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:min-w-[240px]">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"></i>
            <input type="text" id="leaderboard-search-input" placeholder="Search employee..." class="w-full bg-[#FAFBF7] border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-all" />
          </div>

        </div>
      </div>

      <!-- Leaderboard Table Card -->
      <div class="modern-card border-slate-200 overflow-hidden shadow-xl">
        <div class="overflow-x-auto touch-scroll">
          <table class="w-full text-left text-sm text-slate-700 whitespace-nowrap">
            <thead class="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-[#FAFBF7] border-b border-slate-200">
              <tr>
                <th class="py-3.5 sm:py-4 px-3 sm:px-6 text-center w-14 sm:w-16">Rank</th>
                <th class="py-3.5 sm:py-4 px-3 sm:px-6">Employee</th>
                <th class="py-3.5 sm:py-4 px-3 sm:px-6">Department</th>
                <th class="py-3.5 sm:py-4 px-3 sm:px-6 text-center">Verified Followers</th>
                <th class="py-3.5 sm:py-4 px-3 sm:px-6 text-center">Total Points</th>
                <th class="py-3.5 sm:py-4 px-3 sm:px-6">Achievement Badge</th>
              </tr>
            </thead>
            <tbody id="leaderboard-table-body" class="divide-y divide-slate-100 font-medium">
              <!-- Will be populated dynamically -->
            </tbody>
          </table>
        </div>

        <!-- Footnote on Verification -->
        <div class="p-5 bg-[#FAFBF7] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-medium">
          <div class="flex items-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-rose-600"></i>
            <span>Verified audit policy active &bull; Points recalculate in real time upon verification</span>
          </div>
          <span class="text-slate-700 font-bold">Live Sync Engine Active</span>
        </div>
      </div>

    </div>
  `;

  let activeDept = 'all';
  let searchTerm = '';

  function renderTableData() {
    const leaderboard = store.getLeaderboard(activeDept);
    const filtered = leaderboard.filter(e => 
      (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (e.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.referralCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render Podium for Top 3 (from overall leaderboard)
    const overallTop = store.getLeaderboard('all');
    const podiumEl = document.getElementById('leaderboard-podium');
    if (podiumEl) {
      if (overallTop.length === 0) {
        podiumEl.innerHTML = `
          <!-- 2nd Place Slot -->
          <div class="order-2 md:order-1 modern-card p-6 text-center relative border-dashed border-2 border-slate-300">
            <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center mx-auto mb-2.5 border border-slate-200">2</div>
            <div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-slate-100 text-slate-400 font-black text-xl mb-3">
              <i data-lucide="award" class="w-7 h-7 text-slate-500"></i>
            </div>
            <h4 class="font-black text-slate-800 text-sm">2nd Place Slot</h4>
            <span class="text-[11px] text-slate-500 block mt-0.5">₦30,000 Cash Prize</span>
          </div>

          <!-- 1st Place Slot -->
          <div class="order-1 md:order-2 retain-card p-8 text-center relative md:-translate-y-4 shadow-xl">
            <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FB923C] text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <i data-lucide="crown" class="w-3.5 h-3.5"></i>
              <span>Grand Champion Slot</span>
            </div>
            <div class="w-10 h-10 rounded-full bg-white/20 text-white font-black text-base flex items-center justify-center mx-auto mt-2 mb-3 border border-white/20">1</div>
            <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-white text-slate-950 font-black text-2xl mb-3 shadow-lg ring-4 ring-rose-400/40">
              <i data-lucide="trophy" class="w-8 h-8 text-rose-600"></i>
            </div>
            <h4 class="font-black text-white text-base">Claim the Crown</h4>
            <span class="text-xs text-rose-200 block font-medium mt-1">₦50,000 Cash Prize</span>
          </div>

          <!-- 3rd Place Slot -->
          <div class="order-3 md:order-3 modern-card p-6 text-center relative border-dashed border-2 border-slate-300">
            <div class="w-8 h-8 rounded-full bg-amber-50 text-amber-800 font-black text-sm flex items-center justify-center mx-auto mb-2.5 border border-amber-200">3</div>
            <div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-amber-50 text-amber-600 font-black text-xl mb-3">
              <i data-lucide="star" class="w-7 h-7 text-amber-600"></i>
            </div>
            <h4 class="font-black text-slate-800 text-sm">3rd Place Slot</h4>
            <span class="text-[11px] text-slate-500 block mt-0.5">₦15,000 Cash Prize</span>
          </div>
        `;
      } else {
        const first = overallTop[0];
        const second = overallTop.length > 1 ? overallTop[1] : null;
        const third = overallTop.length > 2 ? overallTop[2] : null;

        podiumEl.innerHTML = `
          <!-- 2nd Place -->
          ${second ? `
            <div class="order-2 md:order-1 modern-card p-6 text-center relative border-slate-200 hover:scale-105 transition-all">
              <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center mx-auto mb-2.5 border border-slate-200">2</div>
              <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-xl mb-3 shadow-md" style="background-color: ${second.color || '#1E293B'}">
                ${second.avatar || (second.name ? second.name.substring(0, 2).toUpperCase() : 'RD')}
              </div>
              <h4 class="font-black text-slate-900 text-base">${second.name || 'Anonymous'}</h4>
              <span class="text-xs text-slate-500 block">${second.department || 'Dochase Team'}</span>
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4">
                <div>
                  <span class="text-[10px] text-slate-400 block font-medium">Followers</span>
                  <span class="text-sm font-bold text-slate-800">${second.verifiedFollowerCount || 0}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block font-medium">Points</span>
                  <span class="text-xl font-black text-slate-900">${second.totalPoints || 0}</span>
                </div>
              </div>
            </div>
          ` : `
            <div class="order-2 md:order-1 modern-card p-6 text-center relative border-dashed border-2 border-slate-300">
              <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center mx-auto mb-2.5 border border-slate-200">2</div>
              <div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-slate-100 text-slate-400 font-black text-xl mb-3">
                <i data-lucide="award" class="w-7 h-7 text-slate-500"></i>
              </div>
              <h4 class="font-black text-slate-800 text-sm">2nd Place Open</h4>
              <span class="text-[11px] text-slate-500 block mt-0.5">₦30,000 Cash Prize</span>
            </div>
          `}

          <!-- 1st Place (Center / Taller / Retain Card) -->
          <div class="order-1 md:order-2 retain-card p-8 text-center relative md:-translate-y-6 shadow-2xl hover:scale-105 transition-all">
            <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FB923C] text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <i data-lucide="crown" class="w-3.5 h-3.5"></i>
              <span>Current Leader</span>
            </div>
            <div class="w-10 h-10 rounded-full bg-white/20 text-white font-black text-base flex items-center justify-center mx-auto mt-2 mb-3 border border-white/20">1</div>
            <div class="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-2xl mb-3 shadow-xl ring-4 ring-rose-400/40 bg-white">
              ${first.avatar || (first.name ? first.name.substring(0, 2).toUpperCase() : 'RD')}
            </div>
            <h4 class="font-black text-white text-lg">${first.name || 'Anonymous'}</h4>
            <span class="text-xs text-rose-200 block font-medium">${first.department || 'Dochase Team'}</span>
            <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-center gap-5">
              <div>
                <span class="text-[10px] text-rose-200 block font-medium">Followers</span>
                <span class="text-sm font-bold text-white">${first.verifiedFollowerCount || 0}</span>
              </div>
              <div>
                <span class="text-[10px] text-rose-200 block font-black">Total Points</span>
                <span class="text-2xl font-black text-white">${first.totalPoints || 0}</span>
              </div>
            </div>
          </div>

          <!-- 3rd Place -->
          ${third ? `
            <div class="order-3 md:order-3 modern-card p-6 text-center relative border-slate-200 hover:scale-105 transition-all">
              <div class="w-8 h-8 rounded-full bg-amber-50 text-amber-800 font-black text-sm flex items-center justify-center mx-auto mb-2.5 border border-amber-200">3</div>
              <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-xl mb-3 shadow-md" style="background-color: ${third.color || '#D97706'}">
                ${third.avatar || (third.name ? third.name.substring(0, 2).toUpperCase() : 'RD')}
              </div>
              <h4 class="font-black text-slate-900 text-base">${third.name || 'Anonymous'}</h4>
              <span class="text-xs text-slate-500 block">${third.department || 'Dochase Team'}</span>
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4">
                <div>
                  <span class="text-[10px] text-slate-400 block font-medium">Followers</span>
                  <span class="text-sm font-bold text-slate-800">${third.verifiedFollowerCount || 0}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block font-medium">Points</span>
                  <span class="text-xl font-black text-amber-700">${third.totalPoints || 0}</span>
                </div>
              </div>
            </div>
          ` : `
            <div class="order-3 md:order-3 modern-card p-6 text-center relative border-dashed border-2 border-slate-300">
              <div class="w-8 h-8 rounded-full bg-amber-50 text-amber-800 font-black text-sm flex items-center justify-center mx-auto mb-2.5 border border-amber-200">3</div>
              <div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-amber-50 text-amber-600 font-black text-xl mb-3">
                <i data-lucide="star" class="w-7 h-7 text-amber-600"></i>
              </div>
              <h4 class="font-black text-slate-800 text-sm">3rd Place Open</h4>
              <span class="text-[11px] text-slate-500 block mt-0.5">₦15,000 Cash Prize</span>
            </div>
          `}
        `;
      }
    }

    // Render Table Rows
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-12 text-slate-500 text-sm">
            <div class="max-w-md mx-auto">
              <div class="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <i data-lucide="trophy" class="w-6 h-6"></i>
              </div>
              <p class="font-black text-slate-900 text-base">The challenge leaderboard is live!</p>
              <p class="text-xs text-slate-500 mt-1 mb-4">Sign in to your employee portal, access your personal referral link & 1-click sharing toolkit, and start climbing the ranks.</p>
              <a href="employee.html" class="btn-retain py-2.5 px-5 text-xs font-bold inline-flex items-center gap-1.5 shadow-md">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-white"></i>
                <span>Open Employee Portal</span>
              </a>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = filtered.map((emp) => {
      const isCurrent = currentEmp && emp.id === currentEmp.id;
      const rankBadge = emp.rank === 1 
        ? '<span class="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs inline-flex items-center justify-center shadow-sm">1</span>'
        : emp.rank === 2
        ? '<span class="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-xs inline-flex items-center justify-center">2</span>'
        : emp.rank === 3
        ? '<span class="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs inline-flex items-center justify-center">3</span>'
        : `<span class="text-slate-400 font-mono font-bold">${emp.rank}</span>`;

      return `
        <tr class="hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-rose-50/50 border-l-4 border-l-rose-500' : ''}">
          <td class="py-4 px-6 text-center">${rankBadge}</td>
          
          <td class="py-4 px-6">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0" style="background-color: ${emp.color || '#EF4444'}">
                ${emp.avatar || (emp.name ? emp.name.substring(0, 2).toUpperCase() : 'RD')}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-black text-slate-900">${emp.name || 'Anonymous'}</span>
                  ${isCurrent ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-black uppercase tracking-wider">YOU</span>' : ''}
                </div>
                <span class="text-xs text-slate-400 font-mono">${emp.referralCode || ''}</span>
              </div>
            </div>
          </td>

          <td class="py-4 px-6 text-slate-600 text-xs font-semibold">${emp.department || 'General'}</td>

          <td class="py-4 px-6 text-center font-bold text-slate-800">
            ${emp.verifiedFollowerCount || 0}
          </td>

          <td class="py-4 px-6 text-center font-black text-base ${emp.rank <= 3 ? 'text-rose-600' : 'text-slate-700'}">
            ${emp.totalPoints || 0}
          </td>

          <td class="py-4 px-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-[#FAFBF7] text-slate-700 text-xs font-bold">
              <i data-lucide="${emp.badge?.icon || 'award'}" class="w-3.5 h-3.5 text-rose-500"></i>
              <span>${emp.badge?.name || 'Active Contender'}</span>
            </span>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderTableData();

  // Attach search and filter listeners
  const searchInput = document.getElementById('leaderboard-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderTableData();
    });
  }

  const deptButtons = container.querySelectorAll('.dept-filter-btn');
  deptButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeDept = btn.getAttribute('data-dept');
      deptButtons.forEach(b => {
        b.className = 'dept-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-white hover:bg-slate-100 text-slate-700 border border-slate-200';
      });
      btn.className = 'dept-filter-btn px-4 py-2 rounded-full text-xs font-black transition-all bg-slate-900 text-white shadow-sm';
      renderTableData();
    });
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
