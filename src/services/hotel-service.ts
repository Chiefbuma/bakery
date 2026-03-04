
'use client';

import type { Product, Transaction, HotelModule, DashboardData, SaleItem, Supply, Expense, User, UserRole, SupplyConsumption } from '@/lib/types';

const API_BASE = '/api';

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return res.json();
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

export async function getProducts(module?: HotelModule): Promise<Product[]> {
  const url = module ? `${API_BASE}/products?module=${module}` : `${API_BASE}/products`;
  const res = await fetch(url);
  return res.json();
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return res.json();
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

export async function getSupplies(module?: HotelModule): Promise<Supply[]> {
  const url = module ? `${API_BASE}/supplies?module=${module}` : `${API_BASE}/supplies`;
  const res = await fetch(url);
  return res.json();
}

export async function addSupply(supply: Omit<Supply, 'id'>): Promise<Supply> {
  const res = await fetch(`${API_BASE}/supplies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supply),
  });
  return res.json();
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

export async function getProductRecipes(): Promise<Record<string, SupplyConsumption[]>> {
  const res = await fetch(`${API_BASE}/recipes`);
  return res.json();
}

export async function saveProductRecipe(productId: string, consumptions: SupplyConsumption[]): Promise<void> {
  await fetch(`${API_BASE}/recipes/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consumptions),
  });
}

export async function getExpenses(): Promise<Expense[]> {
  const res = await fetch(`${API_BASE}/expenses`);
  return res.json();
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  return res.json();
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

export async function placeOrder(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/pos/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  return res.json();
}

export async function getPendingOrders(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/pos/pending`);
  return res.json();
}

export async function getDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard`);
  return res.json();
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  return data.url;
}
