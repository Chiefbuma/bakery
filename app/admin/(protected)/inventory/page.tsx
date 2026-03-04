
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getProducts, getSupplies, deleteProducts, deleteSupplies, addProduct, addSupply } from "@/services/hotel-service";
import type { Product, HotelModule, Supply } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Search, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
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
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [selectedSupplies, setSelectedSupplies] = useState<Set<string>>(new Set());
    const [confirmDeleteType, setConfirmDeleteType] = useState<'product' | 'supply' | null>(null);
    
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [prodData, suppData] = await Promise.all([
                getProducts(activeModule === 'all' ? undefined : activeModule),
                getSupplies(activeModule === 'all' ? undefined : activeModule)
            ]);
            setProducts(prodData);
            setSupplies(suppData);
        } catch (error) {
            toast({ variant: "destructive", title: "Error loading inventory" });
        } finally {
            setLoading(false);
        }
    }, [activeModule, toast]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleBulkDelete = async () => {
        const type = confirmDeleteType;
        if (!type) return;
        
        try {
            if (type === 'product') {
                await deleteProducts(Array.from(selectedProducts));
                setSelectedProducts(new Set());
            } else {
                await deleteSupplies(Array.from(selectedSupplies));
                setSelectedSupplies(new Set());
            }
            toast({ title: `${type === 'product' ? 'Products' : 'Supplies'} Deleted` });
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

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const paginatedSupplies = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSupplies.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredSupplies, currentPage]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Inventory Control</h1>
                <p className="text-muted-foreground">Manage products, stock levels and raw supplies.</p>
            </div>

            <Tabs defaultValue="products" onValueChange={() => setCurrentPage(1)}>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <TabsList>
                        <TabsTrigger value="products">Master Stock</TabsTrigger>
                        <TabsTrigger value="supplies">Raw Supplies</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                                <SelectItem value="accommodation">Rooms</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="products">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Sellable Products</CardTitle>
                                <CardDescription>Retail items and hotel services.</CardDescription>
                            </div>
                            {selectedProducts.size > 0 && (
                                <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteType('product')}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedProducts.size})
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox 
                                                    checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.has(p.id))} 
                                                    onCheckedChange={(checked) => {
                                                        const next = new Set(selectedProducts);
                                                        if (checked) paginatedProducts.forEach(p => next.add(p.id));
                                                        else paginatedProducts.forEach(p => next.delete(p.id));
                                                        setSelectedProducts(next);
                                                    }} 
                                                />
                                            </TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                                        ) : paginatedProducts.map((p) => {
                                            const isLow = p.stock <= p.minStockLevel && p.module !== 'carwash' && p.module !== 'entertainment';
                                            return (
                                                <TableRow key={p.id}>
                                                    <TableCell>
                                                        <Checkbox 
                                                            checked={selectedProducts.has(p.id)} 
                                                            onCheckedChange={(checked) => {
                                                                const next = new Set(selectedProducts);
                                                                if (checked) next.add(p.id); else next.delete(p.id);
                                                                setSelectedProducts(next);
                                                            }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-bold">{p.name}</TableCell>
                                                    <TableCell className="capitalize text-xs text-muted-foreground">{p.module}</TableCell>
                                                    <TableCell>{formatPrice(p.price)}</TableCell>
                                                    <TableCell>{(p.module === 'carwash' || p.module === 'entertainment') ? '∞' : `${p.stock} ${p.unit}`}</TableCell>
                                                    <TableCell>{isLow ? <Badge variant="destructive">Low</Badge> : <Badge variant="secondary" className="bg-green-50 text-green-700">OK</Badge>}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="supplies">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Raw Supplies Ledger</CardTitle>
                                <CardDescription>Consumables used in production.</CardDescription>
                            </div>
                            {selectedSupplies.size > 0 && (
                                <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteType('supply')}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedSupplies.size})
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox 
                                                    checked={paginatedSupplies.length > 0 && paginatedSupplies.every(s => selectedSupplies.has(s.id))} 
                                                    onCheckedChange={(checked) => {
                                                        const next = new Set(selectedSupplies);
                                                        if (checked) paginatedSupplies.forEach(s => next.add(s.id));
                                                        else paginatedSupplies.forEach(s => next.delete(s.id));
                                                        setSelectedSupplies(next);
                                                    }} 
                                                />
                                            </TableHead>
                                            <TableHead>Supply</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Cost</TableHead>
                                            <TableHead>Last Purchased</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
                                        ) : paginatedSupplies.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell>
                                                    <Checkbox checked={selectedSupplies.has(s.id)} onCheckedChange={(checked) => {
                                                        const next = new Set(selectedSupplies);
                                                        if (checked) next.add(s.id); else next.delete(s.id);
                                                        setSelectedSupplies(next);
                                                    }} />
                                                </TableCell>
                                                <TableCell className="font-bold">{s.name}</TableCell>
                                                <TableCell>{s.quantity} {s.unit}</TableCell>
                                                <TableCell>{formatPrice(s.unitCost)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{new Date(s.lastPurchased).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!confirmDeleteType} onOpenChange={() => setConfirmDeleteType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm deletion?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove selected inventory records permanently.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete Selected</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
