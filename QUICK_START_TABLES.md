# Quick Start Guide - Table Management System

## 🚀 Servers Running

✅ **Backend**: http://localhost:5000/api
✅ **Frontend**: http://localhost:5173

## 📋 Testing the Table System

### 1. Login as Admin
1. Navigate to http://localhost:5173/login
2. Login with admin credentials (or register as first user to become admin)

### 2. Access Tables Section
1. Once logged in, you'll be in the Admin Panel
2. Click **"Tables"** in the sidebar
3. You should see the Table Management page

### 3. Create Your First Table
1. Click **"Add Table"** button (top right)
2. Enter a table number (e.g., 1)
3. Click **"Create Table"**
4. Wait for confirmation toast
5. Table card will appear with QR code

### 4. Manage Tables
Each table card shows:
- **Table Number** (large heading)
- **Status** (Active/Inactive badge)
- **QR Code Preview** (hover to view, click to enlarge)
- **Action Buttons**:
  - 📥 **PNG** - Download QR as PNG
  - 📥 **SVG** - Download QR as SVG
  - ⚡ **Toggle** - Activate/Deactivate table
  - 🔄 **Regenerate** - Create new QR code
  - 🗑️ **Delete** - Remove table

### 5. Download QR Codes
1. Click **PNG** or **SVG** button on any table
2. QR code will download automatically
3. Print and place on physical tables

### 6. Test QR Code
1. Scan downloaded QR code with phone
2. Should redirect to: `http://localhost:5173/menu?table=X`
3. Table number will be in URL

## 🎯 What Each QR Code Contains

Example for Table 5:
```
http://localhost:5173/menu?table=5
```

When customer scans:
- They're taken to menu page
- Frontend can extract table number from URL
- Location validation can be performed
- Order can be associated with table

## 🔐 Location Validation (Future Use)

The backend has location services ready:
- Café location stored in config
- Allowed radius (default: 50m)
- Haversine formula calculates distance
- Validates if customer is within range

## 📊 API Endpoints Available

### Tables
```bash
# Get all tables
GET http://localhost:5000/api/tables

# Create table
POST http://localhost:5000/api/tables
Body: { "tableNumber": 1 }

# Delete table
DELETE http://localhost:5000/api/tables/:id

# Download QR PNG
GET http://localhost:5000/api/tables/:id/qr/png

# Download QR SVG
GET http://localhost:5000/api/tables/:id/qr/svg
```

### Config
```bash
# Get config (admin)
GET http://localhost:5000/api/config

# Get public config
GET http://localhost:5000/api/config/public

# Update location
PUT http://localhost:5000/api/config/location
Body: { "latitude": 28.6139, "longitude": 77.2090, "address": "..." }
```

## 🎨 UI Features

- **Real-time Stats**: Total, Active, Inactive, With QR
- **Search**: Filter tables by number
- **Responsive Grid**: 1-4 columns based on screen size
- **Beautiful Cards**: Color-coded status, QR preview
- **Modals**: Create table, View QR code
- **Toast Notifications**: Success/error messages
- **Loading States**: Spinners during operations

## 💡 Tips

1. **Create Multiple Tables**: Add tables 1-20 for a full restaurant
2. **Download All QRs**: Click download on each table
3. **Test Mobile**: Scan QR codes with phone camera
4. **Toggle Status**: Deactivate tables during maintenance
5. **Regenerate QR**: If URL changes or QR is compromised

## 🔧 Troubleshooting

**Can't see tables?**
- Check you're logged in as admin
- Refresh the page
- Check backend console for errors

**QR not downloading?**
- Check browser allows downloads
- Try different format (PNG vs SVG)
- Check browser console for errors

**Location validation?**
- Will be implemented in menu page
- Backend service is ready
- Requires customer's GPS coordinates

## ✅ System Status

- ✅ Backend models created
- ✅ QR generation working
- ✅ Location services ready
- ✅ Admin UI complete
- ✅ API endpoints functional
- ✅ Authentication integrated
- ✅ Role-based access working

**Ready for production table management!** 🎉
