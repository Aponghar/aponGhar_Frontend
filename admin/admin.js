// API Configuration is loaded from config.js
// const BASE_URL = API_BASE_URL + '/admin';
// const ASSET_BASE_URL already defined in config.js
const BASE_URL = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/admin';
const IMAGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><rect width='100%' height='100%' fill='%23f3f4f6'/><g fill='%239ca3af' transform='translate(180, 110) scale(1.5)'><path d='M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.12-1.12A1 1 0 0010.586 3H7.414a1 1 0 00-.707.293L5.586 4.707A1 1 0 014.88 5H4zM10 8a3 3 0 100 6 3 3 0 000-6z'/></g></svg>";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  const path = String(imagePath).trim();
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "").replace(/\\/g, "/");
  return `${ASSET_BASE_URL}/${normalizedPath}`;
};



// AUTH
const token =
localStorage.getItem("token");

const user =
JSON.parse(localStorage.getItem("user"));



// ELEMENTS
const applicationsContainer =
document.getElementById(
  "applicationsContainer"
);

const applicationsTab =
document.getElementById(
  "applicationsTab"
);

const ownersTab =
document.getElementById(
  "ownersTab"
);

const pageTitle =
document.getElementById(
  "pageTitle"
);

const propertiesTab =
document.getElementById(
  "propertiesTab"
);

const allPropertiesTab =
document.getElementById(
  "allPropertiesTab"
);

const checkinsTab =
document.getElementById(
  "checkinsTab"
);

const earningsTab =
document.getElementById(
  "earningsTab"
);

const commissionRequestsTab =
document.getElementById(
  "commissionRequestsTab"
);

const commissionRequestsContainer =
document.getElementById(
  "commissionRequestsContainer"
);

const earningsContainer =
document.getElementById(
  "earningsContainer"
);

const withdrawalsTab =
document.getElementById(
  "withdrawalsTab"
);

const withdrawalsContainer =
document.getElementById(
  "withdrawalsContainer"
);

const adminWithdrawalsList =
document.getElementById(
  "adminWithdrawalsList"
);

const walletTab =
document.getElementById(
  "walletTab"
);

const walletContainer =
document.getElementById(
  "walletContainer"
);

const creditWalletForm =
document.getElementById(
  "creditWalletForm"
);

const walletMessage =
document.getElementById(
  "walletMessage"
);

const walletHistoryList =
document.getElementById(
  "walletHistoryList"
);

// COUPON DOM SELECTORS
const couponsTab = document.getElementById("couponsTab");
const couponsContainer = document.getElementById("couponsContainer");
const couponsList = document.getElementById("couponsList");
const couponListCount = document.getElementById("couponListCount");
const couponFormMessage = document.getElementById("couponFormMessage");

// ADVERTISEMENT DOM SELECTORS
const adsTab = document.getElementById("adsTab");
const adsContainer = document.getElementById("adsContainer");
const adForm = document.getElementById("adForm");
const adsList = document.getElementById("adsList");
const adListCount = document.getElementById("adListCount");
const adFormMessage = document.getElementById("adFormMessage");

let couponsLoaded = false;
let adminCouponsCache = [];
let adsLoaded = false;
let adminAdsCache = [];

const showApplicationsContainer = () => {
  applicationsContainer.style.display = "";
  commissionRequestsContainer.style.display = "none";
  withdrawalsContainer.style.display = "none";
  walletContainer.style.display = "none";
  couponsContainer.style.display = "none";
  adsContainer.style.display = "none";
  earningsContainer.style.display = "none";
};

const showCommissionRequestsContainer = () => {
  applicationsContainer.style.display = "none";
  commissionRequestsContainer.style.display = "block";
  withdrawalsContainer.style.display = "none";
  walletContainer.style.display = "none";
  couponsContainer.style.display = "none";
  adsContainer.style.display = "none";
  earningsContainer.style.display = "none";
};

const showWithdrawalsContainer = () => {
  applicationsContainer.style.display = "none";
  commissionRequestsContainer.style.display = "none";
  withdrawalsContainer.style.display = "";
  walletContainer.style.display = "none";
  couponsContainer.style.display = "none";
  adsContainer.style.display = "none";
  earningsContainer.style.display = "none";
};

const showWalletContainer = () => {
  applicationsContainer.style.display = "none";
  commissionRequestsContainer.style.display = "none";
  withdrawalsContainer.style.display = "none";
  walletContainer.style.display = "block";
  couponsContainer.style.display = "none";
  adsContainer.style.display = "none";
  earningsContainer.style.display = "none";
};

const showCouponsContainer = () => {
  applicationsContainer.style.display = "none";
  commissionRequestsContainer.style.display = "none";
  withdrawalsContainer.style.display = "none";
  walletContainer.style.display = "none";
  couponsContainer.style.display = "grid";
  adsContainer.style.display = "none";
  earningsContainer.style.display = "none";
};

const showAdsContainer = () => {
  applicationsContainer.style.display = "none";
  commissionRequestsContainer.style.display = "none";
  withdrawalsContainer.style.display = "none";
  walletContainer.style.display = "none";
  couponsContainer.style.display = "none";
  adsContainer.style.display = "grid";
  earningsContainer.style.display = "none";
};

const showEarningsContainer = () => {
  applicationsContainer.style.display = "none";
  commissionRequestsContainer.style.display = "none";
  withdrawalsContainer.style.display = "none";
  walletContainer.style.display = "none";
  couponsContainer.style.display = "none";
  adsContainer.style.display = "none";
  earningsContainer.style.display = "block";
};

const removeAllTabStates = () => {
  [
    applicationsTab,
    ownersTab,
    propertiesTab,
    allPropertiesTab,
    checkinsTab,
    earningsTab,
    commissionRequestsTab,
    withdrawalsTab,
    walletTab,
    couponsTab,
    adsTab
  ].forEach((tab) => {
    if (tab) tab.classList.remove("active");
  });
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => `INR ${toNumber(value).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const escapeHTML = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

let adminPropertiesCache = [];

// GLOBAL SEARCH CACHES & CONTROLLERS
let currentApplicationsList = [];
let currentOwnersList = [];
let currentPendingPropertiesList = [];
let currentAllPropertiesList = [];
let currentCheckInsList = [];
let currentEarningsSummary = {};
let currentCommissionsList = [];
let currentEarningsPropertyId = "";
let currentRequestsCommissionsList = [];
let currentRequestsPropertyId = "";
let currentWithdrawalsList = [];

let activeSearchTab = "";

function setupSearch(tabName, placeholder) {
  const searchWrapper = document.getElementById("adminSearchWrapper");
  const searchInput = document.getElementById("adminSearchInput");
  const clearBtn = document.getElementById("adminSearchClear");
  
  if (!searchWrapper || !searchInput) return;
  
  if (tabName === "Wallet") {
    searchWrapper.style.display = "none";
    activeSearchTab = "";
    return;
  }
  
  searchWrapper.style.display = "flex";
  searchInput.placeholder = placeholder;
  searchInput.value = "";
  if (clearBtn) clearBtn.style.display = "none";
  activeSearchTab = tabName;
}

function clearAdminSearch() {
  const searchInput = document.getElementById("adminSearchInput");
  if (searchInput) {
    searchInput.value = "";
    handleAdminSearch("");
  }
}

function handleAdminSearch(query) {
  const clearBtn = document.getElementById("adminSearchClear");
  if (clearBtn) {
    clearBtn.style.display = query.trim() ? "inline" : "none";
  }
  
  const q = query.toLowerCase().trim();
  if (!activeSearchTab) return;
  
  switch(activeSearchTab) {
    case "Applications": {
      const filtered = currentApplicationsList.filter(app => 
        (app.property_name && app.property_name.toLowerCase().includes(q)) ||
        (app.owner_name && app.owner_name.toLowerCase().includes(q)) ||
        (app.property_type && app.property_type.toLowerCase().includes(q)) ||
        (app.location && app.location.toLowerCase().includes(q)) ||
        (app.contact_number && app.contact_number.toLowerCase().includes(q))
      );
      renderApplications(filtered);
      break;
    }
    case "Owners": {
      const filtered = currentOwnersList.filter(owner => 
        (owner.property_name && owner.property_name.toLowerCase().includes(q)) ||
        (owner.owner_name && owner.owner_name.toLowerCase().includes(q)) ||
        (owner.email && owner.email.toLowerCase().includes(q)) ||
        (owner.location && owner.location.toLowerCase().includes(q))
      );
      renderOwners(filtered);
      break;
    }
    case "PendingProperties": {
      const filtered = currentPendingPropertiesList.filter(p => 
        (p.property_name && p.property_name.toLowerCase().includes(q)) ||
        (p.owner_name && p.owner_name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.state && p.state.toLowerCase().includes(q))
      );
      renderPendingProperties(filtered);
      break;
    }
    case "Properties": {
      const filtered = currentAllPropertiesList.filter(p => 
        (p.property_name && p.property_name.toLowerCase().includes(q)) ||
        (p.property_type && p.property_type.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.state && p.state.toLowerCase().includes(q)) ||
        (p.country && p.country.toLowerCase().includes(q)) ||
        (p.approval_status && p.approval_status.toLowerCase().includes(q))
      );
      renderAllProperties(filtered);
      break;
    }
    case "Checkins": {
      const filtered = currentCheckInsList.filter(c => 
        (c.property_name && c.property_name.toLowerCase().includes(q)) ||
        (c.booking_code && c.booking_code.toLowerCase().includes(q)) ||
        (c.guest_name && c.guest_name.toLowerCase().includes(q)) ||
        (c.user_email && c.user_email.toLowerCase().includes(q)) ||
        (c.owner_name && c.owner_name.toLowerCase().includes(q))
      );
      renderPendingCheckIns(filtered);
      break;
    }
    case "Earnings": {
      const filtered = currentCommissionsList.filter(c => 
        (c.property_name && c.property_name.toLowerCase().includes(q)) ||
        (c.booking_code && c.booking_code.toLowerCase().includes(q)) ||
        (c.guest_name && c.guest_name.toLowerCase().includes(q)) ||
        (c.owner_name && c.owner_name.toLowerCase().includes(q)) ||
        (c.payment_status && c.payment_status.toLowerCase().includes(q))
      );
      renderEarnings(currentEarningsSummary, filtered, currentEarningsPropertyId);
      break;
    }
    case "Requests": {
      const filtered = currentRequestsCommissionsList.filter(c => 
        (c.property_name && c.property_name.toLowerCase().includes(q)) ||
        (c.booking_code && c.booking_code.toLowerCase().includes(q)) ||
        (c.guest_name && c.guest_name.toLowerCase().includes(q)) ||
        (c.owner_name && c.owner_name.toLowerCase().includes(q)) ||
        (c.payment_status && c.payment_status.toLowerCase().includes(q))
      );
      renderCommissionRequests(filtered, currentRequestsPropertyId);
      break;
    }
    case "Withdrawals": {
      const filtered = currentWithdrawalsList.filter(w => 
        (w.owner_name && w.owner_name.toLowerCase().includes(q)) ||
        (w.account_holder_name && w.account_holder_name.toLowerCase().includes(q)) ||
        (w.upi_id && w.upi_id.toLowerCase().includes(q)) ||
        (w.bank_name && w.bank_name.toLowerCase().includes(q)) ||
        (w.account_number && w.account_number.toLowerCase().includes(q)) ||
        (w.withdrawal_status && w.withdrawal_status.toLowerCase().includes(q))
      );
      renderWithdrawals(filtered);
      break;
    }
    case "Coupons": {
      const filtered = adminCouponsCache.filter(c => 
        (c.coupon_code && c.coupon_code.toLowerCase().includes(q)) ||
        (c.discount_type && c.discount_type.toLowerCase().includes(q)) ||
        (c.computed_status && c.computed_status.toLowerCase().includes(q))
      );
      renderCouponsList(filtered);
      break;
    }
    case "Banners": {
      const filtered = adminAdsCache.filter(ad => 
        (ad.redirect_url && ad.redirect_url.toLowerCase().includes(q))
      );
      renderAdsList(filtered);
      break;
    }
  }
}

window.handleAdminSearch = handleAdminSearch;
window.clearAdminSearch = clearAdminSearch;


// PROTECT PAGE
if(
  !token
  ||
  !user
  ||
  user.role !== "ADMIN"
){

  window.location.href =
  "../index.html";
}




// LOAD PENDING APPLICATIONS
async function loadApplications(){

  try {

    showApplicationsContainer();
    setupSearch("Applications", "Search applications by name, owner, location...");

    const res = await fetch(

      `${BASE_URL}/owner-applications`,

      {
        headers:{
          "Authorization":
          `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log(
      "APPLICATIONS:",
      data
    );

    currentApplicationsList = data.data || [];
    renderApplications(currentApplicationsList);

  } catch (error) {

    console.error(error);

    alert(
      "Failed to load applications"
    );
  }
}

