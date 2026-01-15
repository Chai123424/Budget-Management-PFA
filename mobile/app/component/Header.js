import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Sun, Moon, LogOut } from 'lucide-react-native';
import { COLORS } from '../screens/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Header({ title, darkMode, setDarkMode }) {
  const router = useRouter();

  const handleLogout = async () => {
  Alert.alert(
    "Déconnexion",
    "Êtes-vous sûr de vouloir vous déconnecter ?",
    [
      {
        text: "Annuler",
        style: "cancel"
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            // Récupérer TOUTES les données à sauvegarder
            const formData = await AsyncStorage.getItem('budgetFormData');
            const userProfile = await AsyncStorage.getItem('userProfile');
            const expenses = await AsyncStorage.getItem('expenses'); // AJOUT
            const token = await AsyncStorage.getItem('token');

            // Synchroniser avec le serveur avant la déconnexion
            if (token) {
              try {
                // Sauvegarder les données du budget
                if (formData) {
                  await fetch('http://10.0.2.2:5000/api/users/save_budget_data', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: formData
                  });
                }

                // NOUVEAU: Sauvegarder les dépenses manuelles
                if (expenses) {
                  await fetch('http://10.0.2.2:5000/api/users/save_expenses', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ expenses: JSON.parse(expenses) })
                  });
                }

                console.log('Données synchronisées avec le serveur avant déconnexion');
              } catch (syncError) {
                console.log('Erreur de synchronisation:', syncError);
              }
            }

            // Créer un objet pour stocker toutes les données à conserver
            const savedData = {
              formData: formData ? JSON.parse(formData) : null,
              profile: userProfile ? JSON.parse(userProfile) : null,
              expenses: expenses ? JSON.parse(expenses) : [], // AJOUT
              timestamp: new Date().toISOString()
            };

            // Sauvegarder les données dans une clé temporaire
            await AsyncStorage.setItem('tempUserData', JSON.stringify(savedData));

            // Supprimer les données d'authentification
            await AsyncStorage.multiRemove([
              'token',
              'userId',
              'budgetFormData',
              'userProfile',
              'expenses' // AJOUT
            ]);

            console.log('Données sauvegardées avant déconnexion:', savedData);
            router.replace('/screens/LoginScreen/loginScreen');
          } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
          }
        }
      }
    ]
  );
};

  return (
    <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
      <View style={styles.headerTop}>
        <Image 
          source={require('../assets/money-management.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/screens/chat/chat')}
          >
            <FontAwesome 
              name="comments" 
              size={24}
              color={darkMode ? '#f8fafc' : COLORS.primary} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleLogout}
          >
            <LogOut
              size={24}
              color={darkMode ? '#f8fafc' : '#0f172a'}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun color="#f8fafc" size={24} /> : <Moon color="#0f172a" size={24} />}
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.title, darkMode ? styles.textLight : styles.textDark]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  headerLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 40,
    tintColor: COLORS.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  textLight: {
    color: '#f8fafc',
  },
  textDark: {
    color: '#0f172a',
  },
});