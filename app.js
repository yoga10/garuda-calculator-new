// Garuda Indonesia Business Class Calculator

// Global variables
let routesDatabase = {
  "CGK - HND ECO PROMO": 28000,
  "CGK - HND ECO AFO/FLEX": 22400,
  "CGK - CAN ECO PROMO": 20000,
  "CGK - CAN ECO AFO/FLEX": 16000,
  "CGK - PVG ECO PROMO": 24000,
  "CGK - PVG ECO AFO/FLEX": 19200,
  "DPS - SYD ECO PROMO": 24000,
  "DPS - SYD ECO AFO/FLEX": 19200,
  "CGK - SYD ECO PROMO": 32000,
  "CGK - SYD ECO AFO/FLEX": 25600,
  "CGK - DPS ECO PROMO": 14100,
  "CGK - DPS ECO AFO/FLEX": 11200
};

let currentEditingRoute = '';

// DOM Elements - Calculator Page
const calculatorPage = document.getElementById('calculator-page');
const databasePage = document.getElementById('database-page');
const tripTypeSelect = document.getElementById('tripType');
const routeSelect = document.getElementById('route');
const milesInput = document.getElementById('miles');
const hargaNormalInput = document.getElementById('hargaNormal');
const pajakInput = document.getElementById('pajak');
const diskonInput = document.getElementById('diskon');
const hargaJualElement = document.getElementById('hargaJual');
const marginElement = document.getElementById('margin');
const persenMarginElement = document.getElementById('persenMargin');
const rateElement = document.getElementById('rate');
const transaksiElement = document.getElementById('transaksi');
const modalElement = document.getElementById('modal');
const resetBtn = document.getElementById('resetBtn');
const manageDbBtn = document.getElementById('manageDbBtn');

// DOM Elements - Database Page
const routesTableBody = document.getElementById('routesTableBody');
const newRouteNameInput = document.getElementById('newRouteName');
const newRouteMilesInput = document.getElementById('newRouteMiles');
const addRouteBtn = document.getElementById('addRouteBtn');
const backToCalculatorBtn = document.getElementById('backToCalculatorBtn');

// DOM Elements - Edit Modal
const editModal = document.getElementById('editModal');
const editRouteNameInput = document.getElementById('editRouteName');
const editRouteMilesInput = document.getElementById('editRouteMiles');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Initialize the application
function initApp() {
  // Populate routes dropdown
  populateRoutesDropdown();
  
  // Load data from session storage if available
  loadData();
  
  // Set up event listeners
  setupEventListeners();
  
  // Calculate initial values
  calculate();
}

// Event Listeners
function setupEventListeners() {
  // Calculator page events
  tripTypeSelect.addEventListener('change', handleTripTypeChange);
  routeSelect.addEventListener('change', handleRouteChange);
  hargaNormalInput.addEventListener('input', handleCurrencyInput);
  pajakInput.addEventListener('input', handleCurrencyInput);
  diskonInput.addEventListener('input', calculate);
  resetBtn.addEventListener('click', resetCalculator);
  manageDbBtn.addEventListener('click', switchToDatabase);
  
  // Database page events
  addRouteBtn.addEventListener('click', addNewRoute);
  backToCalculatorBtn.addEventListener('click', switchToCalculator);
  
  // Modal events
  closeModalBtn.addEventListener('click', closeModal);
  cancelEditBtn.addEventListener('click', closeModal);
  saveEditBtn.addEventListener('click', saveEditedRoute);
  
  // Format currency inputs on blur
  hargaNormalInput.addEventListener('blur', formatCurrencyOnBlur);
  pajakInput.addEventListener('blur', formatCurrencyOnBlur);
}

