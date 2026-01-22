// Store all locations from JSON file (fallback)
let allLocations = [];
let metroStations = [];
let metroPillars = [];
let filteredLocations = [];
let searchTimeout = null; // For debouncing API calls
let currentAbortController = null; // For canceling API calls
let lastSearchQuery = ''; // Track last search to prevent stale results

// Route selection state
let routeStart = null; // Location A
let routeEnd = null;   // Location B
let lastSelectedLocation = null; // Last location clicked by user

// Simple test - directly test the button click
window.testButtonClick = function() {
    const btn = document.getElementById('view-google-maps-btn');
    if (btn) {
        console.log('Button found, simulating click...');
        console.log('Button onclick:', btn.onclick);
        console.log('lastSelectedLocation:', lastSelectedLocation);
        btn.click();
    } else {
        console.error('Button not found!');
    }
};

// Direct test - open Google Maps with test coordinates
window.testGoogleMapsDirect = function() {
    const testUrl = 'https://www.google.com/maps?q=17.3850,78.4867';
    console.log('Opening test URL:', testUrl);
    const newWindow = window.open(testUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) {
        console.log('✓ Test URL opened successfully');
    } else {
        console.error('❌ Popup blocked!');
        alert('Popup blocked! Please allow popups and try again.');
    }
};

// Test the button and location
window.testButtonAndLocation = function() {
    console.log('=== Testing Button and Location ===');
    const btn = document.getElementById('view-google-maps-btn');
    console.log('Button found:', !!btn);
    console.log('Button onclick:', btn?.onclick);
    console.log('lastSelectedLocation:', lastSelectedLocation);
    
    const locationNameEl = document.getElementById('location-name');
    const coordsEl = document.getElementById('coordinates');
    console.log('Location name element:', locationNameEl?.textContent);
    console.log('Coordinates element:', coordsEl?.textContent);
    
    if (lastSelectedLocation) {
        console.log('✓ lastSelectedLocation has data:', {
            name: lastSelectedLocation.name,
            lat: lastSelectedLocation.latitude,
            lon: lastSelectedLocation.longitude
        });
        const testUrl = generateGoogleMapsLocationUrl(lastSelectedLocation);
        console.log('✓ Generated URL:', testUrl);
        console.log('Try opening this URL manually:', testUrl);
    } else {
        console.error('❌ No lastSelectedLocation');
    }
};

// Test function - can be called from console to test Google Maps redirect
window.testGoogleMapsRedirect = function() {
    try {
        console.log('=== Testing Google Maps Redirect ===');
        console.log('Function is available:', typeof window.testGoogleMapsRedirect);
        console.log('openGoogleMapsForLocation available:', typeof openGoogleMapsForLocation);
        console.log('lastSelectedLocation:', lastSelectedLocation);
        
        let locationToUse = null;
        
        if (lastSelectedLocation) {
            console.log('✓ Using lastSelectedLocation for test');
            locationToUse = lastSelectedLocation;
        } else {
            console.log('⚠ No lastSelectedLocation, trying to get from display...');
            const locationNameEl = document.getElementById('location-name');
            const coordsEl = document.getElementById('coordinates');
            
            console.log('Location name element:', locationNameEl);
            console.log('Coordinates element:', coordsEl);
            
            if (locationNameEl && coordsEl) {
                console.log('Location name text:', locationNameEl.textContent);
                console.log('Coordinates text:', coordsEl.textContent);
                
                if (coordsEl.textContent !== '0, 0' && coordsEl.textContent !== '-') {
                    const coords = coordsEl.textContent.split(',').map(c => parseFloat(c.trim()));
                    console.log('Parsed coordinates:', coords);
                    
                    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                        locationToUse = {
                            name: locationNameEl.textContent || 'Test Location',
                            latitude: coords[0],
                            longitude: coords[1],
                            address: document.getElementById('address-display')?.textContent || locationNameEl.textContent || 'Test Address'
                        };
                        console.log('✓ Got location from display:', locationToUse);
                    } else {
                        console.error('✗ Could not parse coordinates:', coordsEl.textContent);
                    }
                } else {
                    console.error('✗ Coordinates are empty or default');
                }
            } else {
                console.error('✗ Location elements not found in DOM');
            }
        }
        
        if (!locationToUse) {
            // Use a test location (Hyderabad coordinates)
            console.log('⚠ No location found, using test location (Hyderabad)');
            locationToUse = {
                name: 'Test Location - Hyderabad',
                latitude: 17.3850,
                longitude: 78.4867,
                address: 'Hyderabad, Telangana, India'
            };
        }
        
        console.log('Final location to use:', locationToUse);
        
        if (typeof openGoogleMapsForLocation === 'function') {
            console.log('Calling openGoogleMapsForLocation...');
            openGoogleMapsForLocation(locationToUse);
        } else {
            console.error('✗ openGoogleMapsForLocation is not a function!');
            console.log('Available functions:', Object.keys(window).filter(k => k.includes('Google') || k.includes('Maps')));
        }
    } catch (error) {
        console.error('✗ Error in testGoogleMapsRedirect:', error);
        console.error('Error stack:', error.stack);
    }
};

// Global function for onclick handler (backup - not needed if event listener works)
// Define early so it's available when HTML loads
window.handleGoogleMapsClick = function(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('handleGoogleMapsClick called (global function)');
    
    // Try to get location
    let location = lastSelectedLocation;
    
    if (!location) {
        // Try to get from displayed results
        const locationNameEl = document.getElementById('location-name');
        const coordsEl = document.getElementById('coordinates');
        
        if (locationNameEl && coordsEl && 
            locationNameEl.textContent !== '-' && 
            coordsEl.textContent !== '0, 0') {
            const coords = coordsEl.textContent.split(',').map(c => parseFloat(c.trim()));
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                location = {
                    name: locationNameEl.textContent,
                    latitude: coords[0],
                    longitude: coords[1],
                    address: document.getElementById('address-display')?.textContent || locationNameEl.textContent
                };
            }
        }
    }
    
    if (!location) {
        showError('Please select a location first to view on Google Maps.');
        return false;
    }
    
    openGoogleMapsForLocation(location);
    return false;
};

