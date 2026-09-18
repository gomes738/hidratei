import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { NotificationService } from "@/model/notificationService";

const notificationService = new NotificationService();

export default function RootLayout() {
  useEffect(() => {
    void notificationService.configureHandler().catch(() => undefined);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
