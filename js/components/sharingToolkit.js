/**
 * Retain Social Growth Challenge - Sharing Toolkit Component (Retain Brand Theme)
 */

import { store } from '../store.js';
import { getSocialIcon } from '../icons.js';

export function renderSharingToolkit() {
  const container = document.getElementById('sharing-toolkit-section');
  if (!container) return;

  const currentEmp = store.getCurrentEmployee();
  if (!currentEmp) return;

  const state = store.getState();
  const rawTemplates = state.settings.templates || {};

  const origin = window.location.origin;
  const currentPath = window.location.pathname;
  const publicPath = currentPath.endsWith('/') 
    ? `${currentPath}index.html` 
    : currentPath.replace(/\/(employee|admin)\.html$/, '/index.html');
  const personalizedLink = `${origin}${publicPath}?code=${currentEmp.referralCode}`;
  const referralCode = currentEmp.referralCode;
  const employeeName = currentEmp.name;

  // Visual styling map for platform cards
  const templateStyleMap = {
    whatsapp: {
      color: 'bg-[#25D366]/10 border-[#25D366]/30 text-[#128C7E]',
      btnBg: 'bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950',
      actionLabel: 'Open in WhatsApp',
      getActionUrl: (msg) => `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
    },
    linkedin: {
      color: 'bg-[#0A66C2]/10 border-[#0A66C2]/30 text-[#0A66C2]',
      btnBg: 'bg-[#0A66C2] hover:bg-[#004182] text-white',
      actionLabel: 'Share on LinkedIn',
      getActionUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(personalizedLink)}`
    },
    email: {
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      btnBg: 'bg-slate-900 hover:bg-slate-800 text-white',
      actionLabel: 'Open Email Client',
      getActionUrl: (msg, subject) => `mailto:?subject=${encodeURIComponent(subject || 'Invitation: Connect with Retain')}&body=${encodeURIComponent(msg)}`
    },
    x: {
      color: 'bg-slate-100 border-slate-300 text-slate-900',
      btnBg: 'bg-black hover:bg-slate-800 text-white',
      actionLabel: 'Post on X (Twitter)',
      getActionUrl: (msg) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`
    }
  };

  const templateList = Object.entries(rawTemplates).map(([key, item]) => {
    // Replace tokens
    let formattedText = (item.template || '')
      .replace(/{link}/g, personalizedLink)
      .replace(/{code}/g, referralCode)
      .replace(/{name}/g, employeeName);

    let formattedSubject = (item.subject || '')
      .replace(/{link}/g, personalizedLink)
      .replace(/{code}/g, referralCode)
      .replace(/{name}/g, employeeName);

    const style = templateStyleMap[key] || {
      color: 'bg-slate-100 border-slate-200 text-slate-800',
      btnBg: 'bg-slate-900 hover:bg-slate-800 text-white',
      actionLabel: `Share on ${item.platform || key}`,
      getActionUrl: (msg) => `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
    };

    return {
      id: `tmpl-${key}`,
      key: key,
      platform: item.platform || item.title || key,
      title: item.title || item.platform,
      rawText: formattedText,
      subject: formattedSubject,
      color: style.color,
      btnBg: style.btnBg,
      actionLabel: style.actionLabel,
      actionUrl: style.getActionUrl(formattedText, formattedSubject)
    };
  });

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <div class="text-center max-w-3xl mx-auto mb-14">
        <span class="category-eyebrow mb-3">(EMPLOYEE TOOLKIT)</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mt-2 mb-4">
          Ready-made outreach <span class="marker-highlight">templates</span>.
        </h2>
        <p class="text-slate-600 text-base leading-relaxed">
          Pre-formatted templates dynamically populated with your personal link (<span class="font-mono font-bold text-slate-900">${currentEmp.referralCode}</span>). One-click copy and share to your contacts!
        </p>
      </div>

      <!-- Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        ${templateList.map(tmpl => `
          <div class="modern-card p-6 flex flex-col justify-between group">
            
            <div>
              <!-- Header with Authentic Platform SVG Icon -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl flex items-center justify-center border ${tmpl.color} p-2">
                    ${getSocialIcon(tmpl.key, 'w-5 h-5')}
                  </div>
                  <div>
                    <h3 class="text-sm font-black text-slate-900 leading-tight">${tmpl.platform}</h3>
                    <span class="text-[10px] text-slate-400 font-medium">${tmpl.title}</span>
                  </div>
                </div>
                <button class="copy-template-btn text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1.5 bg-[#FAFBF7] px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-400 transition-all cursor-pointer" data-target="${tmpl.id}">
                  <i data-lucide="copy" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>Copy</span>
                </button>
              </div>

              <!-- Message Preview -->
              <div class="p-3.5 rounded-2xl bg-[#FAFBF7] border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans relative my-3 max-h-48 overflow-y-auto">
                <p id="${tmpl.id}" class="select-all">${tmpl.rawText}</p>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-2">
              <a href="${tmpl.actionUrl}" target="_blank" rel="noopener noreferrer" class="w-full py-3 px-4 rounded-full font-black text-xs ${tmpl.btnBg} flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
                ${getSocialIcon(tmpl.key, 'w-4 h-4')}
                <span>${tmpl.actionLabel}</span>
              </a>
            </div>

          </div>
        `).join('')}

      </div>

    </div>
  `;

  // Attach copy template listeners
  container.querySelectorAll('.copy-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const textEl = document.getElementById(targetId);
      if (textEl) {
        navigator.clipboard.writeText(textEl.innerText);
        window.showToast('Outreach template copied to clipboard!', 'success');
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