// Hyderabad bounding box (approximate) for filtering results
const HYDERABAD_BBOX = {
    minLat: 17.1,
    maxLat: 17.7,
    minLon: 78.2,
    maxLon: 78.6
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    const searchInput = document.getElementById('location-search');
    const suggestionsContainer = document.getElementById('suggestions');

    const setStartBtn = document.getElementById('set-start-btn');
    const setEndBtn = document.getElementById('set-end-btn');
    const viewGoogleMapsBtn = document.getElementById('view-google-maps-btn');
    
    // Load locations from JSON file as fallback
    try {
        const response = await fetch('hyderabad-locations.json');
        const data = await response.json();
        allLocations = data.locations;
        console.log(`Loaded ${allLocations.length} Hyderabad locations as fallback`);
    } catch (error) {
        console.error('Error loading locations:', error);
        // Don't show error - we'll use API only
    }
    
    // Load metro stations and pillars
    try {
        const metroResponse = await fetch('hyderabad-metro-stations.json');
        const metroData = await metroResponse.json();
        metroStations = metroData.metroStations || [];
        metroPillars = metroData.metroPillars || [];
        console.log(`Loaded ${metroStations.length} metro stations and ${metroPillars.length} metro pillars`);
    } catch (error) {
        console.error('Error loading metro data:', error);
        metroStations = [];
        metroPillars = [];
    }

    // Handle search input with debouncing and request cancellation
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.trim();
        
        // Cancel previous search request if any
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        if (searchTerm.length === 0) {
            suggestionsContainer.classList.remove('show');
            suggestionsContainer.innerHTML = '';
            lastSearchQuery = '';
            return;
        }
        
        // Show loading state immediately
        suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">🔍 Searching...</div>';
        suggestionsContainer.classList.add('show');
        
        // Debounce: Wait 200ms after user stops typing before searching (reduced from 300ms)
        searchTimeout = setTimeout(async () => {
            // Only search if query hasn't changed
            if (searchInput.value.trim() === searchTerm) {
                lastSearchQuery = searchTerm;
                await searchLocations(searchTerm);
            }
        }, 200);
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const visibleSuggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const current = suggestionsContainer.querySelector('.suggestion-item.highlighted');
            if (current) {
                current.classList.remove('highlighted');
                const next = current.nextElementSibling || visibleSuggestions[0];
                next?.classList.add('highlighted');
            } else {
                visibleSuggestions[0]?.classList.add('highlighted');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const current = suggestionsContainer.querySelector('.suggestion-item.highlighted');
            if (current) {
                current.classList.remove('highlighted');
                const prev = current.previousElementSibling || visibleSuggestions[visibleSuggestions.length - 1];
                prev?.classList.add('highlighted');
            } else {
                visibleSuggestions[visibleSuggestions.length - 1]?.classList.add('highlighted');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const highlighted = suggestionsContainer.querySelector('.suggestion-item.highlighted');
            if (highlighted && highlighted.dataset.locationData) {
                const locationData = JSON.parse(highlighted.dataset.locationData);
                handleLocationSelect(locationData);
            } else if (highlighted) {
                // Fallback for JSON locations
                const locationId = parseInt(highlighted.dataset.id);
                const location = allLocations.find(loc => loc.id === locationId);
                if (location) {
                    handleLocationSelect(location);
                }
            }
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('show');
        }
    });

    // Route selection buttons
    if (setStartBtn) {
        setStartBtn.addEventListener('click', function() {
            if (!lastSelectedLocation) {
                showError('Please select a location first to set as Location A (Start).');
                return;
            }
            routeStart = lastSelectedLocation;
            // updateRouteInfo() will automatically update the map (shows route if both A & B are set)
            updateRouteInfo();
        });
    }

    if (setEndBtn) {
        setEndBtn.addEventListener('click', function() {
            if (!lastSelectedLocation) {
                showError('Please select a location first to set as Location B (Destination).');
                return;
            }
            routeEnd = lastSelectedLocation;
            // updateRouteInfo() will automatically update the map (shows route if both A & B are set)
            updateRouteInfo();
        });
    }

    // Google Maps button for single location - use EXACT same method as two-location redirect
    if (viewGoogleMapsBtn) {
        // Function to handle Google Maps redirect
        function handleGoogleMapsRedirect() {
            // Try to get location - first from lastSelectedLocation, then from display
            let location = lastSelectedLocation;
            
            // Always try to get from displayed results (more reliable)
            const locationNameEl = document.getElementById('location-name');
            const coordsEl = document.getElementById('coordinates');
            
            // Check if we have displayed location data
            if (locationNameEl && coordsEl && 
                locationNameEl.textContent && 
                locationNameEl.textContent !== '-' && 
                coordsEl.textContent && 
                coordsEl.textContent !== '0, 0' &&
                coordsEl.textContent.includes(',')) {
                
                const coords = coordsEl.textContent.split(',').map(c => parseFloat(c.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    // Use displayed location (most reliable)
                    location = {
                        name: locationNameEl.textContent,
                        latitude: coords[0],
                        longitude: coords[1],
                        address: document.getElementById('address-display')?.textContent || locationNameEl.textContent
                    };
                }
            }
            
            // Final check - if still no location, show error
            if (!location || !location.latitude || !location.longitude) {
                showError('Please select a location first. Search for a location and click on it from the suggestions.');
                return false;
            }
            
            // Use the EXACT same redirect method that works for two locations
            const googleMapsUrl = generateGoogleMapsLocationUrl(location);
            
            // Open in new tab - same as "Start Directions" button
            const newWindow = window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
            
            if (!newWindow) {
                // Popup blocked - show URL so user can copy it
                alert('Popup blocked! Please allow popups for this site.\n\nOr copy this URL and paste in your browser:\n' + googleMapsUrl);
            }
            
            return false;
        }
        
        // Set up multiple event handlers for maximum compatibility
        viewGoogleMapsBtn.onclick = function(e) {
            console.log('🔵 Button onclick fired!');
            e.preventDefault();
            e.stopPropagation();
            return handleGoogleMapsRedirect();
        };
        
        viewGoogleMapsBtn.addEventListener('click', function(e) {
            console.log('🔵 Button addEventListener fired!');
            e.preventDefault();
            e.stopPropagation();
            handleGoogleMapsRedirect();
        }, false);
        
        // Also make it accessible globally for testing
        window.handleGoogleMapsRedirect = handleGoogleMapsRedirect;
        
        console.log('✓ Google Maps button handler attached');
    } else {
        console.error('❌ Google Maps button not found!');
    }
});

// Search metro stations and pillars first (fast local search)
function searchMetroData(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];
    
    // Check if query is metro-related
    const isMetroSearch = lowerQuery.includes('metro') || 
                         lowerQuery.includes('pillar') || 
                         lowerQuery.includes('station');
    
    // Search metro stations
    metroStations.forEach(station => {
        const stationName = (station.name || '').toLowerCase();
        const area = (station.area || '').toLowerCase();
        const line = (station.line || '').toLowerCase();
        const queryMatch = lowerQuery.includes('metro') || 
                          stationName.includes(lowerQuery) ||
                          area.includes(lowerQuery) ||
                          (lowerQuery.includes('line') && line.includes(lowerQuery));
        
        if (queryMatch || (!isMetroSearch && (stationName.includes(lowerQuery) || area.includes(lowerQuery)))) {
            results.push({
                ...station,
                latitudeRange: {
                    min: station.latitude - 0.01,
                    max: station.latitude + 0.01
                },
                longitudeRange: {
                    min: station.longitude - 0.01,
                    max: station.longitude + 0.01
                },
                priority: 1 // High priority for metro stations
            });
        }
    });
    
    // Search metro pillars (especially for "pillar no. X" queries)
    const pillarMatch = lowerQuery.match(/pillar\s*(no\.?|number)?\s*(\d+)/i);
    const pillarNumber = pillarMatch ? parseInt(pillarMatch[2]) : null;
    
    metroPillars.forEach(pillar => {
        const pillarName = (pillar.name || '').toLowerCase();
        const reference = (pillar.reference || '').toLowerCase();
        const area = (pillar.area || '').toLowerCase();
        
        // Exact pillar number match
        if (pillarNumber) {
            const pillarNumMatch = pillarName.match(/pillar\s*no\.?\s*(\d+)/i);
            if (pillarNumMatch && parseInt(pillarNumMatch[1]) === pillarNumber) {
                results.push({
                    ...pillar,
                    latitudeRange: {
                        min: pillar.latitude - 0.01,
                        max: pillar.latitude + 0.01
                    },
                    longitudeRange: {
                        min: pillar.longitude - 0.01,
                        max: pillar.longitude + 0.01
                    },
                    priority: 0 // Highest priority for exact pillar match
                });
                return;
            }
        }
        
        // General pillar search
        if (lowerQuery.includes('pillar') && (pillarName.includes(lowerQuery) || reference.includes(lowerQuery) || area.includes(lowerQuery))) {
            results.push({
                ...pillar,
                latitudeRange: {
                    min: pillar.latitude - 0.01,
                    max: pillar.latitude + 0.01
                },
                longitudeRange: {
                    min: pillar.longitude - 0.01,
                    max: pillar.longitude + 0.01
                },
                priority: 2 // High priority for pillars
            });
        }
    });
    
    // Sort by priority (lower number = higher priority)
    return results.sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

