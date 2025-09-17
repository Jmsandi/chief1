import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cars from "./pages/Cars";
import AdminCars from "./pages/AdminCars";
import AdminParking from "./pages/AdminParking";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import BookCar from "./pages/BookCar";
import ParkingReservation from "./pages/ParkingReservation";
import Payment from "./pages/Payment";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import AdminPayments from "./pages/AdminPayments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/book-car/:carId" element={<BookCar />} />
            <Route path="/parking" element={<ParkingReservation />} />
            <Route path="/payment/:bookingId" element={<Payment />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/booking-details/:bookingId" element={<BookingDetails />} />
            <Route path="/admin/cars" element={<AdminCars />} />
            <Route path="/admin/parking" element={<AdminParking />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
