// ====== ADMIN-DASHBOARD.JS ======

let rentedCars = [];
let removedCar = null;

const carInput = document.getElementById("carInput");
const addCarBtn = document.getElementById("addCarBtn");
const removeCarBtn = document.getElementById("removeCarBtn");
const undoCarBtn = document.getElementById("undoCarBtn");
const rentedCarsList = document.getElementById("rentedCarsList");

function renderCars() {
  rentedCarsList.innerHTML = "";
  rentedCars.forEach((car, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action";
    li.textContent = car;
    li.dataset.index = index;
    li.addEventListener("click", () => {
      li.classList.toggle("active");
    });
    rentedCarsList.appendChild(li);
  });
}

addCarBtn.addEventListener("click", () => {
  const value = carInput.value.trim();
  if (value) {
    rentedCars.push(value);
    carInput.value = "";
    renderCars();
  }
});

removeCarBtn.addEventListener("click", () => {
  const selected = document.querySelector(".list-group-item.active");
  if (selected) {
    const index = parseInt(selected.dataset.index);
    removedCar = rentedCars.splice(index, 1)[0];
    renderCars();
  }
});

undoCarBtn.addEventListener("click", () => {
  if (removedCar) {
    rentedCars.push(removedCar);
    removedCar = null;
    renderCars();
  }
});