// Search locations using OpenStreetMap Nominatim API
async function searchLocations(query) {
    const suggestionsContainer = document.getElementById('suggestions');
    
    // Check if query is still relevant (user might have typed more)
    if (query !== lastSearchQuery && lastSearchQuery !== '') {
        return; // Ignore stale results
    }
    
    // First, search metro data (fast, local)
    const metroResults = searchMetroData(query);
    
    // Store metro results for later combination with API results
    // (We'll combine them after API call completes)
    
    // Create new AbortController for this request
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;
    
    try {
        // Enhance query for metro searches
        let enhancedQuery = query;
        if (query.toLowerCase().includes('pillar') && !query.toLowerCase().includes('metro')) {
            enhancedQuery = `metro ${query}`;
        } else if (query.toLowerCase().includes('metro station') || query.toLowerCase().includes('metro')) {
            enhancedQuery = query; // Keep as is
        }
        
        // Add "Hyderabad" to query to prioritize local results
        const searchQuery = `${enhancedQuery}, Hyderabad, India`;
        
        // OpenStreetMap Nominatim API (free, no API key required)
        // Format: bbox for Hyderabad area to filter results
        const bbox = `${HYDERABAD_BBOX.minLon},${HYDERABAD_BBOX.minLat},${HYDERABAD_BBOX.maxLon},${HYDERABAD_BBOX.maxLat}`;
        
        const apiUrl = `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(searchQuery)}` +
            `&format=json` +
            `&limit=20` +
            `&countrycodes=in` +
            `&bounded=0` + // Changed to 0 for less strict filtering
            `&viewbox=${bbox}` +
            `&addressdetails=1` +
            `&extratags=1`;
        
        const response = await fetch(apiUrl, {
            signal: signal, // For request cancellation
            headers: {
                'User-Agent': 'Hyderabad Location Search App', // Required by Nominatim
                'Accept-Language': 'en'
            }
        });
        
        // Check if request was aborted
        if (signal.aborted) {
            return;
        }
        
        // Check if query is still relevant
        const currentQuery = document.getElementById('location-search').value.trim();
        if (currentQuery !== query) {
            return; // User typed more, ignore this result
        }
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Check again if query is still relevant
        const currentQueryCheck = document.getElementById('location-search').value.trim();
        if (currentQueryCheck !== query || signal.aborted) {
            return; // User typed more or request aborted, ignore results
        }
        
        // Filter results that are actually in Hyderabad area (with some tolerance)
        const hyderabadResults = data.filter(place => {
            const lat = parseFloat(place.lat);
            const lon = parseFloat(place.lon);
            
            // Check if coordinates are in Hyderabad area (with small tolerance)
            const inBounds = lat >= HYDERABAD_BBOX.minLat - 0.05 && 
                            lat <= HYDERABAD_BBOX.maxLat + 0.05 &&
                            lon >= HYDERABAD_BBOX.minLon - 0.05 && 
                            lon <= HYDERABAD_BBOX.maxLon + 0.05;
            
            // Also check if address mentions Hyderabad
            const displayName = (place.display_name || '').toLowerCase();
            const hasHyderabad = displayName.includes('hyderabad');
            
            return inBounds || hasHyderabad;
        });
        
        // Final check before displaying
        const finalQueryCheck = document.getElementById('location-search').value.trim();
        if (finalQueryCheck !== query || signal.aborted) {
            return; // Ignore if query changed or aborted
        }
        
        // Convert Nominatim results to our location format
        const locations = hyderabadResults.map((place, index) => {
            const lat = parseFloat(place.lat);
            const lon = parseFloat(place.lon);
            
            // Extract address components
            const addr = place.address || {};
            const displayName = place.display_name || place.name || 'Unknown Location';
            
            // Build location name
            let locationName = place.name || displayName.split(',')[0];
            if (addr.road) {
                locationName = addr.road;
                if (addr.house_number) {
                    locationName = `${addr.house_number}, ${locationName}`;
                }
            }
            
            // Build area/suburb info
            const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || 'Hyderabad';
            const pincode = addr.postcode || '';
            
            // Build full address
            const addressParts = [];
            if (addr.house_number) addressParts.push(addr.house_number);
            if (addr.road) addressParts.push(addr.road);
            if (addr.suburb) addressParts.push(addr.suburb);
            if (addr.city_district) addressParts.push(addr.city_district);
            addressParts.push('Hyderabad', 'Telangana');
            const fullAddress = addressParts.join(', ');
            
            return {
                id: `nom_${index}`, // Unique ID for API results
                name: locationName,
                address: fullAddress || displayName,
                latitude: lat,
                longitude: lon,
                latitudeRange: {
                    min: lat - 0.01,
                    max: lat + 0.01
                },
                longitudeRange: {
                    min: lon - 0.01,
                    max: lon + 0.01
                },
                area: area,
                pincode: pincode,
                displayName: displayName,
                osmType: place.osm_type,
                osmId: place.osm_id
            };
        });
        
        // Final check one more time
        const lastCheck = document.getElementById('location-search').value.trim();
        if (lastCheck !== query || signal.aborted) {
            return;
        }
        
        // Combine metro results with API results (metro first)
        const allResults = [];
        
        // Add metro results first (they have priority)
        allResults.push(...metroResults);
        
        // Add API results (avoid duplicates with metro)
        locations.forEach(apiLocation => {
            const isDuplicate = metroResults.some(metro => 
                Math.abs(metro.latitude - apiLocation.latitude) < 0.001 &&
                Math.abs(metro.longitude - apiLocation.longitude) < 0.001
            );
            if (!isDuplicate) {
                apiLocation.priority = 10; // Lower priority than metro
                allResults.push(apiLocation);
            }
        });
        
        // Also add relevant JSON locations (if they match query)
        const lowerQuery = query.toLowerCase();
        const jsonMatches = allLocations.filter(location => {
            const nameMatch = location.name.toLowerCase().includes(lowerQuery);
            const addressMatch = location.address.toLowerCase().includes(lowerQuery);
            const areaMatch = location.area.toLowerCase().includes(lowerQuery);
            return nameMatch || addressMatch || areaMatch;
        });
        
        // Add JSON matches (avoid duplicates)
        jsonMatches.forEach(jsonLocation => {
            const isDuplicate = allResults.some(existing => 
                (existing.id && existing.id === jsonLocation.id) ||
                (Math.abs(existing.latitude - jsonLocation.latitude) < 0.001 &&
                 Math.abs(existing.longitude - jsonLocation.longitude) < 0.001)
            );
            if (!isDuplicate) {
                jsonLocation.priority = 15; // Lower priority than metro and API
                allResults.push(jsonLocation);
            }
        });
        
        // Sort by priority and display
        allResults.sort((a, b) => (a.priority || 999) - (b.priority || 999));
        
        // Check again before displaying
        if (document.getElementById('location-search').value.trim() === query && !signal.aborted) {
            if (allResults.length === 0) {
                suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No locations found. Try a different search term.</div>';
                suggestionsContainer.classList.add('show');
            } else {
                displaySuggestions(allResults);
            }
        }
        
    } catch (error) {
        // Ignore aborted errors
        if (error.name === 'AbortError') {
            return;
        }
        
        console.error('Error searching locations:', error);
        
        // Check if query is still relevant
        const currentQuery = document.getElementById('location-search').value.trim();
        if (currentQuery !== query) {
            return; // User typed more, ignore error handling
        }
        
        // Combine metro results with fallback JSON locations if API fails
        const allFallbackResults = [...metroResults];
        
        // Add JSON locations
        const lowerQuery = query.toLowerCase();
        const jsonMatches = allLocations.filter(location => {
            const nameMatch = location.name.toLowerCase().includes(lowerQuery);
            const addressMatch = location.address.toLowerCase().includes(lowerQuery);
            const areaMatch = location.area.toLowerCase().includes(lowerQuery);
            return nameMatch || addressMatch || areaMatch;
        });
        jsonMatches.forEach(loc => {
            loc.priority = 10;
            allFallbackResults.push(loc);
        });
        
        // Sort by priority
        allFallbackResults.sort((a, b) => (a.priority || 999) - (b.priority || 999));
        
        // Final check before displaying error/fallback
        if (document.getElementById('location-search').value.trim() === query) {
            if (allFallbackResults.length === 0) {
                suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No locations found. Try a different search term.</div>';
                suggestionsContainer.classList.add('show');
            } else {
                displaySuggestions(allFallbackResults);
            }
        }
    } finally {
        // Clear abort controller after request completes
        if (currentAbortController && currentAbortController.signal.aborted === false) {
            currentAbortController = null;
        }
    }
}

