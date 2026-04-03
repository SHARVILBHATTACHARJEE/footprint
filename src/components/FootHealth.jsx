import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const FootHealth = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

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
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[400px] md:h-[600px] w-full bg-black/50 border border-[#222] rounded-2xl p-4 md:p-8 flex items-center justify-center overflow-hidden"
                    >
                        {/* Abstract Foot Visualization SVG */}
                        <svg viewBox="0 0 200 300" className="w-auto h-full drop-shadow-[0_0_15px_rgba(0,255,136,0.3)] z-10">
                            {/* Static Stylized Outline */}
                            <motion.path
                                d="M100 30 C80 30, 50 50, 50 100 C50 150, 60 200, 70 230 C80 250, 90 270, 100 280 C110 270, 120 250, 130 230 C140 200, 150 150, 150 100 C150 50, 120 30, 100 30 Z"
                                fill="rgba(0,255,136,0.02)"
                                stroke="#00ff88"
                                strokeWidth="1"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1.5 }}
                            />

                            {/* Simplified Animated Pressure Points Default */}
                            {[
                                { cx: 80, cy: 120, label: "Heel Strike", delay: 0 },
                                { cx: 100, cy: 180, label: "Arch Support", delay: 0.5 },
                                { cx: 100, cy: 230, label: "Forefoot", delay: 1 }
                            ].map((point, i) => (
                                <g key={i}>
                                    <motion.circle
                                        cx={point.cx}
                                        cy={point.cy}
                                        r="6"
                                        fill="#00ff88"
                                        initial={{ opacity: 0.3, scale: 0.8 }}
                                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: point.delay, ease: "easeInOut" }}
                                    />
                                </g>
                            ))}
                        </svg>

                        {/* Rendering HTML Labels positioned absolutely over the SVG container */}
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            {[
                                { top: '38%', left: '25%', text: "Heel Strike" },
                                { top: '55%', left: '50%', text: "Arch Support", transform: "translateX(-50%)" },
                                { top: '75%', left: '35%', text: "Forefoot" }
                            ].map((label, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute text-[10px] md:text-xs uppercase tracking-widest text-[#00ff88] font-bold bg-black/80 px-2 py-1 border border-[#00ff88]/30 rounded backdrop-blur-sm"
                                    style={{
                                        top: label.top,
                                        left: label.left,
                                        right: label.right,
                                        transform: label.transform
                                    }}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.2 }}
                                >
                                    {label.text}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

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
