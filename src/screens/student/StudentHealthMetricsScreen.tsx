import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, TextInput } from 'react-native-paper';
import { responsive } from '../../utils/dimensions';

const StudentHealthMetricsScreen: React.FC = () => {
  const [healthData, setHealthData] = React.useState({
    height: '',
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    notes: '',
  });

  const recentMetrics = [
    {
      date: '2024-01-10',
      height: 170,
      weight: 65,
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.6,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveMetrics = () => {
    console.log('Saving health metrics:', healthData);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Title style={styles.title}>Health Metrics</Title>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Update Health Metrics</Title>
          
          <View style={styles.row}>
            <TextInput
              label="Height (cm)"
              value={healthData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="Weight (kg)"
              value={healthData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="BP Systolic"
              value={healthData.bloodPressureSystolic}
              onChangeText={(value) => handleInputChange('bloodPressureSystolic', value)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="BP Diastolic"
              value={healthData.bloodPressureDiastolic}
              onChangeText={(value) => handleInputChange('bloodPressureDiastolic', value)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Heart Rate"
              value={healthData.heartRate}
              onChangeText={(value) => handleInputChange('heartRate', value)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="Temperature (°C)"
              value={healthData.temperature}
              onChangeText={(value) => handleInputChange('temperature', value)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
          </View>

          <TextInput
            label="Oxygen Saturation (%)"
            value={healthData.oxygenSaturation}
            onChangeText={(value) => handleInputChange('oxygenSaturation', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            label="Notes"
            value={healthData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <Button
            mode="contained"
            onPress={handleSaveMetrics}
            style={styles.saveButton}
          >
            Save Metrics
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Metrics</Title>
          {recentMetrics.map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <Text style={styles.metricDate}>{metric.date}</Text>
              <View style={styles.metricDetails}>
                <Text>Height: {metric.height} cm, Weight: {metric.weight} kg</Text>
                <Text>BP: {metric.bloodPressure}, HR: {metric.heartRate} bpm</Text>
                <Text>Temp: {metric.temperature}°C</Text>
              </View>
            </View>
          ))}
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
  title: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
    marginBottom: responsive.margin.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: responsive.margin.md,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: responsive.margin.xs,
  },
  saveButton: {
    marginTop: responsive.margin.md,
    backgroundColor: '#27ae60',
  },
  metricItem: {
    marginBottom: responsive.margin.md,
    paddingVertical: responsive.padding.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  metricDate: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  metricDetails: {
    fontSize: responsive.fontSize.sm,
    color: '#555',
  },
});

export default StudentHealthMetricsScreen;
