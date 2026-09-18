import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";

import { WaterDataSource } from "@/model/waterDataSource";

export type HistoryDay = {
  date: string;
  consumed: number;
  goal: number;
  percentage: number;
  completed: boolean;
};

export type HistoryState = {
  days: HistoryDay[];
  initialLoading: boolean;
  error: string | null;
};

export type HistoryActions = {
  goBack: () => void;
  reload: () => Promise<void>;
};

const dataSource = new WaterDataSource();

export function useHistoryViewModel(): [HistoryState, HistoryActions] {
  const [state, setState] = useState<HistoryState>({ days: [], initialLoading: true, error: null });

  const reload = useCallback(async () => {
    try {
      setState((current) => ({ ...current, error: null }));
      const [entries, settings, goals] = await Promise.all([
        dataSource.getEntries(),
        dataSource.getSettings(),
        dataSource.getDailyGoals(),
      ]);
      const totals = entries.reduce<Record<string, number>>((result, entry) => {
        result[entry.date] = (result[entry.date] ?? 0) + entry.amount;
        return result;
      }, {});
      const days = Object.entries(totals)
        .map(([date, consumed]) => {
          const goal = goals[date] ?? settings.dailyGoal;
          return {
            date,
            consumed,
            goal,
            percentage: (consumed / goal) * 100,
            completed: consumed >= goal,
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date));
      setState({ days, initialLoading: false, error: null });
    } catch (err: unknown) {
      setState((current) => ({
        ...current,
        initialLoading: false,
        error: err instanceof Error ? err.message : "Não foi possível carregar o histórico.",
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return [state, { goBack: () => router.back(), reload }];
}
