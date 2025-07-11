const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'sakaya-car-rental-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

const dbConfig = {
    host: "css152l-g6-softwareproject2.c.aivencloud.com",
    port: 15020,
    user: "avnadmin",
    password: "AVNS_VGEl06s-YIKoi1mIqnp",
    database: "javawheels",
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, "ca.pem")),
    },
};

let db;

async function connectToAivenMySQL() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log("Connected to Aiven for MySQL!");

        // Test connection
        const [rows] = await db.execute("SELECT VERSION() as version");
        console.log("MySQL Version:", rows[0].version);
        
        // Initialize tables if they don't exist
        await initializeTables();
        
    } catch (error) {
        console.error("Error connecting to Aiven for MySQL:", error);
        process.exit(1);
    }
}

async function initializeTables() {
    try {
        console.log("Starting complete database cleanup and recreation...");
        
        // Disable foreign key checks completely
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Get all tables in the database
        const [allTables] = await db.execute('SHOW TABLES');
        
        // Drop ALL existing tables to ensure clean slate
        for (const tableRow of allTables) {
            const tableName = Object.values(tableRow)[0];
            try {
                console.log(`Dropping table: ${tableName}`);
                await db.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
            } catch (error) {
                console.log(`Could not drop table ${tableName}:`, error.message);
            }
        }
        
        console.log("All existing tables dropped. Creating fresh tables...");
        
        // Create users table
        await db.execute(`
            CREATE TABLE users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(100) NOT NULL UNIQUE,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                contact_number VARCHAR(20),
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);
        console.log("✅ Users table created successfully");

        // Create cars table
        await db.execute(`
            CREATE TABLE cars (
                car_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(200) NOT NULL,
                brand VARCHAR(100),
                model VARCHAR(100),
                car_type ENUM('Sedan', 'SUV', 'Van') NOT NULL,
                image_url VARCHAR(500),
                fuel VARCHAR(50) DEFAULT 'Gasoline',
                transmission VARCHAR(50) DEFAULT 'Automatic',
                seats INT DEFAULT 5,
                price DECIMAL(10,2) DEFAULT 50.00,
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);
        console.log("✅ Cars table created successfully");

        // Create user_carts table
        await db.execute(`
            CREATE TABLE user_carts (
                cart_id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                car_id INT NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY idx_user_id (user_id),
                KEY idx_car_id (car_id),
                CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_cart_car FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
        console.log("✅ User_carts table created successfully");

        // Create rentals table
        await db.execute(`
            CREATE TABLE rentals (
                rental_id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                car_id INT NOT NULL,
                rental_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                start_date DATE,
                end_date DATE,
                total_price DECIMAL(10,2),
                payment_method VARCHAR(50),
                status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY idx_rental_user_id (user_id),
                KEY idx_rental_car_id (car_id),
                CONSTRAINT fk_rental_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_rental_car FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
        console.log("✅ Rentals table created successfully");

        // Re-enable foreign key checks
        await db.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log("🎉 Database tables initialized successfully");
        
        // Insert default users
        await createDefaultUsers();
        
        // Insert sample cars
        await insertSampleCars();
        
    } catch (error) {
        console.error("❌ Error initializing tables:", error);
        // Always re-enable foreign key checks
        try {
            await db.execute('SET FOREIGN_KEY_CHECKS = 1');
        } catch (fkError) {
            console.error("Error re-enabling foreign key checks:", fkError);
        }
    }
}

async function createDefaultUsers() {
    try {
        console.log("Creating default users...");
        
        // Create default admin
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);
        await db.execute(
            'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@example.com', hashedAdminPassword, true]
        );
        console.log("✅ Default admin created: admin@example.com / admin123");

        // Create default regular user
        const hashedUserPassword = await bcrypt.hash('user123', 10);
        await db.execute(
            'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)',
            ['defaultuser', 'user@example.com', hashedUserPassword, false]
        );
        console.log("✅ Default user created: user@example.com / user123");
        
    } catch (error) {
        console.error("❌ Error creating default users:", error);
    }
}

async function insertSampleCars() {
    try {
        console.log("Inserting sample cars...");
        
        const sampleCars = [
            // Sedans
            ['Nissan Versa', 'Nissan', 'Versa', 'Sedan', '/assets/car-options/sedan/nissan-versa.avif', 'Gasoline', 'Automatic', 5, 45.00],
            ['Mazda Miata', 'Mazda', 'Miata', 'Sedan', '/assets/car-options/sedan/mazda-miata.avif', 'Gasoline', 'Manual', 2, 65.00],
            ['Mitsubishi Mirage', 'Mitsubishi', 'Mirage', 'Sedan', '/assets/car-options/sedan/mitsubishi-mirage.avif', 'Gasoline', 'Automatic', 5, 40.00],
            ['Chevrolet Malibu', 'Chevrolet', 'Malibu', 'Sedan', '/assets/car-options/sedan/chevrolet-malibu.avif', 'Gasoline', 'Automatic', 5, 55.00],
            
            // SUVs
            ['Kia Niro', 'Kia', 'Niro', 'SUV', '/assets/car-options/suvs/kia-niro.avif', 'Hybrid', 'Automatic', 5, 70.00],
            ['Jeep Wrangler', 'Jeep', 'Wrangler', 'SUV', '/assets/car-options/suvs/jeep-wrangler.avif', 'Gasoline', 'Manual', 4, 85.00],
            ['Hyundai Kona', 'Hyundai', 'Kona', 'SUV', '/assets/car-options/suvs/hyundai-kona.avif', 'Gasoline', 'Automatic', 5, 65.00],
            
            // Vans
            ['Ford Transit Wagon', 'Ford', 'Transit Wagon', 'Van', '/assets/car-options/vans/ford-transit-wagon.avif', 'Gasoline', 'Automatic', 12, 95.00],
            ['Chevy Express', 'Chevrolet', 'Express', 'Van', '/assets/car-options/vans/chevy-express-e35c.avif', 'Gasoline', 'Automatic', 15, 105.00],
            ['Chevrolet Express', 'Chevrolet', 'Express', 'Van', '/assets/car-options/vans/chevrolet-express.avif', 'Gasoline', 'Automatic', 15, 100.00]
        ];

        for (const car of sampleCars) {
            await db.execute(
                'INSERT INTO cars (name, brand, model, car_type, image_url, fuel, transmission, seats, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                car
            );
        }
        console.log(`✅ Sample cars inserted: ${sampleCars.length} cars added`);
        
    } catch (error) {
        console.error("❌ Error inserting sample cars:", error);
    }
}

// Helper function to check if user is authenticated
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Helper function to check if user is admin
function requireAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// ===== STATIC ROUTES =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sign-up', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'sign-up.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'admin-dashboard.html'));
});

