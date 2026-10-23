/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  X,
  Star,
  Clock,
  Flame,
  Plus,
  Minus,
  Heart,
  ShieldAlert,
  ShoppingBag,
  Check,
} from 'lucide-react';

interface FoodDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ food, onClose }) => {
  const { addToCart, getItemQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedQty, setSelectedQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!food) return null;

  const currentCartQty = getItemQuantity(food.id);
  const favorite = isFavorite(food.id);

  const handleAdd = () => {
    addToCart(food, selectedQty);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-6 bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-fadeIn">
        {/* Top Image Banner */}
        <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
            }}
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-black shadow-md cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Veg / Non-Veg badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg shadow-md flex items-center gap-2 text-xs font-bold text-slate-800">
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
            <span>{food.vegetarian ? 'Pure Veg' : 'Non-Vegetarian'}</span>
          </div>

          <button
            onClick={() => toggleFavorite(food.id)}
            className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/95 backdrop-blur-xs text-slate-400 hover:text-rose-500 shadow-md cursor-pointer transition"
          >
            <Heart
              className={`w-5 h-5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`}
            />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                {food.categoryName}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-emerald-600" />
                  <span>{food.rating.toFixed(1)}</span>
                  <span className="font-normal opacity-70">({food.ratingCount || 100}+)</span>
                </span>
                <span className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>{food.preparationTime} mins</span>
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-outfit font-black text-slate-900">{food.name}</h2>
            <div className="text-xl font-outfit font-black text-orange-600 mt-1">
              ₹{food.price}
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{food.description}</p>

          {/* Spice & Ingredients */}
          <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-orange-200/50 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Spice Level:</span>
              <span className="flex items-center gap-1 text-orange-700 font-bold">
                <Flame className="w-4 h-4 text-orange-500" />
                {food.spiceLevel}
              </span>
            </div>

            {food.ingredients && food.ingredients.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  Ingredients:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {food.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {food.allergens && food.allergens.length > 0 && (
              <div className="flex items-start gap-2 pt-2 border-t border-orange-200/40 text-xs text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Allergen Notice:</strong> Contains {food.allergens.join(', ')}. Please advise us if you have severe food allergies.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-1.5">
            <button
              onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <Minus className="w-4 h-4 text-slate-600" />
            </button>
            <span className="font-outfit font-black text-sm min-w-[20px] text-center text-slate-900">
              {selectedQty}
            </span>
            <button
              onClick={() => setSelectedQty(selectedQty + 1)}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={!food.available}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-outfit font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer shadow-lg ${
              !food.available
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add {selectedQty} to Cart • ₹{food.price * selectedQty}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
