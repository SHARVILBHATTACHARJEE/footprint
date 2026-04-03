import React, { Suspense } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import ProductShowcase from '../components/ProductShowcase';
import FootHealth from '../components/FootHealth';
import Grain from '../components/Grain';

const Home = () => {
    return (
        <div className="bg-black min-h-screen selection:bg-[#00ff88] selection:text-black font-sans overflow-x-hidden">
            <Grain />
            <Hero />
            <Features />
            <ProductShowcase />
            <FootHealth />



        </div>
    );
};

export default Home;
