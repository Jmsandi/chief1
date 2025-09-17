import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Car, ParkingCircle, Clock, Coins, ArrowLeft, User, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatLeones } from '@/lib/utils';
import { format, differenceInHours } from 'date-fns';

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
    description: string;
    features: string[];
    price_per_hour: number;
  } | null;
  parking_slots?: {
    slot_number: string;
    floor: number;
    price_per_hour: number;
  } | null;
  users?: {
    name: string;
    email: string;
    phone: string;
  } | null;
  payments?: {
    id: string;
    amount: number;
    status: string;
    payment_method: string;
    created_at: string;
  }[];
}

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          cars (model, type, image_url, description, features, price_per_hour),
          parking_slots (slot_number, floor, price_per_hour),
          users (name, email, phone),
          payments (id, amount, status, payment_method, created_at)
        `)
        .eq('id', bookingId);

      // If not admin, only show user's bookings
      if (userRole !== 'admin') {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      setBooking(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch booking details',
        variant: 'destructive',
      });
      navigate('/bookings');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Booking not found</p>
          <Button onClick={() => navigate('/bookings')} className="mt-4">
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const duration = differenceInHours(new Date(booking.end_time), new Date(booking.start_time));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/bookings')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">Booking Details</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
              <Badge className={getPaymentStatusColor(booking.payment_status)}>
                {booking.payment_status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Information */}
          <div className="space-y-6">
            {/* Service Details */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {booking.cars ? (
                    <Car className="h-5 w-5 text-primary" />
                  ) : (
                    <ParkingCircle className="h-5 w-5 text-primary" />
                  )}
                  {booking.cars ? 'Car Rental' : 'Parking Reservation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.cars && (
                  <div className="space-y-4">
                    <img
                      src={booking.cars.image_url || '/placeholder.svg'}
                      alt={booking.cars.model}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{booking.cars.model}</h3>
                      <p className="text-gray-600">{booking.cars.type}</p>
                      <p className="text-sm text-gray-500 mt-2">{booking.cars.description}</p>
                    </div>
                    {booking.cars.features && booking.cars.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {booking.cars.features.map((feature, index) => (
                            <Badge key={index} variant="secondary">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {booking.parking_slots && (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {booking.parking_slots.slot_number}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">Parking Slot {booking.parking_slots.slot_number}</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Floor {booking.parking_slots.floor}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information (Admin only) */}
            {userRole === 'admin' && booking.users && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{booking.users.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{booking.users.email}</span>
                  </div>
                  {booking.users.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{booking.users.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Booking ID: {booking.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date & Time:</span>
                    <span className="font-medium">{format(new Date(booking.start_time), 'PPP p')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date & Time:</span>
                    <span className="font-medium">{format(new Date(booking.end_time), 'PPP p')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate per Hour:</span>
                    <span className="font-medium">
                      {formatLeones(booking.cars?.price_per_hour || booking.parking_slots?.price_per_hour || 0)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">{formatLeones(booking.total_amount)}</span>
                </div>

                {booking.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p className="text-gray-600">{booking.notes}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Status:</span>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      {booking.payment_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{format(new Date(booking.created_at), 'PPP')}</span>
                  </div>
                </div>

                {(booking.status === 'pending' || booking.payment_status === 'pending') && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => navigate(`/payment/${booking.id}`)}
                  >
                    Complete Payment
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{formatLeones(payment.amount)}</p>
                          <p className="text-sm text-gray-600">
                            {payment.payment_method} • {format(new Date(payment.created_at), 'PPP')}
                          </p>
                        </div>
                        <Badge className={getPaymentStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;
