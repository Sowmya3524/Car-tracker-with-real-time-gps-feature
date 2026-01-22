# 📊 Database Files Location Guide

## Where to Find Your Database Files

Your search history and location data are stored in **JSON files** in your project folder:

### 📁 Project Folder:
```
C:\Raam Groups - Intern\Test drive vehicles\
```

---

## 🗄️ Database Files

### 1. **Locations Database** 
**File:** `hyderabad-locations.json`
- Contains all predefined Hyderabad locations
- Includes coordinates, ranges, addresses, areas, pincodes
- This is your **locations database**

**Location:** `C:\Raam Groups - Intern\Test drive vehicles\hyderabad-locations.json`

### 2. **Search History Database**
**File:** `search-history.json`
- Contains all previous searches
- Stores each search with timestamp, coordinates, location details
- This is your **search history database**

**Location:** `C:\Raam Groups - Intern\Test drive vehicles\search-history.json`

---

## 📖 How to View the Database

### Method 1: View in Browser (Easiest)
1. Open: `http://localhost:8000/location-search.html`
2. Click **"Show History"** button
3. See all previous searches displayed in the UI

### Method 2: View JSON File Directly
1. Open the file `search-history.json` in any text editor (Notepad, VS Code, etc.)
2. View all search history in JSON format

### Method 3: Access via API
1. Start the backend server (Node.js)
2. Visit: `http://localhost:3000/api/history`
3. See all search history in JSON format

---

## 📋 What's Stored in Search History

Each search entry contains:
- **Search ID** - Unique identifier
- **Location Name** - Name of the location searched
- **Full Address** - Complete address
- **Coordinates** - Latitude and Longitude
- **Coordinate Ranges** - Min/Max latitude and longitude
- **Area** - Area name
- **Pincode** - Postal code
- **Timestamp** - When the search was made
- **Search Date** - Human-readable date/time

---

## 🔍 Example Database Content

### Locations Database (`hyderabad-locations.json`)
```json
{
  "locations": [
    {
      "id": 1,
      "name": "Hitech City",
      "address": "Hitech City, Hyderabad, Telangana",
      "latitude": 17.4486,
      "longitude": 78.3908,
      ...
    }
  ]
}
```

### Search History Database (`search-history.json`)
```json
{
  "searches": [
    {
      "id": 1704067200000,
      "locationId": 1,
      "locationName": "Hitech City",
      "address": "Hitech City, Hyderabad, Telangana",
      "latitude": 17.4486,
      "longitude": 78.3908,
      "timestamp": "2024-01-01T12:00:00.000Z",
      "searchDate": "1/1/2024, 12:00:00 PM"
    }
  ]
}
```

---

## 🚀 How It Works

1. **When you search:**
   - User searches for a location
   - Location is selected and displayed
   - Search is automatically saved to `search-history.json`

2. **When you view history:**
   - Click "Show History" button
   - System loads from `search-history.json`
   - Displays all previous searches

3. **Data Storage:**
   - **Backend Running:** Saves to `search-history.json` file
   - **Backend Not Running:** Saves to browser's localStorage

---

## 🔧 Database Management

### Clear All History:
1. In browser: Click "Clear All History" button
2. Or delete: `search-history.json` file

### Add More Locations:
1. Edit: `hyderabad-locations.json`
2. Add new location entries
3. Restart server (if using backend)

### View in Database Tools (Future):
- **MongoDB:** Export JSON to MongoDB collection
- **PostgreSQL:** Import JSON and create table
- **MySQL:** Import JSON and create table

---

## 📍 Current Database Status

**Locations:** ✅ 15 Hyderabad locations stored  
**Search History:** ✅ Automatically saved when you search  
**File Format:** JSON (easy to convert to any database)  

---

## 🔄 Converting to Real Database (MongoDB/PostgreSQL/MySQL)

### MongoDB Example:
```javascript
// Import locations
mongoimport --db testdrive --collection locations --file hyderabad-locations.json

// Import search history
mongoimport --db testdrive --collection searchHistory --file search-history.json
```

### PostgreSQL Example:
```sql
-- Create table and import JSON
CREATE TABLE locations (data JSONB);
CREATE TABLE search_history (data JSONB);
```

### MySQL Example:
```sql
-- Create table with JSON column
CREATE TABLE locations (data JSON);
CREATE TABLE search_history (data JSON);
```

---

## 📂 File Locations Summary

| Database | File Name | Location |
|----------|-----------|----------|
| **Locations** | `hyderabad-locations.json` | Project folder |
| **Search History** | `search-history.json` | Project folder |

---

**All database files are stored in your project folder!** 📁
