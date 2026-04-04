import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Tag, BadgePercent, ShieldCheck, MapPin, Plus, ArrowLeft, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import emailjs from '@emailjs/browser';
import AuthPopup from './AuthPopup';
import AuthChoicePopup from './AuthChoicePopup';

const initialAddressState = {
    fullName: '',
    mobile: '',
    pincode: '',
    flatBuilding: '',
    areaStreet: '',
    landmark: '',
    townCity: '',
    state: ''
};

const CheckoutPopup = ({ isOpen, onClose, subtotal }) => {
    const { cartItems, clearCart, setIsCartOpen } = useCart();

    // Step state
    const [step, setStep] = useState(1); // 1 = Address, 2 = Payment

    // Address list state
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [addressForm, setAddressForm] = useState(initialAddressState);
    const [addressErrors, setAddressErrors] = useState({});

    // Payment Modal State
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState('');

    // Auth state for guests
    const [isAuthChoiceOpen, setIsAuthChoiceOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isAuthLogin, setIsAuthLogin] = useState(true);

    const handleClosePaymentPopup = () => {
        if (paymentStatus === 'success') {
            clearCart();
            onClose();
            setIsCartOpen(false);
        }
        setPaymentStatus(null);
        setPaymentMessage('');
    };

    // Payment/Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountMessage, setDiscountMessage] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Reset state & fetch when opened
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            fetchAddresses();
        }
    }, [isOpen]);

    const fetchAddresses = async () => {
        setIsLoadingAddresses(true);
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;

        if (!user || !user.id) {
            setIsLoadingAddresses(false);
            return;
        }

        try {
            const q = query(collection(db, 'addresses'), where('userId', '==', user.id));
            const querySnapshot = await getDocs(q);
            const loadedAddresses = [];
            querySnapshot.forEach((doc) => {
                loadedAddresses.push({ id: doc.id, ...doc.data() });
            });
            setAddresses(loadedAddresses);
            if (loadedAddresses.length > 0) {
                setSelectedAddressId(loadedAddresses[0].id);
                setIsFormOpen(false);
            } else {
                setIsFormOpen(true);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const validateAddress = () => {
        let errors = {};
        if (!addressForm.fullName.trim()) errors.fullName = "Required";
        if (!/^\d{10}$/.test(addressForm.mobile)) errors.mobile = "10-digit number required";
        if (!/^\d{6}$/.test(addressForm.pincode)) errors.pincode = "6-digit pincode required";
        if (!addressForm.flatBuilding.trim()) errors.flatBuilding = "Required";
        if (!addressForm.areaStreet.trim()) errors.areaStreet = "Required";
        if (!addressForm.townCity.trim()) errors.townCity = "Required";
        if (!addressForm.state.trim()) errors.state = "Required";

        setAddressErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setAddressForm((prev) => ({ ...prev, [name]: value }));
        // Clear error visually once typed
        if (addressErrors[name]) {
            setAddressErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const openEditForm = (addressObj, e) => {
        e.stopPropagation(); // Prevent card selection clicking wrapper
        setAddressForm({
            fullName: addressObj.fullName || '',
            mobile: addressObj.mobile || '',
            pincode: addressObj.pincode || '',
            flatBuilding: addressObj.flatBuilding || '',
            areaStreet: addressObj.areaStreet || '',
            landmark: addressObj.landmark || '',
            townCity: addressObj.townCity || '',
            state: addressObj.state || ''
        });
        setAddressErrors({});
        setEditingAddressId(addressObj.id);
        setIsFormOpen(true);
    };

    const openNewForm = () => {
        setAddressForm(initialAddressState);
        setAddressErrors({});
        setEditingAddressId(null);
        setIsFormOpen(true);
    };

    const handleDeleteAddress = (id, e) => {
        e.stopPropagation();
        setAddressToDelete(id);
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;
        try {
            await deleteDoc(doc(db, 'addresses', addressToDelete));
            setAddresses(addresses.filter(a => a.id !== addressToDelete));
            if (selectedAddressId === addressToDelete) setSelectedAddressId(null);
            setAddressToDelete(null);
        } catch (error) {
            console.error("Error deleting address:", error);
            alert("Failed to delete address.");
        }
    };

    const handleSaveAddress = async () => {
        if (!validateAddress()) return;

        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        if (!user || !user.id) {
            setIsAuthChoiceOpen(true);
            return;
        }

        try {
            if (editingAddressId) {
                // Update existing
                const docRef = doc(db, 'addresses', editingAddressId);
                await updateDoc(docRef, { ...addressForm, updatedAt: serverTimestamp() });

                setAddresses(addresses.map(a => a.id === editingAddressId ? { id: editingAddressId, userId: user.id, ...addressForm } : a));
                setSelectedAddressId(editingAddressId);
            } else {
                // Add new
                const docRef = await addDoc(collection(db, 'addresses'), {
                    userId: user.id,
                    ...addressForm,
                    createdAt: serverTimestamp()
                });

                const newAddr = { id: docRef.id, userId: user.id, ...addressForm };
                setAddresses([...addresses, newAddr]);
                setSelectedAddressId(docRef.id);
            }

            setIsFormOpen(false);
            setEditingAddressId(null);
            setAddressForm(initialAddressState);
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address.");
        }
    };

    // Coupons
    const ALLOWED_COUPONS = {
        'DISCOUNT10': 0.10,
        'FOOTPRINT20': 0.20,
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
        }, 500);
    };

    // Calculations
    const finalSubtotal = Math.max(0, subtotal - discount);
    const gstAmount = finalSubtotal * 0.18;
    const totalAmount = finalSubtotal + gstAmount;

    // Load Razorpay Script
    useEffect(() => {
        if (isOpen && step === 2) {
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
    }, [isOpen, step]);

    const handlePayment = () => {
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        const selectedAddr = addresses.find(a => a.id === selectedAddressId);

        if (!window.Razorpay) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const options = {
            key: "rzp_test_SZ0SmSLgmoZ4ki",
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            name: "Footprint Store",
            description: "Footwear Purchase",
            image: "https://your-logo-url.com/logo.png",
            handler: async function (response) {
                try {
                    if (user && user.id) {
                        const formattedAddress = `${selectedAddr.flatBuilding}, ${selectedAddr.areaStreet}, ${selectedAddr.townCity}, ${selectedAddr.state} - ${selectedAddr.pincode}`;
                        const docRef = await addDoc(collection(db, 'orders'), {
                            userId: user.id,
                            paymentId: response.razorpay_payment_id,
                            items: cartItems,
                            subtotal: subtotal,
                            discount: discount,
                            totalAmount: totalAmount,
                            status: 'Paid',
                            deliveryAddress: formattedAddress,
                            deliveryMobile: selectedAddr?.mobile || 'N/A',
                            receiverName: selectedAddr?.fullName || 'N/A',
                            trackingStage: 0,
                            createdAt: serverTimestamp()
                        });

                        // ---------------------------------------------
                        // EmailJS Order Confirmation Integration
                        // ---------------------------------------------
                        try {
                            const itemsHtmlString = cartItems.map(item => `
                                <tr>
                                    <td style="padding: 12px 5px; border-bottom: 1px solid #222;">
                                        <div style="font-weight: 900; color: #ffffff; text-transform: uppercase;">${item.name}</div>
                                        <div style="font-size: 11px; color: #888; font-family: monospace; margin-top: 4px;">Qty: ${item.quantity}</div>
                                    </td>
                                    <td style="padding: 12px 5px; border-bottom: 1px solid #222; text-align: right; color: #00ff88; font-weight: bold; font-family: monospace;">
                                        ₹${(item.price * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            `).join('');

                            const templateParams = {
                                to_name: selectedAddr?.fullName || user?.name || "Customer",
                                to_email: user.email, 
                                order_id: docRef.id,
                                total_amount: totalAmount.toFixed(2),
                                delivery_address: formattedAddress,
                                order_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
                                items_html: itemsHtmlString
                            };

                            // Replace these placeholder strings with your actual EmailJS credentials
                            // Try finding them at: https://dashboard.emailjs.com/admin
                            await emailjs.send(
                                import.meta.env.VITE_EMAILJS_SERVICE_ID,    
                                import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID,   
                                templateParams,
                                import.meta.env.VITE_EMAILJS_PUBLIC_KEY     
                            );
                            console.log("Confirmation email sent successfully!");
                        } catch (emailError) {
                            console.error("Failed to send confirmation email:", emailError);
                        }
                    }
                } catch (error) {
                    console.error("Error saving order: ", error);
                }

                setPaymentStatus('success');
                setPaymentMessage('Your order has been placed successfully. Thank you!');
            },
            prefill: {
                name: selectedAddr?.fullName || user?.name || "Customer Name",
                email: user?.email || "customer@example.com",
                contact: selectedAddr?.mobile || "9999999999"
            },
            notes: {
                address: selectedAddr ? `${selectedAddr.flatBuilding}, ${selectedAddr.areaStreet}, ${selectedAddr.townCity}, ${selectedAddr.state} - ${selectedAddr.pincode}` : "Store Address"
            },
            theme: {
                color: "#161616"
            }
        };

        const rzp1 = new window.Razorpay(options);

        rzp1.on('payment.failed', function (response) {
            setPaymentStatus('failed');
            setPaymentMessage(response.error.description || 'Payment was cancelled or failed.');
        });

        rzp1.open();
    };

    const renderInput = (name, placeholder, label, type = "text", gridSpan = 1) => (
        <div className={`space-y-1 md:col-span-${gridSpan}`}>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block">{label}</label>
            <input
                type={type}
                name={name}
                value={addressForm[name]}
                onChange={handleFormChange}
                placeholder={placeholder}
                className={`w-full bg-[#0a0a0a] border ${addressErrors[name] ? 'border-red-500' : 'border-[#333]'} rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88] transition-colors`}
            />
            {addressErrors[name] && <span className="text-[10px] text-red-500 font-bold">{addressErrors[name]}</span>}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0a0a0a] border border-[#333] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative"
                    >
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col h-full max-h-[85vh]"
                                >
                                    <div className="flex justify-between items-center p-5 border-b border-[#222] shrink-0">
                                        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter flex items-center gap-3 text-white">
                                            <MapPin className="text-[#00ff88]" /> Delivery Address
                                        </h2>
                                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-[#111] p-2 rounded-full hover:bg-[#222]">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-6 overflow-y-auto scrollbar-hide py-5 flex-1">
                                        {isLoadingAddresses ? (
                                            <p className="text-gray-500 font-mono text-sm text-center">Loading delivery options...</p>
                                        ) : (
                                            <>
                                                {!isFormOpen && addresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => setSelectedAddressId(addr.id)}
                                                        className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'border-[#222] bg-[#111] hover:border-gray-500'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-white font-bold tracking-tight">{addr.fullName}</p>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => openEditForm(addr, e)}
                                                                    className="text-gray-500 hover:text-[#00ff88] transition-colors bg-[#111] border border-[#333] p-1.5 rounded-md"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDeleteAddress(addr.id, e)}
                                                                    className="text-gray-500 hover:text-red-500 transition-colors bg-[#111] border border-[#333] p-1.5 rounded-md"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="text-gray-400 text-xs space-y-1">
                                                            <p>{addr.flatBuilding}, {addr.areaStreet}</p>
                                                            {addr.landmark && <p>{addr.landmark}</p>}
                                                            <p>{addr.townCity}, {addr.state} - <span className="text-white">{addr.pincode}</span></p>
                                                            <p className="mt-2 text-mono">Mobile: <span className="text-white font-bold">{addr.mobile}</span></p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {!isFormOpen && (
                                                    <button
                                                        onClick={openNewForm}
                                                        className="w-full py-4 border border-dashed border-[#333] text-gray-400 hover:text-[#00ff88] hover:border-[#00ff88] rounded-xl flex justify-center items-center gap-2 uppercase tracking-widest text-xs font-bold transition-all bg-[#111]/50 hover:bg-[#111]"
                                                    >
                                                        <Plus size={16} /> Add a new address
                                                    </button>
                                                )}

                                                {isFormOpen && (
                                                    <div className="bg-[#111] p-5 rounded-xl border border-[#222] space-y-4">
                                                        <h4 className="text-white text-sm uppercase tracking-widest font-bold border-b border-[#333] pb-3 mb-4">
                                                            {editingAddressId ? 'Update Delivery Option' : 'New Delivery Option'}
                                                        </h4>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {renderInput('fullName', 'Receiver Full Name', 'Full Name *')}
                                                            {renderInput('mobile', '10-digit mobile number', 'Mobile Number *')}
                                                            {renderInput('pincode', '6-digit Pincode', 'Pincode *')}
                                                            {renderInput('townCity', 'Town/City', 'Town/City *')}
                                                        </div>

                                                        {renderInput('flatBuilding', 'Flat, House no., Building, Company', 'Flat, House no., Building *')}
                                                        {renderInput('areaStreet', 'Area, Street, Sector, Village', 'Area, Street, Sector *')}

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {renderInput('landmark', 'E.g. Near Apollo Hospital', 'Landmark')}
                                                            {renderInput('state', 'State', 'State *')}
                                                        </div>

                                                        <div className="flex gap-3 pt-4 border-t border-[#333] mt-2">
                                                            {addresses.length > 0 && (
                                                                <button
                                                                    onClick={() => setIsFormOpen(false)}
                                                                    className="flex-1 py-3 text-gray-400 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors bg-[#1a1a1a] rounded-lg border border-[#333]"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={handleSaveAddress}
                                                                className={`bg-[#00ff88] hover:bg-[#00cc6a] text-black shrink-0 ${addresses.length === 0 ? 'w-full' : 'w-2/3'} rounded-lg py-3 uppercase tracking-widest text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)]`}
                                                            >
                                                                {editingAddressId ? 'Update Option' : 'Save Option'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {!isFormOpen && addresses.length > 0 && (
                                        <div className="p-5 border-t border-[#222] bg-[#050505] shrink-0">
                                            <button
                                                onClick={() => setStep(2)}
                                                disabled={!selectedAddressId}
                                                className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-[#00ff88] transition-all duration-300 disabled:opacity-50"
                                            >
                                                Continue to Payment
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-center p-6 border-b border-[#222]">
                                        <div className="flex items-center gap-4 text-white">
                                            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white transition-colors bg-[#111] p-2 rounded-full hover:bg-[#222] shrink-0">
                                                <ArrowLeft size={20} />
                                            </button>
                                            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
                                                <ShieldCheck className="text-[#00ff88]" /> Payment Summary
                                            </h2>
                                        </div>
                                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-[#111] p-2 rounded-full hover:bg-[#222] shrink-0">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
                                        <div className="bg-[#111]/50 border border-[#222] rounded-xl p-4 flex gap-3 text-gray-300">
                                            <MapPin size={16} className="text-[#00ff88] shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <p className="font-bold text-white mb-1">{addresses.find(a => a.id === selectedAddressId)?.fullName}</p>
                                                <p className="line-clamp-2">
                                                    {addresses.find(a => a.id === selectedAddressId)?.flatBuilding}, {addresses.find(a => a.id === selectedAddressId)?.areaStreet}, {addresses.find(a => a.id === selectedAddressId)?.townCity}, {addresses.find(a => a.id === selectedAddressId)?.state} - {addresses.find(a => a.id === selectedAddressId)?.pincode}
                                                </p>
                                                <p className="font-mono mt-1 text-[#00ff88] font-bold">{addresses.find(a => a.id === selectedAddressId)?.mobile}</p>
                                            </div>
                                        </div>

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
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Custom Delete Confirmation Popup */}
                    <AnimatePresence>
                        {addressToDelete && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-[#111] border border-[#333] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6"
                                >
                                    <h3 className="text-xl font-bold uppercase tracking-tighter text-white">Delete Address?</h3>
                                    <p className="text-gray-400 text-sm">Are you sure you want to permanently delete this delivery option? This action cannot be undone.</p>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setAddressToDelete(null)}
                                            className="flex-1 py-3 text-white uppercase tracking-widest text-xs font-bold transition-colors bg-[#222] rounded-xl hover:bg-[#333]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeleteAddress}
                                            className="flex-1 py-3 text-white uppercase tracking-widest text-xs font-bold transition-colors bg-red-500 rounded-xl hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Custom Payment Status Popup */}
                    <AnimatePresence>
                        {paymentStatus && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80] flex items-center justify-center p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center text-center space-y-4"
                                >
                                    {paymentStatus === 'success' ? (
                                        <div className="w-16 h-16 bg-[#00ff88]/10 rounded-full border border-[#00ff88]/30 flex items-center justify-center mb-2">
                                            <CheckCircle size={32} className="text-[#00ff88]" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-red-500/10 rounded-full border border-red-500/30 flex items-center justify-center mb-2">
                                            <XCircle size={32} className="text-red-500" />
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold uppercase tracking-tighter text-white">
                                        {paymentStatus === 'success' ? 'Payment Successful' : 'Payment Failed'}
                                    </h3>
                                    <p className="text-gray-400 text-sm font-mono">{paymentMessage}</p>
                                    <button 
                                        onClick={handleClosePaymentPopup}
                                        className={`w-full py-4 uppercase tracking-widest text-xs font-bold transition-all rounded-xl mt-4 ${paymentStatus === 'success' ? 'bg-[#00ff88] text-black hover:bg-[#00cc6a] shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}
                                    >
                                        {paymentStatus === 'success' ? 'Continue Shopping' : 'Try Again'}
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
            
            <AuthChoicePopup 
                isOpen={isAuthChoiceOpen}
                onClose={() => setIsAuthChoiceOpen(false)}
                onChoice={(choice) => {
                    setIsAuthLogin(choice);
                    setIsAuthChoiceOpen(false);
                    setIsAuthOpen(true);
                }}
            />
            
            <AuthPopup 
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                isInitialLogin={isAuthLogin}
                onSuccess={() => {
                    setIsAuthOpen(false);
                    setStep(2);
                }}
            />
        </AnimatePresence>
    );
};

export default CheckoutPopup;
