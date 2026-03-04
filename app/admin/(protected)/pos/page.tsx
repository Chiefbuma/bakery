
'use client';

import { useState, useEffect } from "react";
import { getProducts, placeOrder, getPendingOrders } from "@/services/hotel-service";
import type { Product, HotelModule, SaleItem, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ShoppingCart, User, Search, Trash2, Printer, Loader2, Plus, Minus, History, CreditCard, Banknote, CheckCircle2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function POSPage() {
    const [activeModule, setActiveModule] = useState<HotelModule>('restaurant');
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Payment UI State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
    const [amountReceived, setAmountReceived] = useState<string>("");
    const [receiptData, setReceiptData] = useState<Transaction | null>(null);
    
    // Pending Orders State
    const [pendingOrders, setPendingOrders] = useState<Transaction[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        const loadProducts = async () => {
            const data = await getProducts(activeModule);
            setProducts(data);
        };
        loadProducts();
    }, [activeModule]);

    useEffect(() => {
        const loadPending = async () => {
            const data = await getPendingOrders();
            setPendingOrders(data);
        };
        loadPending();
    }, []);

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

    const handleManualQtyChange = (id: string, value: string) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) return;
        setCart(prev => prev.map(item => {
            if (item.productId === id) {
                return { ...item, quantity: num, total: num * item.price };
            }
            return item;
        }));
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.productId !== id));
    };

    const cartTotal = cart.reduce((acc, curr) => acc + curr.total, 0);
    const balance = amountReceived ? parseFloat(amountReceived) - cartTotal : 0;

    const handlePayLater = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Smooth delay
            const totalCost = cart.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);

            await placeOrder({
                orderNumber: `WD-${Date.now()}`,
                module: activeModule,
                items: cart,
                totalAmount: cartTotal,
                totalCost,
                paymentMethod: 'none',
                status: 'pending',
                customerName
            });

            setCart([]);
            setCustomerName("");
            const updatedPending = await getPendingOrders();
            setPendingOrders(updatedPending);
            toast({ title: "Order Saved", description: `Order for ${customerName || 'Walk-in'} saved as pending.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < cartTotal)) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Received amount must cover the total." });
            return;
        }

        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Realism delay
            const totalCost = cart.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);

            const transaction = await placeOrder({
                orderNumber: `WD-${Date.now()}`,
                module: activeModule,
                items: cart,
                totalAmount: cartTotal,
                totalCost,
                paymentMethod: paymentMethod,
                status: 'paid',
                customerName,
                amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : cartTotal,
                balance: paymentMethod === 'cash' ? balance : 0
            });

            setReceiptData(transaction);
            setCart([]);
            setCustomerName("");
            setAmountReceived("");
            setIsPaymentOpen(false);
            toast({ title: "Payment Successful", description: `Order #${transaction.orderNumber} completed.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Payment Failed" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCompletePending = async (order: Transaction) => {
        setCart(order.items);
        setCustomerName(order.customerName || "");
        setActiveModule(order.module);
        setIsHistoryOpen(false);
        toast({ title: "Order Loaded", description: `Processing payment for ${order.orderNumber}` });
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            {/* Menu Section */}
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
                        <Button variant="outline" size="icon" onClick={() => setIsHistoryOpen(true)} className="relative" title="Pending Orders">
                            <History className="h-4 w-4" />
                            {pendingOrders.length > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px]">
                                    {pendingOrders.length}
                                </Badge>
                            )}
                        </Button>
                    </div>
                    <Tabs value={activeModule} className="w-auto" onValueChange={(v) => setActiveModule(v as HotelModule)}>
                        <TabsList className="flex w-fit overflow-x-auto no-scrollbar">
                            <TabsTrigger value="restaurant" className="px-6">Restaurant</TabsTrigger>
                            <TabsTrigger value="bar" className="px-6">Bar</TabsTrigger>
                            <TabsTrigger value="carwash" className="px-6">Car Wash</TabsTrigger>
                            <TabsTrigger value="accommodation" className="px-6">Rooms</TabsTrigger>
                            <TabsTrigger value="entertainment" className="px-6">Entertainment</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <motion.div 
                        layout
                        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map(product => (
                                <motion.button 
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative flex flex-col bg-card rounded-xl border hover:border-primary hover:shadow-lg transition-all text-left overflow-hidden h-fit"
                                    onClick={() => addToCart(product)}
                                    disabled={(product.module !== 'carwash' && product.module !== 'entertainment') && product.stock <= 0}
                                >
                                    <div className="relative h-40 w-full bg-muted">
                                        <Image 
                                            src={product.image_url} 
                                            alt={product.name} 
                                            fill 
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {(product.module !== 'carwash' && product.module !== 'entertainment') && product.stock <= 0 && (
                                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                <Badge variant="destructive">OUT OF STOCK</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <h3 className="font-bold text-sm line-clamp-1">{product.name}</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                                            {(product.module !== 'carwash' && product.module !== 'entertainment') && (
                                                <span className={cn("text-[10px]", product.stock < 10 ? 'text-destructive font-bold' : 'text-muted-foreground')}>
                                                    Stock: {product.stock} {product.unit}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* Cart Section */}
            <div className="w-[400px] flex flex-col bg-card shadow-2xl">
                <div className="p-4 border-b flex items-center gap-2 bg-primary/5">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <h2 className="font-bold">Current Order</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Details</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Guest Name / Table #" 
                                className="pl-9 h-11"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                                <ShoppingCart className="h-12 w-12 mb-2 stroke-1" />
                                <p>No items added yet</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <motion.div 
                                    key={item.productId}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="group bg-muted/30 p-3 rounded-lg border border-transparent hover:border-primary/20 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold leading-tight">{item.name}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{formatPrice(item.price)} per unit</p>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.productId)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.productId, -1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <Input 
                                                className="h-8 w-14 text-center text-sm font-bold border-none bg-transparent focus-visible:ring-0" 
                                                value={item.quantity}
                                                onChange={(e) => handleManualQtyChange(item.productId, e.target.value)}
                                            />
                                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.productId, 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <span className="text-sm font-bold text-primary">{formatPrice(item.total)}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 border-t bg-primary/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Total Bill</span>
                        <span className="text-3xl font-black text-primary">{formatPrice(cartTotal)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Button 
                            variant="outline" 
                            className="h-12 font-bold" 
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handlePayLater}
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><History className="mr-2 h-4 w-4" /> Pay Later</>}
                        </Button>
                        <Button 
                            className="h-12 font-bold shadow-lg shadow-primary/20" 
                            disabled={cart.length === 0 || isProcessing}
                            onClick={() => setIsPaymentOpen(true)}
                        >
                            <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                        </Button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Payment</DialogTitle>
                        <DialogDescription>Select payment method and finalize transaction.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                                className="h-20 flex-col gap-2"
                                onClick={() => setPaymentMethod('cash')}
                            >
                                <Banknote className="h-6 w-6" /> Cash
                            </Button>
                            <Button 
                                variant={paymentMethod === 'mpesa' ? 'default' : 'outline'}
                                className="h-20 flex-col gap-2 border-green-500/20 text-green-600 hover:bg-green-50"
                                onClick={() => setPaymentMethod('mpesa')}
                            >
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" alt="M-Pesa" width={40} height={20} className="h-6 w-auto" />
                                M-Pesa
                            </Button>
                        </div>

                        <div className="p-4 bg-muted rounded-xl space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Order Amount</span>
                                <span className="font-bold">{formatPrice(cartTotal)}</span>
                            </div>
                            
                            {paymentMethod === 'cash' ? (
                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Amount Received</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Ksh</span>
                                        <Input 
                                            type="number" 
                                            className="pl-12 h-12 text-lg font-bold" 
                                            placeholder="0"
                                            value={amountReceived}
                                            onChange={(e) => setAmountReceived(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm font-medium">Balance to Give</span>
                                        <span className={cn("text-xl font-bold", balance >= 0 ? 'text-green-600' : 'text-destructive')}>
                                            {formatPrice(Math.abs(balance))}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 space-y-2">
                                    <p className="text-sm text-muted-foreground">Prompting customer for STK push...</p>
                                    <div className="flex justify-center gap-1">
                                        <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                        <Button 
                            className="min-w-[120px]" 
                            disabled={isProcessing || (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < cartTotal))}
                            onClick={handleCheckout}
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Process Sale'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pending Orders Drawer */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Pending Orders</DialogTitle>
                        <DialogDescription>Search and retrieve saved bills for payment.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name or order #..." className="pl-9" />
                        </div>
                        
                        <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                            {pendingOrders.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground italic">No pending bills found.</div>
                            ) : (
                                <div className="divide-y">
                                    {pendingOrders.map(order => (
                                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <div>
                                                <p className="font-bold">{order.customerName || 'Walk-in'}</p>
                                                <div className="flex gap-3 text-xs text-muted-foreground">
                                                    <span>{order.orderNumber}</span>
                                                    <span>•</span>
                                                    <span>{new Date(order.timestamp).toLocaleTimeString()}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{order.module}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                                                <Button size="sm" onClick={() => handleCompletePending(order)}>
                                                    Open Bill
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Receipt Modal */}
            <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
                <DialogContent className="max-w-xs font-mono">
                    <DialogHeader>
                        <div className="flex justify-center mb-2">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        <DialogTitle className="text-center">Sale Completed</DialogTitle>
                    </DialogHeader>
                    <div className="text-center space-y-1 border-t pt-4">
                        <h3 className="font-bold uppercase text-lg">Wamaghach Kahua-ini</h3>
                        <p className="text-[10px] text-muted-foreground leading-tight">PREMIUM HOSPITALITY SERVICES</p>
                        <Separator className="my-2 border-dashed" />
                        <div className="flex justify-between text-[10px]">
                            <span>REF: {receiptData?.orderNumber}</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="space-y-2 py-4 border-b border-dashed">
                        {receiptData?.items.map(item => (
                            <div key={item.productId} className="flex justify-between text-xs">
                                <span className="flex-1">{item.name} x{item.quantity}</span>
                                <span className="ml-2">{formatPrice(item.total)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-1 py-3 font-bold">
                        <div className="flex justify-between text-base">
                            <span>TOTAL</span>
                            <span>{formatPrice(receiptData?.totalAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-normal italic">
                            <span>PAYMENT VIA</span>
                            <span className="uppercase">{receiptData?.paymentMethod}</span>
                        </div>
                        {receiptData?.paymentMethod === 'cash' && (
                            <>
                                <div className="flex justify-between text-[10px] font-normal">
                                    <span>CASH RECEIVED</span>
                                    <span>{formatPrice(receiptData?.amountReceived || 0)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-normal">
                                    <span>CHANGE GIVEN</span>
                                    <span>{formatPrice(receiptData?.balance || 0)}</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="text-center pt-4 text-[10px] space-y-1">
                        <p>Thank you for choosing Wamaghach!</p>
                        <p className="font-bold italic">Welcome Again</p>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button className="w-full" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Print Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
