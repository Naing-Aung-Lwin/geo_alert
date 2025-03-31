import React, {useEffect} from 'react';
import {Text, Alert} from 'react-native';
import {LeafletView} from 'react-native-leaflet-view';
import useLocation from '../../hooks/useLocation';
import useDestination from '../../hooks/useDestination';
import { getDistance } from '../../utils/distance';

const LocationTracker: React.FC = () => {
  const {userLocation, requestLocationPermission} = useLocation();
  const {destination, setDestination, mapMarkers, setMarker} =
    useDestination(userLocation);

  useEffect(() => {
    requestLocationPermission();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!destination || !userLocation) {
      return;
    }

    const distance = getDistance(
      userLocation.lat,
      userLocation.lng,
      destination.lat,
      destination.lng,
    );

    if (distance < 200) {
      Alert.alert(
        'Destination Reached!',
        'You have arrived at your marked location.',
      );
    }
  }, [destination, userLocation]);

  const handleMapEvents = (event: any) => {
    if (event.event === 'onMapClicked') {
      const lat = event?.payload?.touchLatLng?.lat;
      const lng = event?.payload?.touchLatLng?.lng;
      setDestination({lat, lng});
      setMarker(lat, lng, 'destination', '📍');
    }
  };

  return (
    <>
      {!userLocation ? (
        <Text>Loading location...</Text>
      ) : (
        <LeafletView
          mapCenterPosition={userLocation}
          zoom={15}
          mapMarkers={mapMarkers}
          onMessageReceived={handleMapEvents}
          mapLayers={[
            {
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              baseLayer: true,
            },
          ]}
        />
      )}
    </>
  );
};

export default LocationTracker;
