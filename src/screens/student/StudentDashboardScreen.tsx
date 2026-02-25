import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { responsive } from '../../utils/dimensions';

const StudentDashboardScreen: React.FC = () => {
  const { user } = useAuth();

  const upcomingAppointments = [
    { id: 1, date: '2024-01-15', time: '10:00 AM', type: 'Routine Checkup' },
    { id: 2, date: '2024-01-20', time: '2:30 PM', type: 'Follow Up' },
  ];

  const recentHealthMetrics = {
    height: user?.height || 0,
    weight: user?.weight || 0,
    lastUpdated: '2024-01-10',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Title style={styles.welcomeText}>Welcome back!</Title>
        <Text style={styles.userName}>{user?.firstName || user?.username}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Upcoming Appointments</Title>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentItem}>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
                <Text style={styles.appointmentDate}>
                  {appointment.date} at {appointment.time}
                </Text>
              </View>
            ))
          ) : (
            <Paragraph>No upcoming appointments</Paragraph>
          )}
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => console.log('Navigate to appointments')}
          >
            View All Appointments
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Health Metrics</Title>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Height</Text>
              <Text style={styles.metricValue}>{recentHealthMetrics.height} cm</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Weight</Text>
              <Text style={styles.metricValue}>{recentHealthMetrics.weight} kg</Text>
            </View>
          </View>
          <Text style={styles.lastUpdated}>
            Last updated: {recentHealthMetrics.lastUpdated}
          </Text>
          <Button
            mode="outlined"
            style={styles.button}
            onPress={() => console.log('Navigate to health metrics')}
          >
            Update Health Metrics
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              style={[styles.quickAction, styles.bookAppointment]}
              onPress={() => console.log('Book appointment')}
            >
              Book Appointment
            </Button>
            <Button
              mode="contained"
              style={[styles.quickAction, styles.emergencyButton]}
              onPress={() => console.log('Emergency appointment')}
            >
              Emergency
            </Button>
          </View>
        </Card.Content>
      </Card>
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
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
  },
  userName: {
    fontSize: responsive.fontSize.lg,
    color: '#7f8c8d',
    marginTop: responsive.margin.xs,
  },
  card: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  appointmentItem: {
    marginBottom: responsive.margin.sm,
    paddingVertical: responsive.padding.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appointmentType: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  appointmentDate: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
    marginTop: responsive.margin.xs,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: responsive.margin.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
    marginBottom: responsive.margin.xs,
  },
  metricValue: {
    fontSize: responsive.fontSize.lg,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  lastUpdated: {
    fontSize: responsive.fontSize.xs,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: responsive.margin.sm,
  },
  button: {
    marginTop: responsive.margin.sm,
  },
  quickActions: {
    marginTop: responsive.margin.md,
  },
  quickAction: {
    marginBottom: responsive.margin.sm,
  },
  bookAppointment: {
    backgroundColor: '#3498db',
  },
  emergencyButton: {
    backgroundColor: '#e74c3c',
  },
});

export default StudentDashboardScreen;
