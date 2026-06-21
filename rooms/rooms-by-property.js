const BASE_URL = typeof API_BASE_URL !== 'undefined'
  ? API_BASE_URL
  : 'https://api.aponghar.in/api';

// ASSET_BASE_URL is already defined in config.js

  
const IMAGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><rect width='100%' height='100%' fill='%23f3f4f6'/><g fill='%239ca3af' transform='translate(180, 110) scale(1.5)'><path d='M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.12-1.12A1 1 0 0010.586 3H7.414a1 1 0 00-.707.293L5.586 4.707A1 1 0 014.88 5H4zM10 8a3 3 0 100 6 3 3 0 000-6z'/></g></svg>";

const profileBtn = document.getElementById("profileBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const logoutBtn = document.getElementById("logoutBtn");
const joinBtn = document.getElementById("joinBtn");
const walletMenuLink = document.getElementById("walletMenuLink");
const bookingsMenuLink = document.getElementById("bookingsMenuLink");
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const closeBookingModal = document.getElementById("closeBookingModal");
const bookingRoomName = document.getElementById("bookingRoomName");
const bookingPricingSummary = document.getElementById("bookingPricingSummary");
const bookingCheckIn = document.getElementById("bookingCheckIn");
const bookingCheckOut = document.getElementById("bookingCheckOut");
const bookingCheckInTime = document.getElementById("bookingCheckInTime");
const bookingCheckOutTime = document.getElementById("bookingCheckOutTime");
const bookingGuests = document.getElementById("bookingGuests");
const bookingRooms = document.getElementById("bookingRooms");
const bookingGuestName = document.getElementById("bookingGuestName");
const bookingGuestEmail = document.getElementById("bookingGuestEmail");
const bookingGuestAge = document.getElementById("bookingGuestAge");
const bookingCustomerName = document.getElementById("bookingCustomerName");
const bookingPhoneContainer = document.getElementById("bookingPhoneContainer");
const bookingPhone = document.getElementById("bookingPhone");
const bookingCouponCode = document.getElementById("bookingCouponCode");
const useWalletInput = document.getElementById("useWalletInput");
const specialRequests = document.getElementById("specialRequests");
const bookingModalMessage = document.getElementById("bookingModalMessage");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponStatusMessage = document.getElementById("couponStatusMessage");
const walletBalanceInfo = document.getElementById("walletBalanceInfo");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryDiscountRow = document.getElementById("summaryDiscountRow");
const summaryDiscount = document.getElementById("summaryDiscount");
const summaryWalletRow = document.getElementById("summaryWalletRow");
const summaryWallet = document.getElementById("summaryWallet");
const summaryTotal = document.getElementById("summaryTotal");
const openPropertyReviewBtn = document.getElementById("openPropertyReviewBtn");
const propertyReviewModal = document.getElementById("propertyReviewModal");
const closePropertyReviewModal = document.getElementById("closePropertyReviewModal");
const propertyReviewForm = document.getElementById("propertyReviewForm");
const propertyReviewBookingId = document.getElementById("propertyReviewBookingId");
const propertyReviewModalTitle = document.getElementById("propertyReviewModalTitle");
const propertyReviewModalSubtitle = document.getElementById("propertyReviewModalSubtitle");
const propertyReviewStars = document.getElementById("propertyReviewStars");
const propertyReviewText = document.getElementById("propertyReviewText");
const propertyReviewPhotos = document.getElementById("propertyReviewPhotos");
const propertyReviewFormMessage = document.getElementById("propertyReviewFormMessage");
const addGuestBtn = document.getElementById("addGuestBtn");
const additionalGuestsContainer = document.getElementById("additionalGuestsContainer");

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const amenityIdToName = new Map();
let allRooms = [];
let selectedBookingRoom = null;
let currentProperty = null;
let userWalletBalance = 0;
let appliedCouponDiscount = 0;
let appliedCouponCode = "";
let eligiblePropertyReviewBooking = null;
let selectedReviewRating = 5;

if (token && user) {
  profileBtn.innerHTML = `${user.full_name} v`;

  if (user.role === "OWNER") {
    joinBtn.innerHTML = "Dashboard";
    if (walletMenuLink) {
      walletMenuLink.href = "../owner/owner.html?tab=wallet";
    }
    if (bookingsMenuLink) {
      bookingsMenuLink.href = "../owner/owner.html?tab=bookings";
    }
  } else {
    joinBtn.innerHTML = "Join With Us";
  }
} else {
  profileBtn.innerHTML = "Login / Sign Up";
  joinBtn.innerHTML = "Become a Partner";
}

profileBtn.addEventListener("click", () => {
  if (!token || !user) {
    window.location.href = "../auth/auth.html";
    return;
  }
  dropdownMenu.classList.toggle("active");
});

window.addEventListener("click", (event) => {
  if (!profileBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.classList.remove("active");
  }
});

joinBtn.addEventListener("click", () => {
  if (!token || !user) {
    window.location.href = "../auth/auth.html";
    return;
  }
  if (user.role === "OWNER") {
    window.location.href = "../owner/owner.html";
    return;
  }

  if (user.role === "ADMIN") {
    window.location.href = "../admin/admin.html";
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../index.html";
});

const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get("propertyId");

if (!propertyId) {
  alert("Property not found");
  window.location.href = "../home/home.html";
}

const safeNumber = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
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

const formatINR = (amount) => {
  const roundedAmount = Math.round(safeNumber(amount));
  return `&#8377; ${roundedAmount.toLocaleString("en-IN")}`;
};

const formatINRText = (amount) => {
  const roundedAmount = Math.round(safeNumber(amount));
  return `INR ${roundedAmount.toLocaleString("en-IN")}`;
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

const normalizeImageList = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return [...new Set(images.map((image) => resolveImageUrl(image.image_url || image)).filter(Boolean))];
};

const buildRoomGallery = (images, altText) => {
  if (!images.length) {
    return "<div class='room-gallery empty-gallery'><div class='room-gallery-placeholder'>No room photos</div></div>";
  }

  const slides = images.map((image, index) => `
    <img src="${image}" alt="${altText}" class="gallery-image ${index === 0 ? "active" : ""}" loading="lazy" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
  `).join("");

  const controls = images.length > 1
    ? `
      <button type="button" class="gallery-btn prev" data-gallery-move="-1" aria-label="Previous room photo">&lt;</button>
      <button type="button" class="gallery-btn next" data-gallery-move="1" aria-label="Next room photo">&gt;</button>
      <span class="gallery-count">1 / ${images.length}</span>
    `
    : "";

  return `<div class="room-gallery" data-gallery-index="0">${slides}${controls}</div>`;
};

const moveGallery = (gallery, direction) => {
  const images = Array.from(gallery.querySelectorAll(".gallery-image"));
  if (images.length <= 1) {
    return;
  }

  const currentIndex = Number(gallery.dataset.galleryIndex || 0);
  const nextIndex = (currentIndex + direction + images.length) % images.length;

  images[currentIndex]?.classList.remove("active");
  images[nextIndex].classList.add("active");
  gallery.dataset.galleryIndex = String(nextIndex);

  const count = gallery.querySelector(".gallery-count");
  if (count) {
    count.textContent = `${nextIndex + 1} / ${images.length}`;
  }
};

const normalizeRoomAmenities = (roomAmenities) => {
  if (!roomAmenities) {
    return [];
  }

  if (Array.isArray(roomAmenities)) {
    return roomAmenities;
  }

  if (typeof roomAmenities === "string") {
    try {
      const parsed = JSON.parse(roomAmenities);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const getAmenityNames = (roomAmenities) => {
  const normalized = normalizeRoomAmenities(roomAmenities);
  const names = normalized
    .map((amenity) => {
      const numericId = Number(amenity);
      if (Number.isFinite(numericId) && amenityIdToName.has(numericId)) {
        return amenityIdToName.get(numericId);
      }

      if (typeof amenity === "string") {
        if (/^\d+$/.test(amenity.trim())) {
          return "";
        }
        return amenity.trim();
      }

      return "";
    })
    .filter(Boolean);

  return [...new Set(names)];
};

const normalizeRoomBenefits = (roomBenefits) => {
  if (!roomBenefits) {
    return [];
  }

  if (Array.isArray(roomBenefits)) {
    return roomBenefits.filter(Boolean);
  }

  if (typeof roomBenefits === "string") {
    try {
      const parsed = JSON.parse(roomBenefits);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const getSelectedAmenityFilterIds = () => {
  return Array.from(document.querySelectorAll("#amenityFilters input:checked"))
    .map((input) => Number(input.value))
    .filter((id) => Number.isFinite(id));
};

const getAmenityFilterIdsFromUrl = () => {
  const amenityParam = urlParams.get("amenities") || "";

  return amenityParam
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id));
};

const renderAmenityFilters = () => {
  const amenityFilters = document.getElementById("amenityFilters");

  if (!amenityFilters) {
    return;
  }

  const amenities = Array.from(amenityIdToName.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!amenities.length) {
    amenityFilters.innerHTML = "<p class='empty-filter'>No amenities available.</p>";
    return;
  }

  const selectedAmenityIds = new Set(getAmenityFilterIdsFromUrl());

  amenityFilters.innerHTML = amenities.map((amenity) => `
    <label class="checkbox-item">
      <input type="checkbox" value="${amenity.id}" ${selectedAmenityIds.has(amenity.id) ? "checked" : ""}>
      ${amenity.name}
    </label>
  `).join("");
};

const roomMatchesAmenityFilters = (room, selectedAmenityIds) => {
  if (!selectedAmenityIds.length) {
    return true;
  }

  const roomAmenities = normalizeRoomAmenities(room.room_amenities);
  const roomAmenityIds = roomAmenities
    .map((amenity) => Number(amenity))
    .filter((id) => Number.isFinite(id));

  const roomAmenityNames = getAmenityNames(room.room_amenities)
    .map((name) => name.toLowerCase());

  return selectedAmenityIds.every((selectedId) => {
    if (roomAmenityIds.includes(selectedId)) {
      return true;
    }

    const selectedName = amenityIdToName.get(selectedId);
    return selectedName ? roomAmenityNames.includes(selectedName.toLowerCase()) : false;
  });
};

const updateRoomsSummary = (visibleCount, totalCount) => {
  const summary = document.getElementById("roomsSummary");

  if (!summary) {
    return;
  }

  if (!totalCount) {
    summary.textContent = "";
    return;
  }

  summary.textContent = visibleCount === totalCount
    ? `Showing ${totalCount} available room${totalCount === 1 ? "" : "s"}`
    : `Showing ${visibleCount} of ${totalCount} room${totalCount === 1 ? "" : "s"}`;
};

const applyRoomFilters = () => {
  const selectedAmenityIds = getSelectedAmenityFilterIds();
  const filteredRooms = allRooms.filter((room) => roomMatchesAmenityFilters(room, selectedAmenityIds));

  displayRooms(filteredRooms);
  updateRoomsSummary(filteredRooms.length, allRooms.length);
};

const buildPricingOptions = (room) => {
  const options = [];
  const commission = safeNumber(room.commission_percentage);
  const multiplier = 1 + (commission / 100);

  const applyCommission = (price) => {
    const p = safeNumber(price);
    return p > 0 ? Math.round(p * multiplier) : 0;
  };

  const perNight = applyCommission(room.price_per_night);
  const price3Hours = applyCommission(room.price_3hours);
  const price6Hours = applyCommission(room.price_6hours);
  const price9Hours = applyCommission(room.price_9hours);

  if (perNight > 0) {
    options.push({ key: "PER_NIGHT", label: "Per Night", amount: perNight, period: "/night" });
  }

  if (price3Hours > 0) {
    options.push({ key: "HOUR_3", label: "3 Hours", amount: price3Hours, period: "/3h" });
  }

  if (price6Hours > 0) {
    options.push({ key: "HOUR_6", label: "6 Hours", amount: price6Hours, period: "/6h" });
  }

  if (price9Hours > 0) {
    options.push({ key: "HOUR_9", label: "9 Hours", amount: price9Hours, period: "/9h" });
  }

  if (options.length === 0) {
    const basePrice = applyCommission(room.base_price);
    options.push({ key: "BASE", label: "Base Price", amount: basePrice, period: "" });
  }

  return options;
};

const getHourlyDuration = (pricingKey) => {
  if (pricingKey === "HOUR_3") return 3;
  if (pricingKey === "HOUR_6") return 6;
  if (pricingKey === "HOUR_9") return 9;
  return 0;
};

const addHoursToTime = (timeValue, hours) => {
  const [hour = "0", minute = "0"] = String(timeValue || "12:00").split(":");
  const startMinutes = (Number(hour) * 60) + Number(minute);
  const nextMinutes = (startMinutes + (hours * 60)) % (24 * 60);
  const nextHour = String(Math.floor(nextMinutes / 60)).padStart(2, "0");
  const nextMinute = String(nextMinutes % 60).padStart(2, "0");
  return `${nextHour}:${nextMinute}`;
};

const getSelectedPaymentMethod = () => {
  return document.querySelector('input[name="bookingPaymentMethod"]:checked')?.value || "OFFLINE";
};

const getSelectedPricingFromCard = (roomCard) => {
  const selectedOption = roomCard.querySelector('input[type="radio"]:checked');
  const pricingKey = selectedOption ? selectedOption.value : "PER_NIGHT";
  const optionCard = selectedOption?.closest(".price-option-card");

  return {
    key: pricingKey,
    label: selectedOption?.dataset.label || optionCard?.querySelector(".price-option-title")?.textContent || "Per Night",
    amount: safeNumber(selectedOption?.dataset.amount),
    period: selectedOption?.dataset.period || ""
  };
};

const fetchAmenities = async () => {
  try {
    const response = await fetch(`${BASE_URL}/rooms/amenities/list`);
    const data = await response.json();

    if (!data.success || !Array.isArray(data.data)) {
      return;
    }

    data.data.forEach((amenity) => {
      const amenityId = Number(amenity.id);
      const amenityName = (amenity.name || "").trim();
      if (Number.isFinite(amenityId) && amenityName) {
        amenityIdToName.set(amenityId, amenityName);
      }
    });

    renderAmenityFilters();
  } catch (error) {
    console.error("Failed to fetch amenities:", error);
  }
};

const fetchRoomGallery = async (roomDbId) => {
  if (!roomDbId) {
    return [];
  }

  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomDbId}/gallery`);
    const data = await response.json();
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch room gallery:", error);
    return [];
  }
};

const attachRoomGalleries = async (rooms) => {
  return Promise.all(rooms.map(async (room) => ({
    ...room,
    room_images: await fetchRoomGallery(room.id)
  })));
};

const loadPropertyAndRooms = async () => {
  try {
    const roomsGridEl = document.getElementById("roomsGrid");
    if (roomsGridEl) {
      roomsGridEl.innerHTML = Array(3).fill(0).map(() => `
        <div class="room-card skeleton" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: row; gap: 24px; padding: 24px; background: #fff; margin-bottom: 20px;">
          <div class="skeleton-image pulsing" style="height: 220px; width: 340px; border-radius: 12px; flex-shrink: 0;"></div>
          <div class="room-card-content" style="flex: 1; padding: 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="skeleton-line title pulsing" style="height: 22px; width: 60%; margin-bottom: 12px;"></div>
              <div class="skeleton-line text pulsing" style="height: 14px; width: 40%; margin-bottom: 8px;"></div>
              <div class="skeleton-line text pulsing" style="height: 14px; width: 85%; margin-bottom: 8px;"></div>
            </div>
          </div>
          <aside class="room-booking-panel" style="width: 260px; flex-shrink: 0; padding: 18px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: hsl(220, 20%, 99%); display: flex; flex-direction: column; gap: 12px; align-self: flex-start;">
            <div class="skeleton-line pulsing" style="height: 18px; width: 50%;"></div>
            <div class="skeleton-line pulsing" style="height: 35px; width: 75%;"></div>
            <div class="skeleton-line pulsing" style="height: 45px; width: 100%; border-radius: 8px;"></div>
          </aside>
        </div>
      `).join("");
    }

    await fetchAmenities();

    const [propertyRes, roomsRes] = await Promise.all([
      fetch(`${BASE_URL}/properties/${propertyId}`),
      fetch(`${BASE_URL}/rooms/property/${propertyId}/available`)
    ]);

    const propertyData = await propertyRes.json();
    const roomsData = await roomsRes.json();

    if (propertyData.success && propertyData.data) {
      displayPropertyDetails(propertyData.data);
      loadPropertyReviews();
      loadEligiblePropertyReview();
    }

    if (roomsData.success && Array.isArray(roomsData.data) && roomsData.data.length > 0) {
      allRooms = await attachRoomGalleries(roomsData.data);
      applyRoomFilters();

      // Check for pending booking details
      const pendingRoomDbId = sessionStorage.getItem("pendingBookingRoomDbId");
      if (pendingRoomDbId) {
        const pendingPricingKey = sessionStorage.getItem("pendingBookingPricingKey");
        // Clear them first to avoid looping on reload
        sessionStorage.removeItem("pendingBookingRoomId");
        sessionStorage.removeItem("pendingBookingRoomDbId");
        sessionStorage.removeItem("pendingBookingPricingKey");
        
        // Find the room element
        const roomCard = document.querySelector(`.room-card[data-room-db-id="${pendingRoomDbId}"]`);
        if (roomCard) {
          // Select correct radio button if it exists
          if (pendingPricingKey) {
            const pricingRadio = roomCard.querySelector(`input[type="radio"][value="${pendingPricingKey}"]`);
            if (pricingRadio) {
              pricingRadio.checked = true;
              // Trigger change event to update display price
              pricingRadio.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
          // Programmatically click book button
          const bookBtn = roomCard.querySelector(".book-btn");
          if (bookBtn) {
            bookRoom(bookBtn);
          }
        }
      }
    } else {
      allRooms = [];
      displayRooms([]);
      updateRoomsSummary(0, 0);
    }
  } catch (error) {
    console.error(error);
    alert("Error loading property details");
  }
};

const displayPropertyDetails = (data) => {
  const property = data.property || {};
  currentProperty = property;
  const gallery = data.gallery || [];
  const amenities = data.amenities || [];
  const rules = data.rules || [];

  document.getElementById("propertyName").textContent = property.property_name || "";
  document.getElementById("propertyNameBread").textContent = property.property_name || "Property";
  document.getElementById("description").textContent = property.description || "No description available for this stay.";
  
  // Render Location
  const locationText = [property.address, property.location, property.city, property.state, property.country]
    .filter(Boolean)
    .join(", ") || "Location not specified";
  document.getElementById("propertyLocation").textContent = `${locationText}`;
  
  // Render Ratings/Reviews
  const ratingEl = document.getElementById("propertyRating");
  const avgRating = Number(property.average_rating || 0);
  const totalReviews = Number(property.total_reviews || 0);
  if (avgRating > 0) {
    ratingEl.innerHTML = `⭐ ${avgRating.toFixed(1)} <span class="reviews-count">(${totalReviews} review${totalReviews === 1 ? "" : "s"})</span>`;
  } else {
    ratingEl.innerHTML = `⭐ New Property`;
  }

  // Render Type Badge
  document.getElementById("propertyTypeBadge").textContent = property.property_type || "Stay";

  // Render Gallery Grid
  const galleryContainer = document.getElementById("propertyGallery");
  if (galleryContainer) {
    galleryContainer.className = "property-gallery-grid"; // Reset
    
    const images = [];
    if (property.property_image) {
      images.push(resolveImageUrl(property.property_image));
    }
    gallery.forEach(img => {
      const url = resolveImageUrl(img.image_url || img);
      if (url) images.push(url);
    });
    
    const uniqueImages = [...new Set(images)];
    
    if (uniqueImages.length === 0) {
      galleryContainer.innerHTML = `<div class="gallery-placeholder">📸 Owners haven't uploaded images for this property yet. Explore rooms below!</div>`;
      galleryContainer.classList.add("single-image");
    } else if (uniqueImages.length === 1) {
      galleryContainer.classList.add("single-image");
      galleryContainer.innerHTML = `
        <div class="gallery-main-container">
          <img src="${uniqueImages[0]}" class="gallery-item main" alt="${escapeHTML(property.property_name)}" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
        </div>
      `;
    } else if (uniqueImages.length === 2) {
      galleryContainer.classList.add("double-image");
      galleryContainer.innerHTML = `
        <img src="${uniqueImages[0]}" class="gallery-item" alt="${escapeHTML(property.property_name)}" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
        <img src="${uniqueImages[1]}" class="gallery-item" alt="${escapeHTML(property.property_name)}" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
      `;
    } else {
      const mainImg = uniqueImages[0];
      const sideImgs = uniqueImages.slice(1, 5);
      
      galleryContainer.innerHTML = `
        <div class="gallery-main-container">
          <img src="${mainImg}" class="gallery-item main" alt="${escapeHTML(property.property_name)}" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
        </div>
        <div class="gallery-side-grid">
          ${sideImgs.map(img => `<img src="${img}" class="gallery-item" alt="${escapeHTML(property.property_name)}" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">`).join('')}
          ${sideImgs.length < 4 ? Array(4 - sideImgs.length).fill(0).map(() => `<div class="gallery-placeholder">📸 View Stay</div>`).join('') : ''}
        </div>
      `;
    }
  }

  // Render Amenities
  const amenitiesGrid = document.getElementById("propertyAmenities");
  const amenitiesSection = document.getElementById("propertyAmenitiesSection");
  if (amenitiesGrid && amenitiesSection) {
    if (amenities.length > 0) {
      amenitiesSection.style.display = "block";
      amenitiesGrid.innerHTML = amenities.map(amenity => {
        const icon = amenity.icon || "✨";
        return `
          <div class="property-amenity-item">
            <span class="property-amenity-icon">${icon}</span>
            <span>${escapeHTML(amenity.amenity_name)}</span>
          </div>
        `;
      }).join('');
    } else {
      amenitiesSection.style.display = "none";
    }
  }

  // Render Trust Score
  const trustScore = Number(property.trust_score || 0);
  const displayScore = trustScore > 0 ? trustScore : 95;
  document.getElementById("trustScoreText").textContent = `Trust Score: ${displayScore}%`;

  // Render Times
  document.getElementById("checkInTimeText").textContent = property.check_in_time ? formatTime12h(property.check_in_time) : "12:00 PM";
  document.getElementById("checkOutTimeText").textContent = property.check_out_time ? formatTime12h(property.check_out_time) : "11:00 AM";

  // Render Rules
  const rulesList = document.getElementById("propertyRules");
  if (rulesList) {
    const rulesValues = rules.map(r => r.rule_value).filter(Boolean);
    const displayRules = rulesValues.length > 0
      ? rulesValues
      : [
          "Government ID is required for all guests at check-in.",
          `Standard check-in time is ${property.check_in_time ? formatTime12h(property.check_in_time) : "12:00 PM"} and check-out is ${property.check_out_time ? formatTime12h(property.check_out_time) : "11:00 AM"}.`,
          "Couples and families are welcome.",
          "Please check specific room capacities and extra bed rules before booking."
        ];
    rulesList.innerHTML = displayRules.map(rule => `<li>${escapeHTML(rule)}</li>`).join('');
  }



  // Render the interactive map
  renderPropertyMap(property);
};

let propertyMapInstance = null;

const renderPropertyMap = (property) => {
  const mapSection = document.getElementById("propertyMapSection");
  const mapAddress = document.getElementById("propertyMapAddress");
  const mapExternalLink = document.getElementById("propertyMapExternalLink");
  
  if (!mapSection) return;
  
  const lat = parseFloat(property.latitude);
  const lng = parseFloat(property.longitude);
  const hasCoordinates = !isNaN(lat) && !isNaN(lng);
  
  if (hasCoordinates) {
    mapSection.style.display = "block";
    
    const locationText = [property.address, property.location, property.city, property.state, property.country]
      .filter(Boolean)
      .join(", ");
    mapAddress.textContent = locationText || "Exact location details provided after booking.";
    
    const mapLink = property.google_maps_link || `https://www.google.com/maps?q=${lat},${lng}`;
    mapExternalLink.href = mapLink;
    
    // Destroy previous map instance if it exists
    if (propertyMapInstance) {
      try {
        propertyMapInstance.remove();
      } catch (e) {
        console.error(e);
      }
      propertyMapInstance = null;
    }
    
    // Recreate map div element to avoid Leaflet container reuse bugs
    const oldMapDiv = document.getElementById("propertyMap");
    if (oldMapDiv) {
      const parent = oldMapDiv.parentNode;
      const newMapDiv = document.createElement("div");
      newMapDiv.id = "propertyMap";
      parent.replaceChild(newMapDiv, oldMapDiv);
    }
    
    setTimeout(() => {
      try {
        propertyMapInstance = L.map('propertyMap', {
          scrollWheelZoom: false
        }).setView([lat, lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(propertyMapInstance);
        
        const marker = L.marker([lat, lng]).addTo(propertyMapInstance);
        marker.bindPopup(`<b>${escapeHTML(property.property_name)}</b><br>${escapeHTML(property.city || "")}`).openPopup();
      } catch (err) {
        console.error("Failed to render Leaflet map:", err);
      }
    }, 200);
  } else {
    mapSection.style.display = "none";
  }
};

const formatReviewDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const renderReviewStars = (rating) => {
  const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));
  return "&#9733;".repeat(safeRating) + "&#9734;".repeat(5 - safeRating);
};

const renderPropertyReviews = (reviews) => {
  const reviewsGrid = document.getElementById("propertyReviews");
  const reviewsSummary = document.getElementById("reviewsSummary");

  if (!reviewsGrid || !reviewsSummary) {
    return;
  }

  if (!Array.isArray(reviews) || reviews.length === 0) {
    reviewsSummary.textContent = "No guest reviews yet.";
    reviewsGrid.innerHTML = "";
    return;
  }

  reviewsSummary.textContent = `${reviews.length} guest review${reviews.length === 1 ? "" : "s"}`;
  reviewsGrid.innerHTML = reviews.map((review) => {
    const photos = Array.isArray(review.photos) ? review.photos : [];
    const responses = Array.isArray(review.responses) ? review.responses : [];
    const firstResponse = responses[0];
    const reviewDate = formatReviewDate(review.created_at);
    const roomLabel = [review.room_name, review.room_type]
      .filter(Boolean)
      .join(" | ");

    const photosHtml = photos.length
      ? `<div class="review-photo-strip">
          ${photos.map((photo) => {
            const imageUrl = resolveImageUrl(photo.image_url || photo);
            return imageUrl
              ? `<img src="${imageUrl}" alt="Guest review photo" loading="lazy" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">`
              : "";
          }).join("")}
        </div>`
      : "";

    const responseHtml = firstResponse
      ? `<div class="owner-response">
          <strong>${escapeHTML(firstResponse.owner_name || "Owner response")}</strong>
          ${escapeHTML(firstResponse.response_text || "")}
        </div>`
      : "";

    return `
      <article class="property-review-card">
        <div class="review-card-top">
          <div>
            <strong class="reviewer-name">${escapeHTML(review.full_name || "Guest")}</strong>
            <span class="review-room-name">${escapeHTML(roomLabel || reviewDate || "Completed stay")}</span>
          </div>
          <span class="review-stars">${renderReviewStars(review.rating)}</span>
        </div>
        ${review.review_text ? `<p class="review-text">${escapeHTML(review.review_text)}</p>` : ""}
        ${photosHtml}
        ${responseHtml}
      </article>
    `;
  }).join("");
};

const loadPropertyReviews = async () => {
  const reviewsGrid = document.getElementById("propertyReviews");
  const reviewsSummary = document.getElementById("reviewsSummary");

  if (!reviewsGrid || !reviewsSummary) {
    return;
  }

  try {
    reviewsSummary.textContent = "Loading reviews...";
    reviewsGrid.innerHTML = Array(2).fill(0).map(() => `
      <div class="property-review-card skeleton" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; background: #fff;">
        <div class="review-card-top" style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <div class="skeleton-line pulsing" style="height: 16px; width: 120px; margin-bottom: 6px;"></div>
            <div class="skeleton-line pulsing" style="height: 12px; width: 80px;"></div>
          </div>
          <div class="skeleton-line pulsing" style="height: 16px; width: 60px;"></div>
        </div>
        <div class="skeleton-line pulsing" style="height: 14px; width: 100%; margin-bottom: 6px;"></div>
        <div class="skeleton-line pulsing" style="height: 14px; width: 90%;"></div>
      </div>
    `).join("");

    const response = await fetch(`${BASE_URL}/reviews/property/${propertyId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Unable to load reviews.");
    }

    renderPropertyReviews(data.data);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    reviewsSummary.textContent = "Reviews are unavailable right now.";
    reviewsGrid.innerHTML = "";
  }
};

const canReviewPropertyBooking = (booking) => {
  const status = String(booking.booking_status || "").toUpperCase();

  return (
    status === "COMPLETED" &&
    !booking.review_id &&
    Number(booking.property_id) === Number(propertyId)
  );
};

const setPropertyReviewButton = () => {
  if (!openPropertyReviewBtn) {
    return;
  }

  if (eligiblePropertyReviewBooking) {
    openPropertyReviewBtn.classList.remove("hidden");
  } else {
    openPropertyReviewBtn.classList.add("hidden");
  }
};

const loadEligiblePropertyReview = async () => {
  eligiblePropertyReviewBooking = null;
  setPropertyReviewButton();

  if (!token || !user || user.role !== "USER") {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      headers: authHeaders()
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Unable to check review eligibility.");
    }

    eligiblePropertyReviewBooking = (data.data || [])
      .find(canReviewPropertyBooking) || null;

    setPropertyReviewButton();
  } catch (error) {
    console.error("Failed to check review eligibility:", error);
    eligiblePropertyReviewBooking = null;
    setPropertyReviewButton();
  }
};

const setPropertyReviewRating = (rating) => {
  selectedReviewRating = rating;

  if (!propertyReviewStars) {
    return;
  }

  [...propertyReviewStars.querySelectorAll("button")].forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.rating) <= selectedReviewRating);
  });
};

