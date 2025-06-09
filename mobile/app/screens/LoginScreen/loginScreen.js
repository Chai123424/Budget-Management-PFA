"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from 'expo-router';



const API_URL = "http://10.0.2.2:5000/api" // For Android emulator
// const API_URL = 'http://localhost:5000/api'; // For iOS simulator

const LoginSignup = () => {
  const router = useRouter()

  
  const [action, setAction] = useState("Sign Up")
  const [darkMode, setDarkMode] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const deviceTheme = useColorScheme()

   const THEME_COLOR = "#8A70FF"

  useEffect(() => {
    setDarkMode(deviceTheme === "dark")
  }, [deviceTheme])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    } else if (!regex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

    if (!password) {
      setPasswordError("Password is required")
      return false
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return false
    } else if (!regex.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter, one number, and one special character")
      return false
    }
    setPasswordError("")
    return true
  }

  const getPasswordStrength = (password) => {
    if (!password) return 0
    let strength = 0

    if (password.length >= 8) strength += 1

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1

    if (/\d/.test(password)) strength += 1

    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 1

    return strength
  }

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 1:
        return "#FF6B6B" 
      case 2:
        return "#FFD166" 
      case 3:
        return "#06D6A0" 
      case 4:
        return "#118AB2" 
      default:
        return "#CCCCCC" 
    }
  }

  const getStrengthText = (strength) => {
    switch (strength) {
      case 1:
        return "Weak"
      case 2:
        return "Medium"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      default:
        return "Very weak"
    }
  }

  
  const handleSubmit = async () => {
  
  if (!validateEmail(email)) return;
  if (action === "Sign Up" && !name) {
    Alert.alert("Error", "Name is required");
    return;
  }
  if (!validatePassword(password)) return;

  setIsLoading(true);

  try {
    const endpoint = action === "Login" ? "login" : "register";
    const payload = action === "Login" 
      ? { email, password }
      : { name, email, password };

    const response = await axios.post(`${API_URL}/${endpoint}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log("API Response:", response.data);

    if (action === "Login") {
      
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));
      router.push("../overview/overview")
    } else {
      
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.push("../Formulaire/form") }
      ]);
      
      setName("");
      setEmail("");
      setPassword("");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        "An error occurred";
    
    console.error("API Error:", errorMessage);
    Alert.alert("Error", errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  const handlePasswordReset = async () => {
    if (validateEmail(email)) {
      setIsLoading(true)
      try {
        
        await axios.post(`${API_URL}/forgot-password`, { email })

        Alert.alert("Password Reset", `If an account is associated with ${email}, a reset email will be sent.`)
        setForgotPasswordMode(false)
        setAction("Login")
      } catch (error) {
        console.error("Password reset error:", error)
        
        Alert.alert("Password Reset", `If an account is associated with ${email}, a reset email will be sent.`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  
  const theme = {
    background: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#333333",
    primary: THEME_COLOR,
    secondary: darkMode ? "#333333" : "#F0F0F0",
    border: darkMode ? "#444444" : "#E0E0E0",
    error: "#FF6B6B",
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
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

      <View style={styles.header}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fkrIBN0kuHBa1iwpOxf1nbGyaBN1Oy.png",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Budget Management</Text>
          <View style={[styles.underline, { backgroundColor: theme.primary }]} />
          <Text style={[styles.subtitle, { color: theme.text }]}>Manage your finances easily</Text>
        </View>

        {forgotPasswordMode ? (
          /* Password recovery interface */
          <View style={styles.inputs}>
            <Text style={[styles.resetTitle, { color: theme.text }]}>Reset Your Password</Text>
            <Text style={[styles.resetInstructions, { color: theme.text }]}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
              <Ionicons name="mail-outline" size={24} color={theme.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={darkMode ? "#888888" : "#AAAAAA"}
                value={email}
                onChangeText={setEmail}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}

            <View style={styles.resetButtons}>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: theme.primary }, isLoading && styles.disabledButton]}
                onPress={handlePasswordReset}
                disabled={isLoading}
              >
                <Text style={styles.resetButtonText}>{isLoading ? "Sending..." : "Send Reset Link"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.secondary }]}
                onPress={() => {
                  setForgotPasswordMode(false)
                  setEmailError("")
                }}
                disabled={isLoading}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Normal login/signup interface */
          <View style={styles.inputs}>
            {action === "Sign Up" && (
              <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={24} color={theme.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Name"
                  placeholderTextColor={darkMode ? "#888888" : "#AAAAAA"}
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>
            )}

            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
              <Ionicons name="mail-outline" size={24} color={theme.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={darkMode ? "#888888" : "#AAAAAA"}
                value={email}
                onChangeText={setEmail}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}

            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={24} color={theme.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={darkMode ? "#888888" : "#AAAAAA"}
                value={password}
                onChangeText={setPassword}
                onBlur={() => validatePassword(password)}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}

            {/* Password strength indicator */}
            {password ? (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthMeter}>
                  <View
                    style={[
                      styles.strengthValue,
                      {
                        width: `${getPasswordStrength(password) * 25}%`,
                        backgroundColor: getStrengthColor(getPasswordStrength(password)),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: theme.text }]}>
                  {getStrengthText(getPasswordStrength(password))}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* "Lost Password" text appears only in Login mode and not in recovery mode */}
      {action === "Login" && !forgotPasswordMode && (
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => setForgotPasswordMode(true)}
          disabled={isLoading}
        >
          <Text style={[styles.forgotPasswordText, { color: theme.text }]}>
            Lost Password? <Text style={{ color: theme.primary }}>click here!</Text>
          </Text>
        </TouchableOpacity>
      )}

      {/* Submit buttons are hidden in password recovery mode */}
      {!forgotPasswordMode && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
  style={[
    styles.submitButton,
    action === "Sign Up" ? { backgroundColor: theme.primary } : { backgroundColor: theme.secondary },
    isLoading && styles.disabledButton,
  ]}
  onPress={() => {
    if (action !== "Sign Up") {
      setAction("Sign Up")
    } else {
      handleSubmit()
    }
  }}
  disabled={isLoading}
>
  <Text
    style={[styles.submitButtonText, action === "Sign Up" ? { color: "#FFFFFF" } : { color: theme.text }]}
  >
    {isLoading && action === "Sign Up" ? "Processing..." : "Sign up"}
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={[
    styles.submitButton,
    action === "Login" ? { backgroundColor: theme.primary } : { backgroundColor: theme.secondary },
    isLoading && styles.disabledButton,
  ]}
  onPress={() => {
    if (action !== "Login") {
      setAction("Login")
    } else {
      handleSubmit()
    }
  }}
  disabled={isLoading}
>
  <Text style={[styles.submitButtonText, action === "Login" ? { color: "#FFFFFF" } : { color: theme.text }]}>
    {isLoading && action === "Login" ? "Processing..." : "Login"}
  </Text>
</TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
    alignItems: "center",
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  underline: {
    height: 3,
    width: 50,
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  inputs: {
    width: "100%",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
  },
  errorMessage: {
    color: "#FF6B6B",
    marginTop: -10,
    marginBottom: 10,
    fontSize: 12,
  },
  passwordStrength: {
    marginBottom: 15,
  },
  strengthMeter: {
    height: 6,
    backgroundColor: "#CCCCCC",
    borderRadius: 3,
    marginBottom: 5,
  },
  strengthValue: {
    height: "100%",
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    textAlign: "right",
  },
  forgotPassword: {
    alignItems: "center",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  submitContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  submitButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  resetInstructions: {
    textAlign: "center",
    marginBottom: 20,
  },
  resetButtons: {
    marginTop: 10,
  },
  resetButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
})

export default LoginSignup