// Display suggestions in dropdown (updated to handle both API and JSON results)
function displaySuggestions(locations) {
    const suggestionsContainer = document.getElementById('suggestions');
    
    if (locations.length === 0) {
        suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No locations found</div>';
        suggestionsContainer.classList.add('show');
        return;
    }
    
    suggestionsContainer.innerHTML = '';
    
    locations.slice(0, 15).forEach((location, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        
        // Store location data (for both JSON and API results)
        if (location.id && location.id.toString().startsWith('nom_')) {
            // API result - store full location data
            suggestionItem.dataset.locationData = JSON.stringify(location);
        } else {
            // JSON result - use existing ID
            suggestionItem.dataset.id = location.id;
        }
        
        // Determine icon and description based on location type
        let icon = '📍';
        let title = location.name || 'Unknown Location';
        let description = '';
        
        if (location.type === 'metro_station') {
            icon = '🚇'; // Metro station icon
            description = location.line ? `${location.area} • ${location.line}` : location.area || location.address;
        } else if (location.type === 'metro_pillar') {
            icon = '🏗️'; // Metro pillar icon
            description = location.reference ? `${location.reference} • ${location.area}` : (location.area || location.address);
        } else {
            // Regular location
            description = location.area ? 
                `${location.area}${location.pincode ? ' • ' + location.pincode : ''}` : 
                (location.address ? location.address.split(',').slice(0, 2).join(', ') : 'Hyderabad');
        }
        
        // Store location data
        if (!location.id || location.id.toString().startsWith('nom_') || location.id.toString().startsWith('metro_') || location.id.toString().startsWith('pillar_')) {
            suggestionItem.dataset.locationData = JSON.stringify(location);
        }
        
        suggestionItem.innerHTML = `
            <span class="suggestion-icon">${icon}</span>
            <div class="suggestion-text">
                <div class="suggestion-title">${title}</div>
                <div class="suggestion-description">${description}</div>
            </div>
        `;
        
        suggestionItem.addEventListener('click', function() {
            handleLocationSelect(location);
        });
        
        suggestionItem.addEventListener('mouseenter', function() {
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.classList.remove('highlighted');
            });
            suggestionItem.classList.add('highlighted');
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
    
    suggestionsContainer.classList.add('show');
}

// Handle location selection (works with both JSON and API results)
function handleLocationSelect(location) {
    const suggestionsContainer = document.getElementById('suggestions');
    const searchInput = document.getElementById('location-search');
    
    // Hide suggestions
    suggestionsContainer.classList.remove('show');
    
    // Update search input
    searchInput.value = location.name || location.displayName || location.address;

    // Remember last selected location (for route buttons)
    lastSelectedLocation = location;
    
    // Ensure location has required properties for display
    if (!location.latitudeRange) {
        location.latitudeRange = {
            min: location.latitude - 0.01,
            max: location.latitude + 0.01
        };
    }
    if (!location.longitudeRange) {
        location.longitudeRange = {
            min: location.longitude - 0.01,
            max: location.longitude + 0.01
        };
    }
    if (!location.area) {
        location.area = 'Hyderabad';
    }
    if (!location.pincode) {
        location.pincode = '';
    }
    
    // Display results with coordinates and ranges
    displayResults(location);

    // Update map with selected location
    updateMap(location);
    
    // Save to search history
    saveToSearchHistory(location);
    
    // Log location data (you can use this for your test drive system)
    console.log('Location selected:', {
        id: location.id,
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeRange: location.latitudeRange,
        longitudeRange: location.longitudeRange,
        area: location.area,
        pincode: location.pincode
    });
    
    // You can call a function here to save coordinates to your backend
    // saveCoordinatesToBackend(location);
}

// Update map iframe using OpenStreetMap
function updateMap(location) {
    const mapFrame = document.getElementById('map-frame');
    const leafletMapDiv = document.getElementById('leaflet-map');
    const mapError = document.getElementById('map-error');
    const mapLink = document.getElementById('map-link');
    
    if (!mapFrame) return;

    // Hide Leaflet map and show iframe for single location display
    if (leafletMapDiv) {
        leafletMapDiv.style.display = 'none';
    }
    mapFrame.style.display = 'block';

    // Hide error message initially
    if (mapError) {
        mapError.style.display = 'none';
    }

    // If both Location A and B are set, show both markers
    if (routeStart && routeEnd) {
        const latA = routeStart.latitude;
        const lonA = routeStart.longitude;
        const latB = routeEnd.latitude;
        const lonB = routeEnd.longitude;

        // Calculate bounding box that includes both points
        const minLat = Math.min(latA, latB) - 0.01;
        const maxLat = Math.max(latA, latB) + 0.01;
        const minLon = Math.min(lonA, lonB) - 0.01;
        const maxLon = Math.max(lonA, lonB) + 0.01;

        // OpenStreetMap embed URL with TWO markers (A and B)
        // Format: marker=lat1,lon1&marker=lat2,lon2
        const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
        const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latA},${lonA}&marker=${latB},${lonB}`;
        
        // Also create a link for directions page (fallback)
        const directionsLink = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${latA},${lonA};${latB},${lonB}`;
        if (mapLink) {
            mapLink.href = directionsLink;
            mapLink.textContent = 'View route in new tab';
        }

        mapFrame.src = src;
        
        // Check if map loads (after a delay)
        setTimeout(() => {
            try {
                if (mapFrame.contentDocument === null) {
                    // iframe might be blocked or not loaded
                    if (mapError) {
                        mapError.style.display = 'block';
                    }
                }
            } catch (e) {
                // Cross-origin error is expected - map is loading from different domain
                // This is normal and means map should be working
                console.log('Map iframe loaded (cross-origin is expected)');
            }
        }, 2000);
        
        return;
    }

    // Otherwise, show a single pin for the given location
    const lat = location.latitude;
    const lon = location.longitude;

    console.log('📍 Updating map for single location:', location.name, 'at', lat, lon);

    // If we have ranges, use them to build a bounding box; otherwise, create a small box around the point
    let minLat, maxLat, minLon, maxLon;
    if (location.latitudeRange && location.longitudeRange) {
        minLat = location.latitudeRange.min;
        maxLat = location.latitudeRange.max;
        minLon = location.longitudeRange.min;
        maxLon = location.longitudeRange.max;
    } else {
        const delta = 0.01; // ~1km box
        minLat = lat - delta;
        maxLat = lat + delta;
        minLon = lon - delta;
        maxLon = lon + delta;
    }

    // OpenStreetMap embed URL for single location
    const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
    
    console.log('🗺️ Map URL:', src);
    
    // Single location link
    const singleLocationLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=14`;
    if (mapLink) {
        mapLink.href = singleLocationLink;
        mapLink.textContent = 'View location in new tab';
    }

    // Ensure map frame is visible
    mapFrame.style.display = 'block';
    mapFrame.style.visibility = 'visible';
    mapFrame.style.width = '100%';
    mapFrame.style.height = '500px';
    
    // Set the source
    mapFrame.src = src;
    
    console.log('✓ Map frame src set, map should be loading...');
}

// Update route information UI (Location A, B, and distance)
function updateRouteInfo() {
    const routeSection = document.getElementById('route-section');
    if (!routeSection) return;

    const aNameEl = document.getElementById('route-a-name');
    const aCoordsEl = document.getElementById('route-a-coords');
    const bNameEl = document.getElementById('route-b-name');
    const bCoordsEl = document.getElementById('route-b-coords');
    const distanceEl = document.getElementById('route-distance');

    // If neither A nor B is set, hide section
    if (!routeStart && !routeEnd) {
        routeSection.style.display = 'none';
        return;
    }

    routeSection.style.display = 'block';

    if (routeStart) {
        aNameEl.textContent = routeStart.name;
        aCoordsEl.textContent = `${routeStart.latitude.toFixed(6)}, ${routeStart.longitude.toFixed(6)}`;
    } else {
        aNameEl.textContent = '-';
        aCoordsEl.textContent = '-';
    }

    if (routeEnd) {
        bNameEl.textContent = routeEnd.name;
        bCoordsEl.textContent = `${routeEnd.latitude.toFixed(6)}, ${routeEnd.longitude.toFixed(6)}`;
    } else {
        bNameEl.textContent = '-';
        bCoordsEl.textContent = '-';
    }

    // If both A and B are set, compute and display distance
    if (routeStart && routeEnd) {
        const distanceKm = computeDistanceKm(
            routeStart.latitude,
            routeStart.longitude,
            routeEnd.latitude,
            routeEnd.longitude
        );
        distanceEl.textContent = `${distanceKm.toFixed(2)} km`;
        
        // Automatically show route on map (like Google Maps)
        // This will show Google Maps with routes and directions in the embedded map
        updateMapWithRoute(routeStart, routeEnd);
        
        // Show directions button
        updateDirectionsButton();
    } else {
        distanceEl.textContent = '-';
        
        // Hide directions button
        const directionsContainer = document.getElementById('directions-container');
        if (directionsContainer) {
            directionsContainer.style.display = 'none';
        }
        
        // Hide navigation panel
        hideNavigationPanel();
        
        // If only one location is set, show single location
        if (routeStart) {
            updateMap(routeStart);
        } else if (routeEnd) {
            updateMap(routeEnd);
        }
    }
}

// Update directions button visibility and URL
function updateDirectionsButton() {
    const directionsContainer = document.getElementById('directions-container');
    const startBtn = document.getElementById('start-directions-btn');
    const viewRouteBtn = document.getElementById('view-route-btn');
    
    if (!directionsContainer || !startBtn || !viewRouteBtn) return;
    
    // Show button only when both A and B are set
    if (routeStart && routeEnd) {
        directionsContainer.style.display = 'block';
        
        // Generate Google Maps directions URL
        const googleMapsUrl = generateGoogleMapsDirectionsUrl(routeStart, routeEnd);
        
        // Set button href
        startBtn.onclick = function() {
            window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
        };
        
        // OpenStreetMap directions button (shows directions in embedded map)
        const openstreetmapBtn = document.getElementById('openstreetmap-directions-btn');
        if (openstreetmapBtn) {
            openstreetmapBtn.onclick = function() {
                showOpenStreetMapDirections(routeStart, routeEnd);
            };
        }
        
        // View route button (shows route in OpenStreetMap)
        viewRouteBtn.onclick = function() {
            updateMapWithRoute(routeStart, routeEnd);
        };
    } else {
        directionsContainer.style.display = 'none';
    }
}

// Generate Google Maps URL for a single location (shareable link)
function generateGoogleMapsLocationUrl(location) {
    // Google Maps URL format for a single location
    // This shows the location pinned on Google Maps and is shareable
    const lat = location.latitude;
    const lon = location.longitude;
    
    // Use simple format that's guaranteed to work - shows location pinned
    // Format: https://www.google.com/maps?q=lat,lon
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    
    return url;
}

// Open Google Maps for a single location (make it globally accessible)
function openGoogleMapsForLocation(location) {
    console.log('=== openGoogleMapsForLocation called ===');
    console.log('Location object:', location);
    console.log('Location type:', typeof location);
    console.log('Has latitude?', location?.latitude);
    console.log('Has longitude?', location?.longitude);
    
    if (!location) {
        console.error('Location is null or undefined');
        showError('Invalid location data. Please select a location first.');
        return;
    }
    
    if (typeof location.latitude === 'undefined' || typeof location.longitude === 'undefined') {
        console.error('Missing coordinates. Location:', location);
        showError('Invalid location data. Please select a location first.');
        return;
    }
    
    const lat = parseFloat(location.latitude);
    const lon = parseFloat(location.longitude);
    
    if (isNaN(lat) || isNaN(lon)) {
        console.error('Invalid coordinates. lat:', lat, 'lon:', lon);
        showError('Invalid coordinates. Please select a location first.');
        return;
    }
    
    console.log('Valid coordinates - lat:', lat, 'lon:', lon);
    
    const googleMapsUrl = generateGoogleMapsLocationUrl(location);
    console.log('Final Google Maps URL:', googleMapsUrl);
    
    // Try to open in a new tab
    console.log('Attempting to open window...');
    try {
        // Use window.location as fallback if window.open is blocked
        const newWindow = window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
        
        console.log('Window.open result:', newWindow);
        
        // Check if popup was blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            console.warn('Popup blocked! Trying alternative method...');
            
            // Try alternative: create a temporary link and click it
            const link = document.createElement('a');
            link.href = googleMapsUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Used link.click() method');
            showSuccess(`Opening Google Maps... If it doesn't open, use this link: ${googleMapsUrl}`);
        } else {
            console.log('Successfully opened Google Maps in new window');
            showSuccess(`Google Maps opened! You can share this link: ${googleMapsUrl}`);
        }
    } catch (error) {
        console.error('Error opening Google Maps:', error);
        
        // Last resort: try direct navigation
        try {
            window.location.href = googleMapsUrl;
            console.log('Used window.location.href as fallback');
        } catch (e) {
            console.error('All methods failed:', e);
            showError(`Could not open Google Maps. Please copy and paste this link: ${googleMapsUrl}`);
            
            // Try to copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(googleMapsUrl).then(() => {
                    showSuccess('Link copied to clipboard!');
                }).catch(() => {
                    console.error('Clipboard copy failed');
                });
            }
        }
    }
}

