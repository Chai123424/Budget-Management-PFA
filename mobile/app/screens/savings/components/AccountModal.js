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
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { accountTypes, accountColors } from '../savings';
import { Calendar, Clock } from 'lucide-react-native';

export default function AccountModal({ visible, account, onClose, onSave, theme }) {
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    accountType: "checking",
    interestRate: "",
    color: "#6366f1",
    icon: "wallet",
    targetDate: new Date(),
    targetAmount: "",
    monthlySavingsGoal: "",
    showDatePicker: false,
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        balance: account.balance.toString(),
        accountType: account.accountType,
        interestRate: account.interestRate.toString(),
        color: account.color,
        icon: account.icon,
        targetDate: account.targetDate ? new Date(account.targetDate) : new Date(),
        targetAmount: account.targetAmount ? account.targetAmount.toString() : "",
        monthlySavingsGoal: account.monthlySavingsGoal ? account.monthlySavingsGoal.toString() : "",
        showDatePicker: false,
      });
    } else {
      setFormData({
        name: "",
        balance: "",
        accountType: "checking",
        interestRate: "",
        color: "#6366f1",
        icon: "wallet",
        targetDate: new Date(),
        targetAmount: "",
        monthlySavingsGoal: "",
        showDatePicker: false,
      });
    }
  }, [account]);

  const handleSave = () => {
    if (!formData.name || formData.balance === "") {
      alert("Veuillez remplir le nom et le solde du compte.");
      return;
    }

    // Calculer l'objectif mensuel d'épargne si on a une date cible et un montant cible
    let calculatedMonthlySavings = "";
    if (formData.accountType === "investment" && formData.targetAmount && formData.targetDate) {
      const today = new Date();
      const monthsUntilTarget = (formData.targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      const remainingAmount = parseFloat(formData.targetAmount) - parseFloat(formData.balance);
      if (monthsUntilTarget > 0 && remainingAmount > 0) {
        calculatedMonthlySavings = (remainingAmount / monthsUntilTarget).toFixed(2);
      }
    }

    onSave({
      name: formData.name,
      balance: parseFloat(formData.balance),
      accountType: formData.accountType,
      interestRate: parseFloat(formData.interestRate) || 0,
      color: formData.color,
      icon: formData.icon,
      targetDate: formData.targetDate.toISOString(),
      targetAmount: parseFloat(formData.targetAmount) || 0,
      monthlySavingsGoal: calculatedMonthlySavings || formData.monthlySavingsGoal,
    });
  };

  const onDateChange = (event, selectedDate) => {
    setFormData(prev => ({
      ...prev,
      showDatePicker: false,
      targetDate: selectedDate || prev.targetDate,
    }));

    // Recalculer l'objectif mensuel d'épargne
    if (selectedDate && formData.targetAmount) {
      const today = new Date();
      const monthsUntilTarget = (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      const remainingAmount = parseFloat(formData.targetAmount) - parseFloat(formData.balance);
      if (monthsUntilTarget > 0 && remainingAmount > 0) {
        const monthlySavings = (remainingAmount / monthsUntilTarget).toFixed(2);
        setFormData(prev => ({
          ...prev,
          monthlySavingsGoal: monthlySavings,
        }));
      }
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
            <Text style={[styles.modalTitle, theme.text]}>
              {account ? "Modifier le compte" : "Ajouter un compte"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, theme.text]}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Nom du compte</Text>
              <TextInput
                style={[styles.input, theme.card, theme.text]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Compte Étudiant"
                placeholderTextColor={theme.textSecondary.color}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Solde actuel (€)</Text>
              <TextInput
                style={[styles.input, theme.card, theme.text]}
                value={formData.balance}
                onChangeText={(text) => setFormData({ ...formData, balance: text })}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary.color}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Type de compte</Text>
              <View style={[styles.pickerContainer, theme.card]}>
                <Picker
                  selectedValue={formData.accountType}
                  onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                  style={[styles.picker, theme.text]}
                  dropdownIconColor={theme.text.color}
                >
                  {accountTypes.map((type) => (
                    <Picker.Item
                      key={type.id}
                      label={type.label}
                      value={type.id}
                      color={theme.text.color}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {formData.accountType === "investment" && (
              <>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, theme.text]}>Montant objectif</Text>
                  <TextInput
                    style={[styles.input, theme.card, theme.text]}
                    value={formData.targetAmount}
                    onChangeText={(text) => setFormData({ ...formData, targetAmount: text })}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor={theme.textSecondary.color}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, theme.text]}>Date objectif</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, theme.card]}
                    onPress={() => setFormData({ ...formData, showDatePicker: true })}
                  >
                    <Calendar size={20} color={theme.text.color} />
                    <Text style={[styles.dateButtonText, theme.text]}>
                      {formatDate(formData.targetDate)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {formData.showDatePicker && (
                  <DateTimePicker
                    value={formData.targetDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                )}

                <View style={styles.formGroup}>
                  <Text style={[styles.label, theme.text]}>Épargne mensuelle nécessaire</Text>
                  <View style={[styles.calculatedSavings, theme.card]}>
                    <Clock size={20} color={theme.text.color} />
                    <Text style={[styles.calculatedSavingsText, theme.text]}>
                      {formData.monthlySavingsGoal ? `${formData.monthlySavingsGoal} € par mois` : "Définissez un objectif et une date"}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Taux d'intérêt (% annuel)</Text>
              <TextInput
                style={[styles.input, theme.card, theme.text]}
                value={formData.interestRate}
                onChangeText={(text) => setFormData({ ...formData, interestRate: text })}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary.color}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, theme.text]}>Couleur</Text>
              <View style={styles.colorPicker}>
                {accountColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.selectedColor,
                    ]}
                    onPress={() => setFormData({ ...formData, color })}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, theme.card]}
              onPress={onClose}
            >
              <Text style={theme.text}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {account ? "Sauvegarder les modifications" : "Ajouter le compte"}
              </Text>
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: 'white',
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  calculatedSavings: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  calculatedSavingsText: {
    fontSize: 16,
    marginLeft: 8,
  },
}); 