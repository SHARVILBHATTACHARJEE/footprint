import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';
import SmartFit from './pages/SmartFit';
import Compare from './pages/Compare';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import { CursorProvider } from './context/CursorContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router>
      <CartProvider>
        <CursorProvider>
          <div className="bg-black min-h-screen cursor-none selection:bg-[#00ff88] selection:text-black font-sans overflow-x-hidden">
            <CustomCursor />
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
        </CursorProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
