// ===== admin-dashboard.js (UPDATED WITH BACKEND API INTEGRATION) =====

// Use the API utilities from login.js
const { apiRequest, getCurrentUser } = window.sakayaAPI || {};

// Global variables
let allCars = [];
let userActivity = [];
let selectedCar = null;

// DOM Elements
const usersCarsTable = document.getElementById("usersCarsTable");
const carListTable = document.getElementById("carListTable");
const addCarForm = document.getElementById("addCarForm");
const updateCarBtn = document.getElementById("updateCarBtn");
const deleteCarBtn = document.getElementById("deleteCarBtn");

// Initialize admin dashboard
async function initializeAdminDashboard() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isAdmin) {
            window.location.href = '/admin-login';
            return;
        }

        await loadUserActivity();
        await loadAllCars();
        
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        showToast('Error loading dashboard', 'error');
    }
}

// Load user activity (carts and rentals)
async function loadUserActivity() {
    try {
        userActivity = await apiRequest('/admin/user-activity');
        renderUserActivity();
    } catch (error) {
        console.error('Error loading user activity:', error);
        userActivity = [];
        renderUserActivity();
    }
}

// Load all cars
async function loadAllCars() {
    try {
        allCars = await apiRequest('/cars/all');
        renderCarTable();
    } catch (error) {
        console.error('Error loading cars:', error);
        allCars = [];
        renderCarTable();
    }
}

// Render user activity table
function renderUserActivity() {
    usersCarsTable.innerHTML = "";

    if (userActivity.length === 0) {
        usersCarsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No user activity found</td>
            </tr>
        `;
        return;
    }

    userActivity.forEach((activity) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${activity.username}</td>
            <td>
                <img src="${activity.image_url}" alt="${activity.name}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
            </td>
            <td>${activity.name}</td>
            <td><span class="badge bg-secondary">${activity.car_type}</span></td>
            <td>
                <span class="badge ${getStatusBadgeClass(activity.status)}">
                    ${activity.status}
                </span>
            </td>
        `;
        usersCarsTable.appendChild(row);
    });
}

// Get bootstrap badge class for status
function getStatusBadgeClass(status) {
    if (status.includes('Cart')) return 'bg-primary';
    if (status.includes('active')) return 'bg-success';
    if (status.includes('completed')) return 'bg-secondary';
    if (status.includes('cancelled')) return 'bg-danger';
    return 'bg-info';
}

