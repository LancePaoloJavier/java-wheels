// ====== LOGIN.JS (UPDATED WITH BACKEND API INTEGRATION) ======

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Utility function for making API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

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
  signUpForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    resetFeedback(signUpForm);

    const username = document.querySelector("#signUpUsername");
    const email = document.querySelector("#signUpEmail");
    const password = document.querySelector("#signUpPassword");
    const button = signUpForm.querySelector("button[type='submit']");

    if (!username.value || !email.value || !password.value) {
      if (!username.value) showError(username, "Username required");
      if (!email.value) showError(email, "Email required");
      if (!password.value) showError(password, "Password required");
      return;
    }

    try {
      button.disabled = true;
      button.innerText = "Creating account...";

      const userData = {
        username: username.value,
        email: email.value,
        password: password.value,
        firstName: '', // You can add these fields to the form if needed
        lastName: '',
        contactNumber: ''
      };

      await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      button.classList.add("btn-success");
      button.innerText = "Account created! Redirecting...";

      setTimeout(() => {
        window.location.href = "/user-login";
      }, 1000);

    } catch (error) {
      button.disabled = false;
      button.innerText = "Sign Up";
      
      if (error.message.includes('email') || error.message.includes('username')) {
        if (error.message.includes('email')) {
          showError(email, "Email already registered");
        }
        if (error.message.includes('username')) {
          showError(username, "Username already taken");
        }
      } else {
        showError(email, "Registration failed");
        showError(password, "Please try again");
      }
    }
  });
}

// -------- USER LOGIN --------
const userLoginForm = document.querySelector("#userLoginForm");
if (userLoginForm) {
  userLoginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    resetFeedback(userLoginForm);

    const email = document.querySelector("#loginEmail");
    const password = document.querySelector("#loginPassword");
    const button = userLoginForm.querySelector("button[type='submit']");

    try {
      button.disabled = true;
      button.innerText = "Logging in...";

      const loginData = {
        email: email.value,
        password: password.value,
        isAdmin: false
      };

      const response = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      button.classList.add("btn-success");
      button.innerText = "Login successful! Redirecting...";

      setTimeout(() => {
        window.location.href = response.redirectUrl || "/user-dashboard";
      }, 1000);

    } catch (error) {
      button.disabled = false;
      button.innerText = "Login";
      showError(email, "Invalid email");
      showError(password, "Invalid password");
    }
  });
}

// -------- ADMIN LOGIN --------
const adminLoginForm = document.querySelector("#adminLoginForm");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    resetFeedback(adminLoginForm);

    const email = document.querySelector("#adminEmail");
    const password = document.querySelector("#adminPassword");
    const button = adminLoginForm.querySelector("button[type='submit']");

    try {
      button.disabled = true;
      button.innerText = "Logging in...";

      const loginData = {
        email: email.value,
        password: password.value,
        isAdmin: true
      };

      const response = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      button.classList.add("btn-success");
      button.innerText = "Admin login successful! Redirecting...";

      setTimeout(() => {
        window.location.href = response.redirectUrl || "/admin-dashboard";
      }, 1000);

    } catch (error) {
      button.disabled = false;
      button.innerText = "Login";
      showError(email, "Invalid admin credentials");
      showError(password, "Invalid password");
    }
  });
}

// -------- LOGOUT BUTTON --------
const logoutBtn = document.querySelector("#logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await apiRequest('/logout', { method: 'POST' });

      const toastEl = document.getElementById("logoutToast");
      if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (error) {
      console.error('Logout error:', error);
      // Fallback - redirect anyway
      window.location.href = "/";
    }
  });
}

// -------- CHECK USER SESSION AND UPDATE NAVBAR --------
document.addEventListener("DOMContentLoaded", async () => {
  const navContainer = document.querySelector("#navControlContainer");
  const logoutBtn = document.querySelector("#logoutBtn");
  const loginBtn = document.querySelector("a[href$='user-login.html'], a[href='/user-login']");
  const signUpBtn = document.querySelector("a[href$='sign-up.html'], a[href='/sign-up']");

  try {
    // Check if user is logged in
    const response = await apiRequest('/user');
    const user = response.user;

    if (navContainer) {
      navContainer.innerHTML = "";

      if (user.isAdmin) {
        navContainer.innerHTML = `
          <a href="/admin-dashboard" class="btn btn-warning me-2">
            <i class="bi bi-shield-lock-fill me-1"></i> Admin Dashboard
          </a>
        `;
      } else {
        navContainer.innerHTML = `
          <a href="/user-dashboard" class="btn btn-primary me-2">
            <i class="bi bi-person-circle me-1"></i> ${user.username}'s Profile
          </a>
        `;
      }
    }

    if (logoutBtn) {
      logoutBtn.classList.remove("d-none");
      if (loginBtn) loginBtn.classList.add("d-none");
      if (signUpBtn) signUpBtn.classList.add("d-none");
    }

  } catch (error) {
    // User not logged in
    if (logoutBtn) {
      logoutBtn.classList.add("d-none");
      if (loginBtn) loginBtn.classList.remove("d-none");
      if (signUpBtn) signUpBtn.classList.remove("d-none");
    }
  }
});

// -------- UTILITY FUNCTIONS --------
async function getCurrentUser() {
  try {
    const response = await apiRequest('/user');
    return response.user;
  } catch (error) {
    return null;
  }
}

async function isUserLoggedIn() {
  const user = await getCurrentUser();
  return user !== null;
}

async function isAdminLoggedIn() {
  const user = await getCurrentUser();
  return user && user.isAdmin;
}

// Export for use in other scripts
window.sakayaAPI = {
  apiRequest,
  getCurrentUser,
  isUserLoggedIn,
  isAdminLoggedIn
};