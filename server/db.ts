/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import {
  Category,
  FoodItem,
  User,
  Address,
  Coupon,
  Order,
  OrderStatusHistoryItem,
} from '../src/types';

export interface DatabaseSchema {
  users: (User & { passwordHash?: string })[];
  categories: Category[];
  foodItems: FoodItem[];
  coupons: Coupon[];
  orders: Order[];
  favorites: { userId: string; foodItemId: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'foodiehub.json');

// --- Rich Realistic Seed Data ---
const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-biryani',
    name: 'Biryani & Rice',
    description: 'Aromatic basmati rice cooked with authentic rich spices',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'cat-pizza',
    name: 'Pizzas',
    description: 'Freshly baked artisanal crusts with melted mozzarella',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'cat-burgers',
    name: 'Burgers & Wraps',
    description: 'Juicy patties, fresh lettuce, and signature craft sauces',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'cat-south-indian',
    name: 'South Indian',
    description: 'Crispy dosas, fluffy idlis, and slow-simmered sambar',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'cat-chinese',
    name: 'Chinese & Asian',
    description: 'Wok-tossed noodles, crunchy fried rice, and savory dumplings',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'cat-north-indian',
    name: 'North Indian Curries',
    description: 'Rich paneer, creamy butter curries, and warm tandoori breads',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'cat-desserts',
    name: 'Desserts & Bakes',
    description: 'Decadent chocolate cakes, warm gulab jamuns, and sundaes',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'cat-beverages',
    name: 'Beverages & Shakes',
    description: 'Thick milkshakes, chilled cold brews, and seasonal fresh juices',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    active: true,
  },
];

