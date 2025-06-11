import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Edit2, Trash2, TrendingUp, Wallet, CreditCard, DollarSign } from 'lucide-react-native';
import { accountTypes } from '../savings';

const getIconComponent = (iconName, color, size = 24) => {
  switch (iconName) {
    case 'wallet':
      return <Wallet size={size} color={color} />;
    case 'credit-card':
      return <CreditCard size={size} color={color} />;
    case 'trending-up':
      return <TrendingUp size={size} color={color} />;
    case 'dollar-sign':
      return <DollarSign size={size} color={color} />;
    default:
      return <Wallet size={size} color={color} />;
  }
};

const getAccountTypeLabel = (type) => {
  const accountType = accountTypes.find((t) => t.id === type);
  return accountType ? accountType.label : "Autre";
};

export default function AccountsList({ accounts, onEdit, onDelete, onAddTransaction, theme }) {
  if (accounts.length === 0) {
    return (
      <View style={[styles.emptyContainer, theme.card]}>
        <Text style={[styles.emptyText, theme.textSecondary]}>
          Vous n'avez pas encore de compte d'épargne.
        </Text>
        <TouchableOpacity
          style={styles.addFirstButton}
          onPress={() => onEdit(null)}
        >
          <Plus size={20} color={theme.text.color} />
          <Text style={[styles.addFirstButtonText, theme.text]}>
            Ajouter votre premier compte
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, theme.text]}>Mes Comptes d'Épargne</Text>
      <View style={styles.list}>
        {accounts.map((account) => (
          <View key={account.id} style={[styles.accountCard, theme.card]}>
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: `${account.color}20`, color: account.color },
              ]}
            >
              {getIconComponent(account.icon, account.color)}
            </View>

            <View style={styles.accountDetails}>
              <Text style={[styles.accountName, theme.text]}>{account.name}</Text>
              <Text style={[styles.accountType, theme.textSecondary]}>
                {getAccountTypeLabel(account.accountType)}
              </Text>
              {account.interestRate > 0 && (
                <View style={styles.interestContainer}>
                  <TrendingUp size={14} color={theme.textSecondary.color} />
                  <Text style={[styles.interestRate, theme.textSecondary]}>
                    {account.interestRate}% d'intérêt
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.accountBalance}>
              <Text style={[styles.balanceAmount, theme.text]}>
                {account.balance.toFixed(2)} DH
              </Text>
              <View style={styles.accountActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.transactionButton]}
                  onPress={() => onAddTransaction(account)}
                >
                  <Plus size={16} color="white" />
                  <Text style={styles.transactionButtonText}>Transaction</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => onEdit(account)}
                >
                  <Edit2 size={16} color={theme.text.color} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => onDelete(account.id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  accountCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountDetails: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountType: {
    fontSize: 14,
  },
  interestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interestRate: {
    fontSize: 12,
  },
  accountBalance: {
    alignItems: 'flex-end',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
  },
  transactionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  addFirstButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 