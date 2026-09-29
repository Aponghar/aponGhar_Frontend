const BASE_URL = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/auth';

let authToken = localStorage.getItem("token") || "";

// AUTH MODE
const mode = localStorage.getItem("authMode");

window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    showForm("resetForm");
  } else if (mode === "register") {
    showForm("registerForm");
  } else {
    showForm("loginForm");
  }
  
  loadGoogleConfig();
};

/* ==========================================================================
   BUTTON STATE & FEEDBACK HELPERS
   ========================================================================== */

function setButtonLoading(button, isLoading, loadingText = "Please wait...") {
  if (!button) return;

  if (isLoading) {
    if (!button.dataset.originalContent) {
      button.dataset.originalContent = button.innerHTML;
    }
    button.disabled = true;
    button.classList.add("btn-loading");
    button.classList.remove("btn-success");
    button.innerHTML = `
      <span class="btn-spinner" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round"></path>
        </svg>
      </span>
      <span class="btn-loading-text">${loadingText}</span>
    `;
  } else {
    button.disabled = false;
    button.classList.remove("btn-loading");
    button.classList.remove("btn-success");
    if (button.dataset.originalContent) {
      button.innerHTML = button.dataset.originalContent;
    }
  }
}

function setButtonSuccess(button, successText = "Success!") {
  if (!button) return;
  button.classList.remove("btn-loading");
  button.classList.add("btn-success");
  button.disabled = true;
  button.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span class="btn-loading-text">${successText}</span>
  `;
}

function triggerFormShake(form) {
  if (!form) return;
  form.classList.remove("shake-error");
  void form.offsetWidth; // Force CSS repaint
  form.classList.add("shake-error");
  setTimeout(() => {
    form.classList.remove("shake-error");
  }, 600);
}

/* ==========================================================================
   ENHANCED TOAST NOTIFICATION (#message)
   ========================================================================== */

let toastTimeout = null;

function showMessage(message, success = true) {
  const msg = document.getElementById("message");
  if (!msg) return;

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  // Set CSS state classes
  msg.className = "";
  msg.classList.add("toast-message", success ? "toast-success" : "toast-error");

  const iconSvg = success
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  msg.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-text">${message}</span>
    </div>
    <button type="button" class="toast-close" onclick="closeToast()" aria-label="Dismiss notification">&times;</button>
  `;

  // Animate in
  msg.style.display = "flex";
  void msg.offsetWidth; // trigger reflow
  msg.classList.add("toast-visible");

  // Auto-dismiss after 4.5 seconds
  toastTimeout = setTimeout(() => {
    closeToast();
  }, 4500);
}

function closeToast() {
  const msg = document.getElementById("message");
  if (!msg) return;
  msg.classList.remove("toast-visible");
  setTimeout(() => {
    if (!msg.classList.contains("toast-visible")) {
      msg.style.display = "none";
      msg.innerHTML = "";
    }
  }, 350);
}

/* ==========================================================================
   FORM NAVIGATION & TABS
   ========================================================================== */

function showForm(formId) {
  document.querySelectorAll(".form").forEach(form => {
    form.classList.remove("active");
  });

  const targetForm = document.getElementById(formId);
  if (targetForm) {
    targetForm.classList.add("active");
  }

  // Synchronize Tab Control if present
  const authTabs = document.getElementById("authTabs");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");

  if (authTabs && tabLogin && tabRegister) {
    if (formId === "loginForm") {
      authTabs.style.display = "flex";
      tabLogin.classList.add("active");
      tabLogin.setAttribute("aria-selected", "true");
      tabRegister.classList.remove("active");
      tabRegister.setAttribute("aria-selected", "false");
    } else if (formId === "registerForm") {
      authTabs.style.display = "flex";
      tabRegister.classList.add("active");
      tabRegister.setAttribute("aria-selected", "true");
      tabLogin.classList.remove("active");
      tabLogin.setAttribute("aria-selected", "false");
    } else {
      // Hide tabs when inside OTP, forgot password, or reset flows
      authTabs.style.display = "none";
    }
  }

  // Clear any existing toast notification when changing views
  closeToast();
}

