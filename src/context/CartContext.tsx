/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem, Coupon } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (food: FoodItem, quantity?: number) => void;
  removeFromCart: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  getItemQuantity: (foodId: string) => number;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('foodiehub_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const stored = localStorage.getItem('foodiehub_coupon');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [couponError, setCouponError] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('foodiehub_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('foodiehub_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('foodiehub_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (food: FoodItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.foodItem.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.foodItem.id === food.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { foodItem: food, quantity }];
    });
  };

  const removeFromCart = (foodId: string) => {
    setItems((prev) => prev.filter((item) => item.foodItem.id !== foodId));
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.foodItem.id === foodId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const getItemQuantity = (foodId: string) => {
    const found = items.find((item) => item.foodItem.id === foodId);
    return found ? found.quantity : 0;
  };

  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.foodItem.price * curr.quantity, 0);

  // Delivery fee: Free for orders ₹500 or more, else ₹30
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 30;

  // 5% GST
  const tax = subtotal === 0 ? 0 : Math.round(subtotal * 0.05);

  // Coupon discount calculation
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minimumOrderValue) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maximumDiscount > 0 && discount > appliedCoupon.maximumDiscount) {
        discount = appliedCoupon.maximumDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + tax - discount);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponError(null);
        return true;
      } else {
        setCouponError(data.message || 'Invalid coupon');
        return false;
      }
    } catch {
      setCouponError('Could not validate coupon at this time');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        getItemQuantity,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
