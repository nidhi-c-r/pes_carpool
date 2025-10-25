import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/api/api";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, IndianRupee, Car, Phone, User, Leaf, ArrowLeft } from "lucide-react";

const RideDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchRide();
  }, [id]);

  const fetchRide = async () => {
    try {
      const response = await api.get(`/rides/${id}`);
      setRide(response.data);
    } catch (error) {
      toast.error("Failed to fetch ride details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user) {
      toast.error("Please login to book a ride");
      navigate("/login");
      return;
    }

    if (seatsToBook < 1 || seatsToBook > ride.seats_available) {
      toast.error("Invalid number of seats");
      return;
    }

    setBooking(true);
    try {
      await api.post(`/rides/${id}/book`, { seats_booked: seatsToBook });
      toast.success("Ride booked successfully!");
      navigate("/bookings");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to book ride");
    } finally {
      setBooking(false);
    }
  };

  const calculateCO2 = () => {
    if (!ride || seatsToBook <= 0) return 0;
    const co2Grams = seatsToBook * ride.distance_km * 120;
    return (co2Grams / 1000).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!ride) return null;

  const isDriver = user?.id === ride.driver_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rides
        </Button>

        <div className="grid gap-6">
          {/* Main Ride Details */}
          <Card className="border-l-4 border-l-blue-500 shadow-lg" data-testid="ride-details-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">Ride Details</CardTitle>
                <Badge className="bg-green-100 text-green-800" data-testid="status-badge">
                  {ride.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Route */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">From</div>
                    <div className="text-xl font-semibold" data-testid="detail-start">{ride.start_location}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pl-3">
                  <div className="text-2xl text-gray-400">↓</div>
                  <div className="text-sm text-gray-500">{ride.distance_km} km</div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="text-sm text-gray-500">To</div>
                    <div className="text-xl font-semibold" data-testid="detail-end">{ride.end_location}</div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium" data-testid="detail-date">{ride.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium" data-testid="detail-time">{ride.time}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Seats Available</div>
                    <div className="font-medium" data-testid="detail-seats">{ride.seats_available} / {ride.seats_total}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <IndianRupee className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Price per Seat</div>
                    <div className="font-medium text-blue-600 text-lg" data-testid="detail-price">₹{ride.price_per_seat}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="flex items-center space-x-3 pt-4 border-t">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Vehicle</div>
                  <div className="font-medium" data-testid="detail-vehicle">{ride.vehicle}</div>
                </div>
              </div>

              {/* Notes */}
              {ride.notes && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">Notes</div>
                  <div className="bg-gray-50 p-3 rounded-lg" data-testid="detail-notes">{ride.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver Info */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {ride.driver_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-lg" data-testid="detail-driver-name">{ride.driver_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span data-testid="detail-driver-phone">{ride.driver_phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Section */}
          {!isDriver && ride.seats_available > 0 && (
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-purple-50" data-testid="booking-card">
              <CardHeader>
                <CardTitle>Book This Ride</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seats">Number of Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max={ride.seats_available}
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(parseInt(e.target.value) || 1)}
                    data-testid="seats-book-input"
                  />
                </div>

                <div className="bg-white p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Price per seat:</span>
                    <span className="font-semibold">₹{ride.price_per_seat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span className="font-semibold">{seatsToBook}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600" data-testid="total-price">₹{ride.price_per_seat * seatsToBook}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <Leaf className="w-5 h-5" />
                  <span className="font-medium">You'll save {calculateCO2()} kg CO₂</span>
                </div>

                <Button
                  onClick={handleBook}
                  disabled={booking || !user}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg"
                  data-testid="book-ride-btn"
                >
                  {booking ? "Booking..." : user ? "Confirm Booking" : "Login to Book"}
                </Button>
              </CardContent>
            </Card>
          )}

          {isDriver && (
            <Card className="shadow-lg bg-yellow-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <p className="text-yellow-800 font-medium">This is your ride</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetails;