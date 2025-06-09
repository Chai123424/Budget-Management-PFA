import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../component/Header';
import BottomNav from '../../component/BottomNav';
import { COLORS } from '../theme/colors';

export default function BasketScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header title="Panier hebdomadaire" />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Suivi des dépenses hebdomadaires</Text>
        {/* Contenu de la page du panier */}
      </ScrollView>

      <BottomNav activeTab="basket" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
}); 