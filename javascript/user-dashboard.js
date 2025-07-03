// ===== user-dashboard.js =====

// Get current username
const username = localStorage.getItem("currentUsername");
const rentalKey = `${username}_rentedCars`;
const checkedOutKey = `${username}_checkedOutCars`;

// Load rentals and checked out cars from localStorage
let rentals = JSON.parse(localStorage.getItem(rentalKey)) || [];
let checkedOutCars = JSON.parse(localStorage.getItem(checkedOutKey)) || [];

// DOM Elements
const rentalsContainer = document.getElementById("rentedCars");
const checkedOutContainer = document.getElementById("checkedOutCars");
const removeBtn = document.getElementById("removeSelected");
const checkoutBtn = document.getElementById("checkoutSelected");
const confirmCheckoutBtn = document.getElementById("confirmCheckoutBtn");

// Render rentals
function renderRentals() {
  rentalsContainer.innerHTML = "";

  if (rentals.length === 0) {
    rentalsContainer.innerHTML = '<p class="text-center text-secondary">No cars added to cart yet.</p>';
    return;
  }

  rentals.forEach((car) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm rented-car-card";
    card.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-4">
          <img src="${car.image}" class="img-fluid rounded-start" alt="${car.name}" style="height: 120px; object-fit: cover;">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title mb-0">${car.name}</h5>
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("selected");
    });

    rentalsContainer.appendChild(card);
  });
}

// Render checked out cars
function renderCheckedOut() {
  checkedOutContainer.innerHTML = "";

  if (checkedOutCars.length === 0) {
    checkedOutContainer.innerHTML = '<p class="text-center text-secondary">No checked out cars yet.</p>';
    return;
  }

  checkedOutCars.forEach((car) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm checked-out-car-card";
    card.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-4">
          <img src="${car.image}" class="img-fluid rounded-start" alt="${car.name}" style="height: 120px; object-fit: cover;">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title mb-0">${car.name}</h5>
          </div>
        </div>
      </div>
    `;

    checkedOutContainer.appendChild(card);
  });
}

// Remove Selected
removeBtn.addEventListener("click", () => {
  const selected = rentalsContainer.querySelectorAll(".selected");
  selected.forEach((card) => {
    const name = card.querySelector(".card-title").innerText;
    rentals = rentals.filter((car) => car.name !== name);
  });
  localStorage.setItem(rentalKey, JSON.stringify(rentals));
  renderRentals();
});

// Checkout Selected
checkoutBtn.addEventListener("click", () => {
  const selected = rentalsContainer.querySelectorAll(".selected");
  if (selected.length === 0) return;

  const modal = new bootstrap.Modal(document.getElementById("checkoutModal"));
  modal.show();

  confirmCheckoutBtn.onclick = () => {
    selected.forEach((card) => {
      const name = card.querySelector(".card-title").innerText;
      const car = rentals.find((c) => c.name === name);
      if (car) {
        checkedOutCars.push(car);
        rentals = rentals.filter((c) => c.name !== name);
      }
    });

    localStorage.setItem(rentalKey, JSON.stringify(rentals));
    localStorage.setItem(checkedOutKey, JSON.stringify(checkedOutCars));

    renderRentals();
    renderCheckedOut();
    modal.hide();
  };
});

// Initial Render
renderRentals();
renderCheckedOut();
