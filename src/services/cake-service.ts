
'use client';

/**
 * @fileOverview WhiskeDelights Production Service Layer
 * Optimized for production with resilient JSON parsing and error handling.
 */

import type { Cake, SpecialOffer, CustomizationOptions, Order, LoginCredentials, SpecialOfferUpdatePayload, CustomizationCategory, User } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/**
 * Safely parses JSON from a fetch response.
 * Prevents 'Unexpected end of JSON input' errors.
 */
async function safeParseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('[JSON_PARSE_ERROR]', text);
    throw new Error('Server returned an invalid response format.');
  }
}

// --- CAKES ---
export async function getCakes(): Promise<Cake[]> {
  try {
    const res = await fetch(`${API_URL}/cakes`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`);
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    console.error('[GET_CAKES_ERROR]', error);
    return []; // Return empty array to prevent mapping errors on undefined
  }
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
  const data = await safeParseJson(res);
  return data?.url || '';
}

// --- CUSTOMIZATIONS ---
export async function getCustomizationOptions(): Promise<CustomizationOptions> {
  try {
    const res = await fetch(`${API_URL}/customizations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load variants');
    const data = await safeParseJson(res);
    return data || { flavors: [], sizes: [], colors: [], toppings: [] };
  } catch (error) {
    console.error('[GET_CUSTOMIZATIONS_ERROR]', error);
    return { flavors: [], sizes: [], colors: [], toppings: [] };
  }
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
  try {
    const res = await fetch(`${API_URL}/orders`, { headers: getHeaders(), cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to retrieve ledger');
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    console.error('[GET_ORDERS_ERROR]', error);
    return [];
  }
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
  try {
    const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load personnel');
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    console.error('[GET_USERS_ERROR]', error);
    return [];
  }
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
  try {
    const res = await fetch(`${API_URL}/special-offer`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch offer');
    return await safeParseJson(res);
  } catch (error) {
    console.error('[GET_SPECIAL_OFFER_ERROR]', error);
    return null;
  }
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
  if (!res.ok) {
    const errorData = await safeParseJson(res);
    throw new Error(errorData?.message || 'Invalid credentials');
  }
  const data = await safeParseJson(res);
  if (typeof window !== 'undefined' && data?.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('isAdminLoggedIn', 'true');
  }
  return data;
}
