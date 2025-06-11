import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Text, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const ChatbotButton = ({ color = '#6366f1' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleChat = () => {
    setIsVisible(!isVisible);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: color }]} 
        onPress={toggleChat}
      >
        <FontAwesome name="comments" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={toggleChat}
      >
        <View style={styles.modalContainer}>
          <View style={styles.chatWindow}>
            <View style={[styles.header, { backgroundColor: color }]}>
              <Text style={styles.headerText}>Assistant virtuel</Text>
              <TouchableOpacity onPress={toggleChat}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.messagesContainer}>
              {/* Messages will be displayed here */}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Écrivez votre message..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={[styles.sendButton, { backgroundColor: color }]}>
                <FontAwesome name="paper-plane" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatWindow: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatbotButton; 