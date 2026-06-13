// API Configuration is loaded from config.js
const API_BASE_URL_OWNER = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api';
// ASSET_BASE_URL is already defined in config.js
const PROPERTY_BASE_URL = `${API_BASE_URL_OWNER}/properties`;

const IMAGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><rect width='100%' height='100%' fill='%23f3f4f6'/><g fill='%239ca3af' transform='translate(180, 110) scale(1.5)'><path d='M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.12-1.12A1 1 0 0010.586 3H7.414a1 1 0 00-.707.293L5.586 4.707A1 1 0 014.88 5H4zM10 8a3 3 0 100 6 3 3 0 000-6z'/></g></svg>";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || user.role !== "OWNER") {
  window.location.href = "../index.html";
  throw new Error("Owner access required");
}

const dashboardTab = document.getElementById("dashboardTab");
const createPropertyTab = document.getElementById("createPropertyTab");
const myPropertiesTab = document.getElementById("myPropertiesTab");
const walletTab = document.getElementById("walletTab");
const bookingsTab = document.getElementById("bookingsTab");
const checkInGuestTab = document.getElementById("checkInGuestTab");
const checkInHistoryTab = document.getElementById("checkInHistoryTab");
const commissionsTab = document.getElementById("commissionsTab");
const roomManagementTab = document.getElementById("roomManagementTab");
const createCouponTab = document.getElementById("createCouponTab");
const myCouponsTab = document.getElementById("myCouponsTab");
const dashboardSection = document.getElementById("dashboardSection");
const walletSection = document.getElementById("walletSection");
const bookingsSection = document.getElementById("bookingsSection");
const checkInGuestSection = document.getElementById("checkInGuestSection");
const checkInHistorySection = document.getElementById("checkInHistorySection");
const commissionsSection = document.getElementById("commissionsSection");
const commissionsList = document.getElementById("commissionsList");
const roomManagementSection = document.getElementById("roomManagementSection");
const createPropertySection = document.getElementById("createPropertySection");
const propertiesContainer = document.getElementById("propertiesContainer");
const createCouponSection = document.getElementById("createCouponSection");
const myCouponsSection = document.getElementById("myCouponsSection");

const commissionsTotalCount = document.getElementById("commissionsTotalCount");
const commissionsPendingAmount = document.getElementById("commissionsPendingAmount");
const commissionsPaidAmount = document.getElementById("commissionsPaidAmount");
const commissionsOverdueCount = document.getElementById("commissionsOverdueCount");

const commissionFilterFrom = document.getElementById("commissionFilterFrom");
const commissionFilterTo = document.getElementById("commissionFilterTo");
const commissionFilterStatus = document.getElementById("commissionFilterStatus");
const btnFilterCommissions = document.getElementById("btnFilterCommissions");
const btnClearFilterCommissions = document.getElementById("btnClearFilterCommissions");
const commissionsHistoryCount = document.getElementById("commissionsHistoryCount");

const payCommissionModal = document.getElementById("payCommissionModal");
const payCommissionForm = document.getElementById("payCommissionForm");
const payCommissionId = document.getElementById("payCommissionId");
const payCommissionAmount = document.getElementById("payCommissionAmount");
const payCommissionMethod = document.getElementById("payCommissionMethod");
const payCommissionNotes = document.getElementById("payCommissionNotes");
const btnCancelPayCommission = document.getElementById("btnCancelPayCommission");

const backBtn = document.getElementById("backBtn");
const pageTitle = document.getElementById("pageTitle");
const ownerWelcome = document.getElementById("ownerWelcome");
const walletBalance = document.getElementById("walletBalance");
const pendingBalance = document.getElementById("pendingBalance");
const totalProperties = document.getElementById("totalProperties");
const approvedProperties = document.getElementById("approvedProperties");
const pendingProperties = document.getElementById("pendingProperties");
const totalRevenue = document.getElementById("totalRevenue");
const bookingCount = document.getElementById("bookingCount");
const recentBookings = document.getElementById("recentBookings");
const recentTransactions = document.getElementById("recentTransactions");
const walletPageBalance = document.getElementById("walletPageBalance");
const walletPagePending = document.getElementById("walletPagePending");
const walletCredits = document.getElementById("walletCredits");
const walletDebits = document.getElementById("walletDebits");
const walletTransactionCount = document.getElementById("walletTransactionCount");
const walletTransactionsList = document.getElementById("walletTransactionsList");
const bookingsTotalCount = document.getElementById("bookingsTotalCount");
const bookingsConfirmedCount = document.getElementById("bookingsConfirmedCount");
const bookingsPendingCount = document.getElementById("bookingsPendingCount");
const bookingsTotalValue = document.getElementById("bookingsTotalValue");
const bookingsList = document.getElementById("bookingsList");
const checkInLookupForm = document.getElementById("checkInLookupForm");
const checkInBookingCode = document.getElementById("checkInBookingCode");
const checkInMessage = document.getElementById("checkInMessage");
const checkInBookingPreview = document.getElementById("checkInBookingPreview");
const checkInsTotalCount = document.getElementById("checkInsTotalCount");
const checkInsConfirmedCount = document.getElementById("checkInsConfirmedCount");
const checkInsRecordedCount = document.getElementById("checkInsRecordedCount");
const checkInsCommissionTotal = document.getElementById("checkInsCommissionTotal");
const checkInsRequestedTotal = document.getElementById("checkInsRequestedTotal");
const checkInsHistoryCount = document.getElementById("checkInsHistoryCount");
const checkInsHistoryList = document.getElementById("checkInsHistoryList");
const roomsTotalCount = document.getElementById("roomsTotalCount");
const roomsAvailableCount = document.getElementById("roomsAvailableCount");
const roomsOccupiedCount = document.getElementById("roomsOccupiedCount");
const roomsPropertyCount = document.getElementById("roomsPropertyCount");
const roomsManagementCount = document.getElementById("roomsManagementCount");
const roomManagementProperty = document.getElementById("roomManagementProperty");
const refreshRoomManagementBtn = document.getElementById("refreshRoomManagementBtn");
const roomManagementList = document.getElementById("roomManagementList");

// Withdrawal DOM elements
const withdrawalForm = document.getElementById("withdrawalForm");
const withdrawalAmount = document.getElementById("withdrawalAmount");
const withdrawalAccountHolder = document.getElementById("withdrawalAccountHolder");
const withdrawalUpiId = document.getElementById("withdrawalUpiId");
const withdrawalBankName = document.getElementById("withdrawalBankName");
const withdrawalAccountNumber = document.getElementById("withdrawalAccountNumber");
const withdrawalIfsc = document.getElementById("withdrawalIfsc");
const withdrawalMessage = document.getElementById("withdrawalMessage");
const withdrawalSubmitBtn = document.getElementById("withdrawalSubmitBtn");
const withdrawalHistoryList = document.getElementById("withdrawalHistoryList");
const withdrawalHistoryCount = document.getElementById("withdrawalHistoryCount");
const upiFields = document.getElementById("upiFields");
const bankFields = document.getElementById("bankFields");

let ownerPropertiesCache = [];
let ownerBookingsCache = [];
let ownerTransactionsCache = [];
let ownerWalletCache = null;
let ownerCouponsCache = [];
let checkInHistoryCache = [];
let roomManagementCache = [];
let selectedCheckInBooking = null;
let dashboardLoaded = false;
let couponsLoaded = false;
let checkInHistoryLoaded = false;
let roomManagementLoaded = false;
let ownerWithdrawalsCache = [];
let withdrawalsLoaded = false;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatINR = (value) => `INR ${toNumber(value).toFixed(2)}`;

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

const formatDateTime = (value) => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatTime = (value) => {
  if (!value) {
    return "Not set";
  }

  return String(value).slice(0, 5);
};

const formatLabel = (value) => {
  return String(value || "N/A").replace(/_/g, " ");
};

const escapeHTML = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

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

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

function canManageRoomsForProperty(property) {
  return (
    property &&
    property.approval_status === "APPROVED" &&
    Boolean(property.is_active)
  );
}

const setActiveTab = (activeTab) => {
  const tabs = [
    dashboardTab,
    createPropertyTab,
    myPropertiesTab,
    walletTab,
    bookingsTab,
    checkInGuestTab,
    checkInHistoryTab,
    commissionsTab,
    roomManagementTab,
    createCouponTab,
    myCouponsTab
  ];
  tabs.forEach((tab) => {
    if (tab) tab.classList.toggle("active", tab === activeTab);
  });

  dashboardSection.classList.toggle("hidden", activeTab !== dashboardTab);
  walletSection.classList.toggle("hidden", activeTab !== walletTab);
  bookingsSection.classList.toggle("hidden", activeTab !== bookingsTab);
  checkInGuestSection.classList.toggle("hidden", activeTab !== checkInGuestTab);
  checkInHistorySection.classList.toggle("hidden", activeTab !== checkInHistoryTab);
  if (commissionsSection) commissionsSection.classList.toggle("hidden", activeTab !== commissionsTab);
  roomManagementSection.classList.toggle("hidden", activeTab !== roomManagementTab);
  createPropertySection.classList.toggle("hidden", activeTab !== createPropertyTab);
  propertiesContainer.classList.toggle("hidden", activeTab !== myPropertiesTab);
  createCouponSection.classList.toggle("hidden", activeTab !== createCouponTab);
  myCouponsSection.classList.toggle("hidden", activeTab !== myCouponsTab);
};

const isCreditTransaction = (transaction) => {
  const type = String(transaction.transaction_type || "").toUpperCase();
  return ["CREDIT", "EARNING", "REFUND", "BOOKING_EARNING", "OWNER_EARNING"].includes(type);
};

const getBookingValue = (bookings) => bookings.reduce((sum, booking) => {
  if (booking.booking_status === "CANCELLED") {
    return sum;
  }

  return sum + toNumber(booking.total_amount);
}, 0);

