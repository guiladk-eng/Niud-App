// ===== ui-categories.js =====
// טאב ניהול סוגי פריטים - מעודכן לגרסה החדשה

function renderCategoriesTab() {
  const { inventoryCategories, isSavingCategories, categoriesSaveMessage } = AppState;

  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:sticky md:top-40 md:z-20">
      <div>
        <h2 class="text-lg font-bold text-slate-700">ניהול סוגי פריטים</h2>
        <p class="text-sm text-slate-500">ערוך, הוסף ושנה את סוגי הפריטים והקטגוריות הזמינים למשיכה ומופיעים במלאי.</p>
      </div>
      <button onclick="handleSaveCategories()" ${isSavingCategories ? 'disabled' : ''}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-300 w-full sm:w-auto">
        ${isSavingCategories ? 'שומר...' : `שמור שינויים <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`}
      </button>
    </div>

    ${categoriesSaveMessage ? `<div class="bg-green-100 text-green-700 p-4 rounded-lg font-medium shadow-sm mb-4">${escH(categoriesSaveMessage)}</div>` : ''}

    ${renderDbEditorBlock('inventoryCategories', inventoryCategories, 'קטגוריות ופריטים למשיכה', 'text-indigo-600',
      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>`,
      'הזן פריטים מופרדים בשורות חדשות (אנטר)')}
  </div>`;
}

function catUpdateType(catName, value) {
  const data = { ...AppState.inventoryCategories };
  data[catName] = value.split('\n');
  setState({ inventoryCategories: data });
}

function catDeleteType(catName) {
  const data = { ...AppState.inventoryCategories };
  delete data[catName];
  setState({ inventoryCategories: data });
  renderApp();
}

function catAddType() {
  const input = document.getElementById('new-cat-type');
  const newType = input.value.trim();
  if (newType && !AppState.inventoryCategories[newType]) {
    const data = { ...AppState.inventoryCategories, [newType]: [] };
    setState({ inventoryCategories: data });
    input.value = '';
    renderApp();
  }
}
