// API Configuration is loaded from config.js
const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api';
// ASSET_BASE_URL is already defined in config.js
const IMAGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><rect width='100%' height='100%' fill='%23f3f4f6'/><g fill='%239ca3af' transform='translate(180, 110) scale(1.5)'><path d='M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.12-1.12A1 1 0 0010.586 3H7.414a1 1 0 00-.707.293L5.586 4.707A1 1 0 014.88 5H4zM10 8a3 3 0 100 6 3 3 0 000-6z'/></g></svg>";

const escapeHTML = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const profileBtn = document.getElementById("profileBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const logoutBtn = document.getElementById("logoutBtn");
const joinBtn = document.getElementById("joinBtn");
const profileMenuBtn = document.getElementById("profileMenuBtn");
const walletMenuBtn = document.getElementById("walletMenuBtn");
const bookingsMenuBtn = document.getElementById("bookingsMenuBtn");
const wishlistMenuBtn = document.getElementById("wishlistMenuBtn");
const settingsMenuBtn = document.getElementById("settingsMenuBtn");
const ownerModal = document.getElementById("ownerModal");
const closeModal = document.getElementById("closeModal");

const searchForm = document.getElementById("searchForm");
const keywordInput = document.getElementById("keywordInput");
const checkInInput = document.getElementById("checkInInput");
const checkOutInput = document.getElementById("checkOutInput");
const guestsInput = document.getElementById("guestsInput");
const minPriceRange = document.getElementById("minPriceRange");
const maxPriceRange = document.getElementById("maxPriceRange");
const minPriceVal = document.getElementById("minPriceVal");
const maxPriceVal = document.getElementById("maxPriceVal");
const priceSliderTrack = document.getElementById("priceSliderTrack");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const bannerCarouselContainer = document.getElementById("bannerCarouselContainer");
const bannerTrack = document.getElementById("bannerTrack");
const bannerPrevBtn = document.getElementById("bannerPrevBtn");
const bannerNextBtn = document.getElementById("bannerNextBtn");

const propertyTypeFilters = document.getElementById("propertyTypeFilters");
const amenityFilters = document.getElementById("amenityFilters");
const nightlyFilter = document.getElementById("nightlyFilter");
const hourlyFilter = document.getElementById("hourlyFilter");
const sortSelect = document.getElementById("sortSelect");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const resultsSummary = document.getElementById("resultsSummary");
const propertiesGrid = document.getElementById("propertiesGrid");

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

let allProperties = [];
let filteredProperties = [];
let wishlistedPropertyIds = new Set();
const amenityIdToName = new Map();
let renderedCount = 20;

const fetchWishlistIds = async () => {
  if (!token) return;
  try {
    const res = await fetch(`${BASE_URL}/wishlist/ids`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      wishlistedPropertyIds = new Set(data.data);
    }
  } catch (error) {
    console.error("Failed to load wishlist IDs:", error);
  }
};

if (token && user) {
  profileBtn.innerHTML = `${user.full_name} v`;
  joinBtn.innerHTML = user.role === "OWNER" ? "Dashboard" : "Join With Us";
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

  if (user.role === "USER") {
    ownerModal.classList.add("active");
    return;
  }

  if (user.role === "ADMIN") {
    window.location.href = "../admin/admin.html";
  }
});

walletMenuBtn.addEventListener("click", () => {
  if (!token || !user) {
    window.location.href = "../auth/auth.html";
    return;
  }
  if (user.role === "OWNER") {
    window.location.href = "../owner/owner.html?tab=wallet";
    return;
  }

  window.location.href = "../user/wallet.html";
});

bookingsMenuBtn.addEventListener("click", () => {
  if (!token || !user) {
    window.location.href = "../auth/auth.html";
    return;
  }
  if (user.role === "OWNER") {
    window.location.href = "../owner/owner.html?tab=bookings";
    return;
  }

  window.location.href = "../user/bookings.html";
});

if (wishlistMenuBtn) {
  wishlistMenuBtn.addEventListener("click", () => {
    if (!token || !user) {
      window.location.href = "../auth/auth.html";
      return;
    }
    if (user.role === "OWNER") {
      alert("Wishlist is available for customers.");
      return;
    }
    window.location.href = "../user/wishlist.html";
  });
}

profileMenuBtn.addEventListener("click", () => {
  if (!token || !user) {
    window.location.href = "../auth/auth.html";
    return;
  }
  window.location.href = "../user/profile.html";
});