const openPropertyReviewModal = () => {
  if (!eligiblePropertyReviewBooking || !propertyReviewModal) {
    return;
  }

  propertyReviewBookingId.value = eligiblePropertyReviewBooking.id;
  propertyReviewModalTitle.textContent = `Review ${eligiblePropertyReviewBooking.property_name || document.getElementById("propertyName")?.textContent || "your stay"}`;
  propertyReviewModalSubtitle.textContent = `${eligiblePropertyReviewBooking.room_name || eligiblePropertyReviewBooking.room_type || "Room"} | ${eligiblePropertyReviewBooking.booking_code || `Booking #${eligiblePropertyReviewBooking.id}`}`;
  propertyReviewText.value = "";
  propertyReviewPhotos.value = "";
  propertyReviewFormMessage.textContent = "";
  setPropertyReviewRating(5);
  propertyReviewModal.classList.remove("hidden");
};

const closePropertyReview = () => {
  if (propertyReviewModal) {
    propertyReviewModal.classList.add("hidden");
  }
};

const submitPropertyReview = async (event) => {
  event.preventDefault();

  const bookingId = propertyReviewBookingId.value;
  if (!bookingId) {
    return;
  }

  const selectedFiles = [...propertyReviewPhotos.files];
  if (selectedFiles.length > 5) {
    propertyReviewFormMessage.textContent = "You can upload up to 5 photos.";
    return;
  }

  const formData = new FormData();
  formData.append("booking_id", bookingId);
  formData.append("rating", String(selectedReviewRating));
  formData.append("review_text", propertyReviewText.value.trim());
  selectedFiles.forEach((file) => formData.append("photos", file));

  propertyReviewFormMessage.textContent = "Submitting review...";

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

    closePropertyReview();
    await loadPropertyAndRooms();
  } catch (error) {
    console.error(error);
    propertyReviewFormMessage.textContent = error.message || "Unable to submit review right now.";
  }
};

