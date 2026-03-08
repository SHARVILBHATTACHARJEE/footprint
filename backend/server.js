require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// Update these with your actual MySQL credentials
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'footprint',
    port: process.env.DB_PORT || 3306
};

let pool;

async function initDB() {
    try {
        // Create database if it doesn't exist
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await connection.end();

        // Connect to the database pool
        pool = mysql.createPool(dbConfig);
        console.log('Connected to MySQL Database.');

        // Create users table
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(createUsersTableQuery);

        // Create products table
        const createProductsTableQuery = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
                image_url VARCHAR(255),
                category VARCHAR(100),
                walking_style VARCHAR(100),
                climate VARCHAR(100),
                stock_quantity INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await pool.query(createProductsTableQuery);

        // Create product_review table
        const createProductReviewTableQuery = `
            CREATE TABLE IF NOT EXISTS product_review (
                review_id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                user_id INT NOT NULL,
                rating INT CHECK (rating BETWEEN 1 AND 5),
                review_text TEXT,
                review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `;
        await pool.query(createProductReviewTableQuery);

        // Create features table
        const createFeaturesTableQuery = `
            CREATE TABLE IF NOT EXISTS features (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                price VARCHAR(50),
                weight VARCHAR(50),
                cushioning_level VARCHAR(50),
                arch_support VARCHAR(50),
                foot_width_support VARCHAR(50),
                shoe_type VARCHAR(50),
                upper_material VARCHAR(50),
                sole_material VARCHAR(50),
                breathability VARCHAR(50),
                durability VARCHAR(50),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createFeaturesTableQuery);


        try {
            await pool.query('ALTER TABLE product_review ADD CONSTRAINT unique_user_product UNIQUE (product_id, user_id)');
        } catch (err) {
            // Ignore if constraint already exists
            if (err.code !== 'ER_DUP_KEYNAME') {
                console.log('Constraint check message:', err.message);
            }
        }

        // Seed initial products if table is empty
        const [productsRows] = await pool.query('SELECT COUNT(*) as count FROM products');
        if (productsRows[0].count === 0) {
            console.log('Seeding initial products into database...');
            const seedProductsQuery = `
                INSERT INTO products (name, description, price, image_url, category, walking_style, climate, stock_quantity) VALUES
                ('Velocity Pro', 'Engineered for maximum speed.', 180.00, '/images/product-velocity.jpg', 'Athletic', 'Running', 'All-Weather', 50),
                ('Urban Stride', 'City aesthetics, comfort core.', 145.00, '/images/product-urban.jpg', 'Casual', 'City Walking', 'Mild', 100),
                ('Flex Form', 'Adaptive fit for every move.', 120.00, '/images/product-flex.jpg', 'Athletic', 'Training', 'Indoor', 75),
                ('Hike Master', 'Rugged durability for the trails.', 195.00, '/images/product-hike.jpg', 'Outdoor', 'Trail', 'Harsh', 30),
                ('Classic Loafer', 'Timeless style, modern comfort.', 160.00, '/images/product-loafer.jpg', 'Casual', 'Everyday', 'Mild', 40),
                ('Run Pro Elite', 'Professional grade running gear.', 210.00, '/images/product-runpro.jpg', 'Athletic', 'Running', 'All-Weather', 20),
                ('Canvas Essential', 'Breathable and light.', 85.00, '/images/product-canvas.jpg', 'Casual', 'Everyday', 'Warm', 200),
                ('Weather Shield', 'Protection against the elements.', 175.00, '/images/product-weather.jpg', 'Outdoor', 'City Walking', 'Harsh', 60)
            `;
            await pool.query(seedProductsQuery);
            console.log('Products seeded successfully.');
        }

        // Ensure at least one user exists for dummy reviews
        const [usersRows] = await pool.query('SELECT COUNT(*) as count FROM users');
        let dummyUserId = 1;
        if (usersRows[0].count === 0) {
            const hashedDummyPassword = await bcrypt.hash('password123', 10);
            const [insertUserResult] = await pool.query(
                'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
                ['John', 'Doe', 'johndoe@example.com', hashedDummyPassword]
            );
            dummyUserId = insertUserResult.insertId;
        } else {
            const [firstUser] = await pool.query('SELECT id FROM users LIMIT 1');
            dummyUserId = firstUser[0].id;
        }

        // Seed dummy reviews if product_review table is empty
        const [reviewsRows] = await pool.query('SELECT COUNT(*) as count FROM product_review');
        if (reviewsRows[0].count === 0 && productsRows[0].count === 0) {
            // Wait a moment for products to be seeded if they were just created
            console.log('Seeding initial reviews into database...');
            const seedReviewsQuery = `
                INSERT INTO product_review (product_id, user_id, rating, review_text) VALUES
                (1, ?, 5, 'Absolutely incredible. The cushioning is game-changing.'),
                (1, ?, 4, 'Great shoes, but they run a little bit tight.'),
                (2, ?, 5, 'Perfect for city walking. I wear these every day.'),
                (3, ?, 5, 'The adaptive fit is exactly what I needed for the gym.')
            `;
            await pool.query(seedReviewsQuery, [dummyUserId, dummyUserId, dummyUserId, dummyUserId]);
            console.log('Reviews seeded successfully.');
        }

        // Seed random features if features table is empty
        const [featuresRows] = await pool.query('SELECT COUNT(*) as count FROM features');
        if (featuresRows[0].count === 0) {
            console.log('Seeding initial features into database...');
            const [allProducts] = await pool.query('SELECT id FROM products');
            if (allProducts.length > 0) {
                const cushioningLevels = ['Low', 'Medium', 'High', 'Maximum'];
                const archSupports = ['Low', 'Medium', 'High'];
                const footWidths = ['Narrow', 'Medium', 'Wide', 'Extra Wide'];
                const shoeTypes = ['Running', 'Walking', 'Training', 'Casual', 'Trail'];
                const upperMaterials = ['Mesh', 'Knit', 'Leather', 'Synthetic', 'Canvas'];
                const soleMaterials = ['Rubber', 'EVA', 'Carbon Rubber', 'PU'];
                const breathabilities = ['Low', 'Medium', 'High'];
                const durabilities = ['6/10', '7/10', '8/10', '9/10', '10/10'];

                for (const prod of allProducts) {
                    const randomWeight = Math.floor(Math.random() * (400 - 200 + 1) + 200) + ' g';
                    const randomPrice = '₹' + (Math.floor(Math.random() * (15000 - 3000 + 1)) + 3000);
                    const randomCushioning = cushioningLevels[Math.floor(Math.random() * cushioningLevels.length)];
                    const randomArch = archSupports[Math.floor(Math.random() * archSupports.length)];
                    const randomWidth = footWidths[Math.floor(Math.random() * footWidths.length)];
                    const randomType = shoeTypes[Math.floor(Math.random() * shoeTypes.length)];
                    const randomUpper = upperMaterials[Math.floor(Math.random() * upperMaterials.length)];
                    const randomSole = soleMaterials[Math.floor(Math.random() * soleMaterials.length)];
                    const randomBreathability = breathabilities[Math.floor(Math.random() * breathabilities.length)];
                    const randomDurability = durabilities[Math.floor(Math.random() * durabilities.length)];

                    const insertFeatureQuery = `
                        INSERT INTO features 
                        (product_id, price, weight, cushioning_level, arch_support, foot_width_support, shoe_type, upper_material, sole_material, breathability, durability)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    await pool.query(insertFeatureQuery, [
                        prod.id, randomPrice, randomWeight, randomCushioning, randomArch, randomWidth, randomType, randomUpper, randomSole, randomBreathability, randomDurability
                    ]);
                }
                console.log('Features seeded successfully.');
            }
        }

    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initDB();

