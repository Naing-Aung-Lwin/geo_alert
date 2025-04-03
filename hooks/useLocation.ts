import {useState, useEffect} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {LatLng} from '../types';
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
   * Retrieves the current location
   */
  // const getCurrentLocation = () => {
  //   Geolocation.getCurrentPosition(
  //     position => {
  //       const {latitude, longitude} = position.coords;
  //       setUserLocation({lat: latitude, lng: longitude});
  //     },
  //     error => console.error(ERROR_GET_LOCATION, error),
  //     {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
  //   );
  // };

  /**
   * Watches for real-time location updates
   */
  useEffect(() => {
    if (!locationPermissionGranted) {
      return;
    }
    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setUserLocation({lat: latitude, lng: longitude});
      },
      error => console.error(ERROR_GET_REAL_TIME_LOCATION, error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
        maximumAge: 5000,
        timeout: 15000,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [locationPermissionGranted]);

  return {userLocation, requestLocationPermission};
};

export default useLocation;
