import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatLeones } from '@/lib/utils';

interface BookingRow {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

const AdminReports: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: bData, error: bErr }, { data: pData, error: pErr }] = await Promise.all([
          supabase.from('bookings').select('id,total_amount,status,payment_status,created_at'),
          supabase.from('payments').select('id,amount,status,created_at'),
        ]);
        if (bErr) throw bErr;
        if (pErr) throw pErr;
        setBookings(bData || []);
        setPayments(pData || []);
      } catch (e: any) {
        toast({ title: 'Error', description: 'Failed to load report data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status !== 'completed').length;
    return { totalRevenue, totalBookings, completedBookings, pendingPayments };
  }, [bookings, payments]);

  return (
    <div className="container mx-auto p-6">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">Loading...</div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Reports</h1>
              <p className="text-muted-foreground mt-2">Revenue and usage analytics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Completed payments</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{formatLeones(stats.totalRevenue)}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Bookings</CardTitle>
                <CardDescription>All time</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{stats.totalBookings}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Completed Bookings</CardTitle>
                <CardDescription>Fulfilled rentals</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{stats.completedBookings}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Requires attention</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{stats.pendingPayments}</CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest 10 bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {bookings.slice(0, 10).map((b) => (
                    <li key={b.id} className="flex justify-between text-sm">
                      <span>{new Date(b.created_at).toLocaleString()}</span>
                      <span className="capitalize">{b.status}</span>
                      <span>{formatLeones(b.total_amount)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest 10 transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {payments.slice(0, 10).map((p) => (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span>{new Date(p.created_at).toLocaleString()}</span>
                      <span className="capitalize">{p.status}</span>
                      <span>{formatLeones(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;


