import {useState, useEffect} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import {LatLng} from 'react-native-leaflet-view';
import {
  BACKGROUND_REQUEST_MSG,
  ERROR_GET_REAL_TIME_LOCATION,
  LIMITED_FUNCTIONALITY_MSG,
  LIMITED_FUNCTIONALITY_MSG_BODY,
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
          requestBackgroundLocationPermission();
        } else {
          Alert.alert(USER_LOCATION_DENIED);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // IOS is still in development
    }
  };

  /**
   * Requests background location permission
   */
  const requestBackgroundLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 10+ (API 29+), request background permission separately
        const version = String(Platform.Version);
        if (parseInt(version, 10) >= 29) {
          const backgroundGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            BACKGROUND_REQUEST_MSG,
          );

          if (backgroundGranted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              LIMITED_FUNCTIONALITY_MSG,
              LIMITED_FUNCTIONALITY_MSG_BODY,
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // iOS implementation
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
      getCurrentLocation();
    }, 5000);

    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }, [locationPermissionGranted]);

  return {userLocation, requestLocationPermission};
};

export default useLocation;
