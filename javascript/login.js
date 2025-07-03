// ====== LOGIN.JS (FIXED & IMPROVED) ======

// Default placeholder credentials
const defaultUser = {
  username: "defaultuser",
  email: "user@example.com",
  password: "user123"
};

const adminUser = {
  email: "admin@example.com",
  password: "admin123"
};

// Utility function for error feedback
function showError(inputElement, message) {
  inputElement.classList.add("is-invalid");
  inputElement.placeholder = message;
  inputElement.value = "";

  const form = inputElement.closest("form");
  const button = form.querySelector("button[type='submit']");
  button.classList.add("shake", "btn-danger");
  setTimeout(() => {
    button.classList.remove("shake");
  }, 500);
}

// Reset form feedback
function resetFeedback(form) {
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.classList.remove("is-invalid");
  });

  const button = form.querySelector("button[type='submit']");
  button.classList.remove("btn-danger", "btn-success");
  button.innerText = button.innerText.includes("Sign Up") ? "Sign Up" : "Login";
}

// -------- SIGN-UP --------
const signUpForm = document.querySelector("#signUpForm");
if (signUpForm) {
  signUpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    resetFeedback(signUpForm);

    const username = document.querySelector("#signUpUsername");
    const email = document.querySelector("#signUpEmail");
    const password = document.querySelector("#signUpPassword");

    if (!username.value || !email.value || !password.value) {
      if (!username.value) showError(username, "Username required");
      if (!email.value) showError(email, "Email required");
      if (!password.value) showError(password, "Password required");
      return;
    }

    const existingUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (existingUser) {
      if (existingUser.username === username.value) {
        showError(username, "Username already taken");
        return;
      }
      if (existingUser.email === email.value) {
        showError(email, "Email already registered");
        return;
      }
    }

    if (username.value === defaultUser.username) {
      showError(username, "Username already taken");
      return;
    }
    if (email.value === defaultUser.email) {
      showError(email, "Email already registered");
      return;
    }

    const userData = { username: username.value, email: email.value, password: password.value };
    localStorage.setItem("registeredUser", JSON.stringify(userData));
    localStorage.setItem("loggedInUser", "true");
    localStorage.setItem("currentUsername", username.value);

    const button = signUpForm.querySelector("button[type='submit']");
    button.classList.add("btn-success");
    button.innerText = "Account created! Redirecting...";

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  });
}

// -------- USER LOGIN --------
const userLoginForm = document.querySelector("#userLoginForm");
if (userLoginForm) {
  userLoginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    resetFeedback(userLoginForm);

    const email = document.querySelector("#loginEmail");
    const password = document.querySelector("#loginPassword");
    const button = userLoginForm.querySelector("button[type='submit']");

    const savedUser = JSON.parse(localStorage.getItem("registeredUser"));

    const validLogin =
      (savedUser && email.value === savedUser.email && password.value === savedUser.password) ||
      (email.value === defaultUser.email && password.value === defaultUser.password);

    if (validLogin) {
      localStorage.setItem("loggedInUser", "true");

      if (savedUser && email.value === savedUser.email) {
        localStorage.setItem("currentUsername", savedUser.username);
      } else if (email.value === defaultUser.email) {
        localStorage.setItem("currentUsername", defaultUser.username);
      }

      button.classList.add("btn-success");
      button.innerText = "Login successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    } else {
      showError(email, "Invalid email");
      showError(password, "Invalid password");
    }
  });
}

// -------- ADMIN LOGIN --------
const adminLoginForm = document.querySelector("#adminLoginForm");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    resetFeedback(adminLoginForm);

    const email = document.querySelector("#adminEmail");
    const password = document.querySelector("#adminPassword");
    const button = adminLoginForm.querySelector("button[type='submit']");

    if (email.value === adminUser.email && password.value === adminUser.password) {
      localStorage.setItem("loggedInAdmin", "true");
      button.classList.add("btn-success");
      button.innerText = "Admin login successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "../html/admin-dashboard.html";
      }, 1000);
    } else {
      showError(email, "Invalid admin email");
      showError(password, "Invalid password");
    }
  });
}

// -------- LOGOUT BUTTON --------
const logoutBtn = document.querySelector("#logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInAdmin");
    localStorage.removeItem("currentUsername");

    const toastEl = document.getElementById("logoutToast");
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  });
}

// -------- SHOW/HIDE HEADER BUTTONS BASED ON LOGIN --------
document.addEventListener("DOMContentLoaded", () => {
  const navContainer = document.querySelector("#navControlContainer");
  const logoutBtn = document.querySelector("#logoutBtn");
  const loginBtn = document.querySelector("a[href$='user-login.html']");
  const signUpBtn = document.querySelector("a[href$='sign-up.html']");

  const isUserLoggedIn = localStorage.getItem("loggedInUser") === "true";
  const isAdminLoggedIn = localStorage.getItem("loggedInAdmin") === "true";
  const username = localStorage.getItem("currentUsername");

  const currentPageDepth = window.location.pathname.split("/").length - 1;
  const basePath = currentPageDepth >= 4 ? "../../.." : currentPageDepth >= 3 ? "../.." : "..";

  if (navContainer) {
    navContainer.innerHTML = "";

    if (isAdminLoggedIn) {
      navContainer.innerHTML = `
        <a href="${basePath}/html/admin-dashboard.html" class="btn btn-warning me-2">
          <i class="bi bi-shield-lock-fill me-1"></i> Admin Dashboard
        </a>
      `;
    } else if (isUserLoggedIn) {
      navContainer.innerHTML = `
        <a href="${basePath}/html/user-dashboard.html" class="btn btn-primary me-2">
          <i class="bi bi-person-circle me-1"></i> ${username}'s Profile
        </a>
      `;
    }
  }

  if (logoutBtn) {
    if (isUserLoggedIn || isAdminLoggedIn) {
      logoutBtn.classList.remove("d-none");
      if (loginBtn) loginBtn.classList.add("d-none");
      if (signUpBtn) signUpBtn.classList.add("d-none");
    } else {
      logoutBtn.classList.add("d-none");
      if (loginBtn) loginBtn.classList.remove("d-none");
      if (signUpBtn) signUpBtn.classList.remove("d-none");
    }
  }
});

// -------- UTILITY FUNCTIONS --------
function getCurrentUsername() {
  return localStorage.getItem("currentUsername") || "User";
}

function isUserLoggedIn() {
  return localStorage.getItem("loggedInUser") === "true";
}

function isAdminLoggedIn() {
  return localStorage.getItem("loggedInAdmin") === "true";
}