// Calculation functions
function calculate() {
  // Get input values
  const milesValue = milesInput.value.replace(/[^\d]/g, '');
  const miles = parseFloat(milesValue) || 0;
  const hargaNormal = parseCurrency(hargaNormalInput.value) || 0;
  const pajak = parseCurrency(pajakInput.value) || 0;
  const diskon = parseFloat(diskonInput.value) || 0;
  
  // Calculation logic as per requirements
  const transaksi = miles * 7500;
  const modal = transaksi * 0.0152;
  const hargaJual = hargaNormal - (hargaNormal * diskon / 100);
  const margin = hargaJual - (pajak + modal);
  const persenMargin = transaksi > 0 ? (margin / transaksi) * 100 : 0;
  const rate = miles > 0 ? (hargaJual - pajak) / miles : 0;
  
  // Update results
  hargaJualElement.textContent = formatCurrency(hargaJual);
  marginElement.textContent = formatCurrency(margin);
  persenMarginElement.textContent = formatPercentage(persenMargin);
  rateElement.textContent = formatNumber(rate);
  transaksiElement.textContent = formatCurrency(transaksi);
  modalElement.textContent = formatCurrency(modal);
  
  // Add status indicators
  updateStatusIndicators(margin, persenMargin);
}

function updateStatusIndicators(margin, persenMargin) {
  // Clear previous classes
  marginElement.className = 'result-value';
  persenMarginElement.className = 'result-value';
  
  // Set status classes based on values
  if (margin > 0) {
    marginElement.classList.add('status-positive');
  } else if (margin < 0) {
    marginElement.classList.add('status-negative');
  } else {
    marginElement.classList.add('status-neutral');
  }
  
  if (persenMargin > 0) {
    persenMarginElement.classList.add('status-positive');
  } else if (persenMargin < 0) {
    persenMarginElement.classList.add('status-negative');
  } else {
    persenMarginElement.classList.add('status-neutral');
  }
}

// Route related functions
function handleTripTypeChange() {
  updateMilesForCurrentRoute();
}

function handleRouteChange() {
  updateMilesForCurrentRoute();
}

function updateMilesForCurrentRoute() {
  const selectedRoute = routeSelect.value;
  if (selectedRoute && routesDatabase[selectedRoute]) {
    const baseMiles = routesDatabase[selectedRoute];
    const isRoundTrip = tripTypeSelect.value === 'roundtrip';
    const miles = isRoundTrip ? baseMiles * 2 : baseMiles;
    milesInput.value = formatNumber(miles);
    calculate();
  } else {
    milesInput.value = '';
    calculate();
  }
}

// Currency and formatting functions
function handleCurrencyInput(e) {
  const input = e.target;
  
  // Store cursor position
  let cursorPos = input.selectionStart;
  const originalLength = input.value.length;
  
  // Format value
  let value = input.value.replace(/[^\d]/g, '');
  
  // Format with commas for thousands
  if (value.length > 0) {
    value = parseInt(value, 10).toLocaleString('id-ID');
  }
  
  // Update input value
  input.value = value;
  
  // Adjust cursor position if needed
  const newLength = input.value.length;
  cursorPos = cursorPos + (newLength - originalLength);
  input.setSelectionRange(cursorPos, cursorPos);
  
  // Trigger calculation
  calculate();
}

function formatCurrencyOnBlur(e) {
  const input = e.target;
  const value = parseCurrency(input.value);
  if (!isNaN(value) && value > 0) {
    input.value = formatNumber(value);
  }
}

function formatCurrency(value) {
  return `Rp ${formatNumber(Math.round(value))}`;
}

function formatNumber(value) {
  if (value === 0) return '0';
  return Math.round(value).toLocaleString('id-ID');
}

function formatPercentage(value) {
  return value.toFixed(2) + '%';
}

function parseCurrency(value) {
  if (!value) return 0;
  return parseFloat(value.toString().replace(/[^\d]/g, '')) || 0;
}

// Page navigation
function switchToDatabase() {
  calculatorPage.classList.add('hidden');
  databasePage.classList.remove('hidden');
  renderRoutesTable();
}

function switchToCalculator() {
  databasePage.classList.add('hidden');
  calculatorPage.classList.remove('hidden');
  populateRoutesDropdown();
  
  // Re-calculate miles if route is selected
  if (routeSelect.value) {
    updateMilesForCurrentRoute();
  }
}

// Reset calculator
function resetCalculator() {
  tripTypeSelect.value = 'oneway';
  routeSelect.value = '';
  milesInput.value = '';
  hargaNormalInput.value = '';
  pajakInput.value = '';
  diskonInput.value = '';
  
  // Reset results
  hargaJualElement.textContent = 'Rp 0';
  marginElement.textContent = 'Rp 0';
  persenMarginElement.textContent = '0%';
  rateElement.textContent = '0';
  transaksiElement.textContent = 'Rp 0';
  modalElement.textContent = 'Rp 0';
  
  // Clear status indicators
  marginElement.className = 'result-value';
  persenMarginElement.className = 'result-value';
}

