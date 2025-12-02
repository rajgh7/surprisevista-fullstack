import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(
    Number(localStorage.getItem("cartCount") || 0)
  );

  const updateCart = (qty) => {
    const newCount = cartCount + qty;
    setCartCount(newCount);
    localStorage.setItem("cartCount", newCount);
  };

  return (
    <CartContext.Provider value={{ cartCount, updateCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