const getBookingBaseAmount = (booking) => {
  const baseAmount = toNumber(booking.booking_base_amount, 0);
  const commissionAmount = toNumber(booking.booking_commission_amount, 0);

  if (baseAmount > 0) {
    return baseAmount;
  }

  return Math.max(0, toNumber(booking.total_amount, 0) - commissionAmount);
};

const getBookingPayableAmount = (booking) => {
  return Math.max(
    0,
    toNumber(booking.total_amount, 0) - toNumber(booking.coupon_discount, 0)
  );
};

const renderWalletDetails = (wallet, transactions) => {
  const credits = transactions
    .filter(isCreditTransaction)
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const debits = transactions
    .filter((transaction) => !isCreditTransaction(transaction))
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  walletPageBalance.textContent = formatINR(wallet?.balance);
  walletPagePending.textContent = `Pending: ${formatINR(wallet?.pending_balance)}`;
  walletCredits.textContent = formatINR(credits);
  walletDebits.textContent = formatINR(debits);
  walletTransactionCount.textContent = `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`;

  if (!transactions.length) {
    walletTransactionsList.innerHTML = "<p class='empty-state'>No wallet transactions yet.</p>";
    return;
  }

  walletTransactionsList.innerHTML = transactions.map((transaction) => {
    const creditClass = isCreditTransaction(transaction) ? "credit" : "debit";

    return `
      <article class="detail-row">
        <div>
          <strong>${escapeHTML(transaction.transaction_type || "Transaction")}</strong>
          <span>${escapeHTML(transaction.description || "Wallet update")}</span>
          <small>Reference: ${escapeHTML(transaction.reference_id || "N/A")}</small>
        </div>
        <div class="detail-row-meta">
          <b class="${creditClass}">${formatINR(transaction.amount)}</b>
          <span>${formatDate(transaction.created_at)}</span>
          <small>Balance: ${formatINR(transaction.balance_after)}</small>
        </div>
      </article>
    `;
  }).join("");
};

const loadWithdrawalHistory = async () => {
  try {
    withdrawalHistoryList.innerHTML = '<p class="empty-state">Loading withdrawal requests...</p>';
    const data = await fetchJson(`${API_BASE_URL}/finance/withdrawals`);
    ownerWithdrawalsCache = data.data || [];
    withdrawalsLoaded = true;
    renderWithdrawalHistory(ownerWithdrawalsCache);
  } catch (error) {
    console.error("Error loading withdrawal history:", error);
    withdrawalHistoryList.innerHTML = `<p class="empty-state error">Failed to load withdrawal history: ${escapeHTML(error.message)}</p>`;
  }
};

const renderWithdrawalHistory = (withdrawals) => {
  withdrawalHistoryCount.textContent = `${withdrawals.length} request${withdrawals.length === 1 ? "" : "s"}`;

  if (!withdrawals.length) {
    withdrawalHistoryList.innerHTML = '<p class="empty-state">No withdrawal requests yet.</p>';
    return;
  }

  withdrawalHistoryList.innerHTML = withdrawals.map((req) => {
    let statusClass = "pending";
    if (req.withdrawal_status === "APPROVED") statusClass = "approved";
    if (req.withdrawal_status === "REJECTED") statusClass = "rejected";
    if (req.withdrawal_status === "PAID") statusClass = "paid";

    let detailsHtml = "";
    if (req.upi_id) {
      detailsHtml = `<span>UPI: <strong>${escapeHTML(req.upi_id)}</strong></span>`;
    } else {
      detailsHtml = `
        <span>Bank: <strong>${escapeHTML(req.bank_name || "N/A")}</strong></span>
        <span>A/C: <strong>${escapeHTML(req.account_number || "N/A")}</strong></span>
        <span>IFSC: <strong>${escapeHTML(req.ifsc_code || "N/A")}</strong></span>
      `;
    }

    const notesHtml = req.admin_notes 
      ? `<div class="withdrawal-card-notes"><strong>Admin Notes:</strong> ${escapeHTML(req.admin_notes)}</div>` 
      : "";

    return `
      <article class="detail-row withdrawal-card">
        <div>
          <div class="withdrawal-card-header">
            <strong>Payout Request</strong>
            <span class="status-pill ${statusClass}">${escapeHTML(req.withdrawal_status)}</span>
          </div>
          <div class="withdrawal-card-details">
            <span>Holder: <strong>${escapeHTML(req.account_holder_name)}</strong></span>
            ${detailsHtml}
          </div>
          ${notesHtml}
        </div>
        <div class="detail-row-meta">
          <b class="debit">${formatINR(req.amount)}</b>
          <span>${formatDate(req.created_at)}</span>
        </div>
      </article>
    `;
  }).join("");
};

