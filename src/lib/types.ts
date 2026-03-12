
export interface Cake {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_data_uri?: string | null;
  rating: number;
  category: string;
  orders_count: number;
  ready_time: string;
  defaultFlavorId?: string;
  customizable: boolean;
}

export interface SpecialOffer {
  cake: Cake;
  discount_percentage: number;
  original_price: number;
  special_price: number;
  savings: number;
}

export interface Flavor {
  id: string;
  name: string;
  description?: string;
  price: number;
  color?: string;
}

export interface Size {
  id: string;
  name:string;
  serves: string;
  price: number;
}

export interface Color {
  id: string;
  name: string;
  hex_value: string;
  price: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface CustomizationOptions {
  flavors: Flavor[];
  sizes: Size[];
  colors: Color[];
  toppings: Topping[];
}

export interface Customizations {
  flavor: string | null;
  size: string | null;
  color: string | null;
  toppings: string[];
}

export interface CartItem {
  id: string; // Unique ID for each cart item instance
  name: string;
  quantity: number;
  price: number; // Final price per item, including customizations
  image_data_uri?: string | null;
  cakeId: string;
  customizations?: Customizations;
}

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  delivery_date: string;
  delivery_time: string;
  delivery_method: 'delivery' | 'pickup';
  pickup_location: string;
  special_instructions: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  pickup_location?: string;
  delivery_date?: string;
  total_price: number;
  deposit_amount: number;
  payment_status: 'pending' | 'paid';
  order_status: 'processing' | 'complete' | 'cancelled';
  created_at: string;
  items: CartItem[];
}
