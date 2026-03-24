const fs = require('fs');
const path = require('path');

// Check if Cloudinary is available
const isCloudinaryAvailable = () => {
  try {
    require.resolve('cloudinary');
    return true;
  } catch (error) {
    console.log('⚠️ Cloudinary module not available, using local storage only');
    return false;
  }
};

// Check if running in production
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// Cloudinary service (only if available)
let cloudinary = null;
if (isCloudinaryAvailable()) {
  try {
    cloudinary = require('cloudinary').v2;
    console.log('☁️ Cloudinary module loaded successfully');
  } catch (error) {
    console.error('❌ Error loading Cloudinary:', error);
    cloudinary = null;
  }
}

// Configure Cloudinary if available
const configureCloudinary = () => {
  if (!cloudinary) return false;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || 'demo_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'demo_secret',
    secure: true
  });

  console.log('☁️ Cloudinary configured:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'using demo',
    api_key: process.env.CLOUDINARY_API_KEY ? 'configured' : 'using demo',
    is_demo: !process.env.CLOUDINARY_CLOUD_NAME
  });

  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET &&
         process.env.CLOUDINARY_CLOUD_NAME !== 'demo';
};

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  return isCloudinaryAvailable() && configureCloudinary();
};

// Production warning
const checkProductionStorage = () => {
  if (isProduction() && !isCloudinaryConfigured()) {
    console.warn('⚠️ WARNING: No Cloudinary in production → uploads may be lost on Render restart');
    console.warn('💡 SOLUTION: Add Cloudinary credentials or use persistent storage');
  }
};

// Local file upload fallback (always available)
const uploadLocalFile = async (file, folder = 'gallery') => {
  try {
    console.log(`📁 Uploading to local storage: ${folder}`);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);
    
    console.log(`✅ Local upload successful: ${filename}`);
    
    return {
      success: true,
      url: `/uploads/${folder}/${filename}`,
      filename: filename,
      localPath: filepath,
      originalName: file.originalname || 'unknown'
    };
    
  } catch (error) {
    console.error('❌ Local upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload image with Cloudinary fallback to local storage
const uploadImage = async (file, folder = 'royalphotowaala') => {
  // Check production storage warning
  checkProductionStorage();
  
  try {
    // First try Cloudinary if configured and available
    if (isCloudinaryConfigured()) {
      console.log(`☁️ Uploading to Cloudinary folder: ${folder}`);
      
      const result = await cloudinary.uploader.upload(file, {
        folder: folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { crop: 'limit', width: 1200, height: 800 }
        ]
      });

      console.log(`✅ Cloudinary upload successful:`, result.public_id);
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        folder: result.folder,
        originalName: file.originalname || 'unknown',
        source: 'cloudinary'
      };
    } else {
      // Fallback to local storage
      console.log('⚠️ Cloudinary not configured or not available, using local storage');
      return await uploadLocalFile(file, folder);
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.log('🔄 Falling back to local storage...');
    
    // Fallback to local storage on error
    try {
      return await uploadLocalFile(file, folder);
    } catch (fallbackError) {
      console.error('❌ Local fallback also failed:', fallbackError);
      return {
        success: false,
        error: `Cloudinary: ${error.message}, Local: ${fallbackError.message}`
      };
    }
  }
};

// Delete image from Cloudinary (if available)
const deleteImage = async (publicId, localPath = null) => {
  try {
    if (cloudinary && isCloudinaryConfigured()) {
      console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      console.log(`✅ Cloudinary deletion successful:`, result);
      
      return {
        success: true,
        result: result
      };
    } else {
      console.log('⚠️ Cloudinary not available, skipping remote deletion');
      
      // Delete local file if path provided
      if (localPath && fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
          console.log(`✅ Local file deleted: ${localPath}`);
        } catch (fileError) {
          console.error('❌ Local file deletion error:', fileError);
        }
      }
      
      return {
        success: true,
        message: 'Cloudinary not available - local file deleted'
      };
    }
  } catch (error) {
    console.error('❌ Cloudinary deletion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get optimized URL (if Cloudinary available)
const getOptimizedUrl = (publicId, options = {}) => {
  if (!cloudinary || !isCloudinaryConfigured()) {
    // Return local URL if Cloudinary not available
    return `/uploads/gallery/${publicId}`;
  }
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: []
      .concat(options.width ? [{ width: options.width, crop: 'limit' }] : [])
      .concat(options.height ? [{ height: options.height, crop: 'limit' }] : [])
      .concat(options.quality ? [{ quality: options.quality, fetch_format: 'auto' }] : [])
  });
};

module.exports = {
  uploadImage,
  deleteImage,
  getOptimizedUrl,
  isCloudinaryConfigured,
  isCloudinaryAvailable,
  isProduction
};
