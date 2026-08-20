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
        <span class="category-eyebrow mb-3">(LIVE STANDINGS)</span>
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
      <div class="modern-card p-5 sm:p-6 mb-8 border-slate-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <!-- Department Filter Buttons -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button class="dept-filter-btn px-4 py-2 rounded-full text-xs font-black transition-all bg-slate-900 text-white shadow-sm" data-dept="all">
              All Departments
            </button>
            ${departments.map(dept => `
              <button class="dept-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-white hover:bg-slate-100 text-slate-700 border border-slate-200" data-dept="${dept}">
                ${dept}
              </button>
            `).join('')}
          </div>

          <!-- Search Input -->
          <div class="relative min-w-[240px]">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
            <input type="text" id="leaderboard-search-input" placeholder="Search employee..." class="w-full bg-[#FAFBF7] border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-all" />
          </div>

        </div>
      </div>

      <!-- Leaderboard Table Card -->
      <div class="modern-card border-slate-200 overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-[#FAFBF7] border-b border-slate-200">
              <tr>
                <th class="py-4 px-6 text-center w-16">Rank</th>
                <th class="py-4 px-6">Employee</th>
                <th class="py-4 px-6">Department</th>
                <th class="py-4 px-6 text-center">Verified Followers</th>
                <th class="py-4 px-6 text-center">Total Points</th>
                <th class="py-4 px-6">Achievement Badge</th>
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
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render Podium for Top 3 (from overall leaderboard)
    const overallTop = store.getLeaderboard('all');
    const podiumEl = document.getElementById('leaderboard-podium');
    if (podiumEl && overallTop.length >= 3) {
      const first = overallTop[0];
      const second = overallTop[1];
      const third = overallTop[2];

      podiumEl.innerHTML = `
        <!-- 2nd Place -->
        <div class="order-2 md:order-1 modern-card p-6 text-center relative border-slate-200 hover:scale-105 transition-all">
          <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center mx-auto mb-2.5 border border-slate-200">2</div>
          <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-xl mb-3 shadow-md" style="background-color: ${second.color || '#1E293B'}">
            ${second.avatar}
          </div>
          <h4 class="font-black text-slate-900 text-base">${second.name}</h4>
          <span class="text-xs text-slate-500 block">${second.department}</span>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4">
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">Followers</span>
              <span class="text-sm font-bold text-slate-800">${second.verifiedFollowerCount}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">Points</span>
              <span class="text-xl font-black text-slate-900">${second.totalPoints}</span>
            </div>
          </div>
        </div>

        <!-- 1st Place (Center / Taller / Retain Card) -->
        <div class="order-1 md:order-2 retain-card p-8 text-center relative md:-translate-y-6 shadow-2xl hover:scale-105 transition-all">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FB923C] text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <i data-lucide="crown" class="w-3.5 h-3.5"></i>
            <span>Current Leader</span>
          </div>
          <div class="w-10 h-10 rounded-full bg-white/20 text-white font-black text-base flex items-center justify-center mx-auto mt-2 mb-3 border border-white/20">1</div>
          <div class="w-18 h-18 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-2xl mb-3 shadow-xl ring-4 ring-rose-400/40 bg-white">
            ${first.avatar}
          </div>
          <h4 class="font-black text-white text-lg">${first.name}</h4>
          <span class="text-xs text-rose-200 block font-medium">${first.department}</span>
          <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-center gap-5">
            <div>
              <span class="text-[10px] text-rose-200 block font-medium">Followers</span>
              <span class="text-sm font-bold text-white">${first.verifiedFollowerCount}</span>
            </div>
            <div>
              <span class="text-[10px] text-rose-200 block font-black">Total Points</span>
              <span class="text-2xl font-black text-white">${first.totalPoints}</span>
            </div>
          </div>
        </div>

        <!-- 3rd Place -->
        <div class="order-3 md:order-3 modern-card p-6 text-center relative border-slate-200 hover:scale-105 transition-all">
          <div class="w-8 h-8 rounded-full bg-amber-50 text-amber-800 font-black text-sm flex items-center justify-center mx-auto mb-2.5 border border-amber-200">3</div>
          <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-xl mb-3 shadow-md" style="background-color: ${third.color || '#D97706'}">
            ${third.avatar}
          </div>
          <h4 class="font-black text-slate-900 text-base">${third.name}</h4>
          <span class="text-xs text-slate-500 block">${third.department}</span>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4">
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">Followers</span>
              <span class="text-sm font-bold text-slate-800">${third.verifiedFollowerCount}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">Points</span>
              <span class="text-xl font-black text-amber-700">${third.totalPoints}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Render Table Rows
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-10 text-slate-400 text-sm">
            No employees found matching filter.
          </td>
        </tr>
      `;
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
                ${emp.avatar}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-black text-slate-900">${emp.name}</span>
                  ${isCurrent ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-black uppercase tracking-wider">YOU</span>' : ''}
                </div>
                <span class="text-xs text-slate-400 font-mono">${emp.referralCode}</span>
              </div>
            </div>
          </td>

          <td class="py-4 px-6 text-slate-600 text-xs font-semibold">${emp.department}</td>

          <td class="py-4 px-6 text-center font-bold text-slate-800">
            ${emp.verifiedFollowerCount}
          </td>

          <td class="py-4 px-6 text-center font-black text-base ${emp.rank <= 3 ? 'text-rose-600' : 'text-slate-700'}">
            ${emp.totalPoints}
          </td>

          <td class="py-4 px-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-[#FAFBF7] text-slate-700 text-xs font-bold">
              <i data-lucide="${emp.badge.icon}" class="w-3.5 h-3.5 text-rose-500"></i>
              <span>${emp.badge.name}</span>
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