const SEED_FOODS: FoodItem[] = [
  // Biryani
  {
    id: 'food-1',
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Marinated tender chicken slow-cooked with aged fragrant basmati rice, saffron, caramelized onions, and secret spices. Served with creamy raita and salan.',
    categoryId: 'cat-biryani',
    categoryName: 'Biryani & Rice',
    price: 329,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Dairy'],
    ingredients: ['Basmati Rice', 'Chicken', 'Yogurt', 'Saffron', 'Mint', 'Ghee', 'Whole Spices'],
    spiceLevel: 'Hot',
    preparationTime: 25,
    rating: 4.8,
    ratingCount: 1420,
    available: true,
    isPopular: true,
    isChefSpecial: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now(),
  },
  {
    id: 'food-2',
    name: 'Royal Shahi Veg Biryani',
    description: 'Medley of fresh garden vegetables, paneer cubes, cashews, and raisins dum-cooked in fragrant saffron basmati rice.',
    categoryId: 'cat-biryani',
    categoryName: 'Biryani & Rice',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy', 'Tree Nuts'],
    ingredients: ['Basmati Rice', 'Paneer', 'Carrots', 'Beans', 'Cashews', 'Saffron', 'Rosewater'],
    spiceLevel: 'Medium',
    preparationTime: 20,
    rating: 4.6,
    ratingCount: 890,
    available: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 28,
    updatedAt: Date.now(),
  },

  // Pizzas
  {
    id: 'food-3',
    name: 'Classic Margherita Supreme',
    description: 'Hand-tossed sourdough crust topped with San Marzano tomato sauce, fresh buffalo mozzarella, virgin olive oil, and aromatic basil leaves.',
    categoryId: 'cat-pizza',
    categoryName: 'Pizzas',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Wheat Flour', 'Mozzarella', 'San Marzano Tomatoes', 'Fresh Basil', 'Extra Virgin Olive Oil'],
    spiceLevel: 'Mild',
    preparationTime: 18,
    rating: 4.7,
    ratingCount: 650,
    available: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now(),
  },
  {
    id: 'food-4',
    name: 'Spicy Peri-Peri Paneer Pizza',
    description: 'Fiery peri-peri marinated paneer chunks, crisp bell peppers, sweet corn, and red onions with a four-cheese molten blend.',
    categoryId: 'cat-pizza',
    categoryName: 'Pizzas',
    price: 369,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Crust', 'Paneer', 'Peri-Peri Spice', 'Bell Peppers', 'Red Onion', 'Mozzarella'],
    spiceLevel: 'Hot',
    preparationTime: 20,
    rating: 4.8,
    ratingCount: 1120,
    available: true,
    isChefSpecial: true,
    createdAt: Date.now() - 86400000 * 24,
    updatedAt: Date.now(),
  },
  {
    id: 'food-5',
    name: 'Smoked BBQ Chicken Pizza',
    description: 'Tender pulled chicken tossed in hickory BBQ sauce, caramelized onions, smoked mozzarella, and fresh cilantro.',
    categoryId: 'cat-pizza',
    categoryName: 'Pizzas',
    price: 399,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Chicken Breast', 'Hickory BBQ Sauce', 'Mozzarella', 'Cheddar', 'Red Onions'],
    spiceLevel: 'Medium',
    preparationTime: 22,
    rating: 4.9,
    ratingCount: 940,
    available: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 23,
    updatedAt: Date.now(),
  },

  // Burgers
  {
    id: 'food-6',
    name: 'Crispy Veggie Crunch Burger',
    description: 'Golden fried crispy vegetable and potato patty topped with crunchy iceberg lettuce, pickled gherkins, melted cheddar, and secret house burger mayo in a toasted brioche bun.',
    categoryId: 'cat-burgers',
    categoryName: 'Burgers & Wraps',
    price: 159,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Potato Patty', 'Peas', 'Corn', 'Brioche Bun', 'Iceberg Lettuce', 'Cheddar'],
    spiceLevel: 'Mild',
    preparationTime: 15,
    rating: 4.5,
    ratingCount: 780,
    available: true,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now(),
  },
  {
    id: 'food-7',
    name: 'Spicy Grilled Chicken Deluxe Burger',
    description: 'Flame-grilled marinated chicken breast fillet glazed in spicy paprika relish, crowned with swiss cheese, sliced tomatoes, and honey mustard.',
    categoryId: 'cat-burgers',
    categoryName: 'Burgers & Wraps',
    price: 219,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Chicken Fillet', 'Brioche Bun', 'Paprika Sauce', 'Swiss Cheese', 'Mustard', 'Tomato'],
    spiceLevel: 'Hot',
    preparationTime: 18,
    rating: 4.8,
    ratingCount: 1340,
    available: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 19,
    updatedAt: Date.now(),
  },
  {
    id: 'food-8',
    name: 'Crispy Salted French Fries',
    description: 'Classic skin-on Idaho potatoes double-fried to golden perfection and tossed in sea salt. Served with ketchup and garlic aioli dip.',
    categoryId: 'cat-burgers',
    categoryName: 'Burgers & Wraps',
    price: 109,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: [],
    ingredients: ['Potatoes', 'Sea Salt', 'Vegetable Oil'],
    spiceLevel: 'None',
    preparationTime: 10,
    rating: 4.6,
    ratingCount: 1620,
    available: true,
    createdAt: Date.now() - 86400000 * 18,
    updatedAt: Date.now(),
  },

  // South Indian
  {
    id: 'food-9',
    name: 'Crispy Ghee Podi Masala Dosa',
    description: 'Golden fermented rice & lentil crepe smeared with aromatic spicy karam podi and pure country ghee, stuffed with spiced potato masala. Served with 3 chutneys & hot sambar.',
    categoryId: 'cat-south-indian',
    categoryName: 'South Indian',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy'],
    ingredients: ['Rice Batter', 'Urad Dal', 'Potatoes', 'Gunpowder Podi', 'Ghee', 'Mustard Seeds'],
    spiceLevel: 'Medium',
    preparationTime: 12,
    rating: 4.9,
    ratingCount: 2150,
    available: true,
    isPopular: true,
    isChefSpecial: true,
    createdAt: Date.now() - 86400000 * 17,
    updatedAt: Date.now(),
  },
  {
    id: 'food-10',
    name: 'Steamed Button Idli with Medu Vada Platter',
    description: 'Four feather-soft steamed rice cakes paired with two crunchy lentil medu vadas, accompanied by freshly grated coconut chutney, tomato chutney, and lentil vegetable sambar.',
    categoryId: 'cat-south-indian',
    categoryName: 'South Indian',
    price: 119,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: [],
    ingredients: ['Fermented Rice', 'Lentils', 'Curry Leaves', 'Cumin', 'Black Pepper', 'Coconut'],
    spiceLevel: 'Mild',
    preparationTime: 10,
    rating: 4.7,
    ratingCount: 1840,
    available: true,
    createdAt: Date.now() - 86400000 * 16,
    updatedAt: Date.now(),
  },

  // Chinese & Asian
  {
    id: 'food-11',
    name: 'Schezwan Hakka Veg Noodles',
    description: 'Wok-tossed thin noodles with crunchy shredded cabbage, capsicum, carrots, spring onions, and spicy artisanal Schezwan red pepper sauce.',
    categoryId: 'cat-chinese',
    categoryName: 'Chinese & Asian',
    price: 189,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Soy'],
    ingredients: ['Wheat Noodles', 'Schezwan Peppers', 'Garlic', 'Bell Peppers', 'Soy Sauce', 'Spring Onion'],
    spiceLevel: 'Hot',
    preparationTime: 15,
    rating: 4.6,
    ratingCount: 920,
    available: true,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now(),
  },
  {
    id: 'food-12',
    name: 'Chilli Chicken Gravy / Dry',
    description: 'Crispy batter-fried chicken morsels tossed with diced bell peppers, green chilies, and garlic in a dark savory soy-chilli glaze.',
    categoryId: 'cat-chinese',
    categoryName: 'Chinese & Asian',
    price: 259,
    imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Soy', 'Gluten', 'Egg'],
    ingredients: ['Chicken Thighs', 'Soy Sauce', 'Green Chillies', 'Capsicum', 'Garlic', 'Cornstarch'],
    spiceLevel: 'Hot',
    preparationTime: 18,
    rating: 4.8,
    ratingCount: 1100,
    available: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now(),
  },
  {
    id: 'food-13',
    name: 'Classic Veg Fried Rice',
    description: 'Fluffy long-grain rice tossed in high-flame wok with finely chopped french beans, carrots, scallions, and white pepper.',
    categoryId: 'cat-chinese',
    categoryName: 'Chinese & Asian',
    price: 169,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Soy'],
    ingredients: ['Basmati Rice', 'Carrots', 'Beans', 'Spring Onions', 'White Pepper', 'Sesame Oil'],
    spiceLevel: 'Mild',
    preparationTime: 14,
    rating: 4.5,
    ratingCount: 680,
    available: true,
    createdAt: Date.now() - 86400000 * 13,
    updatedAt: Date.now(),
  },

  // North Indian Curries
  {
    id: 'food-14',
    name: 'Paneer Butter Masala',
    description: 'Fresh malai cottage cheese cubes simmered in a velvety, buttery tomato gravy infused with crushed kasuri methi and fresh cream.',
    categoryId: 'cat-north-indian',
    categoryName: 'North Indian Curries',
    price: 269,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy', 'Tree Nuts'],
    ingredients: ['Cottage Cheese', 'Butter', 'Cashew Paste', 'Tomatoes', 'Cream', 'Fenugreek Leaves'],
    spiceLevel: 'Medium',
    preparationTime: 20,
    rating: 4.9,
    ratingCount: 1780,
    available: true,
    isPopular: true,
    isChefSpecial: true,
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now(),
  },
  {
    id: 'food-15',
    name: 'Murgh Makhani (Butter Chicken)',
    description: 'Tandoori roasted succulent chicken tikka pieces bathed in a smooth, sweet, and mildly spiced satin tomato-butter makhani sauce.',
    categoryId: 'cat-north-indian',
    categoryName: 'North Indian Curries',
    price: 339,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Dairy', 'Tree Nuts'],
    ingredients: ['Tandoori Chicken', 'Butter', 'Cashew Nut Gravy', 'Tomatoes', 'Honey', 'Garam Masala'],
    spiceLevel: 'Medium',
    preparationTime: 22,
    rating: 4.9,
    ratingCount: 2450,
    available: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 11,
    updatedAt: Date.now(),
  },
  {
    id: 'food-16',
    name: 'Butter Garlic Naan (2 pcs)',
    description: 'Traditional refined flour flatbread baked on the clay wall of a burning tandoor, brushed with melting butter and minced roasted garlic.',
    categoryId: 'cat-north-indian',
    categoryName: 'North Indian Curries',
    price: 79,
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Wheat Flour', 'Garlic', 'Butter', 'Yogurt', 'Nigella Seeds'],
    spiceLevel: 'None',
    preparationTime: 10,
    rating: 4.8,
    ratingCount: 1980,
    available: true,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now(),
  },

  // Desserts
  {
    id: 'food-17',
    name: 'Molten Chocolate Lava Cake',
    description: 'Warm Belgian dark chocolate individual sponge cake with a rich, flowing molten liquid chocolate center. Served with powdered sugar.',
    categoryId: 'cat-desserts',
    categoryName: 'Desserts & Bakes',
    price: 169,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy', 'Egg'],
    ingredients: ['Belgian Chocolate', 'Butter', 'Cocoa', 'Sugar', 'Flour'],
    spiceLevel: 'None',
    preparationTime: 12,
    rating: 4.9,
    ratingCount: 1220,
    available: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 9,
    updatedAt: Date.now(),
  },
  {
    id: 'food-18',
    name: 'Warm Gulab Jamun with Rabdi (2 pcs)',
    description: 'Melt-in-mouth golden milk-solid dumplings soaked in rose and cardamom syrup, topped with thick condensed milk rabdi and pistachio slivers.',
    categoryId: 'cat-desserts',
    categoryName: 'Desserts & Bakes',
    price: 129,
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy', 'Tree Nuts'],
    ingredients: ['Khoya', 'Saffron Sugar Syrup', 'Rabdi', 'Cardamom', 'Pistachios'],
    spiceLevel: 'None',
    preparationTime: 8,
    rating: 4.8,
    ratingCount: 960,
    available: true,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now(),
  },
  {
    id: 'food-19',
    name: 'Belgian Chocolate Truffle Pastry',
    description: 'Layers of moist chocolate sponge filled with velvety ganache and crowned with chocolate curls.',
    categoryId: 'cat-desserts',
    categoryName: 'Desserts & Bakes',
    price: 139,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Dark Chocolate', 'Heavy Cream', 'Cocoa Powder', 'Flour', 'Butter'],
    spiceLevel: 'None',
    preparationTime: 8,
    rating: 4.7,
    ratingCount: 840,
    available: true,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now(),
  },

  // Beverages
  {
    id: 'food-20',
    name: 'Alphonso Mango Thick Shake',
    description: 'Blended with real Ratnagiri Alphonso mango pulp, chilled rich whole milk, and a scoop of creamy vanilla ice cream.',
    categoryId: 'cat-beverages',
    categoryName: 'Beverages & Shakes',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy'],
    ingredients: ['Alphonso Mango Pulp', 'Whole Milk', 'Vanilla Ice Cream'],
    spiceLevel: 'None',
    preparationTime: 8,
    rating: 4.9,
    ratingCount: 1310,
    available: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now(),
  },
  {
    id: 'food-21',
    name: 'Hazelnut Cold Coffee Frappe',
    description: 'Rich dark espresso blended with roasted hazelnut syrup, chilled milk, and crushed ice, finished with whipped cream.',
    categoryId: 'cat-beverages',
    categoryName: 'Beverages & Shakes',
    price: 139,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy', 'Tree Nuts'],
    ingredients: ['Espresso', 'Hazelnut Syrup', 'Milk', 'Ice Cream', 'Whipped Cream'],
    spiceLevel: 'None',
    preparationTime: 8,
    rating: 4.8,
    ratingCount: 1450,
    available: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
  },
  {
    id: 'food-22',
    name: 'Fresh Mint & Lime Mojito',
    description: 'Refreshing muddled garden mint, tart lime wedges, pure cane sugar, and chilled sparkling club soda.',
    categoryId: 'cat-beverages',
    categoryName: 'Beverages & Shakes',
    price: 109,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: [],
    ingredients: ['Fresh Mint', 'Lime Juice', 'Soda Water', 'Raw Cane Sugar'],
    spiceLevel: 'None',
    preparationTime: 5,
    rating: 4.6,
    ratingCount: 790,
    available: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now(),
  },
];

