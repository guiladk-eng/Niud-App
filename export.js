// ===== export.js =====
// ייצוא נתונים ל-CSV - מעודכן לגרסה החדשה

function formatDate(timestamp) {
  if (!timestamp) return 'תאריך לא ידוע';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToCSV() {
  let csv = '\uFEFF';
  csv += 'תאריך,שם חייל,מספר אישי,פריט,כמות,פעולה,סוג ציוד,מספר סידורי\n';

  AppState.submissionHistory.forEach(entry => {
    const dateStr = formatDate(entry.timestamp).replace(/,/g, '');
    const name = entry.soldierName || 'לא הוזן שם';
    const id   = entry.personalNumber || '';

    if (entry.items) {
      Object.entries(entry.items).forEach(([item, qty]) => {
        const action = qty < 0 ? 'החזרה' : 'משיכה';
        csv += `${dateStr},${name},${id},${item},${Math.abs(qty)},${action},,\n`;
      });
    }
    (entry.weapons || []).forEach(w =>
      csv += `${dateStr},${name},${id},נשק,1,משיכה,${w.type},${w.serial}\n`);
    (entry.returnedWeapons || []).forEach(w =>
      csv += `${dateStr},${name},${id},נשק,1,החזרה,${w.type},${w.serial}\n`);
    (entry.optics || []).forEach(o =>
      csv += `${dateStr},${name},${id},אופטיקה,1,משיכה,${o.type},${o.serial}\n`);
    (entry.returnedOptics || []).forEach(o =>
      csv += `${dateStr},${name},${id},אופטיקה,1,החזרה,${o.type},${o.serial}\n`);
    (entry.comms || []).forEach(c =>
      csv += `${dateStr},${name},${id},תקשוב,1,משיכה,${c.type},${c.serial}\n`);
    (entry.returnedComms || []).forEach(c =>
      csv += `${dateStr},${name},${id},תקשוב,1,החזרה,${c.type},${c.serial}\n`);
  });

  downloadCSV(csv, 'נתוני_משיכות_והחזרות_ציוד.csv');
}

function exportDatabaseToCSV() {
  let csv = '\uFEFF';
  csv += 'קטגוריה,מספר סידורי\n';

  const appendData = (dataObj) => {
    Object.entries(dataObj).forEach(([category, serials]) => {
      serials.forEach(serial => { csv += `${category},${serial}\n`; });
    });
  };

  appendData(AppState.weaponsData);
  appendData(AppState.opticsData);
  appendData(AppState.commsData);
  appendData(AppState.ammoData || {});

  downloadCSV(csv, 'מסד_נתונים_לוגיסטיקה.csv');
}
