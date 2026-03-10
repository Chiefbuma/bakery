import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { DashboardData, HotelModule, ModuleComparison } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevYear = prevMonthDate.getFullYear();

    const [stats]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as currRev,
        SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalCost ELSE 0 END) as currCogs,
        SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as prevRev,
        SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalCost ELSE 0 END) as prevCogs
      FROM transactions 
      WHERE status = 'paid'
    `, [currentMonth, currentYear, currentMonth, currentYear, prevMonth, prevYear, prevMonth, prevYear]);

    const [expenses]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN MONTH(date) = ? AND YEAR(date) = ? THEN amount ELSE 0 END) as currOpex,
        SUM(CASE WHEN MONTH(date) = ? AND YEAR(date) = ? THEN amount ELSE 0 END) as prevOpex
      FROM expenses
    `, [currentMonth, currentYear, prevMonth, prevYear]);

    const statsRow = (stats && stats[0]) || { currRev: 0, currCogs: 0, prevRev: 0, prevCogs: 0 };
    const expRow = (expenses && expenses[0]) || { currOpex: 0, prevOpex: 0 };

    const modules: HotelModule[] = ['restaurant', 'bar', 'carwash', 'accommodation', 'entertainment'];
    const moduleStats: ModuleComparison[] = await Promise.all(modules.map(async (m) => {
      const [mStats]: any = await pool.query(`
        SELECT 
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as currS,
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalCost ELSE 0 END) as currC,
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalAmount ELSE 0 END) as prevS,
          SUM(CASE WHEN MONTH(timestamp) = ? AND YEAR(timestamp) = ? THEN totalCost ELSE 0 END) as prevC
        FROM transactions 
        WHERE module = ? AND status = 'paid'
      `, [currentMonth, currentYear, currentMonth, currentYear, prevMonth, prevYear, prevMonth, prevYear, m]);

      const [mExp]: any = await pool.query(`
        SELECT 
          SUM(CASE WHEN MONTH(date) = ? AND YEAR(date) = ? THEN amount ELSE 0 END) as currE,
          SUM(CASE WHEN MONTH(date) = ? AND YEAR(date) = ? THEN amount ELSE 0 END) as prevE
        FROM expenses
        WHERE module = ?
      `, [currentMonth, currentYear, prevMonth, prevYear, m]);
      
      const currS = Number(mStats && mStats[0]?.currS || 0);
      const currC = Number(mStats && mStats[0]?.currC || 0);
      const currE = Number(mExp && mExp[0]?.currE || 0);
      const currNet = currS - currC - currE;

      const prevS = Number(mStats && mStats[0]?.prevS || 0);
      const prevC = Number(mStats && mStats[0]?.prevC || 0);
      const prevE = Number(mExp && mExp[0]?.prevE || 0);
      const prevNet = prevS - prevC - prevE;
      
      const growth = prevNet === 0 ? (currNet > 0 ? 100 : 0) : ((currNet - prevNet) / Math.abs(prevNet)) * 100;

      return {
        module: m,
        currentSales: currS,
        currentCogs: currC,
        currentOpex: currE,
        currentNet: currNet,
        previousSales: prevS,
        previousCogs: prevC,
        previousOpex: prevE,
        previousNet: prevNet,
        changePercent: growth
      };
    }));

    const calculateMetrics = (curr: number, prev: number) => ({
      current: curr,
      previous: prev,
      changePercent: prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / Math.abs(prev)) * 100
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
    console.error('Dashboard Engine Failure:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}