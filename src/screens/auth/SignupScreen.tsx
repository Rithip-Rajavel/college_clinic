import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DropdownComponent from '../../components/common/DropdownComponent';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants/api';
import { responsive } from '../../utils/dimensions';

interface SignupScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    rollNumber: '',
    mobileNumber: '',
    role: '',
    height: '',
    weight: '',
    firstName: '',
    lastName: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup } = useAuth();

  const roleOptions = [
    { label: 'Student', value: USER_ROLES.STUDENT },
    { label: 'Staff', value: USER_ROLES.STAFF },
    { label: 'Nurse (Admin)', value: USER_ROLES.NURSE },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const {
      username,
      password,
      confirmPassword,
      email,
      rollNumber,
      mobileNumber,
      role,
      height,
      weight,
    } = formData;

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Valid email is required');
      return false;
    }

    if (!rollNumber.trim()) {
      Alert.alert('Error', 'Roll number is required');
      return false;
    }

    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      Alert.alert('Error', 'Valid mobile number is required');
      return false;
    }

    if (!role) {
      Alert.alert('Error', 'Please select a role');
      return false;
    }

    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      Alert.alert('Error', 'Valid height is required');
      return false;
    }

    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      Alert.alert('Error', 'Valid weight is required');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const signupData = {
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        rollNumber: formData.rollNumber.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        role: formData.role,
        height: Number(formData.height),
        weight: Number(formData.weight),
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
      };

      const result = await signup(signupData);

      if (!result.success) {
        Alert.alert('Signup Failed', result.error || 'An error occurred during signup');
      }
    } catch (error) {
      Alert.alert('Signup Failed', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.title}>Create Account</Title>
            <Text style={styles.subtitle}>Join the Campus Health System</Text>

            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              disabled={isLoading}
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              disabled={isLoading}
            />

            <TextInput
              label="Roll Number"
              value={formData.rollNumber}
              onChangeText={(value) => handleInputChange('rollNumber', value)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="characters"
              disabled={isLoading}
            />

            <TextInput
              label="Mobile Number"
              value={formData.mobileNumber}
              onChangeText={(value) => handleInputChange('mobileNumber', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              disabled={isLoading}
            />

            <DropdownComponent
              label="Role"
              data={roleOptions}
              value={formData.role}
              onChange={(value) => handleInputChange('role', value)}
              placeholder="Select your role"
              disabled={isLoading}
            />

            <View style={styles.row}>
              <TextInput
                label="Height (cm)"
                value={formData.height}
                onChangeText={(value) => handleInputChange('height', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                disabled={isLoading}
              />

              <TextInput
                label="Weight (kg)"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                disabled={isLoading}
              />
            </View>

            <TextInput
              label="First Name (Optional)"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              mode="outlined"
              style={styles.input}
              disabled={isLoading}
            />

            <TextInput
              label="Last Name (Optional)"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              mode="outlined"
              style={styles.input}
              disabled={isLoading}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              disabled={isLoading}
            />

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              disabled={isLoading}
            />

            <Button
              mode="contained"
              onPress={handleSignup}
              style={styles.signupButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Button
              mode="text"
              onPress={navigateToLogin}
              style={styles.loginButton}
              disabled={isLoading}
            >
              Already have an account? Sign In
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: responsive.padding.lg,
  },
  card: {
    elevation: 4,
    borderRadius: responsive.borderRadius.lg,
  },
  cardContent: {
    padding: responsive.padding.lg,
  },
  title: {
    textAlign: 'center',
    fontSize: responsive.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: responsive.margin.sm,
    color: '#2c3e50',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: responsive.fontSize.md,
    marginBottom: responsive.margin.xl,
    color: '#7f8c8d',
  },
  input: {
    marginBottom: responsive.margin.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: responsive.margin.xs,
  },
  signupButton: {
    paddingVertical: responsive.padding.sm,
    marginBottom: responsive.margin.md,
  },
  loginButton: {
    marginTop: responsive.margin.sm,
  },
});

export default SignupScreen;
