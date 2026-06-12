const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api';

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const bookingsMessage = document.getElementById("bookingsMessage");
const bookingsList = document.getElementById("bookingsList");
const reviewModal = document.getElementById("reviewModal");
const closeReviewModal = document.getElementById("closeReviewModal");
const reviewForm = document.getElementById("reviewForm");
const reviewBookingId = document.getElementById("reviewBookingId");
const reviewModalTitle = document.getElementById("reviewModalTitle");
const reviewModalSubtitle = document.getElementById("reviewModalSubtitle");
const reviewStars = document.getElementById("reviewStars");
const reviewText = document.getElementById("reviewText");
const reviewPhotos = document.getElementById("reviewPhotos");
const reviewFormMessage = document.getElementById("reviewFormMessage");

let selectedRating = 5;

if (!token || !user) {
  window.location.href = "../index.html";
}

const money = (value) => {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `INR ${Math.round(safeAmount).toLocaleString("en-IN")}`;
};

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

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

const authOnlyHeaders = () => ({
  Authorization: `Bearer ${token}`
});

const escapeHTML = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const showMessage = (message) => {
  bookingsMessage.textContent = message;
  bookingsMessage.classList.remove("hidden");
};

const hideMessage = () => {
  bookingsMessage.classList.add("hidden");
};

const safeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getStatusClass = (status) => {
  return String(status || "").toLowerCase();
};

const getRefundableAmount = (booking) => {
  const walletUsed = safeNumber(booking.wallet_used);
  const gatewayPaid = String(booking.payment_status || "").toUpperCase() === "PAID"
    ? safeNumber(booking.gateway_paid)
    : 0;

  return walletUsed + gatewayPaid;
};

const getPayableAmount = (booking) => {
  return Math.max(
    0,
    safeNumber(booking.total_amount) - safeNumber(booking.coupon_discount)
  );
};

const canCancelBooking = (booking) => {
  const status = String(booking.booking_status || "").toUpperCase();
  const checkInStatus = String(booking.checkin_status || "").toUpperCase();

  return (
    status !== "CANCELLED" &&
    status !== "COMPLETED" &&
    !checkInStatus
  );
};

const canReviewBooking = (booking) => {
  const status = String(booking.booking_status || "").toUpperCase();
  return status === "COMPLETED" && !booking.review_id;
};

const renderStars = (rating) => "★".repeat(Math.max(0, rating)) + "☆".repeat(Math.max(0, 5 - rating));

const getCancelButtonText = (booking) => {
  if (booking.checkin_status) {
    return "Checked In";
  }

  return canCancelBooking(booking)
    ? "Cancel Booking"
    : "Closed";
};

const cancelBooking = async (bookingId) => {
  const confirmed = window.confirm("Cancel this booking? Any paid amount will be credited to your wallet.");
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: authHeaders()
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Unable to cancel booking.");
    }

    alert(data.data?.message || "Booking cancelled successfully.");
    loadBookings();
  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to cancel booking right now.");
  }
};

const setReviewRating = (rating) => {
  selectedRating = rating;
  [...reviewStars.querySelectorAll("button")].forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.rating) <= selectedRating);
  });
};

const openReviewModal = (booking) => {
  reviewBookingId.value = booking.id;
  reviewModalTitle.textContent = `Review ${booking.property_name || "your stay"}`;
  reviewModalSubtitle.textContent = `${booking.room_name || booking.room_type || "Room"} | ${booking.booking_code || `Booking #${booking.id}`}`;
  reviewText.value = "";
  reviewPhotos.value = "";
  reviewFormMessage.textContent = "";
  setReviewRating(5);
  reviewModal.classList.remove("hidden");
};

const closeReview = () => {
  reviewModal.classList.add("hidden");
};

const submitReview = async (event) => {
  event.preventDefault();

  const bookingId = reviewBookingId.value;
  if (!bookingId) {
    return;
  }

  const selectedFiles = [...reviewPhotos.files];
  if (selectedFiles.length > 5) {
    reviewFormMessage.textContent = "You can upload up to 5 photos.";
    return;
  }

  const formData = new FormData();
  formData.append("booking_id", bookingId);
  formData.append("rating", String(selectedRating));
  formData.append("review_text", reviewText.value.trim());
  selectedFiles.forEach((file) => formData.append("photos", file));

  reviewFormMessage.textContent = "Submitting review...";

  try {
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: authOnlyHeaders(),
      body: formData
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Unable to submit review.");
    }

    alert(data.data?.message || "Review submitted successfully.");
    closeReview();
    loadBookings();
  } catch (error) {
    console.error(error);
    reviewFormMessage.textContent = error.message || "Unable to submit review right now.";
  }
};

