import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { logoutUser } from '../firebase/auth';
import AuthPopup from './AuthPopup';
import ProfilePopup from './ProfilePopup';
import OrdersPopup from './OrdersPopup';

const Navbar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
    const [isOrdersPopupOpen, setIsOrdersPopupOpen] = useState(false);
    const location = useLocation();
    const { toggleCart, cartCount } = useCart();

    // Check for logged-in user
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.removeItem('user');
            window.location.reload();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <>
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

                                <Link to="/shop" className={`transition-colors ${location.pathname === '/shop' ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}>Shop</Link>
                                <Link to="/compare" className={`transition-colors ${location.pathname === '/compare' ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}>Compare</Link>
                                <Link to="/smart-fit" className={`transition-colors ${location.pathname === '/smart-fit' ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}>Smart Fit™</Link>
                                <Link to="/sole-detector" className={`transition-colors ${location.pathname === '/sole-detector' ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'}`}>Size AI</Link>
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
                    <div className="relative pointer-events-auto">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`px-4 py-3 md:px-6 md:py-2.5 bg-black/50 backdrop-blur-xl border ${isProfileOpen ? 'border-white bg-white text-black' : 'border-white/10 text-white'} rounded-full flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-black hover:border-white transition-all`}
                        >
                            <User size={16} /> <span className="hidden md:inline">Hi, {user.firstName || 'User'}</span>
                        </button>
                        
                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-[#333] shadow-2xl flex flex-col py-2 z-50 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-[#333] mb-1">
                                        <p className="text-white text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                                        <p className="text-gray-500 text-xs truncate">{user.email || 'No email provided'}</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            setIsOrdersPopupOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-[#00ff88] hover:bg-[#222] transition-colors flex items-center gap-2"
                                    >
                                        Your Orders
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            setIsProfilePopupOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-[#00ff88] hover:bg-[#222] transition-colors flex items-center gap-2"
                                    >
                                        Update Profile
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-[#222] transition-colors flex items-center gap-2 mt-1 border-t border-[#333]"
                                    >
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <button onClick={() => setIsAuthOpen(true)} className="px-4 py-3 md:px-6 md:py-2.5 bg-black/50 backdrop-blur-xl border border-white/10 text-white rounded-full hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest font-bold">
                        <User size={16} /> <span className="hidden md:inline">Sign In</span>
                    </button>
                )}
            </div>
        </motion.nav>
        <AuthPopup isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <ProfilePopup isOpen={isProfilePopupOpen} onClose={() => setIsProfilePopupOpen(false)} />
        <OrdersPopup isOpen={isOrdersPopupOpen} onClose={() => setIsOrdersPopupOpen(false)} />
        </>
    );
};

export default Navbar;
