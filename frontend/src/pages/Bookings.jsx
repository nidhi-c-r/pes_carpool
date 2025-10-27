// frontend/src/pages/Bookings.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui
import { Card, CardContent } from "@/components/ui/card"; // Assuming shadcn/ui
import { Badge } from "@/components/ui/badge"; // Assuming shadcn/ui
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
} from "@/components/ui/alert-dialog"; // Assuming shadcn/ui
import api from "../api/api"; // Corrected path assuming api.js is in src/api
import { toast } from "sonner"; // Assuming sonner for notifications
// Using react-icons instead of lucide-react for consistency with Home.jsx
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaRupeeSign,
  FaRegSadTear,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaFlagCheckered // <-- CORRECTED IMPORT
} from "react-icons/fa";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null); // Track which booking is cancelling

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true); // Ensure loading is true at the start
    try {
      // Use the correct backend endpoint
      const response = await api.get("/bookings/my-bookings");
      setBookings(response.data);
    } catch (error) {
      toast.error("Failed to fetch your bookings. Please try refreshing.");
      console.error("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId); // Set loading state for this specific booking
    try {
      // Use the correct backend endpoint with booking_id
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled successfully!");
      // Refresh the list after cancellation
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to cancel booking.");
      console.error("Cancel booking error:", error);
    } finally {
      setCancellingId(null); // Reset loading state
    }
  };

  // Status badge styling (dark theme friendly)
  const getStatusBadge = (status) => {
    if (status === "confirmed") {
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><FaCheckCircle className="mr-1"/> Confirmed</Badge>;
    } else if (status === "cancelled") {
      return <Badge variant="secondary" className="bg-gray-600 text-gray-200"><FaTimesCircle className="mr-1"/> Cancelled</Badge>;
    } else {
       return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date and time from the ride object
   const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };


  return (
    // Dark theme background consistent with Home.jsx
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-12">
      {/* Assuming Navbar is rendered globally in App.jsx */}

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">My Bookings</h1>
          <p className="text-gray-400 mt-1">View and manage your upcoming rides.</p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-cyan-400 h-10 w-10" />
          </div>
        ) : bookings.length === 0 ? (
          // Empty State Card
          <Card className="p-10 text-center bg-gray-800 border-gray-700 text-gray-400">
             <FaRegSadTear className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't booked any rides yet.</p>
            <Button onClick={() => window.location.href = "/"} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Explore Rides
            </Button>
          </Card>
        ) : (
          // Bookings List
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.booking_id} className="bg-gray-800 border border-gray-700 hover:shadow-lg hover:shadow-cyan-500/10 transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                    {/* Ride Info */}
                    <div className="mb-3 sm:mb-0">
                       {getStatusBadge(booking.status)}
                       <div className="flex items-center space-x-2 mt-2">
                        <FaMapMarkerAlt className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <span className="font-semibold text-lg text-gray-100">{booking.ride.origin}</span>
                        <span className="text-gray-500 text-lg">→</span>
                        <FaFlagCheckered className="w-5 h-5 text-purple-400 flex-shrink-0" /> {/* Icon is used here */}
                        <span className="font-semibold text-lg text-gray-100">{booking.ride.destination}</span>
                      </div>
                    </div>
                     {/* Cancel Button (if confirmed) */}
                     {booking.status === "confirmed" && (
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive" // Use destructive style for cancel
                            size="sm"
                            disabled={cancellingId === booking.booking_id}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                          >
                            {cancellingId === booking.booking_id ? (
                              <FaSpinner className="animate-spin mr-2" />
                            ) : (
                              <FaTimesCircle className="w-4 h-4 mr-2" />
                            )}
                            {cancellingId === booking.booking_id ? "Cancelling..." : "Cancel"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-100">Cancel Booking?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Are you sure? This cannot be undone. Seats will be released.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-gray-300 border-gray-600 hover:bg-gray-700">Keep It</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancel(booking.booking_id)}
                              className="bg-red-600 hover:bg-red-700 text-white" // Destructive action
                            >
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  {/* Ride Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-400 border-t border-gray-700 pt-4">
                     <div className="flex items-center gap-2">
                      <FaCalendarAlt className="w-4 h-4 text-cyan-500" />
                      <span>{formatDateTime(booking.ride.date_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="w-4 h-4 text-cyan-500" />
                      <span>{booking.seats_booked} seat(s) booked</span>
                    </div>
                     <div className="flex items-center gap-2 font-semibold text-cyan-400">
                      <FaRupeeSign className="w-4 h-4" />
                      {/* Calculate total price */}
                      <span>{(booking.ride.price * booking.seats_booked).toFixed(2)} Total</span>
                    </div>
                  </div>

                  {/* Driver Details */}
                   <div className="p-3 bg-gray-700/50 rounded-lg">
                     <p className="text-xs font-medium text-gray-400 mb-1 uppercase">Driver</p>
                     <div className="flex items-center space-x-3">
                       {/* You might want a default avatar */}
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                          {booking.ride.driver.name.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <p className="font-medium text-sm text-gray-100">{booking.ride.driver.name}</p>
                         <p className="text-xs text-gray-400">{booking.ride.driver.phone}</p>
                       </div>
                     </div>
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

export default Bookings;