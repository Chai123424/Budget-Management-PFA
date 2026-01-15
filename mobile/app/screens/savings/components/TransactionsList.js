import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export default function TransactionsList({ transactions, accounts, filterPeriod, onFilterChange, theme }) {
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getAccountById = (id) => {
    return accounts.find((account) => account.id === id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, theme.text]}>Historique des Transactions</Text>
        <View style={styles.filterContainer}>
          <View style={[styles.filterWrapper, theme.card]}>
            <Filter size={16} color={theme.textSecondary.color} />
            <Picker
              selectedValue={filterPeriod}
              onValueChange={onFilterChange}
              style={[styles.picker, theme.text]}
              dropdownIconColor={theme.text.color}
            >
              <Picker.Item label="Toutes les périodes" value="all" />
              <Picker.Item label="7 derniers jours" value="week" />
              <Picker.Item label="30 derniers jours" value="month" />
              <Picker.Item label="12 derniers mois" value="year" />
            </Picker>
          </View>
          <TouchableOpacity style={[styles.exportButton, theme.card]}>
            <Download size={16} color={theme.text.color} />
            <Text style={[styles.exportButtonText, theme.text]}>Exporter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {transactions.length === 0 ? (
        <View style={[styles.emptyContainer, theme.card]}>
          <Text style={[styles.emptyText, theme.textSecondary]}>
            Aucune transaction pour la période sélectionnée.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {transactions.map((transaction) => {
            const account = getAccountById(transaction.accountId);
            return (
              <View key={transaction.id} style={[styles.transactionItem, theme.card]}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor: account ? `${account.color}20` : "#6366f120",
                      color: account ? account.color : "#6366f1",
                    },
                  ]}
                >
                  {transaction.type === "deposit" ? (
                    <ArrowUpRight size={20} color={account ? account.color : "#6366f1"} />
                  ) : (
                    <ArrowDownRight size={20} color={account ? account.color : "#6366f1"} />
                  )}
                </View>

                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionTitle, theme.text]}>
                    {transaction.description || (transaction.type === "deposit" ? "Dépôt" : "Retrait")}
                  </Text>
                  <Text style={[styles.accountName, theme.textSecondary]}>
                    {account ? account.name : "Compte inconnu"}
                  </Text>
                  <Text style={[styles.date, theme.textSecondary]}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.amount,
                    transaction.type === "deposit" ? styles.depositAmount : styles.withdrawalAmount,
                  ]}
                >
                  {transaction.type === "deposit" ? "+" : "-"}
                  {transaction.amount.toFixed(2)} DH
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  picker: {
    flex: 1,
    marginLeft: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    gap: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountName: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  depositAmount: {
    color: '#10b981',
  },
  withdrawalAmount: {
    color: '#ef4444',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 