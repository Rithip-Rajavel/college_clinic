import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity, Switch, FlatList } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  List,
  Divider,
  RadioButton,
  TouchableRipple,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { responsive } from '../../utils/dimensions';
import StorageService from '../../utils/storage';

const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    autoLogin: false,
    biometricAuth: false,
    dataSync: true,
    crashReporting: true,
    analytics: true,
    language: 'english',
    fontSize: 'medium',
    autoBackup: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = async (key: string, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await StorageService.saveSettings(newSettings);
    } catch (error) {
      console.error('Error saving setting:', error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const defaultSettings = {
                notifications: true,
                emailNotifications: true,
                pushNotifications: false,
                darkMode: false,
                autoLogin: false,
                biometricAuth: false,
                dataSync: true,
                crashReporting: true,
                analytics: true,
                language: 'english',
                fontSize: 'medium',
                autoBackup: true,
              };
              setSettings(defaultSettings);
              await StorageService.saveSettings(defaultSettings);
              Alert.alert('Success', 'Settings reset to defaults');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data including preferences, cache, and stored information. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAll();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all your data in JSON format for backup purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              const data = {
                settings,
                user,
                timestamp: new Date().toISOString(),
              };
              // In a real app, this would save to a file or share
              console.log('Export data:', data);
              Alert.alert('Success', 'Data exported successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to export data');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to login again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', 'You have been logged out successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const languageOptions = [
    { label: 'English', value: 'english' },
    { label: 'Spanish', value: 'spanish' },
    { label: 'French', value: 'french' },
    { label: 'German', value: 'german' },
    { label: 'Chinese', value: 'chinese' },
  ];

  const fontSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'xlarge' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Title style={styles.title}>Settings</Title>
      <Paragraph style={styles.subtitle}>
        Customize your app experience and preferences
      </Paragraph>

      {/* Notifications */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Notifications</Title>

          <List.Item
            title="Push Notifications"
            description="Receive push notifications on your device"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
              />
            )}
          />

          <List.Item
            title="Email Notifications"
            description="Receive email notifications for important updates"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={() => (
              <Switch
                value={settings.emailNotifications}
                onValueChange={(value) => handleSettingChange('emailNotifications', value)}
              />
            )}
          />

          <List.Item
            title="In-App Notifications"
            description="Show notifications while using the app"
            left={(props) => <List.Icon {...props} icon="bell-ring" />}
            right={() => (
              <Switch
                value={settings.pushNotifications}
                onValueChange={(value) => handleSettingChange('pushNotifications', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Appearance */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Appearance</Title>

          <List.Item
            title="Dark Mode"
            description="Use dark theme throughout the app"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
              />
            )}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Font Size</Text>
            {fontSizeOptions.map((option) => (
              <TouchableRipple
                key={option.value}
                onPress={() => handleSettingChange('fontSize', option.value)}
                style={styles.optionItem}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <RadioButton
                    value={settings.fontSize}
                    status={settings.fontSize === option.value ? 'checked' : 'unchecked'}
                  />
                </View>
              </TouchableRipple>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Privacy & Security */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Privacy & Security</Title>

          <List.Item
            title="Auto Login"
            description="Automatically login when opening the app"
            left={(props) => <List.Icon {...props} icon="login" />}
            right={() => (
              <Switch
                value={settings.autoLogin}
                onValueChange={(value) => handleSettingChange('autoLogin', value)}
              />
            )}
          />

          <List.Item
            title="Biometric Authentication"
            description="Use fingerprint or face recognition to login"
            left={(props) => <List.Icon {...props} icon="fingerprint" />}
            right={() => (
              <Switch
                value={settings.biometricAuth}
                onValueChange={(value) => handleSettingChange('biometricAuth', value)}
              />
            )}
          />

          <List.Item
            title="Data Sync"
            description="Automatically sync data across devices"
            left={(props) => <List.Icon {...props} icon="sync" />}
            right={() => (
              <Switch
                value={settings.dataSync}
                onValueChange={(value) => handleSettingChange('dataSync', value)}
              />
            )}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Logout"
            description="Sign out of your account"
            left={(props) => <List.Icon {...props} icon="logout" />}
            onPress={handleLogout}
            style={styles.dangerItem}
          />
        </Card.Content>
      </Card>

      {/* Language */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Language</Title>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Language</Text>
            {languageOptions.map((option) => (
              <TouchableRipple
                key={option.value}
                onPress={() => handleSettingChange('language', option.value)}
                style={styles.optionItem}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <RadioButton
                    value={settings.language}
                    status={settings.language === option.value ? 'checked' : 'unchecked'}
                  />
                </View>
              </TouchableRipple>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Data Management */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Data Management</Title>

          <List.Item
            title="Auto Backup"
            description="Automatically backup your data to cloud"
            left={(props) => <List.Icon {...props} icon="cloud-upload" />}
            right={() => (
              <Switch
                value={settings.autoBackup}
                onValueChange={(value) => handleSettingChange('autoBackup', value)}
              />
            )}
          />

          <List.Item
            title="Export Data"
            description="Export your data for backup or migration"
            left={(props) => <List.Icon {...props} icon="download" />}
            onPress={handleExportData}
          />

          <List.Item
            title="Clear Cache"
            description="Clear temporary files and cache"
            left={(props) => <List.Icon {...props} icon="delete-sweep" />}
            onPress={() => console.log('Clear cache')}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Clear All Data"
            description="Permanently delete all app data"
            left={(props) => <List.Icon {...props} icon="delete-forever" />}
            onPress={handleClearAllData}
            style={styles.dangerItem}
          />
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>About</Title>

          <View style={styles.aboutSection}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>App Version:</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>

            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Build:</Text>
              <Text style={styles.aboutValue}>2024.01.15</Text>
            </View>

            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>User Role:</Text>
              <Text style={[styles.aboutValue, { color: getRoleColor(user?.role || '') }]}>
                {user?.role?.replace('_', ' ')}
              </Text>
            </View>

            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Username:</Text>
              <Text style={styles.aboutValue}>{user?.username}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Debug Options */}
      <Card style={[styles.card, styles.debugCard]}>
        <Card.Content>
          <Title style={styles.cardTitle}>Debug Options</Title>

          <List.Item
            title="Crash Reporting"
            description="Help improve the app by reporting crashes"
            left={(props) => <List.Icon {...props} icon="bug-report" />}
            right={() => (
              <Switch
                value={settings.crashReporting}
                onValueChange={(value) => handleSettingChange('crashReporting', value)}
              />
            )}
          />

          <List.Item
            title="Analytics"
            description="Help improve the app with usage analytics"
            left={(props) => <List.Icon {...props} icon="chart-bar" />}
            right={() => (
              <Switch
                value={settings.analytics}
                onValueChange={(value) => handleSettingChange('analytics', value)}
              />
            )}
          />

          <List.Item
            title="Reset Settings"
            description="Reset all settings to default values"
            left={(props) => <List.Icon {...props} icon="restore" />}
            onPress={handleResetSettings}
          />
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Campus Health System v1.0.0
        </Text>
        <Text style={styles.footerText}>
          © 2024 All rights reserved
        </Text>
      </View>
    </ScrollView>
  );
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'STUDENT': return '#3498db';
    case 'STAFF': return '#9b59b6';
    case 'NURSE': return '#e74c3c';
    default: return '#7f8c8d';
  }
};

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: responsive.padding.md,
  },
  title: {
    fontSize: responsive.fontSize.xl,
    color: colors.text,
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: responsive.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: responsive.margin.lg,
  },
  card: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  cardTitle: {
    fontSize: responsive.fontSize.lg,
    color: colors.text,
    marginBottom: responsive.margin.md,
  },
  section: {
    marginBottom: responsive.margin.md,
  },
  sectionTitle: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: responsive.margin.sm,
  },
  optionItem: {
    paddingVertical: responsive.padding.sm,
    paddingHorizontal: responsive.padding.md,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: responsive.fontSize.md,
    color: '#555',
  },
  divider: {
    marginVertical: responsive.margin.sm,
  },
  dangerItem: {
    backgroundColor: '#fff5f5',
  },
  aboutSection: {
    marginBottom: responsive.margin.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.sm,
  },
  aboutLabel: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  aboutValue: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    flex: 2,
    textAlign: 'right',
  },
  debugCard: {
    backgroundColor: colors.surfaceVariant,
    borderColor: '#dee2e6',
    borderWidth: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: responsive.padding.lg,
    marginTop: responsive.margin.xl,
  },
  footerText: {
    fontSize: responsive.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: responsive.margin.xs,
  },
});

export default SettingsScreen;