// Register Endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Both email and password are required' });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get Products Endpoint
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get Products with Features Endpoint
app.get('/api/products-features', async (req, res) => {
    try {
        const query = `
            SELECT p.*, f.price as feature_price, f.weight, f.cushioning_level, f.arch_support, f.foot_width_support, f.shoe_type, f.upper_material, f.sole_material, f.breathability, f.durability
            FROM products p
            LEFT JOIN features f ON p.id = f.product_id
        `;
        const [productsFeatures] = await pool.query(query);
        res.status(200).json(productsFeatures);
    } catch (error) {
        console.error('Error fetching products with features:', error);
        res.status(500).json({ error: 'Failed to fetch products with features' });
    }
});

// Get Product Reviews Endpoint
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const productId = req.params.id;
        const query = `
            SELECT pr.review_id, pr.rating, pr.review_text, pr.review_date, u.firstName, u.lastName, pr.user_id 
            FROM product_review pr
            JOIN users u ON pr.user_id = u.id
            WHERE pr.product_id = ?
            ORDER BY pr.review_date DESC
        `;
        const [reviews] = await pool.query(query, [productId]);
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Post a New Review Endpoint
app.post('/api/products/:id/reviews', async (req, res) => {
    try {
        const productId = req.params.id;
        const { user_id, rating, review_text } = req.body;

        if (!user_id || !rating || !review_text) {
            return res.status(400).json({ error: 'All fields (user_id, rating, review_text) are required' });
        }

        // Check if user already reviewed this product
        const checkQuery = `SELECT review_id FROM product_review WHERE product_id = ? AND user_id = ?`;
        const [existingReview] = await pool.query(checkQuery, [productId, user_id]);

        if (existingReview.length > 0) {
            // Update existing review
            const updateQuery = `
                UPDATE product_review 
                SET rating = ?, review_text = ?, review_date = CURRENT_TIMESTAMP
                WHERE product_id = ? AND user_id = ?
            `;
            await pool.query(updateQuery, [rating, review_text, productId, user_id]);
            return res.status(200).json({ message: 'Review updated successfully' });
        } else {
            // Insert new review
            const insertQuery = `
                INSERT INTO product_review (product_id, user_id, rating, review_text)
                VALUES (?, ?, ?, ?)
            `;
            await pool.query(insertQuery, [productId, user_id, rating, review_text]);
            return res.status(201).json({ message: 'Review added successfully' });
        }
    } catch (error) {
        console.error('Error posting review:', error);
        res.status(500).json({ error: 'Failed to post review' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
