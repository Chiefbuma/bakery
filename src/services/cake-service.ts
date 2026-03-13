
'use client';

import type { Cake, SpecialOffer, CustomizationOptions, Order, LoginCredentials, SpecialOfferUpdatePayload, CustomizationCategory } from '@/lib/types';

// Initial Mock Data
let CAKES: Cake[] = [
  {
    id: 'chocolate-fudge-delight',
    name: 'Chocolate Fudge Delight',
    description: 'A rich and decadent chocolate fudge cake layered with silky ganache and topped with dark chocolate shards.',
    base_price: 3200.00,
    image_data_uri: 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&q=80&w=1080',
    rating: 4.9,
    category: 'Chocolate',
    orders_count: 150,
    ready_time: '24h',
    defaultFlavorId: 'f2',
    customizable: true
  },
  {
    id: 'red-velvet-delight',
    name: 'Red Velvet Delight',
    description: 'The timeless classic with its signature crimson hue and premium cream cheese frosting.',
    base_price: 2800.00,
    image_data_uri: 'https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5?auto=format&fit=crop&q=80&w=1080',
    rating: 4.8,
    category: 'Classic',
    orders_count: 120,
    ready_time: '24h',
    defaultFlavorId: 'f3',
    customizable: true
  },
  {
    id: 'strawberry-dream',
    name: 'Strawberry Dream',
    description: 'A light and fluffy vanilla sponge cake filled with fresh local strawberries.',
    base_price: 2500.00,
    image_data_uri: 'https://images.unsplash.com/photo-1650419424455-d0513aaf0dd6?auto=format&fit=crop&q=80&w=1080',
    rating: 4.7,
    category: 'Fruit',
    orders_count: 95,
    ready_time: '24h',
    defaultFlavorId: undefined,
    customizable: false
  },
  {
    id: 'custom-cake',
    name: 'Custom Creation',
    description: 'Design your own cake from scratch with our master bakers.',
    base_price: 1200.00,
    image_data_uri: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=1080',
    rating: 0,
    category: 'Custom',
    orders_count: 0,
    ready_time: '48h+',
    defaultFlavorId: undefined,
    customizable: true
  }
];

let CUSTOMIZATIONS: CustomizationOptions = {
  flavors: [
    { id: 'f1', name: 'Classic Vanilla', price: 0.00, description: 'A timeless, aromatic flavor.', color: '#F3E5AB' },
    { id: 'f2', name: 'Rich Chocolate', price: 200.00, description: 'Deep, decadent, and dark.', color: '#5D4037' },
    { id: 'f3', name: 'Red Velvet', price: 250.00, description: 'A Southern classic with a hint of cocoa.', color: '#9B2C2C' }
  ],
  sizes: [
    { id: 's1', name: '6" Cake', serves: '6-8 people', price: 0.00 },
    { id: 's2', name: '8" Cake', serves: '10-12 people', price: 500.00 },
    { id: 's3', name: '10" Cake', serves: '15-20 people', price: 1000.00 }
  ],
  colors: [
    { id: 'c1', name: 'Classic White', hex_value: '#FFFFFF', price: 0.00 },
    { id: 'c2', name: 'Pastel Pink', hex_value: '#FFD1DC', price: 100.00 },
    { id: 'c3', name: 'Sky Blue', hex_value: '#87CEEB', price: 100.00 }
  ],
  toppings: [
    { id: 't1', name: 'Rainbow Sprinkles', price: 50.00 },
    { id: 't2', name: 'Chocolate Drizzle', price: 100.00 },
    { id: 't3', name: 'Fresh Berries', price: 250.00 }
  ]
};

let ORDERS: Order[] = [
  {
    id: 1,
    order_number: 'WD-1234-BK',
    customer_name: 'John Doe',
    customer_phone: '+254 700 111 222',
    delivery_method: 'delivery',
    delivery_address: '123 Garden Estate, Nairobi',
    total_price: 3650,
    deposit_amount: 1825,
    payment_status: 'paid',
    order_status: 'processing',
    created_at: new Date().toISOString(),
    items: []
  }
];

let CURRENT_OFFER_CAKE_ID = 'chocolate-fudge-delight';
let DISCOUNT_PERCENT = 20;

// --- API SIMULATION ---

export async function getCakes(): Promise<Cake[]> {
  return [...CAKES];
}

export async function getSpecialOffer(): Promise<SpecialOffer> {
    const cake = CAKES.find(c => c.id === CURRENT_OFFER_CAKE_ID) || CAKES[0];
    const discount = DISCOUNT_PERCENT;
    const original_price = cake.base_price;
    const special_price = original_price * (1 - discount / 100);
    return {
        cake,
        discount_percentage: discount,
        original_price,
        special_price,
        savings: original_price - special_price
    };
}

export async function getCustomizationOptions(): Promise<CustomizationOptions> {
    return { ...CUSTOMIZATIONS };
}

export async function getOrders(): Promise<Order[]> {
    return [...ORDERS].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// --- Mutations (RUD) ---

export async function updateOrderStatus(orderId: number, status: 'processing' | 'complete' | 'cancelled'): Promise<Order> {
    const orderIndex = ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');
    ORDERS[orderIndex].order_status = status;
    return ORDERS[orderIndex];
}

export async function deleteOrder(orderId: number): Promise<void> {
    ORDERS = ORDERS.filter(o => o.id !== orderId);
}

export async function updateCake(cakeId: string, updates: Partial<Cake>): Promise<Cake> {
    const index = CAKES.findIndex(c => c.id === cakeId);
    if (index === -1) throw new Error('Cake not found');
    CAKES[index] = { ...CAKES[index], ...updates };
    return CAKES[index];
}

export async function deleteCake(cakeId: string): Promise<void> {
    CAKES = CAKES.filter(c => c.id !== cakeId);
}

export async function updateCustomizationOption(category: CustomizationCategory, id: string, updates: any): Promise<void> {
    const list = CUSTOMIZATIONS[category] as any[];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
        list[index] = { ...list[index], ...updates };
    }
}

export async function deleteCustomizationOption(category: CustomizationCategory, id: string): Promise<void> {
    (CUSTOMIZATIONS[category] as any[]) = (CUSTOMIZATIONS[category] as any[]).filter(item => item.id !== id);
}

export async function updateSpecialOffer(payload: SpecialOfferUpdatePayload): Promise<void> {
    CURRENT_OFFER_CAKE_ID = payload.cake_id;
    DISCOUNT_PERCENT = payload.discount_percentage;
}

export async function loginAdmin(credentials: LoginCredentials): Promise<{ token: string }> {
    // Mock simple auth
    if (credentials.email === 'admin@whiskedelights.com' && credentials.password === 'admin123') {
        return { token: 'mock_token_xyz' };
    }
    throw new Error('Invalid credentials');
}
