import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserProfile } from "@/model/userProfile";

const PROFILE_KEY = "@hidratei:user-profile";

export class ProfileDataSource {
  async getProfile(): Promise<UserProfile | null> {
    const stored = await AsyncStorage.getItem(PROFILE_KEY);
    return stored ? (JSON.parse(stored) as UserProfile) : null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  async isOnboardingCompleted(): Promise<boolean> {
    const profile = await this.getProfile();
    return profile?.onboardingCompleted === true;
  }

  async resetOnboarding(): Promise<void> {
    const profile = await this.getProfile();
    if (profile) {
      await this.saveProfile({ ...profile, onboardingCompleted: false });
    }
  }
}
