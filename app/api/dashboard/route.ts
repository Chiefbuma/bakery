
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { DashboardData, HotelModule } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Highly optimized dashboard analytics API.
 * Uses SQL aggregation to calculate metrics in a single pass where possible.
 */
export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevYear = prevMonthDate.getFullYear();

    // Consolidated revenue and COGS query for current and previous months
    const [stats]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as currRev,
        SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalCost ELSE 0 END) as currCogs,
        SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as prevRev,
        SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalCost ELSE 0 END) as prevCogs
      FROM transactions 
      WHERE status = 'paid' AND (
        (MONTH(timestamp) = ? AND YEAR(timestamp) = ?) OR 
        (MONTH(timestamp) = ? AND YEAR(timestamp) = ?)
      )
    `, [currentMonth, currentYear, currentMonth, currentYear, prevMonth, prevYear, prevMonth, prevYear, currentMonth, currentYear, prevMonth, prevYear]);

    // Optimized expense query
    const [expenses]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN MONTH(date) = ? AND YEAR(date) = ? THEN amount ELSE 0 END) as currOpex,
        SUM(CASE WHEN MONTH(date) = ? AND YEAR(date) = ? THEN amount ELSE 0 END) as prevOpex
      FROM expenses
      WHERE (MONTH(date) = ? AND YEAR(date) = ?) OR (MONTH(date) = ? AND YEAR(date) = ?)
    `, [currentMonth, currentYear, prevMonth, prevYear, currentMonth, currentYear, prevMonth, prevYear]);

    const statsRow = stats[0] || {};
    const expRow = expenses[0] || {};

    const modules: HotelModule[] = ['restaurant', 'bar', 'carwash', 'accommodation', 'entertainment'];
    const moduleStats = await Promise.all(modules.map(async (m) => {
      const [mStats]: any = await pool.query(`
        SELECT 
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as curr,
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as prev
        FROM transactions 
        WHERE module = ? AND status = 'paid'
      `, [currentMonth, currentYear, prevMonth, prevYear, m]);
      
      const c = Number(mStats[0]?.curr || 0);
      const p = Number(mStats[0]?.prev || 0);
      const diff = p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100;

      return {
        module: m,
        currentSales: c,
        previousSales: p,
        changePercent: diff
      };
    }));

    const calculateMetrics = (curr: number, prev: number) => ({
      current: curr,
      previous: prev,
      changePercent: prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100
    });

    const currRev = Number(statsRow.currRev || 0);
    const currCogs = Number(statsRow.currCogs || 0);
    const currOpex = Number(expRow.currOpex || 0);
    
    const prevRev = Number(statsRow.prevRev || 0);
    const prevCogs = Number(statsRow.prevCogs || 0);
    const prevOpex = Number(expRow.prevOpex || 0);

    const data: DashboardData = {
      summary: {
        revenue: calculateMetrics(currRev, prevRev),
        cogs: calculateMetrics(currCogs, prevCogs),
        operatingCost: calculateMetrics(currOpex, prevOpex),
        netProfit: calculateMetrics(currRev - currCogs - currOpex, prevRev - prevCogs - prevOpex)
      },
      moduleStats,
      currentPeriodLabel: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      previousPeriodLabel: prevMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard Engine Error:', error);
    return NextResponse.json({ error: "High-performance analytics failed" }, { status: 500 });
  }
}
