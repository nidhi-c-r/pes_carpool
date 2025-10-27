import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Check if this path is correct

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Call logout from context (clears user state and localStorage)
    logout();

    // 2. Redirect to the HOME page (the search page)
    navigate('/'); // <--- Ensure this navigates to '/'
  };

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo / Home Link */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          PES Carpool
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600">
            Find Ride
          </Link>

          {/* --- Conditional Links --- */}
          {user ? (
            // --- User is LOGGED IN ---
            <>
              {user.role && user.role.toLowerCase() === 'driver' && (
                <Link to="/post-ride" className="text-gray-600 hover:text-blue-600">
                  Post a Ride
                </Link>
              )}
              <Link to="/my-bookings" className="text-gray-600 hover:text-blue-600">
                My Bookings
              </Link>
              <span className="text-gray-800 font-medium">
                Hi, {user.name ? user.name.split(' ')[0] : 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            // --- User is LOGGED OUT ---
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;