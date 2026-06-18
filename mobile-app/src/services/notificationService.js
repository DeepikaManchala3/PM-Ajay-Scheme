import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async () => {
  try {
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

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Send a local notification
 */
export const sendLocalNotification = async ({ title, body, data = {} }) => {
  try {
    const hasPermission = await requestNotificationPermissions();

    if (!hasPermission) {
      console.log('No notification permission, skipping notification');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: null, // null means show immediately
    });

    console.log('📬 Local notification sent:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error sending local notification:', error);
    return null;
  }
};

/**
 * Send notification for pending approvals
 */
export const notifyPendingApprovals = async (count) => {
  if (count === 0) {
    console.log('ℹ️ No pending approvals to notify');
    return;
  }

  console.log(`🔔 Preparing to send notification for ${count} pending approvals`);

  const title = '⚠️ Pending Approvals';
  const body = count === 1
    ? 'There is 1 pending proposal that requires your approval. Please verify and take action.'
    : `There are ${count} pending proposals that require your approval. Please verify and take action.`;

  const notificationId = await sendLocalNotification({
    title,
    body,
    data: { type: 'pending_approvals', count },
  });

  if (notificationId) {
    console.log('✅ Notification sent successfully with ID:', notificationId);
  } else {
    console.log('❌ Failed to send notification');
  }

  return notificationId;
};

/**
 * Send notification for new fund allocation
 */
export const notifyNewFunds = async (amount, component) => {
  const title = '💰 New Fund Allocation';
  const body = `New fund of ${amount} has been allocated for ${component}. Check the dashboard for details.`;

  await sendLocalNotification({
    title,
    body,
    data: { type: 'fund_allocation', amount, component },
  });
};

/**
 * Send notification for fund release from central to state
 */
export const notifyFundRelease = async (amount, stateName, remainingBalance) => {
  console.log(`🔔 Preparing fund release notification: ₹${amount} Cr to ${stateName}`);

  const title = '💰 Fund Released by Ministry';
  const body = remainingBalance && remainingBalance !== 'N/A'
    ? `Ministry has released ₹${amount} Cr for ${stateName}. Remaining balance: ₹${remainingBalance} Cr.`
    : `Ministry has released ₹${amount} Cr for ${stateName}.`;

  const notificationId = await sendLocalNotification({
    title,
    body,
    data: { type: 'fund_release', amount, stateName, remainingBalance },
  });

  if (notificationId) {
    console.log('✅ Fund release notification sent successfully with ID:', notificationId);
  } else {
    console.log('❌ Failed to send fund release notification');
  }

  return notificationId;
};

/**
 * Send notification for new proposal
 */
export const notifyNewProposal = async (district, projectName) => {
  const title = '📋 New Proposal Received';
  const body = `New proposal "${projectName}" submitted by ${district}. Review required.`;

  await sendLocalNotification({
    title,
    body,
    data: { type: 'new_proposal', district, projectName },
  });
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Register for Push Notifications and get token
 */
export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  // Get the token
  try {
    const options = {};
    if (process.env.EXPO_PUBLIC_PROJECT_ID) {
      options.projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    }

    // In Expo Go, strictly passing an empty object or undefined often works best if no Project ID is configured
    const tokenData = await Notifications.getExpoPushTokenAsync(Object.keys(options).length ? options : undefined);
    token = tokenData.data;
    console.log('✅ Expo Push Token:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
    // Fallback: try getting token without any options (default behavior)
    try {
      if (!token) {
        console.log('🔄 Retrying token fetch without options...');
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
        console.log('✅ Expo Push Token (Retry Success):', token);
      }
    } catch (retryError) {
      console.error('❌ Retry failed:', retryError);
    }
  }

  return token;
};

/**
 * Set up notification listeners
 */
export const setupNotificationListeners = (onNotificationReceived, onNotificationTapped) => {
  // Listener for when a notification is received while app is foregrounded
  const receivedListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('📬 Notification received:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Listener for when a user taps on a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 Notification tapped:', response);
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
  });

  // Return cleanup function
  return () => {
    if (receivedListener && receivedListener.remove) {
      receivedListener.remove();
    }
    if (responseListener && responseListener.remove) {
      responseListener.remove();
    }
  };
};

/**
 * Setup Realtime Listener for Notifications table
 * Triggers a Local Notification when a new row is inserted in 'notifications' table
 * matching the user criteria.
 */
import { supabase } from '../lib/supabaseClient';

export const setupRealtimeNotificationListener = (user) => {
  if (!user) return () => { };

  console.log('📡 Setting up Realtime Notification Listener for:', user.email);

  const channel = supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      },
      (payload) => {
        const newNotification = payload.new;
        console.log('📨 New Realtime Notification Received:', newNotification);

        // Check if this notification is for this user
        console.log('🔍 Checking notification relevance for user:', user.email, 'Role:', user.role);
        console.log('📧 Notification details - Role:', newNotification.user_role, 'State:', newNotification.state_name);

        // Map user role to notification role format
        // User roles: 'state_admin', 'district_admin', etc.
        // Notification roles: 'state', 'district', 'ministry', 'gp'
        const roleMap = {
          'state_admin': 'state',
          'district_admin': 'district',
          'centre_admin': 'ministry',
          'gp_admin': 'gp'
        };
        
        const mappedUserRole = roleMap[user.role] || user.role;

        // Filter by Role first
        if (newNotification.user_role && newNotification.user_role !== mappedUserRole) {
          console.log('❌ Role mismatch, ignoring notification. Expected:', mappedUserRole, 'Got:', newNotification.user_role);
          return;
        }

        // Filter by State Name (for State Admins)
        if (newNotification.state_name && user.role === 'state_admin') {
          // Extract state name from user's full_name or use state_name property
          let userStateName = user.state_name;
          
          // If state_name is not available, try to extract from full_name
          if (!userStateName && user.full_name) {
            userStateName = user.full_name
              .replace(' State Admin', '')
              .replace(' Admin', '')
              .replace(' State', '')
              .trim();
          }

          console.log('🏛️ User state:', userStateName, '| Notification state:', newNotification.state_name);

          // Check if states match (case-insensitive)
          if (userStateName && 
              userStateName.toLowerCase() !== newNotification.state_name.toLowerCase()) {
            console.log('❌ State mismatch, ignoring notification.');
            return;
          }
        }

        console.log('✅ Notification is relevant for this user');

        // Special handling for fund release notifications
        // Check if message contains fund release keywords
        const isFundRelease = newNotification.title?.includes('Fund Released') || 
                             newNotification.message?.includes('released');
        if (isFundRelease && newNotification.state_name) {
          const amountMatch = newNotification.message.match(/₹([\d.]+)/);
          const amount = amountMatch ? amountMatch[1] : 'N/A';
          console.log('💰 Triggering fund release notification for amount:', amount);
        }

        // Trigger Local Notification
        sendLocalNotification({
          title: newNotification.title || 'New Notification',
          body: newNotification.message || 'You have a new update.',
          data: newNotification
        });
      }
    )
    .subscribe();

  return () => {
    console.log('Disconnecting Realtime Listener');
    supabase.removeChannel(channel);
  };
};
