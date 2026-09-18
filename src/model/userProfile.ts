export type ProfileType = "male" | "female";

export type UserProfile = {
  profileType: ProfileType;
  weight: number;
  wakeUpTime: string;
  sleepTime: string;
  dailyGoal: number;
  onboardingCompleted: boolean;
};

export function estimateDailyGoal(weight: number): number {
  return Math.round((weight * 35) / 50) * 50;
}
