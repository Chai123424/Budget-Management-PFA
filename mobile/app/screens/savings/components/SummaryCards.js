import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { accountTypes } from '../savings';

export default function SummaryCards({ totalBalance, accountsCount, lastTransaction, theme }) {
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, theme.card, styles.totalCard]}>
        <Text style={[styles.cardTitle, theme.textSecondary]}>Solde Total</Text>
        <Text style={[styles.totalAmount, theme.text]}>{totalBalance.toFixed(2)} DH</Text>
        <View style={styles.sparkline}>
          {[60, 40, 70, 50, 80, 65, 90].map((height, index) => (
            <View
              key={index}
              style={[
                styles.sparklineBar,
                { height: `${height}%` },
                { backgroundColor: theme.text.color }
              ]}
            />
          ))}
        </View>
      </View>

      <View style={[styles.card, theme.card]}>
        <Text style={[styles.cardTitle, theme.textSecondary]}>Comptes</Text>
        <Text style={[styles.count, theme.text]}>{accountsCount}</Text>
        <View style={styles.accountTypes}>
          {accountTypes.slice(0, 3).map((type) => (
            <View key={type.id} style={styles.accountTypeBadge}>
              <Text style={styles.accountTypeLabel}>{type.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, theme.card]}>
        <Text style={[styles.cardTitle, theme.textSecondary]}>Dernière Transaction</Text>
        {lastTransaction ? (
          <>
            <Text style={[styles.lastTransaction, theme.text]}>
              {lastTransaction.type === "deposit" ? "+" : "-"}
              {lastTransaction.amount.toFixed(2)} DH
            </Text>
            <View style={styles.dateContainer}>
              <Clock size={14} color={theme.textSecondary.color} />
              <Text style={[styles.transactionDate, theme.textSecondary]}>
                {formatDate(lastTransaction.date)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.noTransactions, theme.textSecondary]}>
            Aucune transaction
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    minHeight: 120,
  },
  totalCard: {
    flex: 1.2,
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 2,
  },
  sparklineBar: {
    flex: 1,
    borderRadius: 2,
    opacity: 0.5,
  },
  count: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  accountTypes: {
    gap: 4,
  },
  accountTypeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accountTypeLabel: {
    color: '#6366f1',
    fontSize: 12,
  },
  lastTransaction: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  noTransactions: {
    fontSize: 14,
  },
}); 