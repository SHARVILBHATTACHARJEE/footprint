import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Calendar, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductReviews, upsertReview } from '../firebase/firestore';
import ShoeModel from './ShoeModel';

const modelsMap = {
    // Map default seed products to models
    'Velocity Pro': '/glb_models/NIKE_AIR_MAX_90.glb',
    'Urban Stride': '/glb_models/Nike_Air_Force.glb',
    'Flex Form': '/glb_models/Nike_Dunk_Low.glb',
    'Hike Master': '/glb_models/Nike_React_Infinity.glb',
    // Also explicitly map real names in case they exist
    'Nike Air Max 90': '/glb_models/NIKE_AIR_MAX_90.glb',
    'Nike Air Force': '/glb_models/Nike_Air_Force.glb',
    'Nike Dunk Low': '/glb_models/Nike_Dunk_Low.glb',
    'Nike React Infinity': '/glb_models/Nike_React_Infinity.glb',
};

const getModelUrl = (productName) => {
    if (!productName) return null;
    
    // Check partial name matches for the 4 shoes
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('air max 90')) return '/glb_models/NIKE_AIR_MAX_90.glb';
    if (lowerName.includes('air force')) return '/glb_models/Nike_Air_Force.glb';
    if (lowerName.includes('dunk low')) return '/glb_models/Nike_Dunk_Low.glb';
    if (lowerName.includes('react infinity')) return '/glb_models/Nike_React_Infinity.glb';
    
    // Fallback to strict map
    return modelsMap[productName] || null;
};

