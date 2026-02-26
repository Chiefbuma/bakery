
'use client';

import { useState, useEffect } from "react";
import { getExpenses, addExpense } from "@/services/hotel-service";
import type { Expense, HotelModule } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Wallet, Receipt, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const load = async () => {
        const data = await getExpenses();
        setExpenses(data);
    };

    useEffect(() => { load(); }, []);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            await addExpense({
                category: formData.get('category') as any,
                amount: parseFloat(formData.get('amount') as string),
                description: formData.get('description') as string,
                module: formData.get('module') as HotelModule,
                date: new Date().toISOString(),
            });
            await load();
            setIsAddOpen(false);
            toast({ title: "Expense Recorded" });
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to save" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Operating Expenses</h1>
                <p className="text-muted-foreground">Track salaries, utilities, and other overhead costs.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>Overhead Ledger</CardTitle>
                        <CardDescription>Daily and recurring operational costs.</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Record Expense
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell className="text-xs">{new Date(e.date).toLocaleDateString()}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{e.category}</Badge></TableCell>
                                        <TableCell className="font-medium">{e.description}</TableCell>
                                        <TableCell className="capitalize text-muted-foreground">{e.module}</TableCell>
                                        <TableCell className="text-right font-bold text-destructive">-{formatPrice(e.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Expense Entry</DialogTitle></DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Category</Label>
                                <Select name="category" defaultValue="utility">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="salary">Salaries</SelectItem>
                                        <SelectItem value="utility">Utilities (Power/Water)</SelectItem>
                                        <SelectItem value="rent">Rent</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="garbage">Garbage Collection</SelectItem>
                                        <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Amount (Ksh)</Label><Input name="amount" type="number" required /></div>
                        </div>
                        <div className="space-y-2"><Label>Description</Label><Input name="description" placeholder="e.g. Nairobi Water Jan Bill" required /></div>
                        <div className="space-y-2"><Label>Attributed Module</Label>
                            <Select name="module" defaultValue="general">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General (Entire Hotel)</SelectItem>
                                    <SelectItem value="restaurant">Restaurant</SelectItem>
                                    <SelectItem value="bar">Bar</SelectItem>
                                    <SelectItem value="carwash">Car Wash</SelectItem>
                                    <SelectItem value="accommodation">Accommodation</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>Record Entry</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
