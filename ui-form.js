// ===== ui-form.js =====
// טאב טופס מאסטר - גרסה סופית הכוללת איפוס אגרסיבי ותיבות הקלדה חכמות למספרים סידוריים

function renderFormTab() {
  const {
    soldierName, personalNumber, formSearchTerm,
    inventoryCategories, cart, originalCart,
    weaponsData, selectedWeaponType, selectedWeaponSerial, cartWeapons, originalWeapons,
    opticsData, selectedOpticType, selectedOpticSerial, cartOptics, originalOptics,
    commsData, selectedCommType, selectedCommSerial, cartComms, originalComms,
    isSubmitting
  } = AppStatewwwwwww;

  const totalItemsInCart = getTotalItemsInCart();
  const allFormSoldiers = Array.isArray(AppState.soldiersData)
    ? AppState.soldiersData
    : Object.values(AppState.soldiersData || {});

  return `
  <div class="space-y-6">

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        בחר חייל להצגה ועדכון ציוד
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">חיפוש חייל (שם או מ.א)</label>
          <div class="relative">
            <input type="text"
              id="main-soldier-search"
              value="${escH(formSearchTerm)}"
              list="form-soldiers-list"
              autocomplete="off"
              placeholder="הקלד לחיפוש חייל..."
              class="w-full border border-slate-300 rounded-lg p-2.5 pl-10 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              oninput="handleFormSearchTyping(this.value)"
              onchange="handleFormSearchSelection(this.value)"
            />
            <datalist id="form-soldiers-list">
              ${allFormSoldiers
                .filter(s => s && s.name)
                .map(s => `<option value="${escH(formatSoldierSearchValue(s))}"></option>`)
                .join('')}
            </datalist>
            
            ${formSearchTerm ? `
              <button type="button" onclick="handleClearSearch()" 
                class="absolute left-10 top-2.5 text-slate-400 hover:text-red-500 transition-colors" title="נקה חייל">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>` : ''}

            <svg class="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">מספר אישי מקושר</label>
          <input type="text" readonly
            value="${escH(personalNumber)}"
            placeholder="יופיע אוטומטית"
            class="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-500 cursor-not-allowed font-mono"/>
        </div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="22" y1="12" x2="18" y2="12" stroke-width="2"/><line x1="6" y1="12" x2="2" y2="12" stroke-width="2"/><line x1="12" y1="6" x2="12" y2="2" stroke-width="2"/><line x1="12" y1="22" x2="12" y2="18" stroke-width="2"/>
        </svg>
        כלי נשק של החייל
      </h2>
      <div class="flex flex-col md:flex-row gap-4 items-end mb-4">
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">סוג נשק</label>
          <select onchange="setSelectedWeaponType(this.value)"
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="" ${!selectedWeaponType ? 'selected' : ''} disabled>בחר סוג...</option>
            ${Object.keys(weaponsData).map(t => `<option value="${escH(t)}" ${selectedWeaponType===t?'selected':''}>${escH(t)}</option>`).join('')}
          </select>
        </div>
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">מספר נשק</label>
          <input type="text" list="weapon-serials-list"
            value="${escH(selectedWeaponSerial)}"
            onchange="setState({selectedWeaponSerial:this.value}); renderApp()"
            placeholder="הקלד או בחר..."
            autocomplete="off"
            ${!selectedWeaponType ? 'disabled' : ''}
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400" />
          <datalist id="weapon-serials-list">
            ${selectedWeaponType ? (weaponsData[selectedWeaponType]||[]).filter(s=>s.trim()!=='').map(s=>`<option value="${escH(s)}"></option>`).join('') : ''}
          </datalist>
        </div>
        <div class="w-full md:w-1/3">
          <button type="button" onclick="handleAddWeapon()" ${!selectedWeaponType||!selectedWeaponSerial?'disabled':''}
            class="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white p-2.5 rounded-lg font-bold transition-colors">
            הוסף לחייל
          </button>
        </div>
      </div>
      
      ${cartWeapons.length > 0 ? `
      <div class="border-t border-slate-100 pt-4 space-y-2">
          ${cartWeapons.map((w,idx) => {
            const isNew = !originalWeapons.find(o=>o.type===w.type&&o.serial===w.serial);
            return `<div class="flex justify-between items-center px-3 py-2 rounded-lg border ${isNew?'bg-green-50 border-green-200 text-green-900':'bg-slate-50 border-slate-200 text-slate-800'}">
              <span class="font-medium">${escH(w.type)} - ${escH(w.serial)} ${isNew?'<span class="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded mr-2">נוסף כעת</span>':''}</span>
              <button type="button" onclick="handleRemoveWeapon(${idx})" class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>`;
          }).join('')}
      </div>` : `<div class="text-sm text-slate-500 border-t border-slate-100 pt-4">אין נשקים חתומים על החייל.</div>`}
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        אופטיקה
      </h2>
      <div class="flex flex-col md:flex-row gap-4 items-end mb-4">
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">סוג אופטיקה</label>
          <select onchange="setSelectedOpticType(this.value)"
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="" ${!selectedOpticType?'selected':''} disabled>בחר סוג...</option>
            ${Object.keys(opticsData).map(t=>`<option value="${escH(t)}" ${selectedOpticType===t?'selected':''}>${escH(t)}</option>`).join('')}
          </select>
        </div>
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">מספר סידורי</label>
          <input type="text" list="optic-serials-list"
            value="${escH(selectedOpticSerial)}"
            onchange="setState({selectedOpticSerial:this.value}); renderApp()"
            placeholder="הקלד או בחר..."
            autocomplete="off"
            ${!selectedOpticType ? 'disabled' : ''}
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400" />
          <datalist id="optic-serials-list">
            ${selectedOpticType ? (opticsData[selectedOpticType]||[]).filter(s=>s.trim()!=='').map(s=>`<option value="${escH(s)}"></option>`).join('') : ''}
          </datalist>
        </div>
        <div class="w-full md:w-1/3">
          <button type="button" onclick="handleAddOptic()" ${!selectedOpticType||!selectedOpticSerial?'disabled':''}
            class="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white p-2.5 rounded-lg font-bold transition-colors">
            הוסף לחייל
          </button>
        </div>
      </div>
      ${cartOptics.length > 0 ? `
      <div class="border-t border-slate-100 pt-4 space-y-2">
          ${cartOptics.map((o,idx) => {
            const isNew = !originalOptics.find(p=>p.type===o.type&&p.serial===o.serial);
            return `<div class="flex justify-between items-center px-3 py-2 rounded-lg border ${isNew?'bg-green-50 border-green-200 text-green-900':'bg-slate-50 border-slate-200 text-slate-800'}">
              <span class="font-medium">${escH(o.type)} - ${escH(o.serial)} ${isNew?'<span class="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded mr-2">נוסף כעת</span>':''}</span>
              <button type="button" onclick="handleRemoveOptic(${idx})" class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>`;
          }).join('')}
      </div>` : `<div class="text-sm text-slate-500 border-t border-slate-100 pt-4">אין אופטיקה חתומה על החייל.</div>`}
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
        </svg>
        תקשוב
      </h2>
      <div class="flex flex-col md:flex-row gap-4 items-end mb-4">
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">סוג פריט</label>
          <select onchange="setSelectedCommType(this.value)"
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="" ${!selectedCommType?'selected':''} disabled>בחר סוג...</option>
            ${Object.keys(commsData).map(t=>`<option value="${escH(t)}" ${selectedCommType===t?'selected':''}>${escH(t)}</option>`).join('')}
          </select>
        </div>
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">מספר סידורי</label>
          <input type="text" list="comm-serials-list"
            value="${escH(selectedCommSerial)}"
            onchange="setState({selectedCommSerial:this.value}); renderApp()"
            placeholder="הקלד או בחר..."
            autocomplete="off"
            ${!selectedCommType ? 'disabled' : ''}
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400" />
          <datalist id="comm-serials-list">
            ${selectedCommType ? (commsData[selectedCommType]||[]).filter(s=>s.trim()!=='').map(s=>`<option value="${escH(s)}"></option>`).join('') : ''}
          </datalist>
        </div>
        <div class="w-full md:w-1/3">
          <button type="button" onclick="handleAddComm()" ${!selectedCommType||!selectedCommSerial?'disabled':''}
            class="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white p-2.5 rounded-lg font-bold transition-colors">
            הוסף לחייל
          </button>
        </div>
      </div>
      ${cartComms.length > 0 ? `
      <div class="border-t border-slate-100 pt-4 space-y-2">
          ${cartComms.map((c,idx) => {
            const isNew = !originalComms.find(p=>p.type===c.type&&p.serial===c.serial);
            return `<div class="flex justify-between items-center px-3 py-2 rounded-lg border ${isNew?'bg-green-50 border-green-200 text-green-900':'bg-slate-50 border-slate-200 text-slate-800'}">
              <span class="font-medium">${escH(c.type)} - ${escH(c.serial)} ${isNew?'<span class="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded mr-2">נוסף כעת</span>':''}</span>
              <button type="button" onclick="handleRemoveComm(${idx})" class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>`;
          }).join('')}
      </div>` : `<div class="text-sm text-slate-500 border-t border-slate-100 pt-4">אין פריטי תקשוב חתומים על החייל.</div>`}
    </div>

    ${Object.entries(inventoryCategories).map(([catName, items]) => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div class="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 class="font-bold text-slate-700">${escH(catName)}</h3>
      </div>
      <div class="divide-y divide-slate-100">
        ${items.map(item => {
          const origQty = originalCart[item] || 0;
          const curQty  = cart[item] || 0;
          const changed = curQty !== origQty;
          return `
          <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${changed?'bg-yellow-50':'hover:bg-slate-50'}">
            <div class="flex flex-col">
              <span class="font-medium text-slate-800">${escH(item)}</span>
              ${origQty > 0 ? `<span class="text-xs text-slate-500">כמות מקורית: ${origQty}</span>` : ''}
            </div>
            <div class="flex items-center justify-end gap-2">
              <button type="button" onclick="handleDecrement('${escH(item)}')" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
              </button>
              <input type="number" min="0" value="${curQty === 0 ? '' : curQty}" placeholder="0"
                onchange="handleQuantityChange('${escH(item)}', this.value)"
                class="w-16 h-10 text-center border rounded-lg outline-none font-bold text-lg ${changed?'border-yellow-400 focus:ring-2 focus:ring-yellow-500 bg-white':'border-slate-300 focus:ring-2 focus:ring-blue-500'}"/>
              <button type="button" onclick="handleIncrement('${escH(item)}')" class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('')}

    <div class="sticky bottom-4 mt-8">
      <button type="button" onclick="handleSubmitForm()"
        ${isSubmitting || !soldierName ? 'disabled' : ''}
        class="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${isSubmitting || !soldierName ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl hover:-translate-y-1'}">
        ${isSubmitting ? 'מעדכן נתונים...' : 'שמור שינויים בציוד החייל'}
        ${!isSubmitting ? `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>` : ''}
      </button>
    </div>
  </div>`;
}

// פונקציות עזר וחיפוש
function setSelectedWeaponType(v) { setState({ selectedWeaponType: v, selectedWeaponSerial: '' }); renderApp(); }
function setSelectedOpticType(v)  { setState({ selectedOpticType: v, selectedOpticSerial: '' }); renderApp(); }
function setSelectedCommType(v)   { setState({ selectedCommType: v, selectedCommSerial: '' }); renderApp(); }

function formatSoldierSearchValue(soldier) {
  if (!soldier) return '';
  return `${soldier.name || ''}${soldier.id ? ` - ${soldier.id}` : ''}${soldier.department ? ` | ${soldier.department}` : ''}`;
}

function findSoldierBySearchValue(val) {
  const arr = Array.isArray(AppState.soldiersData) ? AppState.soldiersData : Object.values(AppState.soldiersData || {});
  const term = (val || '').trim();
  if (!term) return null;
  return arr.find(s => {
    if (!s) return false;
    return formatSoldierSearchValue(s) === term || s.name === term || String(s.id || '') === term;
  }) || null;
}

function handleFormSearchTyping(val) {
  if (AppState.soldierName && !val.includes(AppState.soldierName)) {
    setState({
      formSearchTerm: val,
      soldierName: '',
      personalNumber: '',
      cart: {}, originalCart: {},
      cartWeapons: [], originalWeapons: [],
      cartOptics: [], originalOptics: [],
      cartComms: [], originalComms: []
    });
    return;
  }
  setState({ formSearchTerm: val });
}

function handleFormSearchSelection(val) {
  const soldier = findSoldierBySearchValue(val);
  if (!soldier) {
    setState({ formSearchTerm: val });
    renderApp();
    return;
  }
  selectSoldierForForm(soldier);
}

// פונקציית איפוס אגרסיבית המוחקת את כל נתוני החייל מתוך ה-State
function handleClearSearch() {
  if (typeof selectSoldierForForm === 'function') {
    selectSoldierForForm(null); 
  }
  
  // מאלץ עדכון State עצמאי כדי לוודא ששום דבר לא נתקע
  setState({ 
    formSearchTerm: '',
    soldierName: '',
    personalNumber: '',
    cart: {}, originalCart: {},
    cartWeapons: [], originalWeapons: [],
    cartOptics: [], originalOptics: [],
    cartComms: [], originalComms: []
  });
  
  renderApp();
}

