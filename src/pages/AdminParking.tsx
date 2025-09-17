import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type ParkingStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

interface ParkingSlot {
  id?: string;
  slot_number: string;
  floor: number;
  status: ParkingStatus;
  price_per_hour: number;
}

const AdminParking: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ParkingSlot | null>(null);
  const [form, setForm] = useState<ParkingSlot>({
    slot_number: '',
    floor: 1,
    status: 'available',
    price_per_hour: 5,
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_slots')
        .select('*')
        .order('floor', { ascending: true })
        .order('slot_number', { ascending: true });
      if (error) throw error;
      setSlots(data || []);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load parking slots', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ slot_number: '', floor: 1, status: 'available', price_per_hour: 5 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slot_number || form.price_per_hour <= 0) {
      toast({ title: 'Error', description: 'Provide a valid slot number and price', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      if (editing?.id) {
        const { error } = await supabase.from('parking_slots').update({
          slot_number: form.slot_number,
          floor: form.floor,
          status: form.status,
          price_per_hour: form.price_per_hour,
        }).eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Updated', description: 'Parking slot updated successfully' });
      } else {
        const { error } = await supabase.from('parking_slots').insert([form]);
        if (error) throw error;
        toast({ title: 'Created', description: 'Parking slot created successfully' });
      }
      setDialogOpen(false);
      resetForm();
      fetchSlots();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (slot: ParkingSlot) => {
    setEditing(slot);
    setForm({
      slot_number: slot.slot_number,
      floor: slot.floor,
      status: slot.status,
      price_per_hour: slot.price_per_hour,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this parking slot?')) return;
    try {
      const { error } = await supabase.from('parking_slots').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Parking slot removed' });
      fetchSlots();
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to delete parking slot', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-6">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Parking Slots</h1>
              <p className="text-muted-foreground mt-2">Manage parking inventory</p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Slot' : 'Create Slot'}</DialogTitle>
                  <DialogDescription>Fill the details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="slot_number">Slot Number</Label>
                      <Input id="slot_number" value={form.slot_number} onChange={(e) => setForm({ ...form, slot_number: e.target.value })} placeholder="A-01" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor">Floor</Label>
                      <Input id="floor" type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: parseInt(e.target.value || '0', 10) })} min={0} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Hour (Le)</Label>
                      <Input id="price" type="number" step="0.01" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={form.status} onValueChange={(value: ParkingStatus) => setForm({ ...form, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={saving}>{saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : (editing ? 'Update' : 'Create')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Slots</CardTitle>
              <CardDescription>Manage availability and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price/hr</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.slot_number}</TableCell>
                      <TableCell>{s.floor}</TableCell>
                      <TableCell className="capitalize">{s.status}</TableCell>
                      <TableCell>{s.price_per_hour}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id!)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminParking;


