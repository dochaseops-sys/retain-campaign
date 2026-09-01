/**
 * Retain Social Growth Challenge - Administrator Control Center Component (Retain Brand Theme)
 */

import { store } from '../store.js';
import { firebaseService } from '../firebase-config.js';
import { getSocialIcon } from '../icons.js';
import { renderAnalytics } from './analytics.js';
import { getReferralUrl } from '../scoring.js';

let currentActiveAdminTab = 'submissions';

export function renderAdminPortal() {
  const container = document.getElementById('admin-portal-section');
  if (!container) return;

  const state = store.getState();
  const { submissions, employees, settings, auditLogs } = state;

  // Duplicate detection map
  const emailCounts = {};
  const handleCounts = {};
  submissions.forEach(s => {
    const e = s.email.toLowerCase();
    const h = s.handle.toLowerCase();
    emailCounts[e] = (emailCounts[e] || 0) + 1;
    handleCounts[h] = (handleCounts[h] || 0) + 1;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const verifiedCount = submissions.filter(s => s.status === 'verified').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <!-- Admin Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h2 class="text-3xl font-black text-slate-900">
            Campaign Control <span class="marker-highlight">Center</span>
          </h2>
        </div>

        <!-- Quick Admin Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5">
          <button id="admin-export-csv-btn" class="btn-outline-pill text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm">
            <i data-lucide="download" class="w-4 h-4 text-slate-700"></i>
            <span>Export CSV</span>
          </button>
          <button id="admin-publish-winner-btn" class="btn-retain text-xs py-2 px-4 flex items-center gap-1.5">
            <i data-lucide="award" class="w-4 h-4 text-white"></i>
            <span>${settings.winnerPublished ? 'Winner Finalized' : 'Finalize Winner'}</span>
          </button>
          <button id="admin-reset-demo-btn" class="px-3 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition-all" title="Reset campaign data to clean initial state">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- Admin Navigation Tabs (4 Cohesive Tabs) -->
      <div class="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-none">
        <button class="admin-tab-btn px-4 py-2.5 text-xs ${currentActiveAdminTab === 'submissions' ? 'font-black border-b-2 border-rose-600 text-rose-600' : 'font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900'} flex items-center gap-2" data-tab="submissions">
          <i data-lucide="list-checks" class="w-4 h-4"></i>
          <span>Submissions Queue</span>
          <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">${pendingCount} pending</span>
        </button>
        <button class="admin-tab-btn px-4 py-2.5 text-xs ${currentActiveAdminTab === 'employees' ? 'font-black border-b-2 border-rose-600 text-rose-600' : 'font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900'} flex items-center gap-2" data-tab="employees">
          <i data-lucide="users" class="w-4 h-4"></i>
          <span>Employees & Points Audit</span>
          <span class="text-slate-400 text-[10px]">(${employees.length})</span>
        </button>
        <button class="admin-tab-btn px-4 py-2.5 text-xs ${currentActiveAdminTab === 'settings' ? 'font-black border-b-2 border-rose-600 text-rose-600' : 'font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900'} flex items-center gap-2" data-tab="settings">
          <i data-lucide="settings" class="w-4 h-4"></i>
          <span>Campaign Settings & Toolkit</span>
        </button>
        <button class="admin-tab-btn px-4 py-2.5 text-xs ${currentActiveAdminTab === 'analytics' ? 'font-black border-b-2 border-rose-600 text-rose-600' : 'font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900'} flex items-center gap-2" data-tab="analytics">
          <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
          <span>Campaign Intelligence</span>
        </button>
      </div>

      <!-- TAB 1: Submissions Queue -->
      <div id="admin-tab-submissions" class="admin-tab-pane ${currentActiveAdminTab === 'submissions' ? '' : 'hidden'}">
        
        <!-- Queue Filter Bar -->
        <div class="modern-card p-4 sm:p-5 border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm min-w-0">
          <div class="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap min-w-0">
            <button class="sub-filter-btn px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-900 text-white shadow-sm flex-shrink-0" data-status="all">
              All (${submissions.length})
            </button>
            <button class="sub-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAFBF7] text-slate-700 hover:bg-slate-100 border border-slate-200 flex-shrink-0" data-status="pending">
              Pending (${pendingCount})
            </button>
            <button class="sub-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAFBF7] text-slate-700 hover:bg-slate-100 border border-slate-200 flex-shrink-0" data-status="verified">
              Verified (${verifiedCount})
            </button>
            <button class="sub-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAFBF7] text-slate-700 hover:bg-slate-100 border border-slate-200 flex-shrink-0" data-status="rejected">
              Rejected (${rejectedCount})
            </button>
          </div>

          <div class="relative w-full sm:w-auto min-w-[220px]">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
            <input type="text" id="admin-submission-search" placeholder="Search name, handle, code..." class="w-full bg-[#FAFBF7] border border-slate-200 rounded-full pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500" />
          </div>
        </div>

        <!-- Submissions Table -->
        <div class="modern-card border-slate-200 overflow-hidden shadow-xl min-w-0">
          <div class="overflow-x-auto w-full">
            <table class="w-full text-left text-xs text-slate-700 min-w-[700px]">
              <thead class="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-[#FAFBF7] border-b border-slate-200">
                <tr>
                  <th class="py-3.5 px-4">Follower Details</th>
                  <th class="py-3.5 px-4">Social Handle</th>
                  <th class="py-3.5 px-4">Platforms</th>
                  <th class="py-3.5 px-4">Referrer (Code)</th>
                  <th class="py-3.5 px-4">Engaged?</th>
                  <th class="py-3.5 px-4">Status / Duplicate Check</th>
                  <th class="py-3.5 px-4 text-center">Points</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="admin-submissions-tbody" class="divide-y divide-slate-100 font-medium">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- TAB 2: Employees & Points Audit (Combined) -->
      <div id="admin-tab-employees" class="admin-tab-pane ${currentActiveAdminTab === 'employees' ? '' : 'hidden'} space-y-8">
        
        <!-- Section A: Employee Directory & Add Form -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Add New Employee Form -->
          <div class="lg:col-span-4 modern-card p-7 border-slate-200 h-fit shadow-sm">
            <h3 class="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <i data-lucide="user-plus" class="w-4 h-4 text-rose-600"></i>
              <span>Add Eligible Employee</span>
            </h3>
            <p class="text-xs text-slate-500 mb-5">Generates a unique, non-guessable referral code automatically (e.g. RETAIN-...).</p>

            <form id="admin-add-emp-form" class="space-y-4">
              <div>
                <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Full Name *</label>
                <input type="text" id="new-emp-name" required placeholder="e.g. Samuel Adekunle" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500" />
              </div>

              <div>
                <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Official Email *</label>
                <input type="email" id="new-emp-email" required placeholder="s.adekunle@retaindigital.io" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500" />
              </div>

              <div>
                <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Department *</label>
                <select id="new-emp-dept" required class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500">
                  <option value="Sales">Sales</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Monetisation">Monetisation</option>
                </select>
              </div>

              <button type="submit" class="w-full py-3 rounded-full bg-slate-900 text-white font-bold text-xs shadow-md transition-all hover:bg-slate-800 cursor-pointer">
                Add & Generate Referral Code
              </button>
            </form>
          </div>

          <!-- Employees Directory List -->
          <div class="lg:col-span-8 modern-card border-slate-200 overflow-hidden shadow-xl">
            <div class="p-5 bg-[#FAFBF7] border-b border-slate-200 flex items-center justify-between">
              <h4 class="text-sm font-black text-slate-900">Registered Employees (${employees.length})</h4>
              <span class="text-xs text-slate-500 font-medium">All unique referral codes active</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-[#FAFBF7] border-b border-slate-200">
                  <tr>
                    <th class="py-3 px-4">Employee</th>
                    <th class="py-3 px-4">Department</th>
                    <th class="py-3 px-4">Referral Code</th>
                    <th class="py-3 px-4 text-center">Referrals</th>
                    <th class="py-3 px-4 text-center">Points</th>
                    <th class="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-employees-tbody" class="divide-y divide-slate-100 font-medium">
                  <!-- Dynamically populated -->
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Section B: Manual Point Adjustment & Audit Trail -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-slate-200/80">
          
          <!-- Adjustment Action Box -->
          <div class="lg:col-span-4 modern-card p-7 border-slate-200 h-fit shadow-sm">
            <h3 class="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <i data-lucide="sliders" class="w-4 h-4 text-amber-600"></i>
              <span>Manual Point Adjustment</span>
            </h3>
            <p class="text-xs text-slate-500 mb-5">Mandatory audit trail recorded for every point modification.</p>

            <form id="admin-adjust-points-form" class="space-y-4">
              <div>
                <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Target Employee *</label>
                <select id="adjust-emp-id" required class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500">
                  ${employees.length > 0 ? employees.map(e => `
                    <option value="${e.id}">${e.name} (${e.referralCode})</option>
                  `).join('') : '<option value="" disabled selected>No registered employees yet</option>'}
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Point Delta (+ or -) *</label>
                <input type="number" id="adjust-points-delta" required placeholder="e.g. +2 or -1" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500" />
              </div>

              <div>
                <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Mandatory Audit Note *</label>
                <textarea id="adjust-points-note" required rows="3" placeholder="Explain the reason (e.g. special bonus for viral post / corrected duplicate attribution)..." class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"></textarea>
              </div>

              <button type="submit" class="w-full py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md transition-all cursor-pointer">
                Apply & Record Audit Entry
              </button>
            </form>
          </div>

          <!-- Audit Log Stream -->
          <div class="lg:col-span-8 modern-card border-slate-200 overflow-hidden shadow-xl min-w-0">
            <div class="p-5 bg-[#FAFBF7] border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <h4 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="shield" class="w-4 h-4 text-slate-700"></i>
                <span>Official Verification & Audit Trail (${auditLogs.length})</span>
              </h4>
              <button id="export-audit-csv-btn" class="text-xs text-slate-700 hover:underline font-bold cursor-pointer">Export Audit CSV</button>
            </div>
            <div class="p-4 divide-y divide-slate-100 max-h-[450px] overflow-y-auto font-medium min-w-0">
              ${auditLogs.length === 0 ? `
                <div class="py-12 text-center text-slate-400 text-xs">
                  <i data-lucide="shield" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
                  <p class="font-bold text-slate-500">No audit events recorded yet.</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Audit events will be logged in real time when submissions are verified or points adjusted.</p>
                </div>
              ` : auditLogs.map(log => `
                <div class="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 min-w-0">
                  <div class="flex items-start gap-3 min-w-0 flex-1">
                    <div class="w-9 h-9 rounded-xl bg-[#FAFBF7] border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                      <i data-lucide="file-text" class="w-4 h-4"></i>
                    </div>
                    <div class="min-w-0 flex-1 break-words">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-black text-slate-900 text-xs">${log.action}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono font-bold flex-shrink-0">${log.pointsChange || '0'}</span>
                        <span class="text-[11px] text-slate-500">&bull; by ${log.actor}</span>
                      </div>
                      <p class="text-xs text-slate-700 mt-0.5 break-words">Target: <strong class="font-bold">${log.target}</strong></p>
                      <p class="text-xs text-slate-500 mt-0.5 italic break-words">"${log.note}"</p>
                    </div>
                  </div>
                  <span class="text-[10px] text-slate-400 whitespace-nowrap font-mono flex-shrink-0 sm:self-start self-end">
                    ${new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>

      <!-- TAB 3: Campaign Settings & Toolkit (Combined) -->
      <div id="admin-tab-settings" class="admin-tab-pane ${currentActiveAdminTab === 'settings' ? '' : 'hidden'} space-y-8">
        
        <!-- Part 1: Campaign Configuration & Social Links -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Campaign Config Form -->
          <div class="lg:col-span-5 space-y-6">
            
            <div class="modern-card p-7 border-slate-200 shadow-sm">
              <h3 class="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <i data-lucide="calendar" class="w-4 h-4 text-slate-700"></i>
                <span>Campaign Dates & Copy</span>
              </h3>

              <form id="admin-campaign-settings-form" class="space-y-4">
                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Campaign Title</label>
                  <input type="text" id="settings-title" value="${settings.title || ''}" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" />
                </div>

                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Tagline</label>
                  <input type="text" id="settings-tagline" value="${settings.tagline || ''}" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">Start Date</label>
                    <input type="date" id="settings-start-date" value="${settings.startDate || '2026-09-01'}" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">End Date</label>
                    <input type="date" id="settings-end-date" value="${(settings.endDate || '2026-09-30').slice(0, 10)}" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" />
                  </div>
                </div>

                <button type="submit" class="w-full py-3 rounded-full bg-slate-900 text-white font-black text-xs shadow-md hover:bg-slate-800 transition-all cursor-pointer">
                  Save Campaign Configuration
                </button>
              </form>
            </div>

            <!-- Prize Rewards & Amounts Card -->
            <div class="modern-card p-7 border-slate-200 shadow-sm">
              <h3 class="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
                <i data-lucide="trophy" class="w-4 h-4 text-rose-600"></i>
                <span>Prize Tiers & Rewards</span>
              </h3>
              <p class="text-xs text-slate-500 mb-4">Edit the 1st, 2nd, and 3rd place prizes shown across the challenge.</p>

              <form id="admin-prizes-form" class="space-y-4">
                <div class="p-3.5 rounded-xl bg-[#FAFBF7] border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                      <span>1st Place Grand Champion</span>
                    </span>
                    <span class="text-[10px] font-bold text-rose-600 uppercase">Top Prize</span>
                  </div>
                  <input type="text" id="prize-first-reward" value="${settings.prizes?.first?.reward || '₦50,000 Cash Prize'}" placeholder="e.g. ₦50,000 Cash Prize" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500" />
                  <input type="text" id="prize-first-desc" value="${settings.prizes?.first?.desc || 'Awarded to the #1 overall growth champion with the highest verified score + executive gold trophy'}" placeholder="Reward details & trophy" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:border-rose-500" />
                </div>

                <div class="p-3.5 rounded-xl bg-[#FAFBF7] border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">2</span>
                      <span>2nd Place Runner-Up</span>
                    </span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase">Silver</span>
                  </div>
                  <input type="text" id="prize-second-reward" value="${settings.prizes?.second?.reward || '₦30,000 Cash Prize'}" placeholder="e.g. ₦30,000 Cash Prize" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500" />
                  <input type="text" id="prize-second-desc" value="${settings.prizes?.second?.desc || 'Awarded to the #2 ranked employee on the final verified leaderboard + executive silver plaque'}" placeholder="Reward details & plaque" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:border-rose-500" />
                </div>

                <div class="p-3.5 rounded-xl bg-[#FAFBF7] border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[10px] flex items-center justify-center font-bold">3</span>
                      <span>3rd Place 2nd Runner-Up</span>
                    </span>
                    <span class="text-[10px] font-bold text-amber-700 uppercase">Bronze</span>
                  </div>
                  <input type="text" id="prize-third-reward" value="${settings.prizes?.third?.reward || '₦15,000 Cash Prize'}" placeholder="e.g. ₦15,000 Cash Prize" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500" />
                  <input type="text" id="prize-third-desc" value="${settings.prizes?.third?.desc || 'Awarded to the #3 ranked employee on the final verified leaderboard'}" placeholder="Reward details" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:border-rose-500" />
                </div>

                <button type="submit" class="w-full py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all cursor-pointer">
                  Save Prize Rewards
                </button>
              </form>
            </div>

            <!-- Broadcast Announcement Banner -->
            <div class="modern-card p-7 border-slate-200 shadow-sm">
              <h3 class="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
                <i data-lucide="megaphone" class="w-4 h-4 text-amber-600"></i>
                <span>Broadcast Pinned Announcement</span>
              </h3>
              <p class="text-xs text-slate-500 mb-3">Displays a high-visibility banner across the entire landing page.</p>

              <form id="admin-announcement-form" class="space-y-3">
                <textarea id="announcement-text" rows="2" placeholder="e.g. Double bonus points active for all 6-platform follows this week!" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500">${settings.announcement?.message || ''}</textarea>
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" id="announcement-enabled" ${settings.announcement?.enabled ? 'checked' : ''} class="rounded bg-white text-slate-900" />
                    <span>Show Banner</span>
                  </label>
                  <button type="submit" class="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer">
                    Update Announcement
                  </button>
                </div>
              </form>
            </div>

          </div>

          <!-- Social Links Manager & Editor (Live Editable Platforms) -->
          <div class="lg:col-span-7">
            <div class="modern-card p-7 border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                  <i data-lucide="share-2" class="w-4 h-4 text-rose-600"></i>
                  <span>Official Social Links & Channels</span>
                </h3>
                <span class="text-xs font-bold text-rose-600 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">Live Editable</span>
              </div>
              <p class="text-xs text-slate-500 mb-6">
                Edit platform URLs, handles, baseline counts, and active status. Changes update immediately across all follower and employee views.
              </p>

              <div class="space-y-3.5">
                ${Object.entries(settings.platforms || {}).map(([key, p]) => `
                  <div class="p-4 rounded-2xl bg-[#FAFBF7] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-400 transition-all">
                    
                    <div class="flex items-center gap-3.5">
                      <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm p-2">
                        ${getSocialIcon(key, 'w-5 h-5 text-rose-400')}
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-black text-slate-900">${p.name}</span>
                          ${p.enabled ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Active</span>' : '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Disabled</span>'}
                        </div>
                        <span class="text-[11px] text-slate-500 font-mono block truncate">${p.handle}</span>
                        <a href="${p.url}" target="_blank" class="text-[10px] text-rose-600 hover:underline truncate block font-mono">
                          ${p.url}
                        </a>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 self-end sm:self-center">
                      <div class="text-right hidden sm:block">
                        <span class="text-[10px] text-slate-400 block font-medium">Followers</span>
                        <span class="text-xs font-bold text-slate-800 font-mono">${((p.baseline || 0) + (p.campaignGrowth || 0)).toLocaleString()}</span>
                      </div>

                      <button class="edit-platform-btn px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs transition-all flex items-center gap-1 shadow-sm cursor-pointer" data-key="${key}">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5 text-slate-600"></i>
                        <span>Edit</span>
                      </button>

                      <label class="relative inline-flex items-center cursor-pointer ml-1">
                        <input type="checkbox" data-platform="${key}" ${p.enabled ? 'checked' : ''} class="platform-toggle-cb sr-only peer" />
                        <div class="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                      </label>
                    </div>

                  </div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>

        <!-- Part 2: Pre-Written Outreach Templates Manager -->
        <div class="modern-card p-8 border-slate-200 shadow-sm pt-8 border-t border-slate-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="category-eyebrow">(OUTREACH TOOLKIT MANAGER)</span>
                <span class="text-xs font-bold text-rose-600 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">Live Editable</span>
              </div>
              <h3 class="text-xl font-black text-slate-900">Pre-Written Outreach Templates</h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Customize the pre-written messages provided to employees for 1-click sharing across WhatsApp, LinkedIn, Email, and X.
              </p>
            </div>
          </div>

          <!-- Tokens helper bar -->
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 text-xs text-amber-900 font-medium">
              <i data-lucide="info" class="w-4 h-4 text-amber-700 flex-shrink-0"></i>
              <span>Dynamic tokens automatically replaced for each employee:</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-mono text-[11px] font-bold text-slate-800">{link} <span class="font-normal text-slate-500">= Referral Link</span></span>
              <span class="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-mono text-[11px] font-bold text-slate-800">{code} <span class="font-normal text-slate-500">= Referral Code</span></span>
              <span class="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-mono text-[11px] font-bold text-slate-800">{name} <span class="font-normal text-slate-500">= Employee Name</span></span>
            </div>
          </div>

          <!-- Templates Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${Object.entries(settings.templates || {}).map(([key, t]) => `
              <div class="p-6 rounded-2xl bg-[#FAFBF7] border border-slate-200 flex flex-col justify-between group hover:border-slate-400 transition-all">
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center p-2 shadow-sm">
                        ${getSocialIcon(key, 'w-5 h-5 text-rose-400')}
                      </div>
                      <div>
                        <h4 class="text-sm font-black text-slate-900">${t.platform || t.title}</h4>
                        <span class="text-[10px] text-slate-400 font-medium">${t.title}</span>
                      </div>
                    </div>

                    <button class="edit-template-btn px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer" data-key="${key}">
                      <i data-lucide="edit-3" class="w-3.5 h-3.5 text-slate-600"></i>
                      <span>Edit Template</span>
                    </button>
                  </div>

                  ${t.subject ? `
                    <div class="mb-3 p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                      <span class="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Subject Line:</span>
                      <span class="font-semibold text-slate-800">${t.subject}</span>
                    </div>
                  ` : ''}

                  <div class="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans max-h-40 overflow-y-auto">
                    <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Message Body:</span>
                    <p class="whitespace-pre-line">${t.template}</p>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span class="flex items-center gap-1">
                    <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i>
                    <span>Active in employee toolkit</span>
                  </span>
                  <button class="quick-test-copy-btn text-xs font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-1" data-text="${encodeURIComponent(t.template)}">
                    <i data-lucide="copy" class="w-3 h-3"></i>
                    <span>Copy Raw</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

        </div>

      </div>

      <!-- TAB 4: Campaign Intelligence & Performance Analytics -->
      <div id="admin-tab-analytics" class="admin-tab-pane ${currentActiveAdminTab === 'analytics' ? '' : 'hidden'}">
        <div id="analytics-container" class="modern-card p-6 sm:p-10 border-slate-200 shadow-sm bg-white"></div>
      </div>

    </div>
  `;

  // Render Submissions Table Rows
  let activeStatusFilter = 'all';
  let submissionSearchTerm = '';

  function renderSubmissionsRows() {
    const tbody = document.getElementById('admin-submissions-tbody');
    if (!tbody) return;

    let filtered = submissions;
    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === activeStatusFilter);
    }
    if (submissionSearchTerm) {
      filtered = filtered.filter(s => 
        s.fullName.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
        s.handle.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
        s.employeeCode.toLowerCase().includes(submissionSearchTerm.toLowerCase())
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-10 text-slate-400 text-xs">
            No submissions found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(sub => {
      const isDuplicateEmail = emailCounts[sub.email.toLowerCase()] > 1;
      const isDuplicateHandle = handleCounts[sub.handle.toLowerCase()] > 1;
      const emp = store.getEmployeeByCode(sub.employeeCode);

      const statusBadge = sub.status === 'verified'
        ? '<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">Verified</span>'
        : sub.status === 'pending'
        ? '<span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px]">Pending</span>'
        : '<span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[10px]">Rejected</span>';

      const duplicateWarning = (isDuplicateEmail || isDuplicateHandle)
        ? `<div class="mt-1 text-[10px] text-amber-700 font-bold flex items-center gap-1">
             <i data-lucide="alert-circle" class="w-3 h-3"></i>
             <span>${isDuplicateEmail ? 'Duplicate Email' : 'Duplicate Handle'}</span>
           </div>`
        : '';

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-4 min-w-[160px]">
            <span class="font-bold text-slate-900 block truncate max-w-[180px]" title="${sub.fullName}">${sub.fullName}</span>
            <span class="text-[11px] text-slate-500 font-mono block truncate max-w-[180px]" title="${sub.email}">${sub.email}</span>
          </td>

          <td class="py-3.5 px-4 font-mono text-slate-900 font-bold min-w-[120px]">
            <span class="truncate block max-w-[140px]" title="${sub.handle}">${sub.handle}</span>
          </td>

          <td class="py-3.5 px-4 min-w-[140px]">
            <div class="flex items-center gap-1 flex-wrap">
              ${(sub.platforms || []).map(p => `
                <span class="px-2 py-0.5 rounded-md bg-[#FAFBF7] border border-slate-200 text-[9px] text-slate-700 font-semibold uppercase">${p}</span>
              `).join('')}
            </div>
          </td>

          <td class="py-3.5 px-4 min-w-[140px]">
            <span class="font-mono font-bold text-slate-900 block truncate max-w-[140px]" title="${sub.employeeCode}">${sub.employeeCode}</span>
            <span class="text-[10px] text-slate-500 block truncate max-w-[140px]">${emp ? emp.name : 'Unknown Staff'}</span>
          </td>

          <td class="py-3.5 px-4 whitespace-nowrap">
            ${sub.engaged ? '<span class="text-emerald-700 font-bold">Yes (+1)</span>' : '<span class="text-slate-400">No</span>'}
          </td>

          <td class="py-3.5 px-4 min-w-[160px]">
            <div class="break-words">
              ${statusBadge}
              ${duplicateWarning}
              ${sub.rejectionReason ? `<p class="text-[10px] text-rose-600 italic mt-0.5 break-words">"${sub.rejectionReason}"</p>` : ''}
            </div>
          </td>

          <td class="py-3.5 px-4 text-center font-black whitespace-nowrap ${sub.status === 'verified' ? 'text-slate-900 text-sm' : 'text-slate-400'}">
            ${sub.pointsAwarded || 0} pts
          </td>

          <td class="py-3.5 px-4 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1.5">
              ${sub.status !== 'verified' ? `
                <button class="admin-verify-btn p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white transition-all" data-id="${sub.id}" title="Verify Submission">
                  <i data-lucide="check" class="w-4 h-4"></i>
                </button>
              ` : ''}
              ${sub.status !== 'rejected' ? `
                <button class="admin-reject-btn p-1.5 rounded-lg bg-rose-100 hover:bg-rose-600 text-rose-800 hover:text-white transition-all" data-id="${sub.id}" title="Reject Submission">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>
              ` : ''}
              <button class="admin-delete-btn p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-all" data-id="${sub.id}" title="Delete Record">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row action listeners
    tbody.querySelectorAll('.admin-verify-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.verifySubmission(id, 'Admin Verified');
        window.showToast('Submission verified and points awarded!', 'success');
      });
    });

    tbody.querySelectorAll('.admin-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.openRejectModal(id);
      });
    });

    tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this submission record?')) {
          store.deleteSubmission(id);
          window.showToast('Submission deleted.', 'info');
        }
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Render Employees Table Rows
  function renderEmployeesTable() {
    const tbody = document.getElementById('admin-employees-tbody');
    if (!tbody) return;

    if (employees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-10 text-slate-400 text-xs font-medium">
            No employees registered yet. Employees will appear here once they register on the employee portal.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = employees.map(emp => {
      const stats = store.getEmployeeStats(emp.id);
      const personalizedLink = getReferralUrl(emp.referralCode);

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style="background-color: ${emp.color || '#EF4444'}">
              ${emp.avatar}
            </div>
            <span>${emp.name}</span>
          </td>
          <td class="py-3.5 px-4 text-slate-600">${emp.department}</td>
          <td class="py-3.5 px-4 font-mono font-bold text-slate-900">${emp.referralCode}</td>
          <td class="py-3.5 px-4 text-center font-bold text-slate-900">${stats ? stats.verifiedReferrals : 0}</td>
          <td class="py-3.5 px-4 text-center font-black text-slate-900">${stats ? stats.totalPoints : 0}</td>
          <td class="py-3.5 px-4 text-right">
            <button class="copy-emp-link-btn text-xs text-slate-700 hover:text-slate-950 font-bold cursor-pointer" data-code="${emp.referralCode}">
              Copy Link
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.copy-emp-link-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        const link = getReferralUrl(code);
        navigator.clipboard.writeText(link);
        window.showToast(`Copied link for ${code}`, 'success');
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Initial render
  renderSubmissionsRows();
  renderEmployeesTable();
  if (currentActiveAdminTab === 'analytics') {
    renderAnalytics('analytics-container');
  }

  // Tab switching
  const tabBtns = container.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      currentActiveAdminTab = tabName;
      tabBtns.forEach(b => {
        b.className = 'admin-tab-btn px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-2';
      });
      btn.className = 'admin-tab-btn px-4 py-2.5 text-xs font-black border-b-2 border-rose-600 text-rose-600 flex items-center gap-2';

      container.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.add('hidden'));
      const activePane = document.getElementById(`admin-tab-${tabName}`);
      if (activePane) activePane.classList.remove('hidden');

      if (tabName === 'employees') renderEmployeesTable();
      if (tabName === 'submissions') renderSubmissionsRows();
      if (tabName === 'analytics') {
        renderAnalytics('analytics-container');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  });

  // Filter Submissions
  container.querySelectorAll('.sub-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeStatusFilter = btn.getAttribute('data-status');
      container.querySelectorAll('.sub-filter-btn').forEach(b => {
        b.className = 'sub-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAFBF7] text-slate-700 hover:bg-slate-100 border border-slate-200';
      });
      btn.className = 'sub-filter-btn px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-900 text-white shadow-sm';
      renderSubmissionsRows();
    });
  });

  const subSearchInput = document.getElementById('admin-submission-search');
  if (subSearchInput) {
    subSearchInput.addEventListener('input', (e) => {
      submissionSearchTerm = e.target.value;
      renderSubmissionsRows();
    });
  }

  // Edit Platform Buttons
  container.querySelectorAll('.edit-platform-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const platKey = btn.getAttribute('data-key');
      if (window.openEditPlatformModal) {
        window.openEditPlatformModal(platKey);
      }
    });
  });

  // Edit Outreach Template Buttons
  container.querySelectorAll('.edit-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tmplKey = btn.getAttribute('data-key');
      if (window.openEditTemplateModal) {
        window.openEditTemplateModal(tmplKey);
      }
    });
  });

  // Quick Test Copy buttons in Template Manager
  container.querySelectorAll('.quick-test-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const raw = decodeURIComponent(btn.getAttribute('data-text') || '');
      if (raw) {
        navigator.clipboard.writeText(raw);
        window.showToast('Raw template text copied to clipboard.', 'info');
      }
    });
  });

  // Forms
  const addEmpForm = document.getElementById('admin-add-emp-form');
  if (addEmpForm) {
    addEmpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-emp-name').value.trim();
      const email = document.getElementById('new-emp-email').value.trim();
      const dept = document.getElementById('new-emp-dept').value;

      try {
        const emp = store.registerEmployee(name, email, dept);
        addEmpForm.reset();
        renderEmployeesTable();
        window.showToast(`Added ${emp.name} with code ${emp.referralCode}`, 'success');
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  const adjustForm = document.getElementById('admin-adjust-points-form');
  if (adjustForm) {
    adjustForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = document.getElementById('adjust-emp-id').value;
      const delta = parseInt(document.getElementById('adjust-points-delta').value, 10);
      const note = document.getElementById('adjust-points-note').value.trim();

      if (isNaN(delta) || !note) {
        window.showToast('Please provide a valid delta and audit note.', 'error');
        return;
      }

      store.adjustEmployeePoints(empId, delta, note, 'Admin (Manual Adjustment)');
      adjustForm.reset();
      window.showToast('Points adjusted and audit entry logged.', 'success');
    });
  }

  const settingsForm = document.getElementById('admin-campaign-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('settings-title').value.trim();
      const tagline = document.getElementById('settings-tagline').value.trim();
      const startDate = document.getElementById('settings-start-date').value;
      const endDate = document.getElementById('settings-end-date').value;

      store.updateSettings({ title, tagline, startDate, endDate });
      window.showToast('Campaign settings updated.', 'success');
    });
  }

  const prizesForm = document.getElementById('admin-prizes-form');
  if (prizesForm) {
    prizesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstReward = document.getElementById('prize-first-reward').value.trim();
      const firstDesc = document.getElementById('prize-first-desc').value.trim();
      const secondReward = document.getElementById('prize-second-reward').value.trim();
      const secondDesc = document.getElementById('prize-second-desc').value.trim();
      const thirdReward = document.getElementById('prize-third-reward').value.trim();
      const thirdDesc = document.getElementById('prize-third-desc').value.trim();

      const existingPrizes = store.getState().settings.prizes || {};
      store.updatePrizes({
        first: { ...existingPrizes.first, reward: firstReward, desc: firstDesc, title: 'Grand Prize Champion', icon: 'trophy' },
        second: { ...existingPrizes.second, reward: secondReward, desc: secondDesc, title: 'First Runner-Up', icon: 'award' },
        third: { ...existingPrizes.third, reward: thirdReward, desc: thirdDesc, title: 'Second Runner-Up', icon: 'star' }
      });
      window.showToast('Prize rewards and amounts updated.', 'success');
    });
  }

  const announcementForm = document.getElementById('admin-announcement-form');
  if (announcementForm) {
    announcementForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = document.getElementById('announcement-text').value.trim();
      const enabled = document.getElementById('announcement-enabled').checked;

      store.updateSettings({
        announcement: { message, enabled }
      });
      window.showToast('Pinned announcement updated.', 'success');
    });
  }

  // Platform toggles
  container.querySelectorAll('.platform-toggle-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const plat = cb.getAttribute('data-platform');
      store.togglePlatform(plat, cb.checked);
      window.showToast(`${plat.toUpperCase()} visibility updated.`, 'info');
    });
  });

  // Action Bar Buttons
  const exportCsvBtn = document.getElementById('admin-export-csv-btn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      store.exportCSV('submissions');
      window.showToast('Submissions CSV downloaded.', 'success');
    });
  }

  const exportAuditBtn = document.getElementById('export-audit-csv-btn');
  if (exportAuditBtn) {
    exportAuditBtn.addEventListener('click', () => {
      store.exportCSV('audit');
      window.showToast('Audit Log CSV downloaded.', 'success');
    });
  }

  const publishWinnerBtn = document.getElementById('admin-publish-winner-btn');
  if (publishWinnerBtn) {
    publishWinnerBtn.addEventListener('click', () => {
      store.publishWinner();
      if (window.confetti) {
        window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#EF4444', '#F43F5E', '#FB923C', '#10B981'] });
      }
      window.showToast('Winner published and announced across portals!', 'success');
    });
  }

  const resetDemoBtn = document.getElementById('admin-reset-demo-btn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      if (confirm('Reset application to clean campaign data? This will clear local state changes.')) {
        store.resetToSeedData();
        window.showToast('Campaign data reset to clean state.', 'info');
      }
    });
  }

  renderAnalytics('analytics-container');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
