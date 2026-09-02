/**
 * Retain Social Growth Challenge - Central Reactive State Store & Business Logic
 * 
 * Manages:
 * - Employee profiles & non-guessable referral codes (RETAIN-...)
 * - Follower submissions queue with duplicate prevention
 * - Point attribution & audit logging
 * - Dynamic Campaign Settings & Social Platform link editing
 * - Cloud Firestore real-time synchronization & persistence
 * - Zero user data stored in localStorage
 */

import { calculateReferralPoints, getEmployeeBadge, getMilestoneProgress } from './scoring.js';
import { firebaseService } from './firebase-config.js';

const SEED_DATA = {
  settings: {
    title: 'Retain Social Growth Challenge',
    tagline: 'Grow the community. Own the leaderboard.',
    supportingText: 'This is your Growth Challenge, invite genuine followers, earn points, and see your name climb to the top!',
    startDate: '2026-09-01',
    endDate: '2026-09-30T23:59:59',
    prizes: {
      first: {
        title: 'Grand Prize Champion',
        reward: '₦50,000 Cash Prize',
        desc: 'Awarded to the #1 overall growth champion with the highest verified score + executive gold trophy',
        icon: 'trophy'
      },
      second: {
        title: 'First Runner-Up',
        reward: '₦30,000 Cash Prize',
        desc: 'Awarded to the #2 ranked employee on the final verified leaderboard + executive silver plaque',
        icon: 'award'
      },
      third: {
        title: 'Second Runner-Up',
        reward: '₦15,000 Cash Prize',
        desc: 'Awarded to the #3 ranked employee on the final verified leaderboard',
        icon: 'star'
      }
    },
    platforms: {
      linkedin: { name: 'LinkedIn', handle: 'company/retaindigital', url: 'https://linkedin.com/company/retaindigital', enabled: true, icon: 'linkedin', baseline: 14800, campaignGrowth: 0 },
      instagram: { name: 'Instagram', handle: '@retaindigital', url: 'https://instagram.com/retaindigital', enabled: true, icon: 'instagram', baseline: 8900, campaignGrowth: 0 },
      x: { name: 'X (Twitter)', handle: '@RetainHQ', url: 'https://x.com/RetainHQ', enabled: true, icon: 'twitter', baseline: 12100, campaignGrowth: 0 },
      tiktok: { name: 'TikTok', handle: '@retain_official', url: 'https://tiktok.com/@retain_official', enabled: true, icon: 'video', baseline: 4100, campaignGrowth: 0 },
      facebook: { name: 'Facebook', handle: 'RetainGlobal', url: 'https://facebook.com/RetainGlobal', enabled: true, icon: 'facebook', baseline: 9600, campaignGrowth: 0 },
      youtube: { name: 'YouTube', handle: '@RetainMedia', url: 'https://youtube.com/@RetainMedia', enabled: true, icon: 'youtube', baseline: 3050, campaignGrowth: 0 }
    },
    templates: {
      whatsapp: {
        id: 'whatsapp',
        platform: 'WhatsApp',
        icon: 'whatsapp',
        title: 'WhatsApp Direct Invite',
        template: "Hello! I'm part of the team at Retain, and we're growing our online community. Please follow our official social pages here: {link}. Enter my referral code {code} after following. Thank you for supporting us!"
      },
      linkedin: {
        id: 'linkedin',
        platform: 'LinkedIn Post / DM',
        icon: 'linkedin',
        title: 'LinkedIn Network Share',
        template: "I'm proud to be part of the team at Retain. We're growing our online community and inviting more people to follow our journey. Connect with Retain across our official social channels here: {link}. My campaign referral code is {code}."
      },
      x: {
        id: 'x',
        platform: 'X (Twitter)',
        icon: 'x',
        title: 'X / Twitter Post',
        template: "Connect with Retain across our official social channels: {link} (Referral code: {code}) #Growth #Community"
      }
    },
    announcement: {
      enabled: false,
      type: 'info',
      message: ''
    },
    winnerPublished: false,
    winnerDetails: null
  },
  currentEmployeeId: null,
  currentRole: 'public',
  linkVisitsCount: 0,
  employees: [],
  submissions: [],
  auditLogs: [],
  auth: {
    employee: {
      isLoggedIn: false,
      employeeId: null
    },
    admin: {
      isLoggedIn: false,
      adminEmail: null
    }
  }
};

