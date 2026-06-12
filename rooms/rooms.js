// API Configuration is loaded from config.js
const BASE_URL = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/rooms';
const PROPERTIES_BASE_URL = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/properties';
// ASSET_BASE_URL is already defined in config.js
const IMAGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><rect width='100%' height='100%' fill='%23f3f4f6'/><g fill='%239ca3af' transform='translate(180, 110) scale(1.5)'><path d='M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.12-1.12A1 1 0 0010.586 3H7.414a1 1 0 00-.707.293L5.586 4.707A1 1 0 014.88 5H4zM10 8a3 3 0 100 6 3 3 0 000-6z'/></g></svg>";
const token = localStorage.getItem("token");
const propertyId = localStorage.getItem("selectedPropertyId");

const queryParams = new URLSearchParams(window.location.search);
const mode = queryParams.get("mode") === "my" ? "my" : "add";

const pageTitle = document.getElementById("pageTitle");
const addRoomSection = document.getElementById("addRoomSection");
const myRoomsSection = document.getElementById("myRoomsSection");
const switchToAddBtn = document.getElementById("switchToAddBtn");
const switchToMyBtn = document.getElementById("switchToMyBtn");

const roomsContainer = document.getElementById("roomsContainer");
const roomForm = document.getElementById("roomForm");
const roomQuantityInput = document.getElementById("roomQuantity");
const quantityInfo = document.getElementById("quantityInfo");
const roomImagesInput = document.getElementById("room_images");

const editRoomModal = document.getElementById("editRoomModal");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const editRoomForm = document.getElementById("editRoomForm");
const editRoomImagesInput = document.getElementById("edit_room_images");

const pricePerNightInput = document.getElementById("price_per_night");
const price3hoursInput = document.getElementById("price_3hours");
const price6hoursInput = document.getElementById("price_6hours");
const price9hoursInput = document.getElementById("price_9hours");

const editPricePerNightInput = document.getElementById("edit_price_per_night");
const editPrice3hoursInput = document.getElementById("edit_price_3hours");
const editPrice6hoursInput = document.getElementById("edit_price_6hours");
const editPrice9hoursInput = document.getElementById("edit_price_9hours");

const groupPerNight = pricePerNightInput.closest(".pricing-input-group");
const group3hours = price3hoursInput.closest(".pricing-input-group");
const group6hours = price6hoursInput.closest(".pricing-input-group");
const group9hours = price9hoursInput.closest(".pricing-input-group");

const editGroupPerNight = editPricePerNightInput.closest(".pricing-input-group");
const editGroup3hours = editPrice3hoursInput.closest(".pricing-input-group");
const editGroup6hours = editPrice6hoursInput.closest(".pricing-input-group");
const editGroup9hours = editPrice9hoursInput.closest(".pricing-input-group");

function updatePricingInputsVisibility(priceType, isEdit = false) {
  const gn = isEdit ? editGroupPerNight : groupPerNight;
  const g3 = isEdit ? editGroup3hours : group3hours;
  const g6 = isEdit ? editGroup6hours : group6hours;
  const g9 = isEdit ? editGroup9hours : group9hours;

  const inpN = isEdit ? editPricePerNightInput : pricePerNightInput;
  const inp3 = isEdit ? editPrice3hoursInput : price3hoursInput;
  const inp6 = isEdit ? editPrice6hoursInput : price6hoursInput;
  const inp9 = isEdit ? editPrice9hoursInput : price9hoursInput;

  if (priceType === "PER_NIGHT") {
    gn.classList.remove("hidden");
    g3.classList.add("hidden");
    g6.classList.add("hidden");
    g9.classList.add("hidden");

    inpN.disabled = false;
    inp3.disabled = true;
    inp6.disabled = true;
    inp9.disabled = true;
  } else if (priceType === "HOURLY") {
    gn.classList.add("hidden");
    g3.classList.remove("hidden");
    g6.classList.remove("hidden");
    g9.classList.remove("hidden");

    inpN.disabled = true;
    inp3.disabled = false;
    inp6.disabled = false;
    inp9.disabled = false;
  } else if (priceType === "BOTH") {
    gn.classList.remove("hidden");
    g3.classList.remove("hidden");
    g6.classList.remove("hidden");
    g9.classList.remove("hidden");

    inpN.disabled = false;
    inp3.disabled = false;
    inp6.disabled = false;
    inp9.disabled = false;
  }
}

