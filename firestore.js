// ===== firestore.js =====
// כל פעולות הקריאה/כתיבה ל-Firestore - מעודכן לגרסה החדשה

function loadFirestoreData() {
  // Listen to inventory requests
  getRequestsRef().onSnapshot((snapshot) => {
    const history = [];
    const totals = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      history.push({ id: docSnap.id, ...data });
      if (data.items) {
        Object.entries(data.items).forEach(([itemName, quantity]) => {
          const qty = Number(quantity);
          totals[itemName] = (totals[itemName] || 0) + qty;
        });
      }
    });

    Object.keys(totals).forEach(k => { if (totals[k] <= 0) delete totals[k]; });
    history.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));

    setState({ submissionHistory: history, inventoryTotals: totals, isLoadingData: false });
    renderApp();
  }, (error) => {
    console.error('Error fetching data:', error);
    setState({ isLoadingData: false });
    renderApp();
  });

  // Listen to settings
  getSettingsRef().onSnapshot((docSnap) => {
    if (docSnap.exists) {
      const data = docSnap.data();
      const updates = {};
      if (data.categories) updates.inventoryCategories = data.categories;
      if (data.weapons)    updates.weaponsData = data.weapons;
      if (data.optics)     updates.opticsData = data.optics;
      if (data.comms)      updates.commsData = data.comms;
      if (data.ammo)       updates.ammoData = data.ammo;
      if (Array.isArray(data.cameraItemsTable)) updates.cameraItemsTable = data.cameraItemsTable;
      if (data.totalStock) updates.totalStock = data.totalStock;
      if (data.soldiers)   updates.soldiersData = data.soldiers;
      if (data.generalTableAssignments) updates.generalTableAssignments = data.generalTableAssignments;
      if (data.activityLog) updates.activityLog = data.activityLog;
      if (Object.keys(updates).length > 0) {
        setState(updates);
        renderApp();
      }
    }
  }, (error) => console.error('Error fetching settings:', error));
}

