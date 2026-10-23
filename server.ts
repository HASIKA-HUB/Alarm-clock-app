/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { db } from './server/db';
import { getFoodRecommendations } from './server/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Helper auth check
function getAuthUser(req: Request) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return null;
  return db.findUserById(userId);
}

function requireAdmin(req: Request, res: Response, next: () => void) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator privileges required' });
    return;
  }
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// --- Menu & Food Items ---
app.get('/api/menu', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const vegParam = req.query.vegetarian as string | undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const sort = req.query.sort as 'price_asc' | 'price_desc' | 'rating' | 'popular' | undefined;

    const vegetarian =
      vegParam === 'true' ? true : vegParam === 'false' ? false : undefined;

    const foods = db.getFoods({
      category,
      search,
      vegetarian,
      maxPrice,
      sort,
    });
    res.json(foods);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/menu/:id', (req: Request, res: Response) => {
  const food = db.getFoodById(req.params.id);
  if (!food) {
    res.status(404).json({ error: 'Food item not found' });
    return;
  }
  res.json(food);
});

// Admin Food Management
app.post('/api/admin/menu', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      categoryId,
      price,
      imageUrl,
      vegetarian,
      allergens,
      ingredients,
      spiceLevel,
      preparationTime,
      available,
    } = req.body;

    if (!name || !categoryId || price === undefined) {
      res.status(400).json({ error: 'Name, Category, and Price are required' });
      return;
    }

    const newFood = db.addFood({
      name,
      description: description || '',
      categoryId,
      price: Number(price),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      vegetarian: Boolean(vegetarian),
      allergens: Array.isArray(allergens) ? allergens : [],
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      spiceLevel: spiceLevel || 'Mild',
      preparationTime: Number(preparationTime) || 15,
      rating: 4.5,
      ratingCount: 1,
      available: available !== undefined ? Boolean(available) : true,
    });

    res.status(201).json(newFood);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/admin/menu/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateFood(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Food item not found' });
      return;
    }
    res.json(updated);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/admin/menu/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteFood(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Food item not found' });
    return;
  }
  res.json({ success: true, message: 'Item deleted' });
});

// --- Categories ---
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.getCategories());
});

app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, description, imageUrl } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }
  const newCat = db.addCategory({
    name,
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    active: true,
  });
  res.status(201).json(newCat);
});

app.put('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  db.deleteCategory(req.params.id);
  res.json({ success: true });
});

// --- Authentication ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password || !phone) {
      res.status(400).json({ error: 'Please provide name, email, phone, and password' });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const newUser = db.createUser({
      name,
      email,
      phone,
      passwordHash: password,
      role: 'customer',
    });

    res.status(201).json({ user: newUser });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const userWithPass = db.findUserByEmail(email);
    if (!userWithPass || userWithPass.passwordHash !== password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const { passwordHash, ...safeUser } = userWithPass;
    res.json({ user: safeUser });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json(user);
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { name, phone, savedAddresses, dietaryPreferences } = req.body;
  const updated = db.updateUser(user.id, {
    name,
    phone,
    savedAddresses,
    dietaryPreferences,
  });

  res.json(updated);
});

// --- Coupons ---
app.get('/api/coupons', (_req: Request, res: Response) => {
  res.json(db.getCoupons());
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code || typeof subtotal !== 'number') {
    res.status(400).json({ valid: false, message: 'Invalid payload' });
    return;
  }
  const result = db.validateCoupon(code, subtotal);
  res.json(result);
});

