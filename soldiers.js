// ===== soldiers.js =====
// לוגיקה לניהול חיילים ובחירת חייל - מוגן מפני קריסות נתונים

function selectSoldierForForm(soldier) {
  if (!soldier) {
    setState({
      soldierName: '', personalNumber: '',
      formSearchTerm: '', 
      cart: {}, originalCart: {},
      cartWeapons: [], originalWeapons: [],
      cartOptics: [], originalOptics: [],
      cartComms: [], originalComms: []
    });
    renderApp();
    return;
  }

  const depStr = soldier.department ? ` | ${soldier.department}` : '';
  setState({
    soldierName: soldier.name,
    personalNumber: soldier.id,
    formSearchTerm: `${soldier.name} - ${soldier.id}${depStr}`,
    isFormDropdownOpen: false
  });

  const soldierHistory = [...AppState.submissionHistory]
    .filter(e => e.soldierName === soldier.name)
    .reverse();

  const currentCart = {};
  const weaponsMap  = new Map();
  const opticsMap   = new Map();
  const commsMap    = new Map();

  soldierHistory.forEach(entry => {
    if (entry.items) {
      Object.entries(entry.items).forEach(([item, qty]) => {
        currentCart[item] = (currentCart[item] || 0) + Number(qty);
      });
    }
    (entry.weapons || []).forEach(w => weaponsMap.set(`${w.type}-${w.serial}`, w));
    (entry.returnedWeapons || []).forEach(w => weaponsMap.delete(`${w.type}-${w.serial}`));
    (entry.optics || []).forEach(o => opticsMap.set(`${o.type}-${o.serial}`, o));
    (entry.returnedOptics || []).forEach(o => opticsMap.delete(`${o.type}-${o.serial}`));
    (entry.comms || []).forEach(c => commsMap.set(`${c.type}-${c.serial}`, c));
    (entry.returnedComms || []).forEach(c => commsMap.delete(`${c.type}-${c.serial}`));
  });

  Object.keys(currentCart).forEach(k => { if (currentCart[k] <= 0) delete currentCart[k]; });

  setState({
    cart: { ...currentCart },
    originalCart: { ...currentCart },
    cartWeapons: Array.from(weaponsMap.values()),
    originalWeapons: Array.from(weaponsMap.values()),
    cartOptics: Array.from(opticsMap.values()),
    originalOptics: Array.from(opticsMap.values()),
    cartComms: Array.from(commsMap.values()),
    originalComms: Array.from(commsMap.values())
  });
  renderApp();
}

function selectSoldierForDashboard(soldier) {
  if (!soldier) {
    setState({ selectedSoldier: '', dashboardSearchTerm: '' });
    renderApp();
    return;
  }
  const depStr = soldier.department ? ` | ${soldier.department}` : '';
  setState({
    selectedSoldier: soldier.name,
    dashboardSearchTerm: `${soldier.name} - ${soldier.id}${depStr}`,
    isDashboardDropdownOpen: false
  });
  renderApp();
}

function handleAddSoldier(e) {
  if (e) e.preventDefault();
  const newSoldier = AppState.newSoldier || {};
  if (newSoldier.name && newSoldier.id) {
    const currentSoldiers = Array.isArray(AppState.soldiersData) ? AppState.soldiersData : Object.values(AppState.soldiersData || {});
    setState({
      soldiersData: [...currentSoldiers, { ...newSoldier }],
      newSoldier: { name: '', id: '', department: '', isMaplag: false }
    });
    queuePendingActivity(`הוסיף חייל חדש: ${newSoldier.name} (${newSoldier.id})${newSoldier.department ? ` | ${newSoldier.department}` : ''}`, {
      type: 'soldier_add',
      soldierName: newSoldier.name,
      personalNumber: newSoldier.id
    }, 'soldiers');
    ['new-soldier-name','new-soldier-id','new-soldier-dept'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const cb = document.getElementById('new-soldier-maplag');
    if (cb) cb.checked = false;
    renderApp();
  }
}

function handleUpdateSoldier(index, field, value) {
  const arr = Array.isArray(AppState.soldiersData) ? [...AppState.soldiersData] : Object.values(AppState.soldiersData || {});
  if (arr[index]) {
    const before = arr[index];
    arr[index] = { ...arr[index], [field]: value };
    setState({ soldiersData: arr });
    const after = arr[index];
    const fieldNames = {
      name: 'שם',
      id: 'מספר אישי',
      department: 'מחלקה',
      isMaplag: 'הרשאת מפל"ג'
    };
    queuePendingActivity(`עדכן חייל ${before.name || ''} (${before.id || ''}) - ${fieldNames[field] || field}: ${String(after[field])}`, {
      type: 'soldier_update',
      soldierName: after.name,
      personalNumber: after.id,
      field
    }, 'soldiers');
  }
}

function handleRemoveSoldier(index) {
  const arr = Array.isArray(AppState.soldiersData) ? AppState.soldiersData : Object.values(AppState.soldiersData || {});
  const removed = arr[index];
  setState({ soldiersData: arr.filter((_, i) => i !== index) });
  if (removed) {
    queuePendingActivity(`הסיר חייל: ${removed.name || ''} (${removed.id || ''})`, {
      type: 'soldier_remove',
      soldierName: removed.name,
      personalNumber: removed.id
    }, 'soldiers');
  }
  renderApp();
}

function getFilteredSoldiers(searchTerm) {
  const arr = Array.isArray(AppState.soldiersData) ? AppState.soldiersData : Object.values(AppState.soldiersData || {});
  
  if (!searchTerm || searchTerm.trim() === '') return arr;
  
  const term = searchTerm.trim().toLowerCase();
  
  return arr.filter(s => {
    if (!s) return false;
    const matchName = s.name && s.name.toLowerCase().includes(term);
    const matchId = s.id && String(s.id).toLowerCase().includes(term);
    const matchDept = s.department && s.department.toLowerCase().includes(term);
    
    return matchName || matchId || matchDept;
  }).slice(0, 20);
}