const SEED_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-admin-1',
    name: 'FoodieHub Admin',
    email: 'admin@foodiehub.com',
    phone: '+91 98765 00000',
    role: 'admin',
    passwordHash: 'admin123',
    savedAddresses: [
      {
        id: 'addr-admin-1',
        title: 'HQ Office',
        addressLine: 'Suite 404, Cyber Towers, HITEC City',
        city: 'Hyderabad',
        pincode: '500081',
        isDefault: true,
      },
    ],
    dietaryPreferences: ['None'],
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'user-alex-1',
    name: 'Alex Mercer',
    email: 'alex@foodiehub.com',
    phone: '+91 98765 43210',
    role: 'customer',
    passwordHash: 'customer123',
    savedAddresses: [
      {
        id: 'addr-alex-1',
        title: 'Home',
        addressLine: 'Flat 302, Palm Meadows Residency, Outer Ring Road',
        city: 'Bengaluru',
        pincode: '560103',
        isDefault: true,
      },
      {
        id: 'addr-alex-2',
        title: 'Tech Campus',
        addressLine: 'Tower B, Global Technology Park, Bellandur',
        city: 'Bengaluru',
        pincode: '560103',
      },
    ],
    dietaryPreferences: ['Vegetarian', 'Spicy Lover'],
    createdAt: Date.now() - 86400000 * 15,
  },
];

