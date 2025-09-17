import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, ArrowLeft, Download, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatLeones } from '@/lib/utils';
import { format } from 'date-fns';

interface PaymentData {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  bookings: {
    id: string;
    start_time: string;
    end_time: string;
    users: {
      name: string;
      email: string;
    };
    cars?: {
      model: string;
      type: string;
    } | null;
    parking_slots?: {
      slot_number: string;
      floor: number;
    } | null;
  };
}

const AdminPayments = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { toast } = useToast();
  
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchPayments();
  }, [userRole]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            id,
            start_time,
            end_time,
            users (name, email),
            cars (model, type),
            parking_slots (slot_number, floor)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'orange_money':
        return 'bg-orange-100 text-orange-800';
      case 'afrimoney':
        return 'bg-green-100 text-green-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterPayments = (status: string) => {
    let filtered = payments;
    
    if (status !== 'all') {
      filtered = filtered.filter(payment => payment.status === status);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.bookings.users.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.bookings.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const calculateTotalRevenue = () => {
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CreditCard className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">Payment Management</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{payments.length}</div>
                <div className="text-sm text-gray-600">Total Payments</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {payments.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {payments.filter(p => p.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatLeones(calculateTotalRevenue())}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer name, email, or payment ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="refunded">Refunded</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'completed', 'failed', 'refunded'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterPayments(status).map((payment) => (
                <Card key={payment.id} className="card-enhanced">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Payment Info */}
                      <div>
                        <h3 className="font-semibold text-lg">{formatLeones(payment.amount)}</h3>
                        <p className="text-sm text-gray-600">Payment ID: {payment.id.slice(0, 8)}...</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <Badge className={getPaymentMethodColor(payment.payment_method)}>
                            {payment.payment_method.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium">{payment.bookings.users.name}</h4>
                        <p className="text-sm text-gray-600">{payment.bookings.users.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(payment.created_at), 'PPP p')}
                        </p>
                      </div>

                      {/* Service Info */}
                      <div>
                        {payment.bookings.cars ? (
                          <div>
                            <h4 className="font-medium">{payment.bookings.cars.model}</h4>
                            <p className="text-sm text-gray-600">{payment.bookings.cars.type}</p>
                            <p className="text-xs text-gray-500">Car Rental</p>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-medium">Slot {payment.bookings.parking_slots?.slot_number}</h4>
                            <p className="text-sm text-gray-600">Floor {payment.bookings.parking_slots?.floor}</p>
                            <p className="text-xs text-gray-500">Parking</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/booking-details/${payment.bookings.id}`)}
                        >
                          View Booking
                        </Button>
                        {payment.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filterPayments(status).length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {status === 'all' ? '' : status} payments found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'Try adjusting your search criteria.' 
                      : `No ${status === 'all' ? '' : status} payments to display.`
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPayments;
