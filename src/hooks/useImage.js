import { useState, useEffect } from 'react';
import { getFallbackImageUrl } from '../service/googlePlacesService';

/**
 * Custom hook to handle async image loading
 * @param {Function} imageFunction - Async function that returns image URL
 * @param {Array} deps - Dependencies for the effect
 */
export const useImage = (imageFunction, deps = []) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = await imageFunction();
        
        if (mounted) {
          setImageUrl(url);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (mounted) {
          setError(err);
          // Set fallback image on error
          setImageUrl(getFallbackImageUrl('fallback', 400, 300));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, deps);

  return { imageUrl, loading, error };
};

/**
 * Hook specifically for hotel images
 */
export const useHotelImage = (hotelName, location = '') => {
  return useImage(
    async () => {
      const { getHotelImageUrl } = await import('../service/googlePlacesService');
      return await getHotelImageUrl(hotelName, location, 400, 300);
    },
    [hotelName, location]
  );
};

/**
 * Hook specifically for place images
 */
export const usePlaceImage = (placeName, location = '') => {
  return useImage(
    async () => {
      const { getPlaceImageUrl } = await import('../service/googlePlacesService');
      return await getPlaceImageUrl(placeName, location, 200, 150);
    },
    [placeName, location]
  );
};
