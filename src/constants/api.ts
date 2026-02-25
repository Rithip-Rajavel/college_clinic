export const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  VALIDATE_TOKEN: '/api/auth/validate',
  
  // Users
  GET_ALL_USERS: '/api/users',
  GET_USER_BY_ID: (id: number) => `/api/users/${id}`,
  GET_USER_BY_IDENTIFIER: (identifier: string) => `/api/users/identifier/${identifier}`,
  GET_CURRENT_USER: '/api/users/current',
  GET_NURSE: '/api/users/nurse',
  UPDATE_USER: (id: number) => `/api/users/${id}`,
  DEACTIVATE_USER: (id: number) => `/api/users/${id}`,
  
  // Appointments
  CREATE_APPOINTMENT: '/api/appointments',
  GET_APPOINTMENT_BY_ID: (id: number) => `/api/appointments/${id}`,
  GET_MY_APPOINTMENTS: '/api/appointments/my',
  GET_PATIENT_APPOINTMENTS: (patientId: number) => `/api/appointments/patient/${patientId}`,
  GET_NURSE_APPOINTMENTS: '/api/appointments/nurse',
  GET_UPCOMING_APPOINTMENTS: '/api/appointments/upcoming',
  GET_PENDING_APPOINTMENTS: '/api/appointments/pending',
  UPDATE_APPOINTMENT: (id: number) => `/api/appointments/${id}/update`,
  CANCEL_APPOINTMENT: (id: number) => `/api/appointments/${id}/cancel`,
  APPROVE_APPOINTMENT: (id: number) => `/api/appointments/${id}/approve`,
  
  // Health Metrics
  CREATE_HEALTH_METRICS: '/api/health-metrics',
  CREATE_HEALTH_METRICS_FOR_USER: (userId: number) => `/api/health-metrics/user/${userId}`,
  GET_HEALTH_METRICS_BY_ID: (id: number) => `/api/health-metrics/${id}`,
  GET_USER_HEALTH_METRICS: (userId: number) => `/api/health-metrics/user/${userId}`,
  GET_USER_HEALTH_METRICS_BY_DATE_RANGE: (userId: number) => `/api/health-metrics/user/${userId}/range`,
  GET_LATEST_USER_HEALTH_METRICS: (userId: number) => `/api/health-metrics/user/${userId}/latest`,
  GET_MY_HEALTH_METRICS: '/api/health-metrics/my',
  GET_LATEST_MY_HEALTH_METRICS: '/api/health-metrics/my/latest',
  UPDATE_HEALTH_METRICS: (id: number) => `/api/health-metrics/${id}`,
  DELETE_HEALTH_METRICS: (id: number) => `/api/health-metrics/${id}`,
  
  // Inventory
  GET_ALL_INVENTORY: '/api/inventory',
  CREATE_INVENTORY: '/api/inventory',
  GET_INVENTORY_BY_ID: (id: number) => `/api/inventory/${id}`,
  GET_INVENTORY_BY_MEDICINE_NAME: (medicineName: string) => `/api/inventory/medicine/${medicineName}`,
  GET_INVENTORY_STATUS: '/api/inventory/status',
  GET_LOW_STOCK_ITEMS: '/api/inventory/low-stock',
  GET_OUT_OF_STOCK_ITEMS: '/api/inventory/out-of-stock',
  UPDATE_INVENTORY: (id: number) => `/api/inventory/${id}`,
  UPDATE_STOCK: (id: number) => `/api/inventory/${id}/stock`,
  REDUCE_STOCK: (medicineName: string) => `/api/inventory/medicine/${medicineName}/reduce`,
  DEACTIVATE_INVENTORY: (id: number) => `/api/inventory/${id}`,
};

export const USER_ROLES = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  NURSE: 'NURSE',
} as const;

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const APPOINTMENT_TYPES = {
  EMERGENCY: 'EMERGENCY',
  ROUTINE_CHECKUP: 'ROUTINE_CHECKUP',
  FOLLOW_UP: 'FOLLOW_UP',
  VACCINATION: 'VACCINATION',
  OTHER: 'OTHER',
} as const;
