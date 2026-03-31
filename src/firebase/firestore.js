import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    setDoc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from './config';

// ─── Products ────────────────────────────────────────────────────────────────

/**
 * Fetch all products (equivalent to GET /api/products)
 */
export const getProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Fetch all products with their features and average rating.
 * Equivalent to GET /api/products-features
 */
export const getProductsWithFeatures = async () => {
    const productsSnap = await getDocs(collection(db, 'products'));
    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // For each product, load reviews to compute avg_rating
    const enriched = await Promise.all(
        products.map(async (product) => {
            const reviewsSnap = await getDocs(
                query(collection(db, 'products', product.id, 'reviews'), orderBy('review_date', 'desc'))
            );
            const reviews = reviewsSnap.docs.map(r => r.data());
            const avg_rating =
                reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
                    : 0;

            return {
                ...product,
                avg_rating
            };
        })
    );

    return enriched;
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

/**
 * Fetch all reviews for a product.
 * Equivalent to GET /api/products/:id/reviews
 */
export const getProductReviews = async (productId) => {
    const reviewsSnap = await getDocs(
        query(
            collection(db, 'products', productId, 'reviews'),
            orderBy('review_date', 'desc')
        )
    );
    return reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Add or update a review for a product.
 * Equivalent to POST /api/products/:id/reviews
 * Uses userId as the document ID so one review per user per product is enforced.
 */
export const upsertReview = async (productId, { user_id, rating, review_text, firstName, lastName }) => {
    const reviewRef = doc(db, 'products', productId, 'reviews', user_id);
    const existing = await getDoc(reviewRef);

    if (existing.exists()) {
        await setDoc(reviewRef, {
            user_id,
            rating,
            review_text,
            firstName,
            lastName,
            review_date: serverTimestamp()
        });
        return { updated: true };
    } else {
        await setDoc(reviewRef, {
            user_id,
            rating,
            review_text,
            firstName,
            lastName,
            review_date: serverTimestamp()
        });
        return { created: true };
    }
};
