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

function getGeneralTableCurrentAdditionalMeansMap() {
  const map = new Map();
  const history = Array.isArray(AppState.submissionHistory) ? [...AppState.submissionHistory].reverse() : [];

  history.forEach((entry) => {
    const soldierKey = String(entry.personalNumber || entry.soldierName || '').trim();
    if (!soldierKey) return;
    if (!map.has(soldierKey)) map.set(soldierKey, new Map());
    const soldierItems = map.get(soldierKey);

    (entry.optics || []).forEach((o) => {
      if (!o || !o.type || !o.serial) return;
      soldierItems.set(`optics::${o.type}::${o.serial}`, { type: String(o.type), serial: String(o.serial) });
    });
    (entry.returnedOptics || []).forEach((o) => {
      if (!o || !o.type || !o.serial) return;
      soldierItems.delete(`optics::${o.type}::${o.serial}`);
    });

    (entry.comms || []).forEach((c) => {
      if (!c || !c.type || !c.serial) return;
      soldierItems.set(`comms::${c.type}::${c.serial}`, { type: String(c.type), serial: String(c.serial) });
    });
    (entry.returnedComms || []).forEach((c) => {
      if (!c || !c.type || !c.serial) return;
      soldierItems.delete(`comms::${c.type}::${c.serial}`);
    });
  });

  return map;
}