// --- Orders ---
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      deliveryAddress,
      couponCode,
      paymentMethod,
      customerInstructions,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty. Please add items before checkout.' });
      return;
    }

    const streetOrLine = deliveryAddress?.addressLine || deliveryAddress?.street;
    if (!customerName || !customerPhone || !streetOrLine) {
      res.status(400).json({ error: 'Please provide customer name, phone number, and delivery address.' });
      return;
    }

    if (!deliveryAddress.addressLine && deliveryAddress.street) {
      deliveryAddress.addressLine = deliveryAddress.street;
    }

    const newOrder = db.createOrder({
      userId: userId || 'guest',
      customerName,
      customerEmail,
      customerPhone,
      items,
      deliveryAddress,
      couponCode,
      paymentMethod: paymentMethod || 'cod',
      customerInstructions,
    });

    res.status(201).json(newOrder);
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.get('/api/orders', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (user.role === 'admin') {
    res.json(db.getOrders());
  } else {
    res.json(db.getOrders(user.id));
  }
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const user = getAuthUser(req);
  // Allow customer to see their own order, or admin to see any order, or guest order access
  if (user && user.role !== 'admin' && order.userId !== 'guest' && order.userId !== user.id) {
    res.status(403).json({ error: 'Unauthorized to view this order' });
    return;
  }

  res.json(order);
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  const user = getAuthUser(req);
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Customers can only cancel if order is still in "Order Placed"
  if (status === 'Cancelled') {
    if (user?.role !== 'admin') {
      if (order.orderStatus !== 'Order Placed') {
        res.status(400).json({ error: 'Order cannot be cancelled once preparation has begun' });
        return;
      }
    }
  } else {
    // Other status changes require admin
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Only restaurant staff can advance order status' });
      return;
    }
  }

  const updated = db.updateOrderStatus(
    req.params.id,
    status,
    user ? `${user.name} (${user.role})` : 'System',
    note
  );

  res.json(updated);
});

// --- Admin Telemetry & Statistics ---
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const orders = db.getOrders();
  const customers = db.getAllCustomers();

  const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
  const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(
    (o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  ).length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;

  // Best sellers
  const dishSales: Record<string, { name: string; quantity: number; revenue: number; imageUrl: string }> = {};
  validOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!dishSales[item.id]) {
        dishSales[item.id] = {
          name: item.name,
          quantity: 0,
          revenue: 0,
          imageUrl: item.imageUrl,
        };
      }
      dishSales[item.id].quantity += item.quantity;
      dishSales[item.id].revenue += item.price * item.quantity;
    });
  });

  const bestSellers = Object.values(dishSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Sales by day (last 7 days)
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const endOfDay = startOfDay + 86400000;

    const dayOrders = validOrders.filter(
      (o) => o.createdAt >= startOfDay && o.createdAt < endOfDay
    );
    const daySales = dayOrders.reduce((acc, o) => acc + o.total, 0);

    return {
      day: dayName,
      date: dateStr,
      sales: daySales,
      orderCount: dayOrders.length,
    };
  });

  res.json({
    totalOrders: orders.length,
    totalSales,
    pendingOrders,
    completedOrders,
    registeredCustomers: customers.length,
    bestSellers,
    salesByDay,
  });
});

app.get('/api/admin/customers', requireAdmin, (_req: Request, res: Response) => {
  const customers = db.getAllCustomers();
  const orders = db.getOrders();

  const customerStats = customers.map((c) => {
    const userOrders = orders.filter((o) => o.userId === c.id);
    const totalSpent = userOrders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      ...c,
      orderCount: userOrders.length,
      totalSpent,
      lastOrderDate: userOrders.length > 0 ? userOrders[0].createdAt : null,
    };
  });

  res.json(customerStats);
});

// --- Favorites ---
app.get('/api/favorites', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.json([]);
    return;
  }
  res.json(db.getFavorites(user.id));
});

app.post('/api/favorites/toggle', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Please sign in to save favorites' });
    return;
  }
  const { foodId } = req.body;
  if (!foodId) {
    res.status(400).json({ error: 'foodId is required' });
    return;
  }
  const isFav = db.toggleFavorite(user.id, foodId);
  res.json({ isFavorite: isFav });
});

// --- AI Food Assistant (Gemini) ---
app.post('/api/ai/recommend', async (req: Request, res: Response) => {
  try {
    const { query, budget, dietaryPreferences, historyItemIds } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Please provide a food query' });
      return;
    }

    const recommendations = await getFoodRecommendations({
      userQuery: query,
      budget: budget ? Number(budget) : undefined,
      userDietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : undefined,
      userHistoryItemIds: Array.isArray(historyItemIds) ? historyItemIds : undefined,
    });

    res.json(recommendations);
  } catch (err: unknown) {
    console.error('AI Recommendation endpoint error:', err);
    res.status(500).json({ error: 'Could not generate recommendations' });
  }
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production dist static files
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodieHub server running on http://localhost:${PORT}`);
  });
}

startServer();
