import {useState, useEffect} from 'react';
import {LatLng} from '../types';

interface MapMarker {
  id: string;
  position: LatLng;
  icon: string;
  size: [number, number];
}

const useDestination = (userLocation: LatLng | null) => {
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  // Update user location marker whenever userLocation changes
  useEffect(() => {
    if (userLocation) {
      setMarker(userLocation.lat, userLocation.lng, 'userLocation', '🚗');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  /**
   * Sets or updates a marker on the map
   * @param lat Latitude
   * @param lng Longitude
   * @param type Marker identifier (e.g., 'userLocation', 'destination')
   * @param icon Emoji or icon to display
   */
  const setMarker = (lat: number, lng: number, type: string, icon: string) => {
    const currentMarkers = [...mapMarkers];
    const index = mapMarkers.findIndex(marker => marker.id === type);

    if (index !== -1) {
      // Update existing marker
      currentMarkers[index] = {
        ...currentMarkers[index],
        position: {lat, lng},
      };
      setMapMarkers(currentMarkers);
    } else {
      // Add new marker
      currentMarkers.push({
        id: type,
        position: {lat, lng},
        icon,
        size: [32, 32],
      });
      setMapMarkers(currentMarkers);
    }
  };

  /**
   * Removes a marker from the map
   * @param type Marker identifier to remove
   */
  const removeMarker = (type: string) => {
    setMapMarkers(mapMarkers.filter(marker => marker.id !== type));
  };

  /**
   * Clears all markers from the map
   */
  const clearMarkers = () => {
    setMapMarkers([]);
  };

  /**
   * Sets a new destination and updates the destination marker
   */
  const setNewDestination = (newDestination: LatLng) => {
    setDestination(newDestination);
    setMarker(newDestination.lat, newDestination.lng, 'destination', '📍');
  };

  /**
   * Clears the current destination
   */
  const clearDestination = () => {
    setDestination(null);
    removeMarker('destination');
  };

  return {
    destination,
    setDestination: setNewDestination,
    clearDestination,
    mapMarkers,
    setMarker,
    removeMarker,
    clearMarkers,
  };
};

export default useDestination;
