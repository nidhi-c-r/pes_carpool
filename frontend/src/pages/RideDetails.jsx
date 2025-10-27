import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api'; // Your Axios instance
import { useAuth } from '../context/AuthContext'; // To check login status
import { FaMapMarkerAlt, FaFlagCheckered, FaCalendarAlt, FaUsers, FaCarAlt, FaUserCircle, FaMoneyBillWave } from 'react-icons/fa';

const RideDetails = () => {
  const { rideId } = useParams(); // Get the ride ID from the URL (e.g., /ride/6)
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the currently logged-in user (or null)

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1); // How many seats to book

  useEffect(() => {
    const fetchRideDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the new backend endpoint to get details for this specific ride
        const response = await api.get(`/rides/${rideId}`);
        setRide(response.data);
      } catch (err) {
        setError("Could not load ride details. It might no longer exist.");
        console.error("Fetch ride details error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideId]); // Re-run if the rideId in the URL changes

  const handleBooking = async () => {
    setBookingError(null);
    setBookingSuccess(null);

    // 1. Check if user is logged in
    if (!user) {
      navigate('/login'); // Redirect to login if not logged in
      return;
    }

    // 2. Simple validation (can be improved)
    if (seatsToBook < 1) {
        setBookingError("Please select at least 1 seat.");
        return;
    }
     if (seatsToBook > ride.seats_available) {
        setBookingError(`Only ${ride.seats_available} seats are available.`);
        return;
    }


    try {
      // 3. Make the booking API call
      const bookingData = {
        ride_id: parseInt(rideId, 10), // Ensure rideId is a number
        seats_booked: seatsToBook,
      };
      const response = await api.post('/bookings/', bookingData); // Use the booking endpoint

      // 4. Handle success
      setBookingSuccess(`Successfully booked ${seatsToBook} seat(s)! Redirecting to My Bookings...`);
      // Update ride state locally (optional, but good UX)
      setRide(prevRide => ({
          ...prevRide,
          seats_available: prevRide.seats_available - seatsToBook
      }));

      // Redirect to the 'My Bookings' page after a short delay
      setTimeout(() => {
        navigate('/my-bookings'); // Redirect to the page showing user's bookings
      }, 2500);

    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Booking failed. Please try again.";
      setBookingError(errorMsg);
      console.error("Booking error:", err);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }); // More detailed format
  };

  // --- Render Loading State ---
  if (loading) {
    return <div className="text-center py-20 text-cyan-400 text-xl">Loading Ride Details...</div>;
  }

  // --- Render Error State ---
  if (error) {
    return <div className="text-center py-20 text-red-400 bg-red-900/50 max-w-md mx-auto p-6 rounded-lg">{error}</div>;
  }

  // --- Render Ride Not Found ---
  if (!ride) {
    return <div className="text-center py-20 text-gray-500">Ride not found.</div>;
  }

  // --- Render Ride Details ---
  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8">
      <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
        {/* Header Section */}
        <div className="p-6 bg-gradient-to-r from-gray-800 via-gray-900 to-black border-b border-gray-700">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2 flex items-center gap-3">
             <FaCarAlt /> {ride.origin} → {ride.destination}
          </h1>
          <p className="text-lg text-gray-300 flex items-center gap-2">
            <FaCalendarAlt className="text-cyan-500"/> {formatDateTime(ride.date_time)}
          </p>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          {/* Driver Info */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-1 mb-2 flex items-center gap-2"><FaUserCircle className="text-cyan-500"/> Driver Details</h2>
            <p><span className="font-medium text-gray-500 w-20 inline-block">Name:</span> {ride.driver.name}</p>
            <p><span className="font-medium text-gray-500 w-20 inline-block">Contact:</span> {ride.driver.phone}</p> {/* Consider showing only if booked */}
          </div>

           {/* Vehicle Info */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-1 mb-2 flex items-center gap-2"><FaCarAlt className="text-cyan-500"/> Vehicle Details</h2>
            <p><span className="font-medium text-gray-500 w-20 inline-block">Model:</span> {ride.vehicle.model}</p>
            <p><span className="font-medium text-gray-500 w-20 inline-block">Seats:</span> {ride.vehicle.seat_capacity} total</p>
          </div>

          {/* Ride Info */}
          <div className="md:col-span-2 space-y-2 pt-4">
             <h2 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-1 mb-2 flex items-center gap-2"><FaMoneyBillWave className="text-cyan-500"/> Booking Info</h2>
             <p className="text-2xl font-bold text-cyan-400">
                ${ride.price.toFixed(2)} <span className="text-sm text-gray-400 font-normal">per seat</span>
             </p>
             <p className={`text-xl font-bold ${ride.seats_available > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {ride.seats_available} {ride.seats_available === 1 ? 'Seat' : 'Seats'} Available
             </p>
          </div>
        </div>

        {/* Booking Action Area */}
        {ride.seats_available > 0 && user && user.user_id !== ride.driver_id && ( // Only show if seats available, user logged in, and not the driver
          <div className="p-6 border-t border-gray-700 bg-gray-900/30">
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Book Your Seat(s)</h2>

            {/* Success Message */}
            {bookingSuccess && (
              <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded mb-4">
                {bookingSuccess}
              </div>
            )}
            {/* Error Message */}
            {bookingError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
                {bookingError}
              </div>
            )}

            {!bookingSuccess && ( // Hide form/button after successful booking
                <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <label htmlFor="seatsToBook" className="block text-sm font-medium text-gray-400 mb-1">Seats:</label>
                    <select
                        id="seatsToBook"
                        value={seatsToBook}
                        onChange={(e) => setSeatsToBook(parseInt(e.target.value, 10))}
                        className="bg-gray-700 border border-gray-600 text-gray-100 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                        {/* Generate options based on available seats */}
                        {[...Array(ride.seats_available).keys()].map(i => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1}
                        </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleBooking}
                    disabled={loading || bookingSuccess} // Disable after success
                    className="flex-grow bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-70 shadow-md hover:shadow-lg"
                >
                    Book Now
                </button>
                </div>
            )}
          </div>
        )}

        {/* Message if user is the driver */}
         {user && user.user_id === ride.driver_id && (
             <div className="p-6 text-center text-gray-500 border-t border-gray-700">This is your ride.</div>
         )}

         {/* Message if no seats available */}
         {ride.seats_available <= 0 && (
             <div className="p-6 text-center text-red-400 border-t border-gray-700">This ride is fully booked.</div>
         )}

        {/* Prompt to login if not logged in */}
        {!user && ride.seats_available > 0 && (
          <div className="p-6 text-center border-t border-gray-700">
            <button
              onClick={() => navigate('/login')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Log in to book this ride
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default RideDetails;