// Generate Google Maps directions URL (automatically shows directions and route)
function generateGoogleMapsDirectionsUrl(start, end) {
    // Google Maps Directions URL that automatically shows:
    // - Full route visualization on the map
    // - Turn-by-turn directions list (left panel)
    // - Distance and estimated travel time
    // - Ready to start navigation
    
    // Use coordinates (most reliable format)
    const origin = `${start.latitude},${start.longitude}`;
    const destination = `${end.latitude},${end.longitude}`;
    
    // Standard Google Maps directions URL format
    // This automatically shows the route and directions when opened
    const url = `https://www.google.com/maps/dir/?api=1` +
        `&origin=${origin}` +
        `&destination=${destination}` +
        `&travelmode=driving`;
    
    // Alternative format (also works):
    // const url = `https://www.google.com/maps/dir/${origin}/${destination}/`;
    
    return url;
}

// Update map to show route with navigation (like Google Maps)
function updateMapWithRoute(start, end) {
    const mapFrame = document.getElementById('map-frame');
    if (!mapFrame) return;
    
    const latA = start.latitude;
    const lonA = start.longitude;
    const latB = end.latitude;
    const lonB = end.longitude;
    
    // Use Google Maps directions URL (shows route and directions)
    // This format displays Google Maps with:
    // - Route path (blue line from A to B)
    // - Turn-by-turn directions (in left panel)
    // - Distance and time estimates
    // - Navigation-ready view with step-by-step instructions
    const origin = `${latA},${lonA}`;
    const destination = `${latB},${lonB}`;
    
    // Google Maps directions URL that shows route and directions
    // Format: /dir/origin/destination/
    // This shows the full Google Maps directions view with route visualization
    const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/${origin}/${destination}/`;
    
    // Try to embed Google Maps directions
    // Note: Google Maps blocks iframe embedding for security (X-Frame-Options)
    // So we'll try it first, then fallback to showing a link
    mapFrame.src = googleMapsDirectionsUrl;
    
    // Also update the map link for direct access (this will always work)
    const mapLink = document.getElementById('map-link');
    if (mapLink) {
        const googleMapsUrl = generateGoogleMapsDirectionsUrl(start, end);
        mapLink.href = googleMapsUrl;
        mapLink.textContent = 'View route on Google Maps (click here if map doesn\'t load)';
        
        // Show the map link prominently if Google Maps blocks iframe
        mapLink.style.display = 'block';
        mapLink.style.marginTop = '10px';
        mapLink.style.padding = '10px';
        mapLink.style.background = '#fff3cd';
        mapLink.style.border = '1px solid #ffc107';
        mapLink.style.borderRadius = '8px';
        mapLink.style.textAlign = 'center';
        mapLink.style.fontWeight = '600';
    }
    
    // Show message that clicking "Start Directions" opens full Google Maps
    const directionsHint = document.querySelector('.directions-hint');
    if (directionsHint) {
        directionsHint.textContent = 'Click "Start Directions" to open Google Maps with full navigation. The map above shows the route preview.';
    }
}

// Leaflet map instance for routing
let leafletMap = null;
let routingControl = null;

// Show OpenStreetMap directions - opens in new tab with turn-by-turn instructions
function showOpenStreetMapDirections(start, end) {
    if (!start || !end) {
        showError('Both Location A and Location B must be set.');
        return;
    }
    
    const latA = start.latitude;
    const lonA = start.longitude;
    const latB = end.latitude;
    const lonB = end.longitude;
    
    // Build OpenStreetMap directions URL with enhanced parameters
    // This URL format ensures turn-by-turn directions are displayed clearly
    // Format: route=lat1,lon1;lat2,lon2 (semicolon-separated waypoints)
    const routePoints = `${latA},${lonA};${latB},${lonB}`;
    
    // Enhanced OpenStreetMap directions URL that shows:
    // - Turn-by-turn directions in left panel
    // - Route visualization on map
    // - Distance and time estimates
    // - Step-by-step navigation instructions
    const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${routePoints}&locale=en`;
    
    // Open OpenStreetMap directions in a new tab
    window.open(osmDirectionsUrl, '_blank', 'noopener,noreferrer');
    
    // Update hint message with clear instructions
    const directionsHint = document.querySelector('.directions-hint');
    if (directionsHint) {
        directionsHint.innerHTML = `
            ✅ OpenStreetMap directions opened in a new tab!<br>
            📍 <strong>What you'll see:</strong><br>
            • Left panel: Turn-by-turn directions (how to go)<br>
            • Map: Route path from ${start.name || 'Location A'} to ${end.name || 'Location B'}<br>
            • Distance and time estimates<br>
            • Each step shows where to turn and which direction<br>
            <br>
            💡 <strong>For live navigation with GPS tracking:</strong> Use the OpenStreetMap mobile app or Google Maps navigation.
        `;
        directionsHint.style.color = '#2e7d32';
        directionsHint.style.fontWeight = '500';
        directionsHint.style.textAlign = 'left';
        directionsHint.style.padding = '15px';
        directionsHint.style.background = '#f0f9ff';
        directionsHint.style.border = '2px solid #0ea5e9';
        directionsHint.style.borderRadius = '8px';
    }
    
    showSuccess('OpenStreetMap directions opened in a new tab! Turn-by-turn instructions are shown in the left panel.');
}

