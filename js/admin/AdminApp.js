/**
 * Retain Social Growth Challenge - React 18 Admin Application
 * Pure Native React 18 with HTM (Zero Babel Overhead, Native Browser ESM)
 */

import { store } from '../store.js';
import { getReferralUrl } from '../scoring.js';
import { getSocialIcon } from '../icons.js';

// Bind HTM to React.createElement for standard template JSX syntax
const html = window.htm ? window.htm.bind(React.createElement) : null;
const { useState, useEffect, useMemo, useRef, useCallback } = React;

export function AdminApp() {
  const [appState, setAppState] = useState(() => store.getState());
  const [activeTab, setActiveTab] = useState('submissions');
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('all');
  
  // Modals state
  const [rejectModalSubId, setRejectModalSubId] = useState(null);
  const [editPlatformKey, setEditPlatformKey] = useState(null);
  const [editTemplateKey, setEditTemplateKey] = useState(null);

  // Form states for adding employee & point adjustment
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Sales');
  const [adjustEmpId, setAdjustEmpId] = useState('');
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  const showToast = useCallback((message, type = 'info') => {
    if (window.showToast) {
      window.showToast(message, type);
    }
  }, []);

  // Subscribe to real-time store updates
  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  // Update Lucide icons after renders
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  const { settings, employees, submissions, auditLogs, auth } = appState;
  const isAdminLoggedIn = Boolean(auth?.admin?.isLoggedIn);

  // Sync adjustEmpId default when employees change
  useEffect(() => {
    if (employees && employees.length > 0 && !adjustEmpId) {
      setAdjustEmpId(employees[0].id);
    }
  }, [employees, adjustEmpId]);

  // Derived counts
  const pendingCount = useMemo(() => (submissions || []).filter(s => s.status === 'pending').length, [submissions]);
  const verifiedCount = useMemo(() => (submissions || []).filter(s => s.status === 'verified').length, [submissions]);
  const rejectedCount = useMemo(() => (submissions || []).filter(s => s.status === 'rejected').length, [submissions]);

  // Duplicate checks map
  const { emailCounts, handleCounts } = useMemo(() => {
    const eCounts = {};
    const hCounts = {};
    (submissions || []).forEach(s => {
      const em = (s.email || '').toLowerCase().trim();
      const h = (s.handle || '').toLowerCase().trim();
      if (em) eCounts[em] = (eCounts[em] || 0) + 1;
      if (h) hCounts[h] = (hCounts[h] || 0) + 1;
    });
    return { emailCounts: eCounts, handleCounts: hCounts };
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return (submissions || []).filter(s => {
      if (submissionStatusFilter !== 'all' && s.status !== submissionStatusFilter) {
        return false;
      }
      if (submissionSearch.trim()) {
        const query = submissionSearch.toLowerCase().trim();
        const matchName = (s.fullName || '').toLowerCase().includes(query);
        const matchEmail = (s.email || '').toLowerCase().includes(query);
        const matchHandle = (s.handle || '').toLowerCase().includes(query);
        const matchCode = (s.employeeCode || '').toLowerCase().includes(query);
        return matchName || matchEmail || matchHandle || matchCode;
      }
      return true;
    });
  }, [submissions, submissionStatusFilter, submissionSearch]);

  // Admin Actions
  const handleLogin = (email, password) => {
    try {
      store.loginAdmin(email, password);
      showToast('Welcome to the Admin Control Center', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    store.logoutAdmin();
    showToast('Logged out of Admin Control Center.', 'info');
  };

  const handleVerifySubmission = (id) => {
    try {
      store.verifySubmission(id, 'Admin Verified');
      showToast('Submission verified and points awarded!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenRejectModal = (id) => {
    setRejectModalSubId(id);
  };

  const handleConfirmReject = (reason) => {
    if (!rejectModalSubId) return;
    try {
      store.rejectSubmission(rejectModalSubId, reason, 'Admin Verified');
      setRejectModalSubId(null);
      showToast('Submission rejected and audit note recorded.', 'warning');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSubmission = (id) => {
    if (window.confirm('Are you sure you want to delete this submission record?')) {
      store.deleteSubmission(id);
      showToast('Submission deleted.', 'info');
    }
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    try {
      const created = store.registerEmployee(newEmpName, newEmpEmail, newEmpDept);
      setNewEmpName('');
      setNewEmpEmail('');
      showToast(`Employee ${created.name} added (Code: ${created.referralCode})`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustPoints = (e) => {
    e.preventDefault();
    if (!adjustEmpId) {
      showToast('Please select a target employee.', 'error');
      return;
    }
    const delta = parseInt(adjustDelta, 10);
    if (isNaN(delta) || delta === 0) {
      showToast('Please specify a valid non-zero point delta.', 'error');
      return;
    }
    if (!adjustNote.trim()) {
      showToast('Mandatory audit note is required.', 'error');
      return;
    }
    try {
      store.adjustEmployeePoints(adjustEmpId, delta, adjustNote.trim(), 'Admin');
      setAdjustDelta('');
      setAdjustNote('');
      showToast(`Adjusted points by ${delta > 0 ? '+' : ''}${delta}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePublishWinner = () => {
    store.publishWinner();
    if (window.confetti) {
      window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#EF4444', '#F43F5E', '#FB923C', '#10B981'] });
    }
    showToast('Winner published and announced across portals!', 'success');
  };

  const handleResetData = async () => {
    if (window.confirm('Clear all campaign data completely from local state and Cloud Firestore?')) {
      await store.resetToSeedData();
      showToast('All campaign data cleared completely.', 'info');
    }
  };

  const handleExportCSV = (type) => {
    store.exportCSV(type);
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} CSV exported.`, 'success');
  };

  // If not logged in, render Admin Login screen
  if (!isAdminLoggedIn) {
    return html`
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mx-auto mb-4 shadow-lg ring-4 ring-rose-500/20">
            <i data-lucide="lock" className="w-7 h-7 text-rose-500"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-500 mt-2">Sign in to manage submissions, verify points, and configure settings.</p>
        </div>

        <${AdminLoginForm} onLogin=${handleLogin} />

        <div className="mt-8 text-center">
          <a href="campaign.html" className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors">
            <i data-lucide="arrow-left" className="w-3.5 h-3.5"></i>
            <span>Return to Campaign Page</span>
          </a>
        </div>
      </div>
    `;
  }

  return html`
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in min-w-0">
      
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 min-w-0">
        <div>
          <h2 className="text-3xl font-black text-slate-900">
            Campaign Control <span className="marker-highlight">Center</span>
          </h2>
        </div>

        
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <button onClick=${() => handleExportCSV('submissions')} className="btn-outline-pill text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm cursor-pointer flex-shrink-0">
            <i data-lucide="download" className="w-4 h-4 text-slate-700"></i>
            <span>Export CSV</span>
          </button>
          <button onClick=${handlePublishWinner} className="btn-retain text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer flex-shrink-0">
            <i data-lucide="award" className="w-4 h-4 text-white"></i>
            <span>${settings.winnerPublished ? 'Winner Finalized' : 'Finalize Winner'}</span>
          </button>
          <button onClick=${handleResetData} className="px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0" title="Clear all campaign data completely">
            <i data-lucide="refresh-cw" className="w-3.5 h-3.5"></i>
            <span>Clear Data</span>
          </button>
          <button onClick=${handleLogout} className="px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0">
            <i data-lucide="log-out" className="w-3.5 h-3.5"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-none min-w-0 flex-nowrap">
        <button 
          onClick=${() => setActiveTab('submissions')} 
          className=${`admin-tab-btn px-4 py-2.5 text-xs flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer ${activeTab === 'submissions' ? 'font-black border-b-2 border-rose-600 text-rose-600' : 'font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <i data-lucide="list-checks" className="w-4 h-4"></i>
          <span>Submissions Queue</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">${pendingCount} pending</span>
        </button>

        <button 
          onClick=${() => setActiveTab('employees')} 
          className=${`admin-tab-btn px-4 py-2.5 text-xs flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer ${activeTab === 'employees' ? 'font-black border-b-2 border-rose-600 text-rose-600' : 'font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <i data-lucide="users" className="w-4 h-4"></i>
          <span>Employees & Points Audit</span>
          <span className="text-slate-400 text-[10px]">(${(employees || []).length})</span>
        </button>

        <button 
          onClick=${() => setActiveTab('settings')} 
          className=${`admin-tab-btn px-4 py-2.5 text-xs flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer ${activeTab === 'settings' ? 'font-black border-b-2 border-rose-600 text-rose-600' : 'font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <i data-lucide="settings" className="w-4 h-4"></i>
          <span>Campaign Settings & Toolkit</span>
        </button>

        <button 
          onClick=${() => setActiveTab('analytics')} 
          className=${`admin-tab-btn px-4 py-2.5 text-xs flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer ${activeTab === 'analytics' ? 'font-black border-b-2 border-rose-600 text-rose-600' : 'font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <i data-lucide="bar-chart-3" className="w-4 h-4"></i>
          <span>Campaign Intelligence</span>
        </button>
      </div>

      
      ${activeTab === 'submissions' && html`
        <div className="space-y-6 animate-fade-in min-w-0">
          
          
          <div className="modern-card p-4 sm:p-5 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm min-w-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap min-w-0">
              <button onClick=${() => setSubmissionStatusFilter('all')} className=${`px-3.5 py-1.5 rounded-full text-xs transition-all flex-shrink-0 cursor-pointer ${submissionStatusFilter === 'all' ? 'font-black bg-slate-900 text-white shadow-sm' : 'font-bold bg-[#FAFBF7] text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>
                All (${(submissions || []).length})
              </button>
              <button onClick=${() => setSubmissionStatusFilter('pending')} className=${`px-3.5 py-1.5 rounded-full text-xs transition-all flex-shrink-0 cursor-pointer ${submissionStatusFilter === 'pending' ? 'font-black bg-slate-900 text-white shadow-sm' : 'font-bold bg-[#FAFBF7] text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>
                Pending (${pendingCount})
              </button>
              <button onClick=${() => setSubmissionStatusFilter('verified')} className=${`px-3.5 py-1.5 rounded-full text-xs transition-all flex-shrink-0 cursor-pointer ${submissionStatusFilter === 'verified' ? 'font-black bg-slate-900 text-white shadow-sm' : 'font-bold bg-[#FAFBF7] text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>
                Verified (${verifiedCount})
              </button>
              <button onClick=${() => setSubmissionStatusFilter('rejected')} className=${`px-3.5 py-1.5 rounded-full text-xs transition-all flex-shrink-0 cursor-pointer ${submissionStatusFilter === 'rejected' ? 'font-black bg-slate-900 text-white shadow-sm' : 'font-bold bg-[#FAFBF7] text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>
                Rejected (${rejectedCount})
              </button>
            </div>

            <div className="relative w-full sm:w-auto min-w-[220px]">
              <i data-lucide="search" className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                value=${submissionSearch} 
                onInput=${(e) => setSubmissionSearch(e.target.value)} 
                placeholder="Search name, handle, code..." 
                className="w-full bg-[#FAFBF7] border border-slate-200 rounded-full pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500" 
              />
            </div>
          </div>

          
          <div className="modern-card border-slate-200 overflow-hidden shadow-xl min-w-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
                <thead className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-[#FAFBF7] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Follower Details</th>
                    <th className="py-3.5 px-4">Social Handle</th>
                    <th className="py-3.5 px-4">Platforms</th>
                    <th className="py-3.5 px-4">Referrer (Code)</th>
                    <th className="py-3.5 px-4">Engaged?</th>
                    <th className="py-3.5 px-4">Status / Duplicate Check</th>
                    <th className="py-3.5 px-4 text-center">Points</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  ${filteredSubmissions.length === 0 ? html`
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-slate-400 text-xs">
                        No submissions found matching criteria.
                      </td>
                    </tr>
                  ` : filteredSubmissions.map((sub) => {
                    const isDupEmail = emailCounts[(sub.email || '').toLowerCase().trim()] > 1;
                    const isDupHandle = handleCounts[(sub.handle || '').toLowerCase().trim()] > 1;
                    const emp = store.getEmployeeByCode(sub.employeeCode);

                    return html`
                      <tr key=${sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <span className="font-bold text-slate-900 block truncate max-w-[180px]" title=${sub.fullName}>${sub.fullName}</span>
                          <span className="text-[11px] text-slate-500 font-mono block truncate max-w-[180px]" title=${sub.email}>${sub.email}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-900 font-bold min-w-[120px]">
                          <span className="truncate block max-w-[140px]" title=${sub.handle}>${sub.handle}</span>
                        </td>

                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="flex items-center gap-1 flex-wrap">
                            ${(sub.platforms || []).map(p => html`
                              <span key=${p} className="px-2 py-0.5 rounded-md bg-[#FAFBF7] border border-slate-200 text-[9px] text-slate-700 font-semibold uppercase">${p}</span>
                            `)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 min-w-[140px]">
                          <span className="font-mono font-bold text-slate-900 block truncate max-w-[140px]" title=${sub.employeeCode}>${sub.employeeCode}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">${emp ? emp.name : 'Unknown Staff'}</span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          ${sub.engaged ? html`<span className="text-emerald-700 font-bold">Yes (+1)</span>` : html`<span className="text-slate-400">No</span>`}
                        </td>

                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="break-words">
                            ${sub.status === 'verified' && html`<span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">Verified</span>`}
                            ${sub.status === 'pending' && html`<span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px]">Pending</span>`}
                            ${sub.status === 'rejected' && html`<span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[10px]">Rejected</span>`}

                            ${(isDupEmail || isDupHandle) && html`
                              <div className="mt-1 text-[10px] text-amber-700 font-bold flex items-center gap-1">
                                <i data-lucide="alert-circle" className="w-3 h-3"></i>
                                <span>${isDupEmail ? 'Duplicate Email' : 'Duplicate Handle'}</span>
                              </div>
                            `}

                            ${sub.rejectionReason && html`
                              <p className="text-[10px] text-rose-600 italic mt-0.5 break-words">"${sub.rejectionReason}"</p>
                            `}
                          </div>
                        </td>

                        <td className=${`py-3.5 px-4 text-center font-black whitespace-nowrap ${sub.status === 'verified' ? 'text-slate-900 text-sm' : 'text-slate-400'}`}>
                          ${sub.pointsAwarded || 0} pts
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            ${sub.status !== 'verified' && html`
                              <button 
                                onClick=${() => handleVerifySubmission(sub.id)}
                                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white transition-all cursor-pointer"
                                title="Verify Submission"
                              >
                                <i data-lucide="check" className="w-4 h-4"></i>
                              </button>
                            `}

                            ${sub.status !== 'rejected' && html`
                              <button 
                                onClick=${() => handleOpenRejectModal(sub.id)}
                                className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-600 text-rose-800 hover:text-white transition-all cursor-pointer"
                                title="Reject Submission"
                              >
                                <i data-lucide="x" className="w-4 h-4"></i>
                              </button>
                            `}

                            <button 
                              onClick=${() => handleDeleteSubmission(sub.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-all cursor-pointer"
                              title="Delete Record"
                            >
                              <i data-lucide="trash-2" className="w-4 h-4"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `}

      
      ${activeTab === 'employees' && html`
        <div className="space-y-8 animate-fade-in min-w-0">
          
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
            
            
            <div className="lg:col-span-4 modern-card p-6 sm:p-7 border-slate-200 h-fit shadow-sm min-w-0">
              <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
                <i data-lucide="user-plus" className="w-4 h-4 text-rose-600"></i>
                <span>Add Eligible Employee</span>
              </h3>
              <p className="text-xs text-slate-500 mb-5">Generates a unique, non-guessable referral code automatically (e.g. RETAIN-...).</p>

              <form onSubmit=${handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value=${newEmpName} 
                    onInput=${(e) => setNewEmpName(e.target.value)} 
                    placeholder="e.g. Samuel Adekunle" 
                    className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Official Email *</label>
                  <input 
                    type="email" 
                    required 
                    value=${newEmpEmail} 
                    onInput=${(e) => setNewEmpEmail(e.target.value)} 
                    placeholder="s.adekunle@retaindigital.io" 
                    className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Department *</label>
                  <select 
                    value=${newEmpDept} 
                    onChange=${(e) => setNewEmpDept(e.target.value)} 
                    className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Monetisation">Monetisation</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-3 rounded-full bg-slate-900 text-white font-bold text-xs shadow-md transition-all hover:bg-slate-800 cursor-pointer">
                  Add & Generate Referral Code
                </button>
              </form>
            </div>

            
            <div className="lg:col-span-8 modern-card border-slate-200 overflow-hidden shadow-xl min-w-0">
              <div className="p-5 bg-[#FAFBF7] border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-black text-slate-900">Registered Employees (${(employees || []).length})</h4>
                <span className="text-xs text-slate-500 font-medium">All unique referral codes active</span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-700 min-w-[550px]">
                  <thead className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-[#FAFBF7] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Referral Code</th>
                      <th className="py-3 px-4 text-center">Referrals</th>
                      <th className="py-3 px-4 text-center">Points</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    ${(employees || []).length === 0 ? html`
                      <tr>
                        <td colSpan="6" className="text-center py-10 text-slate-400 text-xs font-medium">
                          No employees registered yet. Employees will appear here once they register on the employee portal.
                        </td>
                      </tr>
                    ` : (employees || []).map((emp) => {
                      const stats = store.getEmployeeStats(emp.id);
                      return html`
                        <tr key=${emp.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5 min-w-[150px]">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style=${{ backgroundColor: emp.color || '#EF4444' }}>
                              ${emp.avatar}
                            </div>
                            <span className="truncate block max-w-[150px]">${emp.name}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 min-w-[120px]">${emp.department}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 min-w-[140px]">${emp.referralCode}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900">${stats ? stats.verifiedReferrals : 0}</td>
                          <td className="py-3.5 px-4 text-center font-black text-slate-900">${stats ? stats.totalPoints : 0}</td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button 
                              onClick=${() => {
                                const link = getReferralUrl(emp.referralCode);
                                navigator.clipboard.writeText(link);
                                showToast(`Copied link for ${emp.referralCode}`, 'success');
                              }}
                              className="text-xs text-slate-700 hover:text-slate-950 font-bold cursor-pointer"
                            >
                              Copy Link
                            </button>
                          </td>
                        </tr>
                      `;
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-slate-200/80 min-w-0">
            
            
            <div className="lg:col-span-4 modern-card p-6 sm:p-7 border-slate-200 h-fit shadow-sm min-w-0">
              <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
                <i data-lucide="sliders" className="w-4 h-4 text-amber-600"></i>
                <span>Manual Point Adjustment</span>
              </h3>
              <p className="text-xs text-slate-500 mb-5">Mandatory audit trail recorded for every point modification.</p>

              <form onSubmit=${handleAdjustPoints} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Target Employee *</label>
                  <select 
                    value=${adjustEmpId} 
                    onChange=${(e) => setAdjustEmpId(e.target.value)} 
                    required 
                    className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 truncate"
                  >
                    ${(employees || []).length > 0 ? (
                      (employees || []).map(e => html`
                        <option key=${e.id} value=${e.id}>${e.name} (${e.referralCode})</option>
                      `)
                    ) : html`
                      <option value="" disabled>No registered employees yet</option>
                    `}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Point Delta (+ or -) *</label>
                  <input 
                    type="number" 
                    required 
                    value=${adjustDelta} 
                    onInput=${(e) => setAdjustDelta(e.target.value)} 
                    placeholder="e.g. +2 or -1" 
                    className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Mandatory Audit Note *</label>
                  <textarea 
                    required 
                    rows="3" 
                    value=${adjustNote} 
                    onInput=${(e) => setAdjustNote(e.target.value)} 
                    placeholder="Explain the reason (e.g. special bonus for organizing / duplicate attribution correction)..." 
                    className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-y"
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md transition-all cursor-pointer">
                  Apply & Record Audit Entry
                </button>
              </form>
            </div>

            
            <div className="lg:col-span-8 modern-card border-slate-200 overflow-hidden shadow-xl min-w-0">
              <div className="p-5 bg-[#FAFBF7] border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <i data-lucide="shield" className="w-4 h-4 text-slate-700"></i>
                  <span>Official Verification & Audit Trail (${(auditLogs || []).length})</span>
                </h4>
                <button onClick=${() => handleExportCSV('audit')} className="text-xs text-slate-700 hover:underline font-bold cursor-pointer">Export Audit CSV</button>
              </div>
              <div className="p-4 divide-y divide-slate-100 max-h-[450px] overflow-y-auto font-medium min-w-0">
                ${(auditLogs || []).length === 0 ? html`
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <i data-lucide="shield" className="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
                    <p className="font-bold text-slate-500">No audit events recorded yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Audit events will be logged in real time when submissions are verified or points adjusted.</p>
                  </div>
                ` : (auditLogs || []).map((log) => html`
                  <div key=${log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 min-w-0">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-[#FAFBF7] border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                        <i data-lucide="file-text" className="w-4 h-4"></i>
                      </div>
                      <div className="min-w-0 flex-1 break-words">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 text-xs">${log.action}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono font-bold flex-shrink-0">${log.pointsChange || '0'}</span>
                          <span className="text-[11px] text-slate-500">• by ${log.actor}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5 break-words">Target: <strong className="font-bold">${log.target}</strong></p>
                        <p className="text-xs text-slate-500 mt-0.5 italic break-words">"${log.note}"</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono flex-shrink-0 sm:self-start self-end">
                      ${new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                `)}
              </div>
            </div>

          </div>

        </div>
      `}

      
      ${activeTab === 'settings' && html`
        <${CampaignSettingsTab} 
          settings=${settings} 
          showToast=${showToast} 
          onEditPlatform=${(key) => setEditPlatformKey(key)}
          onEditTemplate=${(key) => setEditTemplateKey(key)}
        />
      `}

      
      ${activeTab === 'analytics' && html`
        <${CampaignAnalyticsTab} appState=${appState} />
      `}

      
      ${rejectModalSubId && html`
        <${RejectModal} 
          submissionId=${rejectModalSubId} 
          onClose=${() => setRejectModalSubId(null)} 
          onConfirm=${handleConfirmReject} 
        />
      `}

      ${editPlatformKey && html`
        <${EditPlatformModal} 
          platformKey=${editPlatformKey} 
          platformData=${settings.platforms[editPlatformKey]} 
          onClose=${() => setEditPlatformKey(null)} 
          onSave=${(updates) => {
            store.updatePlatform(editPlatformKey, updates);
            setEditPlatformKey(null);
            showToast('Platform settings saved.', 'success');
          }} 
        />
      `}

      ${editTemplateKey && html`
        <${EditTemplateModal} 
          templateKey=${editTemplateKey} 
          templateData=${settings.templates[editTemplateKey]} 
          onClose=${() => setEditTemplateKey(null)} 
          onSave=${(updates) => {
            store.updateTemplate(editTemplateKey, updates);
            setEditTemplateKey(null);
            showToast('Outreach template updated.', 'success');
          }} 
        />
      `}

    </div>
  `;
}

// Sub-Component: Admin Login Form
function AdminLoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return html`
    <div className="modern-card p-8 border-slate-200 shadow-xl relative min-w-0">
      <form onSubmit=${handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Official Admin Email</label>
          <div className="relative">
            <i data-lucide="mail" className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
            <input 
              type="email" 
              required 
              value=${email} 
              onInput=${(e) => setEmail(e.target.value)} 
              placeholder="admin@retaindigital.io" 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Secure Password</label>
          <div className="relative">
            <i data-lucide="key-round" className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
            <input 
              type="password" 
              required 
              value=${password} 
              onInput=${(e) => setPassword(e.target.value)} 
              placeholder="••••••••••••" 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium" 
            />
          </div>
        </div>

        <button type="submit" className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
          <span>Authorize Access</span>
          <i data-lucide="arrow-right" className="w-4 h-4 text-rose-500"></i>
        </button>
      </form>
    </div>
  `;
}

// Sub-Component: Campaign Settings Tab
function CampaignSettingsTab({ settings, showToast, onEditPlatform, onEditTemplate }) {
  const [title, setTitle] = useState(settings.title || '');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [startDate, setStartDate] = useState(settings.startDate || '2026-09-01');
  const [endDate, setEndDate] = useState((settings.endDate || '2026-09-30').slice(0, 10));

  const [announcementMsg, setAnnouncementMsg] = useState(settings.announcement?.message || '');
  const [announcementEnabled, setAnnouncementEnabled] = useState(Boolean(settings.announcement?.enabled));

  const prizes = settings.prizes || {};
  const [firstPrize, setFirstPrize] = useState(prizes.first?.reward || '₦50,000 Cash Prize');
  const [firstDesc, setFirstDesc] = useState(prizes.first?.desc || 'Awarded to the #1 overall growth champion with the highest verified score + executive gold trophy');
  const [secondPrize, setSecondPrize] = useState(prizes.second?.reward || '₦30,000 Cash Prize');
  const [secondDesc, setSecondDesc] = useState(prizes.second?.desc || 'Awarded to the #2 ranked employee on the final verified leaderboard + executive silver plaque');
  const [thirdPrize, setThirdPrize] = useState(prizes.third?.reward || '₦15,000 Cash Prize');
  const [thirdDesc, setThirdDesc] = useState(prizes.third?.desc || 'Awarded to the #3 ranked employee on the final verified leaderboard');

  const handleSaveCampaignDates = (e) => {
    e.preventDefault();
    store.updateSettings({ title, tagline, startDate, endDate });
    showToast('Campaign dates and copy saved.', 'success');
  };

  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    store.updateAnnouncement(announcementMsg, announcementEnabled);
    showToast('Announcement banner settings updated.', 'success');
  };

  const handleSavePrizes = (e) => {
    e.preventDefault();
    store.updatePrizes({
      first: { ...(prizes.first || {}), reward: firstPrize, desc: firstDesc, title: 'Grand Prize Champion', icon: 'trophy' },
      second: { ...(prizes.second || {}), reward: secondPrize, desc: secondDesc, title: 'First Runner-Up', icon: 'award' },
      third: { ...(prizes.third || {}), reward: thirdPrize, desc: thirdDesc, title: 'Second Runner-Up', icon: 'star' }
    });
    showToast('Prize rewards and amounts updated.', 'success');
  };

  return html`
    <div className="space-y-8 animate-fade-in min-w-0">
      
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        
        
        <div className="lg:col-span-5 space-y-6 min-w-0">
          
          <div className="modern-card p-6 sm:p-7 border-slate-200 shadow-sm min-w-0">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <i data-lucide="calendar" className="w-4 h-4 text-slate-700"></i>
              <span>Campaign Dates & Copy</span>
            </h3>

            <form onSubmit=${handleSaveCampaignDates} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Campaign Title</label>
                <input 
                  type="text" 
                  value=${title} 
                  onInput=${(e) => setTitle(e.target.value)} 
                  className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Tagline</label>
                <input 
                  type="text" 
                  value=${tagline} 
                  onInput=${(e) => setTagline(e.target.value)} 
                  className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value=${startDate} 
                    onInput=${(e) => setStartDate(e.target.value)} 
                    className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value=${endDate} 
                    onInput=${(e) => setEndDate(e.target.value)} 
                    className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-full bg-slate-900 text-white font-black text-xs shadow-md hover:bg-slate-800 transition-all cursor-pointer">
                Save Campaign Configuration
              </button>
            </form>
          </div>

          <!-- Prize Rewards & Amounts Card -->
          <div className="modern-card p-6 sm:p-7 border-slate-200 shadow-sm min-w-0">
            <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <i data-lucide="trophy" className="w-4 h-4 text-rose-600"></i>
              <span>Prize Tiers & Rewards</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Edit the 1st, 2nd, and 3rd place prizes shown across the challenge.</p>

            <form onSubmit=${handleSavePrizes} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FAFBF7] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>1st Place Grand Champion</span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 uppercase">Top Prize</span>
                </div>
                <input 
                  type="text" 
                  value=${firstPrize} 
                  onInput=${(e) => setFirstPrize(e.target.value)} 
                  placeholder="e.g. ₦50,000 Cash Prize"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500" 
                />
                <input 
                  type="text" 
                  value=${firstDesc} 
                  onInput=${(e) => setFirstDesc(e.target.value)} 
                  placeholder="Reward details & trophy"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:border-rose-500" 
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAFBF7] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>2nd Place Runner-Up</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Silver</span>
                </div>
                <input 
                  type="text" 
                  value=${secondPrize} 
                  onInput=${(e) => setSecondPrize(e.target.value)} 
                  placeholder="e.g. ₦30,000 Cash Prize"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500" 
                />
                <input 
                  type="text" 
                  value=${secondDesc} 
                  onInput=${(e) => setSecondDesc(e.target.value)} 
                  placeholder="Reward details & plaque"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:border-rose-500" 
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAFBF7] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>3rd Place 2nd Runner-Up</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Bronze</span>
                </div>
                <input 
                  type="text" 
                  value=${thirdPrize} 
                  onInput=${(e) => setThirdPrize(e.target.value)} 
                  placeholder="e.g. ₦15,000 Cash Prize"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500" 
                />
                <input 
                  type="text" 
                  value=${thirdDesc} 
                  onInput=${(e) => setThirdDesc(e.target.value)} 
                  placeholder="Reward details"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:border-rose-500" 
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all cursor-pointer">
                Save Prize Rewards
              </button>
            </form>
          </div>

          <div className="modern-card p-6 sm:p-7 border-slate-200 shadow-sm min-w-0">
            <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <i data-lucide="megaphone" className="w-4 h-4 text-amber-600"></i>
              <span>Broadcast Pinned Announcement</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">Displays a high-visibility banner across the entire landing page.</p>

            <form onSubmit=${handleSaveAnnouncement} className="space-y-3">
              <textarea 
                rows="2" 
                value=${announcementMsg} 
                onInput=${(e) => setAnnouncementMsg(e.target.value)} 
                placeholder="e.g. Double bonus points active for all 6-platform follows this week!" 
                className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-y"
              ></textarea>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked=${announcementEnabled} 
                    onChange=${(e) => setAnnouncementEnabled(e.target.checked)} 
                    className="rounded bg-white text-slate-900" 
                  />
                  <span>Show Banner</span>
                </label>
                <button type="submit" className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer">
                  Update Announcement
                </button>
              </div>
            </form>
          </div>

        </div>

        
        <div className="lg:col-span-7 min-w-0">
          <div className="modern-card p-6 sm:p-7 border-slate-200 shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="share-2" className="w-4 h-4 text-rose-600"></i>
                <span>Official Social Links & Channels</span>
              </h3>
              <span className="text-xs font-bold text-rose-600 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">Live Editable</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Edit platform URLs, handles, baseline counts, and active status. Changes update immediately across all follower and employee views.
            </p>

            <div className="space-y-3.5">
              ${Object.entries(settings.platforms || {}).map(([key, p]) => html`
                <div key=${key} className="p-4 rounded-2xl bg-[#FAFBF7] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-400 transition-all min-w-0">
                  
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm p-2"
                      dangerouslySetInnerHTML=${{ __html: getSocialIcon(key, 'w-5 h-5 text-rose-400') }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">${p.name}</span>
                        ${p.enabled ? html`
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Active</span>
                        ` : html`
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Disabled</span>
                        `}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block truncate max-w-[180px] sm:max-w-xs">${p.handle}</span>
                      <a href=${p.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-rose-600 hover:underline truncate block font-mono max-w-[180px] sm:max-w-xs">
                        ${p.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 block font-medium">Followers</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">${((p.baseline || 0) + (p.campaignGrowth || 0)).toLocaleString()}</span>
                    </div>

                    <button 
                      onClick=${() => onEditPlatform(key)} 
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <i data-lucide="edit-3" className="w-3.5 h-3.5 text-slate-600"></i>
                      <span>Edit</span>
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer ml-1">
                      <input 
                        type="checkbox" 
                        checked=${Boolean(p.enabled)} 
                        onChange=${(e) => store.togglePlatform(key, e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>

                </div>
              `)}
            </div>
          </div>
        </div>

      </div>

      
      <div className="modern-card p-6 sm:p-8 border-slate-200 shadow-sm pt-8 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-rose-600 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">Live Editable</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Pre-Written Outreach Templates</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the pre-written messages provided to employees for 1-click sharing across WhatsApp, LinkedIn, Email, and X.
            </p>
          </div>
        </div>

        
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 text-xs text-amber-900 font-medium">
            <i data-lucide="info" className="w-4 h-4 text-amber-700 flex-shrink-0"></i>
            <span>Dynamic tokens automatically replaced for each employee:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-mono text-[11px] font-bold text-slate-800">{'{link}'} <span className="font-normal text-slate-500">= Referral Link</span></span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-mono text-[11px] font-bold text-slate-800">{'{code}'} <span className="font-normal text-slate-500">= Referral Code</span></span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-mono text-[11px] font-bold text-slate-800">{'{name}'} <span className="font-normal text-slate-500">= Employee Name</span></span>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          ${Object.entries(settings.templates || {}).map(([key, t]) => html`
            <div key=${key} className="p-6 rounded-2xl bg-[#FAFBF7] border border-slate-200 flex flex-col justify-between group hover:border-slate-400 transition-all min-w-0">
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center p-2 shadow-sm flex-shrink-0"
                      dangerouslySetInnerHTML=${{ __html: getSocialIcon(key, 'w-5 h-5 text-rose-400') }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">${t.platform || t.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium truncate block">${t.title}</span>
                    </div>
                  </div>

                  <button 
                    onClick=${() => onEditTemplate(key)} 
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer flex-shrink-0"
                  >
                    <i data-lucide="edit-3" className="w-3.5 h-3.5 text-slate-600"></i>
                    <span>Edit Template</span>
                  </button>
                </div>

                ${t.subject && html`
                  <div className="mb-2.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium truncate">
                    <span className="font-bold text-slate-900">Subject: </span>${t.subject}
                  </div>
                `}

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 font-mono text-[11px] text-slate-700 mb-4 whitespace-pre-wrap break-words max-h-36 overflow-y-auto">
                  ${t.template}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Auto-interpolates employee codes</span>
                <span className="font-mono text-slate-500">ID: ${t.id}</span>
              </div>
            </div>
          `)}
        </div>

      </div>

    </div>
  `;
}

// Sub-Component: Campaign Analytics Tab
function CampaignAnalyticsTab({ appState }) {
  const chartPlatformRef = useRef(null);
  const chartDeptRef = useRef(null);
  const chartPlatformInstance = useRef(null);
  const chartDeptInstance = useRef(null);

  const { settings, employees, submissions, linkVisitsCount } = appState;
  const verifiedSubs = useMemo(() => (submissions || []).filter(s => s.status === 'verified'), [submissions]);

  // Aggregate stats
  const totalVerifiedFollowers = verifiedSubs.length;
  const multiPlatformCount = useMemo(() => verifiedSubs.filter(s => (s.platforms || []).length >= 3).length, [verifiedSubs]);
  const multiRate = totalVerifiedFollowers > 0 ? Math.round((multiPlatformCount / totalVerifiedFollowers) * 100) : 0;
  const conversionRate = (linkVisitsCount || 0) > 0 ? Math.round((totalVerifiedFollowers / linkVisitsCount) * 100) : 0;
  const activeStaffCount = useMemo(() => (employees || []).filter(e => store.getEmployeeStats(e.id)?.verifiedReferrals > 0).length, [employees]);

  // Render Charts
  useEffect(() => {
    if (!window.Chart) return;

    // Platform Breakdown
    const platLabels = Object.values(settings.platforms || {}).map(p => p.name);
    const platData = Object.entries(settings.platforms || {}).map(([key]) => {
      return verifiedSubs.filter(s => (s.platforms || []).includes(key)).length;
    });

    if (chartPlatformRef.current) {
      if (chartPlatformInstance.current) chartPlatformInstance.current.destroy();
      chartPlatformInstance.current = new window.Chart(chartPlatformRef.current, {
        type: 'doughnut',
        data: {
          labels: platLabels,
          datasets: [{
            data: platData.some(d => d > 0) ? platData : [1, 1, 1, 1, 1, 1],
            backgroundColor: ['#0A66C2', '#E4405F', '#000000', '#00F2FE', '#1877F2', '#FF0000'],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } } }
          }
        }
      });
    }

    // Department Breakdown
    const deptMap = {};
    (employees || []).forEach(emp => {
      const d = emp.department || 'Other';
      const stats = store.getEmployeeStats(emp.id);
      deptMap[d] = (deptMap[d] || 0) + (stats?.totalPoints || 0);
    });

    const deptLabels = Object.keys(deptMap);
    const deptPoints = Object.values(deptMap);

    if (chartDeptRef.current) {
      if (chartDeptInstance.current) chartDeptInstance.current.destroy();
      chartDeptInstance.current = new window.Chart(chartDeptRef.current, {
        type: 'bar',
        data: {
          labels: deptLabels.length > 0 ? deptLabels : ['Sales', 'Accounts', 'Finance', 'Operations', 'Monetisation'],
          datasets: [{
            label: 'Total Verified Points',
            data: deptPoints.length > 0 ? deptPoints : [0, 0, 0, 0],
            backgroundColor: '#EF4444',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: '#F1F5F9' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    return () => {
      if (chartPlatformInstance.current) chartPlatformInstance.current.destroy();
      if (chartDeptInstance.current) chartDeptInstance.current.destroy();
    };
  }, [settings, employees, verifiedSubs]);

  return html`
    <div className="modern-card p-6 sm:p-8 border-slate-200 shadow-sm bg-white min-w-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900">Campaign Growth Intelligence</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time performance analytics across social networks and departments.</p>
        </div>
      </div>

      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 min-w-0">
        <div className="p-4 rounded-2xl bg-[#FAFBF7] border border-slate-200 min-w-0">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-1">Total Link Visits</span>
          <span className="text-2xl font-black text-slate-900">${(linkVisitsCount || 0).toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Unique outreach views</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAFBF7] border border-slate-200 min-w-0">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-1">Follower Conversions</span>
          <span className="text-2xl font-black text-slate-900">${totalVerifiedFollowers}</span>
          <span className="text-[10px] text-emerald-600 block mt-1 font-bold">${conversionRate}% conversion rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAFBF7] border border-slate-200 min-w-0">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-1">Multi-Platform Ratio</span>
          <span className="text-2xl font-black text-slate-900">${multiRate}%</span>
          <span className="text-[10px] text-slate-500 block mt-1">≥ 3 platforms followed</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAFBF7] border border-slate-200 min-w-0">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-1">Active Staff</span>
          <span className="text-2xl font-black text-slate-900">${activeStaffCount} / ${(employees || []).length}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Team members participating</span>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
        <div className="p-5 rounded-2xl bg-[#FAFBF7] border border-slate-200 min-w-0">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <i data-lucide="pie-chart" className="w-4 h-4 text-rose-500"></i>
            <span>Platform Follower Breakdown</span>
          </h4>
          <div className="h-64 relative min-w-0">
            <canvas ref=${chartPlatformRef}></canvas>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#FAFBF7] border border-slate-200 min-w-0">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <i data-lucide="bar-chart" className="w-4 h-4 text-rose-500"></i>
            <span>Department Point Standings</span>
          </h4>
          <div className="h-64 relative min-w-0">
            <canvas ref=${chartDeptRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Modal: Record Rejection Reason
function RejectModal({ submissionId, onClose, onConfirm }) {
  const [category, setCategory] = useState('Duplicate submission detected');
  const [custom, setCustom] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = custom.trim() ? `${category} - ${custom.trim()}` : category;
    onConfirm(finalReason);
  };

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="modern-card p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto min-w-0 shadow-2xl relative">
        <button onClick=${onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 cursor-pointer">
          <i data-lucide="x" className="w-5 h-5"></i>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0">
            <i data-lucide="x-circle" className="w-5 h-5"></i>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Record Rejection Reason</h3>
            <p className="text-xs text-slate-500">Mandatory audit trail for rejected submissions</p>
          </div>
        </div>

        <form onSubmit=${handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Select Rejection Category *</label>
            <select 
              value=${category} 
              onChange=${(e) => setCategory(e.target.value)} 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            >
              <option value="Duplicate submission detected">Duplicate submission detected</option>
              <option value="Existing follower before campaign launch">Existing follower before campaign launch</option>
              <option value="Suspicious bot or purchased follower account">Suspicious bot or purchased follower account</option>
              <option value="Unfollowed before verification audit">Unfollowed before verification audit</option>
              <option value="Invalid social handle / could not verify follow">Invalid social handle / could not verify follow</option>
              <option value="Temporary or disposable email address">Temporary or disposable email address</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Custom Explanation (Optional)</label>
            <textarea 
              rows="2" 
              value=${custom} 
              onInput=${(e) => setCustom(e.target.value)} 
              placeholder="Additional audit notes..." 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-y"
            ></textarea>
          </div>

          <button type="submit" className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer">
            <i data-lucide="shield-alert" className="w-4 h-4 text-rose-400"></i>
            <span>Confirm Rejection & Record Audit</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

// Modal: Edit Social Platform
function EditPlatformModal({ platformKey, platformData, onClose, onSave }) {
  const [name, setName] = useState(platformData?.name || '');
  const [handle, setHandle] = useState(platformData?.handle || '');
  const [url, setUrl] = useState(platformData?.url || '');
  const [baseline, setBaseline] = useState(platformData?.baseline || 0);
  const [enabled, setEnabled] = useState(Boolean(platformData?.enabled));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, handle, url, baseline: parseInt(baseline, 10) || 0, enabled });
  };

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="modern-card p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto min-w-0 shadow-2xl relative">
        <button onClick=${onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 cursor-pointer">
          <i data-lucide="x" className="w-5 h-5"></i>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0">
            <i data-lucide="share-2" className="w-5 h-5"></i>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Edit Social Platform</h3>
            <p className="text-xs text-slate-500">Update official URLs, handles, and follower counts</p>
          </div>
        </div>

        <form onSubmit=${handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Platform Name *</label>
            <input 
              type="text" 
              required 
              value=${name} 
              onInput=${(e) => setName(e.target.value)} 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Official Handle *</label>
            <input 
              type="text" 
              required 
              value=${handle} 
              onInput=${(e) => setHandle(e.target.value)} 
              placeholder="e.g. @retaindigital" 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Direct Follow URL *</label>
            <input 
              type="url" 
              required 
              value=${url} 
              onInput=${(e) => setUrl(e.target.value)} 
              placeholder="https://..." 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Baseline Follower Count</label>
            <input 
              type="number" 
              min="0" 
              value=${baseline} 
              onInput=${(e) => setBaseline(e.target.value)} 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500" 
            />
          </div>

          <div className="p-3 bg-[#FAFBF7] rounded-xl border border-slate-200">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
              <input 
                type="checkbox" 
                checked=${enabled} 
                onChange=${(e) => setEnabled(e.target.checked)} 
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4" 
              />
              <span>Enable in Challenge (Active Platform)</span>
            </label>
          </div>

          <button type="submit" className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer">
            <i data-lucide="save" className="w-4 h-4 text-rose-400"></i>
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

// Modal: Edit Outreach Template
function EditTemplateModal({ templateKey, templateData, onClose, onSave }) {
  const [title, setTitle] = useState(templateData?.title || '');
  const [subject, setSubject] = useState(templateData?.subject || '');
  const [templateBody, setTemplateBody] = useState(templateData?.template || '');

  const handleInsertToken = (token) => {
    setTemplateBody(prev => prev + ` ${token}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = { title, template: templateBody };
    if (templateKey === 'email') updates.subject = subject;
    onSave(updates);
  };

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="modern-card p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto min-w-0 shadow-2xl relative">
        <button onClick=${onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 cursor-pointer">
          <i data-lucide="x" className="w-5 h-5"></i>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-rose-400 flex items-center justify-center p-2 flex-shrink-0">
            <i data-lucide="message-square" className="w-5 h-5"></i>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Edit Outreach Template</h3>
            <p className="text-xs text-slate-500">Configure pre-written messages for employees</p>
          </div>
        </div>

        <form onSubmit=${handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Platform / Template Title *</label>
            <input 
              type="text" 
              required 
              value=${title} 
              onInput=${(e) => setTitle(e.target.value)} 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" 
            />
          </div>

          ${templateKey === 'email' && html`
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Subject Line</label>
              <input 
                type="text" 
                value=${subject} 
                onInput=${(e) => setSubject(e.target.value)} 
                placeholder="Invitation: Connect with Retain" 
                className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500" 
              />
            </div>
          `}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase text-slate-700">Template Message *</label>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span>Insert:</span>
                <button type="button" onClick=${() => handleInsertToken('{link}')} className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono font-bold text-slate-800 cursor-pointer">{'{link}'}</button>
                <button type="button" onClick=${() => handleInsertToken('{code}')} className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono font-bold text-slate-800 cursor-pointer">{'{code}'}</button>
                <button type="button" onClick=${() => handleInsertToken('{name}')} className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono font-bold text-slate-800 cursor-pointer">{'{name}'}</button>
              </div>
            </div>
            <textarea 
              required 
              rows="5" 
              value=${templateBody} 
              onInput=${(e) => setTemplateBody(e.target.value)} 
              placeholder="Enter the template message..." 
              className="w-full bg-[#FAFBF7] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-rose-500 resize-y"
            ></textarea>
            <span className="text-[10px] text-slate-400 mt-1 block">
              <span className="font-bold text-slate-600">{'{link}'}</span> = Employee referral link, <span className="font-bold text-slate-600">{'{code}'}</span> = Referral code, <span className="font-bold text-slate-600">{'{name}'}</span> = Employee full name.
            </span>
          </div>

          <button type="submit" className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer">
            <i data-lucide="save" className="w-4 h-4 text-rose-400"></i>
            <span>Save Outreach Template</span>
          </button>
        </form>
      </div>
    </div>
  `;
}
