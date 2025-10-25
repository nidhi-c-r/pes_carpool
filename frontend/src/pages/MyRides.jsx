import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/api/api";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, Eye, Car } from "lucide-react";

const MyRides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRides();
  }, []);

  const fetchMyRides = async () => {
    try {
      const response = await api.get("/rides/driver/my-rides");
      setRides(response.data);
    } catch (error) {
      toast.error("Failed to fetch your rides");
    } finally {
      setLoading(false);
    }
  };

  const viewBookings = (rideId) => {
    navigate(`/rides/${rideId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="my-rides-title">My Posted Rides</h1>
            <p className="text-gray-600 mt-2">Manage your ride offerings</p>
          </div>
          <Button
            onClick={() => navigate("/post-ride")}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="post-new-ride-btn"
          >
            <Car className="w-4 h-4 mr-2" />
            Post New Ride
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : rides.length === 0 ? (
          <Card className="p-12 text-center" data-testid="no-rides-posted">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No rides posted yet</h3>
            <p className="text-gray-500 mb-6">Start offering rides to your fellow students</p>
            <Button onClick={() => navigate("/post-ride")} data-testid="post-first-ride-btn">
              Post Your First Ride
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6" data-testid="my-rides-list">
            {rides.map((ride) => (
              <Card key={ride.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500" data-testid={`my-ride-${ride.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-lg" data-testid="my-ride-start">{ride.start_location}</span>
                        <span className="text-gray-400">→</span>
                        <MapPin className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-lg" data-testid="my-ride-end">{ride.end_location}</span>
                      </div>
                    </div>
                    <Badge
                      className={ride.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      data-testid="my-ride-status"
                    >
                      {ride.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm" data-testid="my-ride-date">{ride.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm" data-testid="my-ride-time">{ride.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm" data-testid="my-ride-seats">
                        {ride.seats_available} / {ride.seats_total} seats
                      </span>
                    </div>
                    <div className="text-blue-600 font-semibold" data-testid="my-ride-price">
                      ₹{ride.price_per_seat} / seat
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <Car className="w-4 h-4" />
                    <span className="text-sm" data-testid="my-ride-vehicle">{ride.vehicle}</span>
                  </div>

                  {ride.notes && (
                    <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded" data-testid="my-ride-notes">
                      {ride.notes}
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => viewBookings(ride.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      data-testid={`view-bookings-${ride.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;