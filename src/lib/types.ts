
export type HotelModule = 'restaurant' | 'bar' | 'carwash' | 'accommodation';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  module: HotelModule;
  price: number;
  costPrice: number;
  stock: number;
  minStockLevel: number;
  unit: string;
  image_url: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Transaction {
  id: string;
  orderNumber: string;
  module: HotelModule;
  items: SaleItem[];
  totalAmount: number;
  totalCost: number;
  timestamp: string;
  paymentMethod: 'cash' | 'mpesa' | 'card' | 'none';
  status: 'paid' | 'pending';
  customerName?: string;
  amountReceived?: number;
  balance?: number;
}

export interface ModuleStats {
  module: HotelModule;
  sales: number;
  costs: number;
  profit: number;
  orders: number;
}

export interface DashboardData {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  moduleStats: ModuleStats[];
  recentTransactions: Transaction[];
}