const displayRooms = (rooms) => {
  const grid = document.getElementById("roomsGrid");
  grid.innerHTML = "";

  if (!rooms.length) {
    grid.innerHTML = allRooms.length
      ? "<div class='empty-message'>No rooms matched your filters. Try removing an amenity.</div>"
      : "<div class='empty-message'>No rooms available for this property.</div>";
    return;
  }

  rooms.forEach((room) => {
    const amenityNames = getAmenityNames(room.room_amenities);
    const amenitiesText = amenityNames.length > 0 ? amenityNames.join(", ") : "No amenities listed";
    const benefitNames = normalizeRoomBenefits(room.room_benefits);
    const benefitsHtml = benefitNames.length > 0
      ? benefitNames.map((benefit) => `<li>${benefit}</li>`).join("")
      : "<li>No room benefits selected</li>";
    const roomImages = normalizeImageList(room.room_images);
    const pricingOptions = buildPricingOptions(room);
    const pricingGroupName = `pricing-${room.room_id}`;

    const primaryPrice = pricingOptions[0];
    const commission = safeNumber(room.commission_percentage);
    const baseMultiplier = 1 + (commission / 100);
    const basePrice = Math.round(safeNumber(room.base_price) * baseMultiplier);
    const hasBaseStrikePrice = basePrice > primaryPrice.amount;
    const maxAdults = safeNumber(room.max_adults);
    const maxChildren = safeNumber(room.max_children);
    const guestText = `${maxAdults} Adult${maxAdults === 1 ? "" : "s"}${maxChildren > 0 ? `, ${maxChildren} Child${maxChildren === 1 ? "" : "ren"}` : ""}`;

    const pricingOptionsHtml = pricingOptions.map((option, index) => `
      <label class="price-option-card">
        <input type="radio" name="${pricingGroupName}" value="${option.key}" data-label="${escapeHTML(option.label)}" data-amount="${option.amount}" data-period="${escapeHTML(option.period)}" ${index === 0 ? "checked" : ""}>
        <span class="price-option-title">${escapeHTML(option.label)}</span>
        <span class="price-option-value">${formatINR(option.amount)}${option.period}</span>
      </label>
    `).join("");

    const card = document.createElement("div");
    card.className = "room-card";
    card.dataset.roomId = room.room_id;
    card.dataset.roomDbId = room.id;
    card.dataset.propertyId = room.property_id;

    card.innerHTML = `
      <div class="room-main">
        <div class="room-type-badge">${room.room_type || "Room"}</div>
        ${buildRoomGallery(roomImages, room.room_name || "Room")}
        <div class="room-card-content">
          <h3>${room.room_name || "Room"}</h3>
          <p class="room-subtitle">Fits ${guestText}</p>

          <div class="room-feature-grid">
            <div class="room-feature">
              <span class="feature-icon">RT</span>
              <span>
                <strong>${room.room_type || "Room Type"}</strong>
                <small>Room Type</small>
              </span>
            </div>
            <div class="room-feature">
              <span class="feature-icon">BD</span>
              <span>
                <strong>${room.bed_type || "Not specified"}</strong>
                <small>Bed Type</small>
              </span>
            </div>
            <div class="room-feature">
              <span class="feature-icon">GS</span>
              <span>
                <strong>${guestText}</strong>
                <small>Max Guests</small>
              </span>
            </div>
            <div class="room-feature">
              <span class="feature-icon">SZ</span>
              <span>
                <strong>${room.room_size || "Not specified"}</strong>
                <small>Size</small>
              </span>
            </div>
          </div>

          <div class="amenities">
            <span class="label">Amenities</span>
            <p>${amenitiesText}</p>
          </div>

          <p class="room-description">
            ${room.description || "No description available"}
          </p>
        </div>
      </div>

      <aside class="room-booking-panel">
        <div>
          <h4>${room.room_name || "Room"}</h4>
          <p class="panel-guests">Fits ${guestText}</p>
        </div>
        <ul class="booking-benefits">
          ${benefitsHtml}
        </ul>
        <div class="room-price">
          ${hasBaseStrikePrice ? `<span class="price-old">${formatINR(basePrice)}</span>` : ""}
          <span class="price-period-label">${primaryPrice.label}</span>
          <strong class="price-amount">${formatINR(primaryPrice.amount)}</strong>
          <span class="price-period">${primaryPrice.period}</span>
        </div>
        <button class="book-btn" onclick="bookRoom(this)">Book This Now</button>
        <div class="pricing-selection">
          <p class="pricing-title">More options available with</p>
          <div class="pricing-options">
            ${pricingOptionsHtml}
          </div>
        </div>
      </aside>
    `;

    grid.appendChild(card);
  });
};

