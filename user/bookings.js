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
let allBookings = [];

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

const formatTime12h = (timeStr) => {
  if (!timeStr) return "Not set";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
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

  let refundAmount = walletUsed + gatewayPaid;
  if (refundAmount > 0) {
    const checkInDate = new Date(booking.check_in_date);
    const checkInTimeStr = booking.check_in_time || "12:00:00";
    const parts = checkInTimeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;

    const checkInDateTime = new Date(
      checkInDate.getFullYear(),
      checkInDate.getMonth(),
      checkInDate.getDate(),
      hours,
      minutes,
      seconds
    );

    const now = new Date();
    const msDiff = checkInDateTime.getTime() - now.getTime();
    const hoursDiff = msDiff / (1000 * 60 * 60);

    if (hoursDiff <= 24) {
      refundAmount = Math.round(refundAmount * 0.5);
    }
  }
  return refundAmount;
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
  const booking = allBookings.find(b => String(b.id) === String(bookingId));
  let message = "Cancel this booking? Any paid amount will be credited to your wallet.";
  
  if (booking) {
    const walletUsed = safeNumber(booking.wallet_used);
    const gatewayPaid = String(booking.payment_status || "").toUpperCase() === "PAID"
      ? safeNumber(booking.gateway_paid)
      : 0;
    const totalRefund = walletUsed + gatewayPaid;
    if (totalRefund > 0) {
      const checkInDate = new Date(booking.check_in_date);
      const checkInTimeStr = booking.check_in_time || "12:00:00";
      const parts = checkInTimeStr.split(":");
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      const seconds = parseInt(parts[2], 10) || 0;

      const checkInDateTime = new Date(
        checkInDate.getFullYear(),
        checkInDate.getMonth(),
        checkInDate.getDate(),
        hours,
        minutes,
        seconds
      );

      const now = new Date();
      const msDiff = checkInDateTime.getTime() - now.getTime();
      const hoursDiff = msDiff / (1000 * 60 * 60);

      if (hoursDiff <= 24) {
        const penaltyRefund = Math.round(totalRefund * 0.5);
        message = `Cancel this booking? As it is within 24 hours of check-in, only a 50% refund (${money(penaltyRefund)}) will be credited to your wallet according to our policy.`;
      }
    }
  }

  const confirmed = await window.customConfirm(message);
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
  allBookings = bookings;
  bookingsList.innerHTML = "";

  if (!Array.isArray(bookings) || bookings.length === 0) {
    showMessage("No bookings yet. Your booking history will appear here after you book a room.");
    return;
  }

  hideMessage();

  bookings.forEach((booking) => {
    const status = booking.booking_status || "PENDING";
    const paymentStatus = booking.payment_status || "PENDING";
    const isPaid = String(paymentStatus).toUpperCase() === "PAID";
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
        <span>Check-in<strong>${formatDate(booking.check_in_date)} at ${formatTime12h(booking.check_in_time)}</strong></span>
        <span>Check-out<strong>${formatDate(booking.check_out_date)} at ${formatTime12h(booking.check_out_time)}</strong></span>
        <span>Guests<strong>${booking.guests || 0}</strong></span>
        <span>Rooms<strong>${booking.booked_rooms || 1}</strong></span>
        <span>Type<strong>${bookingType.replace("_", " ")}</strong></span>
          <span>Payment<strong>${escapeHTML(paymentMethod)}</strong></span>
      </div>

      <!-- Property & Location Details -->
      <div class="booking-property-details" style="margin-top: 14px; padding: 14px; background: hsl(220, 20%, 98%); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: grid; gap: 8px; font-size: 13.5px; text-transform: none;">
        <div style="display: flex; align-items: flex-start; gap: 8px; text-transform: none; text-align: left;">
          <span style="font-size: 16px; flex-shrink: 0;">📍</span>
          <div style="text-transform: none;">
            <strong style="color: var(--dark); display: block; margin-bottom: 2px; text-transform: none;">Property Location</strong>
            <span style="color: var(--dark-muted); line-height: 1.4; text-transform: none;">${escapeHTML(booking.property_address || booking.property_location || "Location not specified")}, ${escapeHTML(booking.property_city || "")}, ${escapeHTML(booking.property_state || "")} (${escapeHTML(booking.property_type || "Stay")})</span>
            ${booking.property_google_maps_link ? `
              <a href="${escapeHTML(booking.property_google_maps_link)}" target="_blank" style="color: var(--primary); font-weight: 700; text-decoration: none; display: block; margin-top: 4px; font-size: 12.5px; text-transform: none;">
                View on Google Maps &rarr;
              </a>
            ` : ""}
          </div>
        </div>
        ${booking.owner_name ? `
        <div style="display: flex; align-items: flex-start; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 4px; text-transform: none; text-align: left;">
          <span style="font-size: 16px; flex-shrink: 0;">👤</span>
          <div style="text-transform: none;">
            <strong style="color: var(--dark); display: block; margin-bottom: 2px; text-transform: none;">Host</strong>
            <span style="color: var(--dark-muted); text-transform: none;">${escapeHTML(booking.owner_name)}</span>
          </div>
        </div>
        ` : ""}
      </div>

      <div class="booking-payment-details" style="margin-top: 14px;">
        <div class="payment-details-summary">
          <div class="detail-line">
            <span>Room Price</span>
            <span>${money(booking.total_amount)}</span>
          </div>
          ${safeNumber(booking.coupon_discount) > 0 ? `
          <div class="detail-line discount">
            <span>Coupon Discount</span>
            <span>-${money(booking.coupon_discount)}</span>
          </div>
          ` : ""}
          ${safeNumber(booking.wallet_used) > 0 ? `
          <div class="detail-line wallet">
            <span>Wallet Used</span>
            <span>-${money(booking.wallet_used)}</span>
          </div>
          ` : ""}
          ${isPaid && safeNumber(booking.gateway_paid) > 0 ? `
          <div class="detail-line gateway">
            <span>Gateway Paid</span>
            <span>${money(booking.gateway_paid)}</span>
          </div>
          ` : ""}
          <div class="detail-divider"></div>
          <div class="detail-line total">
            ${isPaid ? `
              <span>Total Paid</span>
              <strong>${money(safeNumber(booking.gateway_paid) + safeNumber(booking.wallet_used))}</strong>
            ` : `
              <span>Payable at Property</span>
              <strong>${money(Math.max(0, getPayableAmount(booking) - safeNumber(booking.wallet_used)))}</strong>
            `}
          </div>
        </div>
      </div>

      ${specialRequests ? `
        <div class="booking-note">
          <span>Special requests & Additional guests</span>
          <p style="white-space: pre-line;">${escapeHTML(specialRequests)}</p>
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
  hideMessage();
  bookingsList.innerHTML = Array(3).fill(0).map(() => `
    <div class="booking-card skeleton" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; background: #fff; margin-bottom: 20px;">
      <div class="booking-topline" style="display: flex; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <div class="skeleton-line title pulsing" style="height: 20px; width: 180px; margin-bottom: 8px;"></div>
          <div class="skeleton-line pulsing" style="height: 14px; width: 130px;"></div>
        </div>
        <div class="skeleton-line pulsing" style="height: 24px; width: 80px; border-radius: 12px;"></div>
      </div>
      <div class="booking-meta" style="margin: 16px 0; padding: 14px 0; border-top: 1.5px solid var(--border-color); border-bottom: 1.5px solid var(--border-color);">
        <div class="skeleton-line pulsing" style="height: 35px; width: 100%;"></div>
      </div>
      <div class="skeleton-line pulsing" style="height: 80px; width: 100%; border-radius: 10px;"></div>
    </div>
  `).join("");

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
