import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BiometricHeatmap from './BiometricHeatmap';

const FootHealth = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const [answers, setAnswers] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('smartFitAnswers');
        if (stored) {
            try {
                setAnswers(JSON.parse(stored));
            } catch (e) {}
        }
    }, []);

    return (
        <section ref={containerRef} className="relative w-full py-32 bg-[#050505] text-white overflow-hidden">
            {/* Background Anatomical Grid */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="container mx-auto px-8 relative z-10">
                <div className="text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4"
                    >
                        Engineered for <span className="text-[#00ff88]">Longevity</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Beyond comfort. Our biomechanical innovations proactively prevent impact injuries and correct posture in real-time.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">

                    {/* Interactive Foot Model / Visualization */}
                    <BiometricHeatmap answers={answers} />

                    {/* Benefit Cards */}
                    <div className="space-y-6">
                        <BenefitCard
                            number="01"
                            title="Impact Redistribution"
                            desc="Micro-lattice structures disperse kinetic energy, reducing joint stress by 40%."
                        />
                        <BenefitCard
                            number="02"
                            title="Arch Alignment"
                            desc="Dynamic arch support adapts to your foot shape as it changes throughout the day."
                        />
                        <BenefitCard
                            number="03"
                            title="Thermal Regulation"
                            desc="Graphene-infused mesh actively dissipates heat to prevent swelling and blisters."
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

const BenefitCard = ({ number, title, desc }) => (
    <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="group relative p-8 border border-[#222] bg-[#0a0a0a] hover:border-[#00ff88] transition-all duration-500 rounded-lg overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4 text-[#00ff88] font-mono text-xl opacity-50 group-hover:opacity-100">{number}</div>
        <h3 className="text-2xl font-bold mb-2 group-hover:text-[#00ff88] transition-colors">{title}</h3>
        <p className="text-gray-500 group-hover:text-gray-300 transition-colors">{desc}</p>

        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.div>
);

export default FootHealth;
