const BASE_URL = "http://127.0.0.1:5000/api/users";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const logoutBtn = document.getElementById("logoutBtn");

const profileForm = document.getElementById("profileForm");
const fullNameInput = document.getElementById("fullName");
const emailAddressInput = document.getElementById("emailAddress");
const phoneNumberInput = document.getElementById("phoneNumber");
const profileMessage = document.getElementById("profileMessage");

const passwordForm = document.getElementById("passwordForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordMessage = document.getElementById("passwordMessage");

if (!token || !user) {
  window.location.href = "../index.html";
}

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../index.html";
});

// Load user profile details on load
async function loadUserProfile() {
  try {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (data.success && data.data) {
      fullNameInput.value = data.data.full_name || "";
      emailAddressInput.value = data.data.email || "";
      phoneNumberInput.value = data.data.phone || "";
    } else {
      showMsg(profileMessage, data.message || "Failed to load profile details.", "error");
    }
  } catch (error) {
    console.error("Failed to load profile:", error);
    showMsg(profileMessage, "Server Error loading profile details.", "error");
  }
}

// Show alert messages helper
function showMsg(element, msg, type = "success") {
  element.textContent = msg;
  element.className = `alert-message ${type}`;
  element.classList.remove("hidden");
  
  // Auto scroll to top of the card/message
  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Save profile details
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  profileMessage.classList.add("hidden");

  const payload = {
    full_name: fullNameInput.value.trim(),
    email: emailAddressInput.value.trim(),
    phone: phoneNumberInput.value.trim()
  };

  try {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      showMsg(profileMessage, "Profile updated successfully!", "success");
      
      // Update local storage user details
      const updatedUser = { ...user, full_name: payload.full_name, email: payload.email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      showMsg(profileMessage, data.message || "Unable to update profile.", "error");
    }
  } catch (error) {
    console.error("Profile save error:", error);
    showMsg(profileMessage, "Server error. Could not update profile.", "error");
  }
});

// Update Password
passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  passwordMessage.classList.add("hidden");

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (newPassword !== confirmPassword) {
    showMsg(passwordMessage, "Passwords do not match.", "error");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    if (data.success) {
      showMsg(passwordMessage, "Password changed successfully!", "success");
      passwordForm.reset();
    } else {
      showMsg(passwordMessage, data.message || "Unable to change password.", "error");
    }
  } catch (error) {
    console.error("Password update error:", error);
    showMsg(passwordMessage, "Server error. Could not change password.", "error");
  }
});

// Check if direct tab redirection requested (e.g. ?tab=security)
const params = new URLSearchParams(window.location.search);
if (params.get("tab") === "security") {
  setTimeout(() => {
    currentPasswordInput.focus();
  }, 100);
}

loadUserProfile();
