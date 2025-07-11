const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const app = express();

const dbConfig = {
    host: "css152l-g6-softwareproject2.c.aivencloud.com",
    port: 15020,
    user: "avnadmin",
    password: "AVNS_VGEl06s-YIKoi1mIqnp",
    database: "javawheels",
    ssl: {
        rejectUnauthorized: true,
        ca: require("fs").readFileSync("./ca.pem"),
    },
};

app.listen(15020, () => {
    console.log("Listening...");
});

let db;

async function connectToAivenMySQL() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log("Connected to Aiven for MySQL!");

        //
        const [rows, fields] = await connection.execute("SELECT VERSION ()");
        console.log("MySQL Version:", rows[0]["VERSION()"]);
        console.log(`JavaWheels server running on port ${PORT}`);
        console.log(`Access the application at http://localhost:${PORT}`);

        await connection.end();
    } catch (error) {
        console.error("Error connecting to Aiven for MySQL:", error);
    }
}

//Render Routes
app.get('/', (res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sign-up', (res) => {
  res.sendFile(path.join(__dirname, 'public', '/sign-up.html'));
});

app.get('/admin-login', (res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-dashboard', (res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/user-login', (res) => {
  res.sendFile(path.join(__dirname, 'public', 'user-login.html'));
});

app.get('/user-dashboard', (res) => {
  res.sendFile(path.join(__dirname, 'public', '/user-dashboard.html'));
});

app.get('/faqs', (res) => {
  res.sendFile(path.join(__dirname, 'public', '/faqs.html'));
});

app.get('/features', (res) => {
  res.sendFile(path.join(__dirname, 'public', '/features.html'));
});

app.get('/rent-car', (res) => {
  res.sendFile(path.join(__dirname, 'public', '/rent-car.html'));
});

app.get('/contact-us', (res) => {
  res.sendFile(path.join(__dirname, 'public', '/contact-us.html'));
});


//API Routes
app.post('/api/register', async (req, res) => {
  try {
    const { last_name, first_name, email, password, contact_number } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      'INSERT INTO users (last_name, first_name, email, password, contact_number) VALUES (?, ?, ?, ?, ?)',
      [last_name, first_name, email, hashedPassword, contact_number]
    );

    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND is_admin = ?',
      [email, isAdmin || false]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
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

app.get('/api/cars', async ((res) => {
  try {
    const [cars] = await db.execute('SELECT * FROM cars WHERE is_available = TRUE ORDER BY brand');
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

app.get('/api/cars/all', async ((res) => {
  try {
    const [cars] = await db.execute('SELECT * FROM cars ORDER BY brand');
    res.json(cars);
  } catch (error) {
    console.error('Error fetching all cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const { brand, model, car_type, duration, fuel, transmission, price, car_status, user_id } = req.body;

    await db.execute(
      'INSERT INTO cars (brand, model, car_type, duration, fuel, transmission, price, car_status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [brand, model, car_type, duration, fuel, transmission, price, car_status, user_id]
    );

    res.json({ success: true, message: 'Car added successfully' });
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).json({ error: 'Failed to add car' });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    const { car_id } = req.params;
    await db.execute('DELETE FROM cars WHERE car_id = ?', [car_id]);
    res.json({ success: true, message: 'Car removed successfully' });
  } catch (error) {
    console.error('Error removing car:', error);
    res.status(500).json({ error: 'Failed to remove car' });
  }
});

app.post('/api/rentals', async (req, res) => {
  try {
    const { date_start, date_end, booking_status, user_id, car_id} = req.body;

    if (!req.session.user) {
      return res.status(401).json({ error: 'Please login first' });
    }

    // Calculate total price
    const [cars] = await db.execute('SELECT price FROM cars WHERE id = ?', [car_id]);
    const startDate = new Date(date_start);
    const endDate = new Date(date_end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const total_price = cars[0].price * days;

    await db.execute(
      'INSERT INTO rentals (user_id, car_id, date_start, date_end, price, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [req.session.user.id, car_id, start_date, end_date, total_price, payment_method]
    );


    
// Start server
connectToAivenMySQL();
