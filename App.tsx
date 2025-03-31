import React from 'react';
import {View, StyleSheet} from 'react-native';
import LocationTracker from './components/LocationTracker';

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <LocationTracker />
    </View>
  );
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
