import React from 'react';

const Grain = () => (
    <div className="pointer-events-none fixed inset-0 z-[9998] opacity-[0.07] mix-blend-overlay">
        <svg className="h-full w-full">
            <filter id="noiseFilter">
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.6"
                    numOctaves="3"
                    stitchTiles="stitch"
                />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
    </div>
);

export default Grain;
