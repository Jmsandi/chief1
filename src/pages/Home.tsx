import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Car, ParkingCircle, Clock, Shield, CreditCard, MapPin, Star, Coins, ChevronRight, Users } from 'lucide-react';
import { formatLeones } from '@/lib/utils';
interface CarData {
  id: string;
  model: string;
  type: string;
  price_per_hour: number;
  image_url: string;
  description: string;
  features: string[];
}
const Home = () => {
  const {
    user,
    userRole
  } = useAuth();
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchFeaturedCars();
  }, []);
  const fetchFeaturedCars = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('cars').select('*').eq('status', 'available').limit(6).order('price_per_hour', {
        ascending: true
      });
      if (error) throw error;
      setFeaturedCars(data || []);
    } catch (error) {
      console.error('Error fetching featured cars:', error);
    } finally {
      setLoading(false);
    }
  };
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'luxury':
        return 'bg-purple-100 text-purple-800';
      case 'electric':
        return 'bg-green-100 text-green-800';
      case 'suv':
        return 'bg-blue-100 text-blue-800';
      case 'sedan':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };
  const features = [{
    icon: Car,
    title: "Premium Fleet",
    description: "Choose from our carefully selected range of modern, well-maintained vehicles"
  }, {
    icon: ParkingCircle,
    title: "Secure Parking",
    description: "Reserve guaranteed parking spots at prime locations throughout the city"
  }, {
    icon: Clock,
    title: "24/7 Service",
    description: "Book anytime, anywhere with our round-the-clock customer support"
  }, {
    icon: Shield,
    title: "Fully Insured",
    description: "All rentals include comprehensive insurance coverage for your peace of mind"
  }, {
    icon: CreditCard,
    title: "Easy Payment",
    description: "Secure online payments with instant booking confirmation"
  }, {
    icon: MapPin,
    title: "Multiple Locations",
    description: "Convenient pickup and drop-off points across the city"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              <ParkingCircle className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">Gbankay ParkDrive </h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? <>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                  <Button onClick={() => navigate('/cars')}>
                    Browse Cars
                  </Button>
                </> : <>
                  <Button variant="outline" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth')}>
                    Get Started
                  </Button>
                </>}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Car Rentals & Parking
            <span className="block text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience seamless car rentals and guaranteed parking spots. 
            Book your perfect vehicle and secure parking in just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate(user ? '/cars' : '/auth')}>
              <Car className="mr-2 h-5 w-5" />
              Browse Cars
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate(user ? '/parking' : '/auth')}>
              <ParkingCircle className="mr-2 h-5 w-5" />
              Reserve Parking
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ParkDrive Hub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make car rentals and parking reservations effortless with our comprehensive platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Featured Vehicles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our premium fleet of well-maintained, modern vehicles
            </p>
          </div>

          {loading ? <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div> : <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredCars.map(car => <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative">
                      <img src={car.image_url || '/placeholder.svg'} alt={car.model} className="w-full h-full object-cover" />
                      <Badge className={`absolute top-2 right-2 ${getTypeColor(car.type)}`}>
                        {car.type}
                      </Badge>
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-lg font-bold text-primary flex items-center">
                          <Coins className="h-4 w-4" />
                          {formatLeones(car.price_per_hour)}/hr
                        </span>
                      </div>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{car.model}</span>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">4.8</span>
                        </div>
                      </CardTitle>
                      <CardDescription>{car.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {car.features && car.features.length > 0 && <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {car.features.slice(0, 3).map((feature, index) => <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>)}
                            {car.features.length > 3 && <Badge variant="secondary" className="text-xs">
                                +{car.features.length - 3} more
                              </Badge>}
                          </div>
                        </div>}
                      
                      <Button
                        className="w-full"
                        onClick={() => navigate(user ? `/book-car/${car.id}` : '/auth')}
                      >
                        {user ? 'Book Now' : 'Sign Up to Book'}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>)}
              </div>

              <div className="text-center">
                <Button variant="outline" size="lg" onClick={() => navigate('/cars')}>
                  View All Cars
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">Premium Vehicles</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-primary-foreground/80">Parking Spots</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-primary-foreground/80">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers who trust ParkDrive Hub for their transportation needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>
              <Users className="mr-2 h-5 w-5" />
              Create Account
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate('/cars')}>
              Browse Cars
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="h-6 w-6" />
            <ParkingCircle className="h-6 w-6" />
            <span className="text-xl font-bold">Gbankay ParkDrive </span>
          </div>
          <p className="text-gray-400">
            Your trusted partner for car rentals and parking solutions
          </p>
        </div>
      </footer>
    </div>;
};
export default Home;
