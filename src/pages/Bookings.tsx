import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Car, ParkingCircle, Clock, Coins, ArrowLeft, Eye, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatLeones } from '@/lib/utils';
import { format } from 'date-fns';

interface BookingData {
  id: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  cars?: {
    model: string;
    type: string;
    image_url: string;
  } | null;
  parking_slots?: {
    slot_number: string;
    floor: number;
  } | null;
}

const Bookings = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          cars (model, type, image_url),
          parking_slots (slot_number, floor)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show user's bookings
      if (userRole !== 'admin') {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.',
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
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

  const filterBookings = (status: string) => {
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-gray-600">Loading bookings...</p>
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
                <Calendar className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">
                  {userRole === 'admin' ? 'All Bookings' : 'My Bookings'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'confirmed', 'active', 'completed'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterBookings(status).map((booking) => (
                  <Card key={booking.id} className="card-enhanced">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {booking.cars ? (
                            <Car className="h-5 w-5 text-primary" />
                          ) : (
                            <ParkingCircle className="h-5 w-5 text-primary" />
                          )}
                          <CardTitle className="text-lg">
                            {booking.cars ? booking.cars.model : `Slot ${booking.parking_slots?.slot_number}`}
                          </CardTitle>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Badge className={getPaymentStatusColor(booking.payment_status)}>
                            {booking.payment_status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {booking.cars ? booking.cars.type : `Floor ${booking.parking_slots?.floor}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {booking.cars && (
                        <div className="flex items-center space-x-3">
                          <img
                            src={booking.cars.image_url || '/placeholder.svg'}
                            alt={booking.cars.model}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{booking.cars.model}</p>
                            <p className="text-sm text-gray-600">{booking.cars.type}</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Start:</span>
                          <span>{format(new Date(booking.start_time), 'MMM dd, HH:mm')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">End:</span>
                          <span>{format(new Date(booking.end_time), 'MMM dd, HH:mm')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-bold text-primary">
                            {formatLeones(booking.total_amount)}
                          </span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="text-sm">
                          <span className="text-gray-600">Notes:</span>
                          <p className="mt-1 text-gray-800">{booking.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/booking-details/${booking.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {booking.status === 'pending' && booking.payment_status === 'pending' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/payment/${booking.id}`)}
                          >
                            Pay Now
                          </Button>
                        )}

                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => cancelBooking(booking.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filterBookings(status).length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {status === 'all' ? '' : status} bookings found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {status === 'all' 
                      ? "You haven't made any bookings yet." 
                      : `You don't have any ${status} bookings.`
                    }
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/cars')}>
                      <Car className="h-4 w-4 mr-2" />
                      Book a Car
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/parking')}>
                      <ParkingCircle className="h-4 w-4 mr-2" />
                      Reserve Parking
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Bookings;