const renderBookingsDetails = (bookings) => {
  const confirmed = bookings.filter((booking) => booking.booking_status === "CONFIRMED").length;
  const pending = bookings.filter((booking) => booking.booking_status === "PENDING").length;

  bookingsTotalCount.textContent = bookings.length;
  bookingsConfirmedCount.textContent = confirmed;
  bookingsPendingCount.textContent = pending;
  bookingsTotalValue.textContent = formatINR(getBookingValue(bookings));

  if (!bookings.length) {
    bookingsList.innerHTML = "<p class='empty-state'>No bookings yet. New guest reservations will show here with full details.</p>";
    return;
  }

  bookingsList.innerHTML = bookings.map((booking) => {
    const isPending = String(booking.booking_status || "").toUpperCase() === "PENDING";
    const guestName = booking.guest_name || booking.customer_name || booking.user_full_name || "Guest";

    return `
    <article class="booking-card" data-booking-id="${booking.id}">
      <div class="booking-card-main">
        <div>
          <span class="booking-code">${escapeHTML(booking.booking_code || `Booking #${booking.id}`)}</span>
          <h3>${escapeHTML(booking.property_name || "Property")}</h3>
          <p>${escapeHTML(booking.room_name || "Room")} for ${escapeHTML(guestName)}</p>
        </div>
        <div class="booking-amount">
          <strong>${formatINR(booking.total_amount)}</strong>
          <small>Customer total</small>
          <span class="status-pill ${String(booking.booking_status || "").toLowerCase()}">${escapeHTML(booking.booking_status || "NEW")}</span>
        </div>
      </div>

      <div class="booking-detail-grid">
        <p><strong>Check-in</strong><span>${formatDate(booking.check_in_date)}</span></p>
        <p><strong>Check-out</strong><span>${formatDate(booking.check_out_date)}</span></p>
        <p><strong>Arrival time</strong><span>${formatTime(booking.check_in_time)}</span></p>
        <p><strong>Booking type</strong><span>${escapeHTML(formatLabel(booking.booking_type))}</span></p>
        <p><strong>Price option</strong><span>${escapeHTML(formatLabel(booking.pricing_option))}</span></p>
        <p><strong>Guests</strong><span>${escapeHTML(booking.guests || 0)}</span></p>
        <p><strong>Rooms</strong><span>${escapeHTML(booking.booked_rooms || 0)}</span></p>
        <p><strong>Payment</strong><span>${escapeHTML(formatLabel(booking.payment_method || booking.payment_status))}</span></p>
        <p><strong>Booked On</strong><span>${formatDate(booking.created_at)}</span></p>
        <p><strong>Owner Base Amount</strong><span>${formatINR(getBookingBaseAmount(booking))}</span></p>
        <p><strong>Admin Commission</strong><span>${formatINR(booking.booking_commission_amount)}</span></p>
        <p><strong>Coupon Discount</strong><span>${formatINR(booking.coupon_discount)}</span></p>
        <p><strong>Payable After Discount</strong><span>${formatINR(getBookingPayableAmount(booking))}</span></p>
      </div>

      <div class="booking-guest">
        <strong>Guest Contact</strong>
        <span>${escapeHTML([
          booking.guest_email || booking.user_email || "Email not available",
          booking.guest_age ? `Age ${booking.guest_age}` : "",
          booking.customer_name ? `User ${booking.customer_name}` : ""
        ].filter(Boolean).join(" | "))}</span>
      </div>

      ${booking.rejection_reason ? `
        <div class="booking-guest rejection-reason">
          <strong>Rejection reason</strong>
          <span>${escapeHTML(booking.rejection_reason)}</span>
        </div>
      ` : ""}

      ${isPending ? `
        <div class="booking-actions-row">
          <button type="button" class="approve-booking-btn" data-booking-id="${booking.id}">Approve</button>
          <button type="button" class="reject-booking-btn" data-booking-id="${booking.id}">Reject</button>
        </div>
      ` : ""}
    </article>
  `;
  }).join("");
};

const setCheckInMessage = (message, type = "info") => {
  checkInMessage.textContent = message || "";
  checkInMessage.className = `checkin-message ${type}`;
};

const renderAvailableRoomOptions = (rooms = []) => {
  if (!rooms.length) {
    return `
      <option value="">
        No available matching rooms
      </option>
    `;
  }

  return [
    '<option value="">Select room ID...</option>',
    ...rooms.map((room) => `
      <option value="${room.id}">
        ${escapeHTML(room.room_id || `Room #${room.id}`)} - ${escapeHTML(room.room_name || room.room_type || "Room")}
      </option>
    `)
  ].join("");
};

const renderCheckInBookingPreview = (booking) => {
  selectedCheckInBooking = booking;

  if (!booking) {
    checkInBookingPreview.classList.add("hidden");
    checkInBookingPreview.innerHTML = "";
    return;
  }

  const isConfirmed = booking.booking_status === "CONFIRMED";
  const guestName =
    booking.guest_name ||
    booking.customer_name ||
    booking.user_full_name ||
    "Guest";
  const availableRooms = booking.available_rooms || [];

  checkInBookingPreview.classList.remove("hidden");
  checkInBookingPreview.innerHTML = `
    <article class="checkin-booking-card">
      <div class="checkin-booking-header">
        <div>
          <span class="booking-code">${escapeHTML(booking.booking_code)}</span>
          <h3>${escapeHTML(booking.property_name || "Property")}</h3>
          <p>${escapeHTML(booking.room_name || "Room")} for ${escapeHTML(guestName)}</p>
        </div>
        <span class="status-pill ${String(booking.booking_status || "").toLowerCase()}">
          ${escapeHTML(booking.booking_status || "UNKNOWN")}
        </span>
      </div>

      <div class="booking-detail-grid">
        <p><strong>Check-in</strong><span>${formatDate(booking.check_in_date)}</span></p>
        <p><strong>Check-out</strong><span>${formatDate(booking.check_out_date)}</span></p>
        <p><strong>Arrival time</strong><span>${formatTime(booking.check_in_time)}</span></p>
        <p><strong>Guests</strong><span>${escapeHTML(booking.guests || 0)}</span></p>
        <p><strong>Rooms</strong><span>${escapeHTML(booking.booked_rooms || 0)}</span></p>
        <p><strong>Payment</strong><span>${escapeHTML(formatLabel(booking.payment_status))}</span></p>
        <p><strong>Booking Value</strong><span>${formatINR(booking.total_amount)}</span></p>
        <p><strong>Owner Base Amount</strong><span>${formatINR(getBookingBaseAmount(booking))}</span></p>
        <p><strong>Commission Rate</strong><span>${toNumber(booking.booking_commission_percentage ?? booking.commission_percentage).toFixed(2)}%</span></p>
        <p><strong>Admin Commission</strong><span>${formatINR(booking.booking_commission_amount)}</span></p>
      </div>

      <div class="room-assignment-box">
        <label for="checkInAssignedRoomId">Assign Room ID</label>
        <select id="checkInAssignedRoomId" ${isConfirmed && availableRooms.length ? "" : "disabled"}>
          ${renderAvailableRoomOptions(availableRooms)}
        </select>
      </div>

      <div class="booking-guest">
        <strong>Guest Contact</strong>
        <span>${escapeHTML([
          booking.guest_email || booking.user_email || "Email not available",
          booking.user_phone || "",
          booking.guest_age ? `Age ${booking.guest_age}` : ""
        ].filter(Boolean).join(" | "))}</span>
      </div>

      <div class="booking-actions-row">
        <button
          type="button"
          id="confirmCheckInBtn"
          class="approve-booking-btn"
          ${isConfirmed && availableRooms.length ? "" : "disabled"}
        >
          Confirm Check-In
        </button>
      </div>
    </article>
  `;

  document
    .getElementById("confirmCheckInBtn")
    .addEventListener("click", confirmOwnerCheckIn);

  if (!isConfirmed) {
    setCheckInMessage(
      "This booking is not confirmed yet, so it cannot be checked in.",
      "warning"
    );
  } else if (!availableRooms.length) {
    setCheckInMessage(
      "No matching room is available right now. Check Room Management before confirming.",
      "warning"
    );
  }
};

const lookupCheckInBooking = async () => {
  const bookingCode = checkInBookingCode.value.trim();

  if (!bookingCode) {
    setCheckInMessage("Enter a booking code to find the guest booking.", "warning");
    renderCheckInBookingPreview(null);
    return;
  }

  setCheckInMessage("Finding booking...");
  renderCheckInBookingPreview(null);

  try {
    const data = await fetchJson(
      `${API_BASE_URL}/checkins/owner/booking/${encodeURIComponent(bookingCode)}`
    );

    renderCheckInBookingPreview(data.data);
    if (data.data?.booking_status === "CONFIRMED") {
      setCheckInMessage(
        "Booking found. Verify the guest details before confirming check-in.",
        "success"
      );
    }
  } catch (error) {
    console.error(error);
    selectedCheckInBooking = null;
    setCheckInMessage(error.message || "Booking lookup failed.", "error");
  }
};

async function confirmOwnerCheckIn() {
  const bookingCode =
    selectedCheckInBooking?.booking_code || checkInBookingCode.value.trim();
  const assignedRoomId = document.getElementById("checkInAssignedRoomId")?.value;

  if (!bookingCode) {
    setCheckInMessage("Find a booking before confirming check-in.", "warning");
    return;
  }

  if (!assignedRoomId) {
    setCheckInMessage("Select an available room ID before confirming check-in.", "warning");
    return;
  }

  const ok = window.confirm("Confirm this guest check-in and assign the selected room?");
  if (!ok) {
    return;
  }

  setCheckInMessage("Confirming check-in...");

  try {
    const data = await fetchJson(`${API_BASE_URL}/checkins/owner/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        booking_code: bookingCode,
        assigned_room_id: Number(assignedRoomId)
      })
    });

    setCheckInMessage(data.data?.message || "Guest checked in successfully.", "success");
    checkInBookingCode.value = "";
    renderCheckInBookingPreview(null);
    checkInHistoryLoaded = false;
    roomManagementLoaded = false;
    await loadCheckInHistory();
  } catch (error) {
    console.error(error);
    setCheckInMessage(error.message || "Unable to confirm check-in.", "error");
  }
}