document.getElementById("roomsGrid").addEventListener("click", (event) => {
  const galleryButton = event.target.closest("[data-gallery-move]");
  if (!galleryButton) {
    return;
  }

  const gallery = galleryButton.closest(".room-gallery");
  moveGallery(gallery, Number(galleryButton.dataset.galleryMove));
});

document.getElementById("roomsGrid").addEventListener("change", (event) => {
  const pricingInput = event.target.closest(".price-option-card input");
  if (!pricingInput) {
    return;
  }

  const roomCard = pricingInput.closest(".room-card");
  const pricing = getSelectedPricingFromCard(roomCard);

  roomCard.querySelector(".price-period-label").textContent = pricing.label;
  roomCard.querySelector(".price-amount").innerHTML = formatINR(pricing.amount);
  roomCard.querySelector(".price-period").textContent = pricing.period;
});

const fetchWalletBalance = async () => {
  try {
    walletBalanceInfo.textContent = "Loading balance...";
    const res = await fetch(`${BASE_URL}/finance/wallet`, {
      headers: authHeaders()
    });
    const result = await res.json();
    if (result.success && result.data) {
      userWalletBalance = safeNumber(result.data.balance);
    } else {
      userWalletBalance = 0;
    }
  } catch (err) {
    console.error("Error fetching wallet balance:", err);
    userWalletBalance = 0;
  } finally {
    walletBalanceInfo.innerHTML = `Available: ${formatINR(userWalletBalance)}`;
  }
};

