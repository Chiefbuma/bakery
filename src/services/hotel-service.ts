
import type { Product, Transaction, HotelModule, DashboardData, SaleItem } from '@/lib/types';

// Initial Mock Data with colorful images
let products: Product[] = [
  // Restaurant
  { id: 'r1', name: 'Nyama Choma (1kg)', description: 'Traditional grilled goat meat', category: 'Main Course', module: 'restaurant', price: 1200, costPrice: 700, stock: 50, minStockLevel: 10, unit: 'kg', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80' },
  { id: 'r2', name: 'Ugali Sukuma', description: 'Traditional corn meal with kale', category: 'Main Course', module: 'restaurant', price: 300, costPrice: 100, stock: 100, minStockLevel: 20, unit: 'plates', image_url: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80' },
  { id: 'r3', name: 'Grilled Tilapia', description: 'Fresh lake fish with traditional herbs', category: 'Main Course', module: 'restaurant', price: 1500, costPrice: 600, stock: 30, minStockLevel: 5, unit: 'fish', image_url: 'https://images.unsplash.com/photo-1597692493850-d26e84a4f443?w=800&q=80' },
  
  // Bar
  { id: 'b1', name: 'Tusker Lager', description: 'Classic Kenyan beer', category: 'Beer', module: 'bar', price: 350, costPrice: 220, stock: 240, minStockLevel: 48, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800&q=80' },
  { id: 'b2', name: 'Jameson Whiskey', description: 'Smooth Irish whiskey', category: 'Spirits', module: 'bar', price: 4500, costPrice: 3200, stock: 12, minStockLevel: 5, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1527281473222-793879bbba37?w=800&q=80' },
  
  // Car Wash
  { id: 'c1', name: 'Full Wash - Saloon', description: 'Exterior, interior and engine', category: 'Wash', module: 'carwash', price: 1000, costPrice: 150, stock: 1000, minStockLevel: 0, unit: 'services', image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80' },
  { id: 'c2', name: 'Body Wash Only', description: 'Quick exterior wash', category: 'Wash', module: 'carwash', price: 500, costPrice: 50, stock: 1000, minStockLevel: 0, unit: 'services', image_url: 'https://images.unsplash.com/photo-1605164599901-f89016353276?w=800&q=80' },
  
  // Accommodation
  { id: 'a1', name: 'Deluxe Room', description: 'Ensuite with king size bed', category: 'Rooms', module: 'accommodation', price: 5500, costPrice: 1200, stock: 10, minStockLevel: 2, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' },
  { id: 'a2', name: 'Standard Room', description: 'Cozy ensuite room', category: 'Rooms', module: 'accommodation', price: 3500, costPrice: 800, stock: 15, minStockLevel: 2, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80' },
];

let transactions: Transaction[] = [];

// Helper to update inventory
const updateInventory = (items: SaleItem[]) => {
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product && product.module !== 'carwash') {
      product.stock -= item.quantity;
    }
  });
};

export async function getProducts(module?: HotelModule): Promise<Product[]> {
  return module ? products.filter(p => p.module === module) : products;
}

export async function placeOrder(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
  const newTransaction: Transaction = {
    ...transaction,
    id: `TX-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  
  if (newTransaction.status === 'paid') {
    updateInventory(newTransaction.items);
  }
  
  transactions.unshift(newTransaction);
  return newTransaction;
}

export async function getPendingOrders(): Promise<Transaction[]> {
  return transactions.filter(t => t.status === 'pending');
}

export async function completePayment(transactionId: string, method: 'cash' | 'mpesa', amountReceived: number): Promise<Transaction> {
  const tx = transactions.find(t => t.id === transactionId);
  if (!tx) throw new Error('Transaction not found');
  
  tx.status = 'paid';
  tx.paymentMethod = method;
  tx.amountReceived = amountReceived;
  tx.balance = amountReceived - tx.totalAmount;
  
  updateInventory(tx.items);
  return tx;
}

export async function getDashboardData(): Promise<DashboardData> {
  const paidTx = transactions.filter(t => t.status === 'paid');
  const totalRevenue = paidTx.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCosts = paidTx.reduce((acc, curr) => acc + curr.totalCost, 0);
  
  const modules: HotelModule[] = ['restaurant', 'bar', 'carwash', 'accommodation'];
  const moduleStats = modules.map(m => {
    const moduleTx = paidTx.filter(t => m === t.module);
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
    recentTransactions: paidTx.slice(0, 10)
  };
}
