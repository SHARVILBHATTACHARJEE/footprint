import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useCursor } from '../context/CursorContext';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const { cursorHandlers } = useCursor();
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Mouse Parallax for Image
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-500, 500], [10, -10]);
    const rotateY = useTransform(x, [-500, 500], [-10, 10]);

    function handleMouseMove(event) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * width);
        y.set(yPct * height);
    }

    // Text Animation Variant
    const letterVariant = {
        hidden: { y: 0, opacity: 1 },
        visible: { y: 0, opacity: 1 }
    };

    const containerVariant = {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] text-white flex items-center justify-center p-8 perspective-1000"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#050505] to-[#000] z-0" />
            <motion.div
                className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#00ff88] rounded-full blur-[150px] opacity-10"
                animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#00ccff] rounded-full blur-[150px] opacity-10"
                animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />

            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 z-10 relative h-full items-center">

                {/* Left Content */}
                <div className="flex flex-col space-y-8">
                    <motion.div
                        variants={containerVariant}
                        initial="visible"
                        animate="visible"
                    >
                        <h1 className="text-[5rem] md:text-[7rem] font-bold leading-[0.9] tracking-tighter uppercase font-sans relative">
                            <span className="block">
                                <motion.span variants={letterVariant} className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    The
                                </motion.span>
                            </span>
                            <span className="block">
                                <motion.span variants={letterVariant} className="inline-block text-[#00ff88]">
                                    Future
                                </motion.span>
                            </span>
                            <span className="block">
                                <motion.span variants={letterVariant} className="inline-block">
                                    of Steps.
                                </motion.span>
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gray-400 text-xl max-w-md font-light"
                    >
                        Experience the next generation of biomechanical footwear. Designed for kinetic perfection.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <button
                            {...cursorHandlers}
                            onClick={() => navigate('/shop')}
                            className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-widest overflow-hidden rounded-full hover:bg-[#00ff88] transition-colors duration-300"
                        >
                            <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors">
                                Shop Now <ArrowRight size={20} />
                            </span>
                            <div className="absolute inset-0 bg-[#00ff88] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </button>
                    </motion.div>
                </div>

                {/* Right Image (Parallax) */}
                <motion.div
                    style={{ rotateX, rotateY, z: 100 }}
                    className="relative w-full h-[60vh] flex items-center justify-center pointer-events-none"
                >
                    <motion.div
                        initial={{ opacity: 1, scale: 1, rotate: -15 }}
                        animate={{ opacity: 1, scale: 1, rotate: -15 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="relative w-[80%] aspect-square"
                    >
                        {/* Image Glow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/30 to-transparent rounded-full blur-3xl opacity-50 transform translate-y-20 scale-90" />

                        {/* Main Shoe Image */}
                        <img
                            src="/images/hero-shoe.jpg"
                            alt="Future Shoe"
                            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 relative"
                        />

                        {/* Floating Elements / Particles */}
                        <FloatingParticle delay={0.2} x={-50} y={-100} />
                        <FloatingParticle delay={0.5} x={150} y={-50} />
                        <FloatingParticle delay={0.8} x={-100} y={100} />
                    </motion.div>
                </motion.div>

            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
                <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            </motion.div>
        </div>
    );
};

const FloatingParticle = ({ delay, x, y }) => (
    <motion.div
        className="absolute w-3 h-3 bg-white rounded-full blur-[1px] opacity-60 z-30"
        initial={{ x, y, scale: 0 }}
        animate={{
            y: [y, y - 20, y],
            opacity: [0.6, 0.3, 0.6],
            scale: [1, 1.2, 1]
        }}
        transition={{
            delay,
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

export default Hero;