const renderCheckInHistory = (checkIns) => {
  const ownerConfirmed = checkIns.filter((item) => item.status === "OWNER_CONFIRMED").length;
  const adminRecorded = checkIns.filter((item) => item.status === "ADMIN_RECORDED").length;
  const commissionTotal = checkIns.reduce(
    (sum, item) => sum + toNumber(item.commission_amount),
    0
  );
  const requestedTotal = checkIns
    .filter((item) =>
      item.commission_payment_status === "PENDING" &&
      Boolean(item.payment_requested_at)
    )
    .reduce((sum, item) => sum + toNumber(item.commission_amount), 0);

  checkInsTotalCount.textContent = checkIns.length;
  checkInsConfirmedCount.textContent = ownerConfirmed;
  checkInsRecordedCount.textContent = adminRecorded;
  checkInsCommissionTotal.textContent = formatINR(commissionTotal);
  checkInsRequestedTotal.textContent = formatINR(requestedTotal);
  checkInsHistoryCount.textContent = `${checkIns.length} check-in${checkIns.length === 1 ? "" : "s"}`;

  if (!checkIns.length) {
    checkInsHistoryList.innerHTML = "<p class='empty-state'>No guest check-ins yet.</p>";
    return;
  }

  checkInsHistoryList.innerHTML = checkIns.map((checkIn) => {
    const guestName =
      checkIn.guest_name ||
      checkIn.customer_name ||
      "Guest";
    const paymentStatus =
      checkIn.commission_payment_status === "PAID"
        ? "Paid to admin"
        : checkIn.payment_requested_at
          ? "Payment requested"
          : checkIn.commission_id
            ? "Not requested yet"
            : "Waiting for admin record";

    return `
      <article class="checkin-history-card">
        <div class="checkin-booking-header">
          <div>
            <span class="booking-code">${escapeHTML(checkIn.booking_code || `Check-in #${checkIn.id}`)}</span>
            <h3>${escapeHTML(checkIn.property_name || "Property")}</h3>
            <p>${escapeHTML(checkIn.room_name || "Room")} for ${escapeHTML(guestName)}</p>
          </div>
          <span class="status-pill ${String(checkIn.status || "").toLowerCase()}">
            ${escapeHTML(formatLabel(checkIn.status))}
          </span>
        </div>

        <div class="booking-detail-grid">
          <p><strong>Check-in Date</strong><span>${formatDate(checkIn.check_in_date)}</span></p>
          <p><strong>Check-out Date</strong><span>${formatDate(checkIn.check_out_date)}</span></p>
          <p><strong>Booking Value</strong><span>${formatINR(checkIn.booking_amount)}</span></p>
          <p><strong>Owner Base Amount</strong><span>${formatINR(checkIn.booking_base_amount)}</span></p>
          <p><strong>Commission Rate</strong><span>${toNumber(checkIn.commission_percentage).toFixed(2)}%</span></p>
          <p><strong>Commission</strong><span>${formatINR(checkIn.commission_amount)}</span></p>
          <p><strong>Payment Status</strong><span>${escapeHTML(paymentStatus)}</span></p>
          <p><strong>Assigned Room ID</strong><span>${escapeHTML(checkIn.assigned_room_code || "Not assigned")}</span></p>
          <p><strong>Requested On</strong><span>${formatDateTime(checkIn.payment_requested_at)}</span></p>
          <p><strong>Paid On</strong><span>${formatDateTime(checkIn.payment_confirmed_at)}</span></p>
          <p><strong>Owner Confirmed</strong><span>${formatDateTime(checkIn.owner_confirmed_at)}</span></p>
          <p><strong>Admin Recorded</strong><span>${formatDateTime(checkIn.admin_recorded_at)}</span></p>
          <p><strong>Checked Out</strong><span>${formatDateTime(checkIn.checked_out_at)}</span></p>
          <p><strong>Guest Email</strong><span>${escapeHTML(checkIn.guest_email || checkIn.user_email || "N/A")}</span></p>
        </div>
      </article>
    `;
  }).join("");
};

const loadCheckInHistory = async () => {
  checkInsHistoryList.innerHTML = "<p class='empty-state'>Loading check-ins...</p>";

  try {
    const data = await fetchJson(`${API_BASE_URL}/checkins/owner/history`);
    checkInHistoryCache = data.data || [];
    checkInHistoryLoaded = true;
    renderCheckInHistory(checkInHistoryCache);
  } catch (error) {
    console.error(error);
    checkInsHistoryList.innerHTML = "<p class='empty-state'>Failed to load check-in history.</p>";
  }
};

const populateRoomManagementPropertyDropdown = () => {
  const selectedValue = roomManagementProperty.value;
  const approved = ownerPropertiesCache.filter(canManageRoomsForProperty);

  roomManagementProperty.innerHTML = '<option value="">All properties</option>';
  approved.forEach((property) => {
    const option = document.createElement("option");
    option.value = property.id;
    option.textContent = property.property_name;
    roomManagementProperty.appendChild(option);
  });

  if ([...roomManagementProperty.options].some((option) => option.value === selectedValue)) {
    roomManagementProperty.value = selectedValue;
  }
};

const renderRoomManagement = (rooms) => {
  const available = rooms.filter((room) => room.occupancy_status === "AVAILABLE").length;
  const occupied = rooms.filter((room) => room.occupancy_status === "OCCUPIED").length;
  const properties = new Set(rooms.map((room) => room.property_id)).size;

  roomsTotalCount.textContent = rooms.length;
  roomsAvailableCount.textContent = available;
  roomsOccupiedCount.textContent = occupied;
  roomsPropertyCount.textContent = properties;
  roomsManagementCount.textContent = `${rooms.length} room${rooms.length === 1 ? "" : "s"}`;

  if (!rooms.length) {
    roomManagementList.innerHTML = "<p class='empty-state'>No rooms found for the selected property.</p>";
    return;
  }

  roomManagementList.innerHTML = rooms.map((room) => {
    const occupiedNow = room.occupancy_status === "OCCUPIED";
    const guestName = room.guest_name || room.customer_name || "Guest";

    return `
      <article class="room-management-card ${occupiedNow ? "occupied" : "available"}">
        <div class="room-management-main">
          <div>
            <span class="booking-code">${escapeHTML(room.property_name || "Property")}</span>
            <h3>${escapeHTML(room.room_id || `Room #${room.id}`)}</h3>
            <p>${escapeHTML(room.room_name || room.room_type || "Room")}</p>
          </div>
          <span class="status-pill ${occupiedNow ? "occupied" : "available"}">
            ${occupiedNow ? "Occupied" : "Available"}
          </span>
        </div>

        <div class="booking-detail-grid">
          <p><strong>Room Type</strong><span>${escapeHTML(room.room_type || "N/A")}</span></p>
          <p><strong>Bed</strong><span>${escapeHTML(room.bed_type || "N/A")}</span></p>
          <p><strong>Size</strong><span>${escapeHTML(room.room_size || "N/A")}</span></p>
          ${
            occupiedNow
              ? `
                <p><strong>Guest</strong><span>${escapeHTML(guestName)}</span></p>
                <p><strong>Booking Code</strong><span>${escapeHTML(room.booking_code || "N/A")}</span></p>
                <p><strong>Check-in</strong><span>${formatDate(room.check_in_date)} ${formatTime(room.check_in_time)}</span></p>
                <p><strong>Check-out</strong><span>${formatDate(room.check_out_date)} ${formatTime(room.check_out_time)}</span></p>
                <p><strong>Guests</strong><span>${escapeHTML(room.guests || 0)}</span></p>
                <p><strong>Guest Email</strong><span>${escapeHTML(room.guest_email || "N/A")}</span></p>
              `
              : `
                <p><strong>Status</strong><span>Ready for check-in</span></p>
              `
          }
        </div>

        ${
          occupiedNow
            ? `
              <div class="booking-actions-row">
                <button type="button" class="approve-booking-btn checkout-room-btn" data-checkin-id="${room.checkin_id}">
                  Mark Check-Out
                </button>
              </div>
            `
            : ""
        }
      </article>
    `;
  }).join("");
};

const loadRoomManagement = async () => {
  roomManagementList.innerHTML = "<p class='empty-state'>Loading rooms...</p>";

  try {
    if (!ownerPropertiesCache.length) {
      const propertiesData = await fetchJson(`${PROPERTY_BASE_URL}/my-properties`);
      ownerPropertiesCache = propertiesData.data || [];
    }

    populateRoomManagementPropertyDropdown();

    const propertyId = roomManagementProperty.value;
    const url = new URL(`${API_BASE_URL}/rooms/owner/management`);
    if (propertyId) {
      url.searchParams.set("property_id", propertyId);
    }

    const data = await fetchJson(url.toString());
    roomManagementCache = data.data || [];
    roomManagementLoaded = true;
    renderRoomManagement(roomManagementCache);
  } catch (error) {
    console.error(error);
    roomManagementList.innerHTML = "<p class='empty-state'>Failed to load room management.</p>";
  }
};

async function markRoomCheckOut(checkinId) {
  if (!window.confirm("Mark this guest as checked out and make the room available?")) {
    return;
  }

  try {
    const data = await fetchJson(`${API_BASE_URL}/checkins/owner/${checkinId}/checkout`, {
      method: "PATCH"
    });

    alert(data.data?.message || "Guest checked out successfully.");
    roomManagementLoaded = false;
    checkInHistoryLoaded = false;
    await loadRoomManagement();
  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to check out guest.");
  }
}

const refreshDashboardData = async () => {
  dashboardLoaded = false;
  await loadDashboard();
};

const approveBooking = async (bookingId) => {
  try {
    await fetchJson(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
      method: "PATCH"
    });
    alert("Booking approved. The user will receive the booking file email if email service is configured.");
    await refreshDashboardData();
  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to approve booking.");
  }
};

const rejectBooking = async (bookingId) => {
  const reason = window.prompt("Reason for rejecting this booking?", "Room unavailable");
  if (reason === null) {
    return;
  }

  try {
    await fetchJson(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reason: reason.trim() || "Rejected by owner" })
    });
    alert("Booking rejected and the user has been notified.");
    await refreshDashboardData();
  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to reject booking.");
  }
};

const renderDashboard = ({ properties, wallet, bookings, transactions }) => {
  const approved = properties.filter((property) => property.approval_status === "APPROVED").length;
  const pending = properties.filter((property) => property.approval_status === "PENDING").length;
  const bookingTotal = getBookingValue(bookings);

  ownerWelcome.textContent = `Welcome back, ${user.full_name || "Owner"}`;
  walletBalance.textContent = formatINR(wallet?.balance);
  pendingBalance.textContent = `Pending: ${formatINR(wallet?.pending_balance)}`;
  totalProperties.textContent = properties.length;
  approvedProperties.textContent = approved;
  pendingProperties.textContent = pending;
  totalRevenue.textContent = formatINR(bookingTotal);
  bookingCount.textContent = `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`;

  if (!bookings.length) {
    recentBookings.innerHTML = "<p class='empty-state'>No bookings yet. Approved rooms will appear here once guests start booking.</p>";
  } else {
    recentBookings.innerHTML = bookings.slice(0, 5).map((booking) => `
      <article class="activity-item">
        <div>
          <strong>${escapeHTML(booking.property_name || "Property")}</strong>
          <span>${escapeHTML(booking.guest_name || "Guest")} - ${escapeHTML(booking.room_name || "Room")}</span>
          <small>${formatDate(booking.created_at)}</small>
        </div>
        <div class="activity-meta">
          <b>${formatINR(booking.total_amount)}</b>
          <em class="status-pill ${String(booking.booking_status || "").toLowerCase()}">${escapeHTML(booking.booking_status || "NEW")}</em>
        </div>
      </article>
    `).join("");
  }

  if (!transactions.length) {
    recentTransactions.innerHTML = "<p class='empty-state'>No wallet transactions yet.</p>";
  } else {
    recentTransactions.innerHTML = transactions.slice(0, 5).map((transaction) => `
      <article class="activity-item">
        <div>
          <strong>${escapeHTML(transaction.transaction_type || "Transaction")}</strong>
          <span>${escapeHTML(transaction.description || "Wallet update")}</span>
          <small>${formatDate(transaction.created_at)}</small>
        </div>
        <div class="activity-meta">
          <b>${formatINR(transaction.amount)}</b>
        </div>
      </article>
    `).join("");
  }

  renderWalletDetails(wallet, transactions);
  renderBookingsDetails(bookings);
};

const loadDashboard = async () => {
  const [propertiesResult, walletResult, bookingsResult, transactionsResult] = await Promise.allSettled([
    fetchJson(`${PROPERTY_BASE_URL}/my-properties`),
    fetchJson(`${API_BASE_URL}/finance/wallet`),
    fetchJson(`${API_BASE_URL}/bookings/owner/dashboard`),
    fetchJson(`${API_BASE_URL}/finance/transactions`)
  ]);

  const properties = propertiesResult.status === "fulfilled" ? (propertiesResult.value.data || []) : [];
  const wallet = walletResult.status === "fulfilled" ? walletResult.value.data : null;
  const bookings = bookingsResult.status === "fulfilled" ? (bookingsResult.value.data || []) : [];
  const transactions = transactionsResult.status === "fulfilled" ? (transactionsResult.value.data || []) : [];

  [propertiesResult, walletResult, bookingsResult, transactionsResult]
    .filter((result) => result.status === "rejected")
    .forEach((result) => console.error(result.reason));

  ownerPropertiesCache = properties;
  ownerWalletCache = wallet;
  ownerBookingsCache = bookings;
  ownerTransactionsCache = transactions;
  renderDashboard({ properties, wallet, bookings, transactions });
  dashboardLoaded = true;
};

// Custom Rules State & Events
let customRules = [];
const customRuleInput = document.getElementById("customRuleInput");
const addCustomRuleBtn = document.getElementById("addCustomRuleBtn");
const customRulesContainer = document.getElementById("customRulesContainer");

const renderCustomRules = () => {
  customRulesContainer.innerHTML = customRules.map((rule, index) => `
    <span class="custom-rule-tag" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: hsl(220, 20%, 94%); color: var(--dark); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); font-size: 13px; font-weight: 600;">
      ${escapeHTML(rule)}
      <button type="button" class="remove-rule-btn" data-index="${index}" style="background: none; border: none; color: var(--dark-muted); font-weight: 900; cursor: pointer; padding: 0 0 0 4px; font-size: 14px; line-height: 1;">&times;</button>
    </span>
  `).join("");
};

if (addCustomRuleBtn && customRuleInput) {
  addCustomRuleBtn.addEventListener("click", () => {
    const value = customRuleInput.value.trim();
    if (value) {
      if (!customRules.includes(value)) {
        customRules.push(value);
        renderCustomRules();
      }
      customRuleInput.value = "";
    }
  });

  customRuleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomRuleBtn.click();
    }
  });
}

if (customRulesContainer) {
  customRulesContainer.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-rule-btn");
    if (removeBtn) {
      const index = parseInt(removeBtn.dataset.index, 10);
      customRules.splice(index, 1);
      renderCustomRules();
    }
  });
}

// Google Maps & Geolocation controls
let creationMap = null;
let creationMarker = null;

// Initialize Leaflet Map for property location selection
function initCreationMap(lat, lng) {
  const mapContainer = document.getElementById("mapContainer");
  if (!mapContainer) return;
  
  mapContainer.style.display = "block";
  const mapCoords = [lat, lng];
  
  if (!creationMap) {
    creationMap = L.map('propertyMap').setView(mapCoords, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(creationMap);
    
    creationMarker = L.marker(mapCoords, { draggable: true }).addTo(creationMap);
    
    // Update coordinates when the marker is dragged
    creationMarker.on('dragend', async () => {
      const position = creationMarker.getLatLng();
      const newLat = position.lat;
      const newLng = position.lng;
      
      document.getElementById("latitude").value = newLat.toFixed(6);
      document.getElementById("longitude").value = newLng.toFixed(6);
      document.getElementById("google_maps_link").value = `https://www.google.com/maps?q=${newLat.toFixed(6)},${newLng.toFixed(6)}`;
      
      await performReverseGeocoding(newLat, newLng);
    });
  } else {
    creationMap.setView(mapCoords, 15);
    creationMarker.setLatLng(mapCoords);
    setTimeout(() => {
      creationMap.invalidateSize();
    }, 200);
  }
}

