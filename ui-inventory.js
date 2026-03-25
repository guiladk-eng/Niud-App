// ===== ui-inventory.js =====
// טאב ניהול מלאי כללי - מעודכן לגרסה החדשה

function renderInventoryTab() {
  const { inventoryCategories, totalStock, isSavingStock, stockSaveMessage } = AppState;

  return `
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-700">ניהול מלאי כללי</h2>
        <p class="text-sm text-slate-500">הזן את הכמויות הכלליות שיש במלאי מכל פריט. הנתונים יוצגו בטבלת הספירה הכללית להשוואה.</p>
      </div>
      <button onclick="handleSaveStock()" ${isSavingStock ? 'disabled' : ''}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-300 w-full sm:w-auto">
        ${isSavingStock ? 'שומר...' : `שמור מלאי <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`}
      </button>
    </div>

    ${stockSaveMessage ? `<div class="bg-green-100 text-green-700 p-4 rounded-lg font-medium shadow-sm mb-4">${escH(stockSaveMessage)}</div>` : ''}

    ${Object.entries(inventoryCategories).map(([catName, items]) => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="bg-slate-100 px-4 py-3 border-b border-slate-200">
        <h3 class="font-bold text-slate-700">${escH(catName)}</h3>
      </div>
      <div class="divide-y divide-slate-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        ${items.map(item => `
        <div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span class="font-medium text-slate-800">${escH(item)}</span>
          <input type="number" min="0"
            value="${totalStock[item] === undefined ? '' : totalStock[item]}"
            placeholder="0"
            onchange="updateTotalStock('${escH(item)}', this.value)"
            class="w-24 border border-slate-300 rounded-lg p-2 text-center focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>`;
}

function updateTotalStock(item, value) {
  const newStock = { ...AppState.totalStock, [item]: Math.max(0, parseInt(value) || 0) };
  setState({ totalStock: newStock });
}
