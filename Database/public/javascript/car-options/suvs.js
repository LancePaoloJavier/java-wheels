// ===== suvs.js (UPDATED WITH BACKEND API INTEGRATION) =====

// Use the API utilities from login.js
const { apiRequest, getCurrentUser } = window.sakayaAPI || {};

let selectedCar = null;

// Load SUVs from backend
async function loadSUVs() {
    try {
        const cars = await apiRequest('/cars?type=SUV');
        renderSUVs(cars);
    } catch (error) {
        console.error('Error loading SUVs:', error);
        showToast('Failed to load SUV cars', 'error');
    }
}

// Render SUV cars dynamically
function renderSUVs(cars) {
    const container = document.querySelector('.row.g-4');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    if (cars.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No SUV cars available at the moment.</p></div>';
        return;
    }

    cars.forEach(car => {
        const carCard = createCarCard(car);
        container.appendChild(carCard);
    });
}

// Create car card element
function createCarCard(car) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'col-md-4';

    cardDiv.innerHTML = `
        <div class="card shadow text-center">
            <h5 class="card-title mt-3">${car.name}</h5>
            <img src="${car.image_url}" alt="${car.name}" class="img-fluid my-3" style="height: 220px; object-fit: cover;">
            <ul class="list-unstyled mb-3">
                <li><i class="bi bi-gear-fill me-2"></i>${car.transmission} Transmission</li>
                <li><i class="bi bi-person-fill me-2"></i>${car.seats} Seats</li>
                <li><i class="bi bi-fuel-pump-fill me-2"></i>${car.fuel}</li>
                <li><i class="bi bi-currency-dollar me-2"></i>$${car.price}/day</li>
            </ul>
            <button class="btn btn-dark w-100 view-details-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#detailsModal"
                    data-car-id="${car.car_id}"
                    data-car-name="${car.name}"
                    data-car-image="${car.image_url}"
                    data-car-type="${car.car_type}"
                    data-car-price="${car.price}">
                View Details
            </button>
        </div>
    `;

    return cardDiv;
}

// Handle view details button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-details-btn')) {
        const button = e.target;
        selectedCar = {
            car_id: parseInt(button.dataset.carId),
            name: button.dataset.carName,
            image_url: button.dataset.carImage,
            car_type: button.dataset.carType,
            price: parseFloat(button.dataset.carPrice)
        };

        // Update modal content
        const modalCarName = document.getElementById('modalCarName');
        if (modalCarName) {
            modalCarName.textContent = selectedCar.name;
        }

        // Hide any previous success messages
        const rentSuccess = document.getElementById('rentSuccess');
        if (rentSuccess) {
            rentSuccess.classList.add('d-none');
        }
    }
});

// Handle add to cart button
const rentButton = document.getElementById('rentButton');
if (rentButton) {
    rentButton.addEventListener('click', async () => {
        if (!selectedCar) {
            showToast('Please select a car first', 'warning');
            return;
        }

        try {
            // Check if user is logged in
            const user = await getCurrentUser();
            if (!user) {
                showToast('Please log in to add cars to your cart', 'warning');
                setTimeout(() => {
                    window.location.href = '/user-login';
                }, 2000);
                return;
            }

            rentButton.disabled = true;
            rentButton.textContent = 'Adding to cart...';

            await apiRequest('/cart', {
                method: 'POST',
                body: JSON.stringify({ car_id: selectedCar.car_id })
            });

            const rentSuccess = document.getElementById('rentSuccess');
            if (rentSuccess) {
                rentSuccess.textContent = `Successfully added ${selectedCar.name} to your cart!`;
                rentSuccess.classList.remove('d-none');
            }

            showToast(`${selectedCar.name} added to cart!`, 'success');

            setTimeout(() => {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('detailsModal'));
                if (modal) {
                    modal.hide();
                }
                
                // Ask user if they want to go to dashboard or continue shopping
                if (confirm('Car added to cart! Would you like to go to your dashboard to manage your cart?')) {
                    window.location.href = '/user-dashboard';
                }
            }, 1500);

        } catch (error) {
            console.error('Error adding to cart:', error);
            
            if (error.message.includes('already in cart')) {
                showToast('This car is already in your cart', 'warning');
            } else {
                showToast('Failed to add car to cart. Please try again.', 'error');
            }
        } finally {
            rentButton.disabled = false;
            rentButton.textContent = 'Add to Cart';
        }
    });
}

// Show toast notification
function showToast(message, type = 'info') {
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

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Load SUVs when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the login script to load
    setTimeout(loadSUVs, 100);
});