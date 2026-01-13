import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Cute notification messages
const CUTE_MESSAGES = [
  "💧 Time to hydrate! Your body will thank you! 💙",
  "🌊 Glug glug! Let's drink some water together! 🎉",
  "💦 Your cells are thirsty! Show them some love! 🥰",
  "🌈 Stay hydrated, stay happy! Water break time! ✨",
  "💙 H2O time! Keep that beautiful body hydrated! 🌟",
  "🚰 Drink up, buttercup! Your body needs water! 🌸",
  "💧 Hydration station! All aboard the water train! 🚂",
  "🌊 Wave hello to hydration! Time for water! 👋",
  "💦 Splash! It's water o'clock! ⏰",
  "🌈 Rainbow reminder: Drink water, feel amazing! 🦄",
  "💙 Your body is 60% water. Let's keep it that way! 🎯",
  "🌟 Sparkle and shine! Hydration time! ✨",
  "💧 Drop everything! It's time to drink water! 😄",
  "🌊 Ride the hydration wave! Drink up! 🏄",
  "💦 Water you waiting for? Let's hydrate! 🤗",
  "🌈 Stay cool, stay hydrated! Water break! 😎",
  "💙 Your future self will thank you! Drink water! 🙏",
  "🚰 Tap into wellness! Hydration time! 💪",
  "💧 Little sips, big benefits! Let's go! 🎊",
  "🌊 Ocean of wellness awaits! Drink water! 🌺",
];

export class NotificationService {
  private static notificationIdentifier: string | null = null;

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('hydration', {
        name: 'Hydration Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
        sound: 'default',
      });
    }

    return true;
  }

  /**
   * Get a random cute message
   */
  static getRandomMessage(): string {
    return CUTE_MESSAGES[Math.floor(Math.random() * CUTE_MESSAGES.length)];
  }

  /**
   * Schedule hydration notifications
   */
  static async scheduleHydrationNotifications(
    intervalMinutes: number,
    startHour: number,
    endHour: number
  ): Promise<void> {
    // Cancel existing notifications first
    await this.cancelHydrationNotifications();

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('Cannot schedule notifications without permission');
      return;
    }

    // Calculate how many notifications to schedule per day
    const activeHours = endHour - startHour;
    const notificationsPerDay = Math.floor((activeHours * 60) / intervalMinutes);

    console.log(`Scheduling ${notificationsPerDay} notifications per day`);

    // Schedule notifications for the next 7 days
    const notifications: string[] = [];
    
    for (let day = 0; day < 7; day++) {
      for (let i = 0; i < notificationsPerDay; i++) {
        const triggerDate = new Date();
        triggerDate.setDate(triggerDate.getDate() + day);
        triggerDate.setHours(startHour);
        triggerDate.setMinutes(i * intervalMinutes);
        triggerDate.setSeconds(0);

        // Only schedule if in the future
        if (triggerDate > new Date()) {
          const secondsUntilTrigger = Math.floor((triggerDate.getTime() - Date.now()) / 1000);
          
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: '💧 Hydration Reminder',
              body: this.getRandomMessage(),
              data: { type: 'hydration' },
              sound: 'default',
            },
            trigger: {
              type: 'timeInterval' as const,
              seconds: secondsUntilTrigger,
            },
          });
          notifications.push(id);
        }
      }
    }

    console.log(`Scheduled ${notifications.length} hydration notifications`);
  }

  /**
   * Cancel all hydration notifications
   */
  static async cancelHydrationNotifications(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const hydrationNotifications = scheduled.filter(
      (n) => n.content.data?.type === 'hydration'
    );

    for (const notification of hydrationNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    console.log(`Cancelled ${hydrationNotifications.length} hydration notifications`);
  }

  /**
   * Send immediate notification (for testing)
   */
  static async sendImmediateNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('Cannot send notification without permission');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Hydration Reminder',
        body: this.getRandomMessage(),
        data: { type: 'hydration' },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  }

  /**
   * Check if it's within active notification hours
   */
  static isWithinActiveHours(startHour: number, endHour: number): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Get notification listener
   */
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}
