// ===== admin-dashboard.js =====

// 1. Admin Login Check
const currentUsername = localStorage.getItem("currentUsername");
if (currentUsername !== "admin") {
  window.location.href = "../user-login.html"; // Redirect non-admins
}

// 2. Load all users' carts & rentals
function loadUsersCars() {
  const table = document.getElementById("usersCarsTable");
  table.innerHTML = "";

  Object.keys(localStorage).forEach((key) => {
    if (key.endsWith("_rentedCars") || key.endsWith("_checkedOutCars")) {
      const username = key.split("_")[0];
      const cars = JSON.parse(localStorage.getItem(key));

      cars.forEach((car) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${username}</td>
          <td><img src="${car.image}" alt="${car.name}"></td>
          <td>${car.name}</td>
          <td>${key.includes("checkedOut") ? "Checked Out" : "In Cart"}</td>
        `;
        table.appendChild(tr);
      });
    }
  });
}

// 3. Load Car Listings
function loadCarListings() {
  const table = document.getElementById("carListTable");
  table.innerHTML = "";

  const carListings = JSON.parse(localStorage.getItem("carListings")) || [];
  carListings.forEach((car, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${car.image}" alt="${car.name}"></td>
      <td>${car.name}</td>
      <td>${car.type}</td>
    `;
    tr.dataset.index = index;
    table.appendChild(tr);
  });
}

// 4. Add New Car
document.getElementById("addCarForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const newCar = {
    name: form.name.value.trim(),
    image: form.image.value.trim(),
    type: form.type.value,
  };

  if (newCar.name && newCar.image && newCar.type) {
    const carListings = JSON.parse(localStorage.getItem("carListings")) || [];
    carListings.push(newCar);
    localStorage.setItem("carListings", JSON.stringify(carListings));
    loadCarListings();
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById("addCarModal")).hide();
  }
});

// 5. Logout Button
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUsername");
  window.location.href = "../user-login.html";
});

// Initial Load
loadUsersCars();
loadCarListings();
