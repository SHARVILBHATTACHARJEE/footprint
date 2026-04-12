import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { getProductsWithFeatures } from '../firebase/firestore';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

const ProductShowcase = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState({});
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProductsWithFeatures();
                // Randomly select 3 shoes
                const shuffled = [...data].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 3).map(item => {
                    const rawPrice = item.feature_price || item.price || '0';
                    const parsedPrice = parseFloat(rawPrice.toString().replace(/[^0-9.]/g, ''));
                    return {
                        ...item,
                        name: item.name,
                        image: item.image_url,
                        price: parsedPrice,
                        walkingStyle: item.walking_style,
                        rating: item.avg_rating ? Number(item.avg_rating).toFixed(1) : 'New',
                        description: item.description || item.category || 'Premium Footwear'
                    };
                });
                setProducts(selected);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div ref={containerRef} className="relative w-full min-h-screen bg-black text-white py-16 md:py-24 px-4 md:px-8 overflow-hidden z-20">
            <h2 className="text-4xl sm:text-5xl md:text-[5rem] lg:text-[6rem] px-2 font-bold uppercase text-center mb-12 md:mb-24 relative z-10 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Smart Collection</span>
            </h2>

            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 relative z-10 px-2 sm:px-4 md:px-0">
                {products.map((product, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative flex flex-col items-center"
                    >
                        <div 
                            onClick={() => {
                                setSelectedProduct(product);
                                setIsModalOpen(true);
                            }}
                            className="relative w-full aspect-[5/4] overflow-hidden bg-transparent mb-6 rounded-sm flex items-center justify-center cursor-pointer"
                        >
                            <motion.img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full flex-grow">
                            <div className="flex justify-between items-start border-b border-[#333] pb-4 group-hover:border-[#00ff88] transition-colors duration-500">
                                <div 
                                    className="cursor-pointer group/title"
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <h3 className="text-xl md:text-2xl font-bold uppercase mb-1 group-hover/title:text-[#00ff88] transition-colors leading-tight pr-2">{product.name}</h3>

                                </div>
                                <span className="text-lg md:text-xl font-bold text-[#00ff88] shrink-0 mt-1 md:mt-0">₹{product.price}</span>
                            </div>


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
            <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addToCart}
            />
        </div>
    );
};

export default ProductShowcase;
