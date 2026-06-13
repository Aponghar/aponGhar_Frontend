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
