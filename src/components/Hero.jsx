import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Orb from './ui/Orb';

const SHOE_IMAGES = [
  '/images/shoes-nobg/shoe1_normal-no-bg.png',
  '/images/shoes-nobg/shoe2_normal-no-bg.png',
  '/images/shoes-nobg/shoe3_normal-no-bg.png',
  '/images/shoes-nobg/shoe4_normal-no-bg.png',
  '/images/shoes-nobg/shoe5_normal-no-bg.png',
  '/images/shoes-nobg/shoe6_normal-no-bg.png',
  '/images/shoes-nobg/shoe7_normal-no-bg.png',
  '/images/shoes-nobg/shoe8_normal-no-bg.png',
  '/images/shoes-nobg/shoe9_normal-no-bg.png',
  '/images/shoes-nobg/shoe10_normal-no-bg.png',
  '/images/shoes-nobg/shoe11_normal-no-bg.png',
  '/images/shoes-nobg/shoe12_normal-no-bg.png',
  '/images/shoes-nobg/shoe13_normal-no-bg.png',
  '/images/shoes-nobg/shoe14_normal-no-bg.png',
  '/images/shoes-nobg/shoe15_normal-no-bg.png',
];

const Hero = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [currentShoe, setCurrentShoe] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShoe((prev) => (prev + 1) % SHOE_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const textItemVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[100dvh] overflow-hidden bg-[#050505] text-white flex flex-col justify-center pt-24 pb-8 px-4 sm:px-8 perspective-1000"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#050505] to-[#000] z-0" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#33333333_1px,transparent_1px),linear-gradient(to_bottom,#33333333_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
      
      {/* Interactive Core Mouse Glow */}
      <motion.div
        className="absolute rounded-full blur-[120px] pointer-events-none z-0"
        style={{ 
            x, y, 
            width: "400px", height: "400px", 
            marginLeft: "-200px", marginTop: "-200px",
            background: "radial-gradient(circle, rgba(0,255,136,0.15) 0%, rgba(0,0,0,0) 70%)"
        }}
      />

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 z-10 relative w-full items-center flex-grow">

        {/* Left Content */}
        <div className="flex flex-col space-y-6 md:space-y-8 mt-[10vh] md:mt-0 text-center md:text-left items-center md:items-start z-20">
          <motion.div
            variants={containerVariant}
            initial="visible"
            animate="visible"
          >
            <h1 className="text-5xl sm:text-[4rem] md:text-[6rem] lg:text-[7rem] font-bold leading-[0.9] tracking-tighter uppercase font-sans relative">
              <span className="block overflow-hidden pb-2">
                <motion.span variants={textItemVariant} className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  The
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-2">
                <motion.span variants={textItemVariant} className="inline-block text-[#00ff88]">
                  Future
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-4">
                <motion.span variants={textItemVariant} className="inline-block">
                   of Steps.
                </motion.span>
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-400 text-base sm:text-lg md:text-xl max-w-md font-light text-center md:text-left mx-auto md:mx-0"
          >
            Experience the next generation of biomechanical footwear. Designed for kinetic perfection.
          </motion.p>

          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
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

        {/* Right Image (Orb + Shoes) */}
        <motion.div
          style={{ rotateX, rotateY, z: 10 }}
          className="relative w-full h-[40vh] min-h-[300px] md:h-[70vh] flex items-center justify-center mt-4 md:mt-0 mx-auto max-w-lg md:max-w-none"
        >
          <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center mix-blend-screen overflow-visible">
            <div className="w-[120%] h-[120%] relative flex items-center justify-center cursor-pointer">
              <Orb
                hoverIntensity={2.5}
                rotateOnHover={true}
                hue={0}
                forceHoverState={false}
                backgroundColor="#000000"
              />
            </div>
          </div>
          <motion.div
            className="relative w-[80%] md:w-[90%] aspect-square pointer-events-none z-20 flex items-center justify-center"
          >
            {/* Main Shoe Images Transition */}
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentShoe}
                src={SHOE_IMAGES[currentShoe]}
                alt="Future Shoe"
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: -15 }}
                exit={{ opacity: 0, scale: 0.9, y: -15, rotate: 15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] absolute"
              />
            </AnimatePresence>
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

export default Hero;
