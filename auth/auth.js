const BASE_URL = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:5000/api') + '/auth';

let authToken = localStorage.getItem("token") || "";


// AUTH MODE
const mode = localStorage.getItem("authMode");

window.onload = () => {

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    showForm("resetForm");
  } else if(mode === "register"){

    showForm("registerForm");

  } else {

    showForm("loginForm");
  }
  
  loadGoogleConfig();
};

function showMessage(message, success = true) {

  const msg = document.getElementById("message");

  msg.innerText = message;

  msg.style.color = success ? "green" : "red";

  setTimeout(() => {

    msg.innerText = "";

  }, 4000);
}


function showForm(formId) {

  document.querySelectorAll(".form")
  .forEach(form => {

    form.classList.remove("active");

  });

  document.getElementById(formId)
  .classList.add("active");
}

// REGISTER
document.getElementById("registerForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const body = {

    full_name:
      document.getElementById("registerName").value,

    email:
      document.getElementById("registerEmail").value,

    phone:
      document.getElementById("registerPhone").value,

    password:
      document.getElementById("registerPassword").value
  };

  try {

    const res = await fetch(
      `${BASE_URL}/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(body)
      }
    );

    const data = await res.json();

    if(data.success){

      showMessage(
        "Registration successful! Please login."
      );

      localStorage.setItem(
        "authMode",
        "login"
      );

      showForm("loginForm");

    } else {

      showMessage(data.message, false);
    }

  } catch (error) {

    console.error(error);

    showMessage(error.message, false);
  }
});



// LOGIN
document.getElementById("loginForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const body = {

    email:
      document.getElementById("loginEmail").value,

    password:
      document.getElementById("loginPassword").value
  };

  try {

    const res = await fetch(
      `${BASE_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(body)
      }
    );

    const data = await res.json();

    console.log(data);

    if(res.ok && data.success){

      authToken = data.data.token;

      localStorage.setItem(
        "token",
        authToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.data.user)
      );

      const user = data.data.user;

      showMessage("Login successful!");



      // VERIFIED USER
      if(user.is_verified){

        setTimeout(() => {

          const redirectUrl = sessionStorage.getItem("redirectUrl");
          if (redirectUrl) {
            sessionStorage.removeItem("redirectUrl");
            window.location.href = redirectUrl;
          } else {
            window.location.href = "../home/home.html";
          }

        }, 1000);
      }



      // NEW USER
      else{

        showForm("otpForm");

        sendOTP();
      }

    } else {

      showMessage(
        data.message || "Login failed",
        false
      );
    }

  } catch (error) {

    console.error(error);

    showMessage(error.message, false);
  }
});



// SEND OTP
async function sendOTP(){

  try {

    const res = await fetch(
      `${BASE_URL}/send-otp`,
      {
        method:"POST",

        headers:{
          "Authorization":
          `Bearer ${authToken}`
        }
      }
    );

    const data = await res.json();

    console.log(data);

  } catch (error) {

    console.error(error);
  }
}


// VERIFY OTP
document.getElementById("otpForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const body = {

    otp_code:
      document.getElementById("otpCode").value
  };

  try {

    const res = await fetch(
      `${BASE_URL}/verify-otp`,
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json",

          "Authorization":
          `Bearer ${authToken}`
        },

        body:JSON.stringify(body)
      }
    );

    const data = await res.json();

    if(data.success){

      showMessage(
        "OTP Verified Successfully!"
      );

      setTimeout(() => {

        const redirectUrl = sessionStorage.getItem("redirectUrl");
        if (redirectUrl) {
          sessionStorage.removeItem("redirectUrl");
          window.location.href = redirectUrl;
        } else {
          window.location.href = "../home/home.html";
        }

      }, 1500);

    } else {

      showMessage(data.message, false);
    }

  } catch (error) {

    console.error(error);

    showMessage(error.message, false);
  }
});


// FORGOT PASSWORD
document.getElementById("forgotForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const body = {

    email:
      document.getElementById("forgotEmail").value
  };

  try {

    const res = await fetch(
      `${BASE_URL}/forgot-password`,
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify(body)
      }
    );

    const data = await res.json();

    if(data.success){

      showMessage(
        "Reset link sent to email!"
      );

    } else {

      showMessage(data.message, false);
    }

  } catch (error) {

    console.error(error);

    showMessage(error.message, false);
  }
});



// RESET PASSWORD
const params =
new URLSearchParams(window.location.search);

const token = params.get("token");

if(token){

  showForm("resetForm");
}

document.getElementById("resetForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const body = {

    password:
      document.getElementById("newPassword").value
  };

  try {

    const res = await fetch(
      `${BASE_URL}/reset-password/${token}`,
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify(body)
      }
    );

    const data = await res.json();

    if(data.success){

      showMessage(
        "Password reset successful!"
      );

      setTimeout(() => {

        showForm("loginForm");

      }, 1500);

    } else {

      showMessage(data.message, false);
    }

  } catch (error) {

    console.error(error);

    showMessage(error.message, false);
  }
});


// GOOGLE AUTHENTICATION FLOW
let GOOGLE_CLIENT_ID = "";
let tokenClient = null;

// Fetch config from backend or localStorage
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
    statusDiv.style.color = "green";
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
    loadGoogleConfig(); // reload backend or clear
    showMessage("Google Client ID cleared.", true);
  }
}

function initGoogleSignIn() {
  if (typeof google === "undefined") {
    // Retry in 1 second if SDK isn't loaded yet
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
            await proceedGoogleLogin(profile.name || profile.email.split("@")[0], profile.email);
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
  
  // Fallback to simulation modal
  openGoogleModal();
}

function openGoogleModal() {
  document.getElementById("googleCustomForm").style.display = "none";
  document.getElementById("googleModal").classList.add("active");
  renderGoogleModalAccounts();
}

function closeGoogleModal() {
  document.getElementById("googleModal").classList.remove("active");
}

function handleGoogleCustomAccount() {
  const customForm = document.getElementById("googleCustomForm");
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
  
  // Combine lists, removing duplicates by email
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
  await proceedGoogleLogin(name, email);
}

async function submitGoogleCustom() {
  const name = document.getElementById("googleCustomName").value.trim();
  const email = document.getElementById("googleCustomEmail").value.trim();
  
  if (!name || !email) {
    alert("Please fill in both name and email fields.");
    return;
  }
  
  // Save to localStorage so it is remembered
  let simulatedAccounts = [];
  try {
    simulatedAccounts = JSON.parse(localStorage.getItem("google_simulated_accounts")) || [];
  } catch (e) {
    simulatedAccounts = [];
  }
  
  // Avoid duplicates
  if (!simulatedAccounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
    simulatedAccounts.unshift({ name, email });
    if (simulatedAccounts.length > 5) simulatedAccounts.pop();
    localStorage.setItem("google_simulated_accounts", JSON.stringify(simulatedAccounts));
  }
  
  closeGoogleModal();
  await proceedGoogleLogin(name, email);
}

async function proceedGoogleLogin(name, email) {
  try {
    showMessage("Signing in with Google...", true);
    
    const res = await fetch(`${BASE_URL}/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        full_name: name
      })
    });
    
    const data = await res.json();
    console.log("Google Login Response:", data);
    
    if (res.ok && data.success) {
      authToken = data.data.token;
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      
      showMessage("Signed in with Google successfully!");
      
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
    showMessage(err.message, false);
  }
}

function togglePasswordVisibility(inputId, toggleEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === "password") {
    input.type = "text";
    toggleEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  } else {
    input.type = "password";
    toggleEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  }
}