import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { ApiResponse } from '../types';
import StorageService from '../utils/storage';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = await this.getAuthToken();

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await StorageService.getAuthToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Auth methods
  async login(identifier: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  async signup(userData: any) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async validateToken(token: string) {
    return this.request('/api/auth/validate', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // User methods
  async getAllUsers() {
    return this.request('/api/users');
  }

  async getUserById(id: number) {
    return this.request(`/api/users/${id}`);
  }

  async getUserByIdentifier(identifier: string) {
    return this.request(`/api/users/identifier/${identifier}`);
  }

  async getCurrentUser() {
    return this.request('/api/users/current');
  }

  async getNurse() {
    return this.request('/api/users/nurse');
  }

  async updateUser(id: number, userData: any) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deactivateUser(id: number) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointment methods
  async createAppointment(appointmentData: any) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getAppointmentById(id: number) {
    return this.request(`/api/appointments/${id}`);
  }

  async getMyAppointments() {
    return this.request('/api/appointments/my');
  }

  async getPatientAppointments(patientId: number) {
    return this.request(`/api/appointments/patient/${patientId}`);
  }

  async getNurseAppointments() {
    return this.request('/api/appointments/nurse');
  }

  async getUpcomingAppointments() {
    return this.request('/api/appointments/upcoming');
  }

  async getPendingAppointments() {
    return this.request('/api/appointments/pending');
  }

  async updateAppointment(id: number, status: string, diagnosis?: string, prescription?: string) {
    const params = new URLSearchParams({ status });
    if (diagnosis) params.append('diagnosis', diagnosis);
    if (prescription) params.append('prescription', prescription);

    return this.request(`/api/appointments/${id}/update?${params}`, {
      method: 'PUT',
    });
  }

  async cancelAppointment(id: number) {
    return this.request(`/api/appointments/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async approveAppointment(id: number) {
    return this.request(`/api/appointments/${id}/approve`, {
      method: 'PUT',
    });
  }

  // Health Metrics methods
  async createHealthMetrics(metricsData: any) {
    return this.request('/api/health-metrics', {
      method: 'POST',
      body: JSON.stringify(metricsData),
    });
  }

  async createHealthMetricsForUser(userId: number, metricsData: any) {
    return this.request(`/api/health-metrics/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(metricsData),
    });
  }

  async getHealthMetricsById(id: number) {
    return this.request(`/api/health-metrics/${id}`);
  }

  async getUserHealthMetrics(userId: number) {
    return this.request(`/api/health-metrics/user/${userId}`);
  }

  async getUserHealthMetricsByDateRange(userId: number, startDate: string, endDate: string) {
    return this.request(`/api/health-metrics/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getLatestUserHealthMetrics(userId: number) {
    return this.request(`/api/health-metrics/user/${userId}/latest`);
  }

  async getMyHealthMetrics() {
    return this.request('/api/health-metrics/my');
  }

  async getLatestMyHealthMetrics() {
    return this.request('/api/health-metrics/my/latest');
  }

  async updateHealthMetrics(id: number, metricsData: any) {
    return this.request(`/api/health-metrics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(metricsData),
    });
  }

  async deleteHealthMetrics(id: number) {
    return this.request(`/api/health-metrics/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory methods
  async getAllInventory() {
    return this.request('/api/inventory');
  }

  async createInventory(inventoryData: any) {
    return this.request('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(inventoryData),
    });
  }

  async getInventoryById(id: number) {
    return this.request(`/api/inventory/${id}`);
  }

  async getInventoryByMedicineName(medicineName: string) {
    return this.request(`/api/inventory/medicine/${medicineName}`);
  }

  async getInventoryStatus() {
    return this.request('/api/inventory/status');
  }

  async getLowStockItems() {
    return this.request('/api/inventory/low-stock');
  }

  async getOutOfStockItems() {
    return this.request('/api/inventory/out-of-stock');
  }

  async updateInventory(id: number, inventoryData: any) {
    return this.request(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData),
    });
  }

  async updateStock(id: number, quantityChange: number) {
    return this.request(`/api/inventory/${id}/stock?quantityChange=${quantityChange}`, {
      method: 'PUT',
    });
  }

  async reduceStock(medicineName: string, quantity: number) {
    return this.request(`/api/inventory/medicine/${medicineName}/reduce?quantity=${quantity}`, {
      method: 'PUT',
    });
  }

  async deactivateInventory(id: number) {
    return this.request(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