// ─── handleSubmit (מעודכן לגרסה החדשה) ────────────────────────────────────
async function handleSubmitForm() {
  const {
    soldierName, personalNumber, loggedInAdmin,
    cart, originalCart,
    cartWeapons, originalWeapons,
    cartOptics, originalOptics,
    cartComms, originalComms
  } = AppState;

  if (!soldierName || !personalNumber) {
    setState({ submitMessage: 'יש לבחור שם חייל ולהזין מספר אישי לפני השליחה.' });
    renderApp();
    setTimeout(() => { setState({ submitMessage: '' }); renderApp(); }, 3000);
    return;
  }

  // Build itemsDeltas — tracks adds AND items going back to 0
  const itemsDeltas = {};
  Object.entries(cart).forEach(([item, qty]) => {
    const oldQty = originalCart[item] || 0;
    const delta = qty - oldQty;
    if (delta !== 0) itemsDeltas[item] = delta;
  });
  Object.entries(originalCart).forEach(([item, oldQty]) => {
    if (cart[item] === undefined && oldQty > 0) {
      itemsDeltas[item] = -oldQty;
    }
  });

  // Weapons diff
  const originalWeaponKeys = new Set(originalWeapons.map(w => `${w.type}-${w.serial}`));
  const currentWeaponKeys  = new Set(cartWeapons.map(w => `${w.type}-${w.serial}`));
  const weaponsToAdd    = cartWeapons.filter(w => !originalWeaponKeys.has(`${w.type}-${w.serial}`));
  const weaponsToReturn = originalWeapons.filter(w => !currentWeaponKeys.has(`${w.type}-${w.serial}`));

  // Optics diff
  const originalOpticKeys = new Set(originalOptics.map(o => `${o.type}-${o.serial}`));
  const currentOpticKeys  = new Set(cartOptics.map(o => `${o.type}-${o.serial}`));
  const opticsToAdd    = cartOptics.filter(o => !originalOpticKeys.has(`${o.type}-${o.serial}`));
  const opticsToReturn = originalOptics.filter(o => !currentOpticKeys.has(`${o.type}-${o.serial}`));

  // Comms diff
  const originalCommKeys = new Set(originalComms.map(c => `${c.type}-${c.serial}`));
  const currentCommKeys  = new Set(cartComms.map(c => `${c.type}-${c.serial}`));
  const commsToAdd    = cartComms.filter(c => !originalCommKeys.has(`${c.type}-${c.serial}`));
  const commsToReturn = originalComms.filter(c => !currentCommKeys.has(`${c.type}-${c.serial}`));

  // Check for changes
  if (
    Object.keys(itemsDeltas).length === 0 &&
    weaponsToAdd.length === 0 && weaponsToReturn.length === 0 &&
    opticsToAdd.length === 0 && opticsToReturn.length === 0 &&
    commsToAdd.length === 0 && commsToReturn.length === 0
  ) {
    setState({ submitMessage: 'לא בוצעו שינויים בציוד של החייל.' });
    renderApp();
    setTimeout(() => { setState({ submitMessage: '' }); renderApp(); }, 3000);
    return;
  }

  if (!AppState.user) return;
  setState({ isSubmitting: true });
  renderApp();

  try {
    // Build Firestore payload
    const requestPayload = {
      userId: AppState.user.uid,
      soldierName,
      personalNumber,
      items: itemsDeltas,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      submitter: loggedInAdmin,
      isUpdate: true
    };

    if (weaponsToAdd.length > 0)    requestPayload.weapons = weaponsToAdd;
    if (weaponsToReturn.length > 0) requestPayload.returnedWeapons = weaponsToReturn;
    if (opticsToAdd.length > 0)     requestPayload.optics = opticsToAdd;
    if (opticsToReturn.length > 0)  requestPayload.returnedOptics = opticsToReturn;
    if (commsToAdd.length > 0)      requestPayload.comms = commsToAdd;
    if (commsToReturn.length > 0)   requestPayload.returnedComms = commsToReturn;

    await getRequestsRef().add(requestPayload);

    // Sync to Google Sheets — rowsToSync array format (new version)
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const dateStr = new Intl.DateTimeFormat('he-IL', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }).format(new Date());

        const rowsToSync = [];

        Object.entries(itemsDeltas).forEach(([item, qty]) => {
          rowsToSync.push({
            date: dateStr, name: soldierName, id: personalNumber, item,
            qty: Math.abs(qty), action: qty < 0 ? 'החזרה' : 'משיכה',
            submitter: loggedInAdmin, weaponType: '', weaponSerial: ''
          });
        });
        weaponsToAdd.forEach(w => rowsToSync.push({ date: dateStr, name: soldierName, id: personalNumber, item: 'נשק', qty: 1, action: 'משיכה', submitter: loggedInAdmin, weaponType: w.type, weaponSerial: w.serial }));
        weaponsToReturn.forEach(w => rowsToSync.push({ date: dateStr, name: soldierName, id: personalNumber, item: 'נשק', qty: 1, action: 'החזרה', submitter: loggedInAdmin, weaponType: w.type, weaponSerial: w.serial }));
        opticsToAdd.forEach(o => rowsToSync.push({ date: dateStr, name: soldierName, id: personalNumber, item: 'אופטיקה', qty: 1, action: 'משיכה', submitter: loggedInAdmin, weaponType: o.type, weaponSerial: o.serial }));
        opticsToReturn.forEach(o => rowsToSync.push({ date: dateStr, name: soldierName, id: personalNumber, item: 'אופטיקה', qty: 1, action: 'החזרה', submitter: loggedInAdmin, weaponType: o.type, weaponSerial: o.serial }));
        commsToAdd.forEach(c => rowsToSync.push({ date: dateStr, name: soldierName, id: personalNumber, item: 'תקשוב', qty: 1, action: 'משיכה', submitter: loggedInAdmin, weaponType: c.type, weaponSerial: c.serial }));
        commsToReturn.forEach(c => rowsToSync.push({ date: dateStr, name: soldierName, id: personalNumber, item: 'תקשוב', qty: 1, action: 'החזרה', submitter: loggedInAdmin, weaponType: c.type, weaponSerial: c.serial }));

        if (rowsToSync.length > 0) {
          await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify(rowsToSync),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          });
        }
      } catch (syncError) {
        console.error('שגיאה בסנכרון לגוגל שיטס:', syncError);
      }
    }

    // Clear form after submit (new behavior)
    const itemChangesCount = Object.keys(itemsDeltas).length
      + weaponsToAdd.length + weaponsToReturn.length
      + opticsToAdd.length + opticsToReturn.length
      + commsToAdd.length + commsToReturn.length;
    appendActivityLog(`החתים/עדכן את החייל ${soldierName} (${personalNumber}) על ציוד. סה"כ שינויים: ${itemChangesCount}`, {
      type: 'equipment_submit',
      soldierName,
      personalNumber
    });

    setState({
      formSearchTerm: '',
      cart: {}, originalCart: {},
      cartWeapons: [], originalWeapons: [],
      cartOptics: [], originalOptics: [],
      cartComms: [], originalComms: [],
      soldierName: '', personalNumber: '',
      submitMessage: 'הציוד עודכן ונשמר בהצלחה בהיסטוריה!'
    });
    window.scrollTo(0, 0);

  } catch (error) {
    console.error('Error submitting form:', error);
    setState({ submitMessage: 'שגיאה בעדכון הציוד. אנא נסה שנית.' });
  } finally {
    setState({ isSubmitting: false });
    renderApp();
    setTimeout(() => { setState({ submitMessage: '' }); renderApp(); }, 4000);
  }
}