function renderApplications(applications) {
  applicationsContainer.innerHTML = "";

  if(applications.length === 0){

    applicationsContainer.innerHTML = `

      <h2>
        No Applications Found
      </h2>
    `;

    return;
  }

  applications.forEach(app => {

    applicationsContainer.innerHTML += `

      <div class="card">

        <h3>
          ${app.property_name}
        </h3>

        <p>
          <strong>Owner:</strong>
          ${app.owner_name}
        </p>

        <p>
          <strong>Type:</strong>
          ${app.property_type}
        </p>

        <p>
          <strong>Location:</strong>
          ${app.location}
        </p>

        <p>
          <strong>Area:</strong>
          ${app.area}
        </p>

        <p>
          <strong>Contact:</strong>
          ${app.contact_number}
        </p>

        <p>
          <strong>Description:</strong>
          ${app.description}
        </p>

        <span class="status
          ${(
            app.status
            ||
            "PENDING"
          ).toLowerCase()}">

          ${
            app.status
            ||
            "PENDING"
          }

        </span>

        ${
          (
            app.status
            ||
            "PENDING"
          ) === "PENDING"

          ?

          `
          <div class="actions">

            <button
              class="approveBtn"
              onclick="approveApplication(${app.id})"
            >
              Approve
            </button>

            <button
              class="rejectBtn"
              onclick="rejectApplication(${app.id})"
            >
              Reject
            </button>

          </div>
          `

          :

          ""
        }

      </div>
    `;
  });
}




