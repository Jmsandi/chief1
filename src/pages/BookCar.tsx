import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Calendar as CalendarIcon, Clock, Coins, ArrowLeft, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatLeones } from '@/lib/utils';
import { format, addDays, differenceInHours } from 'date-fns';

interface CarData {
  id: string;
  model: string;
  type: string;
  price_per_hour: number;
  status: string;
  image_url: string;
  description: string;
  features: string[];
}

const BookCar = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Booking form state
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (carId) {
      fetchCar();
    }
  }, [carId]);

  useEffect(() => {
    calculateTotal();
  }, [startDate, endDate, startTime, endTime, car]);

  const fetchCar = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .eq('status', 'available')
        .single();

      if (error) throw error;
      setCar(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch car details',
        variant: 'destructive',
      });
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!startDate || !endDate || !car) return;

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // Set the time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    startDateTime.setHours(startHour, startMinute);
    endDateTime.setHours(endHour, endMinute);

    const hours = differenceInHours(endDateTime, startDateTime);
    if (hours > 0) {
      setTotalAmount(hours * car.price_per_hour);
    } else {
      setTotalAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !car || !startDate || !endDate) return;

    setSubmitting(true);
    try {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      startDateTime.setHours(startHour, startMinute);
      endDateTime.setHours(endHour, endMinute);

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          car_id: car.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          total_amount: totalAmount,
          notes: notes || null,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Booking Created',
        description: 'Your booking has been created successfully. Proceed to payment.',
      });

      // Navigate to payment page
      navigate(`/payment/${data.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Car not found</p>
          <Button onClick={() => navigate('/cars')} className="mt-4">
            Back to Cars
          </Button>
        </div>
      </div>
    );
  }

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/cars')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Car className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">Book Car</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Details */}
          <Card className="card-enhanced">
            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img
                src={car.image_url || '/placeholder.svg'}
                alt={car.model}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 right-4 bg-green-500">
                Available
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">{car.model}</CardTitle>
              <CardDescription className="text-lg">{car.type}</CardDescription>
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Coins className="h-6 w-6" />
                {formatLeones(car.price_per_hour)}/hour
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{car.description}</p>
              {car.features && car.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Book This Car</CardTitle>
              <CardDescription>
                Select your rental dates and times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => date < (startDate || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>

                {/* Total Amount */}
                {totalAmount > 0 && (
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatLeones(totalAmount)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Duration: {startDate && endDate && differenceInHours(
                        new Date(endDate.getTime()).setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1])),
                        new Date(startDate.getTime()).setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]))
                      )} hours
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!startDate || !endDate || totalAmount <= 0 || submitting}
                >
                  {submitting ? 'Creating Booking...' : 'Proceed to Payment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookCar;
