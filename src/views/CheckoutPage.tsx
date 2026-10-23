/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Address, Order, PaymentMethod } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  Check,
} from 'lucide-react';

interface CheckoutPageProps {
  onOrderPlaced: (order: Order) => void;
  onNavigate: (viewId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderPlaced,
  onNavigate,
}) => {
  const { user, addSavedAddress } = useAuth();
  const { items, subtotal, deliveryFee, tax, discount, total, appliedCoupon, clearCart } = useCart();

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerInstructions, setCustomerInstructions] = useState('');

  // Address
  const defaultAddr = user?.savedAddresses?.find((a) => a.isDefault) || user?.savedAddresses?.[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || 'new');
  const [newAddressLine, setNewAddressLine] = useState(defaultAddr?.addressLine || '');
  const [newCity, setNewCity] = useState(defaultAddr?.city || 'Bengaluru');
  const [newPincode, setNewPincode] = useState(defaultAddr?.pincode || '560103');
  const [newTitle, setNewTitle] = useState('Home');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('demo_upi');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="font-outfit font-black text-2xl text-slate-900">
          No items in cart for checkout
        </h2>
        <button
          onClick={() => onNavigate('menu')}
          className="py-2.5 px-6 rounded-xl bg-orange-600 text-white font-outfit font-bold text-xs uppercase"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMsg('Please enter customer full name');
      return;
    }
    const cleanPhone = customerPhone.replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number');
      return;
    }

    let finalAddress: Address;
    if (selectedAddressId !== 'new' && user?.savedAddresses) {
      const match = user.savedAddresses.find((a) => a.id === selectedAddressId);
      if (match) {
        finalAddress = match;
      } else {
        finalAddress = {
          id: `addr-${Date.now()}`,
          title: newTitle,
          addressLine: newAddressLine,
          city: newCity,
          pincode: newPincode,
        };
      }
    } else {
      if (!newAddressLine.trim() || !newCity.trim() || !newPincode.trim()) {
        setErrorMsg('Please enter a complete delivery address with city and pincode');
        return;
      }
      finalAddress = {
        id: `addr-${Date.now()}`,
        title: newTitle,
        addressLine: newAddressLine.trim(),
        city: newCity.trim(),
        pincode: newPincode.trim(),
      };
      // Save address to user profile if user is logged in
      if (user) {
        addSavedAddress(finalAddress);
      }
    }

    setLoading(true);

    try {
      const orderPayload = {
        userId: user?.id || 'guest',
        customerName: customerName.trim(),
        customerEmail: user?.email || undefined,
        customerPhone: cleanPhone,
        items: items.map((i) => ({ foodId: i.foodItem.id, quantity: i.quantity })),
        deliveryAddress: finalAddress,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        customerInstructions: customerInstructions.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      onOrderPlaced(data);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="pb-4 border-b border-[#F3ECE1]">
        <h1 className="font-outfit font-black text-3xl text-slate-900">
          Delivery & Payment Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete contact details, choose delivery address, and select payment mode
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Details, Address, Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Customer Contact Details */}
          <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-4">
            <h2 className="font-outfit font-black text-lg text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              <span>1. Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-4">
            <h2 className="font-outfit font-black text-lg text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>2. Delivery Address</span>
            </h2>

            {/* Saved Addresses list if any */}
            {user?.savedAddresses && user.savedAddresses.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select from Saved Addresses:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {user.savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-orange-50/70 border-orange-500 text-orange-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <MapPin
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isSelected ? 'text-orange-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="text-xs">
                          <span className="font-outfit font-bold block">{addr.title}</span>
                          <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                            {addr.addressLine}, {addr.city} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    onClick={() => setSelectedAddressId('new')}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold font-outfit ${
                      selectedAddressId === 'new'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-slate-50 border-dashed border-slate-300 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Enter Different Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form for new/edited address */}
            {(selectedAddressId === 'new' || !user?.savedAddresses?.length) && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Office', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTitle(t)}
                      className={`py-1.5 rounded-xl text-xs font-outfit font-bold border transition ${
                        newTitle === t
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Complete Street Address *
                  </label>
                  <input
                    type="text"
                    required={selectedAddressId === 'new'}
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    placeholder="House/Flat No., Building Name, Street, Landmark"
                    className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required={selectedAddressId === 'new'}
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required={selectedAddressId === 'new'}
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="e.g. 560103"
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={customerInstructions}
                onChange={(e) => setCustomerInstructions(e.target.value)}
                placeholder="e.g. Ring bell twice, leave at reception, avoid plastic cutlery"
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-4">
            <h2 className="font-outfit font-black text-lg text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span>3. Choose Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Demo UPI */}
              <div
                onClick={() => setPaymentMethod('demo_upi')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'demo_upi'
                    ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <QrCode className="w-5 h-5 text-orange-600" />
                  {paymentMethod === 'demo_upi' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div>
                  <span className="font-outfit font-bold text-xs block">Demo UPI</span>
                  <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm simulation</p>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'cod'
                    ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  {paymentMethod === 'cod' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div>
                  <span className="font-outfit font-bold text-xs block">Cash on Delivery</span>
                  <p className="text-[10px] text-slate-500">Pay cash or UPI upon delivery</p>
                </div>
              </div>

              {/* Demo Card */}
              <div
                onClick={() => setPaymentMethod('demo_card')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'demo_card'
                    ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  {paymentMethod === 'demo_card' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div>
                  <span className="font-outfit font-bold text-xs block">Demo Card</span>
                  <p className="text-[10px] text-slate-500">Visa / Mastercard test sandbox</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Demonstration Payment Mode: Simulates instant payment verification without charging real credit cards.
              </span>
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-4">
            <h3 className="font-outfit font-black text-base text-slate-900 pb-2 border-b border-slate-100">
              Order Summary ({items.length} items)
            </h3>

            {/* Item snapshots */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {items.map(({ foodItem, quantity }) => (
                <div key={foodItem.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-slate-800 truncate">
                      {quantity}× {foodItem.name}
                    </span>
                  </div>
                  <span className="font-outfit font-bold text-slate-900 shrink-0">
                    ₹{foodItem.price * quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-base font-outfit font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-xl text-orange-600">₹{total}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Place Order • ₹{total}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
