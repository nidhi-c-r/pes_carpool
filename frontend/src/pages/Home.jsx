import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Make sure useNavigate is imported
import api from '../api/api'; // Make sure this path is correct
// Using react-icons
import { FaMapMarkerAlt, FaFlagCheckered, FaCalendarAlt, FaUsers, FaSearch, FaCarAlt } from 'react-icons/fa';
import { FiArrowRight } from "react-icons/fi";

/**
 * RideCard component - Dark Mode Style
 */
const RideCard = ({ ride }) => {
  const navigate = useNavigate(); // Get the navigate function
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    // Dark background, subtle border, glow effect on hover
    <div className="bg-gray-800 shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300 rounded-lg overflow-hidden mb-5 border border-gray-700 max-w-3xl mx-auto group">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2">
             <FaCarAlt className="text-cyan-500" />
            {ride.origin} → {ride.destination}
          </h3>
          <span className="text-xl font-bold text-cyan-400">${ride.price.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400">
          {formatDateTime(ride.date_time)}
        </p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300">
        <p><span className="font-medium text-gray-500">Driver:</span> {ride.driver.name}</p>
        <p><span className="font-medium text-gray-500">Vehicle:</span> {ride.vehicle.model}</p>
        <p className="font-semibold text-green-400">
            <span className="font-medium text-gray-500">Seats Left:</span> {ride.seats_available}
        </p>
      </div>
      <div className="p-3 bg-gray-900/50">
        <button
          // --- THIS IS THE FIX ---
          // Use navigate to go to the ride details page
          onClick={() => navigate(`/ride/${ride.ride_id}`)}
          // --- REMOVE THE OLD ALERT ---
          // onClick={() => alert(`Booking for ride ${ride.ride_id} not implemented yet.`)}

          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 flex items-center justify-center gap-2 text-sm"
        >
           Details <FiArrowRight />
        </button>
      </div>
    </div>
  );
};


/**
 * Home page component - Modern Dark Theme.
 */
const Home = () => {
  const [formData, setFormData] = useState({
    origin: 'Electronic City',
    destination: 'PES University',
    ride_date: '2025-10-27',
    min_seats: 1
  });
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRides([]);

    try {
      const response = await api.get("/rides/", { params: formData });
      setRides(response.data);
      if (response.data.length === 0) {
        setError("No rides found for this route. Be the first to post one!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Couldn't fetch rides. Server might be down.";
      setError(errorMsg);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">

      {/* --- Top Hero Section --- */}
      <div className="relative text-center pt-16 pb-24 md:pt-20 md:pb-28 px-4 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 shadow-xl overflow-hidden">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Share Your Ride, Save the Planet</h1>
        <p className="text-md md:text-lg text-gray-400 max-w-2xl mx-auto">Find or offer carpools to PES University.</p>
      </div>

      {/* --- Search Form Container --- */}
      <div className="relative px-4 -mt-16 md:-mt-20 z-10">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-10 items-end gap-4 p-5 md:p-6 bg-gray-800 shadow-2xl rounded-xl border border-gray-700 max-w-5xl mx-auto ring-1 ring-white/10"
        >
          {/* Input fields with dark style */}
          <div className="md:col-span-2">
            <label htmlFor="origin" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">From</label>
            <div className="relative flex items-center">
              <FaMapMarkerAlt className="absolute left-3.5 text-gray-500" />
              <input type="text" id="origin" name="origin" value={formData.origin} onChange={handleChange} required className="bg-gray-700 border border-gray-600 text-gray-100 p-3 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-sm placeholder-gray-500"/>
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="destination" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">To</label>
            <div className="relative flex items-center">
              <FaFlagCheckered className="absolute left-3.5 text-gray-500" />
              <input type="text" id="destination" name="destination" value={formData.destination} onChange={handleChange} required className="bg-gray-700 border border-gray-600 text-gray-100 p-3 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-sm placeholder-gray-500"/>
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="ride_date" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Date</label>
            <div className="relative flex items-center">
               <FaCalendarAlt className="absolute left-3.5 text-gray-500" />
              <input type="date" id="ride_date" name="ride_date" value={formData.ride_date} onChange={handleChange} required className="bg-gray-700 border border-gray-600 text-gray-100 p-3 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-sm appearance-none" style={{ colorScheme: 'dark' }}/>
            </div>
          </div>

          <div className="md:col-span-1">
            <label htmlFor="min_seats" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Seats</label>
            <div className="relative flex items-center">
              <FaUsers className="absolute left-3.5 text-gray-500" />
              <input type="number" id="min_seats" name="min_seats" min="1" value={formData.min_seats} onChange={handleChange} required className="bg-gray-700 border border-gray-600 text-gray-100 p-3 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-sm placeholder-gray-500"/>
            </div>
          </div>

          {/* Search Button (Accent gradient) */}
          <div className="md:col-span-3 mt-4 md:mt-0">
             <label className="block text-sm font-medium text-transparent mb-1.5 hidden md:block">.</label>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-3.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-70 shadow-lg hover:shadow-cyan-500/30"
            >
              <FaSearch />
              {loading ? "Searching..." : "Find Ride"}
            </button>
          </div>
        </form>
      </div>

      {/* --- Results Section --- */}
      <div className="results-list mt-12 md:mt-16 px-4 pb-12">
        {loading && (
          <div className="text-center py-10">
              <p className="text-lg text-cyan-400 animate-pulse font-medium">Searching...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-6 py-4 rounded-lg text-center max-w-3xl mx-auto shadow-md">
             <p className="font-semibold mb-1">Error</p>
             <p>{error}</p>
          </div>
        )}

        {!loading && !error && rides.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-center text-xl font-semibold text-gray-300 mb-4 tracking-wide">Available Rides</h2>
            {rides.map(ride => (
              <RideCard key={ride.ride_id} ride={ride} />
            ))}
          </div>
        )}

         {!loading && !error && rides.length === 0 && (
          <p className="text-center text-gray-500 mt-8 text-lg">
             No rides found. Try searching again or post your own!
          </p>
        )}
      </div>

       {/* Simple Dark Footer */}
       <footer className="text-center py-6 border-t border-gray-700 text-gray-500 text-xs">
          © {new Date().getFullYear()} PES Carpool | Ride Smart.
       </footer>
    </div>
  );
};

export default Home;