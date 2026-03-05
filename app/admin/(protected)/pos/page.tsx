
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { getProducts, placeOrder, getPendingOrders } from "@/services/hotel-service";
import type { Product, HotelModule, SaleItem, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, History, Printer, Plus, Minus, Loader2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';

export const dynamic = 'force-dynamic';

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

    const resolveImageUrl = (url: string | null | undefined) => {
        if (!url) return 'https://picsum.photos/seed/hotel/400/300';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads/')) {
            return `/api/media/${url.replace('/uploads/', '')}`;
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
            const price = Number(product.price);
            const costPrice = Number(product.costPrice);
            if (existing) {
                return prev.map(item => {
                    if (item.productId === product.id) {
                        const newQty = item.quantity + 1;
                        return { ...item, quantity: newQty, total: Number((newQty * price).toFixed(2)) };
                    }
                    return item;
                });
            }
            return [...prev, { 
                productId: product.id, 
                name: product.name, 
                quantity: 1, 
                price: price, 
                costPrice: costPrice,
                total: price 
            }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === id) {
                const newQty = Math.max(1, item.quantity + delta);
                const price = Number(item.price);
                return { ...item, quantity: newQty, total: Number((newQty * price).toFixed(2)) };
            }
            return item;
        }));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    }, [cart]);

    const balanceValue = useMemo(() => {
        const received = parseFloat(amountReceived) || 0;
        return received - cartTotal;
    }, [amountReceived, cartTotal]);

    const finalizeOrder = async (method: 'cash' | 'mpesa' | 'none', status: 'paid' | 'pending', received?: number, bal?: number) => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        
        const itemsSnapshot = [...cart];
        const finalCustomerName = customerName || "Guest";
        const totalCost = itemsSnapshot.reduce((acc, item) => acc + (Number(item.costPrice) * item.quantity), 0);

        try {
            const response = await placeOrder({
                orderNumber: `WK-${Date.now()}`,
                module: activeModule,
                items: itemsSnapshot,
                totalAmount: cartTotal,
                totalCost,
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
                    totalCost,
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
            loadData();
            toast({ title: status === 'paid' ? "Sale Complete" : "Order Held" });
        } catch (err) {
            toast({ variant: "destructive", title: "Transaction Failed" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckout = () => {
        if (paymentMethod === 'cash') {
            const received = parseFloat(amountReceived);
            if (isNaN(received) || received < cartTotal) {
                toast({ variant: "destructive", title: "Amount received is insufficient" });
                return;
            }
            finalizeOrder('cash', 'paid', received, balanceValue);
        } else {
            handleMpesaPayment();
        }
    };

    const handleMpesaPayment = () => {
        if (!(window as any).PaystackPop) {
            toast({ variant: "destructive", title: "Payment system unavailable" });
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

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            <style jsx global>{`
                @font-face {
                    font-family: 'pixFueler-C';
                    src: local('Courier New'), local('Courier'), monospace;
                }
                .receipt-font {
                    font-family: 'pixFueler-C', monospace;
                }
                @media print {
                    .no-print { display: none !important; }
                    body * { visibility: hidden; }
                    .print-section, .print-section * { visibility: visible; }
                    .print-section { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 80mm; 
                        margin: 0; 
                        padding: 5mm;
                        background: white;
                    }
                }
            `}</style>

            <div className="flex-1 flex flex-col min-w-0 border-r">
                <div className="p-4 border-b bg-card flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search items..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setIsHistoryOpen(true)} className="relative">
                        <History className="h-4 w-4" />
                        {pendingOrders.length > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px]">{pendingOrders.length}</Badge>}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <button key={product.id} className="group relative flex flex-col bg-card rounded-xl border hover:border-primary hover:shadow-lg transition-all text-left overflow-hidden" onClick={() => addToCart(product)}>
                                <div className="relative h-32 w-full bg-muted">
                                    <Image src={resolveImageUrl(product.image_url)} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-sm truncate">{product.name}</h3>
                                    <span className="text-primary font-bold">{formatPrice(Number(product.price))}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-[480px] flex flex-col bg-card shadow-xl border-l">
                <div className="p-4 border-b flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <h2 className="font-bold">Active Cart</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <Input placeholder="Guest Name / Table" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    
                    <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-black text-muted-foreground px-2">
                            <div className="col-span-5">Item</div>
                            <div className="col-span-3 text-center">Qty</div>
                            <div className="col-span-4 text-right">Amount</div>
                        </div>
                        <Separator />
                        {cart.map(item => (
                            <div key={item.productId} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-lg border border-transparent hover:border-primary/20 transition-colors">
                                <div className="col-span-5 min-w-0">
                                    <p className="text-xs font-bold truncate">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{formatPrice(item.price)}</p>
                                </div>
                                <div className="col-span-3 flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={() => updateQuantity(item.productId, -1)}><Minus className="h-2 w-2" /></Button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={() => updateQuantity(item.productId, 1)}><Plus className="h-2 w-2" /></Button>
                                </div>
                                <div className="col-span-4 text-right">
                                    <p className="text-xs font-black text-primary">{formatPrice(item.total)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t bg-muted/20 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-muted-foreground font-medium uppercase tracking-tighter text-xs">Grand Total</span>
                        <span className="text-3xl font-black text-primary leading-none">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => finalizeOrder('none', 'pending')} disabled={cart.length === 0 || isProcessing}>Hold Bill</Button>
                        <Button onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0 || isProcessing}>Checkout</Button>
                    </div>
                </div>
            </div>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader><DialogTitle>Payment Confirmation</DialogTitle></DialogHeader>
                    
                    <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20 text-center space-y-2">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total Amount Due</p>
                        <p className="text-5xl font-black text-primary">{formatPrice(cartTotal)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} className="h-16 text-lg font-bold" onClick={() => setPaymentMethod('cash')}>CASH</Button>
                        <Button variant={paymentMethod === 'mpesa' ? 'default' : 'outline'} className="h-16 text-lg font-bold" onClick={() => setPaymentMethod('mpesa')}>M-PESA</Button>
                    </div>

                    {paymentMethod === 'cash' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cash Amount Received (Ksh)</Label>
                                <Input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} className="text-3xl h-16 font-black text-center" autoFocus />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-dashed border-primary/30">
                                <span className="font-bold text-sm">Change Due</span>
                                <span className="text-2xl font-black text-primary">{formatPrice(Math.max(0, balanceValue))}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                        <Button onClick={handleCheckout} disabled={isProcessing} className="min-w-[150px] font-bold">
                            {isProcessing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            Complete Sale
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
                <DialogContent className="max-w-[400px] p-0 overflow-hidden bg-white text-black print-section">
                    <div className="p-8 space-y-4 text-center receipt-font text-sm leading-tight w-[80mm] mx-auto">
                        <div className="space-y-1">
                            <p className="font-bold uppercase">Wamaghach Kahua-ini Hotel , Along Othaya-Karatina Road, 500 metres from Kiahungu Town, Contact 0720 333 461, MPESA BUY GOODS TILL 4209898</p>
                            {receiptData?.paymentMethod !== 'none' && (
                                <>
                                    <p>Receipt Ref: <b>{receiptData?.orderNumber}</b></p>
                                    <p>Date: <b>{new Date(receiptData?.timestamp || '').toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}</b></p>
                                </>
                            )}
                        </div>
                        
                        <Separator className="border-black border-dashed" />
                        <p className="font-bold uppercase">Order Items</p>
                        
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-dashed border-black">
                                    <td className="py-1"><b>QTY</b></td>
                                    <td className="py-1"><b>Item</b></td>
                                    <td className="py-1 text-right"><b>Amount</b></td>
                                </tr>
                            </thead>
                            <tbody>
                                {receiptData?.items?.map((item: any) => (
                                    <tr key={item.productId}>
                                        <td className="py-1">{item.quantity}</td>
                                        <td className="py-1">{item.name}</td>
                                        <td className="py-1 text-right">{formatPrice(Number(item.total))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <Separator className="border-black border-dashed" />

                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <b>Total Amount</b>
                                <b>{formatPrice(Number(receiptData?.totalAmount || 0))}</b>
                            </div>
                            {receiptData?.paymentMethod === 'cash' && (
                                <>
                                    <div className="flex justify-between">
                                        <b>Amount Tendered</b>
                                        <b>{formatPrice(Number(receiptData?.amountReceived || 0))}</b>
                                    </div>
                                    <div className="flex justify-between">
                                        <b>Change</b>
                                        <b>{formatPrice(Number(receiptData?.balance || 0))}</b>
                                    </div>
                                </>
                            )}
                        </div>

                        <Separator className="border-black border-dashed" />

                        <div className="space-y-1">
                            <p className="font-bold uppercase">Order Reference</p>
                            <h4 className="font-bold text-lg">{receiptData?.orderNumber}</h4>
                        </div>

                        <div className="pt-4 flex flex-col gap-2 no-print">
                            <Button className="w-full" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> Print Receipt
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setReceiptData(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
