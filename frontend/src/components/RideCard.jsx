import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Users, IndianRupee, Car, Leaf } from "lucide-react";

const RideCard = ({ ride }) => {
  const navigate = useNavigate();

  const calculateCO2 = (distance, seats) => {
    if (seats <= 1) return 0;
    const co2Grams = (seats - 1) * distance * 120;
    return (co2Grams / 1000).toFixed(1);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 group"
      onClick={() => navigate(`/rides/${ride.id}`)}
      data-testid={`ride-card-${ride.id}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-lg text-gray-900" data-testid="start-location">{ride.start_location}</span>
            </div>
            <div className="flex items-center space-x-2 pl-7">
              <span className="text-gray-400">→</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-lg text-gray-900" data-testid="end-location">{ride.end_location}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600" data-testid="price">₹{ride.price_per_seat}</div>
            <div className="text-sm text-gray-500">per seat</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm" data-testid="ride-date">{ride.date}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm" data-testid="ride-time">{ride.time}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm" data-testid="seats-available">{ride.seats_available} seats left</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Car className="w-4 h-4" />
            <span className="text-sm truncate" data-testid="vehicle">{ride.vehicle}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {ride.driver_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900" data-testid="driver-name">{ride.driver_name}</div>
              <div className="text-xs text-gray-500">Driver</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Leaf className="w-4 h-4" />
            <span className="text-xs font-medium">{calculateCO2(ride.distance_km, ride.seats_total)} kg CO₂ saved</span>
          </div>
        </div>

        {ride.notes && (
          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded" data-testid="ride-notes">
            {ride.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RideCard;