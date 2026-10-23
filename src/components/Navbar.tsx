/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  UtensilsCrossed,
  MapPin,
  Search,
  ShoppingBag,
  User,
  Sparkles,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Clock,
  Heart,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onOpenAuth: () => void;
  onOpenAiAssistant: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenAiAssistant,
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout, quickLoginAsAdmin, quickLoginAsDemoCustomer } = useAuth();
  const { totalItemCount, total } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Koramangala, Bengaluru');

  const LOCATIONS = [
    'Koramangala, Bengaluru',
    'Indiranagar, Bengaluru',
    'HITEC City, Hyderabad',
    'Bandra West, Mumbai',
    'Connaught Place, New Delhi',
  ];

  const handleNav = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F3ECE1] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-3">
            {/* Left: Brand & Location */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleNav('home')}
                className="flex items-center gap-2.5 group cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-outfit font-black text-2xl tracking-tight text-[#1E1E24]">
                    Foodie<span className="text-orange-600">Hub</span>
                  </span>
                  <span className="block text-[10px] text-orange-600 font-bold uppercase tracking-widest -mt-1">
                    Fresh • Fast • AI
                  </span>
                </div>
              </button>

              {/* Location Selector */}
              <button
                onClick={() => setLocationModalOpen(true)}
                className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-700 bg-orange-50/80 hover:bg-orange-100/70 border border-orange-200/60 py-2 px-3.5 rounded-full transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                  {selectedLocation}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Middle: Search bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'menu' && e.target.value.trim()) {
                    onNavigate('menu');
                  }
                }}
                placeholder="Search for biryani, pizzas, burgers, desserts..."
                className="w-full py-2.5 pl-10 pr-4 text-xs bg-[#FAF5EE] border border-orange-200/60 rounded-full focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>

            {/* Right: Navigation, AI Button, Cart, User */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Nav Links */}
              <nav className="hidden xl:flex items-center gap-1 font-medium text-xs text-slate-700">
                <button
                  onClick={() => handleNav('home')}
                  className={`py-2 px-3 rounded-xl transition cursor-pointer ${
                    currentView === 'home'
                      ? 'text-orange-600 font-bold bg-orange-50'
                      : 'hover:text-orange-600 hover:bg-slate-50'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNav('menu')}
                  className={`py-2 px-3 rounded-xl transition cursor-pointer ${
                    currentView === 'menu'
                      ? 'text-orange-600 font-bold bg-orange-50'
                      : 'hover:text-orange-600 hover:bg-slate-50'
                  }`}
                >
                  Menu
                </button>
                <button
                  onClick={() => handleNav('orders')}
                  className={`py-2 px-3 rounded-xl transition cursor-pointer ${
                    currentView === 'orders'
                      ? 'text-orange-600 font-bold bg-orange-50'
                      : 'hover:text-orange-600 hover:bg-slate-50'
                  }`}
                >
                  My Orders
                </button>
              </nav>

              {/* Foodie AI Assistant Button */}
              <button
                onClick={onOpenAiAssistant}
                className="py-2 px-3 sm:px-3.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold font-outfit shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                <span className="hidden sm:inline">Foodie AI</span>
                <span className="sm:hidden">AI</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => handleNav('cart')}
                className="relative p-2.5 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold font-outfit flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">
                  {totalItemCount > 0 ? `₹${total}` : 'Cart'}
                </span>
                {totalItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {totalItemCount}
                  </span>
                )}
              </button>

              {/* User Dropdown / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 hover:border-orange-300 bg-white transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden md:block text-left text-xs">
                      <div className="font-bold text-slate-800 truncate max-w-[90px]">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {user.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn text-xs">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            Administrator
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleNav('admin')}
                            className="w-full text-left px-3 py-2 rounded-xl text-purple-700 hover:bg-purple-50 font-bold flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Admin Dashboard
                          </button>
                        )}
                        <button
                          onClick={() => handleNav('orders')}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4 text-slate-400" />
                          My Orders
                        </button>
                        <button
                          onClick={() => handleNav('profile')}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Profile & Addresses
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="py-2 px-3 sm:px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 transition cursor-pointer"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile search input */}
          <div className="pb-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'menu' && e.target.value.trim()) {
                    onNavigate('menu');
                  }
                }}
                placeholder="Search dishes, ingredients, or cravings..."
                className="w-full py-2 pl-9 pr-4 text-xs bg-[#FAF5EE] border border-orange-200/60 rounded-full focus:bg-white focus:outline-none text-slate-800"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-100 bg-white p-4 space-y-2 animate-fadeIn text-sm">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-orange-50 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('menu')}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-orange-50 font-medium"
            >
              Browse Menu
            </button>
            <button
              onClick={() => handleNav('orders')}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-orange-50 font-medium"
            >
              My Orders
            </button>
            <button
              onClick={() => handleNav('cart')}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-orange-50 font-medium flex items-center justify-between"
            >
              <span>Shopping Cart</span>
              <span className="text-orange-600 font-bold">{totalItemCount} items</span>
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-purple-50 text-purple-700 font-bold"
              >
                Admin Dashboard
              </button>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={quickLoginAsAdmin}
                className="flex-1 py-2 px-2 text-xs font-bold text-purple-700 bg-purple-50 rounded-xl"
              >
                Admin Demo
              </button>
              <button
                onClick={quickLoginAsDemoCustomer}
                className="flex-1 py-2 px-2 text-xs font-bold text-orange-700 bg-orange-50 rounded-xl"
              >
                Customer Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Location Picker Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-outfit font-bold text-lg text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Choose Delivery City
              </h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setLocationModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    selectedLocation === loc
                      ? 'bg-orange-50 text-orange-700 border border-orange-300 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{loc}</span>
                  {selectedLocation === loc && (
                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
