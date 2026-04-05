// ===== render.js =====
// מנוע רינדור מרכזי - מעודכן לגרסה החדשה

function escH(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderApp() {
  const root = document.getElementById('app');
  if (!root) return;

  const { user, isAuthenticated, isAuthReady, authError, authErrorCode } = AppState;

  if (!user) {
    const authErrorHtml = authError ? `
      <div class="mt-4 max-w-md bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
        <div class="font-bold mb-1">שגיאת התחברות ל-Firebase</div>
        <div>${escH(authError)}</div>
        ${authErrorCode ? `<div class="mt-1 text-xs text-red-600">code: ${escH(authErrorCode)}</div>` : ''}
      </div>` : '';

    root.innerHTML = `
      <div class="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800 font-sans" dir="rtl">
        <div class="text-center">
          <div class="text-xl font-medium ${authError ? '' : 'animate-pulse'}">
            ${isAuthReady ? 'אין משתמש מחובר' : 'מתחבר למערכת...'}
          </div>
          ${authErrorHtml}
        </div>
      </div>`;
    return;
  }

  if (!isAuthenticated) {
    root.innerHTML = renderLoginScreen();
    return;
  }

  root.innerHTML = renderMainApp();
}

// ─── Login Screen ─────────────────────────────────────────────────────────
function renderLoginScreen() {
  const { loginUsername, loginPassword, loginError } = AppState;
  return `
  <div class="flex items-center justify-center min-h-screen bg-slate-100 font-sans text-slate-800 px-4" dir="rtl">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
      <div class="flex justify-center mb-6">
        <div class="px-4 py-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold tracking-wide">NIUD</div>
      </div>
      <h2 class="text-2xl font-bold text-center mb-2 text-slate-800">ניהול לוגיסטיקה ניוד</h2>
      <p class="text-center text-slate-500 mb-8 text-sm">אנא הזן את פרטיך האישיים כדי להמשיך</p>

      ${loginError ? `<div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold border border-red-100 mb-4">${escH(loginError)}</div>` : ''}

      <div class="space-y-5">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">שם פרטי</label>
          <input type="text" autocomplete="off"
            value="${escH(loginUsername)}"
            placeholder="לדוגמה: ברק"
            oninput="setState({loginUsername:this.value})"
            onkeydown="if(event.key==='Enter')handleLogin(event)"
            class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"/>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">סיסמה (מספר אישי)</label>
          <input type="password" inputmode="numeric" autocomplete="new-password"
            value="${escH(loginPassword)}"
            placeholder="הזן מספר אישי"
            oninput="setState({loginPassword:this.value})"
            onkeydown="if(event.key==='Enter')handleLogin(event)"
            class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"/>
        </div>
        <button onclick="handleLogin(event)"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl mt-6 shadow-md hover:shadow-lg transition-all">
          כניסה למערכת
        </button>
      </div>
    </div>
  </div>`;
}

// ─── Main App ──────────────────────────────────────────────────────────────
function renderMainApp() {
  const { activeTab, loggedInAdmin, submitMessage } = AppState;

  const tabs = [
    { id: 'home',       label: 'דף הבית',               icon: 'home'      },
    { id: 'history',    label: 'היסטוריה',              icon: 'clock'     },
    { id: 'signatures', label: 'החתמות',                icon: 'cart'      },
    { id: 'reports',    label: 'דוחות',                 icon: 'file'      },
    { id: 'inventory',  label: 'ניהול מלאי',            icon: 'package'   },
    { id: 'categories', label: 'ניהול פריטים',          icon: 'tags'      },
    { id: 'rasmatz',   label: 'רשמ"צ',                 icon: 'list'      },
    { id: 'soldiers',   label: 'ניהול חיילים',          icon: 'users'     },
    { id: 'generalTable', label: 'טבלה כללית',          icon: 'table'     },
    { id: 'database',   label: 'ניהול צלמים',           icon: 'database'  },
  ];

  const icons = {
    home:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10.5l9-7 9 7M5 9.5V20h5v-6h4v6h5V9.5"/>`,
    clock:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6 0a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    cart:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>`,
    chart:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>`,
    file:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M9 8h2m5 12H8a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V18a2 2 0 01-2 2z"/>`,
    package:  `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>`,
    tags:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>`,
    list:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5h11M9 12h11M9 19h11M4 5h.01M4 12h.01M4 19h.01"/>`,
    users:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>`,
    table:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18M7 3v18M13 3v18M18 3v18"/>`,
    database: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>`,
  };

  let tabContent = '';
  if (activeTab === 'home')            tabContent = renderHomeTab();
  else if (activeTab === 'history')    tabContent = renderHistoryTab();
  else if (activeTab === 'signatures') tabContent = renderSignaturesTab();
  else if (activeTab === 'reports')    tabContent = renderReportsTab();
  else if (activeTab === 'inventory')  tabContent = renderInventoryTab();
  else if (activeTab === 'categories') tabContent = renderCategoriesTab();
  else if (activeTab === 'rasmatz')    tabContent = renderRasmatzTab();
  else if (activeTab === 'soldiers')   tabContent = renderSoldiersTab();
  else if (activeTab === 'generalTable') tabContent = renderGeneralTableTab();
  else if (activeTab === 'database')   tabContent = renderDatabaseTab();
  else tabContent = renderHomeTab();

  // submitMessage color: orange for errors/no-changes, green for success (matches source)
  const msgHtml = submitMessage ? `
    <div class="p-4 mb-6 rounded-lg font-medium shadow-sm ${
      submitMessage.includes('שגיאה') || submitMessage.includes('לא בוצעו')
        ? 'bg-orange-100 text-orange-800'
        : 'bg-green-100 text-green-700'
    }">
      ${escH(submitMessage)}
    </div>` : '';

  return `
  <div class="min-h-screen bg-gray-50 font-sans text-slate-800 pb-20" dir="rtl">

    <!-- Header: bg-blue-700, max-w-4xl (matches source exactly) -->
    <header class="bg-blue-700 text-white shadow-md sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            ניהול לוגיסטיקה ניוד
          </h1>
          <div class="bg-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-600">
            מחובר כ: ${escH(loggedInAdmin)}
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-6">
          <nav id="app-tabs-nav"
            class="flex flex-wrap gap-2 sm:gap-4 pb-1">
            ${tabs.map(tab => `
            <button onclick="setActiveTab('${tab.id}')"
              class="pb-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[tab.icon]}</svg>
              ${tab.label}
            </button>`).join('')}
          </nav>
        </div>
      </div>
    </header>

    <!-- Main content: max-w-4xl (matches source) -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      ${msgHtml}
      ${tabContent}
    </main>
  </div>`;
}

function setActiveTab(tab) {
  if (tab === 'form') tab = 'signatures';
  if (tab === 'dashboard') tab = 'home';
  setState({ activeTab: tab });
  renderApp();
}

function getTabsNavOverflowState(nav) {
  if (!nav) return { hasOverflow: false, canScrollStart: false, canScrollEnd: false };
  const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
  const rawLeft = Number(nav.scrollLeft) || 0;
  const absLeft = Math.max(Math.abs(rawLeft), rawLeft);
  const left = Math.min(maxScroll, absLeft);
  const hasOverflow = maxScroll > 2;
  const canScrollStart = hasOverflow && left > 2;
  const canScrollEnd = hasOverflow && left < (maxScroll - 2);
  return { hasOverflow, canScrollStart, canScrollEnd };
}

function updateTabsNavIndicators(nav) {
  const hint = document.getElementById('app-tabs-scroll-hint');
  const startIndicator = document.getElementById('app-tabs-indicator-start');
  const endIndicator = document.getElementById('app-tabs-indicator-end');
  const hiddenStartEl = document.getElementById('app-tabs-hidden-start');
  const hiddenEndEl = document.getElementById('app-tabs-hidden-end');
  if (!hint || !startIndicator || !endIndicator || !hiddenStartEl || !hiddenEndEl) return;
  const { hasOverflow, canScrollStart, canScrollEnd } = getTabsNavOverflowState(nav);
  if (!hasOverflow) {
    hint.classList.add('hidden');
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const buttons = Array.from(nav.querySelectorAll('button'));
  const hiddenOnRight = [];
  const hiddenOnLeft = [];
  buttons.forEach((btn) => {
    const r = btn.getBoundingClientRect();
    const label = (btn.textContent || '').trim();
    if (!label) return;
    if (r.right > navRect.right + 1) hiddenOnRight.push(label);
    if (r.left < navRect.left - 1) hiddenOnLeft.push(label);
  });

  const formatHiddenTabs = (arr) => {
    const unique = Array.from(new Set(arr));
    if (unique.length === 0) return '';
    const shown = unique.slice(0, 2).join(' • ');
    return unique.length > 2 ? `${shown}…` : shown;
  };

  hiddenStartEl.textContent = formatHiddenTabs(hiddenOnRight);
  hiddenEndEl.textContent = formatHiddenTabs(hiddenOnLeft);

  hint.classList.remove('hidden');
  startIndicator.style.opacity = canScrollStart ? '1' : '0.35';
  endIndicator.style.opacity = canScrollEnd ? '1' : '0.35';
}

function handleTabsNavScroll(nav) {
  if (!nav) return;
  window.__tabsNavScrollLeft = nav.scrollLeft;
  updateTabsNavIndicators(nav);
}

function restoreTabsNavScrollPosition() {
  const nav = document.getElementById('app-tabs-nav');
  if (!nav) return;
  const saved = Number(window.__tabsNavScrollLeft || 0);
  const apply = () => {
    nav.scrollLeft = saved;
    updateTabsNavIndicators(nav);
  };
  apply();
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(apply);
}
