/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (foodId: string) => boolean;
  toggleFavorite: (foodId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }
    fetch('/api/favorites', {
      headers: { 'x-user-id': user.id },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFavoriteIds(data))
      .catch(() => {});
  }, [user]);

  const isFavorite = (foodId: string) => favoriteIds.includes(foodId);

  const toggleFavorite = async (foodId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ foodId }),
      });
      if (res.ok) {
        setFavoriteIds((prev) =>
          prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
        );
      }
    } catch {
      // Ignore
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
};
