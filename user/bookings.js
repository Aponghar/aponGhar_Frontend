const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api';

const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }
  const path = String(imagePath).trim();
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }
  const normalizedPath = path.replace(/^\/+/, "").replace(/\\/g, "/");
  const assetBase = typeof ASSET_BASE_URL !== "undefined" ? ASSET_BASE_URL : BASE_URL.replace("/api", "");
  return `${assetBase}/${normalizedPath}`;
};

const amenityIdToName = new Map();

const fetchAmenities = async () => {
  try {
    const response = await fetch(`${BASE_URL}/rooms/amenities/list`);
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      data.data.forEach((amenity) => {
        amenityIdToName.set(Number(amenity.id), amenity.name);
      });
    }
  } catch (error) {
    console.error("Failed to fetch amenities:", error);
  }
};

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

    // Parse room images list
    const imagesList = booking.room_images_list ? booking.room_images_list.split("||").filter(Boolean) : [];
    let roomPhotosHTML = "";
    if (imagesList.length > 0) {
      roomPhotosHTML = `
        <div class="room-photos-scrollbar" style="display: flex; gap: 12px; overflow-x: auto; padding: 4px 2px 10px 2px; margin-bottom: 16px; scrollbar-width: thin;">
          ${imagesList.map(img => `
            <img src="${resolveImageUrl(img)}" style="width: 180px; height: 120px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--border-color); flex-shrink: 0; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); transition: transform 0.2s ease; cursor: pointer;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'" onerror="this.onerror=null; this.src='../assets/placeholder-room.jpg';">
          `).join("")}
        </div>
      `;
    } else if (booking.property_image) {
      roomPhotosHTML = `
        <div style="margin-bottom: 16px;">
          <img src="${resolveImageUrl(booking.property_image)}" style="width: 180px; height: 120px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--border-color); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);" onerror="this.onerror=null; this.src='../assets/placeholder-room.jpg';">
        </div>
      `;
    }

    // Parse Amenities
    const normalizeRoomAmenities = (roomAmenities) => {
      if (!roomAmenities) return [];
      if (Array.isArray(roomAmenities)) return roomAmenities;
      if (typeof roomAmenities === "string") {
        try {
          const parsed = JSON.parse(roomAmenities);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    };

    const amenityNames = normalizeRoomAmenities(booking.room_room_amenities)
      .map(id => amenityIdToName.get(Number(id)) || id)
      .filter(Boolean);

    const roomAmenitiesHTML = amenityNames.length > 0
      ? `
        <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <strong style="color: var(--dark); display: block; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">Amenities</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${amenityNames.map(name => `
              <span style="background: hsl(142, 72%, 96%); color: hsl(142, 72%, 29%); border: 1px solid hsl(142, 72%, 90%); padding: 5px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 600; text-transform: none; display: inline-flex; align-items: center; gap: 4px;">✨ ${escapeHTML(name)}</span>
            `).join("")}
          </div>
        </div>
      `
      : "";

    // Parse Benefits
    const normalizeRoomBenefits = (roomBenefits) => {
      if (!roomBenefits) return [];
      if (Array.isArray(roomBenefits)) return roomBenefits;
      if (typeof roomBenefits === "string") {
        try {
          const parsed = JSON.parse(roomBenefits);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    };

    const benefitNames = normalizeRoomBenefits(booking.room_room_benefits).filter(Boolean);
    const roomBenefitsHTML = benefitNames.length > 0
      ? `
        <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <strong style="color: var(--dark); display: block; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">Included Benefits</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${benefitNames.map(benefit => `
              <span style="background: hsl(200, 70%, 96%); color: hsl(200, 80%, 25%); border: 1px solid hsl(200, 70%, 90%); padding: 5px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 600; text-transform: none; display: inline-flex; align-items: center; gap: 4px;">🛡️ ${escapeHTML(benefit)}</span>
            `).join("")}
          </div>
        </div>
      `
      : "";

    // Room Description
    const roomDescriptionHTML = booking.room_description
      ? `
        <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px; color: var(--dark-muted); line-height: 1.5; font-style: italic; font-size: 13.5px; background: hsl(0, 0%, 99%); padding: 12px 16px; border-left: 3px solid var(--primary); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
          "${escapeHTML(booking.room_description)}"
        </div>
      `
      : "";

    card.innerHTML = `
    card.innerHTML = `
      <div class="booking-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="margin: 0; font-size: 22px; font-weight: 800; color: var(--dark);">${booking.property_name || "AponGhar Stay"}</h3>
          <p style="margin: 4px 0 0 0; font-size: 14.5px; color: var(--dark-muted); font-weight: 600;">
            ${escapeHTML(booking.room_name || booking.room_type || "Room")} &bull; ${escapeHTML(booking.booking_code || `Booking #${booking.id}`)}
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="status-badge ${getStatusClass(status)}" style="padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 30px;">${escapeHTML(status)}</span>
        </div>
      </div>

      <div class="booking-card-body" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
        
        <!-- Left Column: Stay & Room Details -->
        <div class="booking-col-room" style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Room Photos -->
          ${roomPhotosHTML}
          
          <!-- Specs Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: hsl(40, 20%, 98%); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; text-align: center;">
            <div>
              <span style="font-size: 16px; display: block; margin-bottom: 2px;">🛏️</span>
              <span style="font-size: 10px; color: var(--dark-muted); display: block; text-transform: uppercase; font-weight: 800; letter-spacing: 0.3px;">Bed Type</span>
              <strong style="font-size: 12px; color: var(--dark); font-weight: 700;">${escapeHTML(booking.room_bed_type || "Standard")}</strong>
            </div>
            <div style="border-left: 1.5px solid var(--border-color); border-right: 1.5px solid var(--border-color);">
              <span style="font-size: 16px; display: block; margin-bottom: 2px;">📐</span>
              <span style="font-size: 10px; color: var(--dark-muted); display: block; text-transform: uppercase; font-weight: 800; letter-spacing: 0.3px;">Room Size</span>
              <strong style="font-size: 12px; color: var(--dark); font-weight: 700;">${escapeHTML(booking.room_room_size || "Not set")}</strong>
            </div>
            <div>
              <span style="font-size: 16px; display: block; margin-bottom: 2px;">👥</span>
              <span style="font-size: 10px; color: var(--dark-muted); display: block; text-transform: uppercase; font-weight: 800; letter-spacing: 0.3px;">Max Guests</span>
              <strong style="font-size: 12px; color: var(--dark); font-weight: 700;">${booking.room_max_adults || 1}A, ${booking.room_max_children || 0}K</strong>
            </div>
          </div>

          <!-- Description -->
          ${roomDescriptionHTML}

          <!-- Amenities & Benefits -->
          ${roomAmenitiesHTML}
          ${roomBenefitsHTML}
        </div>

        <!-- Right Column: Reservation, Host & Billing -->
        <div class="booking-col-res" style="display: flex; flex-direction: column; gap: 16px;">
          
          <!-- Timeline Card (Check-in/out) -->
          <div style="background: hsl(40, 20%, 99%); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 6px; flex-shrink: 0;"></div>
              <div>
                <span style="font-size: 11px; text-transform: uppercase; color: var(--dark-muted); font-weight: 800; letter-spacing: 0.5px; display: block;">Check-in</span>
                <strong style="font-size: 14px; color: var(--dark); display: block; margin-top: 2px;">${formatDate(booking.check_in_date)}</strong>
                <span style="font-size: 12.5px; color: var(--dark-muted); display: block; margin-top: 1px;">at ${formatTime12h(booking.check_in_time)}</span>
              </div>
            </div>
            
            <div style="border-left: 1.5px dashed var(--border-color); margin-left: 3px; height: 16px; min-height: 16px;"></div>

            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--dark); margin-top: 6px; flex-shrink: 0;"></div>
              <div>
                <span style="font-size: 11px; text-transform: uppercase; color: var(--dark-muted); font-weight: 800; letter-spacing: 0.5px; display: block;">Check-out</span>
                <strong style="font-size: 14px; color: var(--dark); display: block; margin-top: 2px;">${formatDate(booking.check_out_date)}</strong>
                <span style="font-size: 12.5px; color: var(--dark-muted); display: block; margin-top: 1px;">at ${formatTime12h(booking.check_out_time)}</span>
              </div>
            </div>
          </div>

          <!-- Details Info Row (Location, Host, Guests) -->
          <div style="background: hsl(40, 20%, 99%); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px; font-size: 13.5px;">
            <div style="display: flex; align-items: flex-start; gap: 10px; text-align: left;">
              <span style="font-size: 16px; flex-shrink: 0; margin-top: 1px;">📍</span>
              <div>
                <strong style="color: var(--dark); font-weight: 700; display: block;">Address</strong>
                <span style="color: var(--dark-muted); display: block; margin-top: 2px; line-height: 1.4;">${escapeHTML(booking.property_address || booking.property_location || "Location not specified")}, ${escapeHTML(booking.property_city || "")}, ${escapeHTML(booking.property_state || "")}</span>
                ${booking.property_google_maps_link ? `
                  <a href="${escapeHTML(booking.property_google_maps_link)}" target="_blank" style="color: var(--primary); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 12.5px;">
                    Directions on Maps &rarr;
                  </a>
                ` : ""}
              </div>
            </div>
            
            ${booking.owner_name ? `
            <div style="display: flex; align-items: flex-start; gap: 10px; border-top: 1.5px solid var(--border-color); padding-top: 10px; text-align: left;">
              <span style="font-size: 16px; flex-shrink: 0;">👤</span>
              <div>
                <strong style="color: var(--dark); font-weight: 700; display: block;">Host</strong>
                <span style="color: var(--dark-muted); display: block; margin-top: 2px;">${escapeHTML(booking.owner_name)}</span>
              </div>
            </div>
            ` : ""}

            <div style="display: flex; align-items: flex-start; gap: 10px; border-top: 1.5px solid var(--border-color); padding-top: 10px; text-align: left;">
              <span style="font-size: 16px; flex-shrink: 0;">📋</span>
              <div>
                <strong style="color: var(--dark); font-weight: 700; display: block;">Reservation</strong>
                <span style="color: var(--dark-muted); display: block; margin-top: 2px;">
                  ${booking.guests || 1} Guest(s) &bull; ${booking.booked_rooms || 1} Room(s) &bull; ${bookingType.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <!-- Invoice Details Widget -->
          <div style="background: hsl(40, 20%, 99%); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 18px 20px; box-shadow: var(--shadow-sm); text-align: left;">
            <strong style="color: var(--dark); display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; font-weight: 800;">Payment Summary</strong>
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

        </div>

      </div>

      ${specialRequests ? `
        <div class="booking-note" style="margin-top: 18px; background: hsl(220, 20%, 98%); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; text-align: left;">
          <span style="display: block; color: var(--dark-muted); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Special requests & Additional guests</span>
          <p style="margin: 0; color: var(--dark); font-size: 13.5px; font-weight: 500; line-height: 1.5; white-space: pre-line;">${escapeHTML(specialRequests)}</p>
        </div>
      ` : ""}

      ${rejectionReason ? `
        <div class="booking-note rejection" style="margin-top: 18px; background: hsl(348, 83%, 98%); border: 1.5px solid hsl(348, 83%, 90%); border-radius: var(--radius-md); padding: 14px 16px; text-align: left;">
          <span style="display: block; color: hsl(348, 83%, 47%); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Rejection reason</span>
          <p style="margin: 0; color: var(--dark); font-size: 13.5px; font-weight: 500; line-height: 1.5;">${rejectionReason}</p>
        </div>
      ` : ""}

      <div class="booking-actions" style="margin-top: 24px; border-top: 1.5px solid var(--border-color); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <p class="refund-note" style="margin: 0; font-size: 13.5px; color: var(--dark-muted); font-weight: 600;">
          Payment Status: <strong style="color: var(--dark);">${escapeHTML(paymentStatus)}</strong>
          ${refundableAmount > 0 && canCancelBooking(booking) ? ` | Refund to wallet: <strong style="color: hsl(142, 72%, 29%);">${money(refundableAmount)}</strong>` : ""}
          ${booking.review_id ? ` | Reviewed: <strong style="color: var(--primary);">${renderStars(Number(booking.review_rating || 0))}</strong>` : ""}
        </p>
        <div style="display: flex; gap: 10px; align-items: center;">
          ${canReviewBooking(booking) ? `
            <button type="button" class="review-btn" data-booking-id="${booking.id}">
              Write Review
            </button>
          ` : ""}
          <button type="button" class="cancel-btn" data-booking-id="${booking.id}" ${canCancelBooking(booking) ? "" : "disabled"}>
            ${getCancelButtonText(booking)}
          </button>
        </div>
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

refreshBtn.addEventListener("click", async () => {
  await fetchAmenities();
  loadBookings();
});

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAmenities();
  loadBookings();
});
