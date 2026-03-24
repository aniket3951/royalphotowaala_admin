/**
 * Royal Photowaala - Booking Form JavaScript
 * Clean booking submission with duplicate prevention
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bookingForm");
  let isSubmitting = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    isSubmitting = true;

    const submitBtn = form.querySelector("button");

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      package: document.getElementById("package").value,
      date: document.getElementById("date").value,
      details: document.getElementById("details").value.trim()
    };

    try {
      submitBtn.disabled = true;
      submitBtn.innerText = "Processing...";

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Booking failed");
        return;
      }

      // WhatsApp directly opens
      const msg = `New Booking:
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Package: ${formData.package}
Date: ${formData.date}
Details: ${formData.details}

📸 Royal Photowaala - Photography Services 📸`;

      const waLink = `https://wa.me/919307922203?text=${encodeURIComponent(msg)}`;

      setTimeout(() => {
        window.open(waLink, "_blank");
      }, 300);

      // Show success message
      showSuccessModal(formData);

      form.reset();

    } catch (err) {
      console.error("Booking error:", err);
      alert("Server error. Please try again.");
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Booking";
    }
  });

  // Form validation
  function validateForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const package = document.getElementById("package").value;
    const date = document.getElementById("date").value;

    if (!name || !email || !phone || !package || !date) {
      alert("Please fill in all required fields");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  }

  // Success modal
  function showSuccessModal(formData) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h3>Booking Successful!</h3>
        <p>Thank you ${formData.name} for choosing Royal Photowaala!</p>
        
        <div class="booking-details">
          <h4>Booking Details:</h4>
          <p><strong>Package:</strong> ${formData.package}</p>
          <p><strong>Date:</strong> ${formData.date}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
        </div>
        
        <div class="next-steps">
          <h4>What happens next?</h4>
          <ol>
            <li>Check WhatsApp for your booking confirmation</li>
            <li>We'll call you within 24 hours to discuss details</li>
            <li>Pay 30% advance to confirm your booking</li>
            <li>Get ready for your special day!</li>
          </ol>
        </div>
        
        <div class="success-actions">
          <button onclick="this.closest('.success-modal').remove()" class="btn-secondary">Close</button>
          <a href="index.html" class="btn">Back to Home</a>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles if not already present
    if (!document.querySelector('#success-modal-styles')) {
      const styles = document.createElement('style');
      styles.id = 'success-modal-styles';
      styles.textContent = `
        .success-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .success-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          text-align: center;
        }
        .success-icon {
          font-size: 3rem;
          color: #4CAF50;
          margin-bottom: 1rem;
        }
        .booking-details, .next-steps {
          text-align: left;
          margin: 1.5rem 0;
        }
        .success-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  // Add form validation on submit
  form.addEventListener("submit", (e) => {
    if (!validateForm()) {
      e.preventDefault();
      return false;
    }
  });
});
