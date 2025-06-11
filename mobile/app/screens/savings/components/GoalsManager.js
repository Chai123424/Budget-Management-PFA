import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const API_URL = "http://10.0.2.2:5000/api"; // Pour l'émulateur Android

export default function GoalsManager() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '',
        targetAmount: '',
        deadline: new Date(),
        category: 'Épargne'
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Charger les objectifs au démarrage
    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.get(`${API_URL}/users/get_goals`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.goals) {
                setGoals(response.data.goals);
            }
        } catch (error) {
            console.error('Error loading goals:', error);
            Alert.alert('Erreur', 'Impossible de charger les objectifs');
        } finally {
            setLoading(false);
        }
    };

    const saveGoalsToServer = async (updatedGoals) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token not found');
                return false;
            }

            await axios.post(`${API_URL}/users/save_goals`, 
                { goals: updatedGoals },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return true;
        } catch (error) {
            console.error('Error saving goals to server:', error);
            return false;
        }
    };

    const handleAddGoal = async () => {
        try {
            if (!newGoal.title || !newGoal.targetAmount) {
                Alert.alert('Erreur', 'Veuillez remplir tous les champs');
                return;
            }

            const goalData = {
                ...newGoal,
                targetAmount: parseFloat(newGoal.targetAmount)
            };

            const updatedGoals = [...goals, goalData];
            const success = await saveGoalsToServer(updatedGoals);

            if (success) {
                setGoals(updatedGoals);
                await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
                setShowAddForm(false);
                setNewGoal({
                    title: '',
                    targetAmount: '',
                    deadline: new Date(),
                    category: 'Épargne'
                });
                Alert.alert('Succès', 'Objectif ajouté avec succès');
            }
        } catch (error) {
            console.error('Error adding goal:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter l\'objectif');
        }
    };

    const handleUpdateProgress = async (goalId, newAmount) => {
        try {
            const updatedGoals = goals.map(goal => {
                if (goal.id === goalId) {
                    const currentAmount = parseFloat(newAmount);
                    const targetAmount = parseFloat(goal.targetAmount);

                    if (currentAmount >= targetAmount) {
                        return null;
                    }

                    return {
                        ...goal,
                        currentAmount: currentAmount.toString()
                    };
                }
                return goal;
            }).filter(Boolean);

            const success = await saveGoalsToServer(updatedGoals);

            if (success) {
                await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
                setGoals(updatedGoals);

                if (updatedGoals.length < goals.length) {
                    Alert.alert('Félicitations !', 'Objectif atteint !');
                }
                return true;
            } else {
                Alert.alert('Erreur', 'Impossible de mettre à jour l\'objectif sur le serveur');
                return false;
            }
        } catch (error) {
            console.error('Error updating goal:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour l\'objectif');
            return false;
        }
    };

    const handleDeleteGoal = async (goalId) => {
        try {
            const updatedGoals = goals.filter(goal => goal.id !== goalId);
            const success = await saveGoalsToServer(updatedGoals);

            if (success) {
                setGoals(updatedGoals);
                await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
                Alert.alert('Succès', 'Objectif supprimé avec succès');
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
            Alert.alert('Erreur', 'Impossible de supprimer l\'objectif');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(!showAddForm)}
            >
                <Text style={styles.addButtonText}>
                    {showAddForm ? 'Annuler' : 'Ajouter un objectif'}
                </Text>
            </TouchableOpacity>

            {showAddForm && (
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Titre de l'objectif"
                        value={newGoal.title}
                        onChangeText={(text) => setNewGoal({...newGoal, title: text})}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Montant cible"
                        value={newGoal.targetAmount}
                        onChangeText={(text) => setNewGoal({...newGoal, targetAmount: text})}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            Date limite: {formatDate(newGoal.deadline)}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={newGoal.deadline}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setNewGoal({...newGoal, deadline: selectedDate});
                                }
                            }}
                        />
                    )}

                    <Picker
                        selectedValue={newGoal.category}
                        style={styles.picker}
                        onValueChange={(itemValue) => 
                            setNewGoal({...newGoal, category: itemValue})
                        }
                    >
                        <Picker.Item label="Épargne" value="Épargne" />
                        <Picker.Item label="Investissement" value="Investissement" />
                        <Picker.Item label="Achat" value="Achat" />
                        <Picker.Item label="Autre" value="Autre" />
                    </Picker>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleAddGoal}
                    >
                        <Text style={styles.submitButtonText}>Ajouter</Text>
                    </TouchableOpacity>
                </View>
            )}

            {goals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <TouchableOpacity
                            onPress={() => handleDeleteGoal(goal.id)}
                            style={styles.deleteButton}
                        >
                            <Text style={styles.deleteButtonText}>Supprimer</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.goalInfo}>
                        Catégorie: {goal.category}
                    </Text>
                    <Text style={styles.goalInfo}>
                        Objectif: {goal.targetAmount}€
                    </Text>
                    <Text style={styles.goalInfo}>
                        Progression: {goal.currentAmount}€
                    </Text>
                    <Text style={styles.goalInfo}>
                        Date limite: {formatDate(goal.deadline)}
                    </Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill,
                                    { width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                        </Text>
                    </View>

                    <View style={styles.updateContainer}>
                        <TextInput
                            style={styles.updateInput}
                            placeholder="Nouveau montant"
                            keyboardType="numeric"
                            onSubmitEditing={(e) => handleUpdateProgress(goal.id, e.nativeEvent.text)}
                        />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F3FF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        backgroundColor: '#8B5CF6',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    addButtonText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    form: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD6FE',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    dateButton: {
        backgroundColor: '#EDE9FE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    dateButtonText: {
        color: '#1E1B4B',
        fontSize: 16,
    },
    picker: {
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#8B5CF6',
        padding: 12,
        borderRadius: 8,
    },
    submitButtonText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    goalCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E1B4B',
    },
    deleteButton: {
        backgroundColor: '#FEE2E2',
        padding: 8,
        borderRadius: 6,
    },
    deleteButtonText: {
        color: '#DC2626',
        fontSize: 14,
    },
    goalInfo: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 8,
    },
    progressContainer: {
        marginTop: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#EDE9FE',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#8B5CF6',
    },
    progressText: {
        textAlign: 'center',
        marginTop: 4,
        color: '#4B5563',
    },
    updateContainer: {
        marginTop: 12,
    },
    updateInput: {
        borderWidth: 1,
        borderColor: '#DDD6FE',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
}); 