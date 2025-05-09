import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Api_categorie from '../api_categorie';

const SignUp2_5 = () => {
    const { params } = useRoute();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await Api_categorie.getCategories();
                setCategories(response.data.categories || []);
            } catch (error) {
                Alert.alert('Erreur', error.message);
            }
        };
        fetchCategories();
    }, []);

    const toggleCategory = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category) 
                : [...prev, category]
        );
    };

    const handleNext = () => {
        navigation.navigate('SignUp3', { 
            ...params,
            categorie: selectedCategories
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header and progress bar */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFilled, { width: '83%' }]} />
                        </View>
                        <Text style={styles.stepText}>Step 3/4</Text>
                    </View>
                </View>

                {/* Food categories section */}
                <View style={styles.foodContainer}>
                    <View style={styles.foodHeader}>
                        <MaterialIcons name="fastfood" size={30} color="#4CAF50" />
                        <Text style={styles.foodTitle}>Food Preferences</Text>
                    </View>
                    <Text style={styles.foodSubtitle}>Select your favorite food categories (optional):</Text>
                    
                    {/* Selected categories */}
                    {selectedCategories.length > 0 && (
                        <View style={styles.selectedContainer}>
                            {selectedCategories.map(category => (
                                <View key={category} style={styles.selectedItem}>
                                    <Text style={styles.selectedText}>{category}</Text>
                                    <TouchableOpacity onPress={() => toggleCategory(category)}>
                                        <Text style={styles.removeText}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Dropdown to add more categories */}
                    <TouchableOpacity 
                        style={styles.dropdown}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.dropdownText}>
                            {selectedCategories.length > 0 ? 'Add more categories' : 'Select food categories'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="black" />
                    </TouchableOpacity>

                    {/* Modal for selecting categories */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <FlatList
                                    data={categories}
                                    keyExtractor={(item) => item.nom_categorie}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity 
                                            style={styles.modalItem}
                                            onPress={() => {
                                                toggleCategory(item.nom_categorie);
                                                setModalVisible(false);
                                            }}
                                        >
                                            <Text style={styles.modalItemText}>{item.nom_categorie}</Text>
                                            {selectedCategories.includes(item.nom_categorie) && (
                                                <FontAwesome name="check" size={16} color="#4CAF50" />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>

            {/* Next button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 40,
    },
    backButton: {
        padding: 10,
    },
    progressContainer: {
        flex: 1,
        alignItems: 'center',
    },
    progressBar: {
        width: '80%',
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    progressFilled: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    stepText: {
        color: '#4CAF50',
        marginTop: 5,
        fontSize: 12,
    },
    foodContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    foodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    foodTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    foodSubtitle: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 30,
    },
    selectedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 8,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedText: {
        marginRight: 5,
    },
    removeText: {
        color: 'red',
        fontWeight: 'bold',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 50,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    dropdownText: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        maxHeight: '50%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalItemText: {
        fontSize: 16,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        paddingTop: 10,
        paddingBottom: 20,
    },
    button: {
        backgroundColor: '#FFC01D',
        paddingVertical: 15,
        borderRadius: 20,
        width: '40%',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SignUp2_5;