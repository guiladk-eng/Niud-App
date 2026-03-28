// ===== activity.js =====
// Centralized activity log for user actions

const MAX_ACTIVITY_LOG_ITEMS = 500;

function buildActivityEntry(message, extra = {}) {
  const actor = AppState.loggedInAdmin || 'משתמש לא מזוהה';
  const now = new Date();
  return {
    id: `${now.getTime()}-${Math.random().toString(16).slice(2, 8)}`,
    message,
    actor,
    userUid: (AppState.user && AppState.user.uid) || '',
    timestamp: now.toISOString(),
    timestampMs: now.getTime(),
    ...extra
  };
}

function appendToLocalActivity(entries) {
  const list = Array.isArray(entries) ? entries : [entries];
  const current = Array.isArray(AppState.activityLog) ? AppState.activityLog : [];
  const next = [...list, ...current].slice(0, MAX_ACTIVITY_LOG_ITEMS);
  setState({ activityLog: next });
}

function persistActivityEntries(entries) {
  const list = Array.isArray(entries) ? entries : [entries];
  if (!list.length || !db || !AppState.user) return;
  getSettingsRef()
    .set({ activityLog: firebase.firestore.FieldValue.arrayUnion(...list) }, { merge: true })
    .catch((e) => console.error('Failed to persist activity log:', e));
}

function appendActivityLog(message, extra = {}, persistToServer = true) {
  const entry = buildActivityEntry(message, extra);
  appendToLocalActivity(entry);
  if (persistToServer) persistActivityEntries(entry);
  if (typeof renderApp === 'function' && (AppState.activeTab === 'history' || AppState.activeTab === 'home')) {
    renderApp();
  }
}

function queuePendingActivity(message, extra = {}, scope = 'general') {
  const entry = buildActivityEntry(message, { ...extra, pendingScope: scope });
  const pending = Array.isArray(AppState.pendingActivityLog) ? AppState.pendingActivityLog : [];
  setState({ pendingActivityLog: [...pending, entry] });
}

function commitPendingActivity(scope = 'general') {
  const pending = Array.isArray(AppState.pendingActivityLog) ? AppState.pendingActivityLog : [];
  const toCommit = pending.filter(e => (e.pendingScope || 'general') === scope);
  if (!toCommit.length) return;

  const rest = pending.filter(e => (e.pendingScope || 'general') !== scope);
  const finalized = toCommit.map(({ pendingScope, ...entry }) => entry);

  appendToLocalActivity(finalized.slice().reverse());
  persistActivityEntries(finalized);
  setState({ pendingActivityLog: rest });

  if (typeof renderApp === 'function' && (AppState.activeTab === 'history' || AppState.activeTab === 'home')) {
    renderApp();
  }
}

function clearPendingActivity(scope = 'general') {
  const pending = Array.isArray(AppState.pendingActivityLog) ? AppState.pendingActivityLog : [];
  setState({ pendingActivityLog: pending.filter(e => (e.pendingScope || 'general') !== scope) });
}

function sortActivityLogNewestFirst(items) {
  const arr = Array.isArray(items) ? [...items] : [];
  arr.sort((a, b) => {
    const aMs = Number(a && a.timestampMs) || Date.parse((a && a.timestamp) || '') || 0;
    const bMs = Number(b && b.timestampMs) || Date.parse((b && b.timestamp) || '') || 0;
    return bMs - aMs;
  });
  return arr;
}

function formatActivityDate(entry) {
  const ms = Number(entry && entry.timestampMs) || Date.parse((entry && entry.timestamp) || '') || 0;
  if (!ms) return '-';
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(ms));
}
