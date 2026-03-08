import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Footprints, ThermometerSun, Leaf, Clock, Map, Zap,
    Droplet, ArrowRight, ArrowLeft, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const SmartFit = () => {
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [matchScore, setMatchScore] = useState(0);

    const { addToCart } = useCart();

    const [answers, setAnswers] = useState({
        footWidth: '',
        archType: '',
        gaitType: '',
        activity: '',
        climate: '',
        surfaces: [],
        replacement: '',
        concerns: []
    });

    const updateAnswer = (key, value) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const toggleArrayAnswer = (key, value) => {
        setAnswers(prev => {
            const currentArr = prev[key];
            if (currentArr.includes(value)) {
                return { ...prev, [key]: currentArr.filter(i => i !== value) };
            } else {
                return { ...prev, [key]: [...currentArr, value] };
            }
        });
    };

    const isValidStep = () => {
        switch (step) {
            case 1: return answers.footWidth !== '' && answers.archType !== '';
            case 2: return answers.gaitType !== '' && answers.activity !== '';
            case 3: return answers.climate !== '' && answers.surfaces.length > 0;
            case 4: return answers.replacement !== '';
            default: return true;
        }
    };

    const nextStep = () => {
        if (isValidStep() && step < 4) {
            setStep(s => s + 1);
        } else if (step === 4 && isValidStep()) {
            submitAnalysis();
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(s => s - 1);
    };

    const submitAnalysis = async () => {
        setStep(5); // Move to results step (loading state)
        setIsAnalyzing(true);

        try {
            // Fetch products from database
            const response = await fetch('https://footprint-6e9p.onrender.com/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();

            // Artificial delay to make it feel like "analysis"
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simple logic mapping answers to product properties
            const scoredProducts = data.map(product => {
                let score = 50; // Base score

                // Add points if category/walking style matches activity preference
                if (answers.activity === 'running' && (product.walking_style === 'Running' || product.category === 'Athletic')) score += 20;
                if (answers.activity === 'walking' && (product.walking_style === 'City Walking' || product.category === 'Casual')) score += 20;

                // Add points for climate match
                if (answers.climate === 'hot' && (product.climate === 'Warm' || product.climate === 'All-Weather')) score += 15;
                if (answers.climate === 'cold' && (product.climate === 'Harsh' || product.climate === 'All-Weather')) score += 15;
                if (answers.climate === 'humid' && product.climate === 'Warm') score += 10;

                // Add randomness for tie-breaking and variety
                score += Math.floor(Math.random() * 10);

                // Cap score at 99
                score = Math.min(score, 99);
                return { ...product, matchScore: score };
            });

            // Sort by score descending
            scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

            // Take top 3
            setRecommendations(scoredProducts.slice(0, 3));
            setMatchScore(scoredProducts[0]?.matchScore || 0);

        } catch (error) {
            console.error('Analysis failed:', error);
            // Fallback empty recommendations or gracefully handle error
        } finally {
            setIsAnalyzing(false);
        }
    };

    const restart = () => {
        setAnswers({
            footWidth: '', archType: '', gaitType: '', activity: '',
            climate: '', surfaces: [], replacement: '', concerns: []
        });
        setStep(1);
        setRecommendations([]);
    };

    // Reusable UI Components for Options
    const OptionCard = ({ label, value, current, groupName, icon: Icon, description }) => {
        const isSelected = current === value;
        return (
            <label className="cursor-pointer group relative flex flex-col h-full">
                <input
                    type="radio" name={groupName} value={value}
                    checked={isSelected}
                    onChange={() => updateAnswer(groupName, value)}
                    className="sr-only"
                />
                <div className={`p-6 border flex flex-col items-center text-center gap-4 rounded-xl flex-grow transition-all duration-300 ${isSelected ? 'border-[#00ff88] bg-[#00ff88]/10 text-white' : 'border-[#333] bg-[#111] text-gray-400 group-hover:border-gray-500 hover:text-white'}`}>
                    <div className={`p-3 rounded-full ${isSelected ? 'bg-[#00ff88] text-black' : 'bg-[#222] text-gray-400 group-hover:bg-[#333]'}`}>
                        {Icon && <Icon size={32} />}
                    </div>
                    <div>
                        <span className={`block font-bold uppercase tracking-wider ${isSelected ? 'text-[#00ff88]' : ''}`}>{label}</span>
                        {description && <span className="block mt-2 text-xs font-mono opacity-80">{description}</span>}
                    </div>
                </div>
            </label>
        );
    };

    const CheckboxCard = ({ label, value, arrayValue, groupName, icon: Icon }) => {
        const isSelected = arrayValue.includes(value);
        return (
            <label className="cursor-pointer group relative">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleArrayAnswer(groupName, value)}
                    className="sr-only"
                />
                <div className={`p-4 border flex items-center gap-4 rounded-xl transition-all duration-300 ${isSelected ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]' : 'border-[#333] bg-[#111] text-gray-400 group-hover:border-gray-500 hover:text-white'}`}>
                    {Icon && <Icon size={20} />}
                    <span className="font-bold uppercase tracking-widest text-sm">{label}</span>
                </div>
            </label>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12 flex flex-col items-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="max-w-4xl w-full text-center mb-16 relative z-10">
                <div className="inline-flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="text-[#00ff88]" size={24} />
                    <span className="text-[#00ff88] font-mono tracking-widest uppercase text-sm font-bold">Smart Fit™ Analysis</span>
                </div>
                <h1 className="text-4xl md:text-[4rem] font-bold uppercase tracking-tighter leading-none mb-6">
                    Perfect Your Match
                </h1>
                <p className="text-gray-400 font-mono text-lg max-w-2xl mx-auto">
                    Answer a few questions about your foot profile and lifestyle, and our algorithm will pair you with the perfect biomechanical fit.
                </p>

                {/* Progress Bar */}
                {step < 5 && (
                    <div className="mt-12 max-w-2xl mx-auto border border-[#333] rounded-full p-1">
                        <div className="h-2 relative bg-transparent overflow-hidden rounded-full">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-[#00ff88]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((step - 1) / 3) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Steps Container */}
            <div className="max-w-4xl w-full relative z-10 flex-grow">
                <AnimatePresence mode="wait">

                    {/* STEP 1: Foot Shape */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#0a0a0a] border border-[#222] p-8 md:p-12 rounded-2xl"
                        >
                            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-[#00ff88]">1. Foot Shape Analysis</h2>

                            <div className="mb-12">
                                <h3 className="text-lg font-mono mb-6 text-gray-300">What is your foot width?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <OptionCard label="Narrow" value="narrow" current={answers.footWidth} groupName="footWidth" icon={Footprints} />
                                    <OptionCard label="Medium" value="medium" current={answers.footWidth} groupName="footWidth" icon={Footprints} />
                                    <OptionCard label="Wide" value="wide" current={answers.footWidth} groupName="footWidth" icon={Footprints} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-mono mb-6 text-gray-300">What is your arch type?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <OptionCard label="Flat / Low" value="flat" current={answers.archType} groupName="archType" icon={Footprints} />
                                    <OptionCard label="Normal" value="normal" current={answers.archType} groupName="archType" icon={Footprints} />
                                    <OptionCard label="High Arch" value="high" current={answers.archType} groupName="archType" icon={Footprints} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Walking Style */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#0a0a0a] border border-[#222] p-8 md:p-12 rounded-2xl"
                        >
                            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-[#00ff88]">2. Movement & Gait</h2>

                            <div className="mb-12">
                                <h3 className="text-lg font-mono mb-6 text-gray-300">How would you describe your gait?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <OptionCard label="Neutral" value="neutral" current={answers.gaitType} groupName="gaitType" icon={Footprints} description="Even weight distribution" />
                                    <OptionCard label="Pronation" value="pronation" current={answers.gaitType} groupName="gaitType" icon={Footprints} description="Foot rolls inward" />
                                    <OptionCard label="Supination" value="supination" current={answers.gaitType} groupName="gaitType" icon={Footprints} description="Foot rolls outward" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-mono mb-6 text-gray-300">What's your primary activity?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <OptionCard label="Daily Walking" value="walking" current={answers.activity} groupName="activity" icon={Footprints} />
                                    <OptionCard label="Running" value="running" current={answers.activity} groupName="activity" icon={Activity} />
                                    <OptionCard label="Standing" value="standing" current={answers.activity} groupName="activity" icon={Footprints} />
                                    <OptionCard label="Mixed" value="mixed" current={answers.activity} groupName="activity" icon={Activity} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Environment */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#0a0a0a] border border-[#222] p-8 md:p-12 rounded-2xl"
                        >
                            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-[#00ff88]">3. Climate Profile</h2>

                            <div className="mb-12">
                                <h3 className="text-lg font-mono mb-6 text-gray-300">What's your typical climate?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <OptionCard label="Hot & Dry" value="hot" current={answers.climate} groupName="climate" icon={ThermometerSun} />
                                    <OptionCard label="Humid" value="humid" current={answers.climate} groupName="climate" icon={Droplet} />
                                    <OptionCard label="Cold" value="cold" current={answers.climate} groupName="climate" icon={ThermometerSun} />
                                    <OptionCard label="Rainy" value="wet" current={answers.climate} groupName="climate" icon={Droplet} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-mono mb-6 text-gray-300">What surfaces do you typically walk on? (Select all)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CheckboxCard label="Concrete / City" value="concrete" arrayValue={answers.surfaces} groupName="surfaces" icon={Map} />
                                    <CheckboxCard label="Carpet / Indoors" value="carpet" arrayValue={answers.surfaces} groupName="surfaces" />
                                    <CheckboxCard label="Trails / Off-road" value="trails" arrayValue={answers.surfaces} groupName="surfaces" icon={Leaf} />
                                    <CheckboxCard label="Tile / Hardwood" value="tiles" arrayValue={answers.surfaces} groupName="surfaces" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Lifestyle */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#0a0a0a] border border-[#222] p-8 md:p-12 rounded-2xl"
                        >
                            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-[#00ff88]">4. Lifestyle & Preferences</h2>

                            <div className="mb-12">
                                <h3 className="text-lg font-mono mb-6 text-gray-300">How often do you replace your shoes?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <OptionCard label="6 Months" value="6months" current={answers.replacement} groupName="replacement" icon={Clock} />
                                    <OptionCard label="1 Year" value="1year" current={answers.replacement} groupName="replacement" icon={Clock} />
                                    <OptionCard label="2+ Years" value="2years" current={answers.replacement} groupName="replacement" icon={Clock} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-mono mb-6 text-gray-300">Any specific concerns? (Select all)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CheckboxCard label="Back Pain" value="back-pain" arrayValue={answers.concerns} groupName="concerns" icon={AlertCircle} />
                                    <CheckboxCard label="Knee Pain" value="knee-pain" arrayValue={answers.concerns} groupName="concerns" icon={AlertCircle} />
                                    <CheckboxCard label="Plantar Fasciitis" value="plantar-fasciitis" arrayValue={answers.concerns} groupName="concerns" icon={AlertCircle} />
                                    <CheckboxCard label="Blisters" value="blisters" arrayValue={answers.concerns} groupName="concerns" icon={AlertCircle} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: Loading & Results */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full"
                        >
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center py-32 text-center text-[#00ff88]">
                                    <Loader2 className="animate-spin mb-6" size={64} />
                                    <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">Analyzing Profile</h2>
                                    <p className="text-gray-400 font-mono">Running your data through our biomechanical algorithms...</p>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="bg-[#0a0a0a] border border-[#00ff88]/30 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div>
                                            <h2 className="text-2xl font-bold uppercase tracking-widest text-[#00ff88] flex items-center gap-3">
                                                <Zap /> Analysis Complete
                                            </h2>
                                            <p className="text-gray-400 font-mono mt-2">
                                                Based on your {answers.footWidth} width, {answers.archType} arch, and {answers.activity} focus, we've found your ultimate matches.
                                            </p>
                                        </div>
                                        <div className="text-center shrink-0">
                                            <div className="text-5xl font-black text-[#00ff88]">{matchScore}%</div>
                                            <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">Top Match Score</div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold uppercase tracking-widest mb-8 text-white border-b border-[#333] pb-4">Your Recommended Gear</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                        {recommendations.map((product, index) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.2 }}
                                                key={product.id}
                                                className="group flex flex-col"
                                            >
                                                <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#0a0a0a] mb-6 rounded-xl border border-[#333] group-hover:border-[#00ff88] transition-colors">
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur text-[#00ff88] text-xs font-mono font-bold py-2 px-3 rounded-full border border-[#00ff88]/50">
                                                        {product.matchScore}% MATCH
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 flex-grow">
                                                    <div className="flex justify-between items-start border-b border-[#333] pb-4">
                                                        <div>
                                                            <h4 className="text-xl font-bold uppercase mb-1">{product.name}</h4>
                                                            <p className="text-xs text-gray-400 font-mono tracking-wider">{product.walking_style || product.category}</p>
                                                        </div>
                                                        <span className="text-xl font-bold text-[#00ff88]">${parseFloat(product.price)}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 pt-2 min-h-[40px] italic">{product.description}</p>

                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="w-full mt-4 bg-[#111] hover:bg-[#00ff88] text-white hover:text-black border border-[#333] hover:border-[#00ff88] transition-all duration-300 py-3 uppercase tracking-widest font-bold text-sm"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <button onClick={restart} className="px-8 py-3 border border-gray-600 rounded-full hover:bg-white hover:text-black transition-all font-bold uppercase tracking-widest text-sm text-gray-300">
                                            Retake Survey
                                        </button>
                                        <Link to="/shop" className="px-8 py-3 bg-[#00ff88] text-black rounded-full hover:bg-white transition-all font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                                            Shop All <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Navigation Buttons (Steps 1-4) */}
            {step < 5 && (
                <div className="max-w-4xl w-full flex justify-between mt-12 relative z-10 border-t border-[#222] pt-8">
                    {step > 1 ? (
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 px-6 py-3 border border-[#333] text-gray-400 rounded-full hover:text-white hover:bg-[#222] transition-colors font-bold uppercase tracking-widest text-sm"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                    ) : (
                        <div /> // Placeholder to push Next button to right
                    )}

                    <button
                        onClick={nextStep}
                        disabled={!isValidStep()}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] ${isValidStep() ? 'bg-[#00ff88] text-black hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'}`}
                    >
                        {step === 4 ? 'Get Results' : 'Continue'} <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SmartFit;
