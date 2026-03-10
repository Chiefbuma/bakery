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
import { PlusCircle, Search, Trash2, Edit, ChevronLeft, ChevronRight, Upload, Loader2, UtensilsCrossed, PackageSearch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
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
                image_url: '',
                hasRecipe: false
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
        if (!data.hasRecipe && Number(data.costPrice) <= 0) {
            toast({ variant: "destructive", title: "Cost Price Required" });
            return;
        }
        setIsSubmitting(true);
        try {
            const finalData = { ...data, costPrice: data.hasRecipe ? 0 : Number(data.costPrice) };
            if (editingProduct) {
                await updateProduct(editingProduct.id, finalData);
                toast({ title: "Product Updated" });
            } else {
                await addProduct(finalData);
                toast({ title: "Product Created" });
            }
            setIsProductDialogOpen(false);
            loadData(true);
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
            loadData(true);
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
            toast({ title: "Recipe Saved" });
            setIsRecipeDialogOpen(false);
            loadData(true);
        } catch (err) {
            toast({ variant: "destructive", title: "Save Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!targetItem) return;
        try {
            if (targetItem.type === 'product') await deleteProducts([targetItem.id]);
            else await deleteSupplies([targetItem.id]);
            toast({ title: "Item Deleted" });
            loadData(true);
        } catch (error) {
            toast({ variant: "destructive", title: "Delete Failed" });
        } finally {
            setTargetItem(null);
        }
    };

    const filteredProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())), [products, searchQuery]);
    const filteredSupplies = useMemo(() => supplies.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())), [supplies, searchQuery]);
    const productsWithRecipes = useMemo(() => products.filter(p => p.hasRecipe && p.name.toLowerCase().includes(searchQuery.toLowerCase())), [products, searchQuery]);

    const totalPages = useMemo(() => {
        let count = 0;
        if (activeTab === 'supplies') count = filteredSupplies.length;
        else if (activeTab === 'recipes') count = productsWithRecipes.length;
        else count = filteredProducts.length;
        return Math.max(1, Math.ceil(count / ITEMS_PER_PAGE));
    }, [activeTab, filteredProducts.length, filteredSupplies.length, productsWithRecipes.length]);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        if (activeTab === 'supplies') return filteredSupplies.slice(start, start + ITEMS_PER_PAGE);
        if (activeTab === 'recipes') return productsWithRecipes.slice(start, start + ITEMS_PER_PAGE);
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [activeTab, filteredProducts, filteredSupplies, productsWithRecipes, currentPage]);

    const recipeTotalCost = useMemo(() => {
        return currentRecipe.reduce((acc, rcp) => {
            const supply = supplies.find(s => s.id === rcp.supplyId);
            return acc + (Number(rcp.amount || 0) * Number(supply?.unitCost || 0));
        }, 0);
    }, [currentRecipe, supplies]);

    const hasRecipeValue = productForm.watch('hasRecipe');

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight font-headline">Inventory Control</h1>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Manage sellable products, master stock, and production ingredients.</p>
            </div>

            <Tabs defaultValue="products" value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <TabsList className="bg-muted/50 p-0.5 h-9">
                        <TabsTrigger value="products" className="text-[10px] font-bold uppercase px-3">Master Stock</TabsTrigger>
                        <TabsTrigger value="supplies" className="text-[10px] font-bold uppercase px-3">Raw Supplies</TabsTrigger>
                        <TabsTrigger value="recipes" className="text-[10px] font-bold uppercase px-3">Recipes</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <div className="relative w-48">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Search..." className="h-8 pl-8 text-xs" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                        </div>
                        <Select value={activeModule} onValueChange={(v) => { setActiveModule(v as any); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-8 text-xs font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ALL DEPT</SelectItem>
                                <SelectItem value="restaurant">RESTAURANT</SelectItem>
                                <SelectItem value="bar">BAR</SelectItem>
                                <SelectItem value="carwash">CAR WASH</SelectItem>
                                <SelectItem value="accommodation">ROOMS</SelectItem>
                                <SelectItem value="entertainment">ENT.</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }}>
                        <Card className="shadow-sm border-primary/10">
                            <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-bold uppercase">{activeTab === 'supplies' ? 'Raw Supplies Ledger' : activeTab === 'recipes' ? 'Ingredient Mapping' : 'Sellable Products'}</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase">Departmental Inventory Tracking</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => activeTab === 'supplies' ? handleOpenSupplyDialog() : handleOpenProductDialog()} className="h-8 text-[10px] font-bold uppercase">
                                    <PlusCircle className="mr-1.5 h-3 w-3" /> {activeTab === 'supplies' ? 'Add Supply' : 'Add Product'}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 h-10">
                                            <TableHead className="text-[10px] font-black uppercase">Item</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase">{activeTab === 'supplies' ? 'Qty' : 'Type'}</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase">{activeTab === 'supplies' ? 'Unit Cost' : 'Price'}</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase">{activeTab === 'recipes' ? 'Cost of Sale' : 'Stock'}</TableHead>
                                            <TableHead className="text-right text-[10px] font-black uppercase">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="h-10 animate-pulse bg-muted/10" /></TableRow>)
                                        ) : paginatedItems.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10 text-[10px] uppercase font-bold text-muted-foreground italic">No matching records found.</TableCell></TableRow>
                                        ) : paginatedItems.map((item: any) => (
                                            <TableRow key={item.id} className="h-12">
                                                <TableCell className="font-bold text-xs">
                                                    <div>{item.name}</div>
                                                    <div className="text-[9px] text-muted-foreground uppercase">{item.module}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {activeTab === 'supplies' ? (
                                                        <span className="text-[11px] font-black">{item.quantity} {item.unit}</span>
                                                    ) : (
                                                        <Badge variant={item.hasRecipe ? "secondary" : "outline"} className="text-[9px] py-0 h-4">{item.hasRecipe ? "PROD" : "RETAIL"}</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-[11px] font-black">{formatPrice(activeTab === 'supplies' ? item.unitCost : item.price)}</TableCell>
                                                <TableCell>
                                                    {activeTab === 'recipes' ? (
                                                        <span className="text-[11px] font-black text-primary">{formatPrice((recipes[item.id] || []).reduce((acc, rcp) => {
                                                            const s = supplies.find(sup => sup.id === rcp.supplyId);
                                                            return acc + (Number(rcp.amount) * Number(s?.unitCost || 0));
                                                        }, 0))}</span>
                                                    ) : (
                                                        <Badge variant={item.stock <= item.minStockLevel ? "destructive" : "secondary"} className="text-[9px] py-0 h-4">
                                                            {item.stock} {item.unit}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    {activeTab === 'products' && item.hasRecipe && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => handleOpenRecipeDialog(item)}><UtensilsCrossed className="h-3 w-3" /></Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => activeTab === 'supplies' ? handleOpenSupplyDialog(item) : handleOpenProductDialog(item)}><Edit className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setTargetItem({id: item.id, name: item.name, type: activeTab === 'supplies' ? 'supply' : 'product'})}><Trash2 className="h-3 w-3" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Page {currentPage} of {totalPages}</span>
                                    <div className="flex gap-1">
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-3 w-3" /></Button>
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </Tabs>

            <Dialog open={isProductDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsProductDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-muted/10">
                        <DialogTitle className="text-sm font-bold uppercase">{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase">Master Stock Configuration</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Product Name</Label>
                                <Input {...productForm.register('name', { required: true })} disabled={isSubmitting} className="h-8 text-xs" />
                            </div>
                            <div className="col-span-2 space-y-2 p-3 bg-muted/20 rounded-md border">
                                <Label className="text-[9px] font-black uppercase">Type</Label>
                                <RadioGroup value={hasRecipeValue ? "production" : "retail"} onValueChange={(v) => productForm.setValue('hasRecipe', v === 'production')} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="retail" id="retail" className="h-3 w-3" />
                                        <Label htmlFor="retail" className="text-[11px] font-bold cursor-pointer">Retail</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="production" id="production" className="h-3 w-3" />
                                        <Label htmlFor="production" className="text-[11px] font-bold cursor-pointer">Production</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Selling Price</Label>
                                <Input type="number" {...productForm.register('price', { required: true, valueAsNumber: true })} disabled={isSubmitting} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label className={cn("text-[10px] font-bold uppercase", hasRecipeValue && "text-muted-foreground")}>Cost Price</Label>
                                <Input type="number" {...productForm.register('costPrice', { required: !hasRecipeValue, valueAsNumber: true })} disabled={isSubmitting || !!hasRecipeValue} className={cn("h-8 text-xs", hasRecipeValue && "bg-muted")} placeholder={hasRecipeValue ? "Recipe based" : "Cost"} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Stock Qty</Label>
                                <Input type="number" step="0.01" {...productForm.register('stock', { required: true, valueAsNumber: true })} disabled={isSubmitting} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Unit</Label>
                                <Input {...productForm.register('unit', { required: true })} placeholder="pcs, kg" disabled={isSubmitting} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Dept</Label>
                                <Select value={productForm.watch('module')} onValueChange={(v) => productForm.setValue('module', v as any)}>
                                    <SelectTrigger className="h-8 text-[11px] font-bold uppercase"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restaurant">RESTAURANT</SelectItem>
                                        <SelectItem value="bar">BAR</SelectItem>
                                        <SelectItem value="carwash">CAR WASH</SelectItem>
                                        <SelectItem value="accommodation">ROOMS</SelectItem>
                                        <SelectItem value="entertainment">ENT.</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Reorder Lvl</Label>
                                <Input type="number" {...productForm.register('minStockLevel', { required: true, valueAsNumber: true })} disabled={isSubmitting} className="h-8 text-xs" />
                            </div>
                        </div>
                        <DialogFooter className="pt-2 gap-2">
                            <Button variant="outline" size="sm" type="button" onClick={() => setIsProductDialogOpen(false)} className="text-[10px] font-bold">CANCEL</Button>
                            <Button size="sm" type="submit" disabled={isSubmitting} className="text-[10px] font-bold uppercase flex-1">
                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                                Save Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-muted/10">
                        <DialogTitle className="text-sm font-bold uppercase">Recipe: {recipeProduct?.name}</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase">Link production items to raw supplies.</DialogDescription>
                    </DialogHeader>
                    <div className="p-4 space-y-3">
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {currentRecipe.map((rcp, idx) => {
                                const supply = supplies.find(s => s.id === rcp.supplyId);
                                const lineCost = Number(rcp.amount || 0) * Number(supply?.unitCost || 0);
                                return (
                                    <div key={idx} className="flex flex-col gap-1.5 p-2 bg-muted/10 rounded border border-dashed border-primary/20">
                                        <div className="flex items-center gap-2">
                                            <Select value={rcp.supplyId} onValueChange={(v) => {
                                                const next = [...currentRecipe];
                                                next[idx].supplyId = v;
                                                setCurrentRecipe(next);
                                            }}>
                                                <SelectTrigger className="flex-1 h-8 text-[10px] font-bold uppercase"><SelectValue placeholder="Supply" /></SelectTrigger>
                                                <SelectContent>
                                                    {supplies.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.unit})</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Input type="number" step="0.001" className="w-20 h-8 text-xs font-bold" placeholder="Qty" value={rcp.amount} onChange={(e) => {
                                                const next = [...currentRecipe];
                                                next[idx].amount = parseFloat(e.target.value) || 0;
                                                setCurrentRecipe(next);
                                            }} />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setCurrentRecipe(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                        {lineCost > 0 && <div className="text-[9px] font-black text-primary text-right uppercase tracking-tighter">Line Cost: {formatPrice(lineCost)}</div>}
                                    </div>
                                );
                            })}
                        </div>
                        <Button variant="outline" size="sm" className="w-full border-dashed text-[10px] font-bold uppercase h-9" onClick={() => setCurrentRecipe([...currentRecipe, { supplyId: '', amount: 0 }])}>
                            <PlusCircle className="mr-1.5 h-3 w-3" /> Add Ingredient
                        </Button>
                        <div className="p-3 bg-primary/5 rounded-md border border-primary/20 flex justify-between items-center">
                            <span className="font-black uppercase text-[10px]">Production COGS</span>
                            <span className="text-base font-black text-primary">{formatPrice(recipeTotalCost)}</span>
                        </div>
                    </div>
                    <DialogFooter className="p-4 bg-muted/10 border-t gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsRecipeDialogOpen(false)} className="text-[10px] font-bold">CANCEL</Button>
                        <Button size="sm" onClick={onRecipeSubmit} disabled={isSubmitting} className="text-[10px] font-bold uppercase flex-1">
                            {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                            Commit Recipe
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isSupplyDialogOpen} onOpenChange={(open) => { if(!isSubmitting) setIsSupplyDialogOpen(open); }}>
                <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-muted/10">
                        <DialogTitle className="text-sm font-bold uppercase">{editingSupply ? 'Edit Supply' : 'Add Supply'}</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase">Raw Material Inventory</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={supplyForm.handleSubmit(onSupplySubmit)} className="p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase">Supply Name</Label>
                            <Input {...supplyForm.register('name', { required: true })} disabled={isSubmitting} className="h-8 text-xs" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Quantity</Label>
                                <Input type="number" step="0.001" {...supplyForm.register('quantity', { required: true, valueAsNumber: true })} disabled={isSubmitting} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Unit</Label>
                                <Input {...supplyForm.register('unit', { required: true })} placeholder="kg, L" disabled={isSubmitting} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Unit Cost</Label>
                                <Input type="number" {...supplyForm.register('unitCost', { required: true, valueAsNumber: true })} disabled={isSubmitting} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase">Dept</Label>
                                <Select value={supplyForm.watch('module') || 'restaurant'} onValueChange={(v) => supplyForm.setValue('module', v)}>
                                    <SelectTrigger className="h-8 text-[11px] font-bold uppercase"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restaurant">RESTAURANT</SelectItem>
                                        <SelectItem value="bar">BAR</SelectItem>
                                        <SelectItem value="carwash">CAR WASH</SelectItem>
                                        <SelectItem value="accommodation">ROOMS</SelectItem>
                                        <SelectItem value="entertainment">ENT.</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="pt-2 gap-2">
                            <Button variant="outline" size="sm" type="button" onClick={() => setIsSupplyDialogOpen(false)} className="text-[10px] font-bold">CANCEL</Button>
                            <Button size="sm" type="submit" disabled={isSubmitting} className="text-[10px] font-bold uppercase flex-1">
                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                                Save Record
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!targetItem} onOpenChange={() => setTargetItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold uppercase">Delete Inventory Record?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">Are you sure you want to permanently remove this item? This may affect historical data links in reports.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="text-[10px] font-bold uppercase h-8">CANCEL</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-white text-[10px] font-bold uppercase h-8 hover:bg-destructive/90">CONFIRM REMOVAL</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}