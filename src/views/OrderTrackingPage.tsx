/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  Package,
  Bike,
  Home,
  XCircle,
  MapPin,
  RefreshCw,
  Phone,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface OrderTrackingPageProps {
  orderId: string;
  onBackToOrders: () => void;
}

const ORDER_STAGES: { status: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
  {
    status: 'Order Placed',
    label: 'Order Placed',
    desc: 'Order ticket registered with restaurant',
    icon: Package,
  },
  {
    status: 'Confirmed',
    label: 'Confirmed',
    desc: 'Kitchen accepted and queued order',
    icon: CheckCircle2,
  },
  {
    status: 'Preparing',
    label: 'Cooking & Packing',
    desc: 'Chefs are preparing your meal fresh',
    icon: Clock,
  },
  {
    status: 'Out for Delivery',
    label: 'Out for Delivery',
    desc: 'Delivery partner on the way to your address',
    icon: Bike,
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    desc: 'Food delivered fresh at your doorstep',
    icon: Home,
  },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  orderId,
  onBackToOrders,
}) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrder = () => {
    setLoading(true);
    fetch(`/api/orders/${orderId}`, {
      headers: { 'x-user-id': user?.id || '' },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setOrder(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000); // Poll status
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (order.orderStatus !== 'Order Placed') {
      setCancelError('Orders cannot be cancelled once cooking has commenced');
      return;
    }

    setCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          status: 'Cancelled',
          note: 'Cancelled by customer from tracking screen',
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Failed to cancel order');
      }
      setOrder(updated);
    } catch (err: unknown) {
      setCancelError((err as Error).message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading order telemetry...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <h3 className="font-outfit font-black text-xl text-slate-900">Order Not Found</h3>
        <button
          onClick={onBackToOrders}
          className="py-2 px-5 rounded-xl bg-orange-600 text-white font-outfit text-xs font-bold"
        >
          View My Orders
        </button>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'Cancelled';
  const currentStageIndex = ORDER_STAGES.findIndex((s) => s.status === order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE1]">
        <button
          onClick={onBackToOrders}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <button
          onClick={fetchOrder}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:border-slate-300 transition cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Hero Tracking Status Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#F3ECE1] shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Order Tracking
            </span>
            <div className="font-outfit font-black text-2xl text-slate-900 flex items-center gap-2">
              <span>{order.id}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isCancelled
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : order.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-orange-100 text-orange-700 border border-orange-200 animate-pulse'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>

          {!isCancelled && order.orderStatus !== 'Delivered' && (
            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200/80 text-right">
              <span className="text-[10px] uppercase font-bold text-orange-700 block">
                Estimated Arrival
              </span>
              <span className="font-outfit font-black text-lg text-orange-950 flex items-center gap-1 sm:justify-end">
                <Clock className="w-4 h-4 text-orange-600" />
                ~{order.estimatedDeliveryMinutes || 25} Mins
              </span>
            </div>
          )}
        </div>

        {/* Visual Progress Steps (If Not Cancelled) */}
        {!isCancelled ? (
          <div className="pt-2">
            <div className="relative flex items-center justify-between">
              {/* Connecting Bar */}
              <div className="absolute left-6 right-6 top-6 h-1 bg-slate-200 z-0">
                <div
                  className="h-1 bg-orange-600 transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      0,
                      (currentStageIndex / (ORDER_STAGES.length - 1)) * 100
                    )}%`,
                  }}
                />
              </div>

              {/* Step Circles */}
              {ORDER_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={stage.status}
                    className="relative z-10 flex flex-col items-center group"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-md ${
                        isCurrent
                          ? 'bg-orange-600 text-white ring-4 ring-orange-200 scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-[11px] font-outfit font-bold mt-2 text-center max-w-[70px] leading-tight ${
                        isCurrent
                          ? 'text-orange-600'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700">
            <XCircle className="w-6 h-6 shrink-0 text-rose-500" />
            <div>
              <h4 className="font-bold text-sm">Order Cancelled</h4>
              <p className="text-xs text-rose-600">
                This order was cancelled. Any pre-authorized charges will be refunded.
              </p>
            </div>
          </div>
        )}

        {/* Customer Cancellation Allowed Only on "Order Placed" */}
        {order.orderStatus === 'Order Placed' && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs text-slate-500">
              Need to change your mind? You can cancel until the kitchen starts cooking.
            </span>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="py-2 px-4 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-outfit text-xs font-bold transition cursor-pointer"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}

        {cancelError && (
          <p className="text-xs text-rose-600 font-semibold">{cancelError}</p>
        )}
      </div>

      {/* Timeline Audit History */}
      <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-4">
        <h3 className="font-outfit font-bold text-base text-slate-900">
          Order Status Event Log
        </h3>

        <div className="space-y-4 border-l-2 border-orange-200 pl-4 ml-2">
          {order.statusHistory.map((h) => (
            <div key={h.id} className="relative space-y-1">
              <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-orange-600 border-2 border-white shadow-xs" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-outfit font-bold text-slate-900">{h.status}</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{h.note || `Status recorded by ${h.changedBy}`}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ordered Items & Address Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-4">
        <h3 className="font-outfit font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
          Delivery Details & Food Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
              Deliver To:
            </span>
            <div className="font-bold text-slate-900">{order.customerName} ({order.customerPhone})</div>
            <div className="text-slate-600">
              {order.deliveryAddress.addressLine}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </div>
            {order.customerInstructions && (
              <p className="text-[11px] text-orange-700 italic pt-1 border-t border-slate-200">
                "{order.customerInstructions}"
              </p>
            )}
          </div>

          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
              Payment Summary:
            </span>
            <div className="flex items-center justify-between">
              <span>Payment Mode:</span>
              <strong className="uppercase">{order.paymentMethod.replace('_', ' ')}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment Status:</span>
              <strong className="text-emerald-700 capitalize">{order.paymentStatus}</strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-outfit font-black text-sm text-slate-900">
              <span>Total Bill:</span>
              <span className="text-orange-600">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Item list */}
        <div className="space-y-2 pt-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-800">
                {item.quantity}× {item.name}
              </span>
              <span className="font-outfit font-bold text-slate-900">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
