import React from 'react';
import {View, StyleSheet} from 'react-native';
import LocationTracker from './components/LocationTracker';
// import Notification from './components/Notification';

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <LocationTracker />
      {/* <Notification /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    marginTop: 40,
    backgroundColor: 'lightgray',
  },
});

export default App;
