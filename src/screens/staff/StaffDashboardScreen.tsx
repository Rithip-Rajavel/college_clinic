import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

const StaffDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyAppointments();
      if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data.slice(0, 3)); // show latest 3 on dashboard
      }
    } catch {
      // silent fail for dashboard
    } finally {
      setLoading(false);
    }
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
            try { await logout(); } catch { Alert.alert('Error', 'Failed to logout'); }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return colors.success;
      case 'PENDING': return colors.warning;
      case 'IN_PROGRESS': return colors.info;
      case 'COMPLETED': return colors.purple;
      case 'CANCELLED': return colors.danger;
      default: return colors.textMuted;
    }
  };

  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.greeting}>Welcome back 👋</Text>
        <Title style={s.userName}>{user?.firstName || user?.username}</Title>
        <Text style={s.role}>Staff Member</Text>
      </View>

      {/* Quick Actions */}
      <Card style={s.card}>
        <Card.Content>
          <Title style={s.cardTitle}>Quick Actions</Title>
          <View style={s.quickActionRow}>
            <Button
              mode="contained"
              icon="calendar-plus"
              style={s.quickBtn}
              onPress={() => (navigation as any).navigate('CreateAppointment', {})}
            >
              Book Appointment
            </Button>
            <Button
              mode="outlined"
              icon="account-plus"
              style={s.quickBtn}
              onPress={() => (navigation as any).navigate('Appointments')}
            >
              For a Student
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Appointments */}
      <Card style={s.card}>
        <Card.Content>
          <View style={s.sectionHeader}>
            <Title style={s.cardTitle}>Recent Appointments</Title>
            <Button
              mode="text"
              compact
              onPress={() => (navigation as any).navigate('Appointments')}
            >
              View All
            </Button>
          </View>

          {loading ? (
            <Text style={s.mutedText}>Loading...</Text>
          ) : appointments.length === 0 ? (
            <Paragraph style={s.mutedText}>No appointments yet. Book your first one!</Paragraph>
          ) : (
            appointments.map((apt) => (
              <View key={apt.id} style={s.aptItem}>
                <View style={s.aptRow}>
                  <Text style={s.aptType}>{apt.type?.replace(/_/g, ' ')}</Text>
                  <Chip
                    compact
                    style={{ backgroundColor: getStatusColor(apt.status), height: 24 }}
                    textStyle={{ color: '#fff', fontSize: responsive.fontSize.xs, fontWeight: 'bold' }}
                  >
                    {apt.status?.replace(/_/g, ' ')}
                  </Chip>
                </View>
                <Text style={s.aptDate}>
                  {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : 'N/A'}
                </Text>
                {apt.nurse && (
                  <Text style={s.aptNurse}>
                    👩‍⚕️ {apt.nurse.firstName ? `${apt.nurse.firstName} ${apt.nurse.lastName || ''}`.trim() : apt.nurse.username}
                  </Text>
                )}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={[s.card, s.logoutCard]}>
        <Card.Content>
          <Button
            mode="outlined"
            textColor={colors.danger}
            onPress={handleLogout}
            style={{ borderColor: colors.danger }}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: responsive.padding.md },
    header: { alignItems: 'center', marginBottom: responsive.margin.xl, paddingVertical: responsive.padding.lg },
    greeting: { fontSize: responsive.fontSize.md, color: colors.textSecondary },
    userName: { fontSize: responsive.fontSize.xxl, color: colors.text, fontWeight: 'bold' },
    role: { fontSize: responsive.fontSize.sm, color: colors.textMuted },
    card: { marginBottom: responsive.margin.md, elevation: 2, backgroundColor: colors.card },
    logoutCard: { borderWidth: 1, borderColor: colors.danger + '40', backgroundColor: colors.card },
    cardTitle: { fontSize: responsive.fontSize.lg, color: colors.text, marginBottom: responsive.margin.sm },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quickActionRow: { flexDirection: 'row', gap: responsive.margin.sm, flexWrap: 'wrap' },
    quickBtn: { flex: 1, minWidth: 140 },
    mutedText: { color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', paddingVertical: responsive.padding.sm },
    aptItem: {
      paddingVertical: responsive.padding.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    aptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    aptType: { fontSize: responsive.fontSize.md, color: colors.text, fontWeight: '600' },
    aptDate: { fontSize: responsive.fontSize.sm, color: colors.textSecondary },
    aptNurse: { fontSize: responsive.fontSize.sm, color: colors.info },
  });

export default StaffDashboardScreen;
