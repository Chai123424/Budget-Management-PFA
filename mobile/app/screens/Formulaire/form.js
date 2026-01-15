import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';



const Form = ({ darkMode, toggleTheme }) => {
  const navigation = useNavigation();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    age: '',
    email: '',
    university: '',
    budget: '',
    hasTuition: 'no',
    tuitionAmount: '',
    rent: '',
    food: '',
    transport: '',
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data on component mount
  /*useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('budgetFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        console.log('Loaded saved data:', parsedData);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };*/

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.lastName || !formData.lastName.trim()) newErrors.lastName = 'Last name is required!';
      if (!formData.firstName || !formData.firstName.trim()) newErrors.firstName = 'First name is required!';
  
      if (!formData.age || String(formData.age).trim() === '') newErrors.age = 'Age is required!';
  
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Email is required!';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Email is invalid!';
      }
      if (!formData.university) newErrors.university = 'University selection is required!';
    } else if (step === 2) {
      if (!formData.budget || String(formData.budget).trim() === '') newErrors.budget = 'Budget is required!';
  
      if (formData.hasTuition === 'yes' && (!formData.tuitionAmount || String(formData.tuitionAmount).trim() === '')) {
        newErrors.tuitionAmount = 'Tuition amount is required when you have tuition!';
      }
  
      if (!formData.rent || String(formData.rent).trim() === '') newErrors.rent = 'Rent amount is required!';
      if (!formData.food || String(formData.food).trim() === '') newErrors.food = 'Food amount is required!';
      if (!formData.transport || String(formData.transport).trim() === '') newErrors.transport = 'Transport amount is required!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const saveData = async () => {
    if (validateStep()) {
      try {
        // Save data to AsyncStorage
        await AsyncStorage.setItem('budgetFormData', JSON.stringify(formData));
        console.log('Data saved successfully:', formData);
        setSaveMessage('Data saved successfully!');

        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error saving data:', error);
        Alert.alert('Error', 'Failed to save data');
      }
    }
  };

  // Fonction handleSubmit corrigée pour sauvegarder en base de données
const handleSubmit = async () => {
  if (!validateStep()) return;

  try {
    setIsSubmitting(true);
    
    // Vérification détaillée des credentials
    console.log("Checking credentials...");
    const token = await AsyncStorage.getItem('authToken');
    const userDataStr = await AsyncStorage.getItem('userData');
    
    console.log("Retrieved token:", token);
    console.log("Retrieved user data string:", userDataStr);
    
    if (!token || !userDataStr) {
      console.log("Missing credentials - Token or user data not found");
      Alert.alert(
        "Authentication Required",
        "Please login again to submit your data",
        [
          {
            text: "OK",
            onPress: () => router.push('../LoginScreen/loginScreen')
          }
        ]
      );
      return;
    }

    const userData = JSON.parse(userDataStr);
    console.log("Parsed user data:", userData);

    const submissionData = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      hasTuition: formData.hasTuition,
      tuitionAmount: formData.hasTuition === 'yes' ? (parseFloat(formData.tuitionAmount) || 0) : 0,
      rent: parseFloat(formData.rent) || 0,
      food: parseFloat(formData.food) || 0,
      transport: parseFloat(formData.transport) || 0
    };

    console.log('Prepared submission data:', submissionData);

    // === POST vers l'API ===
    try {
      const API_BASE_URL = 'http://10.0.2.2:5000/api';
      console.log('Making API request to:', `${API_BASE_URL}/users/save_budget_data`);
      
      const requestBody = {
        ...submissionData,
        userId: userData._id
      };
      
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
      console.log('Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/users/save_budget_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);
      } catch (e) {
        console.log('Could not parse response as JSON:', e);
      }

      if (!response.ok) {
        throw new Error(responseData?.message || 'Failed to submit data to server');
      }

      console.log('Data submitted to server successfully:', responseData);
      
      Alert.alert(
        'Success',
        'Form submitted and saved to database successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              try {
                router.push('../overview/overview'); 
              } catch (navError) {
                console.error('Navigation error:', navError);
                router.back(); 
              }
            }
          }
        ]
      );
      
    } catch (serverError) {
      console.error('Server submission error:', serverError);
      Alert.alert(
        'Partial Success',
        `Data saved locally, but server sync failed: ${serverError.message}. You can try syncing later.`,
        [
          {
            text: 'OK',
            onPress: () => {
              try {
                router.push('/overview/overview'); // ✅ navigation en cas d'erreur
              } catch (navError) {
                console.error('Navigation error:', navError);
                router.back();
              }
            }
          }
        ]
      );
    }

  } catch (error) {
    console.error('Submission error:', error);
    Alert.alert('Error', `Error submitting form: ${error.message}. Please try again.`);
  } finally {
    setIsSubmitting(false);
  }
};

