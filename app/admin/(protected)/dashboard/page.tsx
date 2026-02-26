
'use client';

import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/hotel-service';
import type { DashboardData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowDownRight, TrendingUp, Wallet, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const COLORS = ['#C68324', '#D4A743', '#241014', '#5D4037'];

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
        return <div className="p-8 space-y-4"><Skeleton className="h-[600px] w-full" /></div>;
    }

    const pieData = data.moduleStats.map(s => ({ name: s.module, value: s.sales }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Executive P&L Overview</h1>
                <p className="text-muted-foreground">Accurate financial performance tracking for Wamaghach Kahua-ini.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total Revenue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-black">{formatPrice(data.totalRevenue)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Cost of Sales (COGS)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-black text-orange-600">{formatPrice(data.totalCOGS)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Operating Expenses</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-black text-destructive">{formatPrice(data.totalExpenses)}</div></CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase opacity-80">Net Operational Profit</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-black">{formatPrice(data.netProfit)}</div></CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader><CardTitle>Module Performance</CardTitle></CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.moduleStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="module" />
                                <YAxis />
                                <Tooltip formatter={(v: any) => formatPrice(v)} />
                                <Bar dataKey="sales" fill="hsl(var(--primary))" name="Revenue" />
                                <Bar dataKey="profit" fill="#16a34a" name="Net Margin" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader><CardTitle>Revenue Mix</CardTitle></CardHeader>
                    <CardContent className="h-[350px] flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-4 w-full mt-4">
                            {data.moduleStats.map((s, i) => (
                                <div key={s.module} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="capitalize">{s.module}: {Math.round((s.sales/data.totalRevenue)*100)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
