import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Tag, BadgePercent, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const CheckoutPopup = ({ isOpen, onClose, subtotal }) => {
    const { cartItems, clearCart, setIsCartOpen } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountMessage, setDiscountMessage] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Hardcoded allowed coupons for demo purposes
    const ALLOWED_COUPONS = {
        'DISCOUNT10': 0.10, // 10% off
        'FOOTPRINT20': 0.20, // 20% off
    };

    const handleApplyCoupon = () => {
        setIsApplyingCoupon(true);
        setTimeout(() => {
            const code = couponCode.toUpperCase();
            if (ALLOWED_COUPONS[code]) {
                const discountAmount = subtotal * ALLOWED_COUPONS[code];
                setDiscount(discountAmount);
                setDiscountMessage(`Coupon applied successfully! ${ALLOWED_COUPONS[code] * 100}% off.`);
            } else {
                setDiscount(0);
                setDiscountMessage('Invalid coupon code.');
            }
            setIsApplyingCoupon(false);
        }, 500); // Simulate API call delay
    };

    // Calculations
    const finalSubtotal = Math.max(0, subtotal - discount);
    const gstAmount = finalSubtotal * 0.18; // 18% GST
    const totalAmount = finalSubtotal + gstAmount;

    // Load Razorpay Script
    useEffect(() => {
        if (isOpen) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            return () => {
                const rzpScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
                if (rzpScript) {
                    document.body.removeChild(rzpScript);
                }
            }
        }
    }, [isOpen]);

    const handlePayment = () => {
        if (!window.Razorpay) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        // Razorpay Options
        const options = {
            key: "rzp_live_SS8h9b60Qjn3fn", // Enter the Key ID generated from the Dashboard
            amount: Math.round(totalAmount * 100), // Amount is in currency subunits (paise)
            currency: "INR",
            name: "Footprint Store",
            description: "Footwear Purchase",
            image: "https://your-logo-url.com/logo.png", // Replace with your actual logo
            // order_id: "order_9A33XWu170gUtm", // Typically generated on the backend, skipped for frontend demo
            handler: async function (response) {
                // Payment Success callback
                console.log(response.razorpay_payment_id);
                
                try {
                    // Save Order to Firestore
                    const userString = localStorage.getItem('user');
                    const user = userString ? JSON.parse(userString) : null;
                    
                    if (user && user.id) {
                        await addDoc(collection(db, 'orders'), {
                            userId: user.id,
                            paymentId: response.razorpay_payment_id,
                            items: cartItems,
                            subtotal: subtotal,
                            discount: discount,
                            totalAmount: totalAmount,
                            status: 'Paid',
                            createdAt: serverTimestamp()
                        });
                    }
                } catch (error) {
                    console.error("Error saving order: ", error);
                }

                clearCart();
                onClose();
                setIsCartOpen(false); // Close cart sidebar too

                // Show a nice success modal or alert
                alert("Payment Successful! Thank you for your purchase.");
            },
            prefill: {
                name: "Customer Name",
                email: "customer@example.com",
                contact: "9999999999"
            },
            notes: {
                address: "Footprint Store Office"
            },
            theme: {
                color: "#161616" // Match site theme
            }
        };

        const rzp1 = new window.Razorpay(options);

        rzp1.on('payment.failed', function (response) {
            alert(`Payment Failed: ${response.error.description}`);
        });

        rzp1.open();
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-[#333] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-[#222]">
                                <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3 text-white">
                                    <ShieldCheck className="text-[#00ff88]" /> Secure Checkout
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors bg-[#111] p-2 rounded-full hover:bg-[#222]"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Coupon Section */}
                                <div className="space-y-3">
                                    <label className="text-sm text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
                                        <Tag size={16} /> Have a coupon code?
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Enter code (e.g. DISCOUNT10)"
                                            className="flex-1 bg-[#111] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00ff88] transition-colors uppercase"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={isApplyingCoupon || !couponCode}
                                            className="bg-[#222] text-white px-6 py-3 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wider"
                                        >
                                            {isApplyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {discountMessage && (
                                        <p className={`text-sm ${discountMessage.includes('successfully') ? 'text-[#00ff88]' : 'text-red-500'}`}>
                                            {discountMessage}
                                        </p>
                                    )}
                                </div>

                                {/* Order Summary */}
                                <div className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-4">
                                    <h3 className="text-white font-bold uppercase tracking-wide border-b border-[#222] pb-3 mb-4">Order Summary</h3>

                                    <div className="flex justify-between text-gray-300">
                                        <span>Items Subtotal ({cartItems.length})</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="flex justify-between text-[#00ff88]">
                                            <span className="flex items-center gap-1"><BadgePercent size={16} /> Discount</span>
                                            <span>-₹{discount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-300">
                                        <span>GST (18%)</span>
                                        <span>₹{gstAmount.toFixed(2)}</span>
                                    </div>

                                    <div className="border-t border-[#333] pt-4 mt-4 flex justify-between items-center">
                                        <span className="text-lg text-white font-bold uppercase">Total to Pay</span>
                                        <span className="text-2xl font-bold text-[#00ff88]">₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Payment Button */}
                            <div className="p-6 border-t border-[#222] bg-[#050505]">
                                <button
                                    onClick={handlePayment}
                                    className="w-full bg-[#00ff88] text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-[#00cc6a] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                                >
                                    <CreditCard size={20} />
                                    Pay ₹{totalAmount.toFixed(2)}
                                </button>
                                <p className="text-center text-xs text-gray-500 mt-4 font-mono">Secured by Razorpay</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CheckoutPopup;