const SEED_COUPONS: Coupon[] = [
  {
    id: 'c-welcome50',
    code: 'WELCOME50',
    discountType: 'percentage',
    discountValue: 50,
    minimumOrderValue: 199,
    maximumDiscount: 100,
    expiryDate: '2027-12-31',
    active: true,
    description: '50% off on your order up to ₹100 (Min. ₹199)',
  },
  {
    id: 'c-foodie100',
    code: 'FOODIE100',
    discountType: 'fixed',
    discountValue: 100,
    minimumOrderValue: 499,
    maximumDiscount: 100,
    expiryDate: '2027-12-31',
    active: true,
    description: 'Flat ₹100 OFF on orders above ₹499',
  },
  {
    id: 'c-tasty20',
    code: 'TASTY20',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderValue: 299,
    maximumDiscount: 150,
    expiryDate: '2027-12-31',
    active: true,
    description: '20% OFF on all cravings up to ₹150 (Min. ₹299)',
  },
  {
    id: 'c-fiesta',
    code: 'FIESTA',
    discountType: 'fixed',
    discountValue: 75,
    minimumOrderValue: 349,
    maximumDiscount: 75,
    expiryDate: '2027-12-31',
    active: true,
    description: 'Special ₹75 discount on orders above ₹349',
  },
];

