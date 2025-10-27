import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
// Import standard components/icons (adjust imports based on your library)
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "../api/api"; 
import { toast } from "sonner";
import { MapPin, Calendar, Users, IndianRupee, Car, Truck, Loader2 } from "lucide-react"; // Added Loader2 for loading states

const PostRide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehicleList, setVehicleList] = useState([]); // State to hold driver's vehicles
  const [formData, setFormData] = useState({
    origin: "", 
    destination: "", 
    date: "",
    time: "",
    seats_available: 1, 
    price: "", 
    distance_km: "",
    vehicle_id: "", // Now stores the selected ID
    notes: "",
  });

  // --- NEW: FETCH VEHICLE LIST ---
  useEffect(() => {
    const fetchVehicles = async () => {
        if (!user || user.role.toLowerCase() !== 'driver') {
            setVehiclesLoading(false);
            return;
        }
        setVehiclesLoading(true);
        try {
            // Call the new backend endpoint
            const response = await api.get("/rides/vehicles/my-vehicles"); 
            const vehicles = response.data;
            setVehicleList(vehicles);
            
            // Automatically select the first vehicle if available
            if (vehicles.length > 0) {
                setFormData(prev => ({ ...prev, vehicle_id: vehicles[0].vehicle_id }));
            }
        } catch (error) {
            toast.error("Failed to load your registered vehicles.");
            console.error("Fetch vehicles error:", error);
        } finally {
            setVehiclesLoading(false);
        }
    };
    fetchVehicles();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (vehicleList.length === 0 || !formData.vehicle_id) {
        toast.error("Please register a vehicle or select one from the list.");
        setLoading(false);
        return;
    }
    
    try {
      // 1. Construct the payload with CORRECT backend field names
      const payload = {
        date_time: `${formData.date}T${formData.time}:00`, 
        origin: formData.origin,
        destination: formData.destination,
        seats_available: parseInt(formData.seats_available),
        price: parseFloat(formData.price), 
        distance_km: parseFloat(formData.distance_km),
        vehicle_id: parseInt(formData.vehicle_id), // Send the ID
        notes: formData.notes,
      };

      // 2. Post the ride
      await api.post("/rides", payload); 
      
      toast.success("Ride posted successfully!");
      // Redirect to MyRides page (you need to implement this page and route)
      navigate("/my-rides"); 
      
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to post ride");
      console.error("Post Ride Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (vehiclesLoading) {
      return <div className="text-center py-20 text-cyan-400 text-xl flex justify-center items-center"><Loader2 className="animate-spin mr-2"/> Loading Driver Setup...</div>;
  }
  
  if (vehicleList.length === 0) {
       return (
            <div className="max-w-3xl mx-auto px-4 py-8 text-center">
                 <Card className="shadow-2xl border-red-700 bg-gray-800 p-8">
                     <CardTitle className="text-xl text-red-400 mb-4">Action Required</CardTitle>
                     <CardDescription className="text-gray-300">
                         You must register a vehicle first before posting a ride. 
                         Please use the appropriate endpoint (POST /api/rides/vehicles) to register your vehicle.
                     </CardDescription>
                 </Card>
            </div>
       );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="shadow-2xl border-gray-700 bg-gray-800" data-testid="post-ride-card">
          <CardHeader className="space-y-2 border-b border-gray-700">
            <CardTitle className="text-3xl font-bold text-cyan-400">Post a New Ride</CardTitle>
            <CardDescription className="text-base text-gray-400">Share your ride and help others commute</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Vehicle Selection (Dropdown) */}
              <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                 <h3 className="font-semibold text-lg flex items-center space-x-2 text-cyan-400">
                    <Truck className="w-5 h-5" />
                    <span>Select Vehicle</span>
                 </h3>
                 <Label htmlFor="vehicle_id">Registered Vehicle *</Label>
                 <select
                    id="vehicle_id"
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                    data-testid="vehicle-select"
                >
                    {vehicleList.map(v => (
                        <option key={v.vehicle_id} value={v.vehicle_id}>
                            {v.model} ({v.license_plate})
                        </option>
                    ))}
                 </select>
              </div>

              {/* Route Section */}
              <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-lg flex items-center space-x-2 text-cyan-400">
                  <MapPin className="w-5 h-5" />
                  <span>Route & Schedule</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Starting Location (Origin) *</Label>
                    <Input id="origin" name="origin" placeholder="Electronic City" value={formData.origin} onChange={handleChange} required data-testid="start-location-input" className="bg-gray-700 border-gray-600 text-gray-200"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input id="destination" name="destination" placeholder="PES University" value={formData.destination} onChange={handleChange} required data-testid="end-location-input" className="bg-gray-700 border-gray-600 text-gray-200"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required data-testid="date-input" className="bg-gray-700 border-gray-600 text-gray-200"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required data-testid="time-input" className="bg-gray-700 border-gray-600 text-gray-200"/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="distance_km">Distance (km) *</Label>
                    <Input id="distance_km" name="distance_km" type="number" step="0.1" placeholder="15.5" value={formData.distance_km} onChange={handleChange} required data-testid="distance-input" className="bg-gray-700 border-gray-600 text-gray-200"/>
                  </div>
                </div>
              </div>

              {/* Pricing & Seating Section */}
              <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                 <h3 className="font-semibold text-lg flex items-center space-x-2 text-cyan-400">
                    <IndianRupee className="w-5 h-5" />
                    <span>Pricing & Capacity</span>
                 </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seats_available">Available Seats *</Label>
                    <Input id="seats_available" name="seats_available" type="number" min="1" max="7" value={formData.seats_available} onChange={handleChange} required data-testid="seats-input" className="bg-gray-700 border-gray-600 text-gray-200"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Seat (₹) *</Label>
                    <Input id="price" name="price" type="number" step="0.01" placeholder="50.00" value={formData.price} onChange={handleChange} required data-testid="price-input" className="bg-gray-700 border-gray-600 text-gray-200"/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea id="notes" name="notes" placeholder="Any special instructions or pickup points..." value={formData.notes} onChange={handleChange} rows={3} data-testid="notes-input" className="bg-gray-700 border-gray-600 text-gray-200"/>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1 border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600" data-testid="cancel-btn">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || vehicleList.length === 0} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50" data-testid="submit-ride-btn">
                  {loading ? <Loader2 className="animate-spin mr-2"/> : "Post Ride"}
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