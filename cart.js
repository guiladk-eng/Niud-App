// ===== cart.js =====
// ניהול עגלת הציוד - מעודכן לגרסה החדשה

function handleQuantityChange(itemName, newQuantity) {
  const val = Math.max(0, parseInt(newQuantity) || 0);
  setState({ cart: { ...AppState.cart, [itemName]: val } });
  renderApp();
}

function handleIncrement(itemName) {
  setState({ cart: { ...AppState.cart, [itemName]: (AppState.cart[itemName] || 0) + 1 } });
  renderApp();
}

function handleDecrement(itemName) {
  const current = AppState.cart[itemName] || 0;
  if (current <= 0) return;
  setState({ cart: { ...AppState.cart, [itemName]: current - 1 } });
  renderApp();
}

// Weapons
function handleAddWeapon() {
  const { selectedWeaponType, selectedWeaponSerial, cartWeapons } = AppState;
  if (selectedWeaponType && selectedWeaponSerial) {
    if (!cartWeapons.find(w => w.type === selectedWeaponType && w.serial === selectedWeaponSerial)) {
      setState({ cartWeapons: [...cartWeapons, { type: selectedWeaponType, serial: selectedWeaponSerial }] });
    }
    setState({ selectedWeaponType: '', selectedWeaponSerial: '' });
    renderApp();
  }
}

function handleRemoveWeapon(indexToRemove) {
  setState({ cartWeapons: AppState.cartWeapons.filter((_, i) => i !== indexToRemove) });
  renderApp();
}

// Optics
function handleAddOptic() {
  const { selectedOpticType, selectedOpticSerial, cartOptics } = AppState;
  if (selectedOpticType && selectedOpticSerial) {
    if (!cartOptics.find(o => o.type === selectedOpticType && o.serial === selectedOpticSerial)) {
      setState({ cartOptics: [...cartOptics, { type: selectedOpticType, serial: selectedOpticSerial }] });
    }
    setState({ selectedOpticType: '', selectedOpticSerial: '' });
    renderApp();
  }
}

function handleRemoveOptic(indexToRemove) {
  setState({ cartOptics: AppState.cartOptics.filter((_, i) => i !== indexToRemove) });
  renderApp();
}

// Comms
function handleAddComm() {
  const { selectedCommType, selectedCommSerial, cartComms } = AppState;
  if (selectedCommType && selectedCommSerial) {
    if (!cartComms.find(c => c.type === selectedCommType && c.serial === selectedCommSerial)) {
      setState({ cartComms: [...cartComms, { type: selectedCommType, serial: selectedCommSerial }] });
    }
    setState({ selectedCommType: '', selectedCommSerial: '' });
    renderApp();
  }
}

function handleRemoveComm(indexToRemove) {
  setState({ cartComms: AppState.cartComms.filter((_, i) => i !== indexToRemove) });
  renderApp();
}

function getTotalItemsInCart() {
  const { cart, cartWeapons, cartOptics, cartComms } = AppState;
  return Object.values(cart).reduce((s, q) => s + q, 0) +
    cartWeapons.length + cartOptics.length + cartComms.length;
}
