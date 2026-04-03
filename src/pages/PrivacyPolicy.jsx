import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
                    <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter mb-4">Privacy <span className="text-[#00ff88]">Policy</span></h1>
                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Last updated: April 2026</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
                    <p>At Footprint, we collect information to provide you with a smarter, more personalized footwear experience. This includes data such as your foot scans (via our Sole Size Detector), order history, shipping addresses, and basic account information.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. How We Use Your Data</h2>
                    <p>Your data is used primarily to ensure exact sizing, optimize shoe lifecycle feedback, and process your transactions securely. We do not sell your personal data to third parties. Biometric data derived from foot scans is encrypted and used solely for sizing recommendations.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. Data Security</h2>
                    <p>We implement state-of-the-art security protocols to protect your information. All transactions are securely processed through Razorpay, and sensitive user data is stored safely in our encrypted Firebase database.</p>
                </section>
                
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">4. Your Rights</h2>
                    <p>You have the right to request access to, modify, or delete your personal data at any time. Simply use our interactive chat support or contact our support directly to process data requests.</p>
                </section>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;
