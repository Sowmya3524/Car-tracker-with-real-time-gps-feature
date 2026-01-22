// Backend Example: Node.js/Express Server
// This shows how to integrate the location search with a backend

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Load locations from JSON file
let locations = [];

async function loadLocations() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'hyderabad-locations.json'), 'utf8');
        const jsonData = JSON.parse(data);
        locations = jsonData.locations;
        console.log(`Loaded ${locations.length} Hyderabad locations`);
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

// API Routes

// Get all locations
app.get('/api/locations', (req, res) => {
    res.json({ locations });
});

// Search locations
app.get('/api/locations/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    
    if (!query) {
        return res.json({ locations: [] });
    }
    
    const filtered = locations.filter(location => {
        const nameMatch = location.name.toLowerCase().includes(query);
        const addressMatch = location.address.toLowerCase().includes(query);
        const areaMatch = location.area.toLowerCase().includes(query);
        
        return nameMatch || addressMatch || areaMatch;
    });
    
    res.json({ locations: filtered });
});

// Get location by ID
app.get('/api/locations/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const location = locations.find(loc => loc.id === id);
    
    if (!location) {
        return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ location });
});

// Save customer location selection (for Test Drive System)
app.post('/api/customers/location', (req, res) => {
    const { customerId, locationId, address, latitude, longitude } = req.body;
    
    if (!customerId || !locationId) {
        return res.status(400).json({ error: 'customerId and locationId are required' });
    }
    
    // Find location details
    const location = locations.find(loc => loc.id === locationId);
    
    if (!location) {
        return res.status(404).json({ error: 'Location not found' });
    }
    
    // Save to database (example - replace with your database logic)
    const customerLocation = {
        customerId,
        locationId,
        locationName: location.name,
        address: address || location.address,
        latitude: latitude || location.latitude,
        longitude: longitude || location.longitude,
        latitudeRange: location.latitudeRange,
        longitudeRange: location.longitudeRange,
        area: location.area,
        pincode: location.pincode,
        timestamp: new Date().toISOString()
    };
    
    // TODO: Save to your database here
    // Example: await db.saveCustomerLocation(customerLocation);
    
    console.log('Customer location saved:', customerLocation);
    
    res.json({ 
        success: true, 
        message: 'Location saved successfully',
        data: customerLocation 
    });
});

// Get coordinates for a location
app.get('/api/locations/:id/coordinates', (req, res) => {
    const id = parseInt(req.params.id);
    const location = locations.find(loc => loc.id === id);
    
    if (!location) {
        return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeRange: location.latitudeRange,
        longitudeRange: location.longitudeRange
    });
});

// Search History API Routes

let searchHistory = [];

// Load search history from file
async function loadSearchHistory() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'search-history.json'), 'utf8');
        const jsonData = JSON.parse(data);
        searchHistory = jsonData.searches || [];
        console.log(`Loaded ${searchHistory.length} search history entries`);
    } catch (error) {
        // File doesn't exist yet, start with empty array
        searchHistory = [];
        console.log('Starting with empty search history');
    }
}

// Save search history to file
async function saveSearchHistory() {
    try {
        const data = JSON.stringify({ searches: searchHistory }, null, 2);
        await fs.writeFile(path.join(__dirname, 'search-history.json'), data, 'utf8');
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

// Get all search history
app.get('/api/history', (req, res) => {
    res.json({ searches: searchHistory });
});

// Add new search to history
app.post('/api/history', (req, res) => {
    const searchEntry = req.body;
    
    // Add unique ID if not present
    if (!searchEntry.id) {
        searchEntry.id = Date.now();
    }
    
    // Add timestamp if not present
    if (!searchEntry.timestamp) {
        searchEntry.timestamp = new Date().toISOString();
    }
    
    if (!searchEntry.searchDate) {
        searchEntry.searchDate = new Date().toLocaleString();
    }
    
    // Add to beginning of array
    searchHistory.unshift(searchEntry);
    
    // Keep only last 100 searches
    searchHistory = searchHistory.slice(0, 100);
    
    // Save to file
    saveSearchHistory();
    
    res.json({ success: true, message: 'Search saved to history', data: searchEntry });
});

// Delete all search history
app.delete('/api/history', (req, res) => {
    searchHistory = [];
    saveSearchHistory();
    res.json({ success: true, message: 'Search history cleared' });
});

// Get single search by ID
app.get('/api/history/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const search = searchHistory.find(s => s.id === id);
    
    if (!search) {
        return res.status(404).json({ error: 'Search not found' });
    }
    
    res.json({ search });
});

// Start server
Promise.all([loadLocations(), loadSearchHistory()]).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Location Search available at http://localhost:${PORT}/location-search.html`);
        console.log(`Search History API available at http://localhost:${PORT}/api/history`);
        console.log(`\nDatabase Files:`);
        console.log(`- Locations: hyderabad-locations.json`);
        console.log(`- Search History: search-history.json`);
    });
});

// Example database functions (replace with your actual database)
/*
const saveCustomerLocation = async (customerLocation) => {
    // Example using MongoDB
    // const db = await getDatabase();
    // return await db.collection('customer_locations').insertOne(customerLocation);
    
    // Example using PostgreSQL
    // const query = 'INSERT INTO customer_locations (...) VALUES (...)';
    // return await db.query(query, [...]);
    
    // Example using MySQL
    // const query = 'INSERT INTO customer_locations (...) VALUES (?)';
    // return await db.query(query, [customerLocation]);
};
*/
