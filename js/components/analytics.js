/**
 * Retain Social Growth Challenge - Analytics Dashboard Component (Retain Brand Theme)
 */

import { store } from '../store.js';

let platformChartInstance = null;
let departmentChartInstance = null;

export function renderAnalytics(targetId = 'analytics-container') {
  const container = document.getElementById(targetId) || document.getElementById('analytics-container') || document.getElementById('analytics-section');
  if (!container) return;

  const data = store.getAnalytics();

  container.innerHTML = `
    <div class="py-2">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="category-eyebrow">(CAMPAIGN INTELLIGENCE)</span>
            <span class="text-xs font-bold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Analytics
            </span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-1 mb-1">
            Performance analytics & <span class="marker-highlight">growth</span>.
          </h2>
          <p class="text-slate-600 text-xs sm:text-sm">
            Real-time tracking of organic network expansion, conversion funnel, and team performance.
          </p>
        </div>

        <button id="analytics-export-btn" class="mt-4 md:mt-0 btn-dark-pill text-xs flex items-center gap-2 self-start md:self-auto shadow-sm hover:scale-105 active:scale-95 cursor-pointer">
          <i data-lucide="download" class="w-4 h-4 text-rose-400"></i>
          <span>Download Analytics Report</span>
        </button>
      </div>

      <!-- 8 Key Metrics Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        
        <!-- Metric 1: Verified Followers -->
        <div class="modern-card p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Verified Followers</span>
            <i data-lucide="user-plus" class="w-4 h-4 text-emerald-600"></i>
          </div>
          <span class="text-3xl sm:text-4xl font-black text-slate-900 block">${data.totalVerifiedFollowers}</span>
          <span class="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
            100% Organic Growth
          </span>
        </div>

        <!-- Metric 2: Employee Participation -->
        <div class="modern-card p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Staff Participation</span>
            <i data-lucide="users" class="w-4 h-4 text-slate-700"></i>
          </div>
          <span class="text-3xl sm:text-4xl font-black text-slate-900 block">${data.participationRate}%</span>
          <span class="text-[11px] text-slate-500 mt-1 block font-medium">
            ${data.participatingEmployeesCount} of ${data.totalEmployees} active
          </span>
        </div>

        <!-- Metric 3: Funnel Completion Rate -->
        <div class="modern-card p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Form Completion Rate</span>
            <i data-lucide="target" class="w-4 h-4 text-purple-600"></i>
          </div>
          <span class="text-3xl sm:text-4xl font-black text-slate-900 block">${data.completionRate}%</span>
          <span class="text-[11px] text-slate-500 mt-1 block font-medium">
            ${data.totalSubmissions} of ${data.totalLinkVisits} visits
          </span>
        </div>

        <!-- Metric 4: Multi-Platform Rate -->
        <div class="modern-card p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Multi-Platform Follows</span>
            <i data-lucide="layers" class="w-4 h-4 text-amber-600"></i>
          </div>
          <span class="text-3xl sm:text-4xl font-black text-slate-900 block">${data.multiPlatformRate}%</span>
          <span class="text-[11px] text-slate-500 mt-1 block font-medium">
            Followed 3+ channels
          </span>
        </div>

        <!-- Metric 5: Engaged Followers -->
        <div class="modern-card p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Post Engagements</span>
            <i data-lucide="heart" class="w-4 h-4 text-rose-500"></i>
          </div>
          <span class="text-3xl sm:text-4xl font-black text-slate-900 block">${data.totalEngagements}</span>
          <span class="text-[11px] text-slate-500 mt-1 block font-medium">
            Comments & reactions
          </span>
        </div>

        <!-- Metric 6: Pending Queue -->
        <div class="modern-card p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Pending Review</span>
            <i data-lucide="clock" class="w-4 h-4 text-amber-500"></i>
          </div>
          <span class="text-3xl sm:text-4xl font-black text-slate-700 block">${data.pendingCount}</span>
          <span class="text-[11px] text-slate-500 mt-1 block font-medium">
            ${data.rejectedCount} rejected / invalid
          </span>
        </div>

        <!-- Metric 7: Link Visits -->
        <div class="modern-card p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Campaign Page Views</span>
            <i data-lucide="mouse-pointer" class="w-4 h-4 text-slate-700"></i>
          </div>
          <span class="text-3xl sm:text-4xl font-black text-slate-900 block">${data.totalLinkVisits.toLocaleString()}</span>
          <span class="text-[11px] text-slate-500 mt-1 block font-medium">
            Unique visits
          </span>
        </div>

        <!-- Metric 8: 30-Day Retention Forecast -->
        <div class="modern-card p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>30-Day Retention Est.</span>
            <i data-lucide="shield-check" class="w-4 h-4 text-teal-600"></i>
          </div>
          <span class="text-3xl sm:text-4xl font-black text-teal-700 block">${data.retentionRate}%</span>
          <span class="text-[11px] text-teal-700 font-bold mt-1 block">
            High organic affinity
          </span>
        </div>

      </div>

      <!-- Charts Section Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        <!-- Platform Distribution Chart -->
        <div class="lg:col-span-6 modern-card p-8 border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="pie-chart" class="w-4 h-4 text-rose-600"></i>
              <span>Growth by Social Platform</span>
            </h3>
            <span class="text-xs text-slate-500 font-medium">Verified counts</span>
          </div>
          <div class="relative h-64 flex items-center justify-center">
            <canvas id="platform-distribution-chart"></canvas>
          </div>
        </div>

        <!-- Department Performance Chart -->
        <div class="lg:col-span-6 modern-card p-8 border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="bar-chart-3" class="w-4 h-4 text-rose-600"></i>
              <span>Department Performance Breakdown</span>
            </h3>
            <span class="text-xs text-slate-500 font-medium">Total verified points</span>
          </div>
          <div class="relative h-64 flex items-center justify-center">
            <canvas id="department-performance-chart"></canvas>
          </div>
        </div>

      </div>

      <!-- Department Performance Table -->
      <div class="modern-card border-slate-200 overflow-hidden shadow-xl">
        <div class="p-5 bg-[#FAFBF7] border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-sm font-black text-slate-900">Department Leaderboard Summary</h3>
          <span class="text-xs text-rose-600 font-bold flex items-center gap-1.5">
            <i data-lucide="award" class="w-3.5 h-3.5"></i>
            <span>Department Standings</span>
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-[#FAFBF7] border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-5">Department</th>
                <th class="py-3.5 px-5 text-center">Team Members</th>
                <th class="py-3.5 px-5 text-center">Verified Followers Gained</th>
                <th class="py-3.5 px-5 text-center">Total Department Points</th>
                <th class="py-3.5 px-5 text-right">Points per Member</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${Object.entries(data.departmentPerformance).length === 0 ? `
                <tr>
                  <td colspan="5" class="text-center py-8 text-slate-400 text-xs font-medium">
                    No department data available yet.
                  </td>
                </tr>
              ` : Object.entries(data.departmentPerformance).map(([dept, d]) => {
                const avg = d.employeeCount > 0 ? (d.totalPoints / d.employeeCount).toFixed(1) : '0';
                return `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-3.5 px-5 font-black text-slate-900">${dept}</td>
                    <td class="py-3.5 px-5 text-center font-mono font-bold">${d.employeeCount}</td>
                    <td class="py-3.5 px-5 text-center font-bold text-emerald-700">+${d.verifiedFollowers}</td>
                    <td class="py-3.5 px-5 text-center font-black text-slate-900 text-sm">${d.totalPoints}</td>
                    <td class="py-3.5 px-5 text-right font-mono text-slate-600 font-bold">${avg} pts/emp</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Initialize Chart.js charts
  initCharts(data);

  const exportBtn = document.getElementById('analytics-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      store.exportCSV('leaderboard');
      window.showToast('Analytics & Leaderboard CSV downloaded.', 'success');
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function initCharts(data) {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Platform breakdown
  const platCanvas = document.getElementById('platform-distribution-chart');
  if (platCanvas) {
    const labels = ['LinkedIn', 'Instagram', 'X (Twitter)', 'TikTok', 'Facebook', 'YouTube'];
    const platformData = [
      data.platformBreakdown.linkedin || 0,
      data.platformBreakdown.instagram || 0,
      data.platformBreakdown.x || 0,
      data.platformBreakdown.tiktok || 0,
      data.platformBreakdown.facebook || 0,
      data.platformBreakdown.youtube || 0
    ];

    if (platformChartInstance) platformChartInstance.destroy();

    platformChartInstance = new Chart(platCanvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: platformData,
          backgroundColor: [
            '#0A66C2',
            '#E1306C',
            '#0F172A',
            '#EF4444',
            '#1877F2',
            '#FB923C'
          ],
          borderColor: '#FFFFFF',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#475569', boxWidth: 12, font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } }
          }
        }
      }
    });
  }

  // Chart 2: Department points
  const deptCanvas = document.getElementById('department-performance-chart');
  if (deptCanvas) {
    const deptLabels = Object.keys(data.departmentPerformance);
    const deptPoints = deptLabels.map(k => data.departmentPerformance[k].totalPoints);

    if (departmentChartInstance) departmentChartInstance.destroy();

    departmentChartInstance = new Chart(deptCanvas, {
      type: 'bar',
      data: {
        labels: deptLabels.map(l => l.length > 15 ? l.substring(0, 13) + '...' : l),
        datasets: [{
          label: 'Total Points',
          data: deptPoints,
          backgroundColor: '#EF4444',
          hoverBackgroundColor: '#E11D48',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#64748B', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#64748B', font: { size: 10 } },
            grid: { color: '#E2E8F0' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
