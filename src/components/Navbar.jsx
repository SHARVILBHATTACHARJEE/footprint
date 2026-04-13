import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { User, ShoppingBag, Home as HomeIcon, Store, ScanLine, ChevronDown, ArrowRightLeft, Activity } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { logoutUser } from '../firebase/auth';
import AuthPopup from './AuthPopup';
import AuthChoicePopup from './AuthChoicePopup';
import ProfilePopup from './ProfilePopup';
import OrdersPopup from './OrdersPopup';

const navLinks = [
    { name: 'Shop', path: '/shop', icon: <Store size={14} /> },
    { name: 'Compare', path: '/compare', icon: <ArrowRightLeft size={14} /> },
    { name: 'Smart Fit™', path: '/smart-fit', icon: <Activity size={14} /> },
    { name: 'Size AI', path: '/sole-detector', icon: <ScanLine size={14} /> },
];

const Navbar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scrolled, setScrolled] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isAuthLogin, setIsAuthLogin] = useState(true);
    const [isAuthChoiceOpen, setIsAuthChoiceOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
    const [isOrdersPopupOpen, setIsOrdersPopupOpen] = useState(false);
    
    const dockRef = useRef(null);
    const location = useLocation();
    const { toggleCart, cartCount } = useCart();
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50);
    });

    const handleMouseMove = (e) => {
        if (!dockRef.current) return;
        const rect = dockRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.removeItem('user');
            localStorage.removeItem('smartFitAnswers');
            window.location.reload();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-[100] px-4 md:px-12 py-8 pointer-events-none flex justify-between items-center text-white">
                {/* Left - Static Branding */}
                <div className="w-1/4 hidden md:flex items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: scrolled ? 0.15 : 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl font-black tracking-tighter uppercase text-white pointer-events-none mix-blend-difference"
                    >
                        FOOTPRINT<span className="text-[#00ff88]">.</span>
                    </motion.div>
                </div>

                {/* Center - Expanding Logo Menu */}
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-auto z-50">
                    <motion.div
                        ref={dockRef}
                        onMouseMove={handleMouseMove}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => {
                            setIsHovered(false);
                            setMousePos({ x: 0, y: 0 });
                        }}
                        initial={false}
                        animate={{
                            width: isHovered ? "600px" : "84px",
                            borderRadius: isHovered ? "20px" : "50px",
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 350, 
                            damping: 35,
                            mass: 0.7
                        }}
                        className="relative h-14 flex items-center bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden group px-6"
                    >
                        {/* Cursor Glow Trail */}
                        <motion.div 
                            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                                background: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, rgba(0,255,136,0.15), transparent)`
                            }}
                        />

                        {/* Logo Initials */}
                        <div className="flex-shrink-0 flex items-center h-full min-w-[36px] justify-center">
                            <Link to="/" className="text-2xl font-black italic tracking-tighter uppercase text-white hover:text-[#00ff88] transition-all transform hover:scale-110">
                                FP<span className="text-[#00ff88]">.</span>
                            </Link>
                        </div>

                        {/* Expanding Links */}
                        <div className="flex-grow flex items-center">
                            <AnimatePresence mode="wait">
                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -5, transition: { duration: 0.1 } }}
                                        className="flex items-center gap-10 whitespace-nowrap overflow-hidden pl-8"
                                    >
                                        {navLinks.map((link) => {
                                            const isActive = location.pathname === link.path;
                                            return (
                                                <Link 
                                                    key={link.path} 
                                                    to={link.path} 
                                                    className={`relative flex items-center gap-3 transition-colors duration-300 py-2 hover:text-white group/item text-[11px] uppercase font-black tracking-widest ${isActive ? 'text-[#00ff88]' : 'text-gray-400'}`}
                                                >
                                                    <span className="group-hover/item:text-[#00ff88] transition-colors">{link.icon}</span>
                                                    <span className="relative">
                                                        {link.name}
                                                        {isActive && (
                                                            <motion.div 
                                                                layoutId="link-dot" 
                                                                className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-[#00ff88] rounded-full shadow-[0_0_10px_#00ff88]" 
                                                            />
                                                        )}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Right - Profile & Cart */}
                <div className="flex justify-end items-center gap-4 pointer-events-auto z-50 ml-auto">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleCart}
                        className="relative p-3.5 text-white bg-black/30 backdrop-blur-3xl border border-white/10 rounded-2xl hover:border-[#00ff88]/50 shadow-2xl transition-all"
                    >
                        <ShoppingBag size={20} />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.div
                                    key={cartCount}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute -top-1.5 -right-1.5 bg-[#00ff88] text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-lg font-black shadow-[0_0_15px_#00ff88]"
                                >
                                    {cartCount}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    <div className="relative">
                        {user ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`
                                    px-6 py-3.5 bg-black/30 backdrop-blur-3xl border ${isProfileOpen ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]' : 'border-white/10 text-white'} 
                                    rounded-2xl flex items-center gap-3 text-[11px] uppercase font-black tracking-widest hover:border-[#00ff88] shadow-2xl transition-all
                                `}
                            >
                                <User size={18} /> 
                                <span className="hidden sm:inline">HI, {user.firstName.toUpperCase()}</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#000" }}
                                onClick={() => setIsAuthChoiceOpen(true)}
                                className="px-6 py-3.5 bg-[#00ff88] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all flex items-center gap-2"
                            >
                                <User size={18} /> <span className="hidden md:inline">SIGN IN</span>
                            </motion.button>
                        )}

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-4 w-[200px] sm:w-[240px] md:w-64 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,1)] rounded-3xl py-4 z-50 overflow-hidden transform-gpu"
                                >
                                    <div className="px-5 py-3 border-b border-white/5 mb-2">
                                        <p className="text-white text-[11px] font-black uppercase tracking-[0.2em] truncate">{user.firstName} {user.lastName}</p>
                                        <p className="text-gray-500 text-[10px] mt-1 italic truncate">{user.email}</p>
                                    </div>
                                    {[
                                        { label: 'Your Orders', onClick: () => setIsOrdersPopupOpen(true) },
                                        { label: 'Update Profile', onClick: () => setIsProfilePopupOpen(true) },
                                    ].map(item => (
                                        <button 
                                            key={item.label}
                                            onClick={() => { setIsProfileOpen(false); item.onClick(); }}
                                            className="w-full text-left px-6 py-3.5 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-[#00ff88] hover:bg-white/5 transition-colors"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-6 py-4 text-[10px] uppercase font-black tracking-[0.2em] text-red-500 border-t border-white/5 mt-2 hover:bg-red-500/10 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Premium Mobile Navigation */}
            <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[100]">
                <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-8 py-5 flex justify-between items-center shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                    {[
                        { icon: <HomeIcon size={22} />, path: '/' },
                        { icon: <Store size={22} />, path: '/shop' },
                        { icon: <Activity size={22} />, path: '/smart-fit' },
                        { icon: <ScanLine size={22} />, path: '/sole-detector' },
                    ].map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`relative transition-all duration-300 ${location.pathname === item.path ? 'text-[#00ff88] scale-125' : 'text-gray-500 hover:text-white'}`}
                        >
                            {item.icon}
                            {location.pathname === item.path && (
                                <motion.div 
                                    layoutId="mobile-active-dot" 
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#00ff88] rounded-full shadow-[0_0_10px_#00ff88]" 
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Global Spacing Adjustments */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 768px) {
                    body { padding-bottom: 120px; }
                }
            `}} />

            <AuthPopup isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} isInitialLogin={isAuthLogin} />
            <AuthChoicePopup 
                isOpen={isAuthChoiceOpen} 
                onClose={() => setIsAuthChoiceOpen(false)} 
                onChoice={(choice) => {
                    setIsAuthLogin(choice);
                    setIsAuthChoiceOpen(false);
                    setIsAuthOpen(true);
                }} 
            />
            <ProfilePopup isOpen={isProfilePopupOpen} onClose={() => setIsProfilePopupOpen(false)} />
            <OrdersPopup isOpen={isOrdersPopupOpen} onClose={() => setIsOrdersPopupOpen(false)} />
        </>
    );
};

export default Navbar;
