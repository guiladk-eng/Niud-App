// ===== ui-database.js =====
// טאב עריכת מסד נתונים - מעודכן לגרסה החדשה

function renderDatabaseTab() {
  const { weaponsData, opticsData, commsData, ammoData, isSavingDb, dbSaveMessage } = AppState;
  const cameraItems = Array.isArray(AppState.cameraItemsTable) ? AppState.cameraItemsTable : [];
  const newCameraItem = AppState.dbCameraNewItem || { civilMilitary: '', marking: '', medium: '', serial: '' };
  const cameraMediumOptions = dbGetAvailableCameraMediumOptions();
  const cameraSerialOptions = dbGetSerialOptionsForMedium(newCameraItem.medium);

  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-0 md:sticky md:top-56 md:z-30">
      <div>
        <h2 class="text-lg font-bold text-slate-700">ניהול צלמים</h2>
        <p class="text-sm text-slate-500">ניהול לפי סוג פריט: הוספה מהירה, הצגת כל הפריטים, והסרה נקודתית.</p>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button onclick="exportDatabaseToCSV()"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors flex-1 sm:flex-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          ייצוא מסד נתונים
        </button>
        <button onclick="handleSaveDatabase()" ${isSavingDb ? 'disabled' : ''}
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-300 flex-1 sm:flex-none">
          ${isSavingDb ? 'שומר...' : `שמור שינויים <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`}
        </button>
      </div>
    </div>

    ${dbSaveMessage ? `<div class="bg-green-100 text-green-700 p-4 rounded-lg font-medium shadow-sm mb-4">${escH(dbSaveMessage)}</div>` : ''}

    ${renderDbEditorBlock('weaponsData', weaponsData, 'כלי נשק', 'text-red-600',
      `<circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="22" y1="12" x2="18" y2="12" stroke-width="2"/><line x1="6" y1="12" x2="2" y2="12" stroke-width="2"/><line x1="12" y1="6" x2="12" y2="2" stroke-width="2"/><line x1="12" y1="22" x2="12" y2="18" stroke-width="2"/>`,
      'נהל מספרים סידוריים לכל סוג')}

    ${renderDbEditorBlock('opticsData', opticsData, 'אופטיקה', 'text-indigo-600',
      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`,
      'נהל מספרים סידוריים לכל סוג')}

    ${renderDbEditorBlock('commsData', commsData, 'תקשוב', 'text-emerald-600',
      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>`,
      'נהל מספרים סידוריים לכל סוג')}

    ${renderDbEditorBlock('ammoData', ammoData, 'תחמושת', 'text-amber-600',
      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4v5h-4V4zm-1 6h6l2 10H7l2-10z"/>`,
      'נהל מספרים סידוריים לכל סוג')}

    ${renderCameraItemsTableBlock(cameraItems, newCameraItem, cameraMediumOptions, cameraSerialOptions)}
  </div>`;
}

function renderCameraItemsTableBlock(cameraItems, newCameraItem, cameraMediumOptions, cameraSerialOptions) {
  return `
  <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
    <h2 class="text-lg font-bold text-slate-700 mb-3">טבלת אמצעים</h2>
    <div class="overflow-x-auto border border-slate-200 rounded-lg">
      <table class="w-full text-right border-collapse min-w-[720px]">
        <thead>
          <tr class="bg-slate-100 text-slate-600 text-sm">
            <th class="p-3 border-b border-slate-200">אזרחי/צבאי</th>
            <th class="p-3 border-b border-slate-200">סימון</th>
            <th class="p-3 border-b border-slate-200">אמצעי</th>
            <th class="p-3 border-b border-slate-200">צ'</th>
            <th class="p-3 border-b border-slate-200">פעולות</th>
          </tr>
        </thead>
        <tbody>
          ${cameraItems.length === 0 ? `
            <tr>
              <td colspan="5" class="p-4 text-slate-500 text-center">הטבלה ריקה כרגע. הוסף שורה חדשה למטה.</td>
            </tr>
          ` : cameraItems.map((row, rowIdx) => `
            <tr class="border-b border-slate-100">
              <td class="p-2">${escH(row.civilMilitary || '')}</td>
              <td class="p-2">${escH(row.marking || '')}</td>
              <td class="p-2">${escH(row.medium || '')}</td>
              <td class="p-2 font-mono">${escH(row.serial || '')}</td>
              <td class="p-2">
                <button type="button"
                  onclick="dbRemoveCameraItemRow(${rowIdx})"
                  class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100"
                  title="מחק רשומה">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-3">
      <select
        onchange="dbSetCameraNewItemField('civilMilitary',this.value)"
        class="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="" ${!newCameraItem.civilMilitary ? 'selected' : ''}>בחר אזרחי/צבאי...</option>
        <option value="אזרחי" ${newCameraItem.civilMilitary === 'אזרחי' ? 'selected' : ''}>אזרחי</option>
        <option value="צבאי" ${newCameraItem.civilMilitary === 'צבאי' ? 'selected' : ''}>צבאי</option>
      </select>
      <input
        id="db-camera-marking-input"
        value="${escH(newCameraItem.marking || '')}"
        oninput="dbHandleCameraMarkingInput(this)"
        placeholder="סימון"
        class="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <select
        onchange="dbSetCameraNewItemField('medium',this.value)"
        class="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="" ${!newCameraItem.medium ? 'selected' : ''}>בחר אמצעי...</option>
        ${cameraMediumOptions.map((medium) => `<option value="${escH(medium)}" ${newCameraItem.medium === medium ? 'selected' : ''}>${escH(medium)}</option>`).join('')}
      </select>
      <div class="flex gap-2">
        <select
          onchange="dbSetCameraNewItemField('serial',this.value)"
          onkeydown="if(event.key==='Enter'){dbAddCameraItemRow()}"
          class="flex-1 border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          ${!newCameraItem.medium ? 'disabled' : ''}>
          <option value="" ${!newCameraItem.serial ? 'selected' : ''}>
            ${newCameraItem.medium ? 'בחר צ\'...' : 'בחר קודם אמצעי'}
          </option>
          ${cameraSerialOptions.map((serial) => `<option value="${escH(serial)}" ${newCameraItem.serial === serial ? 'selected' : ''}>${escH(serial)}</option>`).join('')}
        </select>
        <button onclick="dbAddCameraItemRow()"
          class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
          הוסף
        </button>
      </div>
    </div>
    <div class="text-xs text-slate-500 mt-2">כדי להוסיף שורה חייבים למלא את כל 4 התאים. צ' נבחר מתוך הצ'ים של האמצעי שנבחר בניהול צלמים.</div>
  </div>`;
}

// Shared db editor block — used by both database and categories tabs
function renderDbEditorBlock(stateKey, data, title, colorClass, iconPath, placeholder) {
  return `
  <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
    <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 ${colorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconPath}</svg>
      <span class="mr-2">${title}</span>
    </h2>
    <div class="space-y-4">
      ${Object.keys(data).map(type => {
        const serials = (data[type] || []).filter(s => String(s || '').trim() !== '');
        const typeKey = dbTypeKey(stateKey, type);
        const isOpen = !!AppState.dbExpandedTypes[typeKey];
        const newSerialValue = AppState.dbNewSerialInputs[typeKey] || '';

        return `
      <div class="border border-slate-200 rounded-lg p-3 bg-slate-50 relative">
        <div class="flex justify-between items-center mb-3">
          <div>
            <span class="font-bold text-slate-800">${escH(type)}</span>
            <span class="text-xs text-slate-500 mr-2">(${serials.length} פריטים)</span>
          </div>
          <button onclick="dbDeleteType('${stateKey}','${escH(type)}')" title="מחק קטגוריה זו"
            class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            value="${escH(newSerialValue)}"
            placeholder="הכנס מספר/מזהה פריט חדש"
            oninput="dbSetNewSerialInput('${stateKey}','${escH(type)}',this.value)"
            onkeydown="if(event.key==='Enter'){dbAddSerialToType('${stateKey}','${escH(type)}')}"
            class="flex-1 border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button onclick="dbAddSerialToType('${stateKey}','${escH(type)}')"
            class="bg-slate-800 hover:bg-slate-900 transition-colors text-white px-4 py-2 rounded-lg text-sm font-bold">
            הוסף פריט
          </button>
          <button onclick="dbToggleTypeItems('${stateKey}','${escH(type)}')"
            class="bg-white hover:bg-slate-100 transition-colors text-slate-700 px-4 py-2 rounded-lg text-sm font-bold border border-slate-300">
            ${isOpen ? 'הסתר פריטים' : `הצג את כל הפריטים (${serials.length})`}
          </button>
        </div>

        ${isOpen ? `
        <div class="mt-2 border border-slate-200 rounded-lg bg-white p-2 max-h-48 overflow-y-auto">
          ${serials.length === 0 ? `
            <div class="text-sm text-slate-500 p-2">${placeholder}</div>
          ` : `
            ${serials.map((serial, idx) => `
              <div class="flex items-center justify-between gap-2 p-2 border-b border-slate-100 last:border-b-0">
                <span class="font-mono text-sm text-slate-700 break-all">${escH(serial)}</span>
                <button onclick="dbRemoveSerialFromType('${stateKey}','${escH(type)}',${idx})"
                  title="הסר פריט"
                  class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            `).join('')}
          `}
        </div>` : ''}
      </div>`;
      }).join('')}
    </div>
    <div class="mt-4 flex gap-2">
      <input id="new-type-${stateKey}" placeholder="הוסף סוג חדש ל${title}..."
        class="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
      <button onclick="dbAddType('${stateKey}','new-type-${stateKey}')"
        class="bg-slate-800 hover:bg-slate-900 transition-colors text-white px-4 py-2 rounded-lg text-sm font-bold">
        הוסף
      </button>
    </div>
  </div>`;
}

function dbUpdateType(stateKey, type, value) {
  const data = { ...AppState[stateKey] };
  data[type] = value.split('\n');
  setState({ [stateKey]: data });
}

function dbStateLabel(stateKey) {
  if (stateKey === 'weaponsData') return 'כלי נשק';
  if (stateKey === 'opticsData') return 'אופטיקה';
  if (stateKey === 'commsData') return 'תקשוב';
  if (stateKey === 'ammoData') return 'תחמושת';
  return stateKey;
}

function dbTypeKey(stateKey, type) {
  return `${stateKey}::${type}`;
}

function dbSetCameraNewItemField(field, value) {
  const current = AppState.dbCameraNewItem || { civilMilitary: '', marking: '', medium: '', serial: '' };
  const next = { ...current, [field]: value };
  if (field === 'medium') next.serial = '';
  setState({ dbCameraNewItem: next });
  renderApp();
}

function dbHandleCameraMarkingInput(inputEl) {
  const value = inputEl ? inputEl.value : '';
  const cursorPos = inputEl && typeof inputEl.selectionStart === 'number'
    ? inputEl.selectionStart
    : String(value).length;

  const current = AppState.dbCameraNewItem || { civilMilitary: '', marking: '', medium: '', serial: '' };
  setState({ dbCameraNewItem: { ...current, marking: value } });
  renderApp();

  const nextInput = document.getElementById('db-camera-marking-input');
  if (!nextInput) return;
  nextInput.focus();
  const pos = Math.min(cursorPos, nextInput.value.length);
  try {
    nextInput.setSelectionRange(pos, pos);
  } catch (_) {
    // ignore environments that do not support selection APIs
  }
}

function dbGetAvailableCameraMediumOptions() {
  const pools = [AppState.weaponsData || {}, AppState.opticsData || {}, AppState.commsData || {}, AppState.ammoData || {}];
  const types = [];
  pools.forEach((pool) => {
    Object.keys(pool).forEach((type) => {
      const cleaned = String(type || '').trim();
      if (cleaned) types.push(cleaned);
    });
  });
  return Array.from(new Set(types)).sort((a, b) => a.localeCompare(b, 'he'));
}

function dbGetSerialOptionsForMedium(medium) {
  const type = String(medium || '').trim();
  if (!type) return [];
  const pools = [AppState.weaponsData || {}, AppState.opticsData || {}, AppState.commsData || {}, AppState.ammoData || {}];
  let serials = [];
  pools.forEach((pool) => {
    if (Array.isArray(pool[type])) serials = serials.concat(pool[type]);
  });
  return Array.from(new Set(serials.map((s) => String(s || '').trim()).filter(Boolean)));
}

function dbAddCameraItemRow() {
  const current = AppState.dbCameraNewItem || {};
  const row = {
    civilMilitary: String(current.civilMilitary || '').trim(),
    marking: String(current.marking || '').trim(),
    medium: String(current.medium || '').trim(),
    serial: String(current.serial || '').trim()
  };
  if (!row.civilMilitary || !row.marking || !row.medium || !row.serial) {
    window.alert('יש למלא את כל ארבעת השדות לפני הוספת שורה.');
    return;
  }
  const availableMediums = dbGetAvailableCameraMediumOptions();
  if (!availableMediums.includes(row.medium)) {
    window.alert('יש לבחור אמצעי מתוך הרשימה.');
    return;
  }
  const allowedSerials = dbGetSerialOptionsForMedium(row.medium);
  if (!allowedSerials.includes(row.serial)) {
    window.alert('יש לבחור צ\' מתוך האפשרויות של האמצעי שנבחר.');
    return;
  }

  const table = Array.isArray(AppState.cameraItemsTable) ? AppState.cameraItemsTable : [];
  const duplicate = table.find((r) =>
    String((r && r.medium) || '').trim() === row.medium &&
    String((r && r.serial) || '').trim() === row.serial
  );
  if (duplicate) {
    window.alert('שורה עם אותו אמצעי וצ\' כבר קיימת בטבלה.');
    return;
  }

  setState({
    cameraItemsTable: [...table, row],
    dbCameraNewItem: { civilMilitary: '', marking: '', medium: '', serial: '' }
  });
  queuePendingActivity(`הוסיף שורה לטבלת אמצעים: ${row.civilMilitary} | ${row.marking} | ${row.medium} | ${row.serial}`, {
    type: 'db_add_camera_item_row',
    medium: row.medium,
    serial: row.serial
  }, 'database');
  renderApp();
}

function dbCanonicalTypeName(typeName) {
  const raw = String(typeName || '')
    .trim()
    .replace(/[״"]/g, '"')
    .replace(/[׳']/g, "'");
  if (['שח"מ', 'שח"ם', 'שח״מ', 'שח״ם', 'שחמ', 'שחם'].includes(raw)) return 'שח"מ';
  if (['מטען נייד לאולר', 'מטען נייד אולר', 'מטען טקטי לאולר'].includes(raw)) return 'מטען טקטי לאולר';
  if (raw.toLowerCase() === 'nyx') return 'NYX';
  return raw;
}

function dbGetGeneralTableHoldersForCameraItem(medium, serial) {
  const assignments = AppState.generalTableAssignments || {};
  const typeStr = dbCanonicalTypeName(medium);
  const serialStr = String(serial || '').trim();
  if (!typeStr || !serialStr) return [];

  const holders = [];
  Object.keys(assignments).forEach((soldierKey) => {
    const row = assignments[soldierKey] || {};
    const amralMatch = dbCanonicalTypeName(row.amralType || '') === typeStr && String(row.amralSerial || '').trim() === serialStr;
    const commMatch = dbCanonicalTypeName(row.commType || '') === typeStr && String(row.commSerial || '').trim() === serialStr;
    const multitoolMatch = dbCanonicalTypeName(row.multitoolType || '') === typeStr && String(row.multitoolSerial || '').trim() === serialStr;
    const tacticalMatch = dbCanonicalTypeName(row.tacticalType || '') === typeStr && String(row.tacticalSerial || '').trim() === serialStr;
    if (amralMatch || commMatch || multitoolMatch || tacticalMatch) {
      holders.push(dbSoldierDisplayNameByKey(soldierKey));
    }
  });
  return Array.from(new Set(holders.filter(Boolean)));
}

function dbCleanupGeneralTableAfterCameraItemRemoval(medium, serial) {
  const assignments = AppState.generalTableAssignments || {};
  const typeStr = dbCanonicalTypeName(medium);
  const serialStr = String(serial || '').trim();
  if (!typeStr || !serialStr) return { nextAssignments: assignments, affectedSoldiers: [] };

  const nextAssignments = { ...assignments };
  const affectedSoldiers = [];

  Object.keys(assignments).forEach((soldierKey) => {
    const row = assignments[soldierKey] || {};
    const nextRow = { ...row };
    let changed = false;

    if (dbCanonicalTypeName(row.amralType || '') === typeStr && String(row.amralSerial || '').trim() === serialStr) {
      nextRow.amralType = '';
      nextRow.amralSerial = '';
      changed = true;
    }
    if (dbCanonicalTypeName(row.commType || '') === typeStr && String(row.commSerial || '').trim() === serialStr) {
      nextRow.commType = '';
      nextRow.commSerial = '';
      changed = true;
    }
    if (dbCanonicalTypeName(row.multitoolType || '') === typeStr && String(row.multitoolSerial || '').trim() === serialStr) {
      nextRow.multitoolType = '';
      nextRow.multitoolSerial = '';
      changed = true;
    }
    if (dbCanonicalTypeName(row.tacticalType || '') === typeStr && String(row.tacticalSerial || '').trim() === serialStr) {
      nextRow.tacticalType = '';
      nextRow.tacticalSerial = '';
      changed = true;
    }

    if (!changed) return;
    affectedSoldiers.push(dbSoldierDisplayNameByKey(soldierKey));
    if (dbIsGeneralTableRowEmpty(nextRow)) delete nextAssignments[soldierKey];
    else nextAssignments[soldierKey] = nextRow;
  });

  return { nextAssignments, affectedSoldiers: Array.from(new Set(affectedSoldiers.filter(Boolean))) };
}

function dbRemoveCameraItemRow(index) {
  const table = Array.isArray(AppState.cameraItemsTable) ? AppState.cameraItemsTable : [];
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= table.length) return;

  const row = table[idx] || {};
  const medium = String(row.medium || '').trim();
  const serial = String(row.serial || '').trim();
  const holders = dbGetGeneralTableHoldersForCameraItem(medium, serial);
  const msg = holders.length > 0
    ? `הרשומה ${medium} | ${serial} משויכת כרגע בטבלה הכללית על:\n${holders.join(', ')}\n\nהאם למחוק את הרשומה?`
    : `האם למחוק את הרשומה ${medium} | ${serial}?`;
  if (!window.confirm(msg)) return;

  const cleanup = dbCleanupGeneralTableAfterCameraItemRemoval(medium, serial);
  const nextTable = table.filter((_, i) => i !== idx);
  setState({ cameraItemsTable: nextTable, generalTableAssignments: cleanup.nextAssignments });

  queuePendingActivity(`מחק רשומה מטבלת אמצעים: ${medium} | ${serial}`, {
    type: 'db_remove_camera_item_row',
    medium,
    serial
  }, 'database');

  if (cleanup.affectedSoldiers.length > 0) {
    queuePendingActivity(`הסיר אוטומטית שיוכים בטבלה הכללית בעקבות מחיקת ${medium} ${serial} עבור: ${cleanup.affectedSoldiers.join(', ')}`, {
      type: 'general_table_auto_cleanup_camera_item',
      medium,
      serial,
      affectedSoldiers: cleanup.affectedSoldiers
    }, 'database');
  }

  renderApp();
}

function dbSafeSoldiersArray() {
  if (Array.isArray(AppState.soldiersData)) return AppState.soldiersData.filter(Boolean);
  if (AppState.soldiersData && typeof AppState.soldiersData === 'object') return Object.values(AppState.soldiersData).filter(Boolean);
  return [];
}

function dbSoldierDisplayNameByKey(soldierKey) {
  const key = String(soldierKey || '').trim();
  if (!key) return '';
  const soldiers = dbSafeSoldiersArray();
  const byId = soldiers.find((s) => String((s && s.id) || '').trim() === key);
  if (byId && byId.name) return String(byId.name);
  const byName = soldiers.find((s) => String((s && s.name) || '').trim() === key);
  if (byName && byName.name) return String(byName.name);
  return key;
}

function dbGetGeneralTableHoldersForSerial(stateKey, type, serial) {
  const assignments = AppState.generalTableAssignments || {};
  const serialStr = String(serial || '').trim();
  const typeStr = String(type || '').trim();
  if (!serialStr) return [];

  const holders = [];
  Object.keys(assignments).forEach((soldierKey) => {
    const row = assignments[soldierKey] || {};
    let isMatch = false;
    if (stateKey === 'opticsData') {
      const optItems = typeof getSoldierOpticsItems === 'function' ? getSoldierOpticsItems(row) : [];
      isMatch = optItems.some((i) => String(i.type || '').trim() === typeStr && String(i.serial || '').trim() === serialStr);
    } else if (stateKey === 'commsData') {
      const commsItems = typeof getSoldierCommsItems === 'function' ? getSoldierCommsItems(row) : [];
      isMatch = commsItems.some((i) => String(i.type || '').trim() === typeStr && String(i.serial || '').trim() === serialStr);
    } else if (stateKey === 'ammoData' && typeStr === 'רימון רסס') {
      const frag1 = String(row.fragGrenade1 || row.fragGrenade || '').trim();
      const frag2 = String(row.fragGrenade2 || '').trim();
      isMatch = frag1 === serialStr || frag2 === serialStr;
    }
    if (isMatch) holders.push(dbSoldierDisplayNameByKey(soldierKey));
  });

  return Array.from(new Set(holders.filter(Boolean)));
}

function dbGetGeneralTableHoldersForType(stateKey, type) {
  const assignments = AppState.generalTableAssignments || {};
  const typeStr = String(type || '').trim();
  const holders = [];

  Object.keys(assignments).forEach((soldierKey) => {
    const row = assignments[soldierKey] || {};
    let isMatch = false;
    if (stateKey === 'opticsData') {
      const optItems = typeof getSoldierOpticsItems === 'function' ? getSoldierOpticsItems(row) : [];
      isMatch = optItems.some((i) => String(i.type || '').trim() === typeStr);
    } else if (stateKey === 'commsData') {
      const commsItems = typeof getSoldierCommsItems === 'function' ? getSoldierCommsItems(row) : [];
      isMatch = commsItems.some((i) => String(i.type || '').trim() === typeStr);
    } else if (stateKey === 'ammoData' && typeStr === 'רימון רסס') {
      const frag1 = String(row.fragGrenade1 || row.fragGrenade || '').trim();
      const frag2 = String(row.fragGrenade2 || '').trim();
      isMatch = frag1 !== '' || frag2 !== '';
    }
    if (isMatch) holders.push(dbSoldierDisplayNameByKey(soldierKey));
  });

  return Array.from(new Set(holders.filter(Boolean)));
}

function dbIsGeneralTableRowEmpty(row) {
  if (!row) return true;
  const optItems   = typeof getSoldierOpticsItems === 'function' ? getSoldierOpticsItems(row)  : [];
  const commsItems = typeof getSoldierCommsItems  === 'function' ? getSoldierCommsItems(row)   : [];
  return optItems.length === 0
    && commsItems.length === 0
    && !String(row.fragGrenade1 || row.fragGrenade || '').trim()
    && !String(row.fragGrenade2 || '').trim();
}

function dbCleanupGeneralTableAfterSerialRemoval(stateKey, type, serial) {
  const assignments = AppState.generalTableAssignments || {};
  const serialStr = String(serial || '').trim();
  const typeStr = String(type || '').trim();
  if (!serialStr) return { nextAssignments: assignments, affectedSoldiers: [] };

  const nextAssignments = { ...assignments };
  const affectedSoldiers = [];

  Object.keys(assignments).forEach((soldierKey) => {
    const row = assignments[soldierKey] || {};
    const nextRow = { ...row };
    let changed = false;

    if (stateKey === 'opticsData') {
      const items = typeof getSoldierOpticsItems === 'function' ? getSoldierOpticsItems(row) : [];
      const next = items.filter((i) => !(String(i.type || '').trim() === typeStr && String(i.serial || '').trim() === serialStr));
      if (next.length !== items.length) {
        nextRow.opticsItems = next;
        nextRow.amralType = ''; nextRow.amralSerial = '';
        changed = true;
      }
    } else if (stateKey === 'commsData') {
      const items = typeof getSoldierCommsItems === 'function' ? getSoldierCommsItems(row) : [];
      const next = items.filter((i) => !(String(i.type || '').trim() === typeStr && String(i.serial || '').trim() === serialStr));
      if (next.length !== items.length) {
        nextRow.commsItems = next;
        nextRow.commType = ''; nextRow.commSerial = '';
        nextRow.multitoolType = ''; nextRow.multitoolSerial = '';
        nextRow.tacticalType = ''; nextRow.tacticalSerial = '';
        changed = true;
      }
    } else if (stateKey === 'ammoData' && typeStr === 'רימון רסס') {
      const frag1 = String(row.fragGrenade1 || row.fragGrenade || '').trim();
      const frag2 = String(row.fragGrenade2 || '').trim();
      const isMatch1 = frag1 === serialStr;
      const isMatch2 = frag2 === serialStr;
      if (isMatch1) {
        nextRow.fragGrenade1 = '';
        if (nextRow.fragGrenade !== undefined) delete nextRow.fragGrenade;
        changed = true;
      }
      if (isMatch2) {
        nextRow.fragGrenade2 = '';
        changed = true;
      }
    }

    if (!changed) return;
    affectedSoldiers.push(dbSoldierDisplayNameByKey(soldierKey));
    if (dbIsGeneralTableRowEmpty(nextRow)) delete nextAssignments[soldierKey];
    else nextAssignments[soldierKey] = nextRow;
  });

  return { nextAssignments, affectedSoldiers: Array.from(new Set(affectedSoldiers.filter(Boolean))) };
}

function dbCleanupGeneralTableAfterTypeRemoval(stateKey, type) {
  const assignments = AppState.generalTableAssignments || {};
  const typeStr = String(type || '').trim();
  const nextAssignments = { ...assignments };
  const affectedSoldiers = [];

  Object.keys(assignments).forEach((soldierKey) => {
    const row = assignments[soldierKey] || {};
    const nextRow = { ...row };
    let changed = false;

    if (stateKey === 'opticsData') {
      const isMatch = String(row.amralType || '').trim() === typeStr && String(row.amralSerial || '').trim() !== '';
      if (isMatch) {
        nextRow.amralType = '';
        nextRow.amralSerial = '';
        changed = true;
      }
    } else if (stateKey === 'commsData') {
      const isCommMatch = String(row.commType || '').trim() === typeStr && String(row.commSerial || '').trim() !== '';
      const isMultitoolMatch = String(row.multitoolType || '').trim() === typeStr && String(row.multitoolSerial || '').trim() !== '';
      const isTacticalMatch = String(row.tacticalType || '').trim() === typeStr && String(row.tacticalSerial || '').trim() !== '';
      if (isCommMatch) {
        nextRow.commType = '';
        nextRow.commSerial = '';
        changed = true;
      }
      if (isMultitoolMatch) {
        nextRow.multitoolType = '';
        nextRow.multitoolSerial = '';
        changed = true;
      }
      if (isTacticalMatch) {
        nextRow.tacticalType = '';
        nextRow.tacticalSerial = '';
        changed = true;
      }
    } else if (stateKey === 'ammoData' && typeStr === 'רימון רסס') {
      const frag1 = String(row.fragGrenade1 || row.fragGrenade || '').trim();
      const frag2 = String(row.fragGrenade2 || '').trim();
      const isMatch = frag1 !== '' || frag2 !== '';
      if (isMatch) {
        nextRow.fragGrenade1 = '';
        nextRow.fragGrenade2 = '';
        if (nextRow.fragGrenade !== undefined) delete nextRow.fragGrenade;
        changed = true;
      }
    }

    if (!changed) return;
    affectedSoldiers.push(dbSoldierDisplayNameByKey(soldierKey));
    if (dbIsGeneralTableRowEmpty(nextRow)) delete nextAssignments[soldierKey];
    else nextAssignments[soldierKey] = nextRow;
  });

  return { nextAssignments, affectedSoldiers: Array.from(new Set(affectedSoldiers.filter(Boolean))) };
}

function dbSetNewSerialInput(stateKey, type, value) {
  const key = dbTypeKey(stateKey, type);
  setState({ dbNewSerialInputs: { ...AppState.dbNewSerialInputs, [key]: value } });
}

function dbAddSerialToType(stateKey, type) {
  const key = dbTypeKey(stateKey, type);
  const newSerial = (AppState.dbNewSerialInputs[key] || '').trim();
  if (!newSerial) return;

  const data = { ...AppState[stateKey] };
  const current = Array.isArray(data[type]) ? data[type].map(s => String(s || '').trim()).filter(Boolean) : [];
  if (current.includes(newSerial)) {
    window.alert(`לא ניתן להוסיף: צ' ${newSerial} כבר קיים בסוג ${type}.`);
    return;
  }

  data[type] = [...current, newSerial];
  queuePendingActivity(`הוסיף פריט חדש ב-${dbStateLabel(stateKey)} (${type}) עם צ' ${newSerial}`, {
    type: 'db_add_serial',
    category: stateKey,
    itemType: type,
    serial: newSerial
  }, 'database');
  setState({
    [stateKey]: data,
    dbNewSerialInputs: { ...AppState.dbNewSerialInputs, [key]: '' }
  });
  renderApp();
}

function dbToggleTypeItems(stateKey, type) {
  const key = dbTypeKey(stateKey, type);
  const current = !!AppState.dbExpandedTypes[key];
  setState({ dbExpandedTypes: { ...AppState.dbExpandedTypes, [key]: !current } });
  renderApp();
}

function dbRemoveSerialFromType(stateKey, type, visibleIndex) {
  const data = { ...AppState[stateKey] };
  const serials = (Array.isArray(data[type]) ? data[type] : []).map(s => String(s || '').trim()).filter(Boolean);
  if (visibleIndex < 0 || visibleIndex >= serials.length) return;
  const removedSerial = serials[visibleIndex];

  const holders = dbGetGeneralTableHoldersForSerial(stateKey, type, removedSerial);
  if (holders.length > 0) {
    const msg = `הפריט ${removedSerial} מסוג ${type} חתום כרגע בטבלה הכללית על:\n${holders.join(', ')}\n\nהאם אתה בטוח שברצונך למחוק את הפריט?`;
    if (!window.confirm(msg)) return;
  }

  serials.splice(visibleIndex, 1);
  data[type] = serials;
  const cleanup = dbCleanupGeneralTableAfterSerialRemoval(stateKey, type, removedSerial);
  queuePendingActivity(`הסיר פריט מ-${dbStateLabel(stateKey)} (${type}) עם צ' ${removedSerial}`, {
    type: 'db_remove_serial',
    category: stateKey,
    itemType: type,
    serial: removedSerial
  }, 'database');
  if (cleanup.affectedSoldiers.length > 0) {
    queuePendingActivity(`הסיר אוטומטית שיוך בטבלה הכללית בעקבות מחיקת ${removedSerial} (${type}) עבור: ${cleanup.affectedSoldiers.join(', ')}`, {
      type: 'general_table_auto_cleanup',
      category: stateKey,
      itemType: type,
      serial: removedSerial
    }, 'database');
  }
  setState({ [stateKey]: data, generalTableAssignments: cleanup.nextAssignments });
  renderApp();
}

function dbDeleteType(stateKey, type) {
  const holders = dbGetGeneralTableHoldersForType(stateKey, type);
  const msg = holders.length > 0
    ? `בסוג ${type} יש פריטים שחתומים כרגע בטבלה הכללית על:\n${holders.join(', ')}\n\nהאם אתה בטוח שברצונך למחוק את הסוג כולו?`
    : `האם אתה בטוח שברצונך למחוק את הסוג ${type}?`;
  if (!window.confirm(msg)) return;

  const data = { ...AppState[stateKey] };
  delete data[type];
  const cleanup = dbCleanupGeneralTableAfterTypeRemoval(stateKey, type);
  setState({ [stateKey]: data, generalTableAssignments: cleanup.nextAssignments });
  queuePendingActivity(`מחק סוג מתוך ${dbStateLabel(stateKey)}: ${type}`, {
    type: 'db_delete_type',
    category: stateKey,
    itemType: type
  }, 'database');
  if (cleanup.affectedSoldiers.length > 0) {
    queuePendingActivity(`הסיר אוטומטית שיוכים בטבלה הכללית בעקבות מחיקת סוג ${type} עבור: ${cleanup.affectedSoldiers.join(', ')}`, {
      type: 'general_table_auto_cleanup_type',
      category: stateKey,
      itemType: type
    }, 'database');
  }
  renderApp();
}

function dbAddType(stateKey, inputId) {
  const input = document.getElementById(inputId);
  const newType = input.value.trim();
  if (newType && !AppState[stateKey][newType]) {
    const data = { ...AppState[stateKey], [newType]: [] };
    setState({ [stateKey]: data });
    queuePendingActivity(`הוסיף סוג חדש ב-${dbStateLabel(stateKey)}: ${newType}`, {
      type: 'db_add_type',
      category: stateKey,
      itemType: newType
    }, 'database');
    input.value = '';
    renderApp();
  }
}
