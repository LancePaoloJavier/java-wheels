// ===== user-dashboard.js (UPDATED WITH BACKEND API INTEGRATION) =====

// Use the API utilities from login.js
const { apiRequest, getCurrentUser } = window.sakayaAPI || {};

// DOM Elements
const rentalsContainer = document.getElementById("rentedCars");
const checkedOutContainer = document.getElementById("checkedOutCars");
const removeBtn = document.getElementById("removeSelected");
const undoBtn = document.getElementById("undoBtn");
const checkoutBtn = document.getElementById("checkoutSelected");
const cancelCheckoutBtn = document.getElementById("cancelCheckoutBtn");
const confirmCheckoutBtn = document.getElementById("confirmCheckoutBtn");
const userGreeting = document.getElementById("userGreeting");

// Global variables
let cartItems = [];
let rentals = [];
let selectedCartItems = new Set();
let selectedRentals = new Set();
let lastRemovedItems = [];

// Initialize dashboard
async function initializeDashboard() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/user-login';
            return;
        }

        if (userGreeting) {
            userGreeting.textContent = `Welcome back, ${user.username}!`;
        }

        await loadCartItems();
        await loadRentals();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showToast('Error loading dashboard', 'error');
    }
}

// Load cart items from backend
async function loadCartItems() {
    try {
        cartItems = await apiRequest('/cart');
        renderCartItems();
    } catch (error) {
        console.error('Error loading cart:', error);
        cartItems = [];
        renderCartItems();
    }
}

// Load rentals from backend
async function loadRentals() {
    try {
        rentals = await apiRequest('/rentals');
        renderRentals();
    } catch (error) {
        console.error('Error loading rentals:', error);
        rentals = [];
        renderRentals();
    }
}

// Render cart items
function renderCartItems() {
    rentalsContainer.innerHTML = "";
    selectedCartItems.clear();

    if (cartItems.length === 0) {
        rentalsContainer.innerHTML = '<div class="col-12"><p class="text-center text-secondary">No cars added to cart yet.</p></div>';
        updateButtonStates();
        return;
    }

    cartItems.forEach((item) => {
        const card = createCarCard(item, 'cart');
        rentalsContainer.appendChild(card);
    });

    updateButtonStates();
}

// Render rentals
function renderRentals() {
    checkedOutContainer.innerHTML = "";
    selectedRentals.clear();

    if (rentals.length === 0) {
        checkedOutContainer.innerHTML = '<div class="col-12"><p class="text-center text-secondary">No rented cars yet.</p></div>';
        return;
    }

    rentals.forEach((rental) => {
        const card = createCarCard(rental, 'rental');
        checkedOutContainer.appendChild(card);
    });
}

// Create car card element
function createCarCard(item, type) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "col-md-6 col-lg-4";

    const isRental = type === 'rental';
    const cardClass = isRental ? 'checked-out-car-card' : 'rented-car-card';
    const cardId = isRental ? item.rental_id : item.cart_id;

    cardDiv.innerHTML = `
        <div class="card mb-3 shadow-sm ${cardClass}" data-id="${cardId}" data-type="${type}">
            <div class="row g-0 align-items-center">
                <div class="col-md-4">
                    <img src="${item.image_url}" class="img-fluid rounded-start" alt="${item.name}" style="height: 120px; object-fit: cover; width: 100%;">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title mb-1">${item.name}</h5>
                        <p class="card-text text-muted mb-1">${item.car_type}</p>
                        ${isRental ? `
                            <small class="text-success">
                                <i class="bi bi-check-circle-fill me-1"></i>
                                Status: ${item.status}
                            </small>
                            <br>
                            <small class="text-muted">
                                Rented: ${new Date(item.created_at).toLocaleDateString()}
                            </small>
                            ${item.total_price ? `<br><small class="text-muted">Total: $${item.total_price}</small>` : ''}
                        ` : `
                            <small class="text-primary">
                                <i class="bi bi-cart-fill me-1"></i>
                                In Cart
                            </small>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add click handler for selection
    const cardElement = cardDiv.querySelector('.card');
    cardElement.addEventListener("click", () => {
        cardElement.classList.toggle("selected");
        
        if (isRental) {
            if (selectedRentals.has(cardId)) {
                selectedRentals.delete(cardId);
            } else {
                selectedRentals.add(cardId);
            }
        } else {
            if (selectedCartItems.has(cardId)) {
                selectedCartItems.delete(cardId);
            } else {
                selectedCartItems.add(cardId);
            }
            updateButtonStates();
        }
    });

    return cardDiv;
}

