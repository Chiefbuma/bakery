
'use client';

import { useState, useEffect } from "react";
import { getProducts, updateProduct, getSupplies, addProduct, addSupply, deleteProducts, deleteSupplies } from "@/services/hotel-service";
import type { Product, HotelModule, Supply } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Search, PackagePlus, Box, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [activeModule, setActiveModule] = useState<HotelModule | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [selectedSupplies, setSelectedSupplies] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const loadData = async () => {
        const [prodData, suppData] = await Promise.all([
            getProducts(activeModule === 'all' ? undefined : activeModule),
            getSupplies(activeModule === 'all' ? undefined : activeModule)
        ]);
        setProducts(prodData);
        setSupplies(suppData);
    };

    useEffect(() => {
        loadData();
    }, [activeModule]);

    const handleUpdateStock = async (id: string, amount: number) => {
        try {
            const p = products.find(prod => prod.id === id);
            if (!p) return;
            const newStock = p.stock + amount;
            await updateProduct(id, { stock: newStock });
            await loadData();
            toast({ title: "Stock Updated" });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed" });
        }
    };

    const handleBulkDeleteProducts = async () => {
        if (!confirm(`Delete ${selectedProducts.size} selected products?`)) return;
        try {
            await deleteProducts(Array.from(selectedProducts));
            setSelectedProducts(new Set());
            await loadData();
            toast({ title: "Products Deleted" });
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        }
    };

    const handleBulkDeleteSupplies = async () => {
        if (!confirm(`Delete ${selectedSupplies.size} selected supplies?`)) return;
        try {
            await deleteSupplies(Array.from(selectedSupplies));
            setSelectedSupplies(new Set());
            await loadData();
            toast({ title: "Supplies Deleted" });
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        }
    };

    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            await new Promise(r => setTimeout(r, 800));
            await addProduct({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                module: formData.get('module') as HotelModule,
                price: parseFloat(formData.get('price') as string),
                costPrice: parseFloat(formData.get('costPrice') as string),
                stock: parseInt(formData.get('stock') as string),
                minStockLevel: parseInt(formData.get('minStockLevel') as string),
                unit: formData.get('unit') as string,
                image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            });
            await loadData();
            setIsAddProductOpen(false);
            toast({ title: "Product Created" });
        } catch (error) {
            toast({ variant: "destructive", title: "Creation Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddSupply = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            await new Promise(r => setTimeout(r, 800));
            await addSupply({
                name: formData.get('name') as string,
                category: formData.get('category') as string,
                module: formData.get('module') as HotelModule,
                quantity: parseInt(formData.get('quantity') as string),
                unit: formData.get('unit') as string,
                unitCost: parseFloat(formData.get('unitCost') as string),
                lastPurchased: new Date().toISOString(),
            });
            await loadData();
            setIsAddSupplyOpen(false);
            toast({ title: "Supply Added" });
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredSupplies = supplies.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleSelectProduct = (id: string) => {
        const next = new Set(selectedProducts);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedProducts(next);
    };

    const toggleSelectSupply = (id: string) => {
        const next = new Set(selectedSupplies);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedSupplies(next);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Inventory & Supplies</h1>
                <p className="text-muted-foreground">Manage sellable items and raw materials for real-time costing.</p>
            </div>

            <Tabs defaultValue="products">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <TabsList>
                        <TabsTrigger value="products">Sellable Products</TabsTrigger>
                        <TabsTrigger value="supplies">Raw Supplies</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={activeModule} onValueChange={(v) => setActiveModule(v as any)}>
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
                                    <Button variant="destructive" size="sm" onClick={handleBulkDeleteProducts}>
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
                                                <Checkbox checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0} onCheckedChange={() => setSelectedProducts(selectedProducts.size === filteredProducts.length ? new Set() : new Set(filteredProducts.map(p => p.id)))} />
                                            </TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.map((p) => {
                                            const low = p.stock <= p.minStockLevel && p.module !== 'carwash' && p.module !== 'entertainment';
                                            return (
                                                <TableRow key={p.id}>
                                                    <TableCell><Checkbox checked={selectedProducts.has(p.id)} onCheckedChange={() => toggleSelectProduct(p.id)} /></TableCell>
                                                    <TableCell className="font-bold">{p.name}</TableCell>
                                                    <TableCell><Badge variant="outline" className="capitalize">{p.module}</Badge></TableCell>
                                                    <TableCell>{formatPrice(p.costPrice)}</TableCell>
                                                    <TableCell>{formatPrice(p.price)}</TableCell>
                                                    <TableCell className={low ? 'text-destructive font-bold' : ''}>
                                                        {(p.module === 'carwash' || p.module === 'entertainment') ? '∞' : `${p.stock} ${p.unit}`}
                                                    </TableCell>
                                                    <TableCell>{low ? <Badge variant="destructive">Low</Badge> : <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" onClick={() => handleUpdateStock(p.id, 10)} disabled={p.module === 'carwash' || p.module === 'entertainment'}>
                                                            <PackagePlus className="h-4 w-4" />
                                                        </Button>
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Raw Materials & Supplies</CardTitle>
                                <CardDescription>Track inputs used to produce goods.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {selectedSupplies.size > 0 && (
                                    <Button variant="destructive" size="sm" onClick={handleBulkDeleteSupplies}>
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
                                                <Checkbox checked={selectedSupplies.size === filteredSupplies.length && filteredSupplies.length > 0} onCheckedChange={() => setSelectedSupplies(selectedSupplies.size === filteredSupplies.length ? new Set() : new Set(filteredSupplies.map(s => s.id)))} />
                                            </TableHead>
                                            <TableHead>Supply Item</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Qty On Hand</TableHead>
                                            <TableHead>Unit Cost</TableHead>
                                            <TableHead>Last Purchased</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSupplies.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell><Checkbox checked={selectedSupplies.has(s.id)} onCheckedChange={() => toggleSelectSupply(s.id)} /></TableCell>
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Product Dialog */}
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Sellable Product</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Product Name</Label><Input name="name" required /></div>
                            <div className="space-y-2"><Label>Module</Label>
                                <Select name="module" defaultValue="restaurant">
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
                            <div className="space-y-2"><Label>Selling Price (Ksh)</Label><Input name="price" type="number" required /></div>
                            <div className="space-y-2"><Label>Cost per Unit (Ksh)</Label><Input name="costPrice" type="number" required /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Initial Stock</Label><Input name="stock" type="number" required /></div>
                            <div className="space-y-2"><Label>Min Level</Label><Input name="minStockLevel" type="number" required /></div>
                            <div className="space-y-2"><Label>Unit (e.g. Kg)</Label><Input name="unit" required /></div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Product"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Supply Dialog */}
            <Dialog open={isAddSupplyOpen} onOpenChange={setIsAddSupplyOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Register New Supply Item</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddSupply} className="space-y-4">
                        <div className="space-y-2"><Label>Supply Name</Label><Input name="name" placeholder="e.g. Cooking Oil" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Module</Label>
                                <Select name="module" defaultValue="restaurant">
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
                            <div className="space-y-2"><Label>Category</Label><Input name="category" placeholder="e.g. Groceries" required /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Quantity</Label><Input name="quantity" type="number" required /></div>
                            <div className="space-y-2"><Label>Unit Cost</Label><Input name="unitCost" type="number" required /></div>
                            <div className="space-y-2"><Label>Unit</Label><Input name="unit" placeholder="Liters" required /></div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Supply"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