/* ==========================================================================
   REGISTER SUBMISSION
   ========================================================================== */

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("registerSubmitBtn") || e.target.querySelector('button[type="submit"]');

  const fullName = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const phone = document.getElementById("registerPhone").value.trim();
  const password = document.getElementById("registerPassword").value;

  if (!fullName || !email || !phone || !password) {
    showMessage("Please fill in all registration fields.", false);
    triggerFormShake(e.target);
    return;
  }

  const body = {
    full_name: fullName,
    email: email,
    phone: phone,
    password: password
  };

  setButtonLoading(submitBtn, true, "Creating Account...");

  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.success) {
      setButtonSuccess(submitBtn, "Account Created!");
      showMessage("Registration successful! Please sign in.");
      localStorage.setItem("authMode", "login");

      setTimeout(() => {
        setButtonLoading(submitBtn, false);
        showForm("loginForm");
        // Prefill login email
        const loginEmailInput = document.getElementById("loginEmail");
        if (loginEmailInput) loginEmailInput.value = email;
      }, 1200);

    } else {
      setButtonLoading(submitBtn, false);
      triggerFormShake(e.target);
      showMessage(data.message || "Registration failed. Please try again.", false);
    }

  } catch (error) {
    console.error("Registration error:", error);
    setButtonLoading(submitBtn, false);
    triggerFormShake(e.target);
    showMessage(error.message || "Network error. Please try again.", false);
  }
});

/* ==========================================================================
   LOGIN SUBMISSION
   ========================================================================== */

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("loginSubmitBtn") || e.target.querySelector('button[type="submit"]');

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showMessage("Please provide your email and password.", false);
    triggerFormShake(e.target);
    return;
  }

  const body = {
    email: email,
    password: password
  };

  setButtonLoading(submitBtn, true, "Signing In...");

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setButtonSuccess(submitBtn, "Welcome Back!");
      authToken = data.data.token;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      const user = data.data.user;
      showMessage("Login successful! Redirecting...");

      // VERIFIED USER
      if (user.is_verified) {
        setTimeout(() => {
          const redirectUrl = sessionStorage.getItem("redirectUrl");
          if (redirectUrl) {
            sessionStorage.removeItem("redirectUrl");
            window.location.href = redirectUrl;
          } else {
            window.location.href = "../home/home.html";
          }
        }, 900);
      }
      // UNVERIFIED USER -> SEND OTP
      else {
        setTimeout(() => {
          setButtonLoading(submitBtn, false);
          showForm("otpForm");
          sendOTP();
        }, 900);
      }

    } else {
      setButtonLoading(submitBtn, false);
      triggerFormShake(e.target);
      showMessage(data.message || "Invalid credentials. Please check your email or password.", false);
    }

  } catch (error) {
    console.error("Login error:", error);
    setButtonLoading(submitBtn, false);
    triggerFormShake(e.target);
    showMessage(error.message || "Network error. Please check your connection.", false);
  }
});

/* ==========================================================================
   SEND & VERIFY OTP
   ========================================================================== */

async function sendOTP() {
  try {
    const res = await fetch(`${BASE_URL}/send-otp`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    });
    const data = await res.json();
    if (data.success) {
      showMessage("Verification code sent to your email.");
    }
  } catch (error) {
    console.error("Failed to send OTP:", error);
    showMessage("Failed to send OTP. Please try again.", false);
  }
}

