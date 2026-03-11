'use client';

import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/hotel-service';
import type { DashboardData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
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
        if (Math.abs(percent) < 0.1) return <div className="flex items-center gap-1 text-muted-foreground text-xs"><Minus className="h-3 w-3" /> 0%</div>;
        const isPositive = percent > 0;
        return (
            <div className={cn("flex items-center gap-1 font-medium", isPositive ? "text-green-600" : "text-destructive")}>
                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(Math.round(percent))}%
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">Executive Dashboard</h1>
                    <p className="text-muted-foreground">Financial performance review: {previousPeriodLabel} vs {currentPeriodLabel}</p>
                </div>
                <Button variant="outline" onClick={() => fetchData(true)} disabled={isRefreshing} className="gap-2">
                    {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Recalculate
                </Button>
            </div>

            <Card className="shadow-sm border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg">Consolidated Financial Statement</CardTitle>
                    <CardDescription>Overall performance summary across all departments</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-bold">Metric</TableHead>
                                <TableHead className="text-right text-muted-foreground">{previousPeriodLabel}</TableHead>
                                <TableHead className="text-right font-bold text-foreground">{currentPeriodLabel}</TableHead>
                                <TableHead className="text-right font-bold">MTD Growth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { label: 'Gross Revenue', val: summary.revenue, color: 'text-primary' },
                                { label: 'Total COGS', val: summary.cogs, color: 'text-orange-600' },
                                { label: 'Operating Cost', val: summary.operatingCost, color: 'text-destructive' },
                                { label: 'Net Operational Profit', val: summary.netProfit, color: 'text-green-600' }
                            ].map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-semibold">{item.label}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{formatPrice(item.val.previous)}</TableCell>
                                    <TableCell className={cn("text-right font-bold", item.color)}>{formatPrice(item.val.current)}</TableCell>
                                    <TableCell className="text-right">{renderChange(item.val.changePercent)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg">Departmental Contribution Analysis</CardTitle>
                    <CardDescription>Comparative performance and cost breakdown by department.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-bold">Department</TableHead>
                                <TableHead className="text-right">{previousPeriodLabel} COGS</TableHead>
                                <TableHead className="text-right">{currentPeriodLabel} COGS</TableHead>
                                <TableHead className="text-right font-bold text-primary">{currentPeriodLabel} Sales</TableHead>
                                <TableHead className="text-right font-bold">MTD Growth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {moduleStats.map((m) => (
                                <TableRow key={m.module}>
                                    <TableCell className="capitalize font-medium">
                                        {m.module === 'accommodation' ? 'Rooms' : m.module}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{formatPrice(m.previousCogs)}</TableCell>
                                    <TableCell className="text-right">{formatPrice(m.currentCogs)}</TableCell>
                                    <TableCell className="text-right font-bold text-primary">{formatPrice(m.currentSales)}</TableCell>
                                    <TableCell className="text-right">{renderChange(m.changePercent)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}
