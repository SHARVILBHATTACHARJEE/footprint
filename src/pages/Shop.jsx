import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Loader2, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductModal from '../components/ProductModal';
import { getProductsWithFeatures } from '../firebase/firestore';
import { seedFirestore } from '../firebase/seed';

const Shop = () => {
    // Determine unique filter options directly in component based on loaded data
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const categories = ["All", ...new Set(products.map(p => p.category))];
    const walkingStyles = ["All", ...new Set(products.map(p => p.walking_style || p.walkingStyle))];
    const climates = ["All", ...new Set(products.map(p => p.climate))];

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activeCategory, setActiveCategory] = useState("All");
    const [activeWalkingStyle, setActiveWalkingStyle] = useState("All");
    const [activeClimate, setActiveClimate] = useState("All");
    const [sortOrder, setSortOrder] = useState("none"); // "none", "lowToHigh", "highToLow"

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProductsWithFeatures();

                const formattedData = data.map(item => {
                    const rawPrice = item.feature_price || item.price || '0';
                    const parsedPrice = parseFloat(rawPrice.toString().replace(/[^0-9.]/g, ''));

                    return {
                        ...item,
                        image: item.image_url,
                        price: parsedPrice,
                        walkingStyle: item.walking_style,
                        rating: item.avg_rating ? Number(item.avg_rating).toFixed(1) : 'New'
                    };
                });

                setProducts(formattedData);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter and Sort logic
    const filteredAndSortedProducts = useMemo(() => {
        let result = products.filter(product => {
            const matchCategory = activeCategory === "All" || product.category === activeCategory;
            const matchWalkingStyle = activeWalkingStyle === "All" || product.walkingStyle === activeWalkingStyle;
            const matchClimate = activeClimate === "All" || product.climate === activeClimate;
            return matchCategory && matchWalkingStyle && matchClimate;
        });

        if (sortOrder === "lowToHigh") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "highToLow") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [products, activeCategory, activeWalkingStyle, activeClimate, sortOrder]);

    const FilterSection = ({ title, options, activeOption, setActiveOption }) => (
        <div className="mb-8 border-b border-[#333] pb-6">
            <h3 className="text-xl font-bold uppercase mb-4 tracking-wider">{title}</h3>
            <div className="space-y-2">
                {options.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5 border border-gray-600 rounded-xs bg-[#111] group-hover:border-[#00ff88] transition-colors">
                            <input
                                type="radio"
                                name={title}
                                value={option}
                                checked={activeOption === option}
                                onChange={() => setActiveOption(option)}
                                className="sr-only"
                            />
                            {activeOption === option && (
                                <motion.div
                                    layoutId={`indicator-${title}`}
                                    className="w-3 h-3 bg-[#00ff88]"
                                />
                            )}
                        </div>
                        <span className={`text-sm font-mono transition-colors ${activeOption === option ? 'text-[#00ff88]' : 'text-gray-400 group-hover:text-white'}`}>
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12 object-contain">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#333] pb-8">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[4rem] md:text-[5rem] font-bold uppercase tracking-tighter leading-none"
                    >
                        Collection
                    </motion.h1>
                    <p className="text-gray-400 font-mono mt-4 max-w-xl">
                        Advanced biomechanics meets urban aesthetics. Discover the perfect match for your lifestyle.
                    </p>
                </div>

                <div className="mt-8 md:mt-0 flex items-center gap-4">
                    <span className="text-sm font-mono text-gray-500 uppercase">Sort By Price:</span>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-transparent border border-[#333] text-white py-2 px-4 rounded-full font-mono text-sm focus:outline-none focus:border-[#00ff88] hover:border-gray-500 transition-colors cursor-pointer appearance-none"
                    >
                        <option value="none" className="bg-black text-white">Featured</option>
                        <option value="lowToHigh" className="bg-black text-white">Low to High</option>
                        <option value="highToLow" className="bg-black text-white">High to Low</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">

                {/* Sidebar Filters */}
                <motion.aside
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-64 shrink-0"
                >
                    <div className="sticky top-32">
                        <FilterSection
                            title="Category"
                            options={categories}
                            activeOption={activeCategory}
                            setActiveOption={setActiveCategory}
                        />
                        <FilterSection
                            title="Walking Style"
                            options={walkingStyles}
                            activeOption={activeWalkingStyle}
                            setActiveOption={setActiveWalkingStyle}
                        />
                        <FilterSection
                            title="Climate"
                            options={climates}
                            activeOption={activeClimate}
                            setActiveOption={setActiveClimate}
                        />

                        {/* Reset Filters */}
                        {(activeCategory !== "All" || activeWalkingStyle !== "All" || activeClimate !== "All") && (
                            <button
                                onClick={() => {
                                    setActiveCategory("All");
                                    setActiveWalkingStyle("All");
                                    setActiveClimate("All");
                                }}
                                className="text-sm font-mono text-gray-500 hover:text-[#00ff88] transition-colors flex items-center gap-2 mt-4"
                            >
                                [x] Clear Filters
                            </button>
                        )}
                    </div>
                </motion.aside>

                {/* Product Grid */}
                <main className="flex-1">
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 gap-y-16">
                        <AnimatePresence>
                            {filteredAndSortedProducts.map((product) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={product.id}
                                    className="group relative flex flex-col"
                                >
                                    <div
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setIsModalOpen(true);
                                        }}
                                        className="relative w-full aspect-[5/4] overflow-hidden bg-transparent mb-6 rounded-sm cursor-pointer flex items-center justify-center"
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                                        />

                                        {/* Hover Overlay Tags */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-mono py-1 px-3 rounded-full border border-white/10 uppercase tracking-widest">{product.category}</span>
                                            <span className="bg-[#00ff88]/90 text-black text-xs font-mono py-1 px-3 rounded-full uppercase tracking-widest font-bold">{product.climate}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 flex-grow">
                                        <div className="flex justify-between items-start border-b border-[#333] pb-4 group-hover:border-[#00ff88] transition-colors duration-500">
                                            <div>
                                                <h3
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-xl font-bold uppercase mb-1 cursor-pointer hover:text-[#00ff88] transition-colors"
                                                >
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-xs text-gray-400 font-mono tracking-wider">{product.walkingStyle}</p>
                                                    <div className="flex items-center text-[#ffcc00] gap-1">
                                                        <Star size={12} className="fill-current" />
                                                        <span className="text-xs font-bold">{product.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xl font-bold text-[#00ff88]">₹{product.price}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 pt-2 min-h-[40px]">{product.description}</p>

                                        <button
                                            onClick={() => addToCart(product)}
                                            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#111] hover:bg-[#00ff88] text-white hover:text-black border border-[#333] hover:border-[#00ff88] transition-all duration-300 py-3 uppercase tracking-widest font-bold text-sm"
                                        >
                                            <ShoppingCart size={16} /> Add to Cart
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {isLoading ? (
                        <div className="w-full py-32 flex flex-col items-center justify-center text-center">
                            <Loader2 size={48} className="animate-spin text-[#00ff88] mb-4" />
                            <p className="text-gray-500 font-mono uppercase tracking-widest text-sm">Loading inventory...</p>
                        </div>
                    ) : filteredAndSortedProducts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full py-32 flex flex-col items-center justify-center text-center border border-dashed border-[#333] rounded-xl"
                        >
                            <span className="text-4xl mb-4">👟</span>
                            <h3 className="text-2xl font-bold uppercase mb-2">No matching pairs found</h3>
                            <p className="text-gray-500 font-mono">Try adjusting your filters to discover more gear.</p>
                            <div className="flex flex-col gap-4 mt-8">
                                <button
                                    onClick={() => {
                                        setActiveCategory("All");
                                        setActiveWalkingStyle("All");
                                        setActiveClimate("All");
                                    }}
                                    className="px-6 py-2 border border-[#00ff88] text-[#00ff88] rounded-full hover:bg-[#00ff88] hover:text-black transition-all font-bold uppercase tracking-widest text-sm"
                                >
                                    Reset Filters
                                </button>
                                {products.length === 0 && (
                                    <button
                                        onClick={async () => {
                                            await seedFirestore();
                                            window.location.reload();
                                        }}
                                        className="px-6 py-2 bg-yellow-400 text-black border border-yellow-400 rounded-full hover:bg-yellow-500 hover:text-black transition-all font-bold uppercase tracking-widest text-sm"
                                    >
                                        🔧 Dev Action: Load Database Initial Items
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ) : null}
                </main>
            </div>

            <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addToCart}
            />
        </div>
    );
};

export default Shop;
