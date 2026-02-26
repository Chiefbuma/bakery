
'use client';

import { useState, useEffect } from "react";
import { getProducts, placeOrder } from "@/services/hotel-service";
import type { Product, HotelModule, SaleItem, Transaction } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ShoppingCart, User, Search, Trash2, Printer, CheckCircle2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function POSPage() {
    const [activeModule, setActiveModule] = useState<HotelModule>('restaurant');
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [receiptData, setReceiptData] = useState<Transaction | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const loadProducts = async () => {
            const data = await getProducts(activeModule);
            setProducts(data);
        };
        loadProducts();
    }, [activeModule]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item => 
                    item.productId === product.id 
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } 
                    : item
                );
            }
            return [...prev, { 
                productId: product.id, 
                name: product.name, 
                quantity: 1, 
                price: product.price, 
                total: product.price 
            }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.productId !== id));
    };

    const cartTotal = cart.reduce((acc, curr) => acc + curr.total, 0);

    const handleCheckout = async (method: 'cash' | 'mpesa' | 'card') => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        try {
            // Calculate total cost for P&L
            const totalCost = cart.reduce((acc, item) => {
                const p = products.find(prod => prod.id === item.productId);
                return acc + ((p?.costPrice || 0) * item.quantity);
            }, 0);

            const transaction = await placeOrder({
                orderNumber: `ORD-${Date.now()}`,
                module: activeModule,
                items: cart,
                totalAmount: cartTotal,
                totalCost,
                paymentMethod: method,
                customerName
            });

            setReceiptData(transaction);
            setCart([]);
            setCustomerName("");
            toast({ title: "Order Completed", description: `Transaction recorded successfully.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Checkout Failed" });
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle>POS Terminal</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search items..." 
                                    className="pl-8" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="restaurant" onValueChange={(v) => setActiveModule(v as HotelModule)}>
                            <TabsList className="grid w-full grid-cols-4 mb-6">
                                <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
                                <TabsTrigger value="bar">Bar</TabsTrigger>
                                <TabsTrigger value="carwash">Car Wash</TabsTrigger>
                                <TabsTrigger value="accommodation">Rooms</TabsTrigger>
                            </TabsList>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {filteredProducts.map(product => (
                                    <Button 
                                        key={product.id} 
                                        variant="outline" 
                                        className="h-auto py-4 flex-col gap-1 items-start text-left hover:border-primary hover:bg-primary/5 transition-all"
                                        onClick={() => addToCart(product)}
                                        disabled={product.module !== 'carwash' && product.stock <= 0}
                                    >
                                        <span className="font-bold line-clamp-1">{product.name}</span>
                                        <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
                                        {product.module !== 'carwash' && (
                                            <span className={`text-[10px] ${product.stock < 10 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                                Stock: {product.stock} {product.unit}
                                            </span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="h-[calc(100vh-180px)] flex flex-col">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" /> Current Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pt-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Customer Name (Optional)</label>
                            <div className="relative">
                                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Guest Name / Table #" 
                                    className="pl-8"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                        </div>
                        <Separator />
                        {cart.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No items added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.productId} className="flex justify-between items-start group">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.quantity} x {formatPrice(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold">{formatPrice(item.total)}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeFromCart(item.productId)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-4 border-t pt-4 bg-muted/20">
                        <div className="w-full flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <Button className="w-full" disabled={cart.length === 0 || isProcessing} onClick={() => handleCheckout('cash')}>
                                Cash
                            </Button>
                            <Button variant="secondary" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" disabled={cart.length === 0 || isProcessing} onClick={() => handleCheckout('mpesa')}>
                                M-Pesa
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Receipt Modal */}
            <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
                <DialogContent className="max-w-xs font-mono">
                    <DialogHeader>
                        <DialogTitle className="text-center">Receipt</DialogTitle>
                    </DialogHeader>
                    <div className="text-center space-y-1">
                        <h3 className="font-bold uppercase">Wamaghach Kahua-ini Hotel</h3>
                        <p className="text-xs">Service: {receiptData?.module.toUpperCase()}</p>
                        <p className="text-xs">{new Date().toLocaleString()}</p>
                        <p className="text-xs">No: {receiptData?.orderNumber}</p>
                    </div>
                    <Separator className="border-dashed" />
                    <div className="space-y-2 py-4">
                        {receiptData?.items.map(item => (
                            <div key={item.productId} className="flex justify-between text-sm">
                                <span>{item.name} x{item.quantity}</span>
                                <span>{formatPrice(item.total)}</span>
                            </div>
                        ))}
                    </div>
                    <Separator className="border-dashed" />
                    <div className="space-y-1 py-2 font-bold">
                        <div className="flex justify-between">
                            <span>TOTAL</span>
                            <span>{formatPrice(receiptData?.totalAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>PAID VIA</span>
                            <span className="uppercase">{receiptData?.paymentMethod}</span>
                        </div>
                    </div>
                    <div className="text-center pt-4 text-[10px]">
                        <p>Thank you for choosing Wamaghach Kahua-ini!</p>
                        <p>Welcome Again</p>
                    </div>
                    <DialogFooter>
                        <Button className="w-full" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