// Fallback to OpenStreetMap if Google Maps blocks embedding
function useOpenStreetMapFallback(latA, lonA, latB, lonB) {
    const mapFrame = document.getElementById('map-frame');
    if (!mapFrame) return;
    
    const routePoints = `${latA},${lonA};${latB},${lonB}`;
    const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${routePoints}`;
    mapFrame.src = osmDirectionsUrl;
    
    const mapLink = document.getElementById('map-link');
    if (mapLink) {
        mapLink.href = osmDirectionsUrl;
        mapLink.textContent = 'Open route on OpenStreetMap in new tab (Google Maps blocked iframe)';
    }
}

// Navigation state variables
let currentRouteSteps = [];
let currentStepIndex = 0;
let totalRouteDistance = 0;
let navigationActive = false;

// Show navigation panel
function showNavigationPanel() {
    const navPanel = document.getElementById('navigation-panel');
    if (navPanel) {
        navPanel.style.display = 'block';
    }
}

// Hide navigation panel
function hideNavigationPanel() {
    const navPanel = document.getElementById('navigation-panel');
    if (navPanel) {
        navPanel.style.display = 'none';
    }
    // Reset navigation state
    currentRouteSteps = [];
    currentStepIndex = 0;
    totalRouteDistance = 0;
    navigationActive = false;
}

// Fetch turn-by-turn directions from OSRM API (free, no API key needed)
async function fetchTurnByTurnDirections(start, end) {
    const directionsList = document.getElementById('directions-list');
    if (!directionsList) return;
    
    // Show loading state
    directionsList.innerHTML = '<div class="directions-loading">Loading turn-by-turn directions...</div>';
    
    try {
        const startCoords = `${start.longitude},${start.latitude}`;
        const endCoords = `${end.longitude},${end.latitude}`;
        
        // Use OSRM routing API (free, no API key needed)
        // Format: http://router.project-osrm.org/route/v1/driving/{coordinates}?overview=false&steps=true
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=false&steps=true&geometries=geojson`;
        
        const response = await fetch(osrmUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch directions');
        }
        
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            totalRouteDistance = route.distance / 1000; // Convert meters to km
            
            // Extract steps from legs
            const steps = [];
            if (route.legs && route.legs.length > 0) {
                route.legs.forEach(leg => {
                    if (leg.steps) {
                        leg.steps.forEach(step => {
                            steps.push({
                                instruction: step.maneuver?.instruction || 'Continue straight',
                                distance: step.distance / 1000, // Convert to km
                                duration: step.duration, // in seconds
                                type: step.maneuver?.type || 'straight'
                            });
                        });
                    }
                });
            }
            
            currentRouteSteps = steps;
            displayDirections(steps, totalRouteDistance);
            updateProgress(0, totalRouteDistance, 0);
        } else {
            throw new Error('No route found');
        }
    } catch (error) {
        console.error('Error fetching directions:', error);
        directionsList.innerHTML = `
            <div class="directions-loading" style="color: #f44336;">
                Unable to load directions. Please try again later or use "Start Directions" to open Google Maps.
            </div>
        `;
    }
}

