/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FoodItem, AiRecommendationResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Plus,
  Check,
  Flame,
  Star,
  Info,
  SlidersHorizontal,
  Bot,
} from 'lucide-react';

interface AiFoodAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFoodDetails: (food: FoodItem) => void;
}

const QUICK_PROMPTS = [
  'Suggest a vegetarian dinner under ₹250.',
  'What should I order if I want something spicy?',
  'Recommend food for two people.',
  'Suggest a meal based on my previous orders.',
  'Which dishes are available without dairy?',
];

export const AiFoodAssistantModal: React.FC<AiFoodAssistantModalProps> = ({
  isOpen,
  onClose,
  onViewFoodDetails,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiRecommendationResponse | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (customQuery?: string) => {
    const textToSend = (customQuery !== undefined ? customQuery : query).trim();
    if (!textToSend) return;

    setLoading(true);
    setErrorMsg(null);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          budget: budget ? Number(budget) : undefined,
          dietaryPreferences: user?.dietaryPreferences || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate recommendations');
      }

      setResponse(data);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (food: FoodItem) => {
    addToCart(food, 1);
    setAddedItemIds((prev) => [...prev, food.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== food.id));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-6 bg-white rounded-3xl overflow-hidden shadow-2xl border border-orange-100 flex flex-col max-h-[85vh] animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-outfit font-black text-xl">Foodie AI Assistant</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-orange-100 mt-0.5">
                Tell me what you feel like eating, your budget, or dietary needs!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Chat & Recommendations Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Quick Questions Pills */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Popular Prompts (Click to Ask):
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(promptText);
                    handleSend(promptText);
                  }}
                  className="text-xs py-1.5 px-3 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/80 transition cursor-pointer text-left font-medium"
                >
                  "{promptText}"
                </button>
              ))}
            </div>
          </div>

          {/* Budget filter row */}
          <div className="p-3.5 rounded-2xl bg-[#FAF5EE] border border-orange-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <SlidersHorizontal className="w-4 h-4 text-orange-600" />
              <span>Max Budget (₹):</span>
            </div>
            <div className="flex items-center gap-2">
              {[200, 350, 500].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`py-1 px-2.5 rounded-lg font-bold transition ${
                    budget === b
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-400'
                  }`}
                >
                  ₹{b}
                </button>
              ))}
              {budget && (
                <button
                  type="button"
                  onClick={() => setBudget('')}
                  className="text-slate-400 hover:text-slate-600 text-[11px] underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center rounded-2xl bg-orange-50/50 border border-orange-200/40 space-y-3 animate-fadeIn">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
              <p className="font-outfit font-bold text-sm text-slate-800">
                Foodie AI is scanning the active kitchen menu...
              </p>
              <p className="text-xs text-slate-500">
                Evaluating prices, flavors, spice levels, and ingredients
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Response Section */}
          {response && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-orange-600" />
                    Foodie AI Culinary Summary
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      response.isAiGenerated
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {response.isAiGenerated ? 'Gemini 3.8 Flash' : 'Smart Rule-Based Fallback'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {response.adviceSummary}
                </p>
              </div>

              {/* Recommended Dishes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recommended Dishes from Today's Menu:
                </h4>

                {response.recommendedItems.map(({ item, reason, pairingSuggestion }) => {
                  const isAdded = addedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 hover:border-orange-300 bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                          onClick={() => onViewFoodDetails(item)}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 border flex items-center justify-center rounded-xs ${
                                item.vegetarian ? 'border-emerald-600' : 'border-rose-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.vegetarian ? 'bg-emerald-600' : 'bg-rose-700'
                                }`}
                              />
                            </span>
                            <h5
                              onClick={() => onViewFoodDetails(item)}
                              className="font-outfit font-bold text-sm text-slate-900 hover:text-orange-600 cursor-pointer"
                            >
                              {item.name}
                            </h5>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                            <span>₹{item.price}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-0.5 text-emerald-700 font-semibold text-[11px]">
                              <Star className="w-3 h-3 fill-emerald-600" />
                              {item.rating.toFixed(1)}
                            </span>
                            {item.spiceLevel !== 'None' && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-0.5 text-red-600 text-[11px] font-semibold">
                                  <Flame className="w-3 h-3" />
                                  {item.spiceLevel}
                                </span>
                              </>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 italic">"{reason}"</p>

                          {pairingSuggestion && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                              💡 <strong>Pair with:</strong> {pairingSuggestion}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.available}
                          className={`py-2 px-3.5 rounded-xl font-outfit font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-orange-600 hover:bg-orange-500 text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Vegetarian comfort meal under ₹250 for tonight..."
            className="flex-1 py-3 px-4 rounded-2xl bg-white border border-slate-200 focus:border-orange-500 focus:outline-none text-xs text-slate-800"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="py-3 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-outfit font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-orange-600/25"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
