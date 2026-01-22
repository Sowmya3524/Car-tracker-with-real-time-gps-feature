# 🔍 Hyderabad Location Search - No API Keys Required!

## What is This?

A **location search bar** that:
- Works **WITHOUT** Google API keys or external services
- Uses **predefined Hyderabad locations** stored in a JSON file
- Provides **instant suggestions** as you type
- Fetches **coordinates (latitude, longitude) and coordinate ranges** when clicked
- Perfect for your **Test Drive Vehicle Tracking System**

---

## 🛠️ Tech Stack Needed

### **Frontend (All Included):**
- ✅ **HTML5** - Structure
- ✅ **CSS3** - Modern styling
- ✅ **JavaScript (ES6+)** - Search and display logic
- ✅ **JSON File** - Predefined locations database

### **Backend (Optional):**
- **Node.js** - For server-side operations
- **Express.js** - Web framework
- **Database** (MongoDB/PostgreSQL/MySQL) - To store customer locations

---

## 📋 How It Works

1. **Predefined Locations:** All Hyderabad locations are stored in `hyderabad-locations.json`
2. **Search:** As user types, locations are filtered from the JSON file
3. **Suggestions:** Matching locations appear in dropdown
4. **Click:** When user clicks a location, coordinates and ranges are displayed
5. **Backend:** Coordinates can be saved to your database

---

## 🚀 Quick Start (Frontend Only)

### **Option 1: Direct HTML File (Easiest)**

1. **Open `location-search.html`** in your web browser
2. **That's it!** No setup needed

**Note:** For this to work, you need to serve the files through a local server (not just open the HTML file) because of CORS restrictions when loading JSON.

### **Option 2: Simple Local Server**

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000/location-search.html`

**Using Node.js:**
```bash
npx http-server -p 8000
```

---

## 🗄️ Backend Setup (For Test Drive System)

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Run Server**
```bash
npm start
```

### **Step 3: Access**
- Frontend: `http://localhost:3000/location-search.html`
- API: `http://localhost:3000/api/locations`

---

## 📁 File Structure

```
Test drive vehicles/
├── location-search.html          # Main HTML file (UI for search + results)
├── location-search.css           # Styling (colors, layout, history panel)
├── location-search.js            # Frontend logic (search, suggestions, history)
├── hyderabad-locations.json      # Predefined locations database (Hyderabad areas)
├── search-history.json           # Search history database (previous searches)
├── backend-example.js            # Node.js/Express backend APIs (optional)
├── package.json                  # Node.js dependencies & scripts
├── DATABASE-LOCATIONS.md         # Documentation of where “database” files are
└── README-Hyderabad-Location-Search.md  # Main guide (this file)
```

### 📂 What Each File is For (Use of Each File)

- **`location-search.html`**  
  - The main **web page**.  
  - Contains the **search bar**, **results section**, and **search history section**.  
  - You open this file in the browser (via local server) to use the location search.

- **`location-search.css`**  
  - Controls the **look and feel** (UI design).  
  - Styles the search bar, dropdown suggestions, result card, and history list.  
  - You edit this if you want to change colors, spacing, fonts, etc.

- **`location-search.js`**  
  - Handles all **frontend logic** in the browser.  
  - Loads locations from `hyderabad-locations.json`.  
  - Filters locations as you type and shows suggestions.  
  - When you click a suggestion, it:
    - Shows full details and coordinates
    - Saves the search to history (localStorage or backend)
    - Updates the **Search History** section.

- **`hyderabad-locations.json`**  
  - Acts like a **locations database**.  
  - Stores all predefined Hyderabad locations with:
    - Name, address, area, pincode
    - Exact latitude & longitude
    - Latitude and longitude ranges (min/max).  
  - The frontend and backend **read from this file** to know the available locations.

- **`search-history.json`**  
  - Acts like a **search history database** (on the backend).  
  - Stores every search done by users (when backend is running).  
  - Each entry contains:
    - Which location was selected
    - Coordinates and ranges
    - Timestamp and readable date/time.  
  - Used by the `/api/history` API and by the **Search History** UI.

- **`backend-example.js`**  
  - Example **Node.js + Express** server.  
  - Serves the frontend files and exposes APIs:
    - `/api/locations` – get all locations
    - `/api/locations/search` – search locations
    - `/api/locations/:id` – get single location
    - `/api/locations/:id/coordinates` – get only coordinates
    - `/api/history` – get / save / clear search history.  
  - Also **loads and saves** `hyderabad-locations.json` and `search-history.json`.

- **`package.json`**  
  - Configuration file for **Node.js project**.  
  - Lists dependencies (`express`, `cors`, `nodemon`).  
  - Defines scripts like:
    - `npm start` → runs `backend-example.js`
    - `npm run dev` → runs with `nodemon` (auto-restart on changes).

- **`DATABASE-LOCATIONS.md`**  
  - Documentation that explains **where the database files are**.  
  - Shows paths and examples of data in:
    - `hyderabad-locations.json`
    - `search-history.json`.  
  - Also gives hints on how to move this JSON data into real databases (MongoDB, PostgreSQL, MySQL).

