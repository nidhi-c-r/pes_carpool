// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RideDetails from './pages/RideDetails';
import Bookings from './pages/Bookings'; // Ensure this is imported
// import PostRide from './pages/PostRide';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><FaSpinner className="animate-spin text-cyan-400 h-10 w-10" /></div>; // Dark loading
  if (!user) return <Navigate to="/login" replace />;
  return children;
};


function AppContent() {
  return (
    // Assuming bg-gray-900 is set here for consistent dark theme
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ride/:rideId" element={<RideDetails />} />

          {/* --- Private Route for My Bookings --- */}
          <Route
            path="/my-bookings" // This path must match the navigate() call
            element={<PrivateRoute><Bookings /></PrivateRoute>} // Wrap Bookings component
          />
          {/* <Route
            path="/post-ride"
            element={<PrivateRoute><PostRide /></PrivateRoute>}
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