import { useTheme } from '../../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
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
  Divider,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

type Props = NativeStackScreenProps<any, 'InventoryDetails'>;

const InventoryDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { inventoryId } = route.params || {};

  const [inventory, setInventory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateData, setUpdateData] = useState({
    medicineName: '',
    description: '',
    currentStock: '',
    minimumStock: '',
    unit: '',
    manufacturer: '',
    expiryDate: '',
    batchNumber: '',
  });

  useEffect(() => {
    loadInventoryDetails();
  }, [inventoryId]);

  const loadInventoryDetails = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getInventoryById(inventoryId);

      if (response.data) {
        setInventory(response.data);
        setUpdateData({
          medicineName: (response.data as any).medicineName || '',
          description: (response.data as any).description || '',
          currentStock: ((response.data as any).currentStock || 0).toString(),
          minimumStock: ((response.data as any).minimumStock || 0).toString(),
          unit: (response.data as any).unit || '',
          manufacturer: (response.data as any).manufacturer || '',
          expiryDate: (response.data as any).expiryDate || '',
          batchNumber: (response.data as any).batchNumber || '',
        });
      } else {
        Alert.alert('Error', 'Failed to load inventory details');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInventory = async () => {
    if (!updateData.medicineName || !updateData.currentStock || !updateData.minimumStock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiService.updateInventory(inventoryId, {
        ...updateData,
        currentStock: parseInt(updateData.currentStock),
        minimumStock: parseInt(updateData.minimumStock),
      });

      if (response.data) {
        Alert.alert('Success', 'Inventory updated successfully');
        setInventory(response.data);
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update inventory');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStock = async (quantityChange: number) => {
    try {
      setIsLoading(true);
      const response = await ApiService.updateStock(inventoryId, quantityChange);

      if (response.data) {
        Alert.alert('Success', 'Stock updated successfully');
        loadInventoryDetails();
      } else {
        Alert.alert('Error', 'Failed to update stock');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !inventory) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{inventory?.medicineName}</Title>
            <Button
              mode="outlined"
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </View>

          {isEditing ? (
            <View>
              <TextInput
                label="Medicine Name"
                value={updateData.medicineName}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, medicineName: text }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Description"
                value={updateData.description}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, description: text }))}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
              />

              <TextInput
                label="Current Stock"
                value={updateData.currentStock}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, currentStock: text }))}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
              />

              <TextInput
                label="Minimum Stock"
                value={updateData.minimumStock}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, minimumStock: text }))}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
              />

              <TextInput
                label="Unit"
                value={updateData.unit}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, unit: text }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Manufacturer"
                value={updateData.manufacturer}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, manufacturer: text }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Expiry Date"
                value={updateData.expiryDate}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, expiryDate: text }))}
                mode="outlined"
                style={styles.input}
                placeholder="YYYY-MM-DD"
              />

              <TextInput
                label="Batch Number"
                value={updateData.batchNumber}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, batchNumber: text }))}
                mode="outlined"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleUpdateInventory}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Inventory'}
              </Button>
            </View>
          ) : (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{inventory?.description}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Current Stock:</Text>
                <Text style={[
                  styles.value,
                  inventory?.lowStock ? styles.lowStock : null,
                  inventory?.stockOut ? styles.outOfStock : null
                ]}>
                  {inventory?.currentStock} {inventory?.unit}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Minimum Stock:</Text>
                <Text style={styles.value}>{inventory?.minimumStock} {inventory?.unit}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Manufacturer:</Text>
                <Text style={styles.value}>{inventory?.manufacturer || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Expiry Date:</Text>
                <Text style={styles.value}>{inventory?.expiryDate || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Batch Number:</Text>
                <Text style={styles.value}>{inventory?.batchNumber || 'N/A'}</Text>
              </View>

              <View style={styles.stockButtons}>
                <Button
                  mode="outlined"
                  onPress={() => handleUpdateStock(10)}
                  style={styles.stockButton}
                  disabled={isLoading}
                >
                  Add 10
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleUpdateStock(-5)}
                  style={styles.stockButton}
                  disabled={isLoading}
                >
                  Remove 5
                </Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: responsive.padding.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    elevation: 4,
    borderRadius: responsive.borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.lg,
  },
  title: {
    fontSize: responsive.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  editButton: {
    marginLeft: responsive.margin.md,
  },
  input: {
    marginBottom: responsive.margin.md,
  },
  button: {
    paddingVertical: responsive.padding.sm,
    marginTop: responsive.margin.lg,
  },
  infoRow: {
    marginBottom: responsive.margin.md,
  },
  label: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: responsive.margin.xs,
  },
  value: {
    fontSize: responsive.fontSize.md,
    color: colors.text,
  },
  lowStock: {
    color: '#f39c12',
    fontWeight: 'bold',
  },
  outOfStock: {
    color: colors.danger,
    fontWeight: 'bold',
  },
  stockButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: responsive.margin.lg,
  },
  stockButton: {
    flex: 1,
    marginHorizontal: responsive.margin.sm,
  },
});

export default InventoryDetailsScreen;