const calculateNights = () => {
  if (!bookingCheckIn.value || !bookingCheckOut.value) return 0;
  const checkIn = new Date(bookingCheckIn.value);
  const checkOut = new Date(bookingCheckOut.value);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;
  const diffTime = checkOut - checkIn;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const updatePriceSummary = () => {
  if (!selectedBookingRoom) return;

  const rooms = Math.max(1, Number(bookingRooms.value) || 1);
  const isHourly = selectedBookingRoom.bookingType === "HOURLY";
  const units = isHourly ? 1 : calculateNights();

  const unitPrice = selectedBookingRoom.pricing.amount;
  const subtotal = unitPrice * units * rooms;

  const unitLabel = isHourly ? "hour" : "night";
  const unitCountLabel = `${units} ${unitLabel}${units === 1 ? "" : "s"}`;
  const roomsLabel = `${rooms} room${rooms === 1 ? "" : "s"}`;
  const summarySubtotalLabel = document.getElementById("summarySubtotalLabel");
  if (summarySubtotalLabel) {
    summarySubtotalLabel.textContent = `Subtotal (${roomsLabel} × ${unitCountLabel})`;
  }
  if (summarySubtotal) {
    summarySubtotal.innerHTML = formatINR(subtotal);
  }

  let discountAmount = 0;
  if (appliedCouponCode) {
    discountAmount = appliedCouponDiscount;
    if (summaryDiscountRow) {
      summaryDiscountRow.style.display = "flex";
    }
    if (summaryDiscount) {
      summaryDiscount.innerHTML = `-${formatINR(discountAmount)}`;
    }
  } else {
    if (summaryDiscountRow) {
      summaryDiscountRow.style.display = "none";
    }
  }

  const afterCoupon = Math.max(0, subtotal - discountAmount);

  let walletDeduction = 0;
  if (useWalletInput && useWalletInput.checked) {
    walletDeduction = Math.min(userWalletBalance, afterCoupon);
    if (summaryWalletRow) {
      summaryWalletRow.style.display = "flex";
    }
    if (summaryWallet) {
      summaryWallet.innerHTML = `-${formatINR(walletDeduction)}`;
    }
  } else {
    if (summaryWalletRow) {
      summaryWalletRow.style.display = "none";
    }
  }

  const finalPayable = Math.max(0, afterCoupon - walletDeduction);
  if (summaryTotal) {
    summaryTotal.innerHTML = formatINR(finalPayable);
  }

  // Handle disabling offline booking when wallet is used
  const offlineRadio = document.querySelector('input[name="bookingPaymentMethod"][value="OFFLINE"]');
  const offlineLabel = document.getElementById("offlineBookingLabel");
  const offlineText = document.getElementById("offlineBookingText");
  const onlineRadio = document.querySelector('input[name="bookingPaymentMethod"][value="ONLINE"]');

  if (useWalletInput && useWalletInput.checked) {
    if (offlineRadio) offlineRadio.disabled = true;
    if (offlineLabel) {
      offlineLabel.style.color = "#888";
      offlineLabel.style.cursor = "not-allowed";
    }
    if (offlineText) offlineText.textContent = "Offline booking (Not available when using wallet)";
    if (offlineRadio && offlineRadio.checked) {
      if (onlineRadio) onlineRadio.checked = true;
    }
  } else {
    if (offlineRadio) offlineRadio.disabled = false;
    if (offlineLabel) {
      offlineLabel.style.color = "";
      offlineLabel.style.cursor = "";
    }
    if (offlineText) offlineText.textContent = "Offline booking";
  }

  // Dynamically set confirmation button text and message
  const selectedMethod = getSelectedPaymentMethod();
  if (selectedMethod === "ONLINE") {
    if (finalPayable === 0) {
      confirmBookingBtn.textContent = "Book Now (Using Wallet)";
      bookingModalMessage.textContent = "Your booking will be fully paid with your wallet balance.";
    } else {
      confirmBookingBtn.textContent = "Pay & Book";
      bookingModalMessage.textContent = "Online payment will open Razorpay Checkout after this booking is created.";
    }
  } else {
    confirmBookingBtn.textContent = "Request Booking";
    bookingModalMessage.textContent = "Offline booking requested. You will pay at the property.";
  }
};

const showCouponMessage = (msg, type) => {
  if (couponStatusMessage) {
    couponStatusMessage.textContent = msg;
    couponStatusMessage.className = `coupon-status ${type}`;
  }
};

const applyCoupon = async () => {
  const code = bookingCouponCode.value.trim();
  if (!code) {
    showCouponMessage("Please enter a coupon code first.", "error");
    return;
  }

  const rooms = Math.max(1, Number(bookingRooms.value) || 1);
  const isHourly = selectedBookingRoom.bookingType === "HOURLY";
  const units = isHourly ? 1 : calculateNights();
  const unitPrice = selectedBookingRoom.pricing.amount;
  const subtotal = unitPrice * units * rooms;

  try {
    showCouponMessage("Validating...", "");
    applyCouponBtn.disabled = true;

    const response = await fetch(`${BASE_URL}/coupons/validate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        coupon_code: code,
        property_id: Number(propertyId),
        booking_amount: subtotal
      })
    });

    const result = await response.json();
    if (result.success && result.data) {
      appliedCouponCode = code;
      appliedCouponDiscount = safeNumber(result.data.discount);
      
      bookingCouponCode.disabled = true;
      applyCouponBtn.textContent = "Remove";
      applyCouponBtn.classList.add("btn-remove");
      applyCouponBtn.disabled = false;
      showCouponMessage(`Coupon applied! Discount: ${formatINRText(appliedCouponDiscount)}`, "success");
      
      updatePriceSummary();
    } else {
      throw new Error(result.message || "Invalid coupon code.");
    }
  } catch (error) {
    console.error("Coupon validation error:", error);
    appliedCouponCode = "";
    appliedCouponDiscount = 0;
    applyCouponBtn.disabled = false;
    showCouponMessage(error.message || "Failed to validate coupon.", "error");
    updatePriceSummary();
  }
};

const removeCoupon = () => {
  appliedCouponCode = "";
  appliedCouponDiscount = 0;
  if (bookingCouponCode) {
    bookingCouponCode.value = "";
    bookingCouponCode.disabled = false;
  }
  if (applyCouponBtn) {
    applyCouponBtn.textContent = "Apply";
    applyCouponBtn.classList.remove("btn-remove");
    applyCouponBtn.disabled = false;
  }
  showCouponMessage("", "");
  updatePriceSummary();
};

const revalidateCouponIfNeeded = async () => {
  if (!appliedCouponCode) return;

  const rooms = Math.max(1, Number(bookingRooms.value) || 1);
  const isHourly = selectedBookingRoom.bookingType === "HOURLY";
  const units = isHourly ? 1 : calculateNights();
  const unitPrice = selectedBookingRoom.pricing.amount;
  const subtotal = unitPrice * units * rooms;

  try {
    const response = await fetch(`${BASE_URL}/coupons/validate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        coupon_code: appliedCouponCode,
        property_id: Number(propertyId),
        booking_amount: subtotal
      })
    });

    const result = await response.json();
    if (result.success && result.data) {
      appliedCouponDiscount = safeNumber(result.data.discount);
      showCouponMessage(`Coupon applied! Discount: ${formatINRText(appliedCouponDiscount)}`, "success");
    } else {
      removeCoupon();
      bookingModalMessage.textContent = "The applied coupon is not valid for the new dates/rooms/amount, and has been removed.";
    }
  } catch (error) {
    removeCoupon();
  } finally {
    updatePriceSummary();
  }
};

