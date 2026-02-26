
'use client';

import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/hotel-service';
import type { DashboardData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowDownRight, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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
        return <div className="p-8 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>;
    }

    const chartData = data.moduleStats.map(s => ({
        name: s.module.charAt(0).toUpperCase() + s.module.slice(1),
        revenue: s.sales,
        profit: s.profit
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                <p className="text-muted-foreground">Detailed Profit & Loss analysis for Wamaghach Kahua-ini Hotel.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(data.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Accumulated across all modules today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Operating Costs</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(data.totalCosts)}</div>
                        <p className="text-xs text-muted-foreground">Inventory & material expenses</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatPrice(data.totalProfit)}</div>
                        <p className="text-xs text-muted-foreground">Real-time bottom line</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue by Module</CardTitle>
                        <CardDescription>Comparison of sales performance across hotel services.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `Ksh${value}`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value: number) => [formatPrice(value), '']}
                                    />
                                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Profit Distribution</CardTitle>
                        <CardDescription>Performance breakdown by module.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.moduleStats.map((stat) => (
                            <div key={stat.module} className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none capitalize">{stat.module}</p>
                                    <p className="text-xs text-muted-foreground">{stat.orders} transactions</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">{formatPrice(stat.profit)}</p>
                                    <p className="text-[10px] text-muted-foreground">Margin: {stat.sales ? Math.round((stat.profit / stat.sales) * 100) : 0}%</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
