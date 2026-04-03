import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader, CheckCircle2, Truck } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const OrdersPopup = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [trackingOrder, setTrackingOrder] = useState(null);

    const STAGES = [
        "Order Confirmed",
        "Processing (Picking + Packing)",
        "Shipped / Assigned Rider",
        "Out for Delivery",
        "Near You",
        "Delivered"
    ];

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        } else {
            setOrders([]);
            setIsLoading(true);
            setError('');
        }
    }, [isOpen]);

    const fetchOrders = async () => {
        try {
            const userString = localStorage.getItem('user');
            if (!userString) {
                setError('You must be logged in to view orders.');
                setIsLoading(false);
                return;
            }

            const user = JSON.parse(userString);
            
            // Query orders
            const q = query(
                collection(db, 'orders'),
                where('userId', '==', user.id),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const fetchedOrders = [];
            querySnapshot.forEach((doc) => {
                fetchedOrders.push({ id: doc.id, ...doc.data() });
            });

            setOrders(fetchedOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            
            // Handle composite index error gracefully
            if (err.message && err.message.includes('index')) {
                try {
                    const fallbackQ = query(collection(db, 'orders'), where('userId', '==', JSON.parse(localStorage.getItem('user')).id));
                    const snap = await getDocs(fallbackQ);
                    const fallbackOrders = [];
                    snap.forEach(doc => fallbackOrders.push({ id: doc.id, ...doc.data() }));
                    // Sort locally
                    fallbackOrders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                    setOrders(fallbackOrders);
                } catch (fallbackErr) {
                    setError('Failed to load orders.');
                }
            } else {
                setError('Failed to load orders.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-2xl bg-[#111] border border-[#333] p-8 md:p-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-8 shrink-0">
                        <h2 className="text-3xl font-black uppercase text-white tracking-tight mb-2 flex items-center gap-3">
                            <Package className="text-[#00ff88]" /> Your Orders
                        </h2>
                        <p className="text-gray-400 text-sm font-mono leading-relaxed">
                            Track and view your recent purchases.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-[#00ff88]">
                                <Loader className="animate-spin mb-4" size={40} />
                                <p className="font-mono text-sm text-gray-400">Loading your history...</p>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-mono">
                                {error}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                                <Package size={48} className="mb-4 text-gray-600" />
                                <p className="font-mono text-sm uppercase tracking-widest text-white mt-4">No orders found.</p>
                                <p className="text-xs text-gray-500 font-mono mt-2">Looks like you haven't bought anything yet.</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 transition-all hover:border-[#444] group shadow-lg">
                                    <div className="flex flex-wrap justify-between items-start mb-6 gap-4 border-b border-[#333] pb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-mono mb-1">ORDER ID</p>
                                            <p className="font-mono text-white text-sm uppercase bg-black px-2 py-1 rounded inline-block border border-[#333]">
                                                {order.id.slice(0, 10)}...
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 font-mono mb-1">DATE</p>
                                            <p className="text-sm text-white font-mono">
                                                {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-mono mb-1">STATUS</p>
                                            <p className="text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1 text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
                                                <CheckCircle2 size={12} /> {order.status || 'Paid'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 items-center bg-black/50 p-3 rounded-lg border border-[#222]">
                                                <div className="w-16 h-16 bg-black rounded-md overflow-hidden shrink-0 border border-[#333]">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold uppercase text-sm">{item.name}</h4>
                                                    <p className="text-xs text-gray-400 font-mono uppercase mt-1">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[#00ff88] font-bold text-lg">₹{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-6 pt-4 border-t border-[#333] flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex gap-4 items-center">
                                            <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Total Paid</span>
                                            <span className="text-2xl font-black text-white">₹{order.totalAmount?.toFixed(2)}</span>
                                        </div>
                                        <button 
                                            onClick={() => setTrackingOrder(order)}
                                            className="bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 border border-[#00ff88]/30 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                                        >
                                            <Truck size={16} /> Track Order
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Tracking Modal Overlay */}
            <AnimatePresence>
                {trackingOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#111] border border-[#333] w-full max-w-4xl rounded-2xl p-6 md:p-8 relative shadow-[0_0_40px_rgba(0,255,136,0.1)] max-h-[90vh] flex flex-col"
                        >
                            <button 
                                onClick={() => setTrackingOrder(null)}
                                className="absolute top-5 right-5 text-gray-500 hover:text-white z-10 bg-[#111] p-1 rounded-full"
                            >
                                <X size={20} />
                            </button>
                            <div className="shrink-0">
                                <h3 className="text-xl font-black uppercase text-white mb-6 flex items-center gap-3 border-b border-[#222] pb-4">
                                    <Truck className="text-[#00ff88]" size={24} /> Tracking Details
                                </h3>
                            </div>

                            <div className="overflow-y-auto scrollbar-hide flex-1 pt-2 pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Side: Order Details */}
                                    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#222] h-fit shadow-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Order ID</p>
                                                <p className="font-mono text-white text-xs">{trackingOrder.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Total</p>
                                                <p className="font-bold text-[#00ff88] text-sm">₹{trackingOrder.totalAmount?.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-[#333] pt-4 mb-4">
                                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Date of Order</p>
                                            <p className="text-white text-xs font-bold">
                                                {trackingOrder.createdAt ? new Date(trackingOrder.createdAt.toMillis()).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : 'Processing...'}
                                            </p>
                                        </div>
                                        <div className="border-t border-[#333] pt-4 mb-4">
                                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Delivery Address</p>
                                            <p className="text-white text-xs font-bold">{trackingOrder.receiverName}</p>
                                            <p className="text-gray-400 text-xs mt-1 leading-relaxed">{trackingOrder.deliveryAddress}</p>
                                        </div>
                                        <div className="border-t border-[#333] pt-4">
                                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Items</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {trackingOrder.items?.map((item, idx) => (
                                                    <div key={idx} className="flex gap-3 items-center bg-black p-2 rounded-lg border border-[#333] pr-4 relative group">
                                                        <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-white font-bold max-w-[120px] truncate">{item.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Tracking Stages */}
                                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222] shadow-lg">
                                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-6">Delivery Status</p>
                                        <div className="relative border-l-2 border-[#333] ml-4 space-y-8 pb-4">
                                            {STAGES.map((stage, idx) => {
                                                const currentStage = trackingOrder.trackingStage || 0;
                                                const isCompleted = idx <= currentStage;
                                                const isActive = idx === currentStage;
                                                return (
                                                    <div key={idx} className="relative pl-8">
                                                        <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-4 border-[#1a1a1a] ${isCompleted ? 'bg-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.8)]' : 'bg-[#444]'}`}></div>
                                                        <h4 className={`text-sm tracking-widest uppercase font-bold relative -top-1 ${isActive ? 'text-[#00ff88]' : isCompleted ? 'text-white' : 'text-gray-600'}`}>{stage}</h4>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 mt-6 pt-4 border-t border-[#222]">
                                <button 
                                    onClick={() => setTrackingOrder(null)}
                                    className="w-full bg-[#222] hover:bg-[#333] text-white uppercase tracking-widest text-xs font-bold py-3 rounded-lg transition-colors border border-[#333]"
                                >
                                    Close Tracker
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};

export default OrdersPopup;
