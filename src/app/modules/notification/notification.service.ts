import * as admin from 'firebase-admin';
import config from '../../config';
import users from '../user/user.model';

/**
 * Firebase Admin SDK Setup
 * Service Account credentials should be provided via environment variables 
 * (GOOGLE_APPLICATION_CREDENTIALS) or initialized manually here.
 */
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('🔥 Firebase Admin SDK Initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

class NotificationService {
  /**
   * Send Direct Push Notification to a Specific User
   */
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data: Record<string, string> = {}
  ) {
    try {
      // 1. Fetch the user and their FCM tokens
      const user = await users.findById(userId).select('fcmTokens');
      
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        console.log(`⚠️ No FCM tokens found for user ${userId}. Skipping notification.`);
        return { success: false, message: 'No tokens available' };
      }

      // 2. Prepare the multicast message (payload)
      const message: admin.messaging.MulticastMessage = {
        tokens: user.fcmTokens,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // Ensure mobile app listens for clicks
        },
        android: {
          notification: {
            sound: 'default',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // 3. Send using Firebase Admin SDK
      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`✅ Push Sent to User ${userId}: ${response.successCount} successful, ${response.failureCount} failed.`);

      // 4. Cleanup invalid tokens (optional but recommended)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const token = user.fcmTokens?.[idx];
            if (token) failedTokens.push(token);
          }
        });

        if (failedTokens.length > 0) {
          await users.findByIdAndUpdate(userId, {
            $pull: { fcmTokens: { $in: failedTokens } },
          });
        }
      }

      return { success: true, response };
    } catch (error: any) {
      console.error('❌ Error sending push notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Push Notification to a Specific Topic (e.g., 'warehouse_staff')
   */
  async sendTopicNotification(
    topic: string,
    title: string,
    body: string,
    data: Record<string, string> = {}
  ) {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data,
      };

      const response = await admin.messaging().send(message);
      console.log(`🚀 Topic Notification Sent to [${topic}]:`, response);
      return { success: true, response };
    } catch (error: any) {
      console.error(`❌ Error sending topic notification [${topic}]:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Subscribe User to Role-based Topics
   */
  async subscribeToTopic(userId: string, topic: string) {
    const user = await users.findById(userId).select('fcmTokens');
    if (user?.fcmTokens?.length) {
      await admin.messaging().subscribeToTopic(user.fcmTokens, topic);
      console.log(`✅ User ${userId} subscribed to topic: ${topic}`);
    }
  }
}

export default new NotificationService();
