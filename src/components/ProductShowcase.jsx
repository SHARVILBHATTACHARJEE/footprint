import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ProductShowcase = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    const products = [
        {
            name: "Velocity Pro",
            image: "/images/product-velocity.jpg",
            price: "₹180",
            description: "Engineered for maximum speed."
        },
        {
            name: "Urban Stride",
            image: "/images/product-urban.jpg",
            price: "₹145",
            description: "City aesthetics, comfort core."
        },
        {
            name: "Flex Form",
            image: "/images/product-flex.jpg",
            price: "₹120",
            description: "Adaptive fit for every move."
        }
    ];

    return (
        <div ref={containerRef} className="relative w-full min-h-screen bg-black text-white py-24 px-8 overflow-hidden z-20">
            <h2 className="text-[4rem] md:text-[6rem] font-bold uppercase text-center mb-24 relative z-10">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Smart Collection</span>
            </h2>

            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                {products.map((product, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative flex flex-col items-center"
                    >
                        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#111] mb-6 rounded-sm">
                            <motion.img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                style={{ y: index % 2 === 0 ? 0 : 20 }}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                        </div>

                        <div className="w-full flex justify-between items-end border-b border-[#333] pb-4 group-hover:border-[#00ff88] transition-colors duration-500">
                            <div>
                                <h3 className="text-2xl font-bold uppercase mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-400 font-mono">{product.description}</p>
                            </div>
                            <span className="text-xl font-bold text-[#00ff88]">{product.price}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Background Decorative Elements */}
            <motion.div
                style={{ y, rotate }}
                className="absolute top-1/4 -right-20 w-96 h-96 border border-[#333] rounded-full opacity-20 pointer-events-none"
            />
            <motion.div
                style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
                className="absolute bottom-1/4 -left-20 w-64 h-64 bg-[#00ff88] rounded-full blur-[120px] opacity-5 pointer-events-none"
            />
        </div>
    );
};

export default ProductShowcase;
