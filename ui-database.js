// ===== ui-database.js =====
// טאב עריכת מסד נתונים - מעודכן לגרסה החדשה

function renderDatabaseTab() {
  const { weaponsData, opticsData, commsData, isSavingDb, dbSaveMessage } = AppState;

  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-700">ניהול צלמים</h2>
        <p class="text-sm text-slate-500">הזן את המספרים הסידוריים מופרדים בשורה חדשה (אנטר). כל שינוי ישפיע ישירות על האפשרויות בטופס המאסטר.</p>
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
      'הזן מספרים סידוריים מופרדים בשורות חדשות (אנטר)')}

    ${renderDbEditorBlock('opticsData', opticsData, 'אופטיקה', 'text-indigo-600',
      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`,
      'הזן מספרים סידוריים מופרדים בשורות חדשות (אנטר)')}

    ${renderDbEditorBlock('commsData', commsData, 'תקשוב', 'text-emerald-600',
      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>`,
      'הזן מספרים סידוריים מופרדים בשורות חדשות (אנטר)')}
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
      ${Object.keys(data).map(type => `
      <div class="border border-slate-200 rounded-lg p-3 bg-slate-50 relative">
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold text-slate-800">${escH(type)}</span>
          <button onclick="dbDeleteType('${stateKey}','${escH(type)}')" title="מחק קטגוריה זו"
            class="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm border border-red-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
        <textarea rows="3" placeholder="${placeholder}"
          class="w-full border border-slate-300 rounded p-2 text-sm text-right bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          onchange="dbUpdateType('${stateKey}','${escH(type)}',this.value)"
          onblur="dbUpdateType('${stateKey}','${escH(type)}',this.value)"
        >${escH((data[type] || []).join('\n'))}</textarea>
      </div>`).join('')}
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

function dbDeleteType(stateKey, type) {
  const data = { ...AppState[stateKey] };
  delete data[type];
  setState({ [stateKey]: data });
  renderApp();
}

function dbAddType(stateKey, inputId) {
  const input = document.getElementById(inputId);
  const newType = input.value.trim();
  if (newType && !AppState[stateKey][newType]) {
    const data = { ...AppState[stateKey], [newType]: [] };
    setState({ [stateKey]: data });
    input.value = '';
    renderApp();
  }
}
