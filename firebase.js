// ===== firebase.js =====
// אתחול Firebase וחיבור לבסיס הנתונים

const firebaseConfig = {
  apiKey: "AIzaSyBLyAgKch4C9ipdna6xg1kVEUWavIkWzUI",
  authDomain: "niud-db.firebaseapp.com",
  projectId: "niud-db",
  storageBucket: "niud-db.firebasestorage.app",
  messagingSenderId: "1027212682336",
  appId: "1:1027212682336:web:d0d3d2c0d22eb896564f05",
  measurementId: "G-LZ5X6D9QEV"
};

// Set your own Google Apps Script webhook URL to enable Sheets sync.
const GOOGLE_SHEETS_WEBHOOK_URL =
  '';

// Optional fallback auth credentials (used only if anonymous auth is unavailable).
// Leave empty to disable email/password fallback.
const FIREBASE_AUTH_EMAIL = '';
const FIREBASE_AUTH_PASSWORD = '';

const APP_ID = 'niud-form-app';

// Firebase SDK loaded via CDN in index.html
let app, auth, db;

function initFirebase() {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db   = firebase.firestore();
}

// Helper: Firestore document references
function getRequestsRef() {
  return db.collection('artifacts').doc(APP_ID)
    .collection('public').doc('data')
    .collection('inventory_requests');
}

function getSettingsRef() {
  return db.collection('artifacts').doc(APP_ID)
    .collection('public').doc('data')
    .collection('inventory_settings').doc('master_lists');
}
