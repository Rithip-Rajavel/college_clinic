import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity, Switch, FlatList, Share } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
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
  List,
} from 'react-native-paper';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

const NurseReportsScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateData, setGenerateData] = useState({
    reportType: '',
    startDate: '',
    endDate: '',
    format: 'PDF',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Simulate loading reports - in real app, this would call API
      const mockReports = [
        {
          id: 1,
          name: 'Monthly Health Report',
          type: 'HEALTH_METRICS',
          generatedDate: '2024-01-15',
          format: 'PDF',
          size: '2.4 MB',
          description: 'Comprehensive health metrics for all students and staff',
        },
        {
          id: 2,
          name: 'Appointment Statistics',
          type: 'APPOINTMENTS',
          generatedDate: '2024-01-10',
          format: 'Excel',
          size: '1.1 MB',
          description: 'Detailed appointment statistics and trends',
        },
        {
          id: 3,
          name: 'Inventory Status Report',
          type: 'INVENTORY',
          generatedDate: '2024-01-08',
          format: 'PDF',
          size: '856 KB',
          description: 'Current inventory status and stock levels',
        },
        {
          id: 4,
          name: 'User Activity Report',
          type: 'USERS',
          generatedDate: '2024-01-05',
          format: 'Excel',
          size: '1.8 MB',
          description: 'User registration and activity statistics',
        },
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!generateData.reportType || !generateData.startDate || !generateData.endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Simulate report generation
      Alert.alert('Success', 'Report generation started. You will be notified when it\'s ready.');
      setShowGenerateModal(false);
      resetGenerateData();
      loadReports();
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const handleDownloadReport = async (report: any) => {
    try {
      // Simulate download
      Alert.alert('Download Started', `Downloading ${report.name}...`);
    } catch (error) {
      Alert.alert('Error', 'Failed to download report');
    }
  };

  const handleShareReport = async (report: any) => {
    try {
      await Share.share({
        message: `Check out this report: ${report.name}\nGenerated on: ${report.generatedDate}\nFormat: ${report.format}`,
        title: 'Share Report',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setReports(reports.filter(r => r.id !== reportId));
              Alert.alert('Success', 'Report deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  const resetGenerateData = () => {
    setGenerateData({
      reportType: '',
      startDate: '',
      endDate: '',
      format: 'PDF',
    });
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'HEALTH_METRICS': return '📊';
      case 'APPOINTMENTS': return '📅';
      case 'INVENTORY': return '📦';
      case 'USERS': return '👥';
      default: return '📄';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'HEALTH_METRICS': return '#3498db';
      case 'APPOINTMENTS': return '#9b59b6';
      case 'INVENTORY': return '#f39c12';
      case 'USERS': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return '📄';
      case 'Excel': return '📊';
      case 'CSV': return '📋';
      default: return '📄';
    }
  };

  const reportTypes = [
    { label: 'All Reports', value: 'all' },
    { label: 'Health Metrics', value: 'HEALTH_METRICS' },
    { label: 'Appointments', value: 'APPOINTMENTS' },
    { label: 'Inventory', value: 'INVENTORY' },
    { label: 'Users', value: 'USERS' },
  ];

  const generateReportTypes = [
    { label: 'Health Metrics Report', value: 'HEALTH_METRICS' },
    { label: 'Appointment Statistics', value: 'APPOINTMENTS' },
    { label: 'Inventory Status', value: 'INVENTORY' },
    { label: 'User Activity', value: 'USERS' },
    { label: 'Financial Summary', value: 'FINANCIAL' },
  ];

  const filteredReports = reports.filter(report =>
    selectedReportType === 'all' || report.type === selectedReportType
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Title style={styles.title}>Reports & Analytics</Title>
        <Paragraph style={styles.subtitle}>
          Generate and download comprehensive health system reports
        </Paragraph>

        <View style={styles.quickActionsContainer}>
          <Card style={styles.quickActionsCard}>
            <Card.Content>
              <Title style={styles.quickActionsTitle}>Quick Actions</Title>
              <View style={styles.quickActions}>
                <Button
                  mode="contained"
                  icon="file-chart"
                  style={styles.quickActionButton}
                  onPress={() => setShowGenerateModal(true)}
                >
                  Generate Report
                </Button>
                <Button
                  mode="outlined"
                  icon="download"
                  style={styles.quickActionButton}
                  onPress={() => console.log('Download all')}
                >
                  Download All
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Type:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
            contentContainerStyle={styles.typeContent}
          >
            {reportTypes.map((type) => (
              <Chip
                key={type.value}
                selected={selectedReportType === type.value}
                onPress={() => setSelectedReportType(type.value)}
                style={[
                  styles.typeChip,
                  selectedReportType === type.value && styles.selectedTypeChip
                ]}
              >
                {type.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{reports.length}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#3498db' }]}>
                {reports.filter(r => r.format === 'PDF').length}
              </Text>
              <Text style={styles.statLabel}>PDF Reports</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {reports.filter(r => r.format === 'Excel').length}
              </Text>
              <Text style={styles.statLabel}>Excel Reports</Text>
            </Card.Content>
          </Card>
        </View>

        {filteredReports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                {selectedReportType !== 'all' ? 'No reports found' : 'No reports available'}
              </Text>
              <Paragraph style={styles.emptySubtext}>
                {selectedReportType !== 'all'
                  ? 'Try selecting a different report type'
                  : 'Generate your first report to get started'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              <Card.Content>
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportIcon}>{getReportTypeIcon(report.type)}</Text>
                    <View style={styles.reportDetails}>
                      <Text style={styles.reportName}>{report.name}</Text>
                      <Text style={styles.reportDescription}>{report.description}</Text>
                    </View>
                  </View>
                  <View style={styles.reportMeta}>
                    <Chip
                      compact
                      style={[styles.typeChip, { backgroundColor: getReportTypeColor(report.type) }]}
                      textStyle={styles.typeChipText}
                    >
                      {report.type.replace('_', ' ')}
                    </Chip>
                  </View>
                </View>

                <View style={styles.reportDetailsSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Generated:</Text>
                    <Text style={styles.detailValue}>{new Date(report.generatedDate).toLocaleDateString()}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Format:</Text>
                    <Text style={styles.detailValue}>
                      {getFormatIcon(report.format)} {report.format}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Size:</Text>
                    <Text style={styles.detailValue}>{report.size}</Text>
                  </View>
                </View>

                <View style={styles.reportActions}>
                  <Button
                    mode="outlined"
                    style={styles.downloadButton}
                    onPress={() => handleDownloadReport(report)}
                  >
                    Download
                  </Button>
                  <Button
                    mode="outlined"
                    style={styles.shareButton}
                    onPress={() => handleShareReport(report)}
                  >
                    Share
                  </Button>
                  <Button
                    mode="outlined"
                    style={styles.deleteButton}
                    onPress={() => handleDeleteReport(report.id)}
                  >
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Generate Report Modal */}
      <Portal>
        <Modal
          visible={showGenerateModal}
          onDismiss={() => setShowGenerateModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Generate New Report</Title>

          <List.Section>
            {generateReportTypes.map((type) => (
              <List.Item
                key={type.value}
                title={type.label}
                description={`Generate ${type.label.toLowerCase()}`}
                onPress={() => setGenerateData(prev => ({ ...prev, reportType: type.value }))}
                style={[
                  styles.reportTypeItem,
                  generateData.reportType === type.value && styles.selectedReportTypeItem
                ]}
                left={(props) => <List.Icon {...props} icon="file-chart" />}
              />
            ))}
          </List.Section>

          <TextInput
            label="Start Date"
            value={generateData.startDate}
            onChangeText={(text) => setGenerateData(prev => ({ ...prev, startDate: text }))}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />

          <TextInput
            label="End Date"
            value={generateData.endDate}
            onChangeText={(text) => setGenerateData(prev => ({ ...prev, endDate: text }))}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.formatContainer}>
            <Text style={styles.formatLabel}>Format:</Text>
            <View style={styles.formatOptions}>
              {['PDF', 'Excel', 'CSV'].map((format) => (
                <Chip
                  key={format}
                  selected={generateData.format === format}
                  onPress={() => setGenerateData(prev => ({ ...prev, format }))}
                  style={[
                    styles.formatChip,
                    generateData.format === format && styles.selectedFormatChip
                  ]}
                >
                  {format}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleGenerateReport}
              style={styles.generateButton}
              disabled={!generateData.reportType || !generateData.startDate || !generateData.endDate}
            >
              Generate Report
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: responsive.padding.md,
  },
  title: {
    fontSize: responsive.fontSize.xl,
    color: colors.text,
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: responsive.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: responsive.margin.lg,
  },
  quickActionsContainer: {
    marginBottom: responsive.margin.lg,
  },
  quickActionsCard: {
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: responsive.fontSize.lg,
    color: colors.text,
    marginBottom: responsive.margin.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: responsive.margin.xs,
  },
  filterContainer: {
    marginBottom: responsive.margin.lg,
  },
  filterLabel: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: responsive.margin.sm,
  },
  typeScroll: {
    marginBottom: responsive.margin.sm,
  },
  typeContent: {
    paddingRight: responsive.padding.md,
  },
  typeChipText: {
    color: 'white',
    fontSize: responsive.fontSize.xs,
  },
  typeChip: {
    marginRight: responsive.margin.sm,
  },
  selectedTypeChip: {
    backgroundColor: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsive.margin.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: responsive.margin.xs,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: responsive.padding.md,
  },
  statNumber: {
    fontSize: responsive.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: responsive.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
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
    color: colors.textSecondary,
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: responsive.fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  reportCard: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsive.margin.md,
  },
  reportInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reportIcon: {
    fontSize: responsive.fontSize.xxxl,
    marginRight: responsive.margin.md,
  },
  reportDetails: {
    flex: 1,
  },
  reportName: {
    fontSize: responsive.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: responsive.margin.xs,
  },
  reportDescription: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    lineHeight: responsive.fontSize.lg,
  },
  reportMeta: {
    marginLeft: responsive.margin.sm,
  },
  reportDetailsSection: {
    marginBottom: responsive.margin.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.sm,
  },
  detailLabel: {
    fontSize: responsive.fontSize.sm,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  detailValue: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    flex: 2,
    textAlign: 'right',
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  downloadButton: {
    flex: 1,
    marginRight: responsive.margin.xs,
    borderColor: colors.success,
  },
  shareButton: {
    flex: 1,
    marginHorizontal: responsive.margin.xs,
    borderColor: '#3498db',
  },
  deleteButton: {
    flex: 1,
    marginLeft: responsive.margin.xs,
    borderColor: colors.danger,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: responsive.padding.lg,
    margin: responsive.margin.lg,
    borderRadius: responsive.borderRadius.lg,
    maxHeight: responsive.height(600),
  },
  modalTitle: {
    fontSize: responsive.fontSize.xl,
    color: colors.text,
    marginBottom: responsive.margin.lg,
    textAlign: 'center',
  },
  reportTypeItem: {
    marginBottom: responsive.margin.sm,
  },
  selectedReportTypeItem: {
    backgroundColor: '#e8f4f8',
  },
  input: {
    marginBottom: responsive.margin.md,
  },
  formatContainer: {
    marginBottom: responsive.margin.md,
  },
  formatLabel: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: responsive.margin.sm,
  },
  formatOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  formatChip: {
    marginRight: responsive.margin.sm,
  },
  selectedFormatChip: {
    backgroundColor: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsive.margin.lg,
  },
  generateButton: {
    backgroundColor: colors.primary,
  },
});

export default NurseReportsScreen;
