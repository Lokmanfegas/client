import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Pressable, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Api_login_register from '../api_login_register';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp3 = () => {
    const { params } = useRoute();
    const [location, setLocation] = useState('');
    const [rememberLocation, setRememberLocation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    console.log(params.categorie)
    const handleConfirm = async () => {
        if (!location) {
            Alert.alert('Erreur', 'Veuillez entrer votre localisation');
            return;
        }
        setIsLoading(true);
        try {
            const clientData = {
                ...params.formData,
                adressmaison: location,
             
            };
           
            const maladies = params.maladies || [];
            const categorie = params.categorie || [];

            const response = await Api_login_register.registerClient(clientData, maladies , categorie);
            await AsyncStorage.setItem('clientId', response.data.client.id_client.toString());
            //+ ' ' + response.data.client.prenom,
          const userData  = {
             id: response.data.client.id_client,
             name: response.data.client.name_client + ' ' + response.data.client.prenom_client,
             email: response.data.client.adress_mail_client,
             age: response.data.client.Age_client,
           };
         await AsyncStorage.setItem('userData', JSON.stringify(userData));
            if (response.status !== 201) {
            Alert.alert('Succès', 'Inscription réussie!');
            navigation.navigate('Main');
            }
            else {
                Alert.alert('Erreur', 'Inscription échouée, veuillez réessayer.');
            }
        } catch (error) {
            Alert.alert('Erreur', error.message || "Une erreur s'est produite");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
             
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Image source={require('../assets/fleche_gauche.png')} style={styles.backIcon} />
                    </TouchableOpacity>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFilled, { width: '100%' }]} />
                        </View>
                        <Text style={styles.stepText}>Step 4/4</Text>
                    </View>
                </View>

             
                <View style={styles.locationContainer}>
                    <View style={styles.locationIconContainer}>
                        <Image source={require('../assets/location.png')} style={styles.locationIcon} />
                    </View>
                    <Text style={styles.locationTitle}>Your location?</Text>
                    
                 
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your location"
                            value={location}
                            onChangeText={setLocation}
                        />
                        <TouchableOpacity>
                            <Image source={require('../assets/fleche_location.png')} style={styles.arrowIcon} />
                        </TouchableOpacity>
                    </View>

                    
                    <View style={styles.checkboxContainer}>
                        <Pressable
                            style={[styles.checkbox, rememberLocation && styles.checkedBox]}
                            onPress={() => setRememberLocation(!rememberLocation)}>
                            {rememberLocation && <Text style={styles.checkmark}>✓</Text>}
                        </Pressable>
                        <Text style={styles.rememberText}>Remember this location</Text>
                    </View>
                </View>

           
               
                    <TouchableOpacity 
                        style={[styles.button, isLoading && styles.buttonDisabled]} 
                        onPress={handleConfirm}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Processing...' : 'Confirm'}
                        </Text>
                    </TouchableOpacity>
             
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        minHeight: '100%',
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
    backIcon: {
        width: 20,
        height: 20,
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
    locationContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    locationIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    locationIcon: {
        width: 40,
        height: 40,
    },
    locationTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        height: 50,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    arrowIcon: {
        width: 40,
        height: 35,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    checkedBox: {
        backgroundColor: '#4CAF50',
    },
    checkmark: {
        color: 'white',
        fontSize: 12,
    },
    rememberText: {
        fontSize: 14,
    },
    buttonContainer: {
       
        marginTop: 'auto',
    },
    button: {
        backgroundColor: '#FFC01D',
        paddingVertical: 15,
        borderRadius: 20,
        width: '40%',
        alignItems: 'center',
        marginLeft: 120,
        marginBottom: 20,
    },
    buttonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButton: {
        marginLeft: 200
    }
});

export default SignUp3;