// Display turn-by-turn directions
function displayDirections(steps, totalDistance) {
    const directionsList = document.getElementById('directions-list');
    if (!directionsList || !steps.length) return;
    
    let html = '';
    steps.forEach((step, index) => {
        const stepIcon = getStepIcon(step.type);
        const distanceText = step.distance < 0.1 
            ? `${(step.distance * 1000).toFixed(0)} m` 
            : `${step.distance.toFixed(2)} km`;
        
        html += `
            <div class="direction-step" data-step-index="${index}">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <div class="step-instruction">
                        <span class="step-icon">${stepIcon}</span>
                        ${step.instruction}
                    </div>
                    <div class="step-distance">
                        📏 ${distanceText}
                    </div>
                </div>
            </div>
        `;
    });
    
    directionsList.innerHTML = html;
    
    // Set up navigation event listeners
    setupNavigationListeners();
}

// Get icon for step type
function getStepIcon(type) {
    const icons = {
        'turn': '↪️',
        'turn-left': '⬅️',
        'turn-right': '➡️',
        'straight': '⬆️',
        'arrive': '✅',
        'depart': '🚗',
        'uturn': '↩️',
        'merge': '🔀',
        'fork': '🔀',
        'on-ramp': '🛣️',
        'off-ramp': '🛣️',
        'roundabout': '🔄'
    };
    
    return icons[type] || icons['straight'];
}

// Set up navigation listeners
function setupNavigationListeners() {
    const startNavBtn = document.getElementById('start-navigation-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const resetNavBtn = document.getElementById('reset-navigation-btn');
    
    if (startNavBtn) {
        startNavBtn.addEventListener('click', function() {
            startNavigation();
        });
    }
    
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function() {
            nextStep();
        });
    }
    
    if (resetNavBtn) {
        resetNavBtn.addEventListener('click', function() {
            resetNavigation();
        });
    }
}

