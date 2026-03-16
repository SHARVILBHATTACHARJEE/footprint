import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';
import SmartFit from './pages/SmartFit';
import Compare from './pages/Compare';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="bg-black min-h-screen selection:bg-[#00ff88] selection:text-black font-sans overflow-x-hidden">
          <Navbar />
          <CartSidebar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/smart-fit" element={<SmartFit />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
