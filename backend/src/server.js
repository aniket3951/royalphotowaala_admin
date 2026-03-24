const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');

require('dotenv').config();

// Import services
const { uploadImage, deleteImage } = require('./services/cloudinaryService');
const prisma = require('../prismaClient');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://royalphotowaala.onrender.com']
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Trust proxy for production
app.set('trust proxy', 1);

// Serve static files
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../../frontend/admin')));

// Serve main website for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Favicon route
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Serve booking page
app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/booking.html'));
});

// Serve other pages
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/gallery.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/contact.html'));
});

app.get('/packages', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/packages.html'));
});

// Multer configuration for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Allow demo token for testing
  if (token === 'demo-token-2024') {
    req.user = { username: 'admin', role: 'admin', id: 1 };
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple authentication (in production, use database)
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { username: 'admin', role: 'admin', id: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: { username: 'admin', role: 'admin' }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

// ==================== BOOKING ROUTES ====================

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, package: pkg, date, details } = req.body;
    
    // Validate required fields
    if (!name || !phone || !pkg || !date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Check for duplicate booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        phone,
        date: new Date(date),
        package: pkg
      }
    });
    
    if (existingBooking) {
      return res.status(400).json({ error: 'Booking already exists for this date and package' });
    }
    
    const booking = await prisma.booking.create({
      data: {
        name,
        email: email || null,
        phone,
        package: pkg,
        date: new Date(date),
        details: details || null,
        status: 'pending'
      }
    });
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// ==================== GALLERY ROUTES ====================

app.get('/api/gallery', async (req, res) => {
  try {
    const images = await prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

app.post('/api/gallery/upload', authenticateToken, upload.array('images', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadImage(file.buffer, 'gallery');
      if (result.success) {
        return await prisma.gallery.create({
          data: {
            filename: result.url,
            publicId: result.publicId,
            source: result.source
          }
        });
      }
      throw new Error(result.error);
    });
    
    const images = await Promise.all(uploadPromises);
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

app.delete('/api/gallery/:id', authenticateToken, async (req, res) => {
  try {
    const image = await prisma.gallery.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete from Cloudinary if it's a Cloudinary image
    if (image.publicId && image.source === 'cloudinary') {
      await deleteImage(image.publicId);
    }
    
    await prisma.gallery.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ==================== HOME IMAGES ROUTES ====================

app.get('/api/home-images', async (req, res) => {
  try {
    const images = await prisma.homeImage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch home images' });
  }
});

app.post('/api/home-images/upload', authenticateToken, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadImage(file.buffer, 'home-images');
      if (result.success) {
        return await prisma.homeImage.create({
          data: {
            filename: result.url,
            publicId: result.publicId,
            source: result.source
          }
        });
      }
      throw new Error(result.error);
    });
    
    const images = await Promise.all(uploadPromises);
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload home images' });
  }
});

app.delete('/api/home-images/:id', authenticateToken, async (req, res) => {
  try {
    const image = await prisma.homeImage.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete from Cloudinary if it's a Cloudinary image
    if (image.publicId && image.source === 'cloudinary') {
      await deleteImage(image.publicId);
    }
    
    await prisma.homeImage.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete home image' });
  }
});

// ==================== LOGO ROUTES ====================

app.get('/api/logo', async (req, res) => {
  try {
    const logo = await prisma.logo.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    res.json(logo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logo' });
  }
});

app.post('/api/logo/upload', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Delete existing logo
    await prisma.logo.deleteMany();
    
    const result = await uploadImage(req.file.buffer, 'logo');
    if (result.success) {
      const logo = await prisma.logo.create({
        data: {
          filename: result.url,
          publicId: result.publicId,
          source: result.source
        }
      });
      res.json({ success: true, logo });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// ==================== SITE ASSETS ROUTES ====================

app.get('/api/site-assets', async (req, res) => {
  try {
    const logo = await prisma.logo.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      logo: logo ? {
        filename: logo.filename,
        source: logo.source
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site assets' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== 404 HANDLER ====================

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==================== SERVER START ====================

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

module.exports = app;