// Start navigation
function startNavigation() {
    if (currentRouteSteps.length === 0) {
        showError('Please wait for directions to load.');
        return;
    }
    
    navigationActive = true;
    currentStepIndex = 0;
    
    // Update UI
    const startNavBtn = document.getElementById('start-navigation-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const resetNavBtn = document.getElementById('reset-navigation-btn');
    
    if (startNavBtn) {
        startNavBtn.style.display = 'none';
    }
    if (nextStepBtn) {
        nextStepBtn.style.display = 'block';
    }
    if (resetNavBtn) {
        resetNavBtn.style.display = 'block';
    }
    
    // Highlight first step
    highlightCurrentStep(0);
    updateProgress(0, totalRouteDistance, 0);
    
    // Update progress step text
    const progressStep = document.getElementById('progress-current-step');
    if (progressStep && currentRouteSteps[0]) {
        progressStep.textContent = currentRouteSteps[0].instruction;
    }
}

// Reset navigation
function resetNavigation() {
    navigationActive = false;
    currentStepIndex = 0;
    
    // Update UI
    const startNavBtn = document.getElementById('start-navigation-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const resetNavBtn = document.getElementById('reset-navigation-btn');
    
    if (startNavBtn) {
        startNavBtn.style.display = 'block';
    }
    if (nextStepBtn) {
        nextStepBtn.style.display = 'none';
    }
    if (resetNavBtn) {
        resetNavBtn.style.display = 'none';
    }
    
    // Remove all active/completed classes
    document.querySelectorAll('.direction-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    updateProgress(0, totalRouteDistance, 0);
    
    const progressStep = document.getElementById('progress-current-step');
    if (progressStep) {
        progressStep.textContent = 'Click "Start Navigation" to begin';
    }
}

// Highlight current step
function highlightCurrentStep(stepIndex) {
    const steps = document.querySelectorAll('.direction-step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < stepIndex) {
            step.classList.add('completed');
        } else if (index === stepIndex) {
            step.classList.add('active');
            // Scroll to active step
            step.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Update progress bar
function updateProgress(distanceCovered, totalDistance, stepIndex) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const progressPercent = document.getElementById('progress-percent');
    
    if (!progressFill || !progressText || !progressPercent) return;
    
    if (totalDistance === 0) {
        progressFill.style.width = '0%';
        progressText.textContent = '0 km / 0 km';
        progressPercent.textContent = '0%';
        return;
    }
    
    // Calculate progress based on step index
    let accumulatedDistance = 0;
    for (let i = 0; i < stepIndex && i < currentRouteSteps.length; i++) {
        accumulatedDistance += currentRouteSteps[i].distance;
    }
    
    const progress = Math.min((accumulatedDistance / totalDistance) * 100, 100);
    const remainingDistance = Math.max(totalDistance - accumulatedDistance, 0);
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${accumulatedDistance.toFixed(2)} km / ${totalDistance.toFixed(2)} km`;
    progressPercent.textContent = `${progress.toFixed(1)}%`;
    
    // Update current step text
    const progressStep = document.getElementById('progress-current-step');
    if (progressStep && stepIndex < currentRouteSteps.length) {
        progressStep.textContent = currentRouteSteps[stepIndex].instruction;
    } else if (progressStep && stepIndex >= currentRouteSteps.length) {
        progressStep.textContent = 'Arrived at destination!';
    }
}

// Function to advance to next step (can be called manually or via GPS tracking)
function nextStep() {
    if (!navigationActive || currentStepIndex >= currentRouteSteps.length - 1) {
        return;
    }
    
    currentStepIndex++;
    highlightCurrentStep(currentStepIndex);
    updateProgress(0, totalRouteDistance, currentStepIndex);
    
    // If reached destination
    if (currentStepIndex >= currentRouteSteps.length - 1) {
        const progressStep = document.getElementById('progress-current-step');
        if (progressStep) {
            progressStep.textContent = '✅ Arrived at destination!';
        }
        updateProgress(totalRouteDistance, totalRouteDistance, currentRouteSteps.length);
        
        // Hide Next Step button when arrived
        const nextStepBtn = document.getElementById('next-step-btn');
        if (nextStepBtn) {
            nextStepBtn.style.display = 'none';
        }
    }
}

// Compute great-circle distance between two points (Haversine formula)
function computeDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km

    const toRad = x => (x * Math.PI) / 180;

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const dPhi = toRad(lat2 - lat1);
    const dLambda = toRad(lon2 - lon1);

    const a =
        Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(dLambda / 2) * Math.sin(dLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Display results in the UI
function displayResults(location) {
    const resultContainer = document.getElementById('result');
    
    // Update display
    document.getElementById('location-name').textContent = location.name;
    document.getElementById('address-display').textContent = location.address;
    document.getElementById('area-display').textContent = location.area;
    document.getElementById('pincode-display').textContent = location.pincode;
    
    // Exact coordinates
    document.getElementById('coordinates').textContent = 
        `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    
    // Latitude range
    document.getElementById('lat-min').textContent = location.latitudeRange.min.toFixed(6);
    document.getElementById('lat-max').textContent = location.latitudeRange.max.toFixed(6);
    document.getElementById('lat-center').textContent = location.latitude.toFixed(6);
    
    // Longitude range
    document.getElementById('lng-min').textContent = location.longitudeRange.min.toFixed(6);
    document.getElementById('lng-max').textContent = location.longitudeRange.max.toFixed(6);
    document.getElementById('lng-center').textContent = location.longitude.toFixed(6);
    
    // Show result container
    resultContainer.style.display = 'block';
    
    // Scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Function to save location to backend
function saveCoordinatesToBackend(location) {
    const data = {
        id: location.id,
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeRange: location.latitudeRange,
        longitudeRange: location.longitudeRange,
        area: location.area,
        pincode: location.pincode,
        timestamp: new Date().toISOString()
    };
    
    // Example API call (adjust to your backend endpoint)
    /*
    fetch('/api/location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Location saved:', data);
    })
    .catch(error => {
        console.error('Error saving location:', error);
    });
    */
}

// Function to get location by ID (useful for backend integration)
function getLocationById(id) {
    return allLocations.find(loc => loc.id === id);
}

// Function to get all locations (useful for backend integration)
function getAllLocations() {
    return allLocations;
}

// Search History Functions
// Save search history - uses only localStorage (no POST requests)
function saveToSearchHistory(location) {
    try {
        const searchEntry = {
            id: Date.now(), // Unique ID using timestamp
            locationId: location.id,
            locationName: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeRange: location.latitudeRange,
            longitudeRange: location.longitudeRange,
            area: location.area,
            pincode: location.pincode,
            timestamp: new Date().toISOString(),
            searchDate: new Date().toLocaleString()
        };
        
        // Save to localStorage only (no API calls, no POST requests)
        saveToLocalStorage(searchEntry);
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

// Save to localStorage (fallback if backend is not available)
function saveToLocalStorage(searchEntry) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history.unshift(searchEntry); // Add to beginning
    history = history.slice(0, 50); // Keep last 50 searches
    localStorage.setItem('searchHistory', JSON.stringify(history));
    loadSearchHistory();
}

// Load and display search history
async function loadSearchHistory() {
    const historyList = document.getElementById('history-list');
    
    try {
        // Try to load from backend first
        try {
            // Use config for API URL (works with GitHub Pages + Render backend)
            const apiUrl = window.getApiUrl ? window.getApiUrl('api/history') : '/api/history';
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                displayHistory(data.searches || data);
                return;
            }
        } catch (error) {
            // If backend fails, load from localStorage
            const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            displayHistory(history);
        }
    } catch (error) {
        console.error('Error loading search history:', error);
        historyList.innerHTML = '<p class="error">Error loading search history</p>';
    }
}

// Display search history
function displayHistory(searches) {
    const historyList = document.getElementById('history-list');
    
    if (!searches || searches.length === 0) {
        historyList.innerHTML = '<p class="no-history">No search history yet. Start searching for locations!</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    searches.forEach((search, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.dataset.id = search.id;
        
        historyItem.innerHTML = `
            <div class="history-item-header">
                <span class="history-number">#${index + 1}</span>
                <span class="history-name">${search.locationName || search.name}</span>
                <span class="history-date">${search.searchDate || new Date(search.timestamp).toLocaleString()}</span>
            </div>
            <div class="history-item-details">
                <div class="history-detail">
                    <strong>Address:</strong> ${search.address}
                </div>
                <div class="history-detail">
                    <strong>Area:</strong> ${search.area} • <strong>Pincode:</strong> ${search.pincode}
                </div>
                <div class="history-detail coordinates">
                    <strong>Coordinates:</strong> 
                    <code>${search.latitude.toFixed(6)}, ${search.longitude.toFixed(6)}</code>
                </div>
                <div class="history-detail ranges">
                    <strong>Lat Range:</strong> ${search.latitudeRange?.min.toFixed(4)} - ${search.latitudeRange?.max.toFixed(4)} • 
                    <strong>Lng Range:</strong> ${search.longitudeRange?.min.toFixed(4)} - ${search.longitudeRange?.max.toFixed(4)}
                </div>
            </div>
        `;
        
        historyItem.addEventListener('click', function() {
            // Reload the location when clicked
            const location = allLocations.find(loc => loc.id === search.locationId);
            if (location) {
                handleLocationSelect(location);
            }
        });
        
        historyList.appendChild(historyItem);
    });
}

// Initialize history section
document.addEventListener('DOMContentLoaded', function() {
    // History toggle button
    const toggleBtn = document.getElementById('toggle-history');
    const historyContainer = document.getElementById('history-container');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (historyContainer.style.display === 'none') {
                historyContainer.style.display = 'block';
                toggleBtn.textContent = 'Hide History';
                loadSearchHistory();
            } else {
                historyContainer.style.display = 'none';
                toggleBtn.textContent = 'Show History';
            }
        });
    }
    
    // Clear history button - uses only localStorage (no DELETE requests)
    const clearBtn = document.getElementById('clear-history');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all search history?')) {
                // Clear localStorage only (no API calls, no DELETE requests)
                localStorage.removeItem('searchHistory');
                loadSearchHistory();
            }
        });
    }
    
    // Refresh history button
    const refreshBtn = document.getElementById('refresh-history');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadSearchHistory();
        });
    }
});

// Error display function
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #fee;
        color: #c33;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #fcc;
    `;
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

function showSuccess(message) {
    const container = document.querySelector('.container');
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background: #efe;
        color: #2c3;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #cfc;
    `;
    successDiv.textContent = message;
    container.insertBefore(successDiv, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 5000);
}
