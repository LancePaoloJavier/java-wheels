// ===== admin-dashboard.js =====

// Load cars from localStorage or set defaults
function loadCars(category) {
  return JSON.parse(localStorage.getItem(`${category}Cars`)) || [];
}

function saveCars(category, cars) {
  localStorage.setItem(`${category}Cars`, JSON.stringify(cars));
}

// Render cars in table
function renderCarTable(category, container) {
  const cars = loadCars(category);
  container.innerHTML = "";

  cars.forEach((car, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${car.name}</td>
      <td><img src="${car.image}" alt="${car.name}" style="width: 100px;"></td>
      <td>
        <button class="btn btn-danger btn-sm" data-index="${index}" data-category="${category}">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>
    `;
    container.appendChild(row);
  });
}

// Render all categories
function renderAllCategories() {
  renderCarTable("sedan", document.querySelector("#sedanTableBody"));
  renderCarTable("suv", document.querySelector("#suvTableBody"));
  renderCarTable("van", document.querySelector("#vanTableBody"));
}

renderAllCategories();

// Delete car
document.addEventListener("click", (e) => {
  if (e.target.closest(".btn-danger")) {
    const button = e.target.closest(".btn-danger");
    const index = parseInt(button.dataset.index);
    const category = button.dataset.category;
    const cars = loadCars(category);
    cars.splice(index, 1);
    saveCars(category, cars);
    renderAllCategories();
  }
});

// Add new car
document.querySelector("#addCarForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const category = document.querySelector("#carCategory").value;
  const name = document.querySelector("#carName").value;
  const image = document.querySelector("#carImage").value;

  const cars = loadCars(category);
  cars.push({ name, image });
  saveCars(category, cars);
  renderAllCategories();

  e.target.reset();
});

// Render user carts
function renderUserCarts() {
  const userCartsContainer = document.querySelector("#userCartsContainer");
  userCartsContainer.innerHTML = "";

  for (let key in localStorage) {
    if (key.endsWith("_rentedCars")) {
      const username = key.replace("_rentedCars", "");
      const cars = JSON.parse(localStorage.getItem(key));

      const section = document.createElement("div");
      section.className = "mb-4";
      section.innerHTML = `<h5>${username}'s Cart</h5>`;

      if (cars.length === 0) {
        section.innerHTML += `<p>No cars in cart.</p>`;
      } else {
        const list = document.createElement("ul");
        cars.forEach((car) => {
          const item = document.createElement("li");
          item.textContent = car.name;
          list.appendChild(item);
        });
        section.appendChild(list);
      }

      userCartsContainer.appendChild(section);
    }
  }
}

renderUserCarts();