const parseTimeToMinutes = (timeStr, isCheckOut = false) => {
  if (!timeStr) return isCheckOut ? 1440 : 0;
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (isCheckOut && h === 0 && m === 0) {
    return 1440;
  }
  return h * 60 + m;
};

const populateCheckInTimes = () => {
  if (!selectedBookingRoom) return;

  const duration = getHourlyDuration(selectedBookingRoom.pricing?.key);
  const isHourly = duration > 0;

  // Save currently selected value to try to restore it
  const currentVal = bookingCheckInTime.value || "12:00";

  // Clear existing options
  bookingCheckInTime.innerHTML = "";

  const allHours = [
    { value: "00:00", label: "12:00 AM" },
    { value: "01:00", label: "01:00 AM" },
    { value: "02:00", label: "02:00 AM" },
    { value: "03:00", label: "03:00 AM" },
    { value: "04:00", label: "04:00 AM" },
    { value: "05:00", label: "05:00 AM" },
    { value: "06:00", label: "06:00 AM" },
    { value: "07:00", label: "07:00 AM" },
    { value: "08:00", label: "08:00 AM" },
    { value: "09:00", label: "09:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "01:00 PM" },
    { value: "14:00", label: "02:00 PM" },
    { value: "15:00", label: "03:00 PM" },
    { value: "16:00", label: "04:00 PM" },
    { value: "17:00", label: "05:00 PM" },
    { value: "18:00", label: "06:00 PM" },
    { value: "19:00", label: "07:00 PM" },
    { value: "20:00", label: "08:00 PM" },
    { value: "21:00", label: "09:00 PM" },
    { value: "22:00", label: "10:00 PM" },
    { value: "23:00", label: "11:00 PM" }
  ];

  if (isHourly && currentProperty) {
    const propCheckInMinutes = parseTimeToMinutes(currentProperty.check_in_time || "00:00", false);
    const propCheckOutMinutes = parseTimeToMinutes(currentProperty.check_out_time || "24:00", true);

    let hasValidOption = false;

    allHours.forEach((hourObj) => {
      const checkInMinutes = parseTimeToMinutes(hourObj.value, false);
      const checkOutMinutes = checkInMinutes + duration * 60;

      if (checkInMinutes >= propCheckInMinutes && checkOutMinutes <= propCheckOutMinutes) {
        const option = document.createElement("option");
        option.value = hourObj.value;
        option.textContent = hourObj.label;
        bookingCheckInTime.appendChild(option);
        hasValidOption = true;
      }
    });

    if (!hasValidOption) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No valid hours for this option";
      option.disabled = true;
      bookingCheckInTime.appendChild(option);
    }
  } else {
    // Populate all hours for nightly bookings
    allHours.forEach((hourObj) => {
      const option = document.createElement("option");
      option.value = hourObj.value;
      option.textContent = hourObj.label;
      bookingCheckInTime.appendChild(option);
    });
  }

  // Restore previously selected value if it still exists in the newly populated list
  const hasCurrentVal = Array.from(bookingCheckInTime.options).some(opt => opt.value === currentVal);
  if (hasCurrentVal) {
    bookingCheckInTime.value = currentVal;
  } else if (bookingCheckInTime.options.length > 0) {
    bookingCheckInTime.value = bookingCheckInTime.options[0].value;
  }
};

const handleBookingDetailsChange = async () => {
  updateBookingDateTimeFields();
  if (appliedCouponCode) {
    await revalidateCouponIfNeeded();
  } else {
    updatePriceSummary();
  }
};

