import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ParkingCircle, Calendar as CalendarIcon, Clock, Coins, ArrowLeft, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatLeones } from '@/lib/utils';
import { format, differenceInHours } from 'date-fns';

interface ParkingSlot {
  id: string;
  slot_number: string;
  floor: number;
  status: string;
  price_per_hour: number;
}

const ParkingReservation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Booking form state
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchParkingSlots();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [startDate, endDate, startTime, endTime, selectedSlot]);

  const fetchParkingSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_slots')
        .select('*')
        .eq('status', 'available')
        .order('floor', { ascending: true })
        .order('slot_number', { ascending: true });

      if (error) throw error;
      setParkingSlots(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch parking slots',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!startDate || !endDate || !selectedSlot) return;

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    startDateTime.setHours(startHour, startMinute);
    endDateTime.setHours(endHour, endMinute);

    const hours = differenceInHours(endDateTime, startDateTime);
    if (hours > 0) {
      setTotalAmount(hours * selectedSlot.price_per_hour);
    } else {
      setTotalAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSlot || !startDate || !endDate) return;

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
          parking_slot_id: selectedSlot.id,
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
        title: 'Reservation Created',
        description: 'Your parking reservation has been created successfully. Proceed to payment.',
      });

      navigate(`/payment/${data.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create reservation',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getFloorColor = (floor: number) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];
    return colors[(floor - 1) % colors.length];
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-gray-600">Loading parking slots...</p>
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
                <ParkingCircle className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">Reserve Parking</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Parking Slots Selection */}
          <div className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Available Parking Slots</CardTitle>
                <CardDescription>
                  Select a parking slot for your reservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {parkingSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedSlot?.id === slot.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{slot.slot_number}</h3>
                            <Badge className={getFloorColor(slot.floor)}>
                              Floor {slot.floor}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-primary font-bold">
                              <Coins className="h-4 w-4 mr-1" />
                              {formatLeones(slot.price_per_hour)}
                            </div>
                            <div className="text-xs text-gray-500">per hour</div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          Level {slot.floor}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {parkingSlots.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No parking slots available at the moment
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reservation Form */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Reservation Details</CardTitle>
              <CardDescription>
                {selectedSlot 
                  ? `Selected: ${selectedSlot.slot_number} (Floor ${selectedSlot.floor})`
                  : 'Please select a parking slot first'
                }
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
                          disabled={!selectedSlot}
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
                          disabled={!selectedSlot}
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
                    <Select value={startTime} onValueChange={setStartTime} disabled={!selectedSlot}>
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
                    <Select value={endTime} onValueChange={setEndTime} disabled={!selectedSlot}>
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
                    placeholder="Vehicle details, special requirements..."
                    rows={3}
                    disabled={!selectedSlot}
                  />
                </div>

                {/* Total Amount */}
                {totalAmount > 0 && selectedSlot && (
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
                  disabled={!selectedSlot || !startDate || !endDate || totalAmount <= 0 || submitting}
                >
                  {submitting ? 'Creating Reservation...' : 'Proceed to Payment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ParkingReservation;