// ─── Save functions ─────────────────────────────────────────────────────────
async function handleSaveDatabase() {
  setState({ isSavingDb: true }); renderApp();
  try {
    const clean = (obj) => {
      const out = {};
      Object.keys(obj).forEach(k => { out[k] = obj[k].map(s => s.trim()).filter(s => s !== ''); });
      return out;
    };
    const cleanedWeapons = clean(AppState.weaponsData);
    const cleanedOptics  = clean(AppState.opticsData);
    const cleanedComms   = clean(AppState.commsData);
    const cleanedAmmo    = clean(AppState.ammoData);
    const cleanedCameraItemsTable = (Array.isArray(AppState.cameraItemsTable) ? AppState.cameraItemsTable : [])
      .map((row) => ({
        civilMilitary: String((row && row.civilMilitary) || '').trim(),
        marking: String((row && row.marking) || '').trim(),
        medium: String((row && row.medium) || '').trim(),
        serial: String((row && row.serial) || '').trim()
      }))
      .filter((row) => row.civilMilitary && row.marking && row.medium && row.serial);

    // Use update() to replace whole map fields (so deleted types are actually removed).
    // merge:true keeps old nested keys, which caused deleted weapon types to reappear.
    const settingsRef = getSettingsRef();
    try {
      await settingsRef.update({
        weapons: cleanedWeapons,
        optics: cleanedOptics,
        comms: cleanedComms,
        ammo: cleanedAmmo,
        cameraItemsTable: cleanedCameraItemsTable
      });
    } catch (e) {
      if (e && e.code === 'not-found') {
        await settingsRef.set({ weapons: cleanedWeapons, optics: cleanedOptics, comms: cleanedComms, ammo: cleanedAmmo, cameraItemsTable: cleanedCameraItemsTable }, { merge: true });
      } else {
        throw e;
      }
    }

    commitPendingActivity('database');
    appendActivityLog('שמר את מסד הנתונים (נשקים/אופטיקה/תקשוב/תחמושת)', { type: 'save_database' });
    setState({
      weaponsData: cleanedWeapons,
      opticsData: cleanedOptics,
      commsData: cleanedComms,
      ammoData: cleanedAmmo,
      cameraItemsTable: cleanedCameraItemsTable,
      dbSaveMessage: 'מסד הנתונים נשמר וסונכרן בהצלחה!'
    });
  } catch (e) {
    console.error(e);
    setState({ dbSaveMessage: 'שגיאה בשמירת מסד הנתונים.' });
  } finally {
    setState({ isSavingDb: false }); renderApp();
    setTimeout(() => { setState({ dbSaveMessage: '' }); renderApp(); }, 4000);
  }
}

