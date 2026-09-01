/**
 * Retain Social Growth Challenge - Campaign Timeline Component (Retain Brand Theme)
 */

export function renderTimeline() {
  const container = document.getElementById('timeline-section');
  if (!container) return;

  const timelineWeeks = [
    {
      week: 'Week 1',
      title: 'Campaign Launch & Distribution',
      dates: 'Sep 01 &ndash; Sep 07',
      status: 'current',
      description: 'Official campaign kickoff, employee referral code distribution, and initial network mobilization.',
      deliverables: ['Kickoff all-hands briefing', 'Personalized link issuance', 'Initial sharing toolkit rollout'],
      icon: 'rocket'
    },
    {
      week: 'Week 2',
      title: 'Leaderboard Updates & Recognition',
      dates: 'Sep 08 &ndash; Sep 14',
      status: 'upcoming',
      description: 'First official verification rounds, early leader spotlight, and mid-sprint double-points boost.',
      deliverables: ['First live standings reveal', 'Weekly top-referrer shoutout', 'Multi-platform follow challenge'],
      icon: 'flame'
    },
    {
      week: 'Week 3',
      title: 'Story & Community Push',
      dates: 'Sep 15 &ndash; Sep 21',
      status: 'upcoming',
      description: 'Highlighting employee stories and driving meaningful post comments and community engagement.',
      deliverables: ['Content engagement push (+1 bonus)', 'Department sprint rallies', 'Milestone swag awards'],
      icon: 'users'
    },
    {
      week: 'Week 4',
      title: 'Final Sprint, Verification & Winner',
      dates: 'Sep 22 &ndash; Sep 30',
      status: 'upcoming',
      description: 'Final referral sprint, comprehensive audit and verification, and grand prize winner announcement.',
      deliverables: ['Final submission cutoff (Sep 30)', 'Complete integrity audit', 'Executive award ceremony'],
      icon: 'trophy'
    }
  ];

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="category-eyebrow mb-3">(CAMPAIGN ROADMAP)</span>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 mt-2 mb-4">
          4-week campaign <span class="marker-highlight">journey</span>.
        </h2>
        <p class="text-slate-600 text-base leading-relaxed">
          Stay on track with our structured 4-week sprint towards the grand prize award ceremony.
        </p>
      </div>

      <!-- Timeline Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        
        ${timelineWeeks.map((w) => {
          const isCurrent = w.status === 'current';
          const isCompleted = w.status === 'completed';

          const cardBorder = isCurrent 
            ? 'border-2 border-rose-500 bg-white shadow-xl ring-2 ring-rose-200' 
            : isCompleted 
            ? 'border border-slate-200 bg-[#FAFBF7]' 
            : 'border border-slate-200 bg-white';

          const badge = isCurrent 
            ? '<span class="text-[10px] font-black px-3 py-1 rounded-full bg-slate-900 text-rose-400 flex items-center gap-1.5 shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> ACTIVE SPRINT</span>'
            : isCompleted 
            ? '<span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Completed</span>'
            : '<span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Upcoming</span>';

          return `
            <div class="modern-card p-7 relative flex flex-col justify-between ${cardBorder} hover:scale-[1.02] transition-all">
              
              <!-- Header -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <span class="text-xs font-mono font-bold text-slate-500">${w.dates}</span>
                  ${badge}
                </div>

                <div class="flex items-center gap-3.5 my-4">
                  <div class="w-11 h-11 rounded-2xl ${isCurrent ? 'bg-slate-900 text-rose-400' : 'bg-[#FAFBF7] border border-slate-200 text-slate-700'} flex items-center justify-center font-bold shadow-sm">
                    <i data-lucide="${w.icon}" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <span class="text-[11px] font-black uppercase tracking-wider text-slate-400 block">${w.week}</span>
                    <h3 class="text-base font-black text-slate-900 leading-tight">${w.title}</h3>
                  </div>
                </div>

                <p class="text-xs text-slate-600 leading-relaxed my-4">
                  ${w.description}
                </p>
              </div>

              <!-- Deliverables Checklist -->
              <div class="mt-4 pt-4 border-t border-slate-100">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">Key Deliverables</span>
                <ul class="space-y-2 text-xs text-slate-600">
                  ${w.deliverables.map(d => `
                    <li class="flex items-center gap-2">
                      <i data-lucide="${isCompleted ? 'check-circle-2' : isCurrent ? 'arrow-right' : 'circle'}" class="w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-rose-600' : 'text-slate-300'} flex-shrink-0"></i>
                      <span class="${isCompleted ? 'line-through text-slate-400' : 'font-medium'}">${d}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

            </div>
          `;
        }).join('')}

      </div>

    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
