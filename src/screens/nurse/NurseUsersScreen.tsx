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
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { responsive } from '../../utils/dimensions';
import ApiService from '../../services/api';
import { USER_ROLES } from '../../constants/api';

const NurseUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    email: '',
    rollNumber: '',
    mobileNumber: '',
    role: 'STUDENT',
    height: '',
    weight: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllUsers();
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.username || !newUserData.password || !newUserData.email ||
      !newUserData.rollNumber || !newUserData.mobileNumber || !newUserData.role ||
      !newUserData.height || !newUserData.weight) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const userData = {
        username: newUserData.username.trim(),
        password: newUserData.password,
        email: newUserData.email.trim(),
        rollNumber: newUserData.rollNumber.trim(),
        mobileNumber: newUserData.mobileNumber.trim(),
        role: newUserData.role,
        height: Number(newUserData.height),
        weight: Number(newUserData.weight),
        firstName: newUserData.firstName.trim() || undefined,
        lastName: newUserData.lastName.trim() || undefined,
      };

      const response = await ApiService.signup(userData);
      if (response.data) {
        Alert.alert('Success', 'User added successfully');
        setShowAddUserModal(false);
        resetNewUserData();
        loadUsers();
      } else {
        Alert.alert('Error', response.error || 'Failed to add user');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    Alert.alert(
      'Confirm Deactivation',
      'Are you sure you want to deactivate this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deactivateUser(userId);
              if (response.data) {
                Alert.alert('Success', 'User deactivated successfully');
                loadUsers();
              } else {
                Alert.alert('Error', 'Failed to deactivate user');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate user');
            }
          },
        },
      ]
    );
  };

  const handleViewUserDetails = (user: any) => {
    (navigation as any).navigate('UserDetails', { userId: user.id });
  };

  const resetNewUserData = () => {
    setNewUserData({
      username: '',
      password: '',
      email: '',
      rollNumber: '',
      mobileNumber: '',
      role: 'STUDENT',
      height: '',
      weight: '',
      firstName: '',
      lastName: '',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT': return '#3498db';
      case 'STAFF': return '#9b59b6';
      case 'NURSE': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT': return '🎓';
      case 'STAFF': return '👨‍💼';
      case 'NURSE': return '⚕️';
      default: return '👤';
    }
  };

  const roleOptions = [
    { label: 'All Users', value: 'all' },
    { label: 'Students', value: 'STUDENT' },
    { label: 'Staff', value: 'STAFF' },
    { label: 'Nurses', value: 'NURSE' },
  ];

  const newRoleOptions = [
    { label: 'Student', value: 'STUDENT' },
    { label: 'Staff', value: 'STAFF' },
    { label: 'Nurse', value: 'NURSE' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobileNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Title style={styles.title}>User Management</Title>
        <Paragraph style={styles.subtitle}>
          Manage students, staff, and nurse accounts
        </Paragraph>

        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Role:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.roleScroll}
            contentContainerStyle={styles.roleContent}
          >
            {roleOptions.map((role) => (
              <Chip
                key={role.value}
                selected={selectedRole === role.value}
                onPress={() => setSelectedRole(role.value)}
                style={[
                  styles.roleChip,
                  selectedRole === role.value && styles.selectedRoleChip
                ]}
              >
                {role.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#3498db' }]}>
                {users.filter(u => u.role === 'STUDENT').length}
              </Text>
              <Text style={styles.statLabel}>Students</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#9b59b6' }]}>
                {users.filter(u => u.role === 'STAFF').length}
              </Text>
              <Text style={styles.statLabel}>Staff</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#e74c3c' }]}>
                {users.filter(u => u.role === 'NURSE').length}
              </Text>
              <Text style={styles.statLabel}>Nurses</Text>
            </Card.Content>
          </Card>
        </View>

        {filteredUsers.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedRole !== 'all' ? 'No users found' : 'No users available'}
              </Text>
              <Paragraph style={styles.emptySubtext}>
                {searchQuery || selectedRole !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Users will appear here when they are added'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} style={styles.userCard}>
              <Card.Content>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.roleIcon}>{getRoleIcon(user.role)}</Text>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        }
                      </Text>
                      <Text style={styles.userSubInfo}>
                        {user.rollNumber} • {user.email}
                      </Text>
                      <Text style={styles.userSubInfo}>
                        {user.mobileNumber}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.roleContainer}>
                    <Chip
                      compact
                      style={[styles.roleChip, { backgroundColor: getRoleColor(user.role) }]}
                      textStyle={styles.roleChipText}
                    >
                      {user.role}
                    </Chip>
                  </View>
                </View>

                <View style={styles.userStats}>
                  <View style={styles.userStat}>
                    <Text style={styles.statLabel}>Height:</Text>
                    <Text style={styles.statValue}>{user.height} cm</Text>
                  </View>
                  <View style={styles.userStat}>
                    <Text style={styles.statLabel}>Weight:</Text>
                    <Text style={styles.statValue}>{user.weight} kg</Text>
                  </View>
                  <View style={styles.userStat}>
                    <Text style={styles.statLabel}>Status:</Text>
                    <Text style={[styles.statValue, { color: user.active ? '#27ae60' : '#e74c3c' }]}>
                      {user.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View style={styles.userActions}>
                  <Button
                    mode="outlined"
                    style={styles.detailsButton}
                    onPress={() => handleViewUserDetails(user)}
                  >
                    View Details
                  </Button>
                  {user.active && (
                    <Button
                      mode="outlined"
                      style={styles.deactivateButton}
                      onPress={() => handleDeactivateUser(user.id)}
                    >
                      Deactivate
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => setShowAddUserModal(true)}
      />

      {/* Add User Modal */}
      <Portal>
        <Modal
          visible={showAddUserModal}
          onDismiss={() => setShowAddUserModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Add New User</Title>

          <View style={styles.row}>
            <TextInput
              label="Username"
              value={newUserData.username}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, username: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Email"
              value={newUserData.email}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, email: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Roll Number"
              value={newUserData.rollNumber}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, rollNumber: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Mobile Number"
              value={newUserData.mobileNumber}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, mobileNumber: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Height (cm)"
              value={newUserData.height}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, height: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="Weight (kg)"
              value={newUserData.weight}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, weight: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="First Name"
              value={newUserData.firstName}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, firstName: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Last Name"
              value={newUserData.lastName}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, lastName: text }))}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <TextInput
            label="Password"
            value={newUserData.password}
            onChangeText={(text) => setNewUserData(prev => ({ ...prev, password: text }))}
            mode="outlined"
            style={styles.input}
            secureTextEntry
          />

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowAddUserModal(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddUser}
              style={styles.saveButton}
            >
              Add User
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* User Details Modal */}
      <Portal>
        <Modal
          visible={showUserDetailsModal}
          onDismiss={() => setShowUserDetailsModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>User Details</Title>

          {selectedUser && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>
                  {selectedUser.firstName && selectedUser.lastName
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : selectedUser.username
                  }
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Username:</Text>
                <Text style={styles.detailValue}>{selectedUser.username}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedUser.email}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Roll Number:</Text>
                <Text style={styles.detailValue}>{selectedUser.rollNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mobile:</Text>
                <Text style={styles.detailValue}>{selectedUser.mobileNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role:</Text>
                <Text style={styles.detailValue}>{selectedUser.role}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Height:</Text>
                <Text style={styles.detailValue}>{selectedUser.height} cm</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Weight:</Text>
                <Text style={styles.detailValue}>{selectedUser.weight} kg</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, { color: selectedUser.active ? '#27ae60' : '#e74c3c' }]}>
                  {selectedUser.active ? 'Active' : 'Inactive'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Joined:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.modalActions}>
            <Button
              mode="contained"
              onPress={() => setShowUserDetailsModal(false)}
              style={styles.closeButton}
            >
              Close
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
  roleScroll: {
    marginBottom: responsive.margin.sm,
  },
  roleContent: {
    paddingRight: responsive.padding.md,
  },
  roleChip: {
    marginRight: responsive.margin.sm,
  },
  roleChipText: {
    color: 'white',
    fontSize: responsive.fontSize.xs,
    fontWeight: 'bold',
  },
  selectedRoleChip: {
    backgroundColor: '#3498db',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: responsive.margin.lg,
  },
  statCard: {
    width: '48%',
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
  statValue: {
    fontSize: responsive.fontSize.sm,
    color: '#2c3e50',
    fontWeight: 'bold',
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
  userCard: {
    marginBottom: responsive.margin.md,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsive.margin.md,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  roleIcon: {
    fontSize: responsive.fontSize.xxxl,
    marginRight: responsive.margin.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: responsive.fontSize.lg,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.margin.xs,
  },
  userSubInfo: {
    fontSize: responsive.fontSize.sm,
    color: '#7f8c8d',
    marginBottom: responsive.margin.xs,
  },
  roleContainer: {
    marginLeft: responsive.margin.sm,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: responsive.margin.md,
    paddingVertical: responsive.padding.sm,
    backgroundColor: '#f8f9fa',
    borderRadius: responsive.borderRadius.md,
  },
  userStat: {
    alignItems: 'center',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    marginRight: responsive.margin.sm,
    borderColor: '#3498db',
  },
  deactivateButton: {
    flex: 1,
    marginLeft: responsive.margin.sm,
    borderColor: '#e74c3c',
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
    maxHeight: responsive.height(600),
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
  closeButton: {
    backgroundColor: '#3498db',
  },
  detailsContainer: {
    marginBottom: responsive.margin.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.margin.sm,
    paddingVertical: responsive.padding.xs,
  },
  detailLabel: {
    fontSize: responsive.fontSize.md,
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
});

export default NurseUsersScreen;
