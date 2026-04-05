// ===== ui-form.js =====
// טאב טופס מאסטר - גרסה סופית הכוללת איפוס אגרסיבי ותיבות הקלדה חכמות למספרים סידוריים

function renderSignaturesTab() {
  const {
    soldierName, personalNumber, formSearchTerm,
    weaponsData, selectedWeaponType, selectedWeaponSerial, cartWeapons, originalWeapons,
    opticsData, selectedOpticType, selectedOpticSerial,
    commsData, selectedCommType, selectedCommSerial,
    ammoData, generalTableAssignments,
    isSubmitting
  } = AppState;

  const allFormSoldiers = Array.isArray(AppState.soldiersData)
    ? AppState.soldiersData
    : Object.values(AppState.soldiersData || {});
  const signatureSoldierKey = String(personalNumber || '').trim();
  const sigAss = (generalTableAssignments && signatureSoldierKey && generalTableAssignments[signatureSoldierKey]) || {};
  const fragOptions = ((ammoData && ammoData['רימון רסס']) || [])
    .map((serial) => String(serial || '').trim())
    .filter(Boolean);
  const frag1Current = String(sigAss.fragGrenade1 || sigAss.fragGrenade || '').trim();
  const frag2Current = String(sigAss.fragGrenade2 || '').trim();

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
        אופטיקה של החייל
      </h2>
      <div class="flex flex-col md:flex-row gap-4 items-end mb-4">
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">סוג אופטיקה</label>
          <select onchange="setSelectedOpticType(this.value)"
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="" ${!selectedOpticType ? 'selected' : ''} disabled>בחר סוג...</option>
            ${Object.keys(opticsData || {}).map(t => `<option value="${escH(t)}" ${selectedOpticType===t?'selected':''}>${escH(t)}</option>`).join('')}
          </select>
        </div>
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">סימון אופטיקה</label>
          <select onchange="setState({selectedOpticSerial:this.value}); renderApp()"
            ${!selectedOpticType ? 'disabled' : ''}
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400">
            <option value="" ${!selectedOpticSerial ? 'selected' : ''}>${selectedOpticType ? 'בחר סימון...' : 'בחר קודם סוג'}</option>
            ${(selectedOpticType ? (opticsData[selectedOpticType] || []) : [])
              .map((s) => String(s || '').trim())
              .filter(Boolean)
              .map((s) => `<option value="${escH(s)}" ${selectedOpticSerial===s?'selected':''}>${escH(getSignatureMarkingLabel(selectedOpticType, s))}</option>`)
              .join('')}
          </select>
        </div>
        <div class="w-full md:w-1/3">
          <button type="button" onclick="signatureAssignAmral()" ${!selectedOpticType||!selectedOpticSerial?'disabled':''}
            class="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white p-2.5 rounded-lg font-bold transition-colors">
            הוסף לחייל
          </button>
        </div>
      </div>
      ${sigAss.amralType && sigAss.amralSerial ? `
      <div class="border-t border-slate-100 pt-4 space-y-2">
        <div class="flex justify-between items-center px-3 py-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">
          <span class="font-medium">${escH(getSignatureMarkingLabel(sigAss.amralType, sigAss.amralSerial))}</span>
          <button type="button" onclick="signatureClearAmralAssignment()"
            class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>` : `<div class="text-sm text-slate-500 border-t border-slate-100 pt-4">אין אופטיקה חתומה על החייל.</div>`}
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
        </svg>
        תקשוב של החייל
      </h2>
      <div class="flex flex-col md:flex-row gap-4 items-end mb-4">
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">סוג תקשוב</label>
          <select onchange="setSelectedCommType(this.value)"
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="" ${!selectedCommType ? 'selected' : ''} disabled>בחר סוג...</option>
            ${Object.keys(commsData || {}).map(t => `<option value="${escH(t)}" ${selectedCommType===t?'selected':''}>${escH(t)}</option>`).join('')}
          </select>
        </div>
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">סימון תקשוב</label>
          <select onchange="setState({selectedCommSerial:this.value}); renderApp()"
            ${!selectedCommType ? 'disabled' : ''}
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400">
            <option value="" ${!selectedCommSerial ? 'selected' : ''}>${selectedCommType ? 'בחר סימון...' : 'בחר קודם סוג'}</option>
            ${(selectedCommType ? (commsData[selectedCommType] || []) : [])
              .map((s) => String(s || '').trim())
              .filter(Boolean)
              .map((s) => `<option value="${escH(s)}" ${selectedCommSerial===s?'selected':''}>${escH(getSignatureMarkingLabel(selectedCommType, s))}</option>`)
              .join('')}
          </select>
        </div>
        <div class="w-full md:w-1/3">
          <button type="button" onclick="signatureAssignCommsLike()" ${!selectedCommType||!selectedCommSerial?'disabled':''}
            class="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white p-2.5 rounded-lg font-bold transition-colors">
            הוסף לחייל
          </button>
        </div>
      </div>
      ${(sigAss.commType && sigAss.commSerial) || (sigAss.multitoolType && sigAss.multitoolSerial) || (sigAss.tacticalType && sigAss.tacticalSerial) ? `
      <div class="border-t border-slate-100 pt-4 space-y-2">
          ${sigAss.commType && sigAss.commSerial ? `
            <div class="flex justify-between items-center px-3 py-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">
              <span class="font-medium">${escH(getSignatureMarkingLabel(sigAss.commType, sigAss.commSerial))}</span>
              <button type="button" onclick="signatureClearCommsLikeAssignment('comm')" class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>` : ''}
          ${sigAss.multitoolType && sigAss.multitoolSerial ? `
            <div class="flex justify-between items-center px-3 py-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">
              <span class="font-medium">${escH(getSignatureMarkingLabel(sigAss.multitoolType, sigAss.multitoolSerial))}</span>
              <button type="button" onclick="signatureClearCommsLikeAssignment('multitool')" class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>` : ''}
          ${sigAss.tacticalType && sigAss.tacticalSerial ? `
            <div class="flex justify-between items-center px-3 py-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">
              <span class="font-medium">${escH(getSignatureMarkingLabel(sigAss.tacticalType, sigAss.tacticalSerial))}</span>
              <button type="button" onclick="signatureClearCommsLikeAssignment('tactical')" class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>` : ''}
      </div>` : `<div class="text-sm text-slate-500 border-t border-slate-100 pt-4">אין תקשוב חתום על החייל.</div>`}
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4v5h-4V4zm-1 6h6l2 10H7l2-10z"/>
        </svg>
        תחמושת של החייל
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">רימון רסס 1</label>
          <select onchange="if('${escH(signatureSoldierKey)}'){handleGeneralTableSelectChange(decodeURIComponent('${encodeURIComponent(signatureSoldierKey)}'),'frag1',this.value)}"
            ${!signatureSoldierKey ? 'disabled' : ''}
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400">
            <option value="" ${!frag1Current ? 'selected' : ''}>ללא שיוך</option>
            ${fragOptions.map((serial) => `<option value="${escH(serial)}" ${serial === frag1Current ? 'selected' : ''}>${escH(getSignatureMarkingLabel('רימון רסס', serial))}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">רימון רסס 2</label>
          <select onchange="if('${escH(signatureSoldierKey)}'){handleGeneralTableSelectChange(decodeURIComponent('${encodeURIComponent(signatureSoldierKey)}'),'frag2',this.value)}"
            ${!signatureSoldierKey ? 'disabled' : ''}
            class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400">
            <option value="" ${!frag2Current ? 'selected' : ''}>ללא שיוך</option>
            ${fragOptions.map((serial) => `<option value="${escH(serial)}" ${serial === frag2Current ? 'selected' : ''}>${escH(getSignatureMarkingLabel('רימון רסס', serial))}</option>`).join('')}
          </select>
        </div>
      </div>
      ${(frag1Current || frag2Current) ? `
        <div class="border-t border-slate-100 pt-4 mt-4 space-y-2">
          ${frag1Current ? `<div class="px-3 py-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">${escH(getSignatureMarkingLabel('רימון רסס', frag1Current))}</div>` : ''}
          ${frag2Current ? `<div class="px-3 py-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">${escH(getSignatureMarkingLabel('רימון רסס', frag2Current))}</div>` : ''}
        </div>
      ` : `<div class="text-sm text-slate-500 border-t border-slate-100 pt-4 mt-4">אין רימוני רסס חתומים על החייל.</div>`}
    </div>

    <div class="sticky bottom-4 mt-8">
      <button type="button" onclick="handleSubmitForm()"
        ${isSubmitting || !soldierName ? 'disabled' : ''}
        class="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${isSubmitting || !soldierName ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl hover:-translate-y-1'}">
        ${isSubmitting ? 'מעדכן נתונים...' : 'שמור החתמה'}
        ${!isSubmitting ? `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>` : ''}
      </button>
    </div>
  </div>`;
}

// Backward compatibility for old references
function renderFormTab() {
  return renderSignaturesTab();
}

// פונקציות עזר וחיפוש
function setSelectedWeaponType(v) { setState({ selectedWeaponType: v, selectedWeaponSerial: '' }); renderApp(); }
function setSelectedOpticType(v)  { setState({ selectedOpticType: v, selectedOpticSerial: '' }); renderApp(); }
function setSelectedCommType(v)   { setState({ selectedCommType: v, selectedCommSerial: '' }); renderApp(); }

function getSignatureMarkingLabel(type, serial) {
  if (typeof getGeneralTableMediumMarkingLabel === 'function') {
    return getGeneralTableMediumMarkingLabel(type, serial);
  }
  return `${String(type || '').trim()} | ${String(serial || '').trim()}`;
}

function getSignatureSelectedSoldierKey() {
  return String(AppState.personalNumber || '').trim();
}

function signatureAssignGeneralTableWithTransfer(field, type, serial) {
  const key = getSignatureSelectedSoldierKey();
  if (!key) return false;
  const normalizedType = String(type || '').trim();
  const normalizedSerial = String(serial || '').trim();
  if (!normalizedType || !normalizedSerial) return false;

  const duplicateKey = typeof findGeneralTableDuplicate === 'function'
    ? findGeneralTableDuplicate(field, `${normalizedType}::${normalizedSerial}`, key)
    : null;

  if (duplicateKey) {
    const currentHolderName = typeof getGeneralTableSoldierNameByKey === 'function'
      ? getGeneralTableSoldierNameByKey(duplicateKey)
      : duplicateKey;
    const targetHolderName = typeof getGeneralTableSoldierNameByKey === 'function'
      ? getGeneralTableSoldierNameByKey(key)
      : key;
    const label = getSignatureMarkingLabel(normalizedType, normalizedSerial);
    const confirmTransfer = window.confirm(
      `הפריט ${label} כבר חתום על ${currentHolderName}.\nהאם להעביר אותו ל-${targetHolderName}?`
    );
    if (!confirmTransfer) return false;
    handleGeneralTableSelectChange(duplicateKey, field, '');
  }

  const value = `${encodeURIComponent(normalizedType)}::${encodeURIComponent(normalizedSerial)}`;
  handleGeneralTableSelectChange(key, field, value);
  return true;
}

function signatureAssignAmral() {
  const key = getSignatureSelectedSoldierKey();
  if (!key || !AppState.selectedOpticType || !AppState.selectedOpticSerial) return;
  const changed = signatureAssignGeneralTableWithTransfer('amral', AppState.selectedOpticType, AppState.selectedOpticSerial);
  if (!changed) return;
  setState({ selectedOpticType: '', selectedOpticSerial: '' }); renderApp();
}

function signatureClearAmralAssignment() {
  const key = getSignatureSelectedSoldierKey();
  if (!key) return;
  handleGeneralTableSelectChange(key, 'amral', '');
}

function signatureCommsFieldFromType(type) {
  const t = String(type || '').trim();
  if (t === 'קשר 710') return 'comm';
  if (t === 'אולר') return 'multitool';
  if (t === 'מטען טקטי לאולר' || t === 'מטען נייד לאולר' || t === 'מטען נייד אולר') return 'tactical';
  return '';
}

function signatureAssignCommsLike() {
  const key = getSignatureSelectedSoldierKey();
  if (!key || !AppState.selectedCommType || !AppState.selectedCommSerial) return;
  const field = signatureCommsFieldFromType(AppState.selectedCommType);
  if (!field) {
    window.alert('אפשר להחתים כאן רק קשר 710, אולר או מטען טקטי לאולר.');
    return;
  }
  const changed = signatureAssignGeneralTableWithTransfer(field, AppState.selectedCommType, AppState.selectedCommSerial);
  if (!changed) return;
  setState({ selectedCommType: '', selectedCommSerial: '' }); renderApp();
}

function signatureClearCommsLikeAssignment(field) {
  const key = getSignatureSelectedSoldierKey();
  if (!key) return;
  handleGeneralTableSelectChange(key, field, '');
}

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

