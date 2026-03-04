import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';
import { APPOINTMENT_TYPES } from '../../constants/api';

type Props = NativeStackScreenProps<any, 'CreateAppointment'>;

const CreateAppointmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params || {};
  
  const [appointmentData, setAppointmentData] = useState({
    patientId: userId || '',
    appointmentDate: '',
    type: 'ROUTINE_CHECKUP',
    symptoms: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAppointment = async () => {
    if (!appointmentData.patientId || !appointmentData.appointmentDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiService.createAppointment(appointmentData);
      
      if (response.data) {
        Alert.alert('Success', 'Appointment created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.error || 'Failed to create appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Book Appointment</Title>
          
          <TextInput
            label="Patient ID"
            value={appointmentData.patientId}
            onChangeText={(text) => setAppointmentData(prev => ({ ...prev, patientId: text }))}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            disabled={!!userId}
          />

          <TextInput
            label="Appointment Date & Time"
            value={appointmentData.appointmentDate}
            onChangeText={(text) => setAppointmentData(prev => ({ ...prev, appointmentDate: text }))}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM"
          />

          <Text style={styles.label}>Appointment Type</Text>
          <RadioButton.Group
            onValueChange={(value) => setAppointmentData(prev => ({ ...prev, type: value }))}
            value={appointmentData.type}
          >
            {Object.values(APPOINTMENT_TYPES).map((type) => (
              <View key={type} style={styles.radioItem}>
                <RadioButton value={type} />
                <Text style={styles.radioLabel}>{type.replace('_', ' ')}</Text>
              </View>
            ))}
          </RadioButton.Group>

          <TextInput
            label="Symptoms"
            value={appointmentData.symptoms}
            onChangeText={(text) => setAppointmentData(prev => ({ ...prev, symptoms: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Describe your symptoms..."
          />

          <TextInput
            label="Additional Notes"
            value={appointmentData.notes}
            onChangeText={(text) => setAppointmentData(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="Any additional information..."
          />

          <Button
            mode="contained"
            onPress={handleCreateAppointment}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Book Appointment'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: responsive.padding.md,
  },
  card: {
    elevation: 4,
    borderRadius: responsive.borderRadius.lg,
  },
  title: {
    textAlign: 'center',
    fontSize: responsive.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: responsive.margin.lg,
    color: '#2c3e50',
  },
  input: {
    marginBottom: responsive.margin.md,
  },
  label: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    marginBottom: responsive.margin.sm,
    color: '#2c3e50',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.margin.sm,
  },
  radioLabel: {
    fontSize: responsive.fontSize.md,
    marginLeft: responsive.margin.sm,
  },
  button: {
    paddingVertical: responsive.padding.sm,
    marginTop: responsive.margin.lg,
  },
});

export default CreateAppointmentScreen;