settingsMenuBtn.addEventListener("click", () => {
  if (!token || !user) {
    window.location.href = "../auth/auth.html";
    return;
  }
  window.location.href = "../user/profile.html?tab=security";
});

if (closeModal) {
  closeModal.addEventListener("click", () => {
    ownerModal.classList.remove("active");
  });
}

const showPartnerStatus = (state, data = {}) => {
  const overlay = document.getElementById("partnerStatusOverlay");
  const spinner = document.getElementById("partnerStatusSpinner");
  const successIcon = document.getElementById("partnerStatusSuccessIcon");
  const errorIcon = document.getElementById("partnerStatusErrorIcon");
  const title = document.getElementById("partnerStatusTitle");
  const description = document.getElementById("partnerStatusDescription");
  const actions = document.getElementById("partnerStatusActions");
  const closeBtn = document.getElementById("partnerStatusCloseBtn");

  overlay.classList.remove("hidden");
  spinner.classList.add("hidden");
  successIcon.classList.add("hidden");
  errorIcon.classList.add("hidden");
  actions.classList.add("hidden");

  if (state === "processing") {
    spinner.classList.remove("hidden");
    title.textContent = data.title || "Submitting Application";
    description.textContent = data.description || "Please wait while we process your request.";
  } 
  else if (state === "success") {
    successIcon.classList.remove("hidden");
    title.textContent = data.title || "Application Submitted! 🎉";
    description.textContent = data.description || "Your application was submitted successfully.";
    actions.classList.remove("hidden");
    closeBtn.onclick = () => {
      overlay.classList.add("hidden");
      ownerModal.classList.remove("active");
    };
  } 
  else if (state === "error") {
    errorIcon.classList.remove("hidden");
    title.textContent = data.title || "Submission Failed";
    description.textContent = data.errorMessage || "An error occurred. Please try again.";
    actions.classList.remove("hidden");
    closeBtn.onclick = () => {
      overlay.classList.add("hidden");
    };
  }
};

