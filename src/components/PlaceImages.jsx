import React, { useState, useEffect } from 'react';
import { getHotelStreetViewUrl, getPlaceStreetViewUrl, getFallbackImageUrl } from '../service/googlePlacesService';

/**
 * Hotel Image component with fallback options
 */
export const HotelImage = ({ hotelName, location, className = '', alt }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Try Street View first, then fallback
    const streetViewUrl = getHotelStreetViewUrl(hotelName, location);
    setImageUrl(streetViewUrl);
    setLoading(false);
  }, [hotelName, location]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // Fallback to styled placeholder
      setImageUrl(getFallbackImageUrl(`🏨 ${hotelName}`, 400, 300));
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || hotelName}
      className={className}
      onError={handleImageError}
    />
  );
};

/**
 * Place Image component with fallback options
 */
export const PlaceImage = ({ placeName, location, className = '', alt }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Try Street View first, then fallback
    const streetViewUrl = getPlaceStreetViewUrl(placeName, location);
    setImageUrl(streetViewUrl);
    setLoading(false);
  }, [placeName, location]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // Fallback to styled placeholder
      setImageUrl(getFallbackImageUrl(`📍 ${placeName}`, 200, 150));
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-xs">Loading...</div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || placeName}
      className={className}
      onError={handleImageError}
    />
  );
};
