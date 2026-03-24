# 📸 Royal Photowaala - Complete File Structure

## 📁 Project Root
```
royalphotowaala-fixed2/
├── 📄 package.json                 # Node.js dependencies
├── 📄 package-lock.json           # Dependency lock file
├── 📁 backend/                     # Express.js server
├── 📁 public/                      # Frontend files
├── 📁 uploads/                     # User uploaded images
└── 📁 node_modules/               # Node.js packages
```

## 🚀 Backend (Express.js Server)
```
backend/
├── 📄 server.js                   # Main server file (18KB)
├── 📄 db.js                       # Database schema & setup (3.6KB)
├── 📄 database.sqlite             # SQLite database (32KB)
├── 📄 package.json                # Backend dependencies
├── 📄 package-lock.json          # Backend dependency lock
└── 📁 middleware/                  # Authentication middleware
    └── 📄 auth.js                 # JWT authentication
```

### 🔧 Backend Features
- **🔐 Authentication**: JWT-based admin login
- **📅 Bookings API**: CRUD with duplicate protection
- **🖼️ Gallery API**: Image upload & management
- **📊 Excel Export**: Download bookings data
- **🧹 Auto Archive**: Clean old bookings (90 days)
- **🛡️ Security**: Helmet, CORS, file upload protection

## 🌐 Frontend (Public Files)
```
public/
├── 📄 index.html                  # Main website homepage (14.7KB)
├── 📄 booking.html                # Booking form page (13.5KB)
├── 📄 gallery.html                # Gallery display page (5.6KB)
├── 📄 contact.html                # Contact page (12.1KB)
├── 📄 packages.html               # Photography packages (10.5KB)
├── 📄 adminlogin.html             # Admin login page (2.6KB)
├── 📁 css/                        # Stylesheets
│   ├── 📄 style.css               # Main website styles (22.7KB)
│   └── 📄 dashboard.css           # Admin dashboard styles (30.5KB)
├── 📁 js/                         # JavaScript files
│   ├── 📄 main.js                 # Main website logic (13.5KB)
│   ├── 📄 booking.js              # Booking form functionality (20.6KB)
│   └── 📄 dashboard.js            # Admin dashboard logic (36.2KB)
├── 📁 images/                     # Static website images
│   ├── 📄 logo.png                # Website logo
│   ├── 📄 hero-bg.jpg             # Homepage background
│   └── 📄 gallery-placeholder.jpg # Gallery placeholder
└── 📁 admin/                      # Admin dashboard
    ├── 📄 dashboard.html          # Admin dashboard (8.7KB)
    ├── 📄 login.html              # Admin login page (4.2KB)
    ├── 📁 css/                    # Admin styles
    │   └── 📄 dashboard.css       # Admin dashboard styles (30.5KB)
    ├── 📁 js/                     # Admin scripts
    │   └── 📄 dashboard.js        # Admin dashboard logic (36.2KB)
    ├── 📁 components/              # Reusable components
    │   ├── 📄 sidebar.html        # Sidebar navigation
    │   └── 📄 header.html         # Dashboard header
    └── 📁 config/                 # Configuration files
        └── 📄 api.js               # API endpoints config
```

### 🎨 Frontend Features
- **📱 Responsive Design**: Mobile-first approach
- **🖼️ Gallery**: Dynamic image loading with lazy loading
- **📝 Booking Form**: Duplicate prevention, WhatsApp integration
- **🔐 Admin Dashboard**: Full CRUD operations
- **📊 Analytics**: Charts, statistics, data visualization
- **📸 Image Management**: Upload, delete, organize

## 📁 Uploads Directory
```
uploads/
├── 🖼️ 1774122771645.jpg           # Gallery image (15.7MB)
├── 🖼️ 1774122788266.png           # Gallery image (490KB)
├── 🖼️ 1774122801795.JPG           # Gallery image (9.7MB)
├── 🖼️ 1774122801916.jpg           # Gallery image (13.5MB)
├── 🖼️ 1774122802025.jpg           # Gallery image (13.9MB)
├── 🖼️ 1774122802158.jpg           # Gallery image (24.3MB)
├── 🖼️ 1774122802351.jpg           # Gallery image (12.5MB)
└── 🖼️ ... (29 total images)       # User uploaded content
```

