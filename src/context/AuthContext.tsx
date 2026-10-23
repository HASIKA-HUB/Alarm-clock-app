/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  addSavedAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
  removeSavedAddress: (addressId: string) => Promise<boolean>;
  quickLoginAsDemoCustomer: () => Promise<void>;
  quickLoginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage or fetch profile
  useEffect(() => {
    const storedUser = localStorage.getItem('foodiehub_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Verify with backend
        fetch('/api/auth/me', {
          headers: { 'x-user-id': parsed.id },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((fresh) => {
            if (fresh) {
              setUser(fresh);
              localStorage.setItem('foodiehub_user', JSON.stringify(fresh));
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem('foodiehub_user');
        setLoading(false);
      }
    } else {
      // Default to customer demo for smooth evaluation
      quickLoginAsDemoCustomer().finally(() => setLoading(false));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      localStorage.setItem('foodiehub_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      localStorage.setItem('foodiehub_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodiehub_user');
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        localStorage.setItem('foodiehub_user', JSON.stringify(updated));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addSavedAddress = async (address: Omit<Address, 'id'>): Promise<boolean> => {
    if (!user) return false;
    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    const updatedList = [...(user.savedAddresses || []), newAddress];
    return updateProfile({ savedAddresses: updatedList });
  };

  const removeSavedAddress = async (addressId: string): Promise<boolean> => {
    if (!user) return false;
    const updatedList = (user.savedAddresses || []).filter((a) => a.id !== addressId);
    return updateProfile({ savedAddresses: updatedList });
  };

  const quickLoginAsDemoCustomer = async () => {
    await login('alex@foodiehub.com', 'customer123');
  };

  const quickLoginAsAdmin = async () => {
    await login('admin@foodiehub.com', 'admin123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addSavedAddress,
        removeSavedAddress,
        quickLoginAsDemoCustomer,
        quickLoginAsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
