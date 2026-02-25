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
  Checkbox,
  Card,
  Title,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { responsive } from '../../utils/dimensions';
import StorageService from '../../utils/storage';

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  React.useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const remember = await StorageService.getRememberMe();
      if (remember) {
        const credentials = await StorageService.getUserCredentials();
        if (credentials) {
          setIdentifier(credentials.identifier);
          setPassword(credentials.password);
          setRememberMe(true);
        }
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both identifier and password');
      return;
    }

    try {
      setIsLoading(true);

      // Save credentials if remember me is checked
      if (rememberMe) {
        await StorageService.setUserCredentials({ identifier, password });
        await StorageService.setRememberMe(true);
      } else {
        await StorageService.removeUserCredentials();
        await StorageService.setRememberMe(false);
      }

      const result = await login(identifier, password);

      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'An error occurred during login');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.title}>Campus Health System</Title>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <TextInput
              label="Username, Email, or Roll Number"
              value={identifier}
              onChangeText={setIdentifier}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              disabled={isLoading}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
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

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                disabled={isLoading}
              />
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </View>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Button
              mode="text"
              onPress={navigateToSignup}
              style={styles.signupButton}
              disabled={isLoading}
            >
              Don't have an account? Sign Up
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
    justifyContent: 'center',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.margin.lg,
  },
  checkboxLabel: {
    marginLeft: responsive.margin.sm,
    fontSize: responsive.fontSize.sm,
    color: '#555',
  },
  loginButton: {
    paddingVertical: responsive.padding.sm,
    marginBottom: responsive.margin.md,
  },
  signupButton: {
    marginTop: responsive.margin.sm,
  },
});

export default LoginScreen;
