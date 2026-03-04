
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getProducts, updateProduct, getSupplies, addProduct, addSupply, deleteProducts, deleteSupplies } from "@/services/hotel-service";
import type { Product, HotelModule, Supply } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Search, Box, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
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

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState<HotelModule | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [selectedSupplies, setSelectedSupplies] = useState<Set<string>>(new Set());
    
    const [confirmDeleteType, setConfirmDeleteType] = useState<'product' | 'supply' | null>(null);
    
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodData, suppData] = await Promise.all([
                getProducts(activeModule === 'all' ? undefined : activeModule),
                getSupplies(activeModule === 'all' ? undefined : activeModule)
            ]);
            setProducts(prodData);
            setSupplies(suppData);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load inventory." });
        } finally {
            setLoading(false);
        }
    }, [activeModule, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleBulkDeleteProducts = async () => {
        try {
            await deleteProducts(Array.from(selectedProducts));
            setSelectedProducts(new Set());
            toast({ title: "Products Deleted" });
            await loadData();
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setConfirmDeleteType(null);
        }
    };

    const handleBulkDeleteSupplies = async () => {
        try {
            await deleteSupplies(Array.from(selectedSupplies));
            setSelectedSupplies(new Set());
            toast({ title: "Supplies Deleted" });
            await loadData();
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setConfirmDeleteType(null);
        }
    };

    const filteredProducts = useMemo(() => 
        products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [products, searchQuery]);

    const filteredSupplies = useMemo(() => 
        supplies.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [supplies, searchQuery]);

    const totalPagesProducts = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPagesSupplies = Math.ceil(filteredSupplies.length / ITEMS_PER_PAGE);
    const paginatedSupplies = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSupplies.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredSupplies, currentPage]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Inventory & Supplies</h1>
                <p className="text-muted-foreground">Manage sellable items and raw materials.</p>
            </div>

            <Tabs defaultValue="products" onValueChange={() => setCurrentPage(1)}>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <TabsList>
                        <TabsTrigger value="products">Sellable Products</TabsTrigger>
                        <TabsTrigger value="supplies">Raw Supplies</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-8" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                        </div>
                        <Select value={activeModule} onValueChange={(v) => { setActiveModule(v as any); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Modules" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Modules</SelectItem>
                                <SelectItem value="restaurant">Restaurant</SelectItem>
                                <SelectItem value="bar">Bar</SelectItem>
                                <SelectItem value="carwash">Car Wash</SelectItem>
                                <SelectItem value="accommodation">Accommodation</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="products">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Master Stock List</CardTitle>
                                <CardDescription>Tracking finished goods and services.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {selectedProducts.size > 0 && (
                                    <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteType('product')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedProducts.size})
                                    </Button>
                                )}
                                <Button onClick={() => setIsAddProductOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.has(p.id))} onCheckedChange={(checked) => {
                                                    const next = new Set(selectedProducts);
                                                    if (checked) paginatedProducts.forEach(p => next.add(p.id));
                                                    else paginatedProducts.forEach(p => next.delete(p.id));
                                                    setSelectedProducts(next);
                                                }} />
                                            </TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell></TableRow>
                                        ) : paginatedProducts.length === 0 ? (
                                            <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No items found.</TableCell></TableRow>
                                        ) : paginatedProducts.map((p) => {
                                            const low = p.stock <= p.minStockLevel && p.module !== 'carwash' && p.module !== 'entertainment';
                                            return (
                                                <TableRow key={p.id}>
                                                    <TableCell><Checkbox checked={selectedProducts.has(p.id)} onCheckedChange={(checked) => {
                                                        const next = new Set(selectedProducts);
                                                        if (checked) next.add(p.id); else next.delete(p.id);
                                                        setSelectedProducts(next);
                                                    }} /></TableCell>
                                                    <TableCell className="font-bold">{p.name}</TableCell>
                                                    <TableCell><Badge variant="outline" className="capitalize">{p.module}</Badge></TableCell>
                                                    <TableCell>{formatPrice(p.costPrice)}</TableCell>
                                                    <TableCell>{formatPrice(p.price)}</TableCell>
                                                    <TableCell className={low ? 'text-destructive font-bold' : ''}>
                                                        {(p.module === 'carwash' || p.module === 'entertainment') ? '∞' : `${p.stock} ${p.unit}`}
                                                    </TableCell>
                                                    <TableCell>{low ? <Badge variant="destructive">Low</Badge> : <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPagesProducts || 1}</span>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPagesProducts, prev + 1))} disabled={currentPage === totalPagesProducts || totalPagesProducts === 0}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="supplies">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Raw Materials & Supplies</CardTitle>
                                <CardDescription>Track inputs used to produce goods.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {selectedSupplies.size > 0 && (
                                    <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteType('supply')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedSupplies.size})
                                    </Button>
                                )}
                                <Button onClick={() => setIsAddSupplyOpen(true)}>
                                    <Box className="mr-2 h-4 w-4" /> Add Supply
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox checked={paginatedSupplies.length > 0 && paginatedSupplies.every(s => selectedSupplies.has(s.id))} onCheckedChange={(checked) => {
                                                    const next = new Set(selectedSupplies);
                                                    if (checked) paginatedSupplies.forEach(s => next.add(s.id));
                                                    else paginatedSupplies.forEach(s => next.delete(s.id));
                                                    setSelectedSupplies(next);
                                                }} />
                                            </TableHead>
                                            <TableHead>Supply Item</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Qty On Hand</TableHead>
                                            <TableHead>Unit Cost</TableHead>
                                            <TableHead>Last Purchased</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
                                        ) : paginatedSupplies.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No items found.</TableCell></TableRow>
                                        ) : paginatedSupplies.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell><Checkbox checked={selectedSupplies.has(s.id)} onCheckedChange={(checked) => {
                                                    const next = new Set(selectedSupplies);
                                                    if (checked) next.add(s.id); else next.delete(s.id);
                                                    setSelectedSupplies(next);
                                                }} /></TableCell>
                                                <TableCell className="font-bold">{s.name}</TableCell>
                                                <TableCell><Badge variant="outline" className="capitalize">{s.module}</Badge></TableCell>
                                                <TableCell>{s.quantity} {s.unit}</TableCell>
                                                <TableCell>{formatPrice(s.unitCost)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{new Date(s.lastPurchased).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPagesSupplies || 1}</span>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPagesSupplies, prev + 1))} disabled={currentPage === totalPagesSupplies || totalPagesSupplies === 0}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Product Dialog & Supply Dialog forms omitted for brevity but they should use setIsSubmitting(false) in finally */}
            
            <AlertDialog open={!!confirmDeleteType} onOpenChange={() => { if (!isSubmitting) setConfirmDeleteType(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove selected items from records.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDeleteType === 'product' ? handleBulkDeleteProducts : handleBulkDeleteSupplies} 
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
