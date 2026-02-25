import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { responsive } from '../../utils/dimensions';

const StudentAppointmentsScreen: React.FC = () => {
  const appointments = [
    {
      id: 1,
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Routine Checkup',
      status: 'APPROVED',
      symptoms: 'Regular checkup',
    },
    {
      id: 2,
      date: '2024-01-20',
      time: '2:30 PM',
      type: 'Follow Up',
      status: 'PENDING',
      symptoms: 'Follow up on previous treatment',
    },
  ];

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Title style={styles.title}>My Appointments</Title>
        <Button
          mode="contained"
          style={styles.bookButton}
          onPress={() => console.log('Book new appointment')}
        >
          Book New Appointment
        </Button>
      </View>

      {appointments.map((appointment) => (
        <Card key={appointment.id} style={styles.card}>
          <Card.Content>
            <View style={styles.appointmentHeader}>
              <Title style={styles.appointmentType}>{appointment.type}</Title>
              <Text style={[styles.status, { color: getStatusColor(appointment.status) }]}>
                {appointment.status}
              </Text>
            </View>
            <Text style={styles.dateTime}>
              {appointment.date} at {appointment.time}
            </Text>
            <Paragraph style={styles.symptoms}>{appointment.symptoms}</Paragraph>
            <View style={styles.actions}>
              <Button
                mode="outlined"
                style={styles.actionButton}
                onPress={() => console.log('View details')}
              >
                View Details
              </Button>
              {appointment.status === 'PENDING' && (
                <Button
                  mode="text"
                  style={styles.cancelButton}
                  onPress={() => console.log('Cancel appointment')}
                >
                  Cancel
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
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
});

export default StudentAppointmentsScreen;
