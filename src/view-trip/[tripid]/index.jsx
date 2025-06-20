import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../service/firebaseConfig';
import { HotelImage, PlaceImage } from '../../components/PlaceImages';
import Header from '../../components/custom/Header';
import { Button } from '../../components/ui/ui/button';
import { 
  ArrowLeft, 
  MapPin, 
  Clock,
  DollarSign,
  ExternalLink,
  Star
} from 'lucide-react';

const ViewTrip = () => {
  const { tripid } = useParams();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!tripid) {
        setError('No trip ID provided');
        setLoading(false);
        return;
      }      try {
        const tripRef = doc(db, 'trips', tripid);
        const tripSnap = await getDoc(tripRef);

        if (tripSnap.exists()) {
          const data = tripSnap.data();
          setTripData(data);
        } else {
          setError('Trip not found');
        }
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError('Failed to load trip data');
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [tripid]);
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trip...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={() => navigate('/create-trip')} variant="outline">
                Create New Trip
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (!tripData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No trip data available</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </div>
        </div>
      </>
    );
  }

  const { destination, duration, budget, travelers, hotels, itinerary, createdAt } = tripData;

  return (
    <>
      <Header />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Button 
          onClick={() => navigate('/create-trip')} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Create Trip
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        
        {/* Trip Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {destination?.name || 'Your Trip'}
          </h1>
          <p className="text-gray-600 mb-4">
            {destination?.address}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>{duration} days</span>
            <span>•</span>
            <span>{budget?.type || 'Budget'} trip</span>
            <span>•</span>
            <span>{travelers?.type || 'Travelers'}</span>
          </div>
        </div>        {/* Hotels Section */}
        {hotels && hotels.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hotels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.slice(0, 6).map((hotel, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Hotel Image */}
                  <div className="w-full h-48 relative">
                    <HotelImage
                      hotelName={hotel.name}
                      location={destination?.name}
                      className="w-full h-full object-cover"
                      alt={hotel.name}
                    />
                    {hotel.rating && (
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center shadow-sm">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        <span className="text-xs font-medium">{hotel.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Hotel Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      {hotel.address}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-green-600">{hotel.price_per_night}</span>
                    </div>
                    {hotel.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{hotel.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary Section */}
        {itinerary && itinerary.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
            <div className="space-y-8">
              {itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Day {day.day || dayIndex + 1}
                  </h3>
                  {day.best_time_to_visit && (
                    <p className="text-gray-600 text-sm mb-4 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Best time: {day.best_time_to_visit}
                    </p>
                  )}                  {day.places && day.places.length > 0 && (
                    <div className="space-y-4">
                      {day.places.map((place, placeIndex) => (
                        <div key={placeIndex} className="bg-gray-50 rounded-lg overflow-hidden">
                          <div className="md:flex">
                            {/* Place Image */}
                            <div className="md:w-32 md:h-24 w-full h-32 flex-shrink-0">
                              <PlaceImage
                                placeName={place.place_name}
                                location={destination?.name}
                                className="w-full h-full object-cover"
                                alt={place.place_name}
                              />
                            </div>
                            
                            {/* Place Details */}
                            <div className="p-4 flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{place.place_name}</h4>
                                <button
                                  onClick={() => {
                                    const query = encodeURIComponent(place.place_name);
                                    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center ml-2"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View on Map
                                </button>
                              </div>
                              {place.details && (
                                <p className="text-gray-700 text-sm mb-2">{place.details}</p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {place.ticket_price && (
                                  <span className="flex items-center">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {place.ticket_price}
                                  </span>
                                )}
                                {place.time_to_travel && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {place.time_to_travel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="text-center pt-8 border-t border-gray-200">
          <Button 
            onClick={() => navigate('/create-trip')} 
            className="mr-4"
          >
            Create Another Trip
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Trip to ${destination?.name}`,
                  text: `Check out my ${duration}-day trip to ${destination?.name}!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Trip link copied to clipboard!');
              }
            }}
          >
            Share Trip
          </Button>
        </div>
      </div>
    </>
  );
};

export default ViewTrip;
