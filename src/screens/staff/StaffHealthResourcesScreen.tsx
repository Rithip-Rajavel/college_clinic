import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Searchbar,
  Chip,
  Divider,
} from 'react-native-paper';
import { responsive } from '../../utils/dimensions';

const StaffHealthResourcesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources = [
    {
      id: 1,
      title: 'Mental Health Support',
      description: 'Access counseling services and mental health resources for staff members',
      category: 'mental-health',
      type: 'resource',
      url: 'https://example.com/mental-health',
      icon: '🧠',
    },
    {
      id: 2,
      title: 'Occupational Health Guidelines',
      description: 'Workplace health and safety guidelines for campus staff',
      category: 'workplace',
      type: 'guideline',
      url: 'https://example.com/occupational-health',
      icon: '⚕️',
    },
    {
      id: 3,
      title: 'Stress Management Techniques',
      description: 'Learn effective stress management and relaxation techniques',
      category: 'wellness',
      type: 'article',
      url: 'https://example.com/stress-management',
      icon: '🧘‍♀️',
    },
    {
      id: 4,
      title: 'Nutrition and Diet Tips',
      description: 'Healthy eating guidelines and nutrition information for busy staff',
      category: 'nutrition',
      type: 'article',
      url: 'https://example.com/nutrition',
      icon: '🥗',
    },
    {
      id: 5,
      title: 'Exercise and Fitness',
      description: 'Fitness routines and exercise recommendations for staff wellness',
      category: 'fitness',
      type: 'program',
      url: 'https://example.com/fitness',
      icon: '🏃‍♂️',
    },
    {
      id: 6,
      title: 'Preventive Care Guidelines',
      description: 'Preventive healthcare recommendations and screening schedules',
      category: 'preventive',
      type: 'guideline',
      url: 'https://example.com/preventive-care',
      icon: '🛡️',
    },
    {
      id: 7,
      title: 'Emergency Procedures',
      description: 'Campus emergency procedures and first aid guidelines',
      category: 'emergency',
      type: 'procedure',
      url: 'https://example.com/emergency',
      icon: '🚨',
    },
    {
      id: 8,
      title: 'Health Insurance Information',
      description: 'Staff health insurance coverage and claim procedures',
      category: 'insurance',
      type: 'information',
      url: 'https://example.com/insurance',
      icon: '📋',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Resources', icon: '📚' },
    { id: 'mental-health', label: 'Mental Health', icon: '🧠' },
    { id: 'workplace', label: 'Workplace', icon: '⚕️' },
    { id: 'wellness', label: 'Wellness', icon: '🧘‍♀️' },
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { id: 'fitness', label: 'Fitness', icon: '🏃‍♂️' },
    { id: 'preventive', label: 'Preventive', icon: '🛡️' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'insurance', label: 'Insurance', icon: '📋' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resource': return '#3498db';
      case 'guideline': return '#9b59b6';
      case 'article': return '#2ecc71';
      case 'program': return '#f39c12';
      case 'procedure': return '#e74c3c';
      case 'information': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'resource': return 'Resource';
      case 'guideline': return 'Guideline';
      case 'article': return 'Article';
      case 'program': return 'Program';
      case 'procedure': return 'Procedure';
      case 'information': return 'Information';
      default: return 'Other';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResourcePress = async (resource: any) => {
    try {
      await Linking.openURL(resource.url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open this resource. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Title style={styles.title}>Health Resources</Title>
        <Paragraph style={styles.subtitle}>
          Access health and wellness resources designed for campus staff
        </Paragraph>

        <Searchbar
          placeholder="Search health resources..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.selectedCategoryChip
                ]}
                textStyle={styles.categoryChipText}
              >
                {category.icon} {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {filteredResources.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No resources found' : 'No resources available'}
              </Text>
              <Paragraph style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try adjusting your search terms or category filter'
                  : 'Resources will be available soon'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredResources.map((resource) => (
            <Card key={resource.id} style={styles.resourceCard}>
              <Card.Content>
                <View style={styles.resourceHeader}>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceIcon}>{resource.icon}</Text>
                    <View style={styles.resourceTitleContainer}>
                      <Title style={styles.resourceTitle}>{resource.title}</Title>
                      <Chip
                        compact
                        style={[styles.typeChip, { backgroundColor: getTypeColor(resource.type) }]}
                        textStyle={styles.typeChipText}
                      >
                        {getTypeLabel(resource.type)}
                      </Chip>
                    </View>
                  </View>
                </View>

                <Paragraph style={styles.resourceDescription}>
                  {resource.description}
                </Paragraph>

                <View style={styles.resourceActions}>
                  <Button
                    mode="contained"
                    onPress={() => handleResourcePress(resource)}
                    style={styles.accessButton}
                  >
                    Access Resource
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}

        <View style={styles.footerSection}>
          <Card style={styles.emergencyCard}>
            <Card.Content style={styles.emergencyContent}>
              <Text style={styles.emergencyIcon}>🚨</Text>
              <Title style={styles.emergencyTitle}>Need Immediate Help?</Title>
              <Paragraph style={styles.emergencyText}>
                If you're experiencing a medical emergency, contact campus security or call emergency services immediately.
              </Paragraph>
              <Button
                mode="contained"
                style={styles.emergencyButton}
                onPress={() => Alert.alert('Emergency', 'Call campus emergency services or dial 911')}
              >
                Emergency Contact
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: responsive.padding.md,
  },
  title: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: responsive.fontSize.md,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: responsive.margin.lg,
  },
  searchBar: {
    marginBottom: responsive.margin.lg,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: responsive.margin.lg,
  },
  categoriesTitle: {
    fontSize: responsive.fontSize.lg,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.sm,
  },
  categoriesScroll: {
    marginBottom: responsive.margin.sm,
  },
  categoriesContent: {
    paddingRight: responsive.padding.md,
  },
  categoryChip: {
    marginRight: responsive.margin.sm,
    backgroundColor: '#e8f4f8',
  },
  selectedCategoryChip: {
    backgroundColor: '#3498db',
  },
  categoryChipText: {
    fontSize: responsive.fontSize.sm,
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
    color: '#7f8c8d',
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: responsive.fontSize.md,
    color: '#95a5a6',
    textAlign: 'center',
  },
  resourceCard: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsive.margin.md,
  },
  resourceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resourceIcon: {
    fontSize: responsive.fontSize.xxxl,
    marginRight: responsive.margin.md,
  },
  resourceTitleContainer: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: responsive.fontSize.lg,
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
    flex: 1,
  },
  typeChip: {
    height: responsive.height(24),
  },
  typeChipText: {
    fontSize: responsive.fontSize.xs,
    color: 'white',
  },
  resourceDescription: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    lineHeight: responsive.fontSize.lg,
    marginBottom: responsive.margin.md,
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  accessButton: {
    backgroundColor: '#3498db',
  },
  footerSection: {
    marginTop: responsive.margin.lg,
    marginBottom: responsive.margin.xl,
  },
  emergencyCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    elevation: 3,
  },
  emergencyContent: {
    alignItems: 'center',
    padding: responsive.padding.lg,
  },
  emergencyIcon: {
    fontSize: responsive.fontSize.xxxl,
    marginBottom: responsive.margin.sm,
  },
  emergencyTitle: {
    fontSize: responsive.fontSize.lg,
    color: '#856404',
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
  emergencyText: {
    fontSize: responsive.fontSize.md,
    color: '#856404',
    textAlign: 'center',
    marginBottom: responsive.margin.md,
  },
  emergencyButton: {
    backgroundColor: '#dc3545',
  },
});

export default StaffHealthResourcesScreen;
