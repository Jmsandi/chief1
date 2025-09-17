import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Car, ParkingCircle, Users, Calendar, CreditCard, BarChart3 } from 'lucide-react';
import { formatLeones } from '@/lib/utils';

const Index = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              <ParkingCircle className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">ParkDrive Hub</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email} {userRole === 'admin' && <span className="text-primary font-medium">(Admin)</span>}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {userRole === 'admin' ? 'Admin Dashboard' : 'Your Dashboard'}
          </h2>
          <p className="text-lg text-gray-600">
            {userRole === 'admin' 
              ? 'Manage cars, parking slots, and bookings' 
              : 'Book cars and reserve parking spots'}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Car Rentals
              </CardTitle>
              <CardDescription>
                {userRole === 'admin' ? 'Manage rental fleet' : 'Browse and book rental cars'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate(userRole === 'admin' ? '/admin/cars' : '/cars')}
              >
                {userRole === 'admin' ? 'Manage Cars' : 'Browse Cars'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ParkingCircle className="h-5 w-5 text-primary" />
                Parking Spots
              </CardTitle>
              <CardDescription>
                {userRole === 'admin' ? 'Manage parking slots' : 'Reserve parking spots'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => navigate(userRole === 'admin' ? '/admin/parking' : '/parking')}
              >
                {userRole === 'admin' ? 'Manage Slots' : 'Reserve Parking'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Bookings
              </CardTitle>
              <CardDescription>
                {userRole === 'admin' ? 'View all bookings' : 'Your booking history'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => navigate('/bookings')}
              >
                {userRole === 'admin' ? 'All Bookings' : 'My Bookings'}
              </Button>
            </CardContent>
          </Card>

          {userRole === 'admin' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Users
                  </CardTitle>
                  <CardDescription>Manage user accounts and roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => navigate('/admin/users')}
                  >
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payments
                  </CardTitle>
                  <CardDescription>View payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => navigate('/admin/payments')}
                  >
                    View Payments
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Reports
                  </CardTitle>
                  <CardDescription>Revenue and usage analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => navigate('/admin/reports')}
                  >
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Stats */}
        {userRole === 'customer' && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-gray-600">Active Bookings</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-gray-600">Total Rentals</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatLeones(0)}</div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
