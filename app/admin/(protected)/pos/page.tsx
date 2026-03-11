'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getProducts, placeOrder, getPendingOrders } from "@/services/hotel-service";
import type { Product, HotelModule, SaleItem, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, History, Printer, Plus, Minus, Loader2, CreditCard, Utensils, Beer, Car, Bed, Music, RefreshCw, Trash2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';

export const dynamic = 'force-dynamic';

export default function POSPage() {
    const [activeModule, setActiveModule] = useState<HotelModule>('restaurant');
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
    const [amountReceived, setAmountReceived] = useState<string>("");
    const [receiptData, setReceiptData] = useState<Transaction | null>(null);
    
    const [pendingOrders, setPendingOrders] = useState<Transaction[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const { toast } = useToast();

    const resolveImageUrl = (url: string | null | undefined) => {
        if (!url) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
        if (url.startsWith('/uploads/')) {
            const filename = url.replace('/uploads/', '');
            return `/api/media/${filename}`;
        }
        return url;
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }, []);

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setIsLoadingData(true);
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
        } finally {
            setIsLoadingData(false);
        }
    }, [activeModule]);

    useEffect(() => { loadData(); }, [loadData]);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast({ variant: "destructive", title: "Out of Stock", description: `${product.name} is currently unavailable.` });
            return;
        }

        const existingItem = cart.find(item => item.productId === product.id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;

        if (currentQtyInCart + 1 > product.stock) {
            toast({ variant: "destructive", title: "Insufficient Stock", description: `Only ${product.stock} ${product.unit} available.` });
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            const price = Number(product.price || 0);
            if (existing) {
                const newQty = existing.quantity + 1;
                return prev.map(item => item.productId === product.id ? { ...item, quantity: newQty, total: Number((newQty * price).toFixed(2)) } : item);
            }
            return [...prev, { productId: product.id, name: product.name, quantity: 1, price: price, costPrice: Number(product.costPrice || 0), total: price }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.productId === id) {
                    const product = products.find(p => p.id === id);
                    const newQty = Math.max(1, item.quantity + delta);
                    if (product && newQty > product.stock) {
                        toast({ variant: "destructive", title: "Insufficient Stock", description: `Available stock: ${product.stock}` });
                        return item;
                    }
                    const price = Number(item.price || 0);
                    return { ...item, quantity: newQty, total: Number((newQty * price).toFixed(2)) };
                }
                return item;
            });
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.productId !== id));
        toast({ title: "Item removed from bill" });
    };

    const cartTotal = useMemo(() => cart.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0), [cart]);

    const balanceValue = useMemo(() => (parseFloat(amountReceived) || 0) - cartTotal, [amountReceived, cartTotal]);

    const finalizeOrder = async (method: 'cash' | 'mpesa' | 'card' | 'none', status: 'paid' | 'pending', received?: number, bal?: number) => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        const itemsSnapshot = [...cart];
        const finalCustomerName = customerName || "Guest";

        try {
            const response = await placeOrder({
                orderNumber: `WK-${Date.now()}`,
                module: activeModule,
                items: itemsSnapshot,
                totalAmount: cartTotal,
                totalCost: 0,
                paymentMethod: method,
                status: status,
                customerName: finalCustomerName,
                amountReceived: received,
                balance: bal
            });

            if (status === 'paid') {
                setReceiptData({
                    id: response.id || `TX-${Date.now()}`,
                    orderNumber: response.orderNumber || `WK-${Date.now()}`,
                    module: activeModule,
                    items: itemsSnapshot,
                    totalAmount: cartTotal,
                    totalCost: 0,
                    timestamp: new Date().toISOString(),
                    paymentMethod: method,
                    status: 'paid',
                    customerName: finalCustomerName,
                    amountReceived: received,
                    balance: bal
                });
            }

            setCart([]);
            setCustomerName("");
            setAmountReceived("");
            setIsPaymentOpen(false);
            loadData(true);
            toast({ title: status === 'paid' ? "Sale Complete" : "Bill Saved for Later" });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Checkout Error", description: err.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckout = () => {
        if (paymentMethod === 'cash') {
            const received = parseFloat(amountReceived);
            if (isNaN(received) || received < cartTotal) {
                toast({ variant: "destructive", title: "Insufficient cash provided" });
                return;
            }
            finalizeOrder('cash', 'paid', received, balanceValue);
        } else {
            handleMpesaPayment();
        }
    };

    const handleMpesaPayment = () => {
        if (!(window as any).PaystackPop) {
            toast({ variant: "destructive", title: "Payment gateway error" });
            return;
        }
        setIsProcessing(true);
        const handler = (window as any).PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: 'billing@wamaghach.com',
            amount: Math.round(cartTotal * 100),
            currency: 'KES',
            channels: ['mobile_money'],
            callback: () => finalizeOrder('mpesa', 'paid', cartTotal, 0),
            onClose: () => setIsProcessing(false)
        });
        handler.openIframe();
    };

    const resumeOrder = (order: Transaction) => {
        setCart(order.items.map(item => ({ ...item, price: Number(item.price), total: Number(item.total) })));
        setCustomerName(order.customerName || "");
        setIsHistoryOpen(false);
        toast({ title: "Order Resumed" });
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const moduleIcons: Record<HotelModule, any> = {
        restaurant: Utensils,
        bar: Beer,
        carwash: Car,
        accommodation: Bed,
        entertainment: Music,
        general: CreditCard
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            <style jsx global>{`
                @font-face { font-family: 'pixFueler-C'; src: local('Courier New'), local('Courier'), monospace; }
                .receipt-font { font-family: 'pixFueler-C', monospace; }
                @media print {
                    .no-print { display: none !important; }
                    body * { visibility: hidden; }
                    .print-section, .print-section * { visibility: visible; }
                    .print-section { position: absolute; left: 0; top: 0; width: 80mm; margin: 0; padding: 5mm; background: white; }
                }
            `}</style>

            <div className="flex-1 flex flex-col min-w-0 border-r">
                <div className="p-2.5 border-b bg-card flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Search catalog..." className="h-7 pl-8 text-[11px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="icon" onClick={() => loadData()} disabled={isLoadingData} className="h-7 w-7">
                                <RefreshCw className={cn("h-3.5 w-3.5", isLoadingData && "animate-spin")} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setIsHistoryOpen(true)} className="h-7 w-7 relative">
                                <History className="h-3.5 w-3.5" />
                                {pendingOrders.length > 0 && <Badge className="absolute -top-1 -right-1 h-3.5 w-3.5 p-0 flex items-center justify-center bg-primary text-[8px]">{pendingOrders.length}</Badge>}
                            </Button>
                        </div>
                    </div>

                    <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as HotelModule)} className="w-full">
                        <TabsList className="grid grid-cols-5 w-full bg-muted/50 h-8 p-0.5">
                            {['restaurant', 'bar', 'carwash', 'accommodation', 'entertainment'].map((mod) => {
                                const Icon = moduleIcons[mod as HotelModule] || CreditCard;
                                return (
                                    <TabsTrigger key={mod} value={mod} className="gap-1.5 text-[8px] uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-white h-full">
                                        {isLoadingData && activeModule === mod ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Icon className="h-3 w-3" />}
                                        <span className="hidden sm:inline">{mod === 'accommodation' ? 'Rooms' : mod === 'entertainment' ? 'Ent.' : mod}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-3 bg-muted/20">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeModule} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredProducts.map(product => {
                                const isOutOfStock = product.stock <= 0;
                                return (
                                    <button 
                                        key={product.id} 
                                        disabled={isOutOfStock}
                                        className={cn("group relative flex flex-col bg-card rounded-lg border hover:border-primary hover:shadow-sm transition-all text-left overflow-hidden h-fit", isOutOfStock && "opacity-60 cursor-not-allowed grayscale")} 
                                        onClick={() => addToCart(product)}
                                    >
                                        <div className="relative h-20 w-full bg-muted">
                                            <Image src={resolveImageUrl(product.image_url)} alt={product.name} fill className="object-cover" />
                                            {isOutOfStock ? (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                                    <Badge variant="destructive" className="font-bold text-[8px] uppercase tracking-tighter">SOLD OUT</Badge>
                                                </div>
                                            ) : (
                                                <div className="absolute top-1 right-1">
                                                    <Badge variant={product.stock <= 5 ? "destructive" : "secondary"} className="text-[8px] px-1 h-3.5 backdrop-blur-md border-white/20">
                                                        {product.stock} {product.unit}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <h3 className="font-bold text-[10px] truncate leading-tight">{product.name}</h3>
                                            <p className="text-primary font-black text-xs mt-0.5">{formatPrice(Number(product.price))}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="w-[360px] flex flex-col bg-card shadow-2xl border-l">
                <div className="p-2.5 border-b flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-1.5">
                        <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                        <h2 className="font-black uppercase tracking-tight text-[11px]">Active Bill</h2>
                    </div>
                    {cart.length > 0 && <Button variant="ghost" size="sm" className="text-destructive h-6 text-[8px] font-bold uppercase" onClick={() => setCart([])}>EMPTY</Button>}
                </div>
                
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    <div className="space-y-0.5">
                        <Label className="text-[8px] uppercase font-bold text-muted-foreground ml-1">Guest Ref</Label>
                        <Input placeholder="Guest Name / Table" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-8 text-[10px]" />
                    </div>
                    
                    <div className="space-y-1">
                        <div className="grid grid-cols-12 gap-1 text-[8px] uppercase font-black text-muted-foreground px-2">
                            <div className="col-span-5">Item</div>
                            <div className="col-span-3 text-center">Qty</div>
                            <div className="col-span-3 text-right">Total</div>
                            <div className="col-span-1"></div>
                        </div>
                        <Separator />
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/30">
                                <ShoppingCart className="h-8 w-8 mb-1" />
                                <p className="text-[9px] uppercase font-bold">Empty Cart</p>
                            </div>
                        ) : cart.map(item => (
                            <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={item.productId} className="grid grid-cols-12 gap-1 items-center bg-muted/30 p-1 rounded-md border border-transparent hover:border-primary/10 transition-colors">
                                <div className="col-span-5 min-w-0">
                                    <p className="text-[10px] font-bold truncate leading-tight">{item.name}</p>
                                    <p className="text-[8px] text-muted-foreground">{formatPrice(item.price)}</p>
                                </div>
                                <div className="col-span-3 flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => updateQuantity(item.productId, -1)}><Minus className="h-2 w-2" /></Button>
                                    <span className="text-[10px] font-black w-3 text-center">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => updateQuantity(item.productId, 1)}><Plus className="h-2 w-2" /></Button>
                                </div>
                                <div className="col-span-3 text-right">
                                    <p className="text-[10px] font-black text-primary">{formatPrice(Number(item.total))}</p>
                                </div>
                                <div className="col-span-1 text-right">
                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive/50 hover:text-destructive" onClick={() => removeFromCart(item.productId)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="p-3 border-t bg-muted/5 space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <span className="text-muted-foreground font-black uppercase tracking-widest text-[9px]">Grand Total</span>
                        <span className="text-xl font-black text-primary leading-none tabular-nums">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-8 text-[10px] font-black uppercase tracking-wider" onClick={() => finalizeOrder('none', 'pending')} disabled={cart.length === 0 || isProcessing}>
                            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            Pay Later
                        </Button>
                        <Button className="h-8 text-[10px] font-black uppercase tracking-wider" onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0 || isProcessing}>
                            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            Checkout
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden">
                    <DialogHeader className="p-3 border-b bg-muted/10">
                        <DialogTitle className="text-[11px] uppercase font-black">Final Settlement</DialogTitle>
                        <DialogDescription className="text-[9px] uppercase font-bold">Process payment for order WK-{Date.now()}</DialogDescription>
                    </DialogHeader>
                    <div className="p-3 space-y-3">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-center">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Payable</p>
                            <p className="text-3xl font-black text-primary tabular-nums">{formatPrice(cartTotal)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} className="h-10 text-[10px] font-black uppercase" onClick={() => setPaymentMethod('cash')}>CASH</Button>
                            <Button variant={paymentMethod === 'mpesa' ? 'default' : 'outline'} className="h-10 text-[10px] font-black uppercase" onClick={() => setPaymentMethod('mpesa')}>M-PESA</Button>
                        </div>
                        {paymentMethod === 'cash' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                <div className="space-y-0.5">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount Received</Label>
                                    <Input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} className="text-xl h-10 font-black text-center border-2 border-primary/30" autoFocus />
                                </div>
                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg border border-dashed border-primary/30">
                                    <span className="font-bold text-[9px] uppercase">Balance</span>
                                    <span className="text-base font-black text-primary">{formatPrice(Math.max(0, balanceValue))}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    <DialogFooter className="p-3 bg-muted/10 border-t gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)} className="text-[9px] font-bold">CANCEL</Button>
                        <Button onClick={handleCheckout} disabled={isProcessing} className="flex-1 font-black h-8 text-[9px] uppercase">
                            {isProcessing ? <Loader2 className="animate-spin mr-1 h-3 w-3" /> : <CreditCard className="mr-1 h-3 w-3" />}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="p-3 border-b">
                        <DialogTitle className="text-[11px] font-black uppercase">Pending Bills</DialogTitle>
                        <DialogDescription className="text-[9px] font-bold uppercase">Review orders saved for later payment.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-3">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 h-8">
                                    <TableHead className="text-[9px] uppercase font-black">Time</TableHead>
                                    <TableHead className="text-[9px] uppercase font-black">Guest</TableHead>
                                    <TableHead className="text-[9px] uppercase font-black">Items</TableHead>
                                    <TableHead className="text-right text-[9px] uppercase font-black">Total</TableHead>
                                    <TableHead className="text-right text-[9px] uppercase font-black">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingOrders.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic text-[10px]">No pending bills.</TableCell></TableRow>
                                ) : (
                                    pendingOrders.map(order => (
                                        <TableRow key={order.id} className="h-10">
                                            <TableCell className="text-[9px] font-mono">{new Date(order.timestamp).toLocaleTimeString()}</TableCell>
                                            <TableCell className="font-bold text-[10px]">{order.customerName || "Guest"}</TableCell>
                                            <TableCell className="text-[9px] text-muted-foreground">{order.items.length} pcs</TableCell>
                                            <TableCell className="text-right font-black text-primary text-[10px]">{formatPrice(order.totalAmount)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => resumeOrder(order)} className="h-6 text-[8px] font-bold">RESUME</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
                <DialogContent className="max-w-[320px] p-0 overflow-hidden bg-white text-black print-section border-none">
                    <div className="p-4 space-y-2 text-center receipt-font text-[10px] leading-tight w-[70mm] mx-auto">
                        <DialogTitle className="sr-only">Receipt Preview</DialogTitle>
                        <DialogDescription className="sr-only">Official transaction record.</DialogDescription>
                        <div className="space-y-0.5">
                            <h2 className="font-black text-sm uppercase">WAMAGHACH HOTEL</h2>
                            <p className="font-bold text-[7px] uppercase tracking-tighter">Kahua-ini Othaya-Karatina Rd</p>
                            <p className="text-[7px]">Contact: 0720 333 461 | Till: 4209898</p>
                            <div className="mt-2 text-[8px] space-y-0.5 border-y border-dashed border-black py-1">
                                <p>REF: <b>{receiptData?.orderNumber}</b></p>
                                <p>DATE: <b>{new Date().toLocaleString()}</b></p>
                            </div>
                        </div>
                        <table className="w-full text-left text-[9px] border-collapse mt-1.5">
                            <thead>
                                <tr className="border-b border-dashed border-black">
                                    <th className="py-0.5">QTY</th>
                                    <th className="py-0.5">ITEM</th>
                                    <th className="py-0.5 text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receiptData?.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-0.5">{item.quantity}</td>
                                        <td className="py-0.5 uppercase">{item.name}</td>
                                        <td className="py-0.5 text-right">{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="space-y-0.5 text-[9px] border-t border-dashed border-black pt-1">
                            <div className="flex justify-between font-black text-sm">
                                <span>TOTAL</span>
                                <span>{formatPrice(receiptData?.totalAmount || 0)}</span>
                            </div>
                            {receiptData?.paymentMethod === 'cash' && (
                                <div className="flex justify-between">
                                    <span>CASH</span>
                                    <span>{formatPrice(receiptData?.amountReceived || 0)}</span>
                                </div>
                            )}
                        </div>
                        <div className="pt-2 text-[7px] uppercase font-bold">
                            <p>Thank you for choosing Wamaghach!</p>
                        </div>
                        <div className="pt-3 no-print">
                            <Button className="w-full h-7 text-[9px] font-bold" onClick={() => window.print()}>
                                <Printer className="mr-1 h-3 w-3" /> PRINT
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
