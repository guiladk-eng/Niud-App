// ===== state.js =====
// מצב גלובלי של האפליקציה (מחליף את useState של React)

const AppState = {
  // Auth
  user: null,
  isAuthReady: false,
  authError: '',
  authErrorCode: '',
  isAuthenticated: false,
  loggedInAdmin: '',
  loginUsername: '',
  loginPassword: '',
  loginError: '',

  // Active tab
  activeTab: 'home',

  // Soldier form
  soldierName: '',
  personalNumber: '',
  formSearchTerm: '',
  isFormDropdownOpen: false,

  // Dashboard
  selectedSoldier: '',
  dashboardSearchTerm: '',
  isDashboardDropdownOpen: false,
  soldiersSearchTerm: '',

  // Data lists (loaded from Firebase or defaults)
  inventoryCategories: {},
  weaponsData: {},
  opticsData: {},
  commsData: {},
  ammoData: {},
  totalStock: {},
  soldiersData: [],

  // Cart (equipment for current soldier)
  cart: {},
  originalCart: {},
  selectedWeaponType: '',
  selectedWeaponSerial: '',
  cartWeapons: [],
  originalWeapons: [],
  selectedOpticType: '',
  selectedOpticSerial: '',
  cartOptics: [],
  originalOptics: [],
  selectedCommType: '',
  selectedCommSerial: '',
  cartComms: [],
  originalComms: [],

  // Firestore data
  submissionHistory: [],
  activityLog: [],
  pendingActivityLog: [],
  inventoryTotals: {},
  isLoadingData: true,

  // Save states
  isSubmitting: false,
  submitMessage: '',
  isSavingDb: false,
  dbSaveMessage: '',
  dbExpandedTypes: {},
  dbNewSerialInputs: {},
  cameraItemsTable: [],
  dbCameraNewItem: { civilMilitary: '', marking: '', medium: '', serial: '' },
  isSavingStock: false,
  stockSaveMessage: '',
  isSavingSoldiers: false,
  soldierSaveMessage: '',
  isSavingGeneralTable: false,
  generalTableSaveMessage: '',
  generalTableNotice: '',
  isSavingCategories: false,
  categoriesSaveMessage: '',
  historyNoteText: '',
  historyAttachmentName: '',
  historyAttachmentDataUrl: '',
  historyAttachmentError: '',
  historyViewerAttachmentName: '',
  historyViewerAttachmentDataUrl: '',
  generalTableAssignments: {},
  generalTableFilters: { amral: '', comm: '', multitool: '', frag: '', weaponType: '', weaponSerial: '' },
  generalTableSearchTerm: '',
  generalTableHideWeaponColumns: true,
  generalTableSelectedTeams: [],

  // New soldier form
  newSoldier: { name: '', id: '', department: '', isMaplag: false }
};

// Simple reactive system: call render() after any state change
function setState(updates) {
  Object.assign(AppState, updates);
}
