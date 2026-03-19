/**
 * @fileOverview WhiskeDelights Production Service Layer
 * Hardened for production with resilient JSON parsing and individual recipe fetching.
 */

import type { Cake, SpecialOffer, CustomizationOptions, Order, LoginCredentials, SpecialOfferUpdatePayload, CustomizationCategory, User } from '@/lib/types';

const API_URL = '/api';

/**
 * Robust JSON parser that handles empty responses or HTML error pages from the server.
 * Prevents "Unexpected end of JSON input" crashes.
 */
async function safeParseJson(response: Response) {
  try {
    const text = await response.text();
    if (!response.ok) return null;
    if (!text || text.trim().length === 0) return null;
    // If server returns an HTML error page instead of JSON
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        return null;
    }
    return JSON.parse(text);
  } catch (e) {
    console.error('[JSON_PARSE_ERROR]', e);
    return null;
  }
}

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export async function getCakes(): Promise<Cake[]> {
  try {
    const res = await fetch(`${API_URL}/cakes`, { cache: 'no-store' });
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getCakeById(id: string): Promise<Cake | null> {
  try {
    const res = await fetch(`${API_URL}/cakes/${id}`, { cache: 'no-store' });
    return await safeParseJson(res);
  } catch (error) {
    return null;
  }
}

export async function createCake(cake: any): Promise<void> {
  const res = await fetch(`${API_URL}/cakes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cake),
  });
  if (!res.ok) throw new Error('Failed to register creation');
}

export async function updateCake(id: string, cake: any): Promise<void> {
  const res = await fetch(`${API_URL}/cakes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cake),
  });
  if (!res.ok) throw new Error('Failed to update masterpiece');
}

export async function deleteCake(cakeId: string): Promise<void> {
  const res = await fetch(`${API_URL}/cakes/${cakeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove cake');
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
  const data = await safeParseJson(res);
  if (!data?.url) throw new Error('Image storage failed');
  return data.url;
}

export async function getCustomizationOptions(): Promise<CustomizationOptions> {
  try {
    const res = await fetch(`${API_URL}/customizations`, { cache: 'no-store' });
    const data = await safeParseJson(res);
    return data || { flavors: [], sizes: [], colors: [], toppings: [] };
  } catch (error) {
    return { flavors: [], sizes: [], colors: [], toppings: [] };
  }
}

export async function createCustomizationOption(category: CustomizationCategory, data: any): Promise<void> {
  const res = await fetch(`${API_URL}/customizations/${category}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to add ${category}`);
}

export async function updateCustomizationOption(category: CustomizationCategory, id: string, data: any): Promise<void> {
  const res = await fetch(`${API_URL}/customizations/${category}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update ${category}`);
}

export async function deleteCustomizationOption(category: CustomizationCategory, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/customizations/${category}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to remove ${category}`);
}

export async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders(), cache: 'no-store' });
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update job status');
}

export async function deleteOrder(orderId: number): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove order');
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_URL}/users`, { headers: getAuthHeaders() });
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function createUser(data: any): Promise<void> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Personnel registration failed');
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to revoke access');
}

export async function getSpecialOffer(): Promise<SpecialOffer | null> {
  try {
    const res = await fetch(`${API_URL}/special-offer`, { cache: 'no-store' });
    return await safeParseJson(res);
  } catch (error) {
    return null;
  }
}

export async function updateSpecialOffer(payload: SpecialOfferUpdatePayload): Promise<void> {
  const res = await fetch(`${API_URL}/special-offer`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Daily special update failed');
}

export async function loginAdmin(credentials: LoginCredentials): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await safeParseJson(res);
  if (data?.token && typeof window !== 'undefined') {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('isAdminLoggedIn', 'true');
  }
  return data;
}
