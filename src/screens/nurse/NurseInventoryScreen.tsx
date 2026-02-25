import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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
  FAB,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';

const NurseInventoryScreen: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [newItemData, setNewItemData] = useState({
    medicineName: '',
    description: '',
    currentStock: '',
    minimumStock: '',
    unit: '',
    manufacturer: '',
    expiryDate: '',
    batchNumber: '',
  });
  const [stockUpdateData, setStockUpdateData] = useState({
    quantityChange: '',
    operation: 'add',
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);

      // Load all inventory items
      const inventoryResponse = await ApiService.getAllInventory();
      const inventoryData = (inventoryResponse.data && Array.isArray(inventoryResponse.data)) ? inventoryResponse.data : [];

      // Load low stock and out of stock items
      const lowStockResponse = await ApiService.getLowStockItems();
      const outOfStockResponse = await ApiService.getOutOfStockItems();

      setInventory(inventoryData);
      setLowStockItems((lowStockResponse.data && Array.isArray(lowStockResponse.data)) ? lowStockResponse.data : []);
      setOutOfStockItems((outOfStockResponse.data && Array.isArray(outOfStockResponse.data)) ? outOfStockResponse.data : []);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemData.medicineName || !newItemData.description ||
      !newItemData.currentStock || !newItemData.minimumStock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        medicineName: newItemData.medicineName.trim(),
        description: newItemData.description.trim(),
        currentStock: Number(newItemData.currentStock),
        minimumStock: Number(newItemData.minimumStock),
        unit: newItemData.unit.trim() || 'units',
        manufacturer: newItemData.manufacturer.trim() || '',
        expiryDate: newItemData.expiryDate || null,
        batchNumber: newItemData.batchNumber.trim() || '',
      };

      const response = await ApiService.createInventory(itemData);
      if (response.data) {
        Alert.alert('Success', 'Item added to inventory successfully');
        setShowAddItemModal(false);
        resetNewItemData();
        loadInventoryData();
      } else {
        Alert.alert('Error', response.error || 'Failed to add item');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to inventory');
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || !stockUpdateData.quantityChange) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }

    try {
      const quantity = Number(stockUpdateData.quantityChange);
      const endpoint = stockUpdateData.operation === 'reduce'
        ? `/api/inventory/medicine/${selectedItem.medicineName}/reduce?quantity=${quantity}`
        : `/api/inventory/${selectedItem.id}/stock?quantityChange=${quantity}`;

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', `Stock ${stockUpdateData.operation === 'reduce' ? 'reduced' : 'updated'} successfully`);
        setShowUpdateStockModal(false);
        setSelectedItem(null);
        setStockUpdateData({ quantityChange: '', operation: 'add' });
        loadInventoryData();
      } else {
        Alert.alert('Error', 'Failed to update stock');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock');
    }
  };

  const handleDeactivateItem = async (itemId: number) => {
    Alert.alert(
      'Confirm Deactivation',
      'Are you sure you want to deactivate this item from inventory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deactivateInventory(itemId);
              if (response.data) {
                Alert.alert('Success', 'Item deactivated successfully');
                loadInventoryData();
              } else {
                Alert.alert('Error', 'Failed to deactivate item');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate item');
            }
          },
        },
      ]
    );
  };

  const openUpdateStockModal = (item: any, operation: 'add' | 'reduce') => {
    setSelectedItem(item);
    setStockUpdateData({
      quantityChange: '',
      operation,
    });
    setShowUpdateStockModal(true);
  };

  const resetNewItemData = () => {
    setNewItemData({
      medicineName: '',
      description: '',
      currentStock: '',
      minimumStock: '',
      unit: '',
      manufacturer: '',
      expiryDate: '',
      batchNumber: '',
    });
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { status: 'OUT_OF_STOCK', color: '#e74c3c', label: 'Out of Stock' };
    if (current <= minimum) return { status: 'LOW_STOCK', color: '#f39c12', label: 'Low Stock' };
    return { status: 'IN_STOCK', color: '#27ae60', label: 'In Stock' };
  };

  const getStockProgress = (current: number, minimum: number) => {
    if (minimum === 0) return 1;
    return Math.min(current / minimum, 1);
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { status: 'UNKNOWN', color: '#7f8c8d', daysLeft: null };

    const expiry = new Date(expiryDate);
    const today = new Date();
    const timeDiff = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: 'EXPIRED', color: '#e74c3c', daysLeft };
    if (daysLeft <= 30) return { status: 'EXPIRING_SOON', color: '#f39c12', daysLeft };
    return { status: 'VALID', color: '#27ae60', daysLeft };
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.medicineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const categories = [
    { label: 'All Items', value: 'all' },
    { label: 'Low Stock', value: 'low_stock' },
    { label: 'Out of Stock', value: 'out_of_stock' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Title style={styles.title}>Inventory Management</Title>
        <Paragraph style={styles.subtitle}>
          Manage campus medicine inventory and stock levels
        </Paragraph>

        <View style={styles.alertContainer}>
          {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
            <Card style={styles.alertCard}>
              <Card.Content style={styles.alertContent}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                  <View style={styles.alertInfo}>
                    <Title style={styles.alertTitle}>Stock Alerts</Title>
                    <Text style={styles.alertText}>
                      {lowStockItems.length} items low stock, {outOfStockItems.length} items out of stock
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  style={styles.alertButton}
                  onPress={() => setSelectedCategory('low_stock')}
                >
                  View Alerts
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        <Searchbar
          placeholder="Search inventory..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContent}
          >
            {categories.map((category) => (
              <Chip
                key={category.value}
                selected={selectedCategory === category.value}
                onPress={() => setSelectedCategory(category.value)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.value && styles.selectedCategoryChip
                ]}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{inventory.length}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#f39c12' }]}>
                {lowStockItems.length}
              </Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#e74c3c' }]}>
                {outOfStockItems.length}
              </Text>
              <Text style={styles.statLabel}>Out of Stock</Text>
            </Card.Content>
          </Card>
        </View>

        {filteredInventory.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== 'all' ? 'No items found' : 'No inventory items available'}
              </Text>
              <Paragraph style={styles.emptySubtext}>
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Add items to inventory to get started'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
            const expiryStatus = getExpiryStatus(item.expiryDate);

            return (
              <Card key={item.id} style={styles.inventoryCard}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.medicineName}</Text>
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <Chip
                        compact
                        style={[styles.statusChip, { backgroundColor: stockStatus.color }]}
                        textStyle={styles.statusChipText}
                      >
                        {stockStatus.label}
                      </Chip>
                    </View>
                  </View>

                  <View style={styles.itemDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Stock:</Text>
                      <Text style={styles.detailValue}>
                        {item.currentStock} / {item.minimumStock} {item.unit || 'units'}
                      </Text>
                    </View>

                    <ProgressBar
                      progress={getStockProgress(item.currentStock, item.minimumStock)}
                      color={stockStatus.color}
                      style={styles.progressBar}
                    />

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Manufacturer:</Text>
                      <Text style={styles.detailValue}>{item.manufacturer || 'N/A'}</Text>
                    </View>

                    {item.batchNumber && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Batch:</Text>
                        <Text style={styles.detailValue}>{item.batchNumber}</Text>
                      </View>
                    )}

                    {item.expiryDate && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Expiry:</Text>
                        <Text style={[styles.detailValue, { color: expiryStatus.color }]}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                          {expiryStatus.daysLeft !== null && (
                            <Text style={styles.expiryDays}>
                              ({expiryStatus.daysLeft} days left)
                            </Text>
                          )}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.itemActions}>
                    <Button
                      mode="outlined"
                      style={styles.updateButton}
                      onPress={() => openUpdateStockModal(item, 'add')}
                    >
                      Add Stock
                    </Button>
                    <Button
                      mode="outlined"
                      style={styles.reduceButton}
                      onPress={() => openUpdateStockModal(item, 'reduce')}
                    >
                      Reduce Stock
                    </Button>
                    <Button
                      mode="outlined"
                      style={styles.detailsButton}
                      onPress={() => console.log('View details')}
                    >
                      Details
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddItemModal(true)}
      />

      {/* Add Item Modal */}
      <Portal>
        <Modal
          visible={showAddItemModal}
          onDismiss={() => setShowAddItemModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Add New Item</Title>

          <TextInput
            label="Medicine Name"
            value={newItemData.medicineName}
            onChangeText={(text) => setNewItemData(prev => ({ ...prev, medicineName: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={newItemData.description}
            onChangeText={(text) => setNewItemData(prev => ({ ...prev, description: text }))}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <TextInput
              label="Current Stock"
              value={newItemData.currentStock}
              onChangeText={(text) => setNewItemData(prev => ({ ...prev, currentStock: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="Minimum Stock"
              value={newItemData.minimumStock}
              onChangeText={(text) => setNewItemData(prev => ({ ...prev, minimumStock: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Unit"
              value={newItemData.unit}
              onChangeText={(text) => setNewItemData(prev => ({ ...prev, unit: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Batch Number"
              value={newItemData.batchNumber}
              onChangeText={(text) => setNewItemData(prev => ({ ...prev, batchNumber: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <TextInput
            label="Manufacturer"
            value={newItemData.manufacturer}
            onChangeText={(text) => setNewItemData(prev => ({ ...prev, manufacturer: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Expiry Date (YYYY-MM-DD)"
            value={newItemData.expiryDate}
            onChangeText={(text) => setNewItemData(prev => ({ ...prev, expiryDate: text }))}
            mode="outlined"
            style={styles.input}
            placeholder="Optional"
          />

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowAddItemModal(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddItem}
              style={styles.saveButton}
            >
              Add Item
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Update Stock Modal */}
      <Portal>
        <Modal
          visible={showUpdateStockModal}
          onDismiss={() => setShowUpdateStockModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>
            Update Stock - {selectedItem?.medicineName}
          </Title>

          <Text style={styles.currentStockText}>
            Current Stock: {selectedItem?.currentStock} {selectedItem?.unit || 'units'}
          </Text>

          <Text style={styles.operationLabel}>
            Operation: {stockUpdateData.operation === 'add' ? 'Add Stock' : 'Reduce Stock'}
          </Text>

          <TextInput
            label={`Quantity to ${stockUpdateData.operation}`}
            value={stockUpdateData.quantityChange}
            onChangeText={(text) => setStockUpdateData(prev => ({ ...prev, quantityChange: text }))}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder={`Enter quantity to ${stockUpdateData.operation}`}
          />

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowUpdateStockModal(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateStock}
              style={stockUpdateData.operation === 'reduce' ? styles.dangerButton : styles.saveButton}
            >
              {stockUpdateData.operation === 'add' ? 'Add Stock' : 'Reduce Stock'}
            </Button>
          </View>
        </Modal>
      </Portal>
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
  alertContainer: {
    marginBottom: responsive.margin.lg,
  },
  alertCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    elevation: 3,
  },
  alertContent: {
    padding: responsive.padding.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.margin.sm,
  },
  alertIcon: {
    fontSize: responsive.fontSize.xxxl,
    marginRight: responsive.margin.md,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: responsive.fontSize.lg,
    color: '#856404',
    marginBottom: responsive.margin.xs,
  },
  alertText: {
    fontSize: responsive.fontSize.md,
    color: '#856404',
  },
  alertButton: {
    backgroundColor: '#856404',
  },
  searchBar: {
    marginBottom: responsive.margin.lg,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: responsive.margin.lg,
  },
  filterLabel: {
    fontSize: responsive.fontSize.md,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.sm,
  },
  categoryScroll: {
    marginBottom: responsive.margin.sm,
  },
  categoryContent: {
    paddingRight: responsive.padding.md,
  },
  categoryChip: {
    marginRight: responsive.margin.sm,
  },
  selectedCategoryChip: {
    backgroundColor: '#3498db',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: responsive.margin.lg,
  },
  statCard: {
    width: '32%',
    marginBottom: responsive.margin.sm,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: responsive.padding.md,
  },
  statNumber: {
    fontSize: responsive.fontSize.xxxl,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
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
    color: '#7f8c8d',
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: responsive.fontSize.md,
    color: '#95a5a6',
    textAlign: 'center',
  },
  inventoryCard: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsive.margin.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: responsive.fontSize.lg,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  itemDescription: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    lineHeight: responsive.fontSize.lg,
  },
  statusContainer: {
    marginLeft: responsive.margin.sm,
  },
  statusChip: {
    height: responsive.height(24),
  },
  statusChipText: {
    fontSize: responsive.fontSize.xs,
    color: 'white',
  },
  itemDetails: {
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
    color: '#2c3e50',
    flex: 1,
  },
  detailValue: {
    fontSize: responsive.fontSize.md,
    color: '#555',
    flex: 2,
    textAlign: 'right',
  },
  progressBar: {
    height: responsive.height(4),
    borderRadius: responsive.borderRadius.sm,
    marginBottom: responsive.margin.sm,
  },
  expiryDays: {
    fontSize: responsive.fontSize.xs,
    marginLeft: responsive.margin.sm,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updateButton: {
    flex: 1,
    marginRight: responsive.margin.xs,
    borderColor: '#27ae60',
  },
  reduceButton: {
    flex: 1,
    marginHorizontal: responsive.margin.xs,
    borderColor: '#f39c12',
  },
  detailsButton: {
    flex: 1,
    marginLeft: responsive.margin.xs,
    borderColor: '#3498db',
  },
  fab: {
    position: 'absolute',
    margin: responsive.margin.md,
    right: 0,
    bottom: 0,
    backgroundColor: '#3498db',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: responsive.padding.lg,
    margin: responsive.margin.lg,
    borderRadius: responsive.borderRadius.lg,
    maxHeight: responsive.height(500),
  },
  modalTitle: {
    fontSize: responsive.fontSize.xl,
    color: '#2c3e50',
    marginBottom: responsive.margin.lg,
    textAlign: 'center',
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsive.margin.lg,
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  currentStockText: {
    fontSize: responsive.fontSize.md,
    color: '#7f8c8d',
    marginBottom: responsive.margin.md,
    textAlign: 'center',
  },
  operationLabel: {
    fontSize: responsive.fontSize.md,
    color: '#7f8c8d',
    marginBottom: responsive.margin.sm,
    textAlign: 'center',
  },
});

export default NurseInventoryScreen;
