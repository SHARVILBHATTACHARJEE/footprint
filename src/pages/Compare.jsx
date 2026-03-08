import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Compare = () => {
    const [products, setProducts] = useState([]);
    const [selectedShoeIds, setSelectedShoeIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();

    // Fetch products with their features from the API
    useEffect(() => {
        const fetchProductsAndFeatures = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products-features');
                if (!response.ok) {
                    throw new Error('Failed to fetch product data');
                }
                const data = await response.json();
                setProducts(data);

                // Pre-select the first 2 or 3 shoes if available
                if (data.length > 0) {
                    const initialSelection = data.slice(0, Math.min(3, data.length)).map(p => p.id);
                    setSelectedShoeIds(initialSelection);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProductsAndFeatures();
    }, []);

    const toggleShoeSelection = (id) => {
        setSelectedShoeIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(shoeId => shoeId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const removeShoe = (id) => {
        setSelectedShoeIds(prev => prev.filter(shoeId => shoeId !== id));
    };

    // Derived array of currently selected products
    const selectedShoes = products.filter(p => selectedShoeIds.includes(p.id));

    // The attributes we want to compare in order
    const comparisonAttributes = [
        { key: 'price', label: 'Price', format: (p) => p.feature_price || `₹${p.price}` },
        { key: 'weight', label: 'Weight', format: (p) => p.weight || 'N/A' },
        { key: 'cushioning_level', label: 'Cushioning', format: (p) => p.cushioning_level || 'N/A' },
        { key: 'arch_support', label: 'Arch Support', format: (p) => p.arch_support || 'N/A' },
        { key: 'foot_width_support', label: 'Foot Width', format: (p) => p.foot_width_support || 'N/A' },
        { key: 'breathability', label: 'Breathability', format: (p) => p.breathability || 'N/A' },
        { key: 'durability', label: 'Durability', format: (p) => p.durability || 'N/A' },
        { key: 'shoe_type', label: 'Best For', format: (p) => p.shoe_type || p.category || 'N/A' },
        { key: 'upper_material', label: 'Upper Material', format: (p) => p.upper_material || 'N/A' },
        { key: 'sole_material', label: 'Sole Material', format: (p) => p.sole_material || 'N/A' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-black text-white flex items-center justify-center">
                <p className="text-[#00ff88] text-xl font-bold animate-pulse tracking-widest uppercase">Loading Diagnostics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-black text-white flex items-center justify-center">
                <p className="text-red-500 text-xl">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-black text-white flex flex-col items-center">

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-7xl text-center mb-12"
            >
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                    Product <span className="text-[#00ff88]">Compare</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto uppercase tracking-widest text-sm">
                    Analyze technical specifications side-by-side to find your perfect biomechanical fit.
                </p>
            </motion.div>

            {/* Selection Area */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-7xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-12"
            >
                <h3 className="text-[#00ff88] font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                    <Plus size={16} /> Add to Comparison
                </h3>
                <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
                    {products.map(product => {
                        const isSelected = selectedShoeIds.includes(product.id);
                        return (
                            <div
                                key={product.id}
                                onClick={() => toggleShoeSelection(product.id)}
                                className={`flex-shrink-0 w-32 cursor-pointer group relative rounded-xl overflow-hidden border transition-all duration-300 ${isSelected ? 'border-[#00ff88] bg-[#00ff88]/10' : 'border-white/10 hover:border-white/30 bg-black/50'
                                    }`}
                            >
                                <div className="h-24 w-full bg-white/5 relative flex items-center justify-center overflow-hidden">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150/111111/FFFFFF?text=Shoe' }}
                                    />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-[#00ff88]/20 flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="bg-[#00ff88] text-black rounded-full p-1 border-2 border-black">
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 text-center">
                                    <p className="text-xs font-bold truncate" title={product.name}>{product.name}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Comparison Table */}
            {selectedShoes.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-7xl overflow-x-auto custom-scrollbar"
                >
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr>
                                {/* Empty top-left corner */}
                                <th className="p-4 w-48 border-b border-white/10 sticky left-0 z-10 bg-black align-bottom">
                                    <span className="text-gray-500 uppercase tracking-widest text-xs font-bold relative top-2">Technical Specs</span>
                                </th>

                                {/* Product Headers */}
                                {selectedShoes.map(shoe => (
                                    <th key={shoe.id} className="p-4 min-w-[250px] border-b border-white/10 align-top relative group">
                                        <button
                                            onClick={() => removeShoe(shoe.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={14} />
                                        </button>

                                        <div className="h-48 w-full bg-white/5 rounded-xl overflow-hidden mb-4 relative">
                                            <img
                                                src={shoe.image_url}
                                                alt={shoe.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/300/111111/FFFFFF?text=Shoe' }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        </div>

                                        <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">{shoe.name}</h3>

                                        <button
                                            onClick={() => addToCart(shoe)}
                                            className="w-full py-2.5 bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-black border border-[#00ff88]/30 hover:border-[#00ff88] transition-all rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={14} /> Add to Cart
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {comparisonAttributes.map((attr, index) => (
                                    <motion.tr
                                        key={attr.key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="hover:bg-white/5 transition-colors border-b border-white/5"
                                    >
                                        <td className="p-4 font-bold text-gray-400 tracking-widest text-xs uppercase bg-black sticky left-0 z-10">
                                            {attr.label}
                                        </td>

                                        {selectedShoes.map(shoe => (
                                            <td key={`${shoe.id}-${attr.key}`} className="p-4 text-white text-sm">
                                                {attr.key === 'price' ? (
                                                    <span className="text-[#00ff88] font-bold">{attr.format(shoe)}</span>
                                                ) : (
                                                    attr.format(shoe)
                                                )}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </motion.div>
            ) : (
                <div className="w-full max-w-7xl py-20 text-center border border-white/10 border-dashed rounded-2xl bg-white/5">
                    <p className="text-gray-400 uppercase tracking-widest font-bold">Select at least one product above to begin comparison.</p>
                </div>
            )}
        </div >
    );
};

export default Compare;
