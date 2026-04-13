import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Box, Truck, Check, MessageSquare, Send } from 'lucide-react';
import { getAllTickets, resolveTicket } from '../firebase/firestore';

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
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ticketAnswers, setTicketAnswers] = useState({});

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

    const fetchTickets = async () => {
        try {
            const fetched = await getAllTickets();
            setTickets(fetched);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAllOrders();
        fetchTickets();
    }, []);

    const handleResolveTicket = async (ticketId) => {
        const answer = ticketAnswers[ticketId];
        if (!answer) return;
        try {
            await resolveTicket(ticketId, answer);
            setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved', answer } : t));
        } catch (err) {
            alert("Error resolving ticket");
        }
    };

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

            {/* Tickets Section */}
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mt-16 mb-8 flex items-center gap-3 border-t border-[#333] pt-12">
                <MessageSquare className="text-blue-500" size={30} /> Support Tickets
            </h2>

            {loading ? (
                <p className="text-blue-500 font-mono animate-pulse">Fetching tickets...</p>
            ) : (
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-[#111] border border-[#333] p-6 rounded-xl flex flex-col md:flex-row justify-between items-start gap-4 transition-all hover:border-gray-500">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded">{ticket.category}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${ticket.status === 'Resolved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <h3 className="text-white font-bold text-lg">{ticket.subject}</h3>
                                <p className="text-sm text-gray-400 mt-1 mb-4 max-w-2xl leading-relaxed">{ticket.description}</p>
                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                                    User ID: {ticket.userId} | Ticket ID: {ticket.id}
                                </p>
                            </div>
                            
                            <div className="w-full md:w-1/3 min-w-[280px] bg-black p-4 rounded-xl border border-[#222]">
                                {ticket.status === 'Resolved' ? (
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">Admin Answer</p>
                                        <p className="text-sm text-green-400 font-medium whitespace-pre-wrap">{ticket.answer}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 relative">
                                        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1">Reply & Resolve</p>
                                        <textarea 
                                            rows="3"
                                            placeholder="Write your answer..."
                                            value={ticketAnswers[ticket.id] || ''}
                                            onChange={(e) => setTicketAnswers(prev => ({...prev, [ticket.id]: e.target.value}))}
                                            className="bg-[#111] border border-[#444] text-white p-3 rounded-lg text-sm focus:border-blue-500 outline-none w-full resize-none transition-colors"
                                        />
                                        <button 
                                            disabled={!ticketAnswers[ticket.id]}
                                            onClick={() => handleResolveTicket(ticket.id)}
                                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-2 px-4 rounded-lg flex items-center justify-center gap-2 mt-2 transition-colors text-xs"
                                        >
                                            <Send size={14} /> Resolve 
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {tickets.length === 0 && (
                        <p className="text-gray-500 font-mono border border-dashed border-[#333] p-12 text-center rounded-xl bg-[#0a0a0a]">No pending tickets.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;
