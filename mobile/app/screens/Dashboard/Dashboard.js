"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

// API URL - change this to your Flask server address
const API_URL = "http://10.0.2.2:5000/api" // For Android emulator
// const API_URL = 'http://localhost:5000/api'; // For iOS simulator

const Dashboard = ({ navigation }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // Purple theme color
  const THEME_COLOR = "#8A70FF"

  // Theme-based colors
  const theme = {
    background: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#333333",
    primary: THEME_COLOR,
    secondary: darkMode ? "#333333" : "#F0F0F0",
    card: darkMode ? "#2A2A2A" : "#F8F8F8",
    border: darkMode ? "#444444" : "#E0E0E0",
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user")
      if (userStr) {
        setUser(JSON.parse(userStr))
      }
      setLoading(false)
    } catch (error) {
      console.error("Error loading user data:", error)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")

      // Navigate back to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    } catch (error) {
      console.error("Error during logout:", error)
      Alert.alert("Error", "Failed to log out. Please try again.")
    }
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Theme toggle button */}
      <TouchableOpacity
        style={styles.themeToggle}
        onPress={toggleTheme}
        accessibilityLabel={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <Ionicons name="sunny" size={24} color="grey" />
        ) : (
          <Ionicons name="moon" size={24} color="#333333" />
        )}
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
        <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome, {user?.name || "User"}!</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Dashboard content will go here */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={24} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Account Summary</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.text }]}>
            Your budget management dashboard is ready to use.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart-outline" size={24} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Activity</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.text }]}>No recent transactions to display.</Text>
        </View>
      </ScrollView>

      {/* Logout button */}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.primary }]} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  themeToggle: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
})

export default Dashboard
