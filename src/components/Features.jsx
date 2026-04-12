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
        <div className="relative w-full overflow-hidden bg-black text-white py-16 md:py-24">

            {/* Background Marquee Text */}
            <div className="absolute inset-0 flex flex-col justify-center opacity-5 pointer-events-none select-none">
                <MarqueeText speed={1}>BIOMECHANICS • INNOVATION • PERFORMANCE •</MarqueeText>
                <MarqueeText speed={1.5} direction={-1}>ADAPTIVE • REACTIVE • INTELLIGENT •</MarqueeText>
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                {/* Product Feature Mapping Visual */}
                <div className="relative flex justify-center items-center h-full min-h-[400px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="w-full max-w-xl aspect-square relative flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff88]/10 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />

                        {/* Main Product Image (Increased Size) */}
                        <motion.img
                            src="/images/shoes-nobg/shoe13_normal-no-bg.png"
                            alt="Feature Highlight"
                            className="relative z-10 w-[110%] md:w-[130%] scale-110 object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)]"
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Feature Pointers (Re-positioned outwards) */}
                        {/* Lattice Upper - Pointing to top heel/collar */}
                        <motion.div
                            className="absolute top-[45%] left-[0%] md:left-[5%] flex items-center gap-2 z-20"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="text-right">
                                <div className="text-[#00ff88] text-[9px] sm:text-[11px] font-mono tracking-widest font-bold">LATTICE UPPER</div>
                                <div className="text-gray-400 text-[8px] uppercase">Climate Control</div>
                            </div>
                            <div className="w-16 md:w-32 h-[1px] bg-gradient-to-r from-transparent to-[#00ff88]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
                        </motion.div>

                        {/* Aero Foam - Pointing to middle/rear sole */}
                        <motion.div
                            className="absolute bottom-[33%] right-[-0%] md:right-[0%] flex items-center gap-2 z-20"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
                            <div className="w-16 md:w-32 h-[1px] bg-gradient-to-l from-transparent to-[#00ff88]" />
                            <div className="text-left">
                                <div className="text-[#00ff88] text-[9px] sm:text-[11px] font-mono tracking-widest font-bold">AERO FOAM</div>
                                <div className="text-gray-400 text-[8px] uppercase">Adaptive Cushion</div>
                            </div>
                        </motion.div>

                        {/* Micro Treads - Pointing to bottom front tread */}
                        <motion.div
                            className="absolute bottom-[27%] left-[0%] md:left-[5%] flex items-center gap-2 z-20"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="text-right">
                                <div className="text-[#00ff88] text-[9px] sm:text-[11px] font-mono tracking-widest font-bold">MICRO TREADS</div>
                                <div className="text-gray-400 text-[8px] uppercase">Dynamic Traction</div>
                            </div>
                            <div className="w-12 md:w-24 h-[1px] bg-gradient-to-r from-transparent to-[#00ff88]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
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
                        title="Dynamic Traction"
                        desc="Engineered micro-tread patterns providing multi-surface grip and stability."
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
        <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 group-hover:translate-x-4 transition-transform duration-300 leading-tight">{title}</h3>
        <p className="text-gray-400 max-w-sm group-hover:text-white transition-opacity duration-300">{desc}</p>
    </motion.div>
);

export default Features;
