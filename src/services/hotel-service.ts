
import type { Product, Transaction, HotelModule, DashboardData, SaleItem } from '@/lib/types';

// Initial Mock Data
let products: Product[] = [
  // Restaurant
  { id: 'r1', name: 'Nyama Choma (1kg)', description: 'Traditional grilled goat meat', category: 'Main Course', module: 'restaurant', price: 1200, costPrice: 700, stock: 50, minStockLevel: 10, unit: 'kg' },
  { id: 'r2', name: 'Ugali Sukuma', description: 'Traditional corn meal with kale', category: 'Main Course', module: 'restaurant', price: 300, costPrice: 100, stock: 100, minStockLevel: 20, unit: 'plates' },
  // Bar
  { id: 'b1', name: 'Tusker Lager', description: 'Classic Kenyan beer', category: 'Beer', module: 'bar', price: 350, costPrice: 220, stock: 240, minStockLevel: 48, unit: 'bottles' },
  { id: 'b2', name: 'Jameson Whiskey', description: 'Smooth Irish whiskey', category: 'Spirits', module: 'bar', price: 4500, costPrice: 3200, stock: 12, minStockLevel: 5, unit: 'bottles' },
  // Car Wash
  { id: 'c1', name: 'Full Wash - Saloon', description: 'Exterior, interior and engine', category: 'Wash', module: 'carwash', price: 1000, costPrice: 150, stock: 1000, minStockLevel: 0, unit: 'services' },
  { id: 'c2', name: 'Body Wash Only', description: 'Quick exterior wash', category: 'Wash', module: 'carwash', price: 500, costPrice: 50, stock: 1000, minStockLevel: 0, unit: 'services' },
  // Accommodation
  { id: 'a1', name: 'Deluxe Room', description: 'Ensuite with king size bed', category: 'Rooms', module: 'accommodation', price: 5500, costPrice: 1200, stock: 10, minStockLevel: 2, unit: 'nights' },
  { id: 'a2', name: 'Standard Room', description: 'Cozy ensuite room', category: 'Rooms', module: 'accommodation', price: 3500, costPrice: 800, stock: 15, minStockLevel: 2, unit: 'nights' },
];

let transactions: Transaction[] = [];

// Helper to update inventory
const updateInventory = (items: SaleItem[]) => {
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product && product.module !== 'carwash') { // Services like carwash don't have finite stock usually
      product.stock -= item.quantity;
    }
  });
};

export async function getProducts(module?: HotelModule): Promise<Product[]> {
  return module ? products.filter(p => p.module === module) : products;
}

export async function addProduct(product: Product): Promise<Product> {
  products.push(product);
  return product;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  products[index] = { ...products[index], ...data };
  return products[index];
}

export async function placeOrder(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
  const newTransaction: Transaction = {
    ...transaction,
    id: `TX-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  
  updateInventory(newTransaction.items);
  transactions.unshift(newTransaction);
  return newTransaction;
}

export async function getDashboardData(): Promise<DashboardData> {
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCosts = transactions.reduce((acc, curr) => acc + curr.totalCost, 0);
  
  const modules: HotelModule[] = ['restaurant', 'bar', 'carwash', 'accommodation'];
  const moduleStats = modules.map(m => {
    const moduleTx = transactions.filter(t => m === t.module);
    const sales = moduleTx.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const costs = moduleTx.reduce((acc, curr) => acc + curr.totalCost, 0);
    return {
      module: m,
      sales,
      costs,
      profit: sales - costs,
      orders: moduleTx.length
    };
  });

  return {
    totalRevenue,
    totalCosts,
    totalProfit: totalRevenue - totalCosts,
    moduleStats,
    recentTransactions: transactions.slice(0, 10)
  };
}
