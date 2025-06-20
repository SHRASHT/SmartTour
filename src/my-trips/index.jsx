import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTrips } from '../hooks/useAuth';
import Header from '../components/custom/Header';
import { Button } from '../components/ui/ui/button';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Eye,
  Trash2,
  Plus,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';

const MyTrips = () => {
  const { user, isAuthenticated } = useAuth();
  const { trips, loading, error, loadUserTrips, deleteTrip } = useTrips();
  const navigate = useNavigate();
  const [deletingTripId, setDeletingTripId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserTrips();
    } else {
      navigate('/create-trip');
    }
  }, [isAuthenticated]);

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        setDeletingTripId(tripId);
        await deleteTrip(tripId);
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip. Please try again.');
      } finally {
        setDeletingTripId(null);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getBudgetIcon = (budget) => {
    switch (budget?.type?.toLowerCase()) {
      case 'cheap':
        return '💰';
      case 'moderate':
        return '💰💰';
      case 'luxury':
        return '💰💰💰';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your trips...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
                <p className="text-gray-600 mt-2">
                  {trips.length > 0 ? `${trips.length} trip${trips.length !== 1 ? 's' : ''} planned` : 'No trips yet'}
                </p>
              </div>
              <Button
                onClick={() => navigate('/create-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Trip</span>
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error loading trips: {error}</p>
              <Button 
                onClick={loadUserTrips}
                variant="outline"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {trips.length === 0 && !loading && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start planning your next adventure! Create your first trip and let AI help you discover amazing destinations.
              </p>
              <Button
                onClick={() => navigate('/create-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Your First Trip
              </Button>
            </div>
          )}

          {/* Trips Grid */}
          {trips.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  
                  {/* Trip Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {trip.destination?.name || 'Unknown Destination'}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/view-trip/${trip.id}`)}
                          className="p-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTrip(trip.id)}
                          disabled={deletingTripId === trip.id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {trip.destination?.address && (
                      <p className="text-sm text-gray-600 mb-4 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        {trip.destination.address}
                      </p>
                    )}
                  </div>

                  {/* Trip Details */}
                  <div className="px-6 pb-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{trip.duration || 'N/A'} days</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{trip.travelers?.type || 'Travelers'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>{trip.budget?.type || 'Budget'} {getBudgetIcon(trip.budget)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDate(trip.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trip Stats */}
                  {(trip.hotels?.length > 0 || trip.itinerary?.length > 0) && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        {trip.hotels?.length > 0 && (
                          <span>{trip.hotels.length} hotel{trip.hotels.length !== 1 ? 's' : ''}</span>
                        )}
                        {trip.itinerary?.length > 0 && (
                          <span>{trip.itinerary.length} day{trip.itinerary.length !== 1 ? 's' : ''} planned</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Trip Button */}
                  <div className="p-4 pt-0">
                    <Button
                      onClick={() => navigate(`/view-trip/${trip.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2"
                    >
                      <span>View Trip Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trip Statistics */}
          {trips.length > 0 && (
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Travel Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
                  <div className="text-sm text-gray-600">Total Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {trips.reduce((sum, trip) => sum + (parseInt(trip.duration) || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Days Planned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {trips.reduce((sum, trip) => sum + (trip.hotels?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Hotels Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {new Set(trips.map(trip => trip.destination?.name).filter(Boolean)).size}
                  </div>
                  <div className="text-sm text-gray-600">Destinations</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyTrips;
