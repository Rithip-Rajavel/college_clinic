import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Divider,
  Searchbar,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

const StaffPrescriptionsScreen: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyAppointments();
      if (response.data && Array.isArray(response.data)) {
        // Filter appointments that have prescriptions
        const prescriptionData = response.data.filter((appointment: any) =>
          appointment.prescription && appointment.status === 'COMPLETED'
        );
        setPrescriptions(prescriptionData);
      } else {
        setPrescriptions([]);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      Alert.alert('Error', 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSharePrescription = async (prescription: any) => {
    try {
      const prescriptionText = `
PRESCRIPTION
=============
Date: ${new Date(prescription.appointmentDate).toLocaleDateString()}
Patient: ${prescription.patient?.firstName || prescription.patient?.username}
Diagnosis: ${prescription.diagnosis || 'N/A'}

Prescription:
${prescription.prescription}

Notes: ${prescription.notes || 'N/A'}

Issued by: Campus Health System
      `.trim();

      await Share.share({
        message: prescriptionText,
        title: 'Medical Prescription',
      });
    } catch (error) {
      console.error('Error sharing prescription:', error);
      Alert.alert('Error', 'Failed to share prescription');
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.prescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.patient?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPrescriptionType = (prescription: any) => {
    if (prescription.type === 'EMERGENCY') return '🚨 Emergency';
    if (prescription.type === 'ROUTINE_CHECKUP') return '🏥 Routine';
    if (prescription.type === 'FOLLOW_UP') return '🔄 Follow-up';
    if (prescription.type === 'VACCINATION') return '💉 Vaccination';
    return '📋 Other';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Title style={styles.title}>My Prescriptions</Title>
        <Paragraph style={styles.subtitle}>
          View and share your digital prescriptions issued by the campus nurse
        </Paragraph>

        <Searchbar
          placeholder="Search prescriptions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {filteredPrescriptions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No prescriptions found' : 'No prescriptions available'}
              </Text>
              <Paragraph style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Prescriptions will appear here after your appointments are completed'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <Card key={prescription.id} style={styles.prescriptionCard}>
              <Card.Content>
                <View style={styles.prescriptionHeader}>
                  <View style={styles.prescriptionInfo}>
                    <Text style={styles.prescriptionType}>
                      {getPrescriptionType(prescription)}
                    </Text>
                    <Text style={styles.prescriptionDate}>
                      {new Date(prescription.appointmentDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleSharePrescription(prescription)}
                    style={styles.shareButton}
                  >
                    Share
                  </Button>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.prescriptionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issued for:</Text>
                    <Text style={styles.detailValue}>
                      {prescription.patient?.firstName || prescription.patient?.username}
                    </Text>
                  </View>

                  {prescription.diagnosis && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Diagnosis:</Text>
                      <Text style={styles.detailValue}>{prescription.diagnosis}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Prescription:</Text>
                    <Text style={styles.prescriptionText}>{prescription.prescription}</Text>
                  </View>

                  {prescription.notes && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Notes:</Text>
                      <Text style={styles.detailValue}>{prescription.notes}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issued by:</Text>
                    <Text style={styles.detailValue}>
                      {prescription.nurse?.firstName || prescription.nurse?.username} (Campus Nurse)
                    </Text>
                  </View>
                </View>

                <View style={styles.prescriptionActions}>
                  <Button
                    mode="contained"
                    onPress={() => handleSharePrescription(prescription)}
                    style={styles.shareMainButton}
                  >
                    Share Prescription
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
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
  prescriptionCard: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.md,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionType: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  prescriptionDate: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
  },
  shareButton: {
    borderColor: '#3498db',
  },
  divider: {
    marginVertical: responsive.margin.md,
  },
  prescriptionDetails: {
    marginBottom: responsive.margin.md,
  },
  detailRow: {
    marginBottom: responsive.margin.sm,
  },
  detailLabel: {
    fontSize: responsive.fontSize.sm,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  detailValue: {
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
  prescriptionActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: responsive.margin.md,
  },
  shareMainButton: {
    backgroundColor: '#3498db',
  },
});

export default StaffPrescriptionsScreen;
