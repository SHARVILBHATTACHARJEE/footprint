import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, X, Loader2, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getUserTickets, addTicket } from '../firebase/firestore';

const HelpCenter = () => {
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [ticketData, setTicketData] = useState({
        subject: '',
        category: 'Order Issue',
        description: ''
    });

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            const parsedUser = JSON.parse(userString);
            setUser(parsedUser);
            fetchTickets(parsedUser.id);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchTickets = async (userId) => {
        setLoading(true);
        try {
            const userTickets = await getUserTickets(userId);
            setTickets(userTickets);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPopup = () => setIsPopupOpen(true);
    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setTicketData({ subject: '', category: 'Order Issue', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addTicket(user.id, ticketData);
            await fetchTickets(user.id);
            handleClosePopup();
        } catch (error) {
            console.error("Error raising ticket:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Resolved': return <CheckCircle className="text-green-500" size={16} />;
            case 'In Progress': return <Clock className="text-yellow-500" size={16} />;
            default: return <AlertCircle className="text-blue-500" size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6 md:px-12 selection:bg-[#00ff88] selection:text-black">
            <div className="max-w-5xl mx-auto space-y-16">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mix-blend-difference pb-2">
                        Help <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00cc6a] inline-block">Center</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                        Need assistance? We're here for you. Find answers, manage your tickets, or reach out to our dedicated support team directly.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl flex items-center gap-4 hover:border-[#00ff88]/30 transition-colors group">
                            <div className="bg-[#00ff88]/10 p-3 rounded-xl group-hover:bg-[#00ff88]/20 transition-colors">
                                <Mail className="text-[#00ff88]" size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Email Us</p>
                                <a href="mailto:support@footprint.com" className="text-white hover:text-[#00ff88] transition-colors text-sm md:text-base font-medium">support@footprint.com</a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tickets Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-zinc-900/50 outline outline-1 outline-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
                >
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ff88]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <MessageCircle className="text-[#00ff88]" /> Your Tickets
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">Track the status of your reported issues.</p>
                        </div>
                        
                        {user && (
                            <button 
                                onClick={handleOpenPopup}
                                className="bg-[#00ff88] text-black hover:bg-[#00cc6a] hover:scale-105 transition-all text-sm font-black uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 w-fit shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                            >
                                <Plus size={18} /> Raise Ticket
                            </button>
                        )}
                    </div>

                    {!user ? (
                        <div className="text-center py-16 bg-black/40 rounded-3xl border border-white/5 border-dashed">
                            <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
                            <p className="text-gray-400 font-medium mb-4">Please log in to view or raise support tickets.</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Access your profile from the top right</p>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center items-center py-24">
                            <Loader2 className="animate-spin text-[#00ff88]" size={32} />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-16 bg-black/40 rounded-3xl border border-white/5 border-dashed">
                            <MessageCircle className="mx-auto text-gray-600 mb-4" size={48} />
                            <p className="text-gray-400 font-medium">You don't have any support tickets yet.</p>
                            <p className="text-gray-500 text-sm mt-2">If you encounter any issues, feel free to raise one!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {tickets.map(ticket => (
                                <div 
                                    key={ticket.id} 
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="bg-black/60 border border-white/5 hover:border-[#00ff88]/20 transition-all rounded-2xl p-6 relative group overflow-hidden cursor-pointer"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00ff88] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black uppercase tracking-widest text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full">{ticket.category}</span>
                                                <span className="text-[10px] text-gray-500 font-mono">ID: {ticket.id.substring(0, 8).toUpperCase()}</span>
                                            </div>
                                            <h3 className="text-lg font-bold">{ticket.subject}</h3>
                                            <p className="text-sm text-gray-400 line-clamp-2 md:max-w-2xl">{ticket.description}</p>
                                        </div>
                                        <div className="flex flex-col items-start md:items-end justify-between min-w-[120px]">
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                {getStatusIcon(ticket.status)}
                                                <span className="text-xs font-medium">{ticket.status || 'Open'}</span>
                                            </div>
                                            {ticket.createdAt && (
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-4 md:mt-0">
                                                    {new Date(ticket.createdAt?.toDate ? ticket.createdAt.toDate() : Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Raise Ticket Popup */}
            <AnimatePresence>
                {isPopupOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={handleClosePopup}
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,255,136,0.1)] overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00ff88]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Raise a <span className="text-[#00ff88]">Ticket</span></h3>
                                    <p className="text-xs text-gray-400 mt-1">Describe your issue and we'll help you out.</p>
                                </div>
                                <button onClick={handleClosePopup} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">Category</label>
                                    <select 
                                        value={ticketData.category}
                                        onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-white appearance-none focus:outline-none focus:border-[#00ff88] transition-colors cursor-pointer"
                                    >
                                        <option value="Order Issue">Order Issue</option>
                                        <option value="Product Quality">Product Quality</option>
                                        <option value="Shipping & Delivery">Shipping & Delivery</option>
                                        <option value="Account Access">Account Access</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">Subject</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Brief summary of the issue"
                                        value={ticketData.subject}
                                        onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-gray-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">Description</label>
                                    <textarea 
                                        required
                                        rows="4"
                                        placeholder="Please provide details about your issue..."
                                        value={ticketData.description}
                                        onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-[#00ff88] transition-colors resize-none placeholder:text-gray-700"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="animate-spin" size={20} /> Submitting</>
                                    ) : 'Submit Ticket'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {selectedTicket && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedTicket(null)}
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,255,136,0.1)] overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold">{selectedTicket.subject}</h3>
                                    <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">{selectedTicket.category}</p>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#00ff88] mb-2">Description</p>
                                    <div className="bg-[#111] border border-white/5 p-4 rounded-xl text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {selectedTicket.description}
                                    </div>
                                </div>

                                {selectedTicket.status === 'Resolved' && selectedTicket.answer ? (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Support Response</p>
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-sm text-blue-100 leading-relaxed whitespace-pre-wrap">
                                            {selectedTicket.answer}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-2">Status</p>
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-sm text-yellow-200">
                                            This ticket is currently under review by our team. Please check back later.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HelpCenter;
