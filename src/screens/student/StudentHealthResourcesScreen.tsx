import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { responsive } from '../../utils/dimensions';

const StudentHealthResourcesScreen: React.FC = () => {
  const resources = [
    {
      id: 1,
      title: 'General Health Tips',
      description: 'Basic health and wellness tips for students',
      type: 'article',
    },
    {
      id: 2,
      title: 'Mental Health Resources',
      description: 'Support for mental health and wellbeing',
      type: 'resource',
    },
    {
      id: 3,
      title: 'QR Scanner',
      description: 'Scan QR codes for quick access to health information',
      type: 'scanner',
    },
  ];

  const handleResourcePress = (resource: any) => {
    if (resource.type === 'scanner') {
      console.log('Open QR scanner');
    } else {
      console.log('Open resource:', resource.title);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Title style={styles.title}>Health Resources</Title>
      
      {resources.map((resource) => (
        <Card key={resource.id} style={styles.card}>
          <Card.Content>
            <Title style={styles.resourceTitle}>{resource.title}</Title>
            <Paragraph style={styles.resourceDescription}>
              {resource.description}
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => handleResourcePress(resource)}
              style={styles.resourceButton}
            >
              {resource.type === 'scanner' ? 'Open Scanner' : 'View Resource'}
            </Button>
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
  resourceTitle: {
    fontSize: responsive.fontSize.lg,
    color: '#2c3e50',
    marginBottom: responsive.margin.sm,
  },
  resourceDescription: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    marginBottom: responsive.margin.md,
  },
  resourceButton: {
    backgroundColor: '#3498db',
  },
});

export default StudentHealthResourcesScreen;