function normalizeGeneralTableTypeName(typeName) {
  return canonicalGeneralTableTypeName(typeName)
    .replace(/[״"]/g, '"')
    .replace(/[׳']/g, "'")
    .toLowerCase();
}

function canonicalGeneralTableTypeName(typeName) {
  const raw = String(typeName || '')
    .trim()
    .replace(/[״"]/g, '"')
    .replace(/[׳']/g, "'");
  const compact = raw.replace(/\s+/g, ' ');
  const lowered = compact.toLowerCase();

  if (['שח"מ', 'שח״מ', 'שח"ם', 'שח״ם', 'שחמ', 'שחם'].includes(compact)) return 'שח"מ';
  if (['מטען נייד לאולר', 'מטען נייד אולר'].includes(compact)) return 'מטען טקטי לאולר';
  if (lowered === 'nyx') return 'NYX';
  return compact;
}

function getGeneralTableSelectionOptions(allowedTypes) {
  const allowed = Array.isArray(allowedTypes) && allowedTypes.length
    ? new Set(allowedTypes.map((t) => normalizeGeneralTableTypeName(t)))
    : null;
  const table = Array.isArray(AppState.cameraItemsTable) ? AppState.cameraItemsTable : [];
  const seen = new Set();
  const options = [];
  table.forEach((row) => {
    const rawType = String((row && row.medium) || '').trim();
    const typeLabel = canonicalGeneralTableTypeName(rawType);
    if (!typeLabel) return;
    if (allowed && !allowed.has(normalizeGeneralTableTypeName(typeLabel))) return;
    const serial = String((row && row.serial) || '').trim();
    if (!serial) return;
    const uniqueKey = `${typeLabel}::${serial}`;
    if (seen.has(uniqueKey)) return;
    seen.add(uniqueKey);
    options.push({
      type: typeLabel,
      serial,
      label: getGeneralTableMediumMarkingLabel(typeLabel, serial),
      value: `${encodeURIComponent(typeLabel)}::${encodeURIComponent(serial)}`
    });
  });
  return options.sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''), 'he'));
}

function getGeneralTableMediumMarkingLabel(typeLabel, serial) {
  const table = Array.isArray(AppState.cameraItemsTable) ? AppState.cameraItemsTable : [];
  const typeStr = canonicalGeneralTableTypeName(typeLabel || '');
  const serialStr = String(serial || '').trim();
  const match = table.find((row) =>
    canonicalGeneralTableTypeName((row && row.medium) || '') === typeStr &&
    String((row && row.serial) || '').trim() === serialStr
  );
  const marking = String((match && match.marking) || '').trim();
  if (marking) return `${typeStr} | ${marking}`;
  return `${typeStr} | ${serialStr}`;
}

function isGeneralTableSelectionAllowed(field, type, serial) {
  const typeStr = canonicalGeneralTableTypeName(type || '');
  const serialStr = String(serial || '').trim();
  if (!typeStr || !serialStr) return false;
  const allowedByField = {
    amral: ['שח"מ', 'עידו', 'ליאור', 'עכבר', 'שח"ע', 'NYX', 'מיקרון'],
    comm: ['קשר 710'],
    multitool: ['אולר'],
    tactical: ['מטען טקטי לאולר']
  };
  const allowedTypes = allowedByField[field] || [];
  const options = getGeneralTableSelectionOptions(allowedTypes);
  const wanted = `${encodeURIComponent(typeStr)}::${encodeURIComponent(serialStr)}`;
  return options.some((opt) => opt.value === wanted);
}

function setGeneralTableNotice(message) {
  const scrollSnapshot = getGeneralTableScrollSnapshot();
  setState({ generalTableNotice: message || '' });
  renderApp();
  restoreGeneralTableScrollSnapshot(scrollSnapshot);
  clearTimeout(window.__generalTableNoticeTimer);
  if (message) {
    window.__generalTableNoticeTimer = setTimeout(() => {
      const nextScrollSnapshot = getGeneralTableScrollSnapshot();
      setState({ generalTableNotice: '' });
      renderApp();
      restoreGeneralTableScrollSnapshot(nextScrollSnapshot);
    }, 3500);
  }
}

function getGeneralTableScrollSnapshot() {
  const el = document.getElementById('general-table-scroll-wrap');
  if (!el) return null;
  return { left: el.scrollLeft, top: el.scrollTop };
}

function restoreGeneralTableScrollSnapshot(snapshot) {
  if (!snapshot) return;
  const apply = () => {
    const el = document.getElementById('general-table-scroll-wrap');
    if (!el) return;
    el.scrollLeft = snapshot.left;
    el.scrollTop = snapshot.top;
  };
  apply();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(apply);
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
    if (field === 'amral') current = `${canonicalGeneralTableTypeName(row.amralType || '')}::${row.amralSerial || ''}`;
    if (field === 'comm') current = `${canonicalGeneralTableTypeName(row.commType || '')}::${row.commSerial || ''}`;
    if (field === 'multitool') current = `${canonicalGeneralTableTypeName(row.multitoolType || '')}::${row.multitoolSerial || ''}`;
    if (field === 'tactical') current = `${canonicalGeneralTableTypeName(row.tacticalType || '')}::${row.tacticalSerial || ''}`;
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
  const scrollSnapshot = getGeneralTableScrollSnapshot();

  const assignments = { ...(AppState.generalTableAssignments || {}) };
  const current = { ...(assignments[key] || {}) };
  const oldSnapshot = JSON.stringify(current);

  if (field === 'amral') {
    if (!rawValue) {
      current.amralType = '';
      current.amralSerial = '';
    } else {
      const parts = String(rawValue).split('::');
      const type = canonicalGeneralTableTypeName(decodeURIComponent(parts[0] || ''));
      const serial = decodeURIComponent(parts[1] || '');
      if (!isGeneralTableSelectionAllowed('amral', type, serial)) {
        setGeneralTableNotice('שגיאה: הפריט לא קיים בניהול צלמים ולכן לא ניתן לשייך אותו.');
        return;
      }
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
      const type = canonicalGeneralTableTypeName(decodeURIComponent(parts[0] || ''));
      const serial = decodeURIComponent(parts[1] || '');
      if (!isGeneralTableSelectionAllowed('comm', type, serial)) {
        setGeneralTableNotice('שגיאה: הפריט לא קיים בניהול צלמים ולכן לא ניתן לשייך אותו.');
        return;
      }
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
      const type = canonicalGeneralTableTypeName(decodeURIComponent(parts[0] || ''));
      const serial = decodeURIComponent(parts[1] || '');
      if (!isGeneralTableSelectionAllowed('multitool', type, serial)) {
        setGeneralTableNotice('שגיאה: הפריט לא קיים בניהול צלמים ולכן לא ניתן לשייך אותו.');
        return;
      }
      const duplicateKey = findGeneralTableDuplicate('multitool', `${type}::${serial}`, key);
      if (duplicateKey) {
        setGeneralTableNotice(`שגיאה: אולר זה כבר משויך ל-${getGeneralTableSoldierNameByKey(duplicateKey)}.`);
        return;
      }
      current.multitoolType = type;
      current.multitoolSerial = serial;
    }
  }

  if (field === 'tactical') {
    if (!rawValue) {
      current.tacticalType = '';
      current.tacticalSerial = '';
    } else {
      const parts = String(rawValue).split('::');
      const type = canonicalGeneralTableTypeName(decodeURIComponent(parts[0] || ''));
      const serial = decodeURIComponent(parts[1] || '');
      if (!isGeneralTableSelectionAllowed('tactical', type, serial)) {
        setGeneralTableNotice('שגיאה: הפריט לא קיים בניהול צלמים ולכן לא ניתן לשייך אותו.');
        return;
      }
      const duplicateKey = findGeneralTableDuplicate('tactical', `${type}::${serial}`, key);
      if (duplicateKey) {
        setGeneralTableNotice(`שגיאה: מטען טקטי לאולר זה כבר משויך ל-${getGeneralTableSoldierNameByKey(duplicateKey)}.`);
        return;
      }
      current.tacticalType = type;
      current.tacticalSerial = serial;
    }
  }

  const isEmpty = !String(current.amralType || '').trim()
    && !String(current.amralSerial || '').trim()
    && !String(current.commType || '').trim()
    && !String(current.commSerial || '').trim()
    && !String(current.multitoolType || '').trim()
    && !String(current.multitoolSerial || '').trim()
    && !String(current.tacticalType || '').trim()
    && !String(current.tacticalSerial || '').trim()
    && !String(current.fragGrenade1 || current.fragGrenade || '').trim()
    && !String(current.fragGrenade2 || '').trim();

  if (isEmpty) {
    delete assignments[key];
  } else {
    assignments[key] = current;
  }

  if (oldSnapshot !== JSON.stringify(current)) {
    const fieldLabels = {
      amral: 'אמר"ל',
      comm: 'קשר',
      multitool: 'אולר',
      tactical: 'מטען טקטי לאולר',
      frag1: 'רימוני רסס',
      frag2: 'רימוני רסס'
    };
    queuePendingActivity(`עדכן בטבלה כללית לחייל ${getGeneralTableSoldierNameByKey(key)}: ${fieldLabels[field] || field}`, {
      type: 'general_table_update',
      soldierName: getGeneralTableSoldierNameByKey(key),
      personalNumber: key,
      field
    }, 'generalTable');
  }

  setState({ generalTableAssignments: assignments, generalTableNotice: '' });
  renderApp();
  restoreGeneralTableScrollSnapshot(scrollSnapshot);
}

function renderGeneralTableSelectOptions(options, currentValue, currentLabel) {
  return options.map((opt) => `<option value="${escH(opt.value)}" ${opt.value === currentValue ? 'selected' : ''}>${escH(opt.label || `${opt.type} | ${opt.serial}`)}</option>`).join('');
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
  const asString = (v) => Array.isArray(v) ? String(v[0] || '') : String(v || '');
  return {
    amral: asString(f.amral),
    comm: asString(f.comm),
    multitool: asString(f.multitool),
    tactical: asString(f.tactical),
    frag: asString(f.frag),
    weaponType: asString(f.weaponType),
    weaponSerial: asString(f.weaponSerial)
  };
}

function setGeneralTableFilter(field, values) {
  const current = getGeneralTableFiltersSafe();
  const value = Array.isArray(values) ? (values[0] || '') : (values || '');
  const scrollSnapshot = getGeneralTableScrollSnapshot();
  setState({ generalTableFilters: { ...current, [field]: String(value) } });
  renderApp();
  restoreGeneralTableScrollSnapshot(scrollSnapshot);
}

function toggleGeneralTableTeamSelection(teamName) {
  const selected = Array.isArray(AppState.generalTableSelectedTeams) ? AppState.generalTableSelectedTeams : [];
  const exists = selected.includes(teamName);
  const next = exists ? selected.filter((t) => t !== teamName) : [...selected, teamName];
  const scrollSnapshot = getGeneralTableScrollSnapshot();
  setState({ generalTableSelectedTeams: next });
  renderApp();
  restoreGeneralTableScrollSnapshot(scrollSnapshot);
}

function matchGeneralTableFilterValue(type, serial) {
  const typeStr = canonicalGeneralTableTypeName(type || '');
  const serialStr = String(serial || '').trim();
  if (!typeStr || !serialStr) return '';
  return `${encodeURIComponent(typeStr)}::${encodeURIComponent(serialStr)}`;
}

function isGeneralTableTeamSelected(teamName) {
  const selected = Array.isArray(AppState.generalTableSelectedTeams) ? AppState.generalTableSelectedTeams : [];
  return selected.includes(teamName);
}

function isGeneralTableFilterMatch(filterValue, hasValue, currentValue) {
  if (!filterValue) return true;
  if (filterValue === '__ALL__') return !!hasValue;
  return currentValue === filterValue;
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

function toggleGeneralTableWeaponColumns() {
  setState({ generalTableHideWeaponColumns: !AppState.generalTableHideWeaponColumns });
  renderApp();
}

function renderGeneralTableTab() {
  const { isSavingGeneralTable, generalTableSaveMessage, generalTableNotice } = AppState;
  const hideWeaponColumns = !!AppState.generalTableHideWeaponColumns;
  const allowedAmralTypes = ['שח"ם', 'שח"מ', 'עידו', 'ליאור', 'עכבר', 'שח"ע', 'NYX', 'מיקרון'];
  const allowedCommTypes = ['קשר 710'];
  const allowedMultitoolTypes = ['אולר'];
  const allowedTacticalTypes = ['מטען טקטי לאולר'];
  const soldiers = getGeneralTableSafeSoldiers().sort((a, b) => {
    const depA = String((a && a.department) || '');
    const depB = String((b && b.department) || '');
    if (depA !== depB) return depA.localeCompare(depB, 'he');
    return String((a && a.name) || '').localeCompare(String((b && b.name) || ''), 'he');
  });
  const currentWeapons = getGeneralTableCurrentWeaponsMap();
  const currentAdditionalMeans = getGeneralTableCurrentAdditionalMeansMap();
  const amralOptions = getGeneralTableSelectionOptions(allowedAmralTypes);
  const commOptions = getGeneralTableSelectionOptions(allowedCommTypes);
  const multitoolOptions = getGeneralTableSelectionOptions(allowedMultitoolTypes);
  const tacticalOptions = getGeneralTableSelectionOptions(allowedTacticalTypes);
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
  const teamOptions = Array.from(new Set(
    soldiers.map((s) => String((s && s.department) || '').trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, 'he'));
  const tableColCount = hideWeaponColumns ? 7 : 11;
  const selectedTeams = Array.isArray(AppState.generalTableSelectedTeams) ? AppState.generalTableSelectedTeams : [];

  const filteredSoldiers = soldiers.filter((soldier) => {
    const soldierKey = getGeneralTableSoldierKey(soldier);
    const ass = (AppState.generalTableAssignments && AppState.generalTableAssignments[soldierKey]) || {};
    const team = String((soldier && soldier.department) || '').trim();
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
    const tacticalCurrentValue = matchGeneralTableFilterValue(ass.tacticalType, ass.tacticalSerial);
    const fragCurrentValue1 = String(ass.fragGrenade1 || ass.fragGrenade || '').trim();
    const fragCurrentValue2 = String(ass.fragGrenade2 || '').trim();

    if (selectedTeams.length > 0 && !selectedTeams.includes(team)) return false;

    return isGeneralTableSimpleFilterMatch(filters.weaponType, weaponTypes)
      && isGeneralTableSimpleFilterMatch(filters.weaponSerial, weaponSerials)
      && isGeneralTableFilterMatch(filters.amral, amralCurrentValue !== '', amralCurrentValue)
      && isGeneralTableFilterMatch(filters.comm, commCurrentValue !== '', commCurrentValue)
      && isGeneralTableFilterMatch(filters.multitool, multitoolCurrentValue !== '', multitoolCurrentValue)
      && isGeneralTableFilterMatch(filters.tactical, tacticalCurrentValue !== '', tacticalCurrentValue)
      && isGeneralTableFragFilterMatch(filters.frag, fragCurrentValue1, fragCurrentValue2);
  });

  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-0 md:sticky md:top-40 md:z-20">
      <div>
        <h2 class="text-lg font-bold text-slate-700">טבלה כללית</h2>
        <p class="text-sm text-slate-500">מעקב וניהול הקצאות אמר"ל, קשר, אולר, מטען טקטי לאולר ורימוני רסס לכל חייל.</p>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button onclick="toggleGeneralTableWeaponColumns()"
          class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors border border-slate-300 flex-1 sm:flex-none">
          ${hideWeaponColumns
            ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> תצוגה מורחבת`
            : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 012.159-3.383M6.223 6.223A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.024 10.024 0 01-4.132 5.411M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"/></svg> תצוגה מצומצמת`}
        </button>
        <button onclick="handleSaveGeneralTable()" ${isSavingGeneralTable ? 'disabled' : ''}
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-300 flex-1 sm:flex-none">
          ${isSavingGeneralTable ? 'שומר...' : `שמור שינויים <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`}
        </button>
      </div>
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
      <div class="mb-3">
        <label class="block text-xs font-bold text-slate-600 mb-2">צוותים</label>
        <div class="flex flex-wrap gap-2">
          ${teamOptions.map((team) => `
            <button
              type="button"
              onclick="toggleGeneralTableTeamSelection(decodeURIComponent('${encodeURIComponent(team)}'))"
              class="px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${isGeneralTableTeamSelected(team) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}">
              ${escH(team)}
            </button>
          `).join('')}
        </div>
      </div>
      <h3 class="text-sm font-bold text-slate-700 mb-3">סינון</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
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
          <label class="block text-xs font-bold text-slate-600 mb-1">מטען טקטי לאולר</label>
          <select
            onchange="setGeneralTableFilter('tactical',this.value)"
            class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            ${renderGeneralTableFilterSelectOptions(tacticalOptions, filters.tactical)}
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
      <div id="general-table-scroll-wrap" class="overflow-x-auto">
        <table class="w-full text-right border-collapse ${hideWeaponColumns ? 'min-w-[1050px]' : 'min-w-[1450px]'}">
          <thead>
            <tr class="bg-slate-100 text-slate-600 text-sm">
              <th class="p-3 border-b border-slate-200 bg-slate-100 sticky right-0 z-20">שם</th>
              <th class="p-3 border-b border-slate-200">צוות</th>
              ${hideWeaponColumns ? '' : `<th class="p-3 border-b border-slate-200">מ.א</th>`}
              ${hideWeaponColumns ? '' : `<th class="p-3 border-b border-slate-200">סוג נשק</th>`}
              ${hideWeaponColumns ? '' : `<th class="p-3 border-b border-slate-200">צ' נשק</th>`}
              ${hideWeaponColumns ? '' : `<th class="p-3 border-b border-slate-200">אמצעים נוספים</th>`}
              <th class="p-3 border-b border-slate-200">אמר"ל</th>
              <th class="p-3 border-b border-slate-200">קשר</th>
              <th class="p-3 border-b border-slate-200">אולר</th>
              <th class="p-3 border-b border-slate-200">מטען טקטי לאולר</th>
              <th class="p-3 border-b border-slate-200">רימוני רסס</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSoldiers.length === 0 ? `
              <tr>
                <td colspan="${tableColCount}" class="p-6 text-center text-slate-500">לא נמצאו חיילים לפי הסינון שנבחר.</td>
              </tr>
            ` : filteredSoldiers.map((soldier, rowIdx) => {
              const soldierKey = getGeneralTableSoldierKey(soldier);
              const ass = (AppState.generalTableAssignments && AppState.generalTableAssignments[soldierKey]) || {};
              const weaponMap = currentWeapons.get(soldierKey) || new Map();
              const additionalMap = currentAdditionalMeans.get(soldierKey) || new Map();
              const weapons = Array.from(weaponMap.values());
              const additionalMeans = Array.from(additionalMap.values());
              const weaponTypeLines = weapons.map((w) => String((w && w.type) || '').trim()).filter(Boolean);
              const weaponSerialLines = weapons.map((w) => String((w && w.serial) || '').trim()).filter(Boolean);
              const additionalMeansLines = additionalMeans
                .map((x) => `${String((x && x.type) || '').trim()} - ${String((x && x.serial) || '').trim()}`.trim())
                .filter((line) => line && line !== '- -');
              const weaponTypesHtml = weaponTypeLines.length > 0
                ? `<div class="space-y-1">${weaponTypeLines.map((line) => `<div>${escH(line)}</div>`).join('')}</div>`
                : '-';
              const weaponSerialsHtml = weaponSerialLines.length > 0
                ? `<div class="space-y-1">${weaponSerialLines.map((line) => `<div>${escH(line)}</div>`).join('')}</div>`
                : '-';
              const additionalMeansHtml = additionalMeansLines.length > 0
                ? `<div class="space-y-1">${additionalMeansLines.map((line) => `<div>${escH(line)}</div>`).join('')}</div>`
                : '-';
              const amralValue = ass.amralType && ass.amralSerial ? `${encodeURIComponent(ass.amralType)}::${encodeURIComponent(ass.amralSerial)}` : '';
              const amralLabel = ass.amralType && ass.amralSerial ? getGeneralTableMediumMarkingLabel(ass.amralType, ass.amralSerial) : '';
              const commValue = ass.commType && ass.commSerial ? `${encodeURIComponent(ass.commType)}::${encodeURIComponent(ass.commSerial)}` : '';
              const commLabel = ass.commType && ass.commSerial ? getGeneralTableMediumMarkingLabel(ass.commType, ass.commSerial) : '';
              const multitoolValue = ass.multitoolType && ass.multitoolSerial ? `${encodeURIComponent(ass.multitoolType)}::${encodeURIComponent(ass.multitoolSerial)}` : '';
              const multitoolLabel = ass.multitoolType && ass.multitoolSerial ? getGeneralTableMediumMarkingLabel(ass.multitoolType, ass.multitoolSerial) : '';
              const tacticalValue = ass.tacticalType && ass.tacticalSerial ? `${encodeURIComponent(ass.tacticalType)}::${encodeURIComponent(ass.tacticalSerial)}` : '';
              const tacticalLabel = ass.tacticalType && ass.tacticalSerial ? getGeneralTableMediumMarkingLabel(ass.tacticalType, ass.tacticalSerial) : '';
              const fragValue1 = String(ass.fragGrenade1 || ass.fragGrenade || '');
              const fragValue2 = String(ass.fragGrenade2 || '');
              const fragListId1 = `general-table-frag1-list-${rowIdx}`;
              const fragListId2 = `general-table-frag2-list-${rowIdx}`;
              return `
              <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="p-2 text-slate-800 font-medium bg-white border-l border-slate-200 sticky right-0 z-10">${escH(soldier.name || '-')}</td>
                <td class="p-2 text-slate-700">${escH(soldier.department || '-')}</td>
                ${hideWeaponColumns ? '' : `<td class="p-2 font-mono text-slate-700">${escH(soldier.id || '-')}</td>`}
                ${hideWeaponColumns ? '' : `<td class="p-2 text-slate-700 align-top">${weaponTypesHtml}</td>`}
                ${hideWeaponColumns ? '' : `<td class="p-2 font-mono text-slate-700 align-top">${weaponSerialsHtml}</td>`}
                ${hideWeaponColumns ? '' : `<td class="p-2 text-slate-700 align-top">${additionalMeansHtml}</td>`}
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
                  <select
                    onchange="handleGeneralTableSelectChange(decodeURIComponent('${encodeURIComponent(soldierKey)}'),'tactical',this.value)"
                    class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="" ${!tacticalValue ? 'selected' : ''}>ללא שיוך</option>
                    ${renderGeneralTableSelectOptions(tacticalOptions, tacticalValue, tacticalLabel)}
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
