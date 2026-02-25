import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../constants/api';
import { responsive } from '../utils/dimensions';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Student Screens
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import StudentAppointmentsScreen from '../screens/student/StudentAppointmentsScreen';
import StudentHealthMetricsScreen from '../screens/student/StudentHealthMetricsScreen';
import StudentHealthResourcesScreen from '../screens/student/StudentHealthResourcesScreen';

// Staff Screens
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffAppointmentsScreen from '../screens/staff/StaffAppointmentsScreen';
import StaffPrescriptionsScreen from '../screens/staff/StaffPrescriptionsScreen';
import StaffHealthResourcesScreen from '../screens/staff/StaffHealthResourcesScreen';

// Nurse Screens
import NurseDashboardScreen from '../screens/nurse/NurseDashboardScreen';
import NurseAppointmentsScreen from '../screens/nurse/NurseAppointmentsScreen';
import NurseUsersScreen from '../screens/nurse/NurseUsersScreen';
import NurseInventoryScreen from '../screens/nurse/NurseInventoryScreen';
import NurseReportsScreen from '../screens/nurse/NurseReportsScreen';

// Common Screens
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: undefined;
  Settings: undefined;
  AppointmentDetails: { appointmentId: number };
  CreateAppointment: { userId?: number };
  HealthMetricsDetails: { metricsId: number };
  InventoryDetails: { inventoryId: number };
  UserDetails: { userId: number };
};

export type StudentTabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  HealthMetrics: undefined;
  Resources: undefined;
};

export type StaffTabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  Prescriptions: undefined;
  Resources: undefined;
};

export type NurseTabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  Users: undefined;
  Inventory: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const StudentTab = createBottomTabNavigator<StudentTabParamList>();
const StaffTab = createBottomTabNavigator<StaffTabParamList>();
const NurseTab = createBottomTabNavigator<NurseTabParamList>();

// Student Tab Navigator
const StudentTabNavigator: React.FC = () => {
  return (
    <StudentTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar-check' : 'calendar-check-outline';
              break;
            case 'HealthMetrics':
              iconName = focused ? 'heart-pulse' : 'heart-pulse-outline';
              break;
            case 'Resources':
              iconName = focused ? 'book-open-variant' : 'book-open-variant-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: '#7f8c8d',
        headerShown: false,
        tabBarStyle: {
          height: responsive.height(60),
          paddingBottom: responsive.padding.xs,
        },
      })}
    >
      <StudentTab.Screen name="Dashboard" component={StudentDashboardScreen} />
      <StudentTab.Screen name="Appointments" component={StudentAppointmentsScreen} />
      <StudentTab.Screen name="HealthMetrics" component={StudentHealthMetricsScreen} />
      <StudentTab.Screen name="Resources" component={StudentHealthResourcesScreen} />
    </StudentTab.Navigator>
  );
};

// Staff Tab Navigator
const StaffTabNavigator: React.FC = () => {
  return (
    <StaffTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar-check' : 'calendar-check-outline';
              break;
            case 'Prescriptions':
              iconName = focused ? 'prescription' : 'prescription-outline';
              break;
            case 'Resources':
              iconName = focused ? 'book-open-variant' : 'book-open-variant-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: '#7f8c8d',
        headerShown: false,
        tabBarStyle: {
          height: responsive.height(60),
          paddingBottom: responsive.padding.xs,
        },
      })}
    >
      <StaffTab.Screen name="Dashboard" component={StaffDashboardScreen} />
      <StaffTab.Screen name="Appointments" component={StaffAppointmentsScreen} />
      <StaffTab.Screen name="Prescriptions" component={StaffPrescriptionsScreen} />
      <StaffTab.Screen name="Resources" component={StaffHealthResourcesScreen} />
    </StaffTab.Navigator>
  );
};

// Nurse Tab Navigator
const NurseTabNavigator: React.FC = () => {
  return (
    <NurseTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar-check' : 'calendar-check-outline';
              break;
            case 'Users':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Inventory':
              iconName = focused ? 'package-variant-closed' : 'package-variant-closed-outline';
              break;
            case 'Reports':
              iconName = focused ? 'file-chart' : 'file-chart-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: '#7f8c8d',
        headerShown: false,
        tabBarStyle: {
          height: responsive.height(60),
          paddingBottom: responsive.padding.xs,
        },
      })}
    >
      <NurseTab.Screen name="Dashboard" component={NurseDashboardScreen} />
      <NurseTab.Screen name="Appointments" component={NurseAppointmentsScreen} />
      <NurseTab.Screen name="Users" component={NurseUsersScreen} />
      <NurseTab.Screen name="Inventory" component={NurseInventoryScreen} />
      <NurseTab.Screen name="Reports" component={NurseReportsScreen} />
    </NurseTab.Navigator>
  );
};

// Main Navigator (role-based)
const MainNavigator: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case USER_ROLES.STUDENT:
      return <StudentTabNavigator />;
    case USER_ROLES.STAFF:
      return <StaffTabNavigator />;
    case USER_ROLES.NURSE:
      return <NurseTabNavigator />;
    default:
      return <StudentTabNavigator />;
  }
};

// Auth Navigator
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ 
                headerShown: true,
                title: 'Profile',
                presentation: 'modal'
              }} 
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ 
                headerShown: true,
                title: 'Settings',
                presentation: 'modal'
              }} 
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
