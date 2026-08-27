/**
 * Retain Social Growth Challenge - Firebase Cloud Firestore Service
 * Complete database layer powered by Google Cloud Firestore with real-time onSnapshot synchronization.
 * User data and campaign state are stored exclusively in Firestore (never in localStorage).
 */

const FIREBASE_CONFIG_KEY = 'retain_firebase_config';

// Official Firebase project configuration for Retain / Dochase Growth Challenge
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBOZe98lOEbJtkKTJqYnpaFncKtSApsf9g",
  authDomain: "dochase-internal-campaign.firebaseapp.com",
  projectId: "dochase-internal-campaign",
  storageBucket: "dochase-internal-campaign.firebasestorage.app",
  messagingSenderId: "164273389297",
  appId: "1:164273389297:web:d94ed9d5cfce55b3e57350"
};

class FirebaseService {
  constructor() {
    this.isConfigured = false;
    this.db = null;
    this.auth = null;
    this.unsubscribeListeners = [];
    this.config = this.loadStoredConfig();
  }

  loadStoredConfig() {
    try {
      const stored = sessionStorage.getItem(FIREBASE_CONFIG_KEY) || localStorage.getItem(FIREBASE_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load Firebase config:', e);
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  saveConfig(config) {
    this.config = config;
    try {
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('Error saving Firebase config:', e);
      return false;
    }
  }

  clearConfig() {
    this.config = DEFAULT_FIREBASE_CONFIG;
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
    localStorage.removeItem('dochase_firebase_config');
    sessionStorage.removeItem(FIREBASE_CONFIG_KEY);
  }

  async initialize() {
    if (!this.config || !this.config.projectId || !this.config.apiKey) {
      this.isConfigured = false;
      return false;
    }

    try {
      if (window.firebase) {
        if (!firebase.apps.length) {
          firebase.initializeApp(this.config);
        }
        this.db = firebase.firestore();
        this.auth = firebase.auth ? firebase.auth() : null;
        this.isConfigured = true;
        console.log('[Firestore] Connected for project:', this.config.projectId);
        return true;
      } else {
        console.warn('Firebase SDK not loaded on window.');
      }
    } catch (err) {
      console.warn('Firestore initialization notice (operating in active in-memory mode until credentials connected):', err.message);
    }
    return false;
  }

  // --- Real-time Listeners for All Collections ---
  setupRealtimeSync({ onSubmissionsUpdate, onEmployeesUpdate, onAuditLogsUpdate, onSettingsUpdate }) {
    if (!this.isConfigured || !this.db) return;

    // Clear existing listeners
    this.unsubscribeListeners.forEach(unsub => unsub && unsub());
    this.unsubscribeListeners = [];

    try {
      // 1. Submissions Collection Listener
      const unsubSubmissions = this.db.collection('submissions').onSnapshot(
        (snapshot) => {
          const submissions = [];
          if (!snapshot.empty) {
            snapshot.forEach(doc => submissions.push({ id: doc.id, ...doc.data() }));
            submissions.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
          }
          const cleanSubs = submissions.filter(s => !['sub-101', 'sub-102', 'sub-103', 'sub-104', 'sub-105', 'sub-106', 'sub-107', 'sub-108', 'sub-109', 'sub-110'].includes(s.id));
          if (onSubmissionsUpdate) onSubmissionsUpdate(cleanSubs);
        },
        (err) => console.warn('Firestore submissions listener notice:', err.message)
      );
      this.unsubscribeListeners.push(unsubSubmissions);

      // 2. Employees Collection Listener
      const unsubEmployees = this.db.collection('employees').onSnapshot(
        (snapshot) => {
          const employees = [];
          if (!snapshot.empty) {
            snapshot.forEach(doc => employees.push({ id: doc.id, ...doc.data() }));
          }
          const cleanEmps = employees.filter(e => !['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5', 'emp-6', 'emp-7', 'emp-8'].includes(e.id));
          if (onEmployeesUpdate) onEmployeesUpdate(cleanEmps);
        },
        (err) => console.warn('Firestore employees listener notice:', err.message)
      );
      this.unsubscribeListeners.push(unsubEmployees);

      // 3. Audit Logs Collection Listener
      const unsubAudit = this.db.collection('audit_logs').onSnapshot(
        (snapshot) => {
          const logs = [];
          if (!snapshot.empty) {
            snapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));
            logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
          }
          const cleanLogs = logs.filter(l => !['aud-01', 'aud-02', 'aud-03', 'aud-04', 'aud-05', 'aud-06', 'aud-07', 'aud-08', 'aud-09'].includes(l.id));
          if (onAuditLogsUpdate) onAuditLogsUpdate(cleanLogs);
        },
        (err) => console.warn('Firestore audit logs listener notice:', err.message)
      );
      this.unsubscribeListeners.push(unsubAudit);

      // 4. Settings Document Listener
      const unsubSettings = this.db.collection('settings').doc('campaign_settings').onSnapshot(
        (doc) => {
          if (doc.exists) {
            const settings = doc.data();
            if (onSettingsUpdate) onSettingsUpdate(settings);
          }
        },
        (err) => console.warn('Firestore settings listener notice:', err.message)
      );
      this.unsubscribeListeners.push(unsubSettings);

      console.log('[Firestore] Real-time sync active across all collections.');
    } catch (err) {
      console.warn('Error setting up Firestore real-time listeners:', err);
    }
  }

  // --- Purge All Collections in Cloud Firestore ---
  async clearAllFirestoreData(cleanSettings) {
    if (!this.isConfigured || !this.db) return;

    try {
      console.log('[Firestore] Purging all collections in Cloud Firestore...');
      const [empSnap, subSnap, auditSnap] = await Promise.all([
        this.db.collection('employees').get(),
        this.db.collection('submissions').get(),
        this.db.collection('audit_logs').get()
      ]);

      const batch = this.db.batch();

      empSnap.forEach(doc => {
        batch.delete(doc.ref);
      });

      subSnap.forEach(doc => {
        batch.delete(doc.ref);
      });

      auditSnap.forEach(doc => {
        batch.delete(doc.ref);
      });

      if (cleanSettings) {
        const settingsRef = this.db.collection('settings').doc('campaign_settings');
        batch.set(settingsRef, cleanSettings);
      }

      await batch.commit();
      console.log('[Firestore] All dummy documents purged successfully from Cloud Firestore.');
    } catch (err) {
      console.error('Error clearing Firestore cloud data:', err);
    }
  }


  // --- Seed Database in Firestore If Empty ---
  async seedFirestoreIfEmpty(seedData) {
    if (!this.isConfigured || !this.db) return;

    try {
      const empSnap = await this.db.collection('employees').limit(1).get();
      if (empSnap.empty && seedData.employees && seedData.employees.length > 0) {
        console.log('[Firestore] Seeding Cloud Firestore with initial campaign data...');
        const batch = this.db.batch();

        // Seed Employees
        seedData.employees.forEach(emp => {
          const ref = this.db.collection('employees').doc(emp.id);
          batch.set(ref, emp);
        });

        // Seed Submissions
        (seedData.submissions || []).forEach(sub => {
          const ref = this.db.collection('submissions').doc(sub.id);
          batch.set(ref, sub);
        });

        // Seed Audit Logs
        (seedData.auditLogs || []).forEach(log => {
          const ref = this.db.collection('audit_logs').doc(log.id);
          batch.set(ref, log);
        });

        // Seed Settings
        if (seedData.settings) {
          const ref = this.db.collection('settings').doc('campaign_settings');
          batch.set(ref, seedData.settings);
        }

        await batch.commit();
        console.log('[Firestore] Cloud Firestore successfully seeded with campaign data.');
      }
    } catch (err) {
      console.warn('Firestore seed check notice:', err.message);
    }
  }

  // --- One-Shot Fetch of Full Firestore State ---
  async fetchFullState() {
    if (!this.isConfigured || !this.db) return null;

    try {
      const [empSnap, subSnap, auditSnap, settingsDoc] = await Promise.all([
        this.db.collection('employees').get(),
        this.db.collection('submissions').get(),
        this.db.collection('audit_logs').get(),
        this.db.collection('settings').doc('campaign_settings').get()
      ]);

      const employees = [];
      empSnap.forEach(d => employees.push({ id: d.id, ...d.data() }));

      const submissions = [];
      subSnap.forEach(d => submissions.push({ id: d.id, ...d.data() }));
      submissions.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

      const auditLogs = [];
      auditSnap.forEach(d => auditLogs.push({ id: d.id, ...d.data() }));
      auditLogs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

      const settings = settingsDoc.exists ? settingsDoc.data() : null;

      return {
        employees: employees.length > 0 ? employees : null,
        submissions: submissions.length > 0 ? submissions : null,
        auditLogs: auditLogs.length > 0 ? auditLogs : null,
        settings: settings || null
      };
    } catch (err) {
      console.warn('Firestore fetchFullState notice:', err.message);
      return null;
    }
  }

  // --- Firestore CRUD Operations ---
  async saveSubmission(submission) {
    if (!this.isConfigured || !this.db || !submission || !submission.id) return;
    try {
      await this.db.collection('submissions').doc(submission.id).set(submission);
    } catch (err) {
      console.error('Firestore saveSubmission error:', err);
    }
  }

  async updateSubmission(submissionId, updates) {
    if (!this.isConfigured || !this.db || !submissionId) return;
    try {
      await this.db.collection('submissions').doc(submissionId).set(updates, { merge: true });
    } catch (err) {
      console.error('Firestore updateSubmission error:', err);
    }
  }

  async deleteSubmission(submissionId) {
    if (!this.isConfigured || !this.db || !submissionId) return;
    try {
      await this.db.collection('submissions').doc(submissionId).delete();
    } catch (err) {
      console.error('Firestore deleteSubmission error:', err);
    }
  }

  async saveEmployee(employee) {
    if (!this.isConfigured || !this.db || !employee || !employee.id) return;
    try {
      await this.db.collection('employees').doc(employee.id).set(employee);
    } catch (err) {
      console.error('Firestore saveEmployee error:', err);
    }
  }

  async updateEmployee(employeeId, updates) {
    if (!this.isConfigured || !this.db || !employeeId) return;
    try {
      await this.db.collection('employees').doc(employeeId).set(updates, { merge: true });
    } catch (err) {
      console.error('Firestore updateEmployee error:', err);
    }
  }

  async saveAuditLog(log) {
    if (!this.isConfigured || !this.db || !log || !log.id) return;
    try {
      await this.db.collection('audit_logs').doc(log.id).set(log);
    } catch (err) {
      console.error('Firestore saveAuditLog error:', err);
    }
  }

  async saveSettings(settings) {
    if (!this.isConfigured || !this.db || !settings) return;
    try {
      await this.db.collection('settings').doc('campaign_settings').set(settings, { merge: true });
    } catch (err) {
      console.error('Firestore saveSettings error:', err);
    }
  }
}

export const firebaseService = new FirebaseService();
