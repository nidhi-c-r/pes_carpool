import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "@/api/api";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, IndianRupee, Car } from "lucide-react";

const PostRide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_location: "",
    end_location: "",
    date: "",
    time: "",
    seats_total: 1,
    price_per_seat: "",
    distance_km: "",
    vehicle: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        seats_total: parseInt(formData.seats_total),
        price_per_seat: parseFloat(formData.price_per_seat),
        distance_km: parseFloat(formData.distance_km),
      };
      await api.post("/rides", payload);
      toast.success("Ride posted successfully!");
      navigate("/my-rides");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to post ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="shadow-xl border-0" data-testid="post-ride-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold">Post a New Ride</CardTitle>
            <CardDescription className="text-base">Share your ride and help others commute</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Route Section */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Route Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_location">Starting Location *</Label>
                    <Input
                      id="start_location"
                      name="start_location"
                      placeholder="Electronic City"
                      value={formData.start_location}
                      onChange={handleChange}
                      required
                      data-testid="start-location-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_location">Destination *</Label>
                    <Input
                      id="end_location"
                      name="end_location"
                      placeholder="PES University"
                      value={formData.end_location}
                      onChange={handleChange}
                      required
                      data-testid="end-location-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance_km">Distance (km) *</Label>
                  <Input
                    id="distance_km"
                    name="distance_km"
                    type="number"
                    step="0.1"
                    placeholder="15.5"
                    value={formData.distance_km}
                    onChange={handleChange}
                    required
                    data-testid="distance-input"
                  />
                </div>
              </div>

              {/* Schedule Section */}
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Schedule</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      data-testid="date-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      data-testid="time-input"
                    />
                  </div>
                </div>
              </div>

              {/* Ride Details Section */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <Car className="w-5 h-5" />
                  <span>Ride Details</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seats_total">Available Seats *</Label>
                    <Input
                      id="seats_total"
                      name="seats_total"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.seats_total}
                      onChange={handleChange}
                      required
                      data-testid="seats-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_per_seat">Price per Seat (₹) *</Label>
                    <Input
                      id="price_per_seat"
                      name="price_per_seat"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      value={formData.price_per_seat}
                      onChange={handleChange}
                      required
                      data-testid="price-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Details *</Label>
                  <Input
                    id="vehicle"
                    name="vehicle"
                    placeholder="Honda City (KA-01-AB-1234)"
                    value={formData.vehicle}
                    onChange={handleChange}
                    required
                    data-testid="vehicle-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special instructions or pickup points..."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    data-testid="notes-input"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                  data-testid="cancel-btn"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  data-testid="submit-ride-btn"
                >
                  {loading ? "Posting..." : "Post Ride"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostRide;