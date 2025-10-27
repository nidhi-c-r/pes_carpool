// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RideDetails from './pages/RideDetails';
import Bookings from './pages/Bookings'; 
import PostRide from './pages/PostRide'; // Import the new component
// import MyRides from './pages/MyRides'; // Assuming this page is the redirect target

// --- Private Route Guards ---

// General private route (must be logged in)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; 
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Route only for Drivers
const DriverRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; 
  if (!user) return <Navigate to="/login" replace />; // Must be logged in
  if (user.role.toLowerCase() !== 'driver') {
      // Redirect non-drivers to home
      return <Navigate to="/" replace />; 
  }
  return children;
};


function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ride/:rideId" element={<RideDetails />} />

          {/* --- Private Routes --- */}
          <Route
            path="/my-bookings"
            element={<PrivateRoute><Bookings /></PrivateRoute>}
          />

          {/* DRIVER-ONLY Route */}
          <Route
            path="/post-ride" // Path from Navbar
            element={<DriverRoute><PostRide /></DriverRoute>} // Protected by DriverRoute
          />
          {/* Assuming you will implement MyRides next */}
          {/* <Route
            path="/my-rides" // Redirect target from PostRide.jsx
            element={<DriverRoute><MyRides /></DriverRoute>}
          /> */}
          

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}