const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

/**
 * Get a reliable placeholder image with consistent styling
 * @param {string} name - Name for the placeholder
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
export const getFallbackImageUrl = (name, width = 400, height = 300) => {
  // Use a color based on the name for consistency
  const colors = ['4F46E5', '059669', 'DC2626', 'D97706', '7C3AED', '0891B2'];
  const colorIndex = name.length % colors.length;
  const color = colors[colorIndex];
  
  const encodedName = encodeURIComponent(name.substring(0, 20));
  return `https://via.placeholder.com/${width}x${height}/${color}/FFFFFF?text=${encodedName}`;
};

/**
 * Get hotel image - for now using placeholder with hotel theming
 * @param {string} hotelName - Name of the hotel
 * @param {string} location - Location context
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
export const getHotelImageUrl = async (hotelName, location = '', width = 400, height = 300) => {
  // For now, return a styled placeholder
  // Later we can implement actual Google Places integration
  return getFallbackImageUrl(`🏨 ${hotelName}`, width, height);
};

/**
 * Get place image - for now using placeholder with place theming
 * @param {string} placeName - Name of the place
 * @param {string} location - Location context
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
export const getPlaceImageUrl = async (placeName, location = '', width = 400, height = 300) => {
  // For now, return a styled placeholder
  // Later we can implement actual Google Places integration
  return getFallbackImageUrl(`📍 ${placeName}`, width, height);
};

/**
 * Alternative: Try to use Google Street View Static API for place images
 * This works better in browsers due to CORS
 */
export const getStreetViewImageUrl = (placeName, location = '', width = 400, height = 300) => {
  if (!GOOGLE_PLACES_API_KEY) {
    return getFallbackImageUrl(placeName, width, height);
  }
  
  const query = location ? `${placeName}, ${location}` : placeName;
  const encodedQuery = encodeURIComponent(query);
  
  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${encodedQuery}&key=${GOOGLE_PLACES_API_KEY}`;
};

/**
 * Get hotel image using Street View (more reliable)
 */
export const getHotelStreetViewUrl = (hotelName, location = '') => {
  return getStreetViewImageUrl(`${hotelName} hotel`, location, 400, 300);
};

/**
 * Get place image using Street View (more reliable)
 */
export const getPlaceStreetViewUrl = (placeName, location = '') => {
  return getStreetViewImageUrl(placeName, location, 200, 150);
};

/**
 * Generate a deterministic placeholder color based on place name
 * @param {string} name - Place or hotel name
 */
export const getPlaceholderColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-teal-100 text-teal-800'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};
