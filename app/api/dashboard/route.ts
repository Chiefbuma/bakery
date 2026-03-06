
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { DashboardData, HotelModule } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Analytics Engine
 * Calculates departmental sales and true COGS (Cost of Sale) across periods.
 */

export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevYear = prevMonthDate.getFullYear();

    // 1. Consolidated Financial Metrics
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

    // 2. Operating Expenses
    const [expenses]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN MONTH(date) = ? AND YEAR(date) = ? THEN amount ELSE 0 END) as currOpex,
        SUM(CASE WHEN MONTH(date) = ? AND YEAR(date) = ? THEN amount ELSE 0 END) as prevOpex
      FROM expenses
      WHERE (MONTH(date) = ? AND YEAR(date) = ?) OR (MONTH(date) = ? AND YEAR(date) = ?)
    `, [currentMonth, currentYear, prevMonth, prevYear, currentMonth, currentYear, prevMonth, prevYear]);

    const statsRow = (stats && stats[0]) || {};
    const expRow = (expenses && expenses[0]) || {};

    // 3. Module Comparison with Period-Specific Cost of Sale
    const modules: HotelModule[] = ['restaurant', 'bar', 'carwash', 'accommodation', 'entertainment'];
    const moduleStats = await Promise.all(modules.map(async (m) => {
      const [mStats]: any = await pool.query(`
        SELECT 
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as curr,
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalCost ELSE 0 END) as currCogs,
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as prev,
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalCost ELSE 0 END) as prevCogs
        FROM transactions 
        WHERE module = ? AND status = 'paid'
      `, [currentMonth, currentYear, currentMonth, currentYear, prevMonth, prevYear, prevMonth, prevYear, m]);
      
      const c = Number(mStats && mStats[0]?.curr || 0);
      const cCogs = Number(mStats && mStats[0]?.currCogs || 0);
      const p = Number(mStats && mStats[0]?.prev || 0);
      const pCogs = Number(mStats && mStats[0]?.prevCogs || 0);
      
      const growth = p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100;

      return {
        module: m,
        currentSales: c,
        currentCogs: cCogs,
        previousSales: p,
        previousCogs: pCogs,
        changePercent: growth
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
    console.error('Analytics Engine Error:', error);
    return NextResponse.json({ error: "Internal Server Error in Analytics" }, { status: 500 });
  }
}
