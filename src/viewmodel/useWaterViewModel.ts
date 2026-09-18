import { useFocusEffect, router } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { createWaterEntry, getLocalDateKey, WaterEntry } from "@/model/waterEntry";
import { WaterDataSource } from "@/model/waterDataSource";
import { ProfileDataSource } from "@/model/profileDataSource";

export type WaterState = {
  consumed: number;
  goal: number;
  remaining: number;
  percentage: number;
  entries: WaterEntry[];
  initialLoading: boolean;
  saving: boolean;
  error: string | null;
};

export type WaterActions = {
  addWater: (amount: number) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  openHistory: () => void;
  openSettings: () => void;
  reload: () => Promise<void>;
};

const dataSource = new WaterDataSource();
const profileDataSource = new ProfileDataSource();

const INITIAL_STATE: WaterState = {
  consumed: 0,
  goal: 2000,
  remaining: 2000,
  percentage: 0,
  entries: [],
  initialLoading: true,
  saving: false,
  error: null,
};

export function useWaterViewModel(): [WaterState, WaterActions] {
  const [state, setState] = useState<WaterState>(INITIAL_STATE);
  const savingRef = useRef(false);

  const reload = useCallback(async () => {
    try {
      setState((current) => ({ ...current, error: null }));
      const onboardingCompleted = await profileDataSource.isOnboardingCompleted();
      if (!onboardingCompleted) {
        router.replace("/onboarding");
        return;
      }
      const [allEntries, settings] = await Promise.all([
        dataSource.getEntries(),
        dataSource.getSettings(),
      ]);
      const today = getLocalDateKey();
      const entries = allEntries
        .filter((entry) => entry.date === today)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const consumed = entries.reduce((total, entry) => total + entry.amount, 0);
      const percentage = (consumed / settings.dailyGoal) * 100;
      setState((current) => ({
        ...current,
        consumed,
        goal: settings.dailyGoal,
        remaining: Math.max(settings.dailyGoal - consumed, 0),
        percentage,
        entries,
        initialLoading: false,
        error: null,
      }));
    } catch (err: unknown) {
      setState((current) => ({
        ...current,
        initialLoading: false,
        error: err instanceof Error ? err.message : "Não foi possível carregar os dados.",
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  async function addWater(amount: number): Promise<void> {
    if (savingRef.current) return;
    savingRef.current = true;
    setState((current) => ({ ...current, saving: true, error: null }));
    try {
      const entry = createWaterEntry(amount);
      const [entries, settings] = await Promise.all([
        dataSource.getEntries(),
        dataSource.getSettings(),
      ]);
      await Promise.all([
        dataSource.saveEntries([...entries, entry]),
        dataSource.saveGoalForDate(entry.date, settings.dailyGoal),
      ]);
      await reload();
    } catch (err: unknown) {
      setState((current) => ({
        ...current,
        error: err instanceof Error ? err.message : "Não foi possível registrar a água.",
      }));
    } finally {
      savingRef.current = false;
      setState((current) => ({ ...current, saving: false }));
    }
  }

  async function removeEntry(id: string): Promise<void> {
    if (savingRef.current) return;
    savingRef.current = true;
    setState((current) => ({ ...current, saving: true, error: null }));
    try {
      const entries = await dataSource.getEntries();
      await dataSource.saveEntries(entries.filter((entry) => entry.id !== id));
      await reload();
    } catch (err: unknown) {
      setState((current) => ({
        ...current,
        error: err instanceof Error ? err.message : "Não foi possível excluir o registro.",
      }));
    } finally {
      savingRef.current = false;
      setState((current) => ({ ...current, saving: false }));
    }
  }

  return [
    state,
    {
      addWater,
      removeEntry,
      openHistory: () => router.push("/historico"),
      openSettings: () => router.push("/configuracoes"),
      reload,
    },
  ];
}
