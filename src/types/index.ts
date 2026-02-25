export interface User {
  id: number;
  username: string;
  email: string;
  rollNumber: string;
  mobileNumber: string;
  role: 'STUDENT' | 'STAFF' | 'NURSE';
  height: number;
  weight: number;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  active: boolean;
  enabled: boolean;
  accountNonLocked: boolean;
  authorities?: GrantedAuthority[];
}

export interface GrantedAuthority {
  authority: string;
}

export interface AuthRequest {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  rollNumber: string;
  mobileNumber: string;
  role: 'STUDENT' | 'STAFF' | 'NURSE';
  height: number;
  weight: number;
  firstName?: string;
  lastName?: string;
}

export interface Appointment {
  id: number;
  patient: User;
  nurse: User;
  appointmentDate: string;
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type: 'EMERGENCY' | 'ROUTINE_CHECKUP' | 'FOLLOW_UP' | 'VACCINATION' | 'OTHER';
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  patientId: number;
  appointmentDate: string;
  type: 'EMERGENCY' | 'ROUTINE_CHECKUP' | 'FOLLOW_UP' | 'VACCINATION' | 'OTHER';
  symptoms?: string;
  notes?: string;
}

export interface HealthMetrics {
  id: number;
  user: User;
  height: number;
  weight: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  notes?: string;
  recordedAt: string;
  createdAt: string;
}

export interface HealthMetricsRequest {
  height: number;
  weight: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  notes?: string;
}

export interface Inventory {
  id: number;
  medicineName: string;
  description: string;
  currentStock: number;
  minimumStock: number;
  unit?: string;
  manufacturer?: string;
  expiryDate?: string;
  batchNumber?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  lowStock: boolean;
  stockOut: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface Dimensions {
  width: number;
  height: number;
}
