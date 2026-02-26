
import type { Product, Transaction, HotelModule, DashboardData, SaleItem, Supply, Expense } from '@/lib/types';

// Sellable Products
let products: Product[] = [
  { id: 'r1', name: 'Nyama Choma (1kg)', description: 'Grilled goat meat', category: 'Food', module: 'restaurant', price: 1200, costPrice: 700, stock: 50, minStockLevel: 10, unit: 'kg', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80' },
  { id: 'b1', name: 'Tusker Lager', description: 'Kenyan beer', category: 'Beer', module: 'bar', price: 350, costPrice: 220, stock: 240, minStockLevel: 48, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800&q=80' },
  { id: 'a1', name: 'Deluxe Room', description: 'Ensuite King', category: 'Rooms', module: 'accommodation', price: 5500, costPrice: 1200, stock: 10, minStockLevel: 2, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' },
  { id: 'e1', name: 'MC Service (Event)', description: 'Professional MC for events', category: 'Entertainment', module: 'entertainment', price: 15000, costPrice: 2000, stock: 1, minStockLevel: 0, unit: 'event', image_url: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&q=80' },
  { id: 'e2', name: 'PA System Rental', description: 'Full audio system with speakers', category: 'Sound', module: 'entertainment', price: 8000, costPrice: 1000, stock: 5, minStockLevel: 1, unit: 'set', image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80' },
];

// Raw Supplies
let supplies: Supply[] = [
  { id: 's1', name: 'Charcoal (Bags)', category: 'Energy', module: 'restaurant', quantity: 20, unit: 'bags', unitCost: 1500, lastPurchased: new Date().toISOString() },
  { id: 's2', name: 'Car Shampoo', category: 'Cleaning', module: 'carwash', quantity: 15, unit: 'liters', unitCost: 400, lastPurchased: new Date().toISOString() },
  { id: 's3', name: 'Bed Linens (Sets)', category: 'Linen', module: 'accommodation', quantity: 40, unit: 'sets', unitCost: 2000, lastPurchased: new Date().toISOString() },
];

// Operational Expenses
let expenses: Expense[] = [
  { id: 'ex1', category: 'utility', amount: 15000, description: 'Monthly Electricity Bill', date: new Date().toISOString(), module: 'general' },
  { id: 'ex2', category: 'salary', amount: 45000, description: 'Chef Salaries', date: new Date().toISOString(), module: 'restaurant' },
  { id: 'ex3', category: 'garbage', amount: 2000, description: 'Waste collection', date: new Date().toISOString(), module: 'general' },
];

let transactions: Transaction[] = [];

export async function getProducts(module?: HotelModule): Promise<Product[]> {
  return module ? products.filter(p => p.module === module) : products;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const newProduct = { ...product, id: `PROD-${Date.now()}` };
  products.push(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  products = products.map(p => p.id === id ? { ...p, ...updates } : p);
}

export async function getSupplies(module?: HotelModule): Promise<Supply[]> {
  return module ? supplies.filter(s => s.module === module) : supplies;
}

export async function addSupply(supply: Omit<Supply, 'id'>): Promise<Supply> {
  const newSupply = { ...supply, id: `SUP-${Date.now()}` };
  supplies.push(newSupply);
  return newSupply;
}

export async function getExpenses(): Promise<Expense[]> {
  return expenses;
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const newExpense = { ...expense, id: `EXP-${Date.now()}` };
  expenses.push(newExpense);
  return newExpense;
}

export async function placeOrder(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
  const newTransaction: Transaction = {
    ...transaction,
    id: `TX-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  
  if (newTransaction.status === 'paid') {
    newTransaction.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p && p.module !== 'carwash' && p.module !== 'entertainment') p.stock -= item.quantity;
    });
  }
  
  transactions.unshift(newTransaction);
  return newTransaction;
}

export async function getPendingOrders(): Promise<Transaction[]> {
  return transactions.filter(t => t.status === 'pending');
}

export async function getDashboardData(): Promise<DashboardData> {
  const paidTx = transactions.filter(t => t.status === 'paid');
  const totalRevenue = paidTx.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCOGS = paidTx.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const modules: HotelModule[] = ['restaurant', 'bar', 'carwash', 'accommodation', 'entertainment'];
  const moduleStats = modules.map(m => {
    const moduleTx = paidTx.filter(t => m === t.module);
    const modRevenue = moduleTx.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const modCOGS = moduleTx.reduce((acc, curr) => acc + curr.totalCost, 0);
    const modEx = expenses.filter(e => e.module === m).reduce((acc, curr) => acc + curr.amount, 0);
    return {
      module: m,
      sales: modRevenue,
      costs: modCOGS + modEx,
      profit: modRevenue - (modCOGS + modEx),
      orders: moduleTx.length
    };
  });

  return {
    totalRevenue,
    totalCOGS,
    totalExpenses,
    netProfit: totalRevenue - (totalCOGS + totalExpenses),
    moduleStats,
    recentTransactions: paidTx.slice(0, 10)
  };
}
