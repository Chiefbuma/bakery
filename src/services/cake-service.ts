
'use client';

/**
 * @fileOverview WhiskeDelights Production Service Layer
 * Centralizes all bakery operations via real REST API calls to the Next.js backend.
 */

import type { Cake, SpecialOffer, CustomizationOptions, Order, LoginCredentials, SpecialOfferUpdatePayload, CustomizationCategory, User } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// --- CAKES ---
export async function getCakes(): Promise<Cake[]> {
  const res = await fetch(`${API_URL}/cakes`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch catalog');
  return res.json();
}

export async function createCake(cake: any): Promise<void> {
  const res = await fetch(`${API_URL}/cakes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(cake),
  });
  if (!res.ok) throw new Error('Failed to register creation');
}

export async function updateCake(id: string, updated: any): Promise<void> {
  const res = await fetch(`${API_URL}/cakes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updated),
  });
  if (!res.ok) throw new Error('Failed to update masterpiece');
}

export async function deleteCake(cakeId: string): Promise<void> {
  const res = await fetch(`${API_URL}/cakes/${cakeId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove cake');
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Image storage failed');
  const data = await res.json();
  return data.url;
}

// --- CUSTOMIZATIONS ---
export async function getCustomizationOptions(): Promise<CustomizationOptions> {
  const res = await fetch(`${API_URL}/customizations`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load variants');
  return res.json();
}

export async function createCustomizationOption(category: CustomizationCategory, data: any): Promise<void> {
  const res = await fetch(`${API_URL}/customizations/${category}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to add ${category}`);
}

export async function deleteCustomizationOption(category: CustomizationCategory, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/customizations/${category}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to remove ${category}`);
}

// --- ORDERS ---
export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders`, { headers: getHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to retrieve ledger');
  return res.json();
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update job status');
}

export async function deleteOrder(orderId: number): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to clear transaction');
}

// --- USERS ---
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load personnel');
  return res.json();
}

export async function createUser(data: any): Promise<void> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Personnel registration failed');
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Access revocation failed');
}

// --- OFFERS ---
export async function getSpecialOffer(): Promise<SpecialOffer | null> {
  const res = await fetch(`${API_URL}/special-offer`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch offer');
  return res.json();
}

export async function updateSpecialOffer(payload: SpecialOfferUpdatePayload): Promise<void> {
  const res = await fetch(`${API_URL}/special-offer`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Daily special update failed');
}

// --- AUTH ---
export async function loginAdmin(credentials: LoginCredentials): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('isAdminLoggedIn', 'true');
  }
  return data;
}
