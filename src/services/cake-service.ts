/**
 * @fileOverview WhiskeDelights Production Service Layer
 * Hardened for production with extremely resilient JSON parsing.
 */

import type { Cake, SpecialOffer, CustomizationOptions, Order, LoginCredentials, SpecialOfferUpdatePayload, CustomizationCategory, User } from '@/lib/types';

// Use relative path to automatically match protocol (HTTP/HTTPS) and domain
const API_URL = '/api';

/**
 * Robust JSON parser that handles empty responses or malformed data.
 * Prevents "Unexpected end of JSON input" crashes.
 */
async function safeParseJson(response: Response) {
  try {
    const text = await response.text();
    
    if (!response.ok) {
      console.warn(`[API_RESPONSE_NOT_OK] ${response.status}: ${text.substring(0, 100)}`);
      return null;
    }

    if (!text || text.trim().length === 0) {
      return null;
    }

    // Check if it's HTML (likely an error page from Passenger/Apache)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.warn('[API_RETURNED_HTML_INSTEAD_OF_JSON]');
      return null;
    }

    return JSON.parse(text);
  } catch (e) {
    console.error('[JSON_PARSE_CRITICAL_FAILURE]', e);
    return null;
  }
}

// Helper to get auth token safely from localStorage
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- CATALOG SERVICES ---

export async function getCakes(): Promise<Cake[]> {
  try {
    const res = await fetch(`${API_URL}/cakes`, { cache: 'no-store' });
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    console.error('[GET_CAKES_SERVICE_ERROR]', error);
    return [];
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

export async function updateCake(id: string, updated: any): Promise<void> {
  const res = await fetch(`${API_URL}/cakes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updated),
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
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await safeParseJson(res);
  if (!data?.url) throw new Error('Image storage failed');
  return data.url;
}

// --- CUSTOMIZATION SERVICES ---

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

// --- ORDER SERVICES ---

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
  if (!res.ok) throw new Error('Failed to clear transaction');
}

// --- USER SERVICES ---

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

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Access revocation failed');
}

// --- OFFER SERVICES ---

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

// --- AUTH SERVICES ---

export async function loginAdmin(credentials: LoginCredentials): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Invalid credentials');
  }

  const data = await safeParseJson(res);
  if (data?.token && typeof window !== 'undefined') {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('isAdminLoggedIn', 'true');
  }
  return data;
}
