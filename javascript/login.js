// ====== LOGIN.JS ======

// Default placeholder credentials
const defaultUser = {
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
  button.innerText = "Login";
}

// -------- SIGN-UP --------
const signUpForm = document.querySelector("#signUpForm");
if (signUpForm) {
  signUpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    resetFeedback(signUpForm);

    const email = document.querySelector("#signUpEmail");
    const password = document.querySelector("#signUpPassword");

    if (!email.value || !password.value) {
      if (!email.value) showError(email, "Email required");
      if (!password.value) showError(password, "Password required");
      return;
    }

    const userData = { email: email.value, password: password.value };
    localStorage.setItem("registeredUser", JSON.stringify(userData));

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
