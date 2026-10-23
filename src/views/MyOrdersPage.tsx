/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Package,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface MyOrdersPageProps {
  onTrackOrder: (orderId: string) => void;
  onNavigateMenu: () => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  onTrackOrder,
  onNavigateMenu,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/orders', {
      headers: { 'x-user-id': user.id },
    })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4">
        <Package className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-outfit font-black text-2xl text-slate-900">
          Sign In to View Your Orders
        </h3>
        <p className="text-xs text-slate-500">
          Track active food orders and review your past culinary history
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fadeIn">
      <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE1]">
        <div>
          <h1 className="font-outfit font-black text-3xl text-slate-900">My Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status and purchase history for {user.name}
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCompleted = order.orderStatus === 'Delivered';
            const isCancelled = order.orderStatus === 'Cancelled';

            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs hover:border-orange-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-outfit font-black text-lg text-slate-900">
                      {order.id}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-700'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-orange-100 text-orange-700 animate-pulse'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(order.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Items snapshot */}
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-700 line-clamp-1">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Delivered to {order.deliveryAddress.title} ({order.deliveryAddress.city})
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                      Total Bill
                    </span>
                    <span className="font-outfit font-black text-lg text-orange-600">
                      ₹{order.total}
                    </span>
                  </div>

                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="py-2.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/25 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#F3ECE1] space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-outfit font-black text-xl text-slate-900">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't ordered any meals yet. Explore our freshly cooked biryanis, pizzas, and desserts!
          </p>
          <button
            onClick={onNavigateMenu}
            className="py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition cursor-pointer"
          >
            Start Ordering
          </button>
        </div>
      )}
    </div>
  );
};
