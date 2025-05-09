import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Pressable, ScrollView, Alert , KeyboardAvoidingView,Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const SignUp1 = () => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        age: '',
        password: '',
        passwordConfirm: '',
        num: '',
        adressmaison: ''
    });
    const [isChecked, setIsChecked] = useState(false);
    const navigation = useNavigation();

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.nom || !formData.prenom || !formData.email || !formData.age || 
            !formData.password || !formData.passwordConfirm || !formData.num || !formData.adressmaison) {
            Alert.alert('Erreur', 'Tous les champs sont obligatoires');
            return false;
        }
        if (formData.password !== formData.passwordConfirm) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return false;
        }
        if (formData.password.length < 8) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
            return false;
        }
        if (!isChecked) {
            Alert.alert('Erreur', 'Vous devez accepter la politique de confidentialité');
            return false;
        }
        return true;
    };

    const handleNext = async () => {
        if (!validateForm()) return;
        navigation.navigate('SignUp2', { formData });
    };

    return (
      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
  >
      <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
      >
          <View style={styles.container}>
              {/* Header and progress bar */}
              <View style={styles.header}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Image source={require('../assets/fleche_gauche.png')} style={styles.backIcon} />
                  </TouchableOpacity>
                  <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                          <View style={[styles.progressFilled, { width: '20%' }]} />
                      </View>
                      <Text style={styles.stepText}>Step 1/4</Text>
                  </View>
              </View>

              {/* Form inputs */}
              <View style={styles.formContainer}>
                  <View style={styles.avatarContainer}>
                      <Image source={require('../assets/Los_Pollos_Hermanos_logo.png')} style={styles.avatar} />
                      <Text style={styles.title}>Create an account</Text>
                  </View>

                  {Object.entries({
                      nom: 'Nom',
                      prenom: 'Prénom',
                      email: 'Email',
                      age: 'Age',
                      num: 'Numéro de téléphone',
                      adressmaison: 'Adresse',
                      password: 'Password',
                      passwordConfirm: 'Confirm Password'
                  }).map(([key, placeholder]) => (
                      <TextInput
                          key={key}
                          placeholder={placeholder}
                          placeholderTextColor="#666"
                          style={styles.input}
                          value={formData[key]}
                          onChangeText={(text) => handleChange(key, text)}
                          secureTextEntry={key.includes('password')}
                          keyboardType={
                              key === 'email' ? 'email-address' : 
                              key === 'age' || key === 'num' ? 'numeric' : 'default'
                          }
                      />
                  ))}
              </View>

              {/* Checkbox and button */}
              <View style={styles.checkboxContainer}>
                  <Pressable
                      style={[styles.checkbox, isChecked && styles.checkedBox]}
                      onPress={() => setIsChecked(!isChecked)}>
                      {isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                  <Text style={styles.privacyText}>
                      I Agree to <Text style={styles.privacyLink}>Privacy Policy</Text>
                  </Text>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                  <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
          </View>
      </ScrollView>
  </KeyboardAvoidingView>
    );
};
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
},
scrollContent: {
    paddingBottom: 20, // Ajoutez un padding en bas pour éviter que le bouton ne soit caché
},
container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 20,
},
formContainer: {
    width: '100%',
},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
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
    width: '33%',
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  stepText: {
    color: '#4CAF50',
    marginTop: 5,
    fontSize: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
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
  privacyText: {
    fontSize: 14,
  },
  privacyLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFC01D',
    paddingVertical: 15,
    borderRadius: 20,
    width: '40%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    color: '#FFC01D',
    fontWeight: 'bold',
  },
});

// Styles remain the same as in your original file
export default SignUp1;