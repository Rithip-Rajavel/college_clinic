import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  TextInput,
  Avatar,
  Divider,
  List,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { responsive, widthScale } from '../../utils/dimensions';
import StorageService from '../../utils/storage';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    height: '',
    weight: '',
  });

  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      // Simulate profile update
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all locally stored data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllStorage();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT': return '🎓';
      case 'STAFF': return '👨‍💼';
      case 'NURSE': return '⚕️';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT': return '#3498db';
      case 'STAFF': return '#9b59b6';
      case 'NURSE': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Avatar.Text
          size={widthScale(80)}
          style={[styles.avatar, { backgroundColor: getRoleColor(user?.role || '') }]}
          label={(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
        />
        <View style={styles.headerInfo}>
          <Title style={styles.userName}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.username
            }
          </Title>
          <View style={styles.roleContainer}>
            <Text style={styles.roleIcon}>{getRoleIcon(user?.role || '')}</Text>
            <Text style={[styles.roleText, { color: getRoleColor(user?.role || '') }]}>
              {user?.role?.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>Personal Information</Title>
            <Button
              mode="text"
              onPress={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username:</Text>
              <Text style={styles.infoValue}>{user?.username}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Roll Number:</Text>
              <Text style={styles.infoValue}>{user?.rollNumber}</Text>
            </View>

            {isEditing ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>First Name:</Text>
                  <TextInput
                    value={editData.firstName}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, firstName: text }))}
                    mode="outlined"
                    style={styles.input}
                    dense
                  />
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Name:</Text>
                  <TextInput
                    value={editData.lastName}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, lastName: text }))}
                    mode="outlined"
                    style={styles.input}
                    dense
                  />
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <TextInput
                    value={editData.email}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))}
                    mode="outlined"
                    style={styles.input}
                    dense
                  />
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mobile:</Text>
                  <TextInput
                    value={editData.mobileNumber}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, mobileNumber: text }))}
                    mode="outlined"
                    style={styles.input}
                    dense
                  />
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Height (cm):</Text>
                  <TextInput
                    value={editData.height}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, height: text }))}
                    mode="outlined"
                    style={styles.input}
                    dense
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weight (kg):</Text>
                  <TextInput
                    value={editData.weight}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, weight: text }))}
                    mode="outlined"
                    style={styles.input}
                    dense
                    keyboardType="numeric"
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  style={styles.saveButton}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : 'Not set'
                    }
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mobile:</Text>
                  <Text style={styles.infoValue}>{user?.mobileNumber || 'Not set'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Height:</Text>
                  <Text style={styles.infoValue}>{user?.height ? `${user.height} cm` : 'Not set'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weight:</Text>
                  <Text style={styles.infoValue}>{user?.weight ? `${user.weight} kg` : 'Not set'}</Text>
                </View>
              </>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Account Information</Title>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type:</Text>
              <Text style={styles.infoValue}>{user?.role?.replace('_', ' ')}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { color: user?.active ? '#27ae60' : '#e74c3c' }]}>
                {user?.active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Settings</Title>

          <List.Item
            title="Change Password"
            description="Update your account password"
            left={(props) => <List.Icon {...props} icon="lock" />}
            onPress={() => console.log('Change password')}
          />

          <List.Item
            title="Notification Preferences"
            description="Manage your notification settings"
            left={(props) => <List.Icon {...props} icon="bell" />}
            onPress={() => console.log('Notification settings')}
          />

          <List.Item
            title="Privacy Settings"
            description="Manage your privacy and data settings"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            onPress={() => console.log('Privacy settings')}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Clear Cache"
            description="Clear locally stored data"
            left={(props) => <List.Icon {...props} icon="delete-sweep" />}
            onPress={handleClearCache}
          />

          <List.Item
            title="Help & Support"
            description="Get help with the app"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            onPress={() => console.log('Help and support')}
          />

          <List.Item
            title="About"
            description="App version and information"
            left={(props) => <List.Icon {...props} icon="information" />}
            onPress={() => console.log('About')}
          />
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.dangerCard]}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: responsive.padding.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: responsive.margin.xl,
    paddingVertical: responsive.padding.lg,
  },
  avatar: {
    marginBottom: responsive.margin.md,
  },
  headerInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: responsive.fontSize.lg,
    marginRight: responsive.margin.xs,
  },
  roleText: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.md,
  },
  cardTitle: {
    fontSize: responsive.fontSize.lg,
    color: '#2c3e50',
  },
  infoSection: {
    marginBottom: responsive.margin.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.md,
  },
  infoLabel: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  infoValue: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    flex: 2,
    textAlign: 'right',
  },
  input: {
    flex: 2,
  },
  saveButton: {
    marginTop: responsive.margin.md,
    backgroundColor: '#3498db',
  },
  divider: {
    marginVertical: responsive.margin.sm,
  },
  dangerCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffcdd2',
    borderWidth: 1,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
});

export default ProfileScreen;
