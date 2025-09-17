import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Coins, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatLeones } from '@/lib/utils';

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

const Cars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'available')
        .order('price_per_hour', { ascending: true });

      if (error) throw error;
      setCars(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch cars',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'luxury': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'electric': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'suv': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'sedan': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default: return 'bg-orange-500/10 text-orange-700 border-orange-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Available Cars</h1>
          <p className="text-muted-foreground mt-2">Choose from our premium car rental fleet</p>
        </div>
      </div>

      {cars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No cars available</p>
            <p className="text-muted-foreground">Check back later for available vehicles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Card key={car.id} className="overflow-hidden group">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={car.image_url || '/placeholder.svg'}
                  alt={car.model}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <Badge className={`absolute top-3 right-3 ${getTypeColor(car.type)}`}>
                  {car.type}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl gradient-text">{car.model}</CardTitle>
                    <CardDescription className="text-sm font-medium">{car.type}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary flex items-center">
                      <Coins className="h-5 w-5" />
                      {formatLeones(car.price_per_hour)}
                    </div>
                    <div className="text-xs text-muted-foreground">per hour</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{car.description}</p>
                
                {car.features && car.features.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {car.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {car.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{car.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <Button
                  className="w-full"
                  onClick={() => navigate(`/book-car/${car.id}`)}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cars;
