
/**
 * @file Legacy Cart Hook
 * @deprecated This hook is deprecated.
 */
import React, { createContext, useContext } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CartContext.Provider value={{}}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
