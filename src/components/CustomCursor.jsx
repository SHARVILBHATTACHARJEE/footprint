import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Footprints } from 'lucide-react';
import { useCursor } from '../context/CursorContext';

const CustomCursor = () => {
    const { cursorType } = useCursor();
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 400, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    const variants = {
        default: {
            scale: 1,
            rotate: 0,
            opacity: 1,
        },
        hover: {
            scale: 1.5,
            rotate: [0, -15, 0, 15, 0], // Walking wiggle
            transition: {
                rotate: {
                    repeat: Infinity,
                    duration: 0.5,
                    ease: "linear",
                },
                scale: { duration: 0.2 }
            }
        },
    };

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
            style={{
                translateX: cursorX,
                translateY: cursorY,
                x: '-50%',
                y: '-50%',
            }}
            variants={variants}
            animate={cursorType}
        >
            {/* Inner Shoe/Footprint Visual */}
            <div className="relative">
                <Footprints
                    size={32}
                    strokeWidth={1.5}
                    className={`text-[#00ff88] drop-shadow-[0_0_15px_rgba(0,255,136,0.8)] transition-colors duration-300 ${cursorType === 'hover' ? 'fill-[#00ff88]' : ''}`}
                />

                {/* Impact Ripple Effect on Step (Hover) */}
                {cursorType === 'hover' && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[#00ff88] opacity-0"
                        animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                    />
                )}
            </div>
        </motion.div>
    );
};

export default CustomCursor;
