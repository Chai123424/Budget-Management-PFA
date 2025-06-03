import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Sun, Moon } from 'lucide-react-native';
import { COLORS } from '../screens/theme/colors';

export default function Header({ title, darkMode, setDarkMode }) {
  const router = useRouter();

  return (
    <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
      <View style={styles.headerTop}>
        <Image 
          source={require('../../assets/money-management.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/chat')}
          >
            <FontAwesome 
              name="comments" 
              size={24} 
              color={darkMode ? '#f8fafc' : COLORS.primary} 
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