app.get('/user-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'user-login.html'));
});

app.get('/user-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'user-dashboard.html'));
});

// ===== API ROUTES =====

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, contactNumber } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User with this email or username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO users (username, first_name, last_name, email, password, contact_number) VALUES (?, ?, ?, ?, ?, ?)',
            [username, firstName, lastName, email, hashedPassword, contactNumber]
        );

        res.json({ success: true, message: 'Registration successful', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, isAdmin } = req.body;

        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check admin access
        if (isAdmin && !user.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.is_admin
        };

        res.json({ 
            success: true, 
            user: req.session.user,
            redirectUrl: user.is_admin ? '/admin-dashboard' : '/user-dashboard'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Get current user session
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Get available cars
app.get('/api/cars', async (req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM cars WHERE is_available = TRUE';
        let params = [];

        if (type) {
            query += ' AND car_type = ?';
            params.push(type);
        }

        query += ' ORDER BY car_type, name';
        
        const [cars] = await db.execute(query, params);
        res.json(cars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ error: 'Failed to fetch cars' });
    }
});

// Get all cars (admin only)
app.get('/api/cars/all', requireAdmin, async (req, res) => {
    try {
        const [cars] = await db.execute('SELECT * FROM cars ORDER BY car_type, name');
        res.json(cars);
    } catch (error) {
        console.error('Error fetching all cars:', error);
        res.status(500).json({ error: 'Failed to fetch cars' });
    }
});

// Add new car (admin only)
app.post('/api/cars', requireAdmin, async (req, res) => {
    try {
        const { name, brand, model, car_type, image_url, fuel, transmission, seats, price } = req.body;

        const [result] = await db.execute(
            'INSERT INTO cars (name, brand, model, car_type, image_url, fuel, transmission, seats, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, brand, model, car_type, image_url, fuel, transmission, seats, price]
        );

        res.json({ success: true, message: 'Car added successfully', carId: result.insertId });
    } catch (error) {
        console.error('Error adding car:', error);
        res.status(500).json({ error: 'Failed to add car' });
    }
});

// Update car (admin only)
app.put('/api/cars/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand, model, car_type, image_url, fuel, transmission, seats, price, is_available } = req.body;

        await db.execute(
            'UPDATE cars SET name = ?, brand = ?, model = ?, car_type = ?, image_url = ?, fuel = ?, transmission = ?, seats = ?, price = ?, is_available = ? WHERE car_id = ?',
            [name, brand, model, car_type, image_url, fuel, transmission, seats, price, is_available, id]
        );

        res.json({ success: true, message: 'Car updated successfully' });
    } catch (error) {
        console.error('Error updating car:', error);
        res.status(500).json({ error: 'Failed to update car' });
    }
});

// Delete car (admin only)
app.delete('/api/cars/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM cars WHERE car_id = ?', [id]);
        res.json({ success: true, message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ error: 'Failed to delete car' });
    }
});

