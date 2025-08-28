import { UserPreferences } from '../types';

const DEFAULT_PREFERENCES: UserPreferences = {
  dashboard: {
    defaultTimeRange: '7d',
    refreshInterval: 30000, // 30 seconds
    showChangeIndicators: true
  }
};

export const getUserPreferences = (): UserPreferences => {
  try {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed.preferences
      };
    }
  } catch (error) {
    console.error('Failed to load user preferences:', error);
  }
  
  return DEFAULT_PREFERENCES;
};

export const saveUserPreferences = (preferences: UserPreferences): void => {
  try {
    const savedSettings = localStorage.getItem('appSettings');
    const currentSettings = savedSettings ? JSON.parse(savedSettings) : {};
    
    const updatedSettings = {
      ...currentSettings,
      preferences
    };
    
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
};

export const getDashboardPreferences = () => {
  return getUserPreferences().dashboard;
};