const SEED_ORDERS: Order[] = [
  {
    id: 'ORD-84210',
    userId: 'user-alex-1',
    customerName: 'Alex Mercer',
    customerEmail: 'alex@foodiehub.com',
    customerPhone: '+91 98765 43210',
    items: [
      {
        id: 'food-1',
        name: 'Hyderabadi Dum Chicken Biryani',
        price: 329,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
        vegetarian: false,
      },
      {
        id: 'food-20',
        name: 'Alphonso Mango Thick Shake',
        price: 149,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80',
        vegetarian: true,
      },
    ],
    deliveryAddress: {
      id: 'addr-alex-1',
      title: 'Home',
      addressLine: 'Flat 302, Palm Meadows Residency, Outer Ring Road',
      city: 'Bengaluru',
      pincode: '560103',
    },
    subtotal: 478,
    deliveryFee: 30,
    tax: 24,
    discount: 100,
    total: 432,
    couponCode: 'WELCOME50',
    paymentMethod: 'demo_upi',
    paymentStatus: 'completed',
    orderStatus: 'Preparing',
    customerInstructions: 'Please leave with security if doorbell is unanswered',
    statusHistory: [
      {
        id: 'h-1',
        status: 'Order Placed',
        changedBy: 'Customer',
        timestamp: Date.now() - 1000 * 60 * 18,
        note: 'Order successfully created via Demo UPI',
      },
      {
        id: 'h-2',
        status: 'Confirmed',
        changedBy: 'FoodieHub Kitchen',
        timestamp: Date.now() - 1000 * 60 * 15,
        note: 'Kitchen confirmed order ticket',
      },
      {
        id: 'h-3',
        status: 'Preparing',
        changedBy: 'Chef Team',
        timestamp: Date.now() - 1000 * 60 * 10,
        note: 'Food is simmering and being packaged fresh',
      },
    ],
    estimatedDeliveryMinutes: 25,
    createdAt: Date.now() - 1000 * 60 * 18,
    updatedAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: 'ORD-72901',
    userId: 'user-alex-1',
    customerName: 'Alex Mercer',
    customerEmail: 'alex@foodiehub.com',
    customerPhone: '+91 98765 43210',
    items: [
      {
        id: 'food-3',
        name: 'Classic Margherita Supreme',
        price: 299,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
        vegetarian: true,
      },
      {
        id: 'food-8',
        name: 'Crispy Salted French Fries',
        price: 109,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80',
        vegetarian: true,
      },
    ],
    deliveryAddress: {
      id: 'addr-alex-1',
      title: 'Home',
      addressLine: 'Flat 302, Palm Meadows Residency, Outer Ring Road',
      city: 'Bengaluru',
      pincode: '560103',
    },
    subtotal: 408,
    deliveryFee: 30,
    tax: 20,
    discount: 0,
    total: 458,
    paymentMethod: 'cod',
    paymentStatus: 'completed',
    orderStatus: 'Delivered',
    statusHistory: [
      {
        id: 'h-4',
        status: 'Order Placed',
        changedBy: 'Customer',
        timestamp: Date.now() - 86400000 * 2,
      },
      {
        id: 'h-5',
        status: 'Confirmed',
        changedBy: 'Admin',
        timestamp: Date.now() - 86400000 * 2 + 1000 * 60 * 5,
      },
      {
        id: 'h-6',
        status: 'Preparing',
        changedBy: 'Kitchen',
        timestamp: Date.now() - 86400000 * 2 + 1000 * 60 * 12,
      },
      {
        id: 'h-7',
        status: 'Out for Delivery',
        changedBy: 'Delivery Partner',
        timestamp: Date.now() - 86400000 * 2 + 1000 * 60 * 25,
      },
      {
        id: 'h-8',
        status: 'Delivered',
        changedBy: 'Delivery Partner',
        timestamp: Date.now() - 86400000 * 2 + 1000 * 60 * 42,
        note: 'Handed over to customer with smile',
      },
    ],
    estimatedDeliveryMinutes: 0,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2 + 1000 * 60 * 42,
  },
];