document.getElementById("otpForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("otpSubmitBtn") || e.target.querySelector('button[type="submit"]');
  const otpCode = document.getElementById("otpCode").value.trim();

  if (!otpCode) {
    showMessage("Please enter the verification code.", false);
    triggerFormShake(e.target);
    return;
  }

  const body = {
    otp_code: otpCode
  };

  setButtonLoading(submitBtn, true, "Verifying Code...");

  try {
    const res = await fetch(`${BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.success) {
      setButtonSuccess(submitBtn, "Verified!");
      showMessage("OTP Verified Successfully! Redirecting...");

      setTimeout(() => {
        const redirectUrl = sessionStorage.getItem("redirectUrl");
        if (redirectUrl) {
          sessionStorage.removeItem("redirectUrl");
          window.location.href = redirectUrl;
        } else {
          window.location.href = "../home/home.html";
        }
      }, 1200);

    } else {
      setButtonLoading(submitBtn, false);
      triggerFormShake(e.target);
      showMessage(data.message || "Invalid or expired OTP code.", false);
    }

  } catch (error) {
    console.error("OTP verification error:", error);
    setButtonLoading(submitBtn, false);
    triggerFormShake(e.target);
    showMessage(error.message || "Failed to verify OTP. Please try again.", false);
  }
});

/* ==========================================================================
   FORGOT & RESET PASSWORD
   ========================================================================== */

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("forgotSubmitBtn") || e.target.querySelector('button[type="submit"]');
  const email = document.getElementById("forgotEmail").value.trim();

  if (!email) {
    showMessage("Please enter your registered email address.", false);
    triggerFormShake(e.target);
    return;
  }

  const body = {
    email: email
  };

  setButtonLoading(submitBtn, true, "Sending Link...");

  try {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.success) {
      setButtonSuccess(submitBtn, "Link Sent!");
      showMessage("Reset link sent! Please check your email inbox.");
      setTimeout(() => {
        setButtonLoading(submitBtn, false);
      }, 3000);

    } else {
      setButtonLoading(submitBtn, false);
      triggerFormShake(e.target);
      showMessage(data.message || "Could not send reset link. Verify your email.", false);
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    setButtonLoading(submitBtn, false);
    triggerFormShake(e.target);
    showMessage(error.message || "Failed to send reset email.", false);
  }
});

// Check for reset password token in query params
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (token) {
  showForm("resetForm");
}

document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("resetSubmitBtn") || e.target.querySelector('button[type="submit"]');
  const newPassword = document.getElementById("newPassword").value;

  if (!newPassword || newPassword.length < 6) {
    showMessage("Password must be at least 6 characters long.", false);
    triggerFormShake(e.target);
    return;
  }

  const body = {
    password: newPassword
  };

  setButtonLoading(submitBtn, true, "Updating Password...");

  try {
    const res = await fetch(`${BASE_URL}/reset-password/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.success) {
      setButtonSuccess(submitBtn, "Password Reset!");
      showMessage("Password reset successful! Please sign in.");

      setTimeout(() => {
        setButtonLoading(submitBtn, false);
        showForm("loginForm");
      }, 1500);

    } else {
      setButtonLoading(submitBtn, false);
      triggerFormShake(e.target);
      showMessage(data.message || "Failed to reset password. Link may be expired.", false);
    }

  } catch (error) {
    console.error("Reset password error:", error);
    setButtonLoading(submitBtn, false);
    triggerFormShake(e.target);
    showMessage(error.message || "Error updating password.", false);
  }
});

/* ==========================================================================
   GOOGLE AUTHENTICATION FLOW
   ========================================================================== */

let GOOGLE_CLIENT_ID = "";
let tokenClient = null;

