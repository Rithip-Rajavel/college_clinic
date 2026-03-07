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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

const NurseDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const s = makeStyles(colors);
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load appointments
      const appointmentsResponse = await ApiService.getNurseAppointments();
      const appointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];

      // Load users
      const usersResponse = await ApiService.getAllUsers();
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];

      // Load inventory status
      const lowStockResponse = await ApiService.getLowStockItems();
      const outOfStockResponse = await ApiService.getOutOfStockItems();

      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter((a: any) => a.status === 'PENDING').length,
        totalUsers: users.length,
        lowStockItems: Array.isArray(lowStockResponse.data) ? lowStockResponse.data.length : 0,
        outOfStockItems: Array.isArray(outOfStockResponse.data) ? outOfStockResponse.data.length : 0,
      });

      setRecentAppointments(appointments.slice(0, 5));
      setLowStockItems(Array.isArray(lowStockResponse.data) ? lowStockResponse.data : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAppointment = () => {
    (navigation as any).navigate('CreateAppointment');
  };

  const handleQuickInventory = () => {
    (navigation as any).navigate('Main', { screen: 'Inventory' });
  };

  const handleQuickUser = () => {
    (navigation as any).navigate('Main', { screen: 'Users' });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
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
    if (current === 0) return colors.danger;
    if (current <= minimum) return colors.warning;
    return colors.success;
  };

  return (
    <View style={s.container}>
      <ScrollView style={s.scrollView} contentContainerStyle={s.contentContainer}>
        <View style={s.header}>
          <Title style={s.welcomeText}>Welcome back!</Title>
          <Text style={s.userName}>{user?.firstName || user?.username}</Text>
          <Text style={s.userRole}>Campus Nurse</Text>
        </View>

        {/* Stats Cards */}
        <View style={s.statsContainer}>
          <Card style={s.statCard}>
            <Card.Content style={s.statContent}>
              <Text style={s.statNumber}>{stats.totalAppointments}</Text>
              <Text style={s.statLabel}>Total Appointments</Text>
            </Card.Content>
          </Card>

          <Card style={s.statCard}>
            <Card.Content style={s.statContent}>
              <Text style={[s.statNumber, { color: colors.warning }]}>
                {stats.pendingAppointments}
              </Text>
              <Text style={s.statLabel}>Pending</Text>
            </Card.Content>
          </Card>

          <Card style={s.statCard}>
            <Card.Content style={s.statContent}>
              <Text style={s.statNumber}>{stats.totalUsers}</Text>
              <Text style={s.statLabel}>Total Users</Text>
            </Card.Content>
          </Card>

          <Card style={s.statCard}>
            <Card.Content style={s.statContent}>
              <Text style={[s.statNumber, { color: colors.danger }]}>
                {stats.lowStockItems + stats.outOfStockItems}
              </Text>
              <Text style={s.statLabel}>Stock Alerts</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Appointments */}
        <Card style={s.sectionCard}>
          <Card.Content>
            <View style={s.sectionHeader}>
              <Title style={s.sectionTitle}>Recent Appointments</Title>
              <Button mode="text" compact onPress={() => console.log('View all appointments')}>
                View All
              </Button>
            </View>

            {recentAppointments.length === 0 ? (
              <Paragraph style={s.emptyText}>No recent appointments</Paragraph>
            ) : (
              recentAppointments.map((appointment) => (
                <View key={appointment.id} style={s.appointmentItem}>
                  <View style={s.appointmentHeader}>
                    <Text style={s.patientName}>
                      {appointment.patient?.firstName || appointment.patient?.username}
                    </Text>
                    <Text style={[s.appointmentStatus, { color: getStatusColor(appointment.status) }]}>
                      {appointment.status.replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={s.appointmentTime}>
                    {new Date(appointment.appointmentDate).toLocaleString()}
                  </Text>
                  {appointment.symptoms && (
                    <Text style={s.symptoms} numberOfLines={1}>
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
          <Card style={[s.sectionCard, s.alertCard]}>
            <Card.Content>
              <View style={s.sectionHeader}>
                <Title style={s.sectionTitle}>⚠️ Stock Alerts</Title>
                <Button mode="text" compact onPress={() => console.log('View inventory')}>
                  Manage
                </Button>
              </View>

              {lowStockItems.slice(0, 3).map((item) => (
                <View key={item.id} style={s.stockItem}>
                  <View style={s.stockInfo}>
                    <Text style={s.medicineName}>{item.medicineName}</Text>
                    <Text style={s.stockDetails}>
                      {item.currentStock} / {item.minimumStock} {item.unit || 'units'}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={item.currentStock / item.minimumStock}
                    color={getStockLevelColor(item.currentStock, item.minimumStock)}
                    style={s.stockProgress}
                  />
                </View>
              ))}

              {(lowStockItems.length > 3 || stats.outOfStockItems > 0) && (
                <Text style={s.moreItemsText}>
                  +{lowStockItems.length - 3 + stats.outOfStockItems} more items need attention
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={s.sectionCard}>
          <Card.Content>
            <Title style={s.sectionTitle}>Quick Actions</Title>
            <View style={s.quickActions}>
              <Button mode="contained" icon="calendar-plus" style={s.quickActionButton} onPress={handleQuickAppointment}>Book Appointment</Button>
              <Button mode="contained" icon="package-variant" style={s.quickActionButton} onPress={handleQuickInventory}>Update Inventory</Button>
              <Button mode="contained" icon="account-plus" style={s.quickActionButton} onPress={handleQuickUser}>Add User</Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={s.logoutCard}>
          <Card.Content>
            <Button mode="outlined" style={s.logoutButton} onPress={handleLogout}>Logout</Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB icon="plus" style={s.fab} onPress={() => setShowQuickActions(true)} />

      <Portal>
        <Modal visible={showQuickActions} onDismiss={() => setShowQuickActions(false)} contentContainerStyle={s.modalContent}>
          <Title style={s.modalTitle}>Quick Actions</Title>
          <View style={s.modalActions}>
            <Button mode="contained" icon="calendar-plus" style={s.modalButton} onPress={handleQuickAppointment}>Book Appointment</Button>
            <Button mode="contained" icon="package-variant" style={s.modalButton} onPress={handleQuickInventory}>Update Inventory</Button>
            <Button mode="contained" icon="account-plus" style={s.modalButton} onPress={handleQuickUser}>Add User</Button>
            <Button mode="contained" icon="file-chart" style={s.modalButton} onPress={() => console.log('Generate report')}>Generate Report</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  contentContainer: { padding: responsive.padding.md },
  header: { alignItems: 'center', marginBottom: responsive.margin.xl },
  welcomeText: { fontSize: responsive.fontSize.xxl, color: colors.text, marginBottom: responsive.margin.xs },
  userName: { fontSize: responsive.fontSize.lg, color: colors.text, fontWeight: 'bold' },
  userRole: { fontSize: responsive.fontSize.md, color: colors.textMuted },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: responsive.margin.lg },
  statCard: { width: '48%', marginBottom: responsive.margin.sm, elevation: 2, backgroundColor: colors.card },
  statContent: { alignItems: 'center', padding: responsive.padding.md },
  statNumber: { fontSize: responsive.fontSize.xxxl, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: responsive.fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  sectionCard: { marginBottom: responsive.margin.md, elevation: 2, backgroundColor: colors.card },
  alertCard: { backgroundColor: colors.alertBg, borderColor: colors.alertBorder, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsive.margin.md },
  sectionTitle: { fontSize: responsive.fontSize.lg, color: colors.text },
  emptyText: { textAlign: 'center', color: colors.textMuted, fontStyle: 'italic' },
  appointmentItem: { paddingVertical: responsive.padding.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsive.margin.xs },
  patientName: { fontSize: responsive.fontSize.md, fontWeight: 'bold', color: colors.text },
  appointmentStatus: { fontSize: responsive.fontSize.sm, fontWeight: 'bold' },
  appointmentTime: { fontSize: responsive.fontSize.sm, color: colors.textSecondary },
  symptoms: { fontSize: responsive.fontSize.sm, color: colors.textMuted, marginTop: responsive.margin.xs },
  stockItem: { marginBottom: responsive.margin.md },
  stockInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsive.margin.xs },
  medicineName: { fontSize: responsive.fontSize.md, fontWeight: 'bold', color: colors.text },
  stockDetails: { fontSize: responsive.fontSize.sm, color: colors.textSecondary },
  stockProgress: { height: responsive.height(4), borderRadius: responsive.borderRadius.sm },
  moreItemsText: { fontSize: responsive.fontSize.sm, color: colors.warning, textAlign: 'center', fontStyle: 'italic' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickActionButton: { width: '48%', marginBottom: responsive.margin.sm, backgroundColor: colors.primary },
  fab: { position: 'absolute', margin: responsive.margin.md, right: 0, bottom: 0, backgroundColor: colors.primary },
  modalContent: { backgroundColor: colors.modalBackground, padding: responsive.padding.lg, margin: responsive.margin.lg, borderRadius: responsive.borderRadius.lg },
  modalTitle: { fontSize: responsive.fontSize.xl, color: colors.text, marginBottom: responsive.margin.lg, textAlign: 'center' },
  modalActions: { flexDirection: 'column', gap: responsive.margin.sm },
  modalButton: { backgroundColor: colors.primary },
  logoutCard: { marginTop: responsive.margin.lg, backgroundColor: colors.card, borderColor: colors.danger + '40', borderWidth: 1 },
  logoutButton: { borderColor: colors.danger },
});

export default NurseDashboardScreen;
