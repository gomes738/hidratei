import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";

import { NotificationService } from "@/model/notificationService";
import { WaterDataSource } from "@/model/waterDataSource";
import { getLocalDateKey } from "@/model/waterEntry";
import { ProfileDataSource } from "@/model/profileDataSource";
import {
  DEFAULT_WATER_SETTINGS,
  validateSettings,
  WaterSettings,
} from "@/model/waterSettings";

export type SettingsState = {
  settings: WaterSettings;
  initialLoading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
};

export type SettingsActions = {
  save: (settings: WaterSettings) => Promise<boolean>;
  goBack: () => void;
  reload: () => Promise<void>;
  redoOnboarding: () => Promise<void>;
};

const dataSource = new WaterDataSource();
const notificationService = new NotificationService();
const profileDataSource = new ProfileDataSource();

export function useSettingsViewModel(): [SettingsState, SettingsActions] {
  const [state, setState] = useState<SettingsState>({
    settings: DEFAULT_WATER_SETTINGS,
    initialLoading: true,
    saving: false,
    error: null,
    success: null,
  });

  const reload = useCallback(async () => {
    try {
      setState((current) => ({ ...current, error: null }));
      const settings = await dataSource.getSettings();
      setState((current) => ({
        ...current,
        settings,
        initialLoading: false,
        error: null,
      }));
    } catch (err: unknown) {
      setState((current) => ({
        ...current,
        initialLoading: false,
        error: err instanceof Error ? err.message : "Não foi possível carregar as configurações.",
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  async function save(settings: WaterSettings): Promise<boolean> {
    const normalized = { ...settings, dailyGoal: Math.round(settings.dailyGoal) };
    const validationError = validateSettings(normalized);
    if (validationError) {
      setState((current) => ({ ...current, error: validationError, success: null }));
      return false;
    }

    try {
      setState((current) => ({ ...current, saving: true, error: null, success: null }));
      await Promise.all([
        dataSource.saveSettings(normalized),
        dataSource.saveGoalForDate(getLocalDateKey(), normalized.dailyGoal),
      ]);
      const permissionGranted = await notificationService.scheduleReminders(normalized);
      setState({
        settings: normalized,
        initialLoading: false,
        saving: false,
        error: permissionGranted
          ? null
          : "Configurações salvas, mas a permissão de notificações foi negada.",
        success: permissionGranted ? "Configurações salvas com sucesso!" : null,
      });
      return permissionGranted;
    } catch (err: unknown) {
      setState((current) => ({
        ...current,
        saving: false,
        error: err instanceof Error ? err.message : "Não foi possível salvar as configurações.",
      }));
      return false;
    }
  }

  async function redoOnboarding(): Promise<void> {
    try {
      await profileDataSource.resetOnboarding();
      router.replace("/onboarding");
    } catch (err: unknown) {
      setState((current) => ({
        ...current,
        error: err instanceof Error ? err.message : "Não foi possível reiniciar a configuração.",
      }));
    }
  }

  return [state, { save, goBack: () => router.back(), reload, redoOnboarding }];
}
