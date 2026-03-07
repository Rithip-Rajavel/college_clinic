import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  RadioButton,
} from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';
import { APPOINTMENT_TYPES } from '../../constants/api';

type Props = NativeStackScreenProps<any, 'CreateAppointment'>;

const CreateAppointmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [appointmentData, setAppointmentData] = useState({
    patientId: userId || user?.id?.toString() || '',
    appointmentDate: new Date().toISOString(),
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
      const response = await ApiService.createAppointment({
        ...appointmentData,
        patientId: Number(appointmentData.patientId),
      });

      if (response.data) {
        Alert.alert('Success', 'Appointment created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.error || 'Failed to create appointment');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={s.scrollView}>
          <Card style={s.card}>
            <Card.Content>
              <Title style={s.title}>Book Appointment</Title>

              <TextInput
                label="Patient ID"
                value={appointmentData.patientId}
                onChangeText={(text) => setAppointmentData(prev => ({ ...prev, patientId: text }))}
                mode="outlined"
                style={s.input}
                keyboardType="numeric"
                disabled={!!user}
                editable={!user}
              />

              <Text style={s.label}>Appointment Date & Time</Text>
              <DatePickerInput
                locale="en"
                mode="outlined"
                label="Select Date & Time"
                value={new Date(appointmentData.appointmentDate)}
                onChange={(date) => setAppointmentData(prev => ({
                  ...prev,
                  appointmentDate: date ? date.toISOString() : new Date().toISOString()
                }))}
                style={s.input}
                inputMode="start"
              />

              <Text style={s.label}>Appointment Type</Text>
              <RadioButton.Group
                onValueChange={(value) => setAppointmentData(prev => ({ ...prev, type: value }))}
                value={appointmentData.type}
              >
                {Object.values(APPOINTMENT_TYPES).map((type) => (
                  <View key={type} style={s.radioItem}>
                    <RadioButton value={type} />
                    <Text style={s.radioLabel}>{type.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </RadioButton.Group>

              <TextInput
                label="Symptoms"
                value={appointmentData.symptoms}
                onChangeText={(text) => setAppointmentData(prev => ({ ...prev, symptoms: text }))}
                mode="outlined"
                style={s.input}
                multiline
                numberOfLines={3}
                placeholder="Describe your symptoms..."
              />

              <TextInput
                label="Additional Notes"
                value={appointmentData.notes}
                onChangeText={(text) => setAppointmentData(prev => ({ ...prev, notes: text }))}
                mode="outlined"
                style={s.input}
                multiline
                numberOfLines={2}
                placeholder="Any additional information..."
              />

              <Button
                mode="contained"
                onPress={handleCreateAppointment}
                style={s.button}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Book Appointment'}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  card: {
    elevation: 4,
    borderRadius: responsive.borderRadius.lg,
    margin: responsive.padding.md,
    backgroundColor: colors.card,
  },
  title: {
    textAlign: 'center',
    fontSize: responsive.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: responsive.margin.lg,
    color: colors.text,
  },
  input: { marginBottom: responsive.margin.md },
  label: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    marginBottom: responsive.margin.sm,
    color: colors.text,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.margin.sm,
  },
  radioLabel: {
    fontSize: responsive.fontSize.md,
    marginLeft: responsive.margin.sm,
    color: colors.text,
  },
  button: {
    paddingVertical: responsive.padding.sm,
    marginTop: responsive.margin.lg,
    backgroundColor: colors.primary,
  },
});

export default CreateAppointmentScreen;
