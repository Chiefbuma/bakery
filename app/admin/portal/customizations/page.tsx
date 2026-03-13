
'use client';

import { useState, useEffect } from 'react';
import { getCustomizationOptions, deleteCustomizationOption } from '@/services/cake-service';
import type { CustomizationOptions, CustomizationCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function AdminCustomizationsPage() {
  const { toast } = useToast();
  const [options, setOptions] = useState<CustomizationOptions | null>(null);
  const [activeTab, setActiveTab] = useState<CustomizationCategory>('flavors');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5; // Strict 5-record pagination

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    const data = await getCustomizationOptions();
    setOptions(data);
  };

  const handleDelete = async (id: string) => {
    await deleteCustomizationOption(activeTab, id);
    toast({ variant: "destructive", title: "Option Removed", description: `Deleted from ${activeTab}.` });
    fetchOptions();
  };

  if (!options) return null;

  const currentList = options[activeTab] as any[];
  const totalPages = Math.ceil(currentList.length / recordsPerPage);
  const paginatedList = currentList.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Customization Config</h1>
          <p className="text-muted-foreground font-medium">Add-ons & Premium Upgrades • 5 Records Per Page</p>
        </div>
        <Button className="font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Add Option
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
                   {paginatedList.map((item) => (
                      <TableRow key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <TableCell className="font-bold text-sm">{item.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {activeTab === 'flavors' ? item.description : 
                           activeTab === 'sizes' ? item.serves : 
                           activeTab === 'colors' ? item.hex_value : 'Decoration'}
                        </TableCell>
                        <TableCell className="text-right font-black text-primary text-sm">+{formatPrice(item.price)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="text-primary h-8 w-8"><Edit className="h-4 w-4" /></Button>
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
    </motion.div>
  );
}