// Add car to user's cart
app.post('/api/cart', requireAuth, async (req, res) => {
    try {
        const { car_id } = req.body;
        const user_id = req.session.user.id;

        // Check if car is already in cart
        const [existing] = await db.execute(
            'SELECT cart_id FROM user_carts WHERE user_id = ? AND car_id = ?',
            [user_id, car_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Car already in cart' });
        }

        await db.execute(
            'INSERT INTO user_carts (user_id, car_id) VALUES (?, ?)',
            [user_id, car_id]
        );

        res.json({ success: true, message: 'Car added to cart' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add car to cart' });
    }
});

// Get user's cart
app.get('/api/cart', requireAuth, async (req, res) => {
    try {
        const user_id = req.session.user.id;
        
        const [cartItems] = await db.execute(`
            SELECT uc.cart_id, c.* 
            FROM user_carts uc 
            JOIN cars c ON uc.car_id = c.car_id 
            WHERE uc.user_id = ?
            ORDER BY uc.added_at DESC
        `, [user_id]);

        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Remove car from cart
app.delete('/api/cart/:cartId', requireAuth, async (req, res) => {
    try {
        const { cartId } = req.params;
        const user_id = req.session.user.id;

        await db.execute(
            'DELETE FROM user_carts WHERE cart_id = ? AND user_id = ?',
            [cartId, user_id]
        );

        res.json({ success: true, message: 'Car removed from cart' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove car from cart' });
    }
});

// Checkout (create rental)
app.post('/api/checkout', requireAuth, async (req, res) => {
    try {
        const { cart_ids, payment_method, start_date, end_date } = req.body;
        const user_id = req.session.user.id;

        // Start transaction
        await db.execute('START TRANSACTION');

        try {
            for (const cart_id of cart_ids) {
                // Get cart item with car details
                const [cartItems] = await db.execute(`
                    SELECT uc.car_id, c.price 
                    FROM user_carts uc 
                    JOIN cars c ON uc.car_id = c.car_id 
                    WHERE uc.cart_id = ? AND uc.user_id = ?
                `, [cart_id, user_id]);

                if (cartItems.length > 0) {
                    const { car_id, price } = cartItems[0];
                    
                    // Calculate total price (simplified - daily rate)
                    const startDate = new Date(start_date);
                    const endDate = new Date(end_date);
                    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
                    const total_price = price * days;

                    // Create rental
                    await db.execute(
                        'INSERT INTO rentals (user_id, car_id, start_date, end_date, total_price, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
                        [user_id, car_id, start_date, end_date, total_price, payment_method]
                    );

                    // Remove from cart
                    await db.execute('DELETE FROM user_carts WHERE cart_id = ?', [cart_id]);
                }
            }

            await db.execute('COMMIT');
            res.json({ success: true, message: 'Checkout successful' });
        } catch (error) {
            await db.execute('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ error: 'Checkout failed' });
    }
});

// Get user's rentals
app.get('/api/rentals', requireAuth, async (req, res) => {
    try {
        const user_id = req.session.user.id;
        
        const [rentals] = await db.execute(`
            SELECT r.*, c.name, c.image_url, c.car_type 
            FROM rentals r 
            JOIN cars c ON r.car_id = c.car_id 
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [user_id]);

        res.json(rentals);
    } catch (error) {
        console.error('Error fetching rentals:', error);
        res.status(500).json({ error: 'Failed to fetch rentals' });
    }
});

// Get all users' carts and rentals (admin only)
app.get('/api/admin/user-activity', requireAdmin, async (req, res) => {
    try {
        // Get cart items
        const [cartItems] = await db.execute(`
            SELECT u.username, c.name, c.image_url, c.car_type, 'In Cart' as status, uc.added_at as date
            FROM user_carts uc 
            JOIN users u ON uc.user_id = u.id 
            JOIN cars c ON uc.car_id = c.car_id
            ORDER BY uc.added_at DESC
        `);

        // Get rentals
        const [rentals] = await db.execute(`
            SELECT u.username, c.name, c.image_url, c.car_type, 
                   CONCAT('Rented (', r.status, ')') as status, r.created_at as date
            FROM rentals r 
            JOIN users u ON r.user_id = u.id 
            JOIN cars c ON r.car_id = c.car_id
            ORDER BY r.created_at DESC
        `);

        const allActivity = [...cartItems, ...rentals].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json(allActivity);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
});

// Start server
async function startServer() {
    await connectToAivenMySQL();
    
    app.listen(PORT, () => {
        console.log(`🚀 SaKaya server running on port ${PORT}`);
        console.log(`🌐 Access the application at http://localhost:${PORT}`);
        console.log(`👤 Admin: admin@example.com / admin123`);
        console.log(`👤 User: user@example.com / user123`);
    });
}

startServer().catch(console.error);