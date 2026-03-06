import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

type StudentAppointmentsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StudentAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<StudentAppointmentsNavigationProp>();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyAppointments();

      // Check for serialization errors in response
      if (response.error && response.error.includes('ByteBuddyInterceptor')) {
        console.warn('Backend serialization error detected, using empty data');
        Alert.alert('API Error', 'There\'s a backend serialization issue. Please contact the administrator.');
        setAppointments([]);
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
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

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const response = await ApiService.cancelAppointment(appointmentId);
      if (response.data) {
        Alert.alert('Success', 'Appointment cancelled successfully');
        loadAppointments(); // Refresh the list
      } else {
        Alert.alert('Error', response.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#27ae60';
      case 'PENDING':
        return '#f39c12';
      case 'CANCELLED':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <ScrollView
      style={styles.container}
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
      <View style={styles.header}>
        <Title style={styles.title}>My Appointments</Title>
        <Button
          mode="contained"
          style={styles.bookButton}
          onPress={() => navigation.navigate('CreateAppointment', {})}
        >
          Book New Appointment
        </Button>
      </View>

      {loading ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </Card.Content>
        </Card>
      ) : appointments.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>No appointments scheduled</Text>
            <Paragraph style={styles.emptySubtext}>
              Book your first appointment to get started
            </Paragraph>
          </Card.Content>
        </Card>
      ) : (
        appointments.map((appointment) => (
          <Card key={appointment.id} style={styles.card}>
            <Card.Content>
              <View style={styles.appointmentHeader}>
                <Title style={styles.appointmentType}>{appointment.type?.replace('_', ' ') || 'Appointment'}</Title>
                <Text style={[styles.status, { color: getStatusColor(appointment.status) }]}>
                  {appointment.status?.replace('_', ' ') || 'UNKNOWN'}
                </Text>
              </View>
              <Text style={styles.dateTime}>
                📅 {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'No date'}
              </Text>
              <Text style={styles.dateTime}>
                🕐 {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleTimeString() : 'No time'}
              </Text>
              {appointment.symptoms && (
                <Paragraph style={styles.symptoms}>{appointment.symptoms}</Paragraph>
              )}
              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  style={styles.actionButton}
                  onPress={() => console.log('View details for appointment', appointment.id)}
                >
                  View Details
                </Button>
                {appointment.status === 'PENDING' && (
                  <Button
                    mode="text"
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: responsive.padding.md,
  },
  header: {
    marginBottom: responsive.margin.lg,
  },
  title: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
    marginBottom: responsive.margin.md,
  },
  bookButton: {
    backgroundColor: '#3498db',
  },
  card: {
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
  },
  status: {
    fontSize: responsive.fontSize.sm,
    fontWeight: 'bold',
  },
  dateTime: {
    fontSize: responsive.fontSize.md,
    color: '#7f8c8d',
    marginBottom: responsive.margin.sm,
  },
  symptoms: {
    fontSize: responsive.fontSize.sm,
    color: '#555',
    marginBottom: responsive.margin.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: responsive.margin.sm,
  },
  cancelButton: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: responsive.fontSize.md,
    paddingVertical: responsive.padding.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: responsive.fontSize.lg,
    fontWeight: 'bold',
    paddingVertical: responsive.padding.md,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: responsive.fontSize.md,
  },
});

export default StudentAppointmentsScreen;
