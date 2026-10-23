/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Check,
  LogOut,
} from 'lucide-react';

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Non-Vegetarian',
  'No Dairy / Lactose Free',
  'Spicy Lover',
  'Mild / Non-Spicy',
  'Gluten Conscious',
  'High Protein',
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, addSavedAddress, removeSavedAddress, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dietary, setDietary] = useState<string[]>(user?.dietaryPreferences || []);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Address State
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newTitle, setNewTitle] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newPincode, setNewPincode] = useState('560103');

  if (!user) {
    return (
      <div className="py-20 text-center space-y-3">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-outfit font-black text-xl text-slate-900">Please Sign In</h3>
      </div>
    );
  }

  const toggleDiet = (pref: string) => {
    setDietary((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name,
      phone,
      dietaryPreferences: dietary,
    });
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim() || !newPincode.trim()) return;

    await addSavedAddress({
      title: newTitle,
      addressLine: newStreet.trim(),
      city: newCity.trim(),
      pincode: newPincode.trim(),
    });

    setNewStreet('');
    setShowAddAddr(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE1]">
        <div>
          <h1 className="font-outfit font-black text-3xl text-slate-900">User Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal profile, delivery addresses, and AI preferences
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile Card & AI Dietary */}
        <div className="md:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-4"
          >
            <h2 className="font-outfit font-black text-lg text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email (Account ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full py-2.5 px-3 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Account Role
                </label>
                <div className="py-2.5 px-3 text-xs font-bold font-outfit uppercase text-slate-700 bg-slate-50 border border-slate-200 rounded-xl">
                  {user.role === 'admin' ? 'Restaurant Administrator' : 'Verified Customer'}
                </div>
              </div>
            </div>

            {/* AI Dietary Preferences */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Foodie AI Dietary Preferences</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Selected preferences guide Foodie AI when recommending meals
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {DIETARY_OPTIONS.map((opt) => {
                  const isChecked = dietary.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleDiet(opt)}
                      className={`text-xs py-1.5 px-3 rounded-full border transition cursor-pointer font-medium ${
                        isChecked
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                  <Check className="w-4 h-4" />
                  Saved!
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-outfit font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-orange-600/30"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Saved Addresses Manager */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-[#F3ECE1] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-outfit font-black text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Saved Addresses</span>
              </h3>
              <button
                onClick={() => setShowAddAddr(!showAddAddr)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                + Add
              </button>
            </div>

            {/* Address items */}
            {user.savedAddresses && user.savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {user.savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 relative group text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="font-outfit text-slate-900">{addr.title}</strong>
                      <button
                        onClick={() => removeSavedAddress(addr.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-600 leading-snug">
                      {addr.addressLine}, {addr.city} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                No saved addresses yet. Click + Add to store your home or work address.
              </p>
            )}

            {/* Add Address Form */}
            {showAddAddr && (
              <form onSubmit={handleAddNewAddress} className="pt-3 border-t border-slate-100 space-y-2 text-xs animate-fadeIn">
                <input
                  type="text"
                  required
                  placeholder="Address Title (e.g. Home, Office)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  required
                  placeholder="House, Street, Area"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-slate-900 text-white font-outfit font-bold text-xs uppercase"
                >
                  Save Address
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
