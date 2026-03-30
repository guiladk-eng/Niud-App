// ===== ui-general-table.js =====
// טאב טבלה כללית לניהול הקצאות ציוד לכלל החיילים

function getGeneralTableSoldierKey(soldier) {
  if (!soldier) return '';
  const byId = String(soldier.id || '').trim();
  if (byId) return byId;
  return String(soldier.name || '').trim();
}

function getGeneralTableSafeSoldiers() {
  if (Array.isArray(AppState.soldiersData)) return AppState.soldiersData.filter(Boolean);
  if (AppState.soldiersData && typeof AppState.soldiersData === 'object') return Object.values(AppState.soldiersData).filter(Boolean);
  return [];
}

function getGeneralTableCurrentWeaponsMap() {
  const map = new Map();
  const history = Array.isArray(AppState.submissionHistory) ? [...AppState.submissionHistory].reverse() : [];

  history.forEach((entry) => {
    const soldierKey = String(entry.personalNumber || entry.soldierName || '').trim();
    if (!soldierKey) return;
    if (!map.has(soldierKey)) map.set(soldierKey, new Map());

    const soldierWeapons = map.get(soldierKey);
    (entry.weapons || []).forEach((w) => {
      if (!w || !w.type || !w.serial) return;
      soldierWeapons.set(`${w.type}::${w.serial}`, { type: String(w.type), serial: String(w.serial) });
    });
    (entry.returnedWeapons || []).forEach((w) => {
      if (!w || !w.type || !w.serial) return;
      soldierWeapons.delete(`${w.type}::${w.serial}`);
    });
  });

  return map;
}

