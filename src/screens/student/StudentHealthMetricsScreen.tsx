import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, TextInput } from 'react-native-paper';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const StudentHealthMetricsScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [healthData, setHealthData] = useState({
    height: '',
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    notes: '',
  });

  const [recentMetrics, setRecentMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadMetrics();
    }
  }, [user?.id]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await ApiService.getUserHealthMetrics(user.id);
        if (response.data && Array.isArray(response.data)) {
          // Sort by recordedAt descending
          const sorted = response.data.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
          setRecentMetrics(sorted);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to load health metrics');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveMetrics = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      
      const payload = {
        height: healthData.height ? parseFloat(healthData.height) : null,
        weight: healthData.weight ? parseFloat(healthData.weight) : null,
        bloodPressureSystolic: healthData.bloodPressureSystolic ? parseInt(healthData.bloodPressureSystolic, 10) : null,
        bloodPressureDiastolic: healthData.bloodPressureDiastolic ? parseInt(healthData.bloodPressureDiastolic, 10) : null,
        heartRate: healthData.heartRate ? parseInt(healthData.heartRate, 10) : null,
        temperature: healthData.temperature ? parseFloat(healthData.temperature) : null,
        oxygenSaturation: healthData.oxygenSaturation ? parseInt(healthData.oxygenSaturation, 10) : null,
        notes: healthData.notes,
      };

      const response = await ApiService.createHealthMetricsForUser(user.id, payload);
      
      if (response.error) {
        Alert.alert('Error', response.error || 'Failed to save health metrics');
      } else {
        Alert.alert('Success', 'Health metrics saved successfully');
        setHealthData({
          height: '', weight: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
          heartRate: '', temperature: '', oxygenSaturation: '', notes: ''
        });
        loadMetrics();
      }
    } catch {
      Alert.alert('Error', 'Failed to save health metrics');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView 
      style={s.container} 
      contentContainerStyle={s.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <Title style={s.title}>Health Metrics</Title>

      <Card style={s.card}>
        <Card.Content>
          <Title style={s.cardTitle}>Update Health Metrics</Title>
          
          <View style={s.row}>
            <TextInput
              label="Height (cm)"
              value={healthData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              mode="outlined"
              style={[s.input, s.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="Weight (kg)"
              value={healthData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              mode="outlined"
              style={[s.input, s.halfInput]}
              keyboardType="numeric"
            />
          </View>

          <View style={s.row}>
            <TextInput
              label="BP Systolic"
              value={healthData.bloodPressureSystolic}
              onChangeText={(value) => handleInputChange('bloodPressureSystolic', value)}
              mode="outlined"
              style={[s.input, s.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="BP Diastolic"
              value={healthData.bloodPressureDiastolic}
              onChangeText={(value) => handleInputChange('bloodPressureDiastolic', value)}
              mode="outlined"
              style={[s.input, s.halfInput]}
              keyboardType="numeric"
            />
          </View>

          <View style={s.row}>
            <TextInput
              label="Heart Rate"
              value={healthData.heartRate}
              onChangeText={(value) => handleInputChange('heartRate', value)}
              mode="outlined"
              style={[s.input, s.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="Temperature (°C)"
              value={healthData.temperature}
              onChangeText={(value) => handleInputChange('temperature', value)}
              mode="outlined"
              style={[s.input, s.halfInput]}
              keyboardType="numeric"
            />
          </View>

          <TextInput
            label="Oxygen Saturation (%)"
            value={healthData.oxygenSaturation}
            onChangeText={(value) => handleInputChange('oxygenSaturation', value)}
            mode="outlined"
            style={s.input}
            keyboardType="numeric"
          />

          <TextInput
            label="Notes"
            value={healthData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            mode="outlined"
            style={s.input}
            multiline
            numberOfLines={3}
          />

          <Button
            mode="contained"
            onPress={handleSaveMetrics}
            style={s.saveButton}
            loading={saving}
            disabled={saving}
          >
            Save Metrics
          </Button>
        </Card.Content>
      </Card>

      <Card style={s.card}>
        <Card.Content>
          <Title style={s.cardTitle}>Recent Metrics</Title>
          {loading ? (
             <Text style={s.mutedText}>Loading...</Text>
          ) : recentMetrics.length === 0 ? (
             <Text style={s.mutedText}>No metrics recorded yet.</Text>
          ) : (
            recentMetrics.map((metric, index) => (
              <View key={metric.id || index} style={s.metricItem}>
                <Text style={s.metricDate}>{new Date(metric.recordedAt).toLocaleDateString()} {new Date(metric.recordedAt).toLocaleTimeString()}</Text>
                <View style={s.metricDetails}>
                  <Text style={s.metricDetailText}>Height: {metric.height ? metric.height + 'cm' : '-'}, Weight: {metric.weight ? metric.weight + 'kg' : '-'}</Text>
                  <Text style={s.metricDetailText}>BP: {metric.bloodPressureSystolic || '-'}/{metric.bloodPressureDiastolic || '-'}, HR: {metric.heartRate || '-'} bpm</Text>
                  <Text style={s.metricDetailText}>Temp: {metric.temperature ? metric.temperature + '°C' : '-'}, SpO2: {metric.oxygenSaturation ? metric.oxygenSaturation + '%' : '-'}</Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: responsive.padding.md,
  },
  title: {
    fontSize: responsive.fontSize.xl,
    color: colors.text,
    marginBottom: responsive.margin.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: responsive.margin.md,
    elevation: 2,
    backgroundColor: colors.card,
  },
  cardTitle: {
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: responsive.margin.md,
    backgroundColor: colors.inputBackground,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: responsive.margin.xs,
  },
  saveButton: {
    marginTop: responsive.margin.md,
    backgroundColor: colors.success,
  },
  metricItem: {
    marginBottom: responsive.margin.md,
    paddingVertical: responsive.padding.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  metricDate: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: responsive.margin.xs,
  },
  metricDetails: {
    marginTop: responsive.margin.xs,
  },
  metricDetailText: {
    fontSize: responsive.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  mutedText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: responsive.padding.sm,
  }
});

export default StudentHealthMetricsScreen;
