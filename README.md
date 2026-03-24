# 📸 Royal Photowaala - Professional Photography Website

A modern, full-stack photography booking and gallery management system built with Node.js, Express, and vanilla JavaScript.

## 🌟 Features

### For Customers
- **📅 Online Booking System** - Easy appointment scheduling
- **📸 Gallery Portfolio** - Beautiful image galleries
- **🎨 Dynamic Content** - Logo and slideshow management
- **📱 Responsive Design** - Works on all devices
- **⚡ Fast Loading** - Optimized performance

### For Administrators
- **🎛️ Admin Dashboard** - Complete management system
- **📊 Booking Management** - View, edit, and manage bookings
- **🖼️ Gallery Management** - Upload and organize photos
- **🎨 Brand Management** - Update logo and homepage images
- **📈 Analytics** - Track business performance
- **🔐 Secure Authentication** - Protected admin access

## 🏗️ Architecture

```
royalphotowaala/
├── 📁 backend/                 # Server-side code
│   ├── 📁 middleware/           # Authentication & security
│   ├── 📄 server.js            # Main server application
│   ├── 📄 db.js                # Database connection & schema
│   └── 📄 database.sqlite      # SQLite database
├── 📁 public/                  # Client-side code
│   ├── 📁 admin/               # Admin dashboard
│   │   ├── 📁 css/             # Admin styles
│   │   ├── 📁 js/              # Admin scripts
│   │   ├── 📄 dashboard.html   # Main admin interface
│   │   └── 📄 login.html       # Admin login
│   ├── 📁 css/                 # Global styles
│   ├── 📁 js/                  # Global scripts
│   ├── 📁 images/              # Static images
│   └── 📄 index.html           # Main website
├── 📁 uploads/                 # User uploaded content
│   ├── 📁 gallery/              # Gallery images
│   ├── 📁 logos/               # Logo files
│   └── 📁 home/                # Homepage slideshow
├── 📄 package.json             # Dependencies & scripts
├── 📄 README.md               # This file
└── 📄 .gitignore              # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd royalphotowaala
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
# Start backend server
cd backend
node server.js

# Or use npm script (from root)
npm start
```

4. **Access the application**
- **Main Website**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5000/admin/dashboard.html
- **Admin Login**: http://localhost:5000/admin/login.html

### Default Admin Credentials
- **Username**: `aniket49`
- **Password**: `0aniket0`

## 📡 API Documentation

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "aniket49",
  "password": "0aniket0"
}
```

### Gallery Management
```http
# Get all gallery images
GET /api/gallery

# Upload gallery image
POST /api/gallery/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Delete gallery image
DELETE /api/gallery/:id
Authorization: Bearer <token>
```

### Logo Management
```http
# Get logo
GET /api/logo

# Upload logo
POST /api/logo/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Delete logo
DELETE /api/logo/:id
Authorization: Bearer <token>
```

### Home Images Management
```http
# Get home images
GET /api/home-images

# Upload home image
POST /api/home-images/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Delete home image
DELETE /api/home-images/:id
Authorization: Bearer <token>
```

### Booking Management
```http
# Get all bookings
GET /api/bookings
Authorization: Bearer <token>

# Create booking
POST /api/bookings
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "package": "traditional",
  "date": "2024-12-25",
  "details": "Wedding photography"
}

# Update booking
PUT /api/bookings/:id
Authorization: Bearer <token>

# Delete booking
DELETE /api/bookings/:id
Authorization: Bearer <token>
```

## 🎨 Frontend Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Vanilla JS with modern features
- **Font Awesome** - Icon library
- **Responsive Design** - Mobile-first approach

## 🛠️ Backend Technologies

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Database
- **Multer** - File upload handling
- **JWT** - Authentication tokens
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📊 Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  phone TEXT,
  package TEXT,
  date TEXT,
  details TEXT,
  status TEXT DEFAULT 'Pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Gallery Table
```sql
CREATE TABLE gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Home Images Table
```sql
CREATE TABLE home_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Logos Table
```sql
CREATE TABLE logos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### File Upload Limits
- **Gallery Images**: Up to 100MB per image
- **Logo Images**: Up to 10MB per logo
- **Home Images**: Up to 25MB per image

## 🚀 Deployment

### Production Setup
1. Set environment variables
2. Build production assets
3. Start server with `NODE_ENV=production`
4. Use reverse proxy (nginx/Apache)
5. Set up SSL certificate

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "backend/server.js"]
```

## 🔒 Security Features

- **JWT Authentication** - Secure admin access
- **Helmet.js** - Security headers
- **CORS Protection** - Cross-origin security
- **Input Validation** - Data sanitization
- **File Upload Security** - Type and size validation
- **SQL Injection Protection** - Parameterized queries

## 🐛 Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size limits
   - Verify directory permissions
   - Check authentication token

2. **Database Errors**
   - Ensure SQLite file exists
   - Check file permissions
   - Verify table schema

3. **Authentication Issues**
   - Clear browser cookies
   - Check JWT secret
   - Verify token format

### Debug Mode
Enable detailed logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## 📈 Performance Optimization

- **Image Compression** - Automatic optimization
- **Lazy Loading** - On-demand image loading
- **Caching** - Browser and server caching
- **Minification** - CSS/JS optimization
- **CDN Ready** - Static asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and inquiries:
- **Email**: support@royalphotowaala.com
- **Phone**: +91 XXXXX XXXXX
- **Website**: https://royalphotowaala.com

---

**Built with ❤️ by Royal Photowaala Team**