// Perform reverse geocoding using Nominatim free API to auto-fill address details
async function performReverseGeocoding(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    if (!response.ok) throw new Error("Network response not ok");
    const data = await response.json();
    if (data && data.address) {
      const addr = data.address;
      
      const houseNumber = addr.house_number || "";
      const road = addr.road || addr.pedestrian || addr.suburb || "";
      const neighbourhood = addr.neighbourhood || addr.suburb || addr.village || "";
      const city = addr.city || addr.town || addr.village || addr.municipality || "";
      const state = addr.state || addr.region || "";
      const country = addr.country || "";
      const zip = addr.postcode || "";
      
      // Auto fill target input elements
      const addressVal = [houseNumber, road].filter(Boolean).join(", ") || road || neighbourhood;
      if (addressVal) {
        document.getElementById("address").value = addressVal;
      }
      if (neighbourhood || city) {
        document.getElementById("location").value = neighbourhood || city;
      }
      if (city) {
        document.getElementById("city").value = city;
      }
      if (state) {
        document.getElementById("state").value = state;
      }
      if (country) {
        document.getElementById("country").value = country;
      }
      if (zip) {
        document.getElementById("zip_code").value = zip;
      }
    }
  } catch (error) {
    console.error("Failed to fetch address details:", error);
  }
}

// Extract coordinates from different Google Maps URL structures
function parseCoordinatesFromGoogleMapsLink(url) {
  if (!url) return null;
  
  // Format 1: @lat,lng,zoom
  let match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match && match.length >= 3) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  
  // Format 2: ?q=lat,lng or &q=lat,lng
  match = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match && match.length >= 3) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  
  // Format 3: /place/some-place-name/lat,lng
  match = url.match(/\/place\/[^\/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match && match.length >= 3) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  
  return null;
}

const btnGetLiveLocation = document.getElementById("btnGetLiveLocation");
if (btnGetLiveLocation) {
  btnGetLiveLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    btnGetLiveLocation.disabled = true;
    btnGetLiveLocation.innerText = "⏳ Fetching live coordinates...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        document.getElementById("latitude").value = lat.toFixed(6);
        document.getElementById("longitude").value = lng.toFixed(6);
        document.getElementById("google_maps_link").value = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        
        // Render the map and pin
        initCreationMap(lat, lng);
        
        // Auto fill address components via reverse geocoding
        btnGetLiveLocation.innerText = "⏳ Resolving address...";
        await performReverseGeocoding(lat, lng);
        
        btnGetLiveLocation.disabled = false;
        btnGetLiveLocation.innerText = "📍 Use Live Location";
      },
      (error) => {
        console.error(error);
        btnGetLiveLocation.disabled = false;
        btnGetLiveLocation.innerText = "📍 Use Live Location";
        alert(`Failed to fetch live location: ${error.message}. Please click on the map or enter manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// Synced inputs behavior
const latInput = document.getElementById("latitude");
const lngInput = document.getElementById("longitude");
if (latInput && lngInput) {
  const syncMap = () => {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    if (!isNaN(lat) && !isNaN(lng)) {
      initCreationMap(lat, lng);
    }
  };
  latInput.addEventListener("change", syncMap);
  lngInput.addEventListener("change", syncMap);
}

const mapsLinkInput = document.getElementById("google_maps_link");
if (mapsLinkInput) {
  mapsLinkInput.addEventListener("input", async () => {
    const url = mapsLinkInput.value.trim();
    const coords = parseCoordinatesFromGoogleMapsLink(url);
    if (coords) {
      document.getElementById("latitude").value = coords.lat.toFixed(6);
      document.getElementById("longitude").value = coords.lng.toFixed(6);
      initCreationMap(coords.lat, coords.lng);
      await performReverseGeocoding(coords.lat, coords.lng);
    }
  });
}

document.getElementById("propertyForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData();
  const propertyFields = [
    "property_name",
    "property_type",
    "description",
    "location",
    "address",
    "city",
    "state",
    "country",
    "zip_code",
    "latitude",
    "longitude",
    "google_maps_link",
    "check_in_time",
    "check_out_time"
  ];

  propertyFields.forEach((fieldId) => {
    formData.append(fieldId, document.getElementById(fieldId).value);
  });

  formData.append("property_image", document.getElementById("property_image").files[0]);

  try {
    const data = await fetchJson(PROPERTY_BASE_URL, {
      method: "POST",
      body: formData
    });

    const propertyId = data.propertyId || data.data?.propertyId;
    if (!propertyId) {
      throw new Error("Failed to retrieve property ID from response");
    }

    // Collect stay rules
    const selectedRules = [];
    document.querySelectorAll(".rule-checkbox:checked").forEach((checkbox) => {
      selectedRules.push({
        rule_type: "Predefined",
        rule_value: checkbox.value
      });
    });

    customRules.forEach((rule) => {
      selectedRules.push({
        rule_type: "Custom",
        rule_value: rule
      });
    });

    // POST rules if any are selected/created
    if (selectedRules.length > 0) {
      await fetchJson(`${PROPERTY_BASE_URL}/${propertyId}/rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rules: selectedRules })
      });
    }

    alert("Property and stay rules created successfully!");
    document.getElementById("propertyForm").reset();
    customRules = [];
    renderCustomRules();
    dashboardLoaded = false;
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to create property");
  }
});

async function uploadImages(propertyId) {
  const files = document.getElementById(`image-${propertyId}`).files;

  if (files.length === 0) {
    alert("Select images");
    return;
  }

  const formData = new FormData();

  for (const file of files) {
    formData.append("images", file);
  }

  try {
    const data = await fetchJson(`${PROPERTY_BASE_URL}/${propertyId}/images`, {
      method: "POST",
      body: formData
    });

    alert(data.data?.message || "Images uploaded successfully");
    dashboardLoaded = false;
  } catch (error) {
    console.error(error);
    alert(error.message || "Upload failed");
  }
}

const statusClass = (status) => String(status || "pending").toLowerCase();