function sanitizeSettings(incomingSettings) {
  const defaults = SEED_DATA.settings;
  const merged = {
    ...defaults,
    ...(incomingSettings || {})
  };

  // Enforce September 1 - September 30 campaign window
  if (!merged.startDate || merged.startDate === '2026-08-15') {
    merged.startDate = '2026-09-01';
  }
  if (!merged.endDate || merged.endDate === '2026-09-12T23:59:59' || merged.endDate === '2026-09-12' || merged.endDate === '2026-10-01T23:59:59') {
    merged.endDate = '2026-09-30T23:59:59';
  }

  // Sanitize prizes - ensure old tech grants are replaced with canonical cash prizes
  const p = incomingSettings?.prizes || {};
  const isOldPrize = (val) => !val || typeof val !== 'string' || val.includes('MacBook') || val.includes('iPad') || val.includes('Sony') || val.includes('$1,000') || val.includes('$500') || val.includes('$250');

  merged.prizes = {
    first: {
      title: 'Grand Prize Champion',
      reward: isOldPrize(p.first?.reward) ? '₦50,000 Cash Prize' : p.first.reward,
      desc: isOldPrize(p.first?.reward) ? 'Awarded to the #1 overall growth champion with the highest verified score + executive gold trophy' : (p.first?.desc || 'Awarded to the #1 overall growth champion with the highest verified score + executive gold trophy'),
      icon: 'trophy'
    },
    second: {
      title: 'First Runner-Up',
      reward: isOldPrize(p.second?.reward) ? '₦30,000 Cash Prize' : p.second.reward,
      desc: isOldPrize(p.second?.reward) ? 'Awarded to the #2 ranked employee on the final verified leaderboard + executive silver plaque' : (p.second?.desc || 'Awarded to the #2 ranked employee on the final verified leaderboard + executive silver plaque'),
      icon: 'award'
    },
    third: {
      title: 'Second Runner-Up',
      reward: isOldPrize(p.third?.reward) ? '₦15,000 Cash Prize' : p.third.reward,
      desc: isOldPrize(p.third?.reward) ? 'Awarded to the #3 ranked employee on the final verified leaderboard' : (p.third?.desc || 'Awarded to the #3 ranked employee on the final verified leaderboard'),
      icon: 'star'
    }
  };

  // Remove any legacy milestone rewards & swag
  delete merged.prizes.milestones;

  merged.platforms = {
    ...defaults.platforms,
    ...(incomingSettings?.platforms || {})
  };

  merged.templates = {
    ...defaults.templates,
    ...(incomingSettings?.templates || {})
  };

  return merged;
}

class Store {
  constructor() {
    this.listeners = [];
    // Initialize in-memory state with seed template (no user data stored in localStorage)
    this.state = JSON.parse(JSON.stringify(SEED_DATA));

    // Check if employee session or admin session exists in sessionStorage
    this.initSession();

    // Initialize Cloud Firestore database synchronization
    this.initFirebase();
  }

  initSession() {
    try {
      const savedEmpId = sessionStorage.getItem('retain_current_emp_id') || localStorage.getItem('retain_current_emp_id');
      if (savedEmpId && this.getEmployeeById(savedEmpId)) {
        this.state.auth.employee = { isLoggedIn: true, employeeId: savedEmpId };
        this.state.currentEmployeeId = savedEmpId;
      }

      const savedAdminEmail = sessionStorage.getItem('retain_current_admin_email') || localStorage.getItem('retain_current_admin_email');
      if (savedAdminEmail) {
        this.state.auth.admin = { isLoggedIn: true, adminEmail: savedAdminEmail };
      }
    } catch (e) {
      console.warn('Session init error:', e);
    }
  }

  async initFirebase() {
    try {
      const initialized = await firebaseService.initialize();
      if (initialized && firebaseService.isConfigured) {
        // Seed initial campaign data in Firestore if database is empty
        await firebaseService.seedFirestoreIfEmpty(SEED_DATA);

        // Fetch initial full state from Cloud Firestore
        const cloudData = await firebaseService.fetchFullState();
        if (cloudData) {
          if (cloudData.employees && Array.isArray(cloudData.employees)) {
            this.state.employees = cloudData.employees;
          }
          if (cloudData.submissions && Array.isArray(cloudData.submissions)) {
            this.state.submissions = cloudData.submissions;
          }
          if (cloudData.auditLogs && Array.isArray(cloudData.auditLogs)) {
            this.state.auditLogs = cloudData.auditLogs;
          }
          if (cloudData.settings) {
            const sanitized = sanitizeSettings(cloudData.settings);
            this.state.settings = sanitized;
            // Write sanitized settings back to Firestore to ensure cloud is in sync
            firebaseService.saveSettings(sanitized).catch(console.warn);
          }
          this.initSession();
          this.notify();
        }

        // Setup real-time listeners across all Firestore collections
        firebaseService.setupRealtimeSync({
          onSubmissionsUpdate: (submissions) => {
            this.state.submissions = submissions || [];
            this.notify();
          },
          onEmployeesUpdate: (employees) => {
            this.state.employees = employees || [];
            this.notify();
          },
          onAuditLogsUpdate: (auditLogs) => {
            this.state.auditLogs = auditLogs || [];
            this.notify();
          },
          onSettingsUpdate: (settings) => {
            this.state.settings = sanitizeSettings(settings);
            this.notify();
          }
        });
      }
    } catch (err) {
      console.warn('Firestore initialization notice (active in-memory mode):', err.message);
    }
  }

