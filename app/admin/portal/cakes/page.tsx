
'use client';

import { useState, useEffect } from 'react';
import { getCakes, deleteCake } from '@/services/cake-service';
import type { Cake } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight, Package, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AdminCakesPage() {
  const { toast } = useToast();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Classic',
    base_price: 0,
    description: '',
    ready_time: '24h',
    customizable: true
  });

  useEffect(() => {
    fetchCakes();
  }, []);

  const fetchCakes = async () => {
    setLoading(true);
    try {
      const data = await getCakes();
      setCakes(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Error", description: "Failed to load catalog." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCake(id);
      toast({ variant: "destructive", title: "Cake Removed", description: "Item deleted from catalog." });
      fetchCakes();
    } catch (error) {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not remove cake." });
    }
  };

  const handleOpenDialog = (cake?: Cake) => {
    if (cake) {
      setEditingCake(cake);
      setFormData({
        name: cake.name,
        category: cake.category,
        base_price: cake.base_price,
        description: cake.description,
        ready_time: cake.ready_time,
        customizable: cake.customizable
      });
    } else {
      setEditingCake(null);
      setFormData({
        name: '',
        category: 'Classic',
        base_price: 0,
        description: '',
        ready_time: '24h',
        customizable: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call the POST/PUT API
    toast({ title: editingCake ? "Cake Updated" : "Cake Created", description: `${formData.name} saved to catalog.` });
    setIsDialogOpen(false);
    fetchCakes();
  };

  const totalPages = Math.max(1, Math.ceil(cakes.length / recordsPerPage));
  const currentCakes = cakes.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Cake Catalog</h1>
          <p className="text-muted-foreground font-medium">Artisanal Inventory • 5 Records Per Page</p>
        </div>
        <Button className="font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20" onClick={() => handleOpenDialog()}>
          <Plus className="h-5 w-5" />
          Add Creation
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-stone-900 text-white">
          <CardTitle className="text-sm uppercase tracking-[0.2em] font-black flex items-center gap-2">
            <Package className="h-4 w-4" />
            Menu Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 border-none">
                <TableHead className="font-black text-[10px] uppercase w-20">Image</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Cake Name</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Category</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Price</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Syncing catalog...</TableCell></TableRow>
              ) : currentCakes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">No items found.</TableCell></TableRow>
              ) : currentCakes.map((cake) => (
                <TableRow key={cake.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-stone-100">
                       <Image src={cake.image_data_uri || 'https://picsum.photos/seed/cake/200/200'} alt={cake.name} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-sm">{cake.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{cake.ready_time} turnaround</p>
                  </TableCell>
                  <TableCell className="font-bold text-xs uppercase tracking-wider">{cake.category}</TableCell>
                  <TableCell className="text-right font-black text-sm">{formatPrice(cake.base_price)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                       <Button variant="ghost" size="icon" className="text-primary h-8 w-8" onClick={() => handleOpenDialog(cake)}><Edit className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(cake.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t flex items-center justify-between bg-stone-50/50">
             <span className="text-xs font-bold text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl font-black">
              {editingCake ? 'Edit Creation' : 'Register New Creation'}
            </DialogTitle>
            <DialogDescription>
              Define the artisanal details for this masterpiece.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cake Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Belgian Truffle" className="h-12 border-2 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Chocolate" className="h-12 border-2 rounded-xl" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Price (Ksh)</Label>
                <Input type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseInt(e.target.value)})} className="h-12 border-2 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lead Time</Label>
                <Input value={formData.ready_time} onChange={e => setFormData({...formData, ready_time: e.target.value})} placeholder="24h" className="h-12 border-2 rounded-xl" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
              <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief artisanal description..." className="h-12 border-2 rounded-xl" required />
            </div>

            <div className="flex items-center space-x-2 bg-stone-50 p-4 rounded-xl border border-dashed">
              <Checkbox id="customizable" checked={formData.customizable} onCheckedChange={(v) => setFormData({...formData, customizable: !!v})} />
              <Label htmlFor="customizable" className="font-bold cursor-pointer">Allow Guest Customizations (Flavor, Size, Frosting)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl">Cancel</Button>
              <Button type="submit" className="h-12 rounded-xl px-8 font-black">Save Masterpiece</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
