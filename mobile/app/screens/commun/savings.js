import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';

const Savings = ({ darkMode = true }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    accountType: 'checking',
    interestRate: '',
    color: '#6366f1',
    icon: 'credit-card',
  });

  // Charger les comptes depuis AsyncStorage
  useEffect(() => {
    (async () => {
      const savedAccounts = await AsyncStorage.getItem('savingsAccounts');
      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      }
    })();
  }, []);

  // Sauvegarder les comptes
  useEffect(() => {
    if (accounts.length > 0) {
      AsyncStorage.setItem('savingsAccounts', JSON.stringify(accounts));
    }
  }, [accounts]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddAccount = () => {
    if (!formData.name || formData.balance === '') {
      alert('Veuillez remplir le nom et le solde.');
      return;
    }

    const newAccount = {
      id: Date.now(),
      name: formData.name,
      balance: parseFloat(formData.balance),
      accountType: formData.accountType,
      interestRate: parseFloat(formData.interestRate) || 0,
      color: formData.color,
      icon: formData.icon,
    };

    setAccounts([...accounts, newAccount]);
    setFormData({
      name: '',
      balance: '',
      accountType: 'checking',
      interestRate: '',
      color: '#6366f1',
      icon: 'credit-card',
    });
    setShowModal(false);
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Comptes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Icon name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter un compte</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.accountCard}>
            <Text style={styles.accountName}>{item.name}</Text>
            <Text style={styles.accountBalance}>
              {item.balance.toFixed(2)} DH
            </Text>
          </View>
        )}
      />

      {/* Modal d'ajout */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un compte</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du compte"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Solde"
              keyboardType="numeric"
              value={formData.balance}
              onChangeText={(text) => handleInputChange('balance', text)}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddAccount}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  accountCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountBalance: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Savings;