async function loadProperties() {
  try {
    const data = await fetchJson(`${PROPERTY_BASE_URL}/my-properties`);
    const properties = data.data || [];

    propertiesContainer.innerHTML = "";
    ownerPropertiesCache = properties;

    if (properties.length === 0) {
      propertiesContainer.innerHTML = "<div class='empty-state full'>No properties found. Create your first property to get started.</div>";
      return;
    }

    properties.forEach((property) => {
      const roomAccessAllowed = canManageRoomsForProperty(property);
      const roomButtonsDisabledAttr = roomAccessAllowed ? "" : "disabled";
      const roomAccessMessage = property.is_active
        ? "Rooms can be managed only for approved properties."
        : "Property deactivated by admin. Room management disabled.";
      const imageUrl = resolveImageUrl(property.property_image);

      propertiesContainer.innerHTML += `
        <div class="card">
          ${
            imageUrl
              ? `<img src="${imageUrl}" class="propertyImage" alt="${escapeHTML(property.property_name)}" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">`
              : "<div class='noImage'>No Image</div>"
          }

          <div class="card-header-row">
            <div>
              <h3>${escapeHTML(property.property_name)}</h3>
              <p>${escapeHTML([property.city, property.state].filter(Boolean).join(", ") || "Location not set")}</p>
            </div>
            <span class="status ${statusClass(property.approval_status)}">${escapeHTML(property.approval_status || "PENDING")}</span>
          </div>

          <div class="property-details">
            <p><strong>Type</strong><span>${escapeHTML(property.property_type || "Property")}</span></p>
            <p><strong>Active</strong><span>${property.is_active ? "Yes" : "No"}</span></p>
          </div>

          <div class="upload-row">
            <input type="file" id="image-${property.id}" multiple>
            <button onclick="uploadImages(${property.id})">Upload Images</button>
          </div>

          <div class="roomButtons">
            <button onclick="openAddRoom(${property.id})" class="roomBtn" ${roomButtonsDisabledAttr}>Add Rooms</button>
            <button onclick="openMyRooms(${property.id})" class="roomBtn secondaryBtn" ${roomButtonsDisabledAttr}>My Rooms</button>
          </div>

          ${roomAccessAllowed ? "" : `<p class="propertyInactiveNotice">${roomAccessMessage}</p>`}
        </div>
      `;
    });
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to load properties");
  }
}

dashboardTab.addEventListener("click", () => {
  setActiveTab(dashboardTab);
  pageTitle.innerText = "Dashboard";

  if (!dashboardLoaded) {
    loadDashboard();
  }
});

createPropertyTab.addEventListener("click", () => {
  setActiveTab(createPropertyTab);
  pageTitle.innerText = "Create Property";
});

myPropertiesTab.addEventListener("click", () => {
  setActiveTab(myPropertiesTab);
  pageTitle.innerText = "My Properties";
  loadProperties();
});

walletTab.addEventListener("click", () => {
  setActiveTab(walletTab);
  pageTitle.innerText = "Wallet";

  if (!dashboardLoaded) {
    loadDashboard().then(() => {
      loadWithdrawalHistory();
    });
    return;
  }

  renderWalletDetails(ownerWalletCache, ownerTransactionsCache);
  loadWithdrawalHistory();
});

bookingsTab.addEventListener("click", () => {
  setActiveTab(bookingsTab);
  pageTitle.innerText = "My Bookings";

  if (!dashboardLoaded) {
    loadDashboard();
    return;
  }

  renderBookingsDetails(ownerBookingsCache);
});

checkInGuestTab.addEventListener("click", () => {
  setActiveTab(checkInGuestTab);
  pageTitle.innerText = "Check-In Guest";
});

checkInHistoryTab.addEventListener("click", () => {
  setActiveTab(checkInHistoryTab);
  pageTitle.innerText = "Check-In History";

  if (!checkInHistoryLoaded) {
    loadCheckInHistory();
    return;
  }

  renderCheckInHistory(checkInHistoryCache);
});

roomManagementTab.addEventListener("click", () => {
  setActiveTab(roomManagementTab);
  pageTitle.innerText = "Room Management";

  if (!roomManagementLoaded) {
    loadRoomManagement();
    return;
  }

  populateRoomManagementPropertyDropdown();
  renderRoomManagement(roomManagementCache);
});

function openAddRoom(propertyId) {
  const selectedProperty = ownerPropertiesCache.find((item) => Number(item.id) === Number(propertyId));

  if (!canManageRoomsForProperty(selectedProperty)) {
    alert("This property is inactive or not approved. Room management is disabled.");
    return;
  }

  localStorage.setItem("selectedPropertyId", propertyId);
  window.location.href = "../rooms/rooms.html?mode=add";
}

function openMyRooms(propertyId) {
  const selectedProperty = ownerPropertiesCache.find((item) => Number(item.id) === Number(propertyId));

  if (!canManageRoomsForProperty(selectedProperty)) {
    alert("This property is inactive or not approved. Room management is disabled.");
    return;
  }

  localStorage.setItem("selectedPropertyId", propertyId);
  window.location.href = "../rooms/rooms.html?mode=my";
}

backBtn.addEventListener("click", () => {
  window.location.href = "../home/home.html";
});

window.uploadImages = uploadImages;
window.openAddRoom = openAddRoom;
window.openMyRooms = openMyRooms;
window.toggleCoupon = toggleCoupon;
window.deleteCoupon = deleteCouponAction;
window.viewCouponDetails = viewCouponDetails;

bookingsList.addEventListener("click", (event) => {
  const approveBtn = event.target.closest(".approve-booking-btn");
  if (approveBtn) {
    const bookingId = approveBtn.dataset.bookingId;
    if (bookingId) {
      approveBooking(bookingId);
    }
    return;
  }

  const rejectBtn = event.target.closest(".reject-booking-btn");
  if (rejectBtn) {
    const bookingId = rejectBtn.dataset.bookingId;
    if (bookingId) {
      rejectBooking(bookingId);
    }
  }
});

checkInLookupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  lookupCheckInBooking();
});

roomManagementProperty.addEventListener("change", () => {
  roomManagementLoaded = false;
  loadRoomManagement();
});

refreshRoomManagementBtn.addEventListener("click", () => {
  roomManagementLoaded = false;
  loadRoomManagement();
});

roomManagementList.addEventListener("click", (event) => {
  const checkoutBtn = event.target.closest(".checkout-room-btn");
  if (checkoutBtn?.dataset.checkinId) {
    markRoomCheckOut(checkoutBtn.dataset.checkinId);
  }
});

// ===============================
// COUPON MANAGEMENT
// ===============================

const couponPropertySelect = document.getElementById("coupon_property_id");
const couponsTotalCount = document.getElementById("couponsTotalCount");
const couponsActiveCount = document.getElementById("couponsActiveCount");
const couponsExpiredCount = document.getElementById("couponsExpiredCount");
const couponsTotalUses = document.getElementById("couponsTotalUses");
const couponListCount = document.getElementById("couponListCount");
const couponsList = document.getElementById("couponsList");

const populateCouponPropertyDropdown = () => {
  const approved = ownerPropertiesCache.filter(
    (p) => p.approval_status === "APPROVED"
  );

  couponPropertySelect.innerHTML = '<option value="">Choose a property...</option>';

  approved.forEach((property) => {
    const opt = document.createElement("option");
    opt.value = property.id;
    opt.textContent = property.property_name;
    couponPropertySelect.appendChild(opt);
  });
};

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

const getUsagePercent = (coupon) => {
  if (!coupon.usage_limit) {
    return coupon.used_count > 0 ? 50 : 0;
  }

  return Math.min(
    Math.round((coupon.used_count / coupon.usage_limit) * 100),
    100
  );
};

document.getElementById("couponForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const propertyId = couponPropertySelect.value;

  if (!propertyId) {
    alert("Please select a property.");
    return;
  }

  const payload = {
    property_id: Number(propertyId),
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
    alert("Please enter a coupon code.");
    return;
  }

  if (payload.discount_value <= 0) {
    alert("Discount value must be greater than 0.");
    return;
  }

  if (new Date(payload.expiry_date) <= new Date(payload.start_date)) {
    alert("Expiry date must be after start date.");
    return;
  }

  try {
    const data = await fetchJson(`${API_BASE_URL}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert(data.data?.message || "Coupon created successfully!");
    document.getElementById("couponForm").reset();
    couponsLoaded = false;
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to create coupon");
  }
});

const loadCoupons = async () => {
  try {
    const data = await fetchJson(`${API_BASE_URL}/coupons/my-coupons`);
    const coupons = data.data || [];
    ownerCouponsCache = coupons;
    couponsLoaded = true;
    renderCouponsList(coupons);
  } catch (error) {
    console.error(error);
    couponsList.innerHTML = "<p class='empty-state'>Failed to load coupons.</p>";
  }
};

const renderCouponsList = (coupons) => {
  const active = coupons.filter((c) => c.computed_status === "ACTIVE").length;
  const expired = coupons.filter((c) => ["EXPIRED", "EXHAUSTED"].includes(c.computed_status)).length;
  const totalUses = coupons.reduce((sum, c) => sum + toNumber(c.used_count), 0);

  couponsTotalCount.textContent = coupons.length;
  couponsActiveCount.textContent = active;
  couponsExpiredCount.textContent = expired;
  couponsTotalUses.textContent = totalUses;
  couponListCount.textContent = `${coupons.length} coupon${coupons.length === 1 ? "" : "s"}`;

  if (!coupons.length) {
    couponsList.innerHTML = "<p class='empty-state'>No coupons yet. Create your first coupon to start offering discounts.</p>";
    return;
  }

  couponsList.innerHTML = coupons.map((coupon) => {
    const usagePercent = getUsagePercent(coupon);
    const statusCls = couponStatusClass(coupon.computed_status);
    const isPercentage = coupon.discount_type === "PERCENTAGE";
    const discountDisplay = isPercentage
      ? `${toNumber(coupon.discount_value)}%`
      : `\u20b9${toNumber(coupon.discount_value).toFixed(0)}`;
    const usageLimitText = coupon.usage_limit
      ? `${coupon.used_count} / ${coupon.usage_limit}`
      : `${coupon.used_count} / \u221e`;

    return `
      <article class="coupon-card">
        <div class="coupon-card-top">
          <div class="coupon-code-display">
            <span class="coupon-code-text">${escapeHTML(coupon.coupon_code)}</span>
            <span class="coupon-status-pill ${statusCls}">${escapeHTML(coupon.computed_status)}</span>
          </div>
          <div class="coupon-discount-badge">
            <strong>${discountDisplay}</strong>
            <small>${isPercentage ? "OFF" : "FLAT"}</small>
          </div>
        </div>

        <div class="coupon-card-body">
          <div class="coupon-meta-grid">
            <p><strong>Property</strong><span>${escapeHTML(coupon.property_name)}</span></p>
            <p><strong>Min Amount</strong><span>\u20b9${toNumber(coupon.minimum_booking_amount).toFixed(0)}</span></p>
            ${coupon.maximum_discount_amount ? `<p><strong>Max Discount</strong><span>\u20b9${toNumber(coupon.maximum_discount_amount).toFixed(0)}</span></p>` : ""}
            <p><strong>Start</strong><span>${formatDate(coupon.start_date)}</span></p>
            <p><strong>Expiry</strong><span>${formatDate(coupon.expiry_date)}</span></p>
            <p><strong>Created</strong><span>${formatDate(coupon.created_at)}</span></p>
          </div>

          <div class="coupon-usage-bar-wrapper">
            <div class="coupon-usage-label">
              <span>Usage</span>
              <span>${usageLimitText}</span>
            </div>
            <div class="coupon-usage-track">
              <div class="coupon-usage-fill" style="width: ${usagePercent}%"></div>
            </div>
          </div>
        </div>

        <div class="coupon-card-actions">
          <button onclick="viewCouponDetails(${coupon.id})" class="coupon-action-btn detail-btn">View Details</button>
          <button onclick="toggleCoupon(${coupon.id})" class="coupon-action-btn toggle-btn">${coupon.is_active ? "Deactivate" : "Activate"}</button>
          <button onclick="deleteCouponAction(${coupon.id})" class="coupon-action-btn delete-btn">Delete</button>
        </div>

        <div id="couponDetail-${coupon.id}" class="coupon-detail-panel hidden"></div>
      </article>
    `;
  }).join("");
};

