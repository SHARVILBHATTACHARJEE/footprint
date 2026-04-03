import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-black text-gray-300 pt-32 pb-24 px-6 md:px-12 lg:px-24">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <div className="border-b border-[#333] pb-8 mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter mb-4">Terms & <span className="text-[#00ff88]">Conditions</span></h1>
                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Effective Date: April 2026</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
                    <p>By accessing and using Footprint (the "Service"), you agree to be bound by these Terms & Conditions. If you do not agree to all these terms, please do not use our platform.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. Product Purchases</h2>
                    <p>All purchases made on Footprint are subject to product availability. We reserve the right to limit the quantities of any products or services that we offer. Prices for our products are subject to change without notice.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. Returns & Refunds</h2>
                    <p>We accept returns within 30 days of the original purchase. Items must be unworn, in original condition, and with all tags attached. Refunds are processed to the original payment method after inspection.</p>
                </section>
                
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">4. Smart Features & Accuracy</h2>
                    <p>The Sole Size Detector and Lifecycle estimations are software approximations based on standard algorithms and provided data. While we strive for extreme accuracy, these are advisory tools and Footprint is not liable for minor discrepancies.</p>
                </section>
            </motion.div>
        </div>
    );
};

export default Terms;