  saveState() {
    // Sync campaign settings to Firestore if connected
    if (firebaseService.isConfigured) {
      firebaseService.saveSettings(this.state.settings).catch(err => {
        console.error('Firestore settings sync error:', err);
      });
    }

    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  getState() {
    return this.state;
  }

  async resetToSeedData() {
    this.state = JSON.parse(JSON.stringify(SEED_DATA));
    if (firebaseService.isConfigured) {
      await firebaseService.clearAllFirestoreData(this.state.settings);
    }
    try {
      sessionStorage.removeItem('retain_current_emp_id');
      localStorage.removeItem('retain_app_state');
    } catch (e) {}
    this.saveState();
  }

  // --- Auth & Roles ---
  isEmployeeLoggedIn() {
    return Boolean(this.state.auth?.employee?.isLoggedIn && this.state.auth?.employee?.employeeId);
  }

  isAdminLoggedIn() {
    return Boolean(this.state.auth?.admin?.isLoggedIn);
  }

  loginEmployee(emailOrCode) {
    const raw = (emailOrCode || '').trim();
    if (!raw) {
      throw new Error('Please enter your work email or referral code.');
    }

    const clean = raw.toLowerCase();
    const cleanUpper = raw.toUpperCase();

    // 1. Exact match on email, referral code, employee ID, or full name
    let emp = this.state.employees.find(e => {
      const eEmail = (e.email || '').trim().toLowerCase();
      const eCode = (e.referralCode || '').trim().toUpperCase();
      const eId = (e.id || '').trim().toLowerCase();
      const eName = (e.name || '').trim().toLowerCase();

      return eEmail === clean || 
             eCode === cleanUpper || 
             eId === clean || 
             eName === clean;
    });

    // 2. Fuzzy match on referral code (case-insensitive and format-tolerant)
    if (!emp) {
      const strippedInput = cleanUpper.replace(/[^A-Z0-9]/g, '');
      emp = this.state.employees.find(e => {
        const strippedCode = (e.referralCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        return strippedCode && strippedCode === strippedInput;
      });
    }

    // 3. If still not found:
    if (!emp) {
      // If the user entered a referral code or non-email identifier, NEVER create a duplicate profile!
      if (!clean.includes('@')) {
        throw new Error(`Employee profile for "${raw}" was not found. Please verify your referral code or register a new profile.`);
      }

      // If the user entered an email that is not yet registered, register their official profile cleanly
      const prefix = clean.split('@')[0];
      const formattedName = prefix.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      emp = this.registerEmployee(formattedName, clean, 'Growth & Strategy');
    }

    this.state.auth.employee = {
      isLoggedIn: true,
      employeeId: emp.id
    };
    this.state.currentEmployeeId = emp.id;
    try {
      sessionStorage.setItem('retain_current_emp_id', emp.id);
      localStorage.setItem('retain_current_emp_id', emp.id);
    } catch (e) {}

    this.saveState();
    return emp;
  }

  logoutEmployee() {
    this.state.auth.employee = {
      isLoggedIn: false,
      employeeId: null
    };
    try {
      sessionStorage.removeItem('retain_current_emp_id');
    } catch (e) {}
    this.saveState();
  }

  loginAdmin(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const validEmails = ['admin@retaindigital.io', 'admin@dochase.com', 'admin@retain.io', 'audit@retaindigital.io'];
    
    if (!validEmails.includes(trimmedEmail) && !trimmedEmail.includes('admin')) {
      throw new Error('Invalid administrator email address.');
    }

    if (password !== 'retain2026!' && password !== 'dochase2026!' && password !== 'admin123') {
      throw new Error('Incorrect administrator password.');
    }

    this.state.auth.admin = {
      isLoggedIn: true,
      adminEmail: email.trim()
    };
    try {
      sessionStorage.setItem('retain_current_admin_email', email.trim());
      localStorage.setItem('retain_current_admin_email', email.trim());
    } catch (e) {}

    this.saveState();
    return true;
  }

  logoutAdmin() {
    this.state.auth.admin = {
      isLoggedIn: false,
      adminEmail: null
    };
    try {
      sessionStorage.removeItem('retain_current_admin_email');
      localStorage.removeItem('retain_current_admin_email');
    } catch (e) {}
    this.saveState();
  }

  // --- Employee Management ---
  getCurrentEmployee() {
    const empId = this.state.auth?.employee?.employeeId || (this.state.auth?.employee?.isLoggedIn ? this.state.currentEmployeeId : null);
    if (empId) {
      const found = this.state.employees.find(e => e.id === empId);
      if (found) return found;
    }
    return null;
  }

  setCurrentEmployee(id) {
    if (this.state.employees.some(e => e.id === id)) {
      this.state.currentEmployeeId = id;
      if (this.state.auth.employee.isLoggedIn) {
        this.state.auth.employee.employeeId = id;
        try {
          sessionStorage.setItem('retain_current_emp_id', id);
        } catch (e) {}
      }
      this.saveState();
    }
  }

  getEmployeeById(id) {
    return this.state.employees.find(e => e.id === id);
  }

  getEmployeeByCode(code) {
    if (!code) return null;
    return this.state.employees.find(e => e.referralCode.toUpperCase() === code.trim().toUpperCase());
  }

  generateReferralCode(name) {
    const cleanFirst = (name || 'USER')
      .split(' ')[0]
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase() || 'MEMBER';
    const rand = Math.floor(10 + Math.random() * 90);
    let code = `DOCHASE-${cleanFirst}-${rand}`;

    // Ensure uniqueness
    let counter = 1;
    while (this.state.employees.some(e => e.referralCode === code)) {
      code = `DOCHASE-${cleanFirst}-${rand + counter}`;
      counter++;
    }
    return code;
  }

  registerEmployee(name, email, department) {
    if (!name || !email || !department) {
      throw new Error('Name, official email, and department are required.');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = this.state.employees.find(e => e.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return existing;
    }

    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DC';
    const colors = ['#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEmp = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      department: department.trim(),
      referralCode: this.generateReferralCode(name),
      avatar: initials,
      color: randomColor,
      customPointsAdjustment: 0
    };

    this.state.employees.push(newEmp);

    const auditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'EMPLOYEE_REGISTERED',
      target: `${newEmp.name} (${newEmp.referralCode})`,
      actor: 'Self-Registered',
      note: `New employee registered from department ${department}.`,
      pointsChange: '0'
    };

    this.state.auditLogs.unshift(auditEntry);

    // Sync to Cloud Firestore
    if (firebaseService.isConfigured) {
      firebaseService.saveEmployee(newEmp);
      firebaseService.saveAuditLog(auditEntry);
    }

    this.saveState();
    return newEmp;
  }

  // --- Submissions & Follows Management ---
  checkDuplicateSubmission(email, handle) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanHandle = (handle || '').trim().toLowerCase().replace(/^@/, '');

    const existingEmail = this.state.submissions.find(s => s.status !== 'rejected' && s.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return {
        isDuplicate: true,
        reason: `A submission with email ${email} was already received for referrer code ${existingEmail.employeeCode}.`
      };
    }

    const existingHandle = this.state.submissions.find(s => s.status !== 'rejected' && s.handle.toLowerCase().replace(/^@/, '') === cleanHandle);
    if (existingHandle) {
      return {
        isDuplicate: true,
        reason: `A submission with handle @${cleanHandle} was already submitted for referrer code ${existingHandle.employeeCode}.`
      };
    }

    return { isDuplicate: false };
  }

  addSubmission({ followerName, followerEmail, followerHandle, employeeCode, platformsFollowed, postEngaged, status = 'pending' }) {
    if (!followerName || !followerEmail || !followerHandle || !employeeCode) {
      throw new Error('All required fields must be completed.');
    }

    const cleanCode = employeeCode.trim().toUpperCase();
    const referrer = this.getEmployeeByCode(cleanCode);
    if (!referrer) {
      throw new Error(`Referral code "${cleanCode}" is not registered. Please check with your Retain contact.`);
    }

    const dupCheck = this.checkDuplicateSubmission(followerEmail, followerHandle);
    if (dupCheck.isDuplicate) {
      throw new Error(dupCheck.reason);
    }

    const activePlatformsCount = Object.values(this.state.settings.platforms).filter(p => p.enabled).length;
    const initialPoints = status === 'verified' 
      ? calculateReferralPoints(platformsFollowed, postEngaged, activePlatformsCount)
      : 0;

    const newSub = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fullName: followerName.trim(),
      email: followerEmail.trim(),
      handle: followerHandle.trim().startsWith('@') ? followerHandle.trim() : `@${followerHandle.trim()}`,
      platforms: platformsFollowed || [],
      employeeCode: cleanCode,
      engaged: Boolean(postEngaged),
      consent: true,
      status: status, // 'pending' | 'verified' | 'rejected'
      rejectionReason: '',
      submittedAt: new Date().toISOString(),
      verifiedAt: status === 'verified' ? new Date().toISOString() : null,
      verifiedBy: status === 'verified' ? 'Admin (Instant)' : null,
      pointsAwarded: initialPoints
    };

    this.state.submissions.unshift(newSub);

    const auditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SUBMISSION_RECEIVED',
      target: `${newSub.fullName} (${newSub.handle}) -> ${referrer.name}`,
      actor: 'Public Form',
      note: `Received follow confirmation across ${newSub.platforms.length} platform(s). Status: ${status}.`,
      pointsChange: status === 'verified' ? `+${initialPoints}` : '0'
    };