async function toggleCoupon(couponId) {
  try {
    const data = await fetchJson(`${API_BASE_URL}/coupons/${couponId}/toggle`, {
      method: "PATCH"
    });

    alert(data.data?.message || "Coupon status updated.");
    couponsLoaded = false;
    await loadCoupons();
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to toggle coupon.");
  }
}

async function deleteCouponAction(couponId) {
  if (!confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
    return;
  }

  try {
    const data = await fetchJson(`${API_BASE_URL}/coupons/${couponId}`, {
      method: "DELETE"
    });

    alert(data.data?.message || "Coupon deleted.");
    couponsLoaded = false;
    await loadCoupons();
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to delete coupon.");
  }
}

async function viewCouponDetails(couponId) {
  const panel = document.getElementById(`couponDetail-${couponId}`);

  if (!panel) {
    return;
  }

  // Toggle visibility
  if (!panel.classList.contains("hidden")) {
    panel.classList.add("hidden");
    return;
  }

  panel.innerHTML = '<p class="empty-state">Loading details...</p>';
  panel.classList.remove("hidden");

  try {
    const data = await fetchJson(`${API_BASE_URL}/coupons/${couponId}`);
    const detail = data.data;
    const stats = detail.stats || {};
    const usages = detail.usages || [];

    let usageRowsHTML = "";

    if (usages.length) {
      usageRowsHTML = usages.map((u) => `
        <tr>
          <td>${escapeHTML(u.user_name || "User")}</td>
          <td>${escapeHTML(u.user_email || "N/A")}</td>
          <td>${escapeHTML(u.booking_code || "N/A")}</td>
          <td>\u20b9${toNumber(u.discount_amount).toFixed(2)}</td>
          <td>${formatDate(u.used_at)}</td>
        </tr>
      `).join("");
    } else {
      usageRowsHTML = '<tr><td colspan="5" class="empty-state" style="border:none;">No one has used this coupon yet.</td></tr>';
    }

    panel.innerHTML = `
      <div class="coupon-detail-stats">
        <div class="detail-stat">
          <span>Total Uses</span>
          <strong>${stats.total_uses || 0}</strong>
        </div>
        <div class="detail-stat">
          <span>Unique Users</span>
          <strong>${stats.unique_users || 0}</strong>
        </div>
        <div class="detail-stat">
          <span>Total Discount Given</span>
          <strong>\u20b9${toNumber(stats.total_discount_given).toFixed(2)}</strong>
        </div>
      </div>

      <div class="coupon-usage-table-wrapper">
        <h4>Usage History</h4>
        <table class="coupon-usage-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Booking Code</th>
              <th>Discount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${usageRowsHTML}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error(error);
    panel.innerHTML = '<p class="empty-state">Failed to load coupon details.</p>';
  }
}

createCouponTab.addEventListener("click", async () => {
  setActiveTab(createCouponTab);
  pageTitle.innerText = "Create Coupon";

  // Ensure properties are loaded for the dropdown
  if (!ownerPropertiesCache.length) {
    try {
      const data = await fetchJson(`${PROPERTY_BASE_URL}/my-properties`);
      ownerPropertiesCache = data.data || [];
    } catch (error) {
      console.error(error);
    }
  }

  populateCouponPropertyDropdown();
});

myCouponsTab.addEventListener("click", () => {
  setActiveTab(myCouponsTab);
  pageTitle.innerText = "My Coupons";

  if (!couponsLoaded) {
    loadCoupons();
  } else {
    renderCouponsList(ownerCouponsCache);
  }
});

// COMMISSIONS SYSTEM IMPLEMENTATION
let ownerCommissionsCache = [];
let commissionsLoaded = false;

const loadOwnerCommissions = async () => {
  commissionsList.innerHTML = "<p class='empty-state'>Loading commissions...</p>";

  try {
    const from = commissionFilterFrom.value;
    const to = commissionFilterTo.value;
    const status = commissionFilterStatus.value;
    
    let queryParams = new URLSearchParams();
    if (from) queryParams.append("from", from);
    if (to) queryParams.append("to", to);
    if (status) queryParams.append("status", status);
    
    const url = `${API_BASE_URL}/checkins/owner/commissions?${queryParams.toString()}`;
    const data = await fetchJson(url);
    ownerCommissionsCache = data.data || [];
    commissionsLoaded = true;
    renderOwnerCommissions(ownerCommissionsCache);
  } catch (error) {
    console.error(error);
    commissionsList.innerHTML = "<p class='empty-state'>Failed to load commissions.</p>";
  }
};

const loadOwnerCommissionSummary = async () => {
  try {
    const from = commissionFilterFrom.value;
    const to = commissionFilterTo.value;
    
    let queryParams = new URLSearchParams();
    if (from) queryParams.append("from", from);
    if (to) queryParams.append("to", to);
    
    const url = `${API_BASE_URL}/checkins/owner/commissions/summary?${queryParams.toString()}`;
    const data = await fetchJson(url);
    const summary = data.data || {};
    
    commissionsTotalCount.textContent = summary.total_commissions || 0;
    commissionsPendingAmount.textContent = formatINR(summary.total_pending_amount || 0);
    commissionsPaidAmount.textContent = formatINR(summary.total_paid_amount || 0);
    commissionsOverdueCount.textContent = summary.total_overdue_commissions || 0;
  } catch (error) {
    console.error("Error loading commission summary:", error);
  }
};

const createCommissionPaymentOrder = async (commissionId) => {
  const data = await fetchJson(
    `${API_BASE_URL}/payments/commissions/${commissionId}/create-order`,
    {
      method: "POST"
    }
  );

  return data.data;
};

const verifyCommissionPayment = async (paymentResponse) => {
  const data = await fetchJson(
    `${API_BASE_URL}/payments/commissions/verify-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        payment_method: "RAZORPAY"
      })
    }
  );

  return data.data;
};

const markCommissionPaymentFailed = async (paymentFailure) => {
  const data = await fetchJson(
    `${API_BASE_URL}/payments/commissions/payment-failed`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paymentFailure)
    }
  );

  return data.data;
};

const openCommissionRazorpayCheckout = (order) => new Promise((resolve, reject) => {
  if (!window.Razorpay) {
    markCommissionPaymentFailed({
      razorpay_order_id: order.razorpay_order_id,
      reason: "Razorpay Checkout could not be loaded"
    }).catch((error) => console.error(error));
    reject(new Error("Razorpay Checkout could not be loaded. Please check your internet connection and try again."));
    return;
  }

  let completed = false;
  const checkout = new window.Razorpay({
    key: order.razorpay_key,
    amount: Math.round(Number(order.amount || 0) * 100),
    currency: order.currency || "INR",
    name: "AponGhar",
    description: `Commission ${order.booking_code || order.commission_id || ""}`,
    order_id: order.razorpay_order_id,
    prefill: {
      name: user?.full_name || "",
      email: user?.email || ""
    },
    notes: {
      commission_id: String(order.commission_id),
      booking_code: order.booking_code || ""
    },
    handler: async (response) => {
      completed = true;
      try {
        const verified = await verifyCommissionPayment(response);
        resolve(verified);
      } catch (error) {
        reject(error);
      }
    },
    modal: {
      ondismiss: async () => {
        if (completed) return;
        completed = true;
        try {
          await markCommissionPaymentFailed({
            razorpay_order_id: order.razorpay_order_id,
            reason: "Payment window was closed before payment was completed"
          });
        } catch (error) {
          console.error(error);
        }
        reject(new Error("Payment was cancelled. The commission is still pending."));
      }
    },
    theme: {
      color: "#1a73e8"
    }
  });

  checkout.on("payment.failed", async (response) => {
    if (completed) return;
    completed = true;
    try {
      await markCommissionPaymentFailed({
        razorpay_order_id: order.razorpay_order_id,
        razorpay_payment_id: response.error?.metadata?.payment_id || null,
        error: response.error
      });
    } catch (error) {
      console.error(error);
    }
    reject(new Error(response.error?.description || "Payment failed. The commission is still pending."));
  });

  checkout.open();
});

const payCommissionOnline = async (commissionId) => {
  try {
    const order = await createCommissionPaymentOrder(commissionId);
    await openCommissionRazorpayCheckout(order);
    alert("Commission payment successful!");
    loadOwnerCommissions();
    loadOwnerCommissionSummary();
  } catch (error) {
    console.error("Error paying commission:", error);
    alert(error.message || "Failed to pay commission. Please try again.");
    loadOwnerCommissions();
    loadOwnerCommissionSummary();
  }
};

