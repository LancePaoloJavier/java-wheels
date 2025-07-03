// ===== vans.js =====

const vanCars = [
  {
    name: "Ford Transit Wagon",
    image: "../../assets/car-options/vans/ford-transit-wagon.avif",
  },
  {
    name: "Chevy Express",
    image: "../../assets/car-options/vans/chevy-express.avif",
  },
  {
    name: "Chevrolet Express",
    image: "../../assets/car-options/vans/chevrolet-express.avif",
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
    rentSuccess.innerText = `Successfully added to cart ${selectedCar.name}!`;
    rentSuccess.classList.remove("d-none");

    setTimeout(() => {
      window.location.href = "../user-dashboard.html";
    }, 1500);
  });
}
