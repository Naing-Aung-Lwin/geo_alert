import React, {useEffect, useState, useRef} from 'react';
import {Text, View, TouchableOpacity, Image} from 'react-native';
import {LeafletView, WebviewLeafletMessage} from 'react-native-leaflet-view';
import useLocation from '../../hooks/useLocation';
import useDestination from '../../hooks/useDestination';
import useNotification from '../../hooks/useNotification';
import {getDistance} from '../../utils/distance';
import {DESTINATION_REACHED, DESTINATION_REACHED_MSG, MAX_DISTANCE_THRESHOLD} from '../../constants';
import {styles} from './styles';

const LocationTracker: React.FC = () => {
  const {userLocation, requestLocationPermission} = useLocation();
  const {destination, setDestination, mapMarkers, clearDestination} =
    useDestination(userLocation);
  const {
    requestPermission,
    createChannel,
    displayNotification,
    registerNotificationListener,
  } = useNotification();

  const [mapCenter, setMapCenter] = useState<{lat: number; lng: number} | null>(
    null,
  );
  const destinationReachedRef = useRef(false);

  useEffect(() => {
    requestPermission();
    requestLocationPermission();
  }, [requestLocationPermission, requestPermission]);

  useEffect(() => {
    if (userLocation && !mapCenter) {
      setMapCenter(userLocation);
    }
  }, [userLocation, mapCenter]);

  useEffect(() => {
    if (destination) {
      destinationReachedRef.current = false;
    }
  }, [destination]);

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

    if (distance < MAX_DISTANCE_THRESHOLD && !destinationReachedRef.current) {
      destinationReachedRef.current = true;

      const displayDestinationReachedNotification = async () => {
        try {
          const channelId = await createChannel(
            'destination_reached',
            'Destination Alerts',
          );

          await displayNotification(
            channelId,
            DESTINATION_REACHED,
            DESTINATION_REACHED_MSG,
            [{title: 'OK', id: 'stop'}],
            'destination-reached-notification',
          );

          registerNotificationListener((_type, detail) => {
            if (detail.pressAction?.id === 'stop' || detail.pressAction?.id === 'default') {
              clearDestination();
              destinationReachedRef.current = false;
            }
          });
        } catch (error) {
          console.error(error);
        }
      };
      displayDestinationReachedNotification();
    }
  }, [
    destination,
    userLocation,
    displayNotification,
    createChannel,
    registerNotificationListener,
    clearDestination,
  ]);

  const handleMapEvents = (event: WebviewLeafletMessage) => {
    if (event.event === 'onMapClicked') {
      const lat = event?.payload?.touchLatLng?.lat;
      const lng = event?.payload?.touchLatLng?.lng;
      setDestination({lat, lng});
      setMapCenter({lat, lng});
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      setMapCenter({...userLocation});
    }
  };

  return (
    <>
      {!userLocation ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading location...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <LeafletView
            mapCenterPosition={mapCenter || userLocation}
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
          <TouchableOpacity
            style={styles.centerButton}
            onPress={centerOnUserLocation}>
            <Image
              source={require('../../assets/center-me.png')}
              style={styles.centerIcon}
            />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default LocationTracker;