// LOAD APPROVED OWNERS
async function loadOwners(){

  try {

    showApplicationsContainer();
    setupSearch("Owners", "Search owners by name, email, property...");

    const res = await fetch(

      `${BASE_URL}/owners`,

      {
        headers:{
          "Authorization":
          `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log(
      "OWNERS:",
      data
    );

    currentOwnersList = data.data || [];
    renderOwners(currentOwnersList);

  } catch (error) {

    console.error(error);

    alert(
      "Failed to load owners"
    );
  }
}

function renderOwners(owners) {
  applicationsContainer.innerHTML = "";

  if(owners.length === 0){

    applicationsContainer.innerHTML = `

      <h2>
        No Approved Owners
      </h2>
    `;

    return;
  }

  owners.forEach(owner => {

    applicationsContainer.innerHTML += `

      <div class="card">

        <h3>
          ${owner.property_name}
        </h3>

        <p>
          <strong>Owner:</strong>
          ${owner.owner_name}
        </p>

        <p>
          <strong>Email:</strong>
          ${owner.email}
        </p>

        <p>
          <strong>Type:</strong>
          ${owner.property_type}
        </p>

        <p>
          <strong>Location:</strong>
          ${owner.location}
        </p>

        <p>
          <strong>Area:</strong>
          ${owner.area}
        </p>

        <span class="status approved">

          APPROVED

        </span>

      </div>
    `;
  });
}




// APPROVE APPLICATION
async function approveApplication(id){

  try {

    const res = await fetch(

      `${BASE_URL}/owner-applications/approve/${id}`,

      {
        method:"PATCH",

        headers:{
          "Content-Type":
          "application/json",

          "Authorization":
          `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log(data);

    alert(
      "Application Approved"
    );

    loadApplications();

  } catch (error) {

    console.error(error);

    alert(
      "Approval failed"
    );
  }
}




// REJECT APPLICATION
async function rejectApplication(id){

  try {

    const res = await fetch(

      `${BASE_URL}/owner-applications/reject/${id}`,

      {
        method:"PATCH",

        headers:{
          "Content-Type":
          "application/json",

          "Authorization":
          `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log(data);

    alert(
      "Application Rejected"
    );

    loadApplications();

  } catch (error) {

    console.error(error);

    alert(
      "Reject failed"
    );
  }
}




// APPLICATION TAB
applicationsTab.addEventListener(
  "click",
  () => {

    removeAllTabStates();

    pageTitle.innerText =
    "Owner Applications";

    applicationsTab.classList.add(
      "active"
    );

    ownersTab.classList.remove(
      "active"
    );

    loadApplications();
});




// OWNERS TAB
ownersTab.addEventListener(
  "click",
  () => {

    removeAllTabStates();

    pageTitle.innerText =
    "Owners";

    ownersTab.classList.add(
      "active"
    );

    applicationsTab.classList.remove(
      "active"
    );

    loadOwners();
});

propertiesTab.addEventListener(
  "click",
  () => {

    removeAllTabStates();

    pageTitle.innerText =
    "Pending Properties";

    propertiesTab.classList.add(
      "active"
    );

    applicationsTab.classList.remove(
      "active"
    );

    ownersTab.classList.remove(
      "active"
    );

    loadPendingProperties();
});



async function loadPendingProperties(){

  try {

    showApplicationsContainer();
    setupSearch("PendingProperties", "Search pending properties by name, owner, email...");

    const res = await fetch(

      `${BASE_URL}/properties/pending`,

      {
        headers:{
          "Authorization":
          `Bearer ${token}`
        }
      }
    );

    const data =
    await res.json();

    console.log(
      "PROPERTIES:",
      data
    );

    currentPendingPropertiesList = data.data || [];
    renderPendingProperties(currentPendingPropertiesList);

  } catch(error){

    console.error(error);

    alert(
      "Failed to load properties"
    );
  }
}

function renderPendingProperties(properties) {
  applicationsContainer.innerHTML = "";

  if(properties.length === 0){

    applicationsContainer.innerHTML =

    `
    <h2>
      No Pending Properties
    </h2>
    `;

    return;
  }

  properties.forEach(property => {

    applicationsContainer.innerHTML += `

    <div class="card">

      <h3>
        ${property.property_name}
      </h3>

      <p>
        <strong>Owner:</strong>
        ${property.owner_name}
      </p>

      <p>
        <strong>Email:</strong>
        ${property.email}
      </p>

      <p>
        <strong>City:</strong>
        ${property.city}
      </p>

      <p>
        <strong>State:</strong>
        ${property.state}
      </p>

      <div class="actions">

        <button
          class="approveBtn"
          onclick="approveProperty(${property.id})"
        >
          Approve
        </button>

        <button
          class="rejectBtn"
          onclick="rejectProperty(${property.id})"
        >
          Reject
        </button>

      </div>

    </div>
    `;
  });
}

async function approveProperty(
  propertyId
){

  try {

    const res = await fetch(

      `${BASE_URL}/properties/approve/${propertyId}`,

      {
        method:"PATCH",

        headers:{
            "Content-Type":
            "application/json",

            Authorization:
            `Bearer ${token}`
            }
      }
    );

    const data =
    await res.json();

    alert(data.data.message);

    loadPendingProperties();

  } catch(error){

    console.error(error);

    alert(
      "Approval failed"
    );
  }
}

async function rejectProperty(
  propertyId
){

  try {

    const res = await fetch(

      `${BASE_URL}/properties/reject/${propertyId}`,

      {
        method:"PATCH",

        headers:{
            "Content-Type":
            "application/json",

            Authorization:
            `Bearer ${token}`
            }
      }
    );

    const data =
    await res.json();

    alert(data.data.message);

    loadPendingProperties();

  } catch(error){

    console.error(error);

    alert(
      "Reject failed"
    );
  }
}

async function loadAllProperties(){

  try {

    showApplicationsContainer();
    setupSearch("Properties", "Search properties by name, city, state...");

    const res = await fetch(

      `${BASE_URL}/properties`,

      {
        headers:{
          Authorization:
          `Bearer ${token}`
        }
      }
    );

    const data =
    await res.json();

    console.log(data);

    currentAllPropertiesList = data.data || [];
    renderAllProperties(currentAllPropertiesList);

  } catch(error){

    console.error(error);

    alert(
      "Failed to load properties"
    );
  }
}

function renderAllProperties(properties) {
  applicationsContainer.style.display = "block";
  applicationsContainer.innerHTML = "";

  adminPropertiesCache = properties;

  if(properties.length === 0){
    applicationsContainer.innerHTML = `
      <div class="no-records-view">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>No properties found.</p>
      </div>
    `;
    return;
  }

  // Calculate statistics
  const totalProps = properties.length;
  const activeProps = properties.filter(p => p.is_active).length;
  const pendingApprovalProps = properties.filter(p => p.approval_status === 'PENDING').length;
  const inactiveProps = totalProps - activeProps;

  // Stats Grid
  const statsHTML = `
    <div class="earnings-stats-grid four-cols">
      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper total">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Properties</span>
          <span class="stat-value">${totalProps}</span>
          <span class="stat-subtext">Registered on platform</span>
        </div>
      </div>

      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper paid">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Active Properties</span>
          <span class="stat-value paid-val">${activeProps}</span>
          <span class="stat-subtext">Currently online</span>
        </div>
      </div>

      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper pending">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Pending Approval</span>
          <span class="stat-value" style="color: hsl(38, 92%, 40%);">${pendingApprovalProps}</span>
          <span class="stat-subtext">Awaiting verification</span>
        </div>
      </div>

      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper requested">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Inactive Properties</span>
          <span class="stat-value" style="color: hsl(28, 95%, 45%);">${inactiveProps}</span>
          <span class="stat-subtext">Offline or deactivated</span>
        </div>
      </div>
    </div>
  `;

  // Details Header
  const detailsHeaderHTML = `
    <div class="earnings-details-header">
      <div class="header-info">
        <h3>All Registered Properties</h3>
        <span class="badge-count">${properties.length} properties</span>
      </div>
    </div>
  `;

  // Table & Mobile Cards building
  let tableRows = "";
  let mobileCards = "";

  properties.forEach(property => {
    const commission = property.commission_percentage || 0;
    const approvalClass = property.approval_status ? property.approval_status.toLowerCase() : "pending";
    const activeStatusClass = property.is_active ? "paid" : "pending";

    tableRows += `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 14px;">
            ${property.property_image ? `
              <img src="${resolveImageUrl(property.property_image)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1.5px solid var(--border-color);" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
            ` : `
              <div style="width: 50px; height: 50px; background: hsl(220, 20%, 95%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--dark-muted); font-weight: 600; border: 1.5px solid var(--border-color);">No Image</div>
            `}
            <div class="table-property-cell">
              <span class="property-title-name">${escapeHTML(property.property_name || 'N/A')}</span>
              <span class="property-subtitle-owner">${escapeHTML(property.property_type || 'N/A')}</span>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-weight: 600; color: var(--dark);">${escapeHTML(property.city || 'N/A')}</span>
            <span style="font-size: 12px; color: var(--dark-muted);">${escapeHTML(property.state || 'N/A')}, ${escapeHTML(property.country || 'N/A')}</span>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-start;">
            <span class="status-pill-badge ${approvalClass}">${escapeHTML(property.approval_status || 'PENDING')}</span>
            <span class="status-pill-badge ${activeStatusClass}" style="${property.is_active ? '' : 'background: hsl(220, 15%, 93%); color: hsl(220, 15%, 45%);'}">
              ${property.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 8px; max-width: 180px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--dark-muted); letter-spacing: 0.5px;">Commission</span>
              <span class="commission-badge" style="padding: 2px 8px; font-size: 11px;">${commission}%</span>
            </div>
            <div class="commission-edit" style="margin-top: 0;">
              <input
                type="number"
                id="commission-${property.id}"
                value="${commission}"
                min="0"
                max="100"
                step="0.5"
                class="commission-input"
                style="padding: 6px 10px; font-size: 13px;"
                placeholder="0-100"
              >
              <button
                class="commissionBtn"
                style="padding: 6px 12px; font-size: 12px;"
                onclick="setCommission(${property.id})"
              >
                Set
              </button>
            </div>
          </div>
        </td>
        <td class="text-center">
          <div style="display: flex; gap: 8px; justify-content: center;">
            ${property.is_active ? `
              <button
                class="deactivateBtn"
                style="padding: 8px 14px; font-size: 12px; margin-top: 0; border-radius: var(--radius-sm);"
                onclick="deactivateProperty(${property.id})"
              >
                Deactivate
              </button>
            ` : `
              <button
                class="approveBtn"
                style="padding: 8px 14px; font-size: 12px; margin-top: 0; border-radius: var(--radius-sm);"
                onclick="activateProperty(${property.id})"
              >
                Activate
              </button>
            `}
            <button
              class="rejectBtn"
              style="padding: 8px 14px; font-size: 12px; margin-top: 0; border-radius: var(--radius-sm);"
              onclick="deletePropertyByAdmin(${property.id})"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;

    mobileCards += `
      <div class="mobile-commission-card ${property.is_active ? 'paid' : 'pending'}" style="${property.is_active ? '' : 'border-left-color: hsl(220, 15%, 60%);'}">
        <div class="mobile-card-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${property.property_image ? `
              <img src="${resolveImageUrl(property.property_image)}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
            ` : `
              <div style="width: 44px; height: 44px; background: hsl(220, 20%, 95%); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: var(--dark-muted); border: 1px solid var(--border-color);">No Image</div>
            `}
            <div>
              <h4 style="font-size: 15px; font-weight: 800; color: var(--dark);">${escapeHTML(property.property_name || 'N/A')}</h4>
              <span class="owner-lbl">${escapeHTML(property.property_type || 'N/A')}</span>
            </div>
          </div>
          <span class="status-pill-badge ${approvalClass}">${escapeHTML(property.approval_status || 'PENDING')}</span>
        </div>

        <div class="mobile-card-body">
          <div class="detail-row">
            <span class="lbl">Location</span>
            <span class="val">${escapeHTML(property.city || 'N/A')}, ${escapeHTML(property.state || 'N/A')}</span>
          </div>
          <div class="detail-row">
            <span class="lbl">Active Status</span>
            <span class="val" style="font-weight: 700; color: ${property.is_active ? 'hsl(142, 72%, 29%)' : 'hsl(220, 9%, 40%)'};">
              ${property.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div class="detail-row highlight-row" style="flex-direction: column; gap: 8px; align-items: stretch; padding-top: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="lbl">Commission</span>
              <span class="val commission-val" style="font-size: 15px;">${commission}%</span>
            </div>
            <div class="commission-edit" style="margin-top: 0; width: 100%;">
              <input
                type="number"
                id="commission-mobile-${property.id}"
                value="${commission}"
                min="0"
                max="100"
                step="0.5"
                class="commission-input"
                style="padding: 6px 10px; font-size: 13px;"
                placeholder="0-100"
              >
              <button
                class="commissionBtn"
                style="padding: 6px 12px; font-size: 12px;"
                onclick="setCommission(${property.id})"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        <div class="mobile-card-actions" style="gap: 8px; justify-content: stretch;">
          ${property.is_active ? `
            <button
              class="deactivateBtn"
              style="flex: 1; padding: 10px; font-size: 12px; margin-top: 0; border-radius: var(--radius-sm);"
              onclick="deactivateProperty(${property.id})"
            >
              Deactivate
            </button>
          ` : `
            <button
              class="approveBtn"
              style="flex: 1; padding: 10px; font-size: 12px; margin-top: 0; border-radius: var(--radius-sm);"
              onclick="activateProperty(${property.id})"
            >
              Activate
            </button>
          `}
          <button
            class="rejectBtn"
            style="flex: 1; padding: 10px; font-size: 12px; margin-top: 0; border-radius: var(--radius-sm);"
            onclick="deletePropertyByAdmin(${property.id})"
          >
            Delete
          </button>
        </div>
      </div>
    `;
  });

  const detailsHTML = `
    <div class="desktop-table-view-wrapper">
      <table class="premium-earnings-table">
        <thead>
          <tr>
            <th>Property Details</th>
            <th>Location</th>
            <th>Status & Activity</th>
            <th>Commission settings</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
    <div class="mobile-cards-view-wrapper">
      ${mobileCards}
    </div>
  `;

  applicationsContainer.innerHTML = `
    <div class="earnings-section-wrapper">
      ${statsHTML}
      ${detailsHeaderHTML}
      ${detailsHTML}
    </div>
  `;
}

async function deactivateProperty(propertyId){

  const ok =
  confirm("Deactivate this property?");

  if(!ok){
    return;
  }

  try {

    const res = await fetch(

      `${BASE_URL}/properties/${propertyId}/deactivate`,

      {
        method:"PATCH",

        headers:{
          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${token}`
        }
      }
    );

    const data =
    await res.json();

    if(!data.success){
      alert(data.message || "Failed to deactivate property");
      return;
    }

    alert(data.data.message);
    loadAllProperties();

  } catch(error){

    console.error(error);
    alert("Failed to deactivate property");
  }
}

async function activateProperty(propertyId){

  const ok =
  confirm("Activate this property?");

  if(!ok){
    return;
  }

  try {

    const res = await fetch(

      `${BASE_URL}/properties/${propertyId}/activate`,

      {
        method:"PATCH",

        headers:{
          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${token}`
        }
      }
    );

    const data =
    await res.json();

    if(!data.success){
      alert(data.message || "Failed to activate property");
      return;
    }

    alert(data.data.message);
    loadAllProperties();

  } catch(error){

    console.error(error);
    alert("Failed to activate property");
  }
}

async function deletePropertyByAdmin(propertyId){

  const ok =
  confirm("Delete this property permanently? This action cannot be undone.");

  if(!ok){
    return;
  }

  try {

    const res = await fetch(

      `${BASE_URL}/properties/${propertyId}`,

      {
        method:"DELETE",

        headers:{
          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${token}`
        }
      }
    );

    const data =
    await res.json();

    if(!data.success){
      alert(data.message || "Failed to delete property");
      return;
    }

    alert(data.data.message);
    loadAllProperties();

  } catch(error){

    console.error(error);
    alert("Failed to delete property");
  }
}

allPropertiesTab.addEventListener(

  "click",

  () => {

    removeAllTabStates();

    pageTitle.innerText =
    "Properties";

    allPropertiesTab.classList.add(
      "active"
    );

    applicationsTab.classList.remove(
      "active"
    );

    ownersTab.classList.remove(
      "active"
    );

    propertiesTab.classList.remove(
      "active"
    );

    loadAllProperties();
});



// LOGOUT
document.getElementById("logoutBtn")

.addEventListener("click", () => {

  localStorage.clear();

  window.location.href =
  "../index.html";
});



async function setCommission(propertyId){

  const desktopInput = document.getElementById(`commission-${propertyId}`);
  const mobileInput = document.getElementById(`commission-mobile-${propertyId}`);
  
  // Choose input based on responsiveness/viewport size (max-width: 1024px is mobile)
  const isMobile = window.innerWidth <= 1024;
  const input = (isMobile && mobileInput) ? mobileInput : (desktopInput || mobileInput);

  if (!input) {
    alert("Error: Commission input not found");
    return;
  }

  const value = parseFloat(input.value);

  if(
    isNaN(value) ||
    value < 0 ||
    value > 100
  ){
    alert("Commission must be between 0 and 100");
    return;
  }

  try {

    const res = await fetch(

      `${BASE_URL}/properties/${propertyId}/commission`,

      {
        method:"PATCH",

        headers:{
          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${token}`
        },

        body: JSON.stringify({
          commission_percentage: value
        })
      }
    );

    const data =
    await res.json();

    if(!data.success){
      alert(data.message || "Failed to set commission");
      return;
    }

    alert(data.data.message);
    loadAllProperties();

  } catch(error){

    console.error(error);
    alert("Failed to set commission");
  }
}



// LOAD PENDING CHECK-INS
async function loadPendingCheckIns(){

  try {

    showApplicationsContainer();
    setupSearch("Checkins", "Search check-ins by guest, property, booking code...");

    const res = await fetch(

      `${BASE_URL}/checkins/pending`,

      {
        headers:{
          "Authorization":
          `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log("CHECK-INS:", data);

    currentCheckInsList = data.data || [];
    renderPendingCheckIns(currentCheckInsList);

  } catch (error) {

    console.error(error);

    alert(
      "Failed to load check-ins"
    );
  }
}

function renderPendingCheckIns(checkIns) {
  applicationsContainer.innerHTML = "";

  if(checkIns.length === 0){

    applicationsContainer.innerHTML = `

      <h2>
        No Pending Check-Ins
      </h2>
    `;

    return;
  }

  checkIns.forEach(checkIn => {

    const statusClass = checkIn.status.toLowerCase();

    applicationsContainer.innerHTML += `

      <div class="card">

        <h3>${checkIn.property_name}</h3>

        <p>
          <strong>Booking Code:</strong>
          ${checkIn.booking_code}
        </p>

        <p>
          <strong>Guest:</strong>
          ${checkIn.guest_name}
        </p>

        <p>
          <strong>Guest Email:</strong>
          ${checkIn.user_email}
        </p>

        <p>
          <strong>Owner:</strong>
          ${checkIn.owner_name}
        </p>

        <p>
          <strong>Check-In Date:</strong>
          ${checkIn.check_in_date}
        </p>

        <p>
          <strong>Customer Total:</strong>
          ${formatMoney(checkIn.booking_amount)}
        </p>

        <p>
          <strong>Owner Base Amount:</strong>
          ${formatMoney(checkIn.booking_base_amount)}
        </p>

        <p>
          <strong>Commission:</strong>
          <span class="commission-value">
            ${formatMoney(checkIn.commission_amount)}
          </span>
        </p>

        <span class="status ${statusClass}">
          ${checkIn.status}
        </span>

        ${
          checkIn.status === 'OWNER_CONFIRMED'
          ?
          `
          <div class="actions">
            <button
              class="approveBtn"
              onclick="recordCheckInAdmin(${checkIn.id})"
            >
              Record Check-In & Add Commission
            </button>
          </div>
          `
          :
          `
          <p class="info-text">
            Awaiting owner confirmation
          </p>
          `
        }

        ${checkIn.special_requests ? `
          <div class="booking-guest special-requests" style="margin-top: 12px; border-top: 1px dashed #ddd; padding-top: 10px; font-size: 13px; text-align: left;">
            <strong>Special Requests & Additional Guests:</strong>
            <span style="white-space: pre-line; display: block; margin-top: 4px; line-height: 1.5;">${escapeHTML(checkIn.special_requests)}</span>
          </div>
        ` : ""}

      </div>
    `;
  });
}

async function recordCheckInAdmin(checkinId){

  const ok = confirm(
    "Record this check-in and add commission?"
  );

  if(!ok){
    return;
  }

  try {

    const res = await fetch(

      `${BASE_URL}/checkins/${checkinId}/record`,

      {
        method:"PATCH",

        headers:{
          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if(!data.success){
      alert(data.message || "Failed to record check-in");
      return;
    }

    alert(data.data.message);
    loadPendingCheckIns();

  } catch(error){

    console.error(error);
    alert("Failed to record check-in");
  }
}



const ensureAdminProperties = async () => {
  if (adminPropertiesCache.length > 0) {
    return adminPropertiesCache;
  }

  const res = await fetch(
    `${BASE_URL}/properties`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  adminPropertiesCache = data.data || [];
  return adminPropertiesCache;
};

const buildPropertyFilterOptions = (selectedPropertyId = "") => {
  return adminPropertiesCache.map((property) => `
    <option
      value="${property.id}"
      ${String(selectedPropertyId) === String(property.id) ? "selected" : ""}
    >
      ${escapeHTML(property.property_name || `Property #${property.id}`)}
    </option>
  `).join("");
};

const getCommissionState = (commission) => {
  if (commission.payment_status === "PAID") {
    return "Paid";
  }

  return commission.payment_requested_at
    ? "Payment requested"
    : "Not requested";
};

// LOAD ADMIN EARNINGS
async function loadEarnings(propertyId = ""){

  try {

    showEarningsContainer();
    setupSearch("Earnings", "Search earnings details by property, guest, booking...");
    await ensureAdminProperties();
    currentEarningsPropertyId = propertyId;

    const query =
    propertyId
    ? `?property_id=${encodeURIComponent(propertyId)}`
    : "";

    const res = await fetch(

      `${BASE_URL}/earnings${query}`,

      {
        headers:{
          "Authorization":
          `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log("EARNINGS:", data);

    currentEarningsSummary = data.data.summary || {};
    currentCommissionsList = data.data.commissions || [];
    renderEarnings(currentEarningsSummary, currentCommissionsList, propertyId);

  } catch (error) {

    console.error(error);

    alert(
      "Failed to load earnings"
    );
  }
}

function renderEarnings(summary, commissions, propertyId) {
  earningsContainer.innerHTML = "";

  const propertyFilterHTML = `
    <div class="earnings-control-row">
      <div class="filter-group">
        <label for="earningsPropertyFilter" class="filter-label">Filter by Property</label>
        <div class="select-wrapper">
          <select
            id="earningsPropertyFilter"
            onchange="loadEarnings(this.value)"
            class="premium-select"
          >
            <option value="">All Properties</option>
            ${buildPropertyFilterOptions(propertyId)}
          </select>
        </div>
      </div>
    </div>
  `;

  // Render Stats Grid
  const statsHTML = `
    <div class="earnings-stats-grid">
      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper pending">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Pending Commissions</span>
          <span class="stat-value">${formatMoney(summary.total_pending_amount)}</span>
          <span class="stat-subtext">${summary.total_pending_commissions || 0} check-ins awaiting confirmation</span>
        </div>
      </div>

      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper not-requested">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Ready to Request</span>
          <span class="stat-value">${formatMoney(summary.total_unrequested_amount)}</span>
          <span class="stat-subtext">${summary.total_unrequested_commissions || 0} not requested yet</span>
        </div>
      </div>

      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper requested">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Awaiting Payment</span>
          <span class="stat-value">${formatMoney(summary.total_requested_amount)}</span>
          <span class="stat-subtext">${summary.total_requested_commissions || 0} awaiting owner action</span>
        </div>
      </div>

      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper paid">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Paid Commission</span>
          <span class="stat-value paid-val">${formatMoney(summary.total_paid_amount)}</span>
          <span class="stat-subtext">${summary.total_paid_commissions || 0} settled invoices</span>
        </div>
      </div>

      <div class="earnings-stat-card total-earnings-card">
        <div class="stat-icon-wrapper total">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Platform Earnings</span>
          <span class="stat-value total-val">${formatMoney(toNumber(summary.total_pending_amount) + toNumber(summary.total_paid_amount))}</span>
          <span class="stat-subtext">Total platform revenue</span>
        </div>
      </div>
    </div>
  `;

  // Section header for details
  const detailsHeaderHTML = `
    <div class="earnings-details-header">
      <div class="header-info">
        <h3>Commission Details</h3>
        <span class="badge-count">${commissions.length} records</span>
      </div>
    </div>
  `;

  let detailsHTML = "";
  if (commissions.length === 0) {
    detailsHTML = `
      <div class="no-records-view">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>No commission records found for the selected property filter.</p>
      </div>
    `;
  } else {
    // Build table view for Desktop, and custom modern cards for mobile view
    let tableRows = "";
    let mobileCards = "";

    commissions.forEach(commission => {
      const isPending = commission.payment_status === "PENDING";
      const isRequested = Boolean(commission.payment_requested_at);
      const statusClass = commission.payment_status.toLowerCase();

      // Action buttons
      let actionBtn = "";
      if (isPending) {
        if (isRequested) {
          actionBtn = `
            <button
              class="action-btn-confirm"
              onclick="confirmCommissionPaymentModal(${commission.id}, ${toNumber(commission.commission_amount)})"
            >
              Confirm Payment
            </button>
          `;
        } else {
          actionBtn = `
            <button
              class="action-btn-request"
              onclick="requestCommissionPayment(${commission.id})"
            >
              Request Payment
            </button>
          `;
        }
      } else {
        actionBtn = `<span class="settled-label">No Actions</span>`;
      }

      // Format dates
      const earnedDate = formatDate(commission.earned_at);
      const requestedDate = commission.payment_requested_at ? formatDate(commission.payment_requested_at) : "—";
      const confirmedDate = (commission.payment_confirmed_at || commission.paid_at) 
        ? formatDate(commission.payment_confirmed_at || commission.paid_at) 
        : "—";

      // Row for desktop table
      tableRows += `
        <tr>
          <td>
            <div class="table-property-cell">
              <span class="property-title-name">${escapeHTML(commission.property_name)}</span>
              <span class="property-subtitle-owner">Owner: ${escapeHTML(commission.owner_name)}</span>
            </div>
          </td>
          <td>
            <div class="table-booking-cell">
              <span class="booking-code">${escapeHTML(commission.booking_code)}</span>
              <span class="guest-name">Guest: ${escapeHTML(commission.guest_name)}</span>
            </div>
          </td>
          <td class="text-right">
            <div class="table-financials-cell">
              <div class="financial-row">
                <span class="fin-lbl">Total Booking:</span>
                <span class="fin-val">${formatMoney(commission.booking_total_amount)}</span>
              </div>
              <div class="financial-row">
                <span class="fin-lbl">Base Amount:</span>
                <span class="fin-val">${formatMoney(commission.booking_base_amount)}</span>
              </div>
            </div>
          </td>
          <td class="text-right">
            <div class="commission-amount-highlight">
              ${formatMoney(commission.commission_amount)}
            </div>
          </td>
          <td>
            <div class="table-timeline-cell">
              <span class="status-pill-badge ${statusClass}">${escapeHTML(commission.payment_status)}</span>
              <div class="timeline-dates">
                <span>Earned: ${earnedDate}</span>
                ${isRequested ? `<span>Req: ${requestedDate}</span>` : ""}
                ${commission.payment_status === "PAID" ? `<span>Paid: ${confirmedDate}</span>` : ""}
              </div>
            </div>
          </td>
          <td class="text-center">
            <div class="action-btn-cell">
              ${actionBtn}
            </div>
          </td>
        </tr>
      `;

      // Card for mobile list view
      mobileCards += `
        <div class="mobile-commission-card ${statusClass}">
          <div class="mobile-card-header">
            <div class="property-info">
              <h4>${escapeHTML(commission.property_name)}</h4>
              <span class="owner-lbl">Owner: ${escapeHTML(commission.owner_name)}</span>
            </div>
            <span class="status-pill-badge ${statusClass}">${escapeHTML(commission.payment_status)}</span>
          </div>

          <div class="mobile-card-body">
            <div class="detail-row">
              <span class="lbl">Booking Code</span>
              <span class="val font-semibold">${escapeHTML(commission.booking_code)}</span>
            </div>
            <div class="detail-row">
              <span class="lbl">Guest Name</span>
              <span class="val">${escapeHTML(commission.guest_name)}</span>
            </div>
            <div class="detail-row">
              <span class="lbl">Booking Total</span>
              <span class="val">${formatMoney(commission.booking_total_amount)}</span>
            </div>
            <div class="detail-row">
              <span class="lbl">Base Amount</span>
              <span class="val">${formatMoney(commission.booking_base_amount)}</span>
            </div>
            <div class="detail-row highlight-row">
              <span class="lbl">Commission</span>
              <span class="val commission-val">${formatMoney(commission.commission_amount)}</span>
            </div>

            <div class="mobile-timeline">
              <div class="timeline-item">
                <span class="lbl">Earned:</span>
                <span class="val">${earnedDate}</span>
              </div>
              ${isRequested ? `
              <div class="timeline-item">
                <span class="lbl">Requested:</span>
                <span class="val">${requestedDate}</span>
              </div>` : ""}
              ${commission.payment_status === "PAID" ? `
              <div class="timeline-item">
                <span class="lbl">Settled:</span>
                <span class="val">${confirmedDate}</span>
              </div>` : ""}
            </div>
          </div>

          ${isPending ? `
          <div class="mobile-card-actions">
            ${actionBtn}
          </div>` : ""}
        </div>
      `;
    });

    detailsHTML = `
      <div class="desktop-table-view-wrapper">
        <table class="premium-earnings-table">
          <thead>
            <tr>
              <th>Property Details</th>
              <th>Booking & Guest</th>
              <th class="text-right">Financial Details</th>
              <th class="text-right">Commission</th>
              <th>Status & Timeline</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      <div class="mobile-cards-view-wrapper">
        ${mobileCards}
      </div>
    `;
  }

  earningsContainer.innerHTML = `
    ${propertyFilterHTML}
    ${statsHTML}
    ${detailsHeaderHTML}
    ${detailsHTML}
  `;
}



// CHECK-INS TAB
checkinsTab.addEventListener(
  "click",
  () => {

    removeAllTabStates();

    pageTitle.innerText =
    "Pending Check-Ins";

    checkinsTab.classList.add(
      "active"
    );

    applicationsTab.classList.remove(
      "active"
    );

    ownersTab.classList.remove(
      "active"
    );

    propertiesTab.classList.remove(
      "active"
    );

    allPropertiesTab.classList.remove(
      "active"
    );

    earningsTab.classList.remove(
      "active"
    );

    loadPendingCheckIns();
});



// EARNINGS TAB
earningsTab.addEventListener(
  "click",
  () => {

    removeAllTabStates();

    pageTitle.innerText =
    "Commission Earnings";

    earningsTab.classList.add(
      "active"
    );

    applicationsTab.classList.remove(
      "active"
    );

    ownersTab.classList.remove(
      "active"
    );

    propertiesTab.classList.remove(
      "active"
    );

    allPropertiesTab.classList.remove(
      "active"
    );

    checkinsTab.classList.remove(
      "active"
    );

    loadEarnings();
});



// COMMISSION REQUESTS TAB
commissionRequestsTab.addEventListener(
  "click",
  () => {

    removeAllTabStates();

    pageTitle.innerText =
    "Commission Payment Requests";

    commissionRequestsTab.classList.add(
      "active"
    );

    applicationsTab.classList.remove(
      "active"
    );

    ownersTab.classList.remove(
      "active"
    );

    propertiesTab.classList.remove(
      "active"
    );

    allPropertiesTab.classList.remove(
      "active"
    );

    checkinsTab.classList.remove(
      "active"
    );

    earningsTab.classList.remove(
      "active"
    );

    loadCommissionRequests();
  }
);



// COMMISSION REQUESTS FUNCTIONALITY
const loadCommissionRequests = async (propertyId = "") => {

  const container = commissionRequestsContainer;

  showCommissionRequestsContainer();
  setupSearch("Requests", "Search requests by property, guest, booking, owner...");

  try {

    await ensureAdminProperties();
    currentRequestsPropertyId = propertyId;

    const query =
    propertyId
    ? `?property_id=${encodeURIComponent(propertyId)}`
    : "";

    const earnings = await fetch(
      `${BASE_URL}/earnings${query}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    ).then(r => r.json());

    if (!earnings.success) {
      container.innerHTML = "<p>Error loading commissions</p>";
      return;
    }

    currentRequestsCommissionsList = earnings.data.commissions || [];
    renderCommissionRequests(currentRequestsCommissionsList, propertyId);

  } catch (error) {
    console.error("Error loading commission requests:", error);
    container.innerHTML = "<p>Error loading commission requests</p>";
  }
};

function renderCommissionRequests(commissions, propertyId) {
  const container = commissionRequestsContainer;

  const unrequested = commissions.filter(
    c => !c.payment_requested_at && c.payment_status === 'PENDING'
  );

  // Filter pending requests
  const pendingRequests = commissions.filter(
    c => c.payment_requested_at && c.payment_status === 'PENDING'
  );

  const paidRequests = commissions.filter(
    c => c.payment_status === 'PAID'
  );

  // Filter Bar
  const propertyFilterHTML = `
    <div class="earnings-control-row">
      <div class="filter-group">
        <label for="requestsPropertyFilter" class="filter-label">Filter by Property</label>
        <div class="select-wrapper">
          <select
            id="requestsPropertyFilter"
            onchange="loadCommissionRequests(this.value)"
            class="premium-select"
          >
            <option value="">All Properties</option>
            ${buildPropertyFilterOptions(propertyId)}
          </select>
        </div>
      </div>
    </div>
  `;

  // Stats Grid (3 columns)
  const statsHTML = `
    <div class="earnings-stats-grid three-cols">
      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper pending">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Ready to Request</span>
          <span class="stat-value">${formatMoney(unrequested.reduce((sum, c) => sum + toNumber(c.commission_amount), 0))}</span>
          <span class="stat-subtext">${unrequested.length} commissions waiting</span>
        </div>
      </div>

      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper requested">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Awaiting Payment</span>
          <span class="stat-value" style="color: hsl(38, 92%, 40%);">${formatMoney(pendingRequests.reduce((sum, c) => sum + toNumber(c.commission_amount), 0))}</span>
          <span class="stat-subtext">${pendingRequests.length} pending manual payments</span>
        </div>
      </div>

      <div class="earnings-stat-card">
        <div class="stat-icon-wrapper paid">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Confirmed Paid</span>
          <span class="stat-value paid-val">${formatMoney(paidRequests.reduce((sum, c) => sum + toNumber(c.commission_amount), 0))}</span>
          <span class="stat-subtext">${paidRequests.length} settled requests</span>
        </div>
      </div>
    </div>
  `;

  // 1. Ready To Request HTML
  let unrequestedTableRows = "";
  let unrequestedMobileCards = "";
  if (unrequested.length > 0) {
    unrequested.forEach(commission => {
      unrequestedTableRows += `
        <tr>
          <td>
            <div class="table-property-cell">
              <span class="property-title-name">${escapeHTML(commission.property_name || 'N/A')}</span>
              <span class="property-subtitle-owner">Owner: ${escapeHTML(commission.owner_name || 'N/A')}</span>
            </div>
          </td>
          <td>
            <div class="table-booking-cell">
              <span class="booking-code">${escapeHTML(commission.booking_code || 'N/A')}</span>
              ${commission.guest_name ? `<span class="guest-name">Guest: ${escapeHTML(commission.guest_name)}</span>` : ''}
            </div>
          </td>
          <td class="text-right">
            <div class="commission-amount-highlight">
              ${formatMoney(commission.commission_amount)}
            </div>
          </td>
          <td class="text-center">
            <div class="action-btn-cell">
              <button
                class="action-btn-request"
                onclick="requestCommissionPayment(${commission.id})"
              >
                Send Request
              </button>
            </div>
          </td>
        </tr>
      `;

      unrequestedMobileCards += `
        <div class="mobile-commission-card pending">
          <div class="mobile-card-header">
            <div class="property-info">
              <h4>${escapeHTML(commission.property_name || 'N/A')}</h4>
              <span class="owner-lbl">Owner: ${escapeHTML(commission.owner_name || 'N/A')}</span>
            </div>
            <span class="status-pill-badge pending">Ready</span>
          </div>
          <div class="mobile-card-body">
            <div class="detail-row">
              <span class="lbl">Booking Code</span>
              <span class="val font-semibold">${escapeHTML(commission.booking_code || 'N/A')}</span>
            </div>
            ${commission.guest_name ? `
            <div class="detail-row">
              <span class="lbl">Guest Name</span>
              <span class="val">${escapeHTML(commission.guest_name)}</span>
            </div>` : ''}
            <div class="detail-row highlight-row">
              <span class="lbl">Commission</span>
              <span class="val commission-val">${formatMoney(commission.commission_amount)}</span>
            </div>
          </div>
          <div class="mobile-card-actions">
            <button
              class="action-btn-request"
              onclick="requestCommissionPayment(${commission.id})"
            >
              Send Request
            </button>
          </div>
        </div>
      `;
    });
  }

  const unrequestedHTML = `
    <div class="earnings-details-header" style="margin-top: 32px;">
      <div class="header-info">
        <h3>Ready To Request</h3>
        <span class="badge-count">${unrequested.length} records</span>
      </div>
    </div>
    ${unrequested.length === 0 ? `
      <div class="no-records-view" style="margin-bottom: 30px;">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>No commissions waiting for request.</p>
      </div>
    ` : `
      <div class="desktop-table-view-wrapper">
        <table class="premium-earnings-table">
          <thead>
            <tr>
              <th>Property Details</th>
              <th>Booking & Guest</th>
              <th class="text-right">Commission Amount</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            ${unrequestedTableRows}
          </tbody>
        </table>
      </div>
      <div class="mobile-cards-view-wrapper">
        ${unrequestedMobileCards}
      </div>
    `}
  `;

  // 2. Awaiting Manual Payment HTML
  let pendingTableRows = "";
  let pendingMobileCards = "";
  if (pendingRequests.length > 0) {
    pendingRequests.forEach(commission => {
      const requestedDate = formatDate(commission.payment_requested_at);
      pendingTableRows += `
        <tr>
          <td>
            <div class="table-property-cell">
              <span class="property-title-name">${escapeHTML(commission.property_name || 'N/A')}</span>
              <span class="property-subtitle-owner">Owner: ${escapeHTML(commission.owner_name || 'N/A')}</span>
            </div>
          </td>
          <td>
            <div class="table-booking-cell">
              <span class="booking-code">${escapeHTML(commission.booking_code || 'N/A')}</span>
              ${commission.guest_name ? `<span class="guest-name">Guest: ${escapeHTML(commission.guest_name)}</span>` : ''}
            </div>
          </td>
          <td class="text-right">
            <div class="commission-amount-highlight" style="color: hsl(38, 92%, 40%);">
              ${formatMoney(commission.commission_amount)}
            </div>
          </td>
          <td>
            <div class="table-timeline-cell">
              <span class="status-pill-badge pending">Awaiting Payment</span>
              <div class="timeline-dates">
                <span>Requested: ${requestedDate}</span>
              </div>
            </div>
          </td>
          <td class="text-center">
            <div class="action-btn-cell">
              <button
                class="action-btn-confirm"
                onclick="confirmCommissionPaymentModal(${commission.id}, ${toNumber(commission.commission_amount)})"
              >
                Confirm Receipt
              </button>
            </div>
          </td>
        </tr>
      `;

      pendingMobileCards += `
        <div class="mobile-commission-card pending">
          <div class="mobile-card-header">
            <div class="property-info">
              <h4>${escapeHTML(commission.property_name || 'N/A')}</h4>
              <span class="owner-lbl">Owner: ${escapeHTML(commission.owner_name || 'N/A')}</span>
            </div>
            <span class="status-pill-badge pending">Awaiting Payment</span>
          </div>
          <div class="mobile-card-body">
            <div class="detail-row">
              <span class="lbl">Booking Code</span>
              <span class="val font-semibold">${escapeHTML(commission.booking_code || 'N/A')}</span>
            </div>
            ${commission.guest_name ? `
            <div class="detail-row">
              <span class="lbl">Guest Name</span>
              <span class="val">${escapeHTML(commission.guest_name)}</span>
            </div>` : ''}
            <div class="detail-row highlight-row">
              <span class="lbl">Commission</span>
              <span class="val commission-val" style="color: hsl(38, 92%, 40%);">${formatMoney(commission.commission_amount)}</span>
            </div>
            <div class="mobile-timeline">
              <div class="timeline-item">
                <span class="lbl">Requested:</span>
                <span class="val">${requestedDate}</span>
              </div>
            </div>
          </div>
          <div class="mobile-card-actions">
            <button
              class="action-btn-confirm"
              onclick="confirmCommissionPaymentModal(${commission.id}, ${toNumber(commission.commission_amount)})"
            >
              Confirm Receipt
            </button>
          </div>
        </div>
      `;
    });
  }

  const pendingHTML = `
    <div class="earnings-details-header" style="margin-top: 40px;">
      <div class="header-info">
        <h3>Awaiting Manual Payment</h3>
        <span class="badge-count">${pendingRequests.length} records</span>
      </div>
    </div>
    ${pendingRequests.length === 0 ? `
      <div class="no-records-view" style="margin-bottom: 30px;">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>No pending payment requests.</p>
      </div>
    ` : `
      <div class="desktop-table-view-wrapper">
        <table class="premium-earnings-table">
          <thead>
            <tr>
              <th>Property Details</th>
              <th>Booking & Guest</th>
              <th class="text-right">Commission Amount</th>
              <th>Requested Date</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            ${pendingTableRows}
          </tbody>
        </table>
      </div>
      <div class="mobile-cards-view-wrapper">
        ${pendingMobileCards}
      </div>
    `}
  `;

  // 3. Paid Commissions HTML
  let paidTableRows = "";
  let paidMobileCards = "";
  if (paidRequests.length > 0) {
    paidRequests.forEach(commission => {
      const confirmedDate = commission.payment_confirmed_at ? formatDate(commission.payment_confirmed_at) : 'N/A';
      const methodBadge = commission.payment_method ? `<strong>[${escapeHTML(commission.payment_method)}]</strong> ` : '';
      
      paidTableRows += `
        <tr>
          <td>
            <div class="table-property-cell">
              <span class="property-title-name">${escapeHTML(commission.property_name || 'N/A')}</span>
              <span class="property-subtitle-owner">Owner: ${escapeHTML(commission.owner_name || 'N/A')}</span>
            </div>
          </td>
          <td>
            <div class="table-booking-cell">
              <span class="booking-code">${escapeHTML(commission.booking_code || 'N/A')}</span>
              ${commission.guest_name ? `<span class="guest-name">Guest: ${escapeHTML(commission.guest_name)}</span>` : ''}
            </div>
          </td>
          <td class="text-right">
            <div class="commission-amount-highlight" style="color: hsl(142, 72%, 29%);">
              ${formatMoney(commission.commission_amount)}
            </div>
          </td>
          <td>
            <div class="table-timeline-cell">
              <span class="status-pill-badge paid">Paid</span>
              <div class="timeline-dates">
                <span>Confirmed: ${confirmedDate}</span>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size: 13px; color: var(--dark-muted); line-height: 1.4;">
              ${methodBadge}${escapeHTML(commission.payment_proof_notes || '-')}
            </div>
          </td>
        </tr>
      `;

      paidMobileCards += `
        <div class="mobile-commission-card paid">
          <div class="mobile-card-header">
            <div class="property-info">
              <h4>${escapeHTML(commission.property_name || 'N/A')}</h4>
              <span class="owner-lbl">Owner: ${escapeHTML(commission.owner_name || 'N/A')}</span>
            </div>
            <span class="status-pill-badge paid">Paid</span>
          </div>
          <div class="mobile-card-body">
            <div class="detail-row">
              <span class="lbl">Booking Code</span>
              <span class="val font-semibold">${escapeHTML(commission.booking_code || 'N/A')}</span>
            </div>
            ${commission.guest_name ? `
            <div class="detail-row">
              <span class="lbl">Guest Name</span>
              <span class="val">${escapeHTML(commission.guest_name)}</span>
            </div>` : ''}
            <div class="detail-row highlight-row">
              <span class="lbl">Commission</span>
              <span class="val commission-val" style="color: hsl(142, 72%, 29%);">${formatMoney(commission.commission_amount)}</span>
            </div>
            <div class="mobile-timeline">
              <div class="timeline-item">
                <span class="lbl">Confirmed Date:</span>
                <span class="val">${confirmedDate}</span>
              </div>
              ${commission.payment_method ? `
              <div class="timeline-item">
                <span class="lbl">Payment Method:</span>
                <span class="val">${escapeHTML(commission.payment_method)}</span>
              </div>` : ''}
              ${commission.payment_proof_notes ? `
              <div class="timeline-item" style="flex-direction: column; align-items: flex-start; gap: 4px; border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 4px;">
                <span class="lbl">Payment Notes:</span>
                <span class="val" style="font-weight: normal; text-align: left;">${escapeHTML(commission.payment_proof_notes)}</span>
              </div>` : ''}
            </div>
          </div>
        </div>
      `;
    });
  }

  const paidHTML = `
    <div class="earnings-details-header" style="margin-top: 40px;">
      <div class="header-info">
        <h3>Paid Commissions</h3>
        <span class="badge-count">${paidRequests.length} records</span>
      </div>
    </div>
    ${paidRequests.length === 0 ? `
      <div class="no-records-view" style="margin-bottom: 30px;">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>No paid commissions yet.</p>
      </div>
    ` : `
      <div class="desktop-table-view-wrapper">
        <table class="premium-earnings-table">
          <thead>
            <tr>
              <th>Property Details</th>
              <th>Booking & Guest</th>
              <th class="text-right">Commission Amount</th>
              <th>Confirmed Date</th>
              <th>Payment Notes</th>
            </tr>
          </thead>
          <tbody>
            ${paidTableRows}
          </tbody>
        </table>
      </div>
      <div class="mobile-cards-view-wrapper">
        ${paidMobileCards}
      </div>
    `}
  `;

  container.innerHTML = `
    <div class="earnings-section-wrapper">
      ${propertyFilterHTML}
      ${statsHTML}
      ${unrequestedHTML}
      ${pendingHTML}
      ${paidHTML}
    </div>
  `;
}



const requestCommissionPayment = async (commissionId) => {
  const ok = confirm(
    "Send a manual payment request to this owner?"
  );

  if (!ok) {
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/commissions/${commissionId}/request-payment`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!data.success) {
      alert(data.message || "Failed to send payment request");
      return;
    }

    alert(data.data?.message || "Payment request sent");

    if (commissionRequestsContainer.style.display !== "none") {
      loadCommissionRequests();
      return;
    }

    loadEarnings();
  } catch (error) {
    console.error("Error requesting commission payment:", error);
    alert("Failed to send payment request");
  }
};

// Modal for confirming payment receipt
const confirmCommissionPaymentModal = (commissionId, amount, ownerName, propertyName) => {

  const payerName = ownerName || "owner";

  const notes = prompt(
    `Confirm payment receipt for ${formatMoney(amount)} from ${payerName}?\n\nEnter bank transfer reference/notes (optional):`,
    ""
  );

  if (notes === null) {
    return; // User cancelled
  }

  confirmCommissionPayment(commissionId, notes);
};



// Confirm payment API call
const confirmCommissionPayment = async (commissionId, paymentProofNotes) => {

  try {

    const response = await fetch(
      `${BASE_URL}/commissions/${commissionId}/confirm-payment`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          payment_proof_notes: paymentProofNotes
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      alert(`Error: ${data.message || 'Failed to confirm payment'}`);
      return;
    }

    alert("Payment confirmed successfully!");

    if (commissionRequestsContainer.style.display !== "none") {
      loadCommissionRequests();
      return;
    }

    loadEarnings();

  } catch (error) {
    console.error("Error confirming payment:", error);
    alert("Error confirming payment. Please try again.");
  }
};


window.loadEarnings = loadEarnings;
window.loadCommissionRequests = loadCommissionRequests;
window.requestCommissionPayment = requestCommissionPayment;
window.confirmCommissionPaymentModal = confirmCommissionPaymentModal;

// OWNER WITHDRAWALS
const FINANCE_API_URL = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/finance';

const loadWithdrawals = async () => {
  try {
    adminWithdrawalsList.innerHTML = '<p class="empty-state">Loading withdrawal requests...</p>';
    showWithdrawalsContainer();
    setupSearch("Withdrawals", "Search withdrawals by owner, bank account, UPI...");

    const res = await fetch(`${FINANCE_API_URL}/admin/withdrawals`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to load withdrawal requests");
    }

    currentWithdrawalsList = data.data || [];
    renderWithdrawals(currentWithdrawalsList);
  } catch (error) {
    console.error("Error loading withdrawals:", error);
    adminWithdrawalsList.innerHTML = `<p class="empty-state error">Error loading withdrawals: ${escapeHTML(error.message)}</p>`;
  }
};

const renderWithdrawals = (requests) => {
  if (requests.length === 0) {
    adminWithdrawalsList.innerHTML = '<h2>No Withdrawal Requests Found</h2>';
    return;
  }

  // Sort: PENDING first, then APPROVED, then paid/rejected, newest first
  const statusOrder = { PENDING: 0, APPROVED: 1, PAID: 2, REJECTED: 3 };
  requests.sort((a, b) => {
    const orderDiff = statusOrder[a.withdrawal_status] - statusOrder[b.withdrawal_status];
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  adminWithdrawalsList.innerHTML = requests.map((req) => {
    let statusClass = "pending";
    if (req.withdrawal_status === "APPROVED") statusClass = "approved";
    if (req.withdrawal_status === "REJECTED") statusClass = "rejected";
    if (req.withdrawal_status === "PAID") statusClass = "paid";

    let detailsHtml = "";
    if (req.upi_id) {
      detailsHtml = `<p><strong>UPI ID:</strong> ${escapeHTML(req.upi_id)}</p>`;
    } else {
      detailsHtml = `
        <p><strong>Bank Name:</strong> ${escapeHTML(req.bank_name || "N/A")}</p>
        <p><strong>Account Number:</strong> ${escapeHTML(req.account_number || "N/A")}</p>
        <p><strong>IFSC Code:</strong> ${escapeHTML(req.ifsc_code || "N/A")}</p>
      `;
    }

    const notesHtml = req.admin_notes 
      ? `<div class="withdrawal-notes-box"><strong>Admin Notes:</strong> ${escapeHTML(req.admin_notes)}</div>` 
      : "";

    let actionsHtml = "";
    if (req.withdrawal_status === "PENDING") {
      actionsHtml = `
        <div class="card-actions">
          <button class="btn approve-btn" onclick="approveWithdrawal(${req.id})">Approve Request</button>
          <button class="btn reject-btn" onclick="rejectWithdrawal(${req.id})">Reject Request</button>
        </div>
      `;
    } else if (req.withdrawal_status === "APPROVED") {
      actionsHtml = `
        <div class="card-actions">
          <button class="btn pay-btn" onclick="markWithdrawalPaid(${req.id})">Mark as Paid</button>
          <button class="btn reject-btn" onclick="rejectWithdrawal(${req.id})">Reject Request</button>
        </div>
      `;
    }

    return `
      <div class="card withdrawal-card-admin">
        <div class="card-header-row">
          <div>
            <h3>Owner: ${escapeHTML(req.owner_name || 'N/A')} (ID: ${req.owner_id})</h3>
            <span class="status-pill ${statusClass}">${escapeHTML(req.withdrawal_status)}</span>
          </div>
          <div class="amount-badge">
            ${formatMoney(req.amount)}
          </div>
        </div>

        <div class="card-details">
          <p><strong>Account Holder:</strong> ${escapeHTML(req.account_holder_name)}</p>
          ${detailsHtml}
          <p class="request-date"><strong>Requested At:</strong> ${formatDate(req.created_at)}</p>
          ${notesHtml}
        </div>

        ${actionsHtml}
      </div>
    `;
  }).join("");
};

const approveWithdrawal = async (id) => {
  const adminNotes = prompt("Enter approval notes (optional):");
  if (adminNotes === null) return;

  try {
    const res = await fetch(`${FINANCE_API_URL}/admin/withdrawals/approve/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ admin_notes: adminNotes })
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to approve request");
    }

    alert("Request approved successfully!");
    loadWithdrawals();
  } catch (error) {
    console.error("Error approving request:", error);
    alert(`Error: ${error.message}`);
  }
};

const rejectWithdrawal = async (id) => {
  const adminNotes = prompt("Enter rejection reason / notes (required):");
  if (adminNotes === null) return;
  if (!adminNotes.trim()) {
    alert("Rejection notes are required.");
    return;
  }

  try {
    const res = await fetch(`${FINANCE_API_URL}/admin/withdrawals/reject/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ admin_notes: adminNotes })
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to reject request");
    }

    alert("Request rejected successfully!");
    loadWithdrawals();
  } catch (error) {
    console.error("Error rejecting request:", error);
    alert(`Error: ${error.message}`);
  }
};

const markWithdrawalPaid = async (id) => {
  const adminNotes = prompt("Enter payment details (e.g. UTR / Transaction Reference ID) (required):");
  if (adminNotes === null) return;
  if (!adminNotes.trim()) {
    alert("Payment details (e.g., UTR number) are required to mark as paid.");
    return;
  }

  try {
    const res = await fetch(`${FINANCE_API_URL}/admin/withdrawals/paid/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ admin_notes: adminNotes })
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to mark request as paid");
    }

    alert("Request marked as paid successfully!");
    loadWithdrawals();
  } catch (error) {
    console.error("Error marking request as paid:", error);
    alert(`Error: ${error.message}`);
  }
};

window.loadWithdrawals = loadWithdrawals;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;
window.markWithdrawalPaid = markWithdrawalPaid;

// WALLET MANAGEMENT
const loadWalletForm = async () => {
  showWalletContainer();
  setupSearch("Wallet", "");
  creditWalletForm.reset();
  walletMessage.style.display = "none";
  walletHistoryList.innerHTML = '<p class="empty-state">No credits yet</p>';
};

const submitCreditForm = async (e) => {
  e.preventDefault();
  
  const userId = document.getElementById("userId").value;
  const amount = document.getElementById("amount").value;
  const message = document.getElementById("message").value;
  
  if (!userId || !amount || !message) {
    showWalletMessage("Please fill all fields", "error");
    return;
  }
  
  try {
    const res = await fetch(`${BASE_URL}/wallets/credit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: parseInt(userId),
        amount: parseFloat(amount),
        admin_message: message
      })
    });
    
    const data = await res.json();
    
    if (!data.success) {
      showWalletMessage(data.message || "Failed to credit wallet", "error");
      return;
    }
    
    showWalletMessage(`Wallet credited successfully! New Balance: ₹${data.data.newBalance}`, "success");
    creditWalletForm.reset();
    addToWalletHistory(data.data);
    
  } catch (error) {
    console.error("Error crediting wallet:", error);
    showWalletMessage("Error: " + error.message, "error");
  }
};

const showWalletMessage = (text, type) => {
  walletMessage.textContent = text;
  walletMessage.className = `message ${type}`;
  walletMessage.style.display = "block";
  
  if (type === "success") {
    setTimeout(() => {
      walletMessage.style.display = "none";
    }, 5000);
  }
};

const addToWalletHistory = (credit) => {
  const historyItem = document.createElement("div");
  historyItem.className = "history-item";
  historyItem.innerHTML = `
    <div class="history-card">
      <p><strong>User/Owner ID:</strong> ${credit.userId}</p>
      <p><strong>Amount Credited:</strong> ₹${credit.amount}</p>
      <p><strong>New Balance:</strong> ₹${credit.newBalance}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString("en-IN")}</p>
    </div>
  `;
  
  if (walletHistoryList.innerHTML.includes("No credits yet")) {
    walletHistoryList.innerHTML = "";
  }
  
  walletHistoryList.insertBefore(historyItem, walletHistoryList.firstChild);
};

window.loadWalletForm = loadWalletForm;
window.submitCreditForm = submitCreditForm;

if (creditWalletForm) {
  creditWalletForm.addEventListener("submit", submitCreditForm);
}

if (withdrawalsTab) {
  withdrawalsTab.addEventListener("click", () => {
    removeAllTabStates();
    pageTitle.innerText = "Owner Withdrawals";
    withdrawalsTab.classList.add("active");
    loadWithdrawals();
  });
}

if (walletTab) {
  walletTab.addEventListener("click", () => {
    removeAllTabStates();
    pageTitle.innerText = "Wallet Management";
    walletTab.classList.add("active");
    loadWalletForm();
  });
}

// ===============================
// COUPON SYSTEM FOR ADMIN
// ===============================

const COUPON_API_URL = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/coupons';

const loadCoupons = async () => {
  try {
    showCouponsContainer();
    setupSearch("Coupons", "Search active coupons by code...");
    couponsList.innerHTML = "<p class='empty-state'>Loading coupons...</p>";
    
    const res = await fetch(`${COUPON_API_URL}/my-coupons`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    const coupons = data.data || [];
    adminCouponsCache = coupons;
    couponsLoaded = true;
    renderCouponsList(coupons);
  } catch (error) {
    console.error(error);
    couponsList.innerHTML = "<p class='empty-state'>Failed to load coupons.</p>";
  }
};

const renderCouponsList = (coupons) => {
  couponListCount.textContent = `${coupons.length} coupon${coupons.length === 1 ? "" : "s"}`;

  if (!coupons.length) {
    couponsList.innerHTML = "<p class='empty-state'>No coupons yet. Create your first coupon to start offering discounts.</p>";
    return;
  }

  const couponStatusClass = (status) => {
    const map = {
      ACTIVE: "active",
      INACTIVE: "inactive",
      EXPIRED: "expired",
      EXHAUSTED: "exhausted",
      SCHEDULED: "scheduled"
    };
    return map[status] || "pending";
  };

  couponsList.innerHTML = coupons.map((coupon) => {
    const statusCls = couponStatusClass(coupon.computed_status);
    const isPercentage = coupon.discount_type === "PERCENTAGE";
    const discountDisplay = isPercentage
      ? `${toNumber(coupon.discount_value)}%`
      : `₹${toNumber(coupon.discount_value).toFixed(0)}`;
    const usageLimitText = coupon.usage_limit
      ? `${coupon.used_count} / ${coupon.usage_limit}`
      : `${coupon.used_count} / ∞`;

    return `
      <div class="history-item">
        <div class="history-card" style="border-left: 4px solid var(--primary); background: var(--bg-body); padding: 18px; border-radius: var(--radius-md); position: relative; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span class="coupon-code-text" style="font-family: monospace; font-weight: 800; font-size: 16px; background: hsla(224, 92%, 56%, 0.06); padding: 4px 8px; border-radius: 4px; border: 1.5px dashed hsla(224, 92%, 56%, 0.25);">${escapeHTML(coupon.coupon_code)}</span>
              <span class="status ${statusCls}" style="margin-left: 8px; margin-bottom: 0; padding: 4px 10px; font-size: 10px;">${escapeHTML(coupon.computed_status)}</span>
            </div>
            <div style="text-align: right; background: var(--primary); color: white; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 700;">
              <strong>${discountDisplay}</strong> <span style="font-size: 9px; opacity: 0.85;">${isPercentage ? "OFF" : "FLAT"}</span>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; color: var(--dark-muted); margin-bottom: 12px;">
            <p><strong>Min Amount:</strong> ₹${toNumber(coupon.minimum_booking_amount).toFixed(0)}</p>
            ${coupon.maximum_discount_amount ? `<p><strong>Max Discount:</strong> ₹${toNumber(coupon.maximum_discount_amount).toFixed(0)}</p>` : ""}
            <p><strong>Usage:</strong> ${usageLimitText}</p>
            <p><strong>Expiry:</strong> ${formatDate(coupon.expiry_date)}</p>
          </div>

          <div style="display: flex; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 10px;">
            <button onclick="toggleCoupon(${coupon.id})" class="approve-btn" style="flex: 1; padding: 6px; border: none; border-radius: var(--radius-sm); color: white; cursor: pointer; font-size: 12px; font-weight: 700; background: ${coupon.is_active ? 'hsl(38, 90%, 40%)' : 'hsl(142, 72%, 29%)'};">${coupon.is_active ? "Deactivate" : "Activate"}</button>
            <button onclick="deleteCouponAction(${coupon.id})" class="reject-btn" style="flex: 1; padding: 6px; border: none; border-radius: var(--radius-sm); color: white; cursor: pointer; font-size: 12px; font-weight: 700;">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
};

const createCouponAction = async (event) => {
  event.preventDefault();

  const payload = {
    coupon_code: document.getElementById("coupon_code").value.toUpperCase().trim(),
    discount_type: document.getElementById("coupon_discount_type").value,
    discount_value: Number(document.getElementById("coupon_discount_value").value),
    minimum_booking_amount: Number(document.getElementById("coupon_min_amount").value) || 0,
    maximum_discount_amount: Number(document.getElementById("coupon_max_discount").value) || null,
    usage_limit: Number(document.getElementById("coupon_usage_limit").value) || null,
    start_date: document.getElementById("coupon_start_date").value,
    expiry_date: document.getElementById("coupon_expiry_date").value
  };

  if (!payload.coupon_code) {
    showCouponFormMessage("Please enter a coupon code.", "error");
    return;
  }

  if (payload.discount_value <= 0) {
    showCouponFormMessage("Discount value must be greater than 0.", "error");
    return;
  }

  if (new Date(payload.expiry_date) <= new Date(payload.start_date)) {
    showCouponFormMessage("Expiry date must be after start date.", "error");
    return;
  }

  try {
    const res = await fetch(`${COUPON_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create coupon");
    }

    showCouponFormMessage(data.data?.message || "Coupon created successfully!", "success");
    document.getElementById("couponForm").reset();
    couponsLoaded = false;
    await loadCoupons();
  } catch (error) {
    console.error(error);
    showCouponFormMessage(error.message || "Failed to create coupon", "error");
  }
};

const showCouponFormMessage = (text, type) => {
  couponFormMessage.textContent = text;
  couponFormMessage.className = `message ${type}`;
  couponFormMessage.style.display = "block";
  
  setTimeout(() => {
    couponFormMessage.style.display = "none";
  }, 5000);
};

const toggleCoupon = async (couponId) => {
  try {
    const res = await fetch(`${COUPON_API_URL}/${couponId}/toggle`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Toggle failed");
    alert(data.data?.message || "Coupon status updated.");
    couponsLoaded = false;
    await loadCoupons();
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to toggle coupon.");
  }
};

const deleteCouponAction = async (couponId) => {
  if (!confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
    return;
  }

  try {
    const res = await fetch(`${COUPON_API_URL}/${couponId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Delete failed");
    alert(data.data?.message || "Coupon deleted.");
    couponsLoaded = false;
    await loadCoupons();
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to delete coupon.");
  }
};

window.toggleCoupon = toggleCoupon;
window.deleteCouponAction = deleteCouponAction;

if (couponsTab) {
  couponsTab.addEventListener("click", () => {
    removeAllTabStates();
    pageTitle.innerText = "Coupon Management";
    couponsTab.classList.add("active");
    loadCoupons();
  });
}

const couponForm = document.getElementById("couponForm");
if (couponForm) {
  couponForm.addEventListener("submit", createCouponAction);
}

// =============================================
// ADVERTISEMENTS SYSTEM
// =============================================
const AD_API_BASE = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/advertisements';

const loadAds = async () => {
  adsList.innerHTML = "<p class='empty-state'>Loading banners...</p>";
  showAdsContainer();
  setupSearch("Banners", "Search banners by redirect URL...");

  try {
    const res = await fetch(`${AD_API_BASE}/all`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load banners");

    adminAdsCache = data.data || [];
    renderAdsList(adminAdsCache);
  } catch (error) {
    console.error(error);
    adsList.innerHTML = "<p class='empty-state'>Failed to load banners.</p>";
  }
};

const renderAdsList = (banners) => {
  adListCount.textContent = `${banners.length} banner${banners.length === 1 ? "" : "s"}`;

  if (!banners.length) {
    adsList.innerHTML = "<p class='empty-state'>No banners uploaded yet.</p>";
    return;
  }

  adsList.innerHTML = banners.map((ad) => {
    const bannerUrl = resolveImageUrl(ad.image_url);
    return `
      <div class="history-item" style="margin-bottom: 16px;">
        <div class="history-card" style="border-left: 4px solid var(--primary); background: var(--bg-body); padding: 18px; border-radius: var(--radius-md); position: relative;">
          <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
            <div style="width: 120px; height: 70px; background: hsl(220, 20%, 93%); border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
              <img src="${bannerUrl}" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
            </div>
            <div style="flex: 1; min-width: 200px;">
              <p style="margin-bottom: 6px; font-weight: 700; font-size: 14px; color: var(--dark);">Redirect URL:</p>
              <a href="${escapeHTML(ad.redirect_url)}" target="_blank" style="word-break: break-all; font-size: 13px; color: var(--primary); font-weight: 600; text-decoration: none;">${escapeHTML(ad.redirect_url)}</a>
              <p style="margin-top: 6px; font-size: 11px; color: var(--dark-muted);">Uploaded: ${formatDate(ad.created_at)}</p>
            </div>
            <div style="text-align: right; min-width: 100px;">
              <button onclick="deleteAdAction(${ad.id})" class="reject-btn" style="padding: 8px 16px; border: none; border-radius: var(--radius-sm); color: white; cursor: pointer; font-size: 12px; font-weight: 700;">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
};

const createAdAction = async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("ad_image");
  const redirectUrlInput = document.getElementById("ad_redirect_url");

  if (!fileInput.files[0]) {
    showAdFormMessage("Please select a banner image.", "error");
    return;
  }

  const redirectUrl = redirectUrlInput.value.trim();
  if (!redirectUrl) {
    showAdFormMessage("Please enter a redirect URL.", "error");
    return;
  }

  try {
    new URL(redirectUrl);
  } catch (e) {
    showAdFormMessage("Please enter a valid URL.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("ad_image", fileInput.files[0]);
  formData.append("redirect_url", redirectUrl);

  const uploadBtn = document.getElementById("uploadAdBtn");
  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    const res = await fetch(`${AD_API_BASE}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to upload banner");

    showAdFormMessage("Banner uploaded successfully!", "success");
    adForm.reset();
    adsLoaded = false;
    await loadAds();
  } catch (error) {
    console.error(error);
    showAdFormMessage(error.message || "Upload failed", "error");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Banner";
  }
};

const showAdFormMessage = (text, type) => {
  adFormMessage.textContent = text;
  adFormMessage.className = `message ${type}`;
  adFormMessage.style.display = "block";
  
  setTimeout(() => {
    adFormMessage.style.display = "none";
  }, 5000);
};

const deleteAdAction = async (adId) => {
  if (!confirm("Are you sure you want to delete this banner?")) {
    return;
  }

  try {
    const res = await fetch(`${AD_API_BASE}/${adId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Delete failed");

    alert("Banner deleted successfully.");
    adsLoaded = false;
    await loadAds();
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to delete banner.");
  }
};

window.deleteAdAction = deleteAdAction;

if (adsTab) {
  adsTab.addEventListener("click", () => {
    removeAllTabStates();
    pageTitle.innerText = "Banners & Advertisements";
    adsTab.classList.add("active");
    loadAds();
  });
}

if (adForm) {
  adForm.addEventListener("submit", createAdAction);
}

// INITIAL LOAD
loadApplications();
