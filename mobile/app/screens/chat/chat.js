import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar
} from "react-native";
import { SendHorizontal, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

// Thème de couleurs
const COLORS = {
  primary: '#8B5CF6',    // Mauve principal
  primaryDark: '#6D28D9', // Mauve foncé
  background: '#F5F3FF',  // Fond très clair mauve
  surface: '#EDE9FE',     // Surface légèrement mauve
  text: '#1E1B4B',       // Texte foncé
  textLight: '#6B7280',  // Texte gris
  white: '#FFFFFF',      // Blanc
  border: '#DDD6FE',     // Bordure mauve claire
};

// URL pour l'émulateur Android
const API_URL = "http://10.0.2.2:5001";
console.log('API URL:', API_URL);

const TIMEOUT_MS = 30000; // 30 secondes de timeout

const fetchWithTimeout = async (url, options) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

export default function Chatbot1() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI Financial Consultant. How can I help you with budgeting, saving, or expense analysis today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier la connexion au serveur au démarrage
  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      console.log('Checking server connection...');
      console.log('Health check URL:', `${API_URL}/api/health`);
      
      const response = await fetchWithTimeout(`${API_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Health check response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Health check error data:', errorData);
        throw new Error('Server health check failed');
      }
      
      const data = await response.json();
      console.log('Server status:', data);
      
      if (data.status !== 'healthy') {
        throw new Error('Server is not healthy');
      }
    } catch (error) {
      console.error('Server connection error:', error);
      Alert.alert(
        'Erreur de connexion',
        'Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d\'exécution.'
      );
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Sending message to:', `${API_URL}/api/chat`);
      console.log('Message payload:', { message: input });
      
      const res = await fetchWithTimeout(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      console.log('Chat response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Chat error data:', errorData);
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await res.json();
      console.log('Chat response data:', data);

      if (data.status === 'error') {
        throw new Error(data.error || 'Server error');
      }

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "No response from AI" },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      let errorMessage = "Erreur de connexion avec le serveur. ";
      
      if (err.message === 'Request timeout') {
        errorMessage += "La requête a pris trop de temps. ";
      }
      
      errorMessage += "Veuillez réessayer.";
      
      setMessages((prev) => [
        ...prev,
        { 
          sender: "ai", 
          text: errorMessage
        },
      ]);

      Alert.alert(
        'Erreur',
        errorMessage
      );
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push("../overview/overview")}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistant Financier</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.sender === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                item.sender === "user" ? styles.userText : styles.aiText
              ]}>
                {item.text}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.chatBody}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tapez votre message..."
            placeholderTextColor={COLORS.textLight}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          <TouchableOpacity 
            onPress={handleSend} 
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <SendHorizontal size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatBody: {
    padding: 16,
  },
  bubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 16,
    maxWidth: "80%",
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: COLORS.white,
  },
  aiText: {
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    fontSize: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
});
