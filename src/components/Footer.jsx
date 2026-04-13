import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full py-12 bg-black border-t border-[#111] mt-auto">
            <div className="container mx-auto px-6 flex flex-col items-center justify-center space-y-6">
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs font-mono uppercase tracking-widest text-gray-500">
                    <Link to="/help" className="hover:text-[#00ff88] transition-colors">Help Center</Link>
                    <Link to="/privacy" className="hover:text-[#00ff88] transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-[#00ff88] transition-colors">Terms & Conditions</Link>
                </div>
                <div className="text-gray-800 uppercase text-xs tracking-[0.5em] text-center">
                    Footprint © {new Date().getFullYear()} // Future Steps
                </div>
            </div>
        </footer>
    );
};

export default Footer;
