import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

export default function TransactionModal({ visible, account, onClose, onSave, theme }) {
  const [transactionData, setTransactionData] = useState({
    amount: "",
    type: "deposit",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!visible) {
      setTransactionData({
        amount: "",
        type: "deposit",
        description: "",
        date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [visible]);

  const handleSave = () => {
    if (!transactionData.amount) {
      alert("Veuillez saisir un montant.");
      return;
    }

    const amount = parseFloat(transactionData.amount);
    if (amount <= 0) {
      alert("Le montant doit être supérieur à zéro.");
      return;
    }

    onSave({
      amount: amount,
      type: transactionData.type,
      description: transactionData.description,
      date: transactionData.date,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, theme.card]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, theme.text]}>Ajouter une transaction</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, theme.text]}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={[styles.accountName, theme.textSecondary]}>
              Compte: {account?.name}
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Type de transaction</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    transactionData.type === "deposit" && styles.selectedType,
                  ]}
                  onPress={() => setTransactionData({ ...transactionData, type: "deposit" })}
                >
                  <ArrowUpRight
                    size={20}
                    color={transactionData.type === "deposit" ? "white" : "#6366f1"}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      transactionData.type === "deposit" && styles.selectedTypeText,
                    ]}
                  >
                    Dépôt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    transactionData.type === "withdrawal" && styles.selectedType,
                  ]}
                  onPress={() => setTransactionData({ ...transactionData, type: "withdrawal" })}
                >
                  <ArrowDownRight
                    size={20}
                    color={transactionData.type === "withdrawal" ? "white" : "#6366f1"}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      transactionData.type === "withdrawal" && styles.selectedTypeText,
                    ]}
                  >
                    Retrait
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Montant (€)</Text>
              <TextInput
                style={[styles.input, theme.card, theme.text]}
                value={transactionData.amount}
                onChangeText={(text) => setTransactionData({ ...transactionData, amount: text })}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary.color}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Description (optionnel)</Text>
              <TextInput
                style={[styles.input, theme.card, theme.text]}
                value={transactionData.description}
                onChangeText={(text) =>
                  setTransactionData({ ...transactionData, description: text })
                }
                placeholder="Ex: Bourse du mois"
                placeholderTextColor={theme.textSecondary.color}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Date</Text>
              <TextInput
                style={[styles.input, theme.card, theme.text]}
                value={transactionData.date}
                onChangeText={(text) => setTransactionData({ ...transactionData, date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary.color}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, theme.card]}
              onPress={onClose}
            >
              <Text style={theme.text}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Ajouter la transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  accountName: {
    fontSize: 14,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  selectedType: {
    backgroundColor: '#6366f1',
  },
  typeText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTypeText: {
    color: 'white',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 