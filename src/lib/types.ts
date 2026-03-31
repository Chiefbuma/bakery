
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

export type CustomizationCategory = 'flavors' | 'sizes' | 'colors' | 'toppings';

export interface Customizations {
  flavor: string | null;
  size: string | null;
  color: string | null;
  toppings: string[];
}

export interface CustomizationSelectionIds {
  flavorId: string | null;
  sizeId: string | null;
  colorId: string | null;
  toppingIds: string[];
}

export interface DeliveryInfo {
  name: string;
  phone: string;
  delivery_method: 'delivery' | 'pickup';
  address?: string;
  date: string;
  pickup_location?: string;
  special_instructions?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  image_data_uri?: string | null;
  cakeId: string;
  customizations?: Customizations;
  customizationSelectionIds?: CustomizationSelectionIds;
}

export interface OrderPayload {
  items: CartItem[];
  deliveryInfo: DeliveryInfo;
  paymentMethod?: 'paystack' | 'mpesa_paybill';
  paymentConfirmed?: boolean;
  paymentReference?: string | null;
}

export interface PlaceOrderResult {
  orderNumber: string;
  depositAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
}

export interface CheckoutSessionData {
  items: CartItem[];
  deliveryInfo: DeliveryInfo;
  estimatedTotal?: number;
}

export interface ResolvedCustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface ResolvedCustomizations {
  flavor: ResolvedCustomizationOption | null;
  size: ResolvedCustomizationOption | null;
  color: ResolvedCustomizationOption | null;
  toppings: ResolvedCustomizationOption[];
}

export interface OrderQuoteItem {
  cakeId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  customizations: ResolvedCustomizations | null;
}

export interface OrderQuote {
  items: OrderQuoteItem[];
  totalAmount: number;
  depositAmount: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  latitude?: number | null;
  longitude?: number | null;
  pickup_location?: string;
  delivery_date?: string;
  total_price: number;
  deposit_amount: number;
  payment_status: 'pending' | 'paid';
  order_status: 'processing' | 'complete' | 'cancelled';
  created_at: string;
  items: CartItem[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SpecialOfferUpdatePayload {
    cake_id: string;
    discount_percentage: number;
}

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