async function loadGoogleConfig() {
  // Check localStorage first
  let localClientId = localStorage.getItem("google_client_id");
  if (localClientId) {
    GOOGLE_CLIENT_ID = localClientId;
    initGoogleSignIn();
    updateClientIdStatus(true, "Using Client ID from browser settings");
    return;
  }

  // Otherwise, fetch from backend config
  try {
    const res = await fetch((typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/auth/config');
    const data = await res.json();
    if (data.success && data.data.googleClientId) {
      GOOGLE_CLIENT_ID = data.data.googleClientId;
      initGoogleSignIn();
      updateClientIdStatus(true, "Using Client ID from backend .env");
    } else {
      updateClientIdStatus(false, "No Client ID configured. Using simulation mode.");
    }
  } catch (error) {
    console.error("Failed to fetch google config:", error);
    updateClientIdStatus(false, "No Client ID configured. Using simulation mode.");
  }
}

function updateClientIdStatus(active, message) {
  const statusDiv = document.getElementById("googleClientIdStatus");
  const inputEl = document.getElementById("googleClientIdInput");
  if (!statusDiv) return;
  
  if (active) {
    statusDiv.style.color = "hsl(158, 64%, 40%)";
    statusDiv.textContent = `● Active: ${message}`;
    if (inputEl) inputEl.value = GOOGLE_CLIENT_ID;
  } else {
    statusDiv.style.color = "#ea4335";
    statusDiv.textContent = `○ ${message}`;
  }
}

function saveGoogleClientId() {
  const val = document.getElementById("googleClientIdInput").value.trim();
  if (val) {
    localStorage.setItem("google_client_id", val);
    GOOGLE_CLIENT_ID = val;
    initGoogleSignIn();
    updateClientIdStatus(true, "Client ID saved to browser settings.");
    showMessage("Google Client ID configured!", true);
  } else {
    localStorage.removeItem("google_client_id");
    GOOGLE_CLIENT_ID = "";
    tokenClient = null;
    loadGoogleConfig();
    showMessage("Google Client ID cleared.", true);
  }
}

function initGoogleSignIn() {
  if (typeof google === "undefined") {
    setTimeout(initGoogleSignIn, 1000);
    return;
  }
  
  if (!GOOGLE_CLIENT_ID) return;
  
  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile",
      callback: async (tokenResponse) => {
        if (tokenResponse.error !== undefined) {
          console.error("Google authentication error:", tokenResponse);
          showMessage("Google authentication failed.", false);
          return;
        }
        
        try {
          showMessage("Signed in with Google. Fetching profile...", true);
          const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              "Authorization": `Bearer ${tokenResponse.access_token}`
            }
          });
          const profile = await res.json();
          if (profile.email) {
            await proceedGoogleLogin(tokenResponse.access_token);
          } else {
            showMessage("Failed to get email from Google profile.", false);
          }
        } catch (err) {
          console.error("Error fetching Google profile:", err);
          showMessage("Failed to retrieve Google profile details.", false);
        }
      }
    });
  } catch (err) {
    console.error("Error initializing Google Sign-In client:", err);
  }
}

function handleGoogleLoginClick() {
  if (GOOGLE_CLIENT_ID) {
    if (!tokenClient) {
      initGoogleSignIn();
    }
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: "select_account" });
      return;
    }
  }
  
  // If Google client ID is not configured, open simulation modal
  openGoogleModal();
}

function openGoogleModal() {
  const modal = document.getElementById("googleModal");
  if (!modal) return;
  const customForm = document.getElementById("googleCustomForm");
  if (customForm) customForm.style.display = "none";
  modal.classList.add("active");
  renderGoogleModalAccounts();
}

function closeGoogleModal() {
  const modal = document.getElementById("googleModal");
  if (modal) modal.classList.remove("active");
}

function handleGoogleCustomAccount() {
  const customForm = document.getElementById("googleCustomForm");
  if (!customForm) return;
  customForm.style.display = customForm.style.display === "none" ? "block" : "none";
}

