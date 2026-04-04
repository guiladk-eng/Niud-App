// ===== ui-reports.js =====
// טאב דוחות

function reportsFormatTodayDate() {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  return `${d}.${m}.${y}`;
}

function reportsIsTacticalChargerType(typeName) {
  const t = String(typeName || '').trim();
  return t === 'מטען טקטי לאולר' || t === 'מטען נייד לאולר' || t === 'מטען נייד אולר';
}

function generateCipherReport() {
  const dateStr = reportsFormatTodayDate();
  const comms = AppState.commsData || {};

  const lines = [`דו"ח צ' ניוד ${dateStr}`, ''];
  const types = Object.keys(comms || {})
    .map((t) => String(t || '').trim())
    .filter(Boolean)
    .filter((t) => !reportsIsTacticalChargerType(t))
    .sort((a, b) => a.localeCompare(b, 'he'));

  types.forEach((type) => {
    const serials = Array.isArray(comms[type]) ? comms[type] : [];
    const cleanedSerials = Array.from(new Set(
      serials
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'he'))
    ));

    cleanedSerials.forEach((serial) => {
      lines.push(`מכשיר: ${type}`);
      lines.push(`צ' המכשיר: ${serial}`);
      lines.push('מיקום המכשיר: בחוץ');
      lines.push('');
    });
  });

  setState({ reportsCipherText: lines.join('\n').trim() });
  renderApp();
}

function renderReportsTab() {
  const reportText = String(AppState.reportsCipherText || '').trim();
  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-700 mb-2">דוחות</h2>
      <p class="text-sm text-slate-500 mb-4">יצירת דו"ח מצפינים מתוך תקשוב (ללא מטען טקטי לאולר).</p>
      <button onclick="generateCipherReport()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors">
        דוח מצפינים
      </button>
    </div>

    ${reportText ? `
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-sm font-bold text-slate-700 mb-2">תצוגת הדוח</h3>
        <textarea
          rows="18"
          readonly
          class="w-full border border-slate-300 rounded-lg p-3 text-sm bg-slate-50 outline-none font-mono">${escH(reportText)}</textarea>
      </div>
    ` : ''}
  </div>`;
}
