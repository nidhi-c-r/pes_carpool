import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import RideCard from "@/components/RideCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/api/api";
import { toast } from "sonner";
import { Search, MapPin, Calendar, Users, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_loc: "",
    to_loc: "",
    date: "",
    min_seats: 1,
  });

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (searchFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/rides?${params}`);
      setRides(response.data);
    } catch (error) {
      toast.error("Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides(filters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="hero-title">
              Share Your Ride, Save the Planet
            </h1>
            <p className="text-xl opacity-90">Find or offer carpools to PES University</p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-0" data-testid="search-card">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from" className="text-sm font-medium">From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="from"
                        placeholder="Electronic City"
                        value={filters.from_loc}
                        onChange={(e) => setFilters({ ...filters, from_loc: e.target.value })}
                        className="pl-10"
                        data-testid="from-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to" className="text-sm font-medium">To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="to"
                        placeholder="PES University"
                        value={filters.to_loc}
                        onChange={(e) => setFilters({ ...filters, to_loc: e.target.value })}
                        className="pl-10"
                        data-testid="to-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        className="pl-10"
                        data-testid="date-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seats" className="text-sm font-medium">Min Seats</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="seats"
                        type="number"
                        min="1"
                        value={filters.min_seats}
                        onChange={(e) => setFilters({ ...filters, min_seats: parseInt(e.target.value) || 1 })}
                        className="pl-10"
                        data-testid="seats-input"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11"
                  data-testid="search-btn"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search Rides"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rides List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!user && (
          <Card className="mb-8 bg-blue-50 border-blue-200" data-testid="guest-notice">
            <CardContent className="p-6 text-center">
              <Car className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Welcome to PES Carpool!</h3>
              <p className="text-gray-600 mb-4">Sign in to book rides or post your own</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate("/login")} data-testid="guest-login-btn">
                  Login
                </Button>
                <Button variant="outline" onClick={() => navigate("/register")} data-testid="guest-register-btn">
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900" data-testid="rides-title">
            Available Rides ({rides.length})
          </h2>
          {user?.is_driver && (
            <Button
              onClick={() => navigate("/post-ride")}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="cta-post-ride-btn"
            >
              <Car className="w-4 h-4 mr-2" />
              Post a Ride
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : rides.length === 0 ? (
          <Card className="p-12 text-center" data-testid="no-rides">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No rides found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </Card>
        ) : (
          <div className="grid gap-6" data-testid="rides-list">
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;