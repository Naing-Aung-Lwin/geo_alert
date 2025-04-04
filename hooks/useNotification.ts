import {useCallback} from 'react';
import notifee, {AuthorizationStatus} from '@notifee/react-native';

const useNotification = () => {
  /**
   * Requests notification permissions from the user
   * @returns Promise resolving to the permission settings
   */
  const requestPermission = useCallback(async () => {
    try {
      const settings = await notifee.requestPermission();
      return settings;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return {authorizationStatus: AuthorizationStatus.DENIED};
    }
  }, []);

  /**
   * Checks if notification permissions are granted
   * @returns Promise resolving to a boolean indicating if permissions are granted
   */
  const hasPermission = useCallback(async () => {
    const settings = await requestPermission();
    return !!settings.authorizationStatus;
  }, [requestPermission]);

  /**
   * Creates a notification channel for Android
   * @param channelId Unique identifier for the channel
   * @param channelName Human-readable name for the channel
   * @returns The channel ID
   */
  const createChannel = useCallback(
    async (channelId: string, channelName: string) => {
      return await notifee.createChannel({
        id: channelId,
        name: channelName,
        importance: 4,
        sound: 'none',
      });
    },
    [],
  );

  /**
   * Displays a notification with optional action buttons
   * @param channelId Android channel ID
   * @param title Notification title
   * @param body Notification body text
   * @param actions Array of action buttons
   * @param notificationId Optional unique ID for the notification
   */
  const displayNotification = useCallback(
    async (
      channelId: string,
      title: string,
      body: string,
      actions: Array<{title: string; id: string}> = [],
      notificationId?: string,
    ) => {
      const permissionGranted = await hasPermission();
      if (!permissionGranted) {
        return null;
      }
      await notifee.cancelAllNotifications();

      const androidActions = actions.map(action => ({
        title: action.title,
        pressAction: {
          id: action.id,
        },
      }));

      return await notifee.displayNotification({
        id: notificationId,
        title,
        body,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
          actions: androidActions,
          sound: 'none',
        },
      });
    },
    [hasPermission],
  );

  /**
   * Registers a listener for notification events
   * @param callback Function to call when notification events occur
   */
  const registerNotificationListener = useCallback(
    (callback: (type: number, detail: any) => void) => {
      return notifee.onForegroundEvent(({type, detail}) => {
        callback(type, detail);
      });
    },
    [],
  );

  return {
    requestPermission,
    hasPermission,
    createChannel,
    displayNotification,
    registerNotificationListener,
  };
};

export default useNotification;
