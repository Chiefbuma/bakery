/**
 * @fileOverview WhiskeDelights Production Service Layer
 * Hardened for production with resilient JSON parsing and consolidated module resolution.
 */

import type {
  Cake,
  SpecialOffer,
  CustomizationOptions,
  Order,
  LoginCredentials,
  SpecialOfferUpdatePayload,
  CustomizationCategory,
  User,
  OrderPayload,
  OrderQuote,
  PlaceOrderResult,
} from '@/lib/types';

const API_URL = '/api';

function normalizeCake(cake: any): Cake {
  return {
    ...cake,
    base_price: Number(cake?.base_price) || 0,
    rating: Number(cake?.rating) || 0,
    orders_count: Number(cake?.orders_count) || 0,
    customizable: Boolean(cake?.customizable),
  };
}

/**
 * Robust JSON parser that handles empty responses or HTML error pages from the server.
 */
async function safeParseJson(response: Response) {
  try {
    const text = await response.text();
    if (!response.ok) return null;
    if (!text || text.trim().length === 0) return null;
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        return null;
    }
    return JSON.parse(text);
  } catch (e) {
    console.error('[JSON_PARSE_ERROR]', e);
    return null;
  }
}

async function extractErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return fallbackMessage;
    }

    const data = JSON.parse(text);
    if (data?.details?.fieldErrors) {
      const firstFieldError = Object.values(data.details.fieldErrors)
        .flat()
        .find((message): message is string => typeof message === 'string' && message.length > 0);

      if (firstFieldError) {
        return firstFieldError;
      }
    }

    return data?.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

const getAuthHeaders = () => {
  return { 'Content-Type': 'application/json' };
};

const withAuth = (init: RequestInit = {}): RequestInit => ({
  ...init,
  credentials: 'same-origin',
});

export async function getCakes(): Promise<Cake[]> {
  try {
    const res = await fetch(`${API_URL}/cakes`, { cache: 'no-store' });
    const data = await safeParseJson(res);
    return Array.isArray(data) ? data.map(normalizeCake) : [];
  } catch (error) {
    return [];
  }
}

export async function getCakeById(id: string): Promise<Cake | null> {
  try {
    const res = await fetch(`${API_URL}/cakes/${id}`, { cache: 'no-store' });
    const data = await safeParseJson(res);
    return data ? normalizeCake(data) : null;
  } catch (error) {
    return null;
  }
}

export async function createCake(cake: any): Promise<void> {
  const res = await fetch(`${API_URL}/cakes`, {
    method: 'POST',
    ...withAuth(),
    headers: getAuthHeaders(),
    body: JSON.stringify(cake),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to register creation'));
}

export async function updateCake(id: string, cake: any): Promise<void> {
  const res = await fetch(`${API_URL}/cakes/${id}`, {
    method: 'PUT',
    ...withAuth(),
    headers: getAuthHeaders(),
    body: JSON.stringify(cake),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to update masterpiece'));
}

export async function deleteCake(cakeId: string): Promise<void> {
  const res = await fetch(`${API_URL}/cakes/${cakeId}`, {
    method: 'DELETE',
    ...withAuth(),
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove cake');
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/upload`, withAuth({ method: 'POST', body: formData }));
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
    ...withAuth(),
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to add ${category}`);
}

export async function updateCustomizationOption(category: CustomizationCategory, id: string, data: any): Promise<void> {
  const res = await fetch(`${API_URL}/customizations/${category}/${id}`, {
    method: 'PUT',
    ...withAuth(),
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update ${category}`);
}

export async function deleteCustomizationOption(category: CustomizationCategory, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/customizations/${category}/${id}`, {
    method: 'DELETE',
    ...withAuth(),
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to remove ${category}`);
}

export async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_URL}/orders`, withAuth({ headers: getAuthHeaders(), cache: 'no-store' }));
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    ...withAuth(),
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update job status');
}

export async function deleteOrder(orderId: number): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'DELETE',
    ...withAuth(),
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove order');
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_URL}/users`, withAuth({ headers: getAuthHeaders() }));
    const data = await safeParseJson(res);
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function createUser(data: any): Promise<void> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    ...withAuth(),
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Personnel registration failed');
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    ...withAuth(),
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
    ...withAuth(),
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Daily special update failed');
}

export async function loginAdmin(credentials: LoginCredentials): Promise<{ user: User }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await safeParseJson(res);
  return data;
}

export async function placeOrder(payload: OrderPayload): Promise<PlaceOrderResult> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await safeParseJson(res);
  if (!res.ok || !data?.orderNumber) {
    throw new Error(data?.error || 'Order placement failed');
  }

  return {
    orderNumber: data.orderNumber,
    depositAmount: Number(data.depositAmount) || 0,
    totalAmount: Number(data.totalAmount) || 0,
    paymentStatus: data.paymentStatus === 'paid' ? 'paid' : 'pending',
  };
}

export async function quoteOrder(payload: OrderPayload): Promise<OrderQuote> {
  const res = await fetch(`${API_URL}/orders/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Order quote failed'));
  }

  const data = await safeParseJson(res);
  if (
    typeof data?.totalAmount !== 'number' ||
    typeof data?.depositAmount !== 'number' ||
    !Array.isArray(data?.items)
  ) {
    throw new Error('Order quote failed');
  }

  return data;
}

export async function getAdminSession(): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/auth/session`, withAuth({ cache: 'no-store' }));
    const data = await safeParseJson(res);
    return data?.user || null;
  } catch {
    return null;
  }
}

export async function logoutAdmin(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, withAuth({ method: 'POST' }));
}