const ProductModal = ({ product, isOpen, onClose, onAdd }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);

    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [lifecycleStage, setLifecycleStage] = useState(0);
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [is3dPreviewOpen, setIs3dPreviewOpen] = useState(false);

    // Check for logged-in user
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const existingReview = reviews.find(r => user && r.user_id === user.id);

    useEffect(() => {
        if (!isOpen || !product) return;

        const fetchReviews = async () => {
            setIsLoadingReviews(true);
            try {
                const data = await getProductReviews(product.id);
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
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
        if (isOpen) {
            setLifecycleStage(0);
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
            await upsertReview(product.id, {
                user_id: user.id,
                rating,
                review_text: reviewText,
                firstName: user.firstName || '',
                lastName: user.lastName || ''
            });

            // Refresh reviews from Firestore
            const updatedReviews = await getProductReviews(product.id);
            setReviews(updatedReviews);
            setReviewText('');
            setRating(5);
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
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
                                <div className="w-full md:w-1/2 relative bg-transparent flex items-center justify-center p-8 min-h-[300px]">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="max-w-full max-h-full object-contain drop-shadow-2xl"
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
                                        ₹{product.price}
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-3 border-b border-[#333] pb-2">Description</h3>
                                        <p className="text-gray-300 leading-relaxed font-mono text-sm">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => {
                                                onAdd(product);
                                                onClose();
                                            }}
                                            className="w-full flex justify-center items-center gap-3 bg-[#00ff88] hover:bg-white text-black font-bold uppercase tracking-widest py-4 rounded-sm transition-colors duration-300"
                                        >
                                            <ShoppingCart size={20} /> Add to Cart
                                        </button>
                                        
                                        {product.lifecycle_images && (
                                            <button
                                                onClick={() => setIsSimulatorOpen(true)}
                                                className="w-full flex justify-center items-center gap-3 bg-transparent border border-[#00ff88] hover:bg-[#00ff88] text-[#00ff88] hover:text-black font-bold uppercase tracking-widest py-4 rounded-sm transition-colors duration-300"
                                            >
                                                Simulate Lifecycle
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => setIs3dPreviewOpen(true)}
                                            className="w-full flex justify-center items-center gap-3 bg-[#111] hover:bg-[#222] border border-[#333] text-white font-bold uppercase tracking-widest py-4 rounded-sm transition-colors duration-300"
                                        >
                                            <Box size={20} /> 3D Preview
                                        </button>
                                    </div>
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
                                            <div key={review.id || review.user_id} className="bg-[#111] p-6 rounded-xl border border-[#222] hover:border-[#333] transition-colors">
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
            {/* Lifecycle Simulator Popup */}
            <AnimatePresence>
                {isSimulatorOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer" 
                            onClick={() => setIsSimulatorOpen(false)} 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-4xl bg-[#111] border border-[#333] rounded-2xl p-8 flex flex-col items-center shadow-2xl"
                        >
                            <button onClick={() => setIsSimulatorOpen(false)} className="absolute top-4 right-4 text-white hover:text-[#00ff88] p-2 bg-black/50 rounded-full border border-white/10 transition-colors">
                                <X size={20} />
                            </button>
                            <h3 className="text-2xl font-bold uppercase tracking-widest text-[#00ff88] mb-8">Shoe Lifecycle Simulator</h3>
                            <div className="w-full aspect-[5/3] relative mb-8 bg-transparent rounded-xl flex items-center justify-center">
                                <img
                                    src={(() => {
                                        switch(lifecycleStage) {
                                            case 0: return product.lifecycle_images.normal;
                                            case 1: return product.lifecycle_images.m3;
                                            case 2: return product.lifecycle_images.m6;
                                            case 3: return product.lifecycle_images.m12;
                                            default: return product.image;
                                        }
                                    })()}
                                    alt="Lifecycle Simulation"
                                    className="max-w-full max-h-full object-contain transition-all duration-300 drop-shadow-2xl"
                                />
                            </div>
                            <div className="w-full max-w-2xl bg-black p-6 rounded-xl border border-[#333]">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="3" 
                                    step="1"
                                    value={lifecycleStage}
                                    onChange={(e) => setLifecycleStage(parseInt(e.target.value))}
                                    className="w-full accent-[#00ff88] cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-300 font-mono mt-4 uppercase tracking-widest">
                                    <span className={`transition-colors ${lifecycleStage === 0 ? 'text-[#00ff88] font-bold' : ''}`}>New</span>
                                    <span className={`transition-colors ${lifecycleStage === 1 ? 'text-[#00ff88] font-bold' : ''}`}>3 Months</span>
                                    <span className={`transition-colors ${lifecycleStage === 2 ? 'text-[#00ff88] font-bold' : ''}`}>6 Months</span>
                                    <span className={`transition-colors ${lifecycleStage === 3 ? 'text-[#00ff88] font-bold' : ''}`}>1 Year</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 3D Preview Popup */}
            <AnimatePresence>
                {is3dPreviewOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer" 
                            onClick={() => setIs3dPreviewOpen(false)} 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-5xl h-[80vh] bg-[#111] border border-[#333] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setIs3dPreviewOpen(false)} className="absolute top-4 right-4 z-10 text-white hover:text-[#00ff88] p-2 bg-black/50 rounded-full border border-white/10 transition-colors">
                                <X size={20} />
                            </button>
                            <div className="p-8 border-b border-[#333] shrink-0 bg-[#0a0a0a]">
                                <h3 className="text-2xl font-bold uppercase tracking-widest text-[#00ff88]">3D Product Preview</h3>
                                <p className="text-sm text-gray-400 font-mono mt-2">Drag to rotate • Scroll to zoom</p>
                            </div>
                            <div className="flex-grow w-full relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
                                {getModelUrl(product.name) ? (
                                    <ShoeModel url={getModelUrl(product.name)} />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#0a0a0a]">
                                        <Box size={48} className="text-[#333] mb-4" />
                                        <h4 className="text-xl font-bold uppercase text-white tracking-widest mb-2">3D Model Not Yet Created</h4>
                                        <p className="text-gray-500 font-mono text-sm max-w-sm">
                                            The interactive 3D preview for {product.name} is currently in development. Please check back later.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};

export default ProductModal;
