import {useState, useEffect, useCallback} from 'react';
import {LatLng, MapMarker} from 'react-native-leaflet-view';
import {
  USER_DESTINATION,
  USER_LOCATION,
  USER_DESTINATION_ICON,
  USER_LOCATION_ICON,
} from '../constants';

const useDestination = (userLocation: LatLng | null) => {
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  /**
   * Sets or updates a marker on the map
   * @param lat Latitude
   * @param lng Longitude
   * @param type Marker identifier (e.g., 'userLocation', 'destination')
   * @param icon Emoji or icon to display
   */
  const setMarker = useCallback(
    (lat: number, lng: number, type: string, icon: string) => {
      setMapMarkers(prevMarkers => {
        const index = prevMarkers.findIndex(marker => marker.id === type);

        if (index !== -1) {
          return prevMarkers.map(marker =>
            marker.id === type ? {...marker, position: {lat, lng}} : marker,
          );
        } else {
          return [
            ...prevMarkers,
            {
              id: type,
              position: {lat, lng},
              icon,
              size: [32, 32],
            },
          ];
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (userLocation) {
      setMarker(
        userLocation.lat,
        userLocation.lng,
        USER_LOCATION,
        USER_LOCATION_ICON,
      );
    }
  }, [setMarker, userLocation]);

  /**
   * Removes a marker from the map
   * @param type Marker identifier to remove
   */
  const removeMarker = useCallback((type: string) => {
    setMapMarkers(prevMarkers =>
      prevMarkers.filter(marker => marker.id !== type),
    );
  }, []);

  /**
   * Clears all markers from the map
   */
  const clearMarkers = useCallback(() => {
    setMapMarkers([]);
  }, []);

  /**
   * Sets a new destination and updates the destination marker
   */
  const setNewDestination = useCallback(
    (newDestination: LatLng) => {
      setDestination(newDestination);
      setMarker(
        newDestination.lat,
        newDestination.lng,
        USER_DESTINATION,
        USER_DESTINATION_ICON,
      );
    },
    [setMarker],
  );

  /**
   * Clears the current destination
   */
  const clearDestination = useCallback(() => {
    setDestination(null);
    removeMarker(USER_DESTINATION);
  }, [removeMarker]);

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
