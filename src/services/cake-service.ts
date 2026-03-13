'use client';

import type { Cake, SpecialOffer, CustomizationOptions, Order, LoginCredentials, SpecialOfferUpdatePayload, CustomizationCategory } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * @fileOverview WhiskeDelights Service Layer
 * Centralizes all communication with the Bakery API.
 */

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export async function getCakes(): Promise<Cake[]> {
  const res = await fetch(`${API_URL}/cakes`);
  if (!res.ok) throw new Error('Failed to fetch cakes');
  return res.json();
}

export async function getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
}

export async function getSpecialOffer(): Promise<SpecialOffer | null> {
    const res = await fetch(`${API_URL}/special-offer`);
    if (!res.ok) return null;
    return res.json();
}

export async function getCustomizationOptions(): Promise<CustomizationOptions> {
    const res = await fetch(`${API_URL}/customizations`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
}

export async function updateOrderStatus(orderId: number, status: 'processing' | 'complete' | 'cancelled'): Promise<void> {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
}

export async function deleteOrder(orderId: number): Promise<void> {
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to clear record');
}

export async function deleteCake(cakeId: string): Promise<void> {
    const res = await fetch(`${API_URL}/cakes/${cakeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove item');
}

export async function updateSpecialOffer(payload: SpecialOfferUpdatePayload): Promise<void> {
    const res = await fetch(`${API_URL}/special-offer`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update offer');
}

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
    }
    return data;
}

export async function deleteCustomizationOption(category: CustomizationCategory, id: string): Promise<void> {
    const res = await fetch(`${API_URL}/customizations/${category}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete ${category} option`);
}
