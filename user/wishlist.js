// API Configuration is loaded from config.js
const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api';
// ASSET_BASE_URL is already defined in config.js
const IMAGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><rect width='100%' height='100%' fill='%23f3f4f6'/><g fill='%239ca3af' transform='translate(180, 110) scale(1.5)'><path d='M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.12-1.12A1 1 0 0010.586 3H7.414a1 1 0 00-.707.293L5.586 4.707A1 1 0 014.88 5H4zM10 8a3 3 0 100 6 3 3 0 000-6z'/></g></svg>";

const logoutBtn = document.getElementById("logoutBtn");
const wishlistMessage = document.getElementById("wishlistMessage");
const propertiesGrid = document.getElementById("propertiesGrid");

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  window.location.href = "../index.html";
}

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../index.html";
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatINR = (value) => `INR ${toNumber(value).toFixed(2)}`;

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
  return [...new Set(images.map(resolveImageUrl).filter(Boolean))];
};

const buildImageGallery = (images, altText, galleryClass) => {
  if (!images.length) {
    return `<div class="${galleryClass} image-gallery empty-gallery"><div class="property-image-placeholder">No photo available</div></div>`;
  }
  const slides = images.map((image, index) => `
    <img src="${image}" alt="${altText}" class="gallery-image ${index === 0 ? "active" : ""}" loading="lazy" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
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

const enrichPropertyWithRooms = async (property) => {
  const commission = toNumber(property.commission_percentage, 0);
  const fallbackPrice = addCommission(property.starting_price || 0, commission);
  try {
    const res = await fetch(`${BASE_URL}/rooms/property/${property.id}`);
    const data = await res.json();
    const rooms = data.success && Array.isArray(data.data) ? data.data : [];
    
    let maxGuests = 0;
    let hasHourly = false;
    let hasNightly = false;
    const roomTypes = new Set();
    const allPriceEntries = [];

    rooms.forEach((room) => {
      const isRoomHourly = room.price_type === "HOURLY" || room.price_type === "BOTH";
      const isRoomNightly = room.price_type === "PER_NIGHT" || room.price_type === "BOTH";
      
      if (isRoomHourly) hasHourly = true;
      if (isRoomNightly) hasNightly = true;

      if (isRoomNightly) {
        const rate = addCommission(room.price_per_night || room.base_price, commission);
        if (rate > 0) allPriceEntries.push({ amount: rate, period: "/night" });
      }
      if (isRoomHourly) {
        const rates = [room.price_3hours, room.price_6hours, room.price_9hours].filter((r) => toNumber(r) > 0);
        rates.forEach((r) => {
          allPriceEntries.push({ amount: addCommission(r, commission), period: "/hourly" });
        });
      }
      const adults = toNumber(room.max_adults, 0);
      const children = toNumber(room.max_children, 0);
      maxGuests = Math.max(maxGuests, adults + children);
      if (room.room_type) roomTypes.add(String(room.room_type).trim());
    });

    if (fallbackPrice > 0) {
      allPriceEntries.push({ amount: fallbackPrice, period: "/night" });
    }

    const cheapestEntry = allPriceEntries.length > 0
      ? allPriceEntries.reduce((lowest, current) => current.amount < lowest.amount ? current : lowest)
      : null;

    return {
      ...property,
      effective_price: cheapestEntry ? cheapestEntry.amount : 0,
      effective_price_period: cheapestEntry ? cheapestEntry.period : "",
      max_guests: maxGuests,
      has_nightly: hasNightly || fallbackPrice > 0,
      has_hourly: hasHourly,
      room_types: [...roomTypes]
    };
  } catch (error) {
    console.error(`Failed to enrich property ${property.id}`, error);
    return {
      ...property,
      effective_price: fallbackPrice,
      effective_price_period: fallbackPrice > 0 ? "/night" : "",
      max_guests: 0,
      has_nightly: fallbackPrice > 0,
      has_hourly: false,
      room_types: []
    };
  }
};

const getRatingLabel = (rating) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4) return "Very Good";
  if (rating >= 3) return "Good";
  return "Rated";
};

const renderWishlist = (properties) => {
  propertiesGrid.innerHTML = "";
  if (properties.length === 0) {
    wishlistMessage.classList.add("hidden");
    propertiesGrid.innerHTML = `
      <div class="empty-wishlist" style="grid-column: 1 / -1;">
        <span class="empty-wishlist-icon">❤️</span>
        <h3>Your Wishlist is Empty</h3>
        <p>Explore beautiful hotels, villas, and resorts and tap the heart icon to save them here.</p>
        <a href="../home/home.html" class="empty-wishlist-btn">Explore Stays</a>
      </div>
    `;
    return;
  }

  wishlistMessage.classList.add("hidden");

  properties.forEach((property) => {
    const galleryImages = normalizeImageList(property.property_image, property.gallery_images);
    const locationLabel = formatLocation(property) || "Location not specified";
    const propertyType = property.property_type ? String(property.property_type).trim() : "Property";
    const guestText = toNumber(property.max_guests, 0) > 0 ? `Up to ${property.max_guests} guests` : "Guest info unavailable";
    const priceLabel = toNumber(property.effective_price, 0) > 0 ? formatINR(property.effective_price) : "Price unavailable";
    const description = property.description
      ? `${String(property.description).slice(0, 95)}${String(property.description).length > 95 ? "..." : ""}`
      : "No description available";

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

    const commission = toNumber(property.commission_percentage, 0);
    const discountAmt = commission > 0 ? Math.round(commission + 5) : 10;
    const discountBadgeHtml = `<div class="property-discount-badge">${discountAmt}% OFF Today</div>`;

    const trustScore = toNumber(property.trust_score, 0);
    const verifiedBadgeHtml = trustScore >= 75 || trustScore === 0
      ? `<div class="property-verified-badge">✓ Verified</div>`
      : "";

    const tags = [];
    if (avgRating >= 4.5) tags.push("🏆 Top Rated");
    if (trustScore >= 85) tags.push("💎 Best Seller");
    if (property.has_hourly) tags.push("⚡ Hourly Stay");
    tags.push("🛡️ Free Cancellation");
    const tagsHtml = tags.slice(0, 3).map(tag => `<span class="tag-pill">${tag}</span>`).join("");

    const card = document.createElement("div");
    card.className = "property-card";
    card.dataset.propertyId = property.id;
    card.innerHTML = `
      <div class="property-image-container">
        ${buildImageGallery(galleryImages, property.property_name, "property-image-frame")}
        ${discountBadgeHtml}
        ${verifiedBadgeHtml}
        <div class="property-actions-container">
          <button class="property-action-btn wishlist-btn wishlisted" data-property-id="${property.id}" aria-label="Remove from wishlist" title="Remove from wishlist">
            ❤️
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

const loadWishlist = async () => {
  try {
    const res = await fetch(`${BASE_URL}/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      renderWishlist([]);
      return;
    }
    const enriched = await Promise.all(data.data.map(property => enrichPropertyWithRooms(property)));
    renderWishlist(enriched);
  } catch (error) {
    console.error(error);
    wishlistMessage.textContent = "Error loading wishlist.";
  }
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
        // Since we are on wishlist page, remove the card immediately
        const card = wishlistBtn.closest(".property-card");
        if (card) {
          card.style.opacity = "0";
          card.style.transform = "scale(0.9)";
          card.style.transition = "all 0.3s ease";
          setTimeout(() => {
            card.remove();
            if (propertiesGrid.children.length === 0) {
              renderWishlist([]);
            }
          }, 300);
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

    const shareUrl = `${window.location.origin}/frontend/rooms/rooms-by-property.html?propertyId=${propertyId}`;
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
      if (confirm(`Link copied to clipboard!\n\nUrl: ${shareUrl}\n\nWould you like to share directly on WhatsApp?`)) {
        window.open(waUrl, "_blank");
      }
    } catch (clipErr) {
      console.error("Clipboard copy failed:", clipErr);
      alert(`Copy this link to share: ${shareUrl}`);
    }
    return;
  }

  const viewBtn = event.target.closest(".view-btn");
  if (viewBtn) {
    event.stopPropagation();
    const propertyId = viewBtn.dataset.propertyId;
    if (propertyId) {
      window.location.href = `../rooms/rooms-by-property.html?propertyId=${propertyId}`;
    }
  }
});

loadWishlist();
