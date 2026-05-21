// NO STATIC IMPORTS - To allow Web build without Capacitor packages installed

/**
 * Helper to request notification permissions explicitly.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  let isNative = false;

  try {
    const { Capacitor } = await import('@capacitor/core');
    isNative = Capacitor.isNativePlatform();
  } catch (e) {
    // Web mode
  }

  if (!isNative) {
    // On Web, notifications might be requested via browser API if needed, 
    // but usually just returning true for "setup" is fine or using standard Notification API.
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return true; // Fallback
  }

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const permResult = await LocalNotifications.requestPermissions();
    return permResult.display === 'granted';
  } catch (e) {
    console.error('Failed to request notifications', e);
    return false;
  }
};

/**
 * Schedules a notification for a specific task.
 * Works natively on Android/iOS. On Web, it logs.
 */
export const scheduleTaskReminder = async (taskId: string, taskText: string, date: Date) => {
  let isNative = false;

  try {
    const { Capacitor } = await import('@capacitor/core');
    isNative = Capacitor.isNativePlatform();
  } catch (e) {
    isNative = false;
  }

  if (!isNative) {
    console.log(`[Web] Would schedule notification for "${taskText}" at ${date.toISOString()}`);
    return;
  }

  // Native Logic
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: parseInt(taskId.slice(-8), 16) || Date.now(),
          title: 'Напоминание',
          body: taskText,
          schedule: { at: date },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config',
          largeIcon: 'ic_launcher',
          extra: { taskId }
        },
      ],
    });
    console.log(`Notification scheduled for ${date}`);
  } catch (e) {
    console.error('Failed to schedule native notification', e);
  }
};

/**
 * Cancels a notification by ID.
 */
export const cancelNotification = async (taskId: string) => {
  let isNative = false;

  try {
    const { Capacitor } = await import('@capacitor/core');
    isNative = Capacitor.isNativePlatform();
  } catch (e) {
    return;
  }

  if (!isNative) return;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const id = parseInt(taskId.slice(-8), 16) || Date.now();
    await LocalNotifications.cancel({
      notifications: [{ id }]
    });
  } catch (e) {
    console.error('Failed to cancel notification', e);
  }
};

/**
 * Checks if we are currently within the reminder time of a task.
 * Returns true if a notification should trigger NOW (in-app).
 */
export const checkImmediateReminders = (tasks: any[], currentDate: Date): string | null => {
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  
  for (const task of tasks) {
    if (!task.dueDate || !task.reminderTime || task.completed) continue;
    
    const dueDate = new Date(task.dueDate);
    if (dueDate.toDateString() !== now.toDateString()) continue;

    const [hours, minutes] = task.reminderTime.split(':').map(Number);
    const taskMinute = hours * 60 + minutes;

    if (taskMinute === currentMinute) {
      return task.text;
    }
  }
  return null;
};