// Listeners for pricing type change
document.querySelectorAll('input[name="price_type"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    updatePricingInputsVisibility(e.target.value, false);
  });
});

document.querySelectorAll('input[name="edit_price_type"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    updatePricingInputsVisibility(e.target.value, true);
  });
});

let amenitiesList = [];
let roomsList = [];

const ROOM_BENEFIT_OPTIONS = [
  "Meals available at extra charges",
  "Free cancellation till 24 hrs before check in",
  "Breakfast included",
  "No prepayment needed",
  "Pay at hotel",
  "Couple friendly",
  "Extra bed available",
  "Early check-in subject to availability",
  "Late check-out subject to availability",
  "Daily housekeeping"
];

function resolveImageUrl(imagePath) {
  if (!imagePath) {
    return "";
  }

  const path = String(imagePath).trim();
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "").replace(/\\/g, "/");
  return `${ASSET_BASE_URL}/${normalizedPath}`;
}

function normalizeImageList(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return [...new Set(images.map((image) => resolveImageUrl(image.image_url || image)).filter(Boolean))];
}

function buildRoomGallery(images, altText) {
  if (!images.length) {
    return "<div class='room-card-gallery empty-gallery'><div class='room-gallery-placeholder'>No room photos</div></div>";
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

  return `<div class="room-card-gallery" data-gallery-index="0">${slides}${controls}</div>`;
}

function moveGallery(gallery, direction) {
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
}

if (!token || !propertyId) {
  alert("Please select a property first.");
  window.location.href = "../owner/owner.html";
}

async function ensureSelectedPropertyRoomAccess() {
  try {
    const res = await fetch(`${PROPERTIES_BASE_URL}/my-properties`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    const properties = data.data || [];

    const selectedProperty = properties.find(
      (property) => Number(property.id) === Number(propertyId)
    );

    if (!selectedProperty) {
      alert("Property not found. Please open it again from Owner Dashboard.");
      window.location.href = "../owner/owner.html";
      return false;
    }

    const hasRoomAccess =
      selectedProperty.approval_status === "APPROVED" &&
      Boolean(selectedProperty.is_active);

    if (!hasRoomAccess) {
      alert("This property is inactive or not approved. Room management is disabled.");
      window.location.href = "../owner/owner.html";
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    alert("Unable to verify property access.");
    window.location.href = "../owner/owner.html";
    return false;
  }
}

function setPageMode() {
  if (mode === "my") {
    pageTitle.textContent = "My Rooms";
    addRoomSection.classList.add("hidden");
    myRoomsSection.classList.remove("hidden");
    switchToMyBtn.classList.add("active");
    switchToAddBtn.classList.remove("active");
    return;
  }

  pageTitle.textContent = "Add Rooms";
  myRoomsSection.classList.add("hidden");
  addRoomSection.classList.remove("hidden");
  switchToAddBtn.classList.add("active");
  switchToMyBtn.classList.remove("active");
}

function normalizeAmenityIds(amenityValue) {
  if (!amenityValue) {
    return [];
  }

  if (Array.isArray(amenityValue)) {
    return amenityValue.map((id) => Number(id));
  }

  if (typeof amenityValue === "string") {
    try {
      const parsed = JSON.parse(amenityValue);
      return Array.isArray(parsed) ? parsed.map((id) => Number(id)) : [];
    } catch (error) {
      return [];
    }
  }

  return [];
}

function normalizeRoomBenefits(benefitsValue) {
  if (!benefitsValue) {
    return [];
  }

  if (Array.isArray(benefitsValue)) {
    return benefitsValue.filter(Boolean);
  }

  if (typeof benefitsValue === "string") {
    try {
      const parsed = JSON.parse(benefitsValue);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  return [];
}

function renderAmenitiesCheckboxes(containerId, selectedAmenities = []) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  if (!amenitiesList.length) {
    container.innerHTML = "<p style='color:#999;margin:0;'>No amenities available right now.</p>";
    return;
  }

  const selectedSet = new Set(selectedAmenities.map((id) => Number(id)));
  container.innerHTML = "";

  amenitiesList.forEach((amenity) => {
    const amenityId = Number(amenity.id);
    const div = document.createElement("div");
    div.className = "amenity-item";
    div.innerHTML = `
      <input type="checkbox" id="${containerId}-amenity-${amenityId}" value="${amenityId}" ${selectedSet.has(amenityId) ? "checked" : ""}>
      <label for="${containerId}-amenity-${amenityId}">${amenity.name}</label>
    `;
    container.appendChild(div);
  });
}

function renderBenefitCheckboxes(containerId, selectedBenefits = []) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  const selectedSet = new Set(selectedBenefits);
  container.innerHTML = "";

  ROOM_BENEFIT_OPTIONS.forEach((benefit, index) => {
    const benefitId = `${containerId}-benefit-${index}`;
    const div = document.createElement("div");
    div.className = "benefit-item";
    div.innerHTML = `
      <input type="checkbox" id="${benefitId}" value="${benefit}" ${selectedSet.has(benefit) ? "checked" : ""}>
      <label for="${benefitId}">${benefit}</label>
    `;
    container.appendChild(div);
  });
}

function getCheckedAmenities(containerId) {
  const checkboxes = document.querySelectorAll(`#${containerId} input[type='checkbox']:checked`);
  return Array.from(checkboxes).map((cb) => Number(cb.value));
}

function getCheckedBenefits(containerId) {
  const checkboxes = document.querySelectorAll(`#${containerId} input[type='checkbox']:checked`);
  return Array.from(checkboxes).map((cb) => cb.value);
}

async function loadAmenities() {
  try {
    const res = await fetch(`${BASE_URL}/amenities/list`);
    const data = await res.json();

    if (data.success) {
      amenitiesList = data.data || [];
    } else {
      amenitiesList = [];
    }
  } catch (error) {
    console.error("Error loading amenities:", error);
    amenitiesList = [];
  }

  renderAmenitiesCheckboxes("amenitiesContainer");
}

function getRoomDataFromCreateForm() {
  const priceType = document.querySelector('input[name="price_type"]:checked')?.value;
  const data = {
    room_name: document.getElementById("room_name").value.trim(),
    room_type: document.getElementById("room_type").value.trim(),
    description: document.getElementById("description").value.trim(),
    max_adults: Number(document.getElementById("max_adults").value),
    max_children: Number(document.getElementById("max_children").value),
    bed_type: document.getElementById("bed_type").value.trim(),
    room_size: document.getElementById("room_size").value.trim(),
    room_amenities: getCheckedAmenities("amenitiesContainer"),
    room_benefits: getCheckedBenefits("benefitsContainer"),
    price_type: priceType,
    base_price: Number(document.getElementById("base_price").value)
  };

  const price_per_night = document.getElementById("price_per_night").value.trim();
  const price_3hours = document.getElementById("price_3hours").value.trim();
  const price_6hours = document.getElementById("price_6hours").value.trim();
  const price_9hours = document.getElementById("price_9hours").value.trim();

  if (priceType === "PER_NIGHT" || priceType === "BOTH") {
    if (price_per_night !== "") {
      data.price_per_night = Number(price_per_night);
    }
  }
  if (priceType === "HOURLY" || priceType === "BOTH") {
    if (price_3hours !== "") data.price_3hours = Number(price_3hours);
    if (price_6hours !== "") data.price_6hours = Number(price_6hours);
    if (price_9hours !== "") data.price_9hours = Number(price_9hours);
  }

  return data;
}

function getRoomDataFromEditForm() {
  const priceType = document.querySelector('input[name="edit_price_type"]:checked')?.value;
  const data = {
    room_id: document.getElementById("edit_room_id").value.trim(),
    room_name: document.getElementById("edit_room_name").value.trim(),
    room_type: document.getElementById("edit_room_type").value.trim(),
    description: document.getElementById("edit_description").value.trim(),
    max_adults: Number(document.getElementById("edit_max_adults").value),
    max_children: Number(document.getElementById("edit_max_children").value),
    bed_type: document.getElementById("edit_bed_type").value.trim(),
    room_size: document.getElementById("edit_room_size").value.trim(),
    room_amenities: getCheckedAmenities("editAmenitiesContainer"),
    room_benefits: getCheckedBenefits("editBenefitsContainer"),
    price_type: priceType,
    base_price: Number(document.getElementById("edit_base_price").value)
  };

  const price_per_night = document.getElementById("edit_price_per_night").value.trim();
  const price_3hours = document.getElementById("edit_price_3hours").value.trim();
  const price_6hours = document.getElementById("edit_price_6hours").value.trim();
  const price_9hours = document.getElementById("edit_price_9hours").value.trim();

  if (priceType === "PER_NIGHT" || priceType === "BOTH") {
    if (price_per_night !== "") {
      data.price_per_night = Number(price_per_night);
    }
  }
  if (priceType === "HOURLY" || priceType === "BOTH") {
    if (price_3hours !== "") data.price_3hours = Number(price_3hours);
    if (price_6hours !== "") data.price_6hours = Number(price_6hours);
    if (price_9hours !== "") data.price_9hours = Number(price_9hours);
  }

  return data;
}

function validateRoomPayload(roomData) {
  if (!roomData.room_name || !roomData.room_type) {
    alert("Please fill in room name and room type.");
    return false;
  }

  if (!roomData.price_type) {
    alert("Please select pricing type.");
    return false;
  }

  if (!roomData.base_price || roomData.base_price <= 0) {
    alert("Base price must be greater than 0.");
    return false;
  }

  if (roomData.price_type === "PER_NIGHT" && (!roomData.price_per_night || roomData.price_per_night <= 0)) {
    alert("Price Per Night must be greater than 0.");
    return false;
  }

  if (roomData.price_type === "HOURLY" &&
      (!roomData.price_3hours || roomData.price_3hours <= 0) &&
      (!roomData.price_6hours || roomData.price_6hours <= 0) &&
      (!roomData.price_9hours || roomData.price_9hours <= 0)) {
    alert("Hourly pricing must have at least one rate (3, 6, or 9 hours) greater than 0.");
    return false;
  }

  if (roomData.price_type === "BOTH") {
    if (!roomData.price_per_night || roomData.price_per_night <= 0) {
      alert("Price Per Night must be greater than 0 for nightly stays.");
      return false;
    }
    if ((!roomData.price_3hours || roomData.price_3hours <= 0) &&
        (!roomData.price_6hours || roomData.price_6hours <= 0) &&
        (!roomData.price_9hours || roomData.price_9hours <= 0)) {
      alert("Hourly pricing must have at least one rate (3, 6, or 9 hours) greater than 0.");
      return false;
    }
  }

  return true;
}

async function uploadImagesToSingleRoom(roomDbId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const res = await fetch(`${BASE_URL}/${roomDbId}/images`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || `Image upload failed for room ${roomDbId}`);
  }
}

async function fetchRoomGallery(roomDbId) {
  if (!roomDbId) {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/${roomDbId}/gallery`);
    const data = await res.json();
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to load room photos:", error);
    return [];
  }
}

async function attachRoomGalleries(rooms) {
  return Promise.all(rooms.map(async (room) => ({
    ...room,
    room_images: await fetchRoomGallery(room.id)
  })));
}

async function uploadImagesToCreatedRooms(roomDbIds, files) {
  if (!files.length || !roomDbIds.length) {
    return { uploaded: 0, failed: 0 };
  }

  let uploaded = 0;
  let failed = 0;

  for (const roomDbId of roomDbIds) {
    try {
      await uploadImagesToSingleRoom(roomDbId, files);
      uploaded += 1;
    } catch (error) {
      console.error(error);
      failed += 1;
    }
  }

  return { uploaded, failed };
}

roomQuantityInput.addEventListener("change", () => {
  const quantity = roomQuantityInput.value;
  if (quantity === "1") {
    quantityInfo.textContent = "1 room will be created with these details";
  } else {
    quantityInfo.textContent = `${quantity} rooms will be created with identical details (unique room IDs)`;
  }
});

roomForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const quantity = Number(roomQuantityInput.value);
  const roomData = getRoomDataFromCreateForm();
  const selectedFiles = Array.from(roomImagesInput?.files || []);
  const submitBtn = document.getElementById("submitBtn");

  if (!validateRoomPayload(roomData)) {
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    let endpoint = `${BASE_URL}/property/${propertyId}`;
    let requestBody = roomData;

    if (quantity > 1) {
      endpoint = `${BASE_URL}/property/${propertyId}/bulk`;
      requestBody = { rooms: Array(quantity).fill(roomData) };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Failed to create room(s).");
      return;
    }

    const createdRoomIds = [];
    if (data?.data?.id) {
      createdRoomIds.push(Number(data.data.id));
    }
    if (Array.isArray(data?.data?.rooms)) {
      data.data.rooms.forEach((room) => {
        if (room?.id) {
          createdRoomIds.push(Number(room.id));
        }
      });
    }

    let finalMessage = quantity > 1 ? `${quantity} rooms created successfully.` : "Room created successfully.";

    if (selectedFiles.length > 0 && createdRoomIds.length > 0) {
      submitBtn.textContent = "Uploading images...";
      const uploadResult = await uploadImagesToCreatedRooms(createdRoomIds, selectedFiles);

      if (uploadResult.failed === 0) {
        finalMessage += ` ${selectedFiles.length} image(s) uploaded to ${uploadResult.uploaded} room(s).`;
      } else {
        finalMessage += ` Images uploaded to ${uploadResult.uploaded} room(s), failed for ${uploadResult.failed} room(s).`;
      }
    }

    alert(finalMessage);
    roomForm.reset();
    roomQuantityInput.value = "1";
    quantityInfo.textContent = "1 room will be created with these details";
    renderAmenitiesCheckboxes("amenitiesContainer");
    renderBenefitCheckboxes("benefitsContainer");
  } catch (error) {
    console.error(error);
    alert("Failed to create room(s).");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Room";
  }
});

function getAmenitiesText(room) {
  const ids = normalizeAmenityIds(room.room_amenities);
  const names = ids
    .map((id) => amenitiesList.find((amenity) => Number(amenity.id) === Number(id))?.name)
    .filter(Boolean);

  return names.length ? names.join(", ") : "None";
}

function getBenefitsText(room) {
  const benefits = normalizeRoomBenefits(room.room_benefits);
  return benefits.length ? benefits.join(", ") : "None";
}

function openEditModal(roomId) {
  const room = roomsList.find((item) => Number(item.id) === Number(roomId));
  if (!room) {
    return;
  }

  document.getElementById("edit_room_db_id").value = room.id;
  document.getElementById("edit_room_id").value = room.room_id || "";
  document.getElementById("edit_room_name").value = room.room_name || "";
  document.getElementById("edit_room_type").value = room.room_type || "";
  document.getElementById("edit_description").value = room.description || "";
  document.getElementById("edit_max_adults").value = room.max_adults ?? 1;
  document.getElementById("edit_max_children").value = room.max_children ?? 0;
  document.getElementById("edit_bed_type").value = room.bed_type || "";
  document.getElementById("edit_room_size").value = room.room_size || "";
  document.getElementById("edit_base_price").value = room.base_price ?? 0;
  document.getElementById("edit_price_per_night").value = room.price_per_night ?? 0;
  document.getElementById("edit_price_3hours").value = room.price_3hours ?? 0;
  document.getElementById("edit_price_6hours").value = room.price_6hours ?? 0;
  document.getElementById("edit_price_9hours").value = room.price_9hours ?? 0;

  const priceType = room.price_type || "PER_NIGHT";
  document.getElementById("editPricePerNight").checked = priceType === "PER_NIGHT";
  document.getElementById("editPriceHourly").checked = priceType === "HOURLY";
  document.getElementById("editPriceBoth").checked = priceType === "BOTH";
  updatePricingInputsVisibility(priceType, true);

  renderAmenitiesCheckboxes("editAmenitiesContainer", normalizeAmenityIds(room.room_amenities));
  renderBenefitCheckboxes("editBenefitsContainer", normalizeRoomBenefits(room.room_benefits));
  editRoomModal.classList.remove("hidden");
}

function closeEditModal() {
  editRoomModal.classList.add("hidden");
  editRoomForm.reset();
  document.getElementById("editAmenitiesContainer").innerHTML = "";
  document.getElementById("editBenefitsContainer").innerHTML = "";
}

async function deleteRoom(roomId) {
  const shouldDelete = confirm("Delete this room?");
  if (!shouldDelete) {
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/${roomId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Failed to delete room.");
      return;
    }

    alert("Room deleted successfully.");
    await loadRooms();
  } catch (error) {
    console.error(error);
    alert("Failed to delete room.");
  }
}

async function loadRooms() {
  try {
    const res = await fetch(`${BASE_URL}/property/${propertyId}`);
    const data = await res.json();
    roomsList = await attachRoomGalleries(data.data || []);
    roomsContainer.innerHTML = "";

    if (!roomsList.length) {
      roomsContainer.innerHTML = "<p style='text-align:center;color:#999;padding:40px;'>No rooms added yet</p>";
      return;
    }

    roomsList.forEach((room) => {
      const roomImages = normalizeImageList(room.room_images);
      const commission = parseFloat(room.commission_percentage || 0);
      const multiplier = 1 + (commission / 100);

      const commissionLabel = commission > 0
        ? `<div class="commission-info">
             <span class="commission-tag">${commission}% Platform Commission</span>
           </div>`
        : "";

      const priceWithCommission = (price) => {
        const p = parseFloat(price || 0);
        if (p <= 0) return "0.00";
        return (p * multiplier).toFixed(2);
      };

      const priceRow = (label, ownerPrice) => {
        const op = parseFloat(ownerPrice || 0);
        if (op <= 0) return `<p><strong>${label}:</strong> INR 0.00</p>`;
        if (commission <= 0) return `<p><strong>${label}:</strong> INR ${op.toFixed(2)}</p>`;
        return `<p>
          <strong>${label}:</strong>
          <span class="price-breakdown">
            INR ${op.toFixed(2)}
            <span class="price-arrow">→</span>
            <span class="price-selling">INR ${priceWithCommission(op)}</span>
          </span>
        </p>`;
      };

      const roomCard = `
        <div class="card">
          ${buildRoomGallery(roomImages, room.room_name || "Room")}
          <h3>${room.room_name}</h3>

          <div class="room-info">
            <p><strong>Room ID:</strong> <code>${room.room_id}</code></p>
            <p><strong>Type:</strong> ${room.room_type}</p>
            <p><strong>Capacity:</strong> ${room.max_adults} adults, ${room.max_children} children</p>
            ${room.bed_type ? `<p><strong>Bed Type:</strong> ${room.bed_type}</p>` : ""}
            ${room.room_size ? `<p><strong>Room Size:</strong> ${room.room_size}</p>` : ""}
            <p><strong>Amenities:</strong> ${getAmenitiesText(room)}</p>
            <p><strong>Benefit Points:</strong> ${getBenefitsText(room)}</p>

            <div class="pricing-info">
              ${commissionLabel}
              <p><strong>Pricing Type:</strong> ${
                room.price_type === "BOTH"
                  ? "Both (Night & Hourly)"
                  : (room.price_type === "PER_NIGHT" ? "Per Night" : "Hourly")
              }</p>
              ${(() => {
                let rows = priceRow("Base Price", room.base_price);
                if (room.price_type === "PER_NIGHT" || room.price_type === "BOTH") {
                  const pNight = parseFloat(room.price_per_night || 0);
                  if (pNight > 0) rows += priceRow("Per Night", room.price_per_night);
                }
                if (room.price_type === "HOURLY" || room.price_type === "BOTH") {
                  const p3 = parseFloat(room.price_3hours || 0);
                  const p6 = parseFloat(room.price_6hours || 0);
                  const p9 = parseFloat(room.price_9hours || 0);
                  if (p3 > 0) rows += priceRow("3 Hours", room.price_3hours);
                  if (p6 > 0) rows += priceRow("6 Hours", room.price_6hours);
                  if (p9 > 0) rows += priceRow("9 Hours", room.price_9hours);
                }
                return rows;
              })()}
            </div>

            <p><strong>Status:</strong> ${room.is_active ? "Active" : "Inactive"}</p>
          </div>

          <div class="room-actions">
            <button class="edit-btn" data-room-id="${room.id}">Edit</button>
            <button class="delete-btn" data-delete-room-id="${room.id}">Delete</button>
          </div>
        </div>
      `;

      roomsContainer.innerHTML += roomCard;
    });
  } catch (error) {
    console.error(error);
    roomsContainer.innerHTML = "<p style='color:red;'>Error loading rooms</p>";
  }
}

roomsContainer.addEventListener("click", async (event) => {
  const galleryButton = event.target.closest("[data-gallery-move]");
  if (galleryButton) {
    const gallery = galleryButton.closest(".room-card-gallery");
    moveGallery(gallery, Number(galleryButton.dataset.galleryMove));
    return;
  }

  const editButton = event.target.closest("[data-room-id]");
  if (editButton) {
    openEditModal(Number(editButton.getAttribute("data-room-id")));
    return;
  }

  const deleteButton = event.target.closest("[data-delete-room-id]");
  if (deleteButton) {
    await deleteRoom(Number(deleteButton.getAttribute("data-delete-room-id")));
  }
});

editRoomForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const roomDbId = Number(document.getElementById("edit_room_db_id").value);
  const payload = getRoomDataFromEditForm();
  const selectedEditFiles = Array.from(editRoomImagesInput?.files || []);
  const editSubmitBtn = editRoomForm.querySelector("button[type='submit']");

  if (!payload.room_id) {
    alert("Room ID is required.");
    return;
  }

  if (!validateRoomPayload(payload)) {
    return;
  }

  try {
    editSubmitBtn.disabled = true;
    editSubmitBtn.textContent = "Saving...";

    const res = await fetch(`${BASE_URL}/${roomDbId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Failed to update room.");
      return;
    }

    let editMessage = "Room updated successfully.";

    if (selectedEditFiles.length > 0) {
      editSubmitBtn.textContent = "Uploading images...";
      try {
        await uploadImagesToSingleRoom(roomDbId, selectedEditFiles);
        editMessage += ` ${selectedEditFiles.length} image(s) uploaded.`;
      } catch (uploadError) {
        console.error(uploadError);
        editMessage += " Room updated, but image upload failed.";
      }
    }

    alert(editMessage);
    closeEditModal();
    await loadRooms();
  } catch (error) {
    console.error(error);
    alert("Failed to update room.");
  } finally {
    editSubmitBtn.disabled = false;
    editSubmitBtn.textContent = "Save Changes";
  }
});

closeEditModalBtn.addEventListener("click", closeEditModal);

editRoomModal.addEventListener("click", (event) => {
  if (event.target === editRoomModal) {
    closeEditModal();
  }
});

switchToAddBtn.addEventListener("click", () => {
  window.location.href = "rooms.html?mode=add";
});

switchToMyBtn.addEventListener("click", () => {
  window.location.href = "rooms.html?mode=my";
});

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "../owner/owner.html";
});

async function initializeRoomPage() {
  const canProceed = await ensureSelectedPropertyRoomAccess();
  if (!canProceed) {
    return;
  }

  setPageMode();
  await loadAmenities();
  renderBenefitCheckboxes("benefitsContainer");

  // Set default pricing type and update visibility
  const defaultRadio = document.getElementById("pricePerNight");
  if (defaultRadio) {
    defaultRadio.checked = true;
    updatePricingInputsVisibility("PER_NIGHT", false);
  }

  if (mode === "my") {
    await loadRooms();
  }
}

initializeRoomPage();
