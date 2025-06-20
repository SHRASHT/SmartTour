// Trip Management Service for SecurityFirst Travel App
import { 
  saveTripToFirebase, 
  getUserTrips, 
  getTripById, 
  updateTrip, 
  deleteTrip,
  uploadTripImage
} from './firebaseConfig.jsx';
import authService from './authService.js';

class TripService {
  constructor() {
    this.trips = [];
    this.currentTrip = null;
  }

  // Save a new trip to Firebase
  async saveTrip(tripData) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to save trips');
      }

      // Validate required trip data
      if (!tripData.location || !tripData.days || !tripData.budget || !tripData.traveller) {
        throw new Error('Missing required trip information');
      }

      // Prepare trip data for saving
      const tripToSave = {
        ...tripData,
        location: {
          name: tripData.location.formatted_address || tripData.location.name,
          address: tripData.location.formatted_address,
          coordinates: tripData.location.geometry ? {
            lat: tripData.location.geometry.location.lat(),
            lng: tripData.location.geometry.location.lng()
          } : null
        },
        days: parseInt(tripData.days),
        budget: {
          title: tripData.budget.title,
          desc: tripData.budget.desc,
          icon: tripData.budget.icon
        },
        traveller: {
          people: tripData.traveller.people,
          title: tripData.traveller.title,
          desc: tripData.traveller.desc,
          icon: tripData.traveller.icon
        },
        status: 'saved',
        tags: this.generateTripTags(tripData)
      };

      const tripId = await saveTripToFirebase(tripToSave, currentUser.uid);
      
      console.log('Trip saved successfully with ID:', tripId);
      return {
        success: true,
        tripId,
        message: 'Trip saved successfully!'
      };
    } catch (error) {
      console.error('Error saving trip:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all trips for the current user
  async getUserTrips() {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to view trips');
      }

      const trips = await getUserTrips(currentUser.uid);
      this.trips = trips;
      
      console.log(`Retrieved ${trips.length} trips for user`);
      return {
        success: true,
        trips
      };
    } catch (error) {
      console.error('Error getting user trips:', error);
      return {
        success: false,
        error: error.message,
        trips: []
      };
    }
  }

  // Get a specific trip by ID
  async getTrip(tripId) {
    try {
      const trip = await getTripById(tripId);
      if (trip) {
        this.currentTrip = trip;
        return {
          success: true,
          trip
        };
      } else {
        return {
          success: false,
          error: 'Trip not found'
        };
      }
    } catch (error) {
      console.error('Error getting trip:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update an existing trip
  async updateTrip(tripId, updateData) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to update trips');
      }

      // Verify trip ownership
      const tripResult = await this.getTrip(tripId);
      if (!tripResult.success) {
        throw new Error('Trip not found');
      }

      if (tripResult.trip.userId !== currentUser.uid) {
        throw new Error('You can only update your own trips');
      }

      await updateTrip(tripId, updateData);
      
      console.log('Trip updated successfully');
      return {
        success: true,
        message: 'Trip updated successfully!'
      };
    } catch (error) {
      console.error('Error updating trip:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete a trip
  async deleteTrip(tripId) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to delete trips');
      }

      // Verify trip ownership
      const tripResult = await this.getTrip(tripId);
      if (!tripResult.success) {
        throw new Error('Trip not found');
      }

      if (tripResult.trip.userId !== currentUser.uid) {
        throw new Error('You can only delete your own trips');
      }

      await deleteTrip(tripId);
      
      console.log('Trip deleted successfully');
      return {
        success: true,
        message: 'Trip deleted successfully!'
      };
    } catch (error) {
      console.error('Error deleting trip:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload images for a trip
  async uploadTripImages(tripId, files) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to upload images');
      }

      const uploadPromises = files.map((file, index) => 
        uploadTripImage(file, tripId, `image_${index}`)
      );

      const imageUrls = await Promise.all(uploadPromises);
      
      // Update trip with image URLs
      await this.updateTrip(tripId, {
        images: imageUrls,
        hasImages: true
      });

      console.log('Images uploaded successfully');
      return {
        success: true,
        imageUrls,
        message: 'Images uploaded successfully!'
      };
    } catch (error) {
      console.error('Error uploading images:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate tags for better trip categorization
  generateTripTags(tripData) {
    const tags = [];
    
    // Budget-based tags
    if (tripData.budget.title.toLowerCase().includes('budget')) {
      tags.push('budget-friendly');
    } else if (tripData.budget.title.toLowerCase().includes('luxury')) {
      tags.push('luxury');
    } else {
      tags.push('moderate');
    }

    // Duration-based tags
    const days = parseInt(tripData.days);
    if (days <= 3) {
      tags.push('short-trip');
    } else if (days <= 7) {
      tags.push('week-long');
    } else {
      tags.push('extended-trip');
    }

    // Traveller-based tags
    if (tripData.traveller.title.toLowerCase().includes('solo')) {
      tags.push('solo-travel');
    } else if (tripData.traveller.title.toLowerCase().includes('couple')) {
      tags.push('couple-travel');
    } else if (tripData.traveller.title.toLowerCase().includes('family')) {
      tags.push('family-travel');
    } else {
      tags.push('group-travel');
    }

    return tags;
  }

  // Search trips by tags or location
  searchTrips(query, tags = []) {
    return this.trips.filter(trip => {
      const matchesQuery = query ? 
        trip.location.name.toLowerCase().includes(query.toLowerCase()) ||
        (trip.description && trip.description.toLowerCase().includes(query.toLowerCase())) : true;
      
      const matchesTags = tags.length === 0 || 
        tags.some(tag => trip.tags && trip.tags.includes(tag));
      
      return matchesQuery && matchesTags;
    });
  }

  // Get trip statistics
  getTripStats() {
    const stats = {
      totalTrips: this.trips.length,
      totalDestinations: new Set(this.trips.map(trip => trip.location.name)).size,
      totalDays: this.trips.reduce((sum, trip) => sum + trip.days, 0),
      budgetBreakdown: {},
      travellerBreakdown: {}
    };

    // Calculate budget breakdown
    this.trips.forEach(trip => {
      const budget = trip.budget.title;
      stats.budgetBreakdown[budget] = (stats.budgetBreakdown[budget] || 0) + 1;
    });

    // Calculate traveller breakdown
    this.trips.forEach(trip => {
      const traveller = trip.traveller.title;
      stats.travellerBreakdown[traveller] = (stats.travellerBreakdown[traveller] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
const tripService = new TripService();

export default tripService;
