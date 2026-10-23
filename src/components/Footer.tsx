/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UtensilsCrossed, Heart, ShieldCheck, Sparkles, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onNavigate: (viewId: string, categoryId?: string) => void;
  onOpenAiAssistant: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAiAssistant }) => {
  const { quickLoginAsAdmin, quickLoginAsDemoCustomer } = useAuth();

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-outfit font-black text-2xl tracking-tight text-white">
                Foodie<span className="text-orange-500">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-stack online food ordering and smart delivery ecosystem with Google Gemini 3.8 AI food recommendations.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-orange-400 font-semibold">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>AI Culinary Concierge Integrated</span>
            </div>
          </div>

          {/* Popular Cuisines */}
          <div className="space-y-2 text-xs">
            <h4 className="font-outfit font-bold text-sm text-white uppercase tracking-wider mb-2">
              Popular Cuisines
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('menu', 'cat-biryani')}
                  className="hover:text-orange-400 cursor-pointer"
                >
                  Dum Biryani & Pulao
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu', 'cat-pizza')}
                  className="hover:text-orange-400 cursor-pointer"
                >
                  Handcrafted Pizzas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu', 'cat-burgers')}
                  className="hover:text-orange-400 cursor-pointer"
                >
                  Gourmet Burgers & Wraps
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu', 'cat-south-indian')}
                  className="hover:text-orange-400 cursor-pointer"
                >
                  South Indian Dosas & Idlis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu', 'cat-desserts')}
                  className="hover:text-orange-400 cursor-pointer"
                >
                  Lava Cakes & Desserts
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <h4 className="font-outfit font-bold text-sm text-white uppercase tracking-wider mb-2">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-orange-400 cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-orange-400 cursor-pointer">
                  Browse Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-orange-400 cursor-pointer">
                  My Orders & Live Tracking
                </button>
              </li>
              <li>
                <button onClick={onOpenAiAssistant} className="hover:text-orange-400 cursor-pointer flex items-center gap-1 text-orange-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Foodie AI Assistant
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-purple-400 cursor-pointer text-purple-400 font-bold">
                  Admin Kitchen Portal
                </button>
              </li>
            </ul>
          </div>

          {/* College Demo Credentials Helper */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5 text-xs">
            <h4 className="font-outfit font-bold text-xs text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Demo Roles Fast-Switch
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              For evaluation and faculty demonstrations, switch roles with 1 click:
            </p>
            <div className="space-y-1.5">
              <button
                onClick={quickLoginAsDemoCustomer}
                className="w-full text-left py-1.5 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] text-white font-medium cursor-pointer"
              >
                👤 Customer: <strong>Alex Mercer</strong>
              </button>
              <button
                onClick={quickLoginAsAdmin}
                className="w-full text-left py-1.5 px-2.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/70 text-[11px] text-purple-200 font-medium cursor-pointer border border-purple-700/50"
              >
                🛡️ Admin: <strong>FoodieHub Admin</strong>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 FoodieHub Online Food Ordering System. Built for academic & real-world demonstration.</p>
          <div className="flex items-center gap-4">
            <span>FSSAI Certified Food Partners</span>
            <span>•</span>
            <span>Zero-Trust Server Calculation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
