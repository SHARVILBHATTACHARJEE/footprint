import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductModal = ({ product, isOpen, onClose, onAdd }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);

    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Check for logged-in user
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const existingReview = reviews.find(r => user && r.user_id === user.id);

    useEffect(() => {
        if (!isOpen || !product) return;

        const fetchReviews = async () => {
            setIsLoadingReviews(true);
            try {
                const response = await fetch(`http://localhost:5000/api/products/${product.id}/reviews`);
                if (!response.ok) throw new Error('Failed to fetch reviews');
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setIsLoadingReviews(false);
            }
        };

        fetchReviews();

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, product]);

    useEffect(() => {
        if (existingReview && isOpen) {
            setRating(existingReview.rating);
            setReviewText(existingReview.review_text);
        } else if (isOpen) {
            setRating(5);
            setReviewText('');
        }
    }, [existingReview, isOpen]);

    if (!product) return null;

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={i < rating ? "fill-[#00ff88] text-[#00ff88]" : "text-[#333]"}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user || !reviewText.trim()) return;

        setIsSubmittingReview(true);
        try {
            const response = await fetch(`http://localhost:5000/api/products/${product.id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    rating,
                    review_text: reviewText
                })
            });

            if (response.ok) {
                // Refresh reviews
                const reviewsResponse = await fetch(`http://localhost:5000/api/products/${product.id}/reviews`);
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData);
                setReviewText('');
                setRating(5);
                onClose();
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-5xl bg-[#0a0a0a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-[#00ff88] text-white hover:text-black rounded-full border border-white/10 transition-colors backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>

                        <div className="overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {/* Product Info Section */}
                            <div className="flex flex-col md:flex-row border-b border-[#333]">
                                {/* Image Container */}
                                <div className="w-full md:w-1/2 relative bg-[#111] min-h-[300px] md:min-h-[500px]">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    {/* Overlay Tags */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-mono py-1 px-3 rounded-full border border-white/10 uppercase tracking-widest">{product.category}</span>
                                        <span className="bg-[#00ff88]/90 text-black text-xs font-mono py-1 px-3 rounded-full uppercase tracking-widest font-bold">{product.climate}</span>
                                    </div>
                                </div>

                                {/* Details Container */}
                                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-white">
                                        {product.name}
                                    </h2>
                                    <p className="text-[#00ff88] font-mono tracking-widest mb-6">
                                        {product.walkingStyle || product.category}
                                    </p>

                                    <div className="text-4xl font-bold text-white mb-8">
                                        ${product.price}
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-3 border-b border-[#333] pb-2">Description</h3>
                                        <p className="text-gray-300 leading-relaxed font-mono text-sm">
                                            {product.description}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            onAdd(product);
                                            onClose();
                                        }}
                                        className="w-full flex justify-center items-center gap-3 bg-[#00ff88] hover:bg-white text-black font-bold uppercase tracking-widest py-4 rounded-sm transition-colors duration-300"
                                    >
                                        <ShoppingCart size={20} /> Add to Cart
                                    </button>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="p-8 md:p-12 bg-[#050505]">
                                <h3 className="text-2xl font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
                                    Customer Reviews <span className="text-[#00ff88] text-sm">({reviews.length})</span>
                                </h3>

                                {isLoadingReviews ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin text-[#00ff88] w-8 h-8 relative">
                                            <div className="absolute inset-0 border-2 border-transparent border-t-[#00ff88] rounded-full"></div>
                                        </div>
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {reviews.map((review) => (
                                            <div key={review.review_id} className="bg-[#111] p-6 rounded-xl border border-[#222] hover:border-[#333] transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="font-bold text-white mb-1">{review.firstName} {review.lastName}</div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                                            <Calendar size={12} /> {formatDate(review.review_date)}
                                                        </div>
                                                    </div>
                                                    {renderStars(review.rating)}
                                                </div>
                                                <p className="text-sm text-gray-300 italic">"{review.review_text}"</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 px-4 border border-dashed border-[#333] rounded-2xl bg-[#0a0a0a]">
                                        <Star className="mx-auto text-gray-600 mb-4" size={32} />
                                        <h4 className="text-white font-bold uppercase tracking-widest mb-2">No reviews yet</h4>
                                        <p className="text-gray-500 font-mono text-sm max-w-sm mx-auto">
                                            Be the first to review this product and help others make an informed decision.
                                        </p>
                                    </div>
                                )}

                                {/* Review Submission Form OR Sign In Link */}
                                <div className="mt-12 pt-8 border-t border-[#222]">
                                    {user ? (
                                        <div>
                                            <h4 className="text-white font-bold uppercase tracking-widest mb-4">
                                                {existingReview ? "Edit Your Review" : "Write a Review"}
                                            </h4>
                                            <form onSubmit={handleReviewSubmit} className="bg-[#111] p-6 rounded-xl border border-[#222]">
                                                <div className="mb-4">
                                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Rating</label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <button
                                                                type="button"
                                                                key={num}
                                                                onClick={() => setRating(num)}
                                                                className="focus:outline-none"
                                                            >
                                                                <Star
                                                                    size={24}
                                                                    className={`transition-colors ${num <= rating ? "fill-[#00ff88] text-[#00ff88]" : "text-[#444] hover:text-[#666]"}`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Your Review</label>
                                                    <textarea
                                                        value={reviewText}
                                                        onChange={(e) => setReviewText(e.target.value)}
                                                        required
                                                        rows="3"
                                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-700 resize-none font-mono text-sm"
                                                        placeholder="What do you think about this product?"
                                                    ></textarea>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmittingReview || !reviewText.trim() || (existingReview && existingReview.rating === rating && existingReview.review_text === reviewText)}
                                                    className="px-6 py-3 bg-[#00ff88] text-black font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmittingReview ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="bg-[#111] p-6 rounded-xl border border-[#222] text-center">
                                            <p className="text-gray-400 font-mono text-sm">
                                                <Link to="/login" className="text-[#00ff88] font-bold hover:underline uppercase tracking-widest">Sign in</Link> to write a review.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductModal;
