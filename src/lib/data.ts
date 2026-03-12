
import { Cake, Flavor, Size, Color, Topping, SpecialOffer, CustomizationOptions } from './types';

export const CAKES: Cake[] = [
  {
    id: 'chocolate-fudge-delight',
    name: 'Chocolate Fudge Delight',
    description: 'A rich and decadent chocolate fudge cake layered with silky ganache and topped with dark chocolate shards. Perfect for true chocolate lovers.',
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
    description: 'The timeless classic with its signature crimson hue and delicate cocoa undertones, finished with our premium cream cheese frosting.',
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
    description: 'A light and fluffy vanilla sponge cake filled with fresh local strawberries and light whipped cream. A seasonal favorite.',
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
    id: 'lemon-zest-creation',
    name: 'Lemon Zest Creation',
    description: 'A zesty and refreshing lemon cake made with fresh lemon juice and zest, finished with a tangy lemon curd filling.',
    base_price: 2600.00,
    image_data_uri: 'https://images.unsplash.com/photo-1691242720316-7bea97eb655f?auto=format&fit=crop&q=80&w=1080',
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
    description: 'A simple yet elegant cake infused with Madagascar vanilla bean, paired with a smooth vanilla buttercream.',
    base_price: 2400.00,
    image_data_uri: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=1080',
    rating: 4.5,
    category: 'Classic',
    orders_count: 110,
    ready_time: '24h',
    defaultFlavorId: 'f1',
    customizable: true
  }
];

export const FLAVORS: Flavor[] = [
  { id: 'f1', name: 'Classic Vanilla', price: 0.00, description: 'A timeless, aromatic flavor.', color: '#F3E5AB' },
  { id: 'f2', name: 'Rich Chocolate', price: 200.00, description: 'Deep, decadent, and dark.', color: '#5D4037' },
  { id: 'f3', name: 'Red Velvet', price: 250.00, description: 'A Southern classic with a hint of cocoa.', color: '#9B2C2C' },
  { id: 'f4', name: 'Zesty Lemon', price: 150.00, description: 'Bright, citrusy, and refreshing.', color: '#FBC02D' }
];

export const SIZES: Size[] = [
  { id: 's1', name: '6" Cake', serves: '6-8 people', price: 0.00 },
  { id: 's2', name: '8" Cake', serves: '10-12 people', price: 500.00 },
  { id: 's3', name: '10" Cake', serves: '15-20 people', price: 1000.00 }
];

export const COLORS: Color[] = [
  { id: 'c1', name: 'Classic White', hex_value: '#FFFFFF', price: 0.00 },
  { id: 'c2', name: 'Pastel Pink', hex_value: '#FFD1DC', price: 100.00 },
  { id: 'c3', name: 'Sky Blue', hex_value: '#87CEEB', price: 100.00 },
  { id: 'c4', name: 'Vibrant Red', hex_value: '#FF0000', price: 150.00 }
];

export const TOPPINGS: Topping[] = [
  { id: 't1', name: 'Rainbow Sprinkles', price: 50.00 },
  { id: 't2', name: 'Chocolate Drizzle', price: 100.00 },
  { id: 't3', name: 'Fresh Berries', price: 250.00 },
  { id: 't4', name: 'Edible Flowers', price: 300.00 }
];

export const SPECIAL_OFFER: SpecialOffer = {
  cake: CAKES[0],
  discount_percentage: 20,
  original_price: 3200.00,
  special_price: 2560.00,
  savings: 640.00
};

export const CUSTOMIZATION_OPTIONS: CustomizationOptions = {
  flavors: FLAVORS,
  sizes: SIZES,
  colors: COLORS,
  toppings: TOPPINGS
};
