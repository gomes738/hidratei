import { router } from "expo-router";
import { useEffect, useState } from "react";

import { NotificationService } from "@/model/notificationService";
import { ProfileDataSource } from "@/model/profileDataSource";
import { estimateDailyGoal, ProfileType, UserProfile } from "@/model/userProfile";
import { WaterDataSource } from "@/model/waterDataSource";
import { getLocalDateKey } from "@/model/waterEntry";
import { timeToMinutes, WaterSettings } from "@/model/waterSettings";

export type OnboardingState = {
  step: number;
  totalSteps: number;
  profileType: ProfileType | null;
  weight: string;
  wakeUpTime: string;
  sleepTime: string;
  dailyGoal: number;
  initialLoading: boolean;
  saving: boolean;
  error: string | null;
  permissionDialogVisible: boolean;
  permissionNotice: string | null;
};

export type OnboardingActions = {
  next: () => void;
  back: () => void;
  selectProfile: (profile: ProfileType) => void;
  setWeight: (weight: string) => void;
  setWakeUpTime: (time: string) => void;
  setSleepTime: (time: string) => void;
  openPermissionDialog: () => void;
  closePermissionDialog: () => void;
  activateReminders: () => Promise<void>;
  finish: () => void;
};

const profileDataSource = new ProfileDataSource();
const waterDataSource = new WaterDataSource();
const notificationService = new NotificationService();

function formatTimeInput(value: string, previousValue: string): string {
  const deletingSeparator = previousValue.endsWith(":") && value === previousValue.slice(0, -1);
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (deletingSeparator) return digits.slice(0, -1);
  if (digits.length < 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function useOnboardingViewModel(): [OnboardingState, OnboardingActions] {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    totalSteps: 6,
    profileType: null,
    weight: "70",
    wakeUpTime: "06:00",
    sleepTime: "22:00",
    dailyGoal: 2450,
    initialLoading: true,
    saving: false,
    error: null,
    permissionDialogVisible: false,
    permissionNotice: null,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await profileDataSource.getProfile();
        if (profile?.onboardingCompleted) {
          router.replace("/");
          return;
        }
        setState((current) => ({
          ...current,
          profileType: profile?.profileType ?? null,
          weight: profile ? String(profile.weight) : current.weight,
          wakeUpTime: profile?.wakeUpTime ?? current.wakeUpTime,
          sleepTime: profile?.sleepTime ?? current.sleepTime,
          dailyGoal: profile?.dailyGoal ?? current.dailyGoal,
          initialLoading: false,
        }));
      } catch (err: unknown) {
        setState((current) => ({
          ...current,
          initialLoading: false,
          error: err instanceof Error ? err.message : "Não foi possível iniciar a configuração.",
        }));
      }
    }
    void loadProfile();
  }, []);

  function next() {
    let error: string | null = null;
    let dailyGoal = state.dailyGoal;

    if (state.step === 2 && !state.profileType) {
      error = "Escolha uma opção de perfil para continuar.";
    }
    if (state.step === 3) {
      const weight = Number(state.weight.replace(",", "."));
      if (!Number.isFinite(weight) || weight < 20 || weight > 300) {
        error = "Informe um peso entre 20 e 300 kg.";
      } else {
        dailyGoal = estimateDailyGoal(weight);
      }
    }
    if (state.step === 4 && timeToMinutes(state.wakeUpTime) === null) {
      error = "Informe um horário de acordar completo e válido entre 00:00 e 23:59.";
    }
    if (state.step === 5) {
      const wakeUp = timeToMinutes(state.wakeUpTime);
      const sleep = timeToMinutes(state.sleepTime);
      if (sleep === null) {
        error = "Informe um horário de dormir completo e válido entre 00:00 e 23:59.";
      } else if (wakeUp !== null && sleep <= wakeUp) {
        error = "O horário de dormir deve ser posterior ao horário de acordar.";
      }
    }

    if (error) {
      setState((current) => ({ ...current, error }));
      return;
    }
    setState((current) => ({
      ...current,
      step: Math.min(current.step + 1, current.totalSteps),
      dailyGoal,
      error: null,
    }));
  }

  function back() {
    setState((current) => ({ ...current, step: Math.max(current.step - 1, 1), error: null }));
  }

  async function activateReminders(): Promise<void> {
    if (!state.profileType) return;

    try {
      setState((current) => ({ ...current, saving: true, error: null }));
      const requestedSettings: WaterSettings = {
        dailyGoal: state.dailyGoal,
        remindersEnabled: true,
        reminderIntervalMinutes: 60,
        reminderStartTime: state.wakeUpTime,
        reminderEndTime: state.sleepTime,
      };

      let remindersEnabled = false;
      let permissionNotice: string | null = null;
      try {
        remindersEnabled = await notificationService.scheduleReminders(requestedSettings);
        if (!remindersEnabled) {
          permissionNotice = "As notificações não foram permitidas. Você poderá ativá-las depois nas configurações.";
        }
      } catch (err: unknown) {
        permissionNotice = err instanceof Error
          ? err.message
          : "Os lembretes não puderam ser ativados agora. Você poderá tentar novamente nas configurações.";
      }

      const settings = { ...requestedSettings, remindersEnabled };
      const profile: UserProfile = {
        profileType: state.profileType,
        weight: Number(state.weight.replace(",", ".")),
        wakeUpTime: state.wakeUpTime,
        sleepTime: state.sleepTime,
        dailyGoal: state.dailyGoal,
        onboardingCompleted: true,
      };
      await Promise.all([
        profileDataSource.saveProfile(profile),
        waterDataSource.saveSettings(settings),
        waterDataSource.saveGoalForDate(getLocalDateKey(), state.dailyGoal),
      ]);

      if (permissionNotice) {
        setState((current) => ({
          ...current,
          saving: false,
          permissionDialogVisible: false,
          permissionNotice,
        }));
      } else {
        router.replace("/");
      }
    } catch (err: unknown) {
      setState((current) => ({
        ...current,
        saving: false,
        permissionDialogVisible: false,
        error: err instanceof Error ? err.message : "Não foi possível salvar seu plano.",
      }));
    }
  }

  return [
    state,
    {
      next,
      back,
      selectProfile: (profileType) => setState((current) => ({ ...current, profileType, error: null })),
      setWeight: (weight) => setState((current) => ({ ...current, weight, error: null })),
      setWakeUpTime: (wakeUpTime) => setState((current) => ({
        ...current,
        wakeUpTime: formatTimeInput(wakeUpTime, current.wakeUpTime),
        error: null,
      })),
      setSleepTime: (sleepTime) => setState((current) => ({
        ...current,
        sleepTime: formatTimeInput(sleepTime, current.sleepTime),
        error: null,
      })),
      openPermissionDialog: () => setState((current) => ({ ...current, permissionDialogVisible: true })),
      closePermissionDialog: () => setState((current) => ({ ...current, permissionDialogVisible: false })),
      activateReminders,
      finish: () => router.replace("/"),
    },
  ];
}