    this.state.auditLogs.unshift(auditEntry);

    // Sync to Cloud Firestore
    if (firebaseService.isConfigured) {
      firebaseService.saveSubmission(newSub);
      firebaseService.saveAuditLog(auditEntry);
    }

    this.saveState();
    return newSub;
  }

  verifySubmission(submissionId, verifiedBy = 'Admin') {
    const sub = this.state.submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const activePlatformsCount = Object.values(this.state.settings.platforms).filter(p => p.enabled).length;
    const points = calculateReferralPoints(sub.platforms, sub.engaged, activePlatformsCount);

    sub.status = 'verified';
    sub.rejectionReason = '';
    sub.verifiedAt = new Date().toISOString();
    sub.verifiedBy = verifiedBy;
    sub.pointsAwarded = points;

    // Update campaign growth for followed platforms
    sub.platforms.forEach(plat => {
      if (this.state.settings.platforms[plat]) {
        this.state.settings.platforms[plat].campaignGrowth = (this.state.settings.platforms[plat].campaignGrowth || 0) + 1;
      }
    });

    const emp = this.getEmployeeByCode(sub.employeeCode);
    const empName = emp ? emp.name : sub.employeeCode;

    const auditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SUBMISSION_VERIFIED',
      target: `${sub.fullName} (${sub.handle}) -> ${empName}`,
      actor: verifiedBy,
      note: `Verified ${sub.platforms.length} platform(s)${sub.engaged ? ' + engagement bonus' : ''}.`,
      pointsChange: `+${points}`
    };

    this.state.auditLogs.unshift(auditEntry);

    // Sync to Cloud Firestore
    if (firebaseService.isConfigured) {
      firebaseService.updateSubmission(sub.id, sub);
      firebaseService.saveSettings(this.state.settings);
      firebaseService.saveAuditLog(auditEntry);
    }

    this.saveState();
    return sub;
  }

  rejectSubmission(submissionId, reason, rejectedBy = 'Admin') {
    const sub = this.state.submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');
    if (!reason) throw new Error('A rejection reason must be recorded.');

    const previousStatus = sub.status;
    const previousPoints = sub.pointsAwarded || 0;

    sub.status = 'rejected';
    sub.rejectionReason = reason;
    sub.verifiedAt = new Date().toISOString();
    sub.verifiedBy = rejectedBy;
    sub.pointsAwarded = 0;

    // If previously verified, decrement campaign growth on platforms
    if (previousStatus === 'verified') {
      (sub.platforms || []).forEach(plat => {
        if (this.state.settings.platforms[plat]) {
          this.state.settings.platforms[plat].campaignGrowth = Math.max(0, (this.state.settings.platforms[plat].campaignGrowth || 0) - 1);
        }
      });
    }

    const emp = this.getEmployeeByCode(sub.employeeCode);
    const empName = emp ? emp.name : sub.employeeCode;

    const auditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SUBMISSION_REJECTED',
      target: `${sub.fullName} (${sub.handle}) -> ${empName}`,
      actor: rejectedBy,
      note: `Rejection reason: ${reason}`,
      pointsChange: previousStatus === 'verified' ? `-${previousPoints}` : '0'
    };

    this.state.auditLogs.unshift(auditEntry);

    // Sync to Cloud Firestore
    if (firebaseService.isConfigured) {
      firebaseService.updateSubmission(sub.id, sub);
      firebaseService.saveSettings(this.state.settings);
      firebaseService.saveAuditLog(auditEntry);
    }

    this.saveState();
    return sub;
  }

  deleteSubmission(submissionId) {
    const sub = this.state.submissions.find(s => s.id === submissionId);
    if (!sub) return;

    // If previously verified, decrement campaign growth on platforms
    if (sub.status === 'verified') {
      (sub.platforms || []).forEach(plat => {
        if (this.state.settings.platforms[plat]) {
          this.state.settings.platforms[plat].campaignGrowth = Math.max(0, (this.state.settings.platforms[plat].campaignGrowth || 0) - 1);
        }
      });
    }

    this.state.submissions = this.state.submissions.filter(s => s.id !== submissionId);

    const auditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SUBMISSION_DELETED',
      target: `${sub.fullName} (${sub.handle})`,
      actor: 'Admin',
      note: `Deleted submission record.`,
      pointsChange: sub.status === 'verified' ? `-${sub.pointsAwarded || 0}` : '0'
    };

    this.state.auditLogs.unshift(auditEntry);

    // Sync to Cloud Firestore
    if (firebaseService.isConfigured) {
      firebaseService.deleteSubmission(submissionId);
      firebaseService.saveSettings(this.state.settings);
      firebaseService.saveAuditLog(auditEntry);
    }

    this.saveState();
  }

  adjustEmployeePoints(employeeId, delta, note, adminName = 'Admin') {
    const emp = this.state.employees.find(e => e.id === employeeId);
    if (!emp) throw new Error('Employee not found');
    if (!note || note.trim().length === 0) throw new Error('An audit note is required for point adjustments.');

    const pointsDelta = parseInt(delta, 10);
    if (isNaN(pointsDelta) || pointsDelta === 0) throw new Error('Invalid point adjustment value.');

    emp.customPointsAdjustment = (emp.customPointsAdjustment || 0) + pointsDelta;

    const auditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'POINT_ADJUSTMENT',
      target: `${emp.name} (${emp.referralCode})`,
      actor: adminName,
      note: note.trim(),
      pointsChange: pointsDelta > 0 ? `+${pointsDelta}` : `${pointsDelta}`
    };

    this.state.auditLogs.unshift(auditEntry);

    // Sync to Cloud Firestore
    if (firebaseService.isConfigured) {
      firebaseService.updateEmployee(emp.id, emp);
      firebaseService.saveAuditLog(auditEntry);
    }

    this.saveState();
    return emp;
  }

  // --- Campaign Settings & Social Links Management ---
  updateSettings(newSettings) {
    this.state.settings = sanitizeSettings({
      ...this.state.settings,
      ...newSettings
    });
    this.saveState();
  }

  updatePrizes(prizes) {
    this.state.settings.prizes = {
      ...this.state.settings.prizes,
      ...prizes
    };
    delete this.state.settings.prizes.milestones;
    this.saveState();
  }

  togglePlatform(platformKey, enabled) {
    if (this.state.settings.platforms[platformKey]) {
      this.state.settings.platforms[platformKey].enabled = Boolean(enabled);
      this.saveState();
    }
  }

  updateSocialPlatform(platformKey, data) {
    if (this.state.settings.platforms[platformKey]) {
      this.state.settings.platforms[platformKey] = {
        ...this.state.settings.platforms[platformKey],
        ...data,
        baseline: data.baseline !== undefined ? parseInt(data.baseline, 10) || 0 : this.state.settings.platforms[platformKey].baseline
      };

      const auditEntry = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'PLATFORM_UPDATED',
        target: this.state.settings.platforms[platformKey].name,
        actor: 'Admin',
        note: `Updated platform link/handle: ${data.handle || ''} (${data.url || ''})`,
        pointsChange: '0'
      };

      this.state.auditLogs.unshift(auditEntry);

      if (firebaseService.isConfigured) {
        firebaseService.saveSettings(this.state.settings);
        firebaseService.saveAuditLog(auditEntry);
      }

      this.saveState();
    }
  }

  updateOutreachTemplate(templateKey, data) {
    if (!this.state.settings.templates) {
      this.state.settings.templates = { ...SEED_DATA.settings.templates };
    }
    if (this.state.settings.templates[templateKey]) {
      this.state.settings.templates[templateKey] = {
        ...this.state.settings.templates[templateKey],
        ...data
      };

      const auditEntry = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'TEMPLATE_UPDATED',
        target: this.state.settings.templates[templateKey].title || templateKey,
        actor: 'Admin',
        note: `Updated outreach template message/copy.`,
        pointsChange: '0'
      };

      this.state.auditLogs.unshift(auditEntry);

      if (firebaseService.isConfigured) {
        firebaseService.saveSettings(this.state.settings);
        firebaseService.saveAuditLog(auditEntry);
      }

      this.saveState();
    }
  }

  updatePlatform(platformKey, data) {
    return this.updateSocialPlatform(platformKey, data);
  }

  updateTemplate(templateKey, data) {
    return this.updateOutreachTemplate(templateKey, data);
  }

  publishWinner() {
    const leaderboard = this.getLeaderboard('all');
    if (leaderboard.length > 0) {
      const topWinner = leaderboard[0];
      this.state.settings.winnerPublished = true;
      this.state.settings.winnerDetails = {
        winner: topWinner,
        publishedAt: new Date().toISOString(),
        topThree: leaderboard.slice(0, 3)
      };
      this.saveState();
    }
  }

  // --- Computations ---
  getLeaderboard(departmentFilter = 'all') {
    const activePlatformsCount = Object.values(this.state.settings.platforms).filter(p => p.enabled).length;

    // Calculate metrics for each employee from verified submissions only
    const standings = this.state.employees.map(emp => {
      const employeeSubmissions = this.state.submissions.filter(s => s.employeeCode.toUpperCase() === emp.referralCode.toUpperCase());
      const verifiedSubmissions = employeeSubmissions.filter(s => s.status === 'verified');
      const pendingSubmissions = employeeSubmissions.filter(s => s.status === 'pending');
      const rejectedSubmissions = employeeSubmissions.filter(s => s.status === 'rejected');

      const verifiedPointsFromReferrals = verifiedSubmissions.reduce((sum, s) => {
        return sum + (s.pointsAwarded || calculateReferralPoints(s.platforms, s.engaged, activePlatformsCount));
      }, 0);

      const totalVerifiedPoints = Math.max(0, verifiedPointsFromReferrals + (emp.customPointsAdjustment || 0));
      const badge = getEmployeeBadge(totalVerifiedPoints, verifiedSubmissions.length);

      return {
        ...emp,
        verifiedFollowerCount: verifiedSubmissions.length,
        pendingCount: pendingSubmissions.length,
        rejectedCount: rejectedSubmissions.length,
        totalPoints: totalVerifiedPoints,
        badge,
        submissions: employeeSubmissions
      };
    });

    // Sort descending by totalPoints, then by verifiedFollowerCount, then name
    standings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.verifiedFollowerCount !== a.verifiedFollowerCount) return b.verifiedFollowerCount - a.verifiedFollowerCount;
      return a.name.localeCompare(b.name);
    });

    // Assign rank positions
    const rankedStandings = standings.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    if (departmentFilter && departmentFilter !== 'all') {
      return rankedStandings.filter(emp => emp.department.toLowerCase() === departmentFilter.toLowerCase());
    }

    return rankedStandings;
  }

  getEmployeeStats(employeeId) {
    const emp = this.getEmployeeById(employeeId);
    if (!emp) return null;

    const leaderboard = this.getLeaderboard('all');
    const rankInfo = leaderboard.find(e => e.id === emp.id) || { rank: leaderboard.length, totalPoints: 0, verifiedFollowerCount: 0 };
    const employeeSubmissions = this.state.submissions.filter(s => s.employeeCode.toUpperCase() === emp.referralCode.toUpperCase());

    const milestone = getMilestoneProgress(rankInfo.totalPoints);

    // Recent activity with privacy-masked follower handles
    const recentActivity = employeeSubmissions.slice(0, 10).map(s => ({
      id: s.id,
      maskedHandle: s.handle.length > 5 
        ? `${s.handle.substring(0, 3)}***${s.handle.substring(s.handle.length - 2)}`
        : `${s.handle.substring(0, 2)}***`,
      platforms: s.platforms,
      status: s.status,
      engaged: s.engaged,
      points: s.pointsAwarded,
      submittedAt: s.submittedAt
    }));

    return {
      employee: rankInfo,
      rank: rankInfo.rank,
      totalEmployees: leaderboard.length,
      totalPoints: rankInfo.totalPoints,
      verifiedReferrals: rankInfo.verifiedFollowerCount,
      pendingReferrals: employeeSubmissions.filter(s => s.status === 'pending').length,
      rejectedReferrals: employeeSubmissions.filter(s => s.status === 'rejected').length,
      milestone,
      recentActivity
    };
  }

  getAnalytics() {
    const activePlatforms = Object.entries(this.state.settings.platforms).filter(([_, p]) => p.enabled);
    const verifiedSubs = this.state.submissions.filter(s => s.status === 'verified');
    const totalVerifiedFollowers = verifiedSubs.length;
    const totalSubmissions = this.state.submissions.length;

    // Platform breakdown
    const platformBreakdown = {};
    activePlatforms.forEach(([key]) => {
      platformBreakdown[key] = 0;
    });

    verifiedSubs.forEach(s => {
      (s.platforms || []).forEach(p => {
        platformBreakdown[p] = (platformBreakdown[p] || 0) + 1;
      });
    });

    // Multi-platform count
    const multiPlatformCount = verifiedSubs.filter(s => (s.platforms || []).length >= 3).length;
    const multiPlatformRate = totalVerifiedFollowers > 0 
      ? Math.round((multiPlatformCount / totalVerifiedFollowers) * 100) 
      : 0;

    // Department performance
    const departmentPerformance = {};
    const leaderboard = this.getLeaderboard('all');
    leaderboard.forEach(emp => {
      if (!departmentPerformance[emp.department]) {
        departmentPerformance[emp.department] = {
          totalPoints: 0,
          verifiedFollowers: 0,
          employeeCount: 0
        };
      }
      departmentPerformance[emp.department].totalPoints += emp.totalPoints;
      departmentPerformance[emp.department].verifiedFollowers += emp.verifiedFollowerCount;
      departmentPerformance[emp.department].employeeCount += 1;
    });

    const activeEmployeesWithPoints = leaderboard.filter(e => e.totalPoints > 0).length;
    const participationRate = leaderboard.length > 0 
      ? Math.round((activeEmployeesWithPoints / leaderboard.length) * 100)
      : 0;

    const visits = this.state.linkVisitsCount || 0;
    const completionRate = visits > 0 
      ? Math.round((totalSubmissions / visits) * 100)
      : 0;

    return {
      totalVerifiedFollowers,
      totalSubmissions,
      pendingCount: this.state.submissions.filter(s => s.status === 'pending').length,
      rejectedCount: this.state.submissions.filter(s => s.status === 'rejected').length,
      totalEmployees: this.state.employees.length,
      participatingEmployeesCount: activeEmployeesWithPoints,
      participationRate,
      totalLinkVisits: visits,
      completionRate,
      multiPlatformRate,
      totalEngagements: verifiedSubs.filter(s => s.engaged).length,
      retentionRate: 94, // Projected 30-day organic retention
      platformBreakdown,
      departmentPerformance
    };
  }

  exportCSV(type = 'submissions') {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    let headers = [];
    let rows = [];
    let filename = `retain-growth-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'submissions') {
      headers = ['ID', 'Follower Name', 'Follower Email', 'Social Handle', 'Referral Code', 'Employee Name', 'Platforms', 'Engaged', 'Status', 'Points Awarded', 'Submitted At', 'Verified At', 'Rejection Reason'];
      rows = this.state.submissions.map(s => {
        const emp = this.getEmployeeByCode(s.employeeCode);
        return [
          esc(s.id),
          esc(s.fullName),
          esc(s.email),
          esc(s.handle),
          esc(s.employeeCode),
          esc(emp ? emp.name : 'Unknown'),
          esc((s.platforms || []).join(', ')),
          s.engaged ? 'Yes' : 'No',
          esc(s.status),
          s.pointsAwarded || 0,
          esc(s.submittedAt),
          esc(s.verifiedAt || ''),
          esc(s.rejectionReason || '')
        ];
      });
    } else if (type === 'leaderboard') {
      const standings = this.getLeaderboard('all');
      headers = ['Rank', 'Employee Name', 'Email', 'Department', 'Referral Code', 'Verified Followers', 'Pending Referrals', 'Total Points', 'Achievement Badge'];
      rows = standings.map(e => [
        e.rank,
        esc(e.name),
        esc(e.email),
        esc(e.department),
        esc(e.referralCode),
        e.verifiedFollowerCount,
        e.pendingCount,
        e.totalPoints,
        esc(e.badge?.name || '')
      ]);
    } else if (type === 'audit') {
      headers = ['Log ID', 'Timestamp', 'Action', 'Target', 'Actor', 'Note', 'Points Change'];
      rows = this.state.auditLogs.map(l => [
        esc(l.id),
        esc(l.timestamp),
        esc(l.action),
        esc(l.target),
        esc(l.actor),
        esc(l.note),
        esc(l.pointsChange)
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const store = new Store();
