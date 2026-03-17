import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const { toggleCart, cartCount } = useCart();

    // Check for logged-in user
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed top-0 left-0 w-full z-[100] px-4 md:px-8 py-6 pointer-events-none flex justify-between items-center"
        >
            {/* Left Spacer to maintain flex layout for the right items */}
            <div className="w-1/4"></div>

            {/* Center - Expanding Logo Menu */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto z-50 flex justify-center max-w-[90vw]">
                <motion.div
                    layout
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    onClick={() => setIsHovered(!isHovered)}
                    className="flex items-center gap-4 md:gap-8 bg-black/50 backdrop-blur-xl border border-white/10 px-6 py-3 md:px-8 cursor-pointer overflow-x-auto shadow-2xl custom-scrollbar"
                    style={{ borderRadius: 9999 }}
                >
                    <motion.div layout className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white whitespace-nowrap">Footprint.</Link>
                    </motion.div>

                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, width: 0, x: -20 }}
                                animate={{ opacity: 1, width: "auto", x: 0 }}
                                exit={{ opacity: 0, width: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex items-center gap-4 md:gap-8 text-xs md:text-sm uppercase tracking-widest font-bold whitespace-nowrap overflow-hidden"
                            >
                                <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}>About</Link>
                                <Link to="/shop" className={`transition-colors ${location.pathname === '/shop' ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}>Shop</Link>
                                <Link to="/compare" className={`transition-colors ${location.pathname === '/compare' ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}>Compare</Link>
                                <Link to="/smart-fit" className={`transition-colors ${location.pathname === '/smart-fit' ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}>Smart Fit™</Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Right - Profile & Cart */}
            <div className="flex justify-end items-center gap-3 md:gap-4 pointer-events-auto z-50">
                <button
                    onClick={toggleCart}
                    className="relative p-3 text-white hover:text-[#00ff88] transition-colors flex items-center justify-center bg-black/50 backdrop-blur-xl border border-white/10 rounded-full"
                >
                    <ShoppingBag size={20} />
                    <AnimatePresence>
                        {cartCount > 0 && (
                            <motion.div
                                key={cartCount}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: [1.5, 1], opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute -top-1 -right-1 bg-[#00ff88] text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                            >
                                {cartCount}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                {user ? (
                    <div className="px-4 py-3 md:px-6 md:py-2.5 bg-black/50 backdrop-blur-xl border border-[#00ff88] text-[#00ff88] rounded-full flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(0,255,136,0.15)]">
                        <User size={16} /> <span className="hidden md:inline">Hello, {user.firstName}</span>
                    </div>
                ) : (
                    <Link to="/login" className="px-4 py-3 md:px-6 md:py-2.5 bg-black/50 backdrop-blur-xl border border-white/10 text-white rounded-full hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest font-bold">
                        <User size={16} /> <span className="hidden md:inline">Sign In</span>
                    </Link>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
