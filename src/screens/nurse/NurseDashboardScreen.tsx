import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  ProgressBar,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

const NurseDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalUsers: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load appointments
      const appointmentsResponse = await ApiService.getNurseAppointments();
      const appointments = appointmentsResponse.data || [];

      // Load users
      const usersResponse = await ApiService.getAllUsers();
      const users = usersResponse.data || [];

      // Load inventory status
      const lowStockResponse = await ApiService.getLowStockItems();
      const outOfStockResponse = await ApiService.getOutOfStockItems();

      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter((a: any) => a.status === 'PENDING').length,
        totalUsers: users.length,
        lowStockItems: lowStockResponse.data?.length || 0,
        outOfStockItems: outOfStockResponse.data?.length || 0,
      });

      setRecentAppointments(appointments.slice(0, 5));
      setLowStockItems(lowStockResponse.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAppointment = () => {
    // Navigate to appointment creation
    console.log('Navigate to appointment creation');
  };

  const handleQuickInventory = () => {
    // Navigate to inventory management
    console.log('Navigate to inventory management');
  };

  const handleQuickUser = () => {
    // Navigate to user management
    console.log('Navigate to user management');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f39c12';
      case 'APPROVED': return '#27ae60';
      case 'IN_PROGRESS': return '#3498db';
      case 'COMPLETED': return '#8e44ad';
      case 'CANCELLED': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getStockLevelColor = (current: number, minimum: number) => {
    if (current === 0) return '#e74c3c';
    if (current <= minimum) return '#f39c12';
    return '#27ae60';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Title style={styles.welcomeText}>Welcome back!</Title>
          <Text style={styles.userName}>{user?.firstName || user?.username}</Text>
          <Text style={styles.userRole}>Campus Nurse</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.totalAppointments}</Text>
              <Text style={styles.statLabel}>Total Appointments</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#f39c12' }]}>
                {stats.pendingAppointments}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#e74c3c' }]}>
                {stats.lowStockItems + stats.outOfStockItems}
              </Text>
              <Text style={styles.statLabel}>Stock Alerts</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Appointments */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Recent Appointments</Title>
              <Button mode="text" compact onPress={() => console.log('View all appointments')}>
                View All
              </Button>
            </View>

            {recentAppointments.length === 0 ? (
              <Paragraph style={styles.emptyText}>No recent appointments</Paragraph>
            ) : (
              recentAppointments.map((appointment) => (
                <View key={appointment.id} style={styles.appointmentItem}>
                  <View style={styles.appointmentHeader}>
                    <Text style={styles.patientName}>
                      {appointment.patient?.firstName || appointment.patient?.username}
                    </Text>
                    <Text style={[styles.appointmentStatus, { color: getStatusColor(appointment.status) }]}>
                      {appointment.status.replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={styles.appointmentTime}>
                    {new Date(appointment.appointmentDate).toLocaleString()}
                  </Text>
                  {appointment.symptoms && (
                    <Text style={styles.symptoms} numberOfLines={1}>
                      {appointment.symptoms}
                    </Text>
                  )}
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Low Stock Alerts */}
        {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
          <Card style={[styles.sectionCard, styles.alertCard]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Title style={styles.sectionTitle}>⚠️ Stock Alerts</Title>
                <Button mode="text" compact onPress={() => console.log('View inventory')}>
                  Manage
                </Button>
              </View>

              {lowStockItems.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.stockItem}>
                  <View style={styles.stockInfo}>
                    <Text style={styles.medicineName}>{item.medicineName}</Text>
                    <Text style={styles.stockDetails}>
                      {item.currentStock} / {item.minimumStock} {item.unit || 'units'}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={item.currentStock / item.minimumStock}
                    color={getStockLevelColor(item.currentStock, item.minimumStock)}
                    style={styles.stockProgress}
                  />
                </View>
              ))}

              {(lowStockItems.length > 3 || stats.outOfStockItems > 0) && (
                <Text style={styles.moreItemsText}>
                  +{lowStockItems.length - 3 + stats.outOfStockItems} more items need attention
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="calendar-plus"
                style={styles.quickActionButton}
                onPress={handleQuickAppointment}
              >
                Book Appointment
              </Button>
              <Button
                mode="contained"
                icon="package-variant"
                style={styles.quickActionButton}
                onPress={handleQuickInventory}
              >
                Update Inventory
              </Button>
              <Button
                mode="contained"
                icon="account-plus"
                style={styles.quickActionButton}
                onPress={handleQuickUser}
              >
                Add User
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowQuickActions(true)}
      />

      <Portal>
        <Modal
          visible={showQuickActions}
          onDismiss={() => setShowQuickActions(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Quick Actions</Title>

          <View style={styles.modalActions}>
            <Button
              mode="contained"
              icon="calendar-plus"
              style={styles.modalButton}
              onPress={handleQuickAppointment}
            >
              Book Appointment
            </Button>
            <Button
              mode="contained"
              icon="package-variant"
              style={styles.modalButton}
              onPress={handleQuickInventory}
            >
              Update Inventory
            </Button>
            <Button
              mode="contained"
              icon="account-plus"
              style={styles.modalButton}
              onPress={handleQuickUser}
            >
              Add User
            </Button>
            <Button
              mode="contained"
              icon="file-chart"
              style={styles.modalButton}
              onPress={() => console.log('Generate report')}
            >
              Generate Report
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: responsive.padding.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: responsive.margin.xl,
  },
  welcomeText: {
    fontSize: responsive.fontSize.xxl,
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  userName: {
    fontSize: responsive.fontSize.lg,
    color: '#34495e',
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: responsive.fontSize.md,
    color: '#7f8c8d',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: responsive.margin.lg,
  },
  statCard: {
    width: '48%',
    marginBottom: responsive.margin.sm,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: responsive.padding.md,
  },
  statNumber: {
    fontSize: responsive.fontSize.xxxl,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  alertCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.md,
  },
  sectionTitle: {
    fontSize: responsive.fontSize.lg,
    color: '#2c3e50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  appointmentItem: {
    paddingVertical: responsive.padding.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.xs,
  },
  patientName: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  appointmentStatus: {
    fontSize: responsive.fontSize.sm,
    fontWeight: 'bold',
  },
  appointmentTime: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
  },
  symptoms: {
    fontSize: responsive.fontSize.sm,
    color: '#555',
    marginTop: responsive.margin.xs,
  },
  stockItem: {
    marginBottom: responsive.margin.md,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.xs,
  },
  medicineName: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  stockDetails: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
  },
  stockProgress: {
    height: responsive.height(4),
    borderRadius: responsive.borderRadius.sm,
  },
  moreItemsText: {
    fontSize: responsive.fontSize.sm,
    color: '#856404',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    marginBottom: responsive.margin.sm,
    backgroundColor: '#3498db',
  },
  fab: {
    position: 'absolute',
    margin: responsive.margin.md,
    right: 0,
    bottom: 0,
    backgroundColor: '#3498db',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: responsive.padding.lg,
    margin: responsive.margin.lg,
    borderRadius: responsive.borderRadius.lg,
  },
  modalTitle: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
    marginBottom: responsive.margin.lg,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'column',
    gap: responsive.margin.sm,
  },
  modalButton: {
    backgroundColor: '#3498db',
  },
});

export default NurseDashboardScreen;
