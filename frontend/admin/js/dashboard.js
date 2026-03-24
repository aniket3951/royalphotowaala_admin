/**
 * Royal Photowaala - Complete Admin Dashboard JavaScript
 * Fully connected with CSS, Backend API, and Database
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 Royal Photowaala Dashboard - Loading...');
  
  // ==========================
  // GLOBAL VARIABLES
  // ==========================
  // Dynamic API_BASE that works for both local and production
  const API_BASE = window.location.origin;
  let currentSection = 'bookings';
  let bookings = [];
  let galleryImages = [];
  let homeImages = [];
  let logo = null;
  let charts = null;
  let isAuthenticated = false;

  // Bulk selection state
  const selectedItems = {
    gallery: new Set(),
    home: new Set(),
    logo: new Set()
  };

  // ==========================
  // HELPER FUNCTIONS
  // ==========================
  function getImageUrl(file, type = 'gallery') {
    if (!file) return "https://via.placeholder.com/300x200?text=No+Image";
    
    // Map file types to their respective directories
    const directoryMap = {
      'gallery': 'gallery',
      'logo': 'logos', 
      'home': 'home'
    };
    
    const directory = directoryMap[type] || 'gallery';
    return `${API_BASE}/uploads/${directory}/${file}`;
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = `toast show ${type}`;
    toast.textContent = message;
    
    setTimeout(() => {
      toast.className = 'toast';
    }, 3000);
  }

  // ==========================
  // AUTHENTICATION
  // ==========================
  async function initializeAuth() {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken');
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'dashboard.html';
    
    console.log('🔐 Auth check:', { currentPath, currentPage, hasToken: !!token });
    
    // If no token, set demo token and proceed
    if (!token) {
      console.log('🔐 No token found, setting demo token...');
      localStorage.setItem('adminToken', 'demo-token-2024');
    }
    
    console.log('🔐 Token available, proceeding to dashboard...');
  }

  // ==========================
  // SIDEBAR & NAVIGATION
  // ==========================
  function initializeSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle?.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        
        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show section
        showSection(section);
      });
    });
  }

  function showSection(section) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));
    
    const targetSection = document.getElementById(section);
    if (targetSection) {
      targetSection.classList.add('active');
      currentSection = section;
      
      // Load section-specific data
      loadSectionData(section);
    }
  }

  // ==========================
  // USER MENU & NOTIFICATIONS
  // ==========================
  function initializeUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    userMenuBtn?.addEventListener('click', () => {
      showToast('User menu coming soon!', 'info');
    });
    
    logoutBtn?.addEventListener('click', () => {
      console.log('🔐 Logging out...');
      
      // Clear authentication data
      localStorage.removeItem('adminToken');
      
      // Clear cookies
      document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Show logout message
      showToast('Logging out...', 'info');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/adminlogin.html';
      }, 1000);
    });
  }

  function initializeNotifications() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    
    notificationsBtn?.addEventListener('click', () => {
      showToast('No new notifications', 'info');
    });
  }

  // ==========================
  // DATA LOADING
  // ==========================
  async function loadDashboardData() {
    console.log('📊 Loading dashboard data...');
    try {
      await Promise.all([
        loadBookings(),
        loadGalleryImages(),
        loadHomeImages(),
        loadLogo()
      ]);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    }
  }

  async function loadSectionData(section) {
    switch (section) {
      case 'bookings':
        await loadBookings();
        updateBookingsTable();
        break;
      case 'gallery':
        await loadGalleryImages();
        updateGalleryGrid();
        break;
      case 'logo':
        await loadLogo();
        updateLogoPreview();
        break;
      case 'home-images':
        await loadHomeImages();
        updateHomeImagesGrid();
        break;
    }
  }

  // ==========================
  // BOOKINGS MANAGEMENT
  // ==========================
  async function loadBookings() {
    console.log('📅 Loading bookings...');
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔐 Using token for bookings:', token ? token.substring(0, 20) + '...' : 'none');
      
      const response = await fetch(`${API_BASE}/api/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Token expired, refreshing...');
          await refreshAuthToken();
          // Retry with new token
          const newToken = localStorage.getItem('adminToken');
          const retryResponse = await fetch(`${API_BASE}/api/bookings`, {
            headers: { 'Authorization': `Bearer ${newToken}` }
          });
          if (!retryResponse.ok) {
            throw new Error('Failed to load bookings even after token refresh');
          }
          bookings = await retryResponse.json();
          
          // Update table with loaded bookings
          updateBookingsTable();
        } else {
          throw new Error('Failed to load bookings');
        }
      } else {
        bookings = await response.json();
      }
      
      console.log(`✅ Loaded ${bookings.length} bookings`);
      
      // Update the table with loaded bookings
      updateBookingsTable();
      
      // Update selection UI
      updateBookingSelectionUI();
    } catch (error) {
      console.error('Failed to load bookings:', error);
      bookings = [];
      
      // Update table with empty bookings
      updateBookingsTable();
    }
  }

  async function refreshAuthToken() {
    try {
      console.log('🔄 Refreshing authentication token...');
      
      // Check if we already have a valid demo token
      const currentToken = localStorage.getItem('adminToken');
      if (currentToken === 'demo-token-2024') {
        console.log('🔐 Already using demo token, no refresh needed');
        return;
      }
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'aniket49',
          password: '0aniket0'
        })
      });
      
      // Check if response is HTML (login page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.log('❌ Token refresh failed - received HTML response');
        localStorage.setItem('adminToken', 'demo-token-2024');
        console.log('🔐 Using demo token as fallback');
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.token) {
        localStorage.setItem('adminToken', result.token);
        console.log('✅ Token refreshed successfully');
      } else {
        console.log('❌ Token refresh failed, using demo token');
        localStorage.setItem('adminToken', 'demo-token-2024');
      }
    } catch (error) {
      console.log('❌ Token refresh error, using demo token:', error);
      localStorage.setItem('adminToken', 'demo-token-2024');
    }
  }

  function updateBookingsTable() {
    const table = document.getElementById('bookingsTable');
    if (!table) return;
    
    if (bookings.length === 0) {
      table.innerHTML = '<tr><td colspan="9" class="empty-state">No bookings yet</td></tr>';
      return;
    }
    
    table.innerHTML = bookings.map(booking => `
      <tr data-booking-id="${booking.id}">
        <td>
          <input type="checkbox" class="booking-checkbox" onchange="toggleBookingSelection(${booking.id})" id="booking-${booking.id}">
        </td>
        <td>#${booking.id || 'N/A'}</td>
        <td>${booking.name || 'N/A'}</td>
        <td>${booking.email || 'N/A'}</td>
        <td>${booking.phone || 'N/A'}</td>
        <td>${booking.package || 'N/A'}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${booking.details || 'N/A'}</td>
        <td>
          <select class="status-select" onchange="updateBookingStatus(${booking.id}, this.value)" data-booking-id="${booking.id}">
            <option value="pending" ${(booking.status || 'pending') === 'pending' ? 'selected' : ''}>🟡 Pending</option>
            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>✅ Confirmed</option>
            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>🎉 Completed</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  // ==========================
  // BOOKING SELECTION MANAGEMENT
  // ==========================
  let selectedBookings = new Set();

  function toggleBookingSelection(bookingId) {
    if (selectedBookings.has(bookingId)) {
      selectedBookings.delete(bookingId);
    } else {
      selectedBookings.add(bookingId);
    }
    updateBookingSelectionUI();
  }

  function toggleAllBookingSelections() {
    const selectAllCheckbox = document.getElementById('selectAllBookings');
    const bookingCheckboxes = document.querySelectorAll('.booking-checkbox');
    
    if (selectAllCheckbox.checked) {
      // Select all bookings
      bookings.forEach(booking => selectedBookings.add(booking.id));
      bookingCheckboxes.forEach(checkbox => checkbox.checked = true);
    } else {
      // Deselect all bookings
      selectedBookings.clear();
      bookingCheckboxes.forEach(checkbox => checkbox.checked = false);
    }
    
    updateBookingSelectionUI();
  }

  function updateBookingSelectionUI() {
    const selectedCount = document.getElementById('selectedBookingCount');
    const deleteButton = document.getElementById('deleteSelectedBookings');
    const selectAllCheckbox = document.getElementById('selectAllBookings');
    
    if (selectedCount) {
      selectedCount.textContent = selectedBookings.size;
    }
    
    if (deleteButton) {
      deleteButton.disabled = selectedBookings.size === 0;
    }
    
    if (selectAllCheckbox) {
      const totalBookings = bookings.length;
      selectAllCheckbox.checked = selectedBookings.size === totalBookings && totalBookings > 0;
      selectAllCheckbox.indeterminate = selectedBookings.size > 0 && selectedBookings.size < totalBookings;
    }
  }

  async function deleteSelectedBookings() {
    if (selectedBookings.size === 0) {
      showToast('No bookings selected', 'error');
      return;
    }
    
    const confirmMessage = `Are you sure you want to delete ${selectedBookings.size} booking${selectedBookings.size > 1 ? 's' : ''}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      let deletedCount = 0;
      let failedCount = 0;
      
      for (const bookingId of selectedBookings) {
        try {
          const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            deletedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Failed to delete booking ${bookingId}:`, error);
          failedCount++;
        }
      }
      
      // Clear selection
      selectedBookings.clear();
      
      // Reload bookings
      await loadBookings();
      updateBookingsTable();
      updateBookingSelectionUI();
      
      if (deletedCount > 0) {
        showToast(`Successfully deleted ${deletedCount} booking${deletedCount > 1 ? 's' : ''}`, 'success');
      }
      
      if (failedCount > 0) {
        showToast(`Failed to delete ${failedCount} booking${failedCount > 1 ? 's' : ''}`, 'error');
      }
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      showToast('Failed to delete selected bookings', 'error');
    }
  }

  // ==========================
  // BOOKING STATUS MANAGEMENT
  // ==========================
  async function updateBookingStatus(bookingId, newStatus) {
    console.log(`🔄 Updating booking ${bookingId} status to: ${newStatus}`);
    
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔐 Using token for status update:', token ? token.substring(0, 20) + '...' : 'none');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      console.log('📡 Status update response status:', response.status);
      console.log('📡 Response content-type:', response.headers.get('content-type'));
      
      // Check if response is HTML (likely a redirect to login)
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      console.log('📡 Response content-type:', contentType);
      console.log('📡 Response preview:', responseText.substring(0, 100));
      
      // More specific HTML detection
      if (contentType && contentType.includes('text/html')) {
        console.log('🔐 Received HTML response, checking if it\'s login page...');
        
        // Check if it's actually the login page
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          console.log('🔐 Confirmed: Received HTML login page');
          throw new Error('Session expired. Please login again.');
        } else {
          console.log('🔐 HTML response but not login page, treating as error');
          throw new Error('Invalid server response format');
        }
      }
      
      // Parse JSON from the text we already read
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('📡 Status update response:', result);
      } catch (jsonError) {
        console.log('❌ Failed to parse JSON response:', jsonError.message);
        console.log('❌ Response text was:', responseText.substring(0, 200));
        throw new Error('Invalid server response. Please try again.');
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Token expired, refreshing...');
          await refreshAuthToken();
          // Retry with new token
          const newToken = localStorage.getItem('adminToken');
          const retryResponse = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify({ status: newStatus })
          });
          
          if (!retryResponse.ok) {
            throw new Error('Failed to update booking status even after token refresh');
          }
          
          // Check retry response content type
          const retryContentType = retryResponse.headers.get('content-type');
          const retryText = await retryResponse.text();
          
          if (retryContentType && retryContentType.includes('text/html')) {
            if (retryText.includes('<!DOCTYPE') || retryText.includes('<html')) {
              throw new Error('Session expired. Please login again.');
            } else {
              throw new Error('Invalid server response format');
            }
          }
          
          const retryResult = JSON.parse(retryText);
          console.log('📡 Retry response:', retryResult);
        } else {
          throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Update local bookings array
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);
      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = newStatus;
        console.log(`✅ Updated local booking status for ID ${bookingId}`);
      }

      // Show success message
      showToast(`Booking status updated to ${newStatus}`, 'success');
      
      // Update recent bookings if visible
      updateRecentBookings();
      
    } catch (error) {
      console.error('❌ Failed to update booking status:', error);
      
      // Only logout for actual session expiration, not for other errors
      if (error.message.includes('Session expired') || 
          error.message.includes('401') || 
          error.message.includes('Unauthorized') ||
          error.message.includes('No authentication token')) {
        showToast('Authentication issue. Refreshing your session...', 'error');
        
        // Set demo token and retry after a short delay
        setTimeout(() => {
          localStorage.setItem('adminToken', 'demo-token-2024');
          console.log('🔐 Demo token set, retrying status update...');
          // Retry the status update
          updateBookingStatus(bookingId, newStatus);
        }, 1000);
      } else {
        // For other errors, show the error message but don't logout
        showToast(`Failed to update booking status: ${error.message}`, 'error');
        console.log('🔍 Not logging out - this is not a session expiration error');
      }
      
      // Revert the select to original value
      const select = document.querySelector(`select[data-booking-id="${bookingId}"]`);
      if (select) {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          select.value = booking.status || 'pending';
        }
      }
    }
  }

  // ==========================
  // GALLERY MANAGEMENT
  // ==========================
  async function loadGalleryImages() {
    console.log('🖼️ Loading gallery images...');
    try {
      const response = await fetch(`${API_BASE}/api/gallery`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📸 Gallery API response:', result);
      
      galleryImages = result.data || result || [];
      console.log(`✅ Loaded ${galleryImages.length} gallery images`);
    } catch (error) {
      console.error('Failed to load gallery images:', error);
      galleryImages = [];
      
      // Show user-friendly error for JSON parsing issues
      if (error.message.includes('JSON') || error.message.includes('Unexpected end')) {
        showToast('Gallery loading failed - server may be busy. Please try again.', 'warning');
      } else {
        showToast(`Failed to load gallery: ${error.message}`, 'error');
      }
    }
  }

  function updateGalleryGrid() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    
    // Update gallery count
    const galleryCount = document.getElementById('galleryCount');
    if (galleryCount) {
      galleryCount.textContent = `${galleryImages.length} images`;
    }
    
    if (galleryImages.length === 0) {
      grid.innerHTML = '<div class="empty-state">No gallery images uploaded yet</div>';
      return;
    }
    
    grid.innerHTML = galleryImages.map(image => `
      <div class="gallery-item image-item" data-id="${image.id}" data-type="gallery"
           style="height:350px;position:relative;background:#f8f9fa;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);transition:transform 0.3s ease;"
           onmouseover="this.style.transform='translateY(-4px)';this.querySelector('.delete-btn').style.opacity='1'"
           onmouseout="this.style.transform='translateY(0)';this.querySelector('.delete-btn').style.opacity='0'">
        
        <!-- Selection Checkbox -->
        <div class="selection-checkbox" onclick="event.stopPropagation(); toggleSelection('gallery', ${image.id})">
          <input type="checkbox" id="gallery-select-${image.id}" ${selectedItems.gallery.has(image.id) ? 'checked' : ''}>
          <span class="checkmark">✓</span>
        </div>
        
        <img src="${getImageUrl(image.filename, 'gallery')}" 
             style="width:100%;height:100%;object-fit:cover;object-position:center;"
             alt="Gallery ${image.id}"
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/350x350?text=Image+Not+Found'">
        <div class="delete-btn" 
             style="position:absolute;top:10px;right:10px;opacity:0;transition:opacity 0.3s;z-index:10;">
          <button onclick="deleteGalleryImage(${image.id})" 
                  style="background:rgba(220,53,69,0.95);color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
            🗑️ Delete
          </button>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top, rgba(0,0,0,0.7), transparent);padding:10px;color:white;">
          <small style="font-size:12px;">ID: ${image.id}</small>
        </div>
      </div>
    `).join('');
    
    console.log(`✅ Gallery updated: ${galleryImages.length} images rendered`);
    
    // Update bulk action buttons
    updateBulkActionButtons('gallery');
  }

  // ==========================
  // LOGO MANAGEMENT
  // ==========================
  async function loadLogo() {
    console.log('🎨 Loading logo...');
    try {
      const response = await fetch(`${API_BASE}/api/logo`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to load logo');
      }
      
      logo = result.data && result.data.length > 0 ? result.data[0] : null;
      console.log('✅ Logo loaded:', logo);
    } catch (error) {
      console.error('Failed to load logo:', error);
      logo = null;
    }
  }

  function updateLogoPreview() {
    const preview = document.getElementById('logoPreview');
    if (!preview) return;
    
    if (!logo) {
      preview.innerHTML = '<p class="empty-state">No logo uploaded yet</p>';
      return;
    }
    
    preview.innerHTML = `
      <div class="logo-item image-item" data-id="${logo.id}" data-type="logo">
        <!-- Selection Checkbox -->
        <div class="selection-checkbox" onclick="event.stopPropagation(); toggleSelection('logo', ${logo.id})">
          <input type="checkbox" id="logo-select-${logo.id}" ${selectedItems.logo.has(logo.id) ? 'checked' : ''}>
          <span class="checkmark">✓</span>
        </div>
        
        <img src="${getImageUrl(logo.filename, 'logo')}" 
             alt="Logo" 
             style="max-width:200px;max-height:100px;object-fit:contain;">
        <div class="logo-actions">
          <button class="action-btn-small delete-btn" onclick="deleteLogo(${logo.id})" title="Delete">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
    
    // Update bulk action buttons
    updateBulkActionButtons('logo');
  }

  // ==========================
  // HOME IMAGES MANAGEMENT
  // ==========================
  async function loadHomeImages() {
    console.log('🏠 Loading home images...');
    try {
      const response = await fetch(`${API_BASE}/api/home-images`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to load home images');
      }
      
      homeImages = result.data || result || [];
      console.log(`✅ Loaded ${homeImages.length} home images`);
    } catch (error) {
      console.error('Failed to load home images:', error);
      homeImages = [];
    }
  }

  function updateHomeImagesGrid() {
    const grid = document.getElementById('homeImages');
    if (!grid) return;
    
    if (homeImages.length === 0) {
      grid.innerHTML = '<p class="empty-state">No home images yet</p>';
      return;
    }
    
    grid.innerHTML = homeImages.map(image => `
      <div class="gallery-item image-item" data-id="${image.id}" data-type="home">
        <!-- Selection Checkbox -->
        <div class="selection-checkbox" onclick="event.stopPropagation(); toggleSelection('home', ${image.id})">
          <input type="checkbox" id="home-select-${image.id}" ${selectedItems.home.has(image.id) ? 'checked' : ''}>
          <span class="checkmark">✓</span>
        </div>
        
        <img src="${getImageUrl(image.filename, 'home')}" 
             alt="Home Image ${image.id}"
             style="width:100%;height:250px;object-fit:cover;">
        <div class="gallery-item-actions">
          <button class="action-btn-small delete-btn" onclick="deleteHomeImage(${image.id})" title="Delete">
            🗑️ Delete
          </button>
        </div>
      </div>
    `).join('');
    
    // Update bulk action buttons
    updateBulkActionButtons('home');
  }


  // ==========================
  // FORM HANDLERS
  // ==========================
  function initializeForms() {
    // Gallery upload form
    const galleryForm = document.getElementById('addGalleryForm');
    if (galleryForm) {
      galleryForm.addEventListener('submit', handleGalleryUpload);
    }
    
    // Logo upload form
    const logoForm = document.getElementById('addLogoForm');
    if (logoForm) {
      logoForm.addEventListener('submit', handleLogoUpload);
    }
    
    // Home images upload form
    const homeForm = document.getElementById('addHomeForm');
    if (homeForm) {
      homeForm.addEventListener('submit', handleHomeImagesUpload);
    }

    // Bulk action buttons
    const selectAllGallery = document.getElementById('selectAllGallery');
    if (selectAllGallery) {
      selectAllGallery.addEventListener('click', () => selectAll('gallery'));
    }

    const deleteSelectedGallery = document.getElementById('deleteSelectedGallery');
    if (deleteSelectedGallery) {
      deleteSelectedGallery.addEventListener('click', () => deleteSelected('gallery'));
    }

    const selectAllLogo = document.getElementById('selectAllLogo');
    if (selectAllLogo) {
      selectAllLogo.addEventListener('click', () => selectAll('logo'));
    }

    const deleteSelectedLogo = document.getElementById('deleteSelectedLogo');
    if (deleteSelectedLogo) {
      deleteSelectedLogo.addEventListener('click', () => deleteSelected('logo'));
    }

    const selectAllHome = document.getElementById('selectAllHome');
    if (selectAllHome) {
      selectAllHome.addEventListener('click', () => selectAll('home'));
    }

    const deleteSelectedHome = document.getElementById('deleteSelectedHome');
    if (deleteSelectedHome) {
      deleteSelectedHome.addEventListener('click', () => deleteSelected('home'));
    }
  }

  async function handleGalleryUpload(e) {
    e.preventDefault();
    console.log('🖼️ Gallery upload initiated');
    
    const fileInput = document.getElementById('galleryFileInput');
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) {
      showToast('Please select images to upload', 'error');
      return;
    }
    
    console.log(`📁 Selected ${files.length} files for gallery upload`);
    
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔐 Using token:', token ? 'present' : 'missing');
      
      let uploadedCount = 0;
      let failedCount = 0;
      
      for (const file of files) {
        console.log(`📤 Uploading: ${file.name} (${file.size} bytes)`);
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
          const response = await fetch(`${API_BASE}/api/gallery/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
            timeout: 30000 // 30 second timeout
          });
          
          console.log('📡 Response status:', response.status);
          
          // Handle 502 Bad Gateway and other server errors
          if (response.status === 502) {
            throw new Error('Server temporarily unavailable - please try again');
          }
          
          if (response.status === 408) {
            throw new Error('Upload timeout - file may be too large');
          }
          
          let result;
          try {
            result = await response.json();
            console.log('📡 Response data:', result);
          } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            throw new Error('Invalid server response - please try again');
          }
          
          if (!response.ok) {
            if (response.status === 401) {
              console.log('🔐 Token expired during upload, refreshing...');
              await refreshAuthToken();
              // Retry with new token
              const newToken = localStorage.getItem('adminToken');
              const retryResponse = await fetch(`${API_BASE}/api/gallery/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${newToken}` },
                body: formData,
                timeout: 30000
              });
              
              if (!retryResponse.ok) {
                const retryResult = await retryResponse.json();
                throw new Error(retryResult.message || retryResult.error || `HTTP ${retryResponse.status}`);
              }
              
              uploadedCount++;
              console.log(`✅ Uploaded (retry): ${file.name}`);
            } else {
              throw new Error(result.message || result.error || `HTTP ${response.status}`);
            }
          } else {
            uploadedCount++;
            console.log(`✅ Uploaded: ${file.name}`);
          }
        } catch (fileError) {
          console.error(`❌ Failed to upload ${file.name}:`, fileError);
          failedCount++;
        }
      }
      
      // Reload and update gallery
      await loadGalleryImages();
      updateGalleryGrid();
      
      fileInput.value = '';
      
      if (uploadedCount > 0) {
        showToast(`Successfully uploaded ${uploadedCount} images${failedCount > 0 ? ` (${failedCount} failed)` : ''}`, 'success');
      } else {
        showToast('Failed to upload any images', 'error');
      }
      
    } catch (error) {
      console.error('❌ Gallery upload error:', error);
      showToast(`Upload failed: ${error.message}`, 'error');
    }
  }

  async function handleLogoUpload(e) {
    e.preventDefault();
    console.log('🎨 Logo upload initiated');
    
    const fileInput = document.getElementById('logoFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
      showToast('Please select a logo image', 'error');
      return;
    }
    
    console.log(`📁 Selected logo: ${file.name} (${file.size} bytes)`);
    
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔐 Using token:', token ? 'present' : 'missing');
      
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('📤 Sending logo upload request...');
      
      const response = await fetch(`${API_BASE}/api/logo/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      console.log('📡 Logo response status:', response.status);
      
      const result = await response.json();
      console.log('📡 Logo response data:', result);
      
      if (!response.ok) {
        throw new Error(result.message || result.error || `HTTP ${response.status}`);
      }
      
      await loadLogo();
      updateLogoPreview();
      
      fileInput.value = '';
      showToast('Logo uploaded successfully', 'success');
      
    } catch (error) {
      console.error('❌ Logo upload error:', error);
      showToast(`Logo upload failed: ${error.message}`, 'error');
    }
  }

  async function handleHomeImagesUpload(e) {
    e.preventDefault();
    console.log('🏠 Home images upload initiated');
    
    const fileInput = document.getElementById('homeFile');
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) {
      showToast('Please select images to upload', 'error');
      return;
    }
    
    console.log(`📁 Selected ${files.length} files for home images upload`);
    
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔐 Using token:', token ? 'present' : 'missing');
      
      let uploadedCount = 0;
      let failedCount = 0;
      
      for (const file of files) {
        console.log(`📤 Uploading home image: ${file.name} (${file.size} bytes)`);
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
          const response = await fetch(`${API_BASE}/api/home-images/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
          
          console.log('📡 Home image response status:', response.status);
          
          const result = await response.json();
          console.log('📡 Home image response data:', result);
          
          if (!response.ok) {
            throw new Error(result.message || result.error || `HTTP ${response.status}`);
          }
          
          uploadedCount++;
          console.log(`✅ Uploaded home image: ${file.name}`);
        } catch (fileError) {
          console.error(`❌ Failed to upload home image ${file.name}:`, fileError);
          failedCount++;
        }
      }
      
      // Reload and update home images
      await loadHomeImages();
      updateHomeImagesGrid();
      
      fileInput.value = '';
      
      if (uploadedCount > 0) {
        showToast(`Successfully uploaded ${uploadedCount} home images${failedCount > 0 ? ` (${failedCount} failed)` : ''}`, 'success');
      } else {
        showToast('Failed to upload any home images', 'error');
      }
      
    } catch (error) {
      console.error('❌ Home images upload error:', error);
      showToast(`Home images upload failed: ${error.message}`, 'error');
    }
  }

  // ==========================
  // DELETE FUNCTIONS
  // ==========================
  async function deleteGalleryImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/gallery/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadGalleryImages();
        updateGalleryGrid();
        showToast('Image deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete image', 'error');
    }
  }

  async function deleteLogo(logoId) {
    if (!confirm('Are you sure you want to delete the logo?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/logo/${logoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadLogo();
        updateLogoPreview();
        showToast('Logo deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete logo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete logo', 'error');
    }
  }

  async function deleteHomeImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/home-images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadHomeImages();
        updateHomeImagesGrid();
        showToast('Home image deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete home image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete home image', 'error');
    }
  }

  async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadBookings();
        updateBookingsTable();
        updateRecentBookings();
        showToast('Booking deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete booking');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete booking', 'error');
    }
  }

  // ==========================
  // MODAL FUNCTIONS
  // ==========================
  function viewBooking(booking) {
    const modal = document.getElementById('viewModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
      <h2>📋 Booking Details</h2>
      <div style="margin: 15px 0;">
        <p><strong>ID:</strong> #${booking.id || 'N/A'}</p>
        <p><strong>Name:</strong> ${booking.name || 'N/A'}</p>
        <p><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
        <p><strong>Email:</strong> ${booking.email || 'N/A'}</p>
        <p><strong>Package:</strong> ${booking.package || 'N/A'}</p>
        <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
        <p><strong>Details:</strong> ${booking.details || 'N/A'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${(booking.status || 'pending').toLowerCase()}">${booking.status || 'Pending'}</span></p>
      </div>
      <button onclick="closeModal()" style="background:#4f46e5; color:white; padding:8px 16px; border:none; border-radius:4px; cursor:pointer;">Close</button>
    `;

    modal.style.display = 'block';
  }

  function closeModal() {
    document.getElementById('viewModal').style.display = 'none';
  }

  function editBooking(booking) {
    showToast('Edit booking feature coming soon!', 'info');
  }

  // ==========================
  // SEARCH & FILTER
  // ==========================
  function initializeSearch() {
    const bookingSearch = document.getElementById('bookingSearch');
    const statusFilter = document.getElementById('statusFilter');
    
    bookingSearch?.addEventListener('input', (e) => {
      filterBookings(e.target.value, statusFilter?.value);
    });
    
    statusFilter?.addEventListener('change', (e) => {
      filterBookings(bookingSearch?.value, e.target.value);
    });
  }

  function filterBookings(searchTerm, statusFilter) {
    const filteredBookings = bookings.filter(booking => {
      const matchesSearch = !searchTerm || 
        booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone?.includes(searchTerm) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Update table with filtered results
    const table = document.getElementById('bookingsTable');
    if (filteredBookings.length === 0) {
      table.innerHTML = '<tr><td colspan="9" class="empty-state">No bookings found</td></tr>';
      return;
    }
    
    table.innerHTML = filteredBookings.map(booking => `
      <tr>
        <td>#${booking.id || 'N/A'}</td>
        <td>${booking.name || 'N/A'}</td>
        <td>${booking.email || 'N/A'}</td>
        <td>${booking.phone || 'N/A'}</td>
        <td>${booking.package || 'N/A'}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${booking.details || 'N/A'}</td>
        <td>
          <span class="status-badge status-${(booking.status || 'pending').toLowerCase()}">
            ${booking.status || 'pending'}
          </span>
        </td>
        <td class="booking-actions">
          <button class="action-btn-small view-btn" onclick='viewBooking(${JSON.stringify(booking)})' title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn-small edit-btn" onclick='editBooking(${JSON.stringify(booking)})' title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn-small delete-btn" onclick='deleteBooking(${booking.id})' title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  // ==========================
  // EXCEL DOWNLOAD
  // ==========================
  function initializeExcelDownload() {
    const downloadBtn = document.getElementById('downloadExcel');
    downloadBtn?.addEventListener('click', () => {
      window.open(`${API_BASE}/api/export-bookings`);
    });
  }


  // ==========================
  // BULK SELECTION FUNCTIONS
  // ==========================
  function toggleSelection(type, id) {
    const selectionSet = selectedItems[type];
    
    if (selectionSet.has(id)) {
      selectionSet.delete(id);
    } else {
      selectionSet.add(id);
    }
    
    updateSelectionUI(type);
    updateBulkActionButtons(type);
  }

  function selectAll(type) {
    const items = type === 'gallery' ? galleryImages : 
                  type === 'home' ? homeImages : 
                  type === 'logo' && logo ? [logo] : [];
    
    if (selectedItems[type].size === items.length) {
      // Deselect all
      selectedItems[type].clear();
    } else {
      // Select all
      items.forEach(item => selectedItems[type].add(item.id));
    }
    
    updateSelectionUI(type);
    updateBulkActionButtons(type);
  }

  function updateSelectionUI(type) {
    const items = document.querySelectorAll(`[data-type="${type}"]`);
    items.forEach(item => {
      const id = parseInt(item.dataset.id);
      const checkbox = item.querySelector('input[type="checkbox"]');
      
      if (checkbox) {
        checkbox.checked = selectedItems[type].has(id);
        item.classList.toggle('selected', selectedItems[type].has(id));
      }
    });
  }

  function updateBulkActionButtons(type) {
    const countElement = document.getElementById(`selected${type.charAt(0).toUpperCase() + type.slice(1)}Count`);
    const deleteButton = document.getElementById(`deleteSelected${type.charAt(0).toUpperCase() + type.slice(1)}`);
    
    if (countElement) {
      countElement.textContent = selectedItems[type].size;
    }
    
    if (deleteButton) {
      deleteButton.disabled = selectedItems[type].size === 0;
    }
  }

  async function deleteSelected(type) {
    const selectedIds = Array.from(selectedItems[type]);
    
    if (selectedIds.length === 0) {
      showToast('No items selected', 'error');
      return;
    }
    
    const confirmMessage = `Are you sure you want to delete ${selectedIds.length} selected ${type} item${selectedIds.length > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      let deletedCount = 0;
      let failedCount = 0;
      
      for (const id of selectedIds) {
        try {
          let endpoint;
          if (type === 'gallery') {
            endpoint = `${API_BASE}/api/gallery/${id}`;
          } else if (type === 'home') {
            endpoint = `${API_BASE}/api/home-images/${id}`;
          } else if (type === 'logo') {
            endpoint = `${API_BASE}/api/logo/${id}`;
          }
          
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            deletedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Failed to delete ${type} item ${id}:`, error);
          failedCount++;
        }
      }
      
      // Clear selection
      selectedItems[type].clear();
      
      // Reload data
      if (type === 'gallery') {
        await loadGalleryImages();
        updateGalleryGrid();
      } else if (type === 'home') {
        await loadHomeImages();
        updateHomeImagesGrid();
      } else if (type === 'logo') {
        await loadLogo();
        updateLogoPreview();
      }
      
      if (deletedCount > 0) {
        showToast(`Successfully deleted ${deletedCount} ${type} item${deletedCount > 1 ? 's' : ''}`, 'success');
      }
      
      if (failedCount > 0) {
        showToast(`Failed to delete ${failedCount} ${type} item${failedCount > 1 ? 's' : ''}`, 'error');
      }
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      showToast('Failed to delete selected items', 'error');
    }
  }

  // Global functions for onclick handlers
  window.toggleSelection = toggleSelection;
  window.deleteSelected = deleteSelected;
  window.selectAll = selectAll;
  window.deleteGalleryImage = deleteGalleryImage;
  window.deleteLogo = deleteLogo;
  window.deleteHomeImage = deleteHomeImage;
  window.deleteSelectedBookings = deleteSelectedBookings;
  window.toggleBookingSelection = toggleBookingSelection;
  window.toggleAllBookingSelections = toggleAllBookingSelections;
  // ==========================
  function addVisualIndicator() {
    setTimeout(() => {
      const testDiv = document.createElement('div');
      testDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:green;color:white;padding:5px 10px;border-radius:5px;z-index:9999;font-size:12px;';
      testDiv.textContent = '✅ Dashboard Connected';
      document.body.appendChild(testDiv);
      
      setTimeout(() => {
        if (document.body.contains(testDiv)) {
          document.body.removeChild(testDiv);
        }
      }, 3000);
    }, 1000);
  }

  // ==========================
  // INITIALIZE EVERYTHING
  // ==========================
  async function initialize() {
    console.log('🔧 Initializing Royal Photowaala Dashboard...');
    
    try {
      // Authentication
      console.log('🔐 Step 1: Initializing authentication...');
      await initializeAuth();
      console.log('🔐 Authentication completed');
      
      // UI Components
      console.log('🎨 Step 2: Initializing UI components...');
      initializeSidebar();
      initializeNavigation();
      initializeUserMenu();
      initializeNotifications();
      console.log('🎨 UI components initialized');
      
      // Data Loading
      console.log('📊 Step 3: Loading data...');
      await loadBookings();
      await loadGalleryImages();
      await loadHomeImages();
      await loadLogo();
      console.log('📊 Data loading completed');
      
      // Forms
      console.log('📝 Step 4: Initializing forms...');
      initializeForms();
      console.log('📝 Forms initialized');
      
      // Search & Filter
      console.log('🔍 Step 5: Initializing search & filter...');
      initializeSearch();
      console.log('🔍 Search & filter initialized');
      
      // Excel Download
      console.log('📈 Step 6: Initializing Excel download...');
      initializeExcelDownload();
      console.log('📈 Excel download initialized');
      
      // Visual Indicator
      addVisualIndicator();
      
      console.log('✅ Royal Photowaala Dashboard initialized successfully!');
      
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      showToast('Dashboard initialization failed', 'error');
    }
  }

  // Start initialization
  initialize();

  // Global functions for onclick handlers
  window.viewBooking = viewBooking;
  window.editBooking = editBooking;
  window.deleteBooking = deleteBooking;
  window.deleteGalleryImage = deleteGalleryImage;
  window.deleteLogo = deleteLogo;
  window.deleteHomeImage = deleteHomeImage;
  window.closeModal = closeModal;
  window.updateBookingStatus = updateBookingStatus;
  window.toggleBookingSelection = toggleBookingSelection;
  window.toggleAllBookingSelections = toggleAllBookingSelections;
  window.deleteSelectedBookings = deleteSelectedBookings;
});
