import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { responsive } from '../../utils/dimensions';

const StaffDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const upcomingAppointments = [
    { id: 1, date: '2024-01-15', time: '10:00 AM', type: 'Routine Checkup' },
    { id: 2, date: '2024-01-20', time: '2:30 PM', type: 'Follow Up' },
  ];

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
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Title style={styles.welcomeText}>Welcome back!</Title>
        <Text style={styles.userName}>{user?.firstName || user?.username}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>My Appointments</Title>
          {upcomingAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentItem}>
              <Text>{appointment.type} - {appointment.date} at {appointment.time}</Text>
            </View>
          ))}
          <Button mode="contained" style={styles.button}>View All</Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <Button mode="contained" style={styles.button}>Book Appointment</Button>
          <Button mode="contained" style={styles.button}>Book for Student</Button>
        </Card.Content>
      </Card>

      <Card style={styles.logoutCard}>
        <Card.Content>
          <Button
            mode="outlined"
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { padding: responsive.padding.md },
  header: { marginBottom: responsive.margin.lg, alignItems: 'center' },
  welcomeText: { fontSize: responsive.fontSize.xl, color: '#2c3e50' },
  userName: { fontSize: responsive.fontSize.lg, color: '#7f8c8d' },
  card: { marginBottom: responsive.margin.md, elevation: 2 },
  appointmentItem: { marginBottom: responsive.margin.sm },
  button: { marginTop: responsive.margin.sm },
  logoutCard: {
    marginTop: responsive.margin.lg,
    backgroundColor: '#fff5f5',
    borderColor: '#ffcdd2',
    borderWidth: 1,
  },
  logoutButton: {
    borderColor: '#e74c3c',
    color: '#e74c3c',
  },
});

export default StaffDashboardScreen;
