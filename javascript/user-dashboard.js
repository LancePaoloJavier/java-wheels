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

// Render rentals
function renderRentals() {
  rentalsContainer.innerHTML = "";

  if (rentals.length === 0) {
    rentalsContainer.innerHTML = '<p class="text-center text-secondary">No cars rented yet.</p>';
    return;
  }

  rentals.forEach((car, index) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";
    card.style.cursor = "pointer";

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
      card.classList.toggle("border-primary");
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

  checkedOutCars.forEach((car, index) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm bg-light border border-2 border-success";
    card.style.opacity = "0.9";

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

// Remove selected rentals
removeBtn.addEventListener("click", () => {
  const selectedCards = rentalsContainer.querySelectorAll(".selected");
  if (selectedCards.length === 0) return;

  selectedCards.forEach((card) => {
    const name = card.querySelector(".card-title").innerText;
    rentals = rentals.filter((car) => car.name !== name);
  });

  localStorage.setItem(rentalKey, JSON.stringify(rentals));
  renderRentals();
});

// Checkout selected rentals
checkoutBtn.addEventListener("click", () => {
  const selectedCards = rentalsContainer.querySelectorAll(".selected");
  if (selectedCards.length === 0) return;

  // Show checkout modal
  const checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
  const paymentContainer = document.getElementById("paymentOptions");
  paymentContainer.innerHTML = `
    <div class="form-check">
      <input class="form-check-input" type="radio" name="payment" id="creditCard" value="Credit Card" checked>
      <label class="form-check-label" for="creditCard">
        <i class="bi bi-credit-card me-2"></i>Credit Card
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="payment" id="paypal" value="PayPal">
      <label class="form-check-label" for="paypal">
        <i class="bi bi-paypal me-2"></i>PayPal
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="payment" id="cash" value="Cash">
      <label class="form-check-label" for="cash">
        <i class="bi bi-cash-stack me-2"></i>Cash
      </label>
    </div>
  `;
  checkoutModal.show();

  // Confirm checkout button inside modal
  document.getElementById("confirmCheckout").onclick = () => {
    selectedCards.forEach((card) => {
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
    checkoutModal.hide();
  };
});

// Initial render
renderRentals();
renderCheckedOut();
