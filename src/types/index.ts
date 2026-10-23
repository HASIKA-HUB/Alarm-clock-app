/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'admin';

export interface Address {
  id: string;
  title: string; // e.g. "Home", "Office", "Campus"
  addressLine: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  savedAddresses: Address[];
  dietaryPreferences: string[]; // e.g. ["Vegetarian", "No Dairy", "Spicy Lover"]
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
}

export type SpiceLevel = 'None' | 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  price: number; // in INR ₹
  imageUrl: string;
  vegetarian: boolean;
  allergens: string[];
  ingredients: string[];
  spiceLevel: SpiceLevel;
  preparationTime: number; // in minutes
  rating: number;
  ratingCount?: number;
  available: boolean;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscount: number;
  expiryDate: string;
  active: boolean;
  description?: string;
}

export interface OrderItemSnapshot {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  vegetarian: boolean;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'cod' | 'demo_upi' | 'demo_card';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderStatusHistoryItem {
  id: string;
  status: OrderStatus;
  changedBy: string;
  timestamp: number;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  items: OrderItemSnapshot[];
  deliveryAddress: Address;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customerInstructions?: string;
  statusHistory: OrderStatusHistoryItem[];
  estimatedDeliveryMinutes: number;
  createdAt: number;
  updatedAt: number;
}

export interface AdminStats {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  completedOrders: number;
  registeredCustomers: number;
  bestSellers: { name: string; quantity: number; revenue: number; imageUrl: string }[];
  salesByDay: { day: string; date: string; sales: number; orderCount: number }[];
}

export interface AiRecommendationResponse {
  adviceSummary: string;
  recommendedItems: {
    item: FoodItem;
    reason: string;
    pairingSuggestion?: string;
  }[];
  isAiGenerated: boolean;
}
