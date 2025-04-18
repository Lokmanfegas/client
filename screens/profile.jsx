"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  FlatList,
  Modal,
} from "react-native"
import { useNavigation } from "@react-navigation/native"

const { width, height } = Dimensions.get("window")

const wp = (size) => (width / 100) * size
const hp = (size) => (height / 100) * size

// Liste des problèmes de santé disponibles (pourrait venir d'une API)
const availableHealthIssues = [
  { id: '1', name: 'Diabetes' },
  { id: '2', name: 'diabetes' },
  { id: '3', name: 'diaets' },
  { id: '4', name: 'diabetes' },
  { id: '5', name: 'Contains gluten' },
  { id: '6', name: 'None' },
];

const ProfileScreen = () => {
  const navigation = useNavigation()
  const [healthAlertsVisible, setHealthAlertsVisible] = useState(false)
  
  // État utilisateur avec problèmes de santé
  const [userData, setUserData] = useState({
    name: "Mohamed Terri",
    email: "lenaoualdrabah@gmail.com",
    age: "22 year old",
    points: "300 points",
    healthIssues: ["Contains gluten"]
  })

  // État pour suivre les problèmes de santé sélectionnés dans le modal
  const [selectedHealthIssues, setSelectedHealthIssues] = useState([])

  // Initialiser les sélections avec les problèmes de santé actuels de l'utilisateur
  useEffect(() => {
    setSelectedHealthIssues([...userData.healthIssues])
  }, [userData.healthIssues])

  const goBack = () => {
    navigation.goBack()
  }

  // Fonction pour basculer la sélection d'un problème de santé
  const toggleHealthIssue = (issue) => {
    // Si "None" est sélectionné, désélectionner tous les autres
    if (issue === "None") {
      setSelectedHealthIssues(["None"])
      return
    }
    
    // Si on sélectionne un autre problème alors que "None" est déjà sélectionné, retirer "None"
    if (selectedHealthIssues.includes("None")) {
      setSelectedHealthIssues([issue])
      return
    }

    // Sinon, ajouter ou retirer normalement
    if (selectedHealthIssues.includes(issue)) {
      setSelectedHealthIssues(selectedHealthIssues.filter(item => item !== issue))
    } else {
      setSelectedHealthIssues([...selectedHealthIssues, issue])
    }
  }

  // Fonction pour sauvegarder les problèmes de santé sélectionnés
  const saveHealthIssues = () => {
    // Mise à jour de l'état utilisateur avec les nouvelles sélections
    setUserData(prev => ({
      ...prev,
      healthIssues: selectedHealthIssues
    }))
    
    // Fermer le modal
    setHealthAlertsVisible(false)
    
    // Ici, vous pourriez appeler une API pour mettre à jour les données utilisateur
    // updateUserHealthIssues(userId, selectedHealthIssues)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Image source={require('../assets/fleche_gauche.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      {/* Contenu principal avec défilement */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image de fond */}
        <View style={styles.backgroundContainer}>
          <Image source={require('../assets/background_image.png')} style={styles.backgroundImage} />
        </View>

        {/* Profil info */}
        <View style={styles.profileInfoSection}>
          <View style={styles.profileImageContainer}>
            <Image source={require('../assets/photo_profile.png')} style={styles.profileImage} />
          </View>
          
          <View style={styles.userInfoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userData.name}</Text>
              <TouchableOpacity style={styles.editButton}>
                <Image source={require('../assets/stylo.png')} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.userAge}>{userData.age}</Text>
            <Text style={styles.userPoints}>{userData.points}</Text>
          </View>
        </View>

        {/* Section Health Alerts */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Alerts</Text>
            <TouchableOpacity onPress={() => setHealthAlertsVisible(true)}>
              <Image source={require('../assets/stylo.png')} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          
          {/* Affichage des problèmes de santé */}
          <View style={styles.healthIssuesContainer}>
            {userData.healthIssues.map((issue, index) => (
              <View key={index} style={styles.healthIssueTag}>
                <Text style={styles.healthIssueText}>{issue}</Text>
              </View>
            ))}
          </View>

          {/* Modal pour les problèmes de santé */}
          <Modal
            visible={healthAlertsVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setHealthAlertsVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Health Issues</Text>
                <ScrollView style={styles.healthOptionsList}>
                  {availableHealthIssues.map((item) => (
                    <TouchableOpacity 
                      key={item.id}
                      style={[
                        styles.healthOption,
                        selectedHealthIssues.includes(item.name) && styles.selectedOption
                      ]}
                      onPress={() => toggleHealthIssue(item.name)}
                    >
                      <Text style={styles.healthOptionText}>{item.name}</Text>
                      {selectedHealthIssues.includes(item.name) && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setHealthAlertsVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveHealthIssues}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        
        {/* Espace supplémentaire en bas pour éviter que la barre de navigation ne cache du contenu */}
        <View style={{ height: hp(10) }} />
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require("../assets/homeV.png")} style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require("../assets/mylist.png")} style={styles.navIcon} />
          <Text style={styles.navText}>My List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemM}>
          <Image source={require("../assets/home.png")} style={styles.navIconM} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require("../assets/orders.png")} style={styles.navIcon} />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require("../assets/profile.png")} style={styles.navIcon} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: wp(4),
  },
  backIcon: {
    width: wp(6),
    height: wp(6),
  },
  headerText: {
    fontSize: wp(7),
    fontWeight: "bold",
  },
  scrollContent: {
    flex: 1,
  },
  backgroundContainer: {
    height: hp(20),
    width: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    marginTop: hp(-2),
    marginBottom: hp(3),
  },
  profileImageContainer: {
    marginRight: wp(5),
  },
  profileImage: {
    marginTop:wp(-8),
    width: wp(24),
    height: wp(24),
    borderRadius: wp(11),
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: hp(2),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  userName: {
    fontSize: wp(5),
    fontWeight: 'bold',
    marginRight: wp(2),
  },
  editButton: {
    padding: wp(1),
  },
  editIcon: {
    width: wp(4),
    height: wp(4),
    resizeMode: 'contain',
  },
  userEmail: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(0.5),
  },
  userAge: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(0.5),
  },
  userPoints: {
    fontSize: wp(3.5),
    color: '#FFC01D',
    fontWeight: 'bold',
  },
  sectionContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#000',
  },
  healthIssuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthIssueTag: {
    backgroundColor: '#F8E6E6',
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    marginRight: wp(2),
    marginBottom: hp(1),
  },
  healthIssueText: {
    fontSize: wp(3.5),
    color: '#8B0000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp(80),
    maxHeight: hp(60),
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  healthOptionsList: {
    maxHeight: hp(40),
  },
  healthOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#F8F8F8',
  },
  healthOptionText: {
    fontSize: wp(4),
    color: '#333',
  },
  checkIcon: {
    color: '#4CAF50',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: 'center',
    marginHorizontal: wp(1),
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: wp(4),
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FFC01D',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: hp(1.5),
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: wp(6),
    height: hp(3),
    marginBottom: hp(0.6),
  },
  navItemM: {
    marginTop: hp(-4.5),
    backgroundColor: "#FFC01D",
    borderRadius: wp(50),
    alignItems: "center",
    justifyContent: "center",
    width: wp(18),
    height: wp(18),
  },
  navIconM: {
    width: wp(10),
    height: wp(10),
    resizeMode: "contain",
  },
  navText: {
    color: "#555",
    fontSize: wp(3.2),
  },
})

export default ProfileScreen