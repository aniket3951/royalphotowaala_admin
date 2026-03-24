// Authentication middleware for admin routes
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'royalphotowaala-secret-key-2024';

const authMiddleware = (req, res, next) => {
  // For the dashboard route, check for valid JWT token
  if (req.path === '/admin/dashboard') {
    const token = req.query.token || req.cookies?.adminToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.redirect('/adminlogin');
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if user has admin role
      if (decoded.role !== 'admin') {
        return res.redirect('/adminlogin');
      }
      
      // Attach user info to request
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.redirect('/adminlogin');
    }
  } else {
    // For other protected routes, check Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔐 Auth Debug - Token present:', !!token);
    console.log('🔐 Auth Debug - Token length:', token ? token.length : 0);
    console.log('🔐 Auth Debug - JWT_SECRET:', JWT_SECRET);
    
    if (!token) {
      console.log('❌ No token provided in Authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    // 🚨 DEMO MODE: Accept demo token for testing
    if (token === 'demo-token-2024') {
      console.log('🔐 Demo token accepted for testing');
      req.user = { role: 'admin', id: 1, username: 'demo-admin' };
      return next();
    }

    try {
      console.log('🔐 Auth Debug - Verifying real JWT token...');
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔐 Auth Debug - Token decoded successfully:', decoded);
      
      if (decoded.role !== 'admin') {
        console.log('❌ User role is not admin:', decoded.role);
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      req.user = decoded;
      console.log('✅ Authentication successful for user:', decoded.username);
      next();
    } catch (error) {
      console.error('🔐 Auth Debug - Token verification failed:', error.message);
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
  }
};

module.exports = authMiddleware;
