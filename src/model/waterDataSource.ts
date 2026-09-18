import AsyncStorage from "@react-native-async-storage/async-storage";

import { WaterEntry } from "@/model/waterEntry";
import { DEFAULT_WATER_SETTINGS, WaterSettings } from "@/model/waterSettings";

const ENTRIES_KEY = "@hidratei:entries";
const SETTINGS_KEY = "@hidratei:settings";
const DAILY_GOALS_KEY = "@hidratei:daily-goals";

export class WaterDataSource {
  async getEntries(): Promise<WaterEntry[]> {
    const stored = await AsyncStorage.getItem(ENTRIES_KEY);
    return stored ? (JSON.parse(stored) as WaterEntry[]) : [];
  }

  async saveEntries(entries: WaterEntry[]): Promise<void> {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  async getSettings(): Promise<WaterSettings> {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_WATER_SETTINGS;
    return { ...DEFAULT_WATER_SETTINGS, ...(JSON.parse(stored) as Partial<WaterSettings>) };
  }

  async saveSettings(settings: WaterSettings): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  async getDailyGoals(): Promise<Record<string, number>> {
    const stored = await AsyncStorage.getItem(DAILY_GOALS_KEY);
    return stored ? (JSON.parse(stored) as Record<string, number>) : {};
  }

  async saveGoalForDate(date: string, goal: number): Promise<void> {
    const goals = await this.getDailyGoals();
    goals[date] = goal;
    await AsyncStorage.setItem(DAILY_GOALS_KEY, JSON.stringify(goals));
  }
}