// Update button states
function updateButtonStates() {
    const hasSelectedCart = selectedCartItems.size > 0;
    const hasSelectedRentals = selectedRentals.size > 0;
    
    removeBtn.disabled = !hasSelectedCart;
    checkoutBtn.disabled = !hasSelectedCart;
    undoBtn.disabled = lastRemovedItems.length === 0;
    cancelCheckoutBtn.disabled = !hasSelectedRentals;
}

// Remove selected items from cart
removeBtn.addEventListener("click", async () => {
    if (selectedCartItems.size === 0) return;

    try {
        const itemsToRemove = Array.from(selectedCartItems);
        lastRemovedItems = itemsToRemove.map(cartId => 
            cartItems.find(item => item.cart_id === cartId)
        ).filter(Boolean);

        for (const cartId of itemsToRemove) {
            await apiRequest(`/cart/${cartId}`, { method: 'DELETE' });
        }

        await loadCartItems();
        showToast('Selected cars removed from cart', 'success');
        
    } catch (error) {
        console.error('Error removing items:', error);
        showToast('Failed to remove cars from cart', 'error');
    }
});

// Undo last removal
undoBtn.addEventListener("click", async () => {
    if (lastRemovedItems.length === 0) return;

    try {
        for (const item of lastRemovedItems) {
            await apiRequest('/cart', {
                method: 'POST',
                body: JSON.stringify({ car_id: item.car_id })
            });
        }

        lastRemovedItems = [];
        await loadCartItems();
        showToast('Items restored to cart', 'success');
        
    } catch (error) {
        console.error('Error restoring items:', error);
        showToast('Failed to restore items', 'error');
    }
});

// Checkout selected items
checkoutBtn.addEventListener("click", () => {
    if (selectedCartItems.size === 0) return;

    const modal = new bootstrap.Modal(document.getElementById("checkoutModal"));
    modal.show();
});

// Confirm checkout
if (confirmCheckoutBtn) {
    confirmCheckoutBtn.addEventListener("click", async () => {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        
        if (!paymentMethod) {
            showToast('Please select a payment method', 'warning');
            return;
        }

        try {
            confirmCheckoutBtn.disabled = true;
            confirmCheckoutBtn.textContent = 'Processing...';

            const checkoutData = {
                cart_ids: Array.from(selectedCartItems),
                payment_method: paymentMethod.value,
                start_date: new Date().toISOString().split('T')[0], // Today
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +7 days
            };

            await apiRequest('/checkout', {
                method: 'POST',
                body: JSON.stringify(checkoutData)
            });

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"));
            modal.hide();

            // Reload data
            await loadCartItems();
            await loadRentals();

            showToast('Checkout successful!', 'success');

        } catch (error) {
            console.error('Error during checkout:', error);
            showToast('Checkout failed. Please try again.', 'error');
        } finally {
            confirmCheckoutBtn.disabled = false;
            confirmCheckoutBtn.textContent = 'Confirm Checkout';
        }
    });
}

// Cancel checkout (for demonstration - in real app might be "return car")
cancelCheckoutBtn.addEventListener("click", async () => {
    if (selectedRentals.size === 0) return;

    try {
        // For now, just show a message since cancelling rentals requires more complex logic
        showToast('Cancel rental feature coming soon', 'info');
        
    } catch (error) {
        console.error('Error cancelling rental:', error);
        showToast('Failed to cancel rental', 'error');
    }
});

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';

    const toastHtml = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);