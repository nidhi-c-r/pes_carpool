import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, LogOut, User, Calendar, BookOpen, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              PES Carpool
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/" data-testid="home-link">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Search Rides</span>
                  </Button>
                </Link>
                
                {user.is_driver && (
                  <>
                    <Link to="/post-ride" data-testid="post-ride-link">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <Car className="w-4 h-4" />
                        <span className="hidden sm:inline">Post Ride</span>
                      </Button>
                    </Link>
                    <Link to="/my-rides" data-testid="my-rides-link">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">My Rides</span>
                      </Button>
                    </Link>
                  </>
                )}
                
                {!user.is_driver && (
                  <Link to="/bookings" data-testid="bookings-link">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">My Bookings</span>
                    </Button>
                  </Link>
                )}
                
                {user.is_admin && (
                  <Link to="/admin" data-testid="admin-link">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </Link>
                )}

                <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900" data-testid="user-name">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.is_driver ? "Driver" : "Passenger"}</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid="logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="login-link">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register" data-testid="register-link">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;