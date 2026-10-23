/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AdminStats,
  Category,
  FoodItem,
  Order,
  OrderStatus,
  User,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Utensils,
  Package,
  Users,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  IndianRupee,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Eye,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onViewOrderDetails: (orderId: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onViewOrderDetails,
}) => {
  const { user, quickLoginAsAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'foods' | 'categories' | 'customers'>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<(User & { orderCount: number; totalSpent: number })[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Modals
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<FoodItem | null>(null);

  // Food Form State
  const [foodName, setFoodName] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [foodPrice, setFoodPrice] = useState<number | ''>(249);
  const [foodImage, setFoodImage] = useState('');
  const [foodVeg, setFoodVeg] = useState(true);
  const [foodSpice, setFoodSpice] = useState<'None' | 'Mild' | 'Medium' | 'Hot' | 'Extra Hot'>('Mild');
  const [foodPrep, setFoodPrep] = useState<number>(15);
  const [foodIngredients, setFoodIngredients] = useState('');
  const [foodAllergens, setFoodAllergens] = useState('');

  const fetchAdminData = () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    const headers = { 'x-user-id': user.id };

    Promise.all([
      fetch('/api/admin/stats', { headers }).then((r) => r.json()),
      fetch('/api/orders', { headers }).then((r) => r.json()),
      fetch('/api/menu', { headers }).then((r) => r.json()),
      fetch('/api/categories', { headers }).then((r) => r.json()),
      fetch('/api/admin/customers', { headers }).then((r) => r.json()),
    ])
      .then(([statsData, ordersData, foodsData, catsData, custsData]) => {
        setStats(statsData);
        setOrders(ordersData || []);
        setFoods(foodsData || []);
        setCategories(catsData || []);
        setCustomers(custsData || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-outfit font-black text-2xl text-slate-900">
          Restaurant Staff & Admin Portal
        </h2>
        <p className="text-xs text-slate-500">
          Administrator credentials are required to manage live orders, menu pricing, and kitchen telemetry.
        </p>
        <button
          onClick={quickLoginAsAdmin}
          className="py-3 px-6 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-700/30 transition cursor-pointer"
        >
          Sign In as Restaurant Admin
        </button>
      </div>
    );
  }

  // --- Handlers ---
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          status: nextStatus,
          note: `Kitchen staff advanced status to ${nextStatus}`,
        }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAvailability = async (food: FoodItem) => {
    try {
      const res = await fetch(`/api/admin/menu/${food.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ available: !food.available }),
      });
      if (res.ok) {
        setFoods((prev) =>
          prev.map((f) => (f.id === food.id ? { ...f, available: !f.available } : f))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!window.confirm('Are you sure you want to delete this food item from the menu?')) return;
    try {
      const res = await fetch(`/api/admin/menu/${foodId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });
      if (res.ok) {
        setFoods((prev) => prev.filter((f) => f.id !== foodId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddFood = () => {
    setFoodToEdit(null);
    setFoodName('');
    setFoodDesc('');
    setFoodCategory(categories[0]?.id || '');
    setFoodPrice(249);
    setFoodImage('');
    setFoodVeg(true);
    setFoodSpice('Mild');
    setFoodPrep(15);
    setFoodIngredients('Rice, Ghee, Spices');
    setFoodAllergens('Dairy');
    setFoodModalOpen(true);
  };

  const handleOpenEditFood = (food: FoodItem) => {
    setFoodToEdit(food);
    setFoodName(food.name);
    setFoodDesc(food.description);
    setFoodCategory(food.categoryId);
    setFoodPrice(food.price);
    setFoodImage(food.imageUrl);
    setFoodVeg(food.vegetarian);
    setFoodSpice(food.spiceLevel);
    setFoodPrep(food.preparationTime);
    setFoodIngredients(food.ingredients?.join(', ') || '');
    setFoodAllergens(food.allergens?.join(', ') || '');
    setFoodModalOpen(true);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: foodName.trim(),
      description: foodDesc.trim(),
      categoryId: foodCategory,
      price: Number(foodPrice),
      imageUrl: foodImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      vegetarian: foodVeg,
      spiceLevel: foodSpice,
      preparationTime: Number(foodPrep),
      ingredients: foodIngredients.split(',').map((s) => s.trim()).filter(Boolean),
      allergens: foodAllergens.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (foodToEdit) {
        await fetch(`/api/admin/menu/${foodToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify(payload),
        });
      }
      setFoodModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#F3ECE1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-outfit font-black text-3xl text-slate-900">
              Admin & Kitchen Control Hub
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
              Live Backend
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time management for customer tickets, catalog pricing, and restaurant metrics
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-purple-300 shadow-xs cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold font-outfit">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
          { id: 'foods', label: `Menu Management (${foods.length})`, icon: Utensils },
          { id: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Sales Revenue
              </span>
              <div className="font-outfit font-black text-2xl text-emerald-600 mt-1">
                ₹{stats.totalSales}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">From valid orders</p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Orders Placed
              </span>
              <div className="font-outfit font-black text-2xl text-slate-900 mt-1">
                {stats.totalOrders}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">All customer tickets</p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Pending / Active
              </span>
              <div className="font-outfit font-black text-2xl text-orange-600 mt-1">
                {stats.pendingOrders}
              </div>
              <p className="text-[10px] text-orange-600/80 mt-0.5 font-semibold">Kitchen queue</p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Delivered Orders
              </span>
              <div className="font-outfit font-black text-2xl text-purple-700 mt-1">
                {stats.completedOrders}
              </div>
              <p className="text-[10px] text-purple-600/80 mt-0.5 font-semibold">Fulfilled</p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Registered Customers
              </span>
              <div className="font-outfit font-black text-2xl text-slate-900 mt-1">
                {stats.registeredCustomers}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Verified user accounts</p>
            </div>
          </div>

          {/* 7-Day Sales Telemetry & Best Sellers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-outfit font-bold text-base text-slate-900">
                  7-Day Sales Revenue Distribution
                </h3>
                <span className="text-xs text-slate-500">Live order database</span>
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
                {stats.salesByDay.map((d, i) => {
                  const maxDay = Math.max(1000, ...stats.salesByDay.map((x) => x.sales));
                  const heightPercent = Math.max(10, Math.round((d.sales / maxDay) * 100));

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-mono text-purple-700 opacity-0 group-hover:opacity-100 transition">
                        ₹{d.sales}
                      </span>
                      <div className="w-full max-w-[40px] bg-purple-50 rounded-t-xl h-36 flex items-end p-1 border border-purple-100">
                        <div
                          className="w-full bg-gradient-to-t from-purple-700 to-orange-500 rounded-t-lg transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-outfit font-bold text-slate-700">
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Best Sellers Leaderboard */}
            <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-3">
              <h3 className="font-outfit font-bold text-base text-slate-900">
                Top Ordered Dishes
              </h3>
              <div className="space-y-2.5">
                {stats.bestSellers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-outfit font-bold text-purple-700">
                      {item.quantity} sold (₹{item.revenue})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Order Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#F3ECE1] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order ID, customer name, phone..."
                className="w-full py-1.5 px-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-outfit font-bold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {['all', 'Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`py-1 px-3 rounded-lg border transition ${
                      orderStatusFilter === st
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-[#F3ECE1] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-outfit font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-right">Advance Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-outfit font-bold text-purple-700">
                        <button
                          onClick={() => onViewOrderDetails(ord.id)}
                          className="hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{ord.id}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-400">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="truncate text-slate-700">
                          {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-outfit font-black text-slate-900">
                        ₹{ord.total}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-[10px] font-bold text-slate-700 block">
                          {ord.paymentMethod.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold capitalize">
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-orange-100 text-orange-700 animate-pulse'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ord.orderStatus === 'Order Placed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Confirmed')}
                            className="py-1 px-3 rounded-lg bg-orange-600 text-white font-outfit font-bold text-[11px] uppercase hover:bg-orange-500 shadow-xs cursor-pointer"
                          >
                            Confirm Order
                          </button>
                        )}
                        {ord.orderStatus === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Preparing')}
                            className="py-1 px-3 rounded-lg bg-purple-600 text-white font-outfit font-bold text-[11px] uppercase hover:bg-purple-500 shadow-xs cursor-pointer"
                          >
                            Start Cooking
                          </button>
                        )}
                        {ord.orderStatus === 'Preparing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Out for Delivery')}
                            className="py-1 px-3 rounded-lg bg-sky-600 text-white font-outfit font-bold text-[11px] uppercase hover:bg-sky-500 shadow-xs cursor-pointer"
                          >
                            Dispatch Order
                          </button>
                        )}
                        {ord.orderStatus === 'Out for Delivery' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Delivered')}
                            className="py-1 px-3 rounded-lg bg-emerald-600 text-white font-outfit font-bold text-[11px] uppercase hover:bg-emerald-500 shadow-xs cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {ord.orderStatus === 'Delivered' && (
                          <span className="text-[11px] text-emerald-700 font-bold">
                            Fulfilled ✓
                          </span>
                        )}
                        {ord.orderStatus === 'Cancelled' && (
                          <span className="text-[11px] text-rose-600 font-bold">
                            Cancelled ✗
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOOD MENU MANAGEMENT */}
      {activeTab === 'foods' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-outfit font-black text-xl text-slate-900">
                Menu Items Catalog ({foods.length})
              </h3>
              <p className="text-xs text-slate-500">
                Update prices, ingredients, availability, and add new culinary creations
              </p>
            </div>

            <button
              onClick={handleOpenAddFood}
              className="py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((food) => (
              <div
                key={food.id}
                className="p-4 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-orange-600 uppercase">
                      {food.categoryName}
                    </span>
                    <h4 className="font-outfit font-bold text-sm text-slate-900 line-clamp-1">
                      {food.name}
                    </h4>
                    <div className="font-outfit font-black text-slate-900 text-xs">
                      ₹{food.price} • {food.preparationTime}m
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  {/* Availability toggle */}
                  <button
                    onClick={() => handleToggleAvailability(food)}
                    className={`py-1 px-2.5 rounded-lg font-bold text-[11px] transition ${
                      food.available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {food.available ? 'In Stock (Available)' : 'Sold Out (Hidden)'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditFood(food)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition"
                      title="Edit dish"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="font-outfit font-black text-xl text-slate-900">
            Cuisine Categories ({categories.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-outfit font-bold text-sm text-slate-900">{cat.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Items linked: {foods.filter((f) => f.categoryId === cat.id).length}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="font-outfit font-black text-xl text-slate-900">
            Registered Customers ({customers.length})
          </h3>

          <div className="bg-white rounded-3xl border border-[#F3ECE1] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-outfit font-bold">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Dietary Preferences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-slate-400">{c.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-outfit font-bold">{c.orderCount} orders</td>
                    <td className="py-3 px-4 font-outfit font-black text-emerald-600">
                      ₹{c.totalSpent}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {c.dietaryPreferences?.join(', ') || 'Standard'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Food Modal */}
      {foodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-fadeIn my-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-outfit font-black text-lg text-slate-900">
                {foodToEdit ? 'Edit Food Item' : 'Add New Dish to Menu'}
              </h3>
              <button
                onClick={() => setFoodModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Tandoori Paneer Tikka"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  placeholder="Detailed description of flavors and ingredients"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Category *</label>
                  <select
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={foodPrice}
                    onChange={(e) => setFoodPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Image URL</label>
                <input
                  type="url"
                  value={foodImage}
                  onChange={(e) => setFoodImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodVeg}
                    onChange={(e) => setFoodVeg(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-bold">Vegetarian</span>
                </label>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Spice</label>
                  <select
                    value={foodSpice}
                    onChange={(e) => setFoodSpice(e.target.value as typeof foodSpice)}
                    className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Prep Time (m)</label>
                  <input
                    type="number"
                    min="5"
                    value={foodPrep}
                    onChange={(e) => setFoodPrep(Number(e.target.value))}
                    className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Ingredients (comma separated)</label>
                <input
                  type="text"
                  value={foodIngredients}
                  onChange={(e) => setFoodIngredients(e.target.value)}
                  placeholder="Basmati Rice, Saffron, Ghee, Mint"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Allergens (comma separated)</label>
                <input
                  type="text"
                  value={foodAllergens}
                  onChange={(e) => setFoodAllergens(e.target.value)}
                  placeholder="Dairy, Gluten, Tree Nuts"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFoodModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold uppercase tracking-wider shadow-md"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
