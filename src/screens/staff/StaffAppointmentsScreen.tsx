import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  FAB,
  Portal,
  Modal,
  TextInput,
  Divider,
  Chip,
} from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';
import { APPOINTMENT_TYPES } from '../../constants/api';

type StaffAppointmentsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const appointmentTypeOptions = [
  { label: 'Routine', value: 'ROUTINE_CHECKUP' },
  { label: 'Emergency', value: 'EMERGENCY' },
  { label: 'Follow Up', value: 'FOLLOW_UP' },
  { label: 'Vaccination', value: 'VACCINATION' },
  { label: 'Other', value: 'OTHER' },
];

const StaffAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<StaffAppointmentsNavigationProp>();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForSelf, setBookingForSelf] = useState(true);
  const [bookingData, setBookingData] = useState({
    appointmentDate: new Date(),
    type: 'ROUTINE_CHECKUP',
    symptoms: '',
    notes: '',
    studentIdentifier: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Details modal state
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyAppointments();
      if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const resetBookingForm = () => {
    setBookingData({
      appointmentDate: new Date(),
      type: 'ROUTINE_CHECKUP',
      symptoms: '',
      notes: '',
      studentIdentifier: '',
    });
  };

  const openBookingModal = (forSelf: boolean) => {
    setBookingForSelf(forSelf);
    resetBookingForm();
    setShowBookingModal(true);
  };

  const handleBookAppointment = async () => {
    if (!bookingData.type) {
      Alert.alert('Error', 'Please select an appointment type');
      return;
    }
    if (!bookingForSelf && !bookingData.studentIdentifier.trim()) {
      Alert.alert('Error', 'Please enter the student ID / email / roll number');
      return;
    }

    try {
      setBookingLoading(true);
      let patientId: number;

      if (bookingForSelf) {
        patientId = Number(user?.id);
      } else {
        const studentResponse = await ApiService.getUserByIdentifier(bookingData.studentIdentifier.trim());
        if (!studentResponse.data) {
          Alert.alert('Error', 'Student not found. Please check the identifier.');
          return;
        }
        patientId = Number((studentResponse.data as any)?.id);
      }

      const appointmentPayload = {
        patientId,
        appointmentDate: bookingData.appointmentDate.toISOString(),
        type: bookingData.type,
        symptoms: bookingData.symptoms || undefined,
        notes: bookingData.notes || undefined,
      };

      const response = await ApiService.createAppointment(appointmentPayload);
      if (response.data) {
        Alert.alert('Success', `Appointment booked${bookingForSelf ? '' : ' for student'} successfully`);
        setShowBookingModal(false);
        resetBookingForm();
        loadAppointments();
      } else {
        Alert.alert('Error', response.error || 'Failed to book appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.cancelAppointment(appointmentId);
              if (response.data !== undefined || !response.error) {
                Alert.alert('Done', 'Appointment cancelled');
                setShowDetailsModal(false);
                loadAppointments();
              } else {
                Alert.alert('Error', response.error || 'Failed to cancel appointment');
              }
            } catch {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return '🚨';
      case 'ROUTINE_CHECKUP': return '🏥';
      case 'FOLLOW_UP': return '🔄';
      case 'VACCINATION': return '💉';
      default: return '📋';
    }
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <View style={s.header}>
          <Title style={s.title}>My Appointments</Title>
          <Button mode="outlined" onPress={() => navigation.navigate('CreateAppointment', {})}>
            Advanced
          </Button>
        </View>

        {loading ? (
          <Card style={s.card}><Card.Content><Text style={s.mutedText}>Loading...</Text></Card.Content></Card>
        ) : appointments.length === 0 ? (
          <Card style={s.card}>
            <Card.Content style={s.emptyContent}>
              <Text style={s.emptyText}>No appointments scheduled</Text>
              <Paragraph style={s.mutedText}>Use the + button to book one</Paragraph>
            </Card.Content>
          </Card>
        ) : (
          appointments.map((apt) => (
            <Card key={apt.id} style={s.card}>
              <Card.Content>
                <View style={s.aptHeader}>
                  <View style={s.aptTypeRow}>
                    <Text style={s.typeIcon}>{getTypeIcon(apt.type)}</Text>
                    <Text style={s.aptType}>{apt.type?.replace(/_/g, ' ')}</Text>
                  </View>
                  <Chip
                    compact
                    style={[s.statusChip, { backgroundColor: getStatusColor(apt.status) }]}
                    textStyle={s.statusChipText}
                  >
                    {apt.status?.replace(/_/g, ' ')}
                  </Chip>
                </View>

                {apt.nurse && (
                  <Text style={s.nurseText}>
                    👩‍⚕️ {apt.nurse.firstName ? `${apt.nurse.firstName} ${apt.nurse.lastName || ''}`.trim() : apt.nurse.username}
                  </Text>
                )}

                <Text style={s.dateTime}>📅 {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : 'N/A'}</Text>
                <Text style={s.dateTime}>🕐 {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleTimeString() : 'N/A'}</Text>

                {apt.symptoms && <Paragraph style={s.symptoms}>🩺 {apt.symptoms}</Paragraph>}

                <View style={s.actions}>
                  <Button mode="outlined" onPress={() => { setSelectedAppointment(apt); setShowDetailsModal(true); }}>
                    View Details
                  </Button>
                  {apt.status === 'PENDING' && (
                    <Button mode="text" textColor={colors.danger} onPress={() => handleCancelAppointment(apt.id)}>
                      Cancel
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB icon="plus" style={s.fab} onPress={() => openBookingModal(true)} />

      <Portal>
        {/* Booking Modal */}
        <Modal visible={showBookingModal} onDismiss={() => setShowBookingModal(false)} contentContainerStyle={s.modalContent}>
          <ScrollView>
            <Title style={s.modalTitle}>
              {bookingForSelf ? 'Book Appointment' : 'Book for Student'}
            </Title>

            {/* Toggle self / student */}
            <View style={s.toggleRow}>
              <TouchableOpacity
                style={[s.toggleChip, bookingForSelf && { backgroundColor: colors.primary }]}
                onPress={() => setBookingForSelf(true)}
              >
                <Text style={[s.toggleChipText, bookingForSelf && { color: '#fff' }]}>For Myself</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.toggleChip, !bookingForSelf && { backgroundColor: colors.primary }]}
                onPress={() => setBookingForSelf(false)}
              >
                <Text style={[s.toggleChipText, !bookingForSelf && { color: '#fff' }]}>For a Student</Text>
              </TouchableOpacity>
            </View>

            {/* Student identifier */}
            {!bookingForSelf && (
              <TextInput
                label="Student ID / Email / Roll Number"
                value={bookingData.studentIdentifier}
                onChangeText={(t) => setBookingData((p) => ({ ...p, studentIdentifier: t }))}
                mode="outlined"
                style={s.input}
              />
            )}

            {/* Date picker */}
            <Text style={s.inputLabel}>Appointment Date</Text>
            <DatePickerInput
              locale="en"
              mode="outlined"
              label="Select Date"
              value={bookingData.appointmentDate}
              onChange={(d) => setBookingData((p) => ({ ...p, appointmentDate: d ?? new Date() }))}
              style={s.input}
              inputMode="start"
            />

            {/* Type selector */}
            <Text style={s.inputLabel}>Appointment Type</Text>
            <View style={s.typePickerRow}>
              {appointmentTypeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setBookingData((p) => ({ ...p, type: opt.value }))}
                  style={[
                    s.typeChip,
                    { borderColor: colors.primary },
                    bookingData.type === opt.value && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[s.typeChipText, bookingData.type === opt.value && { color: '#fff' }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              label="Symptoms"
              value={bookingData.symptoms}
              onChangeText={(t) => setBookingData((p) => ({ ...p, symptoms: t }))}
              mode="outlined"
              style={s.input}
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Notes"
              value={bookingData.notes}
              onChangeText={(t) => setBookingData((p) => ({ ...p, notes: t }))}
              mode="outlined"
              style={s.input}
              multiline
              numberOfLines={2}
            />

            <View style={s.modalActions}>
              <Button mode="text" onPress={() => setShowBookingModal(false)}>Close</Button>
              <Button mode="contained" onPress={handleBookAppointment} loading={bookingLoading} disabled={bookingLoading}>
                Book
              </Button>
            </View>
          </ScrollView>
        </Modal>

        {/* Details Modal */}
        <Modal visible={showDetailsModal} onDismiss={() => setShowDetailsModal(false)} contentContainerStyle={s.modalContent}>
          <ScrollView>
            <Title style={s.modalTitle}>Appointment Details</Title>

            {selectedAppointment && (
              <>
                <View style={s.detailStatusRow}>
                  <Chip
                    style={[s.statusChip, { backgroundColor: getStatusColor(selectedAppointment.status) }]}
                    textStyle={{ color: '#fff', fontWeight: 'bold' }}
                  >
                    {selectedAppointment.status?.replace(/_/g, ' ')}
                  </Chip>
                </View>

                <Divider style={s.divider} />

                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Type</Text>
                  <Text style={s.detailValue}>{getTypeIcon(selectedAppointment.type)} {selectedAppointment.type?.replace(/_/g, ' ')}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Date & Time</Text>
                  <Text style={s.detailValue}>
                    {selectedAppointment.appointmentDate
                      ? `${new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at ${new Date(selectedAppointment.appointmentDate).toLocaleTimeString()}`
                      : 'N/A'}
                  </Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>Nurse</Text>
                  <Text style={s.detailValue}>
                    {selectedAppointment.nurse
                      ? (selectedAppointment.nurse.firstName
                        ? `${selectedAppointment.nurse.firstName} ${selectedAppointment.nurse.lastName || ''}`.trim()
                        : selectedAppointment.nurse.username)
                      : 'Not assigned'}
                  </Text>
                </View>

                <Divider style={s.divider} />

                {selectedAppointment.symptoms && <View style={s.detailRow}><Text style={s.detailLabel}>Symptoms</Text><Text style={s.detailValue}>{selectedAppointment.symptoms}</Text></View>}
                {selectedAppointment.diagnosis && <View style={s.detailRow}><Text style={s.detailLabel}>Diagnosis</Text><Text style={s.detailValue}>{selectedAppointment.diagnosis}</Text></View>}
                {selectedAppointment.prescription && (
                  <View style={s.detailRow}>
                    <Text style={s.detailLabel}>Prescription</Text>
                    <Text style={[s.detailValue, s.prescriptionBox]}>{selectedAppointment.prescription}</Text>
                  </View>
                )}
                {selectedAppointment.notes && <View style={s.detailRow}><Text style={s.detailLabel}>Notes</Text><Text style={s.detailValue}>{selectedAppointment.notes}</Text></View>}

                <View style={s.modalActions}>
                  {selectedAppointment.status === 'PENDING' && (
                    <Button mode="outlined" textColor={colors.danger} onPress={() => handleCancelAppointment(selectedAppointment.id)} style={{ borderColor: colors.danger }}>
                      Cancel Appointment
                    </Button>
                  )}
                  <Button mode="contained" onPress={() => setShowDetailsModal(false)}>Close</Button>
                </View>
              </>
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    contentContainer: { padding: responsive.padding.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsive.margin.lg },
    title: { fontSize: responsive.fontSize.xl, color: colors.text },
    card: { marginBottom: responsive.margin.md, elevation: 2, backgroundColor: colors.card },
    emptyContent: { alignItems: 'center', paddingVertical: responsive.padding.xl },
    emptyText: { fontSize: responsive.fontSize.lg, color: colors.textSecondary, fontWeight: 'bold' },
    mutedText: { color: colors.textMuted, textAlign: 'center' },
    aptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsive.margin.sm },
    aptTypeRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    typeIcon: { fontSize: responsive.fontSize.xl, marginRight: responsive.margin.sm },
    aptType: { fontSize: responsive.fontSize.md, color: colors.text, fontWeight: '600', flex: 1 },
    statusChip: { height: 28 },
    statusChipText: { color: '#fff', fontSize: responsive.fontSize.xs, fontWeight: 'bold' },
    nurseText: { fontSize: responsive.fontSize.sm, color: colors.info, fontWeight: '600', marginBottom: responsive.margin.xs },
    dateTime: { fontSize: responsive.fontSize.sm, color: colors.textSecondary, marginBottom: responsive.margin.xs },
    symptoms: { fontSize: responsive.fontSize.sm, color: colors.textSecondary },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: responsive.margin.sm },
    fab: { position: 'absolute', margin: responsive.margin.md, right: 0, bottom: 0, backgroundColor: colors.primary },
    // Modal
    modalContent: { backgroundColor: colors.modalBackground, padding: responsive.padding.lg, margin: responsive.margin.lg, borderRadius: responsive.borderRadius.lg, maxHeight: responsive.height(600) },
    modalTitle: { fontSize: responsive.fontSize.xl, color: colors.text, textAlign: 'center', marginBottom: responsive.margin.md },
    toggleRow: { flexDirection: 'row', gap: responsive.margin.sm, marginBottom: responsive.margin.lg },
    toggleChip: { flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: responsive.borderRadius.lg, paddingVertical: responsive.padding.xs, alignItems: 'center' },
    toggleChipText: { color: colors.primary, fontWeight: '600', fontSize: responsive.fontSize.sm },
    inputLabel: { fontSize: responsive.fontSize.sm, fontWeight: 'bold', color: colors.text, marginBottom: responsive.margin.xs },
    input: { marginBottom: responsive.margin.md },
    typePickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: responsive.margin.sm, marginBottom: responsive.margin.lg },
    typeChip: { borderWidth: 1.5, borderRadius: responsive.borderRadius.lg, paddingHorizontal: responsive.padding.sm, paddingVertical: responsive.padding.xs },
    typeChipText: { color: colors.primary, fontSize: responsive.fontSize.sm, fontWeight: '600' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: responsive.margin.lg },
    // Details
    detailStatusRow: { alignItems: 'center', marginBottom: responsive.margin.md },
    divider: { marginVertical: responsive.margin.md, backgroundColor: colors.divider },
    detailRow: { marginBottom: responsive.margin.md },
    detailLabel: { fontSize: responsive.fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold', marginBottom: 2 },
    detailValue: { fontSize: responsive.fontSize.md, color: colors.text },
    prescriptionBox: { backgroundColor: colors.surfaceVariant, padding: responsive.padding.sm, borderRadius: responsive.borderRadius.sm, borderLeftWidth: 3, borderLeftColor: colors.primary },
  });

export default StaffAppointmentsScreen;
