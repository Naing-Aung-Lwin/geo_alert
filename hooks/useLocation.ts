import {useState, useEffect} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {LatLng} from '../types';

const useLocation = () => {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const requestLocationPermission = async () => {
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
          getCurrentLocation();
        } else {
          Alert.alert('Location permission denied');
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setUserLocation({lat: latitude, lng: longitude});
      },
      error => console.error('Error getting location:', error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setUserLocation({lat: latitude, lng: longitude});
      },
      error => console.error('Geolocation Error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 5000,
        maximumAge: 0,
        timeout: 15000,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  return {userLocation, requestLocationPermission};
};

export default useLocation;