const syncWithServer = async () => {
  try {
    const savedData = await AsyncStorage.getItem('userProfile');
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');
    
    if (savedData && userId && token) {
      const parsedData = JSON.parse(savedData);
      
      const response = await fetch(`${API_BASE_URL}/users/save_budget_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          ...parsedData
        }),
      });

      if (response.ok) {
        console.log('Data synced with server successfully');
        // Marquer comme synchronisé
        await AsyncStorage.setItem('dataSynced', 'true');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Sync error:', error);
    return false;
  }
};

  // Calculate totals
  const calculateTotals = () => {
    const rent = parseFloat(formData.rent) || 0;
    const food = parseFloat(formData.food) || 0;
    const transport = parseFloat(formData.transport) || 0;
    const budget = parseFloat(formData.budget) || 0;
    const tuition = formData.hasTuition === 'yes' ? (parseFloat(formData.tuitionAmount) || 0) : 0;
    
    const totalExpenses = rent + food + transport;
    const totalIncome = budget + tuition;
    const remaining = totalIncome - totalExpenses;
    
    return { totalExpenses, totalIncome, remaining };
  };

  const { totalExpenses, totalIncome, remaining } = calculateTotals();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#000',
      textAlign: 'center',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#000',
      marginBottom: 15,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30,
    },
    stepText: {
      color: darkMode ? '#aaa' : '#666',
      fontSize: 12,
      textAlign: 'center',
      flex: 1,
    },
    activeStepText: {
      color: darkMode ? '#fff' : '#000',
      fontWeight: 'bold',
    },
    stepLine: {
      flex: 1,
      height: 1,
      backgroundColor: darkMode ? '#444' : '#ddd',
      marginHorizontal: 10,
    },
    formGroup: {
      marginBottom: 20,
    },
    formRow: {
      marginBottom: 15,
    },
    label: {
      color: darkMode ? '#fff' : '#000',
      marginBottom: 5,
      fontSize: 16,
    },
    input: {
      backgroundColor: darkMode ? '#333' : '#fff',
      color: darkMode ? '#fff' : '#000',
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 5,
      padding: 12,
      fontSize: 16,
    },
    errorInput: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 5,
    },
    pickerContainer: {
      backgroundColor: darkMode ? '#333' : '#fff',
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 5,
    },
    radioGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
    },
    radioCircle: {
      height: 20,
      width: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: darkMode ? '#fff' : '#000',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    radioCircleSelected: {
      backgroundColor: '#2196F3',
    },
    radioInner: {
      height: 10,
      width: 10,
      borderRadius: 5,
      backgroundColor: '#fff',
    },
    radioLabel: {
      color: darkMode ? '#fff' : '#000',
      fontSize: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 30,
      flexWrap: 'wrap',
    },
    button: {
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 100,
      marginBottom: 10,
    },
    saveButton: {
      backgroundColor: '#af4cab',
    },
    nextButton: {
      backgroundColor: '#E6E6FA',
    },
    prevButton: {
      backgroundColor: '#DDA0DD',
    },
    submitButton: {
      backgroundColor: '#80003e',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    summaryContainer: {
      backgroundColor: darkMode ? '#333' : '#fff',
      borderRadius: 10,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    summarySection: {
      marginBottom: 20,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#000',
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#444' : '#ddd',
      paddingBottom: 5,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      alignItems: 'center',
    },
    summaryLabel: {
      color: darkMode ? '#aaa' : '#666',
      flex: 1,
      fontSize: 14,
    },
    summaryValue: {
      color: darkMode ? '#fff' : '#000',
      fontWeight: '500',
      fontSize: 14,
      textAlign: 'right',
    },
    total: {
      borderTopWidth: 1,
      borderTopColor: darkMode ? '#444' : '#ddd',
      paddingTop: 10,
      marginTop: 10,
    },
    positive: {
      color: '#4CAF50',
    },
    negative: {
      color: '#F44336',
    },
    themeToggle: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
      padding: 10,
    },
    saveMessage: {
      backgroundColor: '#4CAF50',
      padding: 12,
      borderRadius: 5,
      marginBottom: 20,
    },
    saveMessageText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '500',
    },
    budgetSectionTitle: {
      color: darkMode ? '#fff' : '#000',
      fontWeight: 'bold',
      marginBottom: 10,
      fontSize: 16,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Theme toggle button */}
      {toggleTheme && (
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Image
            source={darkMode ? require('../../assets/icons/soleil.png') : require('../../assets/icons/lune.png')}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <Image
          source={require('../../assets/money-management.png')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>BUDGET FORM</Text>

      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        <Text style={[styles.stepText, step === 1 && styles.activeStepText]}>
          Personal Information
        </Text>
        <View style={styles.stepLine} />
        <Text style={[styles.stepText, step === 2 && styles.activeStepText]}>
          Budget Information
        </Text>
        <View style={styles.stepLine} />
        <Text style={[styles.stepText, step === 3 && styles.activeStepText]}>
          Summary
        </Text>
      </View>

      {saveMessage ? (
        <View style={styles.saveMessage}>
          <Text style={styles.saveMessageText}>{saveMessage}</Text>
        </View>
      ) : null}

      {step === 1 && (
        <>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.formGroup}>
            <View style={styles.formRow}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.errorInput]}
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
                placeholder="Enter your last name"
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.errorInput]}
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
                placeholder="Enter your first name"
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.formRow}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={[styles.input, errors.age && styles.errorInput]}
                value={formData.age}
                onChangeText={(text) => handleChange('age', text)}
                keyboardType="numeric"
                placeholder="Enter your age"
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.errorInput]}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>University *</Text>
            <View style={[styles.pickerContainer, errors.university && styles.errorInput]}>
              <Picker
                selectedValue={formData.university}
                onValueChange={(itemValue) => handleChange('university', itemValue)}
                style={{ color: darkMode ? '#fff' : '#000' }}
              >
                <Picker.Item label="--Select University Type--" value="" />
                <Picker.Item label="Public University" value="public" />
                <Picker.Item label="Private University" value="private" />
              </Picker>
            </View>
            {errors.university && <Text style={styles.errorText}>{errors.university}</Text>}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveData}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={nextStep}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.sectionTitle}>Budget Information</Text>

          <View style={styles.summaryContainer}>
            <Text style={styles.budgetSectionTitle}>Student Budget</Text>

            <View style={styles.formRow}>
              <Text style={styles.label}>What's your monthly budget? (DH) *</Text>
              <TextInput
                style={[styles.input, errors.budget && styles.errorInput]}
                value={formData.budget}
                onChangeText={(text) => handleChange('budget', text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={darkMode ? '#888' : '#999'}
              />
              {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Do you have a tuition?</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => handleChange('hasTuition', 'yes')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.hasTuition === 'yes' && styles.radioCircleSelected
                  ]}>
                    {formData.hasTuition === 'yes' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => handleChange('hasTuition', 'no')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.hasTuition === 'no' && styles.radioCircleSelected
                  ]}>
                    {formData.hasTuition === 'no' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.hasTuition === 'yes' && (
              <View style={styles.formRow}>
                <Text style={styles.label}>How much do you earn from tuition? (DH) *</Text>
                <TextInput
                  style={[styles.input, errors.tuitionAmount && styles.errorInput]}
                  value={formData.tuitionAmount}
                  onChangeText={(text) => handleChange('tuitionAmount', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={darkMode ? '#888' : '#999'}
                />
                {errors.tuitionAmount && (
                  <Text style={styles.errorText}>{errors.tuitionAmount}</Text>
                )}
              </View>
            )}

            <View style={{ marginTop: 20 }}>
              <Text style={styles.budgetSectionTitle}>Monthly Expenses</Text>

              <View style={styles.formRow}>
                <Text style={styles.label}>How much do you spend on rent? (DH) *</Text>
                <TextInput
                  style={[styles.input, errors.rent && styles.errorInput]}
                  value={formData.rent}
                  onChangeText={(text) => handleChange('rent', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={darkMode ? '#888' : '#999'}
                />
                {errors.rent && <Text style={styles.errorText}>{errors.rent}</Text>}
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>How much do you spend on food? (DH) *</Text>
                <TextInput
                  style={[styles.input, errors.food && styles.errorInput]}
                  value={formData.food}
                  onChangeText={(text) => handleChange('food', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={darkMode ? '#888' : '#999'}
                />
                {errors.food && <Text style={styles.errorText}>{errors.food}</Text>}
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>How much do you spend on transportation? (DH) *</Text>
                <TextInput
                  style={[styles.input, errors.transport && styles.errorInput]}
                  value={formData.transport}
                  onChangeText={(text) => handleChange('transport', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={darkMode ? '#888' : '#999'}
                />
                {errors.transport && <Text style={styles.errorText}>{errors.transport}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.prevButton]}
              onPress={prevStep}
            >
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveData}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={nextStep}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.summaryContainer}>
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Personal Information</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Last Name:</Text>
                <Text style={styles.summaryValue}>{formData.lastName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>First Name:</Text>
                <Text style={styles.summaryValue}>{formData.firstName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Age:</Text>
                <Text style={styles.summaryValue}>{formData.age}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Email:</Text>
                <Text style={styles.summaryValue}>{formData.email}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>University:</Text>
                <Text style={styles.summaryValue}>
                  {formData.university === 'public' ? 'Public University' : 
                   formData.university === 'private' ? 'Private University' : 'Not specified'}
                </Text>
              </View>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Budget Information</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Monthly Budget:</Text>
                <Text style={styles.summaryValue}>{formData.budget} DH</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Has Tuition:</Text>
                <Text style={styles.summaryValue}>
                  {formData.hasTuition === 'yes' ? 'Yes' : 'No'}
                </Text>
              </View>
              {formData.hasTuition === 'yes' && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tuition Amount:</Text>
                  <Text style={styles.summaryValue}>{formData.tuitionAmount} DH</Text>
                </View>
              )}
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Monthly Expenses</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Rent:</Text>
                <Text style={styles.summaryValue}>{formData.rent} DH</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Food:</Text>
                <Text style={styles.summaryValue}>{formData.food} DH</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transportation:</Text>
                <Text style={styles.summaryValue}>{formData.transport} DH</Text>
              </View>
            </View>

            <View style={[styles.summarySection, { marginBottom: 0 }]}>
              <View style={[styles.summaryRow, styles.total]}>
                <Text style={styles.summaryLabel}>Total Expenses:</Text>
                <Text style={styles.summaryValue}>{totalExpenses.toFixed(2)} DH</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Income:</Text>
                <Text style={styles.summaryValue}>{totalIncome.toFixed(2)} DH</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remaining Budget:</Text>
                <Text style={[
                  styles.summaryValue,
                  remaining >= 0 ? styles.positive : styles.negative
                ]}>
                  {remaining.toFixed(2)} DH
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.prevButton]}
              onPress={prevStep}
            >
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveData}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default Form;