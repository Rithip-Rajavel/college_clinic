import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Searchbar,
  Chip,
  Portal,
  Modal,
  TextInput,
  Divider,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';
import { APPOINTMENT_STATUS, APPOINTMENT_TYPES } from '../../constants/api';

const NurseAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    diagnosis: '',
    prescription: '',
    notes: '',
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNurseAppointments();

      console.log('Nurse appointments response:', response);

      // Check for serialization errors in response
      if (response.error && response.error.includes('ByteBuddyInterceptor')) {
        console.warn('Backend serialization error detected, using empty data');
        Alert.alert('API Error', 'There\'s a backend serialization issue. Please contact the administrator.');
        setAppointments([]);
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        console.log('Setting appointments:', response.data);
        setAppointments(response.data);
      } else {
        console.log('No appointments data found');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);

      // Check if it's the serialization error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('ByteBuddyInterceptor')) {
        Alert.alert('API Error', 'Backend serialization error. The API needs to be fixed to handle Hibernate proxies properly.');
      } else {
        Alert.alert('Error', 'Failed to load appointments');
      }

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment || !updateData.status) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    try {
      const response = await ApiService.updateAppointment(
        selectedAppointment.id,
        updateData.status,
        updateData.diagnosis,
        updateData.prescription
      );

      if (response.data) {
        Alert.alert('Success', 'Appointment updated successfully');
        setShowUpdateModal(false);
        setSelectedAppointment(null);
        setUpdateData({
          status: '',
          diagnosis: '',
          prescription: '',
          notes: '',
        });
        loadAppointments();
      } else {
        Alert.alert('Error', 'Failed to update appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update appointment');
    }
  };

  const handleApproveAppointment = async (appointmentId: number) => {
    try {
      const response = await ApiService.approveAppointment(appointmentId);
      if (response.data) {
        Alert.alert('Success', 'Appointment approved');
        loadAppointments();
      } else {
        Alert.alert('Error', 'Failed to approve appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve appointment');
    }
  };

  const openUpdateModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setUpdateData({
      status: appointment.status,
      diagnosis: appointment.diagnosis || '',
      prescription: appointment.prescription || '',
      notes: appointment.notes || '',
    });
    setShowUpdateModal(true);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return '🚨';
      case 'ROUTINE_CHECKUP': return '🏥';
      case 'FOLLOW_UP': return '🔄';
      case 'VACCINATION': return '💉';
      default: return '📋';
    }
  };

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const updateStatusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchQuery ||
      appointment.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patient?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.symptoms?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;

    console.log('Filtering appointment:', {
      appointment,
      searchQuery,
      selectedStatus,
      matchesSearch,
      matchesStatus
    });

    return matchesSearch && matchesStatus;
  });

  console.log('Total appointments:', appointments.length);
  console.log('Filtered appointments:', filteredAppointments.length);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        <Title style={styles.title}>Manage Appointments</Title>
        <Paragraph style={styles.subtitle}>
          View and manage all patient appointments
        </Paragraph>

        <Searchbar
          placeholder="Search appointments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Status:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusScroll}
            contentContainerStyle={styles.statusContent}
          >
            {statusOptions.map((status) => (
              <Chip
                key={status.value}
                selected={selectedStatus === status.value}
                onPress={() => setSelectedStatus(status.value)}
                style={[
                  styles.statusChip,
                  selectedStatus === status.value && styles.selectedStatusChip
                ]}
              >
                {status.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {filteredAppointments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedStatus !== 'all' ? 'No appointments found' : 'No appointments available'}
              </Text>
              <Paragraph style={styles.emptySubtext}>
                {searchQuery || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Appointments will appear here when patients book them'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} style={styles.appointmentCard}>
              <Card.Content>
                <View style={styles.appointmentHeader}>
                  <View style={styles.patientInfo}>
                    <Text style={styles.typeIcon}>{getTypeIcon(appointment.type)}</Text>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>
                        {appointment.patient?.firstName || appointment.patient?.username}
                      </Text>
                      <Text style={styles.patientInfoText}>
                        {appointment.patient.rollNumber} • {appointment.patient.mobileNumber}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    <Chip
                      compact
                      style={[styles.statusChip, { backgroundColor: getStatusColor(appointment.status) }]}
                      textStyle={styles.statusChipText}
                    >
                      {appointment.status.replace('_', ' ')}
                    </Chip>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <Text style={styles.detailText}>
                    📅 {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.detailText}>
                    🕐 {new Date(appointment.appointmentDate).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.detailText}>
                    🏷️ {appointment.type.replace('_', ' ')}
                  </Text>
                </View>

                {appointment.symptoms && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Symptoms:</Text>
                    <Text style={styles.sectionContent}>{appointment.symptoms}</Text>
                  </View>
                )}

                {appointment.diagnosis && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Diagnosis:</Text>
                    <Text style={styles.sectionContent}>{appointment.diagnosis}</Text>
                  </View>
                )}

                {appointment.prescription && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prescription:</Text>
                    <Text style={styles.prescriptionText}>{appointment.prescription}</Text>
                  </View>
                )}

                {appointment.notes && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes:</Text>
                    <Text style={styles.sectionContent}>{appointment.notes}</Text>
                  </View>
                )}

                <View style={styles.actions}>
                  {appointment.status === 'PENDING' && (
                    <>
                      <Button
                        mode="contained"
                        style={styles.approveButton}
                        onPress={() => handleApproveAppointment(appointment.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        mode="outlined"
                        style={styles.updateButton}
                        onPress={() => openUpdateModal(appointment)}
                      >
                        Update
                      </Button>
                    </>
                  )}

                  {appointment.status === 'APPROVED' && (
                    <Button
                      mode="contained"
                      style={styles.updateButton}
                      onPress={() => openUpdateModal(appointment)}
                    >
                      Update Status
                    </Button>
                  )}

                  {appointment.status === 'IN_PROGRESS' && (
                    <Button
                      mode="contained"
                      style={styles.completeButton}
                      onPress={() => openUpdateModal(appointment)}
                    >
                      Complete
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={showUpdateModal}
          onDismiss={() => setShowUpdateModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Update Appointment</Title>

          <Text style={styles.patientLabel}>
            Patient: {selectedAppointment?.patient?.firstName || selectedAppointment?.patient?.username}
          </Text>

          <TextInput
            label="Status"
            value={updateData.status}
            onChangeText={(text) => setUpdateData(prev => ({ ...prev, status: text }))}
            mode="outlined"
            style={styles.input}
            editable={false}
          />

          <TextInput
            label="Diagnosis"
            value={updateData.diagnosis}
            onChangeText={(text) => setUpdateData(prev => ({ ...prev, diagnosis: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Prescription"
            value={updateData.prescription}
            onChangeText={(text) => setUpdateData(prev => ({ ...prev, prescription: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Notes"
            value={updateData.notes}
            onChangeText={(text) => setUpdateData(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowUpdateModal(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateAppointment}
              style={styles.saveButton}
            >
              Update
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="calendar-plus"
        style={styles.fab}
        onPress={() => (navigation as any).navigate('CreateAppointment')}
      />
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
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: responsive.fontSize.md,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: responsive.margin.lg,
  },
  searchBar: {
    marginBottom: responsive.margin.lg,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: responsive.margin.lg,
  },
  filterLabel: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.sm,
  },
  statusScroll: {
    marginBottom: responsive.margin.sm,
  },
  statusContent: {
    paddingRight: responsive.padding.md,
  },
  statusChip: {
    marginRight: responsive.margin.sm,
  },
  statusChipText: {
    color: 'white',
    fontSize: responsive.fontSize.xs,
    fontWeight: 'bold',
  },
  selectedStatusChip: {
    backgroundColor: '#3498db',
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
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: responsive.margin.md,
  },
  patientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIcon: {
    fontSize: responsive.fontSize.xxxl,
    marginRight: responsive.margin.md,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: responsive.fontSize.lg,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  patientInfoText: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
  },
  statusContainer: {
    marginLeft: responsive.margin.sm,
  },
  appointmentDetails: {
    marginBottom: responsive.margin.md,
  },
  detailText: {
    fontSize: responsive.fontSize.sm,
    color: '#555',
    marginBottom: responsive.margin.xs,
  },
  section: {
    marginBottom: responsive.margin.md,
  },
  sectionTitle: {
    fontSize: responsive.fontSize.sm,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  sectionContent: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    lineHeight: responsive.fontSize.lg,
  },
  prescriptionText: {
    fontSize: responsive.fontSize.md,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    padding: responsive.padding.md,
    borderRadius: responsive.borderRadius.md,
    lineHeight: responsive.fontSize.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsive.margin.md,
  },
  approveButton: {
    flex: 1,
    marginRight: responsive.margin.sm,
    backgroundColor: '#27ae60',
  },
  updateButton: {
    flex: 1,
    marginLeft: responsive.margin.sm,
    borderColor: '#3498db',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#8e44ad',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: responsive.padding.lg,
    margin: responsive.margin.lg,
    borderRadius: responsive.borderRadius.lg,
    maxHeight: responsive.height(500),
  },
  modalTitle: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
    marginBottom: responsive.margin.lg,
    textAlign: 'center',
  },
  patientLabel: {
    fontSize: responsive.fontSize.md,
    color: '#7f8c8d',
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
  saveButton: {
    backgroundColor: '#3498db',
  },
  fab: {
    position: 'absolute',
    margin: responsive.margin.md,
    right: 0,
    bottom: 0,
    backgroundColor: '#3498db',
  },
});

export default NurseAppointmentsScreen;
