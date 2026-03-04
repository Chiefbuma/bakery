
'use client';

import type { Product, Transaction, HotelModule, DashboardData, SaleItem, Supply, Expense, User, UserRole } from '@/lib/types';
import { startOfMonth, subMonths, format, isWithinInterval } from 'date-fns';

// Mock Users
let users: User[] = [
  { id: 'u1', name: 'Executive Admin', email: 'admin@wamaghach.com', role: 'admin', password: 'admin123', createdAt: new Date().toISOString() },
  { id: 'u2', name: 'POS Staff One', email: 'staff@wamaghach.com', role: 'staff', password: 'staff123', createdAt: new Date().toISOString() },
];

// Expanded Product List
let products: Product[] = [
  // Restaurant
  { id: 'r1', name: 'Nyama Choma (1kg)', description: 'Prime goat meat grilled to perfection over charcoal.', category: 'Food', module: 'restaurant', price: 1200, costPrice: 700, stock: 50, minStockLevel: 10, unit: 'kg', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80' },
  { id: 'r2', name: 'Swahili Pilau', description: 'Fragrant rice cooked with beef and traditional spices.', category: 'Food', module: 'restaurant', price: 650, costPrice: 300, stock: 40, minStockLevel: 5, unit: 'plates', image_url: 'https://images.unsplash.com/photo-1512058560366-cd2427ff5e70?w=800&q=80' },
  { id: 'r3', name: 'Wet Fry Tilapia', description: 'Fresh lake fish served with kachumbari and ugali.', category: 'Food', module: 'restaurant', price: 950, costPrice: 450, stock: 25, minStockLevel: 5, unit: 'fish', image_url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&q=80' },
  { id: 'r4', name: 'Chicken Tikka', description: 'Oven-roasted chicken in a spicy marinade.', category: 'Food', module: 'restaurant', price: 850, costPrice: 400, stock: 30, minStockLevel: 5, unit: 'servings', image_url: 'https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=800&q=80' },
  { id: 'r5', name: 'Beef Stew', description: 'Tender beef cubes slow-cooked with root vegetables.', category: 'Food', module: 'restaurant', price: 550, costPrice: 250, stock: 45, minStockLevel: 10, unit: 'plates', image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80' },
  // Bar
  { id: 'b1', name: 'Tusker Lager', description: 'Kenyan favorite since 1922.', category: 'Beer', module: 'bar', price: 350, costPrice: 220, stock: 240, minStockLevel: 48, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800&q=80' },
  { id: 'b2', name: 'White Cap', description: 'Premium crisp lager.', category: 'Beer', module: 'bar', price: 380, costPrice: 240, stock: 120, minStockLevel: 24, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80' },
  // Car Wash
  { id: 'c1', name: 'Executive Body Wash', description: 'High-pressure foam wash and dry.', category: 'Cleaning', module: 'carwash', price: 500, costPrice: 100, stock: 1, minStockLevel: 0, unit: 'car', image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80' },
  // Rooms
  { id: 'a1', name: 'Deluxe Room', description: 'Ensuite King bed with garden view.', category: 'Rooms', module: 'accommodation', price: 5500, costPrice: 1200, stock: 10, minStockLevel: 2, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' },
];

// Raw Supplies
let supplies: Supply[] = [
  { id: 's1', name: 'Charcoal (Bags)', category: 'Energy', module: 'restaurant', quantity: 20, unit: 'bags', unitCost: 1500, lastPurchased: new Date().toISOString() },
  { id: 's2', name: 'Car Shampoo', category: 'Cleaning', module: 'carwash', quantity: 15, unit: 'liters', unitCost: 400, lastPurchased: new Date().toISOString() },
];

// Operational Expenses
let expenses: Expense[] = [
  { id: 'ex1', category: 'utility', amount: 15000, description: 'Monthly Electricity Bill', date: new Date().toISOString(), module: 'general' },
  { id: 'ex2', category: 'salary', amount: 45000, description: 'Chef Salaries', date: new Date().toISOString(), module: 'restaurant' },
];

let transactions: Transaction[] = [];

// --- User Services ---
export async function getUsers(): Promise<User[]> {
  return users;
}

export async function addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const newUser: User = {
    ...user,
    id: `U-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  users = users.map(u => u.id === id ? { ...u, ...updates } : u);
}

export async function deleteUser(id: string): Promise<void> {
  users = users.filter(u => u.id !== id);
}

export async function deleteUsers(ids: string[]): Promise<void> {
  users = users.filter(u => !ids.includes(u.id));
}

// --- Product/Inventory Services ---
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

export async function deleteProducts(ids: string[]): Promise<void> {
  products = products.filter(p => !ids.includes(p.id));
}

export async function getSupplies(module?: HotelModule): Promise<Supply[]> {
  return module ? supplies.filter(s => s.module === module) : supplies;
}

export async function addSupply(supply: Omit<Supply, 'id'>): Promise<Supply> {
  const newSupply = { ...supply, id: `SUP-${Date.now()}` };
  supplies.push(newSupply);
  return newSupply;
}

export async function deleteSupplies(ids: string[]): Promise<void> {
  supplies = supplies.filter(s => !ids.includes(s.id));
}

export async function getExpenses(): Promise<Expense[]> {
  return expenses;
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const newExpense = { ...expense, id: `EXP-${Date.now()}` };
  expenses.push(newExpense);
  return newExpense;
}

export async function deleteExpenses(ids: string[]): Promise<void> {
  expenses = expenses.filter(e => !ids.includes(e.id));
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

function calculateChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const currentStart = startOfMonth(now);
  const prevDate = subMonths(now, 1);
  const prevStart = startOfMonth(prevDate);
  const dayOfMonth = now.getDate();

  const currentPeriod = { start: currentStart, end: now };
  const prevPeriod = { start: prevStart, end: new Date(prevStart.getFullYear(), prevStart.getMonth(), dayOfMonth) };

  const currentTransactions = transactions.filter(t => t.status === 'paid' && isWithinInterval(new Date(t.timestamp), currentPeriod));
  const prevTransactions = transactions.filter(t => t.status === 'paid' && isWithinInterval(new Date(t.timestamp), prevPeriod));

  const currentRevenue = currentTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const prevRevenue = prevTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0) || (currentRevenue * 0.85);

  const currentCOGS = currentTransactions.reduce((acc, curr) => acc + curr.totalCost, 0);
  const prevCOGS = prevTransactions.reduce((acc, curr) => acc + curr.totalCost, 0) || (currentCOGS * 0.8);

  const currentOpEx = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const prevOpEx = currentOpEx * 0.95;

  const modules: HotelModule[] = ['restaurant', 'bar', 'carwash', 'entertainment', 'accommodation'];
  
  const moduleStats = modules.map(m => {
    const currentModSales = currentTransactions.filter(t => t.module === m).reduce((acc, curr) => acc + curr.totalAmount, 0);
    const prevModSales = prevTransactions.filter(t => t.module === m).reduce((acc, curr) => acc + curr.totalAmount, 0) || (currentModSales * 0.9);
    return {
      module: m,
      currentSales: currentModSales,
      previousSales: prevModSales,
      changePercent: calculateChange(currentModSales, prevModSales)
    };
  });

  return {
    summary: {
      revenue: { current: currentRevenue, previous: prevRevenue, changePercent: calculateChange(currentRevenue, prevRevenue) },
      cogs: { current: currentCOGS, previous: prevCOGS, changePercent: calculateChange(currentCOGS, prevCOGS) },
      operatingCost: { current: currentOpEx, previous: prevOpEx, changePercent: calculateChange(currentOpEx, prevOpEx) },
      netProfit: { 
        current: currentRevenue - currentCOGS - currentOpEx, 
        previous: prevRevenue - prevCOGS - prevOpEx, 
        changePercent: calculateChange(currentRevenue - currentCOGS - currentOpEx, prevRevenue - prevCOGS - prevOpEx) 
      }
    },
    moduleStats,
    currentPeriodLabel: `${format(currentStart, 'MMM 1')}-${format(now, 'd')}`,
    previousPeriodLabel: `${format(prevStart, 'MMM 1')}-${format(prevPeriod.end, 'd')}`
  };
}