- **`README-Hyderabad-Location-Search.md`** (this file)  
  - Main **project documentation**.  
  - Explains:
    - What the project is
    - Tech stack
    - How it works
    - How to run frontend/backend
    - How to integrate with your Test Drive System.

---

## 📊 Hyderabad Locations Included

The system includes **15 popular Hyderabad locations** with:
- Location name
- Full address
- Exact coordinates (latitude, longitude)
- **Coordinate ranges** (min/max for latitude and longitude)
- Area name
- Pincode

**Locations:**
1. Hitech City
2. Banjara Hills
3. Secunderabad
4. Gachibowli
5. Kondapur
6. Jubilee Hills
7. Mehdipatnam
8. Ameerpet
9. Habsiguda
10. Kukatpally
11. Boduppal
12. Miyapur
13. Shamshabad
14. Malakpet
15. Begumpet

---

## 💻 How to Add More Locations

Edit `hyderabad-locations.json` and add new locations:

```json
{
  "id": 16,
  "name": "Your Location Name",
  "address": "Full Address, Hyderabad, Telangana",
  "latitude": 17.XXXXX,
  "longitude": 78.XXXXX,
  "latitudeRange": {
    "min": 17.XXXXX,
    "max": 17.XXXXX
  },
  "longitudeRange": {
    "min": 78.XXXXX,
    "max": 78.XXXXX
  },
  "area": "Area Name",
  "pincode": "500000"
}
```

---

## 🔌 Integration with Test Drive System

### **Frontend Integration:**

When a location is selected, you can save it to your backend:

```javascript
// In location-search.js, after location selection
function handleLocationSelect(location) {
    // ... display results ...
    
    // Save to backend
    saveToBackend(location);
}

async function saveToBackend(location) {
    const response = await fetch('/api/customers/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customerId: currentCustomerId,
            locationId: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeRange: location.latitudeRange,
            longitudeRange: location.longitudeRange
        })
    });
    
    const data = await response.json();
    console.log('Location saved:', data);
}
```

### **Backend API Endpoints:**

- `GET /api/locations` - Get all locations
- `GET /api/locations/search?q=query` - Search locations
- `GET /api/locations/:id` - Get location by ID
- `GET /api/locations/:id/coordinates` - Get coordinates only
- `POST /api/customers/location` - Save customer location selection

---

## 📍 Coordinate Ranges Explained

Each location has:
- **Exact Coordinates:** The center point (latitude, longitude)
- **Latitude Range:** Min and max latitude values (bounding box)
- **Longitude Range:** Min and max longitude values (bounding box)

**Example:**
```json
{
  "latitude": 17.4486,           // Center latitude
  "longitude": 78.3908,          // Center longitude
  "latitudeRange": {
    "min": 17.4400,              // Minimum latitude
    "max": 17.4600               // Maximum latitude
  },
  "longitudeRange": {
    "min": 78.3800,              // Minimum longitude
    "max": 78.4000               // Maximum longitude
  }
}
```

**Use Cases:**
- **Exact coordinates:** Pin point on map
- **Coordinate ranges:** Check if a driver/customer is within the area boundary

---

## 🎯 Features

✅ **No API Keys Required** - Completely self-contained  
✅ **Fast Search** - Instant suggestions from local data  
✅ **Coordinate Ranges** - Get min/max latitude and longitude  
✅ **Easy to Extend** - Add more locations to JSON file  
✅ **Backend Ready** - Example Express.js server included  
✅ **Keyboard Navigation** - Arrow keys and Enter key support  
✅ **Modern UI** - Beautiful, responsive design  

---

## 🔧 Customization

### **Change Styling:**
Edit `location-search.css` to match your brand colors

### **Add More Locations:**
Edit `hyderabad-locations.json` and add new entries

### **Connect to Database:**
Update `backend-example.js` with your database connection

---

## 📚 API Usage Examples

### **Search Locations:**
```javascript
fetch('/api/locations/search?q=hitech')
  .then(res => res.json())
  .then(data => console.log(data.locations));
```

### **Get Location by ID:**
```javascript
fetch('/api/locations/1')
  .then(res => res.json())
  .then(data => console.log(data.location));
```

### **Save Customer Location:**
```javascript
fetch('/api/customers/location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: 123,
    locationId: 1,
    latitude: 17.4486,
    longitude: 78.3908
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🐛 Troubleshooting

### **Issue: JSON file not loading**
- **Solution:** Serve files through a local server (not file:// protocol)

### **Issue: No suggestions appearing**
- **Solution:** Check browser console for errors, ensure JSON file path is correct

### **Issue: CORS errors**
- **Solution:** Use a local server or configure CORS in your backend

---

## 🎉 Ready to Use!

1. **Frontend Only:** Open `location-search.html` in a local server
2. **With Backend:** Run `npm install && npm start`
3. **Add Locations:** Edit `hyderabad-locations.json`
4. **Integrate:** Connect to your Test Drive System backend

---

**No API keys, no external dependencies, just simple and fast location search! 🚀**
