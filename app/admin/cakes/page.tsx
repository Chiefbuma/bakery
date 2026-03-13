
'use client';

import { useState, useEffect } from 'react';
import { getCakes, deleteCake, updateCake } from '@/services/cake-service';
import type { Cake } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

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
    toast({ variant: "destructive", title: "Cake Removed", description: "The item has been removed from the menu." });
    fetchCakes();
  };

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentCakes = cakes.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(cakes.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Cake Catalog</h1>
          <p className="text-muted-foreground font-medium">Manage your artisanal creations and pricing.</p>
        </div>
        <Button className="font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Add New Cake
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-stone-900 text-white rounded-t-lg">
          <CardTitle className="text-sm uppercase tracking-[0.2em] font-black">Menu Items</CardTitle>
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
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border">
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
                  <TableCell className="text-right font-black">{formatPrice(cake.base_price)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
          
          <div className="p-4 border-t flex items-center justify-between">
             <span className="text-xs font-bold text-muted-foreground">Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, cakes.length)} of {cakes.length}</span>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
