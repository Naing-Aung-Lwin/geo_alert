import React, {useState, useEffect} from 'react';
import {
  View,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import {LeafletView} from 'react-native-leaflet-view';
import Geolocation from '@react-native-community/geolocation';

interface LatLng {
  lat: number;
  lng: number;
}

const App: React.FC = () => {
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [mapMarkers,  setMapMarkers] = useState<any[]>([]);

  // Request location permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition((position: any) => {
            console.log("User's Location:", position.coords);

            const {latitude, longitude} = position.coords;
            setUserLocation({lat: latitude, lng: longitude});
          });
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          console.error('Location permission denied');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!destination) {
      return;
    }
    // Track user location
    const watchId = Geolocation.watchPosition(
      (position: any) => {
        const {latitude, longitude} = position.coords;
        setUserLocation({lat: latitude, lng: longitude});
        console.log('userlocations >> ', userLocation);
        if (destination) {
          const distance = getDistance(
            latitude,
            longitude,
            destination.lat,
            destination.lng,
          );
          if (distance < 50) {
            Alert.alert(
              'Destination Reached!',
              'You have arrived at your marked location.',
            );
          }
        }
      },
      (error: any) => console.error('Geolocation Error:', error),
      {enableHighAccuracy: true, distanceFilter: 10, interval: 5000},
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [destination, userLocation]);

  // useEffect(() => {
  //   if (userLocation) {
  //     setMapMarkers([
  //       ...mapMarkers,
  //       {
  //         position: userLocation,
  //         icon: '🧍',
  //         size: [32, 32],
  //         id: 'user_location',
  //       },
  //     ]);
  //   }
  //   if (destination) {
  //     setMapMarkers([
  //       ...mapMarkers,
  //       {
  //         position: destination,
  //         icon: '📍',
  //         size: [32, 32],
  //         id: 'destination',
  //       },
  //     ]);
  //   }
  //   console.log('mapMarkers >>> ', mapMarkers);
  // }, [destination, mapMarkers, userLocation]);

  const handleMapEvents = (event: any) => {
    console.log('event >>> ', event);
    if (event.event === 'onMapClicked') {
      setDestination({
        lat: event?.payload?.touchLatLng?.lat,
        lng: event?.payload?.touchLatLng?.lng,
      });
      const currentMarkers = [...mapMarkers];
      console.log('currentMarkers', currentMarkers);
      const index = mapMarkers.findIndex(marker => marker.id === 'destination');
      console.log('index >>> ', index);
      if (index !== -1) {
        currentMarkers[index].position.lat = event?.payload?.touchLatLng?.lat;
        currentMarkers[index].position.lng = event?.payload?.touchLatLng?.lng;
        setMapMarkers(currentMarkers);
      } else if (mapMarkers.length === 0) {
        currentMarkers.push({
          id: 'destination',
          position: {
            lat: event?.payload?.touchLatLng?.lat,
            lng: event?.payload?.touchLatLng?.lng,
          },
          icon: '📍',
          size: [32, 32],
        });
        setMapMarkers(currentMarkers);
      }
    }
  };

  return (
    <View style={styles.container}>
      <LeafletView
        mapCenterPosition={userLocation || {lat: 48.8566, lng: 2.3522}}
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
    </View>
  );
};

// Function to calculate distance between two points (in meters)
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'lightgray',
  },
});

export default App;
