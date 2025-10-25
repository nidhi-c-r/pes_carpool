import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/api";
import { toast } from "sonner";
import { Users, Car, BookOpen, Leaf, TrendingUp, CheckCircle } from "lucide-react";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get("/admin/metrics");
      setMetrics(response.data);
    } catch (error) {
      toast.error("Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
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

  const StatCard = ({ title, value, icon: Icon, color, testId }) => (
    <Card className="hover:shadow-lg transition-shadow" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-8 h-8" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="admin-title">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform metrics and analytics</p>
        </div>

        {metrics && (
          <div className="space-y-6">
            {/* User Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">User Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Users"
                  value={metrics.total_users}
                  icon={Users}
                  color="#3B82F6"
                  testId="metric-total-users"
                />
                <StatCard
                  title="Drivers"
                  value={metrics.total_drivers}
                  icon={Car}
                  color="#8B5CF6"
                  testId="metric-drivers"
                />
                <StatCard
                  title="Passengers"
                  value={metrics.total_passengers}
                  icon={Users}
                  color="#10B981"
                  testId="metric-passengers"
                />
              </div>
            </div>

            {/* Ride Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Ride Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  title="Total Rides"
                  value={metrics.total_rides}
                  icon={Car}
                  color="#F59E0B"
                  testId="metric-total-rides"
                />
                <StatCard
                  title="Active Rides"
                  value={metrics.active_rides}
                  icon={TrendingUp}
                  color="#EF4444"
                  testId="metric-active-rides"
                />
              </div>
            </div>

            {/* Booking Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Booking Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  title="Total Bookings"
                  value={metrics.total_bookings}
                  icon={BookOpen}
                  color="#6366F1"
                  testId="metric-total-bookings"
                />
                <StatCard
                  title="Confirmed Bookings"
                  value={metrics.confirmed_bookings}
                  icon={CheckCircle}
                  color="#14B8A6"
                  testId="metric-confirmed-bookings"
                />
              </div>
            </div>

            {/* Seat Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Seat Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Seat Utilization</p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-blue-600" data-testid="metric-seats-booked">
                          {metrics.total_seats_booked}
                        </span>
                        <span className="text-gray-500">/ {metrics.total_seats_offered} offered</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                          style={{
                            width: `${(metrics.total_seats_booked / metrics.total_seats_offered) * 100}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {((metrics.total_seats_booked / metrics.total_seats_offered) * 100).toFixed(1)}% utilization
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 mb-1">CO₂ Saved</p>
                        <p className="text-3xl font-bold text-green-600" data-testid="metric-co2-saved">
                          {metrics.total_co2_saved_kg} kg
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          ≈ {(metrics.total_co2_saved_kg / 1000).toFixed(2)} tons
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-green-100">
                        <Leaf className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Platform Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold">{metrics.confirmed_bookings}</p>
                    <p className="text-sm opacity-90">Successful Carpools</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{metrics.total_seats_booked}</p>
                    <p className="text-sm opacity-90">Seats Shared</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{metrics.total_co2_saved_kg} kg</p>
                    <p className="text-sm opacity-90">CO₂ Emissions Saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;