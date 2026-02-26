
'use client';

import { useState, useEffect } from "react";
import { getProducts, updateProduct } from "@/services/hotel-service";
import type { Product, HotelModule } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Search, AlertTriangle, PackagePlus, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [activeModule, setActiveModule] = useState<HotelModule | 'all'>('restaurant');
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const load = async () => {
            const data = await getProducts(activeModule === 'all' ? undefined : activeModule);
            setProducts(data);
        };
        load();
    }, [activeModule]);

    const handleUpdateStock = async (id: string, amount: number) => {
        try {
            const p = products.find(prod => prod.id === id);
            if (!p) return;
            const newStock = p.stock + amount;
            await updateProduct(id, { stock: newStock });
            setProducts(prev => prev.map(prod => prod.id === id ? { ...prod, stock: newStock } : prod));
            toast({ title: "Stock Updated", description: `${p.name} stock is now ${newStock}` });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed" });
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                <p className="text-muted-foreground">Manage stock levels and material costs across all hotel modules.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                            <CardTitle>Master Stock List</CardTitle>
                            <CardDescription>Real-time automated inventory tracking.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search products..." 
                                    className="pl-8" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="restaurant" onValueChange={(v) => setActiveModule(v as any)}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="all">All Items</TabsTrigger>
                            <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
                            <TabsTrigger value="bar">Bar</TabsTrigger>
                            <TabsTrigger value="carwash">Car Wash</TabsTrigger>
                            <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Cost Price</TableHead>
                                    <TableHead>Selling Price</TableHead>
                                    <TableHead>Stock Level</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((product) => {
                                    const isLowStock = product.stock <= product.minStockLevel && product.module !== 'carwash';
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                                            <TableCell>{formatPrice(product.costPrice)}</TableCell>
                                            <TableCell>{formatPrice(product.price)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={isLowStock ? 'text-destructive font-bold' : ''}>
                                                        {product.stock} {product.unit}
                                                    </span>
                                                    {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isLowStock ? (
                                                    <Badge variant="destructive">Reorder Required</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleUpdateStock(product.id, 10)}>
                                                        <PackagePlus className="mr-2 h-4 w-4" /> Restock +10
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
