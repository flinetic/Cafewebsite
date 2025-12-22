# 📚 BookAVibe - Cafe Management System

A modern, full-stack cafe management system with QR code-based table ordering, real-time order management, and an elegant customer-facing interface featuring a 3D animated coffee cup.

![BookAVibe](https://img.shields.io/badge/BookAVibe-Cafe%20Management-brown)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## ✨ Features

### Customer Features
- 🎨 Beautiful landing page with 3D animated coffee cup
- 📱 QR code scanning for table-specific menu access
- 🍽️ Browse menu with categories and images
- 🛒 Add items to cart and place orders
- 📍 Real-time order status tracking

### Admin Features
- 📊 Dashboard with order statistics
- 🍕 Menu management (add, edit, delete items with images)
- 📋 Real-time order management
- 🪑 Table management with QR code generation
- 👥 Staff management

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB** (Atlas recommended for cloud hosting)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/YugandharMS/Cafewebsite.git
cd Cafewebsite
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration (see Environment Variables section below)

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Access on Mobile Devices (Same Network)

To access the app from mobile devices on the same WiFi network:

```bash
# Find your computer's IP address
# Windows: Run 'ipconfig' in terminal, look for IPv4 Address
# Mac/Linux: Run 'ifconfig' or 'ip addr'

# Start frontend with host flag
cd frontend
npm run dev -- --host 0.0.0.0
```

Then update your backend `.env` file:
```env
MENU_BASE_URL=http://YOUR_IP_ADDRESS:5173
```

Access from mobile: `http://YOUR_IP_ADDRESS:5173`

## ⚙️ Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` folder based on `.env.example`:

```env
# Application
NODE_ENV=development
PORT=5000

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# QR Code Menu URL (Use your IP for mobile access)
MENU_BASE_URL=http://localhost:5173

# MongoDB Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bookavibe

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Default Admin Credentials (for initial setup)
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASS=YourSecurePassword123!

# Cloudinary (optional - for image uploads)
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
```

### Frontend (.env) - Optional

Create a `.env` file in the `frontend` folder if you need custom API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
BookAVibe/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database & service configurations
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, validation, error handling
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── scripts/            # Database seeding, admin creation
│   └── server.js           # Entry point
│
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context (Auth, Cart)
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   ├── Auth/       # Login, Register
│   │   │   └── public/     # Customer-facing pages
│   │   ├── routes/         # Route configuration
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript types
│   └── index.html
│
└── README.md
```

## 🔧 Available Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm run create-admin  # Create admin user
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🎯 Usage Guide

### First Time Setup

1. **Start both servers** (backend and frontend)

2. **Create Admin Account**
   ```bash
   cd backend
   npm run create-admin
   ```
   Or use the default credentials from your `.env` file

3. **Login to Admin Panel**
   - Go to `http://localhost:5173/login`
   - Login with admin credentials

4. **Set Up Tables**
   - Navigate to Tables section in admin panel
   - Add tables (e.g., Table 1, Table 2, etc.)
   - Download/print QR codes for each table

5. **Add Menu Items**
   - Navigate to Menu section
   - Add categories and menu items with images

6. **Start Taking Orders**
   - Customers scan QR code on their table
   - They browse menu and place orders
   - Orders appear in admin Orders section

## 🛡️ Security Notes

- Never commit `.env` files to version control
- Change default admin credentials immediately
- Use strong JWT secrets in production
- Enable HTTPS in production
- The `.env` file is already in `.gitignore`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Yugandhar MS**
- GitHub: [@YugandharMS](https://github.com/YugandharMS)

---

⭐ Star this repo if you find it helpful!