function bookRoom(buttonElement) {
  const roomCard = buttonElement.closest(".room-card");
  const selectedPricing = getSelectedPricingFromCard(roomCard);

  if (!token || !user) {
    sessionStorage.setItem("redirectUrl", window.location.href);
    sessionStorage.setItem("pendingBookingRoomId", roomCard.dataset.roomId);
    sessionStorage.setItem("pendingBookingRoomDbId", roomCard.dataset.roomDbId);
    sessionStorage.setItem("pendingBookingPricingKey", selectedPricing.key);
    window.location.href = "../auth/auth.html";
    return;
  }

  selectedBookingRoom = {
    id: Number(roomCard.dataset.roomDbId),
    roomId: roomCard.dataset.roomId,
    name: roomCard.querySelector(".room-card-content h3")?.textContent || "Room",
    pricing: selectedPricing,
    bookingType: getHourlyDuration(selectedPricing.key) > 0 ? "HOURLY" : "NIGHTLY"
  };

  const defaultCheckIn = urlParams.get("checkIn") || "";
  const defaultCheckOut = urlParams.get("checkOut") || defaultCheckIn;

  bookingRoomName.textContent = selectedBookingRoom.name;
  bookingPricingSummary.textContent = `${selectedPricing.label} - ${formatINRText(selectedPricing.amount)}${selectedPricing.period}`;
  bookingCheckIn.value = defaultCheckIn;
  bookingCheckOut.value = defaultCheckOut;
  
  populateCheckInTimes();
  bookingCheckOutTime.value = addHoursToTime(bookingCheckInTime.value, getHourlyDuration(selectedPricing.key));

  bookingGuests.value = urlParams.get("guests") || "1";
  bookingRooms.value = "1";
  bookingGuestName.value = user.full_name || "";
  bookingGuestEmail.value = user.email || "";
  bookingGuestAge.value = "";
  bookingCustomerName.value = user.full_name || "";
  
  if (bookingPhoneContainer && bookingPhone) {
    bookingPhoneContainer.style.display = "none";
    bookingPhone.required = false;
    bookingPhone.value = "";
  }

  if (token && user) {
    fetch(`${BASE_URL}/users/profile`, {
      headers: authHeaders()
    })
      .then(res => res.json())
      .then(profileResult => {
        if (profileResult.success && profileResult.data) {
          const dbPhone = profileResult.data.phone;
          if (!dbPhone || dbPhone === "0000000000") {
            if (bookingPhoneContainer && bookingPhone) {
              bookingPhoneContainer.style.display = "block";
              bookingPhone.required = true;
            }
          } else {
            if (bookingPhone) {
              bookingPhone.value = dbPhone;
            }
          }
        }
      })
      .catch(err => {
        console.error("Error fetching user profile for phone check:", err);
      });
  }

  removeCoupon();
  useWalletInput.checked = false;
  specialRequests.value = "";
  bookingModalMessage.textContent = "";
  document.querySelector('input[name="bookingPaymentMethod"][value="OFFLINE"]').checked = true;
  if (additionalGuestsContainer) {
    additionalGuestsContainer.innerHTML = "";
  }
  updateBookingDateTimeFields();
  updatePriceSummary();
  bookingModal.classList.add("active");
  
  fetchWalletBalance().then(() => {
    updatePriceSummary();
  });
}

const updateBookingDateTimeFields = () => {
  if (!selectedBookingRoom) {
    return;
  }

  const duration = getHourlyDuration(selectedBookingRoom.pricing?.key);
  const isHourly = duration > 0;

  if (isHourly) {
    bookingCheckOut.value = bookingCheckIn.value;
    bookingCheckOutTime.value = addHoursToTime(bookingCheckInTime.value, duration);
    bookingCheckOutTime.disabled = true;
  } else {
    bookingCheckOutTime.value = bookingCheckInTime.value;
    bookingCheckOutTime.disabled = true;
  }
};

const closeBookingForm = () => {
  bookingModal.classList.remove("active");
  selectedBookingRoom = null;
  removeCoupon();
};

let redirectTimer = null;

const showBookingStatus = (state, data = {}) => {
  const overlay = document.getElementById("bookingStatusOverlay");
  const spinner = document.getElementById("statusSpinner");
  const successIcon = document.getElementById("statusSuccessIcon");
  const errorIcon = document.getElementById("statusErrorIcon");
  const title = document.getElementById("statusTitle");
  const description = document.getElementById("statusDescription");
  const details = document.getElementById("statusDetails");
  const actions = document.getElementById("statusActions");
  const countdown = document.getElementById("statusCountdown");
  const closeBtn = document.getElementById("statusCloseBtn");

  if (redirectTimer) {
    clearInterval(redirectTimer);
    redirectTimer = null;
  }

  overlay.classList.remove("hidden");
  spinner.classList.add("hidden");
  successIcon.classList.add("hidden");
  errorIcon.classList.add("hidden");
  details.classList.add("hidden");
  actions.classList.add("hidden");
  countdown.textContent = "";

  if (state === "processing") {
    spinner.classList.remove("hidden");
    title.textContent = data.title || "Processing Booking";
    description.textContent = data.description || "Please wait while we secure your booking request.";
  } 
  else if (state === "verifying") {
    spinner.classList.remove("hidden");
    title.textContent = data.title || "Verifying Payment";
    description.textContent = data.description || "Securing transaction with our payment gateway...";
  } 
  else if (state === "success") {
    successIcon.classList.remove("hidden");
    title.textContent = data.title || "Booking Confirmed! 🎉";
    description.textContent = data.description || "Your booking has been secured successfully.";

    if (data.bookingCode || data.amount) {
      details.classList.remove("hidden");
      document.getElementById("detailBookingCode").textContent = data.bookingCode || "N/A";
      document.getElementById("detailPaymentMethod").textContent = data.paymentMethod || "OFFLINE";
      document.getElementById("detailPaymentStatus").textContent = data.paymentStatus || "PENDING";
      document.getElementById("detailAmount").innerHTML = data.amount || "N/A";
    }

    actions.classList.remove("hidden");
    closeBtn.classList.add("hidden");
    
    let secondsLeft = 4;
    countdown.textContent = `Redirecting to My Bookings in ${secondsLeft}s...`;
    
    redirectTimer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(redirectTimer);
        window.location.href = "../user/bookings.html";
      } else {
        countdown.textContent = `Redirecting to My Bookings in ${secondsLeft}s...`;
      }
    }, 1000);
  } 
  else if (state === "error") {
    errorIcon.classList.remove("hidden");
    title.textContent = data.title || "Booking Failed";
    description.textContent = data.description || "An error occurred during booking. Please try again.";
    
    if (data.errorMessage) {
      description.textContent = data.errorMessage;
    }
    
    actions.classList.remove("hidden");
    closeBtn.classList.remove("hidden");
    closeBtn.onclick = () => {
      overlay.classList.add("hidden");
    };
  }
};

const createBooking = async () => {
  if (!selectedBookingRoom?.id) {
    throw new Error("Room selection is missing.");
  }

  const guestCount = Number(bookingGuests.value);
  const additionalGuests = [];
  document.querySelectorAll(".additional-guest-row").forEach(row => {
    const nameInput = row.querySelector(".add-guest-name");
    const ageInput = row.querySelector(".add-guest-age");
    if (nameInput && ageInput) {
      const name = nameInput.value.trim();
      const age = ageInput.value.trim();
      if (name && age) {
        additionalGuests.push({ name, age });
      }
    }
  });

  if (guestCount > 2 && additionalGuests.length < guestCount - 1) {
    throw new Error(`Please add name and age details for the other ${guestCount - 1} guests using the "+ Add Additional Guest" button.`);
  }

  let requestsText = specialRequests.value.trim();
  if (additionalGuests.length > 0) {
    const guestsHeader = `[Additional Guests]\n${additionalGuests.map((g, i) => `${i + 1}. ${g.name} (Age: ${g.age})`).join("\n")}`;
    requestsText = requestsText ? `${guestsHeader}\n\n[Special Requests]\n${requestsText}` : guestsHeader;
  }

  const bookingPayload = {
    room_id: selectedBookingRoom.id,
    booking_type: selectedBookingRoom.bookingType,
    pricing_option: selectedBookingRoom.pricing.key,
    check_in_date: bookingCheckIn.value,
    check_out_date: bookingCheckOut.value,
    check_in_time: bookingCheckInTime.value,
    check_out_time: bookingCheckOutTime.value || null,
    guests: guestCount,
    booked_rooms: Number(bookingRooms.value),
    guest_name: bookingGuestName.value.trim(),
    guest_email: bookingGuestEmail.value.trim(),
    guest_age: Number(bookingGuestAge.value),
    customer_name: bookingCustomerName.value.trim() || user?.full_name || "",
    coupon_code: appliedCouponCode || null,
    payment_method: getSelectedPaymentMethod(),
    use_wallet: useWalletInput.checked,
    special_requests: requestsText
  };

  const response = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(bookingPayload)
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Unable to create booking.");
  }

  return data.data;
};

