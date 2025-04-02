/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Button,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import NotificationSounds, {
  playSampleSound,
  stopSampleSound,
} from 'react-native-notification-sounds';

const Notification = () => {
  const [soundsList, setSoundsList] = useState<any>({});

  useEffect(() => {
    NotificationSounds.getNotifications('ringtone').then((sounds) => {
      console.warn('SOUNDS', JSON.stringify(sounds));
      setSoundsList(sounds);
    });
  }, []);

  const renderSound = ({item}: any) => {
    // console.warn(item)
    return (
      <TouchableOpacity onPress={() => playSampleSound(item)}>
        <Text style={styles.soundText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <Button
          color={'red'}
          title="Stop Sound"
          onPress={() => {
            stopSampleSound();
          }}
        />
        <FlatList
          data={soundsList}
          renderItem={renderSound}
          style={styles.soundsList}
          contentContainerStyle={styles.contentContainer}
          keyExtractor={(item) => item.soundID}
        />
      </SafeAreaView>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  soundsList: {
    backgroundColor: Colors.lighter,
    marginTop: 32,
    paddingHorizontal: 24,
  },

  soundText: {
    marginTop: 8,
    fontSize: 18,
    paddingVertical: 4,
    fontWeight: '400',
    color: '#ae00ff',
  },
});

export default Notification;
