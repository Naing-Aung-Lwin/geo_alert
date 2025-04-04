import {useState, useEffect} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import { LatLng } from 'react-native-leaflet-view';
import {
  ERROR_GET_REAL_TIME_LOCATION,
  USER_LOCATION_DENIED,
  USER_LOCATION_REQUEST_MSG,
} from '../constants';

const useLocation = () => {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  /**
   * Requests location permission and retrieves the current location
   */
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          USER_LOCATION_REQUEST_MSG,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setLocationPermissionGranted(true);
        } else {
          Alert.alert(USER_LOCATION_DENIED);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   * Gets the current location
   */
  const getCurrentLocation = () => {
    return new Promise<void>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setUserLocation({lat: latitude, lng: longitude});
          resolve();
        },
        error => {
          console.error(ERROR_GET_REAL_TIME_LOCATION, error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        },
      );
    });
  };

  /**
   * Uses background timer to fetch location every 5 seconds
   */
  useEffect(() => {
    if (!locationPermissionGranted) {
      return;
    }
    getCurrentLocation();

    const intervalId = BackgroundTimer.setInterval(() => {
      console.log('Fetching location...');
      getCurrentLocation();
    }, 5000);

    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }, [locationPermissionGranted]);

  return {userLocation, requestLocationPermission};
};

export default useLocation;
