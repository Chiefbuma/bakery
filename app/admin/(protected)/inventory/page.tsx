
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
    getProducts, 
    getSupplies, 
    deleteProducts, 
    deleteSupplies, 
    addProduct, 
    addSupply, 
    updateProduct, 
    updateSupply 
} from "@/services/hotel-service";
import type { Product, HotelModule, Supply } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Search, Loader2, Trash2, MoreHorizontal, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
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
    const ITEMS_PER_PAGE = 8;

    // Selection & Actions
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [selectedSupplies, setSelectedSupplies] = useState<Set<string>>(new Set());
    const [confirmDeleteType, setConfirmDeleteType] = useState<'product' | 'supply' | null>(null);
    
    // Dialog States
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isSupplyDialogOpen, setIsSupplyDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast } = useToast();
    
    const productForm = useForm<Omit<Product, 'id'>>();
    const supplyForm = useForm<Omit<Supply, 'id'>>();

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

    const handleOpenProductDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            productForm.reset({
                name: product.name,
                description: product.description,
                category: product.category,
                module: product.module,
                price: product.price,
                costPrice: product.costPrice,
                stock: product.stock,
                minStockLevel: product.minStockLevel,
                unit: product.unit,
                image_url: product.image_url
            });
        } else {
            setEditingProduct(null);
            productForm.reset({
                name: '',
                description: '',
                category: 'General',
                module: 'restaurant',
                price: 0,
                costPrice: 0,
                stock: 0,
                minStockLevel: 5,
                unit: 'units',
                image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
            });
        }
        setIsProductDialogOpen(true);
    };

    const handleOpenSupplyDialog = (supply?: Supply) => {
        if (supply) {
            setEditingSupply(supply);
            supplyForm.reset({
                name: supply.name,
                category: supply.category,
                module: supply.module,
                quantity: supply.quantity,
                unit: supply.unit,
                unitCost: supply.unitCost,
                lastPurchased: supply.lastPurchased
            });
        } else {
            setEditingSupply(null);
            supplyForm.reset({
                name: '',
                category: 'Supplies',
                module: 'restaurant',
                quantity: 0,
                unit: 'units',
                unitCost: 0,
                lastPurchased: new Date().toISOString()
            });
        }
        setIsSupplyDialogOpen(true);
    };

    const onProductSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, data);
                toast({ title: "Product Updated" });
            } else {
                await addProduct(data);
                toast({ title: "Product Added" });
            }
            setIsProductDialogOpen(false);
            await loadData();
        } catch (error) {
            toast({ variant: "destructive", title: "Operation Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSupplySubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingSupply) {
                await updateSupply(editingSupply.id, data);
                toast({ title: "Supply Updated" });
            } else {
                await addSupply(data);
                toast({ title: "Supply Added" });
            }
            setIsSupplyDialogOpen(false);
            await loadData();
        } catch (error) {
            toast({ variant: "destructive", title: "Operation Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

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

            <Tabs defaultValue="products" onValueChange={() => { setCurrentPage(1); setSelectedProducts(new Set()); setSelectedSupplies(new Set()); }}>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <TabsList>
                        <TabsTrigger value="products">Master Stock</TabsTrigger>
                        <TabsTrigger value="supplies">Raw Supplies</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search inventory..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                            <div className="space-y-1">
                                <CardTitle>Sellable Products</CardTitle>
                                <CardDescription>Retail items and hotel services.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {selectedProducts.size > 0 && (
                                    <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteType('product')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedProducts.size})
                                    </Button>
                                )}
                                <Button onClick={() => handleOpenProductDialog()}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
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
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading...</TableCell></TableRow>
                                        ) : paginatedProducts.length === 0 ? (
                                            <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>
                                        ) : paginatedProducts.map((p) => {
                                            const isLow = p.stock <= p.minStockLevel && p.module !== 'carwash' && p.module !== 'entertainment';
                                            return (
                                                <TableRow key={p.id} className={selectedProducts.has(p.id) ? "bg-primary/5" : ""}>
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
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleOpenProductDialog(p)}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedProducts(new Set([p.id])); setConfirmDeleteType('product'); }}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
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
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                            <div className="space-y-1">
                                <CardTitle>Raw Supplies Ledger</CardTitle>
                                <CardDescription>Consumables used in production.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {selectedSupplies.size > 0 && (
                                    <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteType('supply')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedSupplies.size})
                                    </Button>
                                )}
                                <Button onClick={() => handleOpenSupplyDialog()}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Supply
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
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
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
                                        ) : paginatedSupplies.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No supplies found.</TableCell></TableRow>
                                        ) : paginatedSupplies.map((s) => (
                                            <TableRow key={s.id} className={selectedSupplies.has(s.id) ? "bg-primary/5" : ""}>
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
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleOpenSupplyDialog(s)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedSupplies(new Set([s.id])); setConfirmDeleteType('supply'); }}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-xs text-muted-foreground">Page {currentPage}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => p + 1)} disabled={false}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Product Dialog */}
            <Dialog open={isProductDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsProductDialogOpen(open); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>Enter product details for the POS and inventory tracking.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Product Name</Label>
                                <Input {...productForm.register('name', { required: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Module</Label>
                                <Select defaultValue="restaurant" onValueChange={(v) => productForm.setValue('module', v as HotelModule)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                        <SelectItem value="carwash">Car Wash</SelectItem>
                                        <SelectItem value="accommodation">Rooms</SelectItem>
                                        <SelectItem value="entertainment">Entertainment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Selling Price (Ksh)</Label>
                                <Input type="number" {...productForm.register('price', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Cost Price (Ksh)</Label>
                                <Input type="number" {...productForm.register('costPrice', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Initial Stock</Label>
                                <Input type="number" {...productForm.register('stock', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setIsProductDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Product"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Supply Dialog */}
            <Dialog open={isSupplyDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsSupplyDialogOpen(open); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSupply ? 'Edit Supply' : 'Add Raw Supply'}</DialogTitle>
                        <DialogDescription>Track raw materials and production inputs.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={supplyForm.handleSubmit(onSupplySubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Supply Name</Label>
                            <Input {...supplyForm.register('name', { required: true })} disabled={isSubmitting} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" {...supplyForm.register('quantity', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit Cost (Ksh)</Label>
                                <Input type="number" {...supplyForm.register('unitCost', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setIsSupplyDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>Save Supply</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
