# Frontend Structure Documentation

## Overview
The frontend has been restructured to support both **public-facing** (customer) and **admin** sections of the BookAVibe application.

## Directory Structure

```
src/
├── assets/              # Static assets (logos, images, fonts)
│   └── README.md
├── components/          # Shared UI components
│   └── ProtectedRoute.tsx
├── context/             # React Context providers
│   └── AuthContext.tsx
├── layouts/             # Layout components (frames for pages)
│   ├── AdminLayout.tsx  # Admin panel layout with sidebar
│   └── PublicLayout.tsx # Public layout with navbar and footer
├── pages/               # Page components
│   ├── admin/           # Admin-only pages
│   │   ├── Dashboard.tsx
│   │   ├── MenuManager.tsx (placeholder)
│   │   └── Orders.tsx (placeholder)
│   ├── public/          # Customer-facing pages
│   │   ├── Home.tsx
│   │   ├── Menu.tsx (placeholder)
│   │   └── About.tsx
│   └── Auth/            # Authentication pages
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
├── routes/
│   └── AppRoutes.tsx    # Central routing configuration
├── services/            # API services
│   └── api.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx              # Main app component
└── main.tsx             # Entry point

```

## Route Structure

### Public Routes (No Authentication Required)
- `/` - Home page
- `/menu` - Menu browsing page
- `/about` - About page

### Auth Routes
- `/login` - Login page
- `/register` - Registration page

### Admin Routes (Authentication Required)
- `/admin/dashboard` - Admin dashboard
- `/admin/menu` - Menu management
- `/admin/orders` - Order management
- `/admin/settings` - Settings (placeholder)

### Legacy Routes
- `/dashboard` - Redirects to `/admin/dashboard`

## Layouts

### AdminLayout
- **Purpose**: Wraps all admin pages
- **Features**:
  - Collapsible sidebar navigation
  - Header with user info
  - Logout functionality
  - Protected by authentication

### PublicLayout
- **Purpose**: Wraps all public-facing pages
- **Features**:
  - Top navigation bar
  - Footer with links and info
  - Responsive design

## Authentication Flow

1. User visits `/login` or `/register`
2. Upon successful authentication, redirected to `/admin/dashboard`
3. All `/admin/*` routes are protected by `ProtectedRoute` component
4. Unauthenticated users are redirected to `/login`

## Component Organization

### Shared Components (`components/`)
Place reusable UI components here:
- Buttons
- Input fields
- Cards
- Modals
- etc.

### Page Components (`pages/`)
- **admin/**: Admin-specific pages (requires authentication)
- **public/**: Public-facing pages (no authentication)
- **Auth/**: Login and registration pages

## Adding New Features

### Adding a New Admin Page
1. Create component in `src/pages/admin/`
2. Add route in `src/routes/AppRoutes.tsx`
3. Add navigation item in `AdminLayout.tsx`

### Adding a New Public Page
1. Create component in `src/pages/public/`
2. Add route in `src/routes/AppRoutes.tsx`
3. Add navigation link in `PublicLayout.tsx`

### Adding a Shared Component
1. Create component in `src/components/`
2. Export from component file
3. Import where needed

## Status

### ✅ Completed
- Folder structure
- Layout components
- Route configuration
- Auth pages (Login, Register)
- Admin Dashboard
- Public pages (Home, About)

### 🚧 Under Development
- Menu Manager (admin)
- Orders Management (admin)
- Public Menu page
- Settings page

## Next Steps

1. Build out Menu Manager functionality
2. Implement Order Management system
3. Create QR code generation for tables
4. Build customer menu browsing experience
5. Add real-time order updates

## Important Notes

⚠️ **DO NOT** modify existing authentication logic without careful consideration
⚠️ All admin routes are protected - ensure ProtectedRoute is used
⚠️ Keep public and admin sections clearly separated
