import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Divider,
  RadioButton,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';
import { USER_ROLES } from '../../constants/api';

type Props = NativeStackScreenProps<any, 'UserDetails'>;

const UserDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params || {};

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateData, setUpdateData] = useState({
    username: '',
    email: '',
    rollNumber: '',
    mobileNumber: '',
    role: 'STUDENT',
    height: '',
    weight: '',
    firstName: '',
    lastName: '',
    active: true,
  });

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getUserById(userId);

      if (response.data) {
        setUser(response.data);
        setUpdateData({
          username: (response.data as any).username || '',
          email: (response.data as any).email || '',
          rollNumber: (response.data as any).rollNumber || '',
          mobileNumber: (response.data as any).mobileNumber || '',
          role: (response.data as any).role || 'STUDENT',
          height: ((response.data as any).height || 0).toString(),
          weight: ((response.data as any).weight || 0).toString(),
          firstName: (response.data as any).firstName || '',
          lastName: (response.data as any).lastName || '',
          active: (response.data as any).active !== false,
        });
      } else {
        Alert.alert('Error', 'Failed to load user details');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!updateData.username || !updateData.email || !updateData.rollNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiService.updateUser(userId, {
        ...updateData,
        height: parseFloat(updateData.height),
        weight: parseFloat(updateData.weight),
      });

      if (response.data) {
        Alert.alert('Success', 'User updated successfully');
        setUser(response.data);
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update user');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateUser = () => {
    Alert.alert(
      'Confirm Deactivation',
      'Are you sure you want to deactivate this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await ApiService.deactivateUser(userId);

              if (response.data) {
                Alert.alert('Success', 'User deactivated successfully');
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to deactivate user');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading && !user) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Title style={styles.title}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username}
                </Title>
                <View style={styles.headerButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => setIsEditing(!isEditing)}
                    style={styles.editButton}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                  {!isEditing && (
                    <Button
                      mode="outlined"
                      onPress={handleDeactivateUser}
                      style={[styles.editButton, styles.deactivateButton]}
                      textColor="#e74c3c"
                    >
                      Deactivate
                    </Button>
                  )}
                </View>
              </View>

              {isEditing ? (
                <View>
                  <TextInput
                    label="Username"
                    value={updateData.username}
                    onChangeText={(text) => setUpdateData(prev => ({ ...prev, username: text }))}
                    mode="outlined"
                    style={styles.input}
                  />

                  <TextInput
                    label="Email"
                    value={updateData.email}
                    onChangeText={(text) => setUpdateData(prev => ({ ...prev, email: text }))}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                  />

                  <TextInput
                    label="Roll Number"
                    value={updateData.rollNumber}
                    onChangeText={(text) => setUpdateData(prev => ({ ...prev, rollNumber: text }))}
                    mode="outlined"
                    style={styles.input}
                  />

                  <TextInput
                    label="Mobile Number"
                    value={updateData.mobileNumber}
                    onChangeText={(text) => setUpdateData(prev => ({ ...prev, mobileNumber: text }))}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.label}>Role</Text>
                  <RadioButton.Group
                    onValueChange={(value) => setUpdateData(prev => ({ ...prev, role: value }))}
                    value={updateData.role}
                  >
                    {Object.values(USER_ROLES).map((role) => (
                      <View key={role} style={styles.radioItem}>
                        <RadioButton value={role} />
                        <Text style={styles.radioLabel}>{role}</Text>
                      </View>
                    ))}
                  </RadioButton.Group>

                  <View style={styles.row}>
                    <TextInput
                      label="Height (cm)"
                      value={updateData.height}
                      onChangeText={(text) => setUpdateData(prev => ({ ...prev, height: text }))}
                      mode="outlined"
                      style={[styles.input, styles.halfInput]}
                      keyboardType="numeric"
                    />
                    <TextInput
                      label="Weight (kg)"
                      value={updateData.weight}
                      onChangeText={(text) => setUpdateData(prev => ({ ...prev, weight: text }))}
                      mode="outlined"
                      style={[styles.input, styles.halfInput]}
                      keyboardType="numeric"
                    />
                  </View>

                  <TextInput
                    label="First Name"
                    value={updateData.firstName}
                    onChangeText={(text) => setUpdateData(prev => ({ ...prev, firstName: text }))}
                    mode="outlined"
                    style={styles.input}
                  />

                  <TextInput
                    label="Last Name"
                    value={updateData.lastName}
                    onChangeText={(text) => setUpdateData(prev => ({ ...prev, lastName: text }))}
                    mode="outlined"
                    style={styles.input}
                  />

                  <Button
                    mode="contained"
                    onPress={handleUpdateUser}
                    style={styles.button}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update User'}
                  </Button>
                </View>
              ) : (
                <View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Username:</Text>
                    <Text style={styles.value}>{user?.username}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Roll Number:</Text>
                    <Text style={styles.value}>{user?.rollNumber}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Mobile Number:</Text>
                    <Text style={styles.value}>{user?.mobileNumber}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Role:</Text>
                    <Text style={styles.value}>{user?.role}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Height/Weight:</Text>
                    <Text style={styles.value}>{user?.height}cm / {user?.weight}kg</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={[
                      styles.value,
                      user?.active ? styles.active : styles.inactive
                    ]}>
                      {user?.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Account Status:</Text>
                    <Text style={styles.value}>
                      {user?.accountNonExpired && user?.credentialsNonExpired && user?.accountNonLocked
                        ? 'All Good'
                        : 'Issues Found'}
                    </Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: responsive.padding.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    elevation: 4,
    borderRadius: responsive.borderRadius.lg,
  },
  header: {
    marginBottom: responsive.margin.lg,
  },
  title: {
    fontSize: responsive.fontSize.xl,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.md,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  editButton: {
    marginLeft: responsive.margin.sm,
  },
  deactivateButton: {
    borderColor: '#e74c3c',
  },
  input: {
    marginBottom: responsive.margin.md,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: responsive.margin.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: responsive.margin.xs,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.margin.sm,
  },
  radioLabel: {
    fontSize: responsive.fontSize.md,
    marginLeft: responsive.margin.sm,
  },
  button: {
    paddingVertical: responsive.padding.sm,
    marginTop: responsive.margin.lg,
  },
  infoRow: {
    marginBottom: responsive.margin.md,
  },
  value: {
    fontSize: responsive.fontSize.md,
    color: '#2c3e50',
  },
  active: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  inactive: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen;
