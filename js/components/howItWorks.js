/**
 * Retain Social Growth Challenge - How It Works Component (Retain Brand Theme)
 */

export function renderHowItWorks() {
  const container = document.getElementById('how-it-works-section');
  if (!container) return;

  const steps = [
    {
      number: '01',
      title: 'Get Your Personal Code',
      description: 'Sign in to access your unique referral code and personalized link generated exclusively for your profile.',
      icon: 'key'
    },
    {
      number: '02',
      title: 'Share Across Your Network',
      description: 'Use our 1-click sharing templates to invite contacts across LinkedIn, WhatsApp, X, and Email to follow Retain.',
      icon: 'send'
    },
    {
      number: '03',
      title: 'Contacts Follow & Confirm',
      description: 'Your contacts follow Retain on official channels and submit their quick follow confirmation with your code.',
      icon: 'check-circle'
    },
    {
      number: '04',
      title: 'Earn Points & Win Big',
      description: 'Earn 1 to 6+ points per referral, climb the live company leaderboard, unlock milestone swag, and win the grand prize!',
      icon: 'trophy'
    }
  ];

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 mt-2 mb-4">
          Turn your network into <span class="marker-highlight">points & rewards</span>.
        </h2>
        <p class="text-slate-600 text-base leading-relaxed">
          Four simple steps to help grow Retain’s reach and claim your spot at the top of the leaderboard.
        </p>
      </div>

      <!-- 4-Card Step Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${steps.map((step) => `
          <div class="modern-card p-8 flex flex-col justify-between group">
            
            <div>
              <!-- Step Number Pill & Icon -->
              <div class="flex items-center justify-between mb-6">
                <span class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 font-black text-sm flex items-center justify-center shadow-sm border border-rose-200 group-hover:scale-110 transition-transform">
                  ${step.number}
                </span>
                <div class="w-10 h-10 rounded-2xl bg-[#FAFBF7] border border-slate-200 flex items-center justify-center text-slate-700">
                  <i data-lucide="${step.icon}" class="w-5 h-5"></i>
                </div>
              </div>

              <!-- Title & Description -->
              <h3 class="text-lg font-black text-slate-900 mb-2.5 leading-snug">
                ${step.title}
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                ${step.description}
              </p>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 group-hover:text-rose-600 transition-colors">
              <span>Step ${step.number}</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
