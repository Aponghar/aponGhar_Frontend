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
