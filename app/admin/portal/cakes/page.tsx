
'use client';

import { useState, useEffect } from 'react';
import { getCakes, createCake, updateCake, deleteCake, uploadImage } from '@/services/cake-service';
import type { Cake } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight, Package, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

const CATEGORIES = ['Classic', 'Chocolate', 'Fruit', 'Specialty', 'Custom'];

export default function AdminCakesPage() {
  const { toast } = useToast();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const recordsPerPage = 5;

  const [formData, setFormData] = useState({
    name: '',
    category: 'Classic',
    base_price: 0,
    description: '',
    ready_time: '24h',
    customizable: true,
    image_data_uri: ''
  });

  const buildCakePayload = () => ({
    name: formData.name.trim(),
    category: formData.category.trim(),
    base_price: Number(formData.base_price) || 0,
    description: formData.description.trim(),
    ready_time: formData.ready_time.trim(),
    customizable: Boolean(formData.customizable),
    image_data_uri: formData.image_data_uri?.trim() || '',
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_data_uri: url }));
      toast({ title: "Image Uploaded", description: "Masterpiece preview updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not save image." });
    } finally {
      setIsUploading(false);
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
        base_price: Number(cake.base_price) || 0,
        description: cake.description,
        ready_time: cake.ready_time,
        customizable: Boolean(cake.customizable),
        image_data_uri: cake.image_data_uri || ''
      });
    } else {
      setEditingCake(null);
      setFormData({
        name: '',
        category: 'Classic',
        base_price: 0,
        description: '',
        ready_time: '24h',
        customizable: true,
        image_data_uri: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = buildCakePayload();
      if (editingCake) {
        await updateCake(editingCake.id, payload);
      } else {
        await createCake({
          ...payload,
          id: payload.name.toLowerCase().replace(/\s+/g, '-'),
        });
      }
      toast({ title: editingCake ? "Cake Updated" : "Cake Created", description: `${formData.name} saved to catalog.` });
      setIsDialogOpen(false);
      fetchCakes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submit Failed",
        description: error instanceof Error ? error.message : "Could not save masterpiece."
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(cakes.length / recordsPerPage));
  const currentCakes = cakes.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Cake Catalog</h1>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Artisanal Inventory • 5 Records Per Page</p>
        </div>
        <Button className="font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20" onClick={() => handleOpenDialog()}>
          <Plus className="h-5 w-5" />
          Add Creation
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-stone-900 text-white">
          <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
            <Package className="h-4 w-4" />
            Active Menu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 border-none">
                <TableHead className="font-black text-[10px] uppercase w-20">Preview</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Masterpiece</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Collection</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Price</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Syncing catalog...</TableCell></TableRow>
              ) : currentCakes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic text-xs">No items found.</TableCell></TableRow>
              ) : currentCakes.map((cake) => (
                <TableRow key={cake.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-stone-100">
                       <Image src={cake.image_data_uri || 'https://picsum.photos/seed/cake/200/200'} alt={cake.name} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-sm">{cake.name}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{cake.ready_time} turnaround</p>
                  </TableCell>
                  <TableCell className="font-bold text-xs uppercase tracking-wider text-stone-500">{cake.category}</TableCell>
                  <TableCell className="text-right font-black text-sm text-primary">{formatPrice(cake.base_price)}</TableCell>
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
        <DialogContent className="max-w-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl font-black tracking-tight">
              {editingCake ? 'Edit Creation' : 'Register New Creation'}
            </DialogTitle>
            <DialogDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Define the artisanal details for this masterpiece.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="relative aspect-square w-full rounded-[2rem] border-4 border-dashed border-stone-100 flex flex-col items-center justify-center bg-stone-50 overflow-hidden shrink-0 group shadow-inner">
                {formData.image_data_uri ? (
                  <>
                    <Image src={formData.image_data_uri} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Label htmlFor="image-upload" className="cursor-pointer text-white text-[10px] font-black uppercase tracking-widest">Change Photo</Label>
                    </div>
                  </>
                ) : (
                  <>
                    {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <Upload className="h-8 w-8 text-stone-300" />}
                    <Label htmlFor="image-upload" className="cursor-pointer mt-3 text-[10px] font-black uppercase text-stone-400 tracking-widest">Add Masterpiece Photo</Label>
                  </>
                )}
                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cake Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Belgian Truffle" className="h-12 border-2 rounded-xl text-sm font-black" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Collection</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger className="h-12 border-2 rounded-xl text-sm font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base (Ksh)</Label>
                    <Input type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseInt(e.target.value)})} className="h-12 border-2 rounded-xl text-sm font-black" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lead Time</Label>
                    <Input value={formData.ready_time} onChange={e => setFormData({...formData, ready_time: e.target.value})} placeholder="48h" className="h-12 border-2 rounded-xl text-sm font-black" required />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Artisanal Description</Label>
              <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the masterpiece flavor notes..." className="h-12 border-2 rounded-xl text-sm font-black" required />
            </div>

            <div className="flex items-center space-x-3 bg-stone-50 p-5 rounded-2xl border-2 border-dashed border-stone-200">
              <Checkbox id="customizable" checked={formData.customizable} onCheckedChange={(v) => setFormData({...formData, customizable: !!v})} className="h-5 w-5 rounded-md" />
              <Label htmlFor="customizable" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-stone-600">Allow Guest Customizations (Flavor, Size, Frosting)</Label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-14 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</Button>
              <Button type="submit" className="h-14 rounded-xl px-12 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20" disabled={isUploading}>
                {isUploading ? <Loader2 className="animate-spin" /> : 'Save Masterpiece'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
