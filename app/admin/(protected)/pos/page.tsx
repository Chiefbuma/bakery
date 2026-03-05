
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
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
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

    const cartTotal = cart.reduce((acc, curr) => acc + curr.total, 0);
    const balanceValue = amountReceived ? parseFloat(amountReceived) - cartTotal : 0;

    const finalizeOrder = async (method: 'cash' | 'mpesa' | 'none', status: 'paid' | 'pending', received?: number, bal?: number) => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        const totalCost = cart.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
        
        const itemsSnapshot = JSON.parse(JSON.stringify(cart));
        const finalCustomerName = customerName || "Guest";

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
                toast({ title: "Order Complete" });
            } else {
                toast({ title: "Order Saved as Pending" });
            }

            setCart([]);
            setCustomerName("");
            setAmountReceived("");
            setIsPaymentOpen(false);
            loadData();
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
                    .print-section { position: absolute; left: 0; top: 0; width: 80mm; }
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
                                    <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-[400px] flex flex-col bg-card shadow-xl border-l">
                <div className="p-4 border-b flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <h2 className="font-bold">Active Cart</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <Input placeholder="Guest Name / Table" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    <Separator />
                    {cart.map(item => (
                        <div key={item.productId} className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, -1)}><Minus className="h-3 w-3" /></Button>
                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, 1)}><Plus className="h-3 w-3" /></Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t bg-muted/20 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-muted-foreground font-medium">Grand Total</span>
                        <span className="text-3xl font-black text-primary leading-none">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => finalizeOrder('none', 'pending')} disabled={cart.length === 0 || isProcessing}>Hold Bill</Button>
                        <Button onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0 || isProcessing}>Checkout</Button>
                    </div>
                </div>
            </div>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Payment Confirmation</DialogTitle></DialogHeader>
                    
                    <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20 text-center space-y-2">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Amount Due</p>
                        <p className="text-5xl font-black text-primary">{formatPrice(cartTotal)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} className="h-16 text-lg font-bold" onClick={() => setPaymentMethod('cash')}>CASH</Button>
                        <Button variant={paymentMethod === 'mpesa' ? 'default' : 'outline'} className="h-16 text-lg font-bold" onClick={() => setPaymentMethod('mpesa')}>M-PESA</Button>
                    </div>

                    {paymentMethod === 'cash' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cash Amount Received (Ksh)</Label>
                                <Input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} className="text-2xl h-14 font-black text-center" autoFocus />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg border">
                                <span className="font-bold">Change Due</span>
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
                            <p className="font-bold">
                                {receiptData?.paymentMethod !== 'none' 
                                    ? "Wamaghach Kahua-ini Hotel , Along Othaya-Karatina Road, 500 metres from Kiahungu Town, Contact 0720 333 461, MPESA BUY GOODS TILL 4209898" 
                                    : "Bill"}
                            </p>
                            {receiptData?.paymentMethod !== 'none' && (
                                <>
                                    <p>Receipt Ref: <b>{receiptData?.orderNumber}</b></p>
                                    <p>Date: <b>{new Date(receiptData?.timestamp || '').toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}</b></p>
                                </>
                            )}
                        </div>
                        
                        <Separator className="border-black border-dashed" />
                        <p className="font-bold">Order</p>
                        
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-dashed border-black">
                                    <td className="py-1"><b>QTY</b></td>
                                    <td className="py-1"><b>Order</b></td>
                                    <td className="py-1 text-right"><b>Amount</b></td>
                                </tr>
                            </thead>
                            <tbody>
                                {receiptData?.items?.map((item: any) => (
                                    <tr key={item.productId}>
                                        <td className="py-1">{item.quantity}</td>
                                        <td className="py-1">{item.name}</td>
                                        <td className="py-1 text-right">{formatPrice(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <Separator className="border-black border-dashed" />

                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <b>Total Amount</b>
                                <b>{formatPrice(receiptData?.totalAmount || 0)}</b>
                            </div>
                            {receiptData?.paymentMethod === 'cash' && (
                                <>
                                    <div className="flex justify-between">
                                        <b>Amount Tendered</b>
                                        <b>{formatPrice(receiptData?.amountReceived || 0)}</b>
                                    </div>
                                    <div className="flex justify-between">
                                        <b>Change</b>
                                        <b>{formatPrice(receiptData?.balance || 0)}</b>
                                    </div>
                                </>
                            )}
                        </div>

                        <Separator className="border-black border-dashed" />

                        <div className="space-y-1">
                            <p className="font-bold">Order Name.</p>
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
