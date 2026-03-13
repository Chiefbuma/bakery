'use client';

import { useState, useEffect } from 'react';
import { getCakes, deleteCake } from '@/services/cake-service';
import type { Cake } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AdminCakesPage() {
  const { toast } = useToast();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchCakes();
  }, []);

  const fetchCakes = async () => {
    const data = await getCakes();
    setCakes(data);
  };

  const handleDelete = async (id: string) => {
    await deleteCake(id);
    toast({ variant: "destructive", title: "Cake Removed", description: "Menu item deleted." });
    fetchCakes();
  };

  const totalPages = Math.ceil(cakes.length / recordsPerPage);
  const currentCakes = cakes.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Cake Catalog</h1>
          <p className="text-muted-foreground font-medium">Manage your artisanal collection and base pricing.</p>
        </div>
        <Button className="font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Add Creation
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-stone-900 text-white">
          <CardTitle className="text-sm uppercase tracking-[0.2em] font-black flex items-center gap-2">
            <Package className="h-4 w-4" />
            Menu Items (5 per page)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 border-none">
                <TableHead className="font-black text-[10px] uppercase w-20">Image</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Cake Name</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Category</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Base Price</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCakes.map((cake) => (
                <TableRow key={cake.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-stone-100">
                       <Image src={cake.image_data_uri || ''} alt={cake.name} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">{cake.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{cake.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-xs uppercase tracking-wider">{cake.category}</TableCell>
                  <TableCell className="text-right font-black text-sm">{formatPrice(cake.base_price)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                       <Button variant="ghost" size="icon" className="text-primary h-8 w-8">
                         <Edit className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(cake.id)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
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
    </motion.div>
  );
}
