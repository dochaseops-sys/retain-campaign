/**
 * Retain Social Growth Challenge - Employee Dashboard Component (Retain Brand Theme)
 */

import { store } from '../store.js';
import { getSocialIcon } from '../icons.js';
import { getReferralUrl } from '../scoring.js';

export function renderEmployeeDashboard() {
  const container = document.getElementById('employee-dashboard-section');
  if (!container) return;

  const state = store.getState();
  const currentEmp = store.getCurrentEmployee();
  if (!currentEmp) return;
  const stats = store.getEmployeeStats(currentEmp.id);
  if (!stats) return;

  const personalizedLink = getReferralUrl(currentEmp.referralCode);

  // Pre-configured share messages with tokens replaced
  const shareText = encodeURIComponent(
    `Hello! I'm part of the team at Retain, and we're growing our online community. Please follow our official social pages here: ${personalizedLink}. Enter my referral code ${currentEmp.referralCode} after following. Thank you for supporting us!`
  );

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(personalizedLink)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Connect with Retain across our official social channels: ${personalizedLink} (Referral code: ${currentEmp.referralCode})`)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(personalizedLink)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent('Join & Follow Retain Community')}&body=${shareText}`;

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      
      <!-- Top Bar: Title -->
      <div class="mb-6 sm:mb-8">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900">
          My Referral <span class="marker-highlight">Dashboard</span>
        </h2>
      </div>

      <!-- Employee Profile Header Card -->
      <div class="modern-card p-5 sm:p-8 lg:p-10 mb-6 sm:mb-8 bg-white border-slate-200">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-sm flex-shrink-0" style="background-color: ${currentEmp.color || '#EF4444'}">
              ${currentEmp.avatar || 'RD'}
            </div>
            <div>
              <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h3 class="text-xl sm:text-2xl font-black text-slate-900">${currentEmp.name}</h3>
                <span class="text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-black flex items-center gap-1.5 shadow-sm">
                  <i data-lucide="${stats.employee?.badge?.icon || 'award'}" class="w-3.5 h-3.5 text-rose-600"></i>
                  <span>${stats.employee?.badge?.name || 'Contender'}</span>
                </span>
              </div>
              <p class="text-xs sm:text-sm text-slate-600 mt-1">${currentEmp.department} &bull; <span class="text-slate-500">${currentEmp.email}</span></p>
            </div>
          </div>

          <!-- Quick Referral Code Display -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAFBF7] p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-inner w-full lg:w-auto">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Your Unique Referral Code</span>
              <span class="text-base sm:text-lg font-mono font-black text-slate-900 select-all">${currentEmp.referralCode}</span>
            </div>
            <button id="copy-code-btn" class="btn-dark-pill text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 touch-target cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5 text-rose-400"></i>
              <span>Copy Code</span>
            </button>
          </div>

        </div>

        <!-- Referral Link & 1-Click Social Sharing -->
        <div class="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
          <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
            Your Personalised Campaign Referral Link
          </label>
          <div class="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center mb-5 sm:mb-6">
            <input type="text" readonly id="personal-link-input" value="${personalizedLink}" class="flex-1 bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none select-all" />
            <button id="copy-link-btn" class="btn-retain text-xs py-3 px-5 flex items-center justify-center gap-2 touch-target cursor-pointer">
              <i data-lucide="copy" class="w-4 h-4"></i>
              <span>Copy Link</span>
            </button>
          </div>

          <!-- Quick Share Buttons -->
          <div>
            <span class="text-xs font-bold text-slate-500 block mb-2.5">1-Click Share to Your Network:</span>
            <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <a href="${whatsappShareUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 touch-target">
                ${getSocialIcon('whatsapp', 'w-4 h-4 text-[#25D366]')}
                <span>WhatsApp</span>
              </a>
              <a href="${linkedinShareUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-[#0A66C2] text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 touch-target">
                ${getSocialIcon('linkedin', 'w-4 h-4 text-[#0A66C2]')}
                <span>LinkedIn</span>
              </a>
              <a href="${xShareUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 touch-target">
                ${getSocialIcon('x', 'w-4 h-4 text-slate-900')}
                <span>X (Twitter)</span>
              </a>
              <a href="${facebookShareUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 touch-target">
                ${getSocialIcon('facebook', 'w-4 h-4 text-[#1877F2]')}
                <span>Facebook</span>
              </a>
              <a href="${emailShareUrl}" class="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 touch-target">
                ${getSocialIcon('email', 'w-4 h-4 text-slate-700')}
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Metric Cards Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        
        <!-- Total Points -->
        <div class="modern-card p-4 sm:p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Points</span>
            <i data-lucide="star" class="w-4 h-4 text-amber-500"></i>
          </div>
          <span class="text-2xl sm:text-4xl font-black text-slate-900 block">${stats.totalPoints}</span>
          <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">Verified scoring</span>
        </div>

        <!-- Leaderboard Position -->
        <div class="modern-card p-4 sm:p-6 border-slate-200 bg-[#FAFBF7]">
          <div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Rank</span>
            <i data-lucide="trophy" class="w-4 h-4 text-rose-600"></i>
          </div>
          <span class="text-2xl sm:text-4xl font-black text-slate-900 block">#${stats.rank} <span class="text-xs text-slate-500 font-normal">/ ${stats.totalEmployees}</span></span>
          <span class="text-[10px] sm:text-[11px] text-rose-600 font-bold">${stats.rank <= 3 ? 'Top 3 Podium' : 'In competition'}</span>
        </div>

        <!-- Verified Referrals -->
        <div class="modern-card p-4 sm:p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Verified</span>
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
          </div>
          <span class="text-2xl sm:text-4xl font-black text-emerald-700 block">${stats.verifiedReferrals}</span>
          <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">Confirmed followers</span>
        </div>

        <!-- Pending Referrals -->
        <div class="modern-card p-4 sm:p-6 border-slate-200">
          <div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Pending</span>
            <i data-lucide="clock" class="w-4 h-4 text-amber-500"></i>
          </div>
          <span class="text-2xl sm:text-4xl font-black text-slate-700 block">${stats.pendingReferrals}</span>
          <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">In review</span>
        </div>

      </div>

      <!-- Recent Referral Activity Log (Privacy Protected) -->
      <div class="modern-card p-5 sm:p-8 border-slate-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-slate-900 text-rose-400 flex items-center justify-center">
              <i data-lucide="activity" class="w-4 h-4"></i>
            </div>
            <h4 class="text-base font-black text-slate-900">Recent Referral Activity</h4>
          </div>
          <span class="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
            Privacy Mode Active (Handles masked)
          </span>
        </div>

        ${stats.recentActivity.length === 0 ? `
          <div class="text-center py-10 sm:py-12 border border-dashed border-slate-200 rounded-2xl bg-[#FAFBF7]">
            <i data-lucide="inbox" class="w-9 h-9 sm:w-10 sm:h-10 text-slate-400 mx-auto mb-2"></i>
            <p class="text-sm font-bold text-slate-600">No referral activity recorded yet.</p>
            <p class="text-xs text-slate-400 mt-1">Share your link above to start receiving submissions!</p>
          </div>
        ` : `
          <div class="overflow-x-auto touch-scroll">
            <table class="w-full text-left text-xs text-slate-700 whitespace-nowrap">
              <thead class="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-[#FAFBF7] border-b border-slate-200">
                <tr>
                  <th class="py-3.5 px-4 rounded-l-xl">Contact (Masked)</th>
                  <th class="py-3.5 px-4">Platforms Followed</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4">Engagement</th>
                  <th class="py-3.5 px-4">Points</th>
                  <th class="py-3.5 px-4 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                ${stats.recentActivity.map(act => {
                  const statusBadges = {
                    verified: '<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">Verified</span>',
                    pending: '<span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold">Pending</span>',
                    rejected: '<span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold">Rejected</span>'
                  };

                  return `
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-3.5 px-4 font-mono font-bold text-slate-900">${act.maskedHandle}</td>
                      <td class="py-3.5 px-4">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          ${(act.platforms || []).map(p => `
                            <span class="px-2 py-0.5 rounded-md bg-[#FAFBF7] border border-slate-200 text-[10px] text-slate-700 font-semibold uppercase">${p}</span>
                          `).join('')}
                        </div>
                      </td>
                      <td class="py-3.5 px-4">${statusBadges[act.status] || act.status}</td>
                      <td class="py-3.5 px-4">
                        ${act.engaged ? '<span class="text-emerald-700 font-bold">Yes (+1 pt)</span>' : '<span class="text-slate-400">None</span>'}
                      </td>
                      <td class="py-3.5 px-4 font-black ${act.points > 0 ? 'text-slate-900' : 'text-slate-400'}">
                        ${act.points > 0 ? `+${act.points} pts` : '0 pts'}
                      </td>
                      <td class="py-3.5 px-4 text-slate-500 font-medium">
                        ${new Date(act.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}

      </div>

    </div>
  `;

  // Attach event listeners
  const switcher = document.getElementById('emp-select-switcher');
  if (switcher) {
    switcher.addEventListener('change', (e) => {
      store.setCurrentEmployee(e.target.value);
    });
  }

  const copyCodeBtn = document.getElementById('copy-code-btn');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentEmp.referralCode);
      window.showToast('Referral code copied to clipboard!', 'success');
    });
  }

  const copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(personalizedLink);
      window.showToast('Personalised campaign link copied to clipboard!', 'success');
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
