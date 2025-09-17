import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
  cars?: {
    model: string;
    type: string;
    image_url: string;
  };
  parking_slots?: {
    slot_number: string;
    floor: number;
  };
}

type PaymentMethod = 'orange_money' | 'afrimoney' | 'card';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          cars (model, type, image_url),
          parking_slots (slot_number, floor)
        `)
        .eq('id', bookingId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch booking details',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!booking) return;

    setProcessing(true);
    setPaymentStatus('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real implementation, you would integrate with actual payment providers
      const paymentData = {
        booking_id: booking.id,
        amount: booking.total_amount,
        payment_method: paymentMethod,
        status: 'completed'
      };

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData);

      if (paymentError) throw paymentError;

      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'completed',
          status: 'confirmed'
        })
        .eq('id', booking.id);

      if (bookingError) throw bookingError;

      setPaymentStatus('success');
      
      toast({
        title: 'Payment Successful',
        description: 'Your booking has been confirmed!',
      });

      // Redirect to bookings page after 2 seconds
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);

    } catch (error: any) {
      setPaymentStatus('failed');
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'orange_money' || paymentMethod === 'afrimoney') {
      if (!phoneNumber || phoneNumber.length < 8) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid phone number',
          variant: 'destructive',
        });
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!cardNumber || !expiryDate || !cvv) {
        toast({
          title: 'Invalid Card Details',
          description: 'Please fill in all card details',
          variant: 'destructive',
        });
        return;
      }
    }

    processPayment();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Booking not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
            <Button onClick={() => navigate('/bookings')} className="w-full">
              View My Bookings
            </Button>
          </CardContent>
        </Card>
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
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CreditCard className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">Payment</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>Review your booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.cars && (
                <div className="flex items-center space-x-4">
                  <img
                    src={booking.cars.image_url || '/placeholder.svg'}
                    alt={booking.cars.model}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{booking.cars.model}</h3>
                    <p className="text-sm text-gray-600">{booking.cars.type}</p>
                  </div>
                </div>
              )}

              {booking.parking_slots && (
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary">{booking.parking_slots.slot_number}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Parking Slot {booking.parking_slots.slot_number}</h3>
                    <p className="text-sm text-gray-600">Floor {booking.parking_slots.floor}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Start:</span>
                  <span>{format(new Date(booking.start_time), 'PPP p')}</span>
                </div>
                <div className="flex justify-between">
                  <span>End:</span>
                  <span>{format(new Date(booking.end_time), 'PPP p')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="secondary">{booking.status}</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">{formatLeones(booking.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="space-y-4">
                    {/* Orange Money */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="orange_money" id="orange_money" />
                      <Label htmlFor="orange_money" className="flex items-center space-x-3 cursor-pointer flex-1">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Orange Money</div>
                          <div className="text-sm text-gray-500">Pay with Orange Money</div>
                        </div>
                      </Label>
                    </div>

                    {/* Afrimoney */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="afrimoney" id="afrimoney" />
                      <Label htmlFor="afrimoney" className="flex items-center space-x-3 cursor-pointer flex-1">
                        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Afrimoney</div>
                          <div className="text-sm text-gray-500">Pay with Afrimoney</div>
                        </div>
                      </Label>
                    </div>

                    {/* Credit Card */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer flex-1">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Credit/Debit Card</div>
                          <div className="text-sm text-gray-500">Pay with card</div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Payment Details */}
                {(paymentMethod === 'orange_money' || paymentMethod === 'afrimoney') && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      You will receive a prompt on your phone to complete the payment
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentStatus === 'failed' && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Payment failed. Please try again.</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={processing || paymentStatus === 'processing'}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ${formatLeones(booking.total_amount)}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Payment;
