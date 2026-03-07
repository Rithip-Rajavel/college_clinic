import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Portal,
  Modal,
  Divider,
  Chip,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

type StudentAppointmentsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StudentAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<StudentAppointmentsNavigationProp>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => { loadAppointments(); }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyAppointments();
      if (response.error) {
        Alert.alert('Error', 'Failed to load appointments.');
        setAppointments([]);
        return;
      }
      if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        setAppointments([]);
      }
    } catch {
      Alert.alert('Error', 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        try {
          const r = await ApiService.cancelAppointment(id);
          if (r.data !== undefined || !r.error) {
            Alert.alert('Success', 'Appointment cancelled');
            setShowDetailsModal(false);
            loadAppointments();
          } else {
            Alert.alert('Error', r.error || 'Failed to cancel');
          }
        } catch { Alert.alert('Error', 'Failed to cancel'); }
      }},
    ]);
  };

  const openDetails = (apt: any) => { setSelectedAppointment(apt); setShowDetailsModal(true); };
  const onRefresh = async () => { setRefreshing(true); await loadAppointments(); setRefreshing(false); };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return '🚨'; case 'ROUTINE_CHECKUP': return '🏥';
      case 'FOLLOW_UP': return '🔄'; case 'VACCINATION': return '💉'; default: return '📋';
    }
  };

  return (
    <>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <View style={s.header}>
          <Title style={s.title}>My Appointments</Title>
          <Button mode="contained" style={s.bookButton} icon="calendar-plus" onPress={() => navigation.navigate('CreateAppointment', {})}>
            Book New
          </Button>
        </View>

        {loading ? (
          <Card style={s.card}><Card.Content><Text style={s.mutedText}>Loading appointments...</Text></Card.Content></Card>
        ) : appointments.length === 0 ? (
          <Card style={s.card}>
            <Card.Content style={s.emptyContent}>
              <Text style={s.emptyText}>No appointments scheduled</Text>
              <Paragraph style={s.mutedText}>Book your first appointment to get started</Paragraph>
              <Button mode="contained" style={s.bookButton} onPress={() => navigation.navigate('CreateAppointment', {})}>Book Appointment</Button>
            </Card.Content>
          </Card>
        ) : (
          appointments.map((apt) => (
            <Card key={apt.id} style={s.card}>
              <Card.Content>
                <View style={s.aptHeader}>
                  <View style={s.typeRow}>
                    <Text style={s.typeIcon}>{getTypeIcon(apt.type)}</Text>
                    <Title style={s.aptType}>{apt.type?.replace(/_/g, ' ') || 'Appointment'}</Title>
                  </View>
                  <Chip compact style={[s.statusChip, { backgroundColor: getStatusColor(apt.status) }]} textStyle={s.statusChipText}>
                    {apt.status?.replace(/_/g, ' ') || 'UNKNOWN'}
                  </Chip>
                </View>

                {apt.nurse && (
                  <Text style={s.nurseText}>
                    👩‍⚕️ {apt.nurse.firstName ? `${apt.nurse.firstName} ${apt.nurse.lastName || ''}`.trim() : apt.nurse.username}
                  </Text>
                )}

                <Text style={s.dateTime}>📅 {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : 'No date'}</Text>
                <Text style={s.dateTime}>🕐 {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleTimeString() : 'No time'}</Text>
                {apt.symptoms && <Paragraph style={s.symptoms}>🩺 {apt.symptoms}</Paragraph>}

                <View style={s.actions}>
                  <Button mode="outlined" style={s.actionButton} onPress={() => openDetails(apt)}>View Details</Button>
                  {apt.status === 'PENDING' && (
                    <Button mode="text" textColor={colors.danger} onPress={() => handleCancelAppointment(apt.id)}>Cancel</Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal visible={showDetailsModal} onDismiss={() => setShowDetailsModal(false)} contentContainerStyle={s.modalContent}>
          <ScrollView>
            <Title style={s.modalTitle}>Appointment Details</Title>
            {selectedAppointment && (
              <>
                <View style={s.modalStatusRow}>
                  <Chip style={[s.modalStatusChip, { backgroundColor: getStatusColor(selectedAppointment.status) }]} textStyle={{ color: '#fff', fontWeight: 'bold' }}>
                    {selectedAppointment.status?.replace(/_/g, ' ')}
                  </Chip>
                </View>

                <Divider style={s.divider} />

                <View style={s.detailRow}><Text style={s.detailLabel}>Type</Text><Text style={s.detailValue}>{getTypeIcon(selectedAppointment.type)} {selectedAppointment.type?.replace(/_/g, ' ')}</Text></View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Date & Time</Text>
                  <Text style={s.detailValue}>{selectedAppointment.appointmentDate ? `${new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at ${new Date(selectedAppointment.appointmentDate).toLocaleTimeString()}` : 'N/A'}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Assigned Nurse</Text>
                  <Text style={s.detailValue}>
                    {selectedAppointment.nurse
                      ? (selectedAppointment.nurse.firstName ? `${selectedAppointment.nurse.firstName} ${selectedAppointment.nurse.lastName || ''}`.trim() : selectedAppointment.nurse.username)
                      : 'Not assigned yet'}
                  </Text>
                </View>

                <Divider style={s.divider} />

                {selectedAppointment.symptoms && <View style={s.detailRow}><Text style={s.detailLabel}>Symptoms</Text><Text style={s.detailValue}>{selectedAppointment.symptoms}</Text></View>}
                {selectedAppointment.diagnosis && <View style={s.detailRow}><Text style={s.detailLabel}>Diagnosis</Text><Text style={s.detailValue}>{selectedAppointment.diagnosis}</Text></View>}
                {selectedAppointment.prescription && (
                  <View style={s.detailRow}><Text style={s.detailLabel}>Prescription</Text><Text style={s.prescriptionBox}>{selectedAppointment.prescription}</Text></View>
                )}
                {selectedAppointment.notes && <View style={s.detailRow}><Text style={s.detailLabel}>Notes</Text><Text style={s.detailValue}>{selectedAppointment.notes}</Text></View>}

                <View style={s.modalActions}>
                  {selectedAppointment.status === 'PENDING' && (
                    <Button mode="outlined" textColor={colors.danger} onPress={() => handleCancelAppointment(selectedAppointment.id)} style={{ borderColor: colors.danger }}>Cancel Appointment</Button>
                  )}
                  <Button mode="contained" onPress={() => setShowDetailsModal(false)}>Close</Button>
                </View>
              </>
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: responsive.padding.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsive.margin.lg },
  title: { fontSize: responsive.fontSize.xl, color: colors.text },
  bookButton: { backgroundColor: colors.primary },
  card: { marginBottom: responsive.margin.md, elevation: 2, backgroundColor: colors.card },
  emptyContent: { alignItems: 'center', paddingVertical: responsive.padding.xl },
  emptyText: { fontSize: responsive.fontSize.lg, color: colors.textSecondary, fontWeight: 'bold', paddingVertical: responsive.padding.md },
  mutedText: { color: colors.textMuted, textAlign: 'center', marginBottom: responsive.margin.md },
  aptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsive.margin.sm },
  typeRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  typeIcon: { fontSize: responsive.fontSize.xl, marginRight: responsive.margin.sm },
  aptType: { fontSize: responsive.fontSize.lg, color: colors.text, flex: 1 },
  statusChip: { height: 28 },
  statusChipText: { color: '#fff', fontSize: responsive.fontSize.xs, fontWeight: 'bold' },
  nurseText: { fontSize: responsive.fontSize.sm, color: colors.info, fontWeight: '600', marginBottom: responsive.margin.sm },
  dateTime: { fontSize: responsive.fontSize.md, color: colors.textSecondary, marginBottom: responsive.margin.sm },
  symptoms: { fontSize: responsive.fontSize.sm, color: colors.textSecondary, marginBottom: responsive.margin.md },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: responsive.margin.sm },
  actionButton: { flex: 1, marginRight: responsive.margin.sm },
  // Modal
  modalContent: { backgroundColor: colors.modalBackground, padding: responsive.padding.lg, margin: responsive.margin.lg, borderRadius: responsive.borderRadius.lg, maxHeight: responsive.height(600) },
  modalTitle: { fontSize: responsive.fontSize.xl, color: colors.text, marginBottom: responsive.margin.md, textAlign: 'center' },
  modalStatusRow: { alignItems: 'center', marginBottom: responsive.margin.md },
  modalStatusChip: { paddingHorizontal: responsive.padding.sm },
  divider: { marginVertical: responsive.margin.md, backgroundColor: colors.divider },
  detailRow: { marginBottom: responsive.margin.md },
  detailLabel: { fontSize: responsive.fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold', marginBottom: 2 },
  detailValue: { fontSize: responsive.fontSize.md, color: colors.text },
  prescriptionBox: { fontSize: responsive.fontSize.md, color: colors.text, backgroundColor: colors.surfaceVariant, padding: responsive.padding.md, borderRadius: responsive.borderRadius.md, borderLeftWidth: 4, borderLeftColor: colors.primary },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: responsive.margin.sm, marginTop: responsive.margin.sm },
});

export default StudentAppointmentsScreen;