const renderBookings = (bookings) => {
  bookingsList.innerHTML = "";

  if (!Array.isArray(bookings) || bookings.length === 0) {
    showMessage("No bookings yet. Your booking history will appear here after you book a room.");
    return;
  }

  hideMessage();

  bookings.forEach((booking) => {
    const status = booking.booking_status || "PENDING";
    const paymentStatus = booking.payment_status || "PENDING";
    const refundableAmount = getRefundableAmount(booking);
    const card = document.createElement("article");
    card.className = "booking-card";

    const bookingType = booking.booking_type || "NIGHTLY";
    const paymentMethod = booking.payment_method || "OFFLINE";
    const specialRequests = booking.special_requests || "";
    const rejectionReason = booking.rejection_reason || "";

    card.innerHTML = `
      <div class="booking-topline">
        <div class="booking-title">
          <h3>${booking.property_name || "AponGhar booking"}</h3>
          <p>${escapeHTML(booking.room_name || booking.room_type || "Room")} | ${escapeHTML(booking.booking_code || `Booking #${booking.id}`)}</p>
        </div>
        <span class="status-badge ${getStatusClass(status)}">${escapeHTML(status)}</span>
      </div>

      <div class="booking-meta">
        <span>Check-in<strong>${formatDate(booking.check_in_date)}</strong></span>
        <span>Check-out<strong>${formatDate(booking.check_out_date)}</strong></span>
        <span>Guests<strong>${booking.guests || 0}</strong></span>
        <span>Rooms<strong>${booking.booked_rooms || 1}</strong></span>
        <span>Type<strong>${bookingType.replace("_", " ")}</strong></span>
          <span>Payment<strong>${escapeHTML(paymentMethod)}</strong></span>
      </div>

      <div class="money-grid">
        <div class="money-row">
          <span>Total room price</span>
          <strong>${money(booking.total_amount)}</strong>
        </div>
        <div class="money-row">
          <span>Included platform commission</span>
          <strong>${money(booking.booking_commission_amount)}</strong>
        </div>
        <div class="money-row">
          <span>Coupon discount</span>
          <strong>${money(booking.coupon_discount)}</strong>
        </div>
        <div class="money-row">
          <span>Payable after discount</span>
          <strong>${money(getPayableAmount(booking))}</strong>
        </div>
        <div class="money-row">
          <span>Wallet used</span>
          <strong>${money(booking.wallet_used)}</strong>
        </div>
        <div class="money-row">
          <span>Gateway paid</span>
          <strong>${money(booking.gateway_paid)}</strong>
        </div>
      </div>

      ${specialRequests ? `
        <div class="booking-note">
          <span>Special requests</span>
          <p>${specialRequests}</p>
        </div>
      ` : ""}

      ${rejectionReason ? `
        <div class="booking-note rejection">
          <span>Rejection reason</span>
          <p>${rejectionReason}</p>
        </div>
      ` : ""}

      <div class="booking-actions">
        <p class="refund-note">
          Payment: <strong>${escapeHTML(paymentStatus)}</strong>
          ${refundableAmount > 0 && canCancelBooking(booking) ? ` | Refund to wallet: <strong>${money(refundableAmount)}</strong>` : ""}
          ${booking.review_id ? ` | Reviewed: <strong>${renderStars(Number(booking.review_rating || 0))}</strong>` : ""}
        </p>
        ${canReviewBooking(booking) ? `
          <button type="button" class="review-btn" data-booking-id="${booking.id}">
            Write Review
          </button>
        ` : ""}
        <button type="button" class="cancel-btn" data-booking-id="${booking.id}" ${canCancelBooking(booking) ? "" : "disabled"}>
          ${getCancelButtonText(booking)}
        </button>
      </div>
    `;

    bookingsList.appendChild(card);
  });
};

const loadBookings = async () => {
  showMessage("Loading bookings...");

  try {
    const response = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      headers: authHeaders()
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Unable to load bookings.");
    }

    renderBookings(data.data);
  } catch (error) {
    console.error(error);
    bookingsList.innerHTML = "";
    showMessage(error.message || "Unable to load bookings right now.");
  }
};

bookingsList.addEventListener("click", (event) => {
  const reviewButton = event.target.closest(".review-btn");
  if (reviewButton) {
    const bookingId = reviewButton.dataset.bookingId;
    loadBookingsForReview(bookingId);
    return;
  }

  const cancelButton = event.target.closest(".cancel-btn");
  if (!cancelButton || cancelButton.disabled) {
    return;
  }

  cancelBooking(cancelButton.dataset.bookingId);
});

const loadBookingsForReview = async (bookingId) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      headers: authHeaders()
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Unable to load booking.");
    }

    const booking = (data.data || []).find((item) => Number(item.id) === Number(bookingId));
    if (!booking || !canReviewBooking(booking)) {
      alert("This booking is not ready for review.");
      loadBookings();
      return;
    }

    openReviewModal(booking);
  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to open review form.");
  }
};

reviewStars.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-rating]");
  if (!button) {
    return;
  }
  setReviewRating(Number(button.dataset.rating));
});

closeReviewModal.addEventListener("click", closeReview);
reviewModal.addEventListener("click", (event) => {
  if (event.target === reviewModal) {
    closeReview();
  }
});
reviewForm.addEventListener("submit", submitReview);

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../index.html";
});

refreshBtn.addEventListener("click", loadBookings);

document.addEventListener("DOMContentLoaded", loadBookings);
