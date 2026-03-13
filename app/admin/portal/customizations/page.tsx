
'use client';

import { useState, useEffect } from 'react';
import { getCustomizationOptions, deleteCustomizationOption } from '@/services/cake-service';
import type { CustomizationOptions, CustomizationCategory, CustomizationData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function AdminCustomizationsPage() {
  const { toast } = useToast();
  const [options, setOptions] = useState<CustomizationOptions | null>(null);
  const [activeTab, setActiveTab] = useState<CustomizationCategory>('flavors');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const recordsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    detail: '', // Serves, Hex Value, or Description
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const data = await getCustomizationOptions();
      setOptions(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not load variants." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomizationOption(activeTab, id);
      toast({ variant: "destructive", title: "Option Removed", description: `Deleted from ${activeTab}.` });
      fetchOptions();
    } catch (error) {
      toast({ variant: "destructive", title: "Action Failed", description: "Item could not be removed." });
    }
  };

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        detail: activeTab === 'flavors' ? item.description : 
                activeTab === 'sizes' ? item.serves : 
                activeTab === 'colors' ? item.hex_value : ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', price: 0, detail: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: editingItem ? "Variant Updated" : "Variant Added", description: `${formData.name} saved to ${activeTab}.` });
    setIsDialogOpen(false);
    fetchOptions();
  };

  if (!options) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  const currentList = options[activeTab] as any[];
  const totalPages = Math.max(1, Math.ceil(currentList.length / recordsPerPage));
  const paginatedList = currentList.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const getDetailLabel = () => {
    switch (activeTab) {
      case 'flavors': return 'Flavor Description';
      case 'sizes': return 'Servings Info';
      case 'colors': return 'Hex Color Code';
      default: return 'Additional Info';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Customization Config</h1>
          <p className="text-muted-foreground font-medium">Add-ons & Premium Upgrades • 5 Records Per Page</p>
        </div>
        <Button className="font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20" onClick={() => handleOpenDialog()}>
          <Plus className="h-5 w-5" />
          Add Variant
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setCurrentPage(1); }}>
        <TabsList className="bg-stone-200 p-1 rounded-xl h-12 mb-6">
          <TabsTrigger value="flavors" className="rounded-lg font-bold h-full px-6 uppercase text-[10px] tracking-widest">Flavors</TabsTrigger>
          <TabsTrigger value="sizes" className="rounded-lg font-bold h-full px-6 uppercase text-[10px] tracking-widest">Sizes</TabsTrigger>
          <TabsTrigger value="colors" className="rounded-lg font-bold h-full px-6 uppercase text-[10px] tracking-widest">Frosting</TabsTrigger>
          <TabsTrigger value="toppings" className="rounded-lg font-bold h-full px-6 uppercase text-[10px] tracking-widest">Toppings</TabsTrigger>
        </TabsList>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-stone-900 text-white">
            <CardTitle className="text-sm uppercase tracking-[0.2em] font-black flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Pricing & Variants
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                   <TableRow className="bg-stone-50 border-none">
                      <TableHead className="font-black text-[10px] uppercase">Name</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Details</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-right">Premium Price</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-right">Actions</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {paginatedList.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No variants configured.</TableCell></TableRow>
                   ) : paginatedList.map((item) => (
                      <TableRow key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <TableCell className="font-bold text-sm">
                           {activeTab === 'colors' && <div className="inline-block w-3 h-3 rounded-full mr-2 border" style={{backgroundColor: item.hex_value}} />}
                           {item.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {activeTab === 'flavors' ? item.description : 
                           activeTab === 'sizes' ? item.serves : 
                           activeTab === 'colors' ? item.hex_value : 'Decoration Option'}
                        </TableCell>
                        <TableCell className="text-right font-black text-primary text-sm">+{formatPrice(item.price)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="text-primary h-8 w-8" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
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
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle className="font-headline text-2xl font-black">{editingItem ? 'Edit Variant' : 'Add New Variant'}</DialogTitle>
               <DialogDescription>Configure pricing and details for this {activeTab.slice(0, -1)}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Option Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Gold" className="h-12 border-2 rounded-xl" required />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Premium Price Add-on</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="h-12 border-2 rounded-xl" required />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{getDetailLabel()}</Label>
                  <Input value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} placeholder={activeTab === 'colors' ? '#000000' : 'Additional context...'} className="h-12 border-2 rounded-xl" />
               </div>
               <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl">Cancel</Button>
                  <Button type="submit" className="h-12 rounded-xl px-8 font-black">Save Variant</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
    </motion.div>
  );
}
