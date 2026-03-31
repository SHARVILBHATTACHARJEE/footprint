import { db } from './config';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

const SHOE_NAMES = [
    "Nike Air Force 1 Low '07",
    "Nike Air Max 90",
    "Nike Dunk Low",
    "Nike React Infinity Run Flyknit 3",
    "Nike Air Zoom Pegasus 40",
    "Air Jordan 1 Retro High OG",
    "Air Jordan 3 Retro",
    "Air Jordan 4 Retro",
    "Air Jordan 11 Retro",
    "Air Jordan 6 Retro",
    "Adidas Superstar",
    "Adidas Stan Smith",
    "Adidas Ultraboost 22",
    "Adidas NMD_R1",
    "Adidas Forum Low"
];

const CATEGORIES = ['Athletic', 'Casual', 'Outdoor'];

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

export const reseedFirestore = async () => {
    console.log('Clearing old products...');
    const productsSnap = await getDocs(collection(db, 'products'));
    for (const docSnap of productsSnap.docs) {
        // Also try to delete reviews subcollection if possible (simplified approach: skip reviews subcollection deletion for now as it doesn't break new features)
        await deleteDoc(doc(db, 'products', docSnap.id));
    }
    console.log('Old products cleared.');

    console.log('Seeding 15 new shoes...');
    for (let i = 1; i <= 15; i++) {
        const productRef = doc(collection(db, 'products'));
        const price = Math.floor(Math.random() * 150) + 50;
        await setDoc(productRef, {
            name: SHOE_NAMES[i-1],
            description: `Experience the advanced comfort of ${SHOE_NAMES[i-1]}. Built to last your daily adventures.`,
            price: price,
            image_url: `/images/shoes/shoe${i}_normal.png`,
            lifecycle_images: {
                normal: `/images/shoes/shoe${i}_normal.png`,
                m3: `/images/shoes/shoe${i}_3m.png`,
                m6: `/images/shoes/shoe${i}_6m.png`,
                m12: `/images/shoes/shoe${i}_12m.png`
            },
            category: randomFrom(CATEGORIES),
            walking_style: randomFrom(['Running', 'City Walking', 'Training', 'Trail', 'Everyday']),
            climate: randomFrom(['All-Weather', 'Mild', 'Indoor', 'Harsh', 'Warm']),
            stock_quantity: Math.floor(Math.random() * 100) + 10,
            ...buildFeatures(price),
            avg_rating: 0,
            created_at: new Date().toISOString(),
        });
    }
    console.log('✅ 15 shoes seeded successfully!');
};
