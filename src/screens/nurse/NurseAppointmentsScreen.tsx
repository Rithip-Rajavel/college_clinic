import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
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
import { useTheme } from '../../contexts/ThemeContext';
import ApiService from '../../services/api';

const NurseAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const s = makeStyles(colors);

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

  useEffect(() => { loadAppointments(); }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNurseAppointments();
      if (response.error) {
        Alert.alert('Error', 'Failed to load appointments. Please try again.');
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

  const onRefresh = async () => { setRefreshing(true); await loadAppointments(); setRefreshing(false); };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment || !updateData.status) { Alert.alert('Error', 'Please select a status'); return; }
    try {
      const response = await ApiService.updateAppointment(
        selectedAppointment.id, updateData.status,
        updateData.diagnosis || undefined, updateData.prescription || undefined
      );
      if (response.data) {
        Alert.alert('Success', 'Appointment updated successfully');
        setShowUpdateModal(false);
        setSelectedAppointment(null);
        setUpdateData({ status: '', diagnosis: '', prescription: '', notes: '' });
        loadAppointments();
      } else {
        Alert.alert('Error', response.error || 'Failed to update appointment');
      }
    } catch { Alert.alert('Error', 'Failed to update appointment'); }
  };

  const handleApproveAppointment = async (id: number) => {
    Alert.alert('Approve Appointment', 'Approve this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: async () => {
        try {
          const r = await ApiService.approveAppointment(id);
          if (r.data) { Alert.alert('Success', 'Appointment approved'); loadAppointments(); }
          else Alert.alert('Error', r.error || 'Failed');
        } catch { Alert.alert('Error', 'Failed to approve'); }
      }},
    ]);
  };

  const handleRejectAppointment = async (id: number) => {
    Alert.alert('Reject Appointment', 'Reject/cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        try {
          const r = await ApiService.cancelAppointment(id);
          if (r.data !== undefined || !r.error) { Alert.alert('Done', 'Appointment rejected'); loadAppointments(); }
          else Alert.alert('Error', r.error || 'Failed');
        } catch { Alert.alert('Error', 'Failed to reject'); }
      }},
    ]);
  };

  const openUpdateModal = (apt: any) => {
    setSelectedAppointment(apt);
    setUpdateData({ status: apt.status, diagnosis: apt.diagnosis || '', prescription: apt.prescription || '', notes: apt.notes || '' });
    setShowUpdateModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return colors.warning;
      case 'APPROVED': return colors.success;
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

  const statusOptions = [
    { label: 'All', value: 'all' }, { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' }, { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' }, { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const updateStatusOptions = [
    { label: 'Pending', value: 'PENDING' }, { label: 'Approved', value: 'APPROVED' },
    { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const filteredAppointments = appointments.filter(apt => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      apt.patient?.firstName?.toLowerCase().includes(q) ||
      apt.patient?.lastName?.toLowerCase().includes(q) ||
      apt.patient?.username?.toLowerCase().includes(q) ||
      apt.patient?.rollNumber?.toLowerCase().includes(q) ||
      apt.symptoms?.toLowerCase().includes(q) ||
      apt.diagnosis?.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={s.container}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <Title style={s.title}>Manage Appointments</Title>
        <Paragraph style={s.subtitle}>View and manage all patient appointments</Paragraph>

        <Searchbar
          placeholder="Search by name, roll no, symptoms..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={s.searchBar}
        />

        <View style={s.filterContainer}>
          <Text style={s.filterLabel}>Filter by Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statusContent}>
            {statusOptions.map((opt) => (
              <Chip
                key={opt.value}
                selected={selectedStatus === opt.value}
                onPress={() => setSelectedStatus(opt.value)}
                style={[s.statusFilterChip, selectedStatus === opt.value && { backgroundColor: colors.primary }]}
              >
                {opt.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <Text style={s.countText}>{filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found</Text>

        {loading ? (
          <Card style={s.card}><Card.Content><Text style={s.mutedText}>Loading appointments...</Text></Card.Content></Card>
        ) : filteredAppointments.length === 0 ? (
          <Card style={s.emptyCard}>
            <Card.Content style={s.emptyContent}>
              <Text style={s.emptyText}>{searchQuery || selectedStatus !== 'all' ? 'No appointments found' : 'No appointments available'}</Text>
              <Paragraph style={s.mutedText}>{searchQuery || selectedStatus !== 'all' ? 'Try adjusting your search or filter' : 'Appointments will appear here when patients book them'}</Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredAppointments.map((apt) => (
            <Card key={apt.id} style={s.card}>
              <Card.Content>
                <View style={s.aptHeader}>
                  <View style={s.patientInfo}>
                    <Text style={s.typeIcon}>{getTypeIcon(apt.type)}</Text>
                    <View style={s.patientDetails}>
                      <Text style={s.patientName}>
                        {apt.patient?.firstName ? `${apt.patient.firstName} ${apt.patient.lastName || ''}`.trim() : apt.patient?.username || 'Unknown Patient'}
                      </Text>
                      <Text style={s.patientInfoText}>📛 {apt.patient?.rollNumber ?? 'N/A'} • 📞 {apt.patient?.mobileNumber ?? 'N/A'}</Text>
                    </View>
                  </View>
                  <Chip compact style={[s.statusBadge, { backgroundColor: getStatusColor(apt.status) }]} textStyle={s.statusBadgeText}>
                    {apt.status?.replace(/_/g, ' ')}
                  </Chip>
                </View>

                <View style={s.nurseRow}>
                  <Text style={s.nurseLabel}>👩‍⚕️ Nurse: </Text>
                  <Text style={s.nurseValue}>
                    {apt.nurse?.firstName ? `${apt.nurse.firstName} ${apt.nurse.lastName || ''}`.trim() : apt.nurse?.username || 'Not assigned'}
                  </Text>
                </View>

                <Divider style={s.divider} />

                <Text style={s.detailText}>📅 {new Date(apt.appointmentDate).toLocaleDateString()}</Text>
                <Text style={s.detailText}>🕐 {new Date(apt.appointmentDate).toLocaleTimeString()}</Text>
                <Text style={s.detailText}>🏷️ {apt.type?.replace(/_/g, ' ')}</Text>

                {apt.symptoms && <View style={s.section}><Text style={s.sectionTitle}>Symptoms:</Text><Text style={s.sectionContent}>{apt.symptoms}</Text></View>}
                {apt.diagnosis && <View style={s.section}><Text style={s.sectionTitle}>Diagnosis:</Text><Text style={s.sectionContent}>{apt.diagnosis}</Text></View>}
                {apt.prescription && <View style={s.section}><Text style={s.sectionTitle}>Prescription:</Text><Text style={s.prescriptionText}>{apt.prescription}</Text></View>}
                {apt.notes && <View style={s.section}><Text style={s.sectionTitle}>Notes:</Text><Text style={s.sectionContent}>{apt.notes}</Text></View>}

                <View style={s.actions}>
                  {apt.status === 'PENDING' && (
                    <>
                      <Button mode="contained" style={s.approveButton} onPress={() => handleApproveAppointment(apt.id)} compact>Approve</Button>
                      <Button mode="outlined" style={s.updateButton} onPress={() => openUpdateModal(apt)} compact>Update</Button>
                      <Button mode="outlined" style={s.rejectButton} onPress={() => handleRejectAppointment(apt.id)} compact>Reject</Button>
                    </>
                  )}
                  {apt.status === 'APPROVED' && (
                    <>
                      <Button mode="contained" style={s.updateButton} onPress={() => openUpdateModal(apt)} compact>Update Status</Button>
                      <Button mode="outlined" style={s.rejectButton} onPress={() => handleRejectAppointment(apt.id)} compact>Cancel</Button>
                    </>
                  )}
                  {apt.status === 'IN_PROGRESS' && (
                    <Button mode="contained" style={s.completeButton} onPress={() => openUpdateModal(apt)}>Complete / Update</Button>
                  )}
                  {(apt.status === 'COMPLETED' || apt.status === 'CANCELLED') && (
                    <Button mode="outlined" onPress={() => openUpdateModal(apt)}>View / Edit Details</Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal visible={showUpdateModal} onDismiss={() => setShowUpdateModal(false)} contentContainerStyle={s.modalContent}>
          <ScrollView>
            <Title style={s.modalTitle}>Update Appointment</Title>
            <Text style={s.patientLabel}>
              Patient: {selectedAppointment?.patient?.firstName
                ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName || ''}`.trim()
                : selectedAppointment?.patient?.username || 'Unknown'}
            </Text>

            <Text style={s.statusPickerLabel}>Select Status:</Text>
            <View style={s.statusPickerRow}>
              {updateStatusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setUpdateData(p => ({ ...p, status: opt.value }))}
                  style={[s.statusPickerChip, { borderColor: getStatusColor(opt.value) }, updateData.status === opt.value && { backgroundColor: getStatusColor(opt.value) }]}
                >
                  <Text style={[s.statusPickerChipText, { color: updateData.status === opt.value ? '#fff' : getStatusColor(opt.value) }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput label="Diagnosis" value={updateData.diagnosis} onChangeText={(t) => setUpdateData(p => ({ ...p, diagnosis: t }))} mode="outlined" style={s.input} multiline numberOfLines={3} />
            <TextInput label="Prescription" value={updateData.prescription} onChangeText={(t) => setUpdateData(p => ({ ...p, prescription: t }))} mode="outlined" style={s.input} multiline numberOfLines={3} />
            <TextInput label="Notes" value={updateData.notes} onChangeText={(t) => setUpdateData(p => ({ ...p, notes: t }))} mode="outlined" style={s.input} multiline numberOfLines={2} />

            <View style={s.modalActions}>
              <Button mode="text" onPress={() => setShowUpdateModal(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleUpdateAppointment} style={s.saveButton} disabled={!updateData.status}>Update</Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <FAB icon="calendar-plus" style={s.fab} onPress={() => (navigation as any).navigate('CreateAppointment')} />
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  contentContainer: { padding: responsive.padding.md },
  title: { fontSize: responsive.fontSize.xl, color: colors.text, marginBottom: responsive.margin.sm, textAlign: 'center' },
  subtitle: { fontSize: responsive.fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: responsive.margin.lg },
  searchBar: { marginBottom: responsive.margin.lg, elevation: 2 },
  filterContainer: { marginBottom: responsive.margin.sm },
  filterLabel: { fontSize: responsive.fontSize.md, fontWeight: 'bold', color: colors.text, marginBottom: responsive.margin.sm },
  statusContent: { paddingRight: responsive.padding.md, gap: responsive.margin.sm },
  statusFilterChip: { marginRight: responsive.margin.sm },
  countText: { fontSize: responsive.fontSize.sm, color: colors.textMuted, marginBottom: responsive.margin.md, textAlign: 'right' },
  card: { marginBottom: responsive.margin.md, elevation: 2, backgroundColor: colors.card },
  emptyCard: { elevation: 2, marginTop: responsive.margin.xl, backgroundColor: colors.card },
  emptyContent: { alignItems: 'center', padding: responsive.padding.xl },
  emptyText: { fontSize: responsive.fontSize.lg, color: colors.textSecondary, marginBottom: responsive.margin.sm, textAlign: 'center' },
  mutedText: { color: colors.textMuted, textAlign: 'center' },
  aptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: responsive.margin.sm },
  patientInfo: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  typeIcon: { fontSize: responsive.fontSize.xxxl, marginRight: responsive.margin.md },
  patientDetails: { flex: 1 },
  patientName: { fontSize: responsive.fontSize.lg, fontWeight: 'bold', color: colors.text, marginBottom: responsive.margin.xs },
  patientInfoText: { fontSize: responsive.fontSize.sm, color: colors.textSecondary },
  statusBadge: { height: 28 },
  statusBadgeText: { color: '#fff', fontSize: responsive.fontSize.xs, fontWeight: 'bold' },
  nurseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: responsive.margin.sm },
  nurseLabel: { fontSize: responsive.fontSize.sm, color: colors.textMuted },
  nurseValue: { fontSize: responsive.fontSize.sm, color: colors.text, fontWeight: '600' },
  divider: { marginVertical: responsive.margin.sm, backgroundColor: colors.divider },
  detailText: { fontSize: responsive.fontSize.sm, color: colors.textSecondary, marginBottom: responsive.margin.xs },
  section: { marginBottom: responsive.margin.md },
  sectionTitle: { fontSize: responsive.fontSize.sm, fontWeight: 'bold', color: colors.text, marginBottom: responsive.margin.xs },
  sectionContent: { fontSize: responsive.fontSize.md, color: colors.textSecondary },
  prescriptionText: { fontSize: responsive.fontSize.md, color: colors.text, backgroundColor: colors.surfaceVariant, padding: responsive.padding.md, borderRadius: responsive.borderRadius.md, borderLeftWidth: 4, borderLeftColor: colors.primary },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: responsive.margin.sm, marginTop: responsive.margin.md },
  approveButton: { flex: 1, minWidth: 80, backgroundColor: colors.success },
  updateButton: { flex: 1, minWidth: 80, borderColor: colors.info },
  rejectButton: { flex: 1, minWidth: 80, borderColor: colors.danger },
  completeButton: { flex: 1, backgroundColor: colors.purple },
  // Modal
  modalContent: { backgroundColor: colors.modalBackground, padding: responsive.padding.lg, margin: responsive.margin.lg, borderRadius: responsive.borderRadius.lg, maxHeight: responsive.height(600) },
  modalTitle: { fontSize: responsive.fontSize.xl, color: colors.text, marginBottom: responsive.margin.md, textAlign: 'center' },
  patientLabel: { fontSize: responsive.fontSize.md, color: colors.textSecondary, marginBottom: responsive.margin.lg, textAlign: 'center' },
  statusPickerLabel: { fontSize: responsive.fontSize.sm, fontWeight: 'bold', color: colors.text, marginBottom: responsive.margin.sm },
  statusPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: responsive.margin.sm, marginBottom: responsive.margin.lg },
  statusPickerChip: { borderWidth: 2, borderRadius: responsive.borderRadius.lg, paddingHorizontal: responsive.padding.md, paddingVertical: responsive.padding.xs },
  statusPickerChipText: { fontSize: responsive.fontSize.sm, fontWeight: '600' },
  input: { marginBottom: responsive.margin.md },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: responsive.margin.lg },
  saveButton: { backgroundColor: colors.primary },
  fab: { position: 'absolute', margin: responsive.margin.md, right: 0, bottom: 0, backgroundColor: colors.primary },
});

export default NurseAppointmentsScreen;