class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || SEED_USERS,
          categories: parsed.categories || SEED_CATEGORIES,
          foodItems: parsed.foodItems || SEED_FOODS,
          coupons: parsed.coupons || SEED_COUPONS,
          orders: parsed.orders || SEED_ORDERS,
          favorites: parsed.favorites || [],
        };
      }
    } catch (err) {
      console.error('Error loading db file, falling back to seed data:', err);
    }

    const initialData: DatabaseSchema = {
      users: SEED_USERS,
      categories: SEED_CATEGORIES,
      foodItems: SEED_FOODS,
      coupons: SEED_COUPONS,
      orders: SEED_ORDERS,
      favorites: [
        { userId: 'user-alex-1', foodItemId: 'food-1' },
        { userId: 'user-alex-1', foodItemId: 'food-9' },
      ],
    };
    this.save(initialData);
    return initialData;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db file:', err);
    }
  }

  // --- Food Items ---
  public getFoods(filter?: {
    category?: string;
    search?: string;
    vegetarian?: boolean;
    availableOnly?: boolean;
    maxPrice?: number;
    sort?: 'price_asc' | 'price_desc' | 'rating' | 'popular';
  }): FoodItem[] {
    let items = [...this.data.foodItems];

    if (filter) {
      if (filter.category && filter.category !== 'all') {
        items = items.filter((f) => f.categoryId === filter.category);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        items = items.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            f.ingredients.some((ing) => ing.toLowerCase().includes(q))
        );
      }
      if (filter.vegetarian !== undefined) {
        items = items.filter((f) => f.vegetarian === filter.vegetarian);
      }
      if (filter.availableOnly) {
        items = items.filter((f) => f.available);
      }
      if (filter.maxPrice) {
        items = items.filter((f) => f.price <= filter.maxPrice!);
      }
      if (filter.sort) {
        if (filter.sort === 'price_asc') items.sort((a, b) => a.price - b.price);
        else if (filter.sort === 'price_desc') items.sort((a, b) => b.price - a.price);
        else if (filter.sort === 'rating') items.sort((a, b) => b.rating - a.rating);
        else if (filter.sort === 'popular') items.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
      }
    }

    return items;
  }

  public getFoodById(id: string): FoodItem | undefined {
    return this.data.foodItems.find((f) => f.id === id);
  }

  public addFood(food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): FoodItem {
    const category = this.data.categories.find((c) => c.id === food.categoryId);
    const newItem: FoodItem = {
      ...food,
      id: `food-${Date.now()}`,
      categoryName: category?.name || 'General',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.data.foodItems.unshift(newItem);
    this.save();
    return newItem;
  }

  public updateFood(id: string, updates: Partial<FoodItem>): FoodItem | null {
    const index = this.data.foodItems.findIndex((f) => f.id === id);
    if (index === -1) return null;

    if (updates.categoryId) {
      const cat = this.data.categories.find((c) => c.id === updates.categoryId);
      if (cat) updates.categoryName = cat.name;
    }

    this.data.foodItems[index] = {
      ...this.data.foodItems[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.save();
    return this.data.foodItems[index];
  }

  public deleteFood(id: string): boolean {
    const initialLen = this.data.foodItems.length;
    this.data.foodItems = this.data.foodItems.filter((f) => f.id !== id);
    const deleted = this.data.foodItems.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.data.categories[index] = { ...this.data.categories[index], ...updates };
    this.save();
    return this.data.categories[index];
  }

  public deleteCategory(id: string): boolean {
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.save();
    return true;
  }

  // --- Users & Authentication ---
  public findUserByEmail(email: string): (User & { passwordHash?: string }) | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    const u = this.data.users.find((u) => u.id === id);
    if (!u) return undefined;
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  }

  public createUser(userData: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    role?: 'customer' | 'admin';
  }): User {
    const newUser: User & { passwordHash: string } = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone.trim(),
      role: userData.role || 'customer',
      passwordHash: userData.passwordHash,
      savedAddresses: [],
      dietaryPreferences: [],
      createdAt: Date.now(),
    };
    this.data.users.push(newUser);
    this.save();
    const { passwordHash, ...safe } = newUser;
    return safe;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.save();
    const { passwordHash, ...safe } = this.data.users[index];
    return safe;
  }

  public getAllCustomers(): User[] {
    return this.data.users
      .filter((u) => u.role === 'customer')
      .map(({ passwordHash, ...u }) => u);
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return this.data.coupons.filter((c) => c.active);
  }

  public validateCoupon(code: string, currentSubtotal: number): {
    valid: boolean;
    discount: number;
    message: string;
    coupon?: Coupon;
  } {
    const coupon = this.data.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active
    );

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }

    if (currentSubtotal < coupon.minimumOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires minimum order value of ₹${coupon.minimumOrderValue}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((currentSubtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount > 0 && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied: ₹${discount} off!`,
      coupon,
    };
  }

  // --- Orders ---
  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter((o) => o.userId === userId);
    }
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public createOrder(orderPayload: {
    userId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    items: { foodId: string; quantity: number }[];
    deliveryAddress: Address;
    couponCode?: string;
    paymentMethod: Order['paymentMethod'];
    customerInstructions?: string;
  }): Order {
    // Server-side strict recalculation from fresh menu prices!
    let subtotal = 0;
    const itemSnapshots: Order['items'] = [];

    for (const reqItem of orderPayload.items) {
      const food = this.getFoodById(reqItem.foodId);
      if (!food) {
        throw new Error(`Food item ${reqItem.foodId} is no longer available`);
      }
      if (!food.available) {
        throw new Error(`"${food.name}" is currently sold out`);
      }
      const qty = Math.max(1, Math.floor(reqItem.quantity));
      subtotal += food.price * qty;

      itemSnapshots.push({
        id: food.id,
        name: food.name,
        price: food.price,
        quantity: qty,
        imageUrl: food.imageUrl,
        vegetarian: food.vegetarian,
      });
    }

    // Delivery fee rule: Free above ₹500, otherwise ₹30
    const deliveryFee = subtotal >= 500 ? 0 : 30;

    // 5% Restaurant GST Tax
    const tax = Math.round(subtotal * 0.05);

    // Coupon discount verification
    let discount = 0;
    if (orderPayload.couponCode) {
      const couponCheck = this.validateCoupon(orderPayload.couponCode, subtotal);
      if (couponCheck.valid) {
        discount = couponCheck.discount;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee + tax - discount);
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      userId: orderPayload.userId,
      customerName: orderPayload.customerName,
      customerEmail: orderPayload.customerEmail,
      customerPhone: orderPayload.customerPhone,
      items: itemSnapshots,
      deliveryAddress: orderPayload.deliveryAddress,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      couponCode: discount > 0 ? orderPayload.couponCode : undefined,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: orderPayload.paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'Order Placed',
      customerInstructions: orderPayload.customerInstructions,
      statusHistory: [
        {
          id: `h-${Date.now()}`,
          status: 'Order Placed',
          changedBy: orderPayload.customerName,
          timestamp: Date.now(),
          note: `Order placed via ${orderPayload.paymentMethod.toUpperCase()}`,
        },
      ],
      estimatedDeliveryMinutes: 30,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: Order['orderStatus'],
    changedBy: string,
    note?: string
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.orderStatus = newStatus;
    if (newStatus === 'Delivered') {
      order.paymentStatus = 'completed';
      order.estimatedDeliveryMinutes = 0;
    }
    order.updatedAt = Date.now();

    const historyItem: OrderStatusHistoryItem = {
      id: `h-${Date.now()}`,
      status: newStatus,
      changedBy,
      timestamp: Date.now(),
      note: note || `Status updated to ${newStatus}`,
    };
    order.statusHistory.push(historyItem);

    this.save();
    return order;
  }

  // --- Favorites ---
  public getFavorites(userId: string): string[] {
    return this.data.favorites
      .filter((f) => f.userId === userId)
      .map((f) => f.foodItemId);
  }

  public toggleFavorite(userId: string, foodItemId: string): boolean {
    const index = this.data.favorites.findIndex(
      (f) => f.userId === userId && f.foodItemId === foodItemId
    );
    let isFav = false;
    if (index >= 0) {
      this.data.favorites.splice(index, 1);
      isFav = false;
    } else {
      this.data.favorites.push({ userId, foodItemId });
      isFav = true;
    }
    this.save();
    return isFav;
  }
}

export const db = new DatabaseEngine();
