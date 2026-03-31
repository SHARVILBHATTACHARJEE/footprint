import { db } from './config';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

// ─── Seed data ───────────────────────────────────────────────────────────────
const PRODUCTS = [
    { name: 'Velocity Pro', description: 'Engineered for maximum speed.', price: 180, image_url: '/images/product-velocity.jpg', category: 'Athletic', walking_style: 'Running', climate: 'All-Weather', stock_quantity: 50 },
    { name: 'Urban Stride', description: 'City aesthetics, comfort core.', price: 145, image_url: '/images/product-urban.jpg', category: 'Casual', walking_style: 'City Walking', climate: 'Mild', stock_quantity: 100 },
    { name: 'Flex Form', description: 'Adaptive fit for every move.', price: 120, image_url: '/images/product-flex.jpg', category: 'Athletic', walking_style: 'Training', climate: 'Indoor', stock_quantity: 75 },
    { name: 'Hike Master', description: 'Rugged durability for the trails.', price: 195, image_url: '/images/product-hike.jpg', category: 'Outdoor', walking_style: 'Trail', climate: 'Harsh', stock_quantity: 30 },
    { name: 'Classic Loafer', description: 'Timeless style, modern comfort.', price: 160, image_url: '/images/product-loafer.jpg', category: 'Casual', walking_style: 'Everyday', climate: 'Mild', stock_quantity: 40 },
    { name: 'Run Pro Elite', description: 'Professional grade running gear.', price: 210, image_url: '/images/product-runpro.jpg', category: 'Athletic', walking_style: 'Running', climate: 'All-Weather', stock_quantity: 20 },
    { name: 'Canvas Essential', description: 'Breathable and light.', price: 85, image_url: '/images/product-canvas.jpg', category: 'Casual', walking_style: 'Everyday', climate: 'Warm', stock_quantity: 200 },
    { name: 'Weather Shield', description: 'Protection against the elements.', price: 175, image_url: '/images/product-weather.jpg', category: 'Outdoor', walking_style: 'City Walking', climate: 'Harsh', stock_quantity: 60 },
];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function buildFeatures(price) {
    return {
        feature_price: '₹' + (Math.floor(Math.random() * (15000 - 3000 + 1)) + 3000),
        weight: Math.floor(Math.random() * (400 - 200 + 1) + 200) + ' g',
        cushioning_level: randomFrom(['Low', 'Medium', 'High', 'Maximum']),
        arch_support: randomFrom(['Low', 'Medium', 'High']),
        foot_width_support: randomFrom(['Narrow', 'Medium', 'Wide', 'Extra Wide']),
        shoe_type: randomFrom(['Running', 'Walking', 'Training', 'Casual', 'Trail']),
        upper_material: randomFrom(['Mesh', 'Knit', 'Leather', 'Synthetic', 'Canvas']),
        sole_material: randomFrom(['Rubber', 'EVA', 'Carbon Rubber', 'PU']),
        breathability: randomFrom(['Low', 'Medium', 'High']),
        durability: randomFrom(['6/10', '7/10', '8/10', '9/10', '10/10']),
    };
}

/**
 * Seeds the Firestore 'products' collection.
 * Call this once from a temporary button in your app, or run it in the browser console
 * after importing. It skips seeding if products already exist.
 *
 * Usage in a React component:
 *   import { seedFirestore } from '../firebase/seed';
 *   <button onClick={seedFirestore}>Seed DB</button>
 */
export const seedFirestore = async () => {
    const snap = await getDocs(collection(db, 'products'));
    if (!snap.empty) {
        console.log('Firestore already seeded — skipping.');
        return;
    }

    console.log('Seeding Firestore with products...');
    for (const product of PRODUCTS) {
        const productRef = doc(collection(db, 'products'));
        await setDoc(productRef, {
            ...product,
            ...buildFeatures(product.price),
            avg_rating: 0,
            created_at: new Date().toISOString(),
        });
    }
    console.log('✅ Firestore seeded successfully!');
};
