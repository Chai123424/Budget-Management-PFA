import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, SendHorizontal, Info } from 'lucide-react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

// Configuration de l'API
const API_URL = 'http://10.0.2.2:5000'; // Pour Android Emulator
// const API_URL = 'http://localhost:5000'; // Pour iOS Simulator

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Bonjour! Je suis votre assistant financier alimenté par Gemini. Comment puis-je vous aider avec votre budget aujourd'hui?",
    },
  ]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Scroll to bottom
    scrollViewRef.current?.scrollToEnd({ animated: true });

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erreur HTTP: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.reply) {
        throw new Error('Réponse vide du serveur');
      }

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: data.reply },
      ]);
    } catch (err) {
      let errorMessage = 'Désolé, une erreur est survenue. ';

      if (!navigator.onLine) {
        errorMessage += 'Vous êtes hors ligne. Veuillez vérifier votre connexion internet.';
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network request failed')) {
        errorMessage += `Impossible de se connecter au serveur (${API_URL}). Vérifiez que le serveur est bien lancé.`;
      } else if (err.message.includes('HTTP')) {
        errorMessage += 'Le serveur a rencontré un problème. Veuillez réessayer plus tard.';
      } else {
        errorMessage += err.message || 'Une erreur inattendue s\'est produite.';
      }

      setMessages(prev => [
        ...prev,
        { 
          sender: 'ai', 
          text: errorMessage,
          isError: true
        },
      ]);

      // Afficher une alerte pour les erreurs critiques
      if (err.message.includes('Failed to fetch')) {
        Alert.alert(
          'Erreur de connexion',
          'Impossible de se connecter au serveur. Assurez-vous que :\n\n' +
          '1. Le serveur Flask est lancé\n' +
          '2. L\'URL du serveur est correcte\n' +
          '3. Votre appareil est connecté au réseau',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
      // Scroll to bottom again after response
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistant Budget IA</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert(
            'À propos',
            'Assistant alimenté par Gemini AI\nVersion 1.0.0\n\nPosez vos questions sur :\n- Gestion de budget\n- Conseils d\'épargne\n- Analyse des dépenses',
            [{ text: 'OK' }]
          )}
        >
          <Info size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, idx) => (
          <Animated.View
            key={idx}
            entering={FadeInUp}
            layout={Layout}
            style={[
              styles.messageBox,
              msg.sender === 'user' ? styles.userMessage : styles.aiMessage,
              msg.isError && styles.errorMessage,
            ]}
          >
            <Text style={[
              styles.messageText,
              msg.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
              msg.isError && styles.errorMessageText,
            ]}>
              {msg.isError ? '⚠️ ' + msg.text : msg.text}
            </Text>
          </Animated.View>
        ))}
        {isLoading && (
          <Animated.View
            entering={FadeInUp}
            style={[styles.messageBox, styles.aiMessage]}
          >
            <Text style={[styles.messageText, styles.loadingText]}>
              ⌛ En train de réfléchir...
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Posez votre question..."
          placeholderTextColor="#666"
          multiline
          editable={!isLoading}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton, 
            (!input.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <SendHorizontal size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageBox: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageText: {
    color: '#000',
  },
  userMessageText: {
    color: '#fff',
  },
  errorMessage: {
    backgroundColor: '#fff3f3',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error || '#ef4444',
  },
  errorMessageText: {
    color: COLORS.error || '#ef4444',
  },
  loadingText: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
}); 