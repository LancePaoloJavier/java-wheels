// ===== Admin Dashboard JS =====

// ✅ Redirect Non-Admins
if (localStorage.getItem("loggedInAdmin") !== "true") {
  window.location.href = "/index.html";
}

// Dummy: Example user list (replace with your own user management later)
const userList = JSON.parse(localStorage.getItem("userList")) || ["defaultuser"];

// ✅ Render Users’ Cart & Rentals
function loadUserRentals() {
  const usersTable = document.getElementById("usersTableBody");
  usersTable.innerHTML = "";

  userList.forEach((username) => {
    const rentalKey = `${username}_rentedCars`;
    const rentals = JSON.parse(localStorage.getItem(rentalKey)) || [];

    rentals.forEach((car) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${username}</td>
        <td><img src="${car.image}" alt="${car.name}" width="80" /></td>
        <td>${car.name}</td>
      `;
      usersTable.appendChild(row);
    });
  });
}

// ✅ Render Car Management Table (Placeholder cars for now)
let carInventory = JSON.parse(localStorage.getItem("carInventory")) || [
  {
    name: "Mazda Miata",
    image: "../../assets/car-options/sedan/mazda-miata.avif",
    type: "Sedan"
  },
  {
    name: "Chevrolet Malibu",
    image: "../../assets/car-options/sedan/chevrolet-malibu.avif",
    type: "Sedan"
  }
];

function loadCarInventory() {
  const carsTable = document.getElementById("carsTableBody");
  carsTable.innerHTML = "";

  carInventory.forEach((car, index) => {
    const row = document.createElement("tr");
    row.dataset.index = index;
    row.innerHTML = `
      <td><img src="${car.image}" alt="${car.name}" width="80" /></td>
      <td>${car.name}</td>
      <td>${car.type}</td>
    `;
    row.addEventListener("click", () => {
      document.getElementById("updateCarBtn").disabled = false;
      document.getElementById("deleteCarBtn").disabled = false;
      document.querySelectorAll("#carsTableBody tr").forEach(r => r.classList.remove("table-primary"));
      row.classList.add("table-primary");
      selectedCarIndex = index;
    });

    carsTable.appendChild(row);
  });
}

let selectedCarIndex = null;

// ✅ Delete Car
document.getElementById("deleteCarBtn").addEventListener("click", () => {
  if (selectedCarIndex !== null) {
    carInventory.splice(selectedCarIndex, 1);
    localStorage.setItem("carInventory", JSON.stringify(carInventory));
    loadCarInventory();
    selectedCarIndex = null;
    document.getElementById("updateCarBtn").disabled = true;
    document.getElementById("deleteCarBtn").disabled = true;
  }
});

// ✅ Add New Car
document.getElementById("addCarForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const newCar = {
    name: e.target.name.value,
    image: e.target.image.value,
    type: e.target.type.value
  };

  carInventory.push(newCar);
  localStorage.setItem("carInventory", JSON.stringify(carInventory));
  loadCarInventory();
  bootstrap.Modal.getInstance(document.getElementById("addCarModal")).hide();
  e.target.reset();
});

// ✅ Initialize Tables
loadUserRentals();
loadCarInventory();
