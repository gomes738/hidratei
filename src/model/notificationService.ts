import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

import { timeToMinutes, WaterSettings } from "@/model/waterSettings";

const CHANNEL_ID = "water-reminders";

export class NotificationUnavailableError extends Error {
  constructor() {
    super("Os lembretes exigem uma development build no Android. O restante do aplicativo funciona normalmente no Expo Go.");
    this.name = "NotificationUnavailableError";
  }
}

export class NotificationService {
  async configureHandler(): Promise<void> {
    if (Platform.OS === "web" || isRunningInExpoGo()) return;

    const Notifications = await import("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  async cancelReminders(): Promise<void> {
    if (Platform.OS === "web" || isRunningInExpoGo()) return;

    const Notifications = await import("expo-notifications");
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async scheduleReminders(settings: WaterSettings): Promise<boolean> {
    await this.cancelReminders();
    if (!settings.remindersEnabled) return true;

    if (Platform.OS === "web" || isRunningInExpoGo()) {
      throw new NotificationUnavailableError();
    }

    const Notifications = await import("expo-notifications");

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Lembretes de hidratação",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    let permission = await Notifications.getPermissionsAsync();
    if (permission.status !== "granted") {
      permission = await Notifications.requestPermissionsAsync();
    }
    if (permission.status !== "granted") return false;

    const start = timeToMinutes(settings.reminderStartTime);
    const end = timeToMinutes(settings.reminderEndTime);
    if (start === null || end === null) {
      throw new Error("Não foi possível interpretar os horários dos lembretes.");
    }

    for (let minutes = start; minutes < end; minutes += settings.reminderIntervalMinutes) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hora de beber água",
          body: "Faça uma pausa e registre um copo de água.",
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: Math.floor(minutes / 60),
          minute: minutes % 60,
          channelId: CHANNEL_ID,
        },
      });
    }
    return true;
  }
}
