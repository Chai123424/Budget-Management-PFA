import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, TrendingUp, Target, ShoppingBasket, Wallet } from 'lucide-react-native';
import { COLORS } from '../screens/theme/colors';

export default function BottomNav({ activeTab, darkMode }) {
  const router = useRouter();

  const getIconColor = (tabName) => {
    if (activeTab === tabName) {
      return COLORS.primary;
    }
    return darkMode ? '#cbd5e1' : '#475569';
  };

  const getTextStyle = (tabName) => {
    return [
      styles.navText,
      activeTab === tabName && { color: COLORS.primary },
      darkMode ? styles.textLight : styles.textDark
    ];
  };

  return (
    <View style={[
      styles.bottomNavigation,
      darkMode ? styles.bottomNavDark : styles.bottomNavLight
    ]}>
      <TouchableOpacity
        style={[styles.navItem, activeTab === 'overview' && styles.activeNavItem]}
        onPress={() => router.push('/overview')}
      >
        <Home color={getIconColor('overview')} size={24} />
        <Text style={getTextStyle('overview')}>Overview</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'expenses' && styles.activeNavItem]}
        onPress={() => router.push('/expenses')}
      >
        <TrendingUp color={getIconColor('expenses')} size={24} />
        <Text style={getTextStyle('expenses')}>Dépenses</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'goals' && styles.activeNavItem]}
        onPress={() => router.push('/goals')}
      >
        <Target color={getIconColor('goals')} size={24} />
        <Text style={getTextStyle('goals')}>Objectifs</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'basket' && styles.activeNavItem]}
        onPress={() => router.push('/basket')}
      >
        <ShoppingBasket color={getIconColor('basket')} size={24} />
        <Text style={getTextStyle('basket')}>Panier</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'savings' && styles.activeNavItem]}
        onPress={() => router.push('/savings')}
      >
        <Wallet color={getIconColor('savings')} size={24} />
        <Text style={getTextStyle('savings')}>Épargne</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomNavLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e2e8f0',
  },
  bottomNavDark: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  activeNavItem: {
    // Vous pouvez ajouter des styles spécifiques pour l'onglet actif
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  textLight: {
    color: '#cbd5e1',
  },
  textDark: {
    color: '#475569',
  },
}); 