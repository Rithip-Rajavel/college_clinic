import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';
import { APPOINTMENT_TYPES, APPOINTMENT_STATUS } from '../../constants/api';

const StaffAppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showStudentBookingModal, setShowStudentBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    appointmentDate: '',
    type: 'ROUTINE_CHECKUP',
    symptoms: '',
    notes: '',
    studentIdentifier: '',
  });

  const { user } = useAuth();

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
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!bookingData.appointmentDate || !bookingData.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const appointmentData = {
        patientId: user?.id || 0,
        appointmentDate: bookingData.appointmentDate,
        type: bookingData.type,
        symptoms: bookingData.symptoms,
        notes: bookingData.notes,
      };

      const response = await ApiService.createAppointment(appointmentData);
      if (response.data) {
        Alert.alert('Success', 'Appointment booked successfully');
        setShowBookingModal(false);
        setBookingData({
          appointmentDate: '',
          type: 'ROUTINE_CHECKUP',
          symptoms: '',
          notes: '',
          studentIdentifier: '',
        });
        loadAppointments();
      } else {
        Alert.alert('Error', response.error || 'Failed to book appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment');
    }
  };

  const handleBookForStudent = async () => {
    if (!bookingData.studentIdentifier || !bookingData.appointmentDate || !bookingData.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // First get the student by identifier
      const studentResponse = await ApiService.getUserByIdentifier(bookingData.studentIdentifier);
      if (!studentResponse.data) {
        Alert.alert('Error', 'Student not found');
        return;
      }

      const appointmentData = {
        patientId: (studentResponse.data as any)?.id || 0,
        appointmentDate: bookingData.appointmentDate,
        type: bookingData.type,
        symptoms: bookingData.symptoms,
        notes: bookingData.notes,
      };

      const response = await ApiService.createAppointment(appointmentData);
      if (response.data) {
        Alert.alert('Success', 'Appointment booked for student successfully');
        setShowStudentBookingModal(false);
        setBookingData({
          appointmentDate: '',
          type: 'ROUTINE_CHECKUP',
          symptoms: '',
          notes: '',
          studentIdentifier: '',
        });
        loadAppointments();
      } else {
        Alert.alert('Error', response.error || 'Failed to book appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment for student');
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const response = await ApiService.cancelAppointment(appointmentId);
      if (response.data) {
        Alert.alert('Success', 'Appointment cancelled');
        loadAppointments();
      } else {
        Alert.alert('Error', 'Failed to cancel appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#27ae60';
      case 'PENDING':
        return '#f39c12';
      case 'IN_PROGRESS':
        return '#3498db';
      case 'COMPLETED':
        return '#8e44ad';
      case 'CANCELLED':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const appointmentTypeOptions = [
    { label: 'Routine Checkup', value: 'ROUTINE_CHECKUP' },
    { label: 'Emergency', value: 'EMERGENCY' },
    { label: 'Follow Up', value: 'FOLLOW_UP' },
    { label: 'Vaccination', value: 'VACCINATION' },
    { label: 'Other', value: 'OTHER' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Title style={styles.title}>My Appointments</Title>

        {appointments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>No appointments scheduled</Text>
              <Paragraph style={styles.emptySubtext}>
                Book your first appointment to get started
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} style={styles.appointmentCard}>
              <Card.Content>
                <View style={styles.appointmentHeader}>
                  <Title style={styles.appointmentType}>{appointment.type.replace('_', ' ')}</Title>
                  <Text style={[styles.status, { color: getStatusColor(appointment.status) }]}>
                    {appointment.status.replace('_', ' ')}
                  </Text>
                </View>

                <Text style={styles.dateTime}>
                  📅 {new Date(appointment.appointmentDate).toLocaleDateString()}
                </Text>
                <Text style={styles.dateTime}>
                  🕐 {new Date(appointment.appointmentDate).toLocaleTimeString()}
                </Text>

                {appointment.symptoms && (
                  <Paragraph style={styles.symptoms}>
                    <Text style={styles.label}>Symptoms: </Text>
                    {appointment.symptoms}
                  </Paragraph>
                )}

                {appointment.diagnosis && (
                  <Paragraph style={styles.diagnosis}>
                    <Text style={styles.label}>Diagnosis: </Text>
                    {appointment.diagnosis}
                  </Paragraph>
                )}

                {appointment.prescription && (
                  <Paragraph style={styles.prescription}>
                    <Text style={styles.label}>Prescription: </Text>
                    {appointment.prescription}
                  </Paragraph>
                )}

                <View style={styles.actions}>
                  {appointment.status === 'PENDING' && (
                    <Button
                      mode="outlined"
                      style={styles.cancelButton}
                      onPress={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowBookingModal(true)}
      />

      <Portal>
        {/* Book Appointment Modal */}
        <Modal
          visible={showBookingModal}
          onDismiss={() => setShowBookingModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Book Appointment</Title>

          <TextInput
            label="Appointment Date & Time"
            value={bookingData.appointmentDate}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, appointmentDate: text }))}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM"
          />

          <TextInput
            label="Symptoms"
            value={bookingData.symptoms}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, symptoms: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Notes"
            value={bookingData.notes}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowStudentBookingModal(true)}
              style={styles.studentBookingButton}
            >
              Book for Student
            </Button>
            <Button
              mode="contained"
              onPress={handleBookAppointment}
              style={styles.bookButton}
            >
              Book for Myself
            </Button>
          </View>
        </Modal>

        {/* Book for Student Modal */}
        <Modal
          visible={showStudentBookingModal}
          onDismiss={() => setShowStudentBookingModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Book Appointment for Student</Title>

          <TextInput
            label="Student ID / Email / Roll Number"
            value={bookingData.studentIdentifier}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, studentIdentifier: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Appointment Date & Time"
            value={bookingData.appointmentDate}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, appointmentDate: text }))}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM"
          />

          <TextInput
            label="Symptoms"
            value={bookingData.symptoms}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, symptoms: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Notes"
            value={bookingData.notes}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowStudentBookingModal(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleBookForStudent}
              style={styles.bookButton}
            >
              Book Appointment
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
  title: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
    marginBottom: responsive.margin.lg,
    textAlign: 'center',
  },
  emptyCard: {
    elevation: 2,
    marginTop: responsive.margin.xl,
  },
  emptyContent: {
    alignItems: 'center',
    padding: responsive.padding.xl,
  },
  emptyText: {
    fontSize: responsive.fontSize.lg,
    color: '#7f8c8d',
    marginBottom: responsive.margin.sm,
  },
  emptySubtext: {
    fontSize: responsive.fontSize.md,
    color: '#95a5a6',
    textAlign: 'center',
  },
  appointmentCard: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.sm,
  },
  appointmentType: {
    fontSize: responsive.fontSize.lg,
    color: '#2c3e50',
    flex: 1,
  },
  status: {
    fontSize: responsive.fontSize.sm,
    fontWeight: 'bold',
    paddingHorizontal: responsive.padding.sm,
    paddingVertical: responsive.padding.xs,
    borderRadius: responsive.borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  dateTime: {
    fontSize: responsive.fontSize.md,
    color: '#7f8c8d',
    marginBottom: responsive.margin.xs,
  },
  label: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  symptoms: {
    fontSize: responsive.fontSize.sm,
    color: '#555',
    marginBottom: responsive.margin.xs,
  },
  diagnosis: {
    fontSize: responsive.fontSize.sm,
    color: '#555',
    marginBottom: responsive.margin.xs,
  },
  prescription: {
    fontSize: responsive.fontSize.sm,
    color: '#555',
    marginBottom: responsive.margin.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: responsive.margin.sm,
  },
  cancelButton: {
    borderColor: '#e74c3c',
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
  input: {
    marginBottom: responsive.margin.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsive.margin.lg,
  },
  studentBookingButton: {
    flex: 1,
    marginRight: responsive.margin.sm,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#27ae60',
  },
});

export default StaffAppointmentsScreen;
