import React, { Suspense } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import ProductShowcase from '../components/ProductShowcase';
import FootHealth from '../components/FootHealth';
import Grain from '../components/Grain';

const Home = () => {
    return (
        <div className="bg-black min-h-screen cursor-none selection:bg-[#00ff88] selection:text-black font-sans overflow-x-hidden">
            <Grain />
            <Hero />
            <Features />
            <ProductShowcase />
            <FootHealth />


            {/* Simple Footer */}
            <footer className="w-full py-12 text-center text-gray-800 uppercase text-xs tracking-[0.5em] bg-black border-t border-[#111]">
                Footprint © 2026 // Future Steps
            </footer>
        </div>
    );
};

export default Home;
