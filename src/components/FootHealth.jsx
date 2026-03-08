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
                        className="relative h-[600px] w-full bg-black/50 border border-[#222] rounded-2xl p-8 flex items-center justify-center overflow-hidden"
                    >
                        {/* Abstract Foot Visualization SVG */}
                        <svg viewBox="0 0 200 300" className="w-auto h-full drop-shadow-[0_0_15px_rgba(0,255,136,0.3)] z-10">
                            <motion.path
                                d="M100 30 C80 30, 50 50, 50 100 C50 150, 60 200, 70 230 C80 250, 90 270, 100 280 C110 270, 120 250, 130 230 C140 200, 150 150, 150 100 C150 50, 120 30, 100 30 Z"
                                fill="none"
                                stroke="#333"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />

                            {/* Moving Gait Particle */}
                            <motion.circle
                                r="6"
                                fill="#fff"
                                className="drop-shadow-[0_0_15px_#fff]"
                                animate={{
                                    cx: [80, 100, 110], // Heel -> Arch -> Toe
                                    cy: [120, 180, 220],
                                    opacity: [0, 1, 1, 0], // Fade in/out
                                    scale: [1, 1.5, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    repeatDelay: 0.5
                                }}
                            />

                            {/* Connecting Path for Gait */}
                            <motion.path
                                d="M80 120 Q 100 180 110 220"
                                fill="none"
                                stroke="#00ff88"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                opacity="0.5"
                            />

                            {/* Animated Pressure Points with Labels */}
                            {[
                                { cx: 80, cy: 120, label: "Heel Strike" },
                                { cx: 120, cy: 120, label: "Midfoot" },
                                { cx: 100, cy: 180, label: "Arch Support" },
                                { cx: 90, cy: 220, label: "Forefoot" },
                                { cx: 110, cy: 220, label: "Toe Off" }
                            ].map((point, i) => (
                                <g key={i}>
                                    <motion.circle
                                        cx={point.cx}
                                        cy={point.cy}
                                        r="4"
                                        fill="#00ff88"
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: [1, 1.5, 1], opacity: 1 }}
                                        transition={{
                                            scale: { duration: 1.5, repeat: Infinity, delay: i * 0.3 },
                                            opacity: { duration: 0.5, delay: i * 0.2 }
                                        }}
                                    />
                                </g>
                            ))}
                        </svg>

                        {/* Rendering HTML Labels positioned absolutely over the SVG container */}
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            {[
                                { top: '38%', left: '25%', text: "Heel Strike" },
                                { top: '38%', right: '25%', text: "Midfoot" },
                                { top: '58%', left: '50%', text: "Arch Support", transform: "translateX(-50%)" },
                                { top: '72%', left: '28%', text: "Forefoot" },
                                { top: '72%', right: '28%', text: "Toe Off" }
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
                                    transition={{ delay: 1 + i * 0.2 }}
                                >
                                    {label.text}
                                </motion.div>
                            ))}
                        </div>

                        {/* Scanner Line */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-[2px] bg-[#00ff88] shadow-[0_0_20px_#00ff88] will-change-transform"
                            animate={{ y: [0, 600, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
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
