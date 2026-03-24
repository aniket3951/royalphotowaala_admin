let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
let images = JSON.parse(localStorage.getItem("images")) || [];

/* Switch Tabs */
function switchTab(tab) {
    document.querySelectorAll(".section").forEach(sec => {
        sec.classList.remove("active");
    });

    document.getElementById(tab).classList.add("active");
    document.getElementById("pageTitle").innerText = tab.toUpperCase();

    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
    });

    event.target.classList.add("active");
}

/* Add Booking */
function addBooking(name, phone, pkg, date) {
    bookings.push({ name, phone, pkg, date });
    localStorage.setItem("bookings", JSON.stringify(bookings));
    renderBookings();
}

/* Render Bookings */
function renderBookings() {
    let table = document.getElementById("bookingTable");
    table.innerHTML = "";

    bookings.forEach(b => {
        table.innerHTML += `
        <tr>
            <td>${b.name}</td>
            <td>${b.phone}</td>
            <td>${b.pkg}</td>
            <td>${b.date}</td>
        </tr>`;
    });

    document.getElementById("totalBookings").innerText = bookings.length;
    document.getElementById("pending").innerText = bookings.length;
    document.getElementById("revenue").innerText = bookings.length * 5000;
}

/* Upload Image */
function uploadImage() {
    let file = document.getElementById("imageInput").files[0];

    if (!file) {
        alert("Select image first!");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
        images.push(e.target.result);
        localStorage.setItem("images", JSON.stringify(images));
        renderGallery();
    };
    reader.readAsDataURL(file);
}

/* Render Gallery */
function renderGallery() {
    let grid = document.getElementById("galleryGrid");
    grid.innerHTML = "";

    images.forEach(img => {
        grid.innerHTML += `<img src="${img}">`;
    });
}

/* Initial Load */
renderBookings();
renderGallery();

/* Demo Data */
if (bookings.length === 0) {
    addBooking("Aniket", "9307922203", "Candid", "2026-03-26");
    addBooking("Rahul", "9876543210", "Wedding", "2026-04-02");
}
