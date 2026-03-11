
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getAllTransactions, updateTransaction, deleteTransactions } from "@/services/hotel-service";
import type { Transaction } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice, cn } from "@/lib/utils";
import { Search, Trash2, Edit, ChevronLeft, ChevronRight, Loader2, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
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

export default function OrdersPage() {
    const [orders, setOrders] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingOrder, setEditingOrder] = useState<Transaction | null>(null);
    const [targetOrder, setTargetOrder] = useState<{id: string, orderNumber: string} | null>(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast } = useToast();

    const load = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setIsRefreshing(true);
            const data = await getAllTransactions();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load transaction ledger" });
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async () => {
        if (!targetOrder) return;
        try {
            await deleteTransactions([targetOrder.id]);
            toast({ title: "Transaction record deleted" });
            load(true);
        } catch (error) {
            toast({ variant: "destructive", title: "Deletion failed" });
        } finally {
            setTargetOrder(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setIsSubmitting(true);
        try {
            await deleteTransactions(selectedIds);
            toast({ title: `${selectedIds.length} records permanently removed` });
            setSelectedIds([]);
            load(true);
        } catch (error) {
            toast({ variant: "destructive", title: "Bulk deletion failed" });
        } finally {
            setIsSubmitting(false);
            setIsBulkDeleteOpen(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredOrders = useMemo(() => 
        orders.filter(o => 
            o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [orders, searchQuery]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    const toggleAllOnPage = () => {
        const pageIds = paginatedOrders.map(o => o.id);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">Transaction History</h1>
                    <p className="text-muted-foreground text-sm">Full audit log of all departmental sales and payments.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search ref / guest..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => load(true)} disabled={isRefreshing} className="h-9 w-9">
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-primary/10 overflow-hidden">
                <CardHeader className="py-4 bg-muted/30 border-b flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Master Transaction Ledger
                        </CardTitle>
                        <CardDescription className="text-xs">Historical financial data across all hotel modules.</CardDescription>
                    </div>
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteOpen(true)} className="gap-2 animate-in fade-in slide-in-from-right-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Selected ({selectedIds.length})
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="w-10">
                                        <Checkbox 
                                            checked={paginatedOrders.length > 0 && paginatedOrders.every(o => selectedIds.includes(o.id))}
                                            onCheckedChange={toggleAllOnPage}
                                        />
                                    </TableHead>
                                    <TableHead className="font-bold whitespace-nowrap text-[11px] uppercase">Order #</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase">Guest</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase">Module</TableHead>
                                    <TableHead className="font-bold text-right text-[11px] uppercase">Amount</TableHead>
                                    <TableHead className="font-bold text-right text-[11px] uppercase">Cost</TableHead>
                                    <TableHead className="font-bold text-right text-[11px] uppercase">Received</TableHead>
                                    <TableHead className="font-bold text-right text-[11px] uppercase">Balance</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase">Method</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase">Status</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase">Timestamp</TableHead>
                                    <TableHead className="text-right font-bold text-[11px] uppercase">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={12} className="h-12 animate-pulse bg-muted/20" /></TableRow>)
                                ) : paginatedOrders.length === 0 ? (
                                    <TableRow><TableCell colSpan={12} className="h-32 text-center text-muted-foreground italic">No transaction records found.</TableCell></TableRow>
                                ) : paginatedOrders.map((o) => (
                                    <TableRow key={o.id} className={cn(selectedIds.includes(o.id) && "bg-primary/5")}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedIds.includes(o.id)}
                                                onCheckedChange={() => toggleSelect(o.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-[10px] font-bold">{o.orderNumber}</TableCell>
                                        <TableCell className="font-medium whitespace-nowrap text-xs">{o.customerName || "Guest"}</TableCell>
                                        <TableCell className="capitalize text-[10px] font-bold text-muted-foreground">{o.module}</TableCell>
                                        <TableCell className="text-right font-black text-primary text-xs">{formatPrice(o.totalAmount)}</TableCell>
                                        <TableCell className="text-right text-[10px] text-muted-foreground">{formatPrice(o.totalCost)}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600 text-xs">{formatPrice(o.amountReceived || 0)}</TableCell>
                                        <TableCell className="text-right font-bold text-destructive text-xs">{formatPrice(o.balance || 0)}</TableCell>
                                        <TableCell className="capitalize text-[10px] font-bold">{o.paymentMethod}</TableCell>
                                        <TableCell>
                                            <Badge variant={o.status === 'paid' ? 'default' : 'destructive'} className="text-[9px] uppercase tracking-tighter h-5">
                                                {o.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {new Date(o.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setEditingOrder(o)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setTargetOrder({id: o.id, orderNumber: o.orderNumber})}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
                        <span className="text-xs text-muted-foreground font-medium">Page {currentPage} of {totalPages || 1} (5 records per page)</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Transaction</DialogTitle>
                        <DialogDescription>Adjust payment details for record {editingOrder?.orderNumber}</DialogDescription>
                    </DialogHeader>
                    {editingOrder && (
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Customer / Guest Name</Label>
                                <Input defaultValue={editingOrder.customerName} onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Settlement Status</Label>
                                    <Select value={editingOrder.status} onValueChange={(v) => setEditingOrder({...editingOrder, status: v as any})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Mode</Label>
                                    <Select value={editingOrder.paymentMethod} onValueChange={(v) => setEditingOrder({...editingOrder, paymentMethod: v as any})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="none">Pay Later</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
                                <Button onClick={async () => {
                                    setIsSubmitting(true);
                                    try {
                                        await updateTransaction(editingOrder.id, {
                                            customerName: editingOrder.customerName,
                                            status: editingOrder.status,
                                            paymentMethod: editingOrder.paymentMethod
                                        });
                                        toast({ title: "Audit record updated" });
                                        setEditingOrder(null);
                                        load(true);
                                    } catch (e) {
                                        toast({ variant: "destructive", title: "Failed to save audit changes" });
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Commit Changes
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!targetOrder} onOpenChange={(open) => !open && setTargetOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transaction Record?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently remove order {targetOrder?.orderNumber}? This will significantly affect historical financial reports.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                            <AlertDialogTitle>Permanent Bulk Removal</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            You have selected <strong>{selectedIds.length}</strong> transaction records. Deleting them will permanently remove them from the system and recalculate all financial dashboards. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Records</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Bulk Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
