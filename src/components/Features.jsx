import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const MarqueeText = ({ children, direction = 1, speed = 20 }) => {
    return (
        <div className="flex relative overflow-hidden whitespace-nowrap opacity-20 font-bold uppercase tracking-tighter w-full">
            <motion.div
                className="flex gap-16 mr-16 text-[10rem] md:text-[15rem] leading-[0.8]"
                animate={{ x: direction === 1 ? ["0%", "-50%"] : ["-50%", "0%"] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
            >
                <span>{children}</span>
                <span>{children}</span>
                <span>{children}</span>
                <span>{children}</span>
            </motion.div>
        </div>
    );
};

const Features = () => {
    return (
        <div className="relative w-full overflow-hidden bg-black text-white py-24">

            {/* Background Marquee Text */}
            <div className="absolute inset-0 flex flex-col justify-center opacity-5 pointer-events-none select-none">
                <MarqueeText speed={1}>BIOMECHANICS • INNOVATION • PERFORMANCE •</MarqueeText>
                <MarqueeText speed={1.5} direction={-1}>ADAPTIVE • REACTIVE • INTELLIGENT •</MarqueeText>
            </div>

            <div className="container mx-auto px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">

                {/* Futuristic Core / Material Structure Visual */}
                <div className="relative flex justify-center items-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="w-full max-w-md aspect-square relative flex items-center justify-center"
                    >
                        {/* Outer Geometric Frame */}
                        <div className="absolute inset-0 border border-[#222] rounded-full opacity-20" />

                        {/* Orbiting Rings */}
                        {[1, 2, 3].map((ring, i) => (
                            <motion.div
                                key={i}
                                className="absolute border border-[#00ff88]/30 rounded-full"
                                style={{
                                    width: `${60 + i * 20}%`,
                                    height: `${60 + i * 20}%`,
                                    borderStyle: i % 2 === 0 ? "solid" : "dashed",
                                }}
                                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                                transition={{
                                    duration: 20 + i * 5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                        ))}

                        {/* Central Energy Core */}
                        <motion.div
                            className="w-32 h-32 bg-black border border-[#00ff88] rounded-full flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(0,255,136,0.2)]"
                            animate={{
                                boxShadow: ["0 0 20px rgba(0,255,136,0.2)", "0 0 60px rgba(0,255,136,0.6)", "0 0 20px rgba(0,255,136,0.2)"],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {/* Inner Pulsing Field */}
                            <motion.div
                                className="w-full h-full rounded-full bg-[#00ff88]/10 blur-xl absolute"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />

                            {/* Core Icon / Graphic */}
                            <div className="text-[#00ff88] font-mono text-xs flex flex-col items-center gap-1 z-20">
                                <span className="text-3xl font-bold">CORE</span>
                                <span className="text-[10px] tracking-widest opacity-70">ACTIVE</span>
                            </div>

                            {/* Floating Particles around Core */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-[#00ff88] rounded-full"
                                    animate={{
                                        x: Math.cos(i * 60 * (Math.PI / 180)) * 60,
                                        y: Math.sin(i * 60 * (Math.PI / 180)) * 60,
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}
                        </motion.div>

                        {/* Floating Data Points */}
                        <motion.div
                            className="absolute bottom-10 left-10 bg-black/80 border border-[#222] p-2 rounded text-[10px] font-mono text-[#00ff88]"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="opacity-50 text-white">SYNC RATE</div>
                            <div>98.4% STABLE</div>
                        </motion.div>

                        <motion.div
                            className="absolute top-10 right-10 bg-black/80 border border-[#222] p-2 rounded text-[10px] font-mono text-[#00ff88]"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="opacity-50 text-white">LATTICE</div>
                            <div>ADAPTIVE MESH</div>
                        </motion.div>

                    </motion.div>
                </div>

                {/* Feature List */}
                <div className="space-y-16">
                    <FeatureItem
                        number="01"
                        title="Adaptive Cushioning"
                        desc="Smart foam cells that harden on impact and soften during recovery."
                    />
                    <FeatureItem
                        number="02"
                        title="Neural Connectivity"
                        desc="Embedded sensors track stride length, cadence, and impact force in real-time."
                    />
                    <FeatureItem
                        number="03"
                        title="Climate Control"
                        desc="Active thermal regulation materials that breathe when you heat up."
                    />
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ number, title, desc }) => (
    <motion.div
        initial={{ x: 50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="group border-b border-[#222] pb-8 hover:border-[#00ff88] transition-colors duration-500"
    >
        <span className="text-[#00ff88] font-mono text-sm mb-2 block">{number}</span>
        <h3 className="text-3xl font-bold mb-4 group-hover:translate-x-4 transition-transform duration-300">{title}</h3>
        <p className="text-gray-400 max-w-sm group-hover:text-white transition-opacity duration-300">{desc}</p>
    </motion.div>
);

export default Features;
