/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const { login, register, quickLoginAsDemoCustomer, quickLoginAsAdmin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === 'login') {
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed');
      }
    } else {
      if (!name.trim() || !phone.trim()) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const res = await register(name, email, phone, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed');
      }
    }
    setLoading(false);
  };

  const handleDemoCustomer = async () => {
    setLoading(true);
    await quickLoginAsDemoCustomer();
    setLoading(false);
    onClose();
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    await quickLoginAsAdmin();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-6 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`py-1.5 px-4 rounded-xl font-outfit text-xs font-bold transition cursor-pointer ${
                tab === 'login' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`py-1.5 px-4 rounded-xl font-outfit text-xs font-bold transition cursor-pointer ${
                tab === 'register' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5">
          <h3 className="font-outfit font-black text-2xl text-slate-900">
            {tab === 'login' ? 'Welcome Back!' : 'Join FoodieHub'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'login'
              ? 'Access saved addresses, order tracking, and customized AI meals'
              : 'Create your account to unlock delicious deals and track food'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full py-2.5 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full py-2.5 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full py-2.5 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-outfit font-bold text-xs uppercase tracking-wider bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins for College Examiners & Users */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
            One-Click Demo Roles (For College Presentation)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDemoCustomer}
              className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100/70 text-orange-900 text-left text-xs font-semibold transition cursor-pointer"
            >
              <div className="font-bold text-orange-700">Demo Customer</div>
              <div className="text-[10px] text-slate-500">Alex Mercer</div>
            </button>
            <button
              onClick={handleDemoAdmin}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 text-left text-xs font-semibold transition cursor-pointer"
            >
              <div className="font-bold text-purple-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Restaurant Admin
              </div>
              <div className="text-[10px] text-slate-500">admin@foodiehub</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
