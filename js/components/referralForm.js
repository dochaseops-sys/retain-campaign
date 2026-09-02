/**
 * Retain Social Growth Challenge - Referral Confirmation Form Component (Retain Brand Theme)
 */

import { store } from '../store.js';
import { getPointsBreakdown } from '../scoring.js';
import { getSocialIcon } from '../icons.js';

export function renderReferralForm() {
  const container = document.getElementById('referral-form-section');
  if (!container) return;

  const state = store.getState();
  const activePlatforms = Object.entries(state.settings.platforms || {}).filter(([_, p]) => p.enabled);

  // Check URL query parameters for referral code e.g. ?code=RETAIN-CODE-12
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code') || urlParams.get('ref') || '';
  const defaultCode = codeParam.trim();

  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20">
      
      <div class="modern-card p-5 sm:p-10 lg:p-14 shadow-2xl relative overflow-hidden">
        
        <!-- Header -->
        <div class="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 sm:mb-4">
            Confirm your follow & <span class="marker-highlight">support</span>.
          </h2>
          <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
            Followed Retain on social media? Fill in this quick form with your referrer's code so we can acknowledge your support!
          </p>
        </div>

        <!-- Submission Feedback Message Alert (Initially Hidden) -->
        <div id="form-feedback-alert" class="hidden mb-6 sm:mb-10 p-4 sm:p-6 rounded-2xl bg-slate-900 text-white flex items-start gap-3 sm:gap-4 animate-slide-up shadow-xl">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white flex-shrink-0 font-bold">
            <i data-lucide="check-circle" class="w-5 h-5 sm:w-6 sm:h-6"></i>
          </div>
          <div>
            <h4 class="text-base sm:text-lg font-black text-white mb-1">Submission Successful!</h4>
            <p id="form-feedback-text" class="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Thank you for supporting Retain. Your submission has been received and will be verified.
            </p>
            <div class="mt-3 flex items-center gap-3">
              <button id="submit-another-btn" class="text-xs font-bold text-rose-400 hover:underline cursor-pointer">
                Submit another follow confirmation
              </button>
            </div>
          </div>
        </div>

        <!-- Form Element -->
        <form id="referral-confirmation-form" class="space-y-5 sm:space-y-6">
          
          <!-- Social Username & Referral Code Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label for="follower-handle" class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 sm:mb-2">
                Your Social Media Handle <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <i data-lucide="at-sign" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"></i>
                <input type="text" id="follower-handle" required placeholder="e.g. @alexmorgan or alex_dev" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none transition-all" />
              </div>
              <span class="text-[11px] text-slate-500 mt-1 block">The account handle you used to follow Dochase.</span>
            </div>

            <div>
              <label for="employee-ref-code" class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 sm:mb-2">
                Employee Referral Code <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <i data-lucide="key" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"></i>
                <input type="text" id="employee-ref-code" value="${defaultCode}" required placeholder="e.g. DOCHASE-GBENGA-31" class="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm font-mono font-bold text-slate-900 placeholder-slate-400 uppercase focus:border-rose-500 focus:outline-none transition-all" />
              </div>
              <span id="ref-code-helper" class="text-[11px] text-slate-500 mt-1 block font-medium">
                ${defaultCode ? `Referred by code: ${defaultCode}` : 'Enter the unique referral code of the employee.'}
              </span>
            </div>
          </div>

          <!-- Platforms Followed Checkboxes -->
          <div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-700">
                Platforms Followed <span class="text-rose-500">*</span>
              </label>
              <span class="text-xs text-slate-600 font-bold" id="form-points-estimate">
                Select all channels you followed
              </span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              ${activePlatforms.map(([key, plat]) => `
                <label class="form-platform-item flex items-center gap-3 p-3 rounded-2xl bg-[#FAFBF7] border border-slate-200 hover:border-rose-500 cursor-pointer transition-all">
                  <input type="checkbox" name="form-platforms" value="${key}" class="form-plat-cb rounded bg-white border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4" />
                  <div class="flex items-center gap-2">
                    <span class="text-slate-700">${getSocialIcon(key, 'w-4 h-4')}</span>
                    <span class="text-xs font-bold text-slate-800">${plat.name}</span>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Meaningful Engagement Checkbox -->
          <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" id="follower-engaged" class="mt-0.5 rounded bg-white border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4" />
              <div>
                <span class="text-xs font-bold text-slate-900 block">I commented or engaged meaningfully on a Retain post (+1 bonus point)</span>
                <span class="text-[11px] text-slate-600 font-medium">Includes leaving a thoughtful comment, sharing a company post, or reacting.</span>
              </div>
            </label>
          </div>

          <!-- Consent Checkbox -->
          <div class="p-4 rounded-2xl bg-[#FAFBF7] border border-slate-200">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" id="follower-consent" required class="mt-0.5 rounded bg-white border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4" />
              <div>
                <span class="text-xs font-bold text-slate-900 block">
                  Verification Consent <span class="text-rose-500">*</span>
                </span>
                <span class="text-[11px] text-slate-600 leading-relaxed block mt-0.5 font-medium">
                  I consent to allowing the Retain Campaign Administrator to verify that my social profile follows the official Retain accounts selected above.
                </span>
              </div>
            </label>
          </div>

          <!-- Error Alert Banner -->
          <div id="form-error-banner" class="hidden p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600 flex-shrink-0"></i>
            <span id="form-error-msg">Please check your inputs and try again.</span>
          </div>

          <!-- Submit Button -->
          <div>
            <button type="submit" id="referral-submit-btn" class="w-full py-4 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-base shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
              <i data-lucide="send" class="w-5 h-5 text-rose-400"></i>
              <span>Submit Follow Confirmation</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  `;

  // Attach form listeners
  const form = document.getElementById('referral-confirmation-form');
  const errorBanner = document.getElementById('form-error-banner');
  const errorMsg = document.getElementById('form-error-msg');
  const feedbackAlert = document.getElementById('form-feedback-alert');
  const feedbackText = document.getElementById('form-feedback-text');
  const pointsEstimate = document.getElementById('form-points-estimate');
  const platCheckboxes = container.querySelectorAll('.form-plat-cb');
  const engagedCb = document.getElementById('follower-engaged');
  const submitAnotherBtn = document.getElementById('submit-another-btn');

  function updatePointsEstimate() {
    const selected = Array.from(platCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    
    if (pointsEstimate) {
      if (selected.length === 0) {
        pointsEstimate.innerText = 'Select all channels you followed';
        pointsEstimate.className = 'text-xs text-slate-500 font-bold';
      } else {
        pointsEstimate.innerText = `${selected.length} channel(s) selected`;
        pointsEstimate.className = 'text-xs text-rose-600 font-bold';
      }
    }
  }

  platCheckboxes.forEach(cb => cb.addEventListener('change', updatePointsEstimate));
  if (engagedCb) engagedCb.addEventListener('change', updatePointsEstimate);

  if (submitAnotherBtn) {
    submitAnotherBtn.addEventListener('click', () => {
      feedbackAlert.classList.add('hidden');
      form.classList.remove('hidden');
      form.reset();
      updatePointsEstimate();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errorBanner.classList.add('hidden');

      const handle = document.getElementById('follower-handle').value.trim();
      const employeeCode = document.getElementById('employee-ref-code').value.trim().toUpperCase();
      const platformsFollowed = Array.from(platCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
      const postEngaged = engagedCb ? engagedCb.checked : false;
      const consent = document.getElementById('follower-consent').checked;

      // Validation
      if (!handle || !employeeCode) {
        errorMsg.innerText = 'Please enter your social media handle and employee referral code.';
        errorBanner.classList.remove('hidden');
        return;
      }

      if (platformsFollowed.length === 0) {
        errorMsg.innerText = 'Please select at least one social media platform you followed.';
        errorBanner.classList.remove('hidden');
        return;
      }

      if (!consent) {
        errorMsg.innerText = 'You must consent to verification to submit.';
        errorBanner.classList.remove('hidden');
        return;
      }

      // Check if employee code exists
      const employee = store.getEmployeeByCode(employeeCode);
      if (!employee) {
        errorMsg.innerText = `Invalid referral code "${employeeCode}". Please check with your Dochase contact.`;
        errorBanner.classList.remove('hidden');
        return;
      }

      // Duplicate check (by handle)
      const duplicate = store.checkDuplicateSubmission('', handle);
      if (duplicate.isDuplicate) {
        errorMsg.innerText = duplicate.reason;
        errorBanner.classList.remove('hidden');
        return;
      }

      // Submit
      try {
        store.addSubmission({
          followerHandle: handle,
          employeeCode: employeeCode,
          platformsFollowed: platformsFollowed,
          postEngaged: postEngaged,
          status: 'pending'
        });

        // Trigger celebratory confetti
        if (window.confetti) {
          window.confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#EF4444', '#F43F5E', '#FB923C', '#10B981']
          });
        }

        form.classList.add('hidden');
        feedbackAlert.classList.remove('hidden');
        if (feedbackText) {
          feedbackText.innerText = 'Thank you for supporting Dochase. Your submission has been received and will be verified.';
        }

        window.showToast('Submission confirmed! Thank you for following Dochase.', 'success');
      } catch (err) {
        errorMsg.innerText = err.message || 'Error submitting confirmation. Please try again.';
        errorBanner.classList.remove('hidden');
      }
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
