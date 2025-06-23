import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiService } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      // Get the token
      if (Device.isDevice) {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        this.expoPushToken = token;
        console.log('Push token:', token);

        // Send token to backend
        await this.registerTokenWithBackend(token);
        
        return token;
      } else {
        console.warn('Must use physical device for Push Notifications');
        return null;
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  private async registerTokenWithBackend(token: string) {
    try {
      // You'll need to add this endpoint to your backend
      await apiService.registerPushToken(token);
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Handle notification received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can show in-app notification here
    });

    // Handle notification tapped
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // Navigate based on notification type
      this.handleNotificationTap(data);
    });

    return {
      notificationListener,
      responseListener,
    };
  }

  private handleNotificationTap(data: any) {
    // Handle navigation based on notification data
    if (data.type === 'AUCTION_WON' && data.auctionId) {
      // Navigate to auction detail
      // You'll implement this with your navigation service
    } else if (data.type === 'BID_OUTBID' && data.auctionId) {
      // Navigate to auction detail
    } else if (data.type === 'AUCTION_ENDED' && data.auctionId) {
      // Navigate to auction detail
    }
  }

  // Schedule local notification (for testing or offline scenarios)
  async scheduleLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds: 1 },
    });
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Set badge count
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  // Get current badge count
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const pushNotificationService = new PushNotificationService(); 