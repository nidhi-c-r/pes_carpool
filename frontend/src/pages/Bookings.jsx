import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/api/api";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, IndianRupee, X, BookOpen } from "lucide-react";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setCancelling(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status) => {
    return status === "confirmed" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="bookings-title">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your ride bookings</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center" data-testid="no-bookings">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start exploring available rides</p>
            <Button onClick={() => window.location.href = "/"} data-testid="explore-rides-btn">
              Explore Rides
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6" data-testid="bookings-list">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500" data-testid={`booking-${booking.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(booking.status)} data-testid="booking-status">
                          {booking.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Booked on {new Date(booking.booked_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-lg" data-testid="booking-start">{booking.ride.start_location}</span>
                        <span className="text-gray-400">→</span>
                        <MapPin className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-lg" data-testid="booking-end">{booking.ride.end_location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm" data-testid="booking-date">{booking.ride.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm" data-testid="booking-time">{booking.ride.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm" data-testid="booking-seats">{booking.seats_booked} seat(s)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                      <IndianRupee className="w-4 h-4" />
                      <span data-testid="booking-total">{booking.ride.price_per_seat * booking.seats_booked}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Driver Details</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {booking.ride.driver_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" data-testid="booking-driver-name">{booking.ride.driver_name}</p>
                        <p className="text-sm text-gray-600" data-testid="booking-driver-phone">{booking.ride.driver_phone}</p>
                      </div>
                    </div>
                  </div>

                  {booking.status === "confirmed" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancelling === booking.id}
                          data-testid={`cancel-booking-${booking.id}`}
                        >
                          <X className="w-4 h-4 mr-2" />
                          {cancelling === booking.id ? "Cancelling..." : "Cancel Booking"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancel(booking.id)} data-testid="confirm-cancel-btn">
                            Yes, Cancel Booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;