import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import img from "../../assets/TravelSmart AI Logo Design.png";
import { Button } from "../ui/ui/button";
import { 
  User, 
  LogOut, 
  Settings, 
  MapPin,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

const Header = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const ProfileMenu = () => (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=3b82f6&color=fff`}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <button
          onClick={() => {
            navigate('/my-trips');
            setShowProfileMenu(false);
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <MapPin className="w-4 h-4 mr-3" />
          My Trips
        </button>
        
        <button
          onClick={() => {
            navigate('/profile');
            setShowProfileMenu(false);
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </button>
      </div>

      {/* Sign Out */}
      <div className="border-t border-gray-100 py-1">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img 
              src={img} 
              alt="TravelSmart AI"
              className="h-10 w-10 rounded-lg"
            />
            <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
              TravelSmart AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* My Trips Button */}
                <Button
                  variant="outline"
                  onClick={() => navigate('/my-trips')}
                  className="flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>My Trips</span>
                </Button>

                {/* Create Trip Button */}
                <Button
                  onClick={() => navigate('/create-trip')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Trip
                </Button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=3b82f6&color=fff`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {showProfileMenu && <ProfileMenu />}
                </div>
              </>
            ) : (
              <Button
                onClick={() => navigate('/create-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-2">
                  <img
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=3b82f6&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user?.displayName || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {/* Mobile Menu Items */}
                <button
                  onClick={() => {
                    navigate('/create-trip');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-blue-600 font-medium hover:bg-blue-50"
                >
                  Create Trip
                </button>
                
                <button
                  onClick={() => {
                    navigate('/my-trips');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Trips
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('/create-trip');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-blue-600 font-medium hover:bg-blue-50"
              >
                Get Started
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overlay for profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
};

export default Header;
