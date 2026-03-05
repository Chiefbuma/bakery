
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getProducts, placeOrder, getPendingOrders } from "@/services/hotel-service";
import type { Product, HotelModule, SaleItem, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Trash2, Printer, Plus, Minus, History, CheckCircle2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';

export default function POSPage() {
    const [activeModule, setActiveModule] = useState<HotelModule>('restaurant');
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
    const [amountReceived, setAmountReceived] = useState<string>("");
    const [receiptData, setReceiptData] = useState<Transaction | null>(null);
    
    const [pendingOrders, setPendingOrders] = useState<Transaction[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const { toast } = useToast();

    /**
     * Absolute Image URL Resolver.
     * Corrects relative /uploads/ paths to absolute URLs for production.
     */
    const resolveImageUrl = (url: string | null | undefined) => {
        if (!url) return 'https://picsum.photos/seed/hotel/400/300';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads') || url.startsWith('uploads')) {
            const path = url.startsWith('/') ? url : `/${url}`;
            if (typeof window !== 'undefined') {
                return `${window.location.origin}${path}`;
            }
        }
        return url;
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const loadData = useCallback(async () => {
        try {
            const [prodData, pendingData] = await Promise.all([
                getProducts(activeModule),
                getPendingOrders()
            ]);
            setProducts(Array.isArray(prodData) ? prodData : []);
            setPendingOrders(Array.isArray(pendingData) ? pendingData : []);
        } catch (err) {
            setProducts([]);
            setPendingOrders([]);
        }
    }, [activeModule]);

    useEffect(() => { loadData(); }, [loadData]);

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
                costPrice: product.costPrice,
                total: product.price 
            }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty, total: newQty * item.price };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.productId !== id));
    };

    const cartTotal = cart.reduce((acc, curr) => acc + curr.total, 0);
    const balanceValue = amountReceived ? parseFloat(amountReceived) - cartTotal : 0;

    const finalizeOrder = async (method: 'cash' | 'mpesa' | 'none', status: 'paid' | 'pending', received?: number, bal?: number) => {
        setIsProcessing(true);
        const totalCost = cart.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
        
        try {
            // CRITICAL: Preserve cart items for the receipt before clearing state
            const snapshotItems = [...cart];

            const response = await placeOrder({
                orderNumber: `WK-${Date.now()}`,
                module: activeModule,
                items: snapshotItems,
                totalAmount: cartTotal,
                totalCost,
                paymentMethod: method,
                status: status,
                customerName,
                amountReceived: received,
                balance: bal
            });

            if (status === 'paid') {
                const fullReceipt: Transaction = {
                    id: response.id || `TX-${Date.now()}`,
                    orderNumber: response.orderNumber || `WK-${Date.now()}`,
                    module: activeModule,
                    items: snapshotItems,
                    totalAmount: cartTotal,
                    totalCost,
                    timestamp: new Date().toISOString(),
                    paymentMethod: method,
                    status: 'paid',
                    customerName,
                    amountReceived: received,
                    balance: bal
                };
                setReceiptData(fullReceipt);
                toast({ title: "Payment Successful" });
            } else {
                toast({ title: "Order Saved as Pending" });
            }

            setCart([]);
            setCustomerName("");
            setAmountReceived("");
            setIsPaymentOpen(false);
            loadData();
        } catch (err) {
            toast({ variant: "destructive", title: "Order Failed" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayLater = async () => {
        if (cart.length === 0) return;
        finalizeOrder('none', 'pending');
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        
        if (paymentMethod === 'cash') {
            if (!amountReceived || parseFloat(amountReceived) < cartTotal) {
                toast({ variant: "destructive", title: "Invalid Amount" });
                return;
            }
            finalizeOrder('cash', 'paid', parseFloat(amountReceived), balanceValue);
        } else if (paymentMethod === 'mpesa') {
            handleMpesaPayment();
        }
    };

    const handleMpesaPayment = () => {
        if (!(window as any).PaystackPop) {
            toast({ variant: "destructive", title: "Payment Error", description: "Gateway not loaded." });
            return;
        }

        setIsProcessing(true);

        const handler = (window as any).PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: 'billing@wamaghach.com',
            amount: Math.round(cartTotal * 100),
            currency: 'KES',
            channels: ['mobile_money'],
            callback: (response: any) => {
                finalizeOrder('mpesa', 'paid', cartTotal, 0);
            },
            onClose: () => {
                setIsProcessing(false);
            }
        });

        handler.openIframe();
    };

    const handleCompletePending = async (order: Transaction) => {
        setCart(order.items || []);
        setCustomerName(order.customerName || "");
        setActiveModule(order.module);
        setIsHistoryOpen(false);
    };

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            <div className="flex-1 flex flex-col min-w-0 border-r">
                <div className="p-4 border-b bg-card flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search items..." 
                                className="pl-9 bg-muted/50" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={() => setIsHistoryOpen(true)} className="relative">
                            <History className="h-4 w-4" />
                            {pendingOrders.length > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px]">
                                    {pendingOrders.length}
                                </Badge>
                            )}
                        </Button>
                    </div>
                    <Tabs value={activeModule} className="w-auto" onValueChange={(v) => setActiveModule(v as HotelModule)}>
                        <TabsList>
                            <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
                            <TabsTrigger value="bar">Bar</TabsTrigger>
                            <TabsTrigger value="carwash">Car Wash</TabsTrigger>
                            <TabsTrigger value="accommodation">Rooms</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map(product => (
                                <motion.button 
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative flex flex-col bg-card rounded-xl border hover:border-primary hover:shadow-lg transition-all text-left overflow-hidden"
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0 && !['carwash', 'accommodation'].includes(product.module)}
                                >
                                    <div className="relative h-40 w-full bg-muted">
                                        <Image 
                                            src={resolveImageUrl(product.image_url)} 
                                            alt={product.name} 
                                            fill 
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                        {product.stock <= 0 && !['carwash', 'accommodation'].includes(product.module) && (
                                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                <Badge variant="destructive">OUT OF STOCK</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <h3 className="font-bold text-sm line-clamp-1">{product.name}</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                                            {!['carwash', 'accommodation'].includes(product.module) && (
                                                <span className="text-[10px] text-muted-foreground">Stock: {product.stock}</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            <div className="w-[400px] flex flex-col bg-card shadow-2xl">
                <div className="p-4 border-b flex items-center gap-2 bg-primary/5">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <h2 className="font-bold">Cart</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <Input 
                        placeholder="Guest Name / Table #" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-11"
                    />
                    <Separator />
                    {cart.map(item => (
                        <div key={item.productId} className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
                            <div className="flex-1">
                                <p className="text-sm font-bold">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, -1)}><Minus className="h-3 w-3" /></Button>
                                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, 1)}><Plus className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.productId)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t bg-primary/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Total</span>
                        <span className="text-3xl font-black text-primary">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-12" onClick={handlePayLater} disabled={cart.length === 0 || isProcessing}>
                            Pay Later
                        </Button>
                        <Button className="h-12" onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0 || isProcessing}>
                            Pay Now
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Finalize Sale</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} className="h-16" onClick={() => setPaymentMethod('cash')}>Cash</Button>
                        <Button variant={paymentMethod === 'mpesa' ? 'default' : 'outline'} className="h-16" onClick={() => setPaymentMethod('mpesa')}>M-Pesa</Button>
                    </div>
                    {paymentMethod === 'cash' && (
                        <div className="space-y-4">
                            <Label>Amount Received</Label>
                            <Input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} />
                            <div className="flex justify-between font-bold">
                                <span>Change</span>
                                <span className="text-primary">{formatPrice(Math.max(0, balanceValue))}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                        <Button onClick={handleCheckout} disabled={isProcessing}>Process</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Pending Bills</DialogTitle></DialogHeader>
                    <div className="divide-y max-h-[400px] overflow-y-auto">
                        {Array.isArray(pendingOrders) && pendingOrders.map(order => (
                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                                <div>
                                    <p className="font-bold">{order.customerName || 'Guest'}</p>
                                    <p className="text-xs text-muted-foreground">{order.orderNumber} • {new Date(order.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold">{formatPrice(order.totalAmount)}</p>
                                    <Button size="sm" onClick={() => handleCompletePending(order)}>Open</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
                <DialogContent className="max-w-xs font-mono">
                    <div className="text-center space-y-2 border-b pb-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <h3 className="font-bold uppercase tracking-tighter">Wamaghach Hotel</h3>
                        <p className="text-[10px]">{receiptData?.orderNumber}</p>
                    </div>
                    <div className="py-4 space-y-1">
                        {receiptData?.items?.map(item => (
                            <div key={item.productId} className="flex justify-between text-xs">
                                <span className="truncate max-w-[150px]">{item.name} x{item.quantity}</span>
                                <span>{formatPrice(item.total)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 space-y-1 font-bold">
                        <div className="flex justify-between"><span>TOTAL</span><span>{formatPrice(receiptData?.totalAmount || 0)}</span></div>
                        <div className="flex justify-between text-[10px] font-normal italic"><span>PAID VIA</span><span>{receiptData?.paymentMethod.toUpperCase()}</span></div>
                    </div>
                    <Button className="w-full mt-6" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print Receipt</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
