'use client';

import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/hotel-service';
import type { DashboardData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, RefreshCw } from 'lucide-react';
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
            <div className="p-4 md:p-8 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>System Error</AlertTitle>
                    <AlertDescription>
                        {error || "The analytics dashboard is currently unavailable. Please verify your database connection."}
                    </AlertDescription>
                </Alert>
                <Button onClick={() => fetchData()} className="mt-4">Retry Connection</Button>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight font-headline text-primary">Executive P&L Overview</h1>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Comparative Analytics: {previousPeriodLabel} vs {currentPeriodLabel}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={isRefreshing} className="h-8 gap-2">
                    <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                    <span className="text-[10px] font-bold">RECALCULATE</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Gross Revenue', val: summary.revenue, color: 'text-primary' },
                    { label: 'Total COGS', val: summary.cogs, color: 'text-orange-600' },
                    { label: 'Operating Cost', val: summary.operatingCost, color: 'text-destructive' },
                    { label: 'Net Operational Profit', val: summary.netProfit, color: 'text-green-600' }
                ].map((item, i) => (
                    <Card key={i} className="shadow-sm border-primary/5">
                        <CardContent className="p-4 flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{item.label}</span>
                            <div className="flex items-baseline justify-between">
                                <span className={cn("text-xl font-black tabular-nums", item.color)}>{formatPrice(item.val.current)}</span>
                                {renderChange(item.val.changePercent)}
                            </div>
                            <span className="text-[9px] text-muted-foreground italic">Prev: {formatPrice(item.val.previous)}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 py-4">
                    <CardTitle className="text-base">Departmental Contribution Analysis</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold">Comparative performance and cost breakdown by department.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/20">
                                <TableHead className="w-[150px] font-bold text-[10px] uppercase">Department</TableHead>
                                <TableHead className="text-right font-bold text-muted-foreground text-[10px] uppercase">{previousPeriodLabel} COGS</TableHead>
                                <TableHead className="text-right font-bold text-muted-foreground text-[10px] uppercase">{currentPeriodLabel} COGS</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase">{currentPeriodLabel} Sales</TableHead>
                                <TableHead className="text-right font-bold w-[100px] text-[10px] uppercase">MTD Growth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {moduleStats.map((m) => (
                                <TableRow key={m.module} className="group h-12">
                                    <TableCell className="capitalize font-bold text-xs flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        {m.module === 'accommodation' ? 'Rooms' : m.module}
                                    </TableCell>
                                    <TableCell className="text-right text-[11px] text-muted-foreground">{formatPrice(m.previousCogs)}</TableCell>
                                    <TableCell className="text-right text-[11px] text-orange-600 font-bold">{formatPrice(m.currentCogs)}</TableCell>
                                    <TableCell className="text-right text-[11px] font-black">{formatPrice(m.currentSales)}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={m.changePercent >= 0 ? "secondary" : "destructive"} className="px-1.5 py-0 text-[9px] h-4 rounded-sm">
                                            {m.changePercent > 0 ? "+" : ""}{Math.round(m.changePercent)}%
                                        </Badge>
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