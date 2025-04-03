import React, {useEffect, useState, useRef} from 'react';
import {Text, View, TouchableOpacity, Image} from 'react-native';
import {LeafletView, WebviewLeafletMessage} from 'react-native-leaflet-view';
import useLocation from '../../hooks/useLocation';
import useDestination from '../../hooks/useDestination';
import useNotification from '../../hooks/useNotification';
import {getDistance} from '../../utils/distance';
import {DESTINATION_REACHED, DESTINATION_REACHED_MSG} from '../../constants';
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
  // Track if notification has been shown
  const destinationReachedRef = useRef(false);

  // Request notification permission when component mounts
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    requestLocationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set initial map center to user location only once
  useEffect(() => {
    if (userLocation && !mapCenter) {
      setMapCenter(userLocation);
    }
  }, [userLocation, mapCenter]);

  // Reset the notification flag when destination changes
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

    // Only show notification if we haven't already shown it for this destination
    if (distance < 200 && !destinationReachedRef.current) {
      destinationReachedRef.current = true;

      // Function to display notification when destination is reached
      const displayDestinationReachedNotification = async () => {
        try {
          // Create a channel for destination alerts
          const channelId = await createChannel(
            'destination_reached',
            'Destination Alerts',
          );

          // Display the notification with an OK action
          await displayNotification(
            channelId,
            DESTINATION_REACHED,
            DESTINATION_REACHED_MSG,
            [{title: 'OK', id: 'stop'}],
            'destination-reached-notification',
          );

          // Set up event listener for notification actions
          registerNotificationListener((type, detail) => {
            if (detail.pressAction?.id === 'stop' || detail.pressAction?.id === 'default') {
              clearDestination();
              destinationReachedRef.current = false;
            }
          });
        } catch (error) {
          console.error('Error displaying notification:', error);
        }
      };

      // Display notification
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
      // Update map center to the clicked location
      setMapCenter({lat, lng});
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      // Force update by creating a new object reference
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
