import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BiometricHeatmap = ({ answers, heightClass = "h-[400px] md:h-[600px]" }) => {
    const getHeatmapPoints = () => {
        // Defaults (No survey taken, or default info)
        let heelIntensity = 1;
        let archIntensity = 1;
        let forefootIntensity = 1;

        let heelColor = "#00ff88";     // Green
        let archColor = "#00ff88";
        let forefootColor = "#00ff88";
        
        let cxHeel = 100;
        let cxArch = 100;
        let cxForefoot = 100;

        if (answers) {
            // Activity impact
            if (answers.activity === 'running') {
                forefootIntensity = 2.5;
                forefootColor = "#ff3366"; // High pressure Red/Pink
            } else if (answers.activity === 'walking') {
                heelIntensity = 2.0;
                heelColor = "#ffaa00"; // Medium pressure Orange
            } else if (answers.activity === 'standing') {
                heelIntensity = 2.5;
                heelColor = "#ff3366";
            }

            // Arch impact
            if (answers.archType === 'flat') {
                archIntensity = 2.2;
                archColor = "#ff3366"; // High pressure on flat arch
                cxArch = 80; // Expand towards inside
            } else if (answers.archType === 'high') {
                archIntensity = 0.5; // low pressure
                archColor = "#00ff88"; // normal
            } else {
                archIntensity = 1.2;
                archColor = "#00ff88";
            }

            // Gait impact (Pronation/Supination) shifts pressure laterally
            if (answers.gaitType === 'pronation') {
                cxHeel = 110; 
                cxForefoot = 80;
                archIntensity *= 1.5;
                if (archColor === "#00ff88") archColor = "#ffaa00";
            } else if (answers.gaitType === 'supination') {
                cxHeel = 90;
                cxForefoot = 130;
                archIntensity *= 0.5;
            }
        }

        return [
            { id: 'forefoot', cx: cxForefoot, cy: 90, label: "Forefoot Impact", delay: 1, intensity: forefootIntensity, color: forefootColor, top: '25%' },
            { id: 'arch', cx: cxArch, cy: 160, label: "Arch Pressure", delay: 0.5, intensity: archIntensity, color: archColor, top: '50%' },
            { id: 'heel', cx: cxHeel, cy: 240, label: "Heel Strike", delay: 0, intensity: heelIntensity, color: heelColor, top: '75%' }
        ];
    };

    const heatmapPoints = getHeatmapPoints();

    return (
        <div className="flex flex-col gap-4 w-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className={`relative ${heightClass} w-full bg-black/50 border border-[#222] rounded-2xl p-4 md:p-8 flex items-center justify-center overflow-hidden`}
            >
                {/* Personalization Status Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    {answers ? (
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-[#ff3366] bg-[#ff3366]/10 px-3 py-1.5 rounded-full border border-[#ff3366]/30 uppercase flex items-center gap-2 backdrop-blur-sm"
                        >
                            <span className="relative flex h-2 w-2 shadow-[0_0_8px_#ff3366]">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3366] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff3366]"></span>
                            </span>
                            Personalized Heatmap
                        </motion.span>
                    ) : (
                        <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-[#00ff88] bg-[#00ff88]/10 px-3 py-1.5 rounded-full border border-[#00ff88]/30 uppercase backdrop-blur-sm">
                            Standard Model
                        </span>
                    )}
                </div>

                {/* Abstract Foot Visualization SVG */}
                <svg viewBox="0 0 200 300" className={`w-auto h-full z-10 transition-all duration-1000 ${answers ? 'drop-shadow-[0_0_20px_rgba(255,51,102,0.2)]' : 'drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]'}`}>
                    {/* Static Stylized Outline */}
                    <motion.path
                        d="M100 30 C80 30, 50 50, 50 100 C50 150, 60 200, 70 230 C80 250, 90 270, 100 280 C110 270, 120 250, 130 230 C140 200, 150 150, 150 100 C150 50, 120 30, 100 30 Z"
                        fill={answers ? "rgba(255,51,102,0.02)" : "rgba(0,255,136,0.02)"}
                        stroke={answers ? "#ff3366" : "#00ff88"}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ duration: 1.5 }}
                    />

                    {/* Dynamic Pressure Points */}
                    {heatmapPoints.map((point, i) => (
                        <g key={i}>
                            {point.intensity > 2 && (
                                <motion.circle
                                    cx={point.cx}
                                    cy={point.cy}
                                    r={25 * point.intensity}
                                    fill={point.color}
                                    filter="blur(16px)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.05, 0.25, 0.05], scale: [0.8, 1.3, 0.8] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: point.delay, ease: "easeInOut" }}
                                />
                            )}
                            {point.intensity > 1.2 && (
                                <motion.circle
                                    cx={point.cx}
                                    cy={point.cy}
                                    r={15 * point.intensity}
                                    fill={point.color}
                                    filter="blur(8px)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.9, 1.2, 0.9] }}
                                    transition={{ duration: 2.5, repeat: Infinity, delay: point.delay, ease: "easeInOut" }}
                                />
                            )}
                            <motion.circle
                                cx={point.cx}
                                cy={point.cy}
                                r={6 + (point.intensity * 2)}
                                fill={point.color}
                                initial={{ opacity: 0.3, scale: 0.8 }}
                                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity, delay: point.delay, ease: "easeInOut" }}
                            />
                        </g>
                    ))}
                </svg>

                {/* Rendering HTML Labels positioned absolutely over the SVG container */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {heatmapPoints.map((point, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-[9px] md:text-xs uppercase tracking-widest font-bold bg-black/80 px-2 py-1 md:px-3 md:py-1.5 border rounded backdrop-blur-sm shadow-xl"
                            style={{
                                top: point.top,
                                left: '50%',
                                transform: 'translateX(40%)',
                                color: point.color,
                                borderColor: `${point.color}40`,
                                boxShadow: `0 0 10px ${point.color}20`
                            }}
                            initial={{ opacity: 0, y: 10, x: 10 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.2 }}
                        >
                            {point.label}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Call to action or dynamic info text */}
            {!answers ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-2"
                >
                    <Link to="/smart-fit" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold font-mono text-gray-400 hover:text-[#00ff88] transition-colors border-b border-transparent hover:border-[#00ff88] pb-1 uppercase tracking-widest">
                        Unlock Your Biometric Heatmap With Smart Fit™ <ArrowRight size={14} />
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-2 text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <span>Profile context:</span>
                    <span className="text-[#00ff88]">{answers.activity} Focus</span> / 
                    <span className="text-[#00ff88]">{answers.archType} arch</span> / 
                    <span className="text-[#00ff88]">{answers.gaitType} gait</span>
                </motion.div>
            )}
        </div>
    );
};

export default BiometricHeatmap;
