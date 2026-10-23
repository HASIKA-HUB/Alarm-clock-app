/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Ticket,
  Check,
  X,
  Truck,
  Sparkles,
  Info,
} from 'lucide-react';

interface CartPageProps {
  onNavigate: (viewId: string) => void;
  onProceedToCheckout: () => void;
}

const AVAILABLE_COUPONS = [
  { code: 'WELCOME50', desc: '50% off up to ₹100 on orders above ₹199' },
  { code: 'FOODIE100', desc: 'Flat ₹100 OFF on orders above ₹499' },
  { code: 'TASTY20', desc: '20% off up to ₹150 on orders above ₹299' },
];

export const CartPage: React.FC<CartPageProps> = ({
  onNavigate,
  onProceedToCheckout,
}) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
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
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;
    setApplying(true);
    await applyCoupon(code);
    setApplying(false);
    setCouponInput('');
  };

  // Free delivery progress
  const freeDeliveryThreshold = 500;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="font-outfit font-black text-3xl text-slate-900">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          You haven't added any delicious food yet. Explore our handcrafted menu or ask Foodie AI for meal recommendations!
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="py-3 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 inline-flex items-center gap-2 cursor-pointer transition transform active:scale-95 mt-2"
        >
          <span>Explore Delicious Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE1]">
        <div>
          <h1 className="font-outfit font-black text-3xl text-slate-900">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your order items, select promo coupons, and proceed to checkout
          </p>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-semibold transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5 text-orange-700">
            <Truck className="w-4 h-4" />
            {deliveryFee === 0
              ? 'Congratulations! You unlocked FREE Delivery'
              : `Add ₹${amountToFreeDelivery} more to get FREE Delivery`}
          </span>
          <span className="font-outfit">{freeDeliveryProgress}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-orange-200/50">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ foodItem, quantity }) => (
            <div
              key={foodItem.id}
              className="p-4 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={foodItem.imageUrl}
                  alt={foodItem.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 border-2 flex items-center justify-center rounded-xs ${
                        foodItem.vegetarian ? 'border-emerald-600' : 'border-rose-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          foodItem.vegetarian ? 'bg-emerald-600' : 'bg-rose-700'
                        }`}
                      />
                    </span>
                    <h3 className="font-outfit font-bold text-sm sm:text-base text-slate-900">
                      {foodItem.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">₹{foodItem.price} each</p>
                </div>
              </div>

              {/* Quantity Stepper & Subtotal */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-2 py-1">
                  <button
                    onClick={() => updateQuantity(foodItem.id, quantity - 1)}
                    className="p-1 hover:bg-orange-100 rounded-md transition cursor-pointer text-orange-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-outfit font-black text-xs min-w-[18px] text-center text-orange-950">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(foodItem.id, quantity + 1)}
                    className="p-1 hover:bg-orange-100 rounded-md transition cursor-pointer text-orange-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="font-outfit font-black text-base text-slate-900 min-w-[65px] text-right">
                  ₹{foodItem.price * quantity}
                </div>

                <button
                  onClick={() => removeFromCart(foodItem.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  title="Remove item"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Coupon Box & Bill Breakdown */}
        <div className="space-y-4">
          {/* Coupon Input & Available Offers */}
          <div className="p-5 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-3">
            <h3 className="font-outfit font-bold text-sm text-slate-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-orange-600" />
              <span>Apply Discount Coupon</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-outfit font-black uppercase text-emerald-900">
                      {appliedCoupon.code}
                    </span>
                    <p className="text-[11px] text-emerald-700">₹{discount} savings applied!</p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. WELCOME50)"
                    className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-outfit font-bold focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={applying || !couponInput.trim()}
                    className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-outfit font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <p className="text-xs text-rose-600 font-medium">{couponError}</p>
                )}

                {/* Clickable Recommended Coupons */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Available Offers:
                  </span>
                  {AVAILABLE_COUPONS.map((c) => (
                    <div
                      key={c.code}
                      onClick={() => handleApplyCoupon(c.code)}
                      className="p-2 rounded-xl bg-orange-50/60 hover:bg-orange-100/70 border border-orange-200/60 cursor-pointer flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-outfit font-black text-orange-700">{c.code}</span>
                        <p className="text-[10px] text-slate-600">{c.desc}</p>
                      </div>
                      <span className="text-[11px] font-bold text-orange-600">Apply</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="p-5 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-3">
            <h3 className="font-outfit font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Bill Details
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Item Subtotal</span>
                <span className="font-medium text-slate-900">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Delivery Partner Fee</span>
                <span className="font-medium text-slate-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Restaurant GST & Taxes (5%)</span>
                <span className="font-medium text-slate-900">₹{tax}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-base font-outfit font-black text-slate-900">
                <span>To Pay</span>
                <span className="text-xl text-orange-600">₹{total}</span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-fadeIn">
            <Trash2 className="w-10 h-10 text-rose-500 mx-auto" />
            <h4 className="font-outfit font-black text-lg text-slate-900">Clear Your Cart?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove all items from your shopping cart?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-outfit font-bold uppercase tracking-wider cursor-pointer transition"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