const renderOwnerCommissions = (commissions) => {
  commissionsHistoryCount.textContent = `${commissions.length} item${commissions.length === 1 ? "" : "s"}`;

  if (!commissions.length) {
    commissionsList.innerHTML = "<p class='empty-state'>No commissions found for the selected filters.</p>";
    return;
  }

  commissionsList.innerHTML = commissions.map((commission) => {
    const isPending = commission.payment_status === "PENDING";
    const guestName = commission.guest_name || "Guest";
    
    let statusClass = "pending";
    if (commission.payment_status === "PAID") {
      statusClass = "approved";
    } else if (commission.payment_status === "CANCELLED") {
      statusClass = "cancelled";
    }
    
    let actionButtonHTML = "";
    if (isPending) {
      actionButtonHTML = `
        <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
          <button class="btn btn-primary pay-commission-btn" data-id="${commission.id}" data-amount="${commission.commission_amount}" style="padding: 8px 16px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
            Pay Commission
          </button>
        </div>
      `;
    }

    let paymentDetailsHTML = "";
    if (commission.payment_status === "PAID") {
      paymentDetailsHTML = `
        <p><strong>Payment Method</strong><span>${escapeHTML(commission.payment_method || "N/A")}</span></p>
        <p><strong>Paid On</strong><span>${formatDateTime(commission.paid_at)}</span></p>
        <p><strong>Proof Notes</strong><span>${escapeHTML(commission.payment_proof_notes || "None")}</span></p>
      `;
    } else if (commission.payment_requested_at) {
      paymentDetailsHTML = `
        <p><strong>Payment Requested</strong><span>${formatDateTime(commission.payment_requested_at)}</span></p>
      `;
    }

    if (commission.razorpay_payment_status === "FAILED") {
      paymentDetailsHTML += `
        <p><strong>Last Payment Attempt</strong><span>${escapeHTML(commission.razorpay_failure_reason || "Failed")}</span></p>
      `;
    }

    return `
      <article class="checkin-history-card">
        <div class="checkin-booking-header">
          <div>
            <span class="booking-code">${escapeHTML(commission.booking_code || `Commission #${commission.id}`)}</span>
            <h3>${escapeHTML(commission.property_name || "Property")}</h3>
            <p>Guest: ${escapeHTML(guestName)}</p>
          </div>
          <span class="status-pill ${statusClass}">
            ${escapeHTML(commission.payment_status)}
          </span>
        </div>

        <div class="booking-detail-grid">
          <p><strong>Booking Total</strong><span>${formatINR(commission.booking_total_amount)}</span></p>
          <p><strong>Base Amount</strong><span>${formatINR(commission.booking_base_amount)}</span></p>
          <p><strong>Commission Rate</strong><span>${toNumber(commission.booking_commission_percentage).toFixed(2)}%</span></p>
          <p><strong>Commission Due</strong><span style="font-weight: bold; color: #1a73e8;">${formatINR(commission.commission_amount)}</span></p>
          <p><strong>Earned On</strong><span>${formatDate(commission.earned_at)}</span></p>
          ${paymentDetailsHTML}
        </div>
        ${actionButtonHTML}
      </article>
    `;
  }).join("");

  // Attach event listeners to buttons
  document.querySelectorAll(".pay-commission-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      payCommissionOnline(id);
    });
  });
};

const openPayCommissionModal = (id, amount) => {
  payCommissionId.value = id;
  payCommissionAmount.value = amount;
  payCommissionMethod.value = "";
  payCommissionNotes.value = "";
  payCommissionModal.classList.remove("hidden");
};

const closePayCommissionModal = () => {
  payCommissionModal.classList.add("hidden");
};

// Bind tab click
commissionsTab.addEventListener("click", () => {
  setActiveTab(commissionsTab);
  pageTitle.innerText = "Commissions";
  loadOwnerCommissions();
  loadOwnerCommissionSummary();
});

// Bind filters
btnFilterCommissions.addEventListener("click", () => {
  loadOwnerCommissions();
  loadOwnerCommissionSummary();
});

btnClearFilterCommissions.addEventListener("click", () => {
  commissionFilterFrom.value = "";
  commissionFilterTo.value = "";
  commissionFilterStatus.value = "";
  loadOwnerCommissions();
  loadOwnerCommissionSummary();
});

// Bind cancel button
btnCancelPayCommission.addEventListener("click", closePayCommissionModal);

// Close modal if clicking overlay
payCommissionModal.addEventListener("click", (e) => {
  if (e.target === payCommissionModal) {
    closePayCommissionModal();
  }
});

// Form submission
payCommissionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = payCommissionId.value;
  const method = payCommissionMethod.value;
  const notes = payCommissionNotes.value;

  try {
    await fetchJson(`${API_BASE_URL}/checkins/owner/commissions/${id}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payment_method: method,
        payment_notes: notes
      })
    });

    alert("Commission payment recorded successfully!");
    closePayCommissionModal();
    loadOwnerCommissions();
    loadOwnerCommissionSummary();
  } catch (error) {
    console.error("Error paying commission:", error);
    alert(error.message || "Failed to record payment. Please try again.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const tabFromUrl = new URLSearchParams(window.location.search).get("tab");

  if (tabFromUrl === "wallet") {
    setActiveTab(walletTab);
    pageTitle.innerText = "Wallet";
    loadDashboard().then(() => {
      loadWithdrawalHistory();
    });
    return;
  }

  if (tabFromUrl === "bookings") {
    setActiveTab(bookingsTab);
    pageTitle.innerText = "My Bookings";
    loadDashboard();
    return;
  }

  if (tabFromUrl === "check-in") {
    setActiveTab(checkInGuestTab);
    pageTitle.innerText = "Check-In Guest";
    return;
  }

  if (tabFromUrl === "check-in-history") {
    setActiveTab(checkInHistoryTab);
    pageTitle.innerText = "Check-In History";
    loadCheckInHistory();
    return;
  }

  if (tabFromUrl === "commissions") {
    setActiveTab(commissionsTab);
    pageTitle.innerText = "Commissions";
    loadOwnerCommissions();
    loadOwnerCommissionSummary();
    return;
  }

  if (tabFromUrl === "rooms") {
    setActiveTab(roomManagementTab);
    pageTitle.innerText = "Room Management";
    loadRoomManagement();
    return;
  }

  if (tabFromUrl === "create-coupon") {
    setActiveTab(createCouponTab);
    pageTitle.innerText = "Create Coupon";
    loadDashboard().then(() => populateCouponPropertyDropdown());
    return;
  }

  if (tabFromUrl === "coupons") {
    setActiveTab(myCouponsTab);
    pageTitle.innerText = "My Coupons";
    loadCoupons();
    return;
  }

  setActiveTab(dashboardTab);
  loadDashboard();
});

// Toggle Payout Methods
document.querySelectorAll('input[name="payoutMethod"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const method = e.target.value;
    if (method === "UPI") {
      upiFields.classList.remove("hidden");
      bankFields.classList.add("hidden");
      document.getElementById("withdrawalUpiId").required = true;
      document.getElementById("withdrawalBankName").required = false;
      document.getElementById("withdrawalAccountNumber").required = false;
      document.getElementById("withdrawalIfsc").required = false;
    } else {
      upiFields.classList.add("hidden");
      bankFields.classList.remove("hidden");
      document.getElementById("withdrawalUpiId").required = false;
      document.getElementById("withdrawalBankName").required = true;
      document.getElementById("withdrawalAccountNumber").required = true;
      document.getElementById("withdrawalIfsc").required = true;
    }
  });
});

// Setup default required state
if (document.getElementById("withdrawalUpiId")) {
  document.getElementById("withdrawalUpiId").required = true;
}

// Withdrawal Form Submit
if (withdrawalForm) {
  withdrawalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = parseFloat(withdrawalAmount.value);
    const accountHolder = withdrawalAccountHolder.value.trim();
    const payoutMethod = document.querySelector('input[name="payoutMethod"]:checked').value;

    withdrawalMessage.style.display = "none";
    withdrawalMessage.className = "withdrawal-message";
    withdrawalSubmitBtn.disabled = true;

    // Client-side validations
    if (!amount || amount <= 0) {
      showWithdrawalMsg("Please enter a valid amount greater than 0.", "error");
      withdrawalSubmitBtn.disabled = false;
      return;
    }

    if (ownerWalletCache && amount > parseFloat(ownerWalletCache.balance)) {
      showWithdrawalMsg(`Insufficient funds. Your available balance is ${formatINR(ownerWalletCache.balance)}.`, "error");
      withdrawalSubmitBtn.disabled = false;
      return;
    }

    const payload = {
      amount,
      account_holder_name: accountHolder
    };

    if (payoutMethod === "UPI") {
      const upiId = document.getElementById("withdrawalUpiId").value.trim();
      if (!upiId) {
        showWithdrawalMsg("Please enter your UPI ID.", "error");
        withdrawalSubmitBtn.disabled = false;
        return;
      }
      payload.upi_id = upiId;
    } else {
      const bankName = document.getElementById("withdrawalBankName").value.trim();
      const accountNumber = document.getElementById("withdrawalAccountNumber").value.trim();
      const ifsc = document.getElementById("withdrawalIfsc").value.trim().toUpperCase();

      if (!bankName || !accountNumber || !ifsc) {
        showWithdrawalMsg("Please fill in all bank details.", "error");
        withdrawalSubmitBtn.disabled = false;
        return;
      }
      payload.bank_name = bankName;
      payload.account_number = accountNumber;
      payload.ifsc_code = ifsc;
    }

    try {
      const res = await fetchJson(`${API_BASE_URL}/finance/withdrawals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      showWithdrawalMsg(res.message || "Withdrawal request submitted successfully!", "success");
      
      withdrawalAmount.value = "";
      document.getElementById("withdrawalUpiId").value = "";
      document.getElementById("withdrawalBankName").value = "";
      document.getElementById("withdrawalAccountNumber").value = "";
      document.getElementById("withdrawalIfsc").value = "";

      await loadDashboard();
      await loadWithdrawalHistory();
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      showWithdrawalMsg(error.message || "Failed to submit withdrawal request.", "error");
    } finally {
      withdrawalSubmitBtn.disabled = false;
    }
  });
}

function showWithdrawalMsg(text, type) {
  withdrawalMessage.textContent = text;
  withdrawalMessage.style.display = "block";
  withdrawalMessage.className = `withdrawal-message ${type}`;
}
