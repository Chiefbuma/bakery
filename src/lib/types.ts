
export type HotelModule = 'restaurant' | 'bar' | 'carwash' | 'accommodation' | 'entertainment' | 'general';

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Only for mock/storage purposes in this prototype
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  module: HotelModule;
  price: number;
  costPrice: number; // Unit cost to produce/provide
  stock: number;
  minStockLevel: number;
  unit: string;
  image_url: string;
}

export interface Supply {
  id: string;
  name: string;
  category: string;
  module: HotelModule;
  quantity: number;
  unit: string;
  unitCost: number;
  lastPurchased: string;
}

export interface Expense {
  id: string;
  category: 'salary' | 'utility' | 'maintenance' | 'rent' | 'miscellaneous' | 'garbage';
  amount: number;
  description: string;
  date: string;
  module: HotelModule;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  costPrice: number; // Captured at time of sale for P&L accuracy
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

export interface ComparisonMetric {
  current: number;
  previous: number;
  changePercent: number;
}

export interface ModuleComparison {
  module: HotelModule;
  currentSales: number;
  previousSales: number;
  changePercent: number;
}

export interface DashboardData {
  summary: {
    revenue: ComparisonMetric;
    cogs: ComparisonMetric;
    operatingCost: ComparisonMetric;
    netProfit: ComparisonMetric;
  };
  moduleStats: ModuleComparison[];
  currentPeriodLabel: string;
  previousPeriodLabel: string;
}