function normalizeGeneralTableTypeName(typeName) {
  return String(typeName || '')
    .trim()
    .replace(/[״"]/g, '"')
    .replace(/[׳']/g, "'")
    .toLowerCase();
}

function getGeneralTableSelectionOptions(dataObj, allowedTypes) {
  const allowed = Array.isArray(allowedTypes) && allowedTypes.length
    ? new Set(allowedTypes.map((t) => normalizeGeneralTableTypeName(t)))
    : null;
  const options = [];
  Object.keys(dataObj || {}).forEach((type) => {
    const typeLabel = String(type || '').trim();
    if (allowed && !allowed.has(normalizeGeneralTableTypeName(typeLabel))) return;
    (dataObj[type] || [])
      .map((serial) => String(serial || '').trim())
      .filter(Boolean)
      .forEach((serial) => {
        options.push({ type: typeLabel, serial, value: `${encodeURIComponent(typeLabel)}::${encodeURIComponent(serial)}` });
      });
  });
  return options;
}

function setGeneralTableNotice(message) {
  setState({ generalTableNotice: message || '' });
  renderApp();
  clearTimeout(window.__generalTableNoticeTimer);
  if (message) {
    window.__generalTableNoticeTimer = setTimeout(() => {
      setState({ generalTableNotice: '' });
      renderApp();
    }, 3500);
  }
}

function findGeneralTableDuplicate(field, value, soldierKey) {
  if (!value) return null;
  const all = AppState.generalTableAssignments || {};
  const normalizedTarget = String(value).trim();
  let duplicateKey = null;

  Object.keys(all).forEach((key) => {
    if (duplicateKey || key === soldierKey) return;
    const row = all[key] || {};
    let current = '';
    if (field === 'amral') current = `${row.amralType || ''}::${row.amralSerial || ''}`;
    if (field === 'comm') current = `${row.commType || ''}::${row.commSerial || ''}`;
    if (field === 'multitool') current = `${row.multitoolType || ''}::${row.multitoolSerial || ''}`;
    if (field === 'frag') {
      const f1 = String(row.fragGrenade1 || row.fragGrenade || '').trim();
      const f2 = String(row.fragGrenade2 || '').trim();
      current = `${f1}||${f2}`;
    }
    if (field === 'frag') {
      const [f1 = '', f2 = ''] = String(current).split('||');
      if (f1 === normalizedTarget || f2 === normalizedTarget) duplicateKey = key;
    } else if (current && current.trim() === normalizedTarget) {
      duplicateKey = key;
    }
  });

  return duplicateKey;
}

function getGeneralTableSoldierNameByKey(soldierKey) {
  const soldier = getGeneralTableSafeSoldiers().find((s) => getGeneralTableSoldierKey(s) === soldierKey);
  return soldier && soldier.name ? soldier.name : soldierKey;
}

function handleGeneralTableSelectChange(soldierKey, field, rawValue) {
  const key = String(soldierKey || '').trim();
  if (!key) return;

  const assignments = { ...(AppState.generalTableAssignments || {}) };
  const current = { ...(assignments[key] || {}) };
  const oldSnapshot = JSON.stringify(current);

  if (field === 'amral') {
    if (!rawValue) {
      current.amralType = '';
      current.amralSerial = '';
    } else {
      const parts = String(rawValue).split('::');
      const type = decodeURIComponent(parts[0] || '');
      const serial = decodeURIComponent(parts[1] || '');
      const duplicateKey = findGeneralTableDuplicate('amral', `${type}::${serial}`, key);
      if (duplicateKey) {
        setGeneralTableNotice(`שגיאה: פריט אמר"ל כבר משויך ל-${getGeneralTableSoldierNameByKey(duplicateKey)}.`);
        return;
      }
      current.amralType = type;
      current.amralSerial = serial;
    }
  }

  if (field === 'comm') {
    if (!rawValue) {
      current.commType = '';
      current.commSerial = '';
    } else {
      const parts = String(rawValue).split('::');
      const type = decodeURIComponent(parts[0] || '');
      const serial = decodeURIComponent(parts[1] || '');
      const duplicateKey = findGeneralTableDuplicate('comm', `${type}::${serial}`, key);
      if (duplicateKey) {
        setGeneralTableNotice(`שגיאה: פריט קשר כבר משויך ל-${getGeneralTableSoldierNameByKey(duplicateKey)}.`);
        return;
      }
      current.commType = type;
      current.commSerial = serial;
    }
  }

  if (field === 'frag1' || field === 'frag2') {
    const serial = String(rawValue || '').trim();
    if (serial) {
      const duplicateKey = findGeneralTableDuplicate('frag', serial, key);
      if (duplicateKey) {
        setGeneralTableNotice(`שגיאה: רימון רסס זה כבר משויך ל-${getGeneralTableSoldierNameByKey(duplicateKey)}.`);
        return;
      }

      const otherFrag = field === 'frag1'
        ? String(current.fragGrenade2 || '').trim()
        : String(current.fragGrenade1 || current.fragGrenade || '').trim();
      if (otherFrag && otherFrag === serial) {
        setGeneralTableNotice('שגיאה: לא ניתן לבחור את אותו רימון רסס פעמיים לאותו חייל.');
        return;
      }
    }
    if (field === 'frag1') current.fragGrenade1 = serial;
    if (field === 'frag2') current.fragGrenade2 = serial;
    if (current.fragGrenade !== undefined) delete current.fragGrenade; // migration from old single field
  }

  if (field === 'multitool') {
    if (!rawValue) {
      current.multitoolType = '';
      current.multitoolSerial = '';
    } else {
      const parts = String(rawValue).split('::');
      const type = decodeURIComponent(parts[0] || '');
      const serial = decodeURIComponent(parts[1] || '');
      const duplicateKey = findGeneralTableDuplicate('multitool', `${type}::${serial}`, key);
      if (duplicateKey) {
        setGeneralTableNotice(`שגיאה: אולר זה כבר משויך ל-${getGeneralTableSoldierNameByKey(duplicateKey)}.`);
        return;
      }
      current.multitoolType = type;
      current.multitoolSerial = serial;
    }
  }

  const isEmpty = !String(current.amralType || '').trim()
    && !String(current.amralSerial || '').trim()
    && !String(current.commType || '').trim()
    && !String(current.commSerial || '').trim()
    && !String(current.multitoolType || '').trim()
    && !String(current.multitoolSerial || '').trim()
    && !String(current.fragGrenade1 || current.fragGrenade || '').trim()
    && !String(current.fragGrenade2 || '').trim();

  if (isEmpty) {
    delete assignments[key];
  } else {
    assignments[key] = current;
  }

  if (oldSnapshot !== JSON.stringify(current)) {
    const fieldLabels = { amral: 'אמר"ל', comm: 'קשר', multitool: 'אולר', frag1: 'רימוני רסס', frag2: 'רימוני רסס' };
    queuePendingActivity(`עדכן בטבלה כללית לחייל ${getGeneralTableSoldierNameByKey(key)}: ${fieldLabels[field] || field}`, {
      type: 'general_table_update',
      soldierName: getGeneralTableSoldierNameByKey(key),
      personalNumber: key,
      field
    }, 'generalTable');
  }

  setState({ generalTableAssignments: assignments, generalTableNotice: '' });
  renderApp();
}

function renderGeneralTableSelectOptions(options, currentValue, currentLabel) {
  let html = '';
  if (currentValue && !options.find((opt) => opt.value === currentValue)) {
    html += `<option value="${escH(currentValue)}" selected>${escH(currentLabel)} (לא קיים במסד)</option>`;
  }
  html += options.map((opt) => `<option value="${escH(opt.value)}" ${opt.value === currentValue ? 'selected' : ''}>${escH(`${opt.type} | ${opt.serial}`)}</option>`).join('');
  return html;
}

function renderGeneralTableFragOptions(options, currentValue) {
  let html = '';
  if (currentValue && !options.includes(currentValue)) {
    html += `<option value="${escH(currentValue)}" selected>${escH(currentValue)} (לא קיים במסד)</option>`;
  }
  html += options.map((serial) => `<option value="${escH(serial)}" ${serial === currentValue ? 'selected' : ''}>${escH(serial)}</option>`).join('');
  return html;
}

function getGeneralTableFiltersSafe() {
  const f = AppState.generalTableFilters || {};
  return {
    amral: String(f.amral || ''),
    comm: String(f.comm || ''),
    multitool: String(f.multitool || ''),
    frag: String(f.frag || ''),
    weaponType: String(f.weaponType || ''),
    weaponSerial: String(f.weaponSerial || '')
  };
}

function setGeneralTableFilter(field, value) {
  const current = getGeneralTableFiltersSafe();
  setState({ generalTableFilters: { ...current, [field]: String(value || '') } });
  renderApp();
}

function matchGeneralTableFilterValue(type, serial) {
  const typeStr = String(type || '').trim();
  const serialStr = String(serial || '').trim();
  if (!typeStr || !serialStr) return '';
  return `${encodeURIComponent(typeStr)}::${encodeURIComponent(serialStr)}`;
}

function isGeneralTableFilterMatch(filterValue, hasValue, currentValue) {
  if (!filterValue) return true; // no filtering on this column
  if (filterValue === '__ALL__') return !!hasValue; // keep only rows with any value
  return currentValue === filterValue; // exact serial/type match
}

function isGeneralTableFragFilterMatch(filterValue, fragSerial1, fragSerial2) {
  const value1 = String(fragSerial1 || '').trim();
  const value2 = String(fragSerial2 || '').trim();
  if (!filterValue) return true;
  if (filterValue === '__ALL__') return value1 !== '' || value2 !== '';
  return value1 === filterValue || value2 === filterValue;
}

function renderGeneralTableFilterSelectOptions(options, selectedValue) {
  return `
    <option value="" ${!selectedValue ? 'selected' : ''}>ללא סינון</option>
    <option value="__ALL__" ${selectedValue === '__ALL__' ? 'selected' : ''}>כולם</option>
    ${options.map((opt) => `<option value="${escH(opt.value)}" ${opt.value === selectedValue ? 'selected' : ''}>${escH(`${opt.type} | ${opt.serial}`)}</option>`).join('')}
  `;
}

function renderGeneralTableFragFilterOptions(options, selectedValue) {
  return `
    <option value="" ${!selectedValue ? 'selected' : ''}>ללא סינון</option>
    <option value="__ALL__" ${selectedValue === '__ALL__' ? 'selected' : ''}>כולם</option>
    ${options.map((serial) => `<option value="${escH(serial)}" ${serial === selectedValue ? 'selected' : ''}>${escH(serial)}</option>`).join('')}
  `;
}

function renderGeneralTableSimpleFilterOptions(options, selectedValue) {
  return `
    <option value="" ${!selectedValue ? 'selected' : ''}>ללא סינון</option>
    <option value="__ALL__" ${selectedValue === '__ALL__' ? 'selected' : ''}>כולם</option>
    ${options.map((value) => `<option value="${escH(value)}" ${value === selectedValue ? 'selected' : ''}>${escH(value)}</option>`).join('')}
  `;
}

function isGeneralTableSimpleFilterMatch(filterValue, values) {
  const list = Array.isArray(values) ? values.map((v) => String(v || '').trim()).filter(Boolean) : [];
  if (!filterValue) return true;
  if (filterValue === '__ALL__') return list.length > 0;
  return list.includes(filterValue);
}

function setGeneralTableSearchTerm(inputElOrValue) {
  const isInput = inputElOrValue && typeof inputElOrValue === 'object' && 'value' in inputElOrValue;
  const value = isInput ? inputElOrValue.value : inputElOrValue;
  const cursorPos = isInput && typeof inputElOrValue.selectionStart === 'number'
    ? inputElOrValue.selectionStart
    : String(value || '').length;

  setState({ generalTableSearchTerm: String(value || '') });
  renderApp();

  const nextInput = document.getElementById('general-table-search-input');
  if (!nextInput) return;
  nextInput.focus();
  const pos = Math.min(cursorPos, nextInput.value.length);
  try {
    nextInput.setSelectionRange(pos, pos);
  } catch (_) {
    // ignore on environments that do not support selection APIs
  }
}

function renderGeneralTableTab() {
  const { isSavingGeneralTable, generalTableSaveMessage, generalTableNotice } = AppState;
  const allowedAmralTypes = ['שח"ם', 'ליאור', 'עכבר', 'שח"ע', 'NYX', 'מיקרון'];
  const allowedCommTypes = ['קשר 710'];
  const allowedMultitoolTypes = ['אולר'];
  const soldiers = getGeneralTableSafeSoldiers().sort((a, b) => {
    const depA = String((a && a.department) || '');
    const depB = String((b && b.department) || '');
    if (depA !== depB) return depA.localeCompare(depB, 'he');
    return String((a && a.name) || '').localeCompare(String((b && b.name) || ''), 'he');
  });
  const currentWeapons = getGeneralTableCurrentWeaponsMap();
  const amralOptions = getGeneralTableSelectionOptions(AppState.opticsData || {}, allowedAmralTypes);
  const commOptions = getGeneralTableSelectionOptions(AppState.commsData || {}, allowedCommTypes);
  const multitoolOptions = getGeneralTableSelectionOptions(AppState.commsData || {}, allowedMultitoolTypes);
  const fragOptions = ((AppState.ammoData && AppState.ammoData['רימון רסס']) || [])
    .map((serial) => String(serial || '').trim())
    .filter(Boolean);
  const filters = getGeneralTableFiltersSafe();
  const searchTerm = String(AppState.generalTableSearchTerm || '').trim().toLowerCase();
  const weaponTypeSet = new Set();
  const weaponSerialSet = new Set();
  currentWeapons.forEach((weaponMap) => {
    Array.from(weaponMap.values()).forEach((w) => {
      if (w && w.type) weaponTypeSet.add(String(w.type));
      if (w && w.serial) weaponSerialSet.add(String(w.serial));
    });
  });
  const weaponTypeOptions = Array.from(weaponTypeSet).sort((a, b) => a.localeCompare(b, 'he'));
  const weaponSerialOptions = Array.from(weaponSerialSet).sort((a, b) => a.localeCompare(b, 'he'));

  const filteredSoldiers = soldiers.filter((soldier) => {
    const soldierKey = getGeneralTableSoldierKey(soldier);
    const ass = (AppState.generalTableAssignments && AppState.generalTableAssignments[soldierKey]) || {};
    const name = String((soldier && soldier.name) || '').toLowerCase();
    const personalId = String((soldier && soldier.id) || '').toLowerCase();
    const matchesSearch = !searchTerm || name.includes(searchTerm) || personalId.includes(searchTerm);
    if (!matchesSearch) return false;

    const weaponMap = currentWeapons.get(soldierKey) || new Map();
    const weapons = Array.from(weaponMap.values());
    const weaponTypes = weapons.map((w) => String((w && w.type) || '').trim()).filter(Boolean);
    const weaponSerials = weapons.map((w) => String((w && w.serial) || '').trim()).filter(Boolean);
    const amralCurrentValue = matchGeneralTableFilterValue(ass.amralType, ass.amralSerial);
    const commCurrentValue = matchGeneralTableFilterValue(ass.commType, ass.commSerial);
    const multitoolCurrentValue = matchGeneralTableFilterValue(ass.multitoolType, ass.multitoolSerial);
    const fragCurrentValue1 = String(ass.fragGrenade1 || ass.fragGrenade || '').trim();
    const fragCurrentValue2 = String(ass.fragGrenade2 || '').trim();

    return isGeneralTableSimpleFilterMatch(filters.weaponType, weaponTypes)
      && isGeneralTableSimpleFilterMatch(filters.weaponSerial, weaponSerials)
      && isGeneralTableFilterMatch(filters.amral, amralCurrentValue !== '', amralCurrentValue)
      && isGeneralTableFilterMatch(filters.comm, commCurrentValue !== '', commCurrentValue)
      && isGeneralTableFilterMatch(filters.multitool, multitoolCurrentValue !== '', multitoolCurrentValue)
      && isGeneralTableFragFilterMatch(filters.frag, fragCurrentValue1, fragCurrentValue2);
  });

  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-44 z-10">
      <div>
        <h2 class="text-lg font-bold text-slate-700">טבלה כללית</h2>
        <p class="text-sm text-slate-500">מעקב וניהול הקצאות אמר"ל, קשר ורימוני רסס לכל חייל.</p>
      </div>
      <button onclick="handleSaveGeneralTable()" ${isSavingGeneralTable ? 'disabled' : ''}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-300 w-full sm:w-auto">
        ${isSavingGeneralTable ? 'שומר...' : `שמור שינויים <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`}
      </button>
    </div>

    ${generalTableSaveMessage ? `<div class="bg-green-100 text-green-700 p-4 rounded-lg font-medium shadow-sm">${escH(generalTableSaveMessage)}</div>` : ''}
    ${generalTableNotice ? `<div class="bg-orange-100 text-orange-800 p-4 rounded-lg font-medium shadow-sm">${escH(generalTableNotice)}</div>` : ''}

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div class="mb-3">
        <label class="block text-xs font-bold text-slate-600 mb-1">חיפוש (שם או מ.א)</label>
        <input
          id="general-table-search-input"
          type="text"
          value="${escH(AppState.generalTableSearchTerm || '')}"
          oninput="setGeneralTableSearchTerm(this)"
          placeholder="הקלד שם או מספר אישי..."
          class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <h3 class="text-sm font-bold text-slate-700 mb-3">סינון</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">סוג נשק</label>
          <select
            onchange="setGeneralTableFilter('weaponType',this.value)"
            class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            ${renderGeneralTableSimpleFilterOptions(weaponTypeOptions, filters.weaponType)}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">צ' נשק</label>
          <select
            onchange="setGeneralTableFilter('weaponSerial',this.value)"
            class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            ${renderGeneralTableSimpleFilterOptions(weaponSerialOptions, filters.weaponSerial)}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">אמר"ל</label>
          <select
            onchange="setGeneralTableFilter('amral',this.value)"
            class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            ${renderGeneralTableFilterSelectOptions(amralOptions, filters.amral)}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">קשר</label>
          <select
            onchange="setGeneralTableFilter('comm',this.value)"
            class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            ${renderGeneralTableFilterSelectOptions(commOptions, filters.comm)}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">אולר</label>
          <select
            onchange="setGeneralTableFilter('multitool',this.value)"
            class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            ${renderGeneralTableFilterSelectOptions(multitoolOptions, filters.multitool)}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">רסס</label>
          <select
            onchange="setGeneralTableFilter('frag',this.value)"
            class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            ${renderGeneralTableFragFilterOptions(fragOptions, filters.frag)}
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-right border-collapse min-w-[1100px]">
          <thead>
            <tr class="bg-slate-100 text-slate-600 text-sm">
              <th class="p-3 border-b border-slate-200 bg-slate-100">שם</th>
              <th class="p-3 border-b border-slate-200">צוות</th>
              <th class="p-3 border-b border-slate-200">מ.א</th>
              <th class="p-3 border-b border-slate-200">סוג נשק</th>
              <th class="p-3 border-b border-slate-200">צ' נשק</th>
              <th class="p-3 border-b border-slate-200">אמר"ל</th>
              <th class="p-3 border-b border-slate-200">קשר</th>
              <th class="p-3 border-b border-slate-200">אולר</th>
              <th class="p-3 border-b border-slate-200">רימוני רסס</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSoldiers.length === 0 ? `
              <tr>
                <td colspan="9" class="p-6 text-center text-slate-500">לא נמצאו חיילים לפי הסינון שנבחר.</td>
              </tr>
            ` : filteredSoldiers.map((soldier, rowIdx) => {
              const soldierKey = getGeneralTableSoldierKey(soldier);
              const ass = (AppState.generalTableAssignments && AppState.generalTableAssignments[soldierKey]) || {};
              const weaponMap = currentWeapons.get(soldierKey) || new Map();
              const weapons = Array.from(weaponMap.values());
              const weaponTypes = weapons.map((w) => w.type).join(', ') || '-';
              const weaponSerials = weapons.map((w) => w.serial).join(', ') || '-';
              const amralValue = ass.amralType && ass.amralSerial ? `${encodeURIComponent(ass.amralType)}::${encodeURIComponent(ass.amralSerial)}` : '';
              const amralLabel = ass.amralType && ass.amralSerial ? `${ass.amralType} | ${ass.amralSerial}` : '';
              const commValue = ass.commType && ass.commSerial ? `${encodeURIComponent(ass.commType)}::${encodeURIComponent(ass.commSerial)}` : '';
              const commLabel = ass.commType && ass.commSerial ? `${ass.commType} | ${ass.commSerial}` : '';
              const multitoolValue = ass.multitoolType && ass.multitoolSerial ? `${encodeURIComponent(ass.multitoolType)}::${encodeURIComponent(ass.multitoolSerial)}` : '';
              const multitoolLabel = ass.multitoolType && ass.multitoolSerial ? `${ass.multitoolType} | ${ass.multitoolSerial}` : '';
              const fragValue1 = String(ass.fragGrenade1 || ass.fragGrenade || '');
              const fragValue2 = String(ass.fragGrenade2 || '');
              const fragListId1 = `general-table-frag1-list-${rowIdx}`;
              const fragListId2 = `general-table-frag2-list-${rowIdx}`;
              return `
              <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="p-2 text-slate-800 font-medium bg-white border-l border-slate-200">${escH(soldier.name || '-')}</td>
                <td class="p-2 text-slate-700">${escH(soldier.department || '-')}</td>
                <td class="p-2 font-mono text-slate-700">${escH(soldier.id || '-')}</td>
                <td class="p-2 text-slate-700">${escH(weaponTypes)}</td>
                <td class="p-2 font-mono text-slate-700">${escH(weaponSerials)}</td>
                <td class="p-2">
                  <select
                    onchange="handleGeneralTableSelectChange(decodeURIComponent('${encodeURIComponent(soldierKey)}'),'amral',this.value)"
                    class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="" ${!amralValue ? 'selected' : ''}>ללא שיוך</option>
                    ${renderGeneralTableSelectOptions(amralOptions, amralValue, amralLabel)}
                  </select>
                </td>
                <td class="p-2">
                  <select
                    onchange="handleGeneralTableSelectChange(decodeURIComponent('${encodeURIComponent(soldierKey)}'),'comm',this.value)"
                    class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="" ${!commValue ? 'selected' : ''}>ללא שיוך</option>
                    ${renderGeneralTableSelectOptions(commOptions, commValue, commLabel)}
                  </select>
                </td>
                <td class="p-2">
                  <select
                    onchange="handleGeneralTableSelectChange(decodeURIComponent('${encodeURIComponent(soldierKey)}'),'multitool',this.value)"
                    class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="" ${!multitoolValue ? 'selected' : ''}>ללא שיוך</option>
                    ${renderGeneralTableSelectOptions(multitoolOptions, multitoolValue, multitoolLabel)}
                  </select>
                </td>
                <td class="p-2">
                  <div class="grid grid-cols-1 gap-1">
                    <input
                      type="text"
                      list="${fragListId1}"
                      value="${escH(fragValue1)}"
                      onchange="handleGeneralTableSelectChange(decodeURIComponent('${encodeURIComponent(soldierKey)}'),'frag1',this.value)"
                      placeholder="רסס 1 - הקלד או בחר"
                      class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <datalist id="${fragListId1}">
                      ${fragOptions.map((serial) => `<option value="${escH(serial)}"></option>`).join('')}
                    </datalist>
                    <input
                      type="text"
                      list="${fragListId2}"
                      value="${escH(fragValue2)}"
                      onchange="handleGeneralTableSelectChange(decodeURIComponent('${encodeURIComponent(soldierKey)}'),'frag2',this.value)"
                      placeholder="רסס 2 - הקלד או בחר"
                      class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <datalist id="${fragListId2}">
                      ${fragOptions.map((serial) => `<option value="${escH(serial)}"></option>`).join('')}
                    </datalist>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>`;
}