function renderGoogleModalAccounts() {
  const accountList = document.querySelector(".google-account-list");
  if (!accountList) return;
  
  accountList.innerHTML = "";
  
  // Default mock accounts
  const defaultAccounts = [
    { name: "John Doe", email: "john.doe@gmail.com", avatar: "JD", class: "" },
    { name: "Jane Smith", email: "jane.smith@gmail.com", avatar: "JS", class: "blue" }
  ];
  
  // Load simulated accounts from localStorage
  let simulatedAccounts = [];
  try {
    simulatedAccounts = JSON.parse(localStorage.getItem("google_simulated_accounts")) || [];
  } catch (e) {
    simulatedAccounts = [];
  }
  
  const allAccounts = [...simulatedAccounts];
  defaultAccounts.forEach(defAcc => {
    if (!allAccounts.some(acc => acc.email.toLowerCase() === defAcc.email.toLowerCase())) {
      allAccounts.push(defAcc);
    }
  });
  
  allAccounts.forEach(acc => {
    const avatarInitials = acc.avatar || (acc.name ? acc.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "G");
    const avatarClass = acc.class || (acc.email.charCodeAt(0) % 2 === 0 ? "blue" : "");
    
    const item = document.createElement("div");
    item.className = "google-account-item";
    item.onclick = () => handleGoogleChoose(acc.name, acc.email);
    item.innerHTML = `
      <div class="avatar ${avatarClass}">${avatarInitials}</div>
      <div class="account-details">
        <strong>${acc.name || acc.email.split("@")[0]}</strong>
        <span>${acc.email}</span>
      </div>
    `;
    accountList.appendChild(item);
  });
  
  // Add "Use another account" button
  const useAnotherItem = document.createElement("div");
  useAnotherItem.className = "google-account-item";
  useAnotherItem.onclick = handleGoogleCustomAccount;
  useAnotherItem.innerHTML = `
    <div class="avatar gray">+</div>
    <div class="account-details">
      <strong>Use another account</strong>
      <span>Sign in with a different email</span>
    </div>
  `;
  accountList.appendChild(useAnotherItem);
}

async function handleGoogleChoose(name, email) {
  closeGoogleModal();
  await proceedGoogleLogin(email);
}

async function submitGoogleCustom() {
  const nameInput = document.getElementById("googleCustomName");
  const emailInput = document.getElementById("googleCustomEmail");
  if (!nameInput || !emailInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  
  if (!name || !email) {
    showMessage("Please fill in both name and email fields.", false);
    return;
  }
  
  let simulatedAccounts = [];
  try {
    simulatedAccounts = JSON.parse(localStorage.getItem("google_simulated_accounts")) || [];
  } catch (e) {
    simulatedAccounts = [];
  }
  
  if (!simulatedAccounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
    simulatedAccounts.unshift({ name, email });
    if (simulatedAccounts.length > 5) simulatedAccounts.pop();
    localStorage.setItem("google_simulated_accounts", JSON.stringify(simulatedAccounts));
  }
  
  closeGoogleModal();
  await proceedGoogleLogin(email);
}

async function proceedGoogleLogin(token) {
  try {
    showMessage("Signing in with Google...", true);
    
    const res = await fetch(`${BASE_URL}/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_token: token,
        credential: token
      })
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      authToken = data.data.token;
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      
      showMessage("Signed in with Google successfully! Redirecting...");
      
      setTimeout(() => {
        const redirectUrl = sessionStorage.getItem("redirectUrl");
        if (redirectUrl) {
          sessionStorage.removeItem("redirectUrl");
          window.location.href = redirectUrl;
        } else {
          window.location.href = "../home/home.html";
        }
      }, 1000);
      
    } else {
      showMessage(data.message || "Google Authentication failed", false);
    }
  } catch (err) {
    console.error("Google Auth Error:", err);
    showMessage(err.message || "Google sign-in error", false);
  }
}

/* ==========================================================================
   PASSWORD VISIBILITY TOGGLE
   ========================================================================== */

function togglePasswordVisibility(inputId, toggleEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === "password") {
    input.type = "text";
    toggleEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
    toggleEl.setAttribute("aria-label", "Hide password");
  } else {
    input.type = "password";
    toggleEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
    toggleEl.setAttribute("aria-label", "Show password");
  }
}