async function handleSaveStock() {
  setState({ isSavingStock: true }); renderApp();
  try {
    await getSettingsRef().set({ totalStock: AppState.totalStock }, { merge: true });
    appendActivityLog('שמר את המלאי הכללי', { type: 'save_stock' });
    setState({ stockSaveMessage: 'המלאי הכללי נשמר בהצלחה!' });
  } catch (e) {
    console.error(e);
    setState({ stockSaveMessage: 'שגיאה בשמירת המלאי.' });
  } finally {
    setState({ isSavingStock: false }); renderApp();
    setTimeout(() => { setState({ stockSaveMessage: '' }); renderApp(); }, 4000);
  }
}

async function handleSaveSoldiers() {
  setState({ isSavingSoldiers: true }); renderApp();
  try {
    await getSettingsRef().set({ soldiers: AppState.soldiersData }, { merge: true });
    commitPendingActivity('soldiers');
    appendActivityLog('שמר את רשימת החיילים', { type: 'save_soldiers' });
    setState({ soldierSaveMessage: 'רשימת החיילים נשמרה בהצלחה!' });
  } catch (e) {
    console.error(e);
    setState({ soldierSaveMessage: 'שגיאה בשמירת רשימת החיילים.' });
  } finally {
    setState({ isSavingSoldiers: false }); renderApp();
    setTimeout(() => { setState({ soldierSaveMessage: '' }); renderApp(); }, 4000);
  }
}

async function handleSaveGeneralTable() {
  setState({ isSavingGeneralTable: true });
  renderApp();

  try {
    const source = AppState.generalTableAssignments || {};
    const cleaned = {};

    Object.keys(source).forEach((soldierKey) => {
      const row = source[soldierKey] || {};
      const amralType = String((row.amralType || '').trim());
      const amralSerial = String((row.amralSerial || '').trim());
      const commType = String((row.commType || '').trim());
      const commSerial = String((row.commSerial || '').trim());
      const multitoolType = String((row.multitoolType || '').trim());
      const multitoolSerial = String((row.multitoolSerial || '').trim());
      const fragGrenade1 = String((row.fragGrenade1 || row.fragGrenade || '').trim());
      const fragGrenade2 = String((row.fragGrenade2 || '').trim());

      if (!amralType && !amralSerial && !commType && !commSerial && !multitoolType && !multitoolSerial && !fragGrenade1 && !fragGrenade2) return;

      cleaned[soldierKey] = {
        amralType,
        amralSerial,
        commType,
        commSerial,
        multitoolType,
        multitoolSerial,
        fragGrenade1,
        fragGrenade2
      };
    });

    await getSettingsRef().set({ generalTableAssignments: cleaned }, { merge: true });
    commitPendingActivity('generalTable');
    appendActivityLog('שמר את הטבלה הכללית של הקצאות ציוד לחיילים', { type: 'save_general_table' });
    setState({
      generalTableAssignments: cleaned,
      generalTableSaveMessage: 'הטבלה הכללית נשמרה בהצלחה!'
    });
  } catch (e) {
    console.error(e);
    setState({ generalTableSaveMessage: 'שגיאה בשמירת הטבלה הכללית.' });
  } finally {
    setState({ isSavingGeneralTable: false });
    renderApp();
    setTimeout(() => { setState({ generalTableSaveMessage: '' }); renderApp(); }, 4000);
  }
}

async function handleSaveCategories() {
  setState({ isSavingCategories: true }); renderApp();
  try {
    const clean = (obj) => {
      const out = {};
      Object.keys(obj).forEach(k => { out[k] = obj[k].map(s => s.trim()).filter(s => s !== ''); });
      return out;
    };
    const cleaned = clean(AppState.inventoryCategories);
    await getSettingsRef().set({ categories: cleaned }, { merge: true });
    appendActivityLog('שמר את רשימת סוגי הפריטים', { type: 'save_categories' });
    setState({ inventoryCategories: cleaned, categoriesSaveMessage: 'סוגי הפריטים נשמרו בהצלחה!' });
  } catch (e) {
    console.error(e);
    setState({ categoriesSaveMessage: 'שגיאה בשמירת סוגי הפריטים.' });
  } finally {
    setState({ isSavingCategories: false }); renderApp();
    setTimeout(() => { setState({ categoriesSaveMessage: '' }); renderApp(); }, 4000);
  }
}
