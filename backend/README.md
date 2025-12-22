# BookAVibe - Cafe Management System Backend

A production-ready Node.js/Express backend API for cafe management with staff roles (Admin, Chef, Staff).

## 🚀 Features

- **Role-Based Access Control**: Admin, Chef, and Staff roles with different permissions
- **Authentication**: JWT-based authentication with access and refresh tokens
- **Email Verification**: Email verification for new accounts
- **Password Reset**: Secure password reset via email
- **Profile Management**: Complete profile management for all staff
- **File Upload**: Profile image upload via Cloudinary
- **Rate Limiting**: Protection against brute force attacks
- **Security**: Helmet, CORS, MongoDB sanitization, HPP protection
- **Notifications**: In-app notification system
- **Pagination**: Built-in pagination for list endpoints

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB (Atlas or local)
- Cloudinary account (for image uploads)
- Gmail account (for SMTP)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/bookavibe/bookavibe-backend.git
cd bookavibe-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create initial admin**
```bash
npm run create-admin
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── cloudinary.js     # Cloudinary configuration
│   └── db.js             # MongoDB connection
├── controllers/
│   ├── authController.js # Authentication logic
│   └── staffController.js# Staff management logic
├── middleware/
│   ├── auth.js           # JWT authentication
│   ├── asyncHandler.js   # Async error wrapper
│   ├── errorHandler.js   # Global error handling
│   ├── rateLimiter.js    # Rate limiting
│   ├── roleAuth.js       # Role-based authorization
│   ├── upload.js         # File upload handling
│   └── validators.js     # Request validation
├── models/
│   └── Staff.js          # Staff model
├── routes/
│   ├── index.js          # Route aggregator
│   ├── auth.js           # Auth routes
│   └── staff.js          # Staff routes
├── scripts/
│   ├── createAdmin.js    # Create initial admin
│   └── seed.js           # Seed database
├── utils/
│   ├── apiResponse.js    # Response helpers
│   ├── constants.js      # App constants
│   ├── email.js          # Email utilities
│   └── sendNotification.js# Notification utilities
├── .env.example          # Environment template
├── package.json
├── server.js             # Entry point
└── README.md
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new staff | Public* |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/verify-email/:token` | Verify email | Public |
| POST | `/api/auth/resend-verification` | Resend verification | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password/:token` | Reset password | Public |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout | Private |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/update-password` | Update password | Private |

*First registration creates admin, subsequent require admin access

### Staff Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/staff/profile` | Get own profile | Private |
| PUT | `/api/staff/profile` | Update own profile | Private |
| PUT | `/api/staff/profile/image` | Update profile image | Private |
| GET | `/api/staff/notifications` | Get notifications | Private |
| PUT | `/api/staff/notifications/read-all` | Mark all read | Private |
| GET | `/api/staff` | Get all staff | Admin |
| POST | `/api/staff` | Create staff | Admin |
| GET | `/api/staff/stats` | Get statistics | Admin |
| GET | `/api/staff/:id` | Get staff by ID | Admin |
| PUT | `/api/staff/:id` | Update staff | Admin |
| PUT | `/api/staff/:id/role` | Update role | Admin |
| PUT | `/api/staff/:id/activate` | Activate staff | Admin |
| PUT | `/api/staff/:id/deactivate` | Deactivate staff | Admin |
| DELETE | `/api/staff/:id` | Delete staff | Admin |

## 👥 Staff Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | Full system access | All operations including staff management |
| **chef** | Kitchen staff | Profile management, view orders |
| **staff** | General staff | Profile management, basic operations |

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `SMTP_EMAIL` | Gmail address | Yes |
| `SMTP_PASSWORD` | Gmail app password | Yes |
| `CLOUDINARY_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_SECRET` | Cloudinary API secret | Yes |

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run create-admin # Create initial admin user
npm run seed       # Seed database with sample data
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Rate limiting on all endpoints
- MongoDB injection prevention
- XSS protection via Helmet
- CORS configuration
- Account lockout after failed attempts
- Secure password requirements

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
