'use client';

import type { Product, Transaction, HotelModule, DashboardData, SaleItem, Supply, Expense, User, UserRole, SupplyConsumption } from '@/lib/types';

const API_BASE = '/api';

/**
 * Robust JSON parsing for shared hosting environments.
 * Prevents "Unexpected end of JSON input" errors if API returns empty or HTML.
 */
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error('JSON Parse Error:', e, 'Raw Body:', text);
    return null;
  }
}

function ensureArray<T>(data: any): T[] {
  return Array.isArray(data) ? data : [];
}

const castProduct = (p: any): Product => ({
  ...p,
  price: Number(p.price || 0),
  costPrice: Number(p.costPrice || 0),
  stock: Number(p.stock || 0),
  minStockLevel: Number(p.minStockLevel || 0),
  hasRecipe: p.hasRecipe === 1 || p.hasRecipe === true
});

const castSupply = (s: any): Supply => ({
  ...s,
  quantity: Number(s.quantity || 0),
  unitCost: Number(s.unitCost || 0)
});

const castExpense = (e: any): Expense => ({
  ...e,
  amount: Number(e.amount || 0)
});

// USER MANAGEMENT
export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) return [];
    const data = await safeJson(res);
    return ensureArray(data);
  } catch (e) {
    return [];
  }
}

export async function addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return safeJson(res);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
}

// INVENTORY - PRODUCTS
export async function getProducts(module?: HotelModule): Promise<Product[]> {
  try {
    const url = module && module !== 'all' ? `${API_BASE}/products?module=${module}` : `${API_BASE}/products`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await safeJson(res);
    return ensureArray(data).map(castProduct);
  } catch (e) {
    return [];
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return safeJson(res);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteProducts(ids: string[]): Promise<void> {
  for (const id of ids) {
    await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  }
}

// INVENTORY - SUPPLIES
export async function getSupplies(module?: HotelModule): Promise<Supply[]> {
  try {
    const url = module && module !== 'all' ? `${API_BASE}/supplies?module=${module}` : `${API_BASE}/supplies`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await safeJson(res);
    return ensureArray(data).map(castSupply);
  } catch (e) {
    return [];
  }
}

export async function addSupply(supply: Omit<Supply, 'id'>): Promise<Supply> {
  const res = await fetch(`${API_BASE}/supplies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supply),
  });
  return safeJson(res);
}

export async function updateSupply(id: string, updates: Partial<Supply>): Promise<void> {
  await fetch(`${API_BASE}/supplies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteSupplies(ids: string[]): Promise<void> {
  for (const id of ids) {
    await fetch(`${API_BASE}/supplies/${id}`, { method: 'DELETE' });
  }
}

// RECIPE MANAGEMENT
export async function getProductRecipes(): Promise<Record<string, SupplyConsumption[]>> {
  try {
    const res = await fetch(`${API_BASE}/recipes`, { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await safeJson(res);
    const recipes: Record<string, SupplyConsumption[]> = {};
    if (Array.isArray(data)) {
      data.forEach((r: any) => {
        if (!recipes[r.productId]) recipes[r.productId] = [];
        recipes[r.productId].push({ supplyId: r.supplyId, amount: parseFloat(r.amount) });
      });
    }
    return recipes;
  } catch (e) {
    return {};
  }
}

export async function saveProductRecipe(productId: string, consumptions: SupplyConsumption[]): Promise<void> {
  await fetch(`${API_BASE}/recipes/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consumptions),
  });
}

// EXPENSES
export async function getExpenses(): Promise<Expense[]> {
  try {
    const res = await fetch(`${API_BASE}/expenses`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await safeJson(res);
    return ensureArray(data).map(castExpense);
  } catch (e) {
    return [];
  }
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  return safeJson(res);
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
  await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteExpenses(ids: string[]): Promise<void> {
  for (const id of ids) {
    await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
  }
}

// POS OPERATIONS
export async function placeOrder(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/pos/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error || 'Transaction failed');
  }
  return safeJson(res);
}

export async function getPendingOrders(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${API_BASE}/pos/pending`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await safeJson(res);
    return ensureArray(data);
  } catch (e) {
    return [];
  }
}

// DASHBOARD
export async function getDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load dashboard data');
  const data = await safeJson(res);
  if (!data) throw new Error('Empty response from analytics engine');
  return data;
}

// UTILS
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await safeJson(res);
  if (data?.error) throw new Error(data.error);
  return data?.url || '';
}
