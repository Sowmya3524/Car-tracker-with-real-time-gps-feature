// Configuration for API endpoints
// Update this with your Render backend URL after deployment

const CONFIG = {
    // Backend API Base URL
    // For local development: 'http://localhost:3000'
    // For production: 'https://your-app-name.onrender.com'
    API_BASE_URL: (function() {
        // Auto-detect environment
        const hostname = window.location.hostname;
        
        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        
        // GitHub Pages or production
        // TODO: Replace with your actual Render backend URL
        return 'https://your-app-name.onrender.com';
    })()
};

// Make config globally available
window.CONFIG = CONFIG;

// Helper function to build API URLs
window.getApiUrl = function(endpoint) {
    // Remove leading slash if present
    endpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${CONFIG.API_BASE_URL}/${endpoint}`;
};

console.log('🔧 API Configuration loaded:', CONFIG.API_BASE_URL);
