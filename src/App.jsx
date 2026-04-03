import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import SmartFit from './pages/SmartFit';
import Compare from './pages/Compare';
import SoleSizeDetector from './pages/SoleSizeDetector';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Admin from './pages/Admin';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="bg-black min-h-screen selection:bg-[#00ff88] selection:text-black font-sans overflow-x-hidden flex flex-col">
          <Navbar />
          <CartSidebar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/smart-fit" element={<SmartFit />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/sole-detector" element={<SoleSizeDetector />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
          <Footer />
          <Chatbot />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
