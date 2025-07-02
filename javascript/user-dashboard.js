// ====== USER DASHBOARD JS ======

document.addEventListener("DOMContentLoaded", () => {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const username = localStorage.getItem("currentUsername") || "User";
  usernameDisplay.textContent = username;

  const cards = document.querySelectorAll(".car-card");
  let selectedCard = null;
  let lastRemoved = null;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (selectedCard) {
        selectedCard.classList.remove("border", "border-primary", "shadow");
      }
      selectedCard = card;
      selectedCard.classList.add("border", "border-primary", "shadow");
    });
  });

  document.getElementById("removeBtn").addEventListener("click", () => {
    if (selectedCard) {
      lastRemoved = selectedCard;
      selectedCard.style.display = "none";
      selectedCard = null;
    }
  });

  document.getElementById("undoBtn").addEventListener("click", () => {
    if (lastRemoved) {
      lastRemoved.style.display = "block";
      lastRemoved = null;
    }
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    alert("Proceeding to checkout with your selected cars.");
  });

  document.getElementById("addBtn").addEventListener("click", () => {
    alert("Feature coming soon: Add more cars to your rental.");
  });
});