document.getElementById("ownerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
  }

  const body = {
    property_name: document.getElementById("propertyName").value,
    property_type: document.getElementById("propertyType").value,
    location: document.getElementById("location").value,
    area: document.getElementById("area").value,
    owner_name: document.getElementById("ownerName").value,
    contact_number: document.getElementById("contactNumber").value,
    description: document.getElementById("description").value
  };

  showPartnerStatus("processing", {
    title: "Submitting Application",
    description: "Please wait while we submit your application request..."
  });

  try {
    const response = await fetch(`${BASE_URL}/owners/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.success) {
      showPartnerStatus("success", {
        title: "Application Submitted! 🎉",
        description: "Your application to become a partner has been submitted successfully. Our team will review your application soon."
      });
      document.getElementById("ownerForm").reset();
      if (submitBtn) {
        submitBtn.disabled = false;
      }
      return;
    }

    throw new Error(data.message || "Unable to submit application.");
  } catch (error) {
    console.error(error);
    showPartnerStatus("error", {
      title: "Submission Failed",
      errorMessage: error.message || "Failed to submit application. Please try again."
    });
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../index.html";
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatINR = (value) => `INR ${toNumber(value).toFixed(2)}`;

const updateSlider = (activeInput) => {
  let minVal = parseInt(minPriceRange.value) || 0;
  let maxVal = parseInt(maxPriceRange.value) || 15000;
  const step = parseInt(minPriceRange.step) || 500;
  const maxLimit = parseInt(minPriceRange.max) || 15000;

  if (maxVal - minVal < step) {
    if (activeInput === 'min') {
      minPriceRange.value = String(maxVal - step);
      minVal = maxVal - step;
    } else {
      maxPriceRange.value = String(minVal + step);
      maxVal = minVal + step;
    }
  }

  minPriceVal.textContent = `₹${minVal.toLocaleString('en-IN')}`;
  if (maxVal >= maxLimit) {
    maxPriceVal.textContent = `₹${maxLimit.toLocaleString('en-IN')}+`;
  } else {
    maxPriceVal.textContent = `₹${maxVal.toLocaleString('en-IN')}`;
  }

  const minPercent = (minVal / maxLimit) * 100;
  const maxPercent = (maxVal / maxLimit) * 100;
  priceSliderTrack.style.background = `linear-gradient(to right, var(--border-color) ${minPercent}%, var(--primary) ${minPercent}%, var(--primary) ${maxPercent}%, var(--border-color) ${maxPercent}%)`;
};

const addCommission = (amount, commissionPercentage) => {
  const base = toNumber(amount, 0);
  const commission = toNumber(commissionPercentage, 0);
  return base > 0 ? base * (1 + (commission / 100)) : 0;
};

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

const normalizeImageList = (primaryImage, galleryImages) => {
  const images = [];

  if (primaryImage) {
    images.push(primaryImage);
  }

  if (typeof galleryImages === "string" && galleryImages.trim()) {
    images.push(...galleryImages.split("||"));
  }

  if (Array.isArray(galleryImages)) {
    images.push(...galleryImages.map((image) => image.image_url || image));
  }

  return [...new Set(images.map(img => getOptimizedImageUrl(img, 400, 300)).filter(Boolean))];
};

const buildImageGallery = (images, altText, galleryClass) => {
  if (!images.length) {
    return `<div class="${galleryClass} image-gallery empty-gallery"><div class="property-image-placeholder">No photo available</div></div>`;
  }

  const slides = images.map((image, index) => `
    <img ${index === 0 ? `src="${image}"` : `data-src="${image}"`} alt="${altText}" class="gallery-image ${index === 0 ? "active" : ""}" loading="lazy" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
  `).join("");

  const controls = images.length > 1
    ? `
      <button type="button" class="gallery-btn prev" data-gallery-move="-1" aria-label="Previous photo">&lt;</button>
      <button type="button" class="gallery-btn next" data-gallery-move="1" aria-label="Next photo">&gt;</button>
      <span class="gallery-count">1 / ${images.length}</span>
    `
    : "";

  return `<div class="${galleryClass} image-gallery" data-gallery-index="0" data-gallery-total="${images.length}">${slides}${controls}</div>`;
};

const moveGallery = (gallery, direction) => {
  const images = Array.from(gallery.querySelectorAll(".gallery-image"));
  if (images.length <= 1) {
    return;
  }

  const currentIndex = Number(gallery.dataset.galleryIndex || 0);
  const nextIndex = (currentIndex + direction + images.length) % images.length;

  const nextImage = images[nextIndex];
  if (nextImage && !nextImage.getAttribute("src") && nextImage.getAttribute("data-src")) {
    nextImage.setAttribute("src", nextImage.getAttribute("data-src"));
  }

  images[currentIndex]?.classList.remove("active");
  images[nextIndex].classList.add("active");
  gallery.dataset.galleryIndex = String(nextIndex);

  const count = gallery.querySelector(".gallery-count");
  if (count) {
    count.textContent = `${nextIndex + 1} / ${images.length}`;
  }
};

const formatLocation = (property) => {
  return [property.location, property.city, property.state].filter(Boolean).join(", ");
};

const safeDateValue = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().split("T")[0];
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

const fetchAmenities = async () => {
  try {
    const response = await fetch(`${BASE_URL}/rooms/amenities/list`);
    const data = await response.json();

    if (!data.success || !Array.isArray(data.data)) {
      return;
    }

    amenityIdToName.clear();
    data.data.forEach((amenity) => {
      const amenityId = Number(amenity.id);
      const amenityName = (amenity.name || "").trim();
      if (Number.isFinite(amenityId) && amenityName) {
        amenityIdToName.set(amenityId, amenityName);
      }
    });

    renderAmenityFilters();
  } catch (error) {
    console.error("Failed to load amenities", error);
  }
};

const getPriceCandidatesFromRoom = (room) => {
  const commission = toNumber(room.commission_percentage, 0);
  const candidates = [
    { amount: addCommission(room.price_per_night, commission), period: "/night" },
    { amount: addCommission(room.price_3hours, commission), period: "/3h" },
    { amount: addCommission(room.price_6hours, commission), period: "/6h" },
    { amount: addCommission(room.price_9hours, commission), period: "/9h" },
    { amount: addCommission(room.base_price, commission), period: "" }
  ];

  return candidates.filter((item) => item.amount > 0);
};

const loadProperties = async () => {
  try {
    propertiesGrid.innerHTML = Array(4).fill(0).map(() => `
      <div class="property-card skeleton" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; padding-bottom: 20px;">
        <div class="skeleton-image pulsing" style="height: 200px; width: 100%;"></div>
        <div class="property-card-content" style="padding: 20px;">
          <div class="skeleton-line title pulsing" style="height: 20px; width: 60%; margin-bottom: 12px;"></div>
          <div class="skeleton-line text pulsing" style="height: 14px; width: 90%; margin-bottom: 8px;"></div>
          <div class="skeleton-line text short pulsing" style="height: 14px; width: 45%; margin-bottom: 8px;"></div>
        </div>
      </div>
    `).join("");

    const response = await fetch(`${BASE_URL}/properties`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      allProperties = [];
      filteredProperties = [];
      renderProperties([]);
      return;
    }

    await fetchWishlistIds();
    await fetchAmenities();

    allProperties = data.data;

    // Dynamically adjust price range slider limits based on loaded properties
    if (data.data.length > 0) {
      const maxPropertyPrice = data.data.reduce((max, p) => Math.max(max, toNumber(p.effective_price, 0)), 0);
      const computedMax = Math.max(5000, Math.ceil(maxPropertyPrice / 1000) * 1000);
      minPriceRange.max = String(computedMax);
      maxPriceRange.max = String(computedMax);
      maxPriceRange.value = String(computedMax);
      updateSlider();
    }

    renderPropertyTypeFilters(data.data);
    applyFilters();
  } catch (error) {
    console.error(error);
    alert("Error loading properties");
  }
};

const renderAmenityFilters = () => {
  if (!amenityFilters) {
    return;
  }

  const amenities = [...amenityIdToName.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const amenityCountEl = document.getElementById("amenityCount");
  if (amenityCountEl) {
    amenityCountEl.textContent = amenities.length > 0 ? String(amenities.length) : "";
  }

  if (!amenities.length) {
    amenityFilters.innerHTML = "<p class='empty-type'>No amenities available</p>";
    return;
  }

  amenityFilters.innerHTML = amenities
    .map((amenity) => `
      <label class="checkbox-item">
        <input type="checkbox" class="amenity-checkbox" value="${amenity.id}">
        ${amenity.name}
      </label>
    `)
    .join("");
};

const renderPropertyTypeFilters = (properties) => {
  const types = [...new Set(
    properties
      .map((property) => property.property_type)
      .filter(Boolean)
      .map((type) => String(type).trim())
  )].sort((a, b) => a.localeCompare(b));

  const propertyTypeCountEl = document.getElementById("propertyTypeCount");
  if (propertyTypeCountEl) {
    propertyTypeCountEl.textContent = types.length > 0 ? String(types.length) : "";
  }

  if (types.length === 0) {
    propertyTypeFilters.innerHTML = "<p class='empty-type'>No types available</p>";
    return;
  }

  propertyTypeFilters.innerHTML = types
    .map((type) => `
      <label class="checkbox-item">
        <input type="checkbox" class="property-type-checkbox" value="${type}">
        ${type}
      </label>
    `)
    .join("");
};

const getSelectedPropertyTypes = () => {
  return [...document.querySelectorAll(".property-type-checkbox:checked")]
    .map((checkbox) => checkbox.value);
};

const getSelectedAmenityIds = () => {
  return [...document.querySelectorAll(".amenity-checkbox:checked")]
    .map((checkbox) => Number(checkbox.value))
    .filter((amenityId) => Number.isFinite(amenityId));
};

const validateDates = () => {
  const checkIn = safeDateValue(checkInInput.value);
  const checkOut = safeDateValue(checkOutInput.value);

  if (checkIn && checkOut && checkOut <= checkIn) {
    alert("Check-out date must be after check-in date.");
    return false;
  }

  return true;
};

const applyFilters = () => {
  if (!validateDates()) {
    return;
  }

  renderedCount = 20;

  const keyword = keywordInput.value.trim().toLowerCase();
  const guests = toNumber(guestsInput.value, 0);
  const minPrice = toNumber(minPriceRange.value, 0);
  const maxLimit = toNumber(maxPriceRange.max, 15000);
  const maxVal = toNumber(maxPriceRange.value, maxLimit);
  const maxPrice = maxVal >= maxLimit ? Number.MAX_SAFE_INTEGER : maxVal;
  const selectedTypes = getSelectedPropertyTypes();
  const selectedAmenityIds = getSelectedAmenityIds();
  const requireNightly = nightlyFilter.checked;
  const requireHourly = hourlyFilter.checked;
  const sortBy = sortSelect.value;

  filteredProperties = allProperties.filter((property) => {
    const searchable = [
      property.property_name,
      property.location,
      property.city,
      property.state,
      property.property_type,
      property.description
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (keyword && !searchable.includes(keyword)) {
      return false;
    }

    if (selectedTypes.length > 0) {
      const type = property.property_type ? String(property.property_type).trim() : "";
      if (!selectedTypes.includes(type)) {
        return false;
      }
    }

    if (guests > 0 && toNumber(property.max_guests, 0) < guests) {
      return false;
    }

    if (selectedAmenityIds.length > 0) {
      const roomAmenityGroups = Array.isArray(property.room_amenity_groups) ? property.room_amenity_groups : [];
      const hasMatchingRoom = roomAmenityGroups.some((roomAmenityIds) => {
        return selectedAmenityIds.every((amenityId) => roomAmenityIds.includes(amenityId));
      });

      if (!hasMatchingRoom) {
        return false;
      }
    }

    const effectivePrice = toNumber(property.effective_price, 0);
    if (effectivePrice < minPrice || effectivePrice > maxPrice) {
      return false;
    }

    if (requireNightly && !property.has_nightly) {
      return false;
    }

    if (requireHourly && !property.has_hourly) {
      return false;
    }

    return true;
  });

  sortProperties(sortBy);
  renderProperties(filteredProperties);
};

const sortProperties = (sortBy) => {
  const getTime = (property) => {
    const dateValue = new Date(property.created_at).getTime();
    return Number.isFinite(dateValue) ? dateValue : 0;
  };

  if (sortBy === "price_low") {
    filteredProperties.sort((a, b) => toNumber(a.effective_price, 0) - toNumber(b.effective_price, 0));
    return;
  }

  if (sortBy === "price_high") {
    filteredProperties.sort((a, b) => toNumber(b.effective_price, 0) - toNumber(a.effective_price, 0));
    return;
  }

  if (sortBy === "newest") {
    filteredProperties.sort((a, b) => getTime(b) - getTime(a));
    return;
  }

  if (sortBy === "name_asc") {
    filteredProperties.sort((a, b) => String(a.property_name).localeCompare(String(b.property_name)));
    return;
  }

  filteredProperties.sort((a, b) => {
    const scoreA = (a.has_hourly ? 1 : 0) + (a.has_nightly ? 1 : 0) + (toNumber(a.max_guests, 0) > 0 ? 1 : 0);
    const scoreB = (b.has_hourly ? 1 : 0) + (b.has_nightly ? 1 : 0) + (toNumber(b.max_guests, 0) > 0 ? 1 : 0);
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return getTime(b) - getTime(a);
  });
};

const getRatingLabel = (rating) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4) return "Very Good";
  if (rating >= 3) return "Good";
  return "Rated";
};

const renderProperties = (properties) => {
  propertiesGrid.innerHTML = "";
  resultsSummary.textContent = `Showing ${properties.length} of ${allProperties.length} properties`;

  if (properties.length === 0) {
    propertiesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <span class="empty-icon">🔍</span>
        </div>
        <h3>No Stays Found</h3>
        <p>Try changing filters, dates, or destination query to find your perfect stay.</p>
        <button type="button" class="reset-empty-btn">Clear All Filters</button>
      </div>
    `;
    propertiesGrid.querySelector(".reset-empty-btn")?.addEventListener("click", resetAllFilters);
    return;
  }

  const propertiesToRender = properties.slice(0, renderedCount);

  propertiesToRender.forEach((property) => {
    const galleryImages = normalizeImageList(property.property_image, property.gallery_images);
    const locationLabel = formatLocation(property) || "Location not specified";
    const propertyType = property.property_type ? String(property.property_type).trim() : "Property";
    const guestText = toNumber(property.max_guests, 0) > 0 ? `Up to ${property.max_guests} guests` : "Guest info unavailable";
    const priceLabel = toNumber(property.effective_price, 0) > 0 ? formatINR(property.effective_price) : "Price unavailable";
    const description = property.description
      ? `${String(property.description).slice(0, 95)}${String(property.description).length > 95 ? "..." : ""}`
      : "No description available";

    // Dynamic rating badge
    const avgRating = toNumber(property.average_rating, 0);
    const totalReviews = Number(property.total_reviews || 0);
    const ratingPercent = Math.min(100, Math.max(0, (avgRating / 5) * 100));
    const ratingTrustScore = toNumber(property.trust_score, 0);
    const ratingBadgeHtml = avgRating > 0
      ? `<div class="property-rating-panel">
          <div class="property-rating-summary">
            <span class="rating-label">${getRatingLabel(avgRating)}</span>
            <span class="rating-score">${avgRating.toFixed(1)}</span>
          </div>
          <div class="rating-detail-popover">
            <p>Based on ${totalReviews} rating${totalReviews === 1 ? "" : "s"} and ${totalReviews} review${totalReviews === 1 ? "" : "s"}</p>
            <div class="rating-metric">
              <span>Overall</span>
              <strong>${avgRating.toFixed(1)}</strong>
              <div class="rating-bar"><span style="width: ${ratingPercent}%"></span></div>
            </div>
            <div class="rating-metric">
              <span>Trust Score</span>
              <strong>${Math.round(ratingTrustScore) || 95}%</strong>
              <div class="rating-bar"><span style="width: ${Math.min(100, Math.max(0, ratingTrustScore || 95))}%"></span></div>
            </div>
          </div>
        </div>`
      : "";

    // Dynamic discount badge based on commission
    const commission = toNumber(property.commission_percentage, 0);
    const discountAmt = commission > 0 ? Math.round(commission + 5) : 10;
    const discountBadgeHtml = `<div class="property-discount-badge">${discountAmt}% OFF Today</div>`;

    // Dynamic verified badge based on trust score
    const trustScore = toNumber(property.trust_score, 0);
    const verifiedBadgeHtml = trustScore >= 75 || trustScore === 0
      ? `<div class="property-verified-badge">✓ Verified</div>`
      : "";

    // Generate tags
    const tags = [];
    if (avgRating >= 4.5) tags.push("🏆 Top Rated");
    if (trustScore >= 85) tags.push("💎 Best Seller");
    if (property.has_hourly) tags.push("⚡ Hourly Stay");
    tags.push("🛡️ Free Cancellation");
    const tagsHtml = tags.slice(0, 3).map(tag => `<span class="tag-pill">${tag}</span>`).join("");

    const isWishlisted = wishlistedPropertyIds.has(property.id);

    const card = document.createElement("div");
    card.className = "property-card";
    card.innerHTML = `
      <div class="property-image-container">
        ${buildImageGallery(galleryImages, property.property_name, "property-image-frame")}
        ${discountBadgeHtml}
        ${verifiedBadgeHtml}
        <div class="property-actions-container">
          <button class="property-action-btn wishlist-btn ${isWishlisted ? "wishlisted" : ""}" data-property-id="${property.id}" aria-label="Add to wishlist" title="Add to wishlist">
            ${isWishlisted ? "❤️" : "🤍"}
          </button>
          <button class="property-action-btn share-btn" data-property-id="${property.id}" data-property-name="${property.property_name}" aria-label="Share property" title="Share property">
            🔗
          </button>
        </div>
      </div>
      <div class="property-card-content ${avgRating > 0 ? "has-rating" : ""}">
        ${ratingBadgeHtml}
        <div class="property-type-row">
          <span class="property-type-badge">${propertyType}</span>
          <span class="property-guest-badge">${guestText}</span>
        </div>
        <h3>${property.property_name}</h3>
        <p class="location">📍 ${locationLabel}</p>
        
        <div class="property-tags-row">
          ${tagsHtml}
        </div>
 
        <p class="description">${description}</p>
        
        <div class="property-footer-row">
          <div class="price-container">
            <span class="price-label">Starting from</span>
            <span class="price-amount">${priceLabel}</span>
          </div>
          <button class="view-btn" data-property-id="${property.id}">
            View Rooms
          </button>
        </div>
      </div>
    `;

    propertiesGrid.appendChild(card);
  });
};

