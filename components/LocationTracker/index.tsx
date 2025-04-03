import React, {useEffect, useState} from 'react';
import {Text, Alert, View, TouchableOpacity, Image} from 'react-native';
import {LeafletView, WebviewLeafletMessage} from 'react-native-leaflet-view';
import useLocation from '../../hooks/useLocation';
import useDestination from '../../hooks/useDestination';
import {getDistance} from '../../utils/distance';
import {DESTINATION_REACHED, DESTINATION_REACHED_MSG} from '../../constants';
import NotificationSounds, {
  playSampleSound,
  stopSampleSound,
} from 'react-native-notification-sounds';
import {styles} from './styles';

const LocationTracker: React.FC = () => {
  const {userLocation, requestLocationPermission} = useLocation();
  const {destination, setDestination, mapMarkers, clearDestination} =
    useDestination(userLocation);
  const [notificationSound, setNotificationSound] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number; lng: number} | null>(
    null,
  );

  // Load a default notification sound when component mounts
  useEffect(() => {
    NotificationSounds.getNotifications('ringtone').then(sounds => {
      if (sounds && sounds.length > 0) {
        setNotificationSound(sounds[0]);
      }
    });
  }, []);

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
      if (notificationSound) {
        playSampleSound(notificationSound);
      }

      Alert.alert(DESTINATION_REACHED, DESTINATION_REACHED_MSG, [
        {
          text: 'OK',
          onPress: () => {
            stopSampleSound();
            clearDestination();
          },
        },
      ]);
    }
  }, [destination, userLocation, notificationSound, clearDestination]);

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
