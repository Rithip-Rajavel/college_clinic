# Campus Health System

A comprehensive digital medical record management system for university campuses, designed to transition from manual paper-based notes to a streamlined digital platform.

## Overview

The Campus Health System serves three primary user roles:
- **Students**: Appointment booking, health profile management, and health resources access
- **Staff**: Flexible booking for self and students, prescription viewing
- **Campus Nurse (Admin)**: User management, inventory control, and data portability

## Features

### Student Features
- ✅ Appointment Management (Standard & Emergency)
- ✅ Health Profile Management (Height, Weight tracking)
- ✅ Health Resources & Tips
- ✅ QR Code Scanner for quick access

### Staff Features
- ✅ Personal Appointment Booking
- ✅ Student Appointment Scheduling
- ✅ Digital Prescription Access
- ✅ Health Resources

### Nurse (Admin) Features
- ✅ User Management (Students & Staff)
- ✅ Medicine Inventory Tracking
- ✅ Low Stock Alerts
- ✅ PDF/Excel Report Generation
- ✅ Appointment Management

## Technology Stack

- **Frontend**: React Native 0.84.0
- **UI Framework**: React Native Paper
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Dropdowns**: React Native Element Dropdown
- **Storage**: AsyncStorage
- **Icons**: React Native Vector Icons
- **State Management**: React Context API

## Project Structure

```
src/
├── components/
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── DropdownComponent.tsx
├── constants/
│   └── api.ts
├── contexts/
│   └── AuthContext.tsx
├── navigation/
│   └── AppNavigator.tsx
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── student/
│   │   ├── StudentDashboardScreen.tsx
│   │   ├── StudentAppointmentsScreen.tsx
│   │   ├── StudentHealthMetricsScreen.tsx
│   │   └── StudentHealthResourcesScreen.tsx
│   ├── staff/
│   │   ├── StaffDashboardScreen.tsx
│   │   ├── StaffAppointmentsScreen.tsx
│   │   ├── StaffPrescriptionsScreen.tsx
│   │   └── StaffHealthResourcesScreen.tsx
│   ├── nurse/
│   │   ├── NurseDashboardScreen.tsx
│   │   ├── NurseAppointmentsScreen.tsx
│   │   ├── NurseUsersScreen.tsx
│   │   ├── NurseInventoryScreen.tsx
│   │   └── NurseReportsScreen.tsx
│   └── common/
│       ├── ProfileScreen.tsx
│       └── SettingsScreen.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
└── utils/
    ├── dimensions.ts
    └── storage.ts
```

## Getting Started

### Prerequisites
- Node.js >= 22.11.0
- React Native development environment
- Android Studio / Xcode for mobile development

### Installation

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```

3. For iOS, install CocoaPods:
   ```sh
   cd ios && pod install && cd ..
   ```

### Running the App

1. Start Metro:
   ```sh
   npm start
   ```

2. Run on Android:
   ```sh
   npm run android
   ```

3. Run on iOS:
   ```sh
   npm run ios
   ```

## API Integration

The app is designed to work with a REST API running on `http://localhost:8080`. Key endpoints include:

- Authentication: `/api/auth/login`, `/api/auth/signup`
- Appointments: `/api/appointments/*`
- Health Metrics: `/api/health-metrics/*`
- Inventory: `/api/inventory/*`
- Users: `/api/users/*`

## Responsive Design

The app uses a responsive design system with:
- Dynamic scaling based on screen dimensions
- Responsive font sizes, margins, and padding
- Tablet and mobile device support

## Development Notes

- The app uses TypeScript for type safety
- All components follow a consistent naming convention
- Responsive utilities are centralized in `utils/dimensions.ts`
- Authentication state is managed through React Context
- Local storage is handled via AsyncStorage

## Future Enhancements

- [ ] Real-time notifications
- [ ] Offline mode support
- [ ] Biometric authentication
- [ ] Video consultations
- [ ] Integration with wearable devices

## Troubleshooting

For common React Native issues, refer to the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).

## License

This project is proprietary and confidential.
