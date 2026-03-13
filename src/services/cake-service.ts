'use client';

/**
 * @fileOverview WhiskeDelights Mock Service Layer
 * Centralizes all bakery operations using a persistent in-memory mock data store.
 */

import type { Cake, SpecialOffer, CustomizationOptions, Order, LoginCredentials, SpecialOfferUpdatePayload, CustomizationCategory, User } from '@/lib/types';
import { 
  MOCK_CAKES, 
  MOCK_FLAVORS, 
  MOCK_SIZES, 
  MOCK_COLORS, 
  MOCK_TOPPINGS, 
  MOCK_ORDERS, 
  MOCK_USERS 
} from '@/lib/data';

// --- IN-MEMORY DATA STORE (Simulating a DB) ---
let cakes = [...MOCK_CAKES];
let flavors = [...MOCK_FLAVORS];
let sizes = [...MOCK_SIZES];
let colors = [...MOCK_COLORS];
let toppings = [...MOCK_TOPPINGS];
let orders = [...MOCK_ORDERS];
let users = [...MOCK_USERS];
let activeSpecialOffer: SpecialOffer = {
  cake: cakes[0],
  discount_percentage: 20,
  original_price: cakes[0].base_price,
  special_price: cakes[0].base_price * 0.8,
  savings: cakes[0].base_price * 0.2
};

// --- HELPER (Reduced delays for better performance) ---
const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// --- CAKES ---
export async function getCakes(): Promise<Cake[]> {
  await delay();
  return [...cakes];
}

export async function createCake(cake: any): Promise<void> {
  await delay();
  cakes.push({
    ...cake,
    orders_count: 0,
    rating: 0,
    id: cake.name.toLowerCase().replace(/ /g, '-')
  });
}

export async function updateCake(id: string, updated: any): Promise<void> {
  await delay();
  cakes = cakes.map(c => c.id === id ? { ...c, ...updated } : c);
}

export async function deleteCake(cakeId: string): Promise<void> {
  await delay();
  cakes = cakes.filter(c => c.id !== cakeId);
}

export async function uploadImage(file: File): Promise<string> {
  await delay(500); // Faster simulated upload
  return `https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600&sig=${Math.random()}`;
}

// --- CUSTOMIZATIONS ---
export async function getCustomizationOptions(): Promise<CustomizationOptions> {
  await delay();
  return {
    flavors: [...flavors],
    sizes: [...sizes],
    colors: [...colors],
    toppings: [...toppings]
  };
}

export async function createCustomizationOption(category: CustomizationCategory, data: any): Promise<void> {
  await delay();
  const newItem = { ...data, id: `m-${Date.now()}` };
  if (category === 'flavors') flavors.push(newItem);
  if (category === 'sizes') sizes.push(newItem);
  if (category === 'colors') colors.push(newItem);
  if (category === 'toppings') toppings.push(newItem);
}

export async function updateCustomizationOption(category: CustomizationCategory, id: string, data: any): Promise<void> {
  await delay();
  const updater = (items: any[]) => items.map(i => i.id === id ? { ...i, ...data } : i);
  if (category === 'flavors') flavors = updater(flavors);
  if (category === 'sizes') sizes = updater(sizes);
  if (category === 'colors') colors = updater(colors);
  if (category === 'toppings') toppings = updater(toppings);
}

export async function deleteCustomizationOption(category: CustomizationCategory, id: string): Promise<void> {
  await delay();
  if (category === 'flavors') flavors = flavors.filter(i => i.id !== id);
  if (category === 'sizes') sizes = sizes.filter(i => i.id !== id);
  if (category === 'colors') colors = colors.filter(i => i.id !== id);
  if (category === 'toppings') toppings = toppings.filter(i => i.id !== id);
}

// --- ORDERS ---
export async function getOrders(): Promise<Order[]> {
  await delay();
  return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  await delay();
  orders = orders.map(o => o.id === orderId ? { ...o, order_status: status as any } : o);
}

export async function deleteOrder(orderId: number): Promise<void> {
  await delay();
  orders = orders.filter(o => o.id !== orderId);
}

// --- USERS ---
export async function getUsers(): Promise<User[]> {
  await delay();
  return [...users];
}

export async function createUser(data: any): Promise<void> {
  await delay();
  users.push({
    ...data,
    id: `u-${Date.now()}`,
    createdAt: new Date().toISOString()
  });
}

export async function deleteUser(id: string): Promise<void> {
  await delay();
  users = users.filter(u => u.id !== id);
}

// --- OFFERS ---
export async function getSpecialOffer(): Promise<SpecialOffer | null> {
  await delay();
  return activeSpecialOffer;
}

export async function updateSpecialOffer(payload: SpecialOfferUpdatePayload): Promise<void> {
  await delay();
  const cake = cakes.find(c => c.id === payload.cake_id);
  if (cake) {
    activeSpecialOffer = {
      cake,
      discount_percentage: payload.discount_percentage,
      original_price: cake.base_price,
      special_price: cake.base_price * (1 - payload.discount_percentage / 100),
      savings: cake.base_price * (payload.discount_percentage / 100)
    };
  }
}

// --- AUTH ---
export async function loginAdmin(credentials: LoginCredentials): Promise<{ token: string }> {
  await delay(500);
  if (credentials.email === 'admin@whiskedelights.com' && credentials.password === 'admin123') {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('isAdminLoggedIn', 'true');
    }
    return { token: 'mock-jwt-token' };
  }
  throw new Error('Invalid credentials');
}