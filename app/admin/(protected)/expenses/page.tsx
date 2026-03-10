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

export const dynamic = 'force-dynamic';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [targetExpense, setTargetExpense] = useState<{id: string, description: string} | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

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
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-tight font-headline">Operating Expenses</h1>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Track utilities, salaries and overhead.</p>
            </div>

            <Card className="shadow-sm border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between py-2.5 border-b">
                    <div className="space-y-0.5">
                        <CardTitle className="text-[11px] font-bold uppercase">Overhead Ledger</CardTitle>
                        <CardDescription className="text-[8px] font-bold uppercase">Departmental Costs</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => handleOpenDialog()} className="h-7 text-[9px] font-bold uppercase">
                        <PlusCircle className="mr-1 h-3 w-3" /> Record Expense
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 h-7">
                                <TableHead className="text-[9px] font-black uppercase">Date</TableHead>
                                <TableHead className="text-[9px] font-black uppercase">Description</TableHead>
                                <TableHead className="text-[9px] font-black uppercase">Dept</TableHead>
                                <TableHead className="text-right text-[9px] font-black uppercase">Amount</TableHead>
                                <TableHead className="text-right text-[9px] font-black uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="h-9 animate-pulse bg-muted/10" /></TableRow>)
                            ) : paginatedExpenses.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-20 text-center text-[9px] font-bold uppercase text-muted-foreground italic">No records.</TableCell></TableRow>
                            ) : paginatedExpenses.map((e) => (
                                <TableRow key={e.id} className="h-10">
                                    <TableCell className="text-[9px] font-mono">{new Date(e.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-bold text-[10px] truncate max-w-[150px]">{e.description}</TableCell>
                                    <TableCell className="capitalize text-[9px] font-bold text-muted-foreground">{e.module}</TableCell>
                                    <TableCell className="text-right font-black text-destructive text-[10px]">-{formatPrice(e.amount)}</TableCell>
                                    <TableCell className="text-right space-x-0.5">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => handleOpenDialog(e)}><Edit className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setTargetExpense({id: e.id, description: e.description})}><Trash2 className="h-3 w-3" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex items-center justify-between px-3 py-1.5 border-t bg-muted/10">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Page {currentPage} of {totalPages || 1}</span>
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}><ChevronLeft className="h-3 w-3" /></Button>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-3 w-3" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[340px] p-0 overflow-hidden">
                    <DialogHeader className="p-3 border-b bg-muted/10">
                        <DialogTitle className="text-[11px] font-bold uppercase">{editingExpense ? 'Edit Expense' : 'Record Expense'}</DialogTitle>
                        <DialogDescription className="text-[8px] font-bold uppercase">Classify operational overhead.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="p-3 space-y-2">
                        <div className="space-y-0.5">
                            <Label className="text-[9px] font-bold uppercase">Description</Label>
                            <input {...register('description', { required: true })} disabled={isSubmitting} placeholder="e.g. Water Bill" className="flex h-7 w-full rounded-md border border-input bg-background px-3 py-1 text-[10px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <Label className="text-[9px] font-bold uppercase">Amount (Ksh)</Label>
                                <input type="number" {...register('amount', { required: true, valueAsNumber: true })} disabled={isSubmitting} className="flex h-7 w-full rounded-md border border-input bg-background px-3 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-[9px] font-bold uppercase">Category</Label>
                                <Select value={watch('category') || 'miscellaneous'} onValueChange={(v) => setValue('category', v as any)}>
                                    <SelectTrigger className="h-7 text-[10px] font-bold uppercase"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="salary">SALARY</SelectItem>
                                        <SelectItem value="utility">UTILITY</SelectItem>
                                        <SelectItem value="maintenance">MAINTENANCE</SelectItem>
                                        <SelectItem value="rent">RENT</SelectItem>
                                        <SelectItem value="garbage">GARBAGE</SelectItem>
                                        <SelectItem value="miscellaneous">MISC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-[9px] font-bold uppercase">Department</Label>
                            <Select value={watch('module') || 'general'} onValueChange={(v) => setValue('module', v as HotelModule)}>
                                <SelectTrigger className="h-7 text-[10px] font-bold uppercase"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="restaurant">RESTAURANT</SelectItem>
                                    <SelectItem value="bar">BAR</SelectItem>
                                    <SelectItem value="carwash">CAR WASH</SelectItem>
                                    <SelectItem value="accommodation">ROOMS</SelectItem>
                                    <SelectItem value="entertainment">ENT.</SelectItem>
                                    <SelectItem value="general">GENERAL/ADMIN</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-[9px] font-bold uppercase">Date</Label>
                            <input type="date" {...register('date', { required: true })} disabled={isSubmitting} className="flex h-7 w-full rounded-md border border-input bg-background px-3 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                        </div>
                        <DialogFooter className="pt-2 gap-1.5">
                            <Button variant="outline" size="sm" type="button" onClick={() => setIsDialogOpen(false)} className="h-7 text-[9px] font-bold">CANCEL</Button>
                            <Button size="sm" type="submit" disabled={isSubmitting} className="flex-1 text-[9px] font-bold uppercase">
                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!targetExpense} onOpenChange={(open) => !open && setTargetExpense(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold uppercase">Delete Expense Record?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">Are you sure you want to permanently remove this record? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="text-[10px] font-bold uppercase h-8">CANCEL</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteExpense} className="bg-destructive text-white text-[10px] font-bold uppercase h-8 hover:bg-destructive/90">CONFIRM</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}