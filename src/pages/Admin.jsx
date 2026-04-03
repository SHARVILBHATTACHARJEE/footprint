import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Box, Truck, Check } from 'lucide-react';

const STAGES = [
    "Order Confirmed",
    "Processing (Picking + Packing)",
    "Shipped / Assigned Rider",
    "Out for Delivery",
    "Near You",
    "Delivered"
];

const Admin = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllOrders = async () => {
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(fetched);
        } catch (err) {
            console.error(err);
            // Fallback without sort if composite index is missing
            try {
                const fallbackQ = query(collection(db, 'orders'));
                const fallbackSnap = await getDocs(fallbackQ);
                const fallbackOrders = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Local sort
                fallbackOrders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                setOrders(fallbackOrders);
            } catch (fbErr) {
                console.error(fbErr);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const updateStage = async (orderId, newStage) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { trackingStage: parseInt(newStage) });
            setOrders(orders.map(o => o.id === orderId ? { ...o, trackingStage: parseInt(newStage) } : o));
        } catch (error) {
            alert("Error updating order stage");
        }
    };

    return (
        <div className="pt-24 min-h-screen px-4 max-w-6xl mx-auto pb-24">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Truck className="text-[#00ff88]" size={36} /> Local Dispatch Admin
            </h1>
            
            {loading ? (
                <p className="text-[#00ff88] font-mono animate-pulse">Fetching system orders...</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-[#111] border border-[#333] p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-gray-500">
                            <div className="flex-1">
                                <p className="text-xs text-[#00ff88] font-bold uppercase tracking-widest bg-[#00ff88]/10 inline-block px-2 py-1 flex items-center gap-2 rounded">
                                    <Box size={14} /> ORDER ID: <span className="font-mono text-white">{order.id}</span>
                                </p>
                                <div className="mt-3">
                                    <p className="text-white font-bold uppercase tracking-wide">{order.receiverName} <span className="text-gray-500 font-mono text-xs">({order.deliveryMobile})</span></p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-lg leading-relaxed">{order.deliveryAddress}</p>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-auto min-w-[280px] bg-black p-4 rounded-xl border border-[#222]">
                                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2 flex items-center justify-between">
                                    Current Stage 
                                    <span className="text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded text-[10px]">{order.trackingStage || 0}/5</span>
                                </p>
                                <select 
                                    value={order.trackingStage || 0}
                                    onChange={(e) => updateStage(order.id, e.target.value)}
                                    className="bg-[#111] border border-[#444] text-white p-3 rounded-lg text-xs uppercase font-bold focus:border-[#00ff88] outline-none w-full w-full cursor-pointer hover:border-gray-400 transition-colors"
                                >
                                    {STAGES.map((stage, idx) => (
                                        <option key={idx} value={idx}>{idx}: {stage}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                    
                    {orders.length === 0 && (
                        <p className="text-gray-500 font-mono border border-dashed border-[#333] p-12 text-center rounded-xl bg-[#0a0a0a]">No robust order history detected.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;