propertiesGrid.addEventListener("click", async (event) => {
  const galleryButton = event.target.closest("[data-gallery-move]");
  if (galleryButton) {
    event.stopPropagation();
    const gallery = galleryButton.closest(".image-gallery");
    moveGallery(gallery, Number(galleryButton.dataset.galleryMove));
    return;
  }

  const wishlistBtn = event.target.closest(".wishlist-btn");
  if (wishlistBtn) {
    event.stopPropagation();
    const propertyId = Number(wishlistBtn.dataset.propertyId);
    if (!propertyId) return;

    if (!token || !user) {
      window.location.href = "../auth/auth.html";
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId })
      });

      const data = await response.json();
      if (data.success) {
        if (data.added) {
          wishlistBtn.innerHTML = "❤️";
          wishlistBtn.classList.add("wishlisted");
          wishlistedPropertyIds.add(propertyId);
        } else {
          wishlistBtn.innerHTML = "🤍";
          wishlistBtn.classList.remove("wishlisted");
          wishlistedPropertyIds.delete(propertyId);
        }
      } else {
        alert(data.message || "Failed to update wishlist.");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating wishlist.");
    }
    return;
  }

  const shareBtn = event.target.closest(".share-btn");
  if (shareBtn) {
    event.stopPropagation();
    const propertyId = shareBtn.dataset.propertyId;
    const propertyName = shareBtn.dataset.propertyName;
    if (!propertyId) return;

    const shareUrl = `${window.location.origin}${window.location.pathname.replace(/\/home\/.*$/, '')}/rooms/rooms-by-property.html?propertyId=${propertyId}`;
    const shareText = `Check out ${propertyName} on AponGhar! View stays and book rooms directly here:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyName,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        console.log("Web share failed or canceled:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
      if (await window.customConfirm(`Link copied to clipboard!\n\nUrl: ${shareUrl}\n\nWould you like to share directly on WhatsApp?`)) {
        window.open(waUrl, "_blank");
      }
    } catch (clipErr) {
      console.error("Clipboard copy failed:", clipErr);
      alert(`Copy this link to share: ${shareUrl}`);
    }
    return;
  }
});

const clearSearchFields = () => {
  keywordInput.value = "";
  checkInInput.value = "";
  checkOutInput.value = "";
  guestsInput.value = "";
  minPriceRange.value = minPriceRange.min || "0";
  maxPriceRange.value = maxPriceRange.max || "15000";
  updateSlider();
};

const resetAllFilters = () => {
  clearSearchFields();
  nightlyFilter.checked = false;
  hourlyFilter.checked = false;
  sortSelect.value = "recommended";
  document.querySelectorAll(".property-type-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
  });
  document.querySelectorAll(".amenity-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
  });
  applyFilters();
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

clearSearchBtn.addEventListener("click", () => {
  clearSearchFields();
  applyFilters();
});

resetFiltersBtn.addEventListener("click", () => {
  resetAllFilters();
});

// Popular Search Chips handler
document.querySelectorAll(".search-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const location = chip.dataset.location;
    if (location) {
      keywordInput.value = location;
      applyFilters();
      document.querySelector(".properties-section")?.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Travel Category Cards handler
document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;
    if (!category) return;

    // Reset other checkboxes
    document.querySelectorAll(".property-type-checkbox").forEach((cb) => {
      cb.checked = false;
    });

    // Find and check the corresponding checkbox
    let matched = false;
    document.querySelectorAll(".property-type-checkbox").forEach((cb) => {
      if (cb.value.toLowerCase().includes(category.toLowerCase()) || 
          category.toLowerCase().includes(cb.value.toLowerCase())) {
        cb.checked = true;
        matched = true;
      }
    });

    // If no checkbox matched, it means the database doesn't have properties of this type yet.
    // We can still trigger search/filtering or just apply what we have.
    applyFilters();
    document.querySelector(".properties-section")?.scrollIntoView({ behavior: "smooth" });
  });
});

propertyTypeFilters.addEventListener("change", () => {
  applyFilters();
});

if (amenityFilters) {
  amenityFilters.addEventListener("change", () => {
    applyFilters();
  });
}

nightlyFilter.addEventListener("change", applyFilters);
hourlyFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

propertiesGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".view-btn");
  if (!button) {
    return;
  }

  const propertyId = button.dataset.propertyId;
  if (!propertyId) {
    return;
  }

  const params = new URLSearchParams();
  params.set("propertyId", propertyId);

  const checkIn = safeDateValue(checkInInput.value);
  const checkOut = safeDateValue(checkOutInput.value);
  const guests = toNumber(guestsInput.value, 0);

  if (checkIn) {
    params.set("checkIn", checkIn);
  }
  if (checkOut) {
    params.set("checkOut", checkOut);
  }
  if (guests > 0) {
    params.set("guests", String(guests));
  }

  const amenityIds = getSelectedAmenityIds();
  if (amenityIds.length > 0) {
    params.set("amenities", amenityIds.join(","));
  }

  window.location.href = `../rooms/rooms-by-property.html?${params.toString()}`;
});

// Mobile filter drawer toggle
const filterToggleBtn = document.getElementById("filterToggleBtn");
const filterOverlay = document.getElementById("filterOverlay");
const filtersSidebar = document.querySelector(".filters-sidebar");

if (filterToggleBtn && filterOverlay && filtersSidebar) {
  filterToggleBtn.addEventListener("click", () => {
    filtersSidebar.classList.add("active");
    filterOverlay.classList.add("active");
  });

  filterOverlay.addEventListener("click", () => {
    filtersSidebar.classList.remove("active");
    filterOverlay.classList.remove("active");
  });
}

// Become Partner CTA click handler
document.getElementById("partnerCtaBtn")?.addEventListener("click", () => {
  joinBtn.click();
});

minPriceRange.addEventListener("input", () => {
  minPriceRange.style.zIndex = "3";
  maxPriceRange.style.zIndex = "2";
  updateSlider("min");
  applyFilters();
});

maxPriceRange.addEventListener("input", () => {
  maxPriceRange.style.zIndex = "3";
  minPriceRange.style.zIndex = "2";
  updateSlider("max");
  applyFilters();
});

const updateZIndex = (e) => {
  const rect = minPriceRange.getBoundingClientRect();
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  if (!clientX) return;
  const percentage = (clientX - rect.left) / rect.width;
  const minLimit = Number(minPriceRange.min) || 0;
  const maxLimit = Number(minPriceRange.max) || 15000;
  const value = minLimit + percentage * (maxLimit - minLimit);
  
  const distMin = Math.abs(Number(minPriceRange.value) - value);
  const distMax = Math.abs(Number(maxPriceRange.value) - value);
  
  if (distMin < distMax) {
    minPriceRange.style.zIndex = "3";
    maxPriceRange.style.zIndex = "2";
  } else {
    maxPriceRange.style.zIndex = "3";
    minPriceRange.style.zIndex = "2";
  }
};

const sliderContainer = document.querySelector(".price-slider-container");
if (sliderContainer) {
  sliderContainer.addEventListener("mousemove", updateZIndex);
  sliderContainer.addEventListener("touchstart", updateZIndex, { passive: true });
}

// =============================================
// ADVERTISEMENT CAROUSEL SYSTEM
// =============================================
let activeBannerIndex = 0;
let bannerTimer = null;
let bannerCount = 0;

const loadBanners = async () => {
  if (!bannerTrack) return;

  try {
    const res = await fetch(`${BASE_URL}/advertisements`);
    const data = await res.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      const activeAds = data.data;
      bannerCount = activeAds.length;

      bannerTrack.innerHTML = activeAds.map((ad) => {
        const imageUrl = resolveImageUrl(ad.image_url);
        return `
          <div class="banner-slide" onclick="window.open('${escapeHTML(ad.redirect_url)}', '_blank')">
            <img src="${imageUrl}" alt="Advertisement Banner" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
          </div>
        `;
      }).join("");

      bannerCarouselContainer.style.display = "block";
      initBannerCarousel();
    } else {
      bannerCarouselContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Failed to load promotional banners:", error);
    bannerCarouselContainer.style.display = "none";
  }
};

const showBannerSlide = (index) => {
  if (bannerCount === 0) return;
  activeBannerIndex = (index + bannerCount) % bannerCount;
  bannerTrack.style.transform = `translateX(-${activeBannerIndex * 100}%)`;
};

const initBannerCarousel = () => {
  activeBannerIndex = 0;
  showBannerSlide(0);

  if (bannerCount <= 1) {
    if (bannerPrevBtn) bannerPrevBtn.style.display = "none";
    if (bannerNextBtn) bannerNextBtn.style.display = "none";
    return;
  }

  if (bannerPrevBtn) {
    bannerPrevBtn.style.display = "flex";
    bannerPrevBtn.addEventListener("click", () => {
      resetBannerInterval();
      showBannerSlide(activeBannerIndex - 1);
    });
  }

  if (bannerNextBtn) {
    bannerNextBtn.style.display = "flex";
    bannerNextBtn.addEventListener("click", () => {
      resetBannerInterval();
      showBannerSlide(activeBannerIndex + 1);
    });
  }

  startBannerInterval();
};

const startBannerInterval = () => {
  stopBannerInterval();
  bannerTimer = setInterval(() => {
    showBannerSlide(activeBannerIndex + 1);
  }, 5000);
};

const stopBannerInterval = () => {
  if (bannerTimer) {
    clearInterval(bannerTimer);
    bannerTimer = null;
  }
};

const resetBannerInterval = () => {
  startBannerInterval();
};

document.addEventListener("DOMContentLoaded", () => {
  loadProperties();
  updateSlider();
  loadBanners();

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getTodayDateString();
  if (checkInInput) {
    checkInInput.min = todayStr;
    checkInInput.addEventListener("change", () => {
      if (checkOutInput) {
        checkOutInput.min = checkInInput.value;
        if (checkOutInput.value && checkOutInput.value < checkInInput.value) {
          checkOutInput.value = checkInInput.value;
        }
      }
    });
  }
  if (checkOutInput) {
    checkOutInput.min = todayStr;
  }

  if (localStorage.getItem("triggerOwnerOnboarding") === "true") {
    localStorage.removeItem("triggerOwnerOnboarding");
    setTimeout(() => {
      if (joinBtn) joinBtn.click();
    }, 300);
  }

  window.addEventListener("scroll", () => {
    if (renderedCount >= filteredProperties.length) {
      return;
    }
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
      renderedCount += 20;
      renderProperties(filteredProperties);
    }
  });
});
