import { Cake, Flavor, Size, Color, Topping, SpecialOffer, CustomizationOptions, Order, User } from './types';

export const MOCK_CAKES: Cake[] = [
  {
    id: 'chocolate-fudge-delight',
    name: 'Chocolate Fudge Delight',
    description: 'A rich and decadent chocolate fudge cake layered with silky ganache.',
    base_price: 3200.00,
    image_data_uri: 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&q=80&w=600',
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
    description: 'The timeless classic with signature cream cheese frosting.',
    base_price: 2800.00,
    image_data_uri: 'https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5?auto=format&fit=crop&q=80&w=600',
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
    description: 'A light and fluffy vanilla sponge cake with fresh strawberries.',
    base_price: 2500.00,
    image_data_uri: 'https://images.unsplash.com/photo-1650419424455-d0513aaf0dd6?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    category: 'Fruit',
    orders_count: 95,
    ready_time: '24h',
    defaultFlavorId: undefined,
    customizable: false
  },
  {
    id: 'lemon-zest-creation',
    name: 'Lemon Zest Creation',
    description: 'A zesty and refreshing lemon cake with tangy curd filling.',
    base_price: 2600.00,
    image_data_uri: 'https://images.unsplash.com/photo-1691242720316-7bea97eb655f?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    category: 'Fruit',
    orders_count: 80,
    ready_time: '24h',
    defaultFlavorId: undefined,
    customizable: false
  },
  {
    id: 'vanilla-bean-classic',
    name: 'Vanilla Bean Classic',
    description: 'Elegant cake infused with Madagascar vanilla bean.',
    base_price: 2400.00,
    image_data_uri: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    category: 'Classic',
    orders_count: 110,
    ready_time: '24h',
    defaultFlavorId: 'f1',
    customizable: true
  },
  {
    id: 'matcha-elegance',
    name: 'Matcha Elegance',
    description: 'Refined Japanese matcha sponge with white chocolate mousse.',
    base_price: 3500.00,
    image_data_uri: 'https://images.unsplash.com/photo-1567945520067-d37a381fd5e5?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    category: 'Specialty',
    orders_count: 45,
    ready_time: '48h',
    customizable: true
  }
];

export const MOCK_FLAVORS: Flavor[] = [
  { id: 'f1', name: 'Classic Vanilla', price: 0.00, description: 'Timeless aromatic vanilla.', color: '#F3E5AB' },
  { id: 'f2', name: 'Rich Chocolate', price: 200.00, description: 'Deep decadent cocoa.', color: '#5D4037' },
  { id: 'f3', name: 'Red Velvet', price: 250.00, description: 'Signature Southern classic.', color: '#9B2C2C' },
  { id: 'f4', name: 'Zesty Lemon', price: 150.00, description: 'Bright refreshing citrus.', color: '#FBC02D' },
  { id: 'f5', name: 'Salted Caramel', price: 300.00, description: 'Sweet and salty luxury.', color: '#C68E17' }
];

export const MOCK_SIZES: Size[] = [
  { id: 's1', name: '6" Cake', serves: '6-8 people', price: 0.00 },
  { id: 's2', name: '8" Cake', serves: '10-12 people', price: 500.00 },
  { id: 's3', name: '10" Cake', serves: '15-20 people', price: 1000.00 }
];

export const MOCK_COLORS: Color[] = [
  { id: 'c1', name: 'Classic White', hex_value: '#FFFFFF', price: 0.00 },
  { id: 'c2', name: 'Pastel Pink', hex_value: '#FFD1DC', price: 100.00 },
  { id: 'c3', name: 'Sky Blue', hex_value: '#87CEEB', price: 100.00 },
  { id: 'c4', name: 'Vibrant Red', hex_value: '#FF0000', price: 150.00 },
  { id: 'c5', name: 'Forest Green', hex_value: '#22543D', price: 150.00 }
];

export const MOCK_TOPPINGS: Topping[] = [
  { id: 't1', name: 'Rainbow Sprinkles', price: 50.00 },
  { id: 't2', name: 'Chocolate Drizzle', price: 100.00 },
  { id: 't3', name: 'Fresh Berries', price: 250.00 },
  { id: 't4', name: 'Edible Gold Leaf', price: 500.00 },
  { id: 't5', name: 'Macarons', price: 350.00 }
];

export const CAKES = MOCK_CAKES;
export const CUSTOMIZATION_OPTIONS: CustomizationOptions = {
  flavors: MOCK_FLAVORS,
  sizes: MOCK_SIZES,
  colors: MOCK_COLORS,
  toppings: MOCK_TOPPINGS
};
export const SPECIAL_OFFER: SpecialOffer = {
  cake: CAKES[0],
  discount_percentage: 20,
  original_price: CAKES[0].base_price,
  special_price: CAKES[0].base_price * 0.8,
  savings: CAKES[0].base_price * 0.2
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    order_number: 'WD-8291-BK',
    customer_name: 'Alice Johnson',
    customer_phone: '0712345678',
    delivery_method: 'delivery',
    total_price: 3850.00,
    deposit_amount: 1925.00,
    payment_status: 'paid',
    order_status: 'processing',
    created_at: new Date().toISOString(),
    items: []
  },
  {
    id: 2,
    order_number: 'WD-1244-BK',
    customer_name: 'Bob Smith',
    customer_phone: '0722334455',
    delivery_method: 'pickup',
    total_price: 2400.00,
    deposit_amount: 1200.00,
    payment_status: 'pending',
    order_status: 'processing',
    created_at: new Date().toISOString(),
    items: []
  }
];

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Master Baker', email: 'admin@whiskedelights.com', role: 'admin', createdAt: new Date().toISOString() },
  { id: '2', name: 'Sarah Frost', email: 'sarah@whiskedelights.com', role: 'staff', createdAt: new Date().toISOString() }
];