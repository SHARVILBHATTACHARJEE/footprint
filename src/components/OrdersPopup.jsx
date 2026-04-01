import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader, CheckCircle2 } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const OrdersPopup = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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
                                    
                                    <div className="mt-6 pt-4 border-t border-[#333] flex justify-between items-center">
                                        <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Total Paid</span>
                                        <span className="text-2xl font-black text-white">₹{order.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OrdersPopup;
