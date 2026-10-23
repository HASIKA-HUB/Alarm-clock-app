/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Category, FoodItem } from '../types';
import { FoodCard } from '../components/FoodCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';

interface MenuPageProps {
  initialCategory?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onViewFoodDetails: (food: FoodItem) => void;
  onOpenAiAssistant: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  initialCategory = 'all',
  searchQuery,
  onSearchChange,
  onViewFoodDetails,
  onOpenAiAssistant,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_asc' | 'price_desc'>('popular');

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data || []))
      .catch((err) => console.error(err));
  }, []);

  // Update category when prop changes
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Load filtered foods from backend
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (selectedCategory && selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    if (dietFilter === 'veg') {
      params.append('vegetarian', 'true');
    } else if (dietFilter === 'nonveg') {
      params.append('vegetarian', 'false');
    }
    if (maxPrice < 500) {
      params.append('maxPrice', maxPrice.toString());
    }
    if (availableOnly) {
      params.append('availableOnly', 'true');
    }
    if (sortBy) {
      params.append('sort', sortBy);
    }

    fetch(`/api/menu?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setFoods(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, dietFilter, maxPrice, availableOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setDietFilter('all');
    setMaxPrice(500);
    setAvailableOnly(false);
    setSortBy('popular');
    onSearchChange('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#F3ECE1]">
        <div>
          <h1 className="font-outfit font-black text-3xl text-slate-900">
            Explore Restaurant Menu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse {foods.length} handcrafted dishes, appetizers, breads, desserts, and beverages
          </p>
        </div>

        <button
          onClick={onOpenAiAssistant}
          className="py-2.5 px-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
          <span>Ask AI What to Eat</span>
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`py-2 px-4 rounded-full text-xs font-outfit font-bold whitespace-nowrap transition cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
          }`}
        >
          All Dishes
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`py-2 px-4 rounded-full text-xs font-outfit font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
            }`}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Filter Toolbar (Veg/Non-Veg, Price, Availability, Sort) */}
      <div className="p-4 rounded-2xl bg-white border border-[#F3ECE1] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Veg / Non-veg selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold font-outfit">
            <button
              onClick={() => setDietFilter('all')}
              className={`py-1 px-3 rounded-lg transition ${
                dietFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`py-1 px-3 rounded-lg transition flex items-center gap-1.5 ${
                dietFilter === 'veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              Veg Only
            </button>
            <button
              onClick={() => setDietFilter('nonveg')}
              className={`py-1 px-3 rounded-lg transition flex items-center gap-1.5 ${
                dietFilter === 'nonveg' ? 'bg-rose-700 text-white shadow-xs' : 'text-rose-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-300" />
              Non-Veg
            </button>
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 py-1 px-3 rounded-xl">
            <span className="font-semibold text-slate-600">Max: ₹{maxPrice}</span>
            <input
              type="range"
              min="100"
              max="500"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="accent-orange-600 cursor-pointer w-24 sm:w-32"
            />
          </div>

          {/* In Stock Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        {/* Right Sort Dropdown & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-outfit font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="popular">Popularity</option>
              <option value="rating">Top Rated (★)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {(selectedCategory !== 'all' ||
            dietFilter !== 'all' ||
            maxPrice < 500 ||
            availableOnly ||
            searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : foods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fadeIn">
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onViewDetails={onViewFoodDetails}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#F3ECE1] space-y-3">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-outfit font-black text-xl text-slate-900">
            No Delicious Dishes Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No dishes match your active filter settings. Try adjusting the category, dietary preference, or price slider.
          </p>
          <button
            onClick={handleResetFilters}
            className="py-2.5 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-orange-600/30"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
