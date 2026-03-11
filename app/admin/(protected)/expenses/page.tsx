'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getExpenses, addExpense, deleteExpenses, updateExpense } from "@/services/hotel-service";
import type { Expense, HotelModule } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Trash2, Edit, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [targetExpense, setTargetExpense] = useState<{id: string, description: string} | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const { toast } = useToast();
    const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<Expense, 'id'>>();

    const load = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await getExpenses();
            setExpenses(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load expenses" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleOpenDialog = (expense?: Expense) => {
        if (expense) {
            setEditingExpense(expense);
            reset({ ...expense });
        } else {
            setEditingExpense(null);
            reset({
                category: 'miscellaneous',
                amount: 0,
                description: '',
                date: new Date().toISOString().split('T')[0],
                module: 'general'
            });
        }
        setIsDialogOpen(true);
    };

    const onFormSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingExpense) {
                await updateExpense(editingExpense.id, data);
                toast({ title: "Expense Updated" });
            } else {
                await addExpense(data);
                toast({ title: "Expense Recorded" });
            }
            setIsDialogOpen(false);
            load(true);
        } catch (error) {
            toast({ variant: "destructive", title: "Operation Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async () => {
        if (!targetExpense) return;
        try {
            await deleteExpenses([targetExpense.id]);
            load(true);
            toast({ title: "Expense Cleared" });
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setTargetExpense(null);
        }
    };

    const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
    const paginatedExpenses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return expenses.slice(start, start + ITEMS_PER_PAGE);
    }, [expenses, currentPage]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Operating Expenses</h1>
                    <p className="text-muted-foreground">Track utilities, salaries, and other overhead costs.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Record Expense
                </Button>
            </div>

            <Card className="shadow-sm border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg uppercase">Overhead Ledger</CardTitle>
                    <CardDescription>Departmental and general operating costs.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="font-bold">Description</TableHead>
                                <TableHead className="font-bold">Department</TableHead>
                                <TableHead className="text-right font-bold">Amount</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="h-16 animate-pulse bg-muted/20" /></TableRow>)
                            ) : paginatedExpenses.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">No expense records found.</TableCell></TableRow>
                            ) : paginatedExpenses.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell className="font-mono text-xs">{new Date(e.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{e.description}</TableCell>
                                    <TableCell className="capitalize text-muted-foreground">{e.module}</TableCell>
                                    <TableCell className="text-right font-bold text-destructive">-{formatPrice(e.amount)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" className="text-primary" onClick={() => handleOpenDialog(e)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setTargetExpense({id: e.id, description: e.description})}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? 'Edit Expense Record' : 'Record New Expense'}</DialogTitle>
                        <DialogDescription>Classify operational overhead for P&L reporting.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <input {...register('description', { required: true })} disabled={isSubmitting} placeholder="e.g. Water Bill, Staff Salaries" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount (Ksh)</Label>
                                <input type="number" {...register('amount', { required: true, valueAsNumber: true })} disabled={isSubmitting} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={watch('category') || 'miscellaneous'} onValueChange={(v) => setValue('category', v as any)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="salary">Salary/Wages</SelectItem>
                                        <SelectItem value="utility">Utilities</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="rent">Rent</SelectItem>
                                        <SelectItem value="garbage">Garbage Collection</SelectItem>
                                        <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Allocated Department</Label>
                            <Select value={watch('module') || 'general'} onValueChange={(v) => setValue('module', v as HotelModule)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="restaurant">Restaurant</SelectItem>
                                    <SelectItem value="bar">Bar</SelectItem>
                                    <SelectItem value="carwash">Car Wash</SelectItem>
                                    <SelectItem value="accommodation">Accommodation</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                    <SelectItem value="general">General / Administration</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Expense</Label>
                            <input type="date" {...register('date', { required: true })} disabled={isSubmitting} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="gap-2">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Save Record
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!targetExpense} onOpenChange={(open) => !open && setTargetExpense(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense Record?</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to permanently remove this record? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteExpense} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
