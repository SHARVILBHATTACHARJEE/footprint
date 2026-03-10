import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartSidebar = () => {
    const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 w-full max-w-md h-full bg-[#0a0a0a] border-l border-[#333] z-50 flex flex-col text-white shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-6 border-b border-[#333]">
                            <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
                                <ShoppingBag className="text-[#00ff88]" /> Your Cart
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors p-2"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                    <ShoppingBag size={48} className="mb-4 text-gray-600" />
                                    <p className="font-mono text-sm">Your cart is empty.</p>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 border-b border-[#222] pb-6 last:border-0">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-[#111] rounded-sm overflow-hidden shrink-0 relative">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex flex-col flex-1 justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold uppercase text-lg leading-tight">{item.name}</h3>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mt-1">{item.category}</p>
                                            </div>

                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-center gap-3 bg-[#111] rounded-full px-3 py-1 border border-[#333]">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-[#00ff88]">₹{item.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {cartItems.length > 0 && (
                            <div className="border-t border-[#333] p-6 bg-black">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-400 uppercase tracking-widest text-sm">Subtotal</span>
                                    <span className="text-2xl font-bold uppercase tracking-tighter">₹{cartTotal}</span>
                                </div>
                                <button
                                    onClick={() => alert('Proceeding to checkout...')}
                                    className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-full hover:bg-[#00ff88] transition-colors duration-300"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
