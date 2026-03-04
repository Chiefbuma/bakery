
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { DashboardData, HotelModule } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevYear = prevMonthDate.getFullYear();

    // 1. Fetch Current Month Summary
    const [currentRows]: any = await pool.query(`
      SELECT 
        SUM(totalAmount) as revenue, 
        SUM(totalCost) as cogs 
      FROM transactions 
      WHERE status = 'paid' AND MONTH(timestamp) = ? AND YEAR(timestamp) = ?
    `, [currentMonth, currentYear]);

    // 2. Fetch Previous Month Summary
    const [prevRows]: any = await pool.query(`
      SELECT 
        SUM(totalAmount) as revenue, 
        SUM(totalCost) as cogs 
      FROM transactions 
      WHERE status = 'paid' AND MONTH(timestamp) = ? AND YEAR(timestamp) = ?
    `, [prevMonth, prevYear]);

    // 3. Fetch Expenses
    const [currentExp]: any = await pool.query(`
      SELECT SUM(amount) as opex FROM expenses 
      WHERE MONTH(date) = ? AND YEAR(date) = ?
    `, [currentMonth, currentYear]);

    const [prevExp]: any = await pool.query(`
      SELECT SUM(amount) as opex FROM expenses 
      WHERE MONTH(date) = ? AND YEAR(date) = ?
    `, [prevMonth, prevYear]);

    // 4. Module Stats
    const modules: HotelModule[] = ['restaurant', 'bar', 'carwash', 'accommodation', 'entertainment'];
    const moduleStats = await Promise.all(modules.map(async (m) => {
      const [curr]: any = await pool.query(`SELECT SUM(totalAmount) as val FROM transactions WHERE module = ? AND status = 'paid' AND MONTH(timestamp) = ? AND YEAR(timestamp) = ?`, [m, currentMonth, currentYear]);
      const [prev]: any = await pool.query(`SELECT SUM(totalAmount) as val FROM transactions WHERE module = ? AND status = 'paid' AND MONTH(timestamp) = ? AND YEAR(timestamp) = ?`, [m, prevMonth, prevYear]);
      
      const c = curr[0]?.val || 0;
      const p = prev[0]?.val || 0;
      const diff = p === 0 ? 0 : ((c - p) / p) * 100;

      return {
        module: m,
        currentSales: Number(c),
        previousSales: Number(p),
        changePercent: diff
      };
    }));

    const calculateMetrics = (curr: number, prev: number) => ({
      current: curr,
      previous: prev,
      changePercent: prev === 0 ? 0 : ((curr - prev) / prev) * 100
    });

    const cRev = currentRows[0]?.revenue || 0;
    const pRev = prevRows[0]?.revenue || 0;
    const cCogs = currentRows[0]?.cogs || 0;
    const pCogs = prevRows[0]?.cogs || 0;
    const cOpex = currentExp[0]?.opex || 0;
    const pOpex = prevExp[0]?.opex || 0;

    const data: DashboardData = {
      summary: {
        revenue: calculateMetrics(Number(cRev), Number(pRev)),
        cogs: calculateMetrics(Number(cCogs), Number(pCogs)),
        operatingCost: calculateMetrics(Number(cOpex), Number(pOpex)),
        netProfit: calculateMetrics(Number(cRev - cCogs - cOpex), Number(pRev - pCogs - pOpex))
      },
      moduleStats,
      currentPeriodLabel: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      previousPeriodLabel: prevMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
