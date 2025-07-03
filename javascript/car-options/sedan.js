// ===== sedan.js =====

const sedanCars = [
  {
    name: "Nissan Versa",
    image: "../../assets/car-options/sedan/nissan-versa.avif",
  },
  {
    name: "Mazda Miata",
    image: "../../assets/car-options/sedan/mazda-miata.avif",
  },
  {
    name: "Mitsubishi Mirage",
    image: "../../assets/car-options/sedan/mitsubishi-mirage.avif",
  },
  {
    name: "Chevrolet Malibu",
    image: "../../assets/car-options/sedan/chevrolet-malibu.avif",
  },
];

let selectedCar = null;

document.querySelectorAll("[data-bs-toggle='modal']").forEach((button) => {
  button.addEventListener("click", () => {
    const carData = JSON.parse(button.getAttribute("data-car"));
    selectedCar = carData;
    document.getElementById("modalCarName").innerText = carData.name;
  });
});

const rentButton = document.getElementById("rentButton");
if (rentButton) {
  rentButton.addEventListener("click", () => {
    if (!selectedCar) return;

    const username = localStorage.getItem("currentUsername");
    if (username) {
      const rentalKey = `${username}_rentedCars`;
      const existingRentals = JSON.parse(localStorage.getItem(rentalKey)) || [];
      existingRentals.push(selectedCar);
      localStorage.setItem(rentalKey, JSON.stringify(existingRentals));
    }

    const rentSuccess = document.getElementById("rentSuccess");
    rentSuccess.innerText = `Successfully rented ${selectedCar.name}!`;
    rentSuccess.classList.remove("d-none");

    setTimeout(() => {
      window.location.href = "../user-dashboard.html";
    }, 1500);
  });
}
