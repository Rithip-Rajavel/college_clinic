import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  REMEMBER_ME: '@remember_me',
  USER_CREDENTIALS: '@user_credentials',
  THEME: '@theme',
  LANGUAGE: '@language',
  FIRST_LAUNCH: '@first_launch',
  HEALTH_METRICS_CACHE: '@health_metrics_cache',
  APPOINTMENTS_CACHE: '@appointments_cache',
  SETTINGS: '@settings',
};

export class StorageService {
  // Auth related storage
  static async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw error;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  static async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw error;
    }
  }

  // User data storage
  static async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  static async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  }

  // Remember me functionality
  static async setRememberMe(remember: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(remember));
    } catch (error) {
      console.error('Error setting remember me:', error);
      throw error;
    }
  }

  static async getRememberMe(): Promise<boolean> {
    try {
      const remember = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return remember ? JSON.parse(remember) : false;
    } catch (error) {
      console.error('Error getting remember me:', error);
      return false;
    }
  }

  // User credentials for auto-fill
  static async setUserCredentials(credentials: { identifier: string; password: string }): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(credentials));
    } catch (error) {
      console.error('Error storing user credentials:', error);
      throw error;
    }
  }

  static async getUserCredentials(): Promise<{ identifier: string; password: string } | null> {
    try {
      const credentials = await AsyncStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('Error getting user credentials:', error);
      return null;
    }
  }

  static async removeUserCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_CREDENTIALS);
    } catch (error) {
      console.error('Error removing user credentials:', error);
      throw error;
    }
  }

  // Cache management
  static async setHealthMetricsCache(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_METRICS_CACHE, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching health metrics:', error);
      throw error;
    }
  }

  static async getHealthMetricsCache(): Promise<any | null> {
    try {
      const cache = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_METRICS_CACHE);
      return cache ? JSON.parse(cache) : null;
    } catch (error) {
      console.error('Error getting health metrics cache:', error);
      return null;
    }
  }

  static async setAppointmentsCache(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS_CACHE, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching appointments:', error);
      throw error;
    }
  }

  static async getAppointmentsCache(): Promise<any | null> {
    try {
      const cache = await AsyncStorage.getItem(STORAGE_KEYS.APPOINTMENTS_CACHE);
      return cache ? JSON.parse(cache) : null;
    } catch (error) {
      console.error('Error getting appointments cache:', error);
      return null;
    }
  }

  // Settings management
  static async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  static async getSettings(): Promise<any | null> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  // Clear all storage (for logout)
  static async clearAllStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Clear all data (alias for clearAllStorage)
  static async clearAll(): Promise<void> {
    return this.clearAllStorage();
  }

  // Check first launch
  static async isFirstLaunch(): Promise<boolean> {
    try {
      const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      return firstLaunch === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return true;
    }
  }

  static async setFirstLaunchComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
    } catch (error) {
      console.error('Error setting first launch complete:', error);
      throw error;
    }
  }
}

export default StorageService;
