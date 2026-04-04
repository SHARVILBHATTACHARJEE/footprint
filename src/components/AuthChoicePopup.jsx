import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus } from 'lucide-react';

const AuthChoicePopup = ({ isOpen, onClose, onChoice }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-[#111] border border-[#333] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 mb-6">
                            <LogIn size={32} className="text-[#00ff88]" />
                        </div>
                        <h2 className="text-3xl font-black uppercase text-white tracking-tighter mb-2">
                            Identification Required
                        </h2>
                        <p className="text-gray-400 text-sm font-mono leading-relaxed">
                            Please sign in to your account or create a new one to continue with this action.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => onChoice(true)}
                            className="w-full bg-white text-black font-black uppercase tracking-widest py-4 hover:bg-[#00ff88] transition-all flex items-center justify-center gap-3 group"
                        >
                            <LogIn size={20} className="group-hover:scale-110 transition-transform" />
                            Sign In
                        </button>
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-[#222]"></div>
                            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">OR</span>
                            <div className="h-px flex-1 bg-[#222]"></div>
                        </div>
                        <button
                            onClick={() => onChoice(false)}
                            className="w-full bg-transparent border-2 border-white/20 text-white font-black uppercase tracking-widest py-4 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-3 group"
                        >
                            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                            Sign Up
                        </button>
                    </div>

                    <p className="mt-8 text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                        Footprint // Secure Authentication Module
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthChoicePopup;
