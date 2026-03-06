
'use client';

import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/hotel-service';
import type { DashboardData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getDashboardData();
            setData(result);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading || !data) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    const { summary, moduleStats, currentPeriodLabel, previousPeriodLabel } = data;

    const renderChange = (percent: number) => {
        if (Math.abs(percent) < 0.1) return <div className="flex items-center gap-1 text-muted-foreground"><Minus className="h-3 w-3" /> 0%</div>;
        const isPositive = percent > 0;
        return (
            <div className={cn("flex items-center gap-1 font-bold", isPositive ? "text-green-600" : "text-destructive")}>
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(Math.round(percent))}%
            </div>
        );
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">Executive P&L Overview</h1>
                <p className="text-muted-foreground">Financial comparison between {currentPeriodLabel} and {previousPeriodLabel}.</p>
            </div>

            <Card className="shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5">
                    <CardTitle>Consolidated Financial Statement</CardTitle>
                    <CardDescription>Real-time operational metrics across all hotel modules.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[300px] font-bold">Metric</TableHead>
                                <TableHead className="text-right font-bold text-primary">{previousPeriodLabel}</TableHead>
                                <TableHead className="text-right font-bold text-primary">{currentPeriodLabel}</TableHead>
                                <TableHead className="text-right font-bold w-[120px]">MTD Growth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Total Gross Revenue</TableCell>
                                <TableCell className="text-right">{formatPrice(summary.revenue.previous)}</TableCell>
                                <TableCell className="text-right font-black">{formatPrice(summary.revenue.current)}</TableCell>
                                <TableCell className="text-right">{renderChange(summary.revenue.changePercent)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Cost of Goods Sold (COGS)</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatPrice(summary.cogs.previous)}</TableCell>
                                <TableCell className="text-right text-orange-600 font-bold">{formatPrice(summary.cogs.current)}</TableCell>
                                <TableCell className="text-right">{renderChange(summary.cogs.changePercent)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Operating Cost (OpEx)</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatPrice(summary.operatingCost.previous)}</TableCell>
                                <TableCell className="text-right text-destructive font-bold">{formatPrice(summary.operatingCost.current)}</TableCell>
                                <TableCell className="text-right">{renderChange(summary.operatingCost.changePercent)}</TableCell>
                            </TableRow>
                            <TableRow className="bg-primary/5 hover:bg-primary/10 border-t-2">
                                <TableCell className="font-black text-lg">Net Operational Profits</TableCell>
                                <TableCell className="text-right text-lg">{formatPrice(summary.netProfit.previous)}</TableCell>
                                <TableCell className="text-right text-2xl font-black text-primary">{formatPrice(summary.netProfit.current)}</TableCell>
                                <TableCell className="text-right">{renderChange(summary.netProfit.changePercent)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5">
                    <CardTitle>Module Contribution Analysis</CardTitle>
                    <CardDescription>Comparative performance and cost breakdown by department.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[180px] font-bold">Department</TableHead>
                                <TableHead className="text-right font-bold text-muted-foreground">{previousPeriodLabel} COGS</TableHead>
                                <TableHead className="text-right font-bold text-muted-foreground">{currentPeriodLabel} COGS</TableHead>
                                <TableHead className="text-right font-bold">{currentPeriodLabel} Sales</TableHead>
                                <TableHead className="text-right font-bold w-[120px]">MTD Growth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {moduleStats.map((m) => (
                                <TableRow key={m.module} className="group">
                                    <TableCell className="capitalize font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        {m.module === 'accommodation' ? 'Rooms' : m.module}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground italic">{formatPrice(m.previousCogs)}</TableCell>
                                    <TableCell className="text-right text-orange-600 font-medium">{formatPrice(m.currentCogs)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatPrice(m.currentSales)}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={m.changePercent >= 0 ? "secondary" : "destructive"} className="px-2 py-0">
                                            {m.changePercent > 0 ? "+" : ""}{Math.round(m.changePercent)}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
