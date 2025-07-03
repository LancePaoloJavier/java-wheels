// ===== suvs.js =====

const suvCars = [
  {
    name: "Kia Niro",
    image: "../../assets/car-options/suvs/kia-niro.avif",
  },
  {
    name: "Jeep Wrangler",
    image: "../../assets/car-options/suvs/jeep-wrangler.avif",
  },
  {
    name: "Hyundai Kona",
    image: "../../assets/car-options/suvs/hyundai-kona.avif",
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
