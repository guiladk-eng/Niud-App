// ===== auth.js =====
// לוגיקת אימות - מעודכן לגרסה החדשה

function initAuth() {
  setState({ isAuthReady: false, authError: '', authErrorCode: '' });
  renderApp();

  window.__niudAuthDebug = {
    startedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    online: navigator.onLine
  };

  setTimeout(() => {
    if (!AppState.isAuthReady && !AppState.user && !AppState.authError) {
      setState({
        authError: 'Firebase auth timed out (no response from authentication server).',
        authErrorCode: 'auth/timeout'
      });
      renderApp();
      console.error('Firebase auth timeout: no auth state change after 12s');
    }
  }, 12000);

  auth.onAuthStateChanged((currentUser) => {
    window.__niudAuthDebug.lastAuthStateChangeAt = new Date().toISOString();
    window.__niudAuthDebug.currentUid = currentUser ? currentUser.uid : null;

    setState({
      user: currentUser,
      isAuthReady: true,
      authError: '',
      authErrorCode: ''
    });
    if (currentUser) {
      loadFirestoreData();
    }
    renderApp();
  }, (observerErr) => {
    console.error('onAuthStateChanged observer error:', observerErr);
    window.__niudAuthDebug.authObserverError = {
      code: observerErr && observerErr.code,
      message: observerErr && observerErr.message
    };
    setState({
      isAuthReady: true,
      authError: observerErr?.message || 'Firebase auth observer failed.',
      authErrorCode: observerErr?.code || 'auth/observer-error'
    });
    renderApp();
  });

  if (!navigator.onLine) {
    setState({
      authError: 'No internet connection. Firebase auth cannot start while offline.',
      authErrorCode: 'network/offline'
    });
    renderApp();
  }

  auth.signInAnonymously().catch(async (err) => {
    console.error('Anonymous auth error:', err);
    window.__niudAuthDebug.anonymousAuthError = {
      code: err && err.code,
      message: err && err.message
    };

    const hasEmailFallback = !!(FIREBASE_AUTH_EMAIL && FIREBASE_AUTH_PASSWORD);
    if (err && err.code === 'auth/operation-not-allowed' && hasEmailFallback) {
      try {
        await auth.signInWithEmailAndPassword(FIREBASE_AUTH_EMAIL, FIREBASE_AUTH_PASSWORD);
        return;
      } catch (fallbackErr) {
        console.error('Email/password fallback auth error:', fallbackErr);
        window.__niudAuthDebug.emailFallbackError = {
          code: fallbackErr && fallbackErr.code,
          message: fallbackErr && fallbackErr.message
        };
        setState({
          isAuthReady: true,
          authError: fallbackErr.message || 'Firebase auth failed (email/password fallback).',
          authErrorCode: fallbackErr.code || 'unknown'
        });
        renderApp();
        return;
      }
    }

    setState({
      isAuthReady: true,
      authError: err.message || 'Firebase auth failed.',
      authErrorCode: err.code || 'unknown'
    });
    renderApp();
  });
}

// handleLogin - מקבל event כדי לתמוך ב-form onsubmit
function handleLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  setState({ loginError: '' });

  const username = AppState.loginUsername.trim();
  const password = AppState.loginPassword.trim();

  if (!username || !password) {
    setState({ loginError: 'יש להזין שם פרטי ומספר אישי' });
    renderApp();
    return;
  }

  const soldier = AppState.soldiersData.find(s =>
    s.name.includes(username) &&
    s.id === password &&
    password !== ''
  );

  if (soldier) {
    if (soldier.isMaplag) {
      setState({ loggedInAdmin: soldier.name, isAuthenticated: true, loginError: '' });
      appendActivityLog(`התחבר למערכת`, { type: 'auth_login' });
    } else {
      setState({ loginError: 'גישה נדחתה: המערכת מורשית לחיילי מפל״ג בלבד.' });
    }
  } else {
    setState({ loginError: 'שם המשתמש או הסיסמה שגויים' });
  }
  renderApp();
}

function handleLogout() {
  appendActivityLog('התנתק מהמערכת', { type: 'auth_logout' });
  setState({
    isAuthenticated: false, loggedInAdmin: '',
    loginUsername: '', loginPassword: '',
    loginError: '',
    pendingActivityLog: []
  });
  renderApp();
}
