/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Order } from '../types';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Receipt,
  Phone,
} from 'lucide-react';

interface OrderConfirmationPageProps {
  order: Order;
  onTrackOrder: (orderId: string) => void;
  onNavigateHome: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onTrackOrder,
  onNavigateHome,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-6 text-center animate-fadeIn">
      {/* Success Badge & Animation */}
      <div className="space-y-3">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>
        <div className="inline-block text-xs font-bold font-outfit uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Order Successfully Placed
        </div>
        <h1 className="font-outfit font-black text-3xl sm:text-4xl text-slate-900">
          Thank You, {order.customerName.split(' ')[0]}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Your order ticket has been sent to our kitchen. Our chefs are preparing your fresh meal!
        </p>
      </div>

      {/* Order Summary Receipt Box */}
      <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-md text-left space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Order Reference ID
            </span>
            <div className="font-outfit font-black text-xl text-orange-600">
              {order.id}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Estimated Delivery
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>~{order.estimatedDeliveryMinutes || 30} Minutes</span>
            </div>
          </div>
        </div>

        {/* Ordered items */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Items Ordered ({order.items.length}):
          </span>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 border flex items-center justify-center rounded-xs ${
                      item.vegetarian ? 'border-emerald-600' : 'border-rose-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.vegetarian ? 'bg-emerald-600' : 'bg-rose-700'
                      }`}
                    />
                  </span>
                  <span className="font-bold text-slate-800">
                    {item.quantity}× {item.name}
                  </span>
                </div>
                <span className="font-outfit font-bold text-slate-900">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery & Payment details */}
        <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-orange-200/50 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-slate-700">
              <strong className="block text-slate-900">{order.deliveryAddress.title}</strong>
              {order.deliveryAddress.addressLine}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-orange-200/40 text-slate-700">
            <span>Payment Mode:</span>
            <strong className="uppercase font-outfit text-slate-900">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.replace('_', ' ')} ({order.paymentStatus})
            </strong>
          </div>
          <div className="flex items-center justify-between text-slate-900 font-bold">
            <span>Total Paid:</span>
            <span className="text-base text-orange-600 font-outfit font-black">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onTrackOrder(order.id)}
          className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
        >
          <span>Track Order Progress</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onNavigateHome}
          className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-outfit font-bold text-xs uppercase tracking-wider cursor-pointer transition"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};