### 📤 Upload Features
- **🔍 Unique Names**: Timestamp-based filenames
- **🖼️ Multiple Types**: JPG, PNG, JPEG support
- **📱 Responsive**: Optimized for web display
- **🛡️ Secure**: Served via Express static middleware

## 🔗 API Endpoints
```
🔐 Authentication:
├── POST /api/auth/login           # Admin login

📅 Bookings:
├── GET  /api/bookings             # Get all bookings (auth)
├── POST /api/bookings             # Create booking (public)
├── PUT  /api/bookings/:id         # Update booking (auth)
├── DELETE /api/bookings/:id       # Delete booking (auth)

🖼️ Gallery:
├── GET  /api/gallery              # Get gallery images (public)
├── POST /api/gallery/upload       # Upload image (auth)
├── DELETE /api/gallery/:id       # Delete image (auth)

🏠 Home Images:
├── GET  /api/home-images          # Get slideshow images (public)
├── POST /api/home-images/upload   # Upload home image (auth)
├── DELETE /api/home-images/:id    # Delete home image (auth)

🎨 Logo:
├── GET  /api/logo                 # Get logo (public)
├── POST /api/logo/upload          # Upload logo (auth)

📊 Management:
├── GET  /api/site-assets          # Get all site assets (public)
├── POST /api/clean-duplicates     # Clean duplicate bookings (auth)
├── GET  /api/export-bookings      # Download Excel (auth)
```

## 🗄️ Database Schema
```sql
📸 Gallery:
├── id (INTEGER PRIMARY KEY)
├── filename (TEXT)
├── createdAt (DATETIME)

📅 Bookings:
├── id (INTEGER PRIMARY KEY)
├── name (TEXT)
├── phone (TEXT)
├── email (TEXT)
├── package (TEXT)
├── date (TEXT)
├── details (TEXT)
├── status (TEXT)
├── createdAt (DATETIME)
├── updatedAt (DATETIME)

🏠 Home Images:
├── id (INTEGER PRIMARY KEY)
├── filename (TEXT)
├── createdAt (DATETIME)

🎨 Logos:
├── id (INTEGER PRIMARY KEY)
├── filename (TEXT)
├── createdAt (DATETIME)

📦 Archive:
├── id (INTEGER)
├── name (TEXT)
├── phone (TEXT)
├── email (TEXT)
├── package (TEXT)
├── date (TEXT)
├── details (TEXT)
├── status (TEXT)
├── archivedAt (DATETIME)
```

## 🚀 Production Features
- **🔒 Security**: JWT authentication, helmet, CORS
- **📊 Analytics**: Booking statistics, Excel export
- **🧹 Auto-cleanup**: Archive old bookings automatically
- **📱 Mobile**: Fully responsive design
- **🖼️ Images**: Optimized upload and display
- **🔄 Real-time**: Live updates without page refresh
- **🛡️ Protection**: Duplicate prevention, input validation
- **📤 Export**: Excel download for bookings data

## 📦 Dependencies
```json
Backend:
├── express (4.18.2)
├── sqlite3 (5.1.6)
├── multer (1.4.5)
├── jsonwebtoken (9.0.2)
├── helmet (7.1.0)
├── cors (2.8.5)
├── cookie-parser (1.4.6)
├── dotenv (16.3.1)
└── exceljs (4.4.0)

Frontend:
├── No external dependencies
├── Vanilla JavaScript only
├── Google Fonts (Poppins)
└── Font Awesome Icons
```

## 🎯 Key Features Summary
- ✅ **Duplicate Prevention**: Phone + date unique constraint
- ✅ **WhatsApp Integration**: Automatic message generation
- ✅ **Admin Dashboard**: Full CRUD operations
- ✅ **Image Management**: Upload, organize, delete
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Security**: JWT authentication, input validation
- ✅ **Auto Archive**: Clean old bookings automatically
- ✅ **Excel Export**: Download booking data
- ✅ **Real-time Updates**: Live refresh without page reload
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Performance**: Lazy loading, optimized images

---
📸 **Royal Photowaala** - Complete Photography Website & Admin System
🚀 **Ready for Production** - Deploy to Render, Netlify, or any hosting platform
