
'use client';

import type { Product, Transaction, HotelModule, DashboardData, SaleItem, Supply, Expense } from '@/lib/types';
import { startOfMonth, subMonths, format, isWithinInterval } from 'date-fns';

// Expanded Product List (10 per module)
let products: Product[] = [
  // Restaurant (10 items)
  { id: 'r1', name: 'Nyama Choma (1kg)', description: 'Prime goat meat grilled to perfection over charcoal.', category: 'Food', module: 'restaurant', price: 1200, costPrice: 700, stock: 50, minStockLevel: 10, unit: 'kg', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80' },
  { id: 'r2', name: 'Swahili Pilau', description: 'Fragrant rice cooked with beef and traditional spices.', category: 'Food', module: 'restaurant', price: 650, costPrice: 300, stock: 40, minStockLevel: 5, unit: 'plates', image_url: 'https://images.unsplash.com/photo-1512058560366-cd2427ff5e70?w=800&q=80' },
  { id: 'r3', name: 'Wet Fry Tilapia', description: 'Fresh lake fish served with kachumbari and ugali.', category: 'Food', module: 'restaurant', price: 950, costPrice: 450, stock: 25, minStockLevel: 5, unit: 'fish', image_url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&q=80' },
  { id: 'r4', name: 'Chicken Tikka', description: 'Oven-roasted chicken in a spicy marinade.', category: 'Food', module: 'restaurant', price: 850, costPrice: 400, stock: 30, minStockLevel: 5, unit: 'servings', image_url: 'https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=800&q=80' },
  { id: 'r5', name: 'Beef Stew', description: 'Tender beef cubes slow-cooked with root vegetables.', category: 'Food', module: 'restaurant', price: 550, costPrice: 250, stock: 45, minStockLevel: 10, unit: 'plates', image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80' },
  { id: 'r6', name: 'Masala Chips', description: 'Crispy fries tossed in a spicy, tangy sauce.', category: 'Sides', module: 'restaurant', price: 350, costPrice: 120, stock: 100, minStockLevel: 20, unit: 'portions', image_url: 'https://images.unsplash.com/photo-1573015613731-ffdf1ef3381d?w=800&q=80' },
  { id: 'r7', name: 'Wamaghach Burger', description: 'House specialty double beef patty with cheese.', category: 'Food', module: 'restaurant', price: 750, costPrice: 350, stock: 35, minStockLevel: 10, unit: 'burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
  { id: 'r8', name: 'Club Sandwich', description: 'Triple-decker with chicken, egg, and bacon.', category: 'Food', module: 'restaurant', price: 600, costPrice: 280, stock: 20, minStockLevel: 5, unit: 'sandwiches', image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80' },
  { id: 'r9', name: 'Githeri Special', description: 'Traditional corn and beans with a modern twist.', category: 'Food', module: 'restaurant', price: 450, costPrice: 150, stock: 50, minStockLevel: 10, unit: 'plates', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
  { id: 'r10', name: 'Managu & Ugali', description: 'Indigenous greens sautéed with cream.', category: 'Food', module: 'restaurant', price: 400, costPrice: 100, stock: 60, minStockLevel: 10, unit: 'plates', image_url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80' },

  // Bar (10 items)
  { id: 'b1', name: 'Tusker Lager', description: 'Kenyan favorite since 1922.', category: 'Beer', module: 'bar', price: 350, costPrice: 220, stock: 240, minStockLevel: 48, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800&q=80' },
  { id: 'b2', name: 'White Cap', description: 'Premium crisp lager.', category: 'Beer', module: 'bar', price: 380, costPrice: 240, stock: 120, minStockLevel: 24, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80' },
  { id: 'b3', name: 'Guinness Stout', description: 'Rich and dark legendary stout.', category: 'Beer', module: 'bar', price: 400, costPrice: 260, stock: 96, minStockLevel: 12, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?w=800&q=80' },
  { id: 'b4', name: 'Jameson Irish Whiskey', description: 'Smooth triple-distilled whiskey.', category: 'Whiskey', module: 'bar', price: 450, costPrice: 180, stock: 12, minStockLevel: 2, unit: 'shots', image_url: 'https://images.unsplash.com/photo-1527281473222-793895bf44f9?w=800&q=80' },
  { id: 'b5', name: 'Glenfiddich 12yr', description: 'Single malt scotch whiskey.', category: 'Whiskey', module: 'bar', price: 800, costPrice: 350, stock: 10, minStockLevel: 1, unit: 'shots', image_url: 'https://images.unsplash.com/photo-1582819509237-d5b75f24ff94?w=800&q=80' },
  { id: 'b6', name: 'Gordons Gin', description: 'Classic London dry gin.', category: 'Gin', module: 'bar', price: 300, costPrice: 120, stock: 15, minStockLevel: 2, unit: 'shots', image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80' },
  { id: 'b7', name: 'Red Wine (Glass)', description: 'House selected Cabernet Sauvignon.', category: 'Wine', module: 'bar', price: 500, costPrice: 200, stock: 20, minStockLevel: 5, unit: 'glasses', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' },
  { id: 'b8', name: 'Mojito Cocktail', description: 'Fresh lime, mint, and rum.', category: 'Cocktails', module: 'bar', price: 750, costPrice: 250, stock: 50, minStockLevel: 0, unit: 'glasses', image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
  { id: 'b9', name: 'Coca-Cola', description: 'Refreshing soft drink.', category: 'Soft Drinks', module: 'bar', price: 150, costPrice: 60, stock: 200, minStockLevel: 24, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80' },
  { id: 'b10', name: 'Mineral Water', description: 'Purified drinking water.', category: 'Soft Drinks', module: 'bar', price: 100, costPrice: 30, stock: 300, minStockLevel: 48, unit: 'bottles', image_url: 'https://images.unsplash.com/photo-1548964856-ac526a48e19a?w=800&q=80' },

  // Car Wash (10 items)
  { id: 'c1', name: 'Executive Body Wash', description: 'High-pressure foam wash and dry.', category: 'Cleaning', module: 'carwash', price: 500, costPrice: 100, stock: 1, minStockLevel: 0, unit: 'car', image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80' },
  { id: 'c2', name: 'Interior Vacuum', description: 'Thorough cleaning of seats and carpets.', category: 'Cleaning', module: 'carwash', price: 300, costPrice: 50, stock: 1, minStockLevel: 0, unit: 'car', image_url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80' },
  { id: 'c3', name: 'Engine Wash', description: 'Safe degreasing and cleaning of engine bay.', category: 'Specialty', module: 'carwash', price: 800, costPrice: 150, stock: 1, minStockLevel: 0, unit: 'service', image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80' },
  { id: 'c4', name: 'Full Detail', description: 'Comprehensive inside-out cleaning.', category: 'Packages', module: 'carwash', price: 2500, costPrice: 600, stock: 1, minStockLevel: 0, unit: 'package', image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?w=800&q=80' },
  { id: 'c5', name: 'Ceramic Coating', description: 'Long-term paint protection.', category: 'Premium', module: 'carwash', price: 15000, costPrice: 5000, stock: 1, minStockLevel: 0, unit: 'package', image_url: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?w=800&q=80' },
  { id: 'c6', name: 'Buffing & Polish', description: 'Restores paint shine and removes scratches.', category: 'Specialty', module: 'carwash', price: 3500, costPrice: 800, stock: 1, minStockLevel: 0, unit: 'service', image_url: 'https://images.unsplash.com/photo-1597766353939-967699660619?w=800&q=80' },
  { id: 'c7', name: 'Tire Shine & Wax', description: 'Glossy finish for tires and rims.', category: 'Cleaning', module: 'carwash', price: 200, costPrice: 40, stock: 1, minStockLevel: 0, unit: 'car', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80' },
  { id: 'c8', name: 'Upholstery Shampoo', description: 'Deep fabric or leather seat cleaning.', category: 'Cleaning', module: 'carwash', price: 1500, costPrice: 300, stock: 1, minStockLevel: 0, unit: 'service', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80' },
  { id: 'c9', name: 'Underwash', description: 'Removal of mud and salt from chassis.', category: 'Cleaning', module: 'carwash', price: 400, costPrice: 50, stock: 1, minStockLevel: 0, unit: 'car', image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80' },
  { id: 'c10', name: 'Motorcycle Wash', description: 'Careful hand wash for bikes.', category: 'Cleaning', module: 'carwash', price: 200, costPrice: 40, stock: 1, minStockLevel: 0, unit: 'bike', image_url: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&q=80' },

  // Rooms (10 items)
  { id: 'a1', name: 'Deluxe Room', description: 'Ensuite King bed with garden view.', category: 'Rooms', module: 'accommodation', price: 5500, costPrice: 1200, stock: 10, minStockLevel: 2, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' },
  { id: 'a2', name: 'Executive Suite', description: 'Spacious living area and premium amenities.', category: 'Suites', module: 'accommodation', price: 12000, costPrice: 2500, stock: 4, minStockLevel: 1, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80' },
  { id: 'a3', name: 'Standard Double', description: 'Cozy room for two with city views.', category: 'Rooms', module: 'accommodation', price: 4500, costPrice: 1000, stock: 15, minStockLevel: 2, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80' },
  { id: 'a4', name: 'Twin Room', description: 'Two single beds, ideal for friends.', category: 'Rooms', module: 'accommodation', price: 4800, costPrice: 1100, stock: 8, minStockLevel: 2, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80' },
  { id: 'a5', name: 'Presidential Suite', description: 'The ultimate luxury experience.', category: 'Suites', module: 'accommodation', price: 35000, costPrice: 8000, stock: 1, minStockLevel: 0, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80' },
  { id: 'a6', name: 'Studio Apartment', description: 'Kitchenette and living space.', category: 'Long Stay', module: 'accommodation', price: 7500, costPrice: 1500, stock: 5, minStockLevel: 1, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80' },
  { id: 'a7', name: 'Family Room', description: 'Connecting rooms for 4 people.', category: 'Rooms', module: 'accommodation', price: 9000, costPrice: 2000, stock: 3, minStockLevel: 1, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1591088398332-8a77d399ea75?w=800&q=80' },
  { id: 'a8', name: 'Economy Single', description: 'Compact and efficient for travelers.', category: 'Rooms', module: 'accommodation', price: 3000, costPrice: 800, stock: 10, minStockLevel: 2, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800&q=80' },
  { id: 'a9', name: 'Penthouse', description: 'Top floor luxury with private balcony.', category: 'Suites', module: 'accommodation', price: 25000, costPrice: 5000, stock: 1, minStockLevel: 0, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80' },
  { id: 'a10', name: 'Honeymoon Suite', description: 'Romantic setup with private jacuzzi.', category: 'Suites', module: 'accommodation', price: 15000, costPrice: 3000, stock: 2, minStockLevel: 0, unit: 'nights', image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80' },

  // Entertainment (10 items)
  { id: 'e1', name: 'MC Service (Event)', description: 'Professional MC for weddings or corporate events.', category: 'Entertainment', module: 'entertainment', price: 15000, costPrice: 2000, stock: 1, minStockLevel: 0, unit: 'event', image_url: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&q=80' },
  { id: 'e2', name: 'PA System Rental', description: 'Full audio system with high-power speakers.', category: 'Sound', module: 'entertainment', price: 8000, costPrice: 1000, stock: 5, minStockLevel: 1, unit: 'set', image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80' },
  { id: 'e3', name: 'DJ Service (Night)', description: 'All-night music from our resident DJ.', category: 'Music', module: 'entertainment', price: 10000, costPrice: 1500, stock: 1, minStockLevel: 0, unit: 'night', image_url: 'https://images.unsplash.com/photo-1516280440614-37939bbdd4f1?w=800&q=80' },
  { id: 'e4', name: 'Karaoke Set Up', description: 'Screen, mics, and 50k+ song library.', category: 'Music', module: 'entertainment', price: 5000, costPrice: 500, stock: 2, minStockLevel: 0, unit: 'night', image_url: 'https://images.unsplash.com/photo-1516280440614-37939bbdd4f1?w=800&q=80' },
  { id: 'e5', name: 'Live Acoustic Band', description: '3-piece band for chill vibes.', category: 'Live Music', module: 'entertainment', price: 25000, costPrice: 5000, stock: 1, minStockLevel: 0, unit: 'performance', image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' },
  { id: 'e6', name: 'Event Lighting', description: 'Smart LED and mood lighting.', category: 'Ambience', module: 'entertainment', price: 6000, costPrice: 1000, stock: 3, minStockLevel: 0, unit: 'event', image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80' },
  { id: 'e7', name: 'Smoke Machine', description: 'Adds atmosphere to dance floor.', category: 'Special Effects', module: 'entertainment', price: 2000, costPrice: 400, stock: 2, minStockLevel: 0, unit: 'event', image_url: 'https://images.unsplash.com/photo-1514525253344-99147277d095?w=800&q=80' },
  { id: 'e8', name: 'Wireless Mic Set', description: 'Pair of high-quality Shure mics.', category: 'Sound', module: 'entertainment', price: 1500, costPrice: 200, stock: 4, minStockLevel: 0, unit: 'set', image_url: 'https://images.unsplash.com/photo-1558403194-611308249627?w=800&q=80' },
  { id: 'e9', name: 'Projector & Screen', description: 'For presentations or movies.', category: 'Visuals', module: 'entertainment', price: 4000, costPrice: 500, stock: 2, minStockLevel: 0, unit: 'day', image_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80' },
  { id: 'e10', name: 'Photo Booth', description: 'Props and instant digital photos.', category: 'Fun', module: 'entertainment', price: 12000, costPrice: 3000, stock: 1, minStockLevel: 0, unit: 'event', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80' },
];

// Raw Supplies
let supplies: Supply[] = [
  { id: 's1', name: 'Charcoal (Bags)', category: 'Energy', module: 'restaurant', quantity: 20, unit: 'bags', unitCost: 1500, lastPurchased: new Date().toISOString() },
  { id: 's2', name: 'Car Shampoo', category: 'Cleaning', module: 'carwash', quantity: 15, unit: 'liters', unitCost: 400, lastPurchased: new Date().toISOString() },
  { id: 's3', name: 'Bed Linens (Sets)', category: 'Linen', module: 'accommodation', quantity: 40, unit: 'sets', unitCost: 2000, lastPurchased: new Date().toISOString() },
  { id: 's4', name: 'Fresh Tilapia', category: 'Groceries', module: 'restaurant', quantity: 100, unit: 'kg', unitCost: 400, lastPurchased: new Date().toISOString() },
  { id: 's5', name: 'Cooking Oil', category: 'Energy', module: 'restaurant', quantity: 50, unit: 'liters', unitCost: 250, lastPurchased: new Date().toISOString() },
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

function calculateChange(current: number, previous: number) {
  if (previous === 0) return 0;
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
