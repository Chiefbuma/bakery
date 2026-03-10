'use client';

import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/hotel-service';
import type { DashboardData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setIsRefreshing(true);
            setError(null);
            const result = await getDashboardData();
            setData(result);
        } catch (err: any) {
            console.error('Dashboard Data Fetch Error:', err);
            setError(err.message || 'Failed to connect to analytics engine.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>System Error</AlertTitle>
                    <AlertDescription>
                        {error || "The analytics dashboard is currently unavailable. Please verify your database connection."}
                    </AlertDescription>
                </Alert>
                <Button onClick={() => fetchData()} className="mt-4 gap-2">
                    <RefreshCw className="h-4 w-4" /> Retry Connection
                </Button>
            </div>
        );
    }

    const { summary, moduleStats, currentPeriodLabel, previousPeriodLabel } = data;

    const renderChange = (percent: number) => {
        if (Math.abs(percent) < 0.1) return <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold"><Minus className="h-2 w-2" /> 0%</div>;
        const isPositive = percent > 0;
        return (
            <div className={cn("flex items-center gap-1 font-black text-[10px]", isPositive ? "text-green-600" : "text-destructive")}>
                {isPositive ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}
                {Math.abs(Math.round(percent))}%
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold tracking-tight font-headline text-primary">Executive P&L Overview</h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Comparative Analytics: {previousPeriodLabel} vs {currentPeriodLabel}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={isRefreshing} className="h-8 gap-2">
                    {isRefreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    <span className="text-[10px] font-bold">RECALCULATE</span>
                </Button>
            </div>

            <Card className="shadow-sm border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 py-3 border-b">
                    <CardTitle className="text-xs font-bold uppercase tracking-tight">Consolidated Financial Statement</CardTitle>
                    <CardDescription className="text-[9px] uppercase font-bold">Total Operational Performance comparison</CardDescription>
                </Header>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/20 h-9">
                                <TableHead className="font-bold text-[10px] uppercase">Financial Metric</TableHead>
                                <TableHead className="text-right font-bold text-muted-foreground text-[10px] uppercase">{previousPeriodLabel}</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase">{currentPeriodLabel}</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase w-[100px]">MTD Growth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { label: 'Gross Revenue', val: summary.revenue, color: 'text-primary' },
                                { label: 'Total COGS', val: summary.cogs, color: 'text-orange-600' },
                                { label: 'Operating Cost', val: summary.operatingCost, color: 'text-destructive' },
                                { label: 'Net Operational Profit', val: summary.netProfit, color: 'text-green-600' }
                            ].map((item, i) => (
                                <TableRow key={i} className="h-9">
                                    <TableCell className="text-[10px] font-black uppercase tracking-tight">{item.label}</TableCell>
                                    <TableCell className="text-right text-[10px] font-medium text-muted-foreground">{formatPrice(item.val.previous)}</TableCell>
                                    <TableCell className={cn("text-right text-[10px] font-black", item.color)}>{formatPrice(item.val.current)}</TableCell>
                                    <TableCell className="text-right">{renderChange(item.val.changePercent)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 py-3 border-b">
                    <CardTitle className="text-xs font-bold uppercase tracking-tight">Departmental Contribution Analysis</CardTitle>
                    <CardDescription className="text-[9px] uppercase font-bold">Granular P&L breakdown per department.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/20 h-8 border-b-2">
                                <TableHead rowSpan={2} className="w-[100px] font-bold text-[10px] uppercase border-r">Dept</TableHead>
                                <TableHead colSpan={4} className="text-center font-bold text-muted-foreground text-[9px] uppercase border-r">{previousPeriodLabel}</TableHead>
                                <TableHead colSpan={4} className="text-center font-bold text-primary text-[9px] uppercase border-r">{currentPeriodLabel}</TableHead>
                                <TableHead rowSpan={2} className="text-right font-bold w-[90px] text-[10px] uppercase">MTD Growth</TableHead>
                            </TableRow>
                            <TableRow className="hover:bg-transparent bg-muted/10 h-8">
                                <TableHead className="text-right font-bold text-[8px] uppercase">Sales</TableHead>
                                <TableHead className="text-right font-bold text-[8px] uppercase">COGS</TableHead>
                                <TableHead className="text-right font-bold text-[8px] uppercase">OpEx</TableHead>
                                <TableHead className="text-right font-bold text-[8px] uppercase border-r">Net</TableHead>
                                <TableHead className="text-right font-bold text-[8px] uppercase">Sales</TableHead>
                                <TableHead className="text-right font-bold text-[8px] uppercase">COGS</TableHead>
                                <TableHead className="text-right font-bold text-[8px] uppercase">OpEx</TableHead>
                                <TableHead className="text-right font-bold text-[8px] uppercase border-r">Net</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {moduleStats.map((m) => (
                                <TableRow key={m.module} className="group h-10">
                                    <TableCell className="capitalize font-bold text-[10px] border-r">
                                        {m.module === 'accommodation' ? 'Rooms' : m.module}
                                    </TableCell>
                                    {/* Previous Period */}
                                    <TableCell className="text-right text-[9px] text-muted-foreground">{formatPrice(m.previousSales)}</TableCell>
                                    <TableCell className="text-right text-[9px] text-muted-foreground">{formatPrice(m.previousCogs)}</TableCell>
                                    <TableCell className="text-right text-[9px] text-muted-foreground">{formatPrice(m.previousOpex)}</TableCell>
                                    <TableCell className="text-right text-[9px] text-muted-foreground font-bold border-r">{formatPrice(m.previousNet)}</TableCell>
                                    {/* Current Period */}
                                    <TableCell className="text-right text-[9px] font-black">{formatPrice(m.currentSales)}</TableCell>
                                    <TableCell className="text-right text-[9px] text-orange-600 font-bold">{formatPrice(m.currentCogs)}</TableCell>
                                    <TableCell className="text-right text-[9px] text-destructive font-bold">{formatPrice(m.currentOpex)}</TableCell>
                                    <TableCell className="text-right text-[9px] font-black text-green-600 border-r">{formatPrice(m.currentNet)}</TableCell>
                                    {/* Growth */}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-1.5">
                                            {renderChange(m.changePercent)}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}
