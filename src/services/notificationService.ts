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

    console.log('📱 Current notification permission status:', existingStatus);

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('📱 Permission request result:', status);
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions not granted');
      return false;
    }

    console.log('✅ Notification permissions granted');

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('hydration', {
        name: 'Hydration Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
        sound: 'default',
      });
      console.log('📱 Android notification channel configured');
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
    endHour: number,
    soundEnabled: boolean = true
  ): Promise<void> {
    // Cancel existing notifications first
    await this.cancelHydrationNotifications();

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('❌ Cannot schedule notifications without permission');
      return;
    }

    // Calculate how many notifications to schedule per day
    const activeHours = endHour - startHour;
    const notificationsPerDay = Math.floor((activeHours * 60) / intervalMinutes);

    console.log(`🔔 Scheduling hydration notifications:`);
    console.log(`   - Interval: ${intervalMinutes} minutes`);
    console.log(`   - Active hours: ${startHour}:00 - ${endHour}:00`);
    console.log(`   - Notifications per day: ${notificationsPerDay}`);

    // Schedule notifications for the next 7 days
    const notifications: string[] = [];
    
    for (let day = 0; day < 7; day++) {
      for (let i = 0; i < notificationsPerDay; i++) {
        // Create base date at start hour
        const triggerDate = new Date();
        triggerDate.setDate(triggerDate.getDate() + day);
        triggerDate.setHours(startHour, 0, 0, 0); // Set to start hour with 0 minutes/seconds
        
        // Add the interval minutes properly using setTime to avoid overflow issues
        triggerDate.setTime(triggerDate.getTime() + (i * intervalMinutes * 60 * 1000));
        
        // Check if notification time is within active hours
        const triggerHour = triggerDate.getHours();
        if (triggerHour >= endHour) {
          continue; // Skip notifications outside active hours
        }

        // Only schedule if in the future
        if (triggerDate > new Date()) {
          const secondsUntilTrigger = Math.floor((triggerDate.getTime() - Date.now()) / 1000);
          
          // Use ISO string or en-US locale to avoid Buddhist Era calendar
          const formattedDate = triggerDate.toLocaleString('en-US', { 
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          
          if (notifications.length < 3) {
            // Only log first 3 to avoid console spam
            console.log(`   📅 Scheduling for: ${formattedDate} (in ${Math.floor(secondsUntilTrigger / 60)} min)`);
          }
          
          try {
            const id = await Notifications.scheduleNotificationAsync({
              content: {
                title: '💧 Hydration Reminder',
                body: this.getRandomMessage(),
                data: { type: 'hydration' },
                sound: soundEnabled ? 'default' : undefined,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
                channelId: Platform.OS === 'android' ? 'hydration' : undefined,
              },
            });
            notifications.push(id);
          } catch (error) {
            console.error('❌ Error scheduling notification:', error);
          }
        }
      }
    }

    console.log(`✅ Scheduled ${notifications.length} hydration notifications for the next 7 days`);
    
    // Verify scheduled notifications
    await this.logScheduledNotifications();
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

    console.log(`🔕 Cancelled ${hydrationNotifications.length} hydration notifications`);
  }

  /**
   * Send immediate notification (for testing)
   */
  static async sendImmediateNotification(soundEnabled: boolean = true): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('❌ Cannot send notification without permission');
      return;
    }

    console.log('📬 Sending immediate test notification...');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Hydration Reminder',
        body: this.getRandomMessage(),
        data: { type: 'hydration' },
        sound: soundEnabled ? 'default' : undefined,
      },
      trigger: null, // Send immediately
    });
    console.log('✅ Immediate notification sent');
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

  /**
   * Log all scheduled notifications (for debugging)
   */
  static async logScheduledNotifications(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const hydrationNotifications = scheduled.filter(
      (n) => n.content.data?.type === 'hydration'
    );

    console.log(`📋 Currently scheduled hydration notifications: ${hydrationNotifications.length}`);
    
    if (hydrationNotifications.length > 0) {
      console.log('   First 3 upcoming notifications:');
      hydrationNotifications.slice(0, 3).forEach((notification, index) => {
        const trigger = notification.trigger as any;
        if (trigger.type === 'date' && trigger.value) {
          const triggerDate = new Date(trigger.value);
          const formattedDate = triggerDate.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          const minutesUntil = Math.floor((triggerDate.getTime() - Date.now()) / 60000);
          console.log(`   ${index + 1}. ${formattedDate} (in ${minutesUntil} min)`);
        }
      });
    }
  }
}
