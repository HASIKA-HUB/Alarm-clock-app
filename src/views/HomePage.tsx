/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Category, FoodItem } from '../types';
import { FoodCard } from '../components/FoodCard';
import {
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Utensils,
  Ticket,
  ChevronRight,
  Truck,
  Award,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (viewId: string, filterCategory?: string) => void;
  onOpenAiAssistant: () => void;
  onViewFoodDetails: (food: FoodItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenAiAssistant,
  onViewFoodDetails,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredFoods, setFeaturedFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/menu?sort=popular').then((r) => r.json()),
    ])
      .then(([cats, foods]) => {
        setCategories(cats || []);
        setFeaturedFoods(foods || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chefSpecials = featuredFoods.filter((f) => f.isChefSpecial).slice(0, 4);
  const bestSellers = featuredFoods.slice(0, 8);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Promotional Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-900 via-orange-950 to-[#18181B] text-white p-6 sm:p-12 shadow-xl border border-orange-900/40">
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-35 lg:opacity-85 pointer-events-none overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80"
            alt="Delicious gourmet food spread"
            className="w-full h-full object-cover object-center transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950 via-amber-950/80 to-transparent lg:block hidden" />
        </div>

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 py-1.5 px-3.5 rounded-full text-xs font-bold font-outfit uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>AI-Powered Food Delivery Platform</span>
          </div>

          <h1 className="font-outfit font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
            Crave it? <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">We Deliver Fresh</span> in 30 Mins.
          </h1>

          <p className="text-sm sm:text-base text-orange-100/90 leading-relaxed font-medium">
            Explore authentic Hyderabadi biryanis, artisanal pizzas, juicy burgers, crispy dosas, and decadent desserts curated by top culinary chefs.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('menu')}
              className="py-3.5 px-7 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-outfit font-bold text-xs uppercase tracking-wider backdrop-blur-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Ask Foodie AI</span>
            </button>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-orange-200/80 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>30 Min Express Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hygiene Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-outfit font-black text-2xl text-slate-900">
              What's on your mind?
            </h2>
            <p className="text-xs text-slate-500">
              Explore dishes across your favorite food categories
            </p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('menu', cat.id)}
              className="flex flex-col items-center p-3 rounded-2xl bg-white hover:bg-orange-50/60 border border-[#F3ECE1] hover:border-orange-300 transition group cursor-pointer shadow-xs"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 bg-slate-100 group-hover:scale-105 transition duration-300 shadow-inner">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-outfit font-bold text-xs text-slate-800 group-hover:text-orange-600 text-center line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive AI Feature Spotlight */}
      <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            AI Culinary Assistant
          </span>
          <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">
            Can't Decide What to Eat? Let Foodie AI Choose!
          </h3>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed font-medium">
            Ask for a budget dinner under ₹250, spicy comfort food, high-protein picks, or non-dairy dishes. Our Gemini 3.8 model matches your craving with live kitchen availability!
          </p>
        </div>

        <button
          onClick={onOpenAiAssistant}
          className="py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-outfit font-bold text-xs uppercase tracking-wider shrink-0 shadow-lg flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Launch Foodie AI Assistant</span>
        </button>
      </section>

      {/* Chef's Signature Recommendations */}
      {chefSpecials.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-outfit font-black text-2xl text-slate-900">
                  Chef's Signature Picks
                </h2>
                <span className="bg-orange-100 text-orange-700 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase font-outfit">
                  Must Try
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Specialties hand-crafted with artisanal spices and authentic marinades
              </p>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {chefSpecials.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onViewDetails={onViewFoodDetails}
              />
            ))}
          </div>
        </section>
      )}

      {/* Best-Selling Dishes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-outfit font-black text-2xl text-slate-900">
              Most Popular Dishes
            </h2>
            <p className="text-xs text-slate-500">
              Top customer favorites ordered over 1,000+ times this week
            </p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>See Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestSellers.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onViewDetails={onViewFoodDetails}
            />
          ))}
        </div>
      </section>

      {/* Promotional Offers & Coupons */}
      <section className="rounded-3xl p-6 sm:p-8 bg-slate-900 text-white space-y-4">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-orange-400" />
          <h3 className="font-outfit font-black text-xl">
            Today's Exclusive Promo Coupons
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="font-outfit font-black text-lg text-orange-400">
                WELCOME50
              </span>
              <p className="text-xs text-slate-300 mt-0.5">50% OFF up to ₹100 on min ₹199</p>
            </div>
            <button
              onClick={() => onNavigate('cart')}
              className="py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-outfit"
            >
              Use
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="font-outfit font-black text-lg text-amber-400">
                FOODIE100
              </span>
              <p className="text-xs text-slate-300 mt-0.5">Flat ₹100 OFF on orders above ₹499</p>
            </div>
            <button
              onClick={() => onNavigate('cart')}
              className="py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-outfit"
            >
              Use
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="font-outfit font-black text-lg text-yellow-400">
                TASTY20
              </span>
              <p className="text-xs text-slate-300 mt-0.5">20% OFF up to ₹150 on min ₹299</p>
            </div>
            <button
              onClick={() => onNavigate('cart')}
              className="py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-outfit"
            >
              Use
            </button>
          </div>
        </div>
      </section>

      {/* Why FoodieHub Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
            <Truck className="w-6 h-6" />
          </div>
          <h4 className="font-outfit font-bold text-lg text-slate-900">
            Superfast 30 Min Delivery
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Thermal insulated packaging guarantees your biryanis steam hot and ice creams stay frozen until your doorstep.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
            <Utensils className="w-6 h-6" />
          </div>
          <h4 className="font-outfit font-bold text-lg text-slate-900">
            100% Fresh & Authentic
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Handpicked farm vegetables, hormone-free meats, and traditional stone-ground spices prepared daily.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-outfit font-bold text-lg text-slate-900">
            Intelligent Food Recommendations
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Powered by Google Gemini 3.8 to understand complex cravings, dietary restrictions, and budgets with 1-click ordering.
          </p>
        </div>
      </section>
    </div>
  );
};