const createPaymentOrder = async (bookingId) => {
  const response = await fetch(`${BASE_URL}/payments/create-order/${bookingId}`, {
    method: "POST",
    headers: authHeaders()
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Unable to start payment.");
  }

  return data.data;
};

const verifyBookingPayment = async (paymentResponse) => {
  const response = await fetch(`${BASE_URL}/payments/verify-payment`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      payment_method: "RAZORPAY"
    })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Payment verification failed.");
  }

  return data.data;
};

const markBookingPaymentFailed = async (paymentFailure) => {
  const response = await fetch(`${BASE_URL}/payments/payment-failed`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(paymentFailure)
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Payment failure could not be recorded.");
  }

  return data.data;
};

const openBookingRazorpayCheckout = (order, booking) => new Promise((resolve, reject) => {
  if (!window.Razorpay) {
    markBookingPaymentFailed({
      booking_id: order.booking_id || booking.booking_id,
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
    description: `Booking ${order.booking_code || booking.booking_code || ""}`,
    order_id: order.razorpay_order_id,
    prefill: {
      name: bookingCustomerName.value.trim() || user?.full_name || "",
      email: bookingGuestEmail.value.trim() || user?.email || ""
    },
    notes: {
      booking_id: String(order.booking_id || booking.booking_id),
      booking_code: order.booking_code || booking.booking_code || ""
    },
    handler: async (response) => {
      completed = true;
      try {
        showBookingStatus("verifying", {
          title: "Verifying Payment",
          description: "Confirming transaction details with our servers..."
        });
        const verified = await verifyBookingPayment(response);
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
          await markBookingPaymentFailed({
            booking_id: order.booking_id || booking.booking_id,
            razorpay_order_id: order.razorpay_order_id,
            reason: "Payment window was closed before payment was completed"
          });
        } catch (error) {
          console.error(error);
        }
        reject(new Error("Payment was cancelled. Your pending booking has been released."));
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
      await markBookingPaymentFailed({
        booking_id: order.booking_id || booking.booking_id,
        razorpay_order_id: order.razorpay_order_id,
        razorpay_payment_id: response.error?.metadata?.payment_id || null,
        error: response.error
      });
    } catch (error) {
      console.error(error);
    }
    reject(new Error(response.error?.description || "Payment failed. Your pending booking has been released."));
  });

  checkout.open();
});

closeBookingModal.addEventListener("click", closeBookingForm);

bookingModal.addEventListener("click", (event) => {
  if (event.target === bookingModal) {
    closeBookingForm();
  }
});

bookingCheckIn.addEventListener("change", handleBookingDetailsChange);
bookingCheckOut.addEventListener("change", handleBookingDetailsChange);
bookingCheckInTime.addEventListener("change", handleBookingDetailsChange);
bookingCheckOutTime.addEventListener("change", handleBookingDetailsChange);
bookingRooms.addEventListener("change", handleBookingDetailsChange);
useWalletInput.addEventListener("change", updatePriceSummary);

if (applyCouponBtn) {
  applyCouponBtn.addEventListener("click", () => {
    if (appliedCouponCode) {
      removeCoupon();
    } else {
      applyCoupon();
    }
  });
}

document.querySelectorAll('input[name="bookingPaymentMethod"]').forEach((input) => {
  input.addEventListener("change", updatePriceSummary);
});

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  bookingModalMessage.textContent = "";
  confirmBookingBtn.disabled = true;
  confirmBookingBtn.textContent = "Requesting booking...";

  try {
    showBookingStatus("processing", {
      title: "Creating Booking",
      description: "Securing your room request..."
    });

    if (bookingPhone && bookingPhone.required && bookingPhoneContainer.style.display !== "none") {
      const phoneVal = bookingPhone.value.trim();
      if (!phoneVal) {
        throw new Error("Phone number is required before booking.");
      }
      if (phoneVal.length < 10 || phoneVal.length > 20) {
        throw new Error("Phone number must be between 10 and 20 characters.");
      }

      const profileRes = await fetch(`${BASE_URL}/users/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          full_name: bookingCustomerName.value.trim() || user.full_name,
          email: user.email,
          phone: phoneVal
        })
      });

      const profileData = await profileRes.json();
      if (!profileData.success) {
        throw new Error(profileData.message || "Failed to save phone number.");
      }
    }

    updateBookingDateTimeFields();
    const booking = await createBooking();

    closeBookingForm();

    if (getSelectedPaymentMethod() === "ONLINE") {
      showBookingStatus("processing", {
        title: "Preparing Payment Gateway",
        description: "Opening Razorpay checkout panel..."
      });

      const order = await createPaymentOrder(booking.booking_id);
      if (order.payment_required === false) {
        showBookingStatus("success", {
          title: "Booking Confirmed! 🎉",
          description: order.message || "Your booking has been secured successfully.",
          bookingCode: booking.booking_code,
          paymentMethod: "WALLET",
          paymentStatus: "PAID",
          amount: formatINR(booking.total_price)
        });
        return;
      }

      showBookingStatus("processing", {
        title: "Waiting for Payment",
        description: "Please complete payment in the secure window."
      });

      await openBookingRazorpayCheckout(order, booking);
      
      showBookingStatus("success", {
        title: "Booking Confirmed! 🎉",
        description: `Booking confirmed successfully. Payment complete.`,
        bookingCode: booking.booking_code,
        paymentMethod: "ONLINE",
        paymentStatus: "PAID",
        amount: formatINR(booking.total_price)
      });
      return;
    }

    const bookingCode = booking.booking_code || "";
    showBookingStatus("success", {
      title: "Booking Requested! 🔑",
      description: booking.message || "Your offline booking request has been submitted for owner approval.",
      bookingCode: bookingCode,
      paymentMethod: "OFFLINE",
      paymentStatus: "PENDING",
      amount: formatINR(booking.total_price)
    });
  } catch (error) {
    console.error(error);
    showBookingStatus("error", {
      title: "Booking Unsuccessful",
      errorMessage: error.message || "Unable to complete booking request. Please check details and try again."
    });
  } finally {
    confirmBookingBtn.disabled = false;
    confirmBookingBtn.textContent = getSelectedPaymentMethod() === "ONLINE"
      ? "Pay & Book"
      : "Request Booking";
  }
});

if (openPropertyReviewBtn) {
  openPropertyReviewBtn.addEventListener("click", openPropertyReviewModal);
}

if (closePropertyReviewModal) {
  closePropertyReviewModal.addEventListener("click", closePropertyReview);
}

if (propertyReviewModal) {
  propertyReviewModal.addEventListener("click", (event) => {
    if (event.target === propertyReviewModal) {
      closePropertyReview();
    }
  });
}

if (propertyReviewStars) {
  propertyReviewStars.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-rating]");
    if (!button) {
      return;
    }

    setPropertyReviewRating(Number(button.dataset.rating));
  });
}

if (propertyReviewForm) {
  propertyReviewForm.addEventListener("submit", submitPropertyReview);
}

document.addEventListener("DOMContentLoaded", () => {
  const amenityFilters = document.getElementById("amenityFilters");
  const resetRoomFiltersBtn = document.getElementById("resetRoomFiltersBtn");

  if (amenityFilters) {
    amenityFilters.addEventListener("change", applyRoomFilters);
  }

  if (resetRoomFiltersBtn) {
    resetRoomFiltersBtn.addEventListener("click", () => {
      document.querySelectorAll("#amenityFilters input").forEach((input) => {
        input.checked = false;
      });
      applyRoomFilters();
    });
  }

  if (addGuestBtn && additionalGuestsContainer) {
    let guestIndex = 0;
    addGuestBtn.addEventListener("click", () => {
      guestIndex++;
      const rowId = `guest-row-${guestIndex}`;
      const rowHtml = `
        <div class="additional-guest-row" id="${rowId}">
          <div class="input-group">
            <label>Name</label>
            <input type="text" class="add-guest-name" placeholder="Full Name" required>
          </div>
          <div class="input-group">
            <label>Age</label>
            <input type="number" class="add-guest-age" min="1" max="120" placeholder="Age" required>
          </div>
          <button type="button" class="remove-guest-btn" aria-label="Remove guest">&times;</button>
        </div>
      `;
      additionalGuestsContainer.insertAdjacentHTML("beforeend", rowHtml);
    });

    additionalGuestsContainer.addEventListener("click", (event) => {
      const removeBtn = event.target.closest(".remove-guest-btn");
      if (removeBtn) {
        const row = removeBtn.closest(".additional-guest-row");
        if (row) {
          row.remove();
        }
      }
    });
  }

  loadPropertyAndRooms();
});