// Render car management table
function renderCarTable() {
    carListTable.innerHTML = "";

    if (allCars.length === 0) {
        carListTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">No cars found</td>
            </tr>
        `;
        return;
    }

    allCars.forEach((car) => {
        const row = document.createElement("tr");
        row.className = "car-row";
        row.dataset.carId = car.car_id;
        
        row.innerHTML = `
            <td>
                <img src="${car.image_url}" alt="${car.name}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;">
            </td>
            <td>
                <strong>${car.name}</strong>
                <br>
                <small class="text-muted">${car.brand} ${car.model}</small>
                <br>
                <small class="text-muted">$${car.price}/day</small>
            </td>
            <td><span class="badge bg-info">${car.car_type}</span></td>
            <td>
                <span class="badge ${car.is_available ? 'bg-success' : 'bg-warning'}">
                    ${car.is_available ? 'Available' : 'Unavailable'}
                </span>
                <br>
                <small class="text-muted">${car.transmission} • ${car.seats} seats</small>
            </td>
        `;

        // Add click handler for row selection
        row.addEventListener("click", () => {
            // Remove selection from other rows
            document.querySelectorAll('.car-row').forEach(r => r.classList.remove('table-active'));
            
            // Select this row
            row.classList.add('table-active');
            selectedCar = car;
            
            // Enable action buttons
            updateCarBtn.disabled = false;
            deleteCarBtn.disabled = false;
        });

        carListTable.appendChild(row);
    });
}

// Add new car
if (addCarForm) {
    addCarForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addCarForm);
        const carData = {
            name: formData.get('name'),
            brand: formData.get('brand') || '',
            model: formData.get('model') || '',
            car_type: formData.get('type'),
            image_url: formData.get('image'),
            fuel: formData.get('fuel') || 'Gasoline',
            transmission: formData.get('transmission') || 'Automatic',
            seats: parseInt(formData.get('seats')) || 5,
            price: parseFloat(formData.get('price')) || 50.00
        };

        try {
            await apiRequest('/cars', {
                method: 'POST',
                body: JSON.stringify(carData)
            });

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("addCarModal"));
            modal.hide();

            // Reset form
            addCarForm.reset();

            // Reload cars
            await loadAllCars();
            
            showToast('Car added successfully', 'success');

        } catch (error) {
            console.error('Error adding car:', error);
            showToast('Failed to add car', 'error');
        }
    });
}

// Update car
if (updateCarBtn) {
    updateCarBtn.addEventListener("click", () => {
        if (!selectedCar) return;

        // Pre-fill modal with selected car data
        document.getElementById('updateCarName').value = selectedCar.name;
        document.getElementById('updateCarBrand').value = selectedCar.brand || '';
        document.getElementById('updateCarModel').value = selectedCar.model || '';
        document.getElementById('updateCarType').value = selectedCar.car_type;
        document.getElementById('updateCarImage').value = selectedCar.image_url;
        document.getElementById('updateCarFuel').value = selectedCar.fuel || 'Gasoline';
        document.getElementById('updateCarTransmission').value = selectedCar.transmission || 'Automatic';
        document.getElementById('updateCarSeats').value = selectedCar.seats || 5;
        document.getElementById('updateCarPrice').value = selectedCar.price || 50.00;
        document.getElementById('updateCarAvailable').checked = selectedCar.is_available;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById("updateCarModal"));
        modal.show();
    });
}

// Delete car
if (deleteCarBtn) {
    deleteCarBtn.addEventListener("click", async () => {
        if (!selectedCar) return;

        if (!confirm(`Are you sure you want to delete "${selectedCar.name}"?`)) {
            return;
        }

        try {
            await apiRequest(`/cars/${selectedCar.car_id}`, {
                method: 'DELETE'
            });

            selectedCar = null;
            updateCarBtn.disabled = true;
            deleteCarBtn.disabled = true;

            await loadAllCars();
            showToast('Car deleted successfully', 'success');

        } catch (error) {
            console.error('Error deleting car:', error);
            showToast('Failed to delete car', 'error');
        }
    });
}

// Handle update car form submission
document.addEventListener('DOMContentLoaded', () => {
    const updateCarForm = document.getElementById('updateCarForm');
    if (updateCarForm) {
        updateCarForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!selectedCar) return;

            const formData = new FormData(updateCarForm);
            const carData = {
                name: formData.get('name'),
                brand: formData.get('brand') || '',
                model: formData.get('model') || '',
                car_type: formData.get('type'),
                image_url: formData.get('image'),
                fuel: formData.get('fuel') || 'Gasoline',
                transmission: formData.get('transmission') || 'Automatic',
                seats: parseInt(formData.get('seats')) || 5,
                price: parseFloat(formData.get('price')) || 50.00,
                is_available: formData.get('available') === 'on'
            };

            try {
                await apiRequest(`/cars/${selectedCar.car_id}`, {
                    method: 'PUT',
                    body: JSON.stringify(carData)
                });

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById("updateCarModal"));
                modal.hide();

                selectedCar = null;
                updateCarBtn.disabled = true;
                deleteCarBtn.disabled = true;

                await loadAllCars();
                showToast('Car updated successfully', 'success');

            } catch (error) {
                console.error('Error updating car:', error);
                showToast('Failed to update car', 'error');
            }
        });
    }
});

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

// Refresh data periodically
setInterval(async () => {
    try {
        await loadUserActivity();
    } catch (error) {
        console.error('Error refreshing user activity:', error);
    }
}, 30000); // Refresh every 30 seconds

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeAdminDashboard);