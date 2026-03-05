
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
    updateSupply,
    uploadImage,
    getProductRecipes,
    saveProductRecipe
} from "@/services/hotel-service";
import type { Product, HotelModule, Supply, SupplyConsumption } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Search, Trash2, Edit, ChevronLeft, ChevronRight, Upload, Loader2, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
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

export const dynamic = 'force-dynamic';

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [recipes, setRecipes] = useState<Record<string, SupplyConsumption[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState<HotelModule | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("products");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isSupplyDialogOpen, setIsSupplyDialogOpen] = useState(false);
    const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
    
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
    const [recipeProduct, setRecipeProduct] = useState<Product | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [targetItem, setTargetItem] = useState<{id: string, name: string, type: 'product' | 'supply' } | null>(null);

    const { toast } = useToast();
    const productForm = useForm<Omit<Product, 'id'>>();
    const supplyForm = useForm<Omit<Supply, 'id'>>();
    
    const [currentRecipe, setCurrentRecipe] = useState<SupplyConsumption[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [prodData, suppData, recipeData] = await Promise.all([
                getProducts(activeModule === 'all' ? undefined : activeModule),
                getSupplies(activeModule === 'all' ? undefined : activeModule),
                getProductRecipes()
            ]);
            setProducts(prodData);
            setSupplies(suppData);
            setRecipes(recipeData);
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
            productForm.reset({ ...product });
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
                image_url: ''
            });
        }
        setIsProductDialogOpen(true);
    };

    const handleOpenSupplyDialog = (supply?: Supply) => {
        if (supply) {
            setEditingSupply(supply);
            supplyForm.reset({ ...supply });
        } else {
            setEditingSupply(null);
            supplyForm.reset({
                name: '',
                category: 'Supplies',
                module: 'restaurant',
                quantity: 0,
                unit: 'kg',
                unitCost: 0,
                lastPurchased: new Date().toISOString()
            });
        }
        setIsSupplyDialogOpen(true);
    };

    const handleOpenRecipeDialog = (product: Product) => {
        setRecipeProduct(product);
        setCurrentRecipe(recipes[product.id] || []);
        setIsRecipeDialogOpen(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            productForm.setValue('image_url', url);
            toast({ title: "Image Uploaded" });
        } catch (err) {
            toast({ variant: "destructive", title: "Upload Failed" });
        } finally {
            setIsUploading(false);
        }
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
            setTimeout(() => loadData(), 100);
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
            setTimeout(() => loadData(), 100);
        } catch (error) {
            toast({ variant: "destructive", title: "Operation Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onRecipeSubmit = async () => {
        if (!recipeProduct) return;
        setIsSubmitting(true);
        try {
            await saveProductRecipe(recipeProduct.id, currentRecipe.filter(r => r.supplyId && r.amount > 0));
            toast({ title: "Recipe Saved", description: `Production mappings for ${recipeProduct.name} updated.` });
            setIsRecipeDialogOpen(false);
            loadData();
        } catch (err) {
            toast({ variant: "destructive", title: "Failed to save recipe" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!targetItem) return;
        try {
            if (targetItem.type === 'product') {
                await deleteProducts([targetItem.id]);
            } else {
                await deleteSupplies([targetItem.id]);
            }
            toast({ title: "Item Removed" });
            await loadData();
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setTargetItem(null);
        }
    };

    const filteredProducts = useMemo(() => 
        products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [products, searchQuery]);

    const filteredSupplies = useMemo(() => 
        supplies.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [supplies, searchQuery]);

    const totalPages = useMemo(() => {
        const count = activeTab === 'supplies' ? filteredSupplies.length : filteredProducts.length;
        return Math.max(1, Math.ceil(count / ITEMS_PER_PAGE));
    }, [activeTab, filteredProducts.length, filteredSupplies.length]);

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
                <h1 className="text-3xl font-bold tracking-tight font-headline">Inventory Control</h1>
                <p className="text-muted-foreground">Manage products, stock levels and raw supplies.</p>
            </div>

            <Tabs defaultValue="products" value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="products">Master Stock</TabsTrigger>
                        <TabsTrigger value="supplies">Raw Supplies Ledger</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search inventory..." className="pl-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
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
                            <Button onClick={() => handleOpenProductDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Product</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}><TableCell colSpan={5} className="h-12 animate-pulse bg-muted/10" /></TableRow>
                                        ))
                                    ) : paginatedProducts.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">No products found.</TableCell></TableRow>
                                    ) : paginatedProducts.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-bold">{p.name}</TableCell>
                                            <TableCell className="capitalize text-xs text-muted-foreground">{p.module}</TableCell>
                                            <TableCell>{formatPrice(p.price)}</TableCell>
                                            <TableCell>
                                              <Badge variant={p.stock <= p.minStockLevel ? "destructive" : "outline"} className="font-mono">
                                                {p.stock} {p.unit}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" title="Manage Recipe" onClick={() => handleOpenRecipeDialog(p)}>
                                                    <UtensilsCrossed className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenProductDialog(p)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setTargetItem({id: p.id, name: p.name, type: 'product'})}><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                            <Button onClick={() => handleOpenSupplyDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Supply
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Supply</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}><TableCell colSpan={4} className="h-12 animate-pulse bg-muted/10" /></TableRow>
                                        ))
                                    ) : paginatedSupplies.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No supplies found.</TableCell></TableRow>
                                    ) : paginatedSupplies.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-bold">{s.name}</TableCell>
                                            <TableCell>{s.quantity} {s.unit}</TableCell>
                                            <TableCell>{formatPrice(s.unitCost)}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenSupplyDialog(s)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setTargetItem({id: s.id, name: s.name, type: 'supply'})}><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <Dialog open={isProductDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsProductDialogOpen(open); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input {...productForm.register('name', { required: true })} disabled={isSubmitting} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Selling Price (Ksh)</Label>
                                <Input type="number" {...productForm.register('price', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Cost Price (Ksh)</Label>
                                <Input type="number" {...productForm.register('costPrice', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Current Stock</Label>
                                <Input type="number" step="0.01" {...productForm.register('stock', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Measurement Unit</Label>
                                <Input {...productForm.register('unit', { required: true })} placeholder="e.g. bottles, plates, KG" disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Module</Label>
                                <Select value={productForm.watch('module')} onValueChange={(v) => productForm.setValue('module', v as any)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                        <SelectItem value="carwash">Car Wash</SelectItem>
                                        <SelectItem value="accommodation">Rooms</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Min Stock Level (Alert)</Label>
                                <Input type="number" {...productForm.register('minStockLevel', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL / Upload</Label>
                            <div className="flex gap-2">
                                <Input {...productForm.register('image_url')} disabled={isSubmitting || isUploading} className="flex-1" />
                                <div className="relative">
                                    <input type="file" onChange={handleFileUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer disabled:hidden" />
                                    <Button type="button" variant="outline" size="icon" disabled={isUploading}>
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsProductDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>Save Product</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isSupplyDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsSupplyDialogOpen(open); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>{editingSupply ? 'Edit Supply' : 'Add New Supply'}</DialogTitle></DialogHeader>
                    <form onSubmit={supplyForm.handleSubmit(onSupplySubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Supply Name</Label>
                            <Input {...supplyForm.register('name', { required: true })} disabled={isSubmitting} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" step="0.001" {...supplyForm.register('quantity', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Input {...supplyForm.register('unit', { required: true })} placeholder="e.g. kg, liters" disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Unit Cost (Ksh)</Label>
                                <Input type="number" {...supplyForm.register('unitCost', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Module</Label>
                                <Select value={supplyForm.watch('module') || 'restaurant'} onValueChange={(v) => supplyForm.setValue('module', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                        <SelectItem value="carwash">Car Wash</SelectItem>
                                        <SelectItem value="accommodation">Rooms</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsSupplyDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>Save Supply</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Production Recipe: {recipeProduct?.name}</DialogTitle>
                        <DialogDescription>Link this product to raw materials consumed during production.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-3">
                            {currentRecipe.map((rcp, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <Select 
                                        value={rcp.supplyId} 
                                        onValueChange={(v) => {
                                            const next = [...currentRecipe];
                                            next[idx].supplyId = v;
                                            setCurrentRecipe(next);
                                        }}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select Supply" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {supplies.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.unit})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Input 
                                        type="number" 
                                        step="0.001" 
                                        className="w-24" 
                                        placeholder="Qty" 
                                        value={rcp.amount} 
                                        onChange={(e) => {
                                            const next = [...currentRecipe];
                                            next[idx].amount = parseFloat(e.target.value) || 0;
                                            setCurrentRecipe(next);
                                        }}
                                    />
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                        setCurrentRecipe(prev => prev.filter((_, i) => i !== idx));
                                    }}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setCurrentRecipe([...currentRecipe, { supplyId: '', amount: 0 }])}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRecipeDialogOpen(false)}>Cancel</Button>
                        <Button onClick={onRecipeSubmit} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Recipe
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!targetItem} onOpenChange={() => setTargetItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Confirm Delete</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-white">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
