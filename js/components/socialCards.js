/**
 * Retain Social Growth Challenge - Social Cards Component (Retain Brand Theme)
 */

import { store } from '../store.js';
import { getSocialIcon } from '../icons.js';

export function renderSocialCards() {
  const container = document.getElementById('social-cards-section');
  if (!container) return;

  const state = store.getState();
  const platforms = state.settings.platforms || {};
  const activePlatforms = Object.entries(platforms).filter(([_, p]) => p.enabled);

  const platformMeta = {
    linkedin: {
      color: 'bg-[#0A66C2]',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Enterprise updates, fintech/growth thought leadership, and company milestones.'
    },
    instagram: {
      color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      tagColor: 'bg-pink-50 text-pink-700 border-pink-200',
      description: 'Behind-the-scenes culture, team highlights, and creative showcases.'
    },
    x: {
      color: 'bg-black',
      tagColor: 'bg-slate-100 text-slate-900 border-slate-300',
      description: 'Real-time product announcements, industry trends, and fast insights.'
    },
    tiktok: {
      color: 'bg-[#000000]',
      tagColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      description: 'Engaging video explainers, tech tips, and vibrant team moments.'
    },
    facebook: {
      color: 'bg-[#1877F2]',
      tagColor: 'bg-blue-50 text-blue-800 border-blue-200',
      description: 'Global community events, customer success stories, and news.'
    },
    youtube: {
      color: 'bg-[#FF0000]',
      tagColor: 'bg-red-50 text-red-700 border-red-200',
      description: 'In-depth webinars, product tutorials, and keynote presentations.'
    }
  };

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="category-eyebrow mb-3">(OFFICIAL SOCIAL CHANNELS)</span>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 mt-2 mb-4">
          Follow Retain <span class="marker-highlight">everywhere</span>.
        </h2>
        <p class="text-slate-600 text-base leading-relaxed">
          Join our growing global audience across our official channels. Follow 3 or all 6 channels to maximize your supporter impact!
        </p>
      </div>

      <!-- Social Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${activePlatforms.map(([key, plat]) => {
          const meta = platformMeta[key] || {
            color: 'bg-slate-800',
            tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
            description: 'Follow Retain on official channels.'
          };

          const totalFollowers = (plat.baseline || 5000) + (plat.campaignGrowth || 0);

          return `
            <div class="modern-card p-7 flex flex-col justify-between group">
              
              <div>
                <!-- Card Header: Authentic Platform SVG Icon + Follower Count Badge -->
                <div class="flex items-center justify-between mb-5">
                  <div class="w-12 h-12 rounded-2xl ${meta.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform p-2.5">
                    ${getSocialIcon(key, 'w-6 h-6')}
                  </div>
                  <span class="text-xs font-black px-3 py-1 rounded-full ${meta.tagColor} border">
                    ${totalFollowers.toLocaleString()} followers
                  </span>
                </div>

                <!-- Platform Name & Handle -->
                <h3 class="text-xl font-black text-slate-900 mb-1">
                  ${plat.name}
                </h3>
                <span class="text-xs font-mono font-bold text-slate-500 block mb-3">
                  ${plat.handle}
                </span>

                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  ${meta.description}
                </p>
              </div>

              <!-- Follow Action Button -->
              <div class="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
                  +${plat.campaignGrowth || 0} this campaign
                </span>
                <a href="${plat.url}" target="_blank" rel="noopener noreferrer" class="btn-dark-pill text-xs py-2 px-4 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all">
                  <span>Follow</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 text-rose-400"></i>
                </a>
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