// Database management
function populateRoutesDropdown() {
  // Store current selection
  const currentSelection = routeSelect.value;
  
  // Clear existing options except the placeholder
  while (routeSelect.options.length > 1) {
    routeSelect.remove(1);
  }
  
  // Add route options from database
  Object.keys(routesDatabase).sort().forEach(routeName => {
    const option = document.createElement('option');
    option.value = routeName;
    option.textContent = routeName;
    routeSelect.appendChild(option);
  });
  
  // Restore selection if it still exists
  if (currentSelection && routesDatabase[currentSelection]) {
    routeSelect.value = currentSelection;
  }
}

function renderRoutesTable() {
  // Clear table
  routesTableBody.innerHTML = '';
  
  // Add routes to table
  Object.entries(routesDatabase).sort((a, b) => a[0].localeCompare(b[0])).forEach(([routeName, miles]) => {
    const row = document.createElement('tr');
    
    const nameCell = document.createElement('td');
    nameCell.textContent = routeName;
    
    const milesCell = document.createElement('td');
    milesCell.textContent = formatNumber(miles);
    
    const actionsCell = document.createElement('td');
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'action-btn edit-btn';
    editBtn.addEventListener('click', () => openEditModal(routeName));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.addEventListener('click', () => deleteRoute(routeName));
    
    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
    
    row.appendChild(nameCell);
    row.appendChild(milesCell);
    row.appendChild(actionsCell);
    
    routesTableBody.appendChild(row);
  });
}

function addNewRoute() {
  const routeName = newRouteNameInput.value.trim();
  const miles = parseInt(newRouteMilesInput.value);
  
  if (!routeName) {
    alert('Nama rute tidak boleh kosong');
    return;
  }
  
  if (isNaN(miles) || miles <= 0) {
    alert('Miles harus berupa angka positif');
    return;
  }
  
  if (routesDatabase[routeName]) {
    alert('Rute dengan nama tersebut sudah ada');
    return;
  }
  
  // Add route to database
  routesDatabase[routeName] = miles;
  
  // Clear form
  newRouteNameInput.value = '';
  newRouteMilesInput.value = '';
  
  // Re-render table
  renderRoutesTable();
  
  // Save data
  saveData();
}

function deleteRoute(routeName) {
  if (confirm(`Apakah Anda yakin ingin menghapus rute "${routeName}"?`)) {
    delete routesDatabase[routeName];
    renderRoutesTable();
    saveData();
  }
}

// Modal functions
function openEditModal(routeName) {
  currentEditingRoute = routeName;
  editRouteNameInput.value = routeName;
  editRouteMilesInput.value = routesDatabase[routeName];
  editModal.classList.remove('hidden');
}

function closeModal() {
  editModal.classList.add('hidden');
  currentEditingRoute = '';
}

function saveEditedRoute() {
  const newRouteName = editRouteNameInput.value.trim();
  const miles = parseInt(editRouteMilesInput.value);
  
  if (!newRouteName) {
    alert('Nama rute tidak boleh kosong');
    return;
  }
  
  if (isNaN(miles) || miles <= 0) {
    alert('Miles harus berupa angka positif');
    return;
  }
  
  // If name changed, check if new name already exists
  if (newRouteName !== currentEditingRoute && routesDatabase[newRouteName]) {
    alert('Rute dengan nama tersebut sudah ada');
    return;
  }
  
  // Update or rename route
  if (newRouteName !== currentEditingRoute) {
    delete routesDatabase[currentEditingRoute];
  }
  routesDatabase[newRouteName] = miles;
  
  // Close modal
  closeModal();
  
  // Re-render table
  renderRoutesTable();
  
  // Save data
  saveData();
}

// Data persistence
function saveData() {
  try {
    sessionStorage.setItem('routesDatabase', JSON.stringify(routesDatabase));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

function loadData() {
  try {
    const savedData = sessionStorage.getItem('routesDatabase');
    if (savedData) {
      const loadedData = JSON.parse(savedData);
      // Merge with default data to ensure all default routes exist
      routesDatabase = { ...routesDatabase, ...loadedData };
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);