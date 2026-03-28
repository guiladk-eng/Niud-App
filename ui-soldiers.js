// ===== ui-soldiers.js =====
// טאב ניהול חיילים - גרסה סופית, מוגנת מפני קריסות ונתונים פגומים

function renderSoldiersTab() {
  const { soldiersData, isSavingSoldiers, soldierSaveMessage, soldiersSearchTerm } = AppState;

  // המרה בטוחה למערך, למקרה שהפיירבייס הפך את הרשימה לאובייקט או שיש נתונים חסרים
  let safeSoldiersData = [];
  if (Array.isArray(soldiersData)) {
    safeSoldiersData = soldiersData;
  } else if (soldiersData && typeof soldiersData === 'object') {
    safeSoldiersData = Object.values(soldiersData);
  }

  const filteredSoldiersData = getFilteredSoldiers(soldiersSearchTerm || '');

  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-700">ניהול חיילים ומחלקות</h2>
        <p class="text-sm text-slate-500">הוסף חיילים חדשים, ערוך שמות, מספרים אישיים ושיוך מחלקתי.</p>
      </div>
      <button type="button" onclick="handleSaveSoldiers()"
        ${isSavingSoldiers ? 'disabled' : ''}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-300 w-full sm:w-auto">
        ${isSavingSoldiers ? 'שומר...' : `שמור רשימה <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`}
      </button>
    </div>

    ${soldierSaveMessage ? `<div class="bg-green-100 text-green-700 p-4 rounded-lg font-medium shadow-sm mb-4">${escH(soldierSaveMessage)}</div>` : ''}

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <label class="block text-sm font-bold text-slate-700 mb-2">חיפוש חייל לפי שם או מ.א</label>
      <div class="relative">
        <input
          type="text"
          id="soldiers-search-input"
          value="${escH(soldiersSearchTerm || '')}"
          placeholder="הקלד שם או מספר אישי..."
          oninput="handleSoldiersSearchInput(this)"
          class="w-full border border-slate-300 rounded-lg p-2.5 pl-10 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <svg class="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <div class="text-xs text-slate-500 mt-2">
        ${soldiersSearchTerm ? `נמצאו ${filteredSoldiersData.length} תוצאות` : `מציג ${safeSoldiersData.length} חיילים`}
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
      <h3 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
        הוספת חייל חדש
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">שם מלא</label>
          <input id="new-soldier-name" required placeholder="שם מלא"
            oninput="setState({newSoldier:{...(AppState.newSoldier || {}),name:this.value}})"
            class="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">מספר אישי</label>
          <input id="new-soldier-id" required placeholder="מספר אישי"
            oninput="setState({newSoldier:{...(AppState.newSoldier || {}),id:this.value}})"
            class="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">מחלקה</label>
          <input id="new-soldier-dept" placeholder="ללא מחלקה"
            oninput="setState({newSoldier:{...(AppState.newSoldier || {}),department:this.value}})"
            class="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <button type="button" onclick="submitNewSoldier()"
          class="bg-slate-800 hover:bg-slate-900 text-white rounded-lg p-2 font-bold transition-colors">
          הוסף חייל
        </button>
      </div>
      <label class="flex items-center gap-2 mt-3 cursor-pointer">
        <input id="new-soldier-maplag" type="checkbox"
          onchange="setState({newSoldier:{...(AppState.newSoldier || {}),isMaplag:this.checked}})"
          class="w-4 h-4 text-blue-600 rounded cursor-pointer"/>
        <span class="text-sm font-medium text-slate-700">הרשאת מפל"ג (יוכל להתחבר לניהול)</span>
      </label>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-right border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-600 text-sm">
              <th class="p-3 border-b border-slate-200">שם החייל</th>
              <th class="p-3 border-b border-slate-200">מספר אישי</th>
              <th class="p-3 border-b border-slate-200">מחלקה</th>
              <th class="p-3 border-b border-slate-200 text-center">הרשאת מפל"ג</th>
              <th class="p-3 border-b border-slate-200 text-center w-16">הסרה</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSoldiersData.map((soldier) => {
              if (!soldier) return ''; // דילוג בטוח על רשומות ריקות/שבורות
              const idx = safeSoldiersData.indexOf(soldier);
              return `
              <tr class="border-b border-slate-50 hover:bg-slate-50">
                <td class="p-2">
                  <input value="${escH(soldier.name || '')}"
                    onchange="handleUpdateSoldier(${idx},'name',this.value)"
                    class="w-full border-none bg-transparent p-1 outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded"/>
                </td>
                <td class="p-2">
                  <input value="${escH(soldier.id || '')}"
                    onchange="handleUpdateSoldier(${idx},'id',this.value)"
                    class="w-full border-none bg-transparent p-1 outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded font-mono text-sm"/>
                </td>
                <td class="p-2">
                  <input value="${escH(soldier.department || '')}" placeholder="ללא מחלקה"
                    onchange="handleUpdateSoldier(${idx},'department',this.value)"
                    class="w-full border-none bg-transparent p-1 outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded"/>
                </td>
                <td class="p-2 text-center">
                  <input type="checkbox" ${soldier.isMaplag ? 'checked' : ''}
                    onchange="handleUpdateSoldier(${idx},'isMaplag',this.checked)"
                    class="w-4 h-4 text-blue-600 rounded cursor-pointer"/>
                </td>
                <td class="p-2 text-center">
                  <button type="button" onclick="handleRemoveSoldier(${idx})" title="הסר חייל"
                    class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function submitNewSoldier() {
  const newSoldier = AppState.newSoldier || {};
  if (!newSoldier.name || !newSoldier.id) return;
  
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

function handleSoldiersSearchInput(inputEl) {
  const value = inputEl ? inputEl.value : '';
  const cursorPos = inputEl && typeof inputEl.selectionStart === 'number' ? inputEl.selectionStart : value.length;

  setState({ soldiersSearchTerm: value });
  renderApp();

  const nextInput = document.getElementById('soldiers-search-input');
  if (!nextInput) return;
  nextInput.focus();
  const pos = Math.min(cursorPos, nextInput.value.length);
  try {
    nextInput.setSelectionRange(pos, pos);
  } catch (_) {
    // ignore for browsers/input modes that do not support selection APIs
  }
}
