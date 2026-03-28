// ===== ui-home-history.js =====
// Home and full history tabs

function renderHomeTab() {
  const recent = sortActivityLogNewestFirst(AppState.activityLog).slice(0, 10);
  const note = AppState.historyNoteText || '';
  const attachmentName = AppState.historyAttachmentName || '';
  const attachmentDataUrl = AppState.historyAttachmentDataUrl || '';
  const attachmentError = AppState.historyAttachmentError || '';

  return `
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 class="text-2xl font-bold text-slate-800 mb-2">ברוכים הבאים לאפליקציית ניהול נתונים של פלוגת הניוד!</h2>
      <p class="text-slate-600">כאן תוכלו לראות פעילות אחרונה ולהוסיף אירועים ידניים לרישום.</p>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 class="text-lg font-bold text-slate-700 mb-3">הוספת אירוע ידני</h3>
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          value="${escH(note)}"
          placeholder="לדוגמה: באו אנשים מפלוגה נוספת לקחת לנו ציוד..."
          oninput="setState({historyNoteText:this.value})"
          onkeydown="if(event.key==='Enter')addManualHistoryEvent()"
          class="flex-1 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button onclick="addManualHistoryEvent()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold">
          הוסף אירוע
        </button>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <input
          id="manual-history-attachment-input"
          type="file"
          accept="image/*"
          onchange="handleManualHistoryAttachmentSelected(event)"
          class="hidden"
        />
        <button onclick="openManualHistoryAttachmentPicker()"
          class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold border border-slate-300">
          צרף תמונה
        </button>
        ${attachmentName ? `<span class="text-sm text-slate-600">קובץ מצורף: ${escH(attachmentName)}</span>` : ''}
        ${attachmentName ? `<button onclick="clearManualHistoryAttachment()" class="text-sm text-red-600 hover:text-red-800 font-bold">הסר</button>` : ''}
      </div>
      ${attachmentError ? `<div class="mt-2 text-sm text-red-600">${escH(attachmentError)}</div>` : ''}
      ${attachmentDataUrl ? `
        <div class="mt-3">
          <img src="${escH(attachmentDataUrl)}" alt="attachment preview" class="max-h-48 rounded-lg border border-slate-200" />
        </div>` : ''}
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-bold text-slate-700">10 אירועים אחרונים</h3>
        <button onclick="setActiveTab('history')"
          class="text-sm font-bold text-blue-700 hover:text-blue-900">
          מעבר להיסטוריה מלאה
        </button>
      </div>
      ${renderActivityRows(recent, true)}
    </div>
    ${renderHistoryAttachmentViewer()}
  </div>`;
}

function renderHistoryTab() {
  const all = sortActivityLogNewestFirst(AppState.activityLog);
  return `
  <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-lg font-bold text-slate-700">היסטוריה מלאה</h2>
      <span class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">${all.length} אירועים</span>
    </div>
    ${renderActivityRows(all, false)}
    ${renderHistoryAttachmentViewer()}
  </div>`;
}

function renderActivityRows(entries, compact) {
  if (!entries.length) {
    return `<div class="text-center text-slate-500 py-6">אין אירועים להצגה כרגע.</div>`;
  }

  return `
  <div class="divide-y divide-slate-100 ${compact ? 'max-h-96' : 'max-h-[70vh]'} overflow-y-auto">
    ${entries.map((entry) => `
      <div class="py-3">
        <div class="font-medium text-slate-800">${escH(entry.actor || 'משתמש לא מזוהה')} — ${escH(entry.message || '')}</div>
        ${entry.attachmentDataUrl ? `
          <div class="mt-2">
            <div class="flex items-center gap-3">
              <button
                onclick="openHistoryAttachmentViewer(decodeURIComponent('${encodeURIComponent(entry.attachmentDataUrl)}'), decodeURIComponent('${encodeURIComponent(entry.attachmentName || 'attachment.jpg')}'))"
                class="text-sm text-blue-700 hover:text-blue-900 font-bold">
                פתח קובץ מצורף
              </button>
              <button
                onclick="downloadHistoryAttachment(decodeURIComponent('${encodeURIComponent(entry.attachmentDataUrl)}'), decodeURIComponent('${encodeURIComponent(entry.attachmentName || 'attachment.jpg')}'))"
                class="text-sm text-emerald-700 hover:text-emerald-900 font-bold">
                הורד תמונה
              </button>
            </div>
            <img
              src="${escH(entry.attachmentDataUrl)}"
              alt="history attachment"
              onclick="openHistoryAttachmentViewer(decodeURIComponent('${encodeURIComponent(entry.attachmentDataUrl)}'), decodeURIComponent('${encodeURIComponent(entry.attachmentName || 'attachment.jpg')}'))"
              class="mt-2 max-h-40 rounded border border-slate-200 cursor-zoom-in"
            />
          </div>` : ''}
        <div class="text-xs text-slate-500 mt-1">${escH(formatActivityDate(entry))}</div>
      </div>
    `).join('')}
  </div>`;
}

