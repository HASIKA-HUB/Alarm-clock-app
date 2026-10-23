/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FoodDetailModal } from './components/FoodDetailModal';
import { AiFoodAssistantModal } from './components/AiFoodAssistantModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './views/HomePage';
import { MenuPage } from './views/MenuPage';
import { CartPage } from './views/CartPage';
import { CheckoutPage } from './views/CheckoutPage';
import { OrderConfirmationPage } from './views/OrderConfirmationPage';
import { OrderTrackingPage } from './views/OrderTrackingPage';
import { MyOrdersPage } from './views/MyOrdersPage';
import { ProfilePage } from './views/ProfilePage';
import { AdminDashboardPage } from './views/AdminDashboardPage';

import { FoodItem, Order } from './types';
import { Sparkles } from 'lucide-react';

function FoodieHubApp() {
  const { user } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [initialCategory, setInitialCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Active selections
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodItem | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Orders State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleNavigate = (viewId: string, categoryId?: string) => {
    if (categoryId) {
      setInitialCategory(categoryId);
    }
    setCurrentView(viewId);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (currentView !== 'menu' && q.trim().length > 0) {
      setCurrentView('menu');
    }
  };

  const handleOrderPlaced = (order: Order) => {
    setConfirmedOrder(order);
    setSelectedOrderId(order.id);
    setCurrentView('confirmation');
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAiAssistant={() => setAiModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenAiAssistant={() => setAiModalOpen(true)}
            onViewFoodDetails={(food) => setSelectedFoodForDetail(food)}
          />
        )}

        {currentView === 'menu' && (
          <MenuPage
            initialCategory={initialCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewFoodDetails={(food) => setSelectedFoodForDetail(food)}
            onOpenAiAssistant={() => setAiModalOpen(true)}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            onNavigate={handleNavigate}
            onProceedToCheckout={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderPlaced={handleOrderPlaced}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'confirmation' && confirmedOrder && (
          <OrderConfirmationPage
            order={confirmedOrder}
            onTrackOrder={handleTrackOrder}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'tracking' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            {selectedOrderId ? (
              <OrderTrackingPage
                orderId={selectedOrderId}
                onBackToOrders={() => setCurrentView('orders')}
              />
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-100 max-w-md mx-auto">
                <p className="text-slate-600 mb-4 font-medium">No order currently selected to track.</p>
                <button
                  onClick={() => setCurrentView('orders')}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition"
                >
                  View My Orders
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'orders' && (
          <MyOrdersPage
            onTrackOrder={handleTrackOrder}
            onNavigateMenu={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'profile' && <ProfilePage />}

        {currentView === 'admin' && (
          <AdminDashboardPage
            onViewOrderDetails={(orderId) => {
              setSelectedOrderId(orderId);
              setCurrentView('tracking');
            }}
          />
        )}
      </main>

      {/* Floating AI Food Assistant Trigger Button */}
      <button
        onClick={() => setAiModalOpen(true)}
        aria-label="Open AI Food Assistant"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white px-4 py-3 rounded-full shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-amber-100" />
        <span className="font-outfit font-bold text-sm tracking-wide hidden sm:inline">
          Foodie AI Assistant
        </span>
      </button>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAiAssistant={() => setAiModalOpen(true)}
      />

      {/* Global Modals */}
      <FoodDetailModal
        food={selectedFoodForDetail}
        onClose={() => setSelectedFoodForDetail(null)}
      />

      <AiFoodAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onViewFoodDetails={(food) => setSelectedFoodForDetail(food)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <FoodieHubApp />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
