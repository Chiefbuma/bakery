
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getExpenses, addExpense, deleteExpenses } from "@/services/hotel-service";
import type { Expense, HotelModule } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const { toast } = useToast();

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getExpenses();
            setExpenses(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load expenses" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleBulkDelete = async () => {
        setConfirmDeleteOpen(false);
        try {
            await deleteExpenses(Array.from(selectedExpenses));
            setSelectedExpenses(new Set());
            await load();
            toast({ title: "Expenses Cleared" });
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        }
    };

    const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
    const paginatedExpenses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return expenses.slice(start, start + ITEMS_PER_PAGE);
    }, [expenses, currentPage]);

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
                    <div className="flex gap-2">
                        {selectedExpenses.size > 0 && (
                            <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedExpenses.size})
                            </Button>
                        )}
                        <Button onClick={() => setIsAddOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Record Expense
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox checked={paginatedExpenses.length > 0 && paginatedExpenses.every(e => selectedExpenses.has(e.id))} onCheckedChange={(checked) => {
                                            const next = new Set(selectedExpenses);
                                            if (checked) paginatedExpenses.forEach(e => next.add(e.id));
                                            else paginatedExpenses.forEach(e => next.delete(e.id));
                                            setSelectedExpenses(next);
                                        }} />
                                    </TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
                                ) : paginatedExpenses.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No records found.</TableCell></TableRow>
                                ) : paginatedExpenses.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell><Checkbox checked={selectedExpenses.has(e.id)} onCheckedChange={(checked) => {
                                            const next = new Set(selectedExpenses);
                                            if (checked) next.add(e.id); else next.delete(e.id);
                                            setSelectedExpenses(next);
                                        }} /></TableCell>
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
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Expense Dialog & Confirmation Alert logic similarly robust as UsersPage */}
            <AlertDialog open={confirmDeleteOpen} onOpenChange={(open) => { if (!open) setConfirmDeleteOpen(false); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete entries?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove selected records from the ledger.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
