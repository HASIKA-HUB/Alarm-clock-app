/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  Star,
  Clock,
  Flame,
  Plus,
  Minus,
  Heart,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface FoodCardProps {
  food: FoodItem;
  onViewDetails: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onViewDetails }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const qty = getItemQuantity(food.id);
  const favorite = isFavorite(food.id);

  const getSpiceBadge = () => {
    if (food.spiceLevel === 'Hot' || food.spiceLevel === 'Extra Hot') {
      return (
        <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
          <Flame className="w-3 h-3 fill-red-500" />
          {food.spiceLevel}
        </span>
      );
    }
    if (food.spiceLevel === 'Medium') {
      return (
        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
          <Flame className="w-3 h-3 text-amber-500" />
          Medium
        </span>
      );
    }
    return null;
  };

  return (
    <div className="food-card rounded-3xl overflow-hidden flex flex-col justify-between group relative bg-white">
      {/* Top Media Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={food.imageUrl}
          alt={food.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs">
          <div
            className={`w-4 h-4 border-2 flex items-center justify-center rounded-xs ${
              food.vegetarian ? 'border-emerald-600' : 'border-rose-700'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                food.vegetarian ? 'bg-emerald-600' : 'bg-rose-700'
              }`}
            />
          </div>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(food.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-xs text-slate-400 hover:text-rose-500 shadow-md transition transform active:scale-90 cursor-pointer"
          title={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition ${
              favorite ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        {/* Preparation Time Tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow-md">
          <Clock className="w-3 h-3 text-orange-400" />
          <span>{food.preparationTime} mins</span>
        </div>

        {/* Chef Special / Bestseller Badge */}
        {food.isChefSpecial && (
          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
            Chef Special
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
              {food.categoryName || 'Delight'}
            </span>
            <div className="flex items-center gap-1.5">
              {getSpiceBadge()}
              <div className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-1.5 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-emerald-600" />
                <span>{food.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <h3
            onClick={() => onViewDetails(food)}
            className="font-outfit font-bold text-base text-slate-900 group-hover:text-orange-600 transition cursor-pointer line-clamp-1"
          >
            {food.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Bottom Price & Add to Cart Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="font-outfit font-black text-lg text-slate-900">
            ₹{food.price}
          </div>

          {!food.available ? (
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Sold Out
            </span>
          ) : qty > 0 ? (
            <div className="flex items-center gap-2 bg-orange-600 text-white rounded-xl px-2 py-1 shadow-md shadow-orange-600/20">
              <button
                onClick={() => updateQuantity(food.id, qty - 1)}
                className="p-1 hover:bg-orange-700 rounded-md transition cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-outfit font-black text-xs min-w-[16px] text-center">
                {qty}
              </span>
              <button
                onClick={() => updateQuantity(food.id, qty + 1)}
                className="p-1 hover:bg-orange-700 rounded-md transition cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(food, 1)}
              className="py-1.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-200 hover:border-orange-600 font-outfit font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition transform active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
