// ===== ui-rasmatz.js =====
// טאב רשמ"צ - יצירה ועריכה של רשימות

function getRasmatzListsSafe() {
  const source = AppState.rasmatzLists || {};
  const out = {};
  Object.keys(source).forEach((name) => {
    const cleanName = String(name || '').trim();
    if (!cleanName) return;
    const rows = Array.isArray(source[name]) ? source[name] : [];
    out[cleanName] = rows.map((row) => String(row || ''));
  });
  return out;
}

function createRasmatzList() {
  const requestedName = String(AppState.newRasmatzListName || '').trim();
  if (!requestedName) {
    window.alert('יש להזין שם רשימה.');
    return;
  }

  const lists = getRasmatzListsSafe();
  if (Object.prototype.hasOwnProperty.call(lists, requestedName)) {
    window.alert('כבר קיימת רשימה בשם הזה.');
    return;
  }

  const nextLists = { ...lists, [requestedName]: [] };
  setState({
    rasmatzLists: nextLists,
    selectedRasmatzListName: requestedName,
    newRasmatzListName: ''
  });
  queuePendingActivity(`יצר רשימת רשמ"צ חדשה: ${requestedName}`, {
    type: 'rasmatz_create_list',
    listName: requestedName
  }, 'database');
  renderApp();
}

function setNewRasmatzListName(inputElOrValue) {
  const isInput = inputElOrValue && typeof inputElOrValue === 'object' && 'value' in inputElOrValue;
  const value = isInput ? inputElOrValue.value : inputElOrValue;
  const cursorPos = isInput && typeof inputElOrValue.selectionStart === 'number'
    ? inputElOrValue.selectionStart
    : String(value || '').length;

  setState({ newRasmatzListName: String(value || '') });
  renderApp();

  const nextInput = document.getElementById('rasmatz-new-list-name-input');
  if (!nextInput) return;
  nextInput.focus();
  const pos = Math.min(cursorPos, nextInput.value.length);
  try {
    nextInput.setSelectionRange(pos, pos);
  } catch (_) {
    // ignore environments that do not support selection APIs
  }
}

function selectRasmatzList(name) {
  setState({ selectedRasmatzListName: String(name || '') });
  renderApp();
}

function updateRasmatzListContent(text) {
  const selected = String(AppState.selectedRasmatzListName || '').trim();
  if (!selected) return;
  const lists = getRasmatzListsSafe();
  if (!Object.prototype.hasOwnProperty.call(lists, selected)) return;
  const lines = String(text || '').split('\n');
  const nextLists = { ...lists, [selected]: lines };
  setState({ rasmatzLists: nextLists });
}

function renderRasmatzTab() {
  const { isSavingRasmatz, rasmatzSaveMessage, newRasmatzListName } = AppState;
  const lists = getRasmatzListsSafe();
  const listNames = Object.keys(lists).sort((a, b) => a.localeCompare(b, 'he'));
  const selected = listNames.includes(AppState.selectedRasmatzListName)
    ? AppState.selectedRasmatzListName
    : (listNames[0] || '');
  const selectedLines = selected ? (lists[selected] || []) : [];

  if (selected !== AppState.selectedRasmatzListName) {
    setState({ selectedRasmatzListName: selected });
  }

  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:sticky md:top-40 md:z-20">
      <div>
        <h2 class="text-lg font-bold text-slate-700">רשמ"צ</h2>
        <p class="text-sm text-slate-500">צור רשימות בשם חופשי, ערוך את התוכן ושמור.</p>
      </div>
      <button onclick="handleSaveRasmatz()" ${isSavingRasmatz ? 'disabled' : ''}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-300 w-full sm:w-auto">
        ${isSavingRasmatz ? 'שומר...' : `שמור רשימות <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`}
      </button>
    </div>

    ${rasmatzSaveMessage ? `<div class="bg-green-100 text-green-700 p-4 rounded-lg font-medium shadow-sm">${escH(rasmatzSaveMessage)}</div>` : ''}

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 class="text-sm font-bold text-slate-700 mb-3">יצירת רשימה חדשה</h3>
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          id="rasmatz-new-list-name-input"
          type="text"
          value="${escH(newRasmatzListName || '')}"
          oninput="setNewRasmatzListName(this)"
          onkeydown="if(event.key==='Enter'){createRasmatzList()}"
          placeholder="שם הרשימה"
          class="flex-1 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button onclick="createRasmatzList()"
          class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-bold">
          צור רשימה
        </button>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 class="text-sm font-bold text-slate-700 mb-3">עריכת רשימה</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">בחר רשימה</label>
          <select
            onchange="selectRasmatzList(this.value)"
            class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="" ${!selected ? 'selected' : ''} disabled>בחר רשימה לעריכה...</option>
            ${listNames.map((name) => `<option value="${escH(name)}" ${name === selected ? 'selected' : ''}>${escH(name)}</option>`).join('')}
          </select>
        </div>
        ${selected ? `
          <textarea
            rows="14"
            oninput="updateRasmatzListContent(this.value)"
            class="w-full border border-slate-300 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            placeholder="רשום שורה בכל שורה חדשה...">${escH(selectedLines.join('\n'))}</textarea>
          <div class="text-xs text-slate-500">כל שורה מייצגת פריט/שורה ברשימה "${escH(selected)}".</div>
        ` : `<div class="text-sm text-slate-500">אין עדיין רשימות. צור רשימה חדשה כדי להתחיל.</div>`}
      </div>
    </div>
  </div>`;
}
