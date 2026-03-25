// ===== auth.js =====
// לוגיקת אימות - מעודכן לגרסה החדשה

function initAuth() {
  auth.onAuthStateChanged((currentUser) => {
    setState({ user: currentUser });
    if (currentUser) {
      loadFirestoreData();
    }
    renderApp();
  });

  auth.signInAnonymously().catch(err => console.error('Auth error:', err));
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
    } else {
      setState({ loginError: 'גישה נדחתה: המערכת מורשית לחיילי מפל״ג בלבד.' });
    }
  } else {
    setState({ loginError: 'שם המשתמש או הסיסמה שגויים' });
  }
  renderApp();
}

function handleLogout() {
  setState({
    isAuthenticated: false, loggedInAdmin: '',
    loginUsername: '', loginPassword: '',
    loginError: ''
  });
  renderApp();
}
