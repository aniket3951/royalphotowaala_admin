#!/usr/bin/env node

/**
 * Royal Photowaala - Test Script
 * Comprehensive end-to-end testing of all functionality
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

// HTTP request helper
function makeRequest(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data && method !== 'GET') {
      const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy());

    if (data && method !== 'GET') {
      const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
      req.write(jsonData);
    }

    req.end();
  });
}

// Test functions
async function testServerConnection() {
  logInfo('Testing server connection...');
  try {
    const response = await makeRequest('GET', BASE_URL);
    if (response.statusCode === 200) {
      logSuccess('Server is running and accessible');
      return true;
    } else {
      logError(`Server responded with status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Cannot connect to server: ${error.message}`);
    return false;
  }
}

async function testAuthentication() {
  logInfo('Testing authentication...');
  try {
    const response = await makeRequest('POST', `${API_BASE}/auth/login`, {
      username: 'aniket49',
      password: '0aniket0'
    });

    if (response.statusCode === 200 && response.body.success) {
      logSuccess('Authentication working');
      return response.body.token;
    } else {
      logError('Authentication failed');
      return null;
    }
  } catch (error) {
    logError(`Authentication error: ${error.message}`);
    return null;
  }
}

async function testGalleryAPI(token) {
  logInfo('Testing Gallery API...');
  
  try {
    // Test GET gallery
    const getResponse = await makeRequest('GET', `${API_BASE}/gallery`);
    if (getResponse.statusCode === 200) {
      logSuccess('Gallery GET API working');
    } else {
      logError(`Gallery GET failed: ${getResponse.statusCode}`);
      return false;
    }

    // Test POST gallery upload (mock test)
    const postResponse = await makeRequest('POST', `${API_BASE}/gallery/upload`, null, {
      'Authorization': `Bearer ${token}`
    });
    
    // Should fail without file, but return proper error
    if (postResponse.statusCode === 400) {
      logSuccess('Gallery upload API properly handles missing files');
    } else {
      logWarning(`Gallery upload unexpected response: ${postResponse.statusCode}`);
    }

    return true;
  } catch (error) {
    logError(`Gallery API error: ${error.message}`);
    return false;
  }
}

async function testLogoAPI(token) {
  logInfo('Testing Logo API...');
  
  try {
    // Test GET logo
    const getResponse = await makeRequest('GET', `${API_BASE}/logo`);
    if (getResponse.statusCode === 200) {
      logSuccess('Logo GET API working');
    } else {
      logError(`Logo GET failed: ${getResponse.statusCode}`);
      return false;
    }

    // Test POST logo upload (mock test)
    const postResponse = await makeRequest('POST', `${API_BASE}/logo/upload`, null, {
      'Authorization': `Bearer ${token}`
    });
    
    if (postResponse.statusCode === 400) {
      logSuccess('Logo upload API properly handles missing files');
    } else {
      logWarning(`Logo upload unexpected response: ${postResponse.statusCode}`);
    }

    return true;
  } catch (error) {
    logError(`Logo API error: ${error.message}`);
    return false;
  }
}

async function testHomeImagesAPI(token) {
  logInfo('Testing Home Images API...');
  
  try {
    // Test GET home images
    const getResponse = await makeRequest('GET', `${API_BASE}/home-images`);
    if (getResponse.statusCode === 200) {
      logSuccess('Home Images GET API working');
    } else {
      logError(`Home Images GET failed: ${getResponse.statusCode}`);
      return false;
    }

    // Test POST home images upload (mock test)
    const postResponse = await makeRequest('POST', `${API_BASE}/home-images/upload`, null, {
      'Authorization': `Bearer ${token}`
    });
    
    if (postResponse.statusCode === 400) {
      logSuccess('Home Images upload API properly handles missing files');
    } else {
      logWarning(`Home Images upload unexpected response: ${postResponse.statusCode}`);
    }

    return true;
  } catch (error) {
    logError(`Home Images API error: ${error.message}`);
    return false;
  }
}

async function testBookingsAPI(token) {
  logInfo('Testing Bookings API...');
  
  try {
    // Test GET bookings
    const getResponse = await makeRequest('GET', `${API_BASE}/bookings`, null, {
      'Authorization': `Bearer ${token}`
    });
    if (getResponse.statusCode === 200) {
      logSuccess('Bookings GET API working');
    } else {
      logError(`Bookings GET failed: ${getResponse.statusCode}`);
      return false;
    }

    // Test POST booking creation
    const testBooking = {
      name: 'Test Customer',
      phone: '1234567890',
      email: 'test@example.com',
      package: 'traditional',
      date: '2024-12-25',
      details: 'Test booking for verification'
    };

    const postResponse = await makeRequest('POST', `${API_BASE}/bookings`, testBooking);
    if (postResponse.statusCode === 200 && postResponse.body.success) {
      logSuccess('Bookings POST API working');
      
      // Clean up - delete the test booking
      if (postResponse.body.id) {
        await makeRequest('DELETE', `${API_BASE}/bookings/${postResponse.body.id}`, null, {
          'Authorization': `Bearer ${token}`
        });
      }
    } else {
      logError(`Bookings POST failed: ${postResponse.statusCode}`);
      return false;
    }

    return true;
  } catch (error) {
    logError(`Bookings API error: ${error.message}`);
    return false;
  }
}

async function testSiteAssetsAPI() {
  logInfo('Testing Site Assets API...');
  
  try {
    const response = await makeRequest('GET', `${API_BASE}/site-assets`);
    if (response.statusCode === 200) {
      logSuccess('Site Assets API working');
      return true;
    } else {
      logError(`Site Assets API failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Site Assets API error: ${error.message}`);
    return false;
  }
}

async function testStaticFiles() {
  logInfo('Testing static file serving...');
  
  try {
    // Test main website
    const mainResponse = await makeRequest('GET', BASE_URL);
    if (mainResponse.statusCode === 200) {
      logSuccess('Main website accessible');
    } else {
      logError(`Main website failed: ${mainResponse.statusCode}`);
      return false;
    }

    // Test admin dashboard
    const adminResponse = await makeRequest('GET', `${BASE_URL}/admin/dashboard.html`);
    if (adminResponse.statusCode === 200) {
      logSuccess('Admin dashboard accessible');
    } else {
      logError(`Admin dashboard failed: ${adminResponse.statusCode}`);
      return false;
    }

    // Test admin login
    const loginResponse = await makeRequest('GET', `${BASE_URL}/admin/login.html`);
    if (loginResponse.statusCode === 200) {
      logSuccess('Admin login accessible');
    } else {
      logError(`Admin login failed: ${loginResponse.statusCode}`);
      return false;
    }

    return true;
  } catch (error) {
    logError(`Static files error: ${error.message}`);
    return false;
  }
}

async function testDirectoryStructure() {
  logInfo('Testing directory structure...');
  
  const requiredDirs = [
    'uploads',
    'uploads/gallery',
    'uploads/home',
    'uploads/logos',
    'uploads/temp',
    'backend',
    'public',
    'scripts',
    'docs'
  ];

  let allDirsExist = true;
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      logSuccess(`Directory exists: ${dir}`);
    } else {
      logError(`Directory missing: ${dir}`);
      allDirsExist = false;
    }
  });

  return allDirsExist;
}

// Main test runner
async function runTests() {
  console.log('\n🧪 Royal Photowaala - End-to-End Testing');
  console.log('==========================================\n');

  const results = {
    serverConnection: false,
    authentication: false,
    galleryAPI: false,
    logoAPI: false,
    homeImagesAPI: false,
    bookingsAPI: false,
    siteAssetsAPI: false,
    staticFiles: false,
    directoryStructure: false
  };

  let token = null;

  // Run tests
  results.serverConnection = await testServerConnection();
  if (!results.serverConnection) {
    logError('Server is not running. Please start the server with "npm start"');
    return;
  }

  token = await testAuthentication();
  results.authentication = !!token;

  if (results.authentication) {
    results.galleryAPI = await testGalleryAPI(token);
    results.logoAPI = await testLogoAPI(token);
    results.homeImagesAPI = await testHomeImagesAPI(token);
    results.bookingsAPI = await testBookingsAPI(token);
  }

  results.siteAssetsAPI = await testSiteAssetsAPI();
  results.staticFiles = await testStaticFiles();
  results.directoryStructure = await testDirectoryStructure();

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('======================\n');

  const passedTests = Object.values(results).filter(result => result).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? colors.green : colors.red;
    log(`${test.replace(/([A-Z])/g, ' $1').trim()}: ${status}`, color);
  });

  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    logSuccess('🎉 All tests passed! Royal Photowaala is working perfectly!');
    console.log('\n🌐 Access Points:');
    console.log(`   📸 Main Website: ${BASE_URL}`);
    console.log(`   🎛️  Admin Panel: ${BASE_URL}/admin/dashboard.html`);
    console.log(`   🔐 Admin Login: ${BASE_URL}/admin/login.html`);
    console.log('\n🔐 Admin Credentials:');
    console.log('   Username: aniket49');
    console.log('   Password: 0aniket0');
  } else {
    logWarning(`⚠️ ${totalTests - passedTests} test(s) failed. Please check the issues above.`);
  }

  console.log('\n🏁 Testing complete!\n');
}

// Run tests
runTests().catch(error => {
  logError(`Test runner error: ${error.message}`);
  process.exit(1);
});
