/**
 * Retain Social Growth Challenge - Rules and Fair Play Component (Retain Brand Theme)
 */

export function renderRulesAccordion() {
  const container = document.getElementById('rules-section');
  if (!container) return;

  const rules = [
    {
      id: 'rule-1',
      title: '1. Eligibility & Voluntary Participation',
      summary: 'Participation is voluntary and restricted to eligible Retain employees.',
      details: 'All full-time and part-time Retain staff across all business units (Marketing, Engineering, Product, Sales, Ops, People) are eligible to participate. Contractors and external partners are welcome to share Retain profiles, but contest prize eligibility is reserved for direct employees.',
      icon: 'user-check'
    },
    {
      id: 'rule-2',
      title: '2. Campaign Period Validity',
      summary: 'Only followers gained during the active campaign period count.',
      details: 'Social media accounts that already followed Retain prior to the campaign start date cannot be counted as new referrals. Timestamps of follows are cross-referenced with platform follower history during audit rounds.',
      icon: 'calendar'
    },
    {
      id: 'rule-3',
      title: '3. Single Employee Attribution',
      summary: 'Each follower can be credited to only one employee.',
      details: 'A unique follower account (e.g. @john_doe on LinkedIn or X) cannot be attributed to multiple Retain employees. Even if multiple employees know the contact, points are awarded solely to one referrer.',
      icon: 'user'
    },
    {
      id: 'rule-4',
      title: '4. First Valid Submission Policy',
      summary: 'The first valid referral submission determines attribution.',
      details: 'In the event of duplicate claims for the same new follower, the timestamp of the first valid submission through the referral confirmation form determines attribution.',
      icon: 'clock'
    },
    {
      id: 'rule-5',
      title: '5. No Bots, Fake Accounts, or Purchased Followers',
      summary: 'Employees must not buy followers, use bots or create fake accounts.',
      details: 'Strict zero-tolerance policy. Submissions originating from automated follower services, disposable temporary emails, or newly created empty bot accounts will be immediately rejected and may result in complete disqualification from the challenge.',
      icon: 'shield-alert'
    },
    {
      id: 'rule-6',
      title: '6. Anti-Spam & Brand Reputation Standards',
      summary: 'Employees must avoid spam and make only accurate claims about Retain.',
      details: 'Outreach should be respectful and targeted at genuine contacts in your personal and professional network. Mass scraping, unsolicited cold spamming, or making exaggerated product/service claims on behalf of Retain is prohibited.',
      icon: 'message-square'
    },
    {
      id: 'rule-7',
      title: '7. Active Follower Retention',
      summary: 'New followers must remain active through final verification.',
      details: 'Referred followers must remain followers of Retain through the final verification cutoff at the end of Week 4. Accounts that unfollow before the final audit will be deducted from the tally.',
      icon: 'check-circle-2'
    },
    {
      id: 'rule-8',
      title: '8. Integrity Review & Disqualification',
      summary: 'Suspicious activity may be reviewed and disqualified.',
      details: 'The Campaign Committee reserves the right to review any suspicious patterns (such as unnatural submission spikes, unverified social profiles, or repetitive submission IP ranges) and disqualify invalid points.',
      icon: 'alert-triangle'
    },
    {
      id: 'rule-9',
      title: '9. Final Determination & Administrator Record',
      summary: 'The campaign administrator’s verified record determines the final result.',
      details: 'The official administrative database and verified audit trail recorded by the Campaign Committee constitutes the final and binding record for all rankings, point distributions, and reward allocations.',
      icon: 'gavel'
    }
  ];

  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 mt-2 mb-4">
          Rules & fair play <span class="marker-highlight">standards</span>.
        </h2>
        <p class="text-slate-600 text-base leading-relaxed">
          Please review the official campaign rules below. Click any rule to expand and read full compliance details.
        </p>
      </div>

      <!-- Expandable Accordion List -->
      <div class="space-y-4">
        ${rules.map((r, idx) => `
          <div class="modern-card border-slate-200 overflow-hidden transition-all duration-200 rule-card">
            
            <button type="button" class="rule-toggle-btn w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-50 transition-colors" data-index="${idx}">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-2xl bg-[#FAFBF7] border border-slate-200 flex items-center justify-center text-slate-800 flex-shrink-0 shadow-sm">
                  <i data-lucide="${r.icon}" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-black text-slate-900">${r.title}</h3>
                  <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">${r.summary}</p>
                </div>
              </div>
              <div class="w-8 h-8 rounded-full bg-[#FAFBF7] border border-slate-200 flex items-center justify-center text-slate-500 rule-chevron-wrapper flex-shrink-0 transition-transform">
                <i data-lucide="chevron-down" class="w-4 h-4 rule-chevron"></i>
              </div>
            </button>

            <!-- Expanded Details (Initially Hidden) -->
            <div class="rule-details-panel hidden px-6 pb-6 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-[#FAFBF7]/60 font-medium">
              <p class="pl-14">${r.details}</p>
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;

  // Attach accordion toggle logic
  const buttons = container.querySelectorAll('.rule-toggle-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.rule-card');
      const panel = card.querySelector('.rule-details-panel');
      const chevron = card.querySelector('.rule-chevron-wrapper');

      if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
        card.classList.add('border-rose-500');
      } else {
        panel.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
        card.classList.remove('border-rose-500');
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