function openManualHistoryAttachmentPicker() {
  const input = document.getElementById('manual-history-attachment-input');
  if (input) input.click();
}

function clearManualHistoryAttachment() {
  setState({
    historyAttachmentName: '',
    historyAttachmentDataUrl: '',
    historyAttachmentError: ''
  });
  const input = document.getElementById('manual-history-attachment-input');
  if (input) input.value = '';
  renderApp();
}

function handleManualHistoryAttachmentSelected(event) {
  const file = event && event.target && event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type || !file.type.startsWith('image/')) {
    setState({ historyAttachmentError: 'ניתן לצרף רק תמונה.' });
    renderApp();
    return;
  }

  // Keep attachments small to avoid bloating Firestore document size.
  const maxBytes = 350 * 1024;
  if (file.size > maxBytes) {
    setState({ historyAttachmentError: 'התמונה גדולה מדי. נא לבחור תמונה עד 350KB.' });
    renderApp();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    setState({
      historyAttachmentName: file.name,
      historyAttachmentDataUrl: String(reader.result || ''),
      historyAttachmentError: ''
    });
    renderApp();
  };
  reader.onerror = () => {
    setState({ historyAttachmentError: 'לא ניתן לקרוא את הקובץ שנבחר.' });
    renderApp();
  };
  reader.readAsDataURL(file);
}

function addManualHistoryEvent() {
  const text = (AppState.historyNoteText || '').trim();
  if (!text) return;
  appendActivityLog(text, {
    type: 'manual_note',
    attachmentName: AppState.historyAttachmentName || '',
    attachmentDataUrl: AppState.historyAttachmentDataUrl || ''
  });
  setState({
    historyNoteText: '',
    historyAttachmentName: '',
    historyAttachmentDataUrl: '',
    historyAttachmentError: ''
  });
  const input = document.getElementById('manual-history-attachment-input');
  if (input) input.value = '';
  renderApp();
}

function openHistoryAttachmentViewer(dataUrl, fileName) {
  setState({
    historyViewerAttachmentDataUrl: dataUrl || '',
    historyViewerAttachmentName: fileName || ''
  });
  renderApp();
}

function closeHistoryAttachmentViewer() {
  setState({
    historyViewerAttachmentDataUrl: '',
    historyViewerAttachmentName: ''
  });
  renderApp();
}

function downloadHistoryAttachment(dataUrl, fileName) {
  if (!dataUrl) return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName || 'attachment.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function renderHistoryAttachmentViewer() {
  const dataUrl = AppState.historyViewerAttachmentDataUrl || '';
  if (!dataUrl) return '';
  const fileName = AppState.historyViewerAttachmentName || 'attachment.jpg';
  return `
  <div class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onclick="closeHistoryAttachmentViewer()">
    <div class="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto p-3" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-2">
        <div class="text-sm text-slate-700 font-medium">${escH(fileName)}</div>
        <div class="flex items-center gap-3">
          <button onclick="downloadHistoryAttachment(decodeURIComponent('${encodeURIComponent(dataUrl)}'), decodeURIComponent('${encodeURIComponent(fileName)}'))" class="text-sm text-emerald-700 hover:text-emerald-900 font-bold">הורד</button>
          <button onclick="closeHistoryAttachmentViewer()" class="text-sm text-red-600 hover:text-red-800 font-bold">סגור</button>
        </div>
      </div>
      <img src="${escH(dataUrl)}" alt="history attachment full" class="w-full h-auto rounded border border-slate-200" />
    </div>
  </div>`;
}
