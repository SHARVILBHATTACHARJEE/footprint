import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Retrieve cart items from local storage on initial load
        const storedCart = localStorage.getItem('footprintCart');
        if (storedCart) {
            const parsed = JSON.parse(storedCart);
            return parsed.map(item => ({
                ...item,
                selectedSize: item.selectedSize || '8',
                cartItemId: item.cartItemId || `${item.id}-${item.selectedSize || '8'}`
            }));
        }
        return [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Save to local storage whenever cart items change
    useEffect(() => {
        localStorage.setItem('footprintCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, selectedSize = '8') => {
        const cartItemId = `${product.id}-${selectedSize}`;
        setCartItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex((item) => item.cartItemId === cartItemId);
            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + 1
                };
                return newItems;
            }
            return [...prevItems, { ...product, cartItemId, selectedSize, quantity: 1 }];
        });
        // Optionally open cart when adding
        // setIsCartOpen(true); 
    };

    const removeFromCart = (cartItemId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(cartItemId);
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const toggleCart = () => {
        setIsCartOpen((prev) => !prev);
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const clearCart = () => {
        setCartItems([]);
    };
    return (
        <CartContext.Provider value={{
            cartItems,
            isCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            toggleCart,
            cartCount,
            cartTotal,
            setIsCartOpen,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
