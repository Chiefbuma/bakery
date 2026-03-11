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
    getProductRecipes,
    saveProductRecipe,
    uploadImage
} from "@/services/hotel-service";
import type { Product, HotelModule, Supply, SupplyConsumption } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Trash2, Edit, ChevronLeft, ChevronRight, Loader2, UtensilsCrossed, ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    const ITEMS_PER_PAGE = 10;

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            productForm.setValue('image_url', url);
            toast({ title: "Image uploaded successfully" });
        } catch (error) {
            toast({ variant: "destructive", title: "Image upload failed" });
        } finally {
            setIsUploading(false);
        }
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

    const addRecipeLine = () => {
        setCurrentRecipe([...currentRecipe, { supplyId: '', amount: 0 }]);
    };

    const updateRecipeLine = (index: number, field: keyof SupplyConsumption, value: string | number) => {
        const updated = [...currentRecipe];
        updated[index] = { ...updated[index], [field]: value };
        setCurrentRecipe(updated);
    };

    const removeRecipeLine = (index: number) => {
        setCurrentRecipe(currentRecipe.filter((_, i) => i !== index));
    };

    const onProductSubmit = async (data: any) => {
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage products, supplies and manufacturing recipes.</p>
                </div>
                {activeTab !== 'recipes' && (
                    <div className="flex items-center gap-2">
                        <Button onClick={() => activeTab === 'supplies' ? handleOpenSupplyDialog() : handleOpenProductDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {activeTab === 'supplies' ? 'Add Supply' : 'Add Product'}
                        </Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="products" value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <TabsList>
                        <TabsTrigger value="products">Master Stock</TabsTrigger>
                        <TabsTrigger value="supplies">Raw Supplies</TabsTrigger>
                        <TabsTrigger value="recipes">Production Recipes</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search inventory..." className="pl-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                        </div>
                        <Select value={activeModule} onValueChange={(v) => { setActiveModule(v as any); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="restaurant">Restaurant</SelectItem>
                                <SelectItem value="bar">Bar</SelectItem>
                                <SelectItem value="carwash">Car Wash</SelectItem>
                                <SelectItem value="accommodation">Accommodation</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Card className="shadow-sm border-primary/10">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-bold">Item</TableHead>
                                            <TableHead className="font-bold">{activeTab === 'supplies' ? 'Stock Level' : 'Cost Type'}</TableHead>
                                            <TableHead className="font-bold">{activeTab === 'supplies' ? 'Unit Cost' : 'Sale Price'}</TableHead>
                                            {activeTab === 'recipes' && <TableHead className="font-bold">Ingredients</TableHead>}
                                            <TableHead className="font-bold">{activeTab === 'recipes' ? 'Est. COGS' : 'Stock Status'}</TableHead>
                                            <TableHead className="text-right font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={activeTab === 'recipes' ? 6 : 5} className="h-16 animate-pulse bg-muted/20" /></TableRow>)
                                        ) : paginatedItems.length === 0 ? (
                                            <TableRow><TableCell colSpan={activeTab === 'recipes' ? 6 : 5} className="text-center py-10 text-muted-foreground">No items found.</TableCell></TableRow>
                                        ) : paginatedItems.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-semibold">
                                                    <div>{item.name}</div>
                                                    <div className="text-xs text-muted-foreground uppercase">{item.module}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {activeTab === 'supplies' ? (
                                                        <span className="font-bold">{item.quantity} {item.unit}</span>
                                                    ) : (
                                                        <Badge variant={item.hasRecipe ? "default" : "secondary"}>{item.hasRecipe ? "Production" : "Retail"}</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatPrice(activeTab === 'supplies' ? item.unitCost : item.price)}</TableCell>
                                                {activeTab === 'recipes' && (
                                                    <TableCell className="max-w-xs">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(recipes[item.id] || []).length === 0 ? (
                                                                <span className="text-xs text-muted-foreground italic">No ingredients linked</span>
                                                            ) : (
                                                                (recipes[item.id] || []).map((rcp, i) => {
                                                                    const s = supplies.find(sup => sup.id === rcp.supplyId);
                                                                    return <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-4">{s?.name || 'Unknown'}</Badge>;
                                                                })
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    {activeTab === 'recipes' ? (
                                                        <span className="font-bold text-primary">{formatPrice((recipes[item.id] || []).reduce((acc, rcp) => {
                                                            const s = supplies.find(sup => sup.id === rcp.supplyId);
                                                            return acc + (Number(rcp.amount) * Number(s?.unitCost || 0));
                                                        }, 0))}</span>
                                                    ) : (
                                                        <Badge variant={item.stock <= item.minStockLevel ? "destructive" : "outline"}>
                                                            {item.stock} {item.unit}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {activeTab === 'products' && item.hasRecipe && (
                                                        <Button variant="ghost" size="icon" className="text-amber-600" onClick={() => handleOpenRecipeDialog(item)}><UtensilsCrossed className="h-4 w-4" /></Button>
                                                    )}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-primary" 
                                                        onClick={() => {
                                                            if (activeTab === 'supplies') handleOpenSupplyDialog(item);
                                                            else if (activeTab === 'recipes') handleOpenRecipeDialog(item);
                                                            else handleOpenProductDialog(item);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setTargetItem({id: item.id, name: item.name, type: activeTab === 'supplies' ? 'supply' : 'product'})}><Trash2 className="h-4 w-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </Tabs>

            {/* Product Dialog */}
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>Configure details for a sellable item.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Product Name</Label>
                                <Input {...productForm.register('name', { required: true })} disabled={isSubmitting} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Description</Label>
                                <Input {...productForm.register('description')} disabled={isSubmitting} />
                            </div>
                        </div>

                        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                            <Label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Costing Method</Label>
                            <RadioGroup value={hasRecipeValue ? "production" : "retail"} onValueChange={(v) => productForm.setValue('hasRecipe', v === 'production')} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="retail" id="retail" />
                                    <Label htmlFor="retail" className="cursor-pointer">Retail (Manual Cost)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="production" id="production" />
                                    <Label htmlFor="production" className="cursor-pointer">Production (Recipe)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Sale Price (Ksh)</Label>
                                <Input type="number" {...productForm.register('price', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label className={cn(hasRecipeValue && "text-muted-foreground")}>Manual Cost (Ksh)</Label>
                                <Input type="number" {...productForm.register('costPrice', { required: !hasRecipeValue, valueAsNumber: true })} disabled={isSubmitting || !!hasRecipeValue} className={cn(hasRecipeValue && "bg-muted")} placeholder={hasRecipeValue ? "Auto-calculated" : "0"} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Opening Stock</Label>
                                <Input type="number" step="0.01" {...productForm.register('stock', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock Unit</Label>
                                <Input {...productForm.register('unit', { required: true })} placeholder="e.g. pcs, kgs, ml" disabled={isSubmitting} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select value={productForm.watch('module')} onValueChange={(v) => productForm.setValue('module', v as any)}>
                                    <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                        <SelectItem value="carwash">Car Wash</SelectItem>
                                        <SelectItem value="accommodation">Accommodation</SelectItem>
                                        <SelectItem value="entertainment">Entertainment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Min Alert Level</Label>
                                <Input type="number" {...productForm.register('minStockLevel', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Product Image</Label>
                            <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                                    {productForm.watch('image_url') ? (
                                        <img src={productForm.watch('image_url')} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2 border rounded-md px-3 py-2 bg-background hover:bg-muted transition-colors">
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        <span className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                                    </Label>
                                    <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setIsProductDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting || isUploading} className="gap-2">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Save Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Supply Dialog */}
            <Dialog open={isSupplyDialogOpen} onOpenChange={setIsSupplyDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingSupply ? 'Edit Supply' : 'Add New Supply'}</DialogTitle>
                        <DialogDescription>Configure raw materials or ingredients.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={supplyForm.handleSubmit(onSupplySubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Supply Name</Label>
                            <Input {...supplyForm.register('name', { required: true })} disabled={isSubmitting} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input {...supplyForm.register('category')} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select value={supplyForm.watch('module')} onValueChange={(v) => supplyForm.setValue('module', v as any)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                        <SelectItem value="carwash">Car Wash</SelectItem>
                                        <SelectItem value="accommodation">Accommodation</SelectItem>
                                        <SelectItem value="entertainment">Entertainment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" step="0.01" {...supplyForm.register('quantity', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Input {...supplyForm.register('unit', { required: true })} placeholder="kg, ltr, box" disabled={isSubmitting} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Unit Cost (Ksh)</Label>
                            <Input type="number" step="0.01" {...supplyForm.register('unitCost', { required: true, valueAsNumber: true })} disabled={isSubmitting} />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setIsSupplyDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="gap-2">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Save Supply
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Recipe Dialog */}
            <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Recipe Editor: {recipeProduct?.name}</DialogTitle>
                        <DialogDescription>Link raw supplies to this product to calculate accurate production costs.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold uppercase text-muted-foreground">Estimated Production Cost</p>
                                <p className="text-2xl font-black text-primary">{formatPrice(recipeTotalCost)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Retail Price</p>
                                <p className="text-xl font-bold">{formatPrice(recipeProduct?.price || 0)}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {currentRecipe.map((rcp, idx) => {
                                const supply = supplies.find(s => s.id === rcp.supplyId);
                                const lineCost = Number(rcp.amount || 0) * Number(supply?.unitCost || 0);
                                
                                return (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-muted/20 p-3 rounded-lg border border-dashed">
                                        <div className="col-span-6 space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold">Ingredient / Supply</Label>
                                            <Select value={rcp.supplyId} onValueChange={(v) => updateRecipeLine(idx, 'supplyId', v)}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select ingredient..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {supplies.map(s => (
                                                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.unit})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold">Qty ({supply?.unit || 'unit'})</Label>
                                            <Input 
                                                type="number" 
                                                step="0.001" 
                                                className="h-9" 
                                                value={rcp.amount} 
                                                onChange={(e) => updateRecipeLine(idx, 'amount', parseFloat(e.target.value))} 
                                            />
                                        </div>
                                        <div className="col-span-2 text-right self-center">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Cost</p>
                                            <p className="text-sm font-bold">{formatPrice(lineCost)}</p>
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeRecipeLine(idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Button variant="outline" className="w-full border-dashed" onClick={addRecipeLine}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Ingredient
                        </Button>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsRecipeDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={onRecipeSubmit} disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save Recipe
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!targetItem} onOpenChange={() => setTargetItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the inventory record for "{targetItem?.name}". This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Item</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}