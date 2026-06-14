// Frontend API Configuration
// This file determines the correct API base URL based on the environment

const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Production domains
    if (hostname === 'aponghar.in' || hostname === 'www.aponghar.in') {
        return 'https://api.aponghar.in/api';
    }
    // Render deployment
    if (hostname.includes('onrender.com')) {
        return 'https://api.aponghar.in/api';
    }

    
    // Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://127.0.0.1:5000/api';
    }
    
    // Default fallback
    return `${protocol}//api.aponghar.in/api`;
};

const getAssetBaseUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Production domains
    if (hostname === 'aponghar.in' || hostname === 'www.aponghar.in') {
        return 'https://api.aponghar.in';
    }

    // Render deployment
    if (hostname.includes('onrender.com')) {
        return 'https://api.aponghar.in';
    }
    
    // Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://127.0.0.1:5000';
    }
    
    // Default fallback
    return `${protocol}//api.aponghar.in`;
};

const API_BASE_URL = getApiBaseUrl();
const ASSET_BASE_URL = getAssetBaseUrl();

console.log(`[API Config] Environment: ${window.location.hostname}`);
console.log(`[API Config] API Base URL: ${API_BASE_URL}`);
console.log(`[API Config] Asset Base URL: ${ASSET_BASE_URL}`);

// Automatically sync user session/role from the server to local storage
(async function syncUserSession() {
    try {
        const token = localStorage.getItem("token");
        const localUserStr = localStorage.getItem("user");
        if (!token || !localUserStr) return;

        const localUser = JSON.parse(localUserStr);
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 200) {
            const data = await res.json();
            if (data.success && data.data) {
                const dbUser = data.data;
                if (dbUser.role !== localUser.role) {
                    // Update role in locally stored user object while preserving other stored fields
                    const updatedUser = { ...localUser, ...dbUser };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    console.log(`[API Config] User role updated from ${localUser.role} to ${dbUser.role}. Reloading page...`);
                    window.location.reload();
                }
            }
        }
    } catch (err) {
        console.error("[API Config] Failed to sync user session:", err);
    }
})();

// Inject Global Styles for Toasts, Custom Modals & Skeletons
(function injectGlobalUIStyles() {
    const style = document.createElement("style");
    style.textContent = `
        /* GLOBAL CUSTOM ALERT/CONFIRM MODALS AND TOASTS */
        .custom-global-modal {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            padding: 20px;
            opacity: 1;
            transition: opacity 0.25s ease;
        }

        .custom-global-modal.hidden {
            display: none !important;
            opacity: 0;
        }

        .custom-global-modal-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 28px;
            width: min(420px, 100%);
            box-shadow: 0 20px 48px rgba(15, 23, 42, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.8);
            animation: globalModalPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-align: center;
        }

        @keyframes globalModalPopIn {
            from { transform: scale(0.95) translateY(12px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .custom-global-modal-icon-wrap {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: hsl(165, 80%, 96%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 26px;
        }
        
        .custom-global-modal-icon-wrap.error {
            background: hsl(348, 83%, 97%);
        }
        .custom-global-modal-icon-wrap.warning {
            background: hsl(38, 92%, 97%);
        }

        .custom-global-modal-card h3 {
            font-size: 20px;
            font-weight: 800;
            color: hsl(224, 60%, 12%);
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .custom-global-modal-body p {
            font-size: 14.5px;
            line-height: 1.6;
            color: hsl(220, 14%, 40%);
            margin-bottom: 24px;
            font-weight: 500;
        }

        .custom-global-modal-footer {
            display: flex;
            justify-content: center;
            gap: 12px;
        }

        .custom-global-modal-btn {
            padding: 11px 22px;
            border-radius: 10px;
            font-size: 14.5px;
            font-weight: 700;
            cursor: pointer;
            border: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            min-width: 100px;
        }

        .custom-global-modal-btn.primary {
            background: hsl(165, 80%, 23%);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(9, 79, 61, 0.15);
        }

        .custom-global-modal-btn.primary:hover {
            background: hsl(165, 80%, 17%);
            transform: translateY(-1px);
        }

        .custom-global-modal-btn.secondary {
            background: hsl(220, 20%, 93%);
            color: hsl(220, 14%, 40%);
        }

        .custom-global-modal-btn.secondary:hover {
            background: hsl(220, 20%, 88%);
            color: hsl(224, 60%, 12%);
        }

        /* Toast System */
        .toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 1000000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        }

        .toast-item {
            pointer-events: auto;
            background: #ffffff;
            border: 1px solid hsl(220, 20%, 91%);
            border-radius: 12px;
            padding: 14px 20px;
            box-shadow: 0 10px 35px rgba(15, 23, 42, 0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(120%);
            opacity: 0;
            transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            max-width: 380px;
        }

        .toast-item.show {
            transform: translateX(0);
            opacity: 1;
        }

        .toast-icon {
            font-size: 20px;
            flex-shrink: 0;
        }

        .toast-message {
            font-size: 13.5px;
            font-weight: 600;
            color: hsl(224, 60%, 12%);
            line-height: 1.4;
        }

        .toast-item.success {
            border-left: 4px solid hsl(142, 72%, 29%);
        }
        .toast-item.error {
            border-left: 4px solid hsl(348, 83%, 47%);
        }
        .toast-item.warning {
            border-left: 4px solid hsl(38, 92%, 40%);
        }

        /* SKELETON LOADERS */
        .skeleton {
            pointer-events: none;
            user-select: none;
        }

        .pulsing {
            background: linear-gradient(90deg, hsl(220, 20%, 95%) 25%, hsl(220, 20%, 90%) 50%, hsl(220, 20%, 95%) 75%);
            background-size: 200% 100%;
            animation: globalShimmer 1.5s infinite linear;
        }

        @keyframes globalShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        .skeleton-image {
            width: 100%;
            height: 200px;
            background-color: hsl(220, 20%, 95%);
            border-radius: 12px;
        }

        .skeleton-line {
            height: 12px;
            background-color: hsl(220, 20%, 95%);
            border-radius: 4px;
            margin-bottom: 10px;
        }

        .skeleton-line.title {
            height: 18px;
            width: 60%;
            margin-bottom: 14px;
        }

        .skeleton-line.text {
            width: 90%;
        }

        .skeleton-line.text.short {
            width: 45%;
        }
    `;
    document.head.appendChild(style);
})();

// Helper HTML escaping for dialogs
const escapeGlobalHTML = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

// global showCustomAlertModal function
window.showCustomAlertModal = (message, title = "Notice") => {
  let modal = document.getElementById("customGlobalAlertModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "customGlobalAlertModal";
    modal.className = "custom-global-modal hidden";
    modal.innerHTML = `
      <div class="custom-global-modal-card">
        <div class="custom-global-modal-icon-wrap" id="customGlobalAlertIcon">ℹ️</div>
        <h3 id="customGlobalAlertTitle">Notice</h3>
        <div class="custom-global-modal-body">
          <p id="customGlobalAlertMessage"></p>
        </div>
        <div class="custom-global-modal-footer">
          <button id="customGlobalAlertBtn" class="custom-global-modal-btn primary">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const iconSpan = document.getElementById("customGlobalAlertIcon");
  const lowerMsg = String(message).toLowerCase();
  
  // Set icons & styling classes
  iconSpan.className = "custom-global-modal-icon-wrap";
  if (lowerMsg.includes("success") || lowerMsg.includes("confirm") || lowerMsg.includes("complete") || lowerMsg.includes("thank")) {
    iconSpan.textContent = "🎉";
  } else if (lowerMsg.includes("error") || lowerMsg.includes("fail") || lowerMsg.includes("unable") || lowerMsg.includes("cannot")) {
    iconSpan.textContent = "❌";
    iconSpan.classList.add("error");
  } else if (lowerMsg.includes("warning") || lowerMsg.includes("invalid") || lowerMsg.includes("required") || lowerMsg.includes("fill")) {
    iconSpan.textContent = "⚠️";
    iconSpan.classList.add("warning");
  } else {
    iconSpan.textContent = "ℹ️";
  }

  document.getElementById("customGlobalAlertTitle").textContent = title;
  document.getElementById("customGlobalAlertMessage").innerHTML = escapeGlobalHTML(message).replace(/\n/g, '<br>');
  modal.classList.remove("hidden");
  
  return new Promise((resolve) => {
    document.getElementById("customGlobalAlertBtn").onclick = () => {
      modal.classList.add("hidden");
      resolve();
    };
  });
};

// global customConfirm function
window.customConfirm = (message, title = "Confirm Action") => {
  let modal = document.getElementById("customGlobalConfirmModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "customGlobalConfirmModal";
    modal.className = "custom-global-modal hidden";
    modal.innerHTML = `
      <div class="custom-global-modal-card">
        <div class="custom-global-modal-icon-wrap warning">❓</div>
        <h3 id="customGlobalConfirmTitle">Confirm</h3>
        <div class="custom-global-modal-body">
          <p id="customGlobalConfirmMessage"></p>
        </div>
        <div class="custom-global-modal-footer">
          <button id="customGlobalConfirmCancelBtn" class="custom-global-modal-btn secondary">Cancel</button>
          <button id="customGlobalConfirmOkBtn" class="custom-global-modal-btn primary">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById("customGlobalConfirmTitle").textContent = title;
  document.getElementById("customGlobalConfirmMessage").innerHTML = escapeGlobalHTML(message).replace(/\n/g, '<br>');
  modal.classList.remove("hidden");

  return new Promise((resolve) => {
    document.getElementById("customGlobalConfirmOkBtn").onclick = () => {
      modal.classList.add("hidden");
      resolve(true);
    };
    document.getElementById("customGlobalConfirmCancelBtn").onclick = () => {
      modal.classList.add("hidden");
      resolve(false);
    };
  });
};

// Overwrite window.alert with custom UI
window.alert = function(message) {
    if (message !== undefined && message !== null) {
        window.showCustomAlertModal(String(message));
    }
};

// global Toast Notification helper
window.showToast = (message, type = "info") => {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  
  const toast = document.createElement("div");
  toast.className = `toast-item ${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeGlobalHTML(message)